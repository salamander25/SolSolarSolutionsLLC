# SOL Golden Hour — test report

Executed September 12, 2026. **37 automated tests passed; 0 failed.** See `test-output.tap` for the actual run. These tests use synthetic data in an isolated database; they are not a live CRM acceptance test.

## Artifact and environment

Static Node.js build with no third-party runtime dependencies. Node 24’s built-in SQLite was used for the reference capture path. The test harness runs a real HTTP server and database in the same environment. Database fixtures use `example.invalid` addresses and reserved fictional phone numbers. No live CRM records, notifications, campaigns or appointments were created.

Desktop browser screenshots capture a 1348×850 region of a cloud Chrome window. Mobile screenshots are real rendered pages in 390px and 320px iframe viewports, captured at 850px height. They are not physical iOS/Android device tests. No network throttling or Lighthouse run was performed. Native browser zoom could not be confirmed through the browser control surface; the separate 200% zoom review remains open.

The production baseline remains corporate main at `ed72e493f8fc360cafbf2fb4fcdcbcb1e4633f58`. Work is isolated on `preview/SOL_Golden_Hour_2026_09_12`. The final code revision is `dddd360c382803b44ade87d13c37d90bd43292c3`; a later handoff-only commit may add this report and screenshots without changing the website.

Initial end-user flow checks used [the first preview](https://sol-solar-solutions-dqfbphzgw-salvador-f-castillos-projects.vercel.app/). Final three-direction and legacy-route review used [the refined preview](https://sol-solar-solutions-pou5y7i9a-salvador-f-castillos-projects.vercel.app/). The image-failure fixture was exercised on [the QA preview](https://sol-solar-solutions-eia26ut31-salvador-f-castillos-projects.vercel.app/qa-media/). The final image-failure, contrast and full local-brief flow were then rechecked on [the final code preview](https://sol-solar-solutions-q3eqv1gxf-salvador-f-castillos-projects.vercel.app/review-gallery/). These protected immutable URLs require owner access or a temporary review link. No access tokens are stored here.

## Automated results

| Test family | Outcome and evidence |
|---|---|
| Six lane schemas | Valid product-specific requests accepted for all six; unknown solution, invalid enum and cross-lane keys rejected |
| Contact validation | Invalid email, missing phone for a phone request, email-only/phone payload conflict and email-only working-hours conflict rejected |
| Availability | Valid IANA or unknown accepted; false evidence rejected; own hours, calling window and time zone survive a database commit |
| Consent | Request permission required; marketing remains a strict separate boolean; old consent version, string boolean and SMS=true rejected |
| Server-owned fields | Client owner and tenant injection rejected |
| Data limits / attribution | Overlong free text, unapproved/PII attribution and honeypot requests rejected |
| Durability / repeats | Identical retries produce one record, including after database close/reopen; different payload with same key returns conflict |
| Commit failure | Injected storage failure rolls back both inquiry and outbox; no receipt |
| Notification failure | Synthetic notifier failure retains the saved inquiry; retry succeeds without a duplicate record |
| Existing controls | Synthetic opt-out, owner, tenant and campaign hold preserved; marketing opt-in does not enable automation or lift controls |
| Abuse and HTTP contract | Exact Origin, signed CSRF/cookie, JSON content type, 16 KiB limit and 8/minute rate limit verified through real HTTP requests |
| Exposure | No public inquiry read endpoint; backend source not served; static pages have noindex headers |
| Capture unavailable | 503 with no receipt when disabled |
| Static content | Six unique titles, one H1 per lane, substantive source text and noindex; no guessed form endpoints or fake success timer in the new frontend |

The notification test injects a synthetic callback. It does not send email and does not establish authorization for a production notification worker. Synthetic fixtures are evidence of implementation behavior, not proof that live CRM control mappings are correct.

## Browser results

| Check | Result |
|---|---|
| Three visual directions | Golden Hour, Daybreak and Command rendered at desktop, 390px and 320px; actual screenshots retained |
| Six buyer pages | Each loaded with one unique H1, matching title, distinct explanatory copy and correctly targeted fit action; no desktop horizontal overflow observed |
| Source substance | Main-content word counts observed: residential 427, commercial 404, battery 395, robotics 544, utility 392, data center 368; counts describe the build, not SEO effectiveness |
| Explicit preselection | All six fit URLs selected the intended lane; only that lane’s question controls were enabled |
| Required goal | Continue without a solution showed a useful alert |
| Back/edit | General location, state, property authority, selected need and timing persisted when going back and forward |
| Bad email | Browser showed “Enter a valid email address.” |
| Phone requirement | Phone selection required a number; phone/email-only working-hours contradiction produced an error |
| Consent defaults | Request-specific and optional marketing checkboxes started unchecked; marketing remained false in the prepared brief |
| Personal availability | Mon–Thu 9 am–4 pm working hours and Tue–Thu 1–3 pm calling window appeared with America/Chicago and self-reported labeling |
| Email-only preference | Switching to email-only produced “Best calling time: email-only — America/Chicago” and omitted a phone request |
| Local copy/save | Copy verified with “Brief copied. Nothing was sent.” The Save action showed a request status, but the automated download event timed out; completed download remains unverified |
| Local result | Actual completion showed “Prepared locally — not submitted.” and explicitly said Sol had not received the request |
| Keyboard | Stage advancement, errors, edit, submit and native mobile menu operated with keyboard; error and result headings received focus |
| Manufacturer opt-in | Zero video elements before choosing Load; one controls-enabled player with preload=none after selection |
| Actual video playback | Official GT3 CDN video reached readyState 4, played beyond 19 seconds and reported duration 31 seconds; native pause action exercised |
| Image failure | Deployed synthetic image failure displayed the fallback text and retained the `/fit/` action; utility-button contrast issue discovered, corrected and rechecked in the final deployed preview |
| Legacy URLs | Seven old routes redirected to matching new paths, preserving `utm_source=owner-signature` |
| Console | No app-origin error/warning entries observed during refined preview route review; browser/Vercel authentication noise was excluded. The QA missing-image request deliberately produces a 404 |

Browser tooling intermittently timed out on click scrolling, iframe-root measurements and a full-page capture. Recovery used a fresh DOM check and supported keyboard/screenshot actions. These tool errors are not reported as website failures or passing tests. Golden Hour’s 390px frame was measured with equal client/scroll widths; other narrow layouts were visually reviewed, not exhaustively overflow-instrumented.

## Static, privacy and accessibility checks

`static-checks.json` records 15 generated pages and no missing static root-relative href/src targets. The intentional missing image exists only as a dynamically selected QA failure. `source-checks.json` found no secret-like literals in the checked patterns, no public inbox addresses, no deployment/team identifiers in the public bundle, no restricted counterparty name and no analytics vendor scripts. This is a targeted scan, not a formal security audit.

Thirteen sampled text/control/focus contrast pairs passed their targets. Examples: Golden Hour body 16.84:1, muted text on raised surface 7.93:1, CTA text 11.60:1, Daybreak muted text 5.77:1 and Command muted text 7.92:1. Input borders exceeded 3:1 in all three themes. Outline-button borders were strengthened, and the report-page link rule was narrowed so it cannot override filled-button text contrast.

Semantic landmarks, labeled inputs, one H1, native disclosure controls, visible keyboard focus, reduced-motion rules and separate consent are built. No dialog or third-party widget was added. Full screen-reader, zoom, text-spacing and real-device accessibility review remains open; no WCAG certification is claimed.

## Performance evidence

The main static homepage is 12,384 bytes before compression. The stock WebP is 137,880 bytes at 1400×933. Actual CSS/JS sizes and estimated gzip sizes are in `static-checks.json`; these are file measurements, not measured network transfer or Core Web Vitals. No custom fonts, framework runtime, chat widget, ad pixels or autoplay background video are installed.

Targets remain LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 at the 75th percentile, per [Google’s documentation](https://web.dev/articles/vitals). No field performance or Lighthouse score was obtained. Measure the approved deployment under documented mobile conditions and collect real-user evidence after release.

## Limits and release acceptance

The portable gallery’s generated script syntax was checked; its `file://` behavior has not been exercised in the cloud browser. The hosted gallery is the browser-tested review entry point. The source package can regenerate both.

The live form-to-CRM-to-notification path is not integrated or externally verified. Public inbox, canonical launch destination, commercial scope, manufacturer permission/captions, actual privacy policy, live suppression/ownership/tenant routing, authorized synthetic acceptance, analytics and production rollback all remain explicit gates in [RELEASE_GATES.md](RELEASE_GATES.md).

**Do not launch real collection based only on this report.** The existing production site is preserved; the preview honestly prepares local briefs, while the source includes a tested isolated durable path for integration review.
