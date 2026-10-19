/* Procedures prototype, round 1: the open design questions, the scenarios and the invented patient.
 * Everything here is made up (Maria Lopez is not a real patient). Question ids and option keys are saved to the
 * answers.json, so never rename them once shared. Option 0 is always today. */
(function () {
  const Q = [
    { id: "add-to-plan", short: "The Add to plan window",
      q: "You press Add to plan. What should the window look like?",
      hint: "Decided Oct 10: it opens a window with search, since a patient can have many plans (no list dropping from the toolbar).",
      opts: [
        { k: "today-window", n: "Today's window", t: "Search, pick a plan, then pick its phase in a second box, then Add. Easy to leave Phase 1 by mistake." },
        { k: "phase-rows", n: "Like the procedure picker: search, then click the phase", rec: true, t: "The same window as Add procedure: type to search, results grouped by plan with each phase as a line, arrow keys and Enter work. One click adds. The catch: you don't see what's already in the plan." },
        { k: "plan-preview", n: "Plans as a table, the chosen plan beside it", t: "The plans in a data grid with a search; click a row and its phases and work show on the right, each with Add here. Best for checking what's there; a wider window and one more click." }
      ] },
    { id: "none-or-one-plan", short: "No plan or one plan",
      q: "What should Add to plan do when there's no plan yet, or only one?",
      hint: "Try the scenarios \"No plan yet\" and \"Only one plan\".",
      opts: [
        { k: "today-window-empty", n: "The same window; empty when there's no plan (today)", t: "With no plan the window only says there's nothing to pick, with a Create button. With one plan you still pick it." },
        { k: "always-list", n: "The window always offers New plan first", rec: true, t: "\"New plan with these 2\" is the first choice in the list, with or without plans, so starting an alternate plan is always one click from the same place." },
        { k: "skip-when-obvious", n: "Skip the window when there's nothing to choose", t: "No plan: a new plan opens. One plan: one click adds straight in. Easy to miss when you meant a new alternate plan." }
      ] },
    { id: "plan-buttons", short: "The plan buttons",
      q: "In the toolbar, how should the two plan buttons look?",
      hint: "Both open something (a new plan, or the Add to plan window); neither drops a list.",
      opts: [
        { k: "icons-today", n: "Icons only, names on hover (today)", t: "Staff hover to tell the folder from the clipboard." },
        { k: "two-worded", n: "New plan and Add to plan in words", rec: true, t: "Written out in the same toolbar line, so nobody has to hover to find them." }
      ] },
    { id: "failed-save", short: "When a change doesn't save",
      q: "When a change to a procedure doesn't save, how should staff find out?",
      hint: "Your Sep 28 rule says show it where it happened; your Sep 27 rule says no new orange icons without a design round. This is that round.",
      opts: [
        { k: "top-bar", n: "An orange icon in the top bar (today)", t: "The row goes back quietly; the failure waits under the icon at the top with Retry. Easy to miss which row it was." },
        { k: "in-row", n: "An orange icon in the row", rec: true, t: "The row goes back and a small orange icon sits at its end. Hover it for what happened, Retry or Dismiss. You see exactly which row." },
        { k: "in-toolbar", n: "An orange icon in that list's toolbar", t: "One icon at the end of the toolbar of the list where it happened, listing every failure there. Fewer icons, one hover further from the row." },
        { k: "corner", n: "A note in the top-right corner", t: "A short note with Retry slides in at the window corner and leaves after 8 seconds. Hard to miss, but gone if you look away." }
      ] },
    { id: "cant-retry", short: "Failures Retry can't fix",
      q: "When a coworker changed the same thing first, what should you be offered?",
      hint: "Try \"A coworker changed the fee first\". It shows where the picture above puts failures.",
      opts: [
        { k: "retry-dismiss", n: "Retry and Dismiss (today)", t: "Retry is offered but fails again, because the fee already changed." },
        { k: "dismiss-only", n: "Only Dismiss, with the reason", t: "No button that can't work. You still have to open the procedure to see what the coworker set." },
        { k: "show-theirs", n: "Show their change, with Use mine", rec: true, t: "The row shows the coworker's fee and the note says who set it. Use mine puts yours back in one click, so nothing is lost." }
      ] },
    { id: "skipped-complete", short: "Completing several, some skipped",
      q: "You mark four completed, but two still need a fee or a provider. What happens to those two?",
      hint: "Try \"Complete four; two are missing something\". Completing never guesses a fee or provider.",
      opts: [
        { k: "wait-in-list", n: "They wait in the list (today)", t: "The button's tip names them before you click. They stay Planned; you open each one later. Easy to forget them." },
        { k: "open-each", n: "Open each one in turn", rec: true, t: "Right after, a small window asks for the missing fee or provider, \"1 of 2\", with Skip. You finish the job while it's fresh." },
        { k: "mark-rows", n: "Mark them in the list", t: "They stay Planned with grey \"Needs a fee\" in the row and an orange dot. Click it to fill it in when you're ready." }
      ] },
    { id: "wait-lock", short: "While a coworker corrects charges",
      q: "A coworker is correcting today's visit charges. What happens to a change you make meanwhile?",
      hint: "You picked \"wait, then go through\". This is how it looks. Try \"A coworker is correcting today's charges\".",
      opts: [
        { k: "refused", n: "Refused, redo it later (today)", t: "A pop-up says the visit has an active correction and the row goes back. You have to remember to redo it." },
        { k: "wait-in-row", n: "It waits in the row", rec: true, t: "The row shows your change with a small clock. Hover: waiting for Lisa to finish. It goes through on its own." },
        { k: "wait-banner", n: "It waits, with one line above the list", t: "One grey line says Lisa is correcting charges and how many changes wait. Rows look normal." }
      ] },
    { id: "billed-status", short: "Status change with billed rows",
      q: "You mark three referred, but one is already on the bill. What should happen to that one?",
      hint: "Try \"Refer three; one is already billed\".",
      opts: [
        { k: "leave-out", n: "Leave it out; the tip says so (today)", t: "The two others change. The button's tip says the billed one has a posted charge. You correct its charge yourself later." },
        { k: "open-correction", n: "Open its charge correction right after", t: "The two change, then the charge correction opens for the billed one. Can rush staff through a money change." },
        { k: "one-review", n: "One small review, then all three", rec: true, t: "A short window lists the billed one and the −$75 entry it would add. Refer all 3 or just the other 2. Done in one place." }
      ] },
    { id: "w-cue", short: "Which list W uses",
      q: "Should the screen show which list the W key will add to the Visit Worklist from?",
      hint: "Try \"The W key with two lists ticked\".",
      opts: [
        { k: "no-cue", n: "Nothing on screen (today)", t: "W uses the list you touched last. Usually what you expect, but nothing says so." },
        { k: "key-badge", n: "A small W on that list's button", rec: true, t: "A W key mark sits next to Add to Visit Worklist on the list W will use, and moves when you tick in another list." },
        { k: "blue-line", n: "A blue line on that list", t: "The list W will use gets a thin blue line along its top. Easy to see, but it looks like a selected tab." }
      ] }
  ];

  /* Already decided on Oct 10; the prototype behaves this way and these aren't switches. */
  const DECIDED = [
    "A procedure can sit in two plans; adding it to a second plan works from every button.",
    "The plan builder uses the same procedure (no copies), so completing it in one plan completes it in both.",
    "Undoing work from a closed day adds a minus entry today; the closed day's total never changes.",
    "Lowering a fee that was already paid turns the extra into patient credit.",
    "Marking a just-billed exam Not performed takes the charge off on the first click.",
    "Removing planned work from the chart takes it off every plan too.",
    "C and W do nothing while their list is hidden (try the Perio Chart tab).",
    "The Priority menu is gone."
  ];

  const SC = [
    { id: "two-plans", group: "Treatment plans", name: "Add two fillings to a plan Maria already has", qs: ["add-to-plan", "plan-buttons"],
      steps: ["Two fillings are ticked in Recommended Treatment.", "Press Add to plan and put them in \"Root canal and crown #19\", Phase 2.", "Open the Treatment Plans tab to see them there."] },
    { id: "no-plan", group: "Treatment plans", name: "No plan yet", qs: ["none-or-one-plan", "add-to-plan"],
      steps: ["Maria has no treatment plans.", "Press Add to plan with the two fillings ticked and see what you get."] },
    { id: "one-plan", group: "Treatment plans", name: "Only one plan", qs: ["none-or-one-plan", "add-to-plan"],
      steps: ["Maria has one plan.", "Press Add to plan with the two fillings ticked."] },
    { id: "five-plans", group: "Treatment plans", name: "Twelve plans, long names", qs: ["add-to-plan"],
      steps: ["Maria has twelve open plans, some with long names and several phases.", "Press Add to plan and type \"implant\" in the search.", "Add the fillings to Phase 3 of the implant plan."] },
    { id: "shared-crown", group: "Treatment plans", name: "A crown that's already in another plan", qs: ["add-to-plan"],
      steps: ["The crown on #3 is ticked. It's already in \"Upper crowns #3 and #14\".", "Add it to \"Root canal and crown #19\" too (decided: allowed).", "Open both plans from Treatment Plans: the same crown is in each.", "Then tick it here and mark it completed: both plans show it done."] },
    { id: "complete-missing", group: "Visit Worklist", name: "Complete four; two are missing something", qs: ["skipped-complete"],
      steps: ["Four procedures are ticked in the Visit Worklist.", "The filling on #30 has no fee and the limited exam has no provider.", "Hover Mark completed, then press it (or press C)."] },
    { id: "net-drop", group: "Visit Worklist", name: "The internet drops while you change something", qs: ["failed-save"],
      steps: ["Your next change won't reach the server.", "Mark the bitewings referred: click the circle at the end of its Visit Worklist row, or tick it and use the toolbar.", "Watch where the failure shows, then press Retry (it works this time)."] },
    { id: "coworker-fee", group: "Visit Worklist", name: "A coworker changed the fee first", qs: ["cant-retry", "failed-save"],
      steps: ["Click the filling on #30 in the Visit Worklist to open it.", "Change the fee from $225.00 to $200.00 and save.", "Lisa Chen set it to $210.00 a moment earlier on another computer. See what you're offered."] },
    { id: "lock", group: "Visit Worklist", name: "A coworker is correcting today's charges", qs: ["wait-lock"],
      steps: ["Lisa Chen is correcting today's visit charges for the next 15 seconds.", "Mark the cleaning completed, or change a provider.", "Watch what happens until Lisa finishes. Restart from the scenario menu."] },
    { id: "billed-status", group: "Visit Worklist", name: "Refer three; one is already billed", qs: ["billed-status"],
      steps: ["The exam was completed and billed earlier today. Three rows are ticked in the Visit Worklist.", "Hover Mark referred in its toolbar, then press it."] },
    { id: "w-key", group: "Keys", name: "The W key with two lists ticked", qs: ["w-cue"],
      steps: ["A filling is ticked in Recommended Treatment, and the plan beside it has the crown ticked.", "Tick or untick something in either list and watch the cue.", "Press W: the ticked work from that list joins the Visit Worklist."] },
    { id: "closed-day", group: "Already decided", name: "Undo an exam from a closed day", qs: [],
      steps: ["Open Clinical History. The Oct 5 exam is on a closed day (the office already counted Oct 5).", "Change its status to Planned.", "Open Billing (left column) to see the ledger: Oct 5 keeps +$75.00 and today gets −$75.00."] },
    { id: "paid-lower", group: "Already decided", name: "Lower a fee that was already paid", qs: [],
      steps: ["Open Clinical History and click the filling on #20 ($200.00, paid in full).", "Lower the fee to $150.00 and save.", "Open Billing (left column): the extra $50.00 is patient credit."] },
    { id: "just-billed", group: "Already decided", name: "Not performed on a just-billed exam", qs: [],
      steps: ["The exam was billed seconds ago at the front desk.", "Click the circle at the end of its Visit Worklist row and choose Mark not performed.", "Open Billing (left column): the $75.00 came off on the first click with a −$75.00 entry."] },
    { id: "perio", group: "Already decided", name: "C and W while the list is hidden", qs: ["w-cue"],
      steps: ["Two fillings are ticked in Recommended Treatment.", "Switch to the Perio Chart tab and press W or C: nothing happens.", "Switch back and press W: they join the Visit Worklist."] }
  ];

  window.PROTO_DATA = { Q, DECIDED, SC };
})();
