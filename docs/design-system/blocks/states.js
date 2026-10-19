/* States & overlays blocks. Sources: asha-ui/record-sheet.tsx (AshaRecordSheet), asha-ui/settings-rows.tsx (AshaSaveStatus,
 * AshaSettingsReadOnly), asha-ui/settings-lists.tsx (AshaSettingsEmpty, AshaPendingChangesBar), asha-ui/overlays.tsx
 * (AshaConfirmDialog, AshaInfoPopover), claims/components/SentClaimSheet.react.tsx (Void at payer), lists/ (WorklistRecordSheet). */
(() => {

/* ---------- local helpers ---------- */
/* A small "Grid" that lets a block add something after every render (a note inside the list, a disabled button) */
class HookGrid extends Grid { render() { super.render(); if (this.o.after) this.o.after(this.root, this); } }
const pinMark = (n, cls = "") => `<span class="absolute z-10 flex size-5 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white tabular-nums ring-2 ring-white ${cls}" aria-hidden="true">${n}</span>`;
const dim = () => `<div class="absolute inset-0 z-10 bg-gray-900/20" aria-hidden="true"></div>`;
const chartNo = (p) => `#${10200 + +p.id.slice(1) * 31}`;
/* A faded, non-interactive table used as the page behind an overlay */
function fadedTable(cols, rows, { openRow = -1 } = {}) {
  if (V2) return `<div class="${edgeToEdge(16)}">${fadedTableV1(cols, rows, { openRow })}</div>`;
  return fadedTableV1(cols, rows, { openRow });
}
function fadedTableV1(cols, rows, { openRow = -1 } = {}) {
  return `<table class="w-full table-fixed border-separate border-spacing-0"><colgroup>${cols.map((c) => `<col ${c[1] ? `style="width:${c[1]}px"` : ""}>`).join("")}</colgroup>
    <thead><tr>${cols.map((c, i) => `<th class="${R.gridHead} ${c[2] ? "text-end" : ""} ${i === cols.length - 1 ? "!border-e-0" : ""}">${c[0]}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((r, ri) => `<tr>${r.map((v, i) => `<td class="${R.gridCell} ${cols[i][2] ? "text-end tabular-nums" : ""} ${i === cols.length - 1 ? "!border-e-0" : ""} ${ri === openRow ? "!bg-blue-50/60" : ""}">${v}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}
/* The settings page frame: one-line header, the grey settings menu, then the page */
const SET_MENU = [["Practice", [["building-2", "Practice info"], ["clock", "Hours & closures"], ["history", "Settings history"]]], ["Clinical", [["list", "Procedure codes"], ["package", "Procedure bundles"], ["smile", "Tooth chart"]]], ["Payments", [["credit-card", "Card payments"], ["smartphone", "Card readers"], ["wallet", "Payment options"], ["globe", "Online bill pay"]]], ["Insurance & claims", [["shield-check", "Clearinghouse"], ["hourglass", "Filing deadlines"]]]];
const settingsShell = (active, body) => `${workspaceHeader({ parent: "Practice Settings", title: "Bayview Family Dental" })}
  <div class="grid grid-cols-[232px_minmax(0,1fr)]"><nav class="border-e border-gray-200/80 bg-white p-3" aria-label="Settings"><div class="relative mb-1">${searchBox("Search settings", { w: "w-full" })}<span class="absolute inset-y-0 end-0 flex items-center pe-1.5">${kbd("⌘K")}</span></div>
    ${SET_MENU.map(([g, items]) => `<p class="${R.navGroup}">${g}</p>${items.map(([ic, l]) => `<a class="${l === active ? R.navItemOn : R.navItem}" ${l === active ? 'aria-current="page"' : ""}>${I(ic)}${l}</a>`).join("")}`).join("")}</nav>
    <div class="min-w-0 px-8 pt-7 pb-8">${body}</div></div>`;
const ptCell = (p) => `<span class="inline-flex items-center gap-x-2.5 min-w-0">${avatar(p.name, { size: 5 })}<span class="font-medium truncate">${esc(p.name)}</span></span>`;

/* ---------- claim rows used by several blocks ---------- */
const ST = { ready: ["Ready to send", "on"], review: ["Needs review", "needs"], payer: ["With payer", "off"], awaiting: ["Awaiting EOB", "off"], paid: ["Paid", "on"], partial: ["Partial", "mid"], denied: ["Denied", "needs"], info: ["Info requested", "needs"] };
const CL = [
  { id: "s1", pt: "p6", svc: "2026-05-02", payer: "guardian", billed: 235, status: "info", filing: 12 },
  { id: "s2", pt: "p13", svc: "2026-07-22", payer: "cigna", billed: 320, status: "denied", filing: 26 },
  { id: "s3", pt: "p15", svc: "2026-09-01", payer: "aetna", billed: 465, status: "awaiting", filing: 341 },
  { id: "s4", pt: "p1", svc: "2026-09-02", payer: "delta", billed: 253, status: "payer", filing: 342 },
  { id: "s5", pt: "p2", svc: "2026-06-30", payer: "metlife", billed: 2695, status: "partial", filing: 278 },
  { id: "s6", pt: "p10", svc: "2026-08-25", payer: "delta", billed: 240, status: "paid", filing: 334 },
  { id: "s7", pt: "p8", svc: "2026-09-10", payer: "metlife", billed: 1545, status: "ready", filing: 350 },
  { id: "s8", pt: "p5", svc: "2026-08-14", payer: "aetna", billed: 520, status: "review", filing: 324 },
  { id: "s9", pt: "p14", svc: "2026-05-12", payer: "guardian", billed: 188, status: "payer", filing: 229 },
  { id: "s10", pt: "p3", svc: "2026-09-18", payer: "cigna", billed: 175, status: "ready", filing: 358 }
];
const claimCols = () => [
  { key: "pt", label: "Patient", icon: "user", w: 210, open: true, kind: "text", value: (c) => DATA.patient(c.pt).name, lead: (c) => avatar(DATA.patient(c.pt).name, { size: 5 }), render: (c) => esc(DATA.patient(c.pt).name) },
  { key: "svc", label: "Service date", icon: "calendar", w: 150, kind: "date", render: (c) => fmtDate(c.svc) },
  { key: "payer", label: "Payer", icon: "shield", w: 150, kind: "text", value: (c) => DATA.payer(c.payer).short, render: (c) => esc(DATA.payer(c.payer).short) },
  { key: "billed", label: "Billed", icon: "receipt", w: 120, num: true, kind: "money", render: (c) => money(c.billed) },
  { key: "status", label: "Status", icon: "circle-dot", w: 156, kind: "text", value: (c) => ST[c.status][0], render: (c) => statusDot(...ST[c.status]) },
  { key: "filing", label: "Filing days left", icon: "hourglass", w: 140, num: true, kind: "num", render: (c) => (c.filing <= 30 ? `<span class="${R.flag} justify-end w-full">${I("circle-alert")}<span class="text-gray-800 tabular-nums">${c.filing}</span></span>` : `<span class="text-gray-500">${c.filing}</span>`) }
];
const claimFilters = () => [{ key: "status", label: "Status", options: Object.entries(ST).map(([value, s]) => ({ value, label: s[0], tone: s[1] })) }, { key: "payer", label: "Payer", options: DATA.payers.map((p) => ({ value: p.id, label: p.short })) }];
const claimsHeader = (tabs = true, counts = true, slot) => `${workspaceHeader({ parent: "Revenue Cycle", title: "Claims", actions: `${segmented(["Claims", "Pre-auths"], 0, { sm: true })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
  ${tabs ? tabsWithSlot(counts ? [["Unbatched claims", 6], ["To be sent", 3], ["Sent", 10], ["Adjudicated", 3], "Closed", "Archived"] : ["Unbatched claims", "To be sent", "Sent", "Adjudicated", "Closed", "Archived"], 2, slot ?? dateRangeButton("Last 30 days")) : ""}`;

/* ---------- v2 helpers ---------- */
/* A notice that isn't a person's fix (offline, still loading): the alertMark pattern with a grey icon */
const v2StatesQuietMark = (icon, short, detail, opts) => alertMark(short, detail, opts).replace(I("circle-alert", "size-3.5 shrink-0 text-orange-500"), I(icon, `size-3.5 shrink-0 text-gray-400 ${icon === "loader-circle" ? "motion-safe:animate-spin" : ""}`));
/* Loading that looks exactly like loaded: the real toolbar (disabled), the real header and n rows of grey bars */
function v2StatesSkeletonGrid(host, cols, n, o = {}) {
  const W = [70, 45, 60, 35, 55, 40];
  const columns = cols.map((c, ci) => Object.assign({}, c, { open: false, normal: null, value: () => "",
    lead: c.lead ? () => `<span class="size-5 shrink-0 rounded-full ${R.skel}"></span>` : null,
    render: (r) => `<span class="block h-3 ${R.skel} ${c.num ? "ms-auto" : ""}" style="width:${W[(r.id + ci) % 6]}%"></span>` }));
  return new HookGrid(host, Object.assign({ columns, rows: Array.from({ length: n }, (_, i) => ({ id: i })), viewButton: false, footer: false, maxHeight: 2000,
    after: (root) => { root.setAttribute("aria-busy", "true"); root.querySelectorAll("input,button").forEach((b) => (b.disabled = true)); } }, o));
}
/* The panel top bar: ↑ ↓ through the list, where you are, and close, on the page header's 44px line */
const v2StatesTopBar = (label, right, pin = "", mark = "") => `<div class="${R.bar} relative justify-between !px-3"${mark}>${pin}
  <div class="flex min-w-0 items-center gap-2 text-[13px] text-gray-500"><span class="inline-flex overflow-hidden rounded-lg border border-gray-200/80">
    <button type="button" class="${cx(R.btn, R.xs, R.iconXs, R.ghost, "!rounded-none")}" aria-label="Previous record" data-act="prev">${I("chevron-up")}</button><span class="w-px self-stretch bg-gray-200/80"></span>
    <button type="button" class="${cx(R.btn, R.xs, R.iconXs, R.ghost, "!rounded-none")}" aria-label="Next record" data-act="next">${I("chevron-down")}</button></span>
    <span class="truncate tabular-nums" aria-live="polite">${label}</span></div>
  <div class="flex items-center gap-0.5">${right}</div></div>`;

/* ============================================================ 1. Side panel anatomy */
const RECALL = [
  { pt: "p13", due: "2026-08-10", over: 46, type: "Adult cleaning", every: "6 months", last: "Sep 21 · Text · No reply", attempts: 2, next: "Mon, Sep 28", owner: "Nina Flores", note: "Prefers late afternoons. Ask about the crown on #19 too." },
  { pt: "p15", due: "2026-07-09", over: 78, type: "Denture check", every: "12 months", last: "Sep 18 · Call · Left voicemail", attempts: 3, next: "Tue, Sep 29", owner: "Front desk", note: "Daughter manages appointments. Call her cell first." },
  { pt: "p7", due: "2026-10-01", over: 0, type: "Adult cleaning", every: "6 months", last: "No contact logged yet", attempts: 0, next: "Today", owner: "Asha", note: "" },
  { pt: "p14", due: "2026-09-12", over: 13, type: "Perio maintenance", every: "3 months", last: "Sep 14 · Email · Opened", attempts: 1, next: "Wed, Sep 30", owner: "Nina Flores", note: "" }
];
/* The one status control at the top of a panel: a dot, a word and a chevron (opens the status menu) */
const statusButton = (word, tone) => `<button type="button" class="${cx(R.btn, R.sm, R.white, "!ps-2.5")}" aria-haspopup="menu" aria-label="Status: ${esc(word)}. Change status"><span class="${cx(R.dot, TONE_DOT[tone])}"></span>${esc(word)}${I("chevron-down", "!text-gray-400")}</button>`;
const statusLine = (btn, caption, pin = "") => `<section class="${R.psec} relative flex items-center justify-between gap-3 !py-3">${pin}${btn}<span class="min-w-0 truncate text-[13px] text-gray-500">${caption}</span></section>`;
const ownerCell = (o) => (o === "Asha" ? `<span class="inline-flex items-center gap-x-2"><span class="flex size-5 items-center justify-center rounded-full bg-blue-100 text-blue-800">${I("sparkles", "size-3")}</span>Asha</span>` : `<span class="inline-flex items-center gap-x-2">${avatar(o, { size: 5 })}${esc(o)}</span>`);
/* v2: a 44px top bar, quick actions on the name row, no "Before you call" section, and every fact once */
function v2RecordPanel(i, pins) {
  const r = RECALL[i], p = DATA.patient(r.pt), P = (n, cls) => (pins ? pinMark(n, cls) : "");
  const qa = [["phone", "Call"], ["message-square", "Text"], ["mail", "Email"], ["calendar-plus", "Schedule"], ["file-heart", "Open chart"], ["ellipsis", "More actions"]].map(([ic, l]) => iconButton(ic, l, { s: "iconSm" })).join("");
  const due = r.over ? alertMark(`${r.over} days overdue`, `Due ${fmtDate(r.due)} for ${r.type.toLowerCase()}.`) : `<span>Due ${fmtDate(r.due)}</span>`;
  return `<aside class="relative flex h-full w-[520px] shrink-0 flex-col border-s border-gray-200/80 bg-white shadow-[-12px_0_32px_-12px_rgba(17,24,39,0.16)]" role="dialog" aria-label="${esc(p.name)}, hygiene recall" data-panel${chg("One panel width, 520px, the same as every other side panel (this one was 460px)")}>
    ${v2StatesTopBar(`${i + 3} of 24 · Hygiene recall`, `${iconButton("maximize-2", "Open full page", { s: "iconSm" })}${iconButton("x", "Close", { s: "iconSm" })}`, P(1, "-start-2.5 top-3"), chg("The top bar is 44px, so its line meets the list header's line beside it (it was 53px)"))}
    <div class="relative flex items-center gap-x-3 ps-5 pe-3 py-3">${P(2, "-start-2.5 top-5")}${avatar(p.name, { size: 9 })}
      <div class="min-w-0 grow"><h2 class="truncate text-base font-semibold text-gray-800">${esc(p.name)}</h2><p class="mt-0.5 truncate text-[13px] text-gray-500">${p.age} · Chart ${chartNo(p)} · ${p.payer ? DATA.payer(p.payer).name : "No insurance"}</p></div>
      <div class="relative flex shrink-0 items-center"${chg("Quick actions sit at the right end of the name row as full 32px buttons, instead of a separate row of small ones")}>${P(3, "-start-2 -top-3")}${qa}</div></div>
    <div class="min-h-0 grow ${pins ? "" : "overflow-y-auto"}">
      <section class="${R.psec} relative flex items-center justify-between gap-3 !py-3">${P(4, "-start-2.5 top-4")}${statusButton("Open", "off")}<span class="flex min-w-0 items-center gap-3 text-[13px] text-gray-500"${chg("\"Before you call\" is gone: overdue sits in the status line as an orange mark, and the phone and best time join the Follow-up facts")}>${due}<span class="truncate">Follow up ${r.next === "Today" ? "today" : r.next}</span></span></section>
      ${psec("Recall", metaGrid([["Type", r.type], ["Every", r.every], ["Last visit", p.lastVisit ? fmtDateY(p.lastVisit) : '<span class="text-gray-400">None</span>']]))}
      ${psec("Follow-up", metaGrid([["Last contact", r.attempts ? r.last.split(" · ").slice(0, 2).join(" · ") : `<span class="text-gray-400">None yet</span>`], ["Result", r.attempts ? r.last.split(" · ")[2] : `<span class="text-gray-400">—</span>`], ["Attempts", `<span class="tabular-nums">${r.attempts} of 3</span>`], ["Owner", ownerCell(r.owner)], ["Mobile · prefers text", `<span class="tabular-nums">${p.phone}</span>`], ["Best time", "Weekday mornings"]], 3), { actions: button("Change", { v: "white", s: "xs", icon: "pencil" }) })}
      ${psec("Notes", r.note ? `<p class="text-sm leading-6 text-gray-800">${esc(r.note)}</p><p class="mt-1 ${R.caption}">${r.owner === "Asha" ? "Nina Flores" : r.owner} · Sep 21</p>` : `<p class="text-[13px] text-gray-400">No notes yet.</p>`, { actions: button("Add note", { v: "white", s: "xs", icon: "plus" }) })}
    </div>
    <div class="relative flex shrink-0 items-center gap-2 border-t border-gray-200/80 px-5 py-3">${P(5, "-start-2.5 top-4.5")}
      ${button("Snooze", { v: "quiet", s: "sm", icon: "clock", cls: "-ms-2" })}<span class="ms-auto"></span>${button("Log outcome", { v: "white", s: "sm", iconEnd: "chevron-down" })}${button("Schedule visit", { v: "solid", s: "sm", icon: "calendar-plus" })}</div>
  </aside>`;
}
/* v4: one header (who it is, an orange mark by the name when it's overdue, the quick actions, ↑ ↓ and close on the same
 * row, no bar above it); the facts are tables you type into with Status as the first line; Actions in the footer */
const V4_RECALL_ST = [["Open", "off"], ["Scheduled", "on"], ["Snoozed", "quiet"], ["Not interested", "quiet"]];
const v4RecallDot = (v) => `<span class="${cx(R.dot, TONE_DOT[(V4_RECALL_ST.find(([l]) => l === v) || [0, "off"])[1]])}"></span>`;
const v4RecallActions = (r) => [
  { label: "Recall", items: [{ icon: "send", label: "Text a booking link", hint: "They pick a time that suits them", suggest: r.over > 30 ? "Over a month overdue, and they prefer texts" : "" },
    { icon: "bot", label: "Hand to AI Hygiene Recall", hint: "Asha calls and texts until they book", off: r.owner === "Asha" ? "Asha already has this one" : "" },
    { icon: "mail", label: "Send recall email", hint: "The office's recall email, with a booking link" }, { icon: "clock", label: "Snooze", hint: "Take it off the list until a date you pick" }, { icon: "history", label: "Recall history", hint: "Every call, text and email" },
    { icon: "maximize-2", label: "Open full page", hint: "This recall on its own page" }] },
  { label: "", items: [{ icon: "user-x", label: "Mark not interested", hint: "Stops recall calls and texts", danger: true }] }];
function v4RecordPanel(i, pins) {
  const r = RECALL[i], p = DATA.patient(r.pt), P = (n, cls) => (pins ? pinMark(n, cls) : "");
  const qa = [["phone", "Call"], ["message-square", "Text"]].map(([ic, l]) => iconButton(ic, l, { s: "iconSm" })).join(""), m = (note) => (pins ? "" : chg4(note));
  const nav = `<span class="h-5 mx-1 border-s border-gray-200/80"></span>${iconButton("chevron-up", `Previous record · ${i + 3} of 24`, { s: "iconSm", attrs: 'data-act="prev"' })}${iconButton("chevron-down", `Next record · ${i + 3} of 24`, { s: "iconSm", attrs: 'data-act="next"' })}`;
  const marks = `<span class="flex items-center gap-2"${m("The header is the one patient header: medical alerts are one icon with the count and the family balance a wallet with the amount, by the name. How overdue it is stays on the Due line below, so the name keeps its room")}>${patientMarks({ alerts: p.alerts, familyBalance: p.balance })}</span>`;
  const followNote = `Follow up ${r.next === "Today" ? "today" : r.next}`;
  const recall = fieldTable([
    { label: "Status", value: "Open", type: "select", options: V4_RECALL_ST.map(([l]) => l), html: (x) => `<span class="inline-flex items-center gap-2 min-w-0">${v4RecallDot(x.value)}${esc(x.value)}${x.value === "Open" ? `<span class="truncate text-gray-500">· ${followNote}</span>` : ""}</span>` },
    { label: "Due", value: fmtDateY(r.due), type: "none", html: (x) => `<span class="inline-flex items-center gap-2 min-w-0"><span class="tabular-nums">${x.value}</span>${r.over ? `<span class="inline-flex items-center gap-1 text-gray-500">${I("circle-alert", "size-3.5 shrink-0 text-orange-500")}${r.over} days overdue</span>` : ""}</span>` },
    { label: "Recall type", value: r.type, type: "select", options: ["Adult cleaning", "Child cleaning", "Perio maintenance", "Denture check"] },
    { label: "Every", value: r.every, type: "select", options: ["3 months", "4 months", "6 months", "12 months"] },
    { label: "Last visit", value: p.lastVisit ? fmtDateY(p.lastVisit) : "None", type: "none" }], { title: "Recall" });
  const follow = fieldTable([
    { label: "Last contact", value: r.attempts ? r.last.split(" · ").slice(0, 2).join(" · ") : "None yet", type: "none" },
    { label: "Result", value: r.attempts ? r.last.split(" · ")[2] : "—", type: "none" },
    { label: "Attempts", value: `${r.attempts} of 3`, type: "none" },
    { label: "Owner", value: r.owner, type: "select", options: ["Nina Flores", "Front desk", "Asha", "Priya Shah"], html: (x) => ownerCell(x.value) },
    { label: "Mobile", value: p.phone, type: "text", html: (x) => `<span class="tabular-nums">${esc(x.value)}</span> <span class="text-gray-500">· prefers text</span>` },
    { label: "Best time", value: "Weekday mornings", type: "select", options: ["Weekday mornings", "Weekday afternoons", "Evenings", "Saturdays"] }], { title: "Follow-up" });
  return `<aside class="relative flex h-full w-[520px] shrink-0 flex-col border-s border-gray-200/80 bg-white shadow-[-12px_0_32px_-12px_rgba(17,24,39,0.16)]" role="dialog" aria-label="${esc(p.name)}, hygiene recall" data-panel>
    <div class="relative"${m("One header: who it is (the name opens the chart), then Call, Text, ↑ ↓ (which one of 24 is on their hover) and close, all on the name's row; the separate top bar is gone")}>${P(1, "-start-2.5 top-5")}${recordHeader({ lead: avatar(p.name, { size: 9 }), title: `<a class="hover:underline decoration-gray-300 underline-offset-4" href="#" title="Open chart">${esc(p.name)}</a>`, sub: `${p.age} · Chart ${chartNo(p)} · ${p.payer ? DATA.payer(p.payer).short : "No insurance"}`, marks,
      actions: `<span class="relative flex items-center gap-0.5">${P(2, "-start-2 -top-3")}${qa}${nav}</span>`, end: iconButton("x", "Close", { s: "iconSm" }) })}</div>
    <div class="min-h-0 grow ${pins ? "" : "overflow-y-auto"} [&>section:first-child]:border-t-0">
      <section class="${R.psec} relative">${P(3, "-start-2.5 top-4")}<div${m("Status is the first line of the recall's facts, a list with its dot, instead of a row of its own; the facts are a table you click and type into")}>${recall}</div></section>
      ${psec("Follow-up", `<div class="relative">${P(4, "-start-[30px] -top-8")}<div${m("Follow-up facts are the same table: Owner, mobile and best time are cells you change in place, so the Change button is gone")}>${follow}</div></div>`)}
      ${psec("Notes", r.note ? `<p class="text-sm leading-6 text-gray-800">${esc(r.note)}</p><p class="mt-1 ${R.caption}">${r.owner === "Asha" ? "Nina Flores" : r.owner} · Sep 21</p>` : `<p class="text-[13px] text-gray-400">No notes yet.</p>`, { actions: button("Add note", { v: "white", s: "xs", icon: "plus" }) })}
    </div>
    <div class="relative flex shrink-0 items-center gap-2 border-t border-gray-200/80 px-5 py-3">${P(5, "-start-2.5 top-4.5")}
      <span class="inline-flex"${m("The ⋯ quick action is now the standard Actions menu in the footer: searchable, grouped, with a sparkle on what Asha suggests now; Snooze is in it too, so the footer fits")}>${actionsMenu(v4RecallActions(r), { open: V4_OPTS.open })}</span><span class="ms-auto"></span>${button("Log outcome", { v: "white", s: "sm", iconEnd: "chevron-down" })}${button("Schedule visit", { v: "solid", s: "sm", icon: "calendar-plus" })}</div>
  </aside>`;
}
function recordPanel(i, pins) {
  if (V4) return v4RecordPanel(i, pins);
  if (V2) return v2RecordPanel(i, pins);
  const r = RECALL[i], p = DATA.patient(r.pt), P = (n, cls) => (pins ? pinMark(n, cls) : "");
  const qa = [["phone", "Call"], ["message-square", "Text"], ["mail", "Email"], ["calendar-plus", "Schedule"], ["file-heart", "Open chart"], ["ellipsis", "More actions"]].map(([ic, l]) => `<button type="button" class="${cx(R.btn, R.xs, R.iconXs, R.ghost, "!text-gray-500")}" aria-label="${l}" title="${l}">${I(ic)}</button>`).join("");
  const before = [
    r.over ? infoRow("circle-alert", `<span class="font-medium">${r.over} days overdue.</span> Due ${fmtDate(r.due)} for ${r.type.toLowerCase()}.`, { tone: "needs" }) : infoRow("calendar", `Due ${fmtDate(r.due)} for ${r.type.toLowerCase()}`),
    infoRow("phone", `<span class="tabular-nums">${p.phone}</span>`, { right: "Mobile · prefers text" }),
    infoRow("clock", "Best reached weekday mornings")
  ];
  return `<aside class="relative flex h-full w-[460px] shrink-0 flex-col border-s border-gray-200/80 bg-white shadow-[-12px_0_32px_-12px_rgba(17,24,39,0.16)]" role="dialog" aria-label="${esc(p.name)}, hygiene recall" data-panel>
    <div class="relative flex shrink-0 items-center justify-between gap-3 border-b border-gray-200/80 px-5 py-2.5">${P(1, "-start-2.5 top-3.5")}
      <div class="flex min-w-0 items-center gap-2 text-[13px] text-gray-500"><span class="inline-flex overflow-hidden rounded-lg border border-gray-200/80">
        <button type="button" class="${cx(R.btn, R.xs, R.iconXs, R.ghost, "!rounded-none")}" aria-label="Previous record" data-act="prev">${I("chevron-up")}</button><span class="w-px self-stretch bg-gray-200/80"></span>
        <button type="button" class="${cx(R.btn, R.xs, R.iconXs, R.ghost, "!rounded-none")}" aria-label="Next record" data-act="next">${I("chevron-down")}</button></span>
        <span class="truncate tabular-nums" aria-live="polite">${i + 3} of 24 · Hygiene recall</span></div>
      <div class="-me-2 flex items-center gap-0.5">${iconButton("maximize-2", "Open full page", { s: "iconSm" })}${iconButton("x", "Close", { s: "iconSm" })}</div></div>
    <div class="relative flex items-start gap-x-3 px-5 pt-4 pb-2">${P(2, "-start-2.5 top-6")}${avatar(p.name, { size: 9 })}
      <div class="min-w-0 grow"><h2 class="truncate text-base font-semibold text-gray-800">${esc(p.name)}</h2><p class="mt-0.5 truncate text-[13px] text-gray-500">${p.age} · Chart ${chartNo(p)} · ${p.payer ? DATA.payer(p.payer).name : "No insurance"}</p></div></div>
    <div class="relative flex items-center gap-0.5 ps-[66px] pe-5 pb-3">${P(3, "start-9 top-1")}${qa}</div>
    <div class="min-h-0 grow ${pins ? "" : "overflow-y-auto"}">
      ${statusLine(statusButton("Open", "off"), `Next follow-up ${r.next === "Today" ? "today" : r.next}`, P(4, "-start-2.5 top-4"))}
      ${psec("Before you call", `<div class="-my-1.5">${before.join("")}</div>`)}
      ${psec("Recall", metaGrid([["Type", r.type], ["Every", r.every], ["Last visit", p.lastVisit ? fmtDateY(p.lastVisit) : '<span class="text-gray-400">None</span>']]))}
      ${psec("Follow-up", metaGrid([["Last contact", r.attempts ? r.last.split(" · ").slice(0, 2).join(" · ") : `<span class="text-gray-400">None yet</span>`], ["Result", r.attempts ? r.last.split(" · ")[2] : `<span class="text-gray-400">—</span>`], ["Attempts", `<span class="tabular-nums">${r.attempts} of 3</span>`], ["Owner", ownerCell(r.owner)]], 3), { actions: button("Change", { v: "white", s: "xs", icon: "pencil" }) })}
      ${psec("Notes", r.note ? `<p class="text-sm leading-6 text-gray-800">${esc(r.note)}</p><p class="mt-1 ${R.caption}">${r.owner === "Asha" ? "Nina Flores" : r.owner} · Sep 21</p>` : `<p class="text-[13px] text-gray-400">No notes yet.</p>`, { actions: button("Add note", { v: "white", s: "xs", icon: "plus" }) })}
    </div>
    <div class="relative flex shrink-0 items-center gap-2 border-t border-gray-200/80 px-5 py-3">${P(5, "-start-2.5 top-4.5")}
      ${button("Snooze", { v: "quiet", s: "sm", icon: "clock", cls: "-ms-2" })}<span class="ms-auto"></span>${button("Log outcome", { v: "white", s: "sm", iconEnd: "chevron-down" })}${button("Schedule visit", { v: "solid", s: "sm", icon: "calendar-plus" })}</div>
  </aside>`;
}
const V2_ANATOMY = [
  ["Top bar", "Where the record came from, which one of how many, and ↑ ↓ to step through the list without closing. 44px, the same line as the page header."],
  ["Identity", "Who it is in one line, and the details that tell people apart underneath."],
  ["Quick actions", "Icon buttons on the name row for what staff reach for most. Each has a name on hover and for screen readers."],
  ["Status, then flat sections", "Status on one line: one button and a grey note, with an orange mark only when something is overdue. Then sections split by one hairline that runs edge to edge. Every fact appears once."],
  ["Footer", "Only for actions that change the record. One blue button."]
];
const V4_ANATOMY = [
  ["One header", "Who it is and the details that tell people apart. For a patient, medical alerts are one icon with the count (orange when someone must act first) and the family balance a wallet, by the name. Nothing sits above it."],
  ["Actions on the name's row", "Call and Text, ↑ ↓ to step through the list (which one of how many is on their hover), and close; the name opens the chart. Each icon has a name on hover and for screen readers."],
  ["Status is the first fact", "The record's facts are a small table you click and type into. Status is its first line, a list with its dot, never a row of its own."],
  ["Flat sections", "Sections split by one hairline that runs edge to edge. Every fact appears once, and the ones staff change are cells."],
  ["Footer", "The Actions menu (searchable, grouped) on the left, the everyday buttons on the right, one of them blue."]
];
const ANATOMY = [
  ["Top bar", "Where the record came from, which one of how many, and ↑ ↓ to step through the list without closing."],
  ["Identity", "Who it is in one line, and the details that tell people apart underneath."],
  ["Quick actions", "Icon buttons for what staff reach for most. Each has a name on hover and for screen readers."],
  ["Status, then flat sections", "Status on one line: one button and a grey note. Then sections split by one hairline that runs edge to edge, facts label over value. No boxes inside the panel."],
  ["Footer", "Only for actions that change the record. One blue button."]
];
function recallList(openIdx) {
  const rows = [["p9", "Adult cleaning", "Oct 3", "Asha"], ["p11", "Adult cleaning", "Aug 25", "Front desk"], ...RECALL.map((r) => [r.pt, r.type, fmtDate(r.due), r.owner]), ["p12", "Child cleaning", "Aug 25", "Front desk"], ["p4", "Child cleaning", "Sep 18", "Asha"], ["p3", "Adult cleaning", "Sep 20", "Nina Flores"], ["p10", "Adult cleaning", "Aug 25", "Nina Flores"], ["p6", "Adult cleaning", "Jun 2", "Front desk"], ["p1", "Adult cleaning", "Sep 12", "Asha"]];
  const inner = `<div class="min-w-0 grow opacity-60 pointer-events-none select-none" aria-hidden="true" inert>${workspaceHeader({ parent: "Lists", title: "Hygiene recall", actions: iconButton("ellipsis", "More", { s: "iconSm" }) })}
    ${tabsWithSlot([["Open", 24], ["Snoozed", 6], "Completed"], 0, "")}
    <div class="px-4 pt-3 overflow-hidden" data-scroll-ok>${fadedTable([["Contact", 0], ["Recall", 150], ["Due", 80], ["Owner", 130]], rows.map(([id, t, d, o]) => [ptCell(DATA.patient(id)), t, d, o]), { openRow: 2 + openIdx })}</div></div>`;
  return V2 ? `<div class="min-w-0 grow flex flex-col"${chg("The list behind runs edge to edge through the page gutter (its lines stopped 16px short)")}>${inner}</div>` : inner;
}
defineBlock({
  cat: "states", id: "states-record-sheet", thumb: true,
  title: "Side panel anatomy",
  note: "The one panel every record opens in: a top bar to step through the list, who it is, icon quick actions, flat sections and a footer. The ↑ ↓ buttons work.",
  where: "Lists, Claims, Charts › any row",
  states: ["With labels", "In context"],
  canvas: "bare",
  html: (state) => {
    const pins = state === "With labels";
    const left = pins ? `<div class="min-w-0 grow bg-gray-50/80 px-10 flex flex-col justify-center"><p class="${R.eyebrow} mb-4">A record panel, part by part</p><ol class="space-y-5"${chg4("The parts are v4's: one header with the actions on the name's row, status as the first line of a facts table, and the Actions menu in the footer")}>${(V4 ? V4_ANATOMY : V2 ? V2_ANATOMY : ANATOMY).map(([t, d], i) => `<li class="flex gap-x-3"><span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white mt-px">${i + 1}</span><span><span class="block text-sm font-medium text-gray-800">${t}</span><span class="block ${R.help} max-w-sm">${d}</span></span></li>`).join("")}</ol>
      <p class="mt-6 ${R.caption} max-w-sm">${V2 ? "520px wide" : "460px wide"}. It opens over the list, keeps the row you came from highlighted, and never opens a second pop-up on top of itself.</p></div>` : recallList(0);
    return `<div class="flex h-[830px]" data-sheet-root>${left}${recordPanel(0, pins)}</div>`;
  },
  mount: (el, state) => {
    const root = el.querySelector("[data-sheet-root]"); if (!root) return;
    let i = 0; const pins = state === "With labels";
    root.addEventListener("click", (e) => { const b = e.target.closest('[data-act="prev"],[data-act="next"]'); if (!b) return;
      i = (i + (b.dataset.act === "next" ? 1 : RECALL.length - 1)) % RECALL.length;
      root.querySelector("[data-panel]").outerHTML = recordPanel(i, pins);
      if (!pins) { const l = root.firstElementChild; l.outerHTML = recallList(i); }
      icons(); root.querySelector(`[data-act="${b.dataset.act}"]`).focus(); });
  }
});

/* ============================================================ 2. Empty states */
const STARTERS = [["Adult cleaning visit", "D0120 · D1110 · D0274"], ["New patient visit", "D0150 · D0210 · D1110"], ["Crown", "D2740 · D2950"], ["Child cleaning visit", "D0120 · D1120 · D1208"]];
defineBlock({
  cat: "states", id: "states-empty",
  title: "Empty states",
  note: "An empty screen keeps its frame and offers the next step. A first-time list offers starters, a search with no matches offers Clear filters, and a quiet day just says so.",
  where: "Any list",
  states: ["First time", "No results", "Nothing today"],
  canvas: "bare",
  html: (state) => {
    if (state === "First time") return settingsShell("Procedure bundles", `<div data-empty-root>
        <h1 class="${R.pageTitle}">Procedure bundles</h1><p class="${R.secondary} mt-1">Codes you often chart together, added in one click.</p>
        <div class="mt-7 mb-2 flex items-center justify-between gap-3"><h2 class="${R.groupTitle} flex items-center gap-2"${chg("No \"0\" count beside \"No bundles yet\": an empty list says it once")}${V2 ? " data-bundles-h" : ""}>Your bundles${V2 ? "" : ` <span class="${R.count}" data-n>0</span>`}</h2>${button("New bundle", { v: "solid", s: "sm", icon: "plus" })}</div>
        <div class="${R.box}">
          <div class="px-4 pt-4 pb-3"><p class="text-sm font-medium text-gray-800">No bundles yet</p><p class="${R.help}">Start from a common one and change it later, or make your own with New bundle.</p></div>
          <ul class="divide-y divide-gray-200/80 border-t border-gray-200/80" data-starters${chg("Starters are one-line 36px rows with the codes in grey, without four identical package icons")}>${STARTERS.map(([l, d]) => V2 ? `<li class="flex h-9 items-center gap-3 px-4"><p class="min-w-0 grow truncate text-sm text-gray-800">${l}<span class="ms-2 text-[13px] text-gray-500 tabular-nums">${d}</span></p>${button("Use this", { v: "white", s: "xs", attrs: 'data-act="use"' })}</li>` : `<li class="flex min-h-11 items-center gap-3 px-4 py-2"><span class="flex size-7 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-500">${I("package-plus", "size-4")}</span><div class="min-w-0 grow"><p class="text-sm text-gray-800">${l}</p><p class="${R.caption} tabular-nums">${d}</p></div>${button("Use this", { v: "white", s: "xs", attrs: 'data-act="use"' })}</li>`).join("")}</ul></div></div>`);
    if (state === "No results") return `${claimsHeader()}<div class="px-4 pb-4" data-grid="none"></div>`;
    if (V2) return `${workspaceHeader({ title: "Tasks", actions: button("New task", { v: "solid", s: "sm", icon: "plus" }) })}
      <div${chg("The tabs drop the \"0\" on Due today and the \"Today\" date button, which both repeated the empty message")}>${tabsWithSlot(["Due today", ["Upcoming", 6], ["Done this week", 14]], 0, "")}</div>
      <div class="px-4 pb-4"><div class="py-2.5 flex items-center gap-2">${searchBox("Search tasks", { w: "w-48" })}${button("Filter", { v: "quiet", s: "sm", icon: "list-filter" })}</div>
        <div class="${edgeToEdge(16)}"><table class="w-full table-fixed border-separate border-spacing-0"><thead><tr>${["Status", "Task", "Urgency", "Type", "Date created", "Assignee"].map((h, i) => `<th class="${R.gridHead} ${i === 5 ? "!border-e-0" : ""}">${h}</th>`).join("")}</tr></thead></table>
        <div class="border-b border-gray-200/80">${emptyState({ icon: "calendar-check", title: "Nothing due today", body: "New tasks land here as claims, calls and forms come in. The next one is due Monday, Sep 28.", action: `<span class="inline-flex"${chg("\"See upcoming\" without a count: the Upcoming tab right above already says 6")}>${button("See upcoming", { v: "white", s: "sm", iconEnd: "arrow-right" })}</span>` })}</div></div></div>`;
    return `${workspaceHeader({ title: "Tasks", actions: button("New task", { v: "solid", s: "sm", icon: "plus" }) })}
      ${tabsWithSlot([["Due today", 0], ["Upcoming", 6], ["Done this week", 14]], 0, dateRangeButton("Today"))}
      <div class="px-4 pb-4"><div class="py-2.5 flex items-center gap-2">${searchBox("Search tasks", { w: "w-48" })}${button("Filter", { v: "quiet", s: "xs", icon: "list-filter" })}</div>
        <div class="${edgeToEdge(16)}"><table class="w-full table-fixed border-separate border-spacing-0"><thead><tr>${["Status", "Task", "Urgency", "Type", "Date created", "Assignee"].map((h, i) => `<th class="${R.gridHead} ${i === 5 ? "!border-e-0" : ""}">${h}</th>`).join("")}</tr></thead></table>
        <div class="border-b border-gray-200/80">${emptyState({ icon: "calendar-check", title: "Nothing due today", body: "New tasks land here as claims, calls and forms come in. The next one is due Monday, Sep 28.", action: button("See upcoming (6)", { v: "white", s: "sm", iconEnd: "arrow-right" }) })}</div></div></div>`;
  },
  mount: (el, state) => {
    if (state === "No results") {
      const host = el.querySelector('[data-grid="none"]'); if (!host) return;
      const g = new Grid(host, { columns: claimCols(), rows: CL, title: "Sent", viewButton: false, searchPlaceholder: "Search claims", maxHeight: 360, filters: claimFilters(), calc: { billed: "sum" }, primary: { label: "New claim" } });
      g.q = "Walker"; g.filters = { status: "denied" }; g.render();
    }
    if (state === "First time") {
      const root = el.querySelector("[data-empty-root]"); if (!root) return;
      root.addEventListener("click", (e) => { const b = e.target.closest('[data-act="use"]'); if (!b) return;
        const li = b.closest("li"); li.querySelector("button").outerHTML = `<span class="${R.status} !text-[13px] !text-gray-500 asha-reveal">${I("check", "size-3.5 text-blue-600")}Added</span>`; icons();
        let n = root.querySelector("[data-n]"); if (!n) { root.querySelector("[data-bundles-h]").insertAdjacentHTML("beforeend", ` <span class="${R.countBlue}" data-n>0</span>`); n = root.querySelector("[data-n]"); }
        n.textContent = +n.textContent + 1; n.className = R.countBlue; });
    }
  }
});

/* ============================================================ 3. Loading */
const panelSkeleton = () => {
  const facts = (keys) => metaGrid(keys.map((k, i) => [k, `<span class="block pt-1">${skel(["w-24", "w-16", "w-20", "w-28"][i % 4], "h-3")}</span>`]));
  return `<aside class="flex h-full w-[460px] shrink-0 flex-col border-s border-gray-200/80 bg-white" aria-busy="true" aria-label="Loading claim">
  <div class="flex items-center justify-between gap-3 border-b border-gray-200/80 px-5 py-2.5"><div class="flex items-center gap-2">${skel("w-[58px]", "h-7")}${skel("w-28", "h-3.5")}</div><span class="-me-2">${iconButton("x", "Close", { s: "iconSm" })}</span></div>
  <div class="flex items-start gap-3 px-5 pt-4 pb-2"><span class="size-9 shrink-0 rounded-full ${R.skel}"></span><div class="grow space-y-2 pt-0.5">${skel("w-40", "h-4")}${skel("w-56", "h-3")}</div></div>
  <div class="flex gap-1 ps-[66px] pb-3">${[1, 2, 3, 4, 5].map(() => `<span class="size-7 rounded-md ${R.skel}"></span>`).join("")}</div>
  <section class="${R.psec} flex items-center justify-between !py-3">${skel("w-28", "h-8")}${skel("w-36", "h-3")}</section>
  ${psec("Claim", facts(["Payer", "Service date", "Billed", "Filing days left", "Submitted", "Claim #"]))}
  ${psec("Patient & coverage", facts(["Subscriber", "Member ID", "Plan"]))}
  ${psec("Procedures", bleed(`<table class="w-full border-separate border-spacing-0"><thead><tr><th class="${R.tHead} ps-5">Code</th><th class="${R.tHead}">Description</th><th class="${R.tHead} pe-5 text-end">Fee</th></tr></thead>
    <tbody>${["w-40", "w-32", "w-44"].map((w) => `<tr><td class="${R.tCell} ps-5 w-24">${skel("w-12", "h-3")}</td><td class="${R.tCell}">${skel(w, "h-3")}</td><td class="${R.tCell} pe-5"><span class="flex justify-end">${skel("w-16", "h-3")}</span></td></tr>`).join("")}</tbody></table>`), { cls: "!pb-0" })}</aside>`;
};
/* v2: the panel already knows the row that was clicked, so its top bar and identity are real; only the sections load */
const v2PanelSkeleton = (c) => {
  const p = DATA.patient(c.pt), facts = (keys) => metaGrid(keys.map((k, i) => [k, `<span class="block pt-1">${skel(["w-24", "w-16", "w-20", "w-28"][i % 4], "h-3")}</span>`]));
  return `<aside class="flex h-full w-[520px] shrink-0 flex-col border-s border-gray-200/80 bg-white" aria-busy="true" aria-label="Loading claim for ${esc(p.name)}">
  ${v2StatesTopBar(`5 of 10 · Sent`, iconButton("x", "Close", { s: "iconSm" }))}
  <div class="flex items-center gap-x-3 px-5 py-3"${chg("The panel shows the name and payer it already knows from the clicked row; only the sections below load, at the real 520px width")}>${avatar(p.name, { size: 9 })}<div class="min-w-0 grow"><h2 class="truncate text-base font-semibold text-gray-800">${esc(p.name)}</h2><p class="mt-0.5 truncate text-[13px] text-gray-500">${DATA.payer(c.payer).name} · Service ${fmtDateY(c.svc)}</p></div></div>
  <section class="${R.psec} flex items-center justify-between !py-3">${skel("w-28", "h-8")}${skel("w-36", "h-3")}</section>
  ${psec("Claim", facts(["Billed", "Filing days left", "Submitted", "Claim #", "Subscriber", "Member ID"]))}
  ${psec("Procedures", `<div class="${R.tableBox}"><table class="w-full border-separate border-spacing-0"><thead><tr><th class="${R.tHead}">Code</th><th class="${R.tHead}">Description</th><th class="${R.tHead} text-end">Fee</th></tr></thead><tbody>${["w-40", "w-32", "w-44"].map((w) => `<tr><td class="${R.tCell} w-24">${skel("w-12", "h-3")}</td><td class="${R.tCell}">${skel(w, "h-3")}</td><td class="${R.tCell}"><span class="flex justify-end">${skel("w-16", "h-3")}</span></td></tr>`).join("")}</tbody></table></div>`)}</aside>`;
};
/* v4: the loading panel is the loaded panel: its one header is real (from the clicked row), the facts table has its real
 * labels with grey bars for the values (no status row), and the lines are the real grid with grey bars */
const v4PanelSkeleton = (c) => {
  const p = DATA.patient(c.pt), bar = (w) => `<span class="block h-3 ${R.skel}" style="width:${w}px"></span>`, W = [72, 96, 56, 88, 64, 104, 80];
  const facts = fieldTable(["Status", "Billed", "Filing days left", "Submitted", "Claim #", "Subscriber", "Member ID"].map((label, i) => ({ label, value: "·", type: "none", html: () => `<span class="flex h-full items-center">${bar(W[i])}</span>` })), { title: "Claim, loading" });
  const lines = sheetTable({ title: "Procedures, loading", rows: [0, 1, 2].map((i) => ({ id: `k${i}` })), columns: [{ key: "code", label: "Code", w: 84, render: () => bar(44) }, { key: "desc", label: "Description", w: 180, grow: true, render: (r) => bar([150, 120, 170][+r.id.slice(1)]) }, { key: "fee", label: "Fee", w: 92, num: true, render: () => `<span class="flex justify-end">${bar(56)}</span>` }] });
  return `<aside class="flex h-full w-[520px] shrink-0 flex-col border-s border-gray-200/80 bg-white" aria-busy="true" aria-label="Loading claim for ${esc(p.name)}">
  <div${chg4("The loading panel already has its one header, real from the clicked row (name, payer, which one of 10, ↑ ↓ and close); there's no top bar above it and no status row below it")}>${recordHeader({ lead: avatar(p.name, { size: 9 }), title: esc(p.name), sub: `${DATA.payer(c.payer).name} · Service ${fmtDate(c.svc)}`,
    actions: `<span class="me-1 text-[13px] text-gray-500 tabular-nums whitespace-nowrap">5 of 10 in Sent</span>${iconButton("chevron-up", "Previous claim", { s: "iconSm" })}${iconButton("chevron-down", "Next claim", { s: "iconSm" })}`, end: iconButton("x", "Close", { s: "iconSm" }) })}</div>
  <div class="min-h-0 grow overflow-y-auto [&>section:first-child]:border-t-0">
    <section class="${R.psec}"><div${chg4("The facts load as the real table you'll type into, with its labels and Status as the first line; grey bars sit only where values go, so nothing moves when they arrive")}>${facts}</div></section>
    ${psec("Procedures", lines)}</div></aside>`;
};
const HEADS = ["Patient", "Service date", "Payer", "Billed", "Status"];
defineBlock({
  cat: "states", id: "states-loading",
  title: "Loading",
  note: "While data loads, the page keeps its real header, tab names, column names and labels, with grey bars only where the values will go. Nothing jumps when it arrives. After 10 seconds a quiet line says so.",
  where: "Any list, panel or settings page",
  states: ["List and panel", "Settings page", "Taking a while"],
  canvas: "bare",
  html: (state) => {
    if (state === "Settings page") {
            const ctl = { sw: `<span class="h-5 w-9 rounded-full ${R.skel}"></span>`, sel: skel("w-56", "h-9"), val: skel("w-28", "h-3.5") };
      return settingsShell("Card payments", `<div class="max-w-[720px]" aria-busy="true"><h1 class="${R.pageTitle}">Card payments</h1><p class="${R.secondary} mt-1">How you take cards at the desk and online.</p>
          ${[["Taking payments", [["Accept cards at the front desk", "sw"], ["Card surcharge", "sw"], ["Default card reader", "sel"]]], ["Payouts", [["Bank account", "val"], ["Payout schedule", "sel"]]], ["Receipts", [["Email a receipt after each payment", "sw"]]]].map(([t, rows]) => `<h2 class="${R.groupTitle} mt-7 mb-2">${t}</h2><div class="${R.box} divide-y divide-gray-200/80">${rows.map(([l, k], i) => `<div class="flex items-center justify-between gap-6 px-4 py-3 min-h-11"><div class="space-y-1.5"><p class="${R.label}">${l}</p>${skel(["w-64", "w-48", "w-56"][i % 3], "h-2.5")}</div>${ctl[k]}</div>`).join("")}</div>`).join("")}</div>`);
    }
    const slow = state === "Taking a while";
    if (V2) return slow ? `<div class="min-w-0 flex flex-col">${claimsHeader(true, false, `<span class="me-1 inline-flex"${chg("\"Still loading\" sits in the tab bar's right slot as a grey mark, instead of a row that pushes the list down")} role="status">${v2StatesQuietMark("loader-circle", "Taking longer than usual", "Claims are still loading. This is slower than usual, and nothing is lost.", { action: button("Try again", { v: "white", s: "xs", icon: "rotate-cw" }) })}</span>${dateRangeButton("Last 30 days")}`)}
        <div class="px-4 pb-4 min-w-0" data-grid="skeleton"${chg("Loading draws the real toolbar, the real column headers (icons, checkboxes, right-aligned Billed) and grey bars, so nothing moves when the claims arrive")}></div></div>`
      : `<div class="flex h-[640px]"><div class="min-w-0 grow flex flex-col overflow-hidden">${claimsHeader(false)}${tabsWithSlot(["Unbatched claims", "To be sent", "Sent", "Adjudicated"], 2, dateRangeButton("Last 30 days"))}<div class="px-4 min-w-0" data-grid="behind"></div></div>${V4 ? v4PanelSkeleton(CL[4]) : v2PanelSkeleton(CL[4])}</div>`;
    return `<div class="flex ${slow ? "" : "h-[640px]"}"><div class="min-w-0 grow flex flex-col">
      ${slow ? claimsHeader(true, false) : `${claimsHeader(false)}${tabsWithSlot(["Unbatched claims", "To be sent", "Sent", "Adjudicated"], 2, dateRangeButton("Last 30 days"))}`}
      <div class="px-4 min-w-0" aria-busy="true"><div class="py-2.5 flex items-center gap-2">${button("Sent", { v: "ghost", s: "sm", cls: "-ms-2", iconEnd: "chevron-down" })}<span class="h-5 border-s border-gray-200/80"></span>${searchBox("Search claims", { w: "w-44" })}</div>
        ${slow ? `<div class="flex items-center gap-2 h-9 mb-2 text-[13px] text-gray-600" role="status">${I("loader-circle", "size-4 text-gray-400 motion-safe:animate-spin")}Still loading claims. This is taking longer than usual.${button("Try again", { v: "white", s: "xs", icon: "rotate-cw", cls: "ms-auto" })}</div>` : ""}
        ${gridSkeleton(HEADS, slow ? 9 : 10)}</div></div>
      ${slow ? "" : panelSkeleton()}</div>`;
  },
  mount: (el, state) => {
    if (!V2) return;
    const sk = el.querySelector('[data-grid="skeleton"]');
    if (sk) v2StatesSkeletonGrid(sk, claimCols(), 9, { title: "Sent", searchPlaceholder: "Search claims", filters: claimFilters(), primary: { label: "New claim" } });
    const behind = el.querySelector('[data-grid="behind"]');
    if (behind) { const g = new Grid(behind, { columns: claimCols(), rows: CL, title: "Sent", viewButton: false, noun: "claims", searchPlaceholder: "Search claims", maxHeight: 480, filters: claimFilters(), calc: { billed: "sum" }, defaultSort: { key: "svc", dir: 1 }, primary: { label: "New claim" }, onOpen: () => {} });
      g.openId = CL[4].id; g.render(); }
  }
});

/* ============================================================ 4. Errors */
defineBlock({
  cat: "states", id: "states-errors",
  title: "Errors",
  note: "If a list can't load, it says so in plain words with Try again and keeps the page around it. If only part failed, a one-line note sits inside the list. Offline, you still see what was loaded and when. Try again works.",
  where: "Any list",
  states: ["Failed to load", "Partly loaded", "Offline"],
  canvas: "bare",
  html: (state) => {
    if (state === "Failed to load") return `${claimsHeader(true, false)}<div class="px-4 pb-6" data-err-root>
      ${V2 ? `<div class="py-2.5 flex items-center gap-2"${chg("The toolbar starts with search: a \"Sent\" view button repeated the tab right above it")}>${searchBox("Search claims", { w: "w-48" })}</div>` : `<div class="py-2.5 flex items-center gap-2">${button("Sent", { v: "ghost", s: "sm", cls: "-ms-2", iconEnd: "chevron-down" })}<span class="h-5 border-s border-gray-200/80"></span>${searchBox("Search claims", { w: "w-48" })}</div>`}
      <div class="${edgeToEdge(16)}"><table class="w-full table-fixed border-separate border-spacing-0"><thead><tr>${HEADS.concat("Filing days left").map((h, i) => `<th class="${R.gridHead} ${i === 5 ? "!border-e-0" : ""}">${h}</th>`).join("")}</tr></thead></table>
      <div class="border-b border-gray-200/80" data-err-body>${errorState("Couldn't load claims", "Something went wrong on our side, and nothing was lost. Try again in a moment.")}
        <p class="-mt-8 pb-8 text-center ${R.caption}">If it keeps happening, contact Support and mention code CLM-503.</p></div></div></div>`;
    if (state === "Partly loaded") return V2 ? `${claimsHeader(true, true, `<span class="me-1 inline-flex" data-partial${chg("A partial load is a small orange mark in the tab bar, with the payer and Try again on hover, instead of a red row that pushed the list down")}>${alertMark("2 claims missing", `Couldn't load claims from <span class="font-medium text-gray-800">Guardian Dental</span>. The other payers are up to date.`, { action: button("Try again", { v: "white", s: "xs", icon: "rotate-cw", attrs: 'data-act="retry"' }) })}</span>${dateRangeButton("Last 30 days")}`)}<div class="px-4 pb-4" data-grid="partial"></div>`
      : `${claimsHeader()}<div class="px-4 pb-4" data-grid="partial"></div>`;
    if (V2) return `${claimsHeader(true, true, `<span class="me-1 inline-flex" role="status"${chg("Offline is a grey mark in the tab bar (it isn't anyone's fix), with the time and Retry now on hover, instead of a row above the list")}>${v2StatesQuietMark("cloud-off", "Offline", "Showing claims as of 10:42 AM. Changes save when you're back.", { action: button("Retry now", { v: "white", s: "xs", icon: "rotate-cw" }) })}</span>${dateRangeButton("Last 30 days")}`)}
      <div class="px-4 pb-4" data-grid="offline"></div>`;
    return `${claimsHeader()}
      <div class="flex items-center gap-2 h-10 px-4 border-b border-gray-200/80 text-[13px] text-gray-600" role="status">${I("cloud-off", "size-4 text-gray-400")}<span><span class="font-medium text-gray-800">You're offline.</span> Showing claims as of 10:42 AM. Changes save when you're back.</span>${button("Retry now", { v: "white", s: "xs", icon: "rotate-cw", cls: "ms-auto" })}</div>
      <div class="px-4 pb-4" data-grid="offline"></div>`;
  },
  mount: (el, state) => {
    if (state === "Failed to load") {
      const body = el.querySelector("[data-err-body]"); if (!body) return;
      body.addEventListener("click", (e) => { if (!e.target.closest("button")) return;
        body.innerHTML = gridSkeleton(HEADS.concat("Filing days left"), 3).replace("border-y", "border-b");
        setTimeout(() => { body.innerHTML = errorState("Still couldn't load claims", "We tried again and it didn't work. Check the status page, or try again in a few minutes."); icons(); }, 900); });
    }
    if (state === "Partly loaded" && V2) {
      const host = el.querySelector('[data-grid="partial"]'); if (!host) return;
      const g = new Grid(host, { columns: claimCols(), rows: CL.filter((c) => c.payer !== "guardian"), title: "Sent", viewButton: false, searchPlaceholder: "Search claims", maxHeight: 400, filters: claimFilters(), calc: { billed: "sum" }, defaultSort: { key: "svc", dir: 1 }, primary: { label: "New claim" }, onOpen: () => {} });
      el.addEventListener("click", (e) => { if (!e.target.closest('[data-act="retry"]')) return; const mark = el.querySelector("[data-partial]"); if (!mark) return;
        mark.innerHTML = `<span class="inline-flex items-center gap-1.5 text-[13px] text-gray-500">${I("loader-circle", "size-4 motion-safe:animate-spin")}Loading Guardian Dental…</span>`; icons();
        setTimeout(() => { mark.remove(); g.data = CL.map((r) => ({ ...r })); g.render(); host.querySelectorAll(".g-row").forEach((tr) => { if (/Guardian/.test(tr.textContent)) tr.querySelectorAll("td").forEach((td) => td.classList.add("asha-settle")); }); }, 900); });
    }
    else if (state === "Partly loaded") {
      const host = el.querySelector('[data-grid="partial"]'); if (!host) return;
      let failed = true;
      const noteHtml = () => failed ? `<div class="flex items-center gap-2 min-h-10 px-3 border-t border-gray-200/80 bg-white" data-note>${note(`Couldn't load claims from <span class="font-medium text-gray-800">Guardian Dental</span>, so 2 are missing. The other payers are up to date.`, "error").replace("<p ", '<p style="margin:0" ')}${button("Try again", { v: "white", s: "xs", icon: "rotate-cw", cls: "ms-auto", attrs: 'data-act="retry"' })}</div>` : "";
      const g = new HookGrid(host, { columns: claimCols(), rows: CL.filter((c) => c.payer !== "guardian"), title: "Sent", searchPlaceholder: "Search claims", maxHeight: 400, filters: claimFilters(), calc: { billed: "sum" }, defaultSort: { key: "svc", dir: 1 }, primary: { label: "New claim" }, onOpen: () => {},
        after: (root) => { const w = root.querySelector('[data-role="grid"]'); if (w && failed) w.insertAdjacentHTML("beforebegin", noteHtml()); icons(); } });
      host.addEventListener("click", (e) => { const b = e.target.closest('[data-act="retry"]'); if (!b) return;
        b.outerHTML = `<span class="ms-auto inline-flex items-center gap-1.5 text-[13px] text-gray-500">${I("loader-circle", "size-4 motion-safe:animate-spin")}Loading Guardian Dental…</span>`; icons();
        setTimeout(() => { failed = false; g.data = CL.map((r) => ({ ...r })); g.render(); host.querySelectorAll(".g-row").forEach((tr) => { if (/Guardian/.test(tr.textContent)) tr.querySelectorAll("td").forEach((td) => td.classList.add("asha-settle")); }); }, 900); });
    }
    if (state === "Offline") {
      const host = el.querySelector('[data-grid="offline"]'); if (!host) return;
      new HookGrid(host, { columns: claimCols(), rows: CL.slice(0, 7), title: "Sent", viewButton: false, searchPlaceholder: "Search claims", maxHeight: 380, filters: claimFilters(), calc: { billed: "sum" }, defaultSort: { key: "svc", dir: 1 }, primary: { label: "Send claims", icon: "send" }, onOpen: () => {},
        after: (root) => { const b = root.querySelector('[data-act="new"]'); if (b) { b.disabled = true; b.title = "Needs a connection"; b.setAttribute("aria-disabled", "true"); } } });
    }
  }
});

/* ============================================================ 5. Read-only */
const RO_ROWS = [
  ["Taking payments", [
    { l: "Accept cards at the front desk", h: "Staff can run cards on the reader or type them in.", c: sw(true, "Accept cards at the front desk"), v: "On" },
    { l: "Card surcharge", h: "Adds a fee to card payments where your state allows it.", c: sw(false, "Card surcharge"), v: "Off" },
    { l: "Default card reader", h: "Used when a payment doesn't pick one.", c: `<button type="button" class="${R.select} !w-56">Front desk reader${I("chevrons-up-down")}</button>`, v: "Front desk reader" }]],
  ["Payouts", [
    { l: "Bank account", h: "Where card payments are paid out.", c: `<span class="flex items-center gap-3"><span class="text-sm text-gray-800 tabular-nums">Chase ····4821</span>${button("Change", { v: "ghost", s: "sm" })}</span>`, v: `<span class="tabular-nums">Chase ····4821</span>` },
    { l: "Payout schedule", h: "Money usually lands 2 business days later.", c: `<button type="button" class="${R.select} !w-56">Every business day${I("chevrons-up-down")}</button>`, v: "Every business day" }]],
  ["Receipts", [
    { l: "Email a receipt after each payment", h: "Sent to the patient's email on file.", c: sw(true, "Email a receipt after each payment"), v: "On" },
    { l: "Receipt footer", h: "A line printed at the bottom of every receipt.", c: `<span class="flex items-center gap-3 min-w-0"><span class="truncate text-sm text-gray-800">Thank you for choosing Bayview!</span>${button("Edit", { v: "ghost", s: "sm" })}</span>`, v: "Thank you for choosing Bayview!" }]]
];
defineBlock({
  cat: "states", id: "states-readonly",
  title: "Read-only and no permission",
  note: "People who can look but not change see one lock line with the reason and who to ask. Rows show their values as plain text; switches, Change and Edit buttons simply aren't there. Compare with Can edit.",
  where: "Settings › Payments › Card payments",
  states: ["Read-only", "Can edit"],
  canvas: "bare",
  html: (state) => {
    const ro = state === "Read-only";
    return settingsShell("Card payments", `<div class="max-w-[720px]">
        <h1 class="${R.pageTitle}">Card payments</h1><p class="${R.secondary} mt-1">How you take cards at the desk and online.</p>
        ${ro ? `<p class="mt-3 flex items-center gap-1.5 text-[13px] leading-5 text-gray-500">${I("lock", "size-3.5 shrink-0 text-gray-400")}Only owners and office managers can change payment settings. Ask Dr. Maya Patel.</p>` : ""}
        ${RO_ROWS.map(([t, rows]) => `<h2 class="${R.groupTitle} mt-7 mb-2">${t}</h2><div class="${R.box} divide-y divide-gray-200/80">${rows.map((r) => `<div class="flex items-center justify-between gap-6 px-4 py-3 min-h-11"><div class="min-w-0"><p class="${R.label}">${r.l}</p><p class="${R.help}">${r.h}</p></div><div class="shrink-0 ${ro ? "text-sm text-gray-800" : ""}">${ro ? r.v : r.c}</div></div>`).join("")}</div>`).join("")}
      </div>`);
  }
});

/* ============================================================ 6. Confirm dialogs */
/* Dialog anatomy: a header, body sections split by hairlines that touch both edges, a footer */
const dlgHead = (icon, tone, id, title, sub) => V2 ? `<div class="px-5 pt-5 pb-4"${chg("No tinted icon circle: the title starts at the dialog's edge and reads straight down into the body")}><h2 id="${id}" class="${R.sectionTitle}">${title}</h2><p class="${R.help} mt-0.5">${sub}</p></div>` : `<div class="flex gap-x-3.5 px-5 pt-5 pb-4"><span class="flex size-9 shrink-0 items-center justify-center rounded-full ${tone}">${I(icon, "size-4")}</span>
  <div class="min-w-0"><h2 id="${id}" class="${R.sectionTitle}">${title}</h2><p class="${R.help} mt-0.5">${sub}</p></div></div>`;
function voidDialog() {
  return `<div class="${R.dialog} ${V2 ? "" : "!w-[500px]"}" role="alertdialog" aria-modal="true" aria-labelledby="void-t"${chg("One dialog width, 480px, like every other dialog")}>
    ${dlgHead("trash-2", "bg-red-50 text-red-600", "void-t", "Void this claim at MetLife?", `Liam Carter · Service Jun 30, 2026 · ${money(2695)} billed`)}
    <section class="border-t border-gray-200/80 px-5 py-4"><h3 class="${R.groupTitle} mb-2">What happens</h3>
      <ul class="space-y-2 text-sm text-gray-700">${["We send MetLife a request to cancel the claim. They usually answer in 3–5 business days.", "The claim stays open as <span class=\"font-medium text-gray-900\">Void requested</span> until MetLife confirms.", `The ${money(1310.5)} MetLife already paid stays on the ledger. If they take it back, post the refund then.`].map((t) => `<li class="flex gap-x-2">${I("dot", "size-5 -mx-1 shrink-0 text-gray-400")}<span>${t}</span></li>`).join("")}</ul></section>
    ${V2 ? "" : `<section class="border-t border-gray-200/80 px-5 py-3">${note("Just want it off your list? Archive it instead. That doesn't tell MetLife anything.", "info")}</section>`}
    <div class="flex items-center gap-2 px-5 py-3 border-t border-gray-200/80">${V2 ? `<span class="inline-flex"${chg("The \"Just want it off your list?\" note is gone: it only repeated this Archive instead button")}>${button("Archive instead", { v: "quiet", s: "md", cls: "-ms-2" })}</span>` : button("Archive instead", { v: "quiet", s: "md", cls: "-ms-2" })}<span class="ms-auto"></span>${button("Cancel", { v: "white", s: "md" })}${button("Void claim", { v: "dangerSolid", s: "md" })}</div></div>`;
}
function sendDialog() {
  const rows = [["Text and email", 128, 34902.1], ["Email only", 8, 1988.4], ["Mail, no mobile or email on file", 6, 1324.1]];
  return `<div class="${R.dialog} ${V2 ? "" : "!w-[500px]"}" role="alertdialog" aria-modal="true" aria-labelledby="send-t"${chg("One dialog width, 480px, like every other dialog")}>
    ${dlgHead("send", "bg-blue-50 text-blue-600", "send-t", "Send 142 statements now?", "Each patient gets their balance with a link to pay. Statements can't be taken back once sent.")}
    <table class="w-full border-separate border-spacing-0 border-t border-gray-200/80"><thead><tr><th class="${R.tHead} ps-5">How they're sent</th><th class="${R.tHead} !text-end">Patients</th><th class="${R.tHead} pe-5 !text-end">Amount</th></tr></thead>
      <tbody>${rows.map(([l, n, a]) => `<tr><td class="${R.tCell} ps-5">${l}</td><td class="${R.tCell} text-end tabular-nums">${n}</td><td class="${R.tCell} pe-5 text-end tabular-nums">${money(a)}</td></tr>`).join("")}</tbody>
      <tfoot><tr><td class="h-10 ps-5 text-sm font-medium text-gray-800">Total</td><td class="h-10 px-3 text-end text-sm font-semibold tabular-nums">142</td><td class="h-10 pe-5 text-end text-sm font-semibold tabular-nums">${money(38214.6)}</td></tr></tfoot></table>
    <section class="border-t border-gray-200/80 px-5 py-3">${note(`Mailed statements cost ${money(0.89)} each, so ${money(5.34)} for these 6.`, "info")}</section>
    <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200/80">${button("Cancel", { v: "white", s: "md" })}${button("Send 142 statements", { v: "solid", s: "md", icon: "send" })}</div></div>`;
}
function statementsBackdrop() {
  const pts = ["p15", "p8", "p5", "p13", "p1", "p10", "p6", "p3", "p2", "p14", "p11", "p7"];
  return `${workspaceHeader({ parent: "Revenue Cycle", title: "Statements", actions: button("Send selected", { v: "solid", s: "sm", icon: "send" }) })}
    ${tabsWithSlot([["Ready for review", 142], ["Sent", "1,206"], ["Failed", 3]], 0, dateRangeButton("Sep batch"))}
    <div class="px-4 pt-3">${fadedTable([["Patient", 0], ["Balance", 130, 1], ["Last statement", 150], ["Sends by", 190]], pts.map((id, i) => { const p = DATA.patient(id); return [ptCell(p), money(p.balance || [48, 125, 62.5][i % 3]), ["Aug 25", "Jul 28", "Aug 25", "Never"][i % 4], ["Text and email", "Text and email", "Email only", "Mail"][i % 7 === 6 ? 3 : i % 5 === 4 ? 2 : 0]]; }))}</div>`;
}
function claimsBackdrop() {
  return `${claimsHeader()}<div class="px-4 pt-3">${fadedTable([["Patient", 220], ["Service date", 0], ["Payer", 0], ["Billed", 0, 1], ["Status", 0]], CL.map((c) => [ptCell(DATA.patient(c.pt)), fmtDate(c.svc), DATA.payer(c.payer).short, money(c.billed), statusDot(...ST[c.status])]), { openRow: 4 })}</div>`;
}
defineBlock({
  cat: "states", id: "states-confirm",
  title: "Confirm dialogs",
  note: "Before anything that can't be undone, a short dialog says exactly what will happen, with numbers. Destructive actions get the red button and a gentler way out; a big send gets the blue one.",
  where: "Claims › Void claim · Statements › Send",
  states: ["Void claim", "Send statements"],
  canvas: "bare",
  html: (state) => `<div class="relative h-[620px] overflow-hidden" data-scroll-ok>${V2 ? `<div${chg("The list behind runs edge to edge through the page gutter (its lines stopped 16px short)")}>` : ""}<div aria-hidden="true" inert class="pointer-events-none select-none">${state === "Void claim" ? claimsBackdrop() : statementsBackdrop()}</div>${V2 ? "</div>" : ""}
    ${dim()}<div class="absolute inset-0 z-20 flex items-center justify-center p-4">${state === "Void claim" ? voidDialog() : sendDialog()}</div></div>`
});

/* ============================================================ 7. Hover card and info popover */
const HOVER_PTS = ["p5", "p1", "p2", "p8", "p13", "p10"];
const NEXT_TXT = (p) => (p.next ? `${p.next.slice(0, 10) === TODAY ? "Today" : fmtDate(p.next)}, ${(() => { const [h, m] = p.next.slice(11).split(":").map(Number); return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`; })()}` : "");
/* v2: the card adds what the row lacks. skip: facts the host row already shows (here Chart #, Next appt and Balance) */
function v2HoverCard(p, { skip = ["next"] } = {}) {
  const ins = p.payer ? `<span class="inline-flex items-center gap-2">${DATA.payer(p.payer).short}${p.id === "p13" ? alertMark("Needs review", "Asha couldn't confirm this plan on Cigna's site. Check it before the visit.", { align: "start" }) : ""}</span>` : '<span class="text-gray-400">None on file</span>';
  const alerts = p.alerts.length ? `<span class="flex flex-wrap items-center gap-x-3 gap-y-1">${p.alerts.map((a) => (a === "Premedicate" ? flag(a, "!text-gray-800") : `<span class="text-sm text-gray-800">${esc(a)}</span>`)).join("")}</span>` : '<span class="text-gray-400">None</span>';
  const rows = [!skip.includes("next") && ["Next visit", p.next ? `${NEXT_TXT(p)} <span class="text-gray-500">· Op 1</span>` : '<span class="text-gray-400">Not scheduled</span>'], ["Insurance", ins], ["Ins. est.", `<span class="tabular-nums">${money(p.insBalance)}</span>`], ["Alerts", alerts]].filter(Boolean);
  return `<div class="w-[340px] ${R.popover}" role="dialog" aria-label="${esc(p.name)} preview">
    <div class="flex items-center gap-3 px-4 pt-3.5 pb-3 border-b border-gray-200/80">${avatar(p.name, { size: 9 })}<div class="min-w-0 grow"><p class="truncate text-sm font-medium text-gray-900">${esc(p.name)}</p><p class="${R.caption}"${chg("The card skips what the row already shows (chart #, next visit, balance) and adds what it doesn't")}>${p.age} · DOB ${fmtDateY(p.dob)}</p></div>${iconButton("file-heart", "Open chart", { s: "iconSm" })}</div>
    <dl class="px-4 py-2"${chg("Insurance shows the payer alone when it's verified; an orange mark appears only when it needs review")}>${rows.map(([k, v]) => `<div class="grid grid-cols-[88px_1fr] items-center gap-x-3 min-h-8"><dt class="text-[13px] text-gray-500">${k}</dt><dd class="min-w-0 text-sm text-gray-800">${v}</dd></div>`).join("")}</dl></div>`;
}
/* v4: the card starts with the one patient header (medical alerts as one icon with the count, the family balance as a
 * wallet), so Alerts is no longer a row; what's left is what the row lacks */
function v4HoverCard(p) {
  const ins = p.payer ? `<span class="inline-flex items-center gap-2">${DATA.payer(p.payer).short}${p.id === "p13" ? alertMark("Needs review", "Asha couldn't confirm this plan on Cigna's site. Check it before the visit.", { align: "start" }) : ""}</span>` : '<span class="text-gray-400">None on file</span>';
  return `<div class="w-[360px] ${R.popover}" role="dialog" aria-label="${esc(p.name)} preview">
    <div${chg4("The card starts with the one patient header: medical alerts are one icon with the count by the name (orange when someone must act first, like Premedicate) and the family balance a wallet with the amount, so the Alerts row is gone. The row already shows their picture, so the card doesn't repeat it")}>${patientHeader({ name: esc(p.name), sub: `${p.age} · DOB ${fmtDateY(p.dob)}`, alerts: p.alerts, familyBalance: p.balance, lead: "", end: iconButton("file-heart", "Open chart", { s: "iconSm" }) })}</div>
    <dl class="px-5 py-2">${[["Insurance", ins], [MONEY_LABEL.insEst, `<span class="tabular-nums">${money(p.insBalance)}</span>`]].map(([k, v]) => `<div class="grid grid-cols-[88px_1fr] items-center gap-x-3 min-h-8"><dt class="text-[13px] text-gray-500">${k}</dt><dd class="min-w-0 text-sm text-gray-800">${v}</dd></div>`).join("")}</dl></div>`;
}
function hoverCard(p) {
  if (V4) return v4HoverCard(p);
  if (V2) return v2HoverCard(p);
  const ins = p.payer ? `${DATA.payer(p.payer).short} ${statusDot(p.id === "p13" ? "Needs review" : "Verified", p.id === "p13" ? "needs" : "on", "!text-[13px] ms-1")}` : '<span class="text-gray-400">None on file</span>';
  const alerts = p.alerts.length ? `<span class="flex flex-wrap items-center gap-x-3 gap-y-1">${p.alerts.map((a) => (a === "Premedicate" ? flag(a, "!text-gray-800") : `<span class="text-sm text-gray-800">${esc(a)}</span>`)).join("")}</span>` : '<span class="text-gray-400">None</span>';
  return `<div class="w-[340px] ${R.popover}" role="dialog" aria-label="${esc(p.name)} preview">
    <div class="flex items-center gap-3 px-4 pt-3.5 pb-3 border-b border-gray-200/80">${avatar(p.name, { size: 9 })}<div class="min-w-0 grow"><p class="truncate text-sm font-medium text-gray-900">${esc(p.name)}</p><p class="${R.caption}">${p.age} · Chart ${chartNo(p)} · DOB ${fmtDateY(p.dob)}</p></div>${iconButton("file-heart", "Open chart", { s: "iconSm" })}</div>
    <dl class="px-4 py-2">${[["Next visit", p.next ? `${NEXT_TXT(p)} <span class="text-gray-500">· Op 1</span>` : '<span class="text-gray-400">Not scheduled</span>'], ["Insurance", ins], ["Balance", `<span class="tabular-nums">${money(p.balance)}</span> <span class="text-gray-500 tabular-nums">· ins. est. ${money(p.insBalance)}</span>`], ["Alerts", alerts]].map(([k, v]) => `<div class="grid grid-cols-[88px_1fr] items-center gap-x-3 min-h-8"><dt class="text-[13px] text-gray-500">${k}</dt><dd class="min-w-0 text-sm text-gray-800">${v}</dd></div>`).join("")}</dl></div>`;
}
/* v4 specimen: progressive disclosure. A panel's table shows what the frequent job needs; pointing at a row opens the
 * rest in the kit's peek card just left of the panel, and a click opens the whole record. Drawn with row 2's card open. */
const V4_PEEK_W = 420;
const v4StatesClaimPeek = (c) => peekCard(`${esc(DATA.patient(c.pt).name)}'s claim`, [["Service date", fmtDateY(c.svc)], ["Payer", DATA.payer(c.payer).name], ["Billed", `<span class="tabular-nums">${money(c.billed)}</span>`],
  ["Filing", c.filing <= 30 ? `<span class="inline-flex items-center gap-1">${I("circle-alert", "size-3.5 text-orange-500")}${c.filing} days left</span>` : `${c.filing} days left`]], "Click the name to open the claim.");
