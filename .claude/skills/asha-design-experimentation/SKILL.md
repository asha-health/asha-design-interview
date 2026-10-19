---
name: asha-design-experimentation
description: >
  Use when the user wants to see and choose between visual design variations
  for an Asha screen before it is built: a local HTML mock with several options
  side by side, a pick, then variations of the pick, then implementation.
  Start it whenever someone names it, for example "run design experiments", "use asha design experimentation", even in the middle of a sentence.
---

# Asha Design Experimentation

The loop: work out what the people using this screen need, turn it into a few
plain questions, mock two or three honest answers to each question in one local
HTML file, let the user pick, then build the winners once at the shared
component.

**The page is a slideshow, not a report.** Each question is one slide: a big
bold question, two or three pictures, a few plain sentences under each picture,
and one recommendation. The user should click through it and decide in a
minute. If a slide needs explaining, the slide is wrong. Most of this skill is
about keeping it that simple.

Use `asha-prototype` instead when the question is how something *behaves* (what happens after
the click, how many steps a job takes). Use `asha-ui` for every token and component.

## Start from the merged Asha design-system preview

The preview in `docs/design-system/index.html` is what Asha should look like. Your
mocks should look like they came straight out of it, close enough that someone
flipping between the two couldn't tell which one you drew. When mocks drift, it's
almost always because someone glanced at the preview once and then drew from
memory, or copied an older screen from the app. So keep it open the whole time
you're drawing, not just at the start.

Before you draw:

- **Read the guide, then open the preview.** Read
  [Asha UI's design-system guide](../asha-ui/references/design-system.md), starting with
  its principles, then open the preview and click through it. It opens on v4, the
  version we follow; turn on "Highlight changes" to see what v4 changed and why. The blocks live in
  `docs/design-system/blocks/` (shell, schedule, clinical, patients, billing, claims,
  revenue, tasks, comms, forms, settings, AI and states), the exact styles are the
  recipes in `docs/design-system/src/kit.js`, and the real screen labels are in
  `INVENTORY.md`.
- **Look across the whole library, not just the closest block.** The blocks aren't
  only a style sheet; they're full of ideas you can borrow: a "Needs you" box at
  the top, a phone preview for texts, setup steps with progress, a timeline for
  history, totals on a grid, an initials mark. Find the few blocks from any group
  that are closest to what this screen needs, and start each option from one of them.

While you draw:

- **Draw with the library's own code.** Don't redraw blocks by hand. Build your page
  by pulling in the library's `kit.js`, `data.js` and the block files you need, the
  way `prototypes/appointment-flow/build.py` does, so every
  picture uses the real recipes and the real data grid. When the screen already has a
  block, draw today's option straight from that block.
- **Hold every option up to the principles** at the top of the guide, and to the UX
  principles in `docs/design-system/ux-principles/README.md`, before it goes on a slide. They are how we decide what earns the main
  surface, how loud an alert should be, when to reuse a shared piece, and more. If an
  option breaks one on purpose, say so in its catch.
- **Copy, don't approximate.** Lift the classes and structure from the block and
  the `kit.js` recipe: type sizes, spacing, borders, row heights, colours, controls,
  flat sections, motion and empty or loading states. Only change what your
  question is about.
- **The library is the target, not today's app.** The production app is behind the
  library in places. When in doubt, the library and its blocks win.
- **Preline is a second source.** Use it for ideas when the library has nothing
  close, then redraw what you borrow in the preview's style.
- **Name what you borrowed.** Note in chat which blocks each option starts from, so
  the reviewer can check it against the preview.

Before you show it, every time:

- **Put your mock next to the block it came from,** at the same size (1280px wide),
  and compare them properly. List the differences you find, and fix the ones that
  aren't the point of the question. In chat, say which blocks each option started
  from, what you compared it against, and what's still different and why.

If the preview has nothing for part of your screen, design that part in the same
spirit and say so, rather than forcing a block that doesn't fit, and suggest adding a
block for it once the design settles. 

## 0. Who You Are Designing For

Asha is a dental practice management system. The person on the other side of
the screen is front-desk or billing staff working a queue all day, often on the
phone. These principles come from how we review Asha work ("Are we letting
users do their work?") and they outrank your taste.

- **Start from their day, not the data model.** The job they do most often
  gets the top of the screen and the fewest clicks. A rare task can live in a
  menu.
- **Keep data together and compact.** Dental staff are used to dense PMS
  screens where everything about the record is in view. Do not spread one
  record across cards, tabs, generous whitespace and "show more" toggles.
- **Fewer clicks wins.** If a design needs a click to reveal what staff look at
  on every record, it is the wrong design.
- **Never block or restrict the user.** Do not hide buttons, disable actions,
  gate steps or force confirmations because data looks incomplete. Keep
  actions available; give compact guidance and an immediate remedy instead.
- **Borrow from products they already know.** Dentrix Ascend for layout, Open
  Dental for how much freedom staff expect. Use familiar dental-office words.

## 1. Think First, In Chat

Before you draw anything, work these out. **They go in your chat reply, a few
short lines each, never on the page.**

- **Who uses this screen and what they come to do**, in their words ("did
  billing keep up this week?", "work the oldest balances"). Which job happens
  most often wins the top of the screen.
- **What is actually wrong today**, from the real code, not a feeling. "The
  rows open nothing and only ten fit" is a diagnosis; "it looks messy" is not.
- **What the screen really loads.** Read the type the screen receives and the
  actions that exist. Design only with those. Anything valuable that is not
  loaded is a separate "useful, not loaded today" note for the user, not
  something you sneak into a picture.

## 2. Pick The Questions

Turn that into **three to five questions**, one slide each, plus a final
**All together** slide: today next to the picks combined, because picks
interact. Fewer is better. A question has real alternatives and someone's day
riding on it; styling nits are not questions. Usually one question is about
what comes first on the screen and one is about how it looks, but only ask
them if they matter here.

Each slide has two to four options, today's design first. Cut an option that
looks the same as another once the data is honest.

## 3. Write Every Slide For An Office Manager

Write for someone who has never been in a design review and has no patience
for one. If a dental office manager would not understand a word, cut it.
The user's own test: explain it like you would to someone at the front desk.
"We could lay it out like this, because it helps with this. The catch is this."

**The question.** One big bold line, the way you would say it out loud.

| Instead of                                        | Write                                                                                          |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Information hierarchy: what leads the page?       | When the page opens, what should you see first?                                                |
| Status and quiet states                           | Almost every row says the normal thing, like Submitted. How much should those stand out?       |
| What a row says and opens                         | What should each line in the list show, and what happens when you click it?                    |

Under it, at most one grey line of plain context ("Try the quiet Monday data
set from the dropdown"). Nothing else between the question and the pictures.
The slide's tab button gets a short plain name too ("1 · What you see first").

**Each option** is a letter, a short plain name, and one to three short
sentences: what it is, why it helps, and the honest catch.

- Name: "The list fills the screen", "A summary page first", "Normal is grey,
  problems stand out". Not a pattern name, not a component name.
- Sentences: "Twenty-five rows per page, about three days of claims before
  you scroll. Print and export live in the one three-dot menu." / "Easy to
  print for a meeting. The catch: everyone else clicks once more to reach the
  list they came for."
- Every option gets its catch, your favourite included. Exactly one option per
  slide is tagged Recommended.

**Words to avoid on the page:** hierarchy, KPI, metric strip, chip, density,
popover, affordance, config, component, file and prop names, pixel arithmetic.
Say "the counts up top", "the list", "the three-dot menu", "the row opens the
claim", "an orange dot only for problems".

## 4. What Is Not On The Page

These were all on earlier pages and the user found them clutter:

- No "why this screen exists", "who comes here, ranked" or "what is wrong
  today" sections. That thinking lives in chat.
- No "pick it for … / skip it because …" line and no tag line under the name.
  The catch goes in the sentences.
- No measurement text ("Above the fold: 17 rows …") and no drawn laptop-fold
  line. If you state a row count in a sentence, check it is true; do not print
  the measurement.
- No pattern or component names on options. Name the Preline references once
  in the footnote.
- No paragraphs of caveats. If a slide needs a paragraph, split the question
  or cut the option.

## 5. Build The Mock

One self-contained HTML file in `prototypes/<name>/`, built from the library's
`kit.js`, `data.js` and blocks (see `prototypes/appointment-flow/build.py`). Invent every name and
number; never use real patient data.

- **Use Preline for inspiration.** Before drawing a slide, look up the closest
  Preline blocks (the Preline MCP if you have it, otherwise preline.co) and
  consider starting an option from a Preline pattern, translated into Asha tokens
  and density. List the patterns once in the footnote. Never claim a lookup that
  did not happen.
- **Copy real classes and formats.** Lift spacing, type sizes and borders from
  `docs/design-system/src/kit.js` (the `R` recipes), and use the app's own date, phone and money
  formats. A mock in a different visual language proves nothing.
- **Borrowing a competitor's layout?** Show its documented placement faithfully
  as one option beside the Asha adaptation, both in Asha's visual style. Compare
  the clicks needed for the two main jobs. Otherwise the reviewer cannot judge
  what the adaptation gains or loses. Cite the exact source; label unverified parts.
- **Regrouping records into days, families or batches?** Keep totals owned by
  the existing data contract. Show where spanning, open and reversed records go;
  don't invent a second calculation to make the picture fit. Synthetic examples
  should follow that contract and remain clearly labeled as examples.
- **Same frame, one difference.** Every picture on a slide shares the
  identical frame and changes only the thing the question is about.
- **Draw at a real screen size.** Render every frame at 1280px and scale it to
  fit, so wrapping and truncation are what the product would really do.
- **Show where to look.** A "Highlight what differs" toggle, on by default,
  rings only the areas that differ and numbers them. Explanations are hover
  tooltips on the numbers, in the same plain words, never extra boxes.
- **Make it data-driven.** A dropdown of data sets with plain names ("A normal
  month", "Monday 8:42 AM, nothing sent yet", "Four busy months, long names")
  re-renders every picture. Always include a typical, an empty and a crowded
  case.
- **Keep the chrome small:** slide buttons, the data-set dropdown, the
  highlight toggle and a grid/rows toggle on one line, then the question.
- **Borrowing from another Asha screen?** Pin down exactly which project,
  folder and branch, render it and look at it. Do not rebuild it from memory.

## 6. Check It Before You Show It

Serve the file locally and open it in the browser tool. Look at every slide
once, plus the emptiest and the most crowded data set. Look for the word
"undefined", wrapped or clipped cells, highlight numbers covering a value, a
sentence that the picture contradicts (fix the sentence), and any leftover
jargon. Tell the user exactly what you looked at and what you did not.

Then step back and read the whole screen. Matching the tokens is only half the
job. Give each total, count and status one clear home; remove repetitions that
compete for attention. Keep ordinary live activity visually distinct from things
someone needs to fix, and put the remedy beside the problem. A daily subtotal
should clearly belong to the day, not appear to belong to its first shift or a
voided row. Check body and footer alignment at the actual available width, with
long date ranges and large totals as well as typical data. Fix misleading grouping
or clipped values before recommending the layout.

## 7. Run The Rounds

**Round one spreads out.** Options that differ in idea, not polish.

**Later rounds converge.** Once the user picks, drop the losers, draw the
picks into every picture, say once in the footnote what is already decided,
and ask only the questions still open. Do not re-offer rejected ideas.

**Read picks like a careful colleague.** If a pick could mean two things
(it clashes with a rule decided since, or with another pick), say in chat how
you read it before you build. When a reply is ambiguous across slides, ask.

**Reply in chat the same way the page reads:** a link to the page, then the
open questions as a short numbered list, each with one sentence and your
recommendation. Keep reasoning to a few plain sentences.

**Apply feedback everywhere.** A note about one option almost always applies
to the shared frame; fix it in every picture. When the user says revert,
revert exactly, then offer alternatives.

Keep a backup of the file each round (`*.backup.html`) and put round two in a
new file so the earlier round can still be shown.

## 8. House Taste We Have Learned

These came from real feedback. Start from them instead of rediscovering them.

- One toolbar line: search, dates, Filter, Sort, and one three-dot menu.
  Saved views, columns, print and export live in the menu. A filter chip
  appears only while a filter is actually applied.
- One colour scheme: dark numbers, grey captions, blue accents. No green and
  red values. Anything that needs a person is a small orange icon or dot with
  plain grey text, never a yellow band or paragraph.
- Headers say who the record is and how to reach them. No status pills or tag
  rows up top.
- Actions in a header are small borderless icons with tooltips. At most one
  filled primary button.
- Do not collapse a section that hides one or two rows. No filler lines
  ("preference not recorded"). If there is nothing to say, show nothing.
- Embedded content is clamped to the screen's own type scale.

Most feedback belongs on this list or on one screen. If a note feels bigger than
that, something that should change how lots of screens get designed, say so and ask
before treating it as a new principle.

## 9. In This Repo

There is no production app here, so the mock or prototype is the deliverable.
Keep it in `prototypes/<name>/`, commit it with its source, and make sure it opens
by double-clicking `index.html` (or with `serve.py` when picks need saving).
