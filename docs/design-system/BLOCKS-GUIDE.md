# Guide: building Asha design-system blocks

## What this is
`docs/design-system/` builds one design-system page for Asha, a dental
practice management system (PMS). The owner liked a blend of **Preline's colours**, **shadcn's sizing and clean
finish**, and **Attio's data grid**, and now wants a thorough **block library like Preline's**. The library shows the
real screens a dental office uses, so they can trust the system fits Asha. Your job is to build the blocks for your
assigned groups. They must be polished, realistic and complete, and they must look like one system.

The people who judge this are an office manager and a product owner. Blocks must look like a real, finished product
screen at real size, with real Asha labels. They must not look like a wireframe or a demo.

## Files
- `src/kit.js`: **read it fully first.** It holds the class recipes (`R`), helpers, the `Grid` class, `Sheet`,
  `Chart`, `defineBlock`, and more.
- `src/data.js`: shared invented sample data (`DATA.patients`, `providers`, `operatories`, `payers`, `procedures`
  with CDT codes and fees, and `TODAY = "2026-09-25"`, a Friday). Use it so the same people appear everywhere.
- `src/app.js`: the page shell. Globals you may use: `labGrid`, `openLabSheet`, `LAB_ROWS`, `LAB_BUSY`, `TYPE_TONE`.
- `blocks/<group>.js`: **the only files you may edit, and only your own groups.**
- `blocks/claims.js` and `blocks/settings.js`: example blocks that set the quality bar. Read them.
  - `claims-workbench` shows a full screen, the Grid, working tabs, a side sheet, states and a loading skeleton.
  - `settings-labs-page` shows a settings page.
- `INVENTORY.md`: real screens, labels, columns, statuses and file paths from the Asha codebase. **Use these exact
  words.**
- Real screens live in this repo. Paths in
  INVENTORY are under `apps/web/src/`. Open the named source files when you need more detail on a screen.
- The house rules are in `.claude/skills/asha-ui/references/design-system.md`.
  Read it.

Never edit `src/*`, `build.py`, `dev.html` or another group's file, and never touch the repo. If you want a kit
helper that doesn't exist, write it locally inside your file and mention it in your report.

## File shape (required)
Every block file is one IIFE, so top-level names never clash across files:
```js
/* <Group> blocks. <one line on sources> */
(() => {
  const LOCAL_DATA = [...];            // anything local
  function localHelper() { ... }
  defineBlock({
    cat: "<group id>", id: "<group>-<short-name>", thumb: true /* on the one best block for the overview tile */,
    title: "Plain name of the block",
    note: "One or two plain sentences: what it is and what's notable. No jargon.",
    where: "Area › Screen" ,            // where it lives in Asha
    states: ["Normal", "Empty", "Loading"], // optional; html(state) and mount(el, state) receive the label
    canvas: "gray" | "white" | "bare", // bare = full screen drawn edge to edge (use workspaceHeader)
    pad: true,                         // gray/white canvases get 24px padding
    html: (state) => `...`,            // returns the markup
    mount: (el, state) => { ... }      // optional: wire interactions (Grid, tabs, toggles, Sheet.open)
  });
})();
```
Group ids: shell, schedule, patients, clinical, billing, claims, revenue, tasks, comms, forms, settings, ai, states.

## Look and feel (follow exactly)
- **Compose only from `R` recipes and kit helpers.** Only use Tailwind utilities for layout (flex/grid/gap/padding/
  width) and for the few one-offs a block truly needs. The design must stay consistent: never invent new colours,
  radii, shadows or font sizes when a recipe exists.
- **One hairline.** Use `border-gray-200/80` for every line and divider. Boxes are `R.box`: 8px corners, a line, no
  shadow. Only menus, popovers and dialogs use 12px corners and a shadow (`R.menu`, `R.popover`, `R.dialog`).
  **Never put a card inside a card.** Sections inside a side panel are flat, split by a hairline.
