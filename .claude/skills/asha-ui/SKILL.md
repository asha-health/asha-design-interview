---
name: asha-ui
description: >
  Use for any Asha screen, mock or prototype in this repo. Apply the Asha design
  system (docs/design-system): its principles, foundations, components, blocks and
  kit.js recipes; reuse before drawing anything new; keep what you draw accessible
  and honest about loading, empty and error states.
---

# Asha UI

## Scope

Use whenever you draw or change something someone will look at: a mock, a prototype, a block. In the production
Asha repo this skill also governs the React component library; this repo has no production app, so the design
system library is the whole reference.

## Canonical visual reference

Read [the design-system guide](references/design-system.md), starting with
[its principles](references/design-system.md#0-the-principles-read-these-first), and open
`docs/design-system/index.html` in a browser before designing. It opens on v4, the version we follow; "Highlight
changes" outlines what v4 changed and why.

- Foundations (colour, type, size, density, motion), components and 93 blocks of real Asha screens in 13 groups.
- `docs/design-system/src/kit.js`: the class recipes (`R`) and helpers (`psec`, `metaGrid`, `infoRow`, `Grid`,
  `Sheet`, `Motion`, `toast`, ...). Draw with these, not hand-written lookalikes.
- `docs/design-system/src/data.js`: the shared invented practice (patients, providers, chairs, payers, CDT codes).
- `docs/design-system/INVENTORY.md`: the real labels, columns and statuses each screen uses.
- `docs/design-system/BLOCKS-GUIDE.md`: how blocks are built and the feedback rules behind them.
- `prototypes/kit-extras.js`: pieces the library doesn't have yet (the app's date picker, typed times). Use these
  before drawing your own.

Before choosing a layout, read [information order](references/design-system.md#choose-the-information-order-before-the-layout):
start with the user's most frequent job and entry point. Before you design a screen, read
[UX principles](references/ux-principles.md) and check your design against them. For motion and micro-interactions,
read [craft and motion](references/craft-and-motion.md).

## Build rules

1. Find the closest existing block (look across every group, not just the obvious one) and start from it.
2. Reuse the kit's components and recipes; add a new pattern only when nothing fits, and draw it in the library's
   style.
3. Change only what your design question is about; keep the rest identical to the library.
4. Invent every name and number. Never use real patient data.

## Interaction contract

For the flow you draw, show the states that can actually happen:

- loading, empty and error (an error says what failed and offers Try again);
- pending, success and safe retry;
- disabled, read-only and permission states;
- keyboard and focus, and reduced motion;
- narrow widths for panels, dialogs and tables.

Never block staff. Keep actions available; when data looks incomplete, give compact guidance and an immediate fix
instead of hiding or disabling the action. Confirm only when the person must review a real, consequential choice.

## Check it

Open what you built in a browser and look at it, next to the library block it started from, at the same size. Look
for "undefined", clipped or wrapped text, and anything that contradicts the library. Say what you checked and what you
did not.