const v4StatesPeekRows = () => CL.filter((c) => ["info", "denied", "review", "partial", "payer"].includes(c.status)).slice(0, 5);
const V4_PEEK_RULES = [["In the row", "Only what the most frequent job needs: two to four columns, one value each."], ["On hover", "The rest of that row, in a card just left of the panel (or beside the row on a page)."],
  ["On click", "The whole record, in its panel or page."], ["Never hidden", "Every detail is one point or one click away; nothing is strung along one line."]];
function v4StatesPeek() {
  const rows = v4StatesPeekRows();
  const grid = sheetTable({ sheet: false, title: "Claims to follow up", rows, onOpen: () => {}, peek: v4StatesClaimPeek,
    columns: [{ key: "pt", label: "Patient", w: 150, grow: true, open: true, render: (c) => esc(DATA.patient(c.pt).name) }, { key: "status", label: "Status", w: 132, render: (c) => statusDot(...ST[c.status]) },
      { key: "billed", label: "Billed", w: 96, num: true, render: (c) => `<span class="tabular-nums">${money(c.billed)}</span>` }] });
  const panel = sheetPanel({ w: V4_PEEK_W, flush: true, title: "Claims to follow up", subtitle: `${rows.length} claims · Nina Flores`, body: psec("", `<div data-v4-peek-grid>${grid}</div>`) });
  return `<div${chg4("A specimen of the rule for the whole library: a table in a panel shows only what the frequent job needs, the rest of a row opens in a card just left of the panel when you point at it (drawn open for row 2), and a click opens the whole record")}>
    <p class="${R.eyebrow} mb-2">Details on hover, beside a panel</p>
    <div class="relative flex h-[340px] overflow-hidden ${R.box}" data-v4-peek-root>
      <ol class="min-w-0 grow space-y-3.5 px-6 py-5">${V4_PEEK_RULES.map(([t, d], i) => `<li class="flex gap-x-3"><span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white mt-px">${i + 1}</span><span><span class="block text-sm font-medium text-gray-800">${t}</span><span class="block ${R.help} max-w-[256px]">${d}</span></span></li>`).join("")}</ol>
      <div class="absolute z-20 w-72 rounded-xl border border-gray-200 bg-white p-3 text-[13px] text-gray-700 shadow-xl pointer-events-none" style="right:${V4_PEEK_W + 8}px;top:118px" role="tooltip" data-v4-peek-static>${v4StatesClaimPeek(rows[1])}</div>
      <div class="ms-auto h-full shrink-0">${panel}</div></div></div>`;
}
/* Line the drawn card up with row 2, and hide it while the live card follows the mouse */
function v4StatesPeekMount(el) {
  const root = el.querySelector("[data-v4-peek-root]"); if (!root) return; mountSheets(root);
  const card = root.querySelector("[data-v4-peek-static]"), host = root.querySelector("[data-v4-peek-grid]"), tr = host && host.querySelectorAll("tr.g-row")[1];
  const place = () => { if (tr && card && root.isConnected) card.style.top = `${Math.round(tr.getBoundingClientRect().top - root.getBoundingClientRect().top)}px`; };
  place(); requestAnimationFrame(place); setTimeout(place, 300);
  if (host && card) { host.addEventListener("mouseenter", () => (card.hidden = true)); host.addEventListener("mouseleave", () => (card.hidden = false)); }
}
const v4StatesHoverWrap = (top) => (V4 ? `<div class="space-y-8">${top}${v4StatesPeek()}</div>` : top);
defineBlock({
  cat: "states", id: "states-hover-info",
  title: "Hover card and info popover",
  note: "Resting on a patient's name shows a quick preview without opening anything. The (i) next to a setting explains it the way you'd tell a fifth grader. Hover other names to move the card.",
  where: "Charts list · any settings row",
  canvas: "gray",
  html: () => v4StatesHoverWrap(`<div class="grid grid-cols-[minmax(0,1fr)_360px] gap-8 items-start h-[390px]" data-hover-root>
    <div class="min-w-0"><p class="${R.eyebrow} mb-2">Hover card on a row</p>
      <div class="relative ${R.box} overflow-visible">
        <table class="w-full table-fixed border-separate border-spacing-0"><colgroup><col style="width:200px"><col style="width:96px"><col><col style="width:110px"></colgroup>
          <thead><tr>${["Patient", "Chart #", "Next appt", "Balance"].map((h, i) => `<th class="${R.tHead} ${i === 3 ? "text-end" : ""}">${h}</th>`).join("")}</tr></thead>
          <tbody>${HOVER_PTS.map((id, i) => { const p = DATA.patient(id); return `<tr data-row="${id}" class="${i === 0 ? "bg-gray-50" : ""}"><td class="${R.tCell} ${i === HOVER_PTS.length - 1 ? "!border-b-0" : ""}"><span class="inline-flex items-center gap-x-2.5" data-name="${id}" tabindex="0">${avatar(p.name, { size: 5 })}<span class="font-medium underline decoration-gray-300 decoration-dotted underline-offset-4 cursor-default">${esc(p.name)}</span></span></td>
            <td class="${R.tCell} tabular-nums text-gray-600 ${i === HOVER_PTS.length - 1 ? "!border-b-0" : ""}">${chartNo(p)}</td><td class="${R.tCell} ${i === HOVER_PTS.length - 1 ? "!border-b-0" : ""}">${p.next ? NEXT_TXT(p) : '<span class="text-gray-400">None</span>'}</td><td class="${R.tCell} text-end tabular-nums ${i === HOVER_PTS.length - 1 ? "!border-b-0" : ""}">${money(p.balance)}</td></tr>`; }).join("")}</tbody></table>
        <div class="absolute start-[60px] z-10" style="top:78px" data-card>${hoverCard(DATA.patient(HOVER_PTS[0]))}</div>
      </div></div>
    <div><p class="${R.eyebrow} mb-2">Info popover on a setting</p>
      <div class="relative ${R.box}">
        <div class="flex items-center justify-between gap-6 px-4 py-3 min-h-11"><div><p class="${R.label} flex items-center gap-1.5">Text appointment reminders <button type="button" class="rounded-full text-blue-600 cursor-pointer" aria-label="What this does" aria-expanded="true">${I("info", "size-3.5")}</button></p><p class="${R.help}">Two days before each visit.</p></div>${sw(true, "Text appointment reminders")}</div>
        <div class="flex items-center justify-between gap-6 px-4 py-3 min-h-11 border-t border-gray-200/80"><div><p class="${R.label} flex items-center gap-1.5">Ask patients to confirm ${I("info", "size-3.5 text-gray-400")}</p><p class="${R.help}">Reply C to confirm.</p></div>${sw(true, "Ask patients to confirm")}</div>
        <div class="absolute start-3 top-[62px] z-10 w-[334px] max-w-[calc(100%-24px)] ${R.popover} p-4" role="tooltip">
          <p class="text-sm font-semibold text-gray-800">What this does</p>
          <p class="text-[13px] leading-5 text-gray-600 mt-1">Two days before a visit, we text the patient the day, the time and your address. If they don't answer, we send one more text the morning before.</p>
          <p class="text-[13px] leading-5 text-gray-600 mt-2">Patients who said no to texts get an email instead.</p>
          <div class="mt-3">${button("See the text patients get", { v: "link", s: "sm", iconEnd: "arrow-right" })}</div></div>
      </div></div></div>`),
  mount: (el) => {
    if (V4) v4StatesPeekMount(el);
    const root = el.querySelector("[data-hover-root]"); if (!root) return;
    const card = root.querySelector("[data-card]");
    const show = (target) => { const id = target.dataset.name, tr = target.closest("tr"), box = tr.closest(".relative");
      root.querySelectorAll("[data-row]").forEach((r) => r.classList.toggle("bg-gray-50", r === tr));
      card.innerHTML = hoverCard(DATA.patient(id)); icons();
      const top = tr.getBoundingClientRect().bottom - box.getBoundingClientRect().top + 2; card.style.top = `${Math.min(top, box.clientHeight - card.offsetHeight + 120)}px`; };
    root.addEventListener("mouseover", (e) => { const t = e.target.closest("[data-name]"); if (t) show(t); });
    root.addEventListener("focusin", (e) => { const t = e.target.closest("[data-name]"); if (t) show(t); });
  }
});

/* ============================================================ 8. Toasts, save status and pending changes */
const saveLine = (st, why = "") => st === "saving" ? `<span class="inline-flex items-center gap-1 text-xs font-normal text-gray-500" role="status">Saving…</span>`
  : st === "saved" ? `<span class="inline-flex items-center gap-1 text-xs font-normal text-gray-500 asha-reveal" role="status">${I("check", "size-3.5")}Saved</span>`
  : `<span class="inline-flex items-center gap-1 text-xs font-normal text-orange-700" role="status">${I("circle-alert", "size-3.5 text-orange-500")}Couldn't save${why ? `. ${why}` : ""}</span>`;
const PHONE_ROWS = [["Main line", "(925) 555-0100", "Ring front desk", "Ring front desk, then Asha", true], ["After hours", "(925) 555-0100", "Voicemail", "Asha answers", true], ["Billing line", "(925) 555-0142", "Nina Flores", "Nina Flores", false], ["Fax", "(925) 555-0149", "Fax inbox", "Fax inbox", false], ["Text line", "(925) 555-0150", "Messaging", "Messaging and Asha", true]];
/* v2 quiet edits: a changed value looks like any value (no dot, no strikethrough, no "not saved" text); the bar is just
 * Discard and Save, and it goes away once you save or discard */
function v2PendingList(mode = "pending") {
  const discarded = mode === "discarded", n = PHONE_ROWS.filter((r) => r[4]).length;
  return `<div${chg("Edited values look like values: no blue dot, no struck-through old value")}><table class="w-full border-separate border-spacing-0"><thead><tr><th class="${R.tHead}">Number</th><th class="${R.tHead}">When a call comes in</th></tr></thead>
    <tbody>${PHONE_ROWS.map(([l, num, was, now, changed]) => `<tr><td class="${R.tCell}"><span class="font-medium">${l}</span> <span class="text-gray-500 tabular-nums">${num}</span></td><td class="${R.tCell}">${changed && !discarded ? now : was}</td></tr>`).join("")}</tbody></table></div>
    ${mode === "pending" ? `<div class="mt-3 flex items-center justify-end gap-2" data-bar${chg("The bar is just Discard and Save 3 changes, with no dot or \"3 changes not saved\" text")}>${button("Discard", { v: "quiet", s: "sm", attrs: 'data-act="discard"' })}${button(`Save ${n} changes`, { v: "solid", s: "sm", attrs: 'data-act="save"' })}</div>` : ""}`;
}
function pendingList(mode = "pending") {
  if (V2) return v2PendingList(mode);
  const saved = mode !== "pending", discarded = mode === "discarded";
  const n = PHONE_ROWS.filter((r) => r[4]).length;
  return `<div class="${R.box} overflow-hidden"><table class="w-full border-separate border-spacing-0"><thead><tr><th class="${R.tHead}">Number</th><th class="${R.tHead}">When a call comes in</th></tr></thead>
    <tbody>${PHONE_ROWS.map(([l, num, was, now, changed]) => `<tr><td class="${R.tCell}"><span class="font-medium">${l}</span> <span class="text-gray-500 tabular-nums">${num}</span></td><td class="${R.tCell}"><span class="inline-flex items-center gap-2">${changed && !saved ? `<span class="size-1.5 rounded-full bg-blue-600" aria-hidden="true"></span><span class="sr-only">Changed: </span>` : ""}${changed && !discarded ? now : was}${changed && !saved ? `<span class="text-xs text-gray-400 line-through">${was}</span>` : ""}</span></td></tr>`).join("")}</tbody></table>
    <div class="flex items-center gap-2 px-3 min-h-11" data-bar>${saved ? `<span class="inline-flex items-center gap-1.5 text-[13px] text-gray-500 asha-reveal">${discarded ? `${I("undo-2", "size-3.5")}Changes discarded` : `${I("check", "size-3.5")}Saved ${n} changes`}</span>` : `<span class="size-2 shrink-0 rounded-full bg-blue-600" aria-hidden="true"></span><span class="text-[13px] text-gray-700" role="status">${n} changes not saved</span>
      <span class="ms-auto flex items-center gap-2">${button("Discard", { v: "ghost", s: "sm", attrs: 'data-act="discard"' })}${button(`Save ${n} changes`, { v: "solid", s: "sm", attrs: 'data-act="save"' })}</span>`}</div></div>`;
}
/* v4: a record's fields as a table you type into; saves are silent, a failed one keeps an orange mark with a retry */
const v4NpiWhy = (v) => (/^\d{10}$/.test(String(v)) ? null : `An NPI has 10 digits, and this one has ${String(v).replace(/\D/g, "").length}.`);
const v4SaveRows = () => [{ label: "Billing name", value: "Bayview Family Dental" }, { label: "Billing NPI", value: "123456789" }, { label: "Tax ID", value: "" },
  { label: "Statements go out by", value: "Text and email", type: "select", options: ["Text and email", "Email only", "Mail"] }];
const v4SaveCheck = (r, k, v) => (r.label === "Billing NPI" ? v4NpiWhy(v) : null);
const toast = (icon, text, action = "", cls = "") => V4 ? alertCard({ lead: icon.replace("text-white/60", "text-gray-400").replace("text-blue-300", "text-blue-600").replace("text-red-400", "text-red-600"), title: text, action: (action.match(/>([^<>]+)<\/button>/) || [])[1] || "", attrs: chg4("Toasts are the light, frosted, Mac-style card Asha's notifications use, not a dark slab: soft shadow, the close circle on the corner on hover, quiet text actions.") }) : `<div class="${R.toast} ${cls}" role="status">${icon}<span class="grow min-w-0">${text}</span>${action}<button type="button" class="${cx(R.btn, R.xs, R.iconXs, R.onDark, "!text-white/60")}" aria-label="Dismiss">${I("x")}</button></div>`;
defineBlock({
  cat: "states", id: "states-toasts-save",
  title: "Save status, pending changes and toasts",
  note: "Settings that save themselves say so quietly on the row: \"Saving…\", then \"✓ Saved\", or \"Couldn't save\" with the reason. Edits that must go out together wait in a pending bar. Toasts are only for things you did that aren't on screen. Flip the switch and try the bar.",
  where: "Settings rows, lists, anywhere after an action",
  canvas: "gray",
  html: () => `<div class="grid grid-cols-[minmax(0,1fr)_380px] gap-8 items-start" data-save-root>
    <div class="min-w-0 space-y-7">
      <section><h2 class="${R.groupTitle} mb-2">Save status on a row</h2>
        <div class="${R.box} divide-y divide-gray-200/80">
          <div class="flex items-center justify-between gap-6 px-4 py-3 min-h-11"><div><p class="${R.label} flex items-center gap-2">Text appointment reminders <span data-save="a">${saveLine("saving")}</span></p><p class="${R.help}">Two days before each visit.</p></div>${sw(true, "Text appointment reminders").replace('data-act="switch"', 'data-act="switch" data-autosave="a"')}</div>
          <div class="flex items-center justify-between gap-6 px-4 py-3 min-h-11"><div><p class="${R.label} flex items-center gap-2">Remind again ${V2 ? `<span data-save="b"${chg("\"Saved\" fades away after a moment, and \"Saving…\" only shows when a save takes longer than about half a second")}>${saveLine("saved")}</span>` : saveLine("saved")}</p><p class="${R.help}">If they haven't confirmed.</p></div><button type="button" class="${R.select} !w-44">Morning before${I("chevrons-up-down")}</button></div>
          ${V2 ? `<div class="flex items-center justify-between gap-6 px-4 py-3 min-h-11"><div class="min-w-0"><p class="${R.label}">Billing NPI</p><p class="${R.help}">The 10-digit number printed on your claims.</p></div>
            <div class="flex items-center gap-3 shrink-0"><span class="inline-flex"${chg("A failed save is a small orange mark before the field, with the reason on hover; the row keeps its own help line")}>${alertMark("Couldn't save", "An NPI has 10 digits, and this one has 9.")}</span><input class="${R.inputBad} !w-40 tabular-nums" value="123456789" aria-label="Billing NPI" aria-invalid="true" />${button("Save", { v: "white", s: "md" })}</div></div>` : `<div class="flex items-center justify-between gap-6 px-4 py-3 min-h-11"><div class="min-w-0"><p class="${R.label} flex items-center gap-2">Billing NPI ${saveLine("error")}</p><p class="${R.help}">An NPI has 10 digits, and this one has 9.</p></div>
            <div class="flex items-center gap-2 shrink-0"><input class="${R.inputBad} !w-40 tabular-nums" value="123456789" aria-label="Billing NPI" aria-invalid="true" />${button("Save", { v: "white", s: "md" })}</div></div>`}
        </div></section>
      <section><h2 class="${R.groupTitle} mb-2">Pending changes</h2><div data-pending${V2 ? ' class="[&_.g-wrap]:bg-white"' : ""}>${pendingList()}</div></section>${V4 ? `
      <section data-v4-save><h2 class="${R.groupTitle} mb-2">Typing into a table</h2><div${chg4("Tables you type into save each cell on its own, silently, with no Saving… or Saved words; a cell that couldn't save keeps your value with a small orange mark (hover says why, click tries again), and an empty cell is a grey Add prompt")}>${fieldTable(v4SaveRows(), { title: "Billing details", labelW: 160, onCommit: v4SaveCheck })}</div>
        <p class="mt-2 ${R.help}">Click a value and type, or pick from the list. Enter saves and moves down.</p></section>` : ""}
    </div>
    <section><h2 class="${R.groupTitle} mb-2">Toasts</h2>
      ${V2 ? `<div class="space-y-2.5"${chg("Only two kinds of toast: Undo after deleting, and a job still running off-screen. Routine successes and a failed text (which shows on its own message) no longer toast")}>
        ${toast(I("trash-2", "size-4 shrink-0 text-white/60"), "Deleted 3 tasks", button("Undo", { v: "onDark", s: "xs" }))}
        ${toast(I("loader-circle", "size-4 shrink-0 text-white/60 motion-safe:animate-spin"), "Sending 12 statements…", "")}
      </div>
      <p class="mt-4"${chg("The note matches the rule: toasts start at the top-right corner")}>${note("Toasts start at the top-right corner and leave after 4 seconds. A setting that saved itself never gets one, and a text that couldn't send shows an orange mark on that message instead.", "info")}</p>` : `<div class="space-y-2.5">
        ${toast(I("circle-check", "size-4 shrink-0 text-blue-300"), "Claim sent to MetLife", button("Undo", { v: "onDark", s: "xs" }))}
        ${toast(I("circle-check", "size-4 shrink-0 text-blue-300"), `Payment of ${money(184)} recorded for Ava Thompson`, button("Receipt", { v: "onDark", s: "xs" }))}
        ${toast(I("loader-circle", "size-4 shrink-0 text-white/60 motion-safe:animate-spin"), "Sending 12 statements…", "")}
        ${toast(I("circle-x", "size-4 shrink-0 text-red-400"), "Couldn't text (415) 555-0132. That number can't get texts.", button("Edit", { v: "onDark", s: "xs" }))}
      </div>
      <p class="mt-4">${note("Toasts sit bottom-left for 5 seconds and pause while you hover. Errors stay until you close them. A setting that saved itself never gets a toast.", "info")}</p>`}
      <div class="mt-6" data-toast-slot></div>
    </section></div>`,
  mount: (el) => {
    const root = el.querySelector("[data-save-root]"); if (!root) return;
    if (V4) { mountSheets(root); const g = root.querySelector("[data-v4-save] [data-sheet-host]")?._grid; if (g) { g.failed.set("f1:value", v4NpiWhy("123456789")); g.render(); } }
    if (V2) {
      /* "Saved" fades after 1.5s; a fast save (under 600ms) never shows "Saving…" */
      const fade = (slot) => { clearTimeout(slot._f); slot._f = setTimeout(() => { const t = slot.firstElementChild; if (!t) return; t.style.transition = "opacity .3s"; t.style.opacity = "0"; setTimeout(() => { slot.innerHTML = ""; }, 300); }, 1500); };
      fade(root.querySelector('[data-save="b"]'));
      root.addEventListener("click", (e) => {
        const s = e.target.closest("[data-autosave]");
        if (s) { const slot = root.querySelector(`[data-save="${s.dataset.autosave}"]`); slot.innerHTML = ""; clearTimeout(slot._f); clearTimeout(root._t); clearTimeout(root._slow);
          root._slow = setTimeout(() => { slot.innerHTML = saveLine("saving"); }, 600);
          root._t = setTimeout(() => { clearTimeout(root._slow); slot.innerHTML = saveLine("saved"); icons(); fade(slot); }, 400); }
        const a = e.target.closest('[data-act="save"],[data-act="discard"]');
        if (a) { const box = root.querySelector("[data-pending]"); box.innerHTML = pendingList(a.dataset.act === "save" ? "saved" : "discarded"); icons(); }
      });
      return;
    }
    root.addEventListener("click", (e) => {
      const s = e.target.closest("[data-autosave]");
      if (s) { const slot = root.querySelector(`[data-save="${s.dataset.autosave}"]`); slot.innerHTML = saveLine("saving"); clearTimeout(root._t);
        root._t = setTimeout(() => { slot.innerHTML = saveLine("saved"); icons(); }, 700); }
      const a = e.target.closest('[data-act="save"],[data-act="discard"]');
      if (a) { const box = root.querySelector("[data-pending]"), save = a.dataset.act === "save";
        a.closest("[data-bar]").innerHTML = `<span class="inline-flex items-center gap-1.5 text-[13px] text-gray-500">${save ? "Saving…" : ""}</span>`;
        setTimeout(() => { box.innerHTML = pendingList(save ? "saved" : "discarded"); icons(); }, save ? 700 : 0); }
    });
  }
});

})();