- **Colour meaning.**
  - **Blue:** the accent. It means on, connected, selected, or the one main action. Use one solid blue button per
    area.
  - **Grey:** everything else.
  - **Orange:** only means "a person must fix this". Use `flag()`, `note()`, or `statusDot(label, "needs")`.
  - **Red:** only for delete, void, or something that failed.
  - **Status is always a dot and a word:** `statusDot(label, tone)` with tone `on` (blue), `off` (grey), `needs`
    (orange), `quiet` (light grey), or `mid` (light blue, for partial).
  - Never colour numbers green or red. No yellow or amber bands. No coloured banner boxes.
  - Pale Preline tags (`tag(label, "tagBlue"|"tagTeal"|"tagIndigo"|"tagGray"|"tagOutline")`) only say what kind of
    thing something is.
  - One exception: ledger entry-type labels use Dentrix-style text colours (claim blue-700, payment emerald-700, ADJ
    red-700).
- **Density.**
  - Controls are 36px (`R.md`), and 32px in toolbars (`R.sm`).
  - Grids have 40px headers and 36px rows. Settings rows are at least 44px.
  - Text is 14px, 13px for help, 12px for captions.
  - Numbers use `tabular-nums`. Money is right-aligned and written with `money()`.
- **Grids.** Any list of records uses the `Grid` class, which is Attio's grid. It has the toolbar with search,
  filter chips, Save view, the totals footer, keyboard support, bulk bar and `onOpen` → `Sheet.open(...)`. Match
  `claims-workbench`: `columns` take `render`, `value`, `lead`, `open`, `num` and `kind`.
  - For small read-only tables inside a panel, use a plain `<table>` with `R.tHead` and `R.tCell`.
  - For read-only financial line items, mirror the "ADA spreadsheet" style of `claimLines()` in `claims.js`.
- **Charts** are blue only and use `Chart.bars`, `Chart.line`, `Chart.spark`, `Chart.meter` and `Chart.stack`.
  Numbers across the top use `metricStrip([...])`: a label and a plain number, an optional tiny grey delta tag and an
  optional blue goal bar.
- **Screens.** A full screen starts with `workspaceHeader({parent, title, actions})` (a 44px one-line bar). Tabs with
  counts sit under it (`tabsWithSlot(items, on, rightSlot)`); dates go in the right slot. There are no big stat-card
  tiles above lists.
- **Overlays** (sheets, dialogs, popovers, hover cards) are drawn **inline and statically** inside the canvas so they
  show in the picture. For a sheet, draw a 520px panel with a left hairline, next to a faded slice of the page it
  opens from, or alone on the gray canvas. You may also make a row open the real `Sheet` via `mount`.
- **Words.**
  - Use plain office language in sentence case, the way you'd say it to a dental office manager.
  - Use real Asha labels from INVENTORY for tabs, columns, statuses and buttons.
  - Put units next to numbers ("7 days", "$184.00").
  - No lorem ipsum, no emojis, no "AI-powered" fluff.
  - Every block has invented but realistic dental data: CDT codes, tooth numbers #1–#32, surfaces MODBL, payers,
    fees, dates around Sept 2026.
  - No real people and no PHI.
- **Icons** are lucide 0.469 names (`I("name", "size-4 ...")`). The harness flags any icon that didn't draw; fix
  the name when it does.
- **States.** Show the states a real screen actually has. At least half your blocks should offer 2+ states:
  Normal / Empty / Loading (`skel`, `gridSkeleton`) / Error (`errorState`) / Busy (long names, many rows) / a
  domain state ("Waiting for card", "Signed"). Empty states keep the frame and offer the next action. Never write
  "All caught up!".
- **Interaction.** Where it's cheap, make it work: tabs switch (`wireTabs`), grids sort, filter and open a Sheet,
  switches toggle (automatic), segmented controls switch (automatic). Don't fake things that obviously don't work.
- **Accessibility.** Use real `<button>`s and labelled inputs, `aria-label` on icon-only buttons (`iconButton` does
  this), and roles on tabs and menus. Never convey meaning by colour alone; a dot always has a word.
- **Width.** At a 1440px window the canvas is about 1096px wide, with about 1046px usable inside a padded canvas.
  Nothing may spill past the canvas; the harness flags it. Grids and wide tables scroll inside themselves.

## Process
1. Read `src/kit.js`, `src/data.js`, `blocks/claims.js`, `blocks/settings.js`, `INVENTORY.md` (your sections) and
   `design-system.md`. For each block, open the real Asha source file named in INVENTORY and skim it for the real
   structure and labels.
2. Write the blocks listed for your groups below. Keep the list order as the menu order. Put the strongest,
   most-used block first and give it `thumb: true`.
