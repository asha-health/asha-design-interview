/* Asha design blend — shared kit (2026-09-25).
 * Colour = Preline (Tailwind 4 blue-600 + gray, soft 100/800 fills, recipes copied from Preline's own
 * button / badge / table markup). Size + finish = shadcn (36px controls, 14px text, 8px corners,
 * hairline shadows, 3px focus halo). Data grid = Attio (column lines, sentence chips, totals row,
 * cell keyboard). House rules from asha-ui settings-kit: one hairline (gray-200/80), status is a dot
 * plus a word, blue = on / the accent, orange = a person must fix this, everything else grey.
 * Every class recipe lives once in R; blocks compose R and the helpers below. All data is invented. */

/* ============================================================ class recipes */
const R = {
  // Lines and surfaces (asha-ui: one hairline, 8px boxes without shadow; 12px only for menus/dialogs)
  line: "border-gray-200/80",
  box: "rounded-lg border border-gray-200/80 bg-white",
  boxMuted: "rounded-lg bg-gray-50",
  frame: "rounded-xl border border-gray-200/80 bg-white shadow-2xs",

  // Buttons — Preline colour recipes, shadcn sizes, asha press feedback
  btn: "inline-flex items-center justify-center gap-x-2 whitespace-nowrap font-medium rounded-lg border cursor-pointer transition-[color,background-color,border-color,box-shadow,transform] duration-100 ease-out motion-safe:active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-blue-600/20 [&_svg]:size-4 [&_svg]:shrink-0",
  lg: "h-10 px-5 text-sm",
  md: "h-9 px-4 text-sm",
  sm: "h-8 px-3 text-[13px] gap-x-1.5",
  xs: "h-7 px-2.5 text-[13px] gap-x-1.5 [&_svg]:size-3.5",
  iconMd: "size-9 !px-0",
  iconSm: "size-8 !px-0",
  iconXs: "size-7 !px-0",
  solid: "bg-blue-600 border-transparent text-white shadow-2xs hover:bg-blue-700 focus-visible:bg-blue-700",
  white: "bg-white border-gray-200 text-gray-800 shadow-2xs hover:bg-gray-50 focus-visible:bg-gray-50",
  soft: "bg-blue-100 border-transparent text-blue-800 hover:bg-blue-200 focus-visible:bg-blue-200",
  ghost: "bg-transparent border-transparent text-gray-800 hover:bg-gray-100 focus-visible:bg-gray-100",
  quiet: "bg-transparent border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-800",
  link: "bg-transparent border-transparent !h-auto !px-0 text-blue-600 hover:text-blue-700 hover:underline underline-offset-4",
  danger: "bg-white border-gray-200 text-red-600 shadow-2xs hover:bg-red-50",
  dangerSolid: "bg-red-600 border-transparent text-white shadow-2xs hover:bg-red-700",
  onDark: "bg-transparent border-transparent text-white hover:bg-white/10",

  // Fields — Preline border/focus colours, shadcn height and halo
  input: "block w-full h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 shadow-2xs placeholder:text-gray-400 hover:border-gray-300 focus:outline-hidden focus:border-blue-500 focus:ring-3 focus:ring-blue-600/15 disabled:opacity-50 disabled:bg-gray-50",
  inputSm: "block w-full h-8 px-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-800 shadow-2xs placeholder:text-gray-400 hover:border-gray-300 focus:outline-hidden focus:border-blue-500 focus:ring-3 focus:ring-blue-600/15",
  inputBad: "block w-full h-9 px-3 bg-white border border-red-300 rounded-lg text-sm text-gray-800 shadow-2xs focus:outline-hidden focus:border-red-500 focus:ring-3 focus:ring-red-600/15",
  textarea: "block w-full min-h-20 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 shadow-2xs placeholder:text-gray-400 focus:outline-hidden focus:border-blue-500 focus:ring-3 focus:ring-blue-600/15",
  search: "block w-full h-8 ps-8 pe-3 bg-gray-100 border border-transparent rounded-lg text-[13px] text-gray-800 placeholder:text-gray-500 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-600/15 focus:outline-hidden",
  select: "inline-flex w-full items-center justify-between gap-x-2 h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 shadow-2xs hover:border-gray-300 cursor-pointer focus:outline-hidden focus:border-blue-500 focus:ring-3 focus:ring-blue-600/15 [&_svg]:size-4 [&_svg]:text-gray-400",
  selectSm: "inline-flex w-full items-center justify-between gap-x-2 h-8 px-2.5 bg-white border border-gray-200 rounded-lg text-[13px] text-gray-800 shadow-2xs hover:border-gray-300 cursor-pointer [&_svg]:size-3.5 [&_svg]:text-gray-400",
  checkbox: "cbx size-4 shrink-0 rounded-[4px] border border-gray-300 bg-white shadow-2xs cursor-pointer checked:bg-blue-600 checked:border-blue-600 indeterminate:bg-blue-600 indeterminate:border-blue-600 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-blue-600/20",
  radio: "rad size-4 shrink-0 rounded-full border border-gray-300 bg-white shadow-2xs cursor-pointer focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-blue-600/20",
  switchTrack: "group relative inline-flex h-5 w-9 shrink-0 items-center rounded-full bg-gray-200 cursor-pointer transition-colors aria-checked:bg-blue-600 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-blue-600/20",
  switchKnob: "size-4 rounded-full bg-white shadow-sm translate-x-0.5 transition-transform group-aria-checked:translate-x-[18px]",
  label: "text-sm font-medium text-gray-800",
  help: "text-[13px] leading-5 text-gray-500",

  // Type
  display: "text-[32px] leading-tight font-semibold tracking-tight text-gray-800",
  pageTitle: "text-2xl font-semibold tracking-tight text-gray-800",
  sectionTitle: "text-base font-semibold text-gray-800",
  groupTitle: "text-sm font-semibold text-gray-800",
  body: "text-sm text-gray-800",
  secondary: "text-sm text-gray-500",
  caption: "text-xs text-gray-500",
  eyebrow: "text-xs font-medium text-gray-500",
  number: "text-2xl font-semibold tracking-tight tabular-nums text-gray-800",
  numberSm: "text-lg font-semibold tracking-tight tabular-nums text-gray-800",

  // Tags and status — Preline soft badges at shadcn badge size; status is a dot and a word
  tag: "inline-flex items-center gap-x-1 h-[22px] px-2 rounded-full text-xs font-medium whitespace-nowrap",
  tagBlue: "bg-blue-100 text-blue-800",
  tagTeal: "bg-teal-100 text-teal-800",
  tagIndigo: "bg-indigo-100 text-indigo-800",
  tagGray: "bg-gray-100 text-gray-800",
  tagOutline: "border border-gray-200 bg-white text-gray-700",
  status: "inline-flex items-center gap-x-1.5 text-sm text-gray-800 whitespace-nowrap",
  dot: "inline-block size-2 shrink-0 rounded-full",
  count: "inline-flex items-center h-5 min-w-5 justify-center px-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600 tabular-nums",
  countBlue: "inline-flex items-center h-5 min-w-5 justify-center px-1.5 rounded-full bg-blue-100 text-xs font-medium text-blue-800 tabular-nums",
  kbd: "inline-flex items-center h-5 px-1.5 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-500 font-sans",
  flag: "inline-flex items-center gap-x-1.5 text-sm text-gray-500 [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-orange-500",
  delta: "inline-flex items-center h-5 px-1.5 rounded-md bg-gray-100 text-xs font-medium text-gray-600 tabular-nums",

  // Overlays
  menu: "asha-pop w-60 p-1 bg-white border border-gray-200 rounded-xl shadow-xl",
  menuItem: "flex w-full items-center gap-x-2 h-8 px-2 rounded-lg text-[13px] text-gray-800 cursor-pointer transition-colors duration-100 hover:bg-gray-100 focus:outline-hidden focus:bg-gray-100 [&_svg]:size-4 [&_svg]:text-gray-500",
  menuDanger: "flex w-full items-center gap-x-2 h-8 px-2 rounded-lg text-[13px] text-red-600 cursor-pointer hover:bg-red-50 [&_svg]:size-4",
  menuLabel: "px-2 pt-1.5 pb-1 text-xs font-medium text-gray-500",
  menuSep: "my-1 -mx-1 border-t border-gray-200/80",
  popover: "asha-pop bg-white border border-gray-200 rounded-xl shadow-xl",
  dialog: "asha-pop w-[440px] max-w-full bg-white rounded-xl border border-gray-200 shadow-[0_24px_48px_-12px_rgba(17,24,39,0.25)]",
  tooltip: "inline-flex items-center gap-x-2 py-1 px-2 rounded-md bg-gray-900 text-xs font-medium text-white shadow-md",
  toast: "flex items-center gap-x-3 w-[360px] max-w-full py-2.5 ps-3 pe-2 rounded-xl bg-gray-900 text-sm text-white shadow-xl",

  // Navigation
  navItem: "flex w-full items-center gap-x-2 h-8 px-2 rounded-lg text-sm text-gray-700 transition-colors duration-100 hover:bg-gray-100 cursor-pointer [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-gray-500",
  navItemOn: "flex w-full items-center gap-x-2 h-8 px-2 rounded-lg text-sm font-medium text-gray-900 bg-gray-100 cursor-pointer [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-gray-800",
  navGroup: "px-2 pt-4 pb-1 text-xs font-medium text-gray-500",
  tabs: "flex items-center gap-x-5 border-b border-gray-200/80",
  tab: "relative -mb-px inline-flex items-center gap-x-1.5 h-10 border-b-2 border-transparent text-sm font-medium text-gray-500 transition-colors duration-150 hover:text-gray-800 cursor-pointer whitespace-nowrap [&_svg]:size-4",
  tabOn: "relative -mb-px inline-flex items-center gap-x-1.5 h-10 border-b-2 border-blue-600 text-sm font-medium text-blue-600 cursor-pointer whitespace-nowrap [&_svg]:size-4",
  seg: "inline-flex h-9 p-[3px] rounded-lg bg-gray-100",
  segSm: "inline-flex h-8 p-[3px] rounded-lg bg-gray-100",
  segItem: "inline-flex items-center gap-x-1.5 h-full px-3 rounded-md text-sm font-medium text-gray-600 transition-colors duration-150 hover:text-gray-800 cursor-pointer whitespace-nowrap [&_svg]:size-4",
  segOn: "inline-flex items-center gap-x-1.5 h-full px-3 rounded-md text-sm font-medium bg-white text-gray-800 shadow-2xs cursor-pointer whitespace-nowrap [&_svg]:size-4",
  segItemSm: "inline-flex items-center gap-x-1.5 h-full px-2.5 rounded-md text-[13px] font-medium text-gray-600 hover:text-gray-800 cursor-pointer whitespace-nowrap",
  segOnSm: "inline-flex items-center gap-x-1.5 h-full px-2.5 rounded-md text-[13px] font-medium bg-white text-gray-800 shadow-2xs cursor-pointer whitespace-nowrap",
  crumb: "inline-flex items-center gap-x-1.5 text-[13px] text-gray-500 [&_svg]:size-3.5 [&_svg]:text-gray-300",

  // Data grid — Attio layout, asha-ui Lists sizes (40px header, 36px rows)
  gridWrap: "g-wrap overflow-auto border-y border-gray-200/80",
  gridHead: "h-10 px-3 border-b border-e border-gray-200/80 text-start text-sm font-medium text-gray-500 whitespace-nowrap select-none",
  gridCell: "g-cell h-9 px-3 border-b border-e border-gray-200/80 text-sm text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis",
  gridFoot: "h-8 px-3 border-e border-gray-200/80 text-xs text-gray-400 whitespace-nowrap",
  // Attio-style condition chip, as on the Claims toolbar (AshaConditionChip): field · operator · value | ×
  chip: "inline-flex h-7 max-w-full shrink-0 items-stretch overflow-hidden rounded-md border border-gray-200 bg-white text-xs shadow-2xs hover:border-gray-300 whitespace-nowrap",
  chipBody: "inline-flex min-w-0 items-center gap-1 px-2 hover:bg-gray-50 cursor-pointer [&_svg]:size-3 [&_svg]:text-blue-700",
  chipField: "shrink-0 font-medium text-gray-800",
  chipOp: "shrink-0 text-gray-500",
  chipValue: "inline-flex items-center gap-0.5 truncate font-medium text-blue-700",
  chipX: "inline-flex w-6 shrink-0 items-center justify-center border-s border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-700 cursor-pointer [&_svg]:size-3",
  bulkBar: "bulk fixed bottom-6 left-1/2 z-40 -translate-x-1/2 flex items-center gap-x-1 h-11 ps-4 pe-1.5 rounded-xl bg-gray-900 text-white text-sm shadow-xl",

  // A table inside a panel's padding is always boxed: full border, 8px corners, no doubled last line
  tableBox: "rounded-lg border border-gray-200/80 overflow-hidden [&_table]:w-full [&_table]:!border-y-0 [&_tbody_tr:last-child>td]:border-b-0 [&_tfoot_td]:border-t [&_tfoot_td]:border-gray-200/80",
  // Simple table (read-only, no column lines) and key/value rows
  tHead: "h-10 px-3 border-b border-gray-200/80 text-start text-sm font-medium text-gray-500 whitespace-nowrap",
  tCell: "h-9 px-3 border-b border-gray-200/80 text-sm text-gray-800 whitespace-nowrap",
  kvRow: "grid grid-cols-[140px_1fr] items-center min-h-9 gap-x-3 text-sm",
  kvKey: "inline-flex items-center gap-x-2 text-[13px] text-gray-500 [&_svg]:size-4 [&_svg]:text-gray-400",

  // Skeletons
  skel: "rounded-md bg-gray-100 asha-sweep"
};

/* ============================================================ helpers */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* Library v2 (?v=2): the improvements from the UX review. A block checks V2 to draw its improved version and marks each
 * changed element with chg("why"), an attribute string (empty in v1). "Highlight changes" outlines and numbers every
 * marked element and lists the reasons under the block. sysChange("why") records a change made once for every block. */
/* v4 (?v=4) builds on v2: one header for every record (its page and its panels), one Actions menu, and tables you type
 * into. It's a let, and V4_OPTS holds the open choices, so a review page can draw the same block both ways. */
// v4 is the default (since 2026-10-01); ?v=1 and ?v=2 show the earlier versions for comparison
const DS_VERSION = new URLSearchParams(location.search).get("v") || "4";
let V4 = DS_VERSION === "4";
const V4_OPTS = { header: "one", status: "table", menu: "compact", open: false };
// v4 marks the page so CSS can apply v4-wide rules (every table in a panel is compact, like the data grid)
if (V4) document.documentElement.classList.add("v4");
const V2 = ["2", "4"].includes(DS_VERSION);
const chg = (note) => (V2 && !V4 ? ` data-chg="${esc(note)}"` : "");
/* chg4("why") marks a v4 change; in v4 the highlight shows v4's changes (on top of v2), not v2's */
const chg4 = (note) => (V4 ? ` data-chg="${esc(note)}"` : "");
const SYSTEM_CHANGES = [];
const sysChange = (area, note) => { if (V2 && !V4) SYSTEM_CHANGES.push([area, note]); return V2; };
const sysChange4 = (area, note) => { if (V4) SYSTEM_CHANGES.push([area, note]); return V4; };
if (V2) {
  Object.assign(R, {
    navItem: R.navItem.replace("h-8", "h-7"), navItemOn: R.navItemOn.replace("h-8", "h-7"), navGroup: R.navGroup.replace("pt-4", "pt-3"),
    chip: R.chip.replace("h-7", "h-8"),
    dialog: R.dialog.replace("w-[440px]", "w-[480px]"),
    gridFoot: R.gridFoot.replace("h-8", "h-9").replace("text-xs", "text-[13px]"),
    // one 44px top line for every bar: page headers, panel tops, sidebar header
    bar: "flex h-11 shrink-0 items-center gap-2 px-4 border-b border-gray-200/80 bg-white"
  });
  sysChange("Navigation", "Sidebar rows are 28px instead of 32px, with less space above group labels, so a biller sees Claims and EOBs without scrolling (Attio's nav density).");
  sysChange("Toolbars", "Every toolbar control is 32px: filter chips, Filter, Discard and Save view used to be 28px next to 32px search and buttons.");
  sysChange("Dialogs", "One dialog width, 480px. Dialogs used to be 440, 500 and 560px.");
  sysChange("Grid footer", "The totals row is 36px with 13px text, like the rows above it (was 32px, 12px).");
}
const I = (name, cls = "") => `<i data-lucide="${name}" class="${cls}" aria-hidden="true"></i>`;
const cx = (...a) => a.filter(Boolean).join(" ");
const icons = () => window.lucide && lucide.createIcons({ attrs: { "stroke-width": 1.75 } });

