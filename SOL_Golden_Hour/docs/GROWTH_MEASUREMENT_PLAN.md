# Qualified-business measurement and launch sequence

No baseline traffic, accepted opportunities, sales or collected contribution were supplied. All initial values are **unmeasured**, not zero. No analytics or advertising provider has been installed. No outreach or advertising has been sent or activated.

## Definitions and denominators

| Stage / measure | Definition |
|---|---|
| Relevant visit | Human visit to a matching solution page from an approved channel; exclude known bots and internal tests using documented rules |
| Inquiry | One durable non-test request after idempotency/deduplication; local briefs do not count |
| Contacted inquiry | A logged, permitted response attempt using the visitor’s selected channel and availability |
| Sales-accepted opportunity | Named owner reviews the need, role, geography and scope and accepts responsibility for a next step |
| Qualified project | Human review confirms the lane’s material fit criteria and a documented next decision; no automatic form-score label |
| Proposal | A project-specific offer is actually issued by the appropriate authorized counterparty |
| Win | Executed agreement or the owner’s documented closed-business definition, used consistently |
| Collected contribution | Cash actually collected attributable to the cohort, less the agreed direct acquisition/delivery costs; pending commission is separate |
| Visit → inquiry rate | Durable non-test inquiries / relevant visits, segmented by solution and channel |
| Inquiry → qualified rate | Qualified opportunities / matured, reviewed inquiries; report review coverage and pending cases |
| Qualified opportunity cost | Approved channel spend / sales-accepted qualified opportunities in a comparable matured cohort |
| Response quality | Permitted response attempted within the customer’s stated availability, plus completion and usefulness of the next step |

Infrastructure cohorts need longer maturation. Report open age and stage alongside outcomes; do not rank utility or data-center performance solely by immediate form count. Separate gross contract value, revenue, commission due and collected contribution.

## Event plan

| Event | Authority | Current state |
|---|---|---|
| page_view | Client, consent/policy permitting | Local bounded DOM event only |
| solution_selected | Explicit selection or URL | Local event; no inference of private circumstances |
| fit_started | Form opened | Local event |
| step_completed | Valid stage advancement | Local event |
| submit_attempted | Submit intent after form validation | Local event; not a lead |
| durable_submission_succeeded | Server durable receipt | Isolated test receipt only; exclude from business analytics |
| contact_link_chosen | Click on telephone link | Local event; not proof of a conversation |
| video_loaded | Video loadeddata event | Local event once actual media data loads; not completed viewing |
| booking_confirmed | Verified scheduling backend | Specified, not emitted or integrated |

Current DOM events carry only event name, allowlisted solution and step number. No names, emails, addresses, phone numbers, free text or availability are placed in analytics. Before installation, approve a provider, consent basis, retention, test exclusion and a server reconciliation method. A client event alone cannot prove an inquiry or booking.

## Distribution plan — not executed

| Context | Matching destination | Approval / discipline |
|---|---|---|
| Owner email signature | Homepage or project-fit page | Approved canonical URL and inbox first |
| Home solar educational message | `/residential-solar/` | Current geography and scope; no blanket savings/incentive assertion |
| Facility or commercial discussion | `/commercial-solar/` | Relevant decision role and site authority |
| Backup / storage education | `/battery-storage/` | Distinguish power, energy and system-level backup |
| Robotics supplier-informed post | `/robotics/` | Official media approval; virtual conversation; preserve Southern California campaign holds |
| Land / utility opportunity | `/utility-scale-solar/` | Nonconfidential information and accurate role; no capacity assertion |
| Data-center opportunity | `/data-center-infrastructure/` | Initial/ultimate MW, target date and evidence; no powered-land promise |
| Paid search | Matching lane page only | Capture, consent, routing, budgets and claims approved; no activation under this website brief |

Use only approved profiles and existing permissioned outreach. A public email or form completion does not authorize marketing calls or texts. Do not lift existing campaign holds to create a website baseline.

## Prioritized experiments

Run one major variable at a time after tracking and routing are trustworthy. Set sample-size and decision rules from observed volume; a small week of clicks is not statistical significance. Report uncertainty and downstream quality.

| Priority | One change / hypothesis | Primary outcome | Guardrail |
|---|---|---|---|
| 1 | Concrete headline “Solar. Storage. Robotics. One clear place to start.” versus “Power your next move.” improves immediate understanding | Reviewed qualified opportunities per relevant visit | No unsupported promise; compare matched lane/channel cohorts |
| 2 | Lane-specific CTA versus general project-fit CTA improves relevant inquiry completion | Qualified opportunities per relevant lane visit | Inquiry rejection rate and owner workload |
| 3 | Official product media before versus after first fit action helps robotics buyers self-assess | Qualified robotics conversations per relevant visit | Page weight, media rights and accessibility |
| 4 | Fewer optional first-contact questions versus more prequalification reduces abandonment without reducing usefulness | Qualified opportunities per visit | Missing critical context, follow-up effort and consent errors |

## Small launch sequence

First approve the direction, inbox and canonical destination. Next confirm commercial scope, media and production privacy. Then map the approved durable CRM, suppression/ownership/holds and notification route; run the complete authorized synthetic acceptance test. Release a controlled version with rollback, reconcile inquiries daily, and establish a baseline before paid distribution or experiments. Scheduling and uploads can remain absent until there is a demonstrated need and approved infrastructure.