3. Check: `python3 -m http.server 8797 -d docs/design-system & BLEND_URL=http://localhost:8797/dev.html node docs/design-system/qa/shoot.cjs <group>`. The local
   server on :8797 is already running; don't start another and don't run `build.py`.
   - The harness screenshots every block in every state to `qa/out/<group>/*.png` and lists render failures,
     overflow, undrawn icons and console errors.
   - **Open every PNG with the Read tool and look at it critically**, like a design lead would: alignment,
     spacing, truncation, hierarchy, whether it looks real and finished, and whether it follows the rules above.
     Fix and re-run until every line is ✓ and every picture looks polished.
4. Final report, short:
   - each block's id · title · states
   - anything you couldn't make work
   - any local helper you think belongs in the kit
   - any place where Asha's real screen differs from what you drew and why

## Block lists by group
Aim for all of these. Merge or split only when it makes the library better, and say so in the report.

**shell**: App shell & navigation
1. Main sidebar. Real sections and items, count badges, practice switcher at top, user at bottom. States:
   Expanded / Collapsed icon rail.
2. Workspace header variants: plain; with count tabs; with dates and actions in the right slot; with a
   segmented toggle.
3. Practice switcher popover: "Search practices...", locations, a check on the current one.
4. Per-screen command palette (⌘K), e.g. on Claims: grouped results (Patients, Claims, Actions) with shortcuts.
   States: Suggestions / Typing "ava" / No results.
5. The one-line toolbar anatomy (search · dates · Sort · chips · square + · ⋯) with labelled parts.
6. Home setup checklist (AshaSetupSteps-style: done · now · next · problem; every step keeps its action).
7. User menu popover with Invitations and "Sign out everywhere", plus its confirm.

**states**: States & overlays
1. Side panel anatomy: record sheet with prev/next, identity header, icon quick actions, flat sections and a
   footer.
2. Empty states: first-time with starters, no results with Clear filters, nothing to do today (plain, not
   "all caught up").
3. Loading: page header, grid and side panel skeletons.
4. Errors: failed to load with Try again; a partial failure note inside a list; offline.
5. Read-only / no permission: one lock line with the reason; rows show values without controls.
6. Confirm dialogs: destructive (Void claim, saying exactly what happens) and a high-consequence send.
7. Hover card (record preview on a row) and info popover (the fifth-grade (i) explanation).
8. Toasts and save status ("Saving…" → "✓ Saved" → "Couldn't save. <why>"), and a pending changes bar.

**schedule**
1. Day schedule by chair. 4 operatories (Op 1, Op 2, Hyg 1, Hyg 2), 15-minute grid, about 7:00 AM–1:00 PM visible,
   now-line.
   - Appointment cards: a patient, a procedure summary, a status dot and word, and a small icon for each legend
     item (New patient, Med alert, Ins. Verified, Pt Bal. Due) with its name on hover.
   - Provider tint: a pale fill plus a 3px left bar in the provider's Preline tone.
   - One row above the grid, like the app: date, count, ‹ Today ›; then Day/Week, chairs, search, hide names,
     ASAP / Waitlist, Find open slots, ⋯, New appointment. No breadcrumb row.
   - States: Normal / Busy day / Empty day.
2. Appointment card specimens: Scheduled, Confirmed, Checked in, In progress, Completed, Cancelled / Bumped, short
   15-min vs long 90-min, with badges.
3. Appointment hover card: patient, time, operatory, procedures with fees, insurance status, balance, forms table.
4. Appointment detail panel: sections Status, Procedures, Financial, Insurance, Forms, Notes; footer Check in /
   Reschedule / ⋯.
5. Find open slots: filters (Patient, Service, Provider, Chairs, Duration, Date range, Time of day) and results
   grouped by day as time chips. States: Ready to search / Results / No available slots found.
6. ASAP / Waitlist panel with offer states and Send offer ("Send this opening by text?").
7. New appointment dialog: service, duration, provider/chair, patient with quick-add, "Review scheduling
   conflicts" note.
8. Check-in steps: Demographics, Insurance, Forms, Copay, Payment, Recall, Handoff. Every step is selectable; show
   one step's body.

**patients**
1. Patient list (Charts): Grid with Patient, Chart #, Status, Provider, Last Visit, Next appt, Balance, Alerts.
   Search "Search by name, DOB, or chart number…".