function button(label, { v = "white", s = "md", icon, iconEnd, attrs = "", cls = "" } = {}) {
  return `<button type="button" class="${cx(R.btn, R[s], R[v], cls)}" ${attrs}>${icon ? I(icon) : ""}${label}${iconEnd ? I(iconEnd) : ""}</button>`;
}
function iconButton(icon, label, { v = "quiet", s = "iconMd", attrs = "", cls = "" } = {}) {
  const base = s === "iconMd" ? R.md : s === "iconSm" ? R.sm : R.xs;
  return `<button type="button" class="${cx(R.btn, base, R[s], R[v], cls)}" aria-label="${esc(label)}" title="${esc(label)}" ${attrs}>${I(icon)}</button>`;
}
const sw = (on, label) => `<button type="button" role="switch" aria-checked="${on}" aria-label="${esc(label)}" class="${R.switchTrack}" data-act="switch"><span class="${R.switchKnob}"></span></button>`;
const tag = (label, tone = "tagGray") => `<span class="${cx(R.tag, R[tone])}">${esc(label)}</span>`;
/* One applied filter or sort as an Attio condition chip; removeAttrs go on the × button */
const condChip = (field, op, value, removeAttrs = "", removeLabel = "Remove", cls = "") => `<span class="${R.chip} ${cls}" role="group" aria-label="${esc(field)} ${esc(op)}"><span class="${R.chipBody}"><span class="${R.chipField}">${field}</span>${op ? `<span class="${R.chipOp}">${op}</span>` : ""}<span class="${R.chipValue}">${value}</span></span><button type="button" class="${R.chipX}" aria-label="${esc(removeLabel)}" ${removeAttrs}>${I("x")}</button></span>`;
const kbd = (k) => `<kbd class="${R.kbd}">${k}</kbd>`;
const checkbox = (checked = false, label = "", attrs = "") => `<input type="checkbox" class="${R.checkbox}" ${checked ? "checked" : ""} ${label ? `aria-label="${esc(label)}"` : ""} ${attrs} />`;

/* Status: a dot and a word. tone: on (blue) · off (grey) · needs (orange, a person must fix it) · quiet (light grey) */
const TONE_DOT = { on: "bg-blue-600", off: "bg-gray-300", needs: "bg-orange-500", quiet: "bg-gray-200", mid: "bg-blue-300" };
const statusDot = (label, tone = "off", cls = "") => `<span class="${cx(R.status, cls)}"><span class="${cx(R.dot, TONE_DOT[tone])}"></span>${esc(label)}</span>`;
const flag = (text, cls = "") => `<span class="${cx(R.flag, cls)}">${I("circle-alert")}${text}</span>`;
const note = (text, tone = "needs") => {
  const icon = tone === "needs" ? I("circle-alert", "size-4 mt-0.5 shrink-0 text-orange-500") : tone === "error" ? I("circle-x", "size-4 mt-0.5 shrink-0 text-red-600") : I("info", "size-4 mt-0.5 shrink-0 text-gray-400");
  return `<p class="flex items-start gap-x-2 text-[13px] leading-5 text-gray-600">${icon}<span>${text}</span></p>`;
};

/* A row-level alert that never adds a line: orange icon + 2–4 words inline; the full sentence and one action
 * open in a small popover on hover/focus. Use instead of a note() under a row. align: "end" (default) | "start" */
const alertMark = (short, detail, { action = "", align = "end" } = {}) => `<span class="group/alert relative inline-flex shrink-0 items-center">
  <button type="button" class="inline-flex items-center gap-1 h-6 px-1.5 -mx-1.5 rounded-md text-[13px] text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-blue-600/20 cursor-pointer whitespace-nowrap" aria-describedby="">${I("circle-alert", "size-3.5 shrink-0 text-orange-500")}${short}</button>
  <span role="tooltip" class="pointer-events-none invisible opacity-0 group-hover/alert:visible group-hover/alert:opacity-100 group-hover/alert:pointer-events-auto group-focus-within/alert:visible group-focus-within/alert:opacity-100 group-focus-within/alert:pointer-events-auto transition-opacity duration-150 absolute top-full ${align === "start" ? "start-0" : "end-0"} z-30 mt-1.5 w-72 ${R.popover} p-3 text-[13px] leading-5 text-gray-700 whitespace-normal">${detail}${action ? `<span class="mt-2 flex justify-end">${action}</span>` : ""}</span></span>`;

/* Avatars: people get soft Preline tints with initials; organisations get a small square mark */
const AV_SOFT = ["bg-blue-100 text-blue-800", "bg-indigo-100 text-indigo-800", "bg-teal-100 text-teal-800", "bg-sky-100 text-sky-800", "bg-violet-100 text-violet-800", "bg-gray-100 text-gray-700"];
const AV_SOLID = ["bg-indigo-500", "bg-teal-500", "bg-pink-500", "bg-sky-500", "bg-violet-500", "bg-blue-500"];
const hash = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const initials = (n) => String(n || "").split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
function avatar(name, { size = 6, square = false, solid = false } = {}) {
  const sz = { 5: "size-5 text-[10px]", 6: "size-6 text-[10px]", 7: "size-7 text-[11px]", 8: "size-8 text-xs", 9: "size-9 text-xs", 10: "size-10 text-sm", 12: "size-12 text-base" }[size];
  const tone = V2 ? (solid || square ? "bg-white ring-1 ring-inset ring-gray-200 text-gray-600" : "bg-gray-100 text-gray-600")
    : solid ? `${AV_SOLID[hash(name) % AV_SOLID.length]} text-white` : AV_SOFT[hash(name) % AV_SOFT.length];
  return `<span class="flex shrink-0 justify-center items-center ${sz} ${square ? "rounded-md" : "rounded-full"} ${tone} font-semibold" aria-hidden="true">${esc(initials(name) || "?")}</span>`;
}

/* Formatting */
const money = (n, { cents = true } = {}) => (n < 0 ? "−" : "") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fmtDate = (iso) => (iso ? `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}` : "");
const fmtDateY = (iso) => (iso ? `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}, ${iso.slice(0, 4)}` : "");

/* Small layout helpers */
const searchBox = (placeholder, { w = "w-56", value = "", attrs = "" } = {}) => `<div class="relative ${w} shrink-0">
  <span class="absolute inset-y-0 start-0 flex items-center ps-2.5 pointer-events-none">${I("search", "size-4 text-gray-500")}</span>
  <input class="${R.search}" placeholder="${esc(placeholder)}" value="${esc(value)}" aria-label="${esc(placeholder)}" ${attrs} /></div>`;
const tabsBar = (items, on = 0, cls = "") => `<nav class="${cx(R.tabs, cls)}">${items.map((t, i) => {
  const [label, n] = Array.isArray(t) ? t : [t];
  return `<span class="${i === on ? R.tabOn : R.tab}" data-tab="${i}" role="tab" aria-selected="${i === on}" ${i === on ? 'aria-current="page"' : ""}>${label}${n != null ? ` <span class="${i === on ? R.countBlue : R.count}">${n}</span>` : ""}</span>`;
}).join("")}</nav>`;
const segmented = (items, on = 0, { sm = false, attrs = "" } = {}) => `<div class="${sm ? R.segSm : R.seg}" role="tablist" ${attrs}>${items.map((t, i) => `<button type="button" role="tab" aria-selected="${i === on}" class="${i === on ? (sm ? R.segOnSm : R.segOn) : (sm ? R.segItemSm : R.segItem)}" data-seg="${i}">${t}</button>`).join("")}</div>`;
const kv = (icon, key, value) => `<div class="${R.kvRow}"><span class="${R.kvKey}">${icon ? I(icon) : ""}${key}</span><div class="min-w-0 text-gray-800">${value}</div></div>`;
const section = (title, body, { actions = "", count, cls = "" } = {}) => `<section class="${cls}">
  <div class="flex items-center justify-between gap-3 mb-2"><h3 class="${R.groupTitle} flex items-center gap-x-2">${title}${count != null ? ` <span class="${R.count}">${count}</span>` : ""}</h3>${actions}</div>${body}</section>`;
const metric = (label, value, { delta, sub, goal } = {}) => {
  const bar = goal != null ? `<div class="${V2 ? "mt-1.5 h-1" : "mt-2 h-1.5"} rounded-full bg-gray-100 overflow-hidden"><div class="h-full rounded-full bg-blue-600" style="width:${Math.min(100, goal)}%"></div></div>` : "";
  return `<div class="min-w-0">
  <p class="text-[13px] text-gray-500 truncate">${label}</p>
  <p class="mt-1 flex items-center gap-x-2"><span class="${R.number}">${value}</span>${delta ? `<span class="${R.delta}">${delta}</span>` : ""}</p>
  ${V2 ? "" : bar}
  ${sub ? `<p class="mt-1 text-xs text-gray-500">${sub}</p>` : ""}${V2 ? bar : ""}</div>`; };
if (V2) sysChange("Metric strips", "A goal bar sits under the caption instead of between the number and the caption, so every caption in a strip lines up.");
const metricStrip = (items, cls = "", { gutter = 0 } = {}) => `<div class="grid border-y border-gray-200/80 divide-x divide-gray-200/80 ${gutter ? `-mx-[${gutter}px]` : ""} ${cls}" style="grid-template-columns:repeat(${items.length},minmax(0,1fr))">${items.map((m) => `<div class="py-4 px-5 ${gutter ? `first:ps-[${gutter}px] last:pe-[${gutter}px]` : "first:ps-0"}">${metric(...m)}</div>`).join("")}</div>`;
const skel = (w = "w-full", h = "h-3.5") => `<span class="block ${w} ${h} ${R.skel}"></span>`;
const emptyState = ({ icon = "inbox", title, body, action = "" }) => `<div class="flex flex-col items-center justify-center gap-1 py-14 px-6 text-center">
  <span class="flex items-center justify-center size-10 mb-2 rounded-lg bg-gray-100 text-gray-500">${I(icon, "size-5")}</span>
  <p class="text-sm font-semibold text-gray-800">${title}</p>${body ? `<p class="${R.help} max-w-sm">${body}</p>` : ""}${action ? `<div class="mt-3">${action}</div>` : ""}</div>`;
const errorState = (title = "Couldn't load this", body = "Check your connection and try again.") => `<div class="flex flex-col items-center justify-center gap-1 py-14 px-6 text-center">
  <span class="flex items-center justify-center size-10 mb-2 rounded-lg bg-gray-100 text-gray-500">${I("cloud-off", "size-5")}</span>
  <p class="text-sm font-semibold text-gray-800">${title}</p><p class="${R.help}">${body}</p><div class="mt-3">${button("Try again", { v: "white", s: "sm", icon: "rotate-cw" })}</div></div>`;

/* The one-line bar at the top of every list or workbench (AshaWorkspaceHeader): "Parent / Title", actions right */
const workspaceHeader = ({ parent, title, actions = "", cls = "" }) => `<div class="flex items-center justify-between gap-4 h-11 px-4 border-b border-gray-200/80 bg-white ${cls}">
  <div class="flex items-center gap-1.5 text-sm min-w-0">${parent ? `<span class="text-gray-500 whitespace-nowrap">${parent}</span>${I("chevron-right", "size-3.5 shrink-0 text-gray-300")}` : ""}<span class="font-semibold text-gray-800 truncate">${title}</span></div>
  <div class="flex items-center gap-1.5 shrink-0">${actions}</div></div>`;
/* Underline tabs with a right slot (AshaInlineTabs + rightSlot) */
const tabsWithSlot = (items, on = 0, right = "", cls = "px-4", { gutter = 0 } = {}) => `<div class="flex items-end justify-between gap-4 border-b border-gray-200/80 ${gutter ? `-mx-[${gutter}px] px-[${gutter}px]` : ""} ${cls}">${tabsBar(items, on, "!border-0")}<div class="flex items-center gap-2 pb-1.5 shrink-0">${right}</div></div>`;
/* Make tabsBar tabs clickable inside root; onPick(index) re-renders what the tab controls */
function wireTabs(root, onPick) {
  root.addEventListener("click", (e) => { const t = e.target.closest("[data-tab]"); if (!t || !root.contains(t)) return;
    const bar = t.parentElement, prev = bar.querySelector('[data-tab][aria-selected="true"]'); [...bar.querySelectorAll("[data-tab]")].forEach((x) => { const on = x === t; x.className = on ? R.tabOn : R.tab; x.setAttribute("aria-selected", on);
      const c = x.querySelector("span"); if (c) c.className = on ? R.countBlue : R.count; });
    Motion.glide(bar, prev, t, "ink"); onPick(+t.dataset.tab); });
}
const dateRangeButton = (label = "Last 30 days") => button(label, { v: "white", s: "sm", icon: "calendar", iconEnd: "chevron-down", cls: "[&_svg:last-child]:text-gray-400" });
/* Loading grid: keeps the frame and header, grey bars where rows will be */
/* Tables are never open-sided: a table either runs edge to edge of the surface it sits on, or is boxed (R.tableBox).
 * edgeToEdge(g) pulls a table out through the host's g px side padding and pads its first and last columns by the same
 * g, so the lines touch both edges while the text still lines up with the toolbar above. */
