# Preview and deployment handoff

The verified review entry point is [SOL Golden Hour gallery](https://sol-solar-solutions-q3eqv1gxf-salvador-f-castillos-projects.vercel.app/review-gallery/). It is a separate protected Vercel preview. Owner access or the temporary link supplied in the conversation is required. The temporary token is intentionally not stored in source.

The tested code commit is `dddd360c382803b44ade87d13c37d90bd43292c3` on `preview/SOL_Golden_Hour_2026_09_12`. The handoff commit adds documents, screenshots and downloadable artifacts; it does not alter the tested website code. The immutable tested URL remains the review reference even if documentation causes another preview build.

The production baseline is `ed72e493f8fc360cafbf2fb4fcdcbcb1e4633f58` on corporate main. The observed current alias is [sol-solar-solutions-llc.vercel.app](https://sol-solar-solutions-llc.vercel.app). This is evidence of current configuration, not owner approval of the final canonical destination.

## Preview reproduction

From the existing repository root, the preview configuration runs `node SOL_Golden_Hour/build.mjs` and serves `SOL_Golden_Hour/public`. There is no package-install step beyond checking Node. The connected Git preview deployment was verified READY with a non-production target.

From the standalone source ZIP, open `SOL_Golden_Hour/SOL_Golden_Hour_START_HERE.html`, or run the Node commands in `SOL_Golden_Hour/README.md` for the isolated database test path. The portable file prepares locally only; it cannot create a server record.

## Approved production release procedure

1. Resolve every P0 gate in `RELEASE_GATES.md`, including the approved inbox/domain, commercial scope, media, actual privacy policy, durable adapter and full authorized synthetic acceptance.
2. Preserve the current production deployment and route inventory as rollback references. Do not overwrite main during design review.
3. Build a separate production configuration. Remove preview selector and QA route, retain only the approved direction, generate approved canonicals/sitemap/social image and replace the preview privacy notice. Remove noindex only in the authorized production release.
4. Review each old route. Preserve any approved specialist/campaign pages and their holds. Do not carry the preview’s redirects back to the existing corporate origin into production: they could redirect to themselves. Review contact query attribution and route ownership during migration.
5. Use the approved durable store and server-side credentials. Keep storage receipt and notification delivery independent. Do not deploy the local SQLite reference into an ephemeral function filesystem.
6. Deploy an owner-review production candidate, verify acceptance and rollback, then obtain any still-required final publication authorization. No publication permission is inferred from this preview handoff.
7. After launch, verify the actual canonical URL, indexing headers, routes, record receipt and owner alert; reconcile inquiry records before distribution. Roll back to the preserved deployment if the receipt/routing path is unreliable.

The source does not change DNS, buy a domain, send messages, activate ads or alter campaign holds. Those actions require their own authorization.