2. Patient chart header plus chart tabs.
   - Header: name, age, DOB, chart #, alert chips (orange icon only where a person must act, e.g.
     "Premedicate"), insurance verified status, balances (Patient, Family, Ins. est.), next appointment.
   - Quick actions: Schedule, Text, Collect payment, ⋯.
   - Tabs: Overview, Charting, Family, Insurance, Appts, Billing, TX plans, Notes, Images, Forms, Docs, Comms.
3. Overview sections: Contact details, Communication preferences, Emergency contact, Responsible party. Flat
   key-value rows in two columns.
4. Family: members table (Patient, Relationship, Role, Total outstanding) with family balance and actions.
5. Insurance and benefits: carrier, plan, member ID, group, subscriber, verified status with Verify now. Annual
   max used/remaining meter, deductible meter, coverage by category (Preventive 100% / Basic 80% / Major 50%),
   frequency limits, waiting periods.
6. Medical history and alerts: allergies, medications, conditions and vitals, with "Premedicate" as a
   needs-person flag.
7. New patient panel (form).

**clinical**
1. Tooth chart (odontogram), drawn as inline SVG.
   - 32 teeth in Universal numbering, upper and lower arches, recognisable tooth outlines (crown shape; molars
     wider than incisors).
   - Existing work in grey, planned work in blue, completed work in darker blue or with a check.
   - Missing teeth, crowns, fillings on specific surfaces, a root canal, an implant, and a selected tooth.
   - Layers toggle (Conditions, Existing, Planned, Completed) and a legend.
   - States: Adult / Planned only.
2. Tooth panel: tooth #30. Status (Present/Missing/…), surfaces picker (M O D B L chips), add condition,
   existing restoration buttons, planned procedures on this tooth.
3. Procedure picker: search codes, recent, categories, fee, surfaces and tooth. Command-menu style.
4. Treatment plan.
   - Phases with procedure rows: Code, Tooth, Surf, Description, Fee, Ins est., Pt est.
   - Phase totals, plan status (Proposed / Accepted), patient decision per row.
   - Actions: Share link, Download PDF, Mark response.
   - States: Proposed / Accepted.
5. Perio chart (a section of it).
   - Upper arch, facial and lingual rows with 3 probing depths per tooth, BOP marks and recession.
   - Depths of 5 or more marked with an orange dot plus bold.
   - Indices Avg PD, Max PD, BOP %.
   - Entry-step bar (Probing Depths, BOP, Recession, Additional Findings, Review & Confirm).
6. Clinical note: template picker, note text, codes chips, Draft/Signed state, Sign button, and a Scribe draft
   suggestion. States: Draft / Signed.
7. Treatment plans list (Grid): Patient, Plan Name, Plan Date, Provider, Procedures, Total Fee, Ins Est., Pt Est.,
   Status.

**billing**
1. Chart Billing tab.
   - Sub-tabs Ledger, Statements, Claims, Pre-Auth, Payments, Payment Plans; scope This location / All family
     members.
   - Grouped balance tiles without red: Balance, Credits, INS EST, Patient EST, plus an aging strip 0–30 / 31–60 /
     61–90 / 91+.
   - Actions: Collect payment (the one blue), Adjust balance, Add procedure, Create claim, ⋯.
2. Patient ledger table: Date, Code, Tooth, Surf, Description, Provider, Amount, Remaining, Balance. Entry-type
   labels use Dentrix colours. States: Normal / Family / Empty.
3. Ledger entry detail panel: opens read-only with Edit; tabs Overview / Application / Notes & metadata / Activity;
   left-aligned equation waterfall "Balance before" … "Balance after".
4. Checkout (v2), Payment step.
   - Step bar: Review, Payment, Next visits, Finish. Any step is selectable.
   - Totals: Office fee, Insurance estimate, Write-off, Patient responsibility.
   - Method row with the collect button inline ("Send to terminal" / "Record" / "Charge").
   - States: Card terminal / Cash / Waiting for card.
5. Collect payment panel: Apply to (This patient, Family / guarantor, Specific visit, Treatment plan deposit, Hold
   as unapplied credit), amount, method, Send payment link. States: Ready / Waiting for card / Paid.
6. Payment plan dialog: plan name, total, number of payments, start date, method, and a schedule preview.
7. Statements batch page: batch statuses, a metric line (Patients, Total amount, Avg / Patient), Grid, Send
   selected.
8. Family balance breakdown dialog: each member with a guarantor label; "Family total differs from the member
   rows" shown as an info note.

