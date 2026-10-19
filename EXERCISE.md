# The exercise: the appointment panel, check-in and check-out

## The setting

It's 10:40 on a Friday morning at Bayview Family Dental. Four chairs are running, the phone keeps ringing, and one
person at the front desk is greeting patients as they walk in and taking payments as they leave. Everything they do
starts from the day schedule: they click an appointment, a panel slides in from the right, and they act from there.

Three moments matter most:

1. **Looking at an appointment.** Who is this, what are we doing today, and is anything going to go wrong (an unsigned
   form, insurance that isn't verified, a balance, a medical alert)?
2. **Checking a patient in.** They're at the desk. Make sure we can treat them and bill for it: details, insurance,
   forms, alerts, what they'll owe, and telling the clinical team they're here.
3. **Checking a patient out.** The visit is done. Confirm what was done, collect what's owed, and book what's next.

## Your task

Design how these three moments should work, as a clickable prototype built on Asha's design system:

- **The appointment panel** that opens when you click a card on the schedule.
- **The check-in flow** that starts from it.
- **The check-out flow** that starts from it.

Today's design for all three is in the library (`docs/design-system/index.html`, Schedule and Billing groups), and the
starter shows it under "Today's panel". You can improve it or start over; either way, tell us why.

We care most about:

- **The front desk's real day.** Fast for the common case, no dead ends for the messy ones. Use the scenarios in the
  starter's menu: premedication, unsigned forms, a walk-in with no insurance, a family balance, a declined card.
- **Judgment.** What goes on the main surface, what's one click away, and what you left out.
- **Fit.** It should look like it came out of the design system: its components, its density, its rules.
- **How you work with Claude Code.** Use the skills in `.claude/skills/`, steer it, check what it produces.

## How to start

```bash
cd prototypes/appointment-flow
python3 build.py && python3 serve.py 18791 .     # then open http://127.0.0.1:18791/
```

The starter draws the real day schedule. "Your design" opens `yourFlyout()` in `src/proto-app.js`, which only lists
the visit's raw data; that's where your design goes. The data for each visit is described at the top of
`src/proto-data.js`; add to it whatever your design needs. Read `.claude/skills/asha-prototype/SKILL.md` for how we
build prototypes (one screen, scenarios, design questions with options you can play).

## What to bring back

- The prototype, committed, with a short `NOTES.md` in its folder: the decisions you made, the options you rejected,
  and what you'd ask the front desk if you could.
- Be ready to walk us through one scenario end to end.
