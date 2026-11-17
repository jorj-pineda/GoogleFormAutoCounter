// Copy the settings from THIS site's existing working counter before replacing its code.
// totalSpots is the individual signup limit AFTER early group allocations.
var COUNTER_CONFIG = {
  formId: '1Ns4Gjiw8NV4ALqtHVWmfNrP7TKekzQdgy-jmQbAkPW0',
  totalSpots: 5,
  siteTitle: 'TITLE OF SITE',
  fullTitle: 'Form Closed - No Spots Left',
  closedMessage: 'This site is full, please sign up for another site!!!'
};

function updateFormTitle() {
  var config = COUNTER_CONFIG;
  if (!Number.isSafeInteger(config.totalSpots) || config.totalSpots < 0) {
    throw new Error('totalSpots must be a non-negative integer.');
  }
  var form = FormApp.openById(config.formId);
  // Timestamp before reading so a delayed older observation cannot overwrite a newer one.
  var observedAt = new Date().toISOString();
  var remainingSpots = Math.max(0, config.totalSpots - form.getResponses().length);
  Logger.log('Remaining Spots: ' + remainingSpots);

  if (remainingSpots === 0) {
    form.setAcceptingResponses(false);
    form.setTitle(config.fullTitle);
    form.setCustomClosedFormMessage(config.closedMessage);
    Logger.log('Form Closed - No Spots Left');
  } else {
    // Deliberately do not reopen a form that the office has closed.
    form.setTitle(config.siteTitle + ' ' + remainingSpots + '/' + config.totalSpots);
    Logger.log('Title Updated to: Spots Left: ' + remainingSpots);
  }

  reportAvailability_(form, {
    capacity: config.totalSpots,
    remaining: remainingSpots,
    observedAt: observedAt
  });
}

// Optional, best-effort website reporting. Never let a website outage break the form counter.
// The trailing underscore keeps this helper private to Apps Script (not google.script.run).
function reportAvailability_(form, snapshot) {
  try {
    var properties = PropertiesService.getScriptProperties();
    var siteKey = (properties.getProperty('SSTATION_SITE_KEY') || '').trim();
    var url = (properties.getProperty('SSTATION_SYNC_URL') || '').trim();
    var secret = properties.getProperty('SSTATION_SYNC_SECRET') || '';
    if (!siteKey && !url && !secret) return;
    if (!/^[A-Za-z0-9_-]{1,100}$/.test(siteKey) ||
        !/^https:\/\/[^\s]+$/.test(url) || secret.length < 32 || !secret.trim()) {
      Logger.log('Website availability sync skipped: check all three Script Properties.');
      return;
    }
    var body = JSON.stringify({
      version: 1,
      siteKey: siteKey,
      capacity: snapshot.capacity,
      remaining: snapshot.remaining,
      acceptingResponses: form.isAcceptingResponses(),
      observedAt: snapshot.observedAt
    });
    var signature = Utilities.computeHmacSha256Signature('v1\n' + body, secret, Utilities.Charset.UTF_8)
      .map(function (byte) { return ('0' + ((byte + 256) % 256).toString(16)).slice(-2); }).join('');
    var response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json; charset=utf-8',
      payload: body,
      headers: { 'X-Sstation-Signature': 'sha256=' + signature },
      followRedirects: false,
      muteHttpExceptions: true
    });
    if (response.getResponseCode() === 204) {
      Logger.log('Website availability updated.');
    } else {
      Logger.log('Website availability update was not acknowledged. Form counter is unaffected.');
    }
  } catch (error) {
    // Do not log exception text: HTTP errors can include request details or credentials.
    Logger.log('Website availability sync failed. Form counter is unaffected.');
  }
}

function createTrigger() {
  ScriptApp.newTrigger('updateFormTitle')
           .timeBased()
           .everyMinutes(1)
           .create();
}
