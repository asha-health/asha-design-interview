---
name: asha-prototype
description: >
  Build a clickable prototype of a real Asha screen, on made-up data, so the person deciding can try each
  design and product option instead of reading about it. Picking an option plays a step-by-step walkthrough
  on the screen; picks and comments save to answers.json beside the page; the next round builds the picks in and asks
  only what's left. Use when a decision deck or design round isn't enough to decide, when several open
  questions touch the same screen, or when someone says "let me try it", "make a prototype", "walk me
  through the scenarios".
  Start it whenever someone names it, for example "run asha prototype", "use the asha prototype skill", even in the middle of a sentence.
---

# Asha Prototype

Sometimes a slide with three pictures isn't enough to decide. The person has to *do* the thing: tick two
fillings, press the button, see what opens, notice it took four clicks. This skill is how we give them that.

You build one page that looks like the real screen, fill it with invented patients, and turn every open
question into a few options they can switch between. When they pick an option, the page plays it for them
step by step, right on the screen. They pick, write a comment, and you build the next round from what they
said.

Start from `prototypes/calendar/` (at the repo root): a small starter with the library's calendar, clickable
events and a save-ready `serve.py`, with no questions yet. You build the question panel and walkthrough player.

`asha-design-experimentation` is still the right tool when the question is only how something looks and
pictures side by side settle it. Reach for a prototype when the question is how something *behaves*: what
happens after the click, what a coworker's change does, what a failure looks like, how many steps a job takes.

## What actually helped the owner decide

These are the things that turned "I can't tell from this" into quick, confident picks. Keep all of them.

