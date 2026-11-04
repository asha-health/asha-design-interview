# Asha UX principles

These are the ways of thinking we use when we design an Asha screen. (Internally they also live in a slideshow with
before-and-after screenshots; this copy has the text only.)

They came from the owner's design reviews across 16 projects (Oct 5–9, 2026) and were then checked against standard
UX practice. Read them as a way of thinking, not a checklist. Each one has a strength:

- **Hard:** break it only with the owner's explicit OK.
- **Default:** follow it unless the design pick says why not.
- **Judgment:** show options in a design experiment and let the user pick.

The big idea underneath almost all of them: the main surface belongs to the jobs staff do most often, and everything
else stays possible, one click away. When something is broken, fix it rather than explain it on screen.

## The principles

1. **When something in our system is slow, stale or broken, fix it where it happens; show its status only when it
   changes what staff should do or trust.** (Default)
   Showing system status is good practice when it affects the person's next decision, but a message about our own
   housekeeping that staff can't act on just hands them our problem. Example: the Claims list warns "Filing deadlines
   are refreshing for 151 claims…". The refresh should keep the counts right quietly instead.

2. **When one fact changes, expect every screen that depends on it to update on its own, unless someone already
   agreed to the old number.** (Default)
   Staff can't know which screens hold an old copy, so a manual refresh gets forgotten and wrong amounts reach
   patients. Example: change a patient's benefits once and every working estimate follows. A plan the patient already
   signed keeps its numbers and offers one Update instead.

3. **When deciding what earns the main surface, start from the most frequent jobs and keep the rest one click
   away.** (Default)
   Space and attention are limited, and every extra item slows the common path. Rare actions and reference text go
   behind a ⋯ menu, a hover or a "More details" section. Example: staff open a treatment plan mostly to build,
   present, send or schedule it; Recalculate and the "tentative" note can live behind ⋯ or a hover.

4. **When something needs attention, match its color and weight to how serious it is.** (Default)
   If every alert is orange, none of them stands out and staff learn to ignore it. Information is grey or waits for a
   hover, orange is for what staff must act on now, and red is for things that failed. Example: main puts an orange
   triangle on every provisional or out-of-date estimate.

5. **When a table cell starts collecting alerts, links and captions, consider moving them to an outline, a hover or
   the row's menu.** (Default)
   Staff scan down columns, and one-off extras break the scan. A cell can still pair a value with a quiet second line
   when every row has one. Example: main's treatment plan fits the code, an Edit link, the tooth, a material tag and a
   pencil into one cell.

6. **When the same element or information hierarchy appears on more than one screen, consider making it consistent
   and building it once as a shared component.** (Default)
   Staff learn a pattern once and use it everywhere, and building it once keeps it that way: a fix lands on every
   screen and copies can't drift apart. Example: the appointment panel and the claim panel open with two different
   patient headers today.

7. **When a job already has a control somewhere in the app, reuse that control and its placement before inventing
   one.** (Default)
   A familiar control in a familiar place needs no learning. Inline add-rows are a fine pattern in general; what
   matters is picking one and keeping it. We picked an Add button at the top right. Example: adding a procedure to a
   treatment plan should use the shared Add procedure window, not a side list with + buttons.

8. **When two actions share a name but not a job, let the job decide the pattern.** (Judgment; refines 7)
   Consistency serves the task, not the word. Example: on a claim, Add procedure has to pick charges already posted,
   so it opens the ledger picker, not the Add procedure window.

9. **When staff already know a real-world document, consider following its order while using plainer words.**
   (Default)
   Matching what they already know means nothing to translate. Example: billers learned EOBs on paper, so the EOB tab
   reads top to bottom in that order.

10. **When a step ends in an action, place that action right after the content it acts on.** (Default)
    A button takes its meaning from what sits right above it. Example: check-in put Next visit between the payment
    and the Charge button.

11. **When labeling a fact, prefer the words an office manager uses about the record over how our system stores
    it.** (Default)
    Staff think in claims, payers and dates, not lifecycles and validation states. Example: the claim header says
    "Creation history not recorded" and "Validation Needs Review".

## Rules about how we build (Hard)

- **The approved design is the contract.** The built screen matches the pick, screenshot for screenshot. Anything the
  pick doesn't show stays as it is on main.
- **Never lose what main can do.** Before redesigning a screen, list everything it has on main and account for each
  piece.
- **Never block staff, and never answer that with more text.** Prevent the problem first, then save and correct it
  quietly, and show guidance only in a design the user approved. Refusals are only for security, practice and
  permission checks.

## Smaller rules

- Everything starts on the same left edge.
- Nothing jumps: selecting a row never resizes it, and clicking outside clears the selection.
- Hover cards sit beside what they describe, never over it, and don't hold the main actions.
- Fields behave like every other text field: clicking puts the cursor where you clicked.
- What the header selects is what the body shows. Families are a normal case in every check-in, checkout and claim
  design.
- Steps and buttons have names that say what they do.

## Still to settle

The deck's "Four contradictions" slide lists places where older guidance disagrees with these principles (orange row
marks, box numbers on the Claim tab, the "one quiet line of guidance" rule, and totals rows). Until they're settled,
ask rather than pick one quietly.

## Using these

Check your design against these principles the same way you check it against the design system. If you break a
principle on purpose, say which one and why.

Sometimes feedback will make you think there's a new principle here, something that should change how many
screens get designed, not just the one in front of you. Don't add it yourself; ask the person driving the chat
first. One-screen fixes and matters of taste don't need a principle.