**claims** (keep `claims-workbench` exactly as is and add after it)
2. Sent claim panel. Status, filing days left, and "Primary adjudication by procedure" (Line, Code, Charged,
   Allowed, Paid, Patient resp., Adjustments). Tabs: Claim, EOB, History, where History is a timeline. The Actions
   menu is open, searchable, and includes View source EOB.
3. Payment posting (EOB posting v2) dialog.
   - Header fields in a 2-column field grid (Transaction date, Check #, Method, Payment type, Claim, EOB, Ins.
     paid amount, Adjustment type).
   - Line items: Description, Provider, Charge, Allowed, Adj., Ins. Est., Ins. Paid, Balance, Pt. Resp. There is
     no per-line Status or Actions column.
   - Totals row; bottom tabs Notes / Deductibles; a "Possible duplicate payment" note; Save posts all lines.
4. EOBs list (Patient, Payer, Dates, Total billed, Insurance paid; no Status or Action columns) and an EOB panel
   header with Match / Re-match, View claim and View source EOB as blue links.
5. Eligibility and benefits result: coverage status, in network, service type benefits table (category,
   coinsurance, copay, limitations), remaining max and deductible meters. States: Verified / Needs review.
6. Pre-auths list: Draft, Requested, Approved, Partial approved, Denied; Expires.
7. RCM overview "Needs attention": the stuck-claims list with "Who owns the next step" (Asha / Your team) and "How
   old are these claims" buckets as a blue stacked bar.
8. Unbatched charges workspace: Procedure, Description, Provider, Payer, Amount, "Do not bill insurance", and
   Create claims.

**revenue**
1. RI subtab page (Production & Collections).
   - Order: numbers across the top, then tabs (Table / Charts), then the one-line toolbar, then the grid.
   - Dates: Today, This week, This month, Last month, YTD, Custom.
   - States: Table / Charts.
2. Metric strip variants: plain; with goal bars; with deltas; many metrics that wrap.
3. A/R aging: buckets Current (0-30), 31-60, 61-90, 91-120, 120+ as a blue stacked bar and a table. Views
   Guarantor A/R / Insurance A/R / Carrier breakdown.
4. Production vs collections chart: blue bars plus line, with a goal line.
5. Provider scorecard table: Gross production, Production / hour, Avg / visit, Case acceptance, Adjustment rate.
6. Goals year grid: months × metrics, type-in-cell.
7. Daily huddle: tabs Balances, Claims, Insurance, Plans, Tasks; today's list of what to do per patient.
8. Reports catalog: grouped list (Financial, Insurance, Scheduling, Patients/Clinical, Admin), a report result
   with Download CSV/PDF and Print.

**tasks**
1. Tasks: groups sidebar with counts (All Tasks, Revenue Cycle, Front Office, Clinical, Scheduling, Calls &
   Messages) and a Grid (Status, Task, Urgency, Type, Date created, Assignee).
2. Task panel.
   - Asana-style unfilled circle-check left of the title, metadata fields, patient as a blue link.
   - Description, and a subtasks compact table with the same check control.
   - Attachments, comments and activity.
   - States: Open / Done.
3. Information request responder.
   - Section title "Respond to this information request", with the related claim inline.
   - Claim context as a spreadsheet, then ONE horizontal grid of the items Asha needs.
   - Each answer cell has an xs Submit inside it, bottom-right.
4. Lists workbench.
   - Queue sidebar: Hygiene recall, Reschedule, Unscheduled treatment, Reactivation, New patients, Post-op
     follow-up, ASAP / waitlist, each with a count.
   - Unscheduled treatment Grid: Contact, Phone, Status, Treatment, Next phase, Age, Plan ins. est., Plan patient
     est., Owner.
5. Call sheet (worklist record panel): icon quick actions (call, text, email, schedule), last contact, attempts,
   a shared Follow-up section, and log an outcome. States: No contact yet / Attempt limit reached.
6. Create task dialog.

**comms**
1. Messaging inbox, 3 panes: conversation list ("Search conversations...", All Messages / Resolved), thread,
   patient info (upcoming appointments, balance).
2. Text thread details:
   - delivered/read marks and an AI-sent badge
   - an internal note
   - a templates picker and the compose footer with Attach and Send