const edgeToEdge = (g = 16) => (g ? `-mx-[${g}px] [&_tr>*:first-child]:!ps-[${g}px] [&_tr>*:last-child]:!pe-[${g}px]` : "");
const gridSkeleton = (headers, rows = 6, { gutter = 16 } = {}) => `<div class="border-y border-gray-200/80 overflow-hidden ${edgeToEdge(gutter)}"><table class="w-full table-fixed border-separate border-spacing-0">
  <thead><tr>${headers.map((h) => `<th class="${R.gridHead}">${h}</th>`).join("")}</tr></thead>
  <tbody>${Array.from({ length: rows }, (_, r) => `<tr>${headers.map((_, c) => `<td class="${R.gridCell}"><span class="block h-3 ${R.skel}" style="width:${[70, 45, 60, 35, 55, 40][(r + c) % 6]}%"></span></td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

/* ============================================================ motion
 * One layer for every block (asha-ui ashaMotion: press · enter · reveal · settle, plus pop, glide, toast).
 * Movement turns off for reduce-motion (the computer setting, or the page's own Animations switch). */
const Motion = {
  reduced: () => document.documentElement.dataset.motion === "reduced" || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches),
  /* Replay a one-shot class on an element (settle glow, check pop, fade) */
  play(el, cls) { if (!el) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); el.addEventListener("animationend", () => el.classList.remove(cls), { once: true }); },
  settle(el) { Motion.play(el, "asha-glow"); },
  /* Slide an indicator (tab ink or segment thumb) from one item to another inside their container */
  glide(container, from, to, kind) {
    if (!container || !from || !to || from === to || Motion.reduced()) return;
    const c = container.getBoundingClientRect(), a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    if (getComputedStyle(container).position === "static") container.style.position = "relative";
    if (kind === "thumb") container.classList.add("asha-seg-host");
    const g = document.createElement("span"); g.className = kind === "thumb" ? "asha-thumb" : "asha-ink"; g.setAttribute("aria-hidden", "true");
    g.style.left = a.left - c.left + container.scrollLeft + "px"; g.style.width = a.width + "px";
    container.appendChild(g); to.classList.add("asha-gliding");
    requestAnimationFrame(() => requestAnimationFrame(() => { g.style.left = b.left - c.left + container.scrollLeft + "px"; g.style.width = b.width + "px"; }));
    setTimeout(() => { g.remove(); to.classList.remove("asha-gliding"); }, 240);
  }
};
/* v4: toasts are the light, frosted, Mac-style card Asha's notifications use (Team Chat alerts, PR #7685): top-right
 * corner, newest first, a soft shadow and blur instead of a dark slab, the close button a small frosted circle on the
 * card's top-left corner that shows on hover, actions as quiet text buttons. */
R.alertCard = "group/alert relative flex items-center gap-x-3 w-[356px] max-w-full p-3 rounded-2xl bg-white/70 text-[13px] text-gray-900 shadow-[0_0_0_0.5px_rgb(0_0_0/0.1),0_10px_28px_-8px_rgb(16_24_40/0.22),0_2px_6px_rgb(16_24_40/0.08)] backdrop-blur-xl backdrop-saturate-150";
R.alertClose = "absolute -top-1.5 -start-1.5 inline-flex size-5 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-[0_0_0_0.5px_rgb(0_0_0/0.12),0_1px_3px_rgb(16_24_40/0.15)] backdrop-blur-xl opacity-0 transition-opacity group-hover/alert:opacity-100 focus-visible:opacity-100 hover:text-gray-900 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 [@media(hover:none)]:opacity-100 cursor-pointer";
R.alertAction = "inline-flex h-7 shrink-0 items-center rounded-lg px-2.5 text-[13px] font-medium text-gray-900 hover:bg-black/5 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer";
/* One alert card: icon (or a person's avatar for a message), a bold title line and an optional grey line, an action */
const alertCard = ({ icon = "circle-check", tone = "blue", lead = "", title, body = "", time = "", action = "", attrs = "" }) => `<div class="${R.alertCard}" role="status" ${attrs}><button type="button" class="${R.alertClose}" aria-label="Dismiss">${I("x", "size-3")}</button>${lead || I(icon, `size-4 shrink-0 ${{ blue: "text-blue-600", orange: "text-orange-500", red: "text-red-600", gray: "text-gray-400" }[tone]}`)}<div class="min-w-0 grow"><div class="flex items-baseline gap-2"><p class="min-w-0 grow truncate font-medium">${title}</p>${time ? `<span class="shrink-0 text-xs text-gray-500">${time}</span>` : ""}</div>${body ? `<p class="text-gray-600 line-clamp-2">${body}</p>` : ""}</div>${action ? `<button type="button" class="${R.alertAction}" data-toast-action>${action}</button>` : ""}</div>`;
if (V4) sysChange4("Toasts and notifications", "Toasts are the light, frosted, Mac-style card Asha's notifications already use: top-right corner, a soft shadow instead of a dark slab, the close button a small circle on the card's corner on hover, and quiet text actions like Undo.");
/* A short confirmation at the bottom of the screen; one optional action such as Undo */
function toast(msg, { action, onAction, icon = "check", ms = 4000 } = {}) {
  let host = document.getElementById("asha-toasts");
  if (!host) { host = document.createElement("div"); host.id = "asha-toasts"; host.className = V2 ? "fixed top-3 end-3 z-[60] flex flex-col items-end gap-2 pointer-events-none" : "fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center gap-2 pointer-events-none"; host.setAttribute("aria-live", "polite"); document.body.appendChild(host); }
  const t = document.createElement("div");
  if (V4) { t.className = "pointer-events-auto asha-toast-in"; t.innerHTML = alertCard({ icon: icon === "check" ? "circle-check" : icon, tone: /trash|x/.test(icon) ? "gray" : "blue", title: msg, action }); t.querySelector("[aria-label=Dismiss]").addEventListener("click", () => kill()); }
  else { t.className = `${R.toast} pointer-events-auto asha-toast-in`; t.setAttribute("role", "status");
    t.innerHTML = `${I(icon, "size-4 shrink-0 text-blue-300")}<span class="grow">${msg}</span>${action ? button(action, { v: "onDark", s: "xs", attrs: "data-toast-action" }) : ""}`; }
  host.appendChild(t); icons();
  let gone = false; const kill = () => { if (gone) return; gone = true; t.classList.remove("asha-toast-in"); t.classList.add("asha-toast-out"); setTimeout(() => t.remove(), Motion.reduced() ? 0 : 160); };
  const act = t.querySelector("[data-toast-action]"); if (act) act.addEventListener("click", () => { if (onAction) onAction(); kill(); });
  setTimeout(kill, ms);
}

/* Chart axis text: v2 reads at a distance (11px gray-500, about 4.8:1) instead of 10px gray-400 (about 2.6:1) */
const AXIS_INK = V2 ? "#6A7282" : "#99A1AF", AXIS_PX = V2 ? 11 : 10;
if (V2) sysChange("Charts", "Axis labels are 11px gray-500 (about 4.8:1 contrast) instead of 10px gray-400 (about 2.6:1), readable on a clinic monitor across the room.");
/* ============================================================ charts (blue only, per the RI colour rule) */
const Chart = {
  /* Vertical bars. values: numbers; labels: strings; goal: optional line; highlight: index drawn darker */
  bars({ values, labels = [], w = 560, h = 180, goal, fmt = (v) => v, highlight = values.length - 1, tone = "#155DFC", muted = "#BEDBFF" }) {
    const pad = { l: 36, r: 8, t: 10, b: 22 };
    const max = Math.max(...values, goal || 0) * 1.12 || 1;
    const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b, bw = (iw / values.length) * 0.62;
    const y = (v) => pad.t + ih - (v / max) * ih;
    const ticks = [0, max / 2, max].map((t) => `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y(t)}" y2="${y(t)}" stroke="#E5E7EB" stroke-width="1"/><text x="${pad.l - 6}" y="${y(t) + 3}" text-anchor="end" font-size="${AXIS_PX}" fill="${AXIS_INK}">${fmt(Math.round(t))}</text>`).join("");
    const bars = values.map((v, i) => { const x = pad.l + (iw / values.length) * i + ((iw / values.length) - bw) / 2;
      return `<rect x="${x}" y="${y(v)}" width="${bw}" height="${Math.max(1, pad.t + ih - y(v))}" rx="3" fill="${i === highlight ? tone : muted}"><title>${esc(labels[i] || "")} ${fmt(v)}</title></rect>
      ${labels[i] ? `<text x="${x + bw / 2}" y="${h - 6}" text-anchor="middle" font-size="${AXIS_PX}" fill="#6A7282">${esc(labels[i])}</text>` : ""}`; }).join("");
    const g = goal ? `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y(goal)}" y2="${y(goal)}" stroke="#1447E6" stroke-dasharray="4 3" stroke-width="1.25"/><text x="${w - pad.r}" y="${y(goal) - 4}" text-anchor="end" font-size="${AXIS_PX}" fill="#1447E6">Goal</text>` : "";
    return `<svg viewBox="0 0 ${w} ${h}" class="w-full h-auto" role="img">${ticks}${bars}${g}</svg>`;
  },
  /* Lines. series: [{name, values, tone: 'strong'|'muted'}] */
  line({ series, labels = [], w = 560, h = 180, fmt = (v) => v }) {
    const pad = { l: 36, r: 8, t: 10, b: 22 };
    const all = series.flatMap((s) => s.values); const max = Math.max(...all) * 1.12 || 1;
    const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b, n = series[0].values.length;
    const x = (i) => pad.l + (iw / (n - 1)) * i, y = (v) => pad.t + ih - (v / max) * ih;
    const ticks = [0, max / 2, max].map((t) => `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y(t)}" y2="${y(t)}" stroke="#E5E7EB"/><text x="${pad.l - 6}" y="${y(t) + 3}" text-anchor="end" font-size="${AXIS_PX}" fill="${AXIS_INK}">${fmt(Math.round(t))}</text>`).join("");
    const lines = series.map((s) => { const c = s.tone === "muted" ? "#8EC5FF" : "#155DFC";
      const d = s.values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
      const area = s.tone === "muted" ? "" : `<path d="${d}L${x(n - 1)},${pad.t + ih}L${x(0)},${pad.t + ih}Z" fill="#155DFC" opacity=".06"/>`;
      return `${area}<path d="${d}" fill="none" stroke="${c}" stroke-width="2" ${s.tone === "muted" ? 'stroke-dasharray="4 3"' : ""} stroke-linejoin="round"/>`; }).join("");
    const lab = labels.map((l, i) => (l ? `<text x="${x(i)}" y="${h - 6}" text-anchor="middle" font-size="${AXIS_PX}" fill="#6A7282">${esc(l)}</text>` : "")).join("");
    return `<svg viewBox="0 0 ${w} ${h}" class="w-full h-auto" role="img">${ticks}${lines}${lab}</svg>`;
  },
  spark(values, { w = 88, h = 24 } = {}) {
    const max = Math.max(...values), min = Math.min(...values), r = max - min || 1;
    const d = values.map((v, i) => `${i ? "L" : "M"}${((w - 2) / (values.length - 1)) * i + 1},${h - 2 - ((v - min) / r) * (h - 4)}`).join("");
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><path d="${d}" fill="none" stroke="#155DFC" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
  },
  /* Horizontal meter; value/max; goal marker optional */
  meter(value, max, { goal, h = "h-1.5" } = {}) {
    const p = Math.max(0, Math.min(100, (value / max) * 100));
    return `<div class="relative ${h} rounded-full bg-gray-100 overflow-hidden"><div class="h-full rounded-full bg-blue-600" style="width:${p}%"></div>${goal != null ? `<span class="absolute inset-y-0 w-px bg-gray-800/50" style="left:${(goal / max) * 100}%"></span>` : ""}</div>`;
  },
  /* One stacked bar in blue shades; parts: [{label, value}] */
  stack(parts, { h = "h-2.5" } = {}) {
    const shades = ["bg-blue-600", "bg-blue-400", "bg-blue-300", "bg-blue-200", "bg-blue-100"];
    const total = parts.reduce((a, p) => a + p.value, 0) || 1;
    return `<div class="flex ${h} w-full overflow-hidden rounded-full bg-gray-100 gap-px">${parts.map((p, i) => `<div class="${shades[i % shades.length]}" style="width:${(p.value / total) * 100}%" title="${esc(p.label)}"></div>`).join("")}</div>
      <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1">${parts.map((p, i) => `<span class="inline-flex items-center gap-x-1.5 text-xs text-gray-600"><span class="size-2 rounded-sm ${shades[i % shades.length]}"></span>${esc(p.label)} <span class="text-gray-400 tabular-nums">${p.fmt || p.value}</span></span>`).join("")}</div>`;
  }
};

/* ============================================================ side panels
 * Every divider inside a panel runs the full width. Build panel bodies from psec() sections and pass
 * flush: true; put tables that should touch both edges inside bleed(). */
R.psec = "px-5 py-4 border-t border-gray-200/80";
const psec = (title, body, { actions = "", count, cls = "" } = {}) => `<section class="${cx(R.psec, cls)}">${title ? `<div class="flex items-center justify-between gap-3 mb-2.5 min-h-6"><h3 class="${R.groupTitle} flex items-center gap-x-2">${title}${count != null ? ` <span class="${R.count}">${count}</span>` : ""}</h3>${actions ? `<div class="flex items-center gap-1.5">${actions}</div>` : ""}</div>` : ""}${body}</section>`;
const bleed = (html) => `<div class="-mx-5">${html}</div>`;
if (V2) sysChange("Toasts", "Toasts start at the window's top-right corner (owner rule) and only report something you can undo or something still running out of view; saving a view and routine bulk actions no longer toast.");
/* Label-over-value grid for a record's facts (cols per row) */
const metaGrid = (items, cols = 3) => `<dl class="grid gap-x-6 gap-y-3" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${items.map(([k, v]) => `<div class="min-w-0"><dt class="text-xs text-gray-500">${k}</dt><dd class="mt-0.5 text-sm text-gray-800 truncate">${v}</dd></div>`).join("")}</dl>`;
/* One line in a list of things to know: icon, text, optional right-hand bit */
const infoRow = (icon, text, { tone = "gray", right = "" } = {}) => `<div class="flex items-start gap-x-2.5 py-1.5 text-sm text-gray-800">${I(icon, `size-4 mt-0.5 shrink-0 ${tone === "needs" ? "text-orange-500" : tone === "blue" ? "text-blue-600" : "text-gray-400"}`)}<div class="min-w-0 grow">${text}</div>${right ? `<div class="shrink-0 text-[13px] text-gray-500">${right}</div>` : ""}</div>`;
function sheetInner({ title, subtitle = "", lead = "", tabs, tab = 0, body = "", footer = "", actions = "", flush = false, closeAttrs = "", marks = "", facts = null }) {
  if (V4 && V4_OPTS.header !== "two") return `${recordHeader({ lead, title, sub: subtitle, marks, actions, end: iconButton("x", "Close", { s: "iconSm", attrs: closeAttrs }), facts: V4_OPTS.header === "facts" ? facts : null, tabs, tab })}
    <div class="grow min-h-0 overflow-y-auto ${flush ? "[&>section:first-child]:border-t-0" : "px-5 py-4"}">${body}</div>
    ${footer ? `<div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200/80">${footer}</div>` : ""}`;
  if (V2) return `<div class="${R.bar} justify-end !px-3"${chg("Panel tops share the page header's 44px line: close and actions sit in a top bar, the record's name under it (Attio's record panel)")}>${actions}${iconButton("x", "Close", { s: "iconSm", attrs: closeAttrs })}</div>
    <div class="flex items-center gap-x-3 px-5 pt-3 ${tabs ? "pb-1" : "pb-3"}">${lead}<div class="min-w-0 grow"><h2 class="text-base font-semibold text-gray-800 truncate">${title}</h2>${subtitle ? `<div class="text-[13px] text-gray-500 mt-0.5">${subtitle}</div>` : ""}</div></div>
    ${tabs ? `<div class="px-5 border-b border-gray-200/80">${tabsBar(tabs, tab, "!border-0")}</div>` : `<div class="border-b border-gray-200/80"></div>`}
    <div class="grow min-h-0 overflow-y-auto ${flush ? "[&>section:first-child]:border-t-0" : "px-5 py-4"}">${body}</div>
    ${footer ? `<div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200/80">${footer}</div>` : ""}`;
  return `<div class="flex items-start gap-x-3 px-5 pt-4 ${tabs ? "pb-1" : "pb-4"}">${lead}
      <div class="min-w-0 grow"><h2 class="text-base font-semibold text-gray-800 truncate">${title}</h2>${subtitle ? `<div class="text-[13px] text-gray-500 mt-0.5">${subtitle}</div>` : ""}</div>
      <div class="flex items-center gap-0.5 -me-2">${actions}${iconButton("x", "Close", { s: "iconSm", attrs: closeAttrs })}</div></div>
    ${tabs ? `<div class="px-5 border-b border-gray-200/80">${tabsBar(tabs, tab, "!border-0")}</div>` : ""}
    <div class="grow min-h-0 overflow-y-auto ${flush ? (tabs ? "[&>section:first-child]:border-t-0" : "") : "px-5 py-4"}">${body}</div>
    ${footer ? `<div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200/80">${footer}</div>` : ""}`;
}
/* v4: one header for a record, the same on its page and in its panels. Who or what it is and one line of facts on the
 * left, marks that need attention next to the name, the record's actions then close (panel) or previous/next (page) on
 * the same row; nothing above it. facts: [[label, value, more]] adds one line of key facts (the chart): one label and one
 * value each, never a third line; "more" shows on hover; tabs sit at its
 * foot. rule: false leaves off the bottom line when the page draws its own tab bar under it. */
