# Asha UI Craft, Motion, And Micro-interactions

Use this reference for changed motion, interaction continuity, or an explicitly
requested visual craft audit. Inspect only sections relevant to that change. Asha's target feeling is calm confidence:
fast, clear, precise, and predictable. Delight comes from friction disappearing,
not from decorative effects competing with clinical or revenue-cycle work.

## 1. Decide Whether Motion Earns Its Time

Every motion needs one purpose: orient spatially, preserve continuity, explain a
state change, acknowledge input, or prevent a jarring change.

| Frequency | Default |
|---|---|
| Constant / keyboard-heavy / repeated all day | Instant or nearly instant; no ornamental entrance |
| Frequent row, tab, filter, or navigation action | State feedback only; minimize travel and delay |
| Occasional dialog, sheet, popover, or toast | Short standard transition |
| Rare onboarding or completion moment | Restrained delight only when it cannot obscure safety or next steps |

Rules:

- Never delay input handling until motion finishes. Keyboard and pointer actions
  remain immediately usable.
- No bounce, celebration, parallax, shimmer, or ambient motion on claims,
  payments, clinical safety, permissions, errors, or destructive actions.
- If motion has no user benefit, delete it. More motion is not more modern.
- A frequent interaction should feel faster after motion is added, not slower.

## 2. Asha Motion Defaults

Nearest canonical Asha primitive may override these values. Centralize repeated
values in Layer 1 tokens; do not invent per-screen curves.

| Interaction | Duration | Easing / behavior |
|---|---:|---|
| Press feedback | 100–160ms | responsive ease-out; subtle and optional |
| Tooltip / small popover | 120–180ms | ease-out from trigger origin |
| Dropdown / select | 160–220ms | ease-out; exit equal or faster |
| Dialog / sheet / drawer | 180–240ms | crisp ease-out; no bounce |
| Existing element relocating | 180–240ms | ease-in-out |
| Color / opacity feedback | 120–200ms | ease |
| Spinner / indeterminate progress | continuous | linear |

- Prefer explicit `transform` and `opacity` transitions. Never use
  `transition-all`; name only properties that should move.
- Avoid animating layout on every frame. A measured height transition may be
  justified for disclosure, but it must preserve nearby layout, remain
  interruptible, and pass a performance feel check.
- Entry starts near the final geometry; never make operational UI appear from
  `scale(0)`. Use a subtle offset/scale plus opacity only when it clarifies
  origin.
- Trigger-anchored content uses the primitive's trigger-aware transform origin.
  Centered dialogs remain centered.
- Enter and exit use the same spatial path. Exit is usually equal or faster.
- Use transitions for rapidly reversible UI. Use springs only for genuine
  drag/swipe/gesture physics and preserve current position/velocity on reversal.
- CSS is preferred for predetermined motion. JavaScript motion must be justified
  by dynamic geometry, gesture input, or interruption requirements.

## 3. Reduced Motion And Input Modes

- `prefers-reduced-motion` removes translation, scale, parallax, overshoot, and
  large spatial movement. Keep short opacity/color feedback when it aids
  comprehension; reduce or replace continuous rotation with a static/bounded
  progress treatment when feasible.
- Motion never carries meaning alone. Status, selection, error, and completion
  need visible text/icon/shape plus a programmatic name, role, value, or state.
- Hover-only behavior is never the sole affordance. Gate hover motion to hover-
  capable fine pointers and provide equivalent focus, keyboard, and touch states.
- Test focus-visible rings, pressed/selected states, touch targets, Escape,
  cancel, and focus restoration after overlays close.

## 4. Micro-interaction Contract

For every interactive control, verify the applicable parts of the loop:

`idle → hover/focus → pressed → pending/selected → success/error → restored`

- Feedback begins with the input; do not wait for the network response to show
  that Asha heard the user.
- The component that owns the action owns its visual feedback. Do not duplicate
  pressed, loading, success, or error indicators in parent and child.
- Press feedback is subtle and centrally owned by the Asha primitive. Do not add
  per-screen scale recipes to every clickable row.
- Menus, popovers, dialogs, sheets, and drawers open from a predictable trigger,
  close through button/Escape/outside interaction when safe, and restore focus to
  the trigger—or the next logical target after navigation/removal.
- Selected and disabled states remain legible without hover. Disabled controls
  explain the blocker when the next step is not obvious.
- Drag/reorder interactions need pointer capture, a clear drop target, keyboard
  alternative, stable order feedback, cancellation, and touch-safe behavior.
- Tooltips supplement visible labels. Delay may prevent accidental activation;
  adjacent tooltip behavior belongs to the shared primitive, not each screen.

## 5. Optical Craft Pass

Inspect at normal size; add high-zoom checks when text scaling, clipping, or accessibility is in scope. Small issues count when they damage trust,
scanability, accessibility, or consistency; consolidate symptoms by root cause
instead of reporting a pixel-nit dump.

Check:

- optical alignment, text baselines, icon centering, icon stroke/size consistency;
- heading/body/helper rhythm, wrapping, orphaned words, capitalization, numbers;
- long names, currency, dates, status labels, truncation, and reveal-on-hover/focus;
- one spacing owner; no parent gap plus child margin accumulation;
- border joins, corner continuity, divider endings, shadows, and nested surfaces;
- sticky headers/footers, scrollbars, clipped focus rings, scroll-edge seams;
- overlay edge collisions, viewport breathing room, safe areas, virtual keyboards;
- skeleton-to-content geometry and layout shift during loading/error/success;
- disabled contrast, semantic color, dark mode, high zoom, and large text;
- touch target size and hit-area separation for row actions;
- table density, tabular number alignment, horizontal overflow, and fixed columns;
- one clear focal point; decoration never outranks the staff user's next action.

A craft finding must answer: what is visibly inconsistent, what user consequence
it creates, which Asha token/component/sibling establishes the expected result,
and how it will be proven.

## 6. Temporal Evidence

Static screenshots prove stable states, not feel. When motion or interaction
continuity changes, record at least one of:

- a short screen recording tied to route/state/viewport;
- frame-by-frame or slow-motion inspection notes;
- timestamped before/after interaction observations;
- deterministic tests for focus restoration, reduced motion, state ownership,
  or interruption, plus a browser feel check.

Compare the same route, role, data state, browser tier, and viewport. Prefer
synthetic/test data and de-identify PHI before evidence leaves an approved secure
environment. Raw PHI requires explicit approval and an authorized destination.
A source-only motion claim is `UNRENDERED`, not verified.

## Asha-Specific Rejections

Do not import generic design trends as defaults:

- no glass/translucent chrome, 3D effects, decorative blur, bounce, or stagger
  without a concrete Asha workflow reason;
- no universal scale-on-press rule in screens; shared primitives own feedback;
- no absolute “transform/opacity only” claim when accessible disclosure requires
  measured layout, but performance and stability must be proven;
- no motion polish that weakens safety, contrast, information density, or speed;
- no source-only audit replacing rendered Asha QA.
