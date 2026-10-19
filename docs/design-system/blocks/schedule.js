/* Schedule blocks. Sources: routes/practice/calendar (SchedulingCalendar, AppointmentCardV2, schedulingLegendBadges,
 * ScheduleSlotDialog, WaitlistPanelInline, CheckInSheet), components/Specific/AppointmentDetailSheet and
 * FindOpenSlotsFlyout (INVENTORY.md §2). */
(() => {

/* ---------- time grid ---------- */
const SLOT = 24;                 // px per 15 minutes
const DAY_START = 7 * 60, DAY_END = 13 * 60;
const mins = (hm) => { const [h, m] = hm.split(":").map(Number); return h * 60 + m; };
const clock = (m, ampm = true) => { const h = Math.floor(m / 60), mm = m % 60, h12 = ((h + 11) % 12) + 1; return `${h12}:${String(mm).padStart(2, "0")}${ampm ? (h < 12 ? " AM" : " PM") : ""}`; };
const range = (s, d) => { const a = mins(s), b = a + d; return `${clock(a, (a < 720) !== (b < 720))}–${clock(b)}`; };
const topOf = (m, from = DAY_START) => ((m - from) / 15) * SLOT;

/* Provider tints: a pale fill plus a 3px bar in the provider's Preline tone */
const TINT = {
  blue: { fill: "bg-blue-50", line: "border-blue-100", bar: "bg-blue-500", soft: "bg-blue-100 text-blue-800" },
  indigo: { fill: "bg-indigo-50", line: "border-indigo-100", bar: "bg-indigo-500", soft: "bg-indigo-100 text-indigo-800" },
  teal: { fill: "bg-teal-50", line: "border-teal-100", bar: "bg-teal-500", soft: "bg-teal-100 text-teal-800" },
  sky: { fill: "bg-sky-50", line: "border-sky-100", bar: "bg-sky-500", soft: "bg-sky-100 text-sky-800" }
};
const OPS = DATA.operatories.map((o) => ({ ...o, prov: DATA.provider(o.provider) }));
const provAvatar = (p, size = "size-5 text-[10px]") => `<span class="flex shrink-0 items-center justify-center ${size} rounded-full ${TINT[p.tone].soft} font-semibold" aria-hidden="true">${initials(p.name.replace(/^Dr\. /, ""))}</span>`;

/* Appointment statuses (AppointmentCardV2) as a dot and a word */
const ST = {
  sched: { label: "Scheduled", tone: "off" }, conf: { label: "Confirmed", tone: "on" }, in: { label: "Checked in", tone: "mid" },
  prog: { label: "In progress", tone: "on" }, done: { label: "Completed", tone: "quiet" }, canc: { label: "Cancelled", tone: "off" }, bump: { label: "Bumped", tone: "off" }
};
/* Legend chips (schedulingLegendBadges), recoloured to the house rules: blue = on, orange = a person must act, else grey */
const CHIP = {
  np: ["New patient", "user-plus", ""], med: ["Med alert", "heart-pulse", ""], premed: ["Premedicate", "circle-alert", "needs"],
  ver: ["Ins. Verified", "shield-check", "on"], insrev: ["Ins. Needs Review", "shield-alert", "needs"], insmiss: ["Ins. Details Missing", "shield-question", "needs"],
  pend: ["Ins. Pending", "shield", ""], bal: ["Pt Bal. Due", "circle-dollar-sign", ""], fbal: ["Fam Bal. Due", "users", ""], forms: ["Forms Incomplete", "file-text", "needs"],
  formsok: ["Forms Complete", "file-check", ""], ai: ["AI Booked", "sparkles", "on"], aiconf: ["AI Confirmed", "sparkles", "on"], claim: ["Claim Sent", "send", ""]
};
/* v2: blue marker icons (Ins. Verified, AI Booked, AI Confirmed) go grey, so orange is the only colour on a card */
const chipIconCls = (t) => (t === "needs" ? "text-orange-500" : t === "on" && !V2 ? "text-blue-600" : "text-gray-500");
/* v2: the normal state (verified, forms complete, AI confirmed) stays off the card; the hover card and legend say it */
const V2_CARD_QUIET = new Set(["ver", "formsok", "aiconf"]);
/* v2: Confirmed and Completed cards don't repeat their status (the fill already says Completed); Scheduled reads as
 * Unconfirmed, the thing the front desk acts on */
const v2CardStatus = (st) => (st === "conf" || st === "done" ? null : st === "sched" ? "Unconfirmed" : ST[st].label);
/* v2: which cards carry a "what changed" mark (one or two per note, not every card) */
const V2_CARD_MARK = {
  a3: ["line", "Cards are two lines: the start time and the procedure. The end time and CDT codes moved to the hover card, so the procedure stops getting cut off."],
  a1: ["name", "Completed and Confirmed cards don't print their status; the grey fill already says Completed. Only Unconfirmed, Checked in, In progress, Cancelled and Bumped show a word."],
  sCompleted: ["name", "Completed and Confirmed cards don't print their status; the grey fill already says Completed. Only Unconfirmed, Checked in, In progress, Cancelled and Bumped show a word."],
  a14: ["status", "Scheduled shows as Unconfirmed, the word the front desk acts on."],
  sScheduled: ["status", "Scheduled shows as Unconfirmed, the word the front desk acts on."],
  a9: ["icons", "The Ins. Verified, Forms Complete and AI Confirmed icons are off the cards (they're the normal state; the hover card and legend still say them), so the icons left are the ones that mean something."],
  a6: ["icons", "AI Booked is grey instead of blue, so orange is the only colour that asks for a person."]
};
const miniChip = (k) => { const [l, ic, t] = CHIP[k]; return `<span class="inline-flex items-center gap-1 h-[18px] px-1.5 rounded bg-white/80 ring-1 ring-inset ring-gray-200/80 text-[11px] font-medium text-gray-700 whitespace-nowrap">${I(ic, `size-3 ${chipIconCls(t)}`)}${l}</span>`; };
/* On a card each chip is only its icon, at the bottom right; the label shows on hover (data-tip), and the card's
 * aria-label reads them all */
const chipIcon = (k) => { const [l, ic, t] = CHIP[k]; return `<span data-tip="${l}" class="inline-flex">${I(ic, `size-3.5 ${chipIconCls(t)}`)}</span>`; };

/* Invented extra patients so the day is full without contradicting DATA's next-visit dates */
const EXTRA = { x1: ["Daniel Price", 44], x2: ["Nora Castillo", 29], x3: ["Henry Wu", 61], x4: ["Ruby Alvarez", 36], x5: ["Owen Fischer", 52], x6: ["Zoe Martin", 23], x7: ["Samuel Diaz", 48], x8: ["Lily Chen", 31], x9: ["Aria Johnson", 8], x10: ["Grace Holloway", 39], x11: ["Alexandra Montgomery-Whitfield", 34], x12: ["Theo Nakamura", 27], x13: ["Priya Raman", 41], x14: ["Marcus Bellweather", 58], x15: ["Hannah Okafor", 19], x16: ["Wesley Tran", 66] };
const ptName = (id) => (EXTRA[id] ? EXTRA[id][0] : DATA.patient(id).name);
const ptAge = (id) => (EXTRA[id] ? EXTRA[id][1] : DATA.patient(id).age);
const initialsName = (n) => n.split(/[\s-]+/).filter(Boolean).map((w) => w[0] + ".").slice(0, 2).join("");

/* op index 0..3 = Op 1, Op 2, Hyg 1, Hyg 2. lane/lanes = side-by-side double booking */
const DAY = [
  { id: "a1", op: 0, start: "7:30", dur: 60, pt: "x1", what: "Crown prep #30", codes: ["D2740", "D2950"], st: "done", chips: ["ver"] },
  { id: "a2", op: 0, start: "8:45", dur: 30, pt: "x2", what: "Filling #14 MO", codes: ["D2392"], st: "done", chips: ["bal"] },
  { id: "a3", op: 0, start: "10:00", dur: 90, pt: "p2", what: "Root canal #19", codes: ["D3330"], st: "prog", chips: ["med", "ver"], note: "Takes blood thinners" },
  { id: "a4", op: 0, start: "11:30", dur: 30, pt: "x3", what: "Filling #3 O", codes: ["D2391"], st: "conf", chips: ["ver"] },
  { id: "a5", op: 1, start: "7:00", dur: 45, pt: "x4", what: "Surgical extraction #1", codes: ["D7210"], st: "done", chips: ["ver"] },
  { id: "a6", op: 1, start: "8:00", dur: 30, pt: "x5", what: "Emergency exam", codes: ["D9110"], st: "done", chips: ["ai"] },
  { id: "a7", op: 1, start: "9:30", dur: 60, pt: "p9", what: "New patient exam, x-rays", codes: ["D0150", "D0210"], st: "done", chips: ["np", "insmiss"] },
  { id: "a8", op: 1, start: "10:45", dur: 15, pt: "x6", what: "Emergency pain", codes: ["D9110"], st: "in", chips: ["np"] },
  { id: "a9", op: 1, start: "11:00", dur: 60, pt: "x7", what: "Crown seat #19", codes: ["D2740"], st: "conf", chips: ["bal", "ver"] },
  { id: "a10", op: 2, start: "7:00", dur: 60, pt: "x8", what: "Cleaning, exam, bitewings", codes: ["D1110", "D0120", "D0274"], st: "done", chips: ["ver"] },
  { id: "a11", op: 2, start: "8:00", dur: 45, pt: "x9", what: "Child cleaning, fluoride", codes: ["D1120", "D1208"], st: "canc", chips: [] },
  { id: "a12", op: 2, start: "9:00", dur: 60, pt: "p1", what: "Cleaning, exam, bitewings", codes: ["D1110", "D0120", "D0274"], st: "done", chips: ["med", "ver", "bal"] },
  { id: "a13", op: 2, start: "10:15", dur: 60, pt: "p10", what: "Perio maintenance", codes: ["D4910"], st: "prog", chips: ["ver", "fbal"] },
  { id: "a14", op: 2, start: "11:30", dur: 30, pt: "x10", what: "Cleaning, exam", codes: ["D1110", "D0120"], st: "sched", chips: ["forms"] },
  { id: "a15", op: 3, start: "8:00", dur: 60, pt: "p3", what: "Cleaning, exam", codes: ["D1110", "D0120"], st: "done", chips: ["bal", "aiconf"] },
  { id: "a16", op: 3, start: "9:15", dur: 45, pt: "x12", what: "Sealants #3, #14, #19, #30", codes: ["D1351"], st: "done", chips: ["ver"] },
  { id: "a17", op: 3, start: "11:00", dur: 60, pt: "p5", what: "Deep cleaning, UR and LR", codes: ["D4341", "D4341"], st: "in", chips: ["premed", "med", "ver"], note: "Premedicate: amoxicillin 2 g, 1 hour before" }
];
const HOLDS = [{ op: 1, start: "8:30", dur: 45, label: "Held for emergencies" }];
const BUSY_EXTRA = [
  { id: "b1", op: 0, start: "7:00", dur: 30, pt: "x11", what: "Consult, implant #8", codes: ["D0150"], st: "done", chips: ["np", "ver"] },
  { id: "b2", op: 0, start: "9:15", dur: 45, pt: "x13", what: "Filling #19 DO", codes: ["D2392"], st: "done", chips: ["ver", "bal"] },
  { id: "b3", op: 1, start: "11:00", dur: 30, pt: "x14", what: "Denture adjustment", codes: ["D9110"], st: "conf", chips: ["fbal"], lane: 1, lanes: 2 },
  { id: "b4", op: 3, start: "7:00", dur: 45, pt: "x15", what: "Cleaning, exam", codes: ["D1110", "D0120"], st: "done", chips: ["np", "pend"] },
  { id: "b5", op: 3, start: "10:00", dur: 45, pt: "x16", what: "Perio maintenance", codes: ["D4910"], st: "prog", chips: ["insrev"] },
  { id: "b6", op: 2, start: "8:00", dur: 45, pt: "x9", what: "Child cleaning, fluoride (rebooked)", codes: ["D1120", "D1208"], st: "done", chips: ["aiconf"] }
];
const busyDay = () => {
  const list = DAY.filter((a) => a.id !== "a11").map((a) => (a.id === "a9" ? { ...a, lane: 0, lanes: 2 } : a));
  return [...list, ...BUSY_EXTRA];
};

/* v2 card body: two lines at most (name and status word when unusual; start time · procedure and the icons), plus the
 * note on long visits. Codes and the end time live in the hover card and the panel. */
function v2CardInner(a, { slots, nm, lanes }) {
  const mark = V2_CARD_MARK[a.id] || [], m = (k) => (mark[0] === k ? chg(mark[1]) : "");
  const word = v2CardStatus(a.st);
  const status = word ? `<span class="ms-auto shrink-0"${m("status")}>${statusDot(word, ST[a.st].tone, "!text-xs !text-gray-600 !gap-x-1")}</span>` : "";
  const chips = a.chips.filter((k) => !V2_CARD_QUIET.has(k));
  const icons = chips.length ? `<span class="ms-auto flex shrink-0 items-center gap-1.5"${m("icons")}>${chips.map(chipIcon).join("")}</span>` : "";
  const head = `<span class="flex items-center gap-2 min-w-0"${m("name")}>${nm}${status}</span>`;
  const line = `<span class="flex items-center gap-1.5 text-xs leading-4 text-gray-600 min-w-0"${m("line")}><span class="truncate"><span class="tabular-nums">${clock(mins(a.start), false)}</span> · ${esc(a.what)}</span>${icons}</span>`;
  if (slots <= 1) return `<span class="flex items-center gap-2 h-full ps-2.5 pe-2 min-w-0">${nm}${status || icons}</span>`;
  if (lanes > 1) return `<span class="flex flex-col h-full ps-2.5 pe-1.5 py-1 gap-0.5 min-w-0">${head}${line}</span>`;
  if (slots === 2) return `<span class="flex flex-col justify-center h-full ps-2.5 pe-2 gap-0.5 min-w-0">${head}${line}</span>`;
  return `<span class="flex flex-col h-full ps-2.5 pe-2 py-1 gap-0.5 min-w-0">${head}${line}${a.note && slots >= 6 ? `<span class="text-xs leading-4 text-gray-500 truncate">${esc(a.note)}</span>` : ""}</span>`;
}
/* One appointment card, sized to its length */
function apptCard(a, { abs = true, from = DAY_START } = {}) {
  const prov = OPS[a.op].prov, t = TINT[prov.tone], st = ST[a.st];
  const slots = a.dur / 15, h = slots * SLOT - 2, name = ptName(a.pt);
  const off = a.st === "canc" || a.st === "bump", done = a.st === "done";
  const nm = `<span class="truncate text-[13px] leading-[18px] font-semibold ${off ? "text-gray-500 line-through decoration-gray-400" : done ? "text-gray-600" : "text-gray-800"}"><span data-nm>${esc(name)}</span><span data-ini hidden>${initialsName(name)}</span></span>`;
  const status = statusDot(st.label, st.tone, "!text-xs !text-gray-600 !gap-x-1 shrink-0");
  const when = `<span class="tabular-nums">${range(a.start, a.dur)}</span>`;
  const lanes = a.lanes || 1, lane = a.lane || 0;
  const icons = a.chips.length ? `<span class="ms-auto flex shrink-0 items-center gap-1.5">${a.chips.map(chipIcon).join("")}</span>` : "";
  let inner;
  if (V2) inner = v2CardInner(a, { slots, nm, lanes });
  else if (lanes > 1) inner = `<span class="flex flex-col h-full ps-2.5 pe-1.5 py-1 gap-0.5 min-w-0">${nm}${status}${slots >= 3 ? `<span class="text-xs leading-4 text-gray-600 truncate tabular-nums">${clock(mins(a.start))} · ${a.dur} min</span>` : ""}</span>`;
  else if (slots <= 1) inner = `<span class="flex items-center gap-2 h-full ps-2.5 pe-2">${nm}<span class="ms-auto">${status}</span></span>`;
  else if (slots === 2) inner = `<span class="flex flex-col justify-center h-full ps-2.5 pe-2 gap-0.5"><span class="flex items-center gap-2">${nm}<span class="ms-auto">${status}</span></span>
      <span class="flex items-center gap-1.5 text-xs leading-4 text-gray-600 min-w-0"><span class="truncate">${when} · ${esc(a.what)}</span>${icons}</span></span>`;
  else inner = `<span class="flex flex-col h-full ps-2.5 pe-2 ${slots === 3 ? "py-1" : "pt-1.5 pb-1.5"} gap-0.5 min-w-0"><span class="flex items-center gap-2">${nm}<span class="ms-auto">${status}</span></span>
      ${slots >= 4 ? `<span class="text-xs leading-4 text-gray-600 truncate">${when} · ${esc(a.what)}</span>
      <span class="flex items-center gap-1.5 text-xs leading-4 text-gray-500 min-w-0"><span class="tabular-nums truncate">${a.codes.join(" · ")}</span>${icons}</span>`
        : `<span class="flex items-center gap-1.5 text-xs leading-4 text-gray-600 min-w-0"><span class="truncate">${when} · ${esc(a.what)}</span>${icons}</span>`}
      ${a.note && slots >= 6 ? `<span class="text-xs leading-4 text-gray-500 truncate">${esc(a.note)}</span>` : ""}</span>`;
  const fill = off ? "bg-white border-dashed border-gray-300" : done ? `bg-gray-50 border-gray-200/80` : `${t.fill} ${t.line}`;
  const pos = abs ? "absolute" : "relative w-full";
  const style = abs ? `top:${topOf(mins(a.start), from) + 1}px;height:${h}px;left:calc(${(lane / lanes) * 100}% + ${lane ? 2 : 4}px);width:calc(${100 / lanes}% - ${lanes > 1 ? 6 : 8}px)` : `height:${h}px`;
  return `<button type="button" data-appt="${a.id}" data-opens-sheet class="${pos} block overflow-hidden rounded-md border ${fill} text-start cursor-pointer transition-colors hover:border-gray-300 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-blue-600/20" style="${style}" aria-label="${esc(name)}, ${range(a.start, a.dur)}, ${esc(a.what)}, ${st.label}${a.chips.map((k) => `, ${CHIP[k][0]}`).join("")}">
    <span class="absolute inset-y-0 start-0 w-[3px] ${off ? "bg-gray-300" : t.bar} ${done ? "opacity-40" : ""}"></span>${inner}</button>`;
}

const hatch = "background-image:repeating-linear-gradient(135deg,#F3F4F6 0 6px,#F9FAFB 6px 12px)";
/* The day grid: header row of chairs, a time gutter, 15-minute lines, lunch, holds, the now-line and the cards */
function dayGrid({ appts = DAY, now = mins("10:40"), empty = false, holds = HOLDS, util = [82, 74, 88, 71], from = DAY_START, to = DAY_END, head: showHead = true } = {}) {
  const H = ((to - from) / 15) * SLOT;
  const lines = Array.from({ length: (to - from) / 15 }, (_, i) => `<div class="absolute inset-x-0 border-t ${i % 4 === 0 ? "border-gray-200/80" : "border-dashed border-gray-200/60"}" style="top:${i * SLOT}px"></div>`).join("");
  const gutter = Array.from({ length: (to - from) / 30 }, (_, i) => { const m = from + i * 30, hr = m % 60 === 0;
    return `<span class="absolute end-2 ${i === 0 ? "top-1" : "-translate-y-1/2"} tabular-nums ${hr ? "text-xs text-gray-500" : "text-[11px] text-gray-400"}" style="${i ? `top:${i * 2 * SLOT}px` : ""}">${hr ? `${((m / 60 + 11) % 12) + 1} ${m < 720 ? "AM" : "PM"}` : ":30"}</span>`; }).join("");
  const lunch = to <= 720 ? "" : `<div class="absolute inset-x-0 flex items-center justify-center border-y border-gray-200/80" style="top:${topOf(720, from)}px;height:${4 * SLOT}px;${hatch}"><span class="text-xs font-medium text-gray-500">Lunch · 12:00–1:00 PM</span></div>`;
  const cols = OPS.map((o, oi) => `<div class="relative border-s border-gray-200/80">
      ${holds.filter((b) => b.op === oi).map((b) => `<div class="absolute inset-x-1 flex items-center justify-center rounded-md" style="top:${topOf(mins(b.start), from) + 1}px;height:${(b.dur / 15) * SLOT - 2}px;${hatch}"><span class="text-xs text-gray-500">${esc(b.label)}</span></div>`).join("")}
      ${empty ? "" : appts.filter((a) => a.op === oi).map((a) => apptCard(a, { from })).join("")}</div>`).join("");
  const nowLine = now != null && !empty && now > from && now < to ? `<div class="pointer-events-none absolute start-0 end-0 z-10 flex items-center -translate-y-1/2" style="top:${topOf(now, from)}px">
      <span class="w-14 flex justify-end pe-1"><span class="rounded-md bg-blue-600 px-1.5 py-px text-[11px] font-medium text-white tabular-nums">${clock(now, false)}</span></span>
      <span class="size-2 -ms-1 rounded-full bg-blue-600"></span><span class="h-px grow bg-blue-600"></span></div>` : "";
  const head = `<div class="grid grid-cols-[56px_repeat(4,minmax(0,1fr))] h-12 border-b border-gray-200/80 bg-white">
      <div></div>
      ${OPS.map((o, i) => `<div class="flex items-center gap-2.5 px-3 border-s border-gray-200/80 min-w-0">
        <span class="text-sm font-semibold text-gray-800 whitespace-nowrap">${o.name}</span>${provAvatar(o.prov)}<span class="text-[13px] text-gray-600 truncate">${o.prov.short}</span>
        <span class="ms-auto text-xs text-gray-500 tabular-nums whitespace-nowrap">${empty ? "0% booked" : `${util[i]}% booked`}</span></div>`).join("")}</div>`;
  return `${showHead ? head : ""}<div class="relative grid grid-cols-[56px_repeat(4,minmax(0,1fr))]" style="height:${H}px">
      <div class="relative">${gutter}</div>
      <div class="absolute inset-y-0 start-14 end-0 pointer-events-none">${lines}${lunch}</div>
      ${cols}${nowLine}</div>`;
}

/* The one row above the grid, laid out like the app's scheduling header: the day, its count and the date stepper on
 * the left; the view, chairs, search, hide names, the two side panels, ⋯ and the one blue button on the right. */
const schedBar = ({ date = "Fri, Sep 25", count = DAY.length } = {}) => `<div class="flex items-center gap-2 h-[52px] px-4 border-b border-gray-200/80 bg-white">
  <span class="text-sm font-semibold text-gray-800 whitespace-nowrap">${date}</span><span class="text-[13px] text-gray-500 tabular-nums whitespace-nowrap">${count} appts</span>
  ${V2 ? `<div class="ms-2 flex"${chg("Previous day, Today and Next day are one joined control instead of three separate buttons, so the bar reads as one tool.")}>${dateStepper("Today", { prev: "Previous day", next: "Next day" })}</div>`
    : `<div class="ms-2 flex items-center gap-1">${iconButton("chevron-left", "Previous day", { v: "white", s: "iconSm" })}${button("Today", { v: "white", s: "sm" })}${iconButton("chevron-right", "Next day", { v: "white", s: "iconSm" })}</div>`}
  <div class="ms-auto flex items-center ${V2 ? "gap-1" : "gap-1.5"}">
    ${segmented(["Day", "Week"], 0, { sm: true })}
    <button type="button" class="${cx(R.btn, R.sm, R.ghost)}" aria-haspopup="menu" aria-label="Chairs: all 4"><span class="flex gap-0.5">${OPS.map((o) => provAvatar(o.prov)).join("")}</span>${I("chevron-down", "!text-gray-400")}</button>
    ${iconButton("search", "Search appointments", { s: "iconSm" })}
    ${iconButton("eye-off", "Hide patient names", { s: "iconSm", attrs: 'data-act="names" aria-pressed="false"' })}
    <span class="h-5 mx-0.5 border-s border-gray-200/80"></span>
    ${V2 ? button(`Waitlist <span class="${R.count}">6</span>`, { v: "quiet", s: "sm", attrs: `aria-label="ASAP / Waitlist, 6 patients"${chg("The waitlist button says Waitlist; an unlabeled list icon with a 6 was a guess.")}` })
      : button(`<span class="${R.count}">6</span>`, { v: "quiet", s: "sm", icon: "list-ordered", attrs: 'aria-label="ASAP / Waitlist, 6 patients" data-tip="ASAP / Waitlist"' })}
    ${button("Find open slots", { v: "white", s: "sm", icon: "calendar-search" })}
    ${V2 ? iconButton("ellipsis", "More schedule actions", { s: "iconSm", attrs: chg("Icon-only buttons in the bar are all quiet; only buttons with words get a white box.") }) : iconButton("ellipsis", "More schedule actions", { v: "white", s: "iconSm" })}
    ${button("New appointment", { v: "solid", s: "sm", icon: "plus" })}</div></div>`;

/* The page an overlay opens from, faded */
const faded = (html) => `<div class="absolute inset-0 overflow-hidden" aria-hidden="true" inert data-scroll-ok><div class="w-[1096px] opacity-45 pointer-events-none">${html}</div><div class="absolute inset-0 bg-gray-50/30"></div></div>`;
/* An overlay drawn over the faded page: the panel sits on the right edge */
const overPage = (h, panelHtml) => `<div class="relative overflow-hidden" style="height:${h}px">${faded(pageSlice())}<div class="absolute inset-y-0 end-0 flex">${panelHtml}</div></div>`;
function pageSlice() { return `${schedBar()}${dayGrid()}`; }

/* ---------- appointment detail (flyout) ---------- */
const OLIVIA = { pt: "p5", start: "11:00", dur: 60, op: 3 };
/* Olivia's Aetna benefits. One set of numbers for every block (patients-insurance and the treatment plan use the same);
 * the coordinator may move this to DATA.patient(id).benefits in src/data.js. */
const SCHED_BENEFITS = { max: 1500, used: 320 };
const O_LINES = [["D4341", "UR", "Deep cleaning, 4+ teeth per quadrant", 260, 208], ["D4341", "LR", "Deep cleaning, 4+ teeth per quadrant", 260, 208]];
/* Forms are always a small table: the form, whether it was filled out and signed, and when. Never tags, which can't
 * say whether a form was done. rows: [form, state, when, action?], state done | needs | upd.
 * pad 4 for a popover, 5 for a panel (inside bleed()); actions adds a right-hand cell for per-row buttons. */
const FORM_ST = { done: ["Signed", "on"], needs: ["Not signed", "needs"], upd: ["Needs update", "needs"] };
function formsTable(rows, { pad = 5, dense = false, actions = false } = {}) {
  const ps = pad === 4 ? "ps-4" : "ps-5", pe = pad === 4 ? "pe-4" : "pe-5", txt = dense ? "text-[13px]" : "text-sm";
  const th = `${dense ? "h-8" : "h-9"} px-3 border-b border-gray-200/80 text-start ${txt} font-medium text-gray-500 whitespace-nowrap`;
  const td = `${dense ? "h-8" : "h-10"} px-3 border-b border-gray-200/80 ${txt} whitespace-nowrap`;
  return `<table class="w-full border-separate border-spacing-0 [&_tbody_tr:last-child>td]:border-b-0">
    <thead><tr><th class="${th} ${ps}">Form</th><th class="${th}">Status</th><th class="${th} ${actions ? "" : pe}">When</th>${actions ? `<th class="${th} ${pe}"><span class="sr-only">Actions</span></th>` : ""}</tr></thead>
    <tbody>${rows.map(([f, st, when, act]) => { const [label, tone] = FORM_ST[st];
      return `<tr><td class="${td} ${ps} w-full text-gray-800">${f}</td><td class="${td}">${statusDot(label, tone, `!${txt}`)}</td><td class="${td} ${actions ? "" : pe} text-gray-500 tabular-nums">${when}</td>${actions ? `<td class="${td} ${pe}"><span class="flex justify-end gap-1.5">${act || ""}</span></td>` : ""}</tr>`; }).join("")}</tbody></table>`;
}
/* v4: a forms list is the same compact data grid as Procedures (boxed, small uppercase headers), read-only: a form is
 * signed by the patient, not typed into. Rows as formsTable's; act: true adds a right-hand cell for the row's buttons. */
const v4FormsGrid = (rows, { act = false } = {}) => sheetTable({ sheet: false, title: "Forms",
  rows: rows.map(([form, st, when, a], i) => ({ id: `fm${i}`, form, st, when, a })),
  columns: [{ key: "form", label: "Form", w: 96, grow: true },
    { key: "st", label: "Status", w: 120, render: (r) => statusDot(FORM_ST[r.st][0], FORM_ST[r.st][1], "!text-[13px]") },
    { key: "when", label: "When", w: 104, render: (r) => `<span class="text-gray-500 tabular-nums">${esc(r.when)}</span>` },
    ...(act ? [{ key: "a", label: '<span class="sr-only">Send</span>', w: 188, render: (r) => (r.a ? `<span class="flex justify-end gap-1.5 [&_button]:!h-6">${r.a}</span>` : "") }] : [])] });
/* v2 loading: the same shape as the loaded panel (a status row, then sections), so nothing jumps when it lands */
const v2DetailSkeleton = () => `<section class="${R.psec} flex items-center justify-between gap-3 !py-3"${chg("The loading panel has the loaded panel's shape (status row, then sections) and no stray commas between the grey bars.")}>${skel("w-32", "h-8")}${skel("w-36")}</section>`
  + [3, 2, 3, 2].map((n) => `<section class="${R.psec} space-y-3">${skel("w-28", "h-4")}${Array.from({ length: n }, (_, i) => skel(["w-3/4", "w-1/2", "w-2/3"][i % 3])).join("")}</section>`).join("");
function apptDetailBody(state = "Confirmed") {
  if (V2 && state === "Loading") return v2DetailSkeleton();
  if (state === "Loading") return [2, 3, 3, 2].map((n) => `<section class="${R.psec} space-y-3">${skel("w-28", "h-4")}${Array.from({ length: n }, (_, i) => skel(["w-3/4", "w-1/2", "w-2/3"][i % 3]))}</section>`).join("");
  const fee = O_LINES.reduce((a, l) => a + l[3], 0), ins = O_LINES.reduce((a, l) => a + l[4], 0);
  const checked = state === "Checked in";
  const statusBtn = `<button type="button" class="${cx(R.btn, R.sm, R.white, "!ps-2.5")}" aria-haspopup="menu" aria-label="Change status">${checked ? `<span class="${cx(R.dot, TONE_DOT.mid)}"></span>Checked in` : `<span class="${cx(R.dot, TONE_DOT.on)}"></span>Confirmed`}${I("chevron-down", "!text-gray-400")}</button>`;
  const statusNote = V2 ? `<span class="inline-flex items-center gap-1"${chg("The caption no longer repeats the status next to it: “By text · Sep 23”, not “Confirmed by text”. The sparkle is grey.")}>${checked ? "10:38 AM · Maria" : `${I("sparkles", "size-3.5 text-gray-400")}By text · Sep 23`}</span>`
    : checked ? "Checked in at 10:38 AM by Maria" : `<span class="inline-flex items-center gap-1">${I("sparkles", "size-3.5 text-blue-600")}Confirmed by text · Sep 23</span>`;
  const th = (h, i, n) => (h === null ? "" : `<th ${i === 0 ? 'colspan="2"' : ""} class="${R.tHead} ${i >= 2 ? "!text-end" : ""} ${i === 0 ? "!ps-5" : ""} ${i === n - 1 ? "!pe-5" : ""}">${h}</th>`);
  return `
    ${V4 && V4_OPTS.status !== "row" ? "" : `<section class="${R.psec} flex items-center justify-between gap-3 !py-3">${statusBtn}<span class="text-[13px] text-gray-500">${statusNote}</span></section>`}
    ${V4 ? "" : psec("Before the visit", `<div class="-my-1.5">
        ${infoRow("circle-alert", `<span class="font-medium">Premedicate.</span> Amoxicillin 2 g, 1 hour before. Ask if she took it.`, { tone: "needs" })}
        ${infoRow("heart-pulse", "Latex allergy · use nitrile gloves")}
        ${infoRow("wallet", "Family balance due", { right: `<span class="text-gray-800 tabular-nums">${money(740)}</span>` })}</div>`, { count: 3 })}
    ${V4 ? psec("", `<div${chg4(V4_OPTS.status === "table" ? "Status is the first line of the Appointment table and reads “Confirmed · Sep 23” (no “By text”); every fact is a cell you click and type into." : "Every fact is a cell you click and type into.")}><div${chg4("The Appointment table carries its name in the same grey band as Procedures and Forms, so every table on the panel has the same header; the separate “Appointment” title is gone.")}>${v4SchedFields([...v4ApptFacts(checked), v4OliviaIns()], { band: "Appointment", labelW: 140, title: "Appointment", peek: (r) => (r.peek ? r.peek() : "") })}</div></div>`) : V2 ? psec("Appointment", `<div${chg("Chair and Length are gone from the facts; the title line already says 11:00 AM–12:00 PM · Hyg 2.")}>${metaGrid([["Provider", "Jordan Kim, RDH"], ["Primary dentist", "Dr. Maya Patel"], ["Guarantor", "Self"], ["Booked", "Sep 3 by Priya"]], 2)}</div>`)
      : psec("Appointment", metaGrid([["Provider", "Jordan Kim, RDH"], ["Primary dentist", "Dr. Maya Patel"], ["Chair", "Hyg 2"], ["Length", "60 min"], ["Guarantor", "Self"], ["Booked", "Sep 3 by Priya"]]))}
    ${V4 ? psec("Procedures", `<div${chg4("Fees and insurance estimates are cells you type into, like a spreadsheet; the totals add up as you type.")}><div${chg4("A procedure's other details (the full description, the area and what share Aetna pays) open on hover in a card beside the panel, so the line keeps only the code, the procedure and the money.")}>${sheetTable(v4ApptLines())}</div></div>`, { actions: button("Add", { v: "white", s: "xs", icon: "plus" }), count: O_LINES.length }) : psec("Procedures", bleed(`<table class="w-full border-separate border-spacing-0 text-sm">
        <thead><tr>${["Procedure", null, "Fee", "Ins. est.", "Pt. est."].map((h, i, a) => th(h, i, a.length)).join("")}</tr></thead>
        <tbody>${O_LINES.map((l) => `<tr><td colspan="2" class="${R.tCell} ps-5"><span class="tabular-nums text-gray-500 me-2">${l[0]}</span>Deep cleaning ${l[1]}</td><td class="${R.tCell} text-end tabular-nums">${money(l[3])}</td><td class="${R.tCell} text-end tabular-nums">${money(l[4])}</td><td class="${R.tCell} pe-5 text-end tabular-nums">${money(l[3] - l[4])}</td></tr>`).join("")}</tbody>
        <tfoot><tr><td colspan="2" class="h-9 ps-5 text-sm font-medium text-gray-800">Total</td><td class="h-9 px-3 text-end tabular-nums text-sm">${money(fee)}</td><td class="h-9 px-3 text-end tabular-nums text-sm">${money(ins)}</td><td class="h-9 pe-5 ps-3 text-end tabular-nums text-sm font-semibold">${money(fee - ins)}</td></tr></tfoot></table>`),
      { actions: button("Add", { v: "white", s: "xs", icon: "plus" }), cls: "!pb-1" })}
    ${V4 ? "" : psec("Insurance", `<button type="button" class="group -mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-1.5 text-start hover:bg-gray-50 cursor-pointer" aria-label="View benefits">
        <div class="min-w-0 grow"><p class="text-sm text-gray-800">Aetna Dental PPO <span class="text-gray-500">· Primary</span></p><p class="${R.help}"${chg("The benefits line fits on one line; when it was checked moved to the Verified status's hover.")}>${V2 ? `${money(SCHED_BENEFITS.max - SCHED_BENEFITS.used)} of ${money(SCHED_BENEFITS.max)} left · deductible met` : `${money(1180)} of ${money(1500)} left · deductible met · checked Sep 24`}</p></div>
        ${V2 ? `<span data-tip="Checked Sep 24, 8:12 AM">${statusDot("Verified", "on")}</span>` : statusDot("Verified", "on")}${I("chevron-right", "size-4 shrink-0 text-gray-400 group-hover:text-gray-600")}</button>`,
      { actions: button("Re-verify", { v: "white", s: "xs", icon: "refresh-cw" }) })}
    ${V4 ? psec("Forms", `<div${chg4("Forms is the same compact table as Procedures: boxed, small headers, one line per form.")}>${v4FormsGrid([["HIPAA", "done", "Sep 3"], ["Consent", "needs", "Sent Sep 23"], ["Financial policy", "done", "Sep 3"], ["Medical history", "upd", "Mar 3, 2025"]])}</div>`, { actions: button("Send forms", { v: "white", s: "xs", icon: "send" }), count: 4 })
      : psec("Forms", bleed(formsTable([["HIPAA", "done", "Sep 3"], ["Consent", "needs", "Sent Sep 23"], ["Financial policy", "done", "Sep 3"], ["Medical history", "upd", "Mar 3, 2025"]])), { actions: button("Send forms", { v: "white", s: "xs", icon: "send" }), cls: "!pb-0" })}
    ${psec("Notes", `<textarea class="${R.textarea} !min-h-14" aria-label="Appointment note">Prefers the chair reclined slowly.</textarea>`)}`;
}
/* v4: the appointment's facts and lines are tables you type into; Status is the first fact (no row of its own) */
const APPT_STATUS = [["Unconfirmed", "off"], ["Confirmed", "on"], ["Checked in", "mid"], ["In chair", "mid"], ["Completed", "on"], ["No show", "quiet"], ["Cancelled", "quiet"]];
const apptStatusDot = (v) => `<span class="${cx(R.dot, TONE_DOT[(APPT_STATUS.find(([l]) => l === v) || [0, "off"])[1]])}"></span>`;
const apptStatusButton = (v, xs = false) => `<button type="button" class="${cx(R.btn, xs ? R.xs : R.sm, R.white, xs ? "!ps-2" : "!ps-2.5")}" aria-haspopup="menu" aria-label="Change status">${apptStatusDot(v)}${v}${I("chevron-down", "!text-gray-400")}</button>`;
const SCHED_PROVIDER_NAMES = ["Dr. Maya Patel", "Dr. Ethan Brooks", "Jordan Kim, RDH", "Sofia Ramirez, RDH"];
function v4ApptFacts(checked) {
  const st = checked ? "Checked in" : "Confirmed", note = checked ? "10:38 AM" : "Sep 23";
  return [...(V4_OPTS.status === "table" ? [{ label: "Status", value: st, type: "select", options: APPT_STATUS.map(([l]) => l),
      html: (r) => `<span class="inline-flex items-center gap-2 min-w-0">${apptStatusDot(r.value)}${esc(r.value)}${r.value === st ? `<span class="text-gray-500 truncate">· ${note}</span>` : ""}</span>` }] : []),
    { label: "Provider", value: "Jordan Kim, RDH", type: "select", options: SCHED_PROVIDER_NAMES }, { label: "Primary dentist", value: "Dr. Maya Patel", type: "select", options: SCHED_PROVIDER_NAMES.slice(0, 2) },
    { label: "Guarantor", value: "Self", type: "select", options: ["Self", "Spouse", "Parent", "Other"] }, { label: "Booked", value: "Sep 3 by Priya", type: "none" }];
}
/* v4: Olivia's insurance is a line of the Appointment table (verified and when, like every appointment's panel); the
 * plan and its benefits open on hover. Re-verify is in the Actions menu. */
const v4OliviaIns = () => ({ label: "Insurance", value: "Verified", type: "none",
  html: () => `<span class="inline-flex items-center gap-1.5 min-w-0"${chg4("Insurance is a line of the Appointment table (“Verified · Sep 24”) instead of its own section; the plan, what's left this year and the deductible open on hover, and Re-verify is in Actions.")}>Verified <span class="text-gray-500 truncate">· Sep 24</span></span>`,
  peek: () => peekCard("Aetna Dental PPO", [["Coverage", "Primary"], ["Left this year", `${money(SCHED_BENEFITS.max - SCHED_BENEFITS.used)} of ${money(SCHED_BENEFITS.max)}`], ["Deductible", "Met"], ["Checked", "Sep 24, 8:12 AM"]], "Re-verify is in Actions.") });
const V4_AREA = { UR: "Upper right", LR: "Lower right", UL: "Upper left", LL: "Lower left" };
function v4ApptLines() {
  const foot = (rows) => ["Total", money(rows.reduce((a, r) => a + r.fee, 0)), money(rows.reduce((a, r) => a + r.ins, 0)), money(rows.reduce((a, r) => a + r.fee - r.ins, 0))];
  const rows = O_LINES.map(([code, area, desc, fee, ins], i) => ({ id: `o${i}`, code, area, desc, fee, ins }));
  return { title: "Procedures", rows, foot: foot(rows), onCommit: (r, k, v, g) => { g.o.foot = foot(g.data); },
    peek: (r) => peekCard(`${r.code} · Deep cleaning ${esc(r.area)}`, [["Description", esc(r.desc)], ["Area", V4_AREA[r.area] || esc(r.area)], ["Aetna pays", r.fee ? `${Math.round((r.ins / r.fee) * 100)}% of the fee` : "None"]]),
    columns: [{ key: "code", label: "Procedure", w: 120, grow: true, render: (r) => `<span class="tabular-nums text-gray-500 me-2">${r.code}</span>Deep cleaning ${esc(r.area)}` },
      { key: "fee", label: "Fee", w: 92, num: true, kind: "money", edit: "text", render: (r) => money(r.fee) }, { key: "ins", label: "Ins. est.", w: 92, num: true, kind: "money", edit: "text", render: (r) => money(r.ins) },
      { key: "pt", label: "Pt. est.", w: 88, num: true, render: (r) => `<span class="text-gray-500">${money(r.fee - r.ins)}</span>` }] };
}
/* v4: the appointment's Actions menu. What the footer buttons (Reschedule, Check in) and the header icons (Open chart,
 * Print route slip) already do isn't repeated here. */
const apptActions = (checked) => [
  { label: "Appointment", items: [{ icon: "circle-check", label: "Confirm appointment", hint: "Mark it confirmed and note how", off: checked ? "Already checked in" : "" }, { icon: "message-square", label: "Send reminder text", hint: "Text the time and address now" },
    { icon: "list-plus", label: "Add to ASAP list", hint: "Offer an earlier time if one opens" }, { icon: "copy", label: "Copy appointment", hint: "Book the same visit on another day" }, { icon: "history", label: "Appointment history", hint: "Who booked, moved and confirmed it" }] },
  { label: "Patient", items: [{ icon: "send", label: "Send forms", hint: "Text a link to the forms still to sign", suggest: "Her consent form isn't signed yet" }, { icon: "credit-card", label: "Collect payment", hint: "Take the family balance" },
    { icon: "shield-check", label: "Re-verify insurance", hint: "Check benefits with Aetna again" }, { icon: "message-circle", label: "Text patient", hint: "Open the text thread" }] },
  { label: "", items: [{ icon: "user-x", label: "Mark no-show", danger: true }, { icon: "ban", label: "Cancel appointment", danger: true }] }];
const APPT_DOTS = [["circle-check", "Confirm"], ["message-square", "Send reminder"], ["copy", "Copy appointment"], ["user-x", "No-show"], ["ban", "Cancel", true]];
const apptMenu = (state) => (!V4 ? iconButton("ellipsis", "Appointment actions", { v: "white", s: "iconSm" }) : V4_OPTS.menu === "dots" ? dotsMenu(APPT_DOTS, { label: "Appointment actions", open: V4_OPTS.open })
  : `<div${chg4("The ⋯ is one Actions menu: search it, actions grouped by appointment and patient, and a sparkle on Send forms because her consent isn't signed.")}>${actionsMenu(apptActions(state === "Checked in"), { open: V4_OPTS.open })}</div>`);
const apptDetailFooter = (state) => `${apptMenu(state)}<span class="grow"></span>${state === "Loading" ? `${skel("w-24", "h-8")}${skel("w-24", "h-8")}` : state === "Checked in" ? `${button("Reschedule", { v: "white", s: "sm" })}${V2 ? button("Check out", { v: "solid", s: "sm", icon: "log-out", attrs: chg("Check out is in sentence case, like Check in in the same spot.") }) : button("Check Out", { v: "solid", s: "sm", icon: "log-out" })}` : `${button("Reschedule", { v: "white", s: "sm" })}${button("Check in", { v: "solid", s: "sm", icon: "log-in" })}`}`;
/* v4: Olivia's marks in the one patient header: her medical alerts as one icon with the count (orange: she must
 * premedicate; hover lists them) and the family balance as a wallet, instead of a "Before the visit" list */
const OLIVIA_ALERTS = ["Premedicate: amoxicillin 2 g, 1 hour before. Ask if she took it", "Latex allergy: use nitrile gloves"];
const v4OliviaMarks = () => `<span class="flex items-center gap-2"${chg4("Her alerts and the family balance are marks by her name, as on every patient header: one orange icon with the count (hover lists Premedicate and the latex allergy) and a wallet with $740.00. The Before the visit list is gone.")}>${patientMarks({ alerts: OLIVIA_ALERTS, familyBalance: 740 })}</span>`;

/* Generic detail for any card clicked on the day schedule (opens the real Sheet) */
function openApptSheet(a) {
  if (a.pt === "p5") return Sheet.open({ title: "Olivia Nguyen", lead: avatar("Olivia Nguyen", { size: 9 }), subtitle: "Fri, Sep 25 · 11:00 AM–12:00 PM · Hyg 2", actions: iconButton("external-link", "Open chart", { s: "iconSm" }), body: apptDetailBody("Checked in"), footer: apptDetailFooter("Checked in"), flush: true, ...(V4 ? { marks: v4OliviaMarks() } : {}) });
  if (V4) return v4ApptSheet(a);
  const name = ptName(a.pt), st = ST[a.st], op = OPS[a.op];
  const lines = a.codes.map((c) => DATA.proc(c)), fee = lines.reduce((s, p) => s + p.fee, 0);
  const end = mins(a.start) + a.dur;
  const caption = V2 ? { sched: "Not confirmed yet", conf: "By text · Sep 23", in: "10:38 AM", prog: `Since ${clock(mins(a.start))}`, done: `Finished at ${clock(end)}`, canc: "By the patient · Sep 24", bump: "By the office" }[a.st]
    : { sched: "Not confirmed yet", conf: "Confirmed by text · Sep 23", in: "Checked in at 10:38 AM", prog: `In the chair since ${clock(mins(a.start))}`, done: `Finished at ${clock(end)}`, canc: "Cancelled by the patient · Sep 24", bump: "Bumped by the office" }[a.st];
  const statusBtn = `<button type="button" class="${cx(R.btn, R.sm, R.white, "!ps-2.5")}" aria-haspopup="menu" aria-label="Change status"><span class="${cx(R.dot, TONE_DOT[st.tone])}"></span>${st.label}${I("chevron-down", "!text-gray-400")}</button>`;
  /* Legend chips become plain rows; a med or premed chip carries the appointment note */
  const noted = a.note && a.chips.some((k) => k === "med" || k === "premed");
  const rows = a.chips.filter((k) => !V2 || !V2_CARD_QUIET.has(k)).map((k) => { const [l, ic, t] = CHIP[k]; const withNote = a.note && (k === "premed" || (k === "med" && !a.chips.includes("premed")));
    return infoRow(ic, withNote ? `<span class="font-medium">${l}.</span> ${esc(a.note)}` : l, { tone: t === "needs" ? "needs" : t === "on" && !V2 ? "blue" : "gray" }); });
  if (a.note && !noted) rows.push(infoRow("notebook-pen", esc(a.note)));
  const th = (h, i, n) => `<th ${i === 0 ? 'colspan="2"' : ""} class="${R.tHead} ${i ? "!text-end" : "!ps-5"} ${i === n - 1 ? "!pe-5" : ""}">${h}</th>`;
  Sheet.open({
    flush: true,
    title: esc(name), lead: avatar(name, { size: 9 }), subtitle: `Fri, Sep 25 · ${range(a.start, a.dur)}`,
    actions: iconButton("external-link", "Open chart", { s: "iconSm" }),
    body: `<section class="${R.psec} flex items-center justify-between gap-3 !py-3">${statusBtn}<span class="text-[13px] text-gray-500">${caption}</span></section>
      ${rows.length ? psec("Things to know", `<div class="-my-1.5">${rows.join("")}</div>`, { count: rows.length }) : ""}
      ${psec("Appointment", metaGrid([["Chair", op.name], ["Provider", op.prov.name], ["Length", `${a.dur} min`]]))}
      ${psec("Procedures", bleed(`<table class="w-full border-separate border-spacing-0 text-sm">
          <thead><tr>${["Procedure", "Fee"].map((h, i, arr) => th(h, i, arr.length)).join("")}</tr></thead>
          <tbody>${lines.map((p) => `<tr><td colspan="2" class="${R.tCell} ps-5 max-w-0 w-full truncate"><span class="tabular-nums text-gray-500 me-2">${p.code}</span>${esc(p.name)}</td><td class="${R.tCell} pe-5 text-end tabular-nums">${money(p.fee)}</td></tr>`).join("")}</tbody>
          <tfoot><tr><td colspan="2" class="h-9 ps-5 text-sm font-medium text-gray-800">Office fee</td><td class="h-9 pe-5 ps-3 text-end tabular-nums text-sm font-semibold">${money(fee)}</td></tr></tfoot></table>`),
        { actions: button("Add", { v: "white", s: "xs", icon: "plus" }), cls: "!pb-1" })}`,
    footer: `${iconButton("ellipsis", "Appointment actions", { v: "white", s: "iconSm" })}<span class="grow"></span>${button("Reschedule", { v: "white", s: "sm" })}${a.st === "done" ? button("Open checkout", { v: "solid", s: "sm" }) : a.st === "in" || a.st === "prog" ? button(V2 ? "Check out" : "Check Out", { v: "solid", s: "sm", icon: "log-out" }) : button("Check in", { v: "solid", s: "sm", icon: "log-in" })}`
  });
}
/* v4: any card's panel the way Olivia's is drawn: status as the first line of the Appointment table, procedures you
 * type into, and the one Actions menu. A completed visit's fees are posted, so its lines are read-only. */
const V4_ST_WORD = { sched: "Unconfirmed", conf: "Confirmed", in: "Checked in", prog: "In chair", done: "Completed", canc: "Cancelled", bump: "Bumped" };
/* the status cell's grey note is when, never how ("Confirmed · Sep 23", not "By text"); Unconfirmed needs none */
const V4_ST_NOTE = (a) => ({ sched: "", conf: "Sep 23", in: "10:38 AM", prog: `Since ${clock(mins(a.start))}`, done: clock(mins(a.start) + a.dur), canc: "Sep 24", bump: "Today" }[a.st]);
/* v4: what a card's icons say, split the way the patient header wants it. Medical alerts and the balance become marks by
 * the name; insurance, forms and how it was booked become lines of the Appointment table. Invented balances for the
 * made-up patients. */
const V4_BAL = { x2: 85, x7: 120, x13: 45, x14: 260 };
const v4ApptMarks = (a) => { const p = EXTRA[a.pt] ? null : DATA.patient(a.pt), has = (k) => a.chips.includes(k);
  const alerts = !has("med") && !has("premed") ? [] : p && p.alerts.length ? p.alerts.map((t) => (/^premedicate/i.test(t) && a.note ? a.note : t)) : [a.note || "Medical alert"];
  const familyBalance = has("bal") || has("fbal") ? (p && p.balance) || V4_BAL[a.pt] || 0 : 0;
  return patientMarks({ alerts, familyBalance, newPatient: has("np") }); };
const v4Problem = (t) => `<span class="inline-flex items-center gap-1.5 text-gray-500">${I("circle-alert", "size-3.5 shrink-0 text-orange-500")}${t}</span>`;
const v4ApptMoreFacts = (a) => { const has = (k) => a.chips.includes(k), out = [];
  const ins = has("insrev") ? v4Problem("Needs review") : has("insmiss") ? v4Problem("Details missing") : has("pend") ? `<span class="text-gray-500">Pending</span>` : has("ver") ? `Verified <span class="text-gray-500">· Sep 24</span>` : `<span class="text-gray-500">Not checked</span>`;
  out.push({ label: "Insurance", value: "ins", type: "none", html: () => ins });
  if (has("forms") || has("formsok")) out.push({ label: "Forms", value: "forms", type: "none", html: () => (has("forms") ? v4Problem("Not all signed") : "All signed") });
  if (has("ai")) out.push({ label: "Booked", value: "By the AI receptionist", type: "none" });
  if (has("claim")) out.push({ label: "Claim", value: "Sent", type: "none" });
  return out; };
const v4ApptActionsFor = (a) => { const over = a.st === "done", gone = a.st === "canc" || a.st === "bump", has = (k) => a.chips.includes(k);
  return [
    { label: "Appointment", items: [{ icon: "circle-check", label: "Confirm appointment", hint: "Mark it confirmed and note how", off: a.st === "sched" ? "" : over ? "The visit is over" : gone ? "It's cancelled" : "Already confirmed" },
      { icon: "message-square", label: "Send reminder text", hint: "Text the time and address now", off: over ? "The visit is over" : gone ? "It's cancelled" : "" },
      { icon: "list-plus", label: "Add to ASAP list", hint: "Offer an earlier time if one opens", off: over ? "The visit is over" : "" }, { icon: "copy", label: "Copy appointment", hint: "Book the same visit on another day" },
      { icon: "history", label: "Appointment history", hint: "Who booked, moved and confirmed it" }] },
    { label: "Patient", items: [{ icon: "send", label: "Send forms", hint: "Text a link to the forms still to sign", suggest: has("forms") ? "Their forms aren't complete" : "" },
      { icon: "credit-card", label: "Collect payment", hint: "Take the balance due", suggest: has("bal") || has("fbal") ? "There's a balance due" : "" },
      { icon: "shield-check", label: "Re-verify insurance", hint: "Check benefits with the payer again", suggest: has("insrev") || has("insmiss") ? "Insurance needs review" : "" }, { icon: "message-circle", label: "Text patient", hint: "Open the text thread" }] },
    { label: "", items: [{ icon: "user-x", label: "Mark no-show", danger: true, off: over ? "The visit is already completed" : "" }, { icon: "ban", label: "Cancel appointment", danger: true, off: gone ? "Already cancelled" : over ? "The visit is already completed" : "" }] }]; };
function v4ApptSheet(a) {
  const name = ptName(a.pt), op = OPS[a.op], word = V4_ST_WORD[a.st], posted = a.st === "done";
  const facts = [{ label: "Status", value: word, type: "select", options: [...APPT_STATUS.map(([l]) => l), ...(APPT_STATUS.some(([l]) => l === word) ? [] : [word])],
      html: (r) => `<span class="inline-flex items-center gap-2 min-w-0">${apptStatusDot(r.value)}${esc(r.value)}${r.value === word && V4_ST_NOTE(a) ? `<span class="text-gray-500 truncate">· ${V4_ST_NOTE(a)}</span>` : ""}</span>` },
    { label: "Chair", value: op.name, type: "select", options: OPS.map((o) => o.name) }, { label: "Provider", value: op.prov.name, type: "select", options: SCHED_PROVIDER_NAMES },
    { label: "Length", value: `${a.dur} min`, type: "select", options: ["15 min", "30 min", "45 min", "60 min", "90 min"] }, ...v4ApptMoreFacts(a)];
  const marks = v4ApptMarks(a);
  const foot = (rs) => ["Office fee", money(rs.reduce((s, r) => s + Number(r.fee || 0), 0))];
  const lines = a.codes.map((c, i) => { const p = DATA.proc(c); return { id: `l${i}`, code: p.code, name: p.name, fee: p.fee }; });
  Sheet.open({
    flush: true, title: esc(name), lead: avatar(name, { size: 9 }), subtitle: `Fri, Sep 25 · ${range(a.start, a.dur)}`,
    marks: marks ? `<span class="flex items-center gap-2"${chg4("Medical alerts, the balance and New patient are marks by the name, as on every patient header, instead of a Things to know list.")}>${marks}</span>` : "",
    actions: iconButton("external-link", "Open chart", { s: "iconSm" }),
    body: `${psec("", `<div${chg4("Status is the first line of the Appointment table (“Confirmed · Sep 23”); chair, provider and length are cells you type into, and insurance and forms are lines of the same table, orange only when someone must act.")}><div${chg4("The Appointment table carries its name in the same grey band as Procedures, so both tables on the panel have the same header.")}>${v4SchedFields(facts, { band: "Appointment", labelW: 140, title: "Appointment" })}</div></div>`)}
      ${psec("Procedures", `<div${chg4(posted ? "A completed visit's fees are posted, so its lines are read-only here; change them in the ledger." : "Fees are cells you type into; the office fee adds up as you type.")}>${sheetTable({ title: "Procedures", rows: lines, foot: foot(lines), onCommit: (r, k, v, g) => { g.o.foot = foot(g.data); },
        columns: [{ key: "name", label: "Procedure", w: 160, grow: true, render: (r) => `<span class="tabular-nums text-gray-500 me-2">${r.code}</span>${esc(r.name)}` },
          { key: "fee", label: "Fee", w: 96, num: true, kind: "money", edit: posted ? null : "text", render: (r) => money(Number(r.fee || 0)) }] })}</div>`, { actions: posted ? "" : button("Add", { v: "white", s: "xs", icon: "plus" }), count: lines.length })}`,
    footer: `<div${chg4("The ⋯ is one Actions menu: searchable, grouped by appointment and patient; what can't run yet stays greyed with the reason.")}>${actionsMenu(v4ApptActionsFor(a), { open: V4_OPTS.open })}</div><span class="grow"></span>${button("Reschedule", { v: "white", s: "sm" })}${a.st === "done" ? button("Open checkout", { v: "solid", s: "sm" }) : a.st === "in" || a.st === "prog" ? button("Check out", { v: "solid", s: "sm", icon: "log-out" }) : button("Check in", { v: "solid", s: "sm", icon: "log-in" })}`
  });
}
/* v4: a table of fields like the kit's fieldTable, with a grey hint per row (r.ph), for booking and search fields */
/* band: the table's group name in the grey header band, for a panel whose line tables (Procedures, Forms) have one, so
 * every table on the panel has the same header (the claim panel's look); peek(row): that row's details on hover */
const v4SchedFields = (rows, { labelW = 120, title = "Fields", onCommit = null, band = "", peek = null } = {}) => sheetTable({ title, head: !!band, onCommit, peek,
  rows: rows.map((r, i) => ({ id: `f${i}`, type: "text", ...r })),
  columns: [{ key: "label", label: band ? esc(band) : "Field", w: labelW, render: (r) => (r.icon ? `<span class="inline-flex items-center gap-2 text-gray-500">${I(r.icon, "size-3.5 shrink-0 text-gray-400")}${esc(r.label)}</span>` : `<span class="text-gray-500">${esc(r.label)}</span>`) },
    { key: "value", label: band ? "" : "Value", w: 160, grow: true, edit: (r) => (r.type === "none" ? null : r.type), options: (r) => r.options, placeholder: (r) => r.ph || `Add ${r.label.toLowerCase()}`, render: (r) => (r.html ? r.html(r) : esc(r.value)) }] });
function wireDay(el, appts) {
  el.addEventListener("click", (e) => {
    const c = e.target.closest("[data-appt]"); if (c) { const a = appts.find((x) => x.id === c.dataset.appt); if (a) openApptSheet(a); return; }
    const n = e.target.closest('[data-act="names"]');
    if (n) { const off = n.getAttribute("aria-pressed") !== "true"; n.setAttribute("aria-pressed", off); n.setAttribute("aria-label", off ? "Show patient names" : "Hide patient names"); n.title = n.getAttribute("aria-label");
      n.classList.toggle("!bg-gray-100", off); n.classList.toggle("!text-gray-800", off);
      el.querySelectorAll("[data-nm]").forEach((x) => (x.hidden = off)); el.querySelectorAll("[data-ini]").forEach((x) => (x.hidden = !off)); }
  });
}

/* ================================================================ 1. Day schedule by chair */
defineBlock({
  cat: "schedule", id: "schedule-day", thumb: true,
  title: "Day schedule by chair",
  note: V2 ? "One column per chair on a 15-minute grid, with the provider's colour as a pale fill and a thin bar. Everything above the grid is one row, so the day gets the height. A card is two lines: the name (with a status word only when it's unusual) and the start time with the procedure. What needs attention is a small orange icon; rest the pointer on it to read it. Click a card to open it, or hide patient names from the top row."
    : "One column per chair on a 15-minute grid, with the provider's colour as a pale fill and a thin bar. Everything above the grid is one row, so the day gets the height. Cards grow with the visit: short ones show the name and status, longer ones add codes. What needs attention is a small icon at the card's bottom right; rest the pointer on it to read it. Click a card to open it, or hide patient names from the top row.",
  where: "PMS › Scheduling › Day",
  states: ["Normal", "Busy day", "Empty day"],
  canvas: "bare",
  html: (state) => {
    if (state === "Empty day") return `${schedBar({ date: "Thu, Oct 15", count: 0 })}
      <div class="relative">${dayGrid({ empty: true, holds: [] })}
        <div class="absolute left-1/2 top-[132px] -translate-x-1/2 w-[400px] ${R.box}">${emptyState({ icon: "calendar-plus", title: "Nothing booked on Thursday, Oct 15 yet", body: "Click any open time to book it, or fill the day from the ASAP list.", action: `<div class="flex gap-2 justify-center">${button(`ASAP / Waitlist <span class="${R.count}">6</span>`, { v: "white", s: "sm" })}${button("Find open slots", { v: "white", s: "sm", icon: "calendar-search" })}</div>` })}</div></div>`;
    const appts = state === "Busy day" ? busyDay() : DAY;
    return `${schedBar({ count: appts.length })}${dayGrid({ appts, util: state === "Busy day" ? [100, 96, 94, 100] : undefined })}`;
  },
  mount: (el, state) => wireDay(el, state === "Busy day" ? busyDay() : DAY)
});

/* ================================================================ 2. Card specimens */
const SPEC = [
  ["Scheduled", { op: 2, start: "11:30", dur: 30, pt: "x10", what: "Cleaning, exam", codes: ["D1110", "D0120"], st: "sched", chips: ["forms"] }],
  ["Confirmed", { op: 0, start: "11:30", dur: 30, pt: "x3", what: "Filling #3 O", codes: ["D2391"], st: "conf", chips: ["ver"] }],
  ["Checked in", { op: 3, start: "11:00", dur: 45, pt: "p5", what: "Deep cleaning, UR and LR", codes: ["D4341", "D4341"], st: "in", chips: ["premed", "ver"] }],
  ["In progress", { op: 2, start: "10:15", dur: 45, pt: "p10", what: "Perio maintenance", codes: ["D4910"], st: "prog", chips: ["ver", "fbal"] }],
  ["Completed", { op: 1, start: "9:30", dur: 45, pt: "p9", what: "New patient exam, x-rays", codes: ["D0150", "D0210"], st: "done", chips: ["np", "insmiss"] }],
  ["Cancelled", { op: 2, start: "8:00", dur: 30, pt: "x9", what: "Child cleaning, fluoride", codes: ["D1120"], st: "canc", chips: [] }],
  ["Bumped", { op: 1, start: "1:00", dur: 30, pt: "x5", what: "Crown seat #14", codes: ["D2740"], st: "bump", chips: [] }]
];
defineBlock({
  cat: "schedule", id: "schedule-cards", title: "Appointment cards",
  note: "Every status a card can be in, then a 15-minute and a 90-minute visit side by side, then the full legend. Status is always a dot and a word. Everything else is an icon on the card, with its name on hover, because a day can carry a dozen of them; the legend below spells each one out. Only orange icons need a person.",
  where: "PMS › Scheduling",
  states: ["Names shown", "Names hidden"],
  canvas: "gray",
  html: () => `<div class="grid grid-cols-4 gap-x-5 gap-y-5">${SPEC.map(([l, a]) => `<div><p class="${R.caption} mb-2">${l}</p><div class="relative">${apptCard({ id: "s" + l, ...a }, { abs: false })}</div></div>`).join("")}</div>
    <div class="grid grid-cols-[1fr_1fr] gap-5 mt-7">
      <div><p class="${R.caption} mb-2">Short · 15 min</p>${apptCard({ id: "s15", op: 1, start: "10:45", dur: 15, pt: "x6", what: "Emergency pain", codes: ["D9110"], st: "in", chips: ["np"] }, { abs: false })}
        <p class="${R.caption} mt-5 mb-2"${chg("The caption says what the picture shows: two visits double booked in the same chair.")}>${V2 ? "Double booked · same chair · 30 min each" : "Two chairs at once · 30 min each"}</p><div class="grid grid-cols-2 gap-1">${apptCard({ id: "sd1", op: 1, start: "11:00", dur: 30, pt: "x7", what: "Crown seat #19", codes: ["D2740"], st: "conf", chips: ["bal"] }, { abs: false })}${apptCard({ id: "sd2", op: 1, start: "11:00", dur: 30, pt: "x14", what: "Denture adjustment", codes: ["D9110"], st: "conf", chips: ["fbal"] }, { abs: false })}</div>
        <p class="${R.caption} mt-5 mb-2">Held time and lunch</p><div class="flex items-center justify-center h-[46px] rounded-md" style="${hatch}"><span class="text-xs text-gray-500">Held for emergencies</span></div></div>
      <div><p class="${R.caption} mb-2">Long · 90 min</p>${apptCard(DAY[2], { abs: false })}</div></div>
    <div class="mt-8 border-t border-gray-200/80 pt-5">
      <p class="${R.groupTitle} mb-3">Legend</p>
      <div class="grid grid-cols-4 gap-x-6 gap-y-4"${chg("Legend icons are grey unless a person must act (orange). Ins. Verified, AI Confirmed and AI Booked used to be blue.")}>${[["Confirmation", ["aiconf"], ["Unconfirmed", "Confirmed", "Manually Confirmed", "Checked In", "In Progress"]], ["Insurance", ["ver", "pend", "insrev", "insmiss"]], ["Balances and claims", ["bal", "fbal", "claim"]], ["Patient", ["np", "med", "premed", "forms", "formsok", "ai"]]]
        .map(([t, ks, words]) => `<div><p class="${R.eyebrow} mb-2">${t}</p><div class="flex flex-wrap gap-1.5">${ks.map(miniChip).join("")}${words ? words.map((w, i) => `<span class="inline-flex items-center h-[18px]">${statusDot(w, ["off", "on", "on", "mid", "on"][i], "!text-xs !text-gray-600 !gap-x-1")}</span>`).join("") : ""}</div></div>`).join("")}</div></div>`,
  mount: (el, state) => { if (state === "Names hidden") { el.querySelectorAll("[data-nm]").forEach((x) => (x.hidden = true)); el.querySelectorAll("[data-ini]").forEach((x) => (x.hidden = false)); } }
});

/* ================================================================ 3. Hover card */
/* v2 hover card: the safety alert first, then one line each for procedures, insurance, the estimate and the balance;
 * forms are one line when all are signed and the small table only when one isn't */
function v2HoverCard(needs) {
  const p = needs ? DATA.patient("p5") : DATA.patient("p1");
  const lines = needs ? [["D4341", "Deep cleaning UR", 260], ["D4341", "Deep cleaning LR", 260]] : [["D0120", "Periodic exam", 65], ["D1110", "Adult cleaning", 110], ["D0274", "Bitewings, four films", 78]];
  const total = lines.reduce((a, l) => a + l[2], 0);
  const kvLine = (k, v, attrs = "") => `<div class="flex items-center justify-between gap-3 h-7 text-[13px]"${attrs}><span class="text-gray-500">${k}</span><span class="min-w-0 truncate text-gray-800 tabular-nums">${v}</span></div>`;
  const forms = needs ? `<div class="border-t border-gray-200/80">${formsTable([["HIPAA", "done", "Sep 3"], ["Consent", "needs", "Sent Sep 23"], ["Medical Hx", "upd", "Mar 3, 2025"]], { pad: 4, dense: true })}</div>`
    : `<div class="border-t border-gray-200/80 px-4 py-1.5"${chg("When every form is signed, forms are one line instead of a four-row table; the table shows only when a form still needs signing.")}>${kvLine("Forms", "All 4 signed · Sep 20")}</div>`;
  const st = needs ? statusDot("Checked in", "mid", "!text-xs") : statusDot("Completed", "quiet", "!text-xs");
  const head = `<div class="flex items-start gap-3 px-4 pt-3.5 pb-3">${avatar(p.name, { size: 9 })}<div class="min-w-0 grow"><p class="text-sm font-semibold text-gray-800">${p.name}</p><p class="${R.caption}">${p.age} y · ${fmtDateY(p.dob)} · #${needs ? "10045" : "10012"}</p></div>${st}</div>`;
  return `<div class="${R.popover} w-[360px]" role="dialog" aria-label="${p.name} appointment preview">
    ${head}
    <div class="px-4 pb-3 space-y-1 text-[13px] text-gray-600">
      <p class="flex items-center gap-2">${I("clock", "size-3.5 text-gray-400")}<span class="tabular-nums">Fri, Sep 25 · ${needs ? "11:00 AM–12:00 PM" : "9:00–10:00 AM"}</span></p>
      <p class="flex items-center gap-2">${I("armchair", "size-3.5 text-gray-400")}${needs ? "Hyg 2 · Jordan Kim, RDH" : "Hyg 1 · Sofia Ramirez, RDH"}</p></div>
    ${needs ? `<div class="border-t border-gray-200/80 px-4 py-1.5"${chg("Premedicate is the first thing under the name and time, not the last line under the forms: it's what a hover must say first.")}>${infoRow("circle-alert", `<span class="font-medium">Premedicate.</span> Amoxicillin 2 g, 1 hour before.`, { tone: "needs" })}</div>` : ""}
    <div class="border-t border-gray-200/80 px-4 py-1.5">
      <div${chg("The procedures are one line with the office fee; the codes are on its hover, so the card is about half as tall.")}>${kvLine(`<span data-tip="${lines.map((l) => `${l[0]} ${l[1]}`).join(" · ")}" class="underline decoration-dotted decoration-gray-300 underline-offset-4">${lines.length} procedures</span>`, `${money(total)} office fee`)}</div>
      ${kvLine("Insurance", needs ? `<span class="inline-flex items-center gap-1.5">Aetna Dental PPO <span class="text-gray-300">·</span>${statusDot("Needs review", "needs", "!text-[13px]")}</span>` : `Delta Dental PPO <span class="text-gray-500">· verified Sep 24</span>`, needs ? "" : chg("Verified insurance is plain grey words; only a problem gets a coloured dot (there were five blue dots on this card)."))}
      <div${chg("The estimate row says “Ins. est.”; it used to carry the payer's name as its label.")}>${kvLine("Ins. est.", needs ? money(416) : money(202.4))}</div>
      ${kvLine("Patient balance", money(p.balance))}</div>
    ${forms}</div>`;
}
/* v4 hover card: the one patient header (alerts and family balance as marks by the name, New patient as a tag), then
 * one line each for the status, when, where and the insurance check, the procedures with the fee and estimate, and the
 * forms (a table only when one isn't signed). Everything the card's icons say is here, nothing more. */
function v4HoverCard(needs) {
  const a = needs ? DAY[16] : DAY[11], p = DATA.patient(a.pt), op = OPS[a.op];
  const lines = needs ? [["D4341", "Deep cleaning UR", 260], ["D4341", "Deep cleaning LR", 260]] : [["D0120", "Periodic exam", 65], ["D1110", "Adult cleaning", 110], ["D0274", "Bitewings, four films", 78]];
  const total = lines.reduce((s, l) => s + l[2], 0), est = needs ? 416 : 202.4, payer = needs ? "Aetna Dental PPO" : "Delta Dental PPO";
  const kvLine = (k, v) => `<div class="flex items-center justify-between gap-3 h-7 text-[13px]"><span class="text-gray-500">${k}</span><span class="min-w-0 truncate text-gray-800 tabular-nums">${v}</span></div>`;
  const line = (icon, html, attrs = "") => `<p class="flex items-center gap-2 min-w-0"${attrs}>${icon}<span class="min-w-0 truncate">${html}</span></p>`;
  const has = (k) => a.chips.includes(k), word = V4_ST_WORD[a.st], tone = (APPT_STATUS.find(([l]) => l === word) || [0, "off"])[1];
  const insOk = !has("insrev") && !has("insmiss");
  const ins = insOk ? line(I("shield-check", "size-3.5 shrink-0 text-gray-400"), `${payer} <span class="text-gray-400">·</span> Verified Sep 24`)
    : line(I("circle-alert", "size-3.5 shrink-0 text-orange-500"), `${payer} <span class="text-gray-400">·</span> ${has("insrev") ? "Needs review" : "Details missing"}`);
  const alerts = has("med") || has("premed") ? (needs ? OLIVIA_ALERTS : p.alerts) : [];
  const forms = needs ? `<div class="border-t border-gray-200/80 px-4 py-3">${v4FormsGrid([["HIPAA", "done", "Sep 3"], ["Consent", "needs", "Sent Sep 23"], ["Medical Hx", "upd", "Mar 3, 2025"]])}</div>`
    : `<div class="border-t border-gray-200/80 px-4 py-1.5">${kvLine("Forms", "All 4 signed · Sep 20")}</div>`;
  return `<div class="${R.popover} w-[360px]" role="dialog" aria-label="${p.name} appointment preview">
    <div class="[&>header]:!px-4 [&>header]:!pb-2"${chg4(needs ? "The patient header is the same as the chart's: medical alerts are one orange icon with the count by her name (hover lists Premedicate and the latex allergy) and the family balance a wallet with the amount, instead of a Premedicate row and a Patient balance row." : "The patient header is the same as the chart's: her allergy is one grey icon with the count by her name and the balance a wallet with the amount, the two icons her card shows.")}>${patientHeader({ name: p.name, sub: `${p.age} y · ${fmtDateY(p.dob)} · #${needs ? "10045" : "10012"}`, alerts, familyBalance: has("bal") || has("fbal") || needs ? p.balance : 0, newPatient: has("np"), rule: false })}</div>
    <div class="px-4 pb-3 space-y-1 text-[13px] text-gray-600">
      ${line(`<span class="flex size-3.5 shrink-0 items-center justify-center"><span class="${cx(R.dot, TONE_DOT[tone])}"></span></span>`, `<span class="text-gray-800">${word}</span> <span class="text-gray-400">·</span> ${V4_ST_NOTE(a)}`, chg4("The status has its own line under the name, with when it changed (“Checked in · 10:38 AM”), instead of squeezed next to the name."))}
      ${line(I("clock", "size-3.5 shrink-0 text-gray-400"), `<span class="tabular-nums">Fri, Sep 25 · ${range(a.start, a.dur)}</span>`)}
      ${line(I("armchair", "size-3.5 shrink-0 text-gray-400"), `${op.name} · ${op.prov.name}`)}
      <div${chg4("The insurance check has its own line, the same as the card's shield: “Verified Sep 24” in grey, or the problem with an orange icon.")}>${ins}</div></div>
    <div class="border-t border-gray-200/80 px-4 py-1.5">
      ${kvLine(`<span data-tip="${lines.map((l) => `${l[0]} ${l[1]}`).join(" · ")}" class="underline decoration-dotted decoration-gray-300 underline-offset-4">${lines.length} procedures</span>`, `${money(total)} office fee`)}
      ${kvLine("Ins. est.", money(est))}</div>
    ${forms}</div>`;
}
function hoverCard(which) {
  if (V4) return v4HoverCard(which === "Needs attention");
  if (V2) return v2HoverCard(which === "Needs attention");
  const needs = which === "Needs attention";
  const p = needs ? DATA.patient("p5") : DATA.patient("p1");
  const lines = needs ? [["D4341", "UR", "Deep cleaning", 260], ["D4341", "LR", "Deep cleaning", 260]] : [["D0120", "", "Periodic exam", 65], ["D1110", "", "Adult cleaning", 110], ["D0274", "", "Bitewings, four films", 78]];
  const total = lines.reduce((a, l) => a + l[3], 0);
  return `<div class="${R.popover} w-[360px]" role="dialog" aria-label="${p.name} appointment preview">
    <div class="flex items-start gap-3 px-4 pt-3.5 pb-3">${avatar(p.name, { size: 9 })}<div class="min-w-0 grow"><p class="text-sm font-semibold text-gray-800">${p.name}</p><p class="${R.caption}">${p.age} y · ${fmtDateY(p.dob)} · #${needs ? "10045" : "10012"}</p></div>${needs ? statusDot("Checked in", "mid", "!text-xs") : statusDot("Completed", "quiet", "!text-xs")}</div>
    <div class="px-4 pb-3 space-y-1 text-[13px] text-gray-600">
      <p class="flex items-center gap-2">${I("clock", "size-3.5 text-gray-400")}<span class="tabular-nums">Fri, Sep 25 · ${needs ? "11:00 AM–12:00 PM" : "9:00–10:00 AM"}</span></p>
      <p class="flex items-center gap-2">${I("armchair", "size-3.5 text-gray-400")}${needs ? "Hyg 2 · Jordan Kim, RDH" : "Hyg 1 · Sofia Ramirez, RDH"}</p></div>
    <div class="border-t border-gray-200/80"><table class="w-full border-separate border-spacing-0 text-[13px]"><tbody>
      ${lines.map((l) => `<tr><td class="h-8 ps-4 pe-2 border-b border-gray-200/80 tabular-nums text-gray-500 w-14">${l[0]}</td><td class="h-8 px-2 border-b border-gray-200/80 text-gray-800">${l[2]}${l[1] ? ` <span class="text-gray-500">${l[1]}</span>` : ""}</td><td class="h-8 ps-2 pe-4 border-b border-gray-200/80 text-end tabular-nums text-gray-800">${money(l[3])}</td></tr>`).join("")}
      <tr><td></td><td class="h-8 px-2 text-gray-500">Office fee</td><td class="h-8 ps-2 pe-4 text-end font-semibold tabular-nums text-gray-800">${money(total)}</td></tr></tbody></table></div>
    <div class="border-t border-gray-200/80 px-4 py-2.5 space-y-1.5">
      <div class="flex items-center justify-between text-[13px]"><span class="text-gray-500">Insurance</span>${needs ? statusDot("Needs review", "needs", "!text-[13px]") : statusDot("Verified Sep 24", "on", "!text-[13px]")}</div>
      <div class="flex items-center justify-between text-[13px]"><span class="text-gray-500">${needs ? "Aetna Dental PPO" : "Delta Dental PPO"}</span><span class="text-gray-800 tabular-nums">${needs ? "Est. $416.00" : "Est. $202.40"}</span></div>
      <div class="flex items-center justify-between text-[13px]"><span class="text-gray-500">Patient balance</span><span class="text-gray-800 tabular-nums">${money(p.balance)}</span></div></div>
    <div class="border-t border-gray-200/80">${formsTable(needs ? [["HIPAA", "done", "Sep 3"], ["Consent", "needs", "Sent Sep 23"], ["Medical history", "upd", "Mar 3, 2025"]] : [["HIPAA", "done", "Sep 20"], ["Consent", "done", "Sep 20"], ["Financial policy", "done", "Sep 20"], ["Medical history", "done", "Sep 20"]], { pad: 4, dense: true })}</div>
    ${needs ? `<div class="border-t border-gray-200/80 px-4 py-2.5">${note("Premedicate: amoxicillin 2 g, 1 hour before.")}</div>` : ""}
  </div>`;
}
defineBlock({
  cat: "schedule", id: "schedule-hover", title: "Appointment hover card",
  note: "What you see when you rest the pointer on a card: who, when and where, the procedures with fees, insurance, balance, and a small forms table that says which forms are signed and when. It opens beside the card, so the schedule stays readable.",
  where: "PMS › Scheduling › hover a card",
  states: ["Normal", "Needs attention"],
  canvas: "bare",
  html: (state) => {
    const needs = state === "Needs attention";
    const a = needs ? DAY[16] : DAY[11], from = needs ? mins("8:00") : mins("7:30"), to = from + 405;
    const grid = dayGrid({ from, to }).replace(`data-appt="${a.id}"`, `data-appt="${a.id}" data-hovered`);
    /* the hovered card gets the focus ring; the popover sits beside it, over the next chair, tall enough for the forms table */
    return `<div class="relative h-[${48 + 27 * SLOT}px] overflow-hidden [&_[data-hovered]]:!border-gray-300 [&_[data-hovered]]:ring-3 [&_[data-hovered]]:ring-blue-600/15">
      <div class="absolute inset-0 w-[1096px]" data-scroll-ok>${grid}</div>
      <div class="absolute z-20" style="top:60px;right:${needs ? 264 : 526}px">${hoverCard(state)}</div></div>`;
  }
});

/* ================================================================ 4. Appointment detail panel */
defineBlock({
  cat: "schedule", id: "schedule-detail", title: "Appointment detail panel",
  note: "The side panel for one visit. Status on one line, then what to know before the visit, the appointment facts, procedures with their totals, insurance, forms and notes. Every line runs edge to edge; Check in is the one blue button.",
  where: "PMS › Scheduling › open an appointment",
  states: ["Confirmed", "Checked in", "Loading"],
  canvas: "bare",
  html: (state) => overPage(1000, sheetPanel({ flush: true, title: state === "Loading" ? skel("w-40", "h-5") : "Olivia Nguyen", lead: state === "Loading" ? `<span class="size-9 shrink-0 ${R.skel} !rounded-full"></span>` : avatar("Olivia Nguyen", { size: 9 }), subtitle: state === "Loading" ? `<span class="block mt-1.5">${skel("w-56")}</span>` : "Fri, Sep 25 · 11:00 AM–12:00 PM · Hyg 2",
      actions: `${iconButton("external-link", "Open chart", { s: "iconSm" })}${iconButton("printer", "Open route slip", { s: "iconSm" })}`, body: apptDetailBody(state), footer: apptDetailFooter(state),
      marks: V4 && state !== "Loading" ? `${V4_OPTS.status === "header" ? apptStatusButton(state === "Checked in" ? "Checked in" : "Confirmed", true) : ""}${v4OliviaMarks()}` : "",
      facts: state === "Loading" ? null : [["Insurance", "Aetna Dental PPO", `${money(SCHED_BENEFITS.max - SCHED_BENEFITS.used)} of ${money(SCHED_BENEFITS.max)} left`], ["Family balance", money(740), "Due"], ["Forms", "1 to sign", "Consent"]] }))
});

/* ================================================================ 5. Find open slots */
const SLOTS = [["Mon, Sep 28", [["8:00 AM", "Op 1"], ["9:30 AM", "Op 1"], ["10:30 AM", "Op 2"]]], ["Tue, Sep 29", [["7:30 AM", "Op 2"], ["10:00 AM", "Op 1"]]], ["Wed, Sep 30", []], ["Thu, Oct 1", [["8:30 AM", "Op 1"], ["9:00 AM", "Op 2"], ["10:30 AM", "Op 1"], ["11:00 AM", "Op 2"]]], ["Fri, Oct 2", [["7:00 AM", "Op 1"]]]];
const field = (label, control, cls = "") => `<div class="min-w-0 ${cls}"><p class="text-[13px] text-gray-500 mb-1">${label}</p>${control}</div>`;
const sel = (v, muted = false) => `<button type="button" class="${R.selectSm}"><span class="truncate ${muted ? "text-gray-500" : ""}">${v}</span>${I("chevrons-up-down")}</button>`;
/* One section per day, so every line between days runs edge to edge */
const slotResults = (ready, none) => (ready ? `<section class="${R.psec}">${emptyState({ icon: "calendar-search", title: "Ready to search", body: "Search for a patient, then find an available time." })}</section>`
  : none ? `<section class="${R.psec}">${emptyState({ icon: "calendar-x", title: "No available slots found", body: "Broaden the days, provider, operatory, or time window.", action: button("Search any time of day", { v: "white", s: "sm" }) })}</section>`
  : `<div role="list" aria-label="Open slot results by day">${SLOTS.map(([d, ts]) => `<section role="listitem" data-day="${d}" class="${R.psec} !py-3"><div class="flex items-center justify-between gap-3 mb-2"><h3 class="${R.groupTitle}">${d}</h3><span class="${R.caption}">${ts.length ? `${ts.length} open` : "No open slots"}</span></div>
      ${ts.length ? `<div class="flex flex-wrap gap-1.5">${ts.map(([t, op]) => { const on = d === "Tue, Sep 29" && t === "10:00 AM"; return `<button type="button" data-slot aria-pressed="${on}" class="${cx(R.btn, R.xs, on ? "bg-blue-100 border-blue-200 text-blue-800" : R.white, "tabular-nums")}">${t}<span class="${on ? "text-blue-800/70" : "text-gray-400"} font-normal">${op}</span></button>`; }).join("")}</div>` : `<p class="${R.help}">Dr. Patel is at a CE course.</p>`}</section>`).join("")}</div>
      <section class="${R.psec} !py-3">${button("Load more times", { v: "white", s: "xs", icon: "chevrons-down" })}</section>`);
const slotFooter = (ready, none) => (ready || none ? `${button("Cancel", { v: "white", s: "sm", cls: "ms-auto" })}` : `<p class="text-[13px] text-gray-600 min-w-0 truncate" data-slot-sum><span class="font-medium text-gray-800">Tue, Sep 29 · 10:00–11:30 AM</span> · Op 1</p><span class="grow"></span>${button("Confirm placement", { v: "solid", s: "sm" })}`);
/* v2 filters. Ready: label-left hairline rows (Preline's create-event drawer), edge to edge. After a search: the
 * filters fold into one row of condition chips with Edit search, so the times get the room. */
function v2SlotFilters(ready, none) {
  if (!ready) {
    const chips = [["Service", "Crown Prep"], ["Provider", "Dr. Patel"], ["Chairs", "Op 1, Op 2"], ["", "90 min"], ["", "Sep 28–Oct 9"], ["", none ? "Afternoon" : "Morning"]];
    return `<section class="${R.psec} !py-3"${chg("After a search the filters fold into chips with Edit search (the patient moves to the title line), so the open times start near the top instead of 350px down.")}><div class="flex flex-wrap items-center gap-1.5">${chips.map(([f, v]) => condChip(f, f ? "is" : "", esc(v), "", `Remove ${f || v}`, f ? "" : "[&_span:first-child>span:first-child]:hidden")).join("")}${button("Edit search", { v: "white", s: "xs", icon: "sliders-horizontal" })}</div></section>`;
  }
  const row = (label, control, attrs = "") => `<div class="flex items-center gap-3 h-11 px-5 border-b border-gray-200/80"${attrs}><span class="w-24 shrink-0 text-[13px] text-gray-500">${label}</span><div class="min-w-0 grow">${control}</div></div>`;
  return `<section class="[&>div:last-child]:border-b-0">
    ${row("Patient", `<div class="relative"><span class="absolute inset-y-0 start-0 flex items-center ps-2.5 pointer-events-none">${I("search", "size-3.5 text-gray-400")}</span><input class="${R.inputSm} ps-8" placeholder="Search patients" aria-label="Search patients" /></div>`, chg("The filters are one row each, label on the left, split by full-width lines; Patient is a white field like the others."))}
    ${row("Service", sel("Any service", true))}${row("Provider", sel("Any provider", true))}${row("Chairs", sel("Any operatory", true))}${row("Duration", sel("60 min"))}
    ${row("Date range", `<button type="button" class="${R.selectSm}"><span class="inline-flex items-center gap-2">${I("calendar", "!text-gray-500")}Sep 28 – Oct 9</span>${I("chevrons-up-down")}</button>`)}
    ${row("Time of day", `<div class="flex items-center justify-between gap-3">${segmented(["Any time", "Morning", "Afternoon"], 0, { sm: true })}${button("Search", { v: "solid", s: "sm", icon: "search" })}</div>`)}</section>`;
}
/* v4: the search is the same table of fields as every record; Patient searches as you type and Tab moves down */
const V4_PATIENT_NAMES = ["Mason Reed", "Ava Thompson", "Olivia Nguyen", "Liam Carter", "Emma Rodriguez", "Lucas Foster", "Isabella Kim"];
const v4Any = (r) => (/^Any /.test(r.value) ? `<span class="text-gray-500">${esc(r.value)}</span>` : esc(r.value));
function v4SlotFilters() {
  /* Service, Provider and Chairs hold several values (chips; tick as many as fit), like an Attio or Airtable filter.
   * Empty means any, shown as the grey hint. Chairs start on the two chairs this office books crowns in. */
  const rows = [{ label: "Patient", icon: "user-round", value: "", type: "select", options: V4_PATIENT_NAMES, ph: "Search patients" },
    { label: "Service", icon: "stethoscope", value: [], type: "multi", options: ["Crown prep", "Crown seat", "Filling", "Root canal", "Cleaning", "Perio maintenance", "New patient exam"], ph: "Any service" },
    { label: "Provider", icon: "user-round-check", value: [], type: "multi", options: SCHED_PROVIDER_NAMES, ph: "Any provider" },
    { label: "Chairs", icon: "armchair", value: ["Op 1", "Op 2"], type: "multi", options: OPS.map((o) => o.name), ph: "Any chair" },
    { label: "Duration", icon: "timer", value: "60 min", type: "select", options: ["30 min", "45 min", "60 min", "90 min", "120 min"] },
    { label: "Date range", icon: "calendar", value: "Sep 28 – Oct 9", ph: "Pick the days to search" },
    { label: "Time of day", icon: "sun", value: "Any time", type: "select", options: ["Any time", "Morning", "Afternoon"], html: v4Any }];
  return `<section class="${R.psec}"><div${chg4("The search is one table of fields like an Attio or Airtable filter: each line has its icon, Service, Provider and Chairs take several values as chips (tick as many as you like in the list), Patient searches as you type, Tab moves down.")}>${v4SchedFields(rows, { labelW: 124, title: "Search" })}</div>
    <div class="mt-3 flex justify-end">${button("Search", { v: "solid", s: "sm", icon: "search" })}</div></section>`;
}
defineBlock({
  cat: "schedule", id: "schedule-find-slots", title: "Find open slots",
  note: "Search for a time that fits the patient, the service and the chair. Results come back grouped by day as times you can click; the chosen time shows in the footer with Confirm placement.",
  where: "PMS › Scheduling › Find open slots",
  states: ["Ready to search", "Results", "No available slots found"],
  canvas: "bare",
  html: (state) => {
    const ready = state === "Ready to search", none = state === "No available slots found";
    if (V2) return overPage(840, sheetPanel({ flush: true, title: "Find Appointment", subtitle: ready ? "Open times that fit the visit" : `For <span class="text-gray-800">Mason Reed</span> · 35 y · open times that fit the visit`, w: 500, actions: iconButton("minimize-2", "Collapse", { s: "iconSm" }), body: (V4 && ready ? v4SlotFilters() : v2SlotFilters(ready, none)) + slotResults(ready, none), footer: slotFooter(ready, none) }));
    const filters = `<section class="${R.psec}"><div class="grid grid-cols-2 gap-x-3 gap-y-2.5">
      ${field("Patient", ready ? `<div class="relative">${searchBox("Search patients", { w: "w-full" })}</div>` : `<div class="flex items-center gap-2 h-8 ps-1.5 pe-1 rounded-lg border border-gray-200 bg-white shadow-2xs">${avatar("Mason Reed", { size: 5 })}<span class="text-[13px] text-gray-800">Mason Reed</span><span class="${R.caption}">35 y</span>${iconButton("x", "Remove patient", { s: "iconXs", cls: "ms-auto !size-6" })}</div>`, "col-span-2")}
      ${field("Service", sel(ready ? "Any service" : "Crown Prep", ready))}
      ${field("Provider", sel(ready ? "Any provider" : "Dr. Maya Patel", ready))}
      ${field("Chairs", sel(ready ? "Any operatory" : "Op 1, Op 2", ready))}
      ${field("Duration", sel(ready ? "60 min" : "90 min"))}
      ${field("Date range", `<button type="button" class="${R.selectSm}"><span class="inline-flex items-center gap-2">${I("calendar", "!text-gray-500")}Sep 28 – Oct 9</span>${I("chevrons-up-down")}</button>`)}
      <div class="col-span-2 flex items-end justify-between gap-3">${field("Time of day", segmented(["Any time", "Morning", "Afternoon"], none ? 2 : ready ? 0 : 1, { sm: true }))}${button("Search", { v: ready ? "solid" : "white", s: "sm", icon: "search" })}</div></div></section>`;
    const results = slotResults(ready, none), footer = slotFooter(ready, none);
    return overPage(840, sheetPanel({ flush: true, title: "Find Appointment", subtitle: "Open times that fit the visit", w: 500, actions: iconButton("minimize-2", "Collapse", { s: "iconSm" }), body: filters + results, footer }));
  },
  mount: (el) => {
    el.addEventListener("click", (e) => { const b = e.target.closest("[data-slot]"); if (!b) return;
      el.querySelectorAll("[data-slot]").forEach((x) => { const on = x === b; x.setAttribute("aria-pressed", on); x.className = cx(R.btn, R.xs, on ? "bg-blue-100 border-blue-200 text-blue-800" : R.white, "tabular-nums"); x.lastElementChild.className = `${on ? "text-blue-800/70" : "text-gray-400"} font-normal`; });
      const day = b.closest("[data-day]").dataset.day; const t = b.firstChild.textContent; const op = b.lastElementChild.textContent;
      const s = el.querySelector("[data-slot-sum]"); const start = t.replace(/ (AM|PM)/, ""); const [h, m] = start.split(":").map(Number); const st = ((h % 12) + (/PM/.test(t) ? 12 : 0)) * 60 + m;
      if (s) s.innerHTML = `<span class="font-medium text-gray-800">${day} · ${clock(st, (st < 720) !== (st + 90 < 720))}–${clock(st + 90)}</span> · ${op}`; });
  }
});

/* ================================================================ 6. ASAP / Waitlist */
const OFFER = { wait: ["Waiting", "off"], contacted: ["Contacted", "mid"], accepted: ["Accepted", "on"], declined: ["Declined", "quiet"], booked: ["Booked", "on"], withdrawn: ["Withdrawn", "quiet"] };
const WAIT = [
  { pt: "x2", want: "Filling #19 · 60 min", pref: "Dr. Patel · Mornings", st: "wait", when: "Added Sep 18" },
  { pt: "p14", want: "Cleaning · 60 min", pref: "Any provider · Any time", st: "contacted", when: "Texted 10:02 AM" },
  { pt: "p6", want: "Crown prep #3 · 90 min", pref: "Dr. Patel · Afternoons", st: "accepted", when: "Said yes to Sep 28, 3:00 PM" },
  { pt: "p15", want: "Denture reline · 30 min", pref: "Dr. Brooks · Any time", st: "declined", when: "Replied 9:48 AM" },
  { pt: "p8", want: "Crown seat #3 · 30 min", pref: "Dr. Patel", st: "booked", when: "Mon, Sep 28 · 9:00 AM" },
  { pt: "x10", want: "Cleaning · 60 min", pref: "Sofia R.", st: "withdrawn", when: "Sep 21" }
];
/* v2 waitlist: orange where the office acts (Accepted needs a booking), one blue send per offer, two-line rows with
 * "when" on the right, and closed offers folded under one row at the bottom */
const V2_WHEN = { wait: "Added Sep 18", contacted: "10:02 AM", accepted: "Wants Sep 28, 3 PM", declined: "9:48 AM", booked: "Sep 28, 9 AM", withdrawn: "Sep 21" };
function v2Waitlist(empty) {
  const tone = (st) => (st === "accepted" ? "needs" : OFFER[st][1]);
  const live = WAIT.filter((w) => w.st !== "declined" && w.st !== "withdrawn"), closed = WAIT.filter((w) => w.st === "declined" || w.st === "withdrawn");
  const row = (w, i, extra = "") => { const name = ptName(w.pt), open = i === 0, acc = w.st === "accepted";
    const act = open ? "" : acc ? button("Approve and book", { v: "white", s: "xs" }) : w.st === "wait" || w.st === "contacted" ? button("Send offer", { v: "white", s: "xs", icon: "send" }) : iconButton("ellipsis", `More for ${name}`, { s: "iconXs" });
    return `<li class="border-t border-gray-200/80 ${open ? "bg-gray-50/80" : ""}" ${extra}><div class="flex items-center gap-3 px-5 py-2">${avatar(name, { size: 8 })}
      <div class="min-w-0 grow"><p class="flex items-center gap-2 text-sm"${i === 1 ? chg("Rows are two lines (they were three): who and where the offer stands, with when in grey on the right; then what they want.") : ""}><span class="font-medium text-gray-800 truncate">${esc(name)}</span><span${acc ? chg("Accepted is orange: the office still has to approve and book it. Booked stays blue because it's done.") : ""}>${statusDot(OFFER[w.st][0], tone(w.st), "!text-xs !text-gray-600")}</span><span class="ms-auto shrink-0 text-xs text-gray-400 tabular-nums" title="${esc(w.when)}">${V2_WHEN[w.st]}</span></p>
        <p class="truncate text-xs text-gray-500">${w.want} · ${w.pref}</p></div>${act}</div>
      ${open ? `<div class="ps-16 pe-5 pb-3.5"${chg("While an offer is open its row has no Send offer button, so there's one blue Send per offer.")}><p class="text-sm font-medium text-gray-800">Send this opening by text? <span class="font-normal text-gray-500">First reply wins.</span></p>
        <p class="mt-2 rounded-2xl rounded-bl-md bg-white px-3 py-2 text-[13px] leading-5 text-gray-700 shadow-2xs">Hi Nora, a spot opened today at 2:00 PM with Dr. Patel at Bayview Family Dental. Reply YES to take it, or NO to keep your place on the list.</p>
        <div class="mt-2.5 flex items-center justify-between gap-3"><span class="${R.caption} tabular-nums">To (510) 555-0187</span><div class="flex gap-2">${button("Cancel", { v: "white", s: "xs" })}${button("Send text", { v: "solid", s: "xs", icon: "send" })}</div></div></div>` : ""}</li>`; };
  const closedRows = `<li class="border-t border-gray-200/80"${chg("Declined and Withdrawn offers fold under one Closed row at the bottom, so the live ones are together.")}><button type="button" data-closed-toggle aria-expanded="false" class="flex w-full items-center gap-2 h-10 px-5 text-start text-[13px] font-medium text-gray-600 hover:bg-gray-50 cursor-pointer">${I("chevron-right", "size-4 text-gray-400 transition-transform")}Closed <span class="${R.count}">${closed.length}</span></button></li>
    ${closed.map((w) => row(w, -1, "data-closed-row hidden")).join("")}`;
  const body = `${empty ? "" : `<section class="${R.psec} flex items-center gap-3 !py-3">${I("calendar-clock", "size-4 shrink-0 text-gray-500")}<div class="grow min-w-0"><p class="text-sm font-medium text-gray-800">Opening today · 2:00–3:00 PM</p><p class="${R.caption}">Op 1 · Dr. Patel · Sophia Hughes cancelled at 10:14 AM</p></div>${iconButton("calendar-search", "Show on calendar", { v: "white", s: "iconSm" })}</section>`}
    <section class="${R.psec} flex items-center gap-2 !py-2.5">${searchBox("Filter waitlist...", { w: "grow" })}${button("Any provider", { v: "ghost", s: "xs", iconEnd: "chevron-down" })}</section>
    ${empty ? `<section class="${R.psec}">${emptyState({ icon: "list-ordered", title: "No waitlist patients", body: "Patients added to the waitlist will appear here. When a visit cancels, we'll suggest who to offer it to.", action: button("Add to Waitlist", { v: "white", s: "sm", icon: "plus" }) })}</section>` : `<ul class="border-b border-gray-200/80">${live.map((w, i) => row(w, i)).join("")}${closedRows}</ul>`}`;
  return overPage(800, sheetPanel({ flush: true, title: "ASAP / Waitlist", tabs: [[`<span${chg("The first tab is Waiting; it repeated the panel title, ASAP / Waitlist.")}>Waiting</span>`, empty ? 0 : WAIT.length], ["Cancelled", 2], ["Pinned", 3]], actions: iconButton("user-plus", "Add to Waitlist", { s: "iconSm" }), body }));
}
/* v4 waitlist: the list is the Asha data grid (section preset, row lines only): patient, what they want, their
 * preference, where the offer stands, the last contact and one row action. Sending an offer opens the send dialog
 * instead of a message opened inside the list. The library had no general send dialog (forms-send is for forms), so
 * v4WlSend is a small local one modelled on the app's UnifiedSendModal (apps/web/src/components/Specific/
 * UnifiedSendModal): who it goes to, Text or Email, the address, the message with its length, Cancel and Send. */
const V4_WL = [
  { id: "w1", pt: "x2", want: "Filling #19 · 60 min", pref: "Dr. Patel · Mornings", st: "wait", last: "Not yet", tip: "Added Sep 18; not offered a time yet" },
  { id: "w2", pt: "p14", want: "Cleaning · 60 min", pref: "Anyone · Any time", st: "contacted", last: "10:02 AM", tip: "Texted the 2:00 PM opening at 10:02 AM" },
  { id: "w3", pt: "p6", want: "Crown prep #3 · 90 min", pref: "Dr. Patel · Afternoons", st: "accepted", last: "10:20 AM", tip: "Said yes to Sep 28, 3:00 PM at 10:20 AM" },
  { id: "w4", pt: "p15", want: "Denture reline · 30 min", pref: "Dr. Brooks · Any time", st: "declined", last: "9:48 AM", tip: "Replied no at 9:48 AM" },
  { id: "w5", pt: "p8", want: "Crown seat #3 · 30 min", pref: "Dr. Patel · Any time", st: "booked", last: "Sep 24", tip: "Booked Mon, Sep 28 at 9:00 AM" },
  { id: "w6", pt: "x10", want: "Cleaning · 60 min", pref: "Sofia R. · Any time", st: "withdrawn", last: "Sep 21", tip: "Asked to come off the list on Sep 21" }];
const V4_WL_PHONE = { x2: "(510) 555-0187", x10: "(415) 555-0149" };
const v4WlWho = (pt) => { const name = ptName(pt), [first, ...rest] = name.split(" ");
  return { name, first, phone: V4_WL_PHONE[pt] || DATA.patient(pt).phone, email: `${first}.${rest.join("")}@example.com`.toLowerCase().replace(/[^a-z.@]/g, "") }; };
function v4WlSend(pt, method = "Text") {
  const c = v4WlWho(pt), text = method === "Text";
  const msg = text ? `Hi ${c.first}, a spot opened today at 2:00 PM with Dr. Patel at Bayview Family Dental. Reply YES to take it, or NO to keep your place on the list.`
    : `Hi ${c.first}, a spot opened today at 2:00 PM with Dr. Patel. Reply to this email or call (415) 555-0100 to take it; the first reply gets it.`;
  const rows = [{ label: "To", value: c.name, type: "none", html: () => `<span class="inline-flex items-center gap-2 min-w-0">${avatar(c.name, { size: 5 })}<span class="truncate">${esc(c.name)}</span></span>` },
    { label: "Send by", value: method, type: "select", options: ["Text", "Email"], html: (r) => `<span class="inline-flex items-center gap-2">${I(r.value === "Email" ? "mail" : "message-square", "size-4 shrink-0 text-gray-400")}${esc(r.value)}</span>` },
    ...(text ? [{ label: "Phone", value: c.phone, html: (r) => `<span class="tabular-nums">${esc(r.value)}</span> <span class="text-gray-500">· Mobile · texts allowed</span>` }]
      : [{ label: "Email", value: c.email }, { label: "Subject", value: "An earlier visit opened up today" }])];
  const pick = (r, k, v, g) => { if (r.label !== "Send by" || v === method) return; setTimeout(() => { const d = g.root.closest("[data-wl-dialog]"); if (d) { d.innerHTML = v4WlSend(pt, v); icons(); } }); };
  return `<div class="${R.dialog} !w-[456px]" role="dialog" aria-label="Offer the opening">
    <div class="flex items-start justify-between gap-3 px-5 pt-3.5 pb-3 border-b border-gray-200/80"><div class="min-w-0"><h3 class="text-base font-semibold text-gray-800">Offer the opening</h3><p class="text-[13px] text-gray-500 truncate">Today · 2:00–3:00 PM · Op 1 · Dr. Patel · first reply wins</p></div>${iconButton("x", "Close", { s: "iconSm", attrs: "data-wl-close" })}</div>
    <div class="p-5 space-y-4">${fieldTable(rows, { labelW: 96, title: "Send", onCommit: pick })}
      <div class="space-y-1.5"><label class="${R.label}" for="wl-msg">Message</label><textarea id="wl-msg" class="${R.textarea} !min-h-24">${esc(msg)}</textarea>
        <div class="flex items-center justify-between">${button("Insert field", { v: "quiet", s: "xs", icon: "braces", cls: "-ms-2", attrs: 'aria-haspopup="menu"' })}<span class="text-xs tabular-nums text-gray-400">${text ? `${msg.length} / 160 · 1 text` : "English"}</span></div></div></div>
    <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200/80">${button("Cancel", { v: "white", s: "sm", attrs: "data-wl-close" })}${button(text ? "Send text" : "Send email", { v: "solid", s: "sm", icon: "send", attrs: "data-wl-close" })}</div></div>`;
}
const v4WlAction = (w) => { const name = ptName(w.pt);
  return w.st === "wait" || w.st === "contacted" ? iconButton("send", `Send ${name} the opening`, { s: "iconXs", attrs: `data-wl-send="${w.pt}" data-tip="Send the opening"` })
    : w.st === "accepted" ? iconButton("calendar-check", `Book ${name} on Sep 28, 3:00 PM`, { s: "iconXs", attrs: 'data-tip="Book Sep 28, 3:00 PM"' })
    : iconButton("ellipsis", `More for ${name}`, { s: "iconXs" }); };
function v4Waitlist(empty) {
  const tone = (st) => (st === "accepted" ? "needs" : OFFER[st][1]);
  /* most important first: who, what they want, how long it takes and where the offer stands, the four things you need to
   * fill an opening; their provider and time preference, the last contact and the number open on hover (progressive
   * disclosure), the same way the claim panel shows a line's rare boxes */
  const part = (w, k, i) => w[k].split(" · ")[i] || "Any time";
  const grid = sheetTable({ sheet: false, title: "Waitlist", rows: V4_WL,
    peek: (w) => peekCard(esc(ptName(w.pt)), [["Wants", esc(part(w, "want", 0))], ["Length", esc(part(w, "want", 1))], ["Provider", esc(part(w, "pref", 0))], ["Time of day", esc(part(w, "pref", 1))], ["Last contact", esc(w.tip)], ["Phone", `<span class="tabular-nums">${esc(v4WlWho(w.pt).phone)}</span>`]], "Click the row's button to send the opening or book it."),
    columns: [{ key: "pt", label: "Patient", w: 176, lead: (w) => avatar(ptName(w.pt), { size: 5 }), render: (w) => `<span class="font-medium text-gray-800">${esc(ptName(w.pt))}</span>` },
      { key: "want", label: "Wants", w: 150, grow: true, render: (w) => esc(part(w, "want", 0)) },
      { key: "len", label: "Length", w: 76, render: (w) => `<span class="text-gray-600 tabular-nums">${esc(part(w, "want", 1))}</span>` },
      { key: "st", label: "Status", w: 116, render: (w) => statusDot(OFFER[w.st][0], tone(w.st), "!text-[13px]") },
      { key: "act", label: "", w: 40, render: (w) => `<span class="flex justify-end">${v4WlAction(w)}</span>` }] });
  const body = `${empty ? "" : `<section class="${R.psec} flex items-center gap-3 !py-3">${I("calendar-clock", "size-4 shrink-0 text-gray-500")}<div class="grow min-w-0"><p class="text-sm font-medium text-gray-800">Opening today · 2:00–3:00 PM</p><p class="${R.caption}">Op 1 · Dr. Patel · Sophia Hughes cancelled at 10:14 AM</p></div>${iconButton("calendar-search", "Show on calendar", { v: "white", s: "iconSm" })}</section>`}
    <section class="${R.psec} flex items-center gap-2 !py-2.5">${searchBox("Filter waitlist...", { w: "grow" })}${button("Any provider", { v: "ghost", s: "xs", iconEnd: "chevron-down" })}</section>
    ${empty ? `<section class="${R.psec}">${emptyState({ icon: "list-ordered", title: "No waitlist patients", body: "Patients added to the waitlist will appear here. When a visit cancels, we'll suggest who to offer it to.", action: button("Add to Waitlist", { v: "white", s: "sm", icon: "plus" }) })}</section>`
      : `<section class="${R.psec}"><div${chg4("The waitlist is the Asha data grid with row lines only and one action per row; nothing opens inside the list.")}><div${chg4("Each row shows only what filling an opening needs: who, what they want, how long it takes and where the offer stands, on the compact panel grid. Their provider and time preference, the last contact and the phone number open on hover in a card beside the panel, instead of two values strung into each cell.")}>${grid}</div></div></section>`}`;
  const panel = sheetPanel({ flush: true, title: "ASAP / Waitlist", w: 640, tabs: [["Waiting", empty ? 0 : WAIT.length], ["Cancelled", 2], ["Pinned", 3]], actions: iconButton("user-plus", "Add to Waitlist", { s: "iconSm" }), body });
  const dialog = `<div class="absolute inset-0 z-30" data-wl-overlay${empty ? " hidden" : ""}><div class="absolute inset-0 bg-gray-900/25" data-wl-close></div>
    <div class="absolute left-1/2 top-16 -translate-x-1/2" data-wl-dialog${chg4("Send the opening opens the send dialog, the same one Asha uses to text or email a patient: who it goes to, Text or Email, the number, and the message you can still edit. It used to open as a message inside the list.")}>${v4WlSend("x2")}</div></div>`;
  return `<div class="relative overflow-hidden" style="height:800px">${faded(pageSlice())}<div class="absolute inset-y-0 end-0 flex">${panel}</div>${dialog}</div>`;
}
defineBlock({
  cat: "schedule", id: "schedule-waitlist", title: "ASAP / Waitlist panel",
  note: "Patients who want an earlier visit, with where each offer stands. An opening came up at 2:00 PM, so one row asks \"Send this opening by text?\" with the exact message before it goes. Accepted offers get a one-click book.",
  where: "PMS › Scheduling › ASAP / Waitlist",
  states: ["Offer ready", "Empty"],
  canvas: "bare",
  mount: (el) => { if (!V2) return;
    if (V4) el.addEventListener("click", (e) => { const ov = el.querySelector("[data-wl-overlay]"); if (!ov) return;
      if (e.target.closest("[data-wl-close]")) { ov.hidden = true; return; }
      const s = e.target.closest("[data-wl-send]"); if (s) { ov.querySelector("[data-wl-dialog]").innerHTML = v4WlSend(s.dataset.wlSend); ov.hidden = false; icons(); } });
    el.addEventListener("click", (e) => { const t = e.target.closest("[data-closed-toggle]"); if (!t) return; const open = t.getAttribute("aria-expanded") !== "true";
      t.setAttribute("aria-expanded", open); t.querySelector("svg")?.classList.toggle("rotate-90", open); el.querySelectorAll("[data-closed-row]").forEach((r) => (r.hidden = !open)); }); },
  html: (state) => {
    const empty = state === "Empty";
    if (V4) return v4Waitlist(empty);
    if (V2) return v2Waitlist(empty);
    const row = (w, i) => { const name = ptName(w.pt), [l, t] = OFFER[w.st], open = i === 0 && !empty;
      const act = w.st === "accepted" ? button("Approve and book", { v: "white", s: "xs" }) : w.st === "wait" || w.st === "contacted" ? button("Send offer", { v: open ? "soft" : "white", s: "xs", icon: "send" }) : iconButton("ellipsis", `More for ${name}`, { s: "iconXs" });
      /* The offer opens flat under its row (no box inside the panel); the row and its offer share one grey fill */
      return `<li class="border-t border-gray-200/80 ${open ? "bg-gray-50/80" : ""}"><div class="flex items-center gap-3 px-5 py-2.5">${avatar(name, { size: 8 })}
        <div class="min-w-0 grow"><p class="flex items-center gap-2 text-sm"><span class="font-medium text-gray-800 truncate">${esc(name)}</span>${statusDot(l, t, "!text-xs !text-gray-600")}</p><p class="${R.caption} truncate">${w.want} · ${w.pref}</p><p class="text-xs text-gray-400">${w.when}</p></div>${act}</div>
        ${open ? `<div class="ps-16 pe-5 pb-3.5"><p class="text-sm font-medium text-gray-800">Send this opening by text? <span class="font-normal text-gray-500">First reply wins.</span></p>
          <p class="mt-2 rounded-2xl rounded-bl-md bg-white px-3 py-2 text-[13px] leading-5 text-gray-700 shadow-2xs">Hi Nora, a spot opened today at 2:00 PM with Dr. Patel at Bayview Family Dental. Reply YES to take it, or NO to keep your place on the list.</p>
          <div class="mt-2.5 flex items-center justify-between gap-3"><span class="${R.caption} tabular-nums">To (510) 555-0187</span><div class="flex gap-2">${button("Cancel", { v: "white", s: "xs" })}${button("Send text", { v: "solid", s: "xs", icon: "send" })}</div></div></div>` : ""}</li>`; };
    const body = `${empty ? "" : `<section class="${R.psec} flex items-center gap-3 !py-3">${I("calendar-clock", "size-4 shrink-0 text-gray-500")}<div class="grow min-w-0"><p class="text-sm font-medium text-gray-800">Opening today · 2:00–3:00 PM</p><p class="${R.caption}">Op 1 · Dr. Patel · Sophia Hughes cancelled at 10:14 AM</p></div>${iconButton("calendar-search", "Show on calendar", { v: "white", s: "iconSm" })}</section>`}
      <section class="${R.psec} flex items-center gap-2 !py-2.5">${searchBox("Filter waitlist...", { w: "grow" })}${button("Any provider", { v: "ghost", s: "xs", iconEnd: "chevron-down" })}</section>
      ${empty ? `<section class="${R.psec}">${emptyState({ icon: "list-ordered", title: "No waitlist patients", body: "Patients added to the waitlist will appear here. When a visit cancels, we'll suggest who to offer it to.", action: button("Add to Waitlist", { v: "white", s: "sm", icon: "plus" }) })}</section>` : `<ul class="border-b border-gray-200/80">${WAIT.map(row).join("")}</ul>`}`;
    return overPage(800, sheetPanel({ flush: true, title: "ASAP / Waitlist", tabs: [["ASAP / Waitlist", empty ? 0 : 6], ["Cancelled", 2], ["Pinned", 3]], actions: iconButton("user-plus", "Add to Waitlist", { s: "iconSm" }), body }));
  }
});

/* ================================================================ 7. New appointment dialog */
/* v4 (the v3 pick): booking is the same table of fields the appointment shows afterwards. Patient searches as you type,
 * Start lists open times, Tab moves down; the double booking is an orange mark on Provider, with the reason on hover. */
const V4_CONFLICT = "Sofia Ramirez is already booked 9:30–10:00 AM in Hyg 1 with Lily Chen. You can still schedule; both visits will show side by side.";
function v4NewAppt(quick) {
  const prov = (n) => DATA.providers.find((p) => p.name === n);
  const who = quick ? [{ label: "First name", value: "Camila" }, { label: "Last name", value: "Reyes" }, { label: "Phone", value: "(415) 555-0163", html: (r) => `<span class="tabular-nums">${esc(r.value)}</span>` }, { label: "Date of birth", value: "", ph: "MM/DD/YYYY" }]
    : [{ label: "Patient", value: "Ava Thompson", type: "select", options: V4_PATIENT_NAMES.slice(1), ph: "Search patients",
      html: (r) => `<span class="inline-flex items-center gap-2 min-w-0">${avatar(r.value, { size: 5 })}${esc(r.value)}${r.value === "Ava Thompson" ? `<span class="text-gray-500 truncate">38 y · Delta Dental</span>` : ""}</span>` }];
  const rows = [...who,
    { label: "Procedures", value: quick ? "New patient exam, Adult cleaning, Full mouth x-rays" : "Adult cleaning, Periodic exam, Bitewings", ph: "Search procedures" },
    { label: "Office fee", value: quick ? "$350.00" : "$253.00", type: "none", html: (r) => `<span class="tabular-nums">${r.value} <span class="text-gray-500">· ${quick ? "D0150 · D1110 · D0210" : "D1110 · D0120 · D0274"}</span></span>` },
    { label: "Date", value: "Mon, Sep 28" },
    { label: "Start", value: "9:00 AM", type: "select", options: ["8:00 AM", "9:00 AM", "10:30 AM", "1:30 PM", "3:00 PM"] },
    { label: "Length", value: quick ? "90 min" : "60 min", type: "select", options: ["30 min", "45 min", "60 min", "90 min"] },
    { label: "Provider", value: "Sofia Ramirez, RDH", type: "select", options: SCHED_PROVIDER_NAMES,
      html: (r) => `<span class="inline-flex items-center gap-2 min-w-0">${prov(r.value) ? provAvatar(prov(r.value)) : ""}${esc(r.value)}${!quick && r.value === "Sofia Ramirez, RDH" ? `<span data-tip="${esc(V4_CONFLICT)}" class="inline-flex items-center gap-1 text-gray-500">${I("circle-alert", "size-3.5 shrink-0 text-orange-500")}Double booked</span>` : ""}</span>` },
    { label: "Chair", value: "Hyg 1", type: "select", options: OPS.map((o) => o.name) },
    { label: "Note", value: "", ph: "Anything the chair should know" }];
  return `<div class="relative overflow-hidden" style="height:${quick ? 660 : 600}px">${faded(pageSlice())}<div class="absolute inset-0 bg-gray-900/25"></div>
    <div class="absolute left-1/2 top-10 -translate-x-1/2 ${R.dialog}" role="dialog" aria-label="New appointment">
      <div class="flex items-center justify-between h-13 px-5 border-b border-gray-200/80"><div><h3 class="text-base font-semibold text-gray-800">New appointment</h3></div>${iconButton("x", "Close", { s: "iconSm" })}</div>
      <div class="p-5 space-y-2.5">
        ${quick ? `<div class="flex items-center justify-between"><span class="${R.label}">New patient</span>${button("Back to search", { v: "link", s: "xs", icon: "arrow-left" })}</div>` : ""}
        <div${chg4("Booking uses the same table of fields the appointment shows afterwards, instead of boxes under labels: Patient searches as you type, Start lists open times, Tab moves down. Double booked is an orange mark on Provider with the reason on hover.")}>${v4SchedFields(rows, { labelW: 112, title: "New appointment" })}</div>
        ${quick ? `<p class="${R.help}">We'll make the chart when you schedule. Insurance and forms can come later.</p>` : ""}</div>
      <div class="flex items-center gap-2 px-5 py-3 border-t border-gray-200/80"${quick ? chg4("The footer is just Cancel and Schedule: the reminder line is gone, since reminders go out on their own.") : ""}><span class="grow min-w-0">${quick ? "" : `<span class="inline-flex items-center gap-1.5 ${R.help}"${chg4("“Not in Asha yet? New patient” sits at the footer's left, where the reminder line was, so the table of fields ends the body. The reminder line is gone: reminders go out on their own.")}>Not in Asha yet?${button("New patient", { v: "link", s: "xs", icon: "user-plus" })}</span>`}</span>${button("Cancel", { v: "white", s: "sm" })}${button("Schedule", { v: "solid", s: "sm" })}</div></div></div>`;
}
defineBlock({
  cat: "schedule", id: "schedule-new-appt", title: "New appointment dialog",
  note: "Booking a visit: patient (or a quick-add for someone new), services, date and time, length, provider and chair. A clash is a small orange mark by the chair; its explanation and Review scheduling conflicts open on hover, not a wall.",
  where: "PMS › Scheduling › click an open time",
  states: ["Existing patient", "Quick-add new patient"],
  canvas: "bare",
  html: (state) => {
    const quick = state !== "Existing patient";
    if (V4) return v4NewAppt(quick);
    const lbl = (t, id) => `<label class="${R.label} block mb-1.5" ${id ? `for="${id}"` : ""}>${t}</label>`;
    const patient = quick ? `<div class="space-y-3"><div class="flex items-center justify-between">${V2 ? `<span${chg("“New patient” and “Date of birth” are in sentence case, like every other label here.")}>${lbl("New patient")}</span>` : lbl("New Patient")}${button("Back to search", { v: "link", s: "xs", icon: "arrow-left" })}</div>
        <div class="grid grid-cols-2 gap-3"><div>${lbl("First name", "qa1")}<input id="qa1" class="${R.input}" value="Camila" /></div><div>${lbl("Last name", "qa2")}<input id="qa2" class="${R.input}" value="Reyes" /></div>
        <div>${lbl("Phone", "qa3")}<input id="qa3" class="${R.input} tabular-nums" value="(415) 555-0163" /></div><div>${lbl(V2 ? "Date of birth" : "Date of Birth", "qa4")}<input id="qa4" class="${R.input} tabular-nums" placeholder="MM/DD/YYYY" /></div></div>
        <p class="${R.help}">We'll make the chart when you schedule. Insurance and forms can come later.</p></div>`
      : `<div>${lbl("Patient or contact")}<div class="flex items-center gap-2.5 h-9 ps-2 pe-1 rounded-lg border border-gray-200 bg-white shadow-2xs">${avatar("Ava Thompson", { size: 6 })}<span class="text-sm font-medium text-gray-800">Ava Thompson</span><span class="${R.caption} tabular-nums">38 y · (415) 555-0132 · Delta Dental</span>${iconButton("x", "Clear patient", { s: "iconXs", cls: "ms-auto" })}</div>
        <p class="mt-1.5 flex items-center gap-1.5 ${R.help}">Not in Asha yet?${button(V2 ? "New patient" : "New Patient", { v: "link", s: "xs", icon: "user-plus" })}</p></div>`;
    return `<div class="relative ${V2 && quick ? "h-[840px]" : "h-[790px]"} overflow-hidden">${faded(pageSlice())}<div class="absolute inset-0 bg-gray-900/25"></div>
      <div class="absolute left-1/2 top-10 -translate-x-1/2 ${R.dialog} ${V2 ? "" : "!w-[580px]"}" role="dialog" aria-label="New appointment">
        <div class="flex items-center justify-between h-13 px-5 border-b border-gray-200/80"><div><h3 class="text-base font-semibold text-gray-800">New appointment</h3></div>${iconButton("x", "Close", { s: "iconSm" })}</div>
        <div class="p-5 space-y-4">${patient}
          <div>${lbl("Services")}<div class="flex flex-wrap items-center gap-1.5 min-h-9 px-1.5 py-1 rounded-lg border border-gray-200 bg-white shadow-2xs">${["Prophy / Cleaning", "Periodic exam", "Bitewings"].slice(0, quick ? 1 : 3).map((s) => `<span class="${cx(R.tag, R.tagGray)} !pe-1">${s}<button type="button" class="inline-flex size-4 items-center justify-center rounded text-gray-500 hover:bg-gray-200" aria-label="Remove ${s}">${I("x", "size-3")}</button></span>`).join("")}${quick ? `<span class="${cx(R.tag, R.tagGray)} !pe-1">New Patient Exam<button type="button" class="inline-flex size-4 items-center justify-center rounded text-gray-500 hover:bg-gray-200" aria-label="Remove New Patient Exam">${I("x", "size-3")}</button></span>` : ""}<input class="grow min-w-24 h-7 px-1 text-sm outline-hidden placeholder:text-gray-400" placeholder="Search services..." aria-label="Search services" /></div>
            <p class="mt-1.5 ${R.caption} tabular-nums">${quick ? "D0150 · D1110 · D0210" : "D1110 · D0120 · D0274"} · Office fee ${quick ? "$350.00" : "$253.00"}</p></div>
          <div class="grid grid-cols-3 gap-3"><div>${lbl("Date")}<button type="button" class="${R.select}"><span class="inline-flex items-center gap-2">${I("calendar", "!text-gray-500")}Mon, Sep 28</span></button></div><div>${lbl("Start time")}<button type="button" class="${R.select}"><span class="tabular-nums">9:00 AM</span>${I("chevrons-up-down")}</button></div><div>${lbl("Duration")}<button type="button" class="${R.select}">${quick ? "90 min" : "60 min"}${I("chevrons-up-down")}</button></div></div>
          <div class="grid ${V2 ? "grid-cols-3" : "grid-cols-2"} gap-3"${chg("Provider spans two columns and Operatory one, so this row's edges line up with Date, Start time and Duration above.")}><div${V2 ? ' class="col-span-2"' : ""}>${V2 && !quick ? `<div class="flex items-center justify-between gap-2 h-5 mb-1.5"><label class="${R.label}">Provider</label><span${chg("The double-booking mark sits by Provider, since it's Sofia who is booked twice; it no longer pushes past the Operatory field.")}>${alertMark("Double booked", "Sofia Ramirez is already booked 9:30–10:00 AM in Hyg 1 with Lily Chen. You can still schedule; both visits will show side by side.", { action: button("Review scheduling conflicts", { v: "white", s: "xs" }) })}</span></div>` : lbl("Provider")}<button type="button" class="${R.select}"><span class="inline-flex items-center gap-2">${provAvatar(OPS[2].prov)}Sofia Ramirez, RDH</span>${I("chevrons-up-down")}</button></div><div><div class="flex items-center justify-between gap-2 h-5 mb-1.5"><label class="${R.label}">Operatory</label>${quick || V2 ? "" : alertMark("Double booked", "Sofia Ramirez is already booked 9:30–10:00 AM in Hyg 1 with Lily Chen. You can still schedule; both visits will show side by side.", { action: button("Review scheduling conflicts", { v: "white", s: "xs" }) })}</div><button type="button" class="${R.select}">Hyg 1${I("chevrons-up-down")}</button></div></div>
          <div>${lbl("Notes", "na1")}<textarea id="na1" class="${R.textarea} !min-h-16" placeholder="Add any notes about this appointment..."></textarea></div></div>
        <div class="flex items-center gap-2 px-5 py-3 border-t border-gray-200/80"><span class="${R.caption} grow">A reminder text goes out 2 days before.</span>${button("Cancel", { v: "white", s: "sm" })}${button("Schedule", { v: "solid", s: "sm" })}</div></div></div>`;
  }
});