function recordHeader({ lead = "", title, sub = "", marks = "", actions = "", end = "", facts = null, tabs = null, tab = 0, size = "panel", rule = true }) {
  const page = size === "page", H = page ? "h1" : "h2";
  return `<header class="${cx("px-5 bg-white", page ? "pt-4" : "pt-3.5", !facts && !tabs && (page ? "pb-4" : "pb-3.5"), rule && "border-b border-gray-200/80")}">
    <div class="flex items-start gap-3">${lead}<div class="min-w-0 grow"><div class="flex items-center gap-2 min-h-6"><${H} class="${page ? "text-lg" : "text-base"} font-semibold text-gray-800 truncate">${title}</${H}>${marks ? `<span class="flex items-center gap-2 shrink-0">${marks}</span>` : ""}</div>${sub ? `<p class="text-[13px] text-gray-500 truncate tabular-nums">${sub}</p>` : ""}</div>
    <div class="${cx("flex items-center shrink-0", page ? "gap-1.5" : "gap-0.5 -me-2")}">${actions}${end}</div></div>
    ${facts ? `<div class="flex gap-10 pt-3 ${tabs ? "pb-1" : "pb-3.5"}">${facts.map(([l, v, sb]) => `<div class="min-w-0"><p class="text-xs text-gray-500">${l}</p><p class="mt-0.5 text-sm font-medium text-gray-800 tabular-nums truncate"${sb ? ` data-tip="${esc(String(sb).replace(/<[^>]+>/g, ""))}"` : ""}>${v}</p></div>`).join("")}</div>` : ""}
    ${tabs ? `<div class="${facts ? "" : "pt-2"}">${tabsBar(tabs, tab, "!border-0")}</div>` : ""}</header>`;
}
/* v4: the one patient header, the same on the chart and in every panel about a patient (appointment, check-in, ...).
 * Next to the name, two compact marks instead of a "Before the visit" list: medical alerts as one icon with the count
 * (orange when one needs action before treatment, like Premedicate; hover lists them), and the family balance as a
 * wallet with the amount (hover says what it is). sub is the one grey line under the name (age · chart #, or the visit
 * time in a visit's panel). Everything else is recordHeader's: actions, end, facts, tabs, size, rule. */
const PT_NEEDS_ACTION = /premedicate|antibiotic|blood thinner/i;
function patientMarks({ alerts = [], familyBalance = 0, newPatient = false } = {}) {
  const needs = alerts.some((a) => PT_NEEDS_ACTION.test(a)), list = [...alerts].sort((a, b) => PT_NEEDS_ACTION.test(b) - PT_NEEDS_ACTION.test(a));
  const mark = (icon, text, tip, cls) => `<span data-tip="${esc(tip)}" tabindex="0" class="inline-flex items-center gap-1 h-6 px-1.5 rounded-md text-[13px] tabular-nums hover:bg-gray-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600/30 cursor-default ${cls}">${I(icon, "size-4")}${text}</span>`;
  return `${newPatient ? tag("New patient", "tagOutline") : ""}${alerts.length ? mark(needs ? "circle-alert" : "heart-pulse", alerts.length, list.join(" · "), needs ? "text-orange-600 [&_svg]:text-orange-500" : "text-gray-600 [&_svg]:text-gray-400") : ""}${familyBalance ? mark("wallet", money(familyBalance), "Family balance due", "text-gray-600 [&_svg]:text-gray-400") : ""}`;
}
function patientHeader({ name, sub = "", alerts = [], familyBalance = 0, newPatient = false, size = "panel", ...rest }) {
  return recordHeader({ lead: avatar(name, { size: size === "page" ? 10 : 9 }), title: name, sub, marks: patientMarks({ alerts, familyBalance, newPatient }), size, ...rest });
}
/* v4: progressive disclosure. A surface shows what its most frequent job needs; the rest of a row's details open on hover
 * in a card (Grid option peek: (row) => html) and the full record on click. The card sits just left of the panel the
 * grid is in (so it never covers the panel), or beside the row on a page. One card for the whole page. */
const Peek = {
  el: null,
  show(anchor, html) {
    if (!html) return this.hide();
    if (!this.el) { this.el = document.createElement("div"); this.el.setAttribute("role", "tooltip"); document.body.appendChild(this.el); }
    const el = this.el; el.className = cx(R.popover, "fixed z-[80] w-72 p-3 text-[13px] text-gray-700 pointer-events-none"); el.innerHTML = html; el.hidden = false; icons();
    const r = anchor.getBoundingClientRect(), panel = anchor.closest("aside"), w = el.offsetWidth, h = el.offsetHeight;
    const left = panel ? panel.getBoundingClientRect().left - w - 8 : Math.min(innerWidth - w - 8, r.right - w - 8);
    el.style.left = `${Math.max(8, left)}px`; el.style.top = `${Math.max(8, Math.min(innerHeight - h - 8, panel ? r.top : r.bottom + 4))}px`;
  },
  hide() { if (this.el) this.el.hidden = true; }
};
/* A peek card's body: a title line, then label/value lines */
const peekCard = (title, pairs, note = "") => `<p class="font-medium text-gray-800 mb-1.5">${title}</p><dl class="space-y-1">${pairs.filter(([, v]) => v != null && v !== "").map(([k, v]) => `<div class="flex gap-3"><dt class="w-24 shrink-0 text-gray-500">${k}</dt><dd class="min-w-0 text-gray-800">${v}</dd></div>`).join("")}</dl>${note ? `<p class="mt-2 text-gray-500">${note}</p>` : ""}`;
/* A mark next to a record's name: an icon with a hover label; needs: true for the one thing staff must act on */
const recordMark = (icon, tip, needs = false) => `<span data-tip="${esc(tip)}" tabindex="0" class="inline-flex rounded-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600/30">${I(icon, `size-4 ${needs ? "text-orange-500" : "text-gray-400"}`)}</span>`;
/* v4: the one Actions menu for a record (the claim panel's, made standard). A white Actions button opens a searchable
 * list grouped by what each action is about; the search has focus, arrow keys and Enter pick, Escape closes.
 * groups: [{ label, items: [{ icon, label, hint, suggest, off, danger }] }]. hint: what it does (under the label when
 * rich, on hover otherwise); suggest: why Asha suggests it right now (a sparkle with a hover); off: why it can't run
 * yet (the row stays, greyed, with the reason on hover, so nothing silently disappears); a group without a label is a
 * divider (put destructive actions there, last). up opens above the button, for panel footers.
 * Placement (owner rule): the labelled Actions button (with the sparkle) sits bottom-left in a footer when a record has
 * many actions; a menu at the top right of a header is a ⋯ (dots: true, up: false, align: "end") with the same list. */
function actionsMenu(groups, { label = "Actions", up = true, align = "start", rich = V4_OPTS.menu === "rich", w = 320, open = false, dots = false } = {}) {
  const item = (it) => `<button type="button" role="menuitem" data-am-item data-label="${esc(`${it.label} ${it.hint || ""}`)}" ${it.off ? `aria-disabled="true" data-tip="${esc(it.off)}"` : it.hint && !rich ? `title="${esc(it.hint)}"` : ""} class="${cx(it.danger ? R.menuDanger : R.menuItem, rich && it.hint && "!h-auto py-1.5 !items-start", it.off && "opacity-50 !cursor-default")}">${I(it.icon || "dot", rich && it.hint ? "mt-0.5 shrink-0" : "shrink-0")}<span class="min-w-0 grow text-start">${rich && it.hint ? `<span class="block">${it.label}</span><span class="block text-xs text-gray-500 truncate">${it.hint}</span>` : `<span class="block truncate">${it.label}</span>`}</span>${it.suggest ? `<span data-tip="${esc(it.suggest)}" class="inline-flex shrink-0">${I("sparkles", "!size-3.5 !text-blue-600")}</span>` : ""}</button>`;
  const list = groups.map((g) => `<div data-am-group role="group"${g.label ? ` aria-label="${esc(g.label)}"` : ""}>${g.label ? `<p class="${R.menuLabel}">${g.label}</p>` : `<div class="${R.menuSep}"></div>`}${g.items.map(item).join("")}</div>`).join("");
  const trigger = dots ? iconButton("ellipsis", label === "Actions" ? "More actions" : label, { s: "iconSm", attrs: `data-am-btn aria-haspopup="menu" aria-expanded="${open}"` })
    : button(label, { v: "white", s: "sm", icon: "sparkles", iconEnd: "chevron-down", cls: "[&_svg:first-child]:!text-blue-600 [&_svg:last-child]:text-gray-400 [&_svg:last-child]:transition-transform aria-expanded:[&_svg:last-child]:rotate-180", attrs: `data-am-btn aria-haspopup="menu" aria-expanded="${open}"` });
  return `<div class="relative" data-am>${trigger}
    <div data-am-menu role="menu" aria-label="${esc(label)}" class="${R.menu.replace("w-60 p-1", "")} absolute z-40 ${up ? "bottom-full mb-1.5" : "top-full mt-1.5"} ${align === "end" ? "end-0" : "start-0"} overflow-hidden" style="width:${w}px"${open ? "" : " hidden"}>
      <div class="relative border-b border-gray-200/80"><span class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">${I("search", "size-4 text-gray-400")}</span><input data-am-search class="w-full h-10 ps-9 pe-3 text-[13px] bg-transparent outline-hidden placeholder:text-gray-400" placeholder="Search actions…" aria-label="Search actions" /></div>
      <div class="max-h-80 overflow-y-auto p-1">${list}<p data-am-empty hidden class="px-2 py-3 text-[13px] text-gray-500">No actions match.</p></div></div></div>`;
}
if (V4) {
  sysChange4("Record header", "Every panel and the patient chart use one header: who it is and one line of facts on the left, the actions and close (or previous/next) on the same row. The bar that held only close and a couple of icons is gone.");
  sysChange4("Actions menu", "Every ⋯ menu on a record is the same Actions button: a searchable list grouped by what each action is about, one line each, a sparkle on what Asha suggests now, and greyed rows that say why they can't run yet.");
  sysChange4("Typing into tables", "A record's facts are a small table you type into, and lines staff fix (fees, estimates, providers) are cells on the data grid: click or just type, Enter saves and moves down, Tab moves on, lists search as you type. Saves are silent; a failed save leaves an orange mark with a retry.");
  sysChange4("Status", "A record's status is the first line of its facts table instead of a row of its own.");
  sysChange4("No patchy columns", "Every column shows a value on every row. A column that's mostly blank reads as broken, so v2's 'only when unusual' blanks are filled in, and a column that only a few rows use is folded into another column or dropped.");
  sysChange4("Header facts", "Facts in a header are one label and one value each; the extra grey third line moved to the value's hover.");
  sysChange4("Claims read like paper", "A claim's Claim tab is only what was submitted, editable, in the ADA form's order with its box numbers; rare boxes sit behind More claim details. The EOB tab holds the adjudication, laid out like a dental EOB.");
  sysChange4("One send dialog", "Texts and emails go through one send dialog, never a message box that opens inside a list.");
  sysChange4("Steppers", "Step bars never show an alert icon; a problem shows inside its own step.");
  sysChange4("Clinical notes", "Notes keep the chart's condensed visit panel and nothing sits inside the note text: no toolbar strip and no Accept or Dismiss chips. Scribe's version is a separate AI note you sign.");
  sysChange4("Compact tables in panels", "Every table in a panel or flyout is the compact data grid size (28px rows, 13px text), editable or not, so a panel never mixes table sizes.");
  sysChange4("The first-day test", "Anything staff set up (agents, settings, setup steps) has to pass one test: could someone new to dentistry and new to software do it alone? Every answer comes filled in with what most offices pick (marked Recommended), every question is asked the way you'd say it out loud with a one-line reason, rare and technical settings sit behind More settings, and the last step says in plain sentences what will happen.");
  sysChange4("Most important first", "Each surface shows what its most frequent job needs, as a data grid with the few columns that matter; the rest of a row's details open on hover in a card beside the panel, and the whole record on click, instead of every value strung along one line.");
  sysChange4("One patient header", "The chart and every panel about a patient share one header: medical alerts as one icon with the count (orange when someone must act first) and the family balance as a wallet with the amount, instead of a 'Before the visit' list.");
}
/* Today's ⋯ menu, for comparing against: an icon button and a short plain list */
const dotsMenu = (items, { label = "More actions", open = false } = {}) => `<div class="relative">${iconButton("ellipsis", label, { v: "white", s: "iconSm" })}${open ? `<div class="${R.menu} !w-52 absolute bottom-full mb-1.5 start-0 z-40" role="menu">${items.map(([ic, l, danger]) => `<button type="button" role="menuitem" class="${danger ? R.menuDanger : R.menuItem}">${I(ic)}${l}</button>`).join("")}</div>` : ""}</div>`;
/* v4: tables you type into, placed by a block's html() and brought to life by mountSheets(el) in its mount().
 * fieldTable(rows): a record's fields, [{ label, value, type: "text" | "select" | "none", options, html(row) }];
 * sheetTable(options): any Grid with sheet editing (preset "panel" unless given). */
const SHEETS = new Map(); let SHEET_SEQ = 0;
const fieldTable = (rows, o = {}) => { const id = `s${++SHEET_SEQ}`; SHEETS.set(id, { fields: rows, o }); return `<div data-sheet-host="${id}"></div>`; };
const sheetTable = (o) => { const id = `s${++SHEET_SEQ}`; SHEETS.set(id, { o }); return `<div data-sheet-host="${id}"></div>`; };
function mountSheets(root) {
  root.querySelectorAll("[data-sheet-host]").forEach((h) => { if (h.dataset.mounted) return; const s = SHEETS.get(h.dataset.sheetHost); if (!s) return; h.dataset.mounted = "1";
    SHEETS.delete(h.dataset.sheetHost);
    h._grid = s.fields ? fieldGrid(h, s.fields, s.o) : new Grid(h, Object.assign({ preset: "panel", sheet: true, maxHeight: 4000 }, s.o)); });
}
// Tables placed with fieldTable/sheetTable come to life wherever they land: a block, a Sheet, a review page
new MutationObserver((muts) => { if (!SHEETS.size) return;
  for (const m of muts) for (const n of m.addedNodes) if (n.nodeType === 1 && (n.matches("[data-sheet-host]") || n.querySelector("[data-sheet-host]"))) mountSheets(n.parentElement || n);
}).observe(document.documentElement, { childList: true, subtree: true });
function fieldGrid(host, rows, o = {}) {
  return new Grid(host, Object.assign({ preset: "panel", head: false, sheet: true, maxHeight: 4000, title: "Fields", rows: rows.map((r, i) => ({ id: `f${i}`, ...r })),
    columns: [{ key: "label", label: "Field", w: o.labelW || 140, render: (r) => `<span class="text-gray-500">${esc(r.label)}</span>` },
      { key: "value", label: "Value", w: 160, grow: true, edit: (r) => (r.type === "none" ? null : r.type || "text"), options: (r) => r.options, placeholder: (r) => `Add ${r.label.replace(/^\w/, (m) => m.toLowerCase())}`, render: (r) => (r.html ? r.html(r) : esc(r.value)) }] }, o));
}

/* The same panel drawn in place (for pictures of a panel that's open) */
const sheetPanel = (o) => `<aside class="flex flex-col h-full bg-white border-s border-gray-200/80 shadow-[-12px_0_32px_-12px_rgba(17,24,39,0.16)] ${o.cls || ""}" style="width:${o.w || 520}px" aria-label="${esc(String(o.title).replace(/<[^>]+>/g, ""))}">${sheetInner(o)}</aside>`;