3. Reminder and confirmation settings with a live phone preview of the patient's text.
4. Calls: list (Name, Phone, Date, Duration, Insurance, Summary) and call detail (Summary, Transcript, AI call).
5. Campaigns list: trigger, status, audience size, replies, additional revenue. Also a campaign detail.
6. Faxes inbox: Matched / Not matched, Urgent / Routine, Upload to chart.

**forms**
1. Forms list: tabs All Forms, Automations, History; Grid.
2. Form builder: field list and field types on the left, live preview on the right, conditional logic row.
3. Patient intake form as the patient sees it on a phone (390px frame). States: Filling / Review & sign / Done.
4. Send form: Secure link, Text, Email; send-state chips Link sent, Form opened, Completed, Signed by patient.
5. Documents with AI filing review: suggested patient and category, Accept / Change. Grid and list views.
6. Signature capture and consent acknowledgment.

**settings** (keep `settings-labs-page` exactly as is and add after it)
2. Settings rows:
   - a switch
   - a select
   - a linked value ("Change in Practice info")
   - a follow-up row revealed under a switch
   - an (i) explanation
   - a row with a needs-you note
3. Connected services: Practice software, Clearinghouse, Card payments, Phones, X-ray imaging (SOTA).
   - Each row: an outlined mark, "service · vendor", one grey line, a dot and status, a ghost action and ⋯.
   - Statuses: Connected, In review (waiting), and one problem with a one-click fix.
4. Office hours: week rows with lunch break, closed days, the day chip picker, and a holiday closure list.
5. Setup steps (done · now · next · problem) with the body under the current step.
6. Copy, secret and edit rows: kiosk link with QR, API key (never shown), NPI edit with "Couldn't save" reason.
7. Team members list and a roles & permissions matrix.
8. "Needs you" section with task rows, and a pending changes bar (Discard / Save 3 changes).

**ai**
1. Copilot panel.
   - Question, then a thinking view with plain-English milestones, then an answer with a small table block
     (claims) and resource cards (View claim…).
   - Follow-up input "Ask a follow-up...".
   - States: Thinking / Answer.
2. Inline suggestion on a claim: a compact line with a small blue sparkle, what Asha suggests and why, and Accept
   / Dismiss. Not a banner.
3. Write-action confirmation card: "Asha will post $1,310.50 to 3 lines — Confirm / Edit / Cancel".
4. AI Staff: agents list (Agent, Status, Action, "Activate agent") with what each does.
5. What Asha did: activity timeline across claims, EOBs and calls, each with the reason and Undo where possible.
6. Scribe: live note drafting from the visit, with suggested codes to accept.

## Owner feedback, round 2 (2026-09-25). These rules override anything above.
1. **Panel dividers run edge to edge.** In every side panel, flyout, sheet and dialog, section lines touch
   both edges of the panel. Never draw a hairline inset by the body padding.
   - Build panel bodies from `psec(title, body, {actions, count, cls})` sections. Their `border-t` spans the full
     width because the body has no side padding.
   - Render the panel with `sheetPanel({...,flush:true})` (drawn in place) or `Sheet.open({...,flush:true})`
     (live).
   - Tables and key-value grids that should touch both edges go inside `bleed(...)`, with `ps-5` on the first cell
     and `pe-5` on the last. Anything else sits inside the section's 20px padding and has no lines of its own
     that stop short.
   - Tabs under the header use the shared header, whose line is already full width.
   - The same rule applies to dialogs: header, body sections and footer lines touch both edges.
   - Reference: `apptDetailBody()` in `blocks/schedule.js`, the "schedule-detail" block.
2. **Never two blue text links side by side** (e.g. "View benefits" + "Re-verify"). Each section header gets at
   most one action, a small white button (`button(label,{v:"white",s:"xs",icon})`).
   - When a row opens something, make the whole row clickable with a chevron instead of adding a link.
   - Extra actions go in a ⋯ menu.
   - A single inline blue link inside a sentence is fine.
3. **Don't cram the top of a panel.**
   - Status goes on ONE line: one status button (dot, word, chevron) plus a grey caption on the right.
   - Alerts are plain rows (`infoRow(icon, text, {tone, right})`), not a pile of chips plus a note.
   - Facts use `metaGrid([[label, value], ...], 3)`, with labels above values.
   - Never show the same fact twice in one panel.
