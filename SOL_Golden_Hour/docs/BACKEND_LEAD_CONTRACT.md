# Lead contract and integration handoff

Status: implemented and tested with a real isolated SQLite store; **not integrated with the production CRM or notification system**. The deployed design preview uses local preparation only. It does not receive customer inquiries.

## Lifecycle

`goal → product context → contact and availability → validate → commit inquiry + held outbox → return receipt → optional approved notification`

The transaction is the receipt boundary. Notification delivery is a separate state. A timeout means receipt is unconfirmed; retry with the same idempotency key. An existing key and identical normalized request returns the original record. A different request with the same key returns 409. No timer or mailto action creates success.

## HTTP contract

`GET /api/capture-config.json` returns `local-only` when capture is unavailable. The isolated server returns a signed, expiring CSRF token and an HttpOnly SameSite=Strict cookie. `POST /api/leads` requires the exact configured Origin, JSON content type, matching valid CSRF token/cookie and an `Idempotency-Key` of 24–80 allowlisted characters. The origin is server configuration, never supplied by a form field.

Payload maximum is 16 KiB. The database-backed reference rate limit permits 8 attempts per minute per HMAC of the socket IP. The local random signing secret rotates on restart; production needs an approved stable secret, trusted-proxy policy and shared rate limiter. Do not trust arbitrary forwarded headers. Honeypot, strict schema, length limits and content-type checks are included. More advanced abuse controls require a measured need and a reviewed provider.

Successful reference response: `{id: "SOLTEST-…", createdAt: ISO_timestamp, committed: true, duplicate: boolean, mode: "isolated-test"}` with status 201 for new or 200 for repeat. No personal information appears in the receipt. Other responses include 400 invalid request, 403 origin/session, 409 retry conflict, 413 size, 415 content type, 422 field validation, 429 rate limit and 503 storage/unavailable capture. Failure leaves the entered details available for retry.

## Validated model

| Group | Fields / constraints |
|---|---|
| Intent | `solution`: residential, commercial, battery, robotics, utility, data-center; related array unique, excludes primary, maximum five |
| Project | General `location` ≤120 chars; allowlisted US state/outside-us/unknown; allowlisted timing; optional context ≤1200 |
| Questions | Only selected lane’s keys accepted; selects use explicit enum values in `content.mjs`; optional text ≤240; cross-lane keys rejected |
| Contact | Name ≤100; valid email ≤254; company ≤160; response email-only or phone; phone ≤30 chars and 7–15 digits only when phone selected |
| Availability | IANA timezone or unknown; hoursStatus known/unknown/email-only; own workingHours ≤240 required when known; callWindow specific/arrange-by-email/unknown/email-only; bestTime ≤240 required when specific; evidence must equal self-reported |
| Consent | Request-specific true required; optional marketingEmail strict boolean; marketingCalls=false; sms=false; exact version `SOL-GH-2026-09-12-v1`; full copy persisted |
| Attribution | First/latest allowlisted UTM snapshots and sourcePath `/fit/`; arbitrary strings, personal details and arbitrary referrers rejected |
| Server-owned | UTC created_at, record ID, status, owner, tenant, effective marketing eligibility, suppression and hold evidence; client owner/tenant/status rejected |

Email-only conflicts with any phone payload or calling window. Phone conflicts with email-only availability. Unknown technical answers and time zones are permitted without inference. Time zone appears beside the calling window in the brief and saved record. Availability is a contact’s self-report, never business opening hours.

Attribution is intentionally limited: the preview propagates recognized URL codes and records the current allowed snapshot as first/latest. It does not install persistent tracking or claim a true cross-session first-touch history. Production must approve attribution retention and merge rules without overwriting established first attribution.

## Persistence and existing controls

SQLite uses WAL, synchronous FULL, transactions and a unique scope/idempotency constraint. The database is outside `public/`, created with restrictive filesystem permissions and has no public read endpoint. Tests close and reopen it to demonstrate durable retention.

Every new test record is `isolated_test_hold`, `marketing_eligible=0` and `automationBlocked=true`. A fixture’s existing suppression, owner, tenant and campaign hold can add restrictions; an inquiry never removes them. Production CRM data was not imported or changed. Passing synthetic control tests does **not** establish that live routing is mapped correctly.

The outbox starts `held_no_approved_route`. `processNotification` is a test injection point with no email provider. Its failure/retry test retains one inquiry. Do not enable a worker until the approved recipient, hold rules and notification policy have been mapped. Owner alerts should contain a record identifier and controlled link, not unnecessary personal details.

## Production adapter acceptance

1. Confirm the existing CRM schema, tenant boundaries, responsible representative and source-of-truth suppression/hold checks through owner-approved read access.
2. Map these fields to an approved durable transaction or supported CRM create operation. Keep credentials server-side. The local SQLite implementation cannot be moved into Vercel’s ephemeral filesystem.
3. Separate request permission from marketing eligibility. Apply suppression and ownership checks before any outreach; optional marketing consent cannot lift an existing opt-out or campaign hold.
4. Approve actual processors, retention, deletion, security, privacy text and notification route. Add authenticated administrative access and backups as appropriate.
5. Complete one owner-approved synthetic browser submission to durable CRM record and authorized notification. Verify fields, time zone, hours, ownership and consent. Test record failure, repeated submit, rate limit and notification failure separately.
6. Replace the isolated-test UI contract with the reviewed production contract. Enable a “received” message only on an actual durable production receipt.

No uploads, SMS, automated marketing, calendar availability or appointment creation is included. Scheduling must come from a verified source and pass timezone, confirmation, cancellation and rescheduling checks before it can be described as working.