/* ============================================================ side sheet (one per page) */
const Sheet = {
  el: null,
  ensure() {
    if (this.el) return this.el;
    const el = document.createElement("aside");
    el.className = "sheet fixed inset-y-0 right-0 z-50 w-[520px] max-w-full bg-white border-s border-gray-200 shadow-[-12px_0_32px_-12px_rgba(17,24,39,0.16)] flex flex-col";
    el.setAttribute("aria-label", "Details"); el.dataset.open = "0"; el.setAttribute("role", "dialog");
    document.body.appendChild(el); this.el = el;
    el.addEventListener("click", (e) => { if (e.target.closest('[data-act="close-sheet"]')) this.close(); });
    // Escape closes the panel unless something inside it already used the key (a cell editor, a list, an Actions menu)
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !e.defaultPrevented && el.dataset.open === "1" && !e.target.closest?.('[data-role="edit"]')) this.close(); });
    // composedPath still holds the clicked node when a typed table re-drew it during the click, so that isn't "outside"
    document.addEventListener("mousedown", (e) => { if (el.dataset.open === "1" && !e.composedPath().includes(el) && !e.target.closest("[data-opens-sheet]")) this.close(); });
    return el;
  },
  /* {title, subtitle, lead (html avatar), tabs:[...], tab:0, body (html), footer (html), flush}
   * flush: the body is made of psec() sections whose dividers run edge to edge (the house rule). */
  open(o) {
    const el = this.ensure(); this.opener = document.activeElement;
    el.innerHTML = sheetInner(Object.assign({}, o, { closeAttrs: 'data-act="close-sheet"' }));
    el.dataset.open = "1"; icons();
    el.querySelector('[data-act="close-sheet"]').focus({ preventScroll: true });
  },
  close() { if (!this.el) return; this.el.dataset.open = "0"; if (this.opener && this.opener.focus) this.opener.focus({ preventScroll: true }); }
};

/* ============================================================ Grid (Attio), reusable
 * columns: [{ key, label, icon, w, num, edit, kind: 'text'|'num'|'money'|'date'|'list', render(row), value(row), open }]
 * preset: "page" | "section" | "panel" | "form" (see GRID_PRESETS above); any option below overrides it.
 * v2 options: viewButton: false drops the "Title · count" button when count tabs already name the view; noun names
 * the footer count ("entries", "claims"); a column's normal: [values] leaves those cells blank (status only when unusual;
 * v2 only: v4 fills every row, because a mostly blank column reads as broken).
 * gutter: the side padding of the page the grid sits in (default 16). The grid runs edge to edge through it; pass
 * 0 when the grid already touches both edges. box: true draws a full rounded border instead, for a grid that sits
 * among other content in a section (a settings list, a specimen).
 * For small tables in panels and dialogs: density "dense" (13px text, rows stay 36px) or "compact" (the ADA claim form's
 * AshaSpreadsheetTable density="compact": 28px rows, 8px cell padding, small uppercase headers on a light grey band,
 * the same grey under a totals row), lines: false (row lines only),
 * sortable: false, wrap (long text wraps instead of truncating), foot (a fixed totals row, one HTML string per
 * column, instead of the calculation footer) and rowAttrs(row) (extra attributes on each <tr>).
 * The first column is sticky and carries the row checkbox. A column with open:true renders a button
 * that calls onOpen(row).
 * sheet: true edits like a spreadsheet, the way AshaGrid does on the Lists pages: click an editable cell or type on it
 * to edit; Enter saves and moves down, Tab saves and moves to the next editable cell, Escape cancels. A column's edit is
 * true or "text", "select" (options: [...] or (row) => [...]), or (row) => one of those, for a table of a record's
 * fields. A list cell opens with the search right in the cell and the list underneath (pick: "list" drops the search).
 * placeholder(row) is the grey hint in an empty editable cell. arrow: "hover" (default: a list cell shows its arrow on
 * hover and when selected), "always" or "none". onCommit(row, key, value, grid) runs after a change; return a message
 * to mark the save as failed: the cell keeps the value with an orange icon, hover says why, click tries again. Saves
 * are otherwise silent. head: false drops the header row; a column with grow: true takes the room left over.
 * peek: (row) => html (use peekCard) shows the row's other details on hover, left of the panel the grid is in. */
let GRID_SEQ = 0;
const LIST_KINDS = new Set(["select", "multi"]);
const listValues = (v) => (Array.isArray(v) ? v : v ? String(v).split(/,\s*/) : []);
const CALC = { num: [null, "sum", "avg", "min", "max"], money: [null, "sum", "avg", "max"], text: [null, "filled", "empty"], list: [null, "filled", "empty"], date: [null, "latest", "earliest"] };
const CALC_LABEL = { sum: "Sum", avg: "Average", min: "Min", max: "Max", filled: "Filled", empty: "Empty", latest: "Latest", earliest: "Earliest" };
/* One data grid, four presentations. A table picks one by where it sits, then only overrides what it must.
 *   page     the main list of a page: edge to edge, 36px rows, cell lines, toolbar, sorting, select, totals
 *   section  a table among other content on a page: a card, 13px text, 36px rows, row lines only
 *   panel    a table in a flyout, dialog or popover: a card, compact (28px rows, small uppercase headers), row lines
 *   form     an ADA-style money sheet (claim lines, EOB, payment posting): compact with cell lines, like the claim form
 * BLOCKS-GUIDE.md "Data grid presentations" has the rules. */