4. **Filter and sort chips are Attio condition chips**, as on the Claims toolbar: `condChip(field, op, value,
   removeAttrs, removeLabel)`, which is white and bordered with a dark field, grey "is", blue value and a
   separated ×. The kit `Grid` already uses them. Never use blue-filled chips.
5. **Tables are never open-sided, anywhere.** A table, key-value grid, spreadsheet, or list with row lines, on a
   page, in a panel, a card or a popover, is one of two things:
   - **edge to edge**: its lines touch both edges of the surface it sits on (the page, the panel, the card), or a
     divider such as a sidebar's line. The first and last columns carry the gutter, so the text still lines up
     with the toolbar above. This is the default for the main table of a page (every kit `Grid`: pass
     `gutter` = the page's side padding, 16 by default) and for one simple line-item table in a panel section
     (`bleed()`). Use `edgeToEdge(g)` for a hand-built table or empty state in `g` px of padding.
   - **boxed**: a full border with 8px corners (`R.tableBox`, a Grid with `box: true`, or `rounded-lg border` on a
     list with `[&>li]:px-3`). Use this when the table sits among other content: stacked tables, a table beside
     a column, a settings list, a specimen on a documentation page.
   Never a table or list whose top and bottom lines stop inside the padding with open left and right sides.
   `qa/shoot.cjs` flags any that do.
6. **Row alerts never add a line.** When one row in a list or settings box needs attention, the row keeps the same
   height as its neighbours.
   - Show `alertMark(short, detail, {action})`: a small orange icon and 2–4 grey words on the same line (e.g.
     "2 visits after close"), placed just before the row's control or value.
   - The full sentence and at most one action (a small white xs button) open in a popover on hover and focus.
   - Never put a `note()` line under a single row, and never write a sentence ending in a blue link.
   - A note that concerns a whole section may appear once at the top of that section. Keep it rare.
7. **Forms are a table, never tags.** Wherever forms appear (hover card, side panel, check-in), show a small table
   with Form · Status · When, e.g. "Consent · Not signed · Sent Sep 23". A tag with a check icon doesn't say the
   form was filled out. Use `formsTable(rows)` in `blocks/schedule.js`.
8. **Many small markers are icons with a hover label.** When a record can carry more markers than fit as words
   (appointment cards: Med alert, Ins. Verified, Pt Bal. Due, AI Confirmed and more), show only the icon and
   give it `data-tip="Label"`; the kit shows the label on hover and focus. Put the full words in the parent's
   `aria-label` and spell them out once in a legend.
9. **One data grid, four presentations.** New tables use the data grid (the kit `Grid`, the app's `AshaGrid`) instead
   of a hand-built `<table>`; existing hand-built tables move over one by one. A grid picks one presentation by where it
   sits, via `preset`, and overrides a setting only when it must:
   | Preset | Where | Look |
   |---|---|---|
   | `page` | The main list of a page (Claims, Patients, a Revenue subtab) | Edge to edge through the page gutter, 36px rows, 14px text, cell lines, toolbar, sorting, select, totals row |
   | `section` | A table among other content on a page (eligibility benefits, a settings list) | A card, 36px rows, 13px text, row lines only |
   | `panel` | A table in a flyout, dialog or popover (procedures, forms, a payment plan) | A card, compact: 28px rows, 13px text, small uppercase headers on a light grey band, a grey totals row, row lines only |
   | `form` | A money table with four or more number columns (checkout charges, a payment plan); claim, EOB, payment-posting and ledger sheets stay on `ClaimFormSpreadsheet` | `panel` plus cell lines, like the ADA claim form (`AshaSpreadsheetTable density="compact"`) |
   - The underlying settings are `density` (`default` 36px/14px, `dense` 36px/13px, `compact` 28px/13px), `lines`
     (cell lines or row lines only), `box` (card or edge to edge), plus `toolbar`, `sortable`, `selectable`, `foot`
     (a fixed totals row) and `wrap` (long text wraps). A new preset needs a new place, not a one-off look.
   - A totals row draws one line above it, never two.
   - Number columns never truncate: when a card is narrow, the first text column (the description) gives up the room.
   - A card keeps the section's normal spacing around it (16px below, never pressed against the next divider).
   - Components page: "One grid, four presentations" shows all four with the same data. `index.html?tables=grid`
     shows every block's tables in their preset; the blocks themselves still move over one by one.
   - In the app, `AshaGrid` takes the same `presentation` (or `density`, `lines`, `frame`), but it sets only size, lines
     and frame. The rest is up to the screen: pass `footer={false}`, leave out `onSortChange` and `selection`, and size
     number columns so they fit. `section`, `panel` and `form` are a preview until a real screen adopts them
    .
   - Claim, EOB, payment-posting and ledger sheets stay on `ClaimFormSpreadsheet` (the asha-ui feature conventions);
     `form` is for other money tables until a plan moves those sheets.
10. **Workspace tops are one row.** Don't stack a breadcrumb row on top of a toolbar row. Put the date, view and
   actions in a single 52px bar so the content below gets the height.

## v4 rules (owner reviews, 2026-09-30 to 2026-10-01). Behind `?v=4`; where they differ from the rules above, these win in v4.
Turn on **Highlight changes** at `index.html?v=4&hl=1` to see each rule applied: blocks mark their changes with
`chg4("why")`, and the Overview page lists the system-wide ones (`sysChange4`).
1. **Type into tables.** A record's facts are a small table you type into (`fieldTable(rows)`), and lines staff fix
   (fees, estimates, providers) are cells on the data grid with spreadsheet editing (`sheetTable(...)`, Grid
   `sheet: true`): click or just type, Enter saves and moves down, Tab moves on, Escape cancels. Saves are silent; a
   failed save leaves an orange mark in the cell with a retry. List cells search in place (`edit: "select"`); fields
   with several values are `edit: "multi"` (chips in the cell, checkboxes in a list that stays open). One highlight
   follows mouse and keys; money cells open with the same text they show. Leave long text, signed records, charts,
   calendars and patient-facing forms alone.
2. **One record header.** Every panel and record page uses `recordHeader`; patients use `patientHeader` (medical
   alerts as one icon with a count, orange when someone must act first; family balance as a wallet with the amount),
   replacing "Before the visit"-style lists. No bar above a header. Header facts are one label and one value; extra
   detail goes on hover. The patient chart uses the real layout: a patient panel on the left, tabs and content on
   the right.
3. **One Actions menu.** A labelled Actions button with the blue sparkle sits bottom-left in a footer when a record
   has many actions (`actionsMenu(groups)`): searchable, grouped, one line per action, a sparkle on what Asha
   suggests now, greyed rows that say why they can't run. A menu at a header's top right is a ⋯ with the same list
   (`dots: true`). Row ⋯ in tables stay.
4. **Status lives in the facts.** A status is the first line of a record's facts table, never a row of its own, and
   stays short ("Confirmed · Sep 23").
5. **No patchy columns.** Every column shows a value on every row, or the column goes: fold rare data into another
   column, show a muted "$0.00", "None" or "—" instead of a blank. `qa/shoot.cjs` fails v4 tables that don't.
6. **One table size per panel, one header treatment per surface.** Every table in a panel or flyout is the compact
   grid size (28px rows, 13px), editable or not; if one table on a surface has a grey header band, field tables
   carry their group name in the same band. Compact totals rows are not tinted.
7. **Most important first, the rest on demand.** A surface shows what its most frequent job needs, as a grid with
   the few columns that matter. Other details open on hover in a card beside the panel (Grid `peek: (row) =>
   peekCard(...)`), and the whole record on click. Never string many values along one line.
8. **The first-day test.** Anything staff set up (agents, settings, setup steps) must be doable by someone new to
   dentistry and new to software: answers pre-filled with what most offices pick (Recommended), questions asked the
   way you'd say them aloud with a one-line reason, no jargon, rare settings behind More settings, and a last step
   that says in plain sentences what will happen. No phone previews in agent setup.
9. **Claims read like the paper they stand for.** A claim's Claim tab is only what was submitted, editable, in the
   ADA form's order with box numbers; rare boxes sit behind More claim details. The EOB tab holds the adjudication,
   laid out like a dental EOB (payment, payer and claim facts, the services table with remark codes, a legend).
10. **Steppers never show alert icons**; the problem shows inside its step. **Messages go through one send dialog**
   (text or email), never an inline composer in a list. **Toasts are the light, frosted, Mac-style card**
   (`alertCard`, `R.alertCard`) at the window's top-right corner, never a dark slab.
11. **Clinical notes keep the worklist panel's condensed layout** and nothing inline in the editor: no toolbar strip,
   no Accept/Dismiss chips in the text; Scribe's version is a separate AI note you sign.