/* ================================================================ 8. Check-in steps */
const CI_STEPS = [["Demographics", "done"], ["Insurance", "done"], ["Forms", "problem"], ["Copay", "next"], ["Payment", "next"], ["Recall", "next"], ["Handoff", "next"]];
/* v2 uses the kit's one step bar (also on the perio chart); v1 keeps this one */
const ciSteps = (cur) => (V2 ? `<div${chg("Check-in uses the same step bar as the perio chart and checkout: blue check for done, orange mark for a problem, the open step on a grey pill.")}>${stepBar(CI_STEPS, cur, { cls: "px-4 py-2 border-b border-gray-200/80 !gap-0.5 [&>button]:!px-1.5 [&>button]:!gap-1.5 [&>button]:!text-[13px] [&>span]:!w-2" })}</div>` : ciStepBar(cur));
function ciStepBar(cur) {
  return `<nav class="flex items-center gap-0.5 px-4 py-2.5 border-b border-gray-200/80 overflow-x-auto" aria-label="Check-in steps" data-steps>${CI_STEPS.map(([l, s], i) => {
    const on = i === cur;
    const mark = s === "done" ? `<span class="flex size-5 items-center justify-center rounded-full bg-blue-600 text-white">${I("check", "size-3")}</span>` : s === "problem" ? `<span class="flex size-5 items-center justify-center rounded-full bg-orange-100 text-orange-600">${I("circle-alert", "size-3.5")}</span>` : `<span class="flex size-5 items-center justify-center rounded-full ${on ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"} text-[11px] font-semibold tabular-nums">${i + 1}</span>`;
    return `${i ? `<span class="w-2 shrink-0 border-t border-gray-200/80"></span>` : ""}<button type="button" data-step="${i}" aria-current="${on ? "step" : "false"}" class="inline-flex shrink-0 items-center gap-1.5 h-8 ps-1.5 pe-2.5 rounded-lg text-[13px] font-medium cursor-pointer ${on ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"}">${mark}${l}</button>`; }).join("")}</nav>`;
}
/* Each step's body is flat psec() sections, so every line runs across the whole panel */
function stepBody(i) {
  if (V4 && v4StepBody[i]) return v4StepBody[i]();
  const optionBox = (name, rows) => `<div class="${R.tableBox} divide-y divide-gray-200/80">${rows.map(([l, d, on, v]) => `<label class="flex items-center gap-3 h-11 px-3 cursor-pointer"><input type="radio" name="${name}" class="${R.radio}" ${on ? "checked" : ""} /><span class="text-sm text-gray-800">${l}</span>${d ? `<span class="${R.caption}">${d}</span>` : ""}${v !== undefined ? `<span class="ms-auto text-sm tabular-nums ${v == null ? "text-gray-400" : "text-gray-800"}">${v == null ? "Enter amount" : money(v)}</span>` : ""}</label>`).join("")}</div>`;
  const send = `${button("Text link", { v: "white", s: "xs" })}${button("Send to tablet", { v: "white", s: "xs" })}`;
  const B = [
    () => psec("Demographics", `${metaGrid([[V2 ? `<span${chg("Labels are in sentence case (Date of birth, Cell phone), matching the rest of Asha.")}>Date of birth</span>` : "Date of Birth", "Jan 30, 1969 · 57 y"], [V2 ? "Cell phone" : "Cell Phone", '<span class="tabular-nums">(650) 555-0101</span>'], ["Email", "o.nguyen@example.com"], ["Address", "418 Alma St, Palo Alto, CA 94301"], [V2 ? "Preferred language" : "Preferred Language", "English"], ["Preferred Contact", "Text message"]], 2)}<p class="mt-4 ${R.help}">Confirmed with the patient at 10:36 AM.</p>`, { actions: button("Edit", { v: "white", s: "xs", icon: "pencil" }) }),
    () => psec("Insurance", `<button type="button" class="group -mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-1.5 text-start hover:bg-gray-50 cursor-pointer" aria-label="View benefits">
        <div class="min-w-0 grow"><p class="text-sm text-gray-800">Aetna Dental PPO <span class="text-gray-500">· Primary</span></p><p class="${R.help}">${money(1180)} of ${money(1500)} left this year · deductible met · checked Sep 24, 8:12 AM</p></div>
        ${statusDot("Verified", "on")}${I("chevron-right", "size-4 shrink-0 text-gray-400 group-hover:text-gray-600")}</button>
      <div class="mt-3">${metaGrid([["Member ID", '<span class="tabular-nums">W2841 7730</span>'], ["Group", '<span class="tabular-nums">0848812</span>'], ["Subscriber", "Self"]])}</div>`, { actions: button("Re-verify", { v: "white", s: "xs", icon: "refresh-cw" }) }),
    () => psec("Forms", bleed(formsTable([["HIPAA", "done", "Sep 23"], ["Financial policy", "done", "Sep 23"], ["Medical history", "upd", "Mar 3, 2025", send], ["Periodontal consent", "needs", "Not sent yet", send]], { actions: true })), { count: 4, cls: "!pb-0" }),
    () => { const fee = 520, ins = 416; return `${psec("Today's visit", bleed(`<table class="w-full border-separate border-spacing-0 text-sm"><thead><tr>${["Code", "Area", "Description", "Fee", "Ins. est.", "Pt est."].map((h, j) => `<th class="${R.tHead} ${j >= 3 ? "!text-end" : ""} ${j === 0 ? "!ps-5" : ""} ${j === 5 ? "!pe-5" : ""}">${h}</th>`).join("")}</tr></thead>
        <tbody>${O_LINES.map((l) => `<tr><td class="${R.tCell} ps-5 tabular-nums">${l[0]}</td><td class="${R.tCell}">${l[1]}</td><td class="${R.tCell}">Deep cleaning, 4+ teeth</td><td class="${R.tCell} text-end tabular-nums">${money(l[3])}</td><td class="${R.tCell} text-end tabular-nums">${money(l[4])}</td><td class="${R.tCell} pe-5 text-end tabular-nums">${money(l[3] - l[4])}</td></tr>`).join("")}</tbody>
        <tfoot><tr><td colspan="3" class="h-9 ps-5 text-sm font-medium text-gray-800">Total</td><td class="h-9 px-3 text-end text-sm font-semibold tabular-nums">${money(fee)}</td><td class="h-9 px-3 text-end text-sm font-semibold tabular-nums">${money(ins)}</td><td class="h-9 pe-5 ps-3 text-end text-sm font-semibold tabular-nums">${money(fee - ins)}</td></tr></tfoot></table>`), { cls: "!pb-1" })}
      ${psec("Collect today", `${optionBox("copay", [["Today's patient estimate", "", true, 104], ["Today's estimate plus balance", "", false, 844], ["Other amount", "", false, null]])}
        <p class="mt-2 ${R.help}">Prior balance is $740.00 from Aug 14. Estimates can change once Aetna pays.</p>`)}`; },
    () => psec("Payment", `${optionBox("pm", [["Card terminal", "Front desk reader · ready", true], ["Saved card", "Visa ending 4417", false], ["Cash", "", false], ["Check", "", false]])}<div class="mt-3 flex items-center justify-between"><span class="text-sm text-gray-600">Amount <span class="font-semibold text-gray-800 tabular-nums">$104.00</span></span>${button("Send to terminal", { v: "white", s: "sm", icon: "credit-card" })}</div>`),
    () => psec("Recall", metaGrid([["Recall type", "Perio maintenance · every 3 months"], ["Next due", "Dec 28, 2026"], ["Booked", '<span class="text-gray-400">Not booked yet</span>']]), { actions: button("Find a time in December", { v: "white", s: "xs", icon: "calendar-search" }) }),
    () => psec("Check-in summary", metaGrid([["Arrived", "10:36 AM · 24 min early"], ["Copay", '<span class="tabular-nums">$104.00</span> collected · Card terminal'], ["Forms", flag("Periodontal consent not signed yet", "!text-gray-800")], ["Recall", '<span class="text-gray-500">Due Dec 28 · not booked</span>']], 2))
      + psec("Handoff to Hyg 2", `<div class="space-y-3"><label class="flex items-start gap-2.5 text-sm text-gray-800">${checkbox(true, "Took premedication")}<span>Took premedication at 9:55 AM <span class="block ${R.help}">Amoxicillin 2 g, as her cardiologist asked.</span></span></label>
        <label class="flex items-start gap-2.5 text-sm text-gray-800">${checkbox(false, "Medical history reviewed")}<span>Medical history reviewed <span class="block ${R.help}">Last updated Mar 3, 2025.</span></span></label>
        <div><label class="${R.label} block mb-1.5" for="ho1">Note for Jordan</label><textarea id="ho1" class="${R.textarea} !min-h-16">Latex-free gloves. Wants numbing for the lower right.</textarea></div></div>`)
  ];
  return B[i]();
}
/* v4: the facts each step checks are tables you type into (no Edit button), and today's visit lines take fee and
 * estimate changes like a spreadsheet; the forms list, payment choices and handoff stay as they are. */
const v4CiOption = (name, rows) => `<div class="${R.tableBox} divide-y divide-gray-200/80">${rows.map(([l, on, v]) => `<label class="flex items-center gap-3 h-11 px-3 cursor-pointer"><input type="radio" name="${name}" class="${R.radio}" ${on ? "checked" : ""} /><span class="text-sm text-gray-800">${l}</span><span class="ms-auto text-sm tabular-nums ${v == null ? "text-gray-400" : "text-gray-800"}"${v != null ? ` data-ci-amt="${esc(l)}"` : ""}>${v == null ? "Enter amount" : money(v)}</span></label>`).join("")}</div>`;
const v4CiLines = () => {
  const rows = O_LINES.map(([code, area, , fee, ins], i) => ({ id: `c${i}`, code, area, desc: "Deep cleaning, 4+ teeth", fee, ins }));
  const sum = (rs, f) => rs.reduce((a, r) => a + f(r), 0);
  const foot = (rs) => ["Total", "", "", money(sum(rs, (r) => r.fee)), money(sum(rs, (r) => r.ins)), money(sum(rs, (r) => r.fee - r.ins))];
  return sheetTable({ title: "Today's visit", rows, foot: foot(rows),
    onCommit: (r, k, v, g) => { g.o.foot = foot(g.data); const pt = sum(g.data, (x) => x.fee - x.ins), box = g.root.closest("[data-step-body]");
      const est = box && box.querySelector('[data-ci-amt="Today\'s patient estimate"]'), plus = box && box.querySelector('[data-ci-amt="Today\'s estimate plus balance"]');
      if (est) est.textContent = money(pt); if (plus) plus.textContent = money(pt + 740); },
    columns: [{ key: "code", label: "Code", w: 76, render: (r) => `<span class="tabular-nums">${r.code}</span>` }, { key: "area", label: "Area", w: 60 }, { key: "desc", label: "Description", w: 150, grow: true },
      { key: "fee", label: "Fee", w: 88, num: true, kind: "money", edit: "text", render: (r) => money(r.fee) }, { key: "ins", label: "Ins. est.", w: 88, num: true, kind: "money", edit: "text", render: (r) => money(r.ins) },
      { key: "pt", label: "Pt est.", w: 84, num: true, render: (r) => `<span class="text-gray-500">${money(r.fee - r.ins)}</span>` }] });
};
const v4StepBody = {
  0: () => psec("Demographics", `<div${chg4("Her details are a table you type into, so fixing a phone number is click and type; the Edit button is gone.")}>${fieldTable([
      { label: "Date of birth", value: "Jan 30, 1969", html: (r) => `${esc(r.value)} <span class="text-gray-500">· 57 y</span>` }, { label: "Cell phone", value: "(650) 555-0101", html: (r) => `<span class="tabular-nums">${esc(r.value)}</span>` },
      { label: "Email", value: "o.nguyen@example.com" }, { label: "Address", value: "418 Alma St, Palo Alto, CA 94301" },
      { label: "Preferred language", value: "English", type: "select", options: ["English", "Spanish", "Vietnamese", "Mandarin"] }, { label: "Preferred contact", value: "Text message", type: "select", options: ["Text message", "Phone call", "Email"] }], { labelW: 168, title: "Demographics" })}</div>
    <p class="mt-3 ${R.help}">Confirmed with the patient at 10:36 AM.</p>`),
  1: () => psec("Insurance", `<div${chg4("The plan is one table you type into, its status first (“Verified · Sep 24”): what's left this year and the deductible are lines of it instead of a grey sentence strung under the plan's name, and Member ID, group and subscriber follow, so a new card's numbers go straight in. Primary and when Asha checked it open on hover.")}>${fieldTable([
        { label: "Status", value: "Verified", type: "none", html: () => `<span class="inline-flex items-center gap-2 min-w-0"><span class="${cx(R.dot, TONE_DOT.on)}"></span>Verified<span class="text-gray-500 truncate">· Sep 24</span></span>` },
        { label: "Plan", value: "Aetna Dental PPO", type: "none", peek: () => peekCard("Aetna Dental PPO", [["Coverage", "Primary"], ["Checked", "Sep 24, 8:12 AM by Asha"]]) },
        { label: "Left this year", value: "1180", type: "none", html: () => `<span class="tabular-nums">${money(SCHED_BENEFITS.max - SCHED_BENEFITS.used)} <span class="text-gray-500">of ${money(SCHED_BENEFITS.max)}</span></span>` },
        { label: "Deductible", value: "Met", type: "none" },
        { label: "Member ID", value: "W2841 7730", html: (r) => `<span class="tabular-nums">${esc(r.value)}</span>` },
        { label: "Group", value: "0848812", html: (r) => `<span class="tabular-nums">${esc(r.value)}</span>` }, { label: "Subscriber", value: "Self", type: "select", options: ["Self", "Spouse", "Parent", "Other"] }], { labelW: 168, title: "Insurance", peek: (r) => (r.peek ? r.peek() : "") })}</div>`, { actions: button("Re-verify", { v: "white", s: "xs", icon: "refresh-cw" }) }),
  2: () => { const send = `${button("Text link", { v: "white", s: "xs" })}${button("Send to tablet", { v: "white", s: "xs" })}`, view = button("View", { v: "white", s: "xs" });
    return psec("Forms", `<p class="mb-3 flex items-center gap-1.5 text-[13px] text-gray-500 truncate"${chg4("The problem is said here, in the Forms step, as an orange icon and grey words; the step bar no longer carries an alert icon.")}>${I("circle-alert", "size-3.5 shrink-0 text-orange-500")}Periodontal consent isn't signed and her medical history needs an update.</p>
      <div${chg4("The forms are the same compact table as Today's visit. Every row has its button (View on signed forms, Text link and Send to tablet on the ones still to sign), so the last column is never half empty.")}>${v4FormsGrid([["HIPAA", "done", "Sep 23", view], ["Financial policy", "done", "Sep 23", view], ["Medical history", "upd", "Mar 3, 2025", send], ["Periodontal consent", "needs", "Not sent yet", send]], { act: true })}</div>`, { count: 4 }); },
  3: () => `${psec("Today's visit", `<div${chg4("Fees and estimates are cells you type into; the totals and the amount to collect follow as you type.")}>${v4CiLines()}</div>`)}
      ${psec("Collect today", `${v4CiOption("copay", [["Today's patient estimate", true, 104], ["Today's estimate plus balance", false, 844], ["Other amount", false, null]])}
        <p class="mt-2 ${R.help}">Prior balance is $740.00 from Aug 14. Estimates can change once Aetna pays.</p>`)}`,
  5: () => psec("Recall", `<div${chg4("The recall is a table you type into: change the type or due date right here.")}>${fieldTable([{ label: "Recall type", value: "Perio maintenance · every 3 months", type: "select", options: ["Perio maintenance · every 3 months", "Perio maintenance · every 4 months", "Cleaning · every 6 months"] },
      { label: "Next due", value: "Dec 28, 2026" }, { label: "Booked", value: "Not booked yet", type: "none", html: (r) => `<span class="text-gray-400">${esc(r.value)}</span>` }], { labelW: 168, title: "Recall" })}</div>`, { actions: button("Find a time in December", { v: "white", s: "xs", icon: "calendar-search" }) })
};
/* v4: check-in's ⋯ becomes the one Actions menu, in the standard record header */
const CI_ACTIONS = [
  { label: "Check-in", items: [{ icon: "printer", label: "Print route slip", hint: "Today's visit, alerts and notes for Hyg 2", suggest: "She needs premedication and nitrile gloves; the slip tells Jordan" },
    { icon: "id-card", label: "Scan ID and insurance card", hint: "Use the front desk scanner" }, { icon: "history", label: "Check-in history", hint: "Who did each step and when" }] },
  { label: "Patient", items: [{ icon: "file-user", label: "Open chart", hint: "Her full chart" }, { icon: "message-square", label: "Text patient", hint: "Open the text thread" }, { icon: "users", label: "Check in a family member", hint: "Someone else from her family is here", off: "No one else in her family is booked today" }] },
  { label: "", items: [{ icon: "undo-2", label: "Undo check-in", danger: true }] }];
const ciFooter = (i) => `${button("Back", { v: "white", s: "sm", icon: "arrow-left" })}<span class="grow"></span>${i === 6 ? button("Send to Hyg 2", { v: "solid", s: "sm" }) : `${button("Skip", { v: "quiet", s: "sm" })}${button(`Continue to ${CI_STEPS[i + 1][0]}`, { v: "solid", s: "sm", iconEnd: "arrow-right" })}`}`;
const CI_STATE = { Copay: 3, Forms: 2, Handoff: 6 };
defineBlock({
  cat: "schedule", id: "schedule-checkin", title: "Check-in steps",
  note: "Checking a patient in, in seven steps. Every step can be picked in any order; done steps get a blue check and the one with a problem an orange mark. Click a step to see its body.",
  where: "PMS › Scheduling › Check in",
  states: ["Copay", "Forms", "Handoff"],
  canvas: "bare",
  html: (state) => { const i = CI_STATE[state];
    return `<div class="relative overflow-hidden h-[720px]">${faded(pageSlice())}
      <aside class="absolute inset-y-0 end-0 flex flex-col w-[760px] bg-white border-s border-gray-200/80 shadow-[-12px_0_32px_-12px_rgba(17,24,39,0.16)]" aria-label="Check in">
        ${V4 ? `<div${chg4("Check-in uses the one patient header: her alerts are one orange icon with the count by her name (hover lists Premedicate and the latex allergy) and the family balance a wallet with $740.00.")}>${patientHeader({ name: "Olivia Nguyen", sub: "Check-in · 11:00 AM · Deep cleaning · Hyg 2 · Jordan Kim, RDH", alerts: OLIVIA_ALERTS, familyBalance: 740, rule: false,
          actions: `<span class="inline-flex"${chg4("The top-right menu is a ⋯ with the one searchable Actions list, grouped by check-in and patient, with Print route slip suggested for her premedication.")}>${actionsMenu(CI_ACTIONS, { dots: true, up: false, align: "end", open: V4_OPTS.open })}</span>`, end: iconButton("x", "Close", { s: "iconSm" }) })}</div>`
          : `<div class="flex items-start gap-x-3 px-5 pt-4 pb-3">${avatar("Olivia Nguyen", { size: 9 })}<div class="min-w-0 grow"><h2 class="text-base font-semibold text-gray-800">Check in Olivia Nguyen</h2><div class="text-[13px] text-gray-500 mt-0.5">11:00 AM · Deep cleaning · Hyg 2 · Jordan Kim, RDH</div></div><div class="flex items-center gap-0.5 -me-2">${iconButton("ellipsis", "More check-in options", { s: "iconSm" })}${iconButton("x", "Close", { s: "iconSm" })}</div></div>`}
        ${ciSteps(i)}<div class="grow overflow-y-auto [&>section:first-child]:border-t-0" data-step-body>${stepBody(i)}</div>
        <div class="flex items-center gap-2 px-5 py-3 border-t border-gray-200/80" data-step-foot>${ciFooter(i)}</div></aside></div>`; },
  mount: (el) => {
    el.addEventListener("click", (e) => { const b = e.target.closest("[data-step]"); if (!b) return; const i = +b.dataset.step;
      const bar = el.querySelector("[data-steps]"); (V2 ? bar.parentElement : bar).outerHTML = ciSteps(i); el.querySelector("[data-step-body]").innerHTML = stepBody(i); el.querySelector("[data-step-foot]").innerHTML = ciFooter(i); icons(); });
  }
});

})();
