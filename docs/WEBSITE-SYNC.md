# Optional Service Station website availability sync

This is the counter side of the GDS/GreenServe integration. The website receiver and admin mapping
are a separate PR in ServiceStation-Tracker. **Do not enable this on live forms yet.** No deployment
is performed by merging this repository PR. Existing forms continue to handle registration.

## What remains authoritative

One individual-form response represents one person. `COUNTER_CONFIG.totalSpots` is the number of
individual places available **after** staff assign the early groups. For example, if 12 of a site's
20 physical places go to groups, set this counter to 8. After 3 individual responses, it reports
5 of 8 individual places left. Never subtract group allocations again on the website.

The script still updates the title and closes the form at capacity. It does not reopen a manually
or previously closed form, create new triggers automatically, or change the office's group process.
A website click is not a registration or reservation. Near-simultaneous responses can arrive before
a trigger closes the form; this bridge does not provide atomic reservations or cure overbooking.
Remaining places are clamped to zero when responses exceed the limit; staff must reconcile any
excess participants. The form's own open/closed state is sent separately from the remaining count.

## Configuration and rollout

1. Back up the actual working site's code/settings. The deployed code may differ from this repo.
   On a **disposable copied form**, replace its counter file with Counter.gs; do not add duplicate
   functions alongside the old file. Copy that site's form ID, individual limit, title and closure
   message into `COUNTER_CONFIG`. The checked-in settings are the original sample, not settings
   to deploy across all sites. Leave all website properties absent initially and verify the old
   form title/closure behavior still works. Front.html and the web-app manifest are unchanged.
2. Once the website receiver is installed, configure its mapping and a separate random secret for
   this specific event occurrence/site. Use a new site key for a new year's event, not a reused
   nonprofit name. Match the exact secret on both ends. A random 32-byte value encoded as base64
   is suitable; the key is used as the literal UTF-8 property string, **not** base64-decoded.
3. Under Apps Script **Project Settings → Script Properties**, set all three values:

   | Property | Value |
   | --- | --- |
   | `SSTATION_SITE_KEY` | Website mapping key; 1–100 letters, numbers, `_` or `-`, e.g. `gds-2027-example` |
   | `SSTATION_SYNC_URL` | HTTPS receiver endpoint; planned path `/api/site-availability` |
   | `SSTATION_SYNC_SECRET` | Matching per-site secret, at least 32 characters |

   Do not put secrets in the source, form title, URL/query string, README, or public frontend.
   Script Properties are shared with script editors: only trusted staff should edit these scripts.
4. Run `updateFormTitle` on the copied form and authorize its permissions. Adding UrlFetchApp may
   require a new Google authorization even when reporting is not enabled. Submit synthetic responses
   and verify website counts, closed-form state, and freshness before installing on live sites.
   The HTTPS receiver must be reachable without an interactive login or Vercel authentication page.
5. Inspect existing triggers before changing them. On-submit updates provide prompt reporting; a
   single time-based refresh can reconcile failed deliveries and keep timestamps fresh. The existing
   `createTrigger` helper still adds a one-minute trigger and **does not deduplicate**; do not run it
   repeatedly. A failed update is not queued or retried in the same run. The next trigger execution
   (or a manual `updateFormTitle`) sends a fresh observation. With only an on-submit trigger, no
   further update occurs until the next submission or manual run.
6. To turn off reporting, remove **all three** Script Properties. Counting and form closure continue.
   A partial/invalid configuration is skipped with a generic diagnostic. Network, authorization,
   and HTTP failures never stop the counter's already-completed form update. Logs omit request
   payloads, URLs, credentials and exception details.

## Version 1 wire contract for the website receiver

The sender makes one HTTPS POST with UTF-8 JSON, `Content-Type: application/json; charset=utf-8`:

```json
{"version":1,"siteKey":"gds-2027-example","capacity":8,"remaining":5,"acceptingResponses":true,"observedAt":"2027-04-10T14:00:00.000Z"}
```

- `capacity`: non-negative integer individual signup limit, not the full physical capacity.
- `remaining`: integer between zero and capacity.
- `acceptingResponses`: actual Google Form state after the counter update; can be false even with
  remaining places if staff closed the form. Never infer that a positive count means it is open.
- `observedAt`: UTC ISO timestamp taken before reading responses. It is an observation timestamp,
  not an expiry or delivery timestamp.
- No form IDs, participant names/emails, response content, or secrets are in the body.

The `X-Sstation-Signature` header is `sha256=` followed by 64 lowercase hex characters. Calculate
HMAC-SHA256 using the literal UTF-8 secret and these exact UTF-8 message bytes:

```text
v1\n<exact raw JSON body>
```

Here `\n` denotes one newline byte, not the two literal backslash/n characters. There is no trailing
newline after the JSON. Verify against the raw body before reserializing JSON. The synthetic
[fixture](../test/fixtures/availability-v1.json) contains an exact body/key/signature for the Java
receiver's compatibility tests. Its test key must never be used for a real site.

Only **HTTP 204** acknowledges receipt; 200 HTML/login pages, redirects, and errors are failures.
Redirects are not followed. The sender does not inspect or log response bodies.

The receiver PR must map the stable site key to a per-site secret; verify the HMAC with a
constant-time comparison; validate schema, bounds and timestamp; reject unauthenticated/invalid
requests; and avoid replacing newer observations with delayed older ones. Repeated identical or
superseded authenticated updates may acknowledge with 204 without changing the current value.
Define an accepted timestamp age/skew window when implementing that receiver. Website views must
show a freshness indicator and an unavailable/stale state when updates stop, rather than showing
old counts as live or treating a network failure as a full site. Live publishing waits for this
receiver and its tests.

## Verification and limits

Run `node --test test/*.test.cjs` with Node 22 or newer. The dependency-free tests load Counter.gs
in a VM with fake Google services and a Node HMAC implementation: title/counting, capacity changes,
closure, no reopening, aggregate-only data, signed bytes, response handling, configuration and
network failures. They make no Google or external HTTP requests. CI runs the same command.

This verifies local logic and the contract, **not** live Google authorization, installed triggers,
form settings, or successful delivery to a deployed website. The copied-form rollout above remains
necessary before any office deployment.

Google references: [Script Properties](https://developers.google.com/apps-script/guides/properties),
[HMAC utilities](https://developers.google.com/apps-script/reference/utilities/utilities),
and [UrlFetchApp](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app).
