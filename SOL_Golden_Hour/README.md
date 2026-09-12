# SOL Golden Hour — start here

Owner review build for **Sol Solar Solutions LLC**. Golden Hour is the recommended flagship. Daybreak and Command remain alternatives pending Salvador Castillo’s decision.

Open `SOL_Golden_Hour_START_HERE.html` for the portable gallery, or `/review-gallery/` on the separate Vercel preview. The gallery includes all six substantive buyer pages and a working local project-brief experience. It is not the production website or a live customer lead system.

## Review order

1. Compare Golden Hour, Daybreak and Command at desktop, 390px and 320px widths.
2. Open the six buyer journeys and try their project-fit actions.
3. Enter synthetic details only. Review personal working hours, best calling time, time zone and separate consent choices.
4. Read [test results](docs/TEST_REPORT.md) and [remaining release gates](docs/RELEASE_GATES.md).

## Run the complete source

Requires Node.js 24 or later, including `node:sqlite`. No third-party package installation is required.

```bash
node build.mjs
node --test tests/*.test.mjs
node backend/server.mjs
```

Open `http://localhost:3000/review-gallery/`. This server enables an **isolated test database**, clearly labeled in the form. Use synthetic details only. A successful test creates one durable SQLite record before returning a receipt. No customer CRM, notification, SMS, calendar or campaign is connected. The database is at `var/isolated-test.sqlite`, outside the public directory and excluded from source control. Do not use this reference server as an internet-facing production service.

To run with local brief preparation only:

```bash
SOL_CAPTURE=off node backend/server.mjs
```

To regenerate the portable gallery:

```bash
node build-offline.mjs
```

## Files

| File | Purpose |
|---|---|
| `content.mjs` | Six unique page narratives, questions and versioned consent copy |
| `build.mjs` | Dependency-free static HTML generation |
| `public/` | Generated, noindex preview website; no private operational records |
| `public/assets/site.css` | Three responsive design directions |
| `public/assets/app.js` | Progressive form, local brief, safe test receipt handling and opt-in media |
| `backend/capture.mjs` | Strict validation, transactions, idempotency and restrictive control fixtures |
| `backend/server.mjs` | Isolated HTTP test path with origin, CSRF, size and rate checks |
| `tests/capture.test.mjs` | Reproducible security and durable-capture tests |
| `preview.vercel.json` | Preview-only configuration; do not copy blindly to production |
| `docs/` | Specification, audit, research, lead contract, growth plan, storyboard and release evidence |
| `screenshots/` | Actual browser screenshots, not design renders |

## Production is deliberately gated

The existing corporate homepage and its production deployment were preserved. This branch is `preview/SOL_Golden_Hour_2026_09_12`; do not merge its root preview configuration to main. Some preserved legacy URLs redirect to the current corporate site during preview review. Those external redirects must be replaced with an approved production route migration before launch to avoid self-redirects.

`SOL_BUILD_MODE=production` fails deliberately. The isolated SQLite server also refuses production/Vercel execution: an ephemeral deployment filesystem is not an approved durable CRM. Implement the approved durable adapter, production privacy policy and routing controls, then complete the browser-to-record-to-notification acceptance test before enabling real receipt messaging.

No public inbox, custom domain, live booking, pricing, incentives, manufacturer partnership, service territory or customer result has been invented. No campaigns were activated.