const GRID_PRESETS = {
  page: {},
  section: { box: true, density: "dense", lines: false, toolbar: false, selectable: false, addColumn: false, footer: false },
  panel: { box: true, density: "compact", lines: false, toolbar: false, selectable: false, addColumn: false, footer: false, sortable: false },
  form: { box: true, density: "compact", lines: true, toolbar: false, selectable: false, addColumn: false, footer: false, sortable: false }
};
class Grid {
  constructor(root, o) {
    this.root = root; o = Object.assign({}, GRID_PRESETS[o.preset] || {}, o); this.o = Object.assign({ gutter: 16, box: false, viewButton: true, noun: "count", density: "default", lines: true, sortable: true, wrap: false, foot: null, rowAttrs: null, title: "All", maxHeight: 420, searchPlaceholder: "Search", filters: [], calc: {}, selectable: true, toolbar: true, footer: true, primary: null, bulk: null, views: null, empty: null, rowKey: "id", addColumn: true, sheet: false, head: true, arrow: "hover", pick: "search", onCommit: null }, o);
    this.instance = "g" + ++GRID_SEQ;
    this.baseline = { sort: o.defaultSort ? { ...o.defaultSort } : null, filters: {} };
    this.sort = this.baseline.sort && { ...this.baseline.sort }; this.filters = {}; this.q = ""; this.calc = { ...this.o.calc }; this.menu = false;
    this.setRows(o.rows || []);
    root.addEventListener("click", (e) => this.onClick(e));
    root.addEventListener("dblclick", (e) => this.onDbl(e));
    root.addEventListener("keydown", (e) => this.onKey(e));
    if (o.peek) { // details on hover (progressive disclosure)
      root.addEventListener("mouseover", (e) => { const tr = e.target.closest("tr.g-row"); if (tr && tr !== this.peekRow && !e.target.closest('[data-role="pick-menu"]')) { clearTimeout(this.peekT); this.peekRow = tr; this.peekT = setTimeout(() => Peek.show(tr, this.o.peek(this.visible[+tr.querySelector("td[data-r]").dataset.r])), 250); } });
      root.addEventListener("mouseleave", () => { clearTimeout(this.peekT); this.peekRow = null; Peek.hide(); });
    }
    root.addEventListener("input", (e) => { if (e.target.dataset.role === "search") { this.q = e.target.value; this.active = null; this.render(); }
      else if (e.target.dataset.role === "pick-search") { this.pickQ = e.target.value; this.pickHi = 0; this.drawPick(); } });
    root.addEventListener("focusout", (e) => { if (this.redrawing) return; if (e.target.dataset.role === "edit" && this.editing) this.commit(e.target.value, null, !this.o.sheet);
      else if (e.target.dataset.role === "pick-search" && this.editing && !this.root.contains(e.relatedTarget)) this.leaveList(false); });
    if (this.o.sheet) {
      this.failed = new Map();
      root.addEventListener("mousedown", (e) => this.onDown(e));
      // one highlight in a list: the mouse moves it, the same as the arrow keys
      root.addEventListener("mouseover", (e) => { const o = e.target.closest("[data-pick]"); if (o && +o.dataset.pick !== this.pickHi) this.hiTo(+o.dataset.pick); });
    }
    document.addEventListener("mousedown", (e) => { if (this.menu && !e.target.closest(`[data-menu="${this.instance}"]`)) { this.menu = false; this.render(); } });
    this.render();
  }
  get cols() { return this.o.columns; }
  /* Rebuild a hand-made <table> (with a <thead>) through the Grid, in its place, so a panel, dialog or section table
   * is the same component as the Lists pages. Keeps each cell's HTML and text colour, merged cells, a <tfoot>
   * totals row and row data-* attributes, and sizes the columns from the widths the table had, scaled to `width`. */
  static fromTable(table, host, o = {}) {
    const heads = [...table.tHead.rows[0].cells], spans = heads.map((th) => th.colSpan || 1);
    const starts = spans.map((_, i) => spans.slice(0, i).reduce((a, b) => a + b, 0));
    const keep = (td) => { const c = [...td.classList].filter((k) => /^!?(text-(gray|blue|orange|red|green|white)|font-|tabular-nums|line-through|italic)/.test(k)).join(" ");
      return c ? `<span class="${c}">${td.innerHTML}</span>` : td.innerHTML; };
    const cellsOf = (tr) => { const out = heads.map(() => ""); let pos = 0; [...tr.cells].forEach((td) => { const i = starts.indexOf(pos); if (i >= 0) out[i] = keep(td); pos += td.colSpan || 1; }); return out; };
    const text = (h) => { const d = document.createElement("div"); d.innerHTML = h; return d.textContent.replace(/\s+/g, " ").trim(); };
    const rows = [...(table.tBodies[0]?.rows || [])].map((tr, i) => ({ id: i, cells: cellsOf(tr),
      attrs: [...tr.attributes].filter((a) => a.name.startsWith("data-") || a.name.startsWith("aria-")).map((a) => `${a.name}="${esc(a.value)}"`).join(" ") }));
    const foot = table.tFoot && table.tFoot.rows[0] ? cellsOf(table.tFoot.rows[0]) : null;
    const isNum = (i) => /text-end|text-right/.test(heads[i].className) || (rows.some((r) => text(r.cells[i])) && rows.every((r) => /^([−\-–]?\$?[\d,.]+%?|—|–|)$/.test(text(r.cells[i]).replace(/\s/g, ""))));
    /* Column widths: start from the widths the table had; if the card is narrower, take the space first from columns
     * wider than their content, then from text columns. Number columns never shrink below their content. */
    const nat = (el) => { const r = document.createRange(); r.selectNodeContents(el); return Math.ceil(r.getBoundingClientRect().width) + 26; };
    const need = heads.map((th, i) => Math.max(nat(th), ...[...(table.tBodies[0]?.rows || [])].map((tr) => { let pos = 0, w = 0;
      [...tr.cells].forEach((td) => { if (pos === starts[i] && (td.colSpan || 1) === spans[i]) w = nat(td); pos += td.colSpan || 1; }); return w; })));
    const w = heads.map((th) => th.getBoundingClientRect().width), total = w.reduce((a, b) => a + b, 0);
    let over = total - (o.width || total);
    const take = (floor) => { const room = w.map((x, i) => Math.max(0, x - floor(i))), sum = room.reduce((a, b) => a + b, 0);
      if (over <= 0 || !sum) return; const cut = Math.min(over, sum); w.forEach((_, i) => (w[i] -= (room[i] / sum) * cut)); over -= cut; };
    take((i) => need[i]); take((i) => (isNum(i) ? need[i] : Math.min(need[i], 96)));
    const label = (th) => { const sr = th.querySelector(".sr-only"); return sr && !th.textContent.replace(sr.textContent, "").trim() ? "" : th.innerHTML; };
    const columns = heads.map((th, i) => ({ key: `c${i}`, label: label(th), w: Math.max(36, Math.floor(w[i])), num: isNum(i), kind: "text", render: (r) => r.cells[i], value: (r) => text(r.cells[i]) }));
    const long = rows.some((r) => r.cells.some((c) => text(c).length > 56));
    const g = new Grid(host, Object.assign({ columns, rows, title: text(heads.map((h) => h.textContent).join(" ")).slice(0, 60), toolbar: false, selectable: false, addColumn: false,
      preset: "panel", sortable: false, maxHeight: 4000, foot, wrap: long, rowAttrs: (r) => r.attrs }, o));
    /* Fit pass: every column grows to its widest cell; the widest text column gives up the room */
    const t = host.querySelector("table.g-table"), avail = host.firstElementChild.clientWidth;
    if (t && !long) {
      const cellW = (i) => Math.max(0, ...[...t.querySelectorAll(`td[data-c="${i}"]`), ...t.querySelectorAll(`tfoot td:nth-child(${i + 1})`)].map((td) => td.scrollWidth));
      const flex = columns.findIndex((c) => !c.num);
      columns.forEach((c, i) => { if (i !== flex) c.w = g.colWidth(Object.assign(c, { w: Math.max(c.w, cellW(i)) }), i); });
      if (flex >= 0) columns[flex].w = Math.max(64, avail - columns.reduce((a, c, i) => a + (i === flex ? 0 : c.w), 0));
      g.render();
    }
    return g;
  }
  /* Cell classes for the density and row-lines-only settings; part is "th" or "td" */
  fit(part = "td") { const d = this.o.density;
    return cx(d === "dense" && (part === "th" ? "!h-9 !text-[13px]" : "!text-[13px]"),
      d === "compact" && (part === "th" ? "!h-7 !px-2 !text-xs !font-semibold uppercase tracking-wide !bg-gray-50" : part === "foot" ? cx("!h-7 !px-2 !text-[13px] leading-none", V4 ? "!bg-white" : "!bg-gray-50")
        : cx("!h-7 !px-2 !text-[13px] leading-none", V2 && "[&_button]:!h-6 [&_input]:!h-6 [&_select]:!h-6")), !this.o.lines && "!border-e-0"); }
  /* Only a chip that wasn't on screen last render animates in */
  chipClass(key) { this._chipsNow = this._chipsNow || new Set(); this._chipsNow.add(key); return this._chipsSeen && !this._chipsSeen.has(key) ? "asha-chip-in" : ""; }
  /* A column is never narrower than its header: padding + icon + label + sort arrow (+ checkbox on the first) */
  colWidth(c, ci) {
    const ctx = Grid._ctx || (Grid._ctx = document.createElement("canvas").getContext("2d"));
    ctx.font = '500 14px Inter, ui-sans-serif, system-ui, sans-serif';
    const compact = this.o.density === "compact", label = String(c.label).replace(/<[^>]+>/g, "");
    ctx.font = compact ? "600 12px Inter, ui-sans-serif, system-ui, sans-serif" : `500 ${this.o.density === "dense" ? 13 : 14}px Inter, ui-sans-serif, system-ui, sans-serif`;
    const need = (compact ? 16 : 24) + 2 + (c.icon ? 20 : 0) + Math.ceil(ctx.measureText(compact ? label.toUpperCase() : label).width + (compact ? label.length * 0.3 : 0)) + (this.o.sortable ? 20 : 0) + (ci === 0 && this.o.selectable ? 26 : 0);
    return Math.max(c.w, need);
  }
  setRows(rows) { this.data = rows.map((r) => ({ ...r })); this.sel = new Set(); this.active = null; this.editing = null; }
  val(r, c) { return c.value ? c.value(r) : r[c.key]; }
  rowsView() {
    const q = this.q.trim().toLowerCase();
    let rows = this.data.filter((r) => Object.entries(this.filters).every(([k, v]) => v == null || (this.o.filters.find((f) => f.key === k)?.match || ((row, val) => row[k] === val))(r, v))
      && (!q || (this.o.searchText ? this.o.searchText(r) : this.cols.map((c) => this.val(r, c)).join(" ")).toLowerCase().includes(q)));
    const s = this.sort;
    if (s) { const c = this.cols.find((x) => x.key === s.key);
      rows = [...rows].sort((a, b) => { const va = this.val(a, c), vb = this.val(b, c);
        const ea = va === "" || va == null, eb = vb === "" || vb == null; if (ea && !eb) return 1; if (eb && !ea) return -1;
        return (typeof va === "number" ? va - vb : String(va).localeCompare(String(vb))) * s.dir; }); }
    return rows;
  }
  dirty() { return JSON.stringify(this.sort) !== JSON.stringify(this.baseline.sort) || JSON.stringify(this.filters) !== JSON.stringify(this.baseline.filters); }
  cell(r, c, ci) {
    if (this.o.sheet) { const s = this.sheetCell(r, c); if (s != null) return s; }
    if (this.editing && this.editing.id === r[this.o.rowKey] && this.editing.key === c.key)
      return `<input data-role="edit" class="w-full h-full bg-transparent outline-hidden text-sm text-gray-800 ${c.num ? "text-end tabular-nums" : ""}" value="${esc(r[c.key])}" aria-label="${esc(c.label)}" />`;
    // v2: a value listed as the column's normal one ("Active", "Signed", "$0.00") leaves the cell blank; it still sorts and filters
    if (V2 && !V4 && c.normal && ci > 0 && c.normal.includes(this.val(r, c))) return ""; // v4: no patchy columns, every row shows its value
    let inner = c.render ? c.render(r) : esc(r[c.key] ?? "");
    if (c.open) inner = `<button type="button" data-act="open" data-opens-sheet data-id="${r[this.o.rowKey]}" class="min-w-0 truncate font-medium text-gray-800 hover:underline decoration-gray-300 underline-offset-4 cursor-pointer text-start">${inner}</button>`;
    if (ci === 0 && this.o.selectable) inner = `<div class="flex items-center gap-x-2.5 min-w-0">${checkbox(this.sel.has(r[this.o.rowKey]), "Select row", `data-act="sel" data-id="${r[this.o.rowKey]}"`)}${c.lead ? c.lead(r) : ""}${inner}</div>`;
    else if (ci === 0 && c.lead) inner = `<div class="flex items-center gap-x-2.5 min-w-0">${c.lead(r)}${inner}</div>`;
    return inner;
  }
  /* ---- spreadsheet editing (sheet: true) ---- */
  /* A list cell: "select" picks one (the list closes on a pick); "multi" picks several: chips in the cell, checkboxes in
   * the list, which stays open while you tick; Enter ticks, Backspace in an empty search drops the last chip; Escape,
   * Tab or clicking away keeps what you ticked. Values of a multi cell are arrays (a "a, b" string also works). */
  editKind(c, r) { if (!r) return null; const k = typeof c.edit === "function" ? c.edit(r) : c.edit; return k === true ? "text" : k || null; }
  optionsFor(c, r) { const o = (typeof c.options === "function" ? c.options(r) : c.options) || []; return o.map((x) => (typeof x === "string" ? { value: x, label: x } : x)); }
  editCtx() { return { c: this.cols.find((x) => x.key === this.editing.key), r: this.data.find((x) => x[this.o.rowKey] === this.editing.id) }; }
  sheetCell(r, c) {
    const kind = this.editKind(c, r); if (!kind) return null;
    const K = this.o.rowKey, ed = this.editing && this.editing.id === r[K] && this.editing.key === c.key, size = this.o.density === "default" ? "text-sm" : "text-[13px]";
    const name = esc(String(c.label || r.label || "").replace(/<[^>]+>/g, ""));
    const lab = (x) => (this.optionsFor(c, r).find((o) => o.value === x) || { label: x }).label;
    if (ed && kind === "text") return `<input data-role="edit" class="w-full h-full bg-transparent outline-hidden ${size} text-gray-900 placeholder:text-gray-400 ${c.num ? "text-end tabular-nums" : ""}" value="${esc(this.editing.seed ?? (c.kind === "money" && r[c.key] !== "" && r[c.key] != null ? money(+r[c.key]) : r[c.key] ?? ""))}" placeholder="${esc(c.placeholder ? c.placeholder(r) : "")}" aria-label="${name}" />`;
    if (ed && kind === "multi") return `<div class="flex items-center gap-1 min-w-0 overflow-hidden">${this.editing.draft.map((v) => `<span class="${cx(R.tag, R.tagGray)} shrink-0 !pe-0.5 gap-0.5">${esc(lab(v))}<button type="button" data-unpick="${esc(v)}" tabindex="-1" aria-label="Remove ${esc(lab(v))}" class="inline-flex size-4 items-center justify-center rounded-sm text-gray-500 hover:bg-gray-200 hover:text-gray-800 cursor-pointer">${I("x", "size-3")}</button></span>`).join("")}<input data-role="pick-search" role="combobox" aria-expanded="true" aria-controls="${this.instance}-pick" aria-label="${name}" class="min-w-12 grow bg-transparent outline-hidden ${size} text-gray-900 placeholder:text-gray-400" value="${esc(this.pickQ)}" placeholder="${this.editing.draft.length ? "" : "Search…"}" /></div>`;
    if (ed && kind === "select" && this.o.pick === "search") { const cur = this.optionsFor(c, r).find((o) => o.value === r[c.key]);
      return `<div class="flex items-center gap-1.5 min-w-0">${I("search", "size-3.5 shrink-0 text-gray-400")}<input data-role="pick-search" role="combobox" aria-expanded="true" aria-controls="${this.instance}-pick" aria-label="${name}" class="min-w-0 grow bg-transparent outline-hidden ${size} text-gray-900 placeholder:text-gray-400" value="${esc(this.pickQ)}" placeholder="${esc(cur ? cur.label : "Search…")}" /></div>`; }
    const v = r[c.key], vals = kind === "multi" ? listValues(v) : null, empty = vals ? !vals.length : v === "" || v == null, fail = this.failed.get(`${r[K]}:${c.key}`);
    const inner = empty ? (c.placeholder ? `<span class="text-gray-400">${esc(c.placeholder(r))}</span>` : "") : vals ? `<span class="inline-flex items-center gap-1">${vals.map((x) => `<span class="${cx(R.tag, R.tagGray)} shrink-0">${esc(lab(x))}</span>`).join("")}</span>` : c.render ? c.render(r) : esc(v);
    const arrow = LIST_KINDS.has(kind) && this.o.arrow !== "none" ? `<span class="ms-auto inline-flex shrink-0">${I("chevron-down", cx("g-arrow size-3.5 text-gray-400", this.o.arrow === "always" && "g-arrow-on", ed && "g-arrow-open"))}</span>` : "";
    const mark = fail ? `<button type="button" data-act="retry" data-cid="${esc(`${r[K]}:${c.key}`)}" data-tip="${esc(fail)} Click to try again." aria-label="Couldn't save. Try again" class="inline-flex shrink-0 cursor-pointer">${I("circle-alert", "size-3.5 text-orange-500")}</button>` : "";
    return `<div class="flex items-center gap-1.5 min-w-0 ${c.num ? "justify-end" : ""}"><span class="min-w-0 truncate">${inner}</span>${mark}${arrow}</div>`;
  }
  pickItems() {
    const { c, r } = this.editCtx(), q = this.o.pick === "search" ? (this.pickQ || "").trim().toLowerCase() : "";
    const opts = this.optionsFor(c, r).filter((o) => !q || o.label.toLowerCase().includes(q));
    this.pickList = opts; this.pickHi = Math.min(this.pickHi || 0, Math.max(0, opts.length - 1));
    if (!opts.length) return `<p class="px-2 py-2 text-[13px] text-gray-500">No matches</p>`;
    // a multi list ticks a box before the label; a single list checks after it
    const multi = this.editing.kind === "multi", on = new Set(multi ? this.editing.draft : [r[c.key]]);
    return opts.map((o, i) => { const sel = on.has(o.value);
      const box = multi ? `<span class="${cx("inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] border", sel ? "bg-blue-600 border-blue-600 [&_svg]:!text-white" : "border-gray-300 bg-white")}">${sel ? I("check", "!size-3") : ""}</span>` : "";
      return `<button type="button" role="option" tabindex="-1" aria-selected="${sel}" data-pick="${i}" data-hi="${i === this.pickHi ? 1 : 0}" class="${cx(R.menuItem, i === this.pickHi && "!bg-gray-100")}">${box}<span class="min-w-0 grow truncate text-start">${esc(o.label)}</span>${sel && !multi ? I("check", "!text-blue-600") : ""}</button>`; }).join("");
  }
  pickMenu() { return `<div data-role="pick-menu" id="${this.instance}-pick" role="listbox" class="${R.menu.replace("asha-pop ", "").replace("w-60", "w-max")} fixed z-50 max-h-64 overflow-y-auto" style="left:0;top:0;max-width:360px;visibility:hidden">${this.pickItems()}</div>`; }
  hiTo(i) { this.pickHi = i; this.root.querySelectorAll("[data-pick]").forEach((b) => { const on = +b.dataset.pick === i; b.dataset.hi = on ? 1 : 0; b.classList.toggle("!bg-gray-100", on); }); }
  /* Leaving a list (Escape, Tab, a click elsewhere): a multi cell keeps what was ticked; a single list changes nothing */
  leaveList(refocus = true, move) { if (!this.editing) return; if (this.editing.kind === "multi") return this.commit(this.editing.draft, move, refocus); this.cancelEdit(refocus); if (move) { this.step(...move); this.render(); } }
  drawPick() { const m = this.root.querySelector('[data-role="pick-menu"]'); if (!m) return; m.innerHTML = this.pickItems(); icons(); const hi = m.querySelector('[data-hi="1"]'); if (hi) hi.scrollIntoView({ block: "nearest" }); }
  /* The list is fixed-positioned so a scrolling panel can't clip it; measured against its own origin so it also lands
   * right inside a scaled preview frame. It animates in only after it's placed. */
  placePick() { const m = this.root.querySelector('[data-role="pick-menu"]'), td = this.root.querySelector('td[data-active="1"]'); if (!m || !td) return;
    m.style.left = "0px"; m.style.top = "0px"; const o = m.getBoundingClientRect(), t = td.getBoundingClientRect(), s = t.width / td.offsetWidth || 1;
    m.style.minWidth = `${Math.max(220, td.offsetWidth)}px`; m.style.left = `${(t.left - o.left) / s}px`; m.style.top = `${(t.bottom - o.top) / s + 4}px`;
    if (m.style.visibility) { m.style.visibility = ""; m.classList.add("asha-pop"); } }
  focusGrid() { const g = this.root.querySelector('[data-role="grid"]'); if (g) g.focus({ preventScroll: true }); }
  cancelEdit(refocus = true) { this.editing = null; this.render(); if (refocus) this.focusGrid(); }
  choose(i, move) { const o = (this.pickList || [])[i]; if (!o) return this.editing && this.editing.kind === "multi" ? null : this.cancelEdit();
    if (this.editing.kind === "multi") { const d = this.editing.draft, at = d.indexOf(o.value); at < 0 ? d.push(o.value) : d.splice(at, 1); this.pickQ = ""; this.pickHi = i; return this.render(); }
    this.commit(o.value, move); }
  /* Moves the selected cell: dr moves down/up a row; dc moves to the next/previous editable cell, row after row. */
  step(dr, dc) { const rows = this.visible.length, cols = this.cols.length; if (!this.active || !rows) return false; const { r, c } = this.active;
    if (dr) { this.active = { r: Math.min(rows - 1, Math.max(0, r + dr)), c }; return true; }
    for (let i = r * cols + c + dc; i >= 0 && i < rows * cols; i += dc) { const rr = Math.floor(i / cols), cc = i % cols; if (this.editKind(this.cols[cc], this.visible[rr])) { this.active = { r: rr, c: cc }; return true; } }
    return false; }
  onDown(e) {
    const p = e.target.closest("[data-pick]"); if (p) { e.preventDefault(); return this.choose(+p.dataset.pick); }
    const u = e.target.closest("[data-unpick]"); if (u && this.editing) { e.preventDefault(); this.editing.draft = this.editing.draft.filter((v) => v !== u.dataset.unpick); return this.render(); }
    if (e.target.closest('[data-act], [data-role="edit"], [data-role="pick-search"], [data-role="pick-menu"]')) return;
    const td = e.target.closest("td[data-r]"); if (!td) return;
    e.preventDefault();
    const a = { r: +td.dataset.r, c: +td.dataset.c }, same = this.editing && this.active && this.active.r === a.r && this.active.c === a.c;
    if (this.editing) { const inp = this.root.querySelector('[data-role="edit"]'); inp ? this.commit(inp.value) : this.leaveList(false); }
    this.quiet = false;
    if (same) return this.focusGrid(); // a second click on an open list closes it
    this.active = a;
    if (this.editKind(this.cols[a.c], this.visible[a.r])) this.startEdit(); else { this.render(); this.focusGrid(); }
  }
  pickKey(e) { const n = (this.pickList || []).length, back = e.shiftKey ? -1 : 1;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); if (n) this.pickHi = (this.pickHi + (e.key === "ArrowDown" ? 1 : -1) + n) % n; return this.drawPick(); }
    const multi = this.editing.kind === "multi";
    if (e.key === "Enter") { e.preventDefault(); return this.choose(this.pickHi, multi ? undefined : [1, 0]); }
    if (multi && e.key === "Backspace" && !this.pickQ && this.editing.draft.length) { e.preventDefault(); this.editing.draft.pop(); return this.render(); }
    if (e.key === "Tab") { e.preventDefault(); if (this.pickQ && !multi) return this.choose(this.pickHi, [0, back]); return this.leaveList(true, [0, back]); }
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); return this.leaveList(true); }
  }
  calcValue(c, rows) {
    const m = this.calc[c.key]; if (!m) return null;
    const vals = rows.map((r) => this.val(r, c));
    const filled = vals.filter((v) => (Array.isArray(v) ? v.length : v !== "" && v != null)).length;
    const f = c.kind === "money" ? (v) => money(v) : (v) => v;
    let v;
    if (m === "sum") v = f(vals.reduce((a, b) => a + (+b || 0), 0));
    else if (m === "avg") v = rows.length ? (c.kind === "money" ? money(vals.reduce((a, b) => a + (+b || 0), 0) / rows.length) : (vals.reduce((a, b) => a + (+b || 0), 0) / rows.length).toFixed(1)) : "–";
    else if (m === "min") v = rows.length ? f(Math.min(...vals)) : "–";
    else if (m === "max") v = rows.length ? f(Math.max(...vals)) : "–";
    else if (m === "filled") v = filled;
    else if (m === "empty") v = rows.length - filled;
    else { const s = vals.filter(Boolean).sort(); v = s.length ? fmtDate(m === "latest" ? s[s.length - 1] : s[0]) : "–"; }
    return `<span class="text-gray-400">${CALC_LABEL[m]}</span> <span class="font-medium text-gray-700 tabular-nums">${v}</span>`;
  }
  toolbar() {
    const chips = [];
    for (const f of this.o.filters) { const v = this.filters[f.key]; if (v == null) continue; const opt = f.options.find((o) => o.value === v);
      chips.push(`${condChip(f.label, "is", `${esc(opt ? opt.label : v)}`, `data-act="clear-filter" data-key="${f.key}"`, `Remove ${esc(f.label)} filter`, this.chipClass(`f:${f.key}=${v}`))}`); }
    const defaultSort = V2 && JSON.stringify(this.sort) === JSON.stringify(this.baseline.sort);
    if (this.sort && !defaultSort) { const col = this.cols.find((c) => c.key === this.sort.key);
      chips.push(`${condChip("Sorted by", "", `${col.label} ${I(this.sort.dir > 0 ? "arrow-up" : "arrow-down", "size-3.5")}`, `data-act="clear-sort"`, `Remove sort`, this.chipClass(`s:${this.sort.key}`))}`); }
    const menu = this.menu ? `<div class="absolute start-0 top-full mt-1 z-30 ${R.menu}" role="menu">${this.o.filters.map((f) => `<p class="${R.menuLabel}">${f.label} is…</p>${f.options.map((o) => `<button type="button" role="menuitem" class="${R.menuItem}" data-act="pick-filter" data-key="${f.key}" data-v="${esc(o.value)}">${o.tone ? `<span class="${cx(R.dot, TONE_DOT[o.tone])}"></span>` : ""}${esc(o.label)}${this.filters[f.key] === o.value ? I("check", "ms-auto !text-blue-600") : ""}</button>`).join("")}`).join(`<div class="${R.menuSep}"></div>`)}</div>` : "";
    const p = this.o.primary;
    return `<div class="flex items-center gap-2 py-2.5 flex-nowrap min-w-0">
      ${V2 && !this.o.viewButton ? "" : `<button type="button" class="${cx(R.btn, R.sm, R.ghost, "-ms-2 shrink-0")}">${esc(this.o.title)} <span class="${R.count}">${this.data.length}</span>${I("chevron-down", "!text-gray-400")}</button>
      <span class="h-5 shrink-0 border-s border-gray-200/80"></span>`}
      ${searchBox(this.o.searchPlaceholder, { w: this.o.searchWidth || "w-48", value: this.q, attrs: 'data-role="search"' })}
      ${chips.length ? `<div class="flex min-w-0 items-center gap-2 overflow-x-auto [scrollbar-width:none]">${chips.join("")}</div>` : ""}
      ${this.o.filters.length ? `<div class="relative shrink-0" data-menu="${this.instance}">${button("Filter", { v: "quiet", s: V2 ? "sm" : "xs", icon: "list-filter", attrs: `data-act="filter" aria-haspopup="menu" aria-expanded="${this.menu}"` })}${menu}</div>` : ""}
      <div class="ms-auto flex shrink-0 items-center gap-1.5">
        ${this.dirty() ? button("Discard", { v: "quiet", s: V2 ? "sm" : "xs", attrs: 'data-act="discard"' }) + button("Save view", { v: "soft", s: V2 ? "sm" : "xs", attrs: 'data-act="save"' }) + '<span class="h-5 mx-1 border-s border-gray-200/80"></span>' : ""}
        ${this.o.toolbarExtra || ""}
        ${iconButton("ellipsis", "More, including columns", { s: "iconSm" })}
        ${p ? button(p.label, { v: "solid", s: "sm", icon: p.icon || "plus", attrs: 'data-act="new"' }) : ""}
      </div></div>`;
  }
  render() {
    const ae = document.activeElement, inside = ae && this.root.contains(ae);
    const hadSearch = inside && ae.dataset.role === "search", hadGrid = inside && ae.dataset.role === "grid";
    const rows = this.rowsView(); this.visible = rows; this._chipsNow = new Set();
    const K = this.o.rowKey;
    const allSel = rows.length && rows.every((r) => this.sel.has(r[K])), someSel = rows.some((r) => this.sel.has(r[K]));
    const widths = this.cols.map((c, ci) => this.colWidth(c, ci));
    const minW = widths.reduce((a, w) => a + w, 0) + (this.o.addColumn ? 56 : 0);
    const head = this.cols.map((c, ci) => {
      const sorted = this.sort && this.sort.key === c.key;
      const lbl = !this.o.sortable ? `<span class="inline-flex ${ci ? "w-full" : ""} items-center gap-x-1.5 ${c.num ? "justify-end" : ""}">${c.icon ? I(c.icon, "size-3.5 shrink-0 text-gray-400") : ""}<span class="truncate">${c.label}</span></span>`
        : `<button type="button" data-act="sort" data-key="${c.key}" class="inline-flex ${ci ? "w-full" : ""} items-center gap-x-1.5 cursor-pointer hover:text-gray-800 ${c.num ? "justify-end" : ""}">${c.icon ? I(c.icon, "size-3.5 shrink-0 text-gray-400") : ""}<span class="truncate">${c.label}</span>${sorted ? I(this.sort.dir > 0 ? "arrow-up" : "arrow-down", "size-3.5 shrink-0 text-blue-600") : ""}</button>`;
      const inner = ci === 0 && this.o.selectable ? `<div class="flex items-center gap-x-2.5">${checkbox(allSel, "Select all", 'data-act="selall"')}${lbl}</div>` : lbl;
      return `<th scope="col" class="${cx(R.gridHead, ci === 0 && "g-sticky", this.fit("th"))}" aria-sort="${sorted ? (this.sort.dir > 0 ? "ascending" : "descending") : "none"}">${inner}</th>`;
    }).join("") + (this.o.addColumn ? `<th class="${R.gridHead} !border-e-0">${iconButton("plus", "Add column", { s: "iconXs" })}</th>` : "");
    const fresh = this.fresh || new Set(), glow = this.glowRows || new Set();
    const body = rows.map((r, ri) => `<tr class="g-row ${fresh.has(r[K]) ? "asha-row-in" : glow.has(r[K]) ? "asha-glow-cells" : ""}" ${this.o.rowAttrs ? this.o.rowAttrs(r) : ""} data-sel="${this.sel.has(r[K]) ? 1 : 0}" data-open="${this.openId === r[K] ? 1 : 0}">${this.cols.map((c, ci) => {
      const act = this.active && this.active.r === ri && this.active.c === ci;
      const glowCell = this.glowCell && this.glowCell.id === r[K] && this.glowCell.key === c.key;
      const ek = this.o.sheet && this.editKind(c, r);
      return `<td class="${cx(R.gridCell, ci === 0 && "g-sticky", c.num && "text-end tabular-nums", glowCell && "asha-glow", this.fit(), this.o.wrap && "!whitespace-normal !h-auto py-2 align-top", ek && (LIST_KINDS.has(ek) ? "cursor-pointer" : "cursor-text"))}" data-r="${ri}" data-c="${ci}" data-active="${act ? 1 : 0}"${ek ? ' data-edit="1"' : ""}>${this.cell(r, c, ci)}</td>`;
    }).join("")}${this.o.addColumn ? `<td class="border-b border-gray-200/80"></td>` : ""}</tr>`).join("");
    const foot = this.o.foot ? `<tr class="g-foot">${this.cols.map((c, ci) => `<td class="${cx(R.gridFoot, ci === 0 && "g-sticky", c.num && "text-end tabular-nums", this.o.density === "default" && "!h-9 !text-sm", this.o.density === "dense" && "!h-9", this.fit("foot"), "font-medium !text-gray-800")}">${this.o.foot[ci] || ""}</td>`).join("")}</tr>`
      : `<tr class="g-foot">${this.cols.map((c, ci) => ci === 0
      ? `<td class="${cx(R.gridFoot, "g-sticky")}"><span class="font-medium text-gray-700 tabular-nums">${rows.length}</span> <span class="text-gray-400">${esc(this.o.noun)}</span></td>`
      : `<td class="${cx(R.gridFoot, c.num && "text-end")}"><button type="button" data-act="calc" data-key="${c.key}" class="w-full cursor-pointer ${c.num ? "text-end" : "text-start"} hover:text-gray-600">${this.calcValue(c, rows) || `<span class="g-addcalc">+ Add calculation</span>`}</button></td>`).join("")}${this.o.addColumn ? "<td></td>" : ""}</tr>`;
    const e = this.o.empty || {};
    const empty = !rows.length ? `<div class="${cx("border-b border-gray-200/80", V2 && (this.o.box ? "border-x rounded-b-lg" : edgeToEdge(this.o.gutter)))}">${this.data.length
      ? emptyState({ icon: "search-x", title: "Nothing matches", body: "Try a different search or remove a filter.", action: button("Clear filters", { v: "white", s: "sm", attrs: 'data-act="clear-all"' }) })
      : emptyState({ icon: e.icon || "inbox", title: e.title || "Nothing here yet", body: e.body || "", action: e.action ? button(e.action, { v: "white", s: "sm", icon: "plus", attrs: 'data-act="new"' }) : "" })}</div>` : "";
    const n = this.sel.size, bulk = this.o.bulk || [{ label: "Export", icon: "download" }];
    const markup = `${this.o.toolbar ? this.toolbar() : ""}
      <div class="${cx(R.gridWrap, this.o.sheet && "g-sheet", this.o.box ? cx("!border rounded-lg [&_tr>*:last-child]:!border-e-0", V2 && "bg-white") : edgeToEdge(this.o.gutter), this.o.box && (!(this.o.foot || this.o.footer) || this.o.foot) && "[&_tbody_tr:last-child>td]:!border-b-0")}" style="max-height:${this.o.maxHeight}px" tabindex="0" data-role="grid" role="grid" aria-label="${esc(this.o.title)}" aria-rowcount="${rows.length}">
        <table class="g-table table-fixed w-full" style="min-width:${minW}px">
          <colgroup>${widths.map((w, i) => (this.cols[i].grow ? "<col>" : `<col style="width:${w}px">`)).join("")}${this.o.addColumn ? "<col>" : ""}</colgroup>
          ${this.o.head ? `<thead><tr>${head}</tr></thead>` : ""}<tbody>${body}</tbody>${rows.length && (this.o.foot || this.o.footer) ? `<tfoot>${foot}</tfoot>` : ""}
        </table></div>${empty}${this.o.sheet && this.editing && LIST_KINDS.has(this.editing.kind) ? this.pickMenu() : ""}
      ${this.o.selectable ? `<div class="${R.bulkBar}" style="${n ? "" : "opacity:0;pointer-events:none;transform:translate(-50%,12px)"}" role="toolbar" aria-label="Selected rows" ${n ? "" : 'aria-hidden="true"'}>
        <span class="me-2 font-medium tabular-nums">${n} selected</span><span class="h-5 me-1 border-s border-white/15"></span>
        ${bulk.map((b, i) => button(b.label, { v: "onDark", s: "sm", icon: b.icon, cls: b.danger ? "!text-red-300 hover:!bg-red-500/15" : "", attrs: `data-act="bulk" data-i="${i}"` })).join("")}
        <span class="h-5 mx-1 border-s border-white/15"></span>
        <button type="button" class="${cx(R.btn, R.sm, R.iconSm, R.onDark)}" data-act="bulk-clear" aria-label="Clear selection">${I("x")}</button></div>` : ""}`;
    // the browser reports focus leaving the old cell while it's replaced; that isn't the user leaving
    this.redrawing = true; try { this.root.innerHTML = markup; } finally { this.redrawing = false; }
    const selAll = this.root.querySelector('[data-act="selall"]'); if (selAll) selAll.indeterminate = !allSel && someSel;
    if (this.popSel != null) { Motion.play(this.root.querySelector(`[data-act="sel"][data-id="${this.popSel}"]`), "asha-check-pop"); this.popSel = null; }
    this._chipsSeen = this._chipsNow; this.fresh = null; this.glowRows = null; this.glowCell = null;
    icons();
    if (hadSearch) { const s = this.root.querySelector('[data-role="search"]'); s.focus(); s.setSelectionRange(s.value.length, s.value.length); }
    const ed = this.root.querySelector('[data-role="edit"], [data-role="pick-search"]');
    // sheet cells open with the caret at the end of the text they showed (no select-all flash, nothing moves); list searches start empty
    if (ed) { if (!this.quiet) ed.focus({ preventScroll: !!this.o.sheet }); if (this.o.sheet) ed.setSelectionRange(ed.value.length, ed.value.length); else ed.select(); }
    else if (hadGrid) this.focusGrid();
    const a = this.root.querySelector('[data-active="1"]'); if (a && (hadGrid || (ed && !this.quiet))) a.scrollIntoView({ block: "nearest", inline: "nearest" });
    if (this.o.sheet) {
      // at most one list is open on the page; the page-level listeners below act on it
      if (this.editing && LIST_KINDS.has(this.editing.kind)) Grid.openList = this; else if (Grid.openList === this) Grid.openList = null;
      this.placePick();
    }
  }
  commit(value, move, refocus = true) {
    const { id, key } = this.editing; this.editing = null;
    const c = this.cols.find((x) => x.key === key); const row = this.data.find((r) => r[this.o.rowKey] === id);
    const before = row && row[key];
    if (row && value != null && String(row[key]) !== String(value)) this.glowCell = { id, key };
    if (row && Array.isArray(value)) row[key] = [...value];
    else if (row && value != null) { const n = parseFloat(String(value).replace(/[^0-9.\-]/g, "")); row[key] = c.kind === "num" || c.kind === "money" ? (isFinite(n) ? n : row[key]) : value.trim() || (c.required ? row[key] : ""); }
    if (this.o.sheet) {
      if (row && String(before ?? "") !== String(row[key] ?? "") && this.o.onCommit) { const why = this.o.onCommit(row, key, row[key], this); why ? this.failed.set(`${id}:${key}`, why) : this.failed.delete(`${id}:${key}`); }
      if (move) this.step(...move);
    }
    this.render(); if (refocus) this.focusGrid();
  }
  startEdit(seed) { if (!this.active) return; const c = this.cols[this.active.c], r = this.visible[this.active.r], kind = this.editKind(c, r);
    if (kind && r) { this.editing = { id: r[this.o.rowKey], key: c.key };
      if (this.o.sheet) { Object.assign(this.editing, { kind, seed, draft: kind === "multi" ? [...listValues(r[c.key])] : null }); this.pickQ = LIST_KINDS.has(kind) && seed != null ? seed : ""; this.pickHi = seed != null ? 0 : Math.max(0, this.optionsFor(c, r).findIndex((o) => o.value === r[c.key])); }
      this.render(); } }
  onClick(e) {
    const t = e.target.closest("[data-act]"); const act = t && t.dataset.act; const K = this.o.rowKey;
    if (act) {
      if (act === "retry") { const cid = t.dataset.cid, at = cid.lastIndexOf(":"), key = cid.slice(at + 1), row = this.data.find((r) => String(r[K]) === cid.slice(0, at));
        const why = row && this.o.onCommit && this.o.onCommit(row, key, row[key], this); if (why) this.failed.set(cid, why); else { this.failed.delete(cid); if (row) this.glowCell = { id: row[K], key }; } return this.render(); }
      const raw = t.dataset.id, id = this.data.some((r) => r[K] === raw) ? raw : +raw;
      if (act === "sort") { const k = t.dataset.key; this.sort = this.sort && this.sort.key === k ? (this.sort.dir > 0 ? { key: k, dir: -1 } : null) : { key: k, dir: 1 }; return this.render(); }
      if (act === "sel") { this.sel.has(id) ? this.sel.delete(id) : this.sel.add(id); if (this.sel.has(id)) this.popSel = id; return this.render(); }
      if (act === "selall") { const all = this.visible.every((r) => this.sel.has(r[K])); this.visible.forEach((r) => (all ? this.sel.delete(r[K]) : this.sel.add(r[K]))); return this.render(); }
      if (act === "open") { e.stopPropagation(); const row = this.data.find((r) => r[K] === id); this.openId = id; this.render(); if (this.o.onOpen) this.o.onOpen(row, this); return; }
      if (act === "calc") { const c = this.cols.find((x) => x.key === t.dataset.key); const opts = CALC[c.kind || "text"]; this.calc[c.key] = opts[(opts.indexOf(this.calc[c.key] ?? null) + 1) % opts.length]; return this.render(); }
      if (act === "filter") { this.menu = !this.menu; return this.render(); }
      if (act === "pick-filter") { const k = t.dataset.key, v = t.dataset.v; this.filters[k] = this.filters[k] === v ? null : v; if (this.filters[k] == null) delete this.filters[k]; this.menu = false; return this.render(); }
      if (act === "clear-filter") { delete this.filters[t.dataset.key]; return this.render(); }
      if (act === "clear-sort") { this.sort = null; return this.render(); }
      if (act === "clear-all") { this.filters = {}; this.q = ""; return this.render(); }
      if (act === "discard") { this.sort = this.baseline.sort && { ...this.baseline.sort }; this.filters = { ...this.baseline.filters }; return this.render(); }
      if (act === "save") { this.baseline = { sort: this.sort && { ...this.sort }, filters: { ...this.filters } }; this.render(); if (V2) return; return toast(`Saved to “${esc(this.o.title)}”`); }
      if (act === "bulk-clear") { this.sel.clear(); return this.render(); }
      if (act === "bulk") { const b = (this.o.bulk || [])[+t.dataset.i]; const picked = this.data.filter((r) => this.sel.has(r[K])), n = picked.length, snapshot = this.data.slice();
        if (b && b.run) { b.run(picked, this); this.glowRows = new Set(picked.map((r) => r[K])); }
        this.sel.clear(); this.render();
        const what = `${n} ${n === 1 ? "row" : "rows"}`;
        if (b && b.danger) return toast(`Deleted ${what}`, { icon: "trash-2", action: "Undo", onAction: () => { this.data = snapshot; this.fresh = new Set(picked.map((r) => r[K])); this.render(); } });
        if (V2) return; // routine bulk actions: the row glow is the feedback
        return toast(b && b.run ? `${b.label}: ${what} done` : `${b ? b.label : "Done"} · ${what}`); }
      if (act === "new" && this.o.onNew) return this.o.onNew(this);
      return;
    }
    const td = e.target.closest("td[data-r]");
    if (td && !this.editing && !this.o.sheet) { this.active = { r: +td.dataset.r, c: +td.dataset.c }; this.render(); this.focusGrid(); }
  }
  onDbl(e) { const td = e.target.closest("td[data-r]"); if (td && !e.target.closest("[data-act]")) { this.active = { r: +td.dataset.r, c: +td.dataset.c }; this.startEdit(); } }
  onKey(e) {
    if (this.o.sheet && this.editing && LIST_KINDS.has(this.editing.kind) && /^(pick-search|grid)$/.test(e.target.dataset.role || "")) return this.pickKey(e);
    if (e.target.dataset.role === "edit") {
      if (this.o.sheet && (e.key === "Enter" || e.key === "Tab")) { e.preventDefault(); return this.commit(e.target.value, e.key === "Enter" ? [1, 0] : [0, e.shiftKey ? -1 : 1]); }
      if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); this.commit(e.target.value); }
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); this.editing = null; this.render(); this.focusGrid(); }
      return;
    }
    if (e.target.dataset.role !== "grid") return;
    const rows = this.visible.length; if (!rows) return;
    const a = this.active || { r: 0, c: 0 };
    if (this.o.sheet && this.active) { const kind = this.editKind(this.cols[a.c], this.visible[a.r]);
      if (e.key === "Tab") { if (this.step(0, e.shiftKey ? -1 : 1)) { e.preventDefault(); this.render(); } return; }
      if (kind && e.key === "F2") { e.preventDefault(); return this.startEdit(); }
      if (kind === "text" && (e.key === "Backspace" || e.key === "Delete")) { e.preventDefault(); return this.startEdit(""); }
      if (kind && e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); return this.startEdit(e.key); } }
    const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (moves[e.key]) { e.preventDefault(); const [dr, dc] = moves[e.key]; this.active = this.active ? { r: Math.min(rows - 1, Math.max(0, a.r + dr)), c: Math.min(this.cols.length - 1, Math.max(0, a.c + dc)) } : a; return this.render(); }
    if (e.key === "Enter" && this.active) { e.preventDefault(); const c = this.cols[a.c]; if (this.editKind(c, this.visible[a.r])) return this.startEdit(); if (this.o.onOpen) { const row = this.visible[a.r]; this.openId = row[this.o.rowKey]; this.render(); return this.o.onOpen(row, this); } }
    if (e.key === " " && this.active && this.o.selectable) { e.preventDefault(); const id = this.visible[a.r][this.o.rowKey]; this.sel.has(id) ? this.sel.delete(id) : this.sel.add(id); return this.render(); }
    if (e.key === "Escape") { this.active = null; return this.render(); }
  }
}