**It looked like our real screen, not a sketch of it.** The first version was a generic layout with the
right pieces in the wrong places, and the owner said it was hard to choose because it didn't match the rest
of the app. Once it had the real patient column on the left, the real tooth chart in the middle, the Visit
Worklist on the right and the same tables underneath, the options suddenly made sense. So before you draw
anything, open the live screen (or a recent screenshot of it) and copy its layout, column widths, labels and
wording. Then draw it with the design-system library's own code (`docs/design-system`): its data grid for
tables, its procedure picker for search-and-pick windows, its tooth chart (which is the app's own tooth art),
its menus, dialogs, tooltips and alerts. A hand-made list next to real components looks wrong immediately,
and the owner noticed every time.

**Picking an option plays it.** This was the biggest win. Tapping option B doesn't just change a picture: the
screen resets to that scenario and walks through it. A ring goes around the real button, a short caption says
what's happening in plain words ("Press Add to plan. It opens a window with the cursor in the search."), and
pressing Next presses the button for them. The last step says how it ended, with the honest catch and, where
it matters, the click count ("Adding them took 2 clicks"). Comparing A and B then takes a minute.

**Next and Back, never a timer.** The first walkthroughs advanced on their own and the owner asked for Next
and Back buttons instead. People read at different speeds and want to look around. Back has to really go
back: rebuild the screen up to the previous step, so a window that was open is open again. The arrow keys
should work too.

**It fits on one screen.** Scrolling the page to find the button the caption is talking about kills the flow.
Size the frame to the window like the real app: the side columns stay put and only the middle scrolls, and
the walkthrough scrolls that middle for you. Don't offer an "actual size" mode that makes the page scroll.

**The question panel stays out of the way.** A fixed panel ate a third of the screen. What worked was a
floating panel they can drag anywhere, fold down to its header, flip to the other side, or close. It hides
itself while a walkthrough plays and comes back at the end.

**One question at a time, and it's obvious how many there are.** The owner once asked "are there more
questions, or do I not know how to navigate this?" because the rest were folded away below the first. Show
"Design question 3 of 9 · 2 picked", numbered buttons to jump, a check on answered ones, and a "Next
question" button at the bottom.

**Today first, one recommendation, Dentrix Ascend inside it.** Same rules as our decision decks: today's
behaviour is option A, exactly one option is tagged Recommended, and what Dentrix Ascend does goes in that
option's own sentence ("Same as Dentrix Ascend's Move To menu: ..."). No separate Dentrix or "why" boxes.
Every option gets its catch, your favourite included.

**Scenarios cover the messy days, not just the happy one.** A typical case, an empty one (no plan yet), a
crowded one (twelve plans with long names, so search matters), and the failures: the connection drops, a
coworker changes the same fee first, a coworker is correcting the visit's charges. The failures are where
the real design questions were.

**Their choices on other questions are respected, and you say when you can't.** Sometimes one pick makes
another option impossible to show (a single "Treatment plan" button means today's window never opens). Then
the walkthrough borrows a compatible setting for that run only and says so on its caption ("For this
walkthrough: plan buttons as icons"). Never change their saved pick behind their back.

**Picks and comments are saved where the next round can read them.** Each question has "Pick the one showing"
and a comment box. Served with `serve.py`, they save to `answers.json` next to the page, so nobody has to retype a
decision in chat, and you read `answers.json` for the next round. Opened as a plain file, they stay in the browser.

**Already-decided things are built in and playable.** Decisions from earlier decks aren't switches; the
prototype just behaves that way, and a short list says so. In later rounds, each earlier pick gets a Play
button so they can watch the finished behaviour.

## The nits that mattered

The owner caught these by using it. Most of them will apply to your screen too, so check before you show it.

- No list drops down from a toolbar button. Our toolbars don't do that anywhere, so it read as
  inconsistent. A button opens a window, or it acts.
- When the user might have many of something (plans, patients, codes), the picker is a window with a search
  box and the library's data grid or procedure picker, not a short menu.
- Don't stack extra lines above or below the main content: no "Goes into ..." summary, no "already
  presented, present it again" warning, no "New plan" row on top of the list. Put a secondary action like
  New plan in the window's footer, and show the destination in a table column ("Adds to") instead.
- Choose a sensible default instead of asking. Clicking a plan adds the work to its last phase; the phase
  can be changed later in the plan. One click beats two choices.
- Ask whether the work could go to more than one place. A procedure can sit in two treatment plans (alternate
  cases), so the plans table got tick boxes and an "Add to 2 plans" button instead of click-to-add.
- Put the window's secondary action beside its search box ("New plan" next to "Search plans"), not in a row
  above the list or alone in the footer.
- Drop counts that repeat what's on screen. "2 of 2 plans" next to a table of two plans was noise.
- Never write "her", "she" or "he" for the patient (or anyone else) in captions, steps or slides. Use the
  name or "the patient".
- Hovering an alert icon shows the design system's tooltip. A big custom popover looked foreign.
- Keep an icon tight against the thing it belongs to (the orange failed-save icon sits right next to the
  status circle, not a gap away).
- Simpler conflict handling beats clever conflict handling. For two people editing the same fee, the owner
  pointed at Google Docs: the latest change wins for both and nobody sees an error.
- Saves should be fast enough that "waiting" states are rarely seen. Design them, but don't make them loud.
- No floating "2 selected" bar; the toolbar above the list is always there and greys out until rows are
  ticked.
- Captions in plain words for an office manager. Name the button the way it's labelled on screen.

## How to run a round

### 1. Gather the questions and the screen

Collect the open questions from wherever they live (a decision deck, review notes, the chat), and cut any
that pictures already settle. Each question needs real alternatives and someone's day riding on it. Then
look at the screen they're about (in this repo, the closest components in `docs/design-system/index.html`) and note exactly what's where. Write both down in chat, briefly, before you build.

### 2. Build the page

Start from `prototypes/calendar/` and add the floating question panel, the walkthrough player and saving picks.

- **Data file.** The questions (each with options, today first, one `rec`), the scenarios (each with plain
  steps and the questions it's for), and the already-decided list. Invent every name and number; no real
  patients, ever.
- **App file.** The screen, drawn with the library's code; the actions (what each click does to the
  invented data); the failures the scenarios need; and one walkthrough per question, written as steps:
  which element to ring, what the caption says, what to press.
- **Build.** `python3 build.py` pulls in the library from this repo and writes one self-contained
  `index.html` in `prototypes/<name>/`. `serve.py` serves it and saves picks to `answers.json` there.

### 3. Check it yourself before you share it

- Play every option of every question to the end with Next only, and check the end state, not just the
  last caption. A step that couldn't find its button can still reach "Done", so confirm the work really
  landed (the plan holds the fillings, the ledger has the minus entry).
- Press Back from a few middle steps and from the last step.
- Look at it in the browser at the owner's window size: nothing scrolls the page, captions don't cover the
  thing they point at, no clipped text, no "undefined".
- Close every browser page you opened when you're done.
- If you have no browser tool, say so, and ask the person to open the page and tell you what they see.

### 4. Share it

Give the link or file path and a short reply: what's in it, how to use it in two lines, and the open questions as a numbered list with your
recommendation for each.

### 5. Read the picks and run the next round

Read `answers.json`. Say in chat how you read each pick, especially when a comment and a pick pull in
different directions (the owner picked "always offer New plan" and also wrote "don't put New plan above the
list"; we read that as "New plan in the footer" and said so). Then:

- build the picks in as fixed behaviour, with a Play button for each;
- drop the options that lost, and don't offer them again;
- turn each comment that asks for something new into a new question with honest options (still today first,
  one recommendation);
- keep a backup copy of the page each round, and update the same link so their bookmarks keep working.

When nothing is open, the panel says "Every design question is decided" and lists the finished behaviours to
play. Then the picks go into the real code through the normal build skills, and the prototype becomes the
reference the reviewers compare against.

## Things to avoid

- Starting from a blank layout instead of the live screen.
- Drawing tables, pickers or alerts by hand when the library has them.
- Timers in walkthroughs, page scrolling, or a panel that permanently takes screen space.
- Treating silence as a pick. Unanswered questions stay open.
- Using real patient data, or anything that talks to Asha. The prototype is pretend all the way down.
