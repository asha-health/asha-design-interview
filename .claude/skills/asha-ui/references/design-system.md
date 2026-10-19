# Asha Design System (canonical since 2026-09-25)

This is the design system every Asha UI change follows. It applies to all three layers: tokens, `asha-ui`
primitives and feature components. Where older guidance, tokens or components disagree with it, this document wins
for any UI you create or touch.

- **Library:** `docs/design-system/index.html`. Open it in a browser; it is one self-contained file. It shows the
  foundations, the components and 93 working blocks of real Asha screens in 13 areas, each with its states (normal,
  empty, loading, error, busy).
- **Recipes:** the `R` object in `docs/design-system/src/kit.js` holds every class recipe by name. The library's
  "Build list" page prints them. The kit's helpers (`psec`, `metaGrid`, `infoRow`, `alertMark`, `condChip`,
  `Grid`, `Sheet`, `Motion`, `toast`) are the reference behaviour for the matching `asha-ui` primitives.
- **Real screens:** `docs/design-system/INVENTORY.md` records the real labels, columns and statuses each block uses.
- **Which version:** the library opens on **v4**, the version to follow (since 2026-10-01). The switch at the top of
  its sidebar still shows v1 and v2 if you want to see where something came from, and **Highlight changes** outlines
  everything v4 changed with a note saying why. The written rules are in `docs/design-system/BLOCKS-GUIDE.md` under
  "v4 rules", and the library's Overview page lists them too.

## 0. The principles (read these first)

These came out of the owner reviewing every block, and they matter more than any single size or colour below. If a
screen you're building breaks one of them, fix the screen, not the principle.

- **Most important first, the rest on demand.** Work out the job people do most often on this screen and show only
  what that job needs. Everything else is one hover or one click away: a hover card next to the panel for a row's
  extra details, the full record on click, a "More settings" or "More details" section for the rare stuff. Never
  string five values along one line.
- **The first-day test.** Anything people set up (AI agents, settings, setup steps) should be doable by someone who is
  new to dentistry and new to software. Fill every answer in with what most offices pick and mark it Recommended, ask
  each question the way you'd say it out loud with a short reason under it, skip the jargon (no "recall interval",
  "perio maintenance" or procedure codes), tuck rare settings behind "More settings", and finish with a plain summary
  of what will happen.
- **Type into tables, like a spreadsheet.** Dental staff are used to Dentrix and Eaglesoft, where you click a cell and
  type. A record's facts are a small table you can type into, and the lines people fix (fees, estimates, providers)
  are editable cells on the data grid. Click or just start typing, Enter saves and moves down, Tab moves across,
  lists search as you type, fields with several values let you tick several. Saves are quiet; only a failed save
  leaves a small orange mark with a way to retry. Leave long notes, signed records, charts and calendars alone.
- **One header for every record.** Panels and record pages share one header: who or what it is, one line of facts,
  then the actions and close on the same row. No extra bar above it. Facts in a header are one label and one value,
  never a third grey line. Patients get the same patient header everywhere: medical alerts as one icon with a count
  (orange when someone has to act first) and the family balance as a wallet with the amount.
- **One Actions menu.** When a record has lots of actions, they live in an "Actions" button with a small blue sparkle
  at the bottom left of the footer: searchable, grouped, one line each, a sparkle on what Asha suggests right now,
  and greyed rows that say why they can't run yet. A menu in a header's top-right corner is a ⋯ with the same list.
- **Status lives in the facts.** A record's status is the first line of its facts table, kept short ("Confirmed ·
  Sep 23"), never a full row of its own.
- **No patchy columns.** Every column shows something on every row. If only a few rows have a value, fold it into
  another column or drop the column; otherwise show a grey "$0.00", "None" or "—" rather than a blank.
- **One table look per surface.** Every table inside a panel or flyout is the compact size (28px rows, 13px text),
  editable or not. If one table on a screen has a grey header band, the others carry their group name in the same
  band. Totals rows aren't tinted.