// The one open list on the page (Grid.openList): a click outside its grid closes it, a scroll keeps it beside its cell.
// composedPath still holds the clicked cell even when the grid re-drew it during that same click.
document.addEventListener("mousedown", (e) => { const g = Grid.openList; if (g && g.editing && !e.composedPath().includes(g.root)) g.leaveList(false); });
document.addEventListener("scroll", () => { if (Grid.openList) Grid.openList.placePick(); }, true);

/* ============================================================ block registry */
const BLOCKS = [];
const CATEGORIES = [];
/* defineCategory({ id, title, icon, blurb }) */
const defineCategory = (c) => { if (!CATEGORIES.find((x) => x.id === c.id)) CATEGORIES.push(c); };
/* defineBlock({ cat, id, title, note, where, states: ['Normal','Empty',...], canvas: 'gray'|'white'|'bare', pad: true, html(state) => string, mount(el, state) }) */
const defineBlock = (b) => BLOCKS.push(Object.assign({ canvas: "gray", pad: true }, b));

/* Actions menu behaviour (v4): open/close, search, arrow keys, Enter, Escape, click outside */
(() => {
  const btn = (am) => am.querySelector("[data-am-btn]"), menu = (am) => am.querySelector("[data-am-menu]");
  const usable = (am) => [...am.querySelectorAll("[data-am-item]")].filter((b) => !b.hidden && b.getAttribute("aria-disabled") !== "true");
  const hi = (am, i) => { const l = usable(am); am._hi = l.length ? (i + l.length) % l.length : -1; l.forEach((b, j) => b.classList.toggle("!bg-gray-100", j === am._hi)); if (l[am._hi]) l[am._hi].scrollIntoView({ block: "nearest" }); };
  const filter = (am, q) => { q = q.trim().toLowerCase();
    am.querySelectorAll("[data-am-item]").forEach((b) => (b.hidden = !!q && !b.dataset.label.toLowerCase().includes(q)));
    am.querySelectorAll("[data-am-group]").forEach((g) => (g.hidden = ![...g.querySelectorAll("[data-am-item]")].some((b) => !b.hidden)));
    am.querySelector("[data-am-empty]").hidden = [...am.querySelectorAll("[data-am-item]")].some((b) => !b.hidden); hi(am, q ? 0 : -1); };
  const close = (am, refocus) => { if (menu(am).hidden) return; menu(am).hidden = true; btn(am).setAttribute("aria-expanded", "false"); if (refocus) btn(am).focus({ preventScroll: true }); };
  const open = (am) => { document.querySelectorAll("[data-am]").forEach((x) => x !== am && close(x)); const s = am.querySelector("[data-am-search]");
    menu(am).hidden = false; btn(am).setAttribute("aria-expanded", "true"); s.value = ""; filter(am, ""); s.focus({ preventScroll: true }); };
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-am-btn]"); if (b) { const am = b.closest("[data-am]"); return menu(am).hidden ? open(am) : close(am, true); }
    const it = e.target.closest("[data-am-item]"); if (it && it.getAttribute("aria-disabled") !== "true") close(it.closest("[data-am]"), true); });
  document.addEventListener("input", (e) => { if (e.target.matches("[data-am-search]")) filter(e.target.closest("[data-am]"), e.target.value); });
  document.addEventListener("keydown", (e) => { const am = e.target.closest && e.target.closest("[data-am]"); if (!am || menu(am).hidden) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); hi(am, (am._hi ?? -1) + (e.key === "ArrowDown" ? 1 : -1)); }
    else if (e.key === "Enter" && e.target.matches("[data-am-search]")) { e.preventDefault(); const l = usable(am); if (l[am._hi]) l[am._hi].click(); }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(am, true); } });
  document.addEventListener("mousedown", (e) => document.querySelectorAll("[data-am]").forEach((am) => { if (!am.contains(e.target)) close(am); }));
})();

