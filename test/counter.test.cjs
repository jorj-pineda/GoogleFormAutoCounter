const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { createHmac } = require('node:crypto');
const vm = require('node:vm');
const source = readFileSync(require('node:path').join(__dirname, '../Counter.gs'), 'utf8');
const secret = 'test-only-secret-abcdefghijklmnopqrstuvwxyz';
const configured = {
  SSTATION_SITE_KEY: 'gds-2027-example',
  SSTATION_SYNC_URL: 'https://tracker.example.invalid/api/site-availability',
  SSTATION_SYNC_SECRET: secret
};

function fixture({ responses = 2, accepting = true, properties = {}, status = 204, fail = false, closedMessageFails = false } = {}) {
  const logs = [], requests = [], triggers = [];
  const form = {
    accepting,
    getResponses: () => Array.from({ length: responses }, () => ({ email: 'private@example.invalid' })),
    isAcceptingResponses() { return this.accepting; },
    setAcceptingResponses(value) { this.accepting = value; },
    setTitle(value) { this.title = value; },
    setCustomClosedFormMessage(value) { if (closedMessageFails) throw new Error("Invalid data updating form."); this.closedMessage = value; }
  };
  const context = vm.createContext({
    FormApp: { openById(id) { form.id = id; return form; } },
    PropertiesService: { getScriptProperties: () => ({ getProperty: key => properties[key] ?? null }) },
    Utilities: {
      Charset: { UTF_8: 'UTF-8' },
      computeHmacSha256Signature(value, key, charset) {
        assert.equal(charset, 'UTF-8');
        return Array.from(createHmac('sha256', key).update(value, 'utf8').digest(), b => b > 127 ? b - 256 : b);
      }
    },
    UrlFetchApp: { fetch(url, options) {
      requests.push({ url, options });
      if (fail) throw new Error('Sensitive exception includes ' + secret);
      return { getResponseCode: () => status };
    } },
    Logger: { log: value => logs.push(value) },
    ScriptApp: { newTrigger(name) {
      const trigger = { name, timeBased() { return this; }, everyMinutes(n) { this.minutes = n; return this; }, create() { triggers.push(this); } };
      return trigger;
    } }
  });
  vm.runInContext(source, context);
  return { context, form, requests, logs, triggers };
}

test('unconfigured counter retains its existing title behavior with no HTTP request', () => {
  const f = fixture();
  f.context.updateFormTitle();
  assert.equal(f.form.title, 'TITLE OF SITE 3/5');
  assert.equal(f.form.accepting, true);
  assert.equal(f.requests.length, 0);
});

test('changing the individual capacity changes both the title denominator and reported limit', () => {
  const f = fixture({ properties: configured, responses: 3 });
  f.context.COUNTER_CONFIG.totalSpots = 8;
  f.context.updateFormTitle();
  assert.equal(f.form.title, 'TITLE OF SITE 5/8');
  const body = JSON.parse(f.requests[0].options.payload);
  assert.equal(body.capacity, 8);
  assert.equal(body.remaining, 5); // already excludes early groups; never subtract them twice
});

for (const responses of [5, 7]) {
  test(`full/oversubscribed form closes and reports zero remaining (${responses} responses)`, () => {
    const f = fixture({ properties: configured, responses });
    f.context.updateFormTitle();
    assert.equal(f.form.accepting, false);
    assert.equal(f.form.title, 'Form Closed - No Spots Left');
    assert.ok(f.form.closedMessage.includes('full'));
    const body = JSON.parse(f.requests[0].options.payload);
    assert.equal(body.remaining, 0);
    assert.equal(body.acceptingResponses, false);
  });
}

test('an office-closed form stays closed even when it has remaining places', () => {
  const f = fixture({ properties: configured, accepting: false });
  f.context.updateFormTitle();
  const body = JSON.parse(f.requests[0].options.payload);
  assert.equal(body.remaining, 3);
  assert.equal(body.acceptingResponses, false);
});

