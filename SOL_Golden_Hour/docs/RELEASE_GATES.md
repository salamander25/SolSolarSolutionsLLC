# Remaining release gates

**Status: owner-review preview, not approved for production collection or publication.** Golden Hour is recommended. Daybreak and Command remain available. These gates apply to release; they did not block the separate preview and source work.

| Priority | Gate | Current evidence / remaining decision | Accountable role |
|---|---|---|---|
| P0 | Direction and copy | Three responsive directions and six substantive pages built. Approve Golden Hour and buyer copy; reconcile any inaccessible earlier preview kit. | Salvador |
| P0 | Public inbox and canonical destination | Current corporate repository/main and Vercel alias identified; inbox strings conflict. Confirm the actual public inbox and owner-approved canonical launch URL. | Salvador |
| P0 | Commercial scope | Conditional scope copy is built. Confirm current territory, supplier relationships, roles and delivery counterparties. No license/EPC/operator/manufacturer claim is made. | Salvador + relevant counterparties |
| P0 | Manufacturer media | Official GT3 and CC1 Pro pages verified; official GT3 video played in browser. Public usage permission and captions/transcript remain unresolved. Approve them or keep product-page links without video. | Supplier / rights owner + Salvador |
| P0 | Production privacy and consent | Separate consent and self-reported availability are implemented. Approve actual processors, sharing, retention, deletion, rights route and legal language; preview privacy is not production policy. | Owner + qualified reviewer |
| P0 | Durable live capture and routing | Isolated database and HTTP path tested. No live CRM adapter, approved schema/recipient or live-control mapping established. Verify suppression, tenant, ownership and holds before any outreach. | CRM administrator + owner |
| P0 | Full acceptance submission | Complete one owner-approved synthetic browser → server → durable CRM record → authorized notification. Verify owner, contact hours/timezone and consent; retain/remove test according to permission. | Owner + engineer |
| P0 | Failure and abuse behavior in the real deployment | Reference tests pass for storage failure, repeat submissions, rate limiting and notification failure. Repeat against the approved production architecture and confirm the alert/retry route. | Engineer |
| P0 | Safe release and rollback | Production remains intact. Review legacy URLs, remove preview-only external redirects and selectors, set canonical/sitemap/social image, approve production configuration and preserve a rollback deployment. | Owner + engineer |
| P1 | Accessibility / real-device review | Sample contrast, semantic, keyboard and narrow-width checks completed. Full screen-reader, 200% text zoom, actual iOS/Android and caption review remain open. | Accessibility reviewer / owner |
| P1 | Performance evidence | Small static assets and no heavyweight dependencies. No Lighthouse or real-user CWV result claimed. Measure deployment with documented mobile device/network assumptions and collect field data later. | Engineer |
| P1 | Analytics reconciliation | Event vocabulary and qualified-business definitions specified; local events only. Approve provider/policy, exclude tests and verify server reconciliation before experiments or paid traffic. | Owner + analyst |
| Optional | Booking, uploads and rendered overview | Not integrated. Do not offer slots or claim appointments; keep uploads absent. Storyboard delivered for a future approved video. | Owner |

## Completion categories

**Built and tested:** separate responsive website, six static buyer pages, local brief experience, isolated durable database path, validation/idempotency/control tests and observed browser flows. Tests and screenshots describe the exact scope reviewed.

**Built but not externally verified:** final owner/commercial approval of page copy; complete accessibility and field performance; future production SEO/social configuration. Manufacturer availability at a test time does not establish media rights.

**Specified but not integrated:** live CRM and notification adapter, live suppression/ownership/tenant mapping, analytics provider and verified scheduling. The public preview is not a live lead system.

**Awaiting authorization:** final design/copy, public inbox/canonical URL, commercial scope, media use, production policy and eventual production release after acceptance gates. No permission for outreach, ads, account changes or removing campaign holds is inferred.

The next consequential owner decision is to confirm Golden Hour and the public inbox/canonical destination. That enables a concrete integration review without reopening the full design brief.