- **Claims read like the paper they stand for.** The Claim tab is only what was sent, editable, in the ADA form's
  order with its box numbers, with rare boxes behind "More claim details". The EOB tab holds what the payer decided,
  laid out like a dental EOB.
- **Smaller rules.** Step bars never show alert icons (the problem shows inside its step). Texts and emails go
  through one send dialog, never a message box that opens inside a list. Clinical notes keep the chart's condensed visit panel
  and put nothing inside the note text (no toolbar strip, no Accept or Dismiss chips).

## 1. The blend

- **Colour comes from Preline:** Tailwind 4 `blue-600` / `gray`, soft `100/800` fills and pale tags.
- **Size and finish come from shadcn:**
  - 36px controls, 32px in toolbars;
  - 14px text;
  - 8px corners;
  - hairline shadows;
  - a 3px soft blue focus ring.
- **Lists use Attio's data grid:** column lines and no box, filter and sort as condition chips on one line, a
  totals row, and cell keyboard navigation.

## 2. Foundations (Layer 1: tokens)

| Token | Value |
|---|---|
| Accent | `blue-600`. Hover and pressed are one shade darker (`blue-700`). Soft fill `blue-100` with `blue-800` text. Focus border `blue-500`. |
| Text | `gray-800` body, `gray-500` secondary, `gray-400` placeholder and empty cells. |
| Lines | One hairline everywhere: `border-gray-200/80`. Control borders are `gray-200`. |
| Type | Inter. 14px default, 13px help, 12px captions. Page title 24/32 semibold, section 16, group 14 semibold. Numbers use `tabular-nums`. |
| Heights | 36px controls (`h-9`), 32px in toolbars (`h-8`), 28px inside chips and cells. Grid header 40px with 14px medium grey text, rows 36px, totals row 32px. Settings rows at least 44px. Sidebar rows 32px. |
| Corners | 4px checkbox, 6px menu items, 8px buttons, fields and boxes, 12px menus and dialogs only, full for tags and switches. |
| Depth | Boxes: a hairline, no shadow. Buttons and fields: `shadow-2xs`. Menus and bulk bar: `shadow-xl`. Dialogs: a soft large shadow. |
| Focus | 3px ring, `ring-blue-600/20`. Fields also turn their border `blue-500`. |
| Motion | Press 100ms dip 2%. Hover colour 100–120ms. Menu pop 160ms (fade and 3px drop). Tab ink and segment thumb glide 200ms. Check pop 180ms. Chip in 160ms (new chips only). Row in 220ms plus a 1.2s save glow. Toast 200ms in, 150ms out. Sheet 220ms. Reduced motion keeps colour feedback and removes movement. |

### Colour meaning

- **Blue:** on, connected, selected, or the one main action. Use one solid blue button per area.
- **Grey:** everything else.
- **Orange:** only means "a person must fix this".
- **Red:** only for deleting and for failure.
- **Status is always a dot and a word:** blue for on, grey for off, orange for needs you, light blue for partial.
  Never use green or red values, and never use yellow or amber bands or coloured banners.
- **Pale tags** (`blue`, `teal`, `indigo`, `gray` at 100/800) only say what kind of thing something is.
- **One exception:** ledger entry types keep Dentrix-style text colours (claim blue, payment green, ADJ red).

## 3. Components (Layer 2: `asha-ui` primitives)