/* Global delegated behaviour for switches and segmented controls inside blocks (visual only) */
document.addEventListener("click", (e) => {
  const s = e.target.closest('[data-act="switch"]');
  if (s) { s.setAttribute("aria-checked", s.getAttribute("aria-checked") === "true" ? "false" : "true"); Motion.settle(s.closest("[data-row], .min-h-11, li, tr") || s.parentElement); }
  const seg = e.target.closest("[data-seg]");
  if (seg && !seg.closest("[data-state-switch]")) {
    const wrap = seg.parentElement, sm = wrap.className.includes("h-8"), prev = wrap.querySelector('[aria-selected="true"]');
    [...wrap.children].forEach((b) => { const on = b === seg; b.className = on ? (sm ? R.segOnSm : R.segOn) : (sm ? R.segItemSm : R.segItem); b.setAttribute("aria-selected", on); });
    Motion.glide(wrap, prev, seg, "thumb");
  }
});

document.addEventListener("change", (e) => { const c = e.target; if (c.classList && (c.classList.contains("cbx") || c.classList.contains("rad")) && c.checked) Motion.play(c, "asha-check-pop"); });

/* ============================================================ v2 shared helpers
 * Built for the v2 blocks (they're plain functions, so v1 blocks are untouched). */
if (V2) {
  sysChange("Data grid", "A column can list its normal values (\"Active\", \"Signed\", \"$0.00\"); those cells are left blank so the unusual rows stand out (Attio shows status only when it's the exception).");
  sysChange("Data grid", "The default sort isn't shown as a removable \"Sorted by\" chip; the header arrow already shows it. A chip appears once you change the sort.");
  sysChange("Data grid", "Pages with count tabs drop the toolbar's \"Title · count\" button, which repeated the tab right above it.");
  sysChange("Data grid", "An empty list's bottom line now runs edge to edge (it stopped 16px short on both sides).");
  sysChange("Tables", "Every hand-built table renders as the data grid in the presentation that fits where it sits (page, section, panel, form).");
  sysChange("Avatars", "People avatars are grey and practice or payer marks are outlined grey: six tints and saturated logos competed with the blue (act) and orange (fix) that carry meaning.");
}
/* One money vocabulary for column headers and labels */
const MONEY_LABEL = { billed: "Billed", allowed: "Allowed", writeOff: "Write-off", insEst: "Ins. est.", insPaid: "Ins. paid", ptEst: "Pt. est.", ptResp: "Pt. resp.", balance: "Balance" };
/* Joined date stepper: one bordered group, ‹ label ›, like Preline's inline button group */
const dateStepper = (label, { prev = "Previous", next = "Next" } = {}) => `<div class="inline-flex h-8 shrink-0 items-stretch overflow-hidden rounded-lg border border-gray-200 bg-white text-sm text-gray-800 shadow-2xs divide-x divide-gray-200">
  <button type="button" class="px-2 text-gray-500 hover:bg-gray-50" aria-label="${esc(prev)}">${I("chevron-left", "size-4")}</button>
  <button type="button" class="px-3 font-medium whitespace-nowrap hover:bg-gray-50">${label}</button>
  <button type="button" class="px-2 text-gray-500 hover:bg-gray-50" aria-label="${esc(next)}">${I("chevron-right", "size-4")}</button></div>`;
/* One step bar: items [[label, "done" | "problem" | "next"]], cur = the open step. Every step is a button. */
const stepBar = (items, cur = 0, { cls = "px-5 py-2 border-b border-gray-200/80" } = {}) => `<nav data-steps class="flex items-center gap-1 overflow-x-auto ${cls}" aria-label="Steps">${items.map(([label, st], i) => {
  const on = i === cur;
  const mark = st === "done" ? `<span class="flex size-5 items-center justify-center rounded-full bg-blue-600 text-white">${I("check", "size-3")}</span>`
    : st === "problem" && !V4 ? I("circle-alert", "size-5 text-orange-500")
    : `<span class="flex size-5 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums ${on ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}">${i + 1}</span>`;
  return `${i ? '<span class="w-4 shrink-0 border-t border-gray-300" aria-hidden="true"></span>' : ""}<button type="button" data-step="${i}" class="inline-flex h-8 shrink-0 items-center gap-2 rounded-lg px-2 text-sm ${on ? "bg-gray-100 font-medium text-gray-900" : "text-gray-600 hover:bg-gray-50"}" ${on ? 'aria-current="step"' : ""}>${mark}${label}</button>`;
}).join("")}</nav>`;
/* Label / value rows: grey label, dark value, row lines only, no label fill and no line between label and value */
const kvTable = (pairs, { cols = 1 } = {}) => {
  const rows = []; for (let i = 0; i < pairs.length; i += cols) rows.push(pairs.slice(i, i + cols));
  const col = '<col class="w-36"><col>';
  return `<div class="${R.tableBox}"><table class="w-full table-fixed border-separate border-spacing-0 text-sm"><colgroup>${col.repeat(cols)}</colgroup><tbody>${rows.map((r) => `<tr>${r.map(([k, v]) => `<td class="h-9 ps-3 pe-2 border-b border-gray-200/80 text-[13px] text-gray-500 whitespace-nowrap">${k}</td><td class="h-9 pe-3 border-b border-gray-200/80 text-gray-800 truncate">${v}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
};
/* A money breakdown as a full-width table: one amount column on the right edge, the total under one line */
const moneySteps = (rows, total) => `<div class="${R.tableBox}"><table class="w-full border-separate border-spacing-0 text-[13px]"><tbody>${rows.map(([l, a, why]) => `<tr><td class="h-9 px-3 border-b border-gray-200/80 text-gray-700">${l}${why ? ` <span class="text-gray-400">· ${why}</span>` : ""}</td><td class="h-9 px-3 border-b border-gray-200/80 text-end tabular-nums text-gray-800">${money(a)}</td></tr>`).join("")}</tbody>${total ? `<tfoot><tr><td class="h-9 px-3 font-medium text-gray-800">${total[0]}</td><td class="h-9 px-3 text-end tabular-nums font-semibold text-gray-900">${money(total[1])}</td></tr></tfoot>` : ""}</table></div>`;
/* Hover labels for icon-only marks, such as the status icons on appointment cards: give the element data-tip="Label".
 * One shared tooltip lives on <body>, so a card's overflow never clips it. It shows on hover and on keyboard focus;
 * focusing a control that holds marks (an appointment card) shows all their labels beside them. */
(() => {
  let tip = null, on = null, byFocus = false;
  const hide = () => { if (tip) tip.style.display = "none"; on = null; byFocus = false; };
  const show = (el, text = el.dataset.tip) => {
    if (!tip) { tip = document.createElement("div"); tip.setAttribute("role", "tooltip"); tip.className = `${R.tooltip} fixed z-[90] pointer-events-none whitespace-nowrap`; document.body.appendChild(tip); }
    on = el; tip.textContent = text; tip.style.display = "";
    const r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = `${Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2))}px`;
    tip.style.top = `${r.top - h - 6 < 8 ? r.bottom + 6 : r.top - h - 6}px`;
  };
  document.addEventListener("pointerover", (e) => { const el = e.target.closest?.("[data-tip]"); if (el) { if (el !== on) show(el); } else if (on) hide(); });
  document.addEventListener("focusin", (e) => {
    const el = e.target.closest?.("[data-tip]"), marks = el ? [] : [...(e.target.querySelectorAll?.("[data-tip]") || [])];
    if (el) show(el); else if (marks.length) show(marks[0].parentElement, marks.map((m) => m.dataset.tip).join(" · ")); else return hide();
    byFocus = true;
  });
  document.addEventListener("focusout", hide);
  // Focus scrolls its target into view: follow it. A pointer tooltip just closes.
  document.addEventListener("scroll", () => { if (on && byFocus) show(on, tip.textContent); else hide(); }, true);
})();
