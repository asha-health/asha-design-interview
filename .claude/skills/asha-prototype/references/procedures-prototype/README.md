# The procedures prototype (October 2026)

This is the prototype the skill grew out of. It's the round-one version, with all nine questions still open,
so you can see the whole thing working before you build your own.

## Running it

```bash
python3 .claude/skills/asha-prototype/references/procedures-prototype/build.py
python3 .claude/skills/asha-prototype/references/procedures-prototype/serve.py 18791 prototypes/procedures-reference
```

Then open `http://localhost:18791/`. `build.py` reads the design-system library from this repo, so it always
draws with the current blocks. `serve.py` serves the page and saves picks to `answers.json` in that folder. Opened as a plain file, picks stay in your browser and the page still works.

## What's in the folder

- `src/proto-data.js`: the nine questions (options, today first, one recommended), the scenarios with their
  plain steps, and the list of things already decided before this round. Start here when you adapt it.
- `src/proto-app.js`: the screen, the pretend data and what each click does to it, the failures the
  scenarios need, the floating panel, the walkthrough player and one walkthrough per question.
- `src/shell.html`: the page around the screen (top bar, the panel, the walkthrough ring and caption).
- `build.py`, `serve.py`: described above.

## The screen

A copy of the chart as it looked on the procedures stack: the patient column on the left, the tooth chart in
the middle (the library's tooth chart, fed the pretend patient's work, so planned and completed work show on
the teeth), the Visit panel with its Worklist on the right, and Recommended Treatment, Clinical History and
Treatment Plans under the chart. Billing in the left column opens the ledger. Everything is invented: the
patient is "Maria Lopez", and the coworker in the failure scenarios is "Lisa Chen".

## The nine questions

1. **The Add to plan window.** Today's window, a search-and-pick window like the procedure picker, or plans
   as a table with the chosen plan beside it.
2. **No plan or one plan.** Today's empty window, always offer New plan, or skip the window when there's
   nothing to choose.
3. **The plan buttons.** Icons only, or the words written out.
4. **When a change doesn't save.** An icon in the top bar (today), in the row, in the list's toolbar, or a
   note in the corner.
5. **Failures Retry can't fix** (a coworker changed the fee first). Retry and Dismiss, Dismiss only, or show
   their change with "Use mine".
6. **Completing several when some are missing a fee or provider.** They wait in the list, open each one in
   turn, or get marked in the list.
7. **While a coworker corrects the visit's charges.** Refused, wait in the row, or wait with one line above
   the list.
8. **A status change where one row is already billed.** Leave it out, open its charge correction, or one
   short review window.
9. **Which list the W key uses.** Nothing on screen, a small W on the button, or a blue line on the list.

Each has a scenario in the menu at the top, and picking an option plays it.

## How it turned out

The owner picked on all nine in one sitting, mostly with comments. What the next round did with them:

- **Add to plan** became a searchable plans table on the library's data grid. One click on a plan adds the
  work to its last phase (change it later in the plan). New plan moved to the window's footer, and the
  "Goes into ..." and "already presented" lines went away. Round two then asked only how to organise the
  table, and the owner picked newest plans first.
- **Failed saves:** the orange icon in the row stayed, moved tight against the status circle, and its hover
  became the design system's tooltip (click the icon to retry). That was a round-two question too.
- **The coworker conflict** became "the latest change wins for both, like Google Docs", with no error at
  all, after the owner called the round-one options overcomplicated.
- **Everything else** was built in as picked: plan buttons stay icons, completing several opens each skipped
  one in turn, a change made during a coworker's correction waits in its row with a clock, a status change
  with billed rows asks once and shows the minus entry, and nothing marks which list W uses.

- **A third, smaller round** came from the owner seeing the table in a review slideshow: the same work can belong
  in two plans, so rows got tick boxes with an "Add to N plans" button, New plan moved beside the search, and the
  "2 of 2 plans" count went away. (This reference copy is the round-one version; the later rounds aren't in it.)

Two short rounds settled what a long decision deck hadn't: nine questions, with the owner's own notes
shaping the redesigns, in about an hour of their time.