| Primitive | Spec |
|---|---|
| Button | Styles: solid (blue), white (bordered with `shadow-2xs`), soft, ghost, quiet, link, danger. Sizes: lg 40, md 36, sm 32, xs 28. `rounded-lg`. Press dip. Shortcut hints as `kbd`. |
| Field / Select | 36px, `rounded-lg`, `gray-200` border, `shadow-2xs`, blue focus border and ring. Toolbar search is filled `gray-100` and turns white on focus. |
| Checkbox / Radio / Switch | 16px `rounded-[4px]` checkbox and radio, filled `blue-600` when checked. Switch is 36×20, blue when on. |
| Tabs | Underline tabs have a blue active line and count pills; the line glides between tabs. The segmented control is a grey track with a white thumb that glides. |
| Status | `AshaStatusDot`: a dot and a word. |
| Marker icons | When a record carries more markers than fit as words (appointment cards: Med alert, Ins. Verified, Pt Bal. Due, AI Confirmed), show the icon only, with its name in a tooltip on hover and focus and in the record's accessible label. Orange only for markers a person must act on. |
| Forms list | Always a small table: Form · Status (dot and word, e.g. Signed / Not signed / Needs update) · When. Never tags with check icons: a tag doesn't say the form was filled out. |
| Filter and sort chip | `AshaConditionChip` (Attio): white, bordered, dark field, grey operator, blue value, separated ×. Never blue-filled pills. |
| Row alert | Orange icon and 2–4 grey words inline on the row; the full sentence and at most one action show in a hover or focus popover. It never adds a line under the row. |
| Menu | 12px corners, `shadow-xl`, `p-1`, 32px items with an icon on the left and the shortcut on the right. Delete sits last, in red. Optional search box on top. |
| Dialog | 440px wide, sits near the top. Header, sections and footer are split by full-width lines. Footer reads Cancel (Esc) and a primary button with ↵. |
| Side panel (`AshaSheet`, `AshaRecordSheet`) | Never narrower than Find appointment (500px): `AshaSheet` is 600px at `md`, `AshaRecordSheet` 512px, the library draws 520px; claim sheets can be wider. One header row: identity and one line of facts, then the icons and ×; no bar above it. Status is the first line of the facts table, not its own row. The body is flat sections whose dividers run edge to edge. Facts are a small table you type into; every table in the panel is the compact size. Nothing is repeated. The footer has the Actions button (sparkle) on the left, a secondary button and one blue action. |
| Tables and lined lists | Never open-sided, on a page or in a panel. Either edge to edge, touching both edges of the surface or divider it sits on, with the gutter moved into the first and last columns so text lines up with the toolbar (the default for a page's main grid and for one line-item table in a panel section), or boxed with a full border and 8px corners (for tables among other content: stacked tables, a table beside a column, settings lists). |
| Data grid presentations | One data grid (`AshaGrid`), four looks picked by where it sits: **page** (the main list: edge to edge, 36px rows, cell lines, toolbar; today's default), **section** (among other page content: card, 36px rows, 13px, row lines only), **panel** (flyout, dialog, popover: card, compact 28px rows, small uppercase headers on a `gray-50` band, row lines only; a totals row is plain white, not tinted), **form** (other money tables with 4+ number columns: compact with cell lines). `AshaGrid` takes `presentation`, or `density` (default / dense / compact), `lines` (cells / rows) and `frame` (flush / card); with none it keeps the page look. These props set size, lines and frame only: the screen still passes `footer={false}`, leaves out sorting and selection, and sizes number columns so they fit. `section`, `panel` and `form` are a preview until a real screen adopts them. Claim, EOB, payment-posting and ledger sheets stay on `ClaimFormSpreadsheet` (see feature conventions). |
| Page top | One row. The date or view, its count and the actions share one 52px bar; no separate breadcrumb row above a toolbar. |
| Data grid (`AshaGrid`) | One-line toolbar: view with its count · search · condition chips · Filter · (Discard / Save view) · ⋯ · primary. Sticky first column with a checkbox. Header icons. Right-aligned money. Grey empty cells ("No phone"). Totals row with a calculation picker. Cell keyboard navigation and Enter to edit. Dark bulk bar. Toast with Undo for destructive bulk actions. |
| Settings row | The box has no padding. Each row is `px-4 py-3`, at least 44px, with full-width dividers. The (i) explanation appears only on hover. A follow-up question is its own indented row. A value owned by another page shows as the value, a grey chevron and "· Set in …", and the whole row is the button. All controls sit in one right-hand column. |
| Toast | The light, frosted, Mac-style card our notifications use, in the window's top-right corner: soft shadow, a small close circle on its corner on hover, one quiet text action such as Undo. Only for things that happened out of view or can be undone; never a success message for something you can see. |
| Empty, loading, error | Keep the frame and the header. Loading shows grey bars where values will go. Empty is four quiet lines ending in the next action; never "All caught up!". An error says what failed and offers Try again. |
| AI thinking | The live step is a shimmering phrase with three dots, a pinging ring and a soft blue wash. Finished steps get a check and their time. The steps collapse to "Checked N things · Ns ›" when the answer arrives. Blue only. |

## 4. Blocks (Layer 3: feature components)

Before building or restyling a screen, open the matching group in the library and follow its block.

- **Groups:** App shell · Schedule · Patients · Charting & treatment · Billing & payments · Insurance & claims ·
  Revenue intelligence · Tasks & lists · Messages & reminders · Forms & documents · Settings · Asha AI · States &
  overlays.
- **Full screens** start with the 44px one-line `AshaWorkspaceHeader` and underline tabs with counts. Dates go in
  the tab bar's right slot. There are no summary tiles above lists.
- **Reuse:** related surfaces reuse the same grid, spreadsheet and panel components. For example, Claims, EOBs,
  Lists and the ledger all use one grid.
- **The tooth chart** keeps Asha's own shaded tooth art (`CurveToothSVG` / `toothPathData.ts`), with the colour
  meaning above drawn on top.

## 5. Words

- Write for a dental office manager: plain, sentence case, units next to numbers.
- Use the real labels from `INVENTORY.md`.
- No jargon, no emojis and no "AI-powered".
- Every setting has a plain (i) explanation.

## 6. Adopting it: new as of 2026-09-25

The design system is newer than most of the component library, so today's tokens and components don't all match
it yet. Some examples:
- the focus ring is 2px `blue-500/50`, where the system uses 3px `blue-600/20`;
- small buttons use 12px text, where the system uses 13px;
- there are no shared motion tokens yet;
- screens differ in how they draw panel dividers, tables in panels and filter chips.

The production code catches up gradually.

We're actively moving all three layers (tokens, `asha-ui` primitives and feature components) toward v4 and its
principles. So whenever you touch UI, look at the v4 block for that screen and ask how close the real screen is: the
data grid with typed cells, the shared record and patient headers, the Actions menu, no patchy columns, compact
tables in panels, details on hover. Close the gap at the shared piece when it's in scope, and write the rest down in
the adoption plan.

- **New UI** follows this system from the start.
- **Touched UI:** bring what you change up to the system, at its lowest owner.
  - Fix the `asha-ui` primitive or token instead of overriding it in a screen.
  - Don't restyle unrelated screens along the way.
- **When a primitive is behind the system** and a fix is out of scope:
  - use it as is and note the gap in the adoption plan;
  - don't build a one-off lookalike in the feature.
- **Keep changes app-wide changes visible.** Token and size changes shift every screen. Ship them in their own
  small PR with a before-and-after browser check of the busiest screens: Claims, Schedule, patient chart, ledger
  and Settings.
- **Keep the library up to date.** When a real screen settles on a pattern the library lacks, add or update its
  block (`docs/design-system/BLOCKS-GUIDE.md`) so the library stays the source of truth.

## Choose the information order before the layout

For a new destination or a requested navigation rethink, identify the user's
most frequent job, its natural entry point, and the other jobs already on that
surface. Use `asha-ux-variations` when placement is unresolved. Separate daily
operations from occasional setup; a shared subject does not mean the jobs belong
on one page. Name destinations after the work they actually support, and avoid
an umbrella page with one redundant tab.

Base visible destinations and actions on effective permissions, including people
who have only one of several related capabilities. A role name or hidden tab is
not authorization. Reuse existing route guards and query owners.

When using another PMS as evidence, verify the exact product and navigation in
its documentation. Distinguish observed behavior from an Asha recommendation.
Mock only data and actions supported by the current contract; put useful future
capabilities outside the proposed product screen.