test('only the exact aggregate contract is sent, with a verifiable signature and no redirects', () => {
  const f = fixture({ properties: configured });
  f.context.updateFormTitle();
  const { url, options } = f.requests[0];
  const body = JSON.parse(options.payload);
  assert.deepEqual(Object.keys(body).sort(), ['acceptingResponses', 'capacity', 'observedAt', 'remaining', 'siteKey', 'version']);
  assert.equal(body.version, 1);
  assert.equal(body.siteKey, 'gds-2027-example');
  assert.ok(Number.isFinite(Date.parse(body.observedAt)));
  assert.equal(url, configured.SSTATION_SYNC_URL);
  assert.equal(options.method, 'post');
  assert.equal(options.followRedirects, false);
  assert.equal(options.muteHttpExceptions, true);
  const expected = createHmac('sha256', secret).update('v1\n' + options.payload, 'utf8').digest('hex');
  assert.equal(options.headers['X-Sstation-Signature'], 'sha256=' + expected);
  assert.equal(options.contentType, 'application/json; charset=utf-8');
  assert.equal(options.payload.includes('private@example.invalid'), false);
  assert.equal(options.payload.includes(f.form.id), false);
  assert.equal(options.payload.includes(secret), false);
});

test('the sender matches the fixed cross-language receiver fixture', () => {
  const golden = JSON.parse(readFileSync(require('node:path').join(__dirname, 'fixtures/availability-v1.json'), 'utf8'));
  const body = JSON.parse(golden.body);
  const f = fixture({ properties: { ...configured, SSTATION_SYNC_SECRET: golden.secret } });
  f.context.reportAvailability_(f.form, {
    capacity: body.capacity, remaining: body.remaining, observedAt: body.observedAt
  });
  assert.equal(f.requests[0].options.payload, golden.body);
  assert.equal(f.requests[0].options.headers['X-Sstation-Signature'], golden.signature);
});

for (const status of [200, 302, 401, 500]) {
  test(`HTTP ${status} is not mistaken for an acknowledged update and does not break counting`, () => {
    const f = fixture({ properties: configured, status });
    assert.doesNotThrow(() => f.context.updateFormTitle());
    assert.equal(f.form.title, 'TITLE OF SITE 3/5');
    assert.ok(f.logs.some(line => line.includes('not acknowledged')));
  });
}

test('network failures do not break the counter or leak exception details', () => {
  const f = fixture({ properties: configured, fail: true, responses: 5 });
  assert.doesNotThrow(() => f.context.updateFormTitle());
  assert.equal(f.form.accepting, false);
  assert.equal(f.logs.join('\n').includes(secret), false);
  assert.ok(f.logs.some(line => line.includes('sync failed')));
});

for (const properties of [
  { SSTATION_SITE_KEY: 'only-one-setting' },
  { ...configured, SSTATION_SYNC_URL: 'http://insecure.example.invalid' },
  { ...configured, SSTATION_SYNC_SECRET: 'too-short' },
  { ...configured, SSTATION_SITE_KEY: 'contains/slash' }
]) {
  test(`invalid sync configuration is skipped (${JSON.stringify(Object.keys(properties))})`, () => {
    const f = fixture({ properties });
    f.context.updateFormTitle();
    assert.equal(f.requests.length, 0);
    assert.equal(f.form.title, 'TITLE OF SITE 3/5');
    assert.ok(f.logs.some(line => line.includes('sync skipped')));
  });
}

test('capacity zero closes the form; negative/fractional capacity fails before changing it', () => {
  const zero = fixture({ properties: configured, responses: 0 });
  zero.context.COUNTER_CONFIG.totalSpots = 0;
  zero.context.updateFormTitle();
  assert.equal(zero.form.accepting, false);
  assert.equal(JSON.parse(zero.requests[0].options.payload).remaining, 0);
  for (const value of [-1, 1.5, '5']) {
    const f = fixture();
    f.context.COUNTER_CONFIG.totalSpots = value;
    assert.throws(() => f.context.updateFormTitle(), /non-negative integer/);
    assert.equal(f.form.title, undefined);
  }
});

test('the existing trigger helper still schedules the same entry point every minute', () => {
  const f = fixture(); f.context.createTrigger();
  assert.equal(f.triggers.length, 1);
  assert.equal(f.triggers[0].name, 'updateFormTitle');
  assert.equal(f.triggers[0].minutes, 1);
});

// Reproduced against a newly published disposable Google Form during live integration testing.
test('a rejected custom closed message does not suppress the full-site observation', () => {
  const f = fixture({ properties: configured, responses: 5, closedMessageFails: true });
  assert.doesNotThrow(() => f.context.updateFormTitle());
  assert.equal(f.form.accepting, false);
  assert.equal(f.form.title, 'Form Closed - No Spots Left');
  assert.equal(f.requests.length, 1);
  const body = JSON.parse(f.requests[0].options.payload);
  assert.equal(body.remaining, 0);
  assert.equal(body.acceptingResponses, false);
  assert.ok(f.logs.some(line => line.includes('Custom closed message could not be updated')));
});
