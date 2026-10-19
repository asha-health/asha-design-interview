/* Patients blocks. Sources: routes/practice/charts (ChartsView, NewPatientSheet, components/PatientChartDetail) — the
 * patient list, chart header and tabs, Overview, Family, Insurance and Medical Hx (INVENTORY.md §3). */
(() => {

/* ---------- shared patient facts ---------- */
const CHART_NO = { p1: 10012, p2: 10018, p3: 10023, p4: 10024, p5: 10045, p6: 10051, p7: 10058, p8: 10063, p9: 10107, p10: 10071, p11: 10072, p12: 10073, p13: 10079, p14: 10084, p15: 10090 };
const PRIMARY = { p1: "pr1", p2: "pr1", p3: "pr2", p4: "pr2", p5: "pr1", p6: "pr2", p7: "pr1", p8: "pr1", p9: "pr2", p10: "pr2", p11: "pr2", p12: "pr2", p13: "pr1", p14: "pr2", p15: "pr1" };
const INACTIVE = new Set(["p15"]);
const statusOf = (p) => (INACTIVE.has(p.id) ? "inactive" : !p.lastVisit ? "new" : "active");
const PT_STATUS = { active: { label: "Active", tone: "on" }, new: { label: "New", tone: "mid" }, inactive: { label: "Inactive", tone: "off" } };
const time12 = (hm) => { const [h, m] = hm.split(":").map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };
const nextLabel = (iso) => { if (!iso) return null; const [d, t] = iso.split("T");
  return d === TODAY ? `Today · ${time12(t)}` : `${fmtDate(d)} · ${time12(t)}`; };
const isPremed = (a) => /premedicate/i.test(a);
const alertIcon = (a) => (/allergy/i.test(a) ? "pill" : /heart|blood/i.test(a) ? "heart-pulse" : /diabet/i.test(a) ? "droplet" : "info");
/* An alert chip: orange icon only where a person must act (Premedicate); everything else grey */
const byUrgency = (list) => [...list].sort((a, b) => isPremed(b) - isPremed(a));
const alertChip = (a) => `<span class="${cx(R.tag, R.tagOutline)}">${I(isPremed(a) ? "circle-alert" : alertIcon(a), `size-3.5 ${isPremed(a) ? "text-orange-500" : "text-gray-500"}`)}${esc(a)}</span>`;

/* ================================================================ 1. Patient list (Charts) */
/* The kit Grid's search box is 192px; this list's real placeholder needs more room */
class WideSearchGrid extends Grid { toolbar() { return super.toolbar().replace("relative w-48 shrink-0", "relative w-72 shrink-0"); } }
const listRows = () => DATA.patients.map((p) => ({ ...p, chart: CHART_NO[p.id], st: statusOf(p), prov: PRIMARY[p.id] }));
/* v2: empty cells stay blank (no "None", "$0.00", "None scheduled"), and Status shows only when it isn't Active */
const blank = (v1html) => (V2 && !V4 ? "" : v1html); // v4: no patchy columns
const ptCols = () => [
  { key: "name", label: "Patient", icon: "user", w: 196, open: true, kind: "text", lead: (r) => avatar(r.name, { size: 5 }), render: (r) => esc(r.name) },
  { key: "chart", label: "Chart #", icon: "hash", w: 100, kind: "num", render: (r) => `<span class="tabular-nums text-gray-600">${r.chart}</span>` },
  { key: "st", label: V2 ? `<span${chg("Status shows only when it isn't Active, so the New and Inactive patients stand out (it said Active on 13 of 15 rows).")}>Status</span>` : "Status", icon: "circle-dot", w: 108, kind: "text", normal: ["Active"], value: (r) => PT_STATUS[r.st].label, render: (r) => statusDot(PT_STATUS[r.st].label, PT_STATUS[r.st].tone) },
  { key: "prov", label: "Provider", icon: "stethoscope", w: 116, kind: "text", value: (r) => DATA.provider(r.prov).short, render: (r) => esc(DATA.provider(r.prov).short) },
  { key: "lastVisit", label: V4 ? `<span${chg4("Every column has a value on every row: no visits yet reads a grey dash, and a zero balance, no next visit and no alerts read $0.00, None scheduled and None instead of blank cells.")}>Last Visit</span>` : "Last Visit", icon: "calendar", w: 120, kind: "date", render: (r) => (r.lastVisit ? fmtDateY(r.lastVisit) : V4 ? `<span class="text-gray-400">—</span>` : blank(`<span class="text-gray-400">No visits yet</span>`)) },
  { key: "next", label: "Next appt", icon: "calendar-clock", w: 150, kind: "date", value: (r) => r.next || "", render: (r) => (r.next ? `<span class="tabular-nums">${nextLabel(r.next)}</span>` : blank(`<span class="text-gray-400">None scheduled</span>`)) },
  { key: "balance", label: V2 ? `<span${chg("Empty cells are blank instead of $0.00, None, None scheduled and No visits yet, so the balances and alerts that exist are what the eye follows down the column.")}>Balance</span>` : "Balance", icon: "wallet", w: 108, num: true, kind: "money", render: (r) => (r.balance ? money(r.balance) : blank(`<span class="text-gray-400">$0.00</span>`)) },
  { key: "alerts", label: "Alerts", icon: "triangle-alert", w: 160, kind: "list", value: (r) => r.alerts.join(", "), render: (r) => { if (!r.alerts.length) return blank(`<span class="text-gray-400">None</span>`);
    const first = r.alerts.find(isPremed) || r.alerts[0], rest = r.alerts.length - 1;
    return `${isPremed(first) ? flag(esc(first), "!text-gray-800") : `<span class="inline-flex items-center gap-x-1.5 max-w-full align-middle">${I(alertIcon(first), "size-3.5 shrink-0 text-gray-400")}<span class="truncate">${esc(first)}</span></span>`}${rest ? ` <span class="text-xs text-gray-500">+${rest}</span>` : ""}`; } }
];
function openPatientSheet(p) {
  const payer = p.payer ? DATA.payer(p.payer) : null, st = PT_STATUS[statusOf(p)];
  const statusBtn = `<button type="button" class="${cx(R.btn, R.sm, R.white, "!ps-2.5")}" aria-haspopup="menu" aria-label="Change patient status"><span class="${cx(R.dot, TONE_DOT[st.tone])}"></span>${st.label}${I("chevron-down", "!text-gray-400")}</button>`;
  const insRow = payer ? `<button type="button" class="group -mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-1.5 text-start hover:bg-gray-50 cursor-pointer" aria-label="View benefits">
      <div class="min-w-0 grow"><p class="text-sm text-gray-800">${esc(payer.name)} <span class="text-gray-500">· Primary</span></p><p class="${R.help}">Checked Sep 24</p></div>
      ${statusDot("Verified", "on")}${I("chevron-right", "size-4 shrink-0 text-gray-400 group-hover:text-gray-600")}</button>`
    : infoRow("shield-alert", "No insurance on file. Add it before the visit so we can estimate costs.", { tone: "needs" });
  /* v4: the one patient header (what patientHeader draws: avatar, name, alerts and family balance as marks) */
  if (V4) return Sheet.open({
    flush: true,
    title: `<span${chg4("The preview has the patient's one header: alerts are one icon with the count by her name (hover lists them) and the family balance is the wallet, so the Alerts list is gone.")}>${esc(p.name)}</span>`, lead: avatar(p.name, { size: 9 }), subtitle: `${p.age} y · DOB ${fmtDateY(p.dob)} · Chart #${CHART_NO[p.id]}`,
    marks: patientMarks({ alerts: p.alerts, familyBalance: DATA.patients.filter((x) => x.family === p.family).reduce((a, x) => a + (x.balance || 0), 0), newPatient: !p.lastVisit }),
    actions: iconButton("link", "Copy chart link", { s: "iconSm" }),
    body: `${psec("", `<div${chg4("Status is the first line of the patient's facts, and the facts are a table you type into; the status row is gone.")}>${fieldTable(v4PtFacts(p), { labelW: 136, title: "Patient" })}</div>`)}
      ${psec("Insurance", `<div class="${payer ? "" : "-my-1.5"}">${insRow}</div>`, { actions: payer ? "" : button("Add insurance", { v: "white", s: "xs", icon: "plus" }) })}
      ${psec("Balance and visits", metaGrid([["Patient", `<span class="tabular-nums">${money(p.balance)}</span>`], ["Ins. est.", `<span class="tabular-nums">${money(p.insBalance)}</span>`], ["Next appt", p.next ? nextLabel(p.next) : '<span class="text-gray-400">None scheduled</span>']]))}`,
    footer: `${button("Schedule", { v: "white", s: "sm", icon: "calendar-plus" })}${button("Open chart", { v: "solid", s: "sm" })}`
  });
  Sheet.open({
    flush: true,
    title: esc(p.name), lead: avatar(p.name, { size: 9 }), subtitle: `${p.age} y · DOB ${fmtDateY(p.dob)} · Chart #${CHART_NO[p.id]}`,
    actions: iconButton("link", "Copy chart link", { s: "iconSm" }),
    body: `<section class="${R.psec} flex items-center justify-between gap-3 !py-3">${statusBtn}<span class="text-[13px] text-gray-500">${p.lastVisit ? `Last visit ${fmtDateY(p.lastVisit)}` : "No visits yet"}</span></section>
      ${p.alerts.length ? psec("Alerts", `<div class="-my-1.5">${byUrgency(p.alerts).map((a) => infoRow(isPremed(a) ? "circle-alert" : alertIcon(a), esc(a), { tone: isPremed(a) ? "needs" : "gray" })).join("")}</div>`, { count: p.alerts.length }) : ""}
      ${psec("Contact", metaGrid([["Cell Phone", `<span class="tabular-nums">${p.phone}</span>`], ["Preferred Contact", "Text message"], ["Family", `${esc(p.family)} family`], ["Family role", p.guarantor ? "Guarantor" : "Member"]], 2))}
      ${psec("Insurance", `<div class="${payer ? "" : "-my-1.5"}">${insRow}</div>`, { actions: payer ? "" : button("Add insurance", { v: "white", s: "xs", icon: "plus" }) })}
      ${psec("Balance and visits", metaGrid([["Patient", `<span class="tabular-nums">${money(p.balance)}</span>`], ["Ins. est.", `<span class="tabular-nums">${money(p.insBalance)}</span>`], ["Next appt", p.next ? nextLabel(p.next) : '<span class="text-gray-400">None scheduled</span>']]))}`,
    footer: `${button("Schedule", { v: "white", s: "sm", icon: "calendar-plus" })}${button("Open chart", { v: "solid", s: "sm" })}`
  });
}
/* v4: the patient's facts as a table you type into, with Status (and when they were last seen) as its first line */
function v4PtFacts(p) {
  const st = PT_STATUS[statusOf(p)].label, seen = p.lastVisit ? `last visit ${fmtDateY(p.lastVisit)}` : "no visits yet";
  const dot = (v) => `<span class="${cx(R.dot, TONE_DOT[(Object.values(PT_STATUS).find((x) => x.label === v) || PT_STATUS.inactive).tone])}"></span>`;
  return [{ label: "Status", value: st, type: "select", options: Object.values(PT_STATUS).map((x) => x.label),
      html: (r) => `<span class="inline-flex items-center gap-2 min-w-0">${dot(r.value)}${esc(r.value)}${r.value === st ? `<span class="text-gray-500 truncate">· ${seen}</span>` : ""}</span>` },
    { label: "Cell phone", value: p.phone, html: (r) => `<span class="tabular-nums">${esc(r.value)}</span>` },
    { label: "Preferred contact", value: "Text message", type: "select", options: ["Text message", "Phone call", "Email"] },
    { label: "Family", value: `${p.family} family`, type: "none" }, { label: "Family role", value: p.guarantor ? "Guarantor" : "Member", type: "select", options: ["Guarantor", "Contact", "Member"] }];
}
/* v2 loading: the real grid (same toolbar, columns, widths, checkbox column and 36px rows) with grey bars in the cells,
 * so nothing moves when the patients land. Grid.skeleton in the kit would do this for every list. */
function v2PtSkeleton(host, o) {
  const bar = (r, c, num) => `<span class="block h-3 ${num ? "ms-auto" : ""} ${R.skel}" style="width:${[70, 45, 60, 35, 55, 40][(r + c) % 6]}%"${r === 0 && c === 1 ? chg("Loading draws the real toolbar, columns and row height with grey bars, so nothing jumps when the list arrives.") : ""}></span>`;
  const columns = o.columns.map((c, ci) => ({ ...c, open: false, lead: c.lead ? () => `<span class="size-5 shrink-0 ${R.skel} !rounded-full"></span>` : undefined, render: (r) => bar(r.id, ci, c.num), normal: null }));
  new Grid(host, { ...o, columns, rows: Array.from({ length: 8 }, (_, i) => ({ id: i })), footer: false, onOpen: null });
  host.querySelectorAll('tbody [data-act="sel"]').forEach((cb) => cb.replaceWith(Object.assign(document.createElement("span"), { className: `size-4 shrink-0 rounded-[4px] ${R.skel}` })));
}
const listHeader = () => workspaceHeader({ parent: "PMS", title: "Charts", actions: `${button("Import patients", { v: "quiet", s: "sm", icon: "upload" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` });
/* v2: the tabs are the one place that says which list; Providers and Last visit move into the grid's toolbar */
const ptPickers = () => `${button("Providers", { v: "white", s: "sm", icon: "stethoscope", iconEnd: "chevron-down", cls: "[&_svg:last-child]:text-gray-400" })}${button("Last visit", { v: "white", s: "sm", icon: "calendar", iconEnd: "chevron-down", cls: "[&_svg:last-child]:text-gray-400" })}`;
const listTabs = (n) => V2 ? tabsWithSlot([["All patients", n], "Active", "New this month", "Inactive"], 0, "") : tabsWithSlot([["All patients", n], "Active", "New this month", "Inactive"], 0, `${button("Providers", { v: "white", s: "sm", icon: "stethoscope", iconEnd: "chevron-down", cls: "[&_svg:last-child]:text-gray-400" })}${button("Last visit", { v: "white", s: "sm", icon: "calendar", iconEnd: "chevron-down", cls: "[&_svg:last-child]:text-gray-400" })}`);
defineBlock({
  cat: "patients", id: "patients-list", thumb: true,
  title: "Patient list",
  note: V2 ? "The Charts page: one bar, the tabs, then the patient grid with search, Providers and Last visit in its toolbar. Empty cells stay blank and Status shows only when it isn't Active. Premedicate is the only alert in orange, because someone has to act on it. Click a name to preview the patient." : "The Charts page: one bar, then tabs with the provider and last-visit pickers on the right, then the patient grid. Search by name, birthday or chart number. Premedicate is the only alert in orange, because someone has to act on it. Click a name to preview the patient.",
  where: "PMS › Charts",
  states: ["Normal", "Empty", "Loading"],
  canvas: "bare",
  html: (state) => `${listHeader()}${listTabs(state === "Empty" ? 0 : V2 && state === "Loading" ? null : DATA.patients.length)}
    <div class="px-4 pb-4">${state === "Loading" && !V2 ? `<div class="py-2.5 flex gap-2">${skel("w-40", "h-8")}${skel("w-64", "h-8")}</div>${gridSkeleton(["Patient", "Chart #", "Status", "Provider", "Last Visit", "Next appt", "Balance"], 8)}` : '<div data-grid="patients"></div>'}</div>`,
  mount: (el, state) => {
    const host = el.querySelector('[data-grid="patients"]'); if (!host) return;
    const o = {
      columns: ptCols(), addColumn: false, rows: state === "Empty" ? [] : listRows(), title: "All patients", searchPlaceholder: "Search by name, DOB, or chart number…", maxHeight: 620,
      defaultSort: { key: "name", dir: 1 }, calc: { balance: "sum" },
      searchText: (r) => `${r.name} ${r.dob} ${fmtDateY(r.dob)} ${r.chart}`,
      filters: [{ key: "st", label: "Status", options: Object.entries(PT_STATUS).map(([value, s]) => ({ value, label: s.label, tone: s.tone })) }, { key: "prov", label: "Provider", options: DATA.providers.slice(0, 2).map((p) => ({ value: p.id, label: p.name })) }],
      primary: { label: "New patient", icon: "user-plus" },
      empty: { icon: "users", title: "No patients yet", body: "Import them from your old practice software, or add the first one by hand.", action: "Add a patient" },
      bulk: [{ label: "Text", icon: "message-square" }, { label: "Add to list", icon: "list-plus" }, { label: "Export", icon: "download" }],
      onOpen: openPatientSheet
    };
    if (!V2) return new WideSearchGrid(host, o);
    Object.assign(o, { viewButton: false, noun: "patients", searchWidth: "w-80",
      toolbarExtra: `<span class="flex items-center gap-1.5"${chg("Providers and Last visit sit in the grid's toolbar next to search, and the toolbar no longer repeats “All patients 15” from the tab above it.")}>${ptPickers()}</span>`,
      empty: { ...o.empty, action: "New patient" } });
    if (state === "Loading") return v2PtSkeleton(host, o);
    new Grid(host, o);
  }
});

/* ================================================================ 2. Chart header and tabs */
const CHART_TABS = [["Overview"], ["Charting"], ["Family", 1], ["Insurance"], ["Medical Hx"], ["Appts", 3], ["Billing"], ["TX plans", 2], ["Notes"], ["Images"], ["Forms"], ["Docs"], ["Comms"]];
const fact = (label, value, sub = "") => `<div class="min-w-0 px-4 first:ps-0"><p class="text-xs text-gray-500">${label}</p><p class="mt-0.5 text-sm font-medium text-gray-800 tabular-nums truncate">${value}</p>${sub ? `<p class="text-xs text-gray-500 truncate">${sub}</p>` : ""}</div>`;
function chartHeader(state) {
  if (state === "Loading") return `<div class="px-5 py-4 flex items-start gap-4"><span class="size-12 shrink-0 ${R.skel} !rounded-full"></span><div class="space-y-2 grow">${skel("w-48", "h-5")}${skel("w-72")}<div class="flex gap-1.5 pt-1">${skel("w-24", "h-[22px]")}${skel("w-28", "h-[22px]")}</div></div><div class="flex gap-2">${skel("w-24", "h-8")}${skel("w-20", "h-8")}${skel("w-36", "h-8")}</div></div>
    <div class="mx-5 grid grid-cols-5 gap-4 rounded-lg border border-gray-200/80 px-4 py-3">${Array.from({ length: 5 }, () => `<div class="space-y-1.5">${skel("w-16", "h-3")}${skel("w-24", "h-4")}</div>`).join("")}</div>`;
  const np = state === "New patient";
  const p = DATA.patient(np ? "p9" : "p5");
  return `<div class="px-5 pt-4 pb-3.5 flex items-start gap-4">
      ${avatar(p.name, { size: 12 })}
      <div class="min-w-0 grow">
        <div class="flex items-center gap-2"><h1 class="text-xl font-semibold tracking-tight text-gray-800">${p.name}</h1>${np ? tag("New patient", "tagOutline") : ""}${iconButton("copy", "Copy chart link", { s: "iconXs" })}</div>
        <p class="text-[13px] text-gray-500 tabular-nums">${p.age} y · DOB ${fmtDateY(p.dob)} · Chart #${CHART_NO[p.id]} · ${p.phone}</p>
        <div class="mt-2 flex flex-wrap items-center gap-1.5">${p.alerts.length ? byUrgency(p.alerts).map(alertChip).join("") : `<span class="text-[13px] text-gray-400">No alerts</span>`}${button("Manage patient alerts", { v: "link", s: "xs", cls: "ms-1" })}</div>
      </div>
      <div class="flex items-center gap-1.5 shrink-0">${button("Schedule", { v: "white", s: "sm", icon: "calendar-plus" })}${button("Text", { v: "white", s: "sm", icon: "message-square" })}${button("Collect payment", { v: "solid", s: "sm", icon: "credit-card" })}${iconButton("ellipsis", "More chart actions", { v: "white", s: "iconSm" })}</div></div>
    <div class="mx-5 grid grid-cols-[1.3fr_1fr_1fr_1fr_1.6fr] rounded-lg border border-gray-200/80 divide-x divide-gray-200/80 py-2.5">
      ${np ? fact("Insurance", flag("No insurance on file", "!text-gray-800 !font-medium"), "Add it before the exam") : fact("Insurance", `<span class="inline-flex items-center gap-2">Aetna Dental PPO</span>`, statusDot("Verified Sep 24", "on", "!text-xs !text-gray-500"))}
      ${fact("Patient balance", money(p.balance), np ? "" : "31–60 days")}
      ${fact("Family balance", money(np ? 0 : 740), np ? "" : "1 member")}
      ${fact("Ins. est.", money(p.insBalance), np ? "" : "2 claims out")}
      ${fact("Next appointment", np ? "Today · 9:30 AM" : "Today · 11:00 AM", np ? "New patient exam · Op 2 · Dr. Brooks" : "Deep cleaning · Hyg 2 · Jordan K.")}</div>`;
}

/* v2 chart top: one bar carries the name, age, birthday and chart number with the quick actions; under it one line of
 * alerts and one unboxed line of facts. About 120px to the tabs instead of 228px (Attio's record header). */
function v2ChartTop(state) {
  const nav = `${iconButton("chevron-up", "Previous patient", { s: "iconSm" })}${iconButton("chevron-down", "Next patient", { s: "iconSm" })}`;
  const acts = (attrs = "") => `<span class="flex items-center gap-1.5"${attrs}>${button("Schedule", { v: "white", s: "sm", icon: "calendar-plus" })}${button("Text", { v: "white", s: "sm", icon: "message-square" })}${button("Collect payment", { v: "solid", s: "sm", icon: "credit-card" })}${iconButton("ellipsis", "More chart actions", { s: "iconSm" })}</span>`;
  const sep = '<span class="h-5 mx-1 border-s border-gray-200/80"></span>';
  const fact2 = (label, value, sub = "", attrs = "") => `<div class="min-w-0"${attrs}><p class="text-xs text-gray-500">${label}</p><p class="mt-0.5 text-sm font-medium text-gray-800 tabular-nums truncate">${value}</p>${sub ? `<p class="text-xs text-gray-500 truncate">${sub}</p>` : ""}</div>`;
  if (state === "Loading") return `${workspaceHeader({ parent: "Charts", title: `<span class="inline-flex items-center gap-2">${skel("w-28", "h-4")}${skel("w-56", "h-3.5")}</span>`, actions: `${nav}${sep}<span class="flex gap-1.5">${skel("w-24", "h-8")}${skel("w-16", "h-8")}${skel("w-36", "h-8")}</span>` })}
    <div class="flex items-center gap-3 h-10 px-5">${skel("w-28", "h-4")}${skel("w-24", "h-4")}</div>
    <div class="flex gap-12 px-5 pb-3.5">${Array.from({ length: 4 }, () => `<div class="space-y-1.5">${skel("w-16", "h-3")}${skel("w-28", "h-4")}${skel("w-20", "h-3")}</div>`).join("")}</div>`;
  const np = state === "New patient", p = DATA.patient(np ? "p9" : "p5");
  const title = `${p.name} <span class="font-normal text-gray-500 tabular-nums"${chg("The name, age, birthday and chart number share the top bar with the quick actions; the big name and avatar under it repeated the bar.")}>· ${p.age} y · DOB ${fmtDateY(p.dob)} · Chart #${CHART_NO[p.id]}</span>${np ? ` <span class="ms-1 align-middle">${tag("New patient", "tagOutline")}</span>` : ""}`;
  const alerts = p.alerts.length ? byUrgency(p.alerts).map((a) => (isPremed(a) ? flag(esc(a), "!text-gray-800") : `<span class="inline-flex items-center gap-1.5 text-sm text-gray-600">${I(alertIcon(a), "size-3.5 text-gray-400")}${esc(a)}</span>`)).join("") : `<span class="text-[13px] text-gray-400">No alerts</span>`;
  const single = !np; // the Nguyen family has one member, so a family balance would repeat the patient balance
  const facts = np ? [fact2("Insurance", flag("No insurance on file", "!text-gray-800 !font-medium"), "Add it before the exam"), fact2("Patient balance", money(p.balance)), fact2("Ins. est.", money(p.insBalance)), fact2("Next appointment", "Today · 9:30 AM", "New patient exam · Op 2 · Dr. Brooks")]
    : [fact2("Insurance", "Aetna Dental PPO", "Verified Sep 24"), fact2("Patient balance", money(p.balance), "31–60 days", single ? chg("Family balance is hidden while the family has one member; it only repeated the patient balance.") : ""), fact2("Ins. est.", money(p.insBalance), "2 claims out"), fact2("Next appointment", "Today · 11:00 AM", "Deep cleaning · Hyg 2 · Jordan K.")];
  return `${workspaceHeader({ parent: "Charts", title, actions: `${nav}${sep}${acts(chg("Schedule, Text, Collect payment and ⋯ moved into the top bar next to ‹ ›."))}` })}
    <div class="flex items-center gap-4 h-10 px-5"${chg("Alerts are one line under the bar: orange only for Premedicate, the rest grey, and a pencil to manage them instead of a blue link.")}>${alerts}${iconButton("pencil", "Manage patient alerts", { s: "iconXs", cls: "-ms-2" })}</div>
    <div class="flex gap-12 px-5 pb-3.5"${chg("The facts are a plain line, not a box (the box's first label touched its border).")}>${facts.join("")}</div>`;
}

/* v4 chart: Asha's real chart layout (PatientChartDetail): the patient panel down the left, the tabs and the tab's
 * content on the right. The panel is the one patient header (alerts and the family balance as marks by the name), the
 * quick actions with the ⋯ that holds the chart's other actions (right under who the patient is, as the app's Call and
 * Email are), then the key facts stacked (one label and one value each, the detail on hover). The app's panel is 320px and resizes to 420px; 360px fits the name, its marks and the
 * three quick actions on one line. clinical.js draws its charting screens in the same shell (window.ptsV4ChartShell). */
const CHART_ACTIONS = [
  { label: "Patient", items: [{ icon: "bell-plus", label: "Manage alerts", hint: "Add or clear medical and office alerts" }, { icon: "users", label: "Add family member", hint: "Link someone to this family" },
    { icon: "send", label: "Send forms", hint: "Text a link to forms to fill in" }, { icon: "receipt", label: "Send statement", hint: "Text or email what's owed" }, { icon: "smartphone", label: "Invite to patient portal", hint: "Text a sign-up link" }] },
  { label: "Chart", items: [{ icon: "printer", label: "Print chart", hint: "Facts, history and the tooth chart" }, { icon: "link", label: "Copy chart link", hint: "To paste in a message to a teammate" }, { icon: "history", label: "Chart history", hint: "Every change, who made it and when" }] },
  { label: "", items: [{ icon: "git-merge", label: "Merge duplicate patient", danger: true }, { icon: "archive", label: "Archive patient", danger: true }] }];
const V4_PANEL_W = 360;
/* The key facts in the panel: [label, value, what shows on hover] */
function v4ChartFacts(id) {
  const p = DATA.patient(id), muted = (t) => `<span class="text-gray-400">${t}</span>`;
  const left = PT_BENEFITS.max - PT_BENEFITS.used;
  return [["Birthday", fmtDateY(p.dob)], ["Cell phone", p.phone],
    p.payer ? ["Insurance", "Aetna Dental PPO", `Verified Sep 24 · ${money(left)} left of ${money(PT_BENEFITS.max)} this year`] : ["Insurance", flag("No insurance on file"), "Add it before the exam so we can estimate costs"],
    ["Ins. est.", p.insBalance ? money(p.insBalance) : muted(money(0)), p.insBalance ? "Waiting on Aetna for 2 claims" : ""],
    ["Next appt", nextLabel(p.next) || muted("None scheduled"), id === "p9" ? "New patient exam · Op 2 · Dr. Brooks" : "Deep cleaning · Hyg 2 · Jordan K."],
    ["Last visit", p.lastVisit ? fmtDateY(p.lastVisit) : muted("No visits yet")], ["Provider", DATA.provider(PRIMARY[id]).name]];
}
const v4FactRow = ([k, v, tip]) => `<div class="grid grid-cols-[104px_1fr] items-center min-h-8 gap-x-3 text-sm"><span class="text-[13px] text-gray-500">${k}</span><div class="min-w-0 truncate text-gray-800 tabular-nums">${tip ? `<span data-tip="${esc(tip)}" tabindex="0" class="cursor-default rounded-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600/30">${v}</span>` : v}</div></div>`;
/* The panel collapsed to its rail (PatientChartSidebarCollapsedRail, 44px), for wide screens like the perio chart: open
 * it, then who the patient is and the same two marks as icons, with the detail on hover */
function v4PtRail(id) {
  const p = DATA.patient(id), fam = DATA.patients.filter((x) => x.family === p.family).reduce((a, x) => a + (x.balance || 0), 0);
  const needs = p.alerts.some((a) => /premedicate|antibiotic|blood thinner/i.test(a));
  return `<aside class="shrink-0 flex flex-col items-center gap-2.5 py-2 border-e border-gray-200/80 bg-white" style="width:44px" aria-label="Patient"${chg4("On a wide screen like the perio chart the patient panel starts folded to its rail, as staff keep it in Asha: open it with the top button; the patient and the alert and balance marks stay in view.")}>
    ${iconButton("panel-left-open", "Open patient panel", { s: "iconSm", attrs: "data-pt-open" })}<span class="h-px w-6 bg-gray-200"></span>
    <span data-tip="${esc(`${p.name} · ${p.age} y · Chart #${CHART_NO[id]}`)}" tabindex="0" class="inline-flex rounded-full focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600/30">${avatar(p.name, { size: 8 })}</span>
    ${p.alerts.length ? recordMark("circle-alert", byUrgency(p.alerts).join(" · "), needs) : ""}${fam ? recordMark("wallet", `Family balance due ${money(fam)}`) : ""}</aside>`;
}
function v4PtPanel(id, { loading = false, extra = [], collapsed = false } = {}) {
  if (collapsed) return v4PtRail(id);
  const aside = (html) => `<aside class="shrink-0 border-e border-gray-200/80 bg-white" style="width:${V4_PANEL_W}px" aria-label="Patient">${html}</aside>`;
  if (loading) return aside(`<div class="flex items-start gap-3 px-5 py-3.5 border-b border-gray-200/80"${chg4("While the chart loads, the grey bars take the shape of the patient panel, so nothing moves when it arrives.")}><span class="size-9 shrink-0 ${R.skel} !rounded-full"></span><div class="grow space-y-2 pt-0.5">${skel("w-40", "h-4")}${skel("w-28", "h-3")}</div></div>
    <div class="flex gap-1.5 px-5 py-3 border-b border-gray-200/80">${skel("w-20", "h-8")}${skel("w-14", "h-8")}${skel("w-32", "h-8")}${skel("w-8", "h-8")}</div>
    <div class="px-5 py-2.5">${Array.from({ length: 7 }, (_, i) => `<div class="grid grid-cols-[104px_1fr] items-center min-h-8 gap-x-3">${skel("w-16", "h-3")}${skel(["w-28", "w-32", "w-36", "w-16", "w-28", "w-24", "w-32"][i])}</div>`).join("")}</div>`);
  const p = DATA.patient(id), np = !p.lastVisit;
  const fam = DATA.patients.filter((x) => x.family === p.family).reduce((a, x) => a + (x.balance || 0), 0);
  const head = `<div${chg4("The patient's one header: medical alerts are one icon with the count by the name (orange because Premedicate needs action first; hover lists them) and the family balance is the wallet with the amount. The line of alert chips is gone.")}>${patientHeader({ name: p.name, sub: `${p.age} y · Chart #${CHART_NO[id]}`, alerts: p.alerts, familyBalance: fam, newPatient: np })}</div>`;
  const facts = `<div class="px-5 py-2.5"${chg4("The key facts stack down the panel, one label and one value each; the detail (when insurance was checked, what the next visit is) shows on hover instead of a third grey line.")}>${v4ChartFacts(id).map(v4FactRow).join("")}</div>`;
  const acts = `<div class="flex items-center gap-1.5 px-5 py-3 border-b border-gray-200/80">${button("Schedule", { v: "white", s: "sm" })}${button("Text", { v: "white", s: "sm" })}${button("Collect payment", { v: "solid", s: "sm", cls: "grow" })}<span class="inline-flex"${chg4("Schedule, Text and Collect payment sit right under her name, and the ⋯ after them is the standard Actions menu: search it, and the chart's other actions are grouped (patient, chart), with merge and archive last.")}>${actionsMenu([...extra, ...CHART_ACTIONS], { dots: true, up: false, align: "end", w: 304, open: V4_OPTS.open })}</span></div>`;
  return aside(`${head}${acts}${facts}`);
}
/* The chart's shell: the patient panel and, on the right, the chart tabs over the tab's content (body). The first
 * eight tabs show; the rest sit under More, which opens a short list (wired by the chart block's mount). */
const V4_TABS_SHOWN = 8;
function v4MoreTab(tabs, tab) {
  const rest = tabs.slice(V4_TABS_SHOWN).map((t) => (Array.isArray(t) ? t[0] : t)), on = tab >= V4_TABS_SHOWN;
  return `<div class="relative" data-more-tabs><button type="button" class="${on ? R.tabOn : R.tab}" aria-haspopup="menu" aria-expanded="false" data-more-btn${chg4(`The tabs fit beside the panel: ${rest.join(", ")} are under More instead of running off the edge.`)}><span data-more-label>${on ? rest[tab - V4_TABS_SHOWN] : "More"}</span>${I("chevron-down", "!size-3.5 text-gray-400")}</button>
    <div class="${R.menu} !w-44 absolute top-full end-0 mt-1 z-30" role="menu" aria-label="More tabs" data-more-menu hidden>${rest.map((l, i) => `<button type="button" role="menuitem" class="${R.menuItem}" data-more-tab="${i + V4_TABS_SHOWN}">${l}</button>`).join("")}</div></div>`;
}
function ptsV4ChartShell({ id = "p5", loading = false, tabs = CHART_TABS, tab = 0, body = "", extra = [], collapsed = false } = {}) {
  return `<div class="flex items-stretch"${chg4("Asha's real chart layout: the patient panel runs down the left and the tabs and the tab's content fill the right, instead of a full-width header across the top of the page.")}>${v4PtPanel(id, { loading, extra, collapsed })}
    <div class="min-w-0 grow"><div class="flex items-end gap-x-3 px-5 border-b border-gray-200/80" data-chart-tabs>${tabsBar(tabs.slice(0, V4_TABS_SHOWN), tab, "!border-0 !gap-x-3")}${v4MoreTab(tabs, tab)}</div>${body}</div></div>`;
}
/* More: open the list, and picking a tab shows it (the eight tabs' ink moves off) */
function v4WireMore(el, onPick) {
  const box = el.querySelector("[data-more-tabs]"); if (!box) return;
  const btn = box.querySelector("[data-more-btn]"), menu = box.querySelector("[data-more-menu]");
  const show = (open) => { menu.hidden = !open; btn.setAttribute("aria-expanded", open); };
  btn.addEventListener("click", () => show(menu.hidden));
  menu.addEventListener("click", (e) => { const b = e.target.closest("[data-more-tab]"); if (!b) return; show(false);
    el.querySelectorAll("[data-chart-tabs] nav [data-tab]").forEach((x) => { x.className = R.tab; x.setAttribute("aria-selected", "false"); const c = x.querySelector("span"); if (c) c.className = R.count; });
    btn.className = R.tabOn; box.querySelector("[data-more-label]").textContent = b.textContent; onPick(+b.dataset.moreTab); });
  el.querySelector("[data-chart-tabs] nav").addEventListener("click", (e) => { if (e.target.closest("[data-tab]")) { btn.className = R.tab; box.querySelector("[data-more-label]").textContent = "More"; } });
  document.addEventListener("mousedown", (e) => { if (!box.contains(e.target)) show(false); });
  box.addEventListener("keydown", (e) => { if (e.key === "Escape") { show(false); btn.focus(); } });
}
window.ptsV4ChartShell = ptsV4ChartShell;
function v4ChartPage(state) {
  const load = state === "Loading", np = state === "New patient";
  const tabs = CHART_TABS.map(([l, n]) => (n != null && !load ? [l, np && l !== "Family" ? 0 : n] : l));
  const body = load ? `<div class="space-y-3 max-w-[420px]">${skel("w-32", "h-4")}${Array.from({ length: 5 }, (_, i) => `<div class="grid grid-cols-[168px_1fr] gap-3">${skel("w-24")}${skel(["w-40", "w-28", "w-52", "w-32", "w-24"][i])}</div>`).join("")}</div>` : overview("Complete", np ? "p9" : "p5");
  return ptsV4ChartShell({ id: np ? "p9" : "p5", loading: load, tabs, body: `<div class="px-5 py-5" data-tab-body>${body}</div>` });
}
/* v4 overview: every section is a table of fields you type into (the appointment panel's, the claim's, everyone's) */
function v4Overview(state, id) {
  const who = PEOPLE[id], miss = state === "Missing details";
  const f = (label, value, o = {}) => ({ label, value: value || "", type: o.options ? "select" : o.none ? "none" : "text", options: o.options });
  const sec = (title, rows) => `<section class="py-4 border-t border-gray-200/80 first:border-t-0 first:pt-0"><h3 class="${R.groupTitle} mb-2">${title}</h3>${fieldTable(rows, { labelW: 132, title })}</section>`;
  const opt = ["Opted in", "Opted out"], rel = ["Spouse", "Parent", "Child", "Friend", "Other"];
  const left = sec("Contact details", [f("Cell phone", who.phone), f("Home phone", ""), f("Email", miss ? "" : who.email), f("Address", who.addr.replace(/<br>/g, ", ")), f("Preferred language", "English", { options: ["English", "Spanish", "Vietnamese", "Mandarin"] })])
    + sec("Emergency contact", who.ec && !miss ? [f("Name", who.ec[0]), f("Relationship", who.ec[1], { options: rel }), f("Phone", who.ec[2])] : [f("Name", ""), f("Relationship", "", { options: rel }), f("Phone", "")])
    + sec("Referral", [f("Referral source", who.ref[0], { options: ["Referred by a patient", "Online search", "Insurance directory", "Walked by", "Other"] }), f("Referred by", id === "p5" ? "Lucas Foster" : "")]);
  const right = sec("Communication preferences", [f("Text messages", "Opted in", { options: opt }), f("Email", !miss && who.email ? "Opted in" : "Opted out", { options: opt }), f("Mail", "Opted out", { options: opt }),
      f("Preferred contact", "Text message", { options: ["Text message", "Phone call", "Email"] }), f("Best time to reach", miss ? "" : "Weekday mornings", { options: ["Weekday mornings", "Weekday afternoons", "Evenings", "Saturdays"] })])
    + sec("Responsible party", [f("Guarantor", `${who.name} · Self`, { none: true }), f("Billing address", "Same as patient"), f("Statements by", miss ? "Text" : "Text and email", { options: ["Text", "Email", "Text and email", "Mail"] })])
    + sec("Preferred pharmacy", who.pharm ? [f("Pharmacy", who.pharm[0]), f("Pharmacy phone", who.pharm[1])] : [f("Pharmacy", ""), f("Pharmacy phone", "")]);
  return `<div class="grid grid-cols-2 gap-x-12"${chg4("Every value is a cell in a small table you type into, like Dentrix's patient screen: click or just type, Enter saves and moves down, lists search as you type. The pencils on hover are gone; an empty value reads “Add …”.")}><div>${left}</div><div>${right}</div></div>`;
}

/* ---------- Overview sections ---------- */
const kvRow = (k, v, kw = 168) => `<div class="grid grid-cols-[${kw}px_1fr] items-start gap-3 py-1.5 text-sm"><span class="text-[13px] text-gray-500 pt-px">${k}</span><div class="min-w-0 text-gray-800">${v}</div></div>`;
const flatSection = (title, rows, { actions = button("Edit", { v: "link", s: "xs" }) } = {}) => `<section class="py-4 border-t border-gray-200/80 first:border-t-0 first:pt-0"><div class="flex items-center justify-between mb-1"><h3 class="${R.groupTitle}">${title}</h3>${actions}</div>${rows}</section>`;
const missing = (text) => flag(text);
const PEOPLE = {
  p5: { name: "Olivia Nguyen", phone: "(650) 555-0101", email: "o.nguyen@example.com", addr: "418 Alma St<br>Palo Alto, CA 94301", ec: ["Daniel Nguyen", "Spouse", "(650) 555-0148"], ref: ["Referred by a patient", `<a class="text-blue-600 hover:underline" href="#">Lucas Foster</a>`], pharm: ["Walgreens · University Ave", "(650) 555-0190"] },
  p9: { name: "Isabella Kim", phone: "(925) 555-0120", email: "", addr: "22 Oak Ct<br>Walnut Creek, CA 94596", ec: null, ref: ["Online search", '<span class="text-gray-400">—</span>'], pharm: null }
};
/* v2 Overview (Attio's record details): no section Edit links. Every value is a row you click to edit in place, with a
 * pencil on hover; a missing value is a grey "Add …" prompt, with the orange icon only where the front desk must ask. */
function v2Overview(state, id) {
  const who = PEOPLE[id], miss = state === "Missing details";
  const ph = (t, req = false, attrs = "") => `<span class="inline-flex items-center gap-1.5 text-gray-400"${attrs}>${req ? I("circle-alert", "size-3.5 shrink-0 text-orange-500") : ""}${t}</span>`;
  const optIn = (on) => (on ? statusDot("Opted In", "on") : statusDot("Opted Out", "off"));
  const row = (k, v, attrs = "") => `<div role="button" tabindex="0" aria-label="Edit ${esc(k.replace(/<[^>]+>/g, ""))}" class="group -mx-2 grid grid-cols-[168px_1fr_14px] items-start gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-gray-50 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-blue-600/20 cursor-pointer"${attrs}><span class="text-[13px] text-gray-500 pt-px">${k}</span><div class="min-w-0 text-gray-800">${v}</div>${I("pencil", "size-3.5 mt-0.5 text-gray-400 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100")}</div>`;
  const sec = (title, rows) => `<section class="py-4 border-t border-gray-200/80 first:border-t-0 first:pt-0"><h3 class="${R.groupTitle} mb-1">${title}</h3>${rows}</section>`;
  const reqNote = chg("A missing value reads as a grey “Add …” prompt; the orange icon stays only where the front desk has to ask for it.");
  const ec = miss || !who.ec ? row("Name", ph("Add emergency contact…", true)) : `${row("Name", who.ec[0])}${row("Relationship", who.ec[1])}${row("Phone", `<span class="tabular-nums">${who.ec[2]}</span>`)}`;
  const left = sec("Contact details", `${row("Cell phone", `<span class="tabular-nums">${who.phone}</span>`, chg("Click any value to edit it where it is (a pencil shows on hover). The six blue Edit links are gone, as on Attio's record page."))}${row("Home phone", ph("Add home phone…"))}${row("Email", miss || !who.email ? ph("Add email…", true, reqNote) : who.email)}${row("Address", who.addr)}${row(`<span${chg("Labels are in sentence case (Cell phone, Preferred language); labels Asha's screen spells another way, like Best Time to Reach, keep it.")}>Preferred language</span>`, "English")}`)
    + sec("Emergency contact", ec)
    + sec("Referral", `${row("Referral source", who.ref[0])}${row("Referred by", id === "p5" ? "Lucas Foster" : ph("Add who referred them…"))}`);
  const right = sec("Communication preferences", `${row("SMS Opt-In", optIn(true))}${row("Email Opt-In", optIn(!miss && !!who.email))}${row("Mail Opt-In", optIn(false))}${row("Preferred Contact", "Text message")}${row("Best Time to Reach", miss ? ph("Add best time…") : "Weekday mornings")}`)
    + sec("Responsible party", `${row("Guarantor", `${who.name} <span class="text-gray-500">· Self</span>`)}${row("Billing address", "Same as patient")}${row("Statements by", miss ? "Text" : "Text and email")}`)
    + sec("Preferred pharmacy", who.pharm ? `${row("Pharmacy", who.pharm[0])}${row("Pharmacy phone", `<span class="tabular-nums">${who.pharm[1]}</span>`)}` : row("Pharmacy", ph("Add pharmacy…")));
  return `<div class="grid grid-cols-2 gap-x-12"><div>${left}</div><div>${right}</div></div>`;
}
function overview(state = "Complete", id = "p5") {
  if (V4) return v4Overview(state, id);
  if (V2) return v2Overview(state, id);
  const who = PEOPLE[id], miss = state === "Missing details";
  const none = '<span class="text-gray-400">None on file</span>';
  const optIn = (on) => (on ? statusDot("Opted In", "on") : statusDot("Opted Out", "off"));
  const ec = miss || !who.ec ? kvRow("Name", missing("Add an emergency contact")) : `${kvRow("Name", who.ec[0])}${kvRow("Relationship", who.ec[1])}${kvRow("Phone", `<span class="tabular-nums">${who.ec[2]}</span>`)}`;
  const left = flatSection("Contact details", `${kvRow("Cell Phone", `<span class="tabular-nums">${who.phone}</span>`)}${kvRow("Home Phone", none)}${kvRow("Email", miss || !who.email ? missing("No email on file") : who.email)}${kvRow("Address", who.addr)}${kvRow("Preferred Language", "English")}`)
    + flatSection("Emergency contact", ec)
    + flatSection("Referral", `${kvRow("Referral Source", who.ref[0])}${kvRow("Referred by", who.ref[1])}`);
  const right = flatSection("Communication preferences", `${kvRow("SMS Opt-In", optIn(true))}${kvRow("Email Opt-In", optIn(!miss && !!who.email))}${kvRow("Mail Opt-In", optIn(false))}${kvRow("Preferred Contact", "Text message")}${kvRow("Best Time to Reach", miss ? '<span class="text-gray-400">Not asked yet</span>' : "Weekday mornings")}`)
    + flatSection("Responsible party", `${kvRow("Guarantor", `${who.name} <span class="text-gray-500">· Self</span>`)}${kvRow("Billing address", "Same as patient")}${kvRow("Statements by", miss ? "Text" : "Text and email")}`)
    + flatSection("Preferred pharmacy", who.pharm ? `${kvRow("Pharmacy", who.pharm[0])}${kvRow("Pharmacy Phone", `<span class="tabular-nums">${who.pharm[1]}</span>`)}` : kvRow("Pharmacy", none));
  return `<div class="grid grid-cols-2 gap-x-12"><div>${left}</div><div>${right}</div></div>`;
}

/* ---------- Family ---------- */
const FAM = [
  { id: "p10", rel: "Self", role: "Guarantor", ins: "Delta Dental", insSt: ["Verified", "on"], owed: 95 },
  { id: "p11", rel: "Spouse", role: "Contact", ins: "Delta Dental", insSt: ["Verified", "on"], owed: 0 },
  { id: "p12", rel: "Child", role: "", ins: "Delta Dental", insSt: ["Pending", "off"], owed: 45 }
];
const famCols = () => [
  { key: "name", label: "Patient", icon: "user", w: 210, open: true, kind: "text", lead: (r) => avatar(r.name, { size: 5 }), render: (r) => `${esc(r.name)} <span class="font-normal text-gray-500">· ${r.age} y</span>` },
  { key: "rel", label: "Relationship", icon: "link", w: 124, kind: "text" },
  { key: "role", label: "Role", icon: "badge-check", w: 112, kind: "text", render: (r) => (r.role ? tag(r.role, r.role === "Guarantor" ? "tagBlue" : "tagGray") : blank(`<span class="text-gray-400">—</span>`)) },
  { key: "ins", label: "Insurance", icon: "shield", w: 190, kind: "text", render: (r) => (V2 && r.insSt[0] === "Verified" ? esc(r.ins) : `<span class="inline-flex items-center gap-2"${V2 ? chg("Insurance shows a status only when it isn't Verified, so Chloe's pending plan is the one that stands out.") : ""}>${esc(r.ins)}<span class="text-gray-300">·</span>${statusDot(r.insSt[0], r.insSt[1], "!text-[13px] !text-gray-600")}</span>`) },
  { key: "next", label: "Next appt", icon: "calendar-clock", w: 150, kind: "date", render: (r) => (r.next ? nextLabel(r.next) : blank(`<span class="text-gray-400">None scheduled</span>`)) },
  { key: "owed", label: V2 ? `<span${chg("Empty cells (no role, no next visit, a zero balance) are blank instead of a dash, None scheduled or $0.00.")}>Total outstanding</span>` : "Total outstanding", icon: "wallet", w: 150, num: true, kind: "money", render: (r) => (r.owed ? money(r.owed) : blank(`<span class="text-gray-400">$0.00</span>`)) },
  { key: "act", label: "", w: 56, kind: "text", value: () => "", render: (r) => `<span class="flex justify-center">${iconButton("ellipsis", `Actions for ${r.name}`, { s: "iconXs", cls: r.id === "p12" && !r.single ? "!bg-gray-100 !text-gray-800" : "" })}</span>` }
];
/* v4: Relationship and Role are cells you type into; picking a new guarantor takes the role from the old one */
/* a member with no role reads Member (an empty cell would leave the Role column patchy) */
const V4_REL = ["Self", "Spouse", "Child", "Parent", "Other"], V4_ROLE = ["Guarantor", "Contact", "Member"];
/* Most important first: who, how they're related, their role, their insurance and what they owe, the things a family
 * is billed by. Age, birthday, phone, when insurance was checked and the next visit open on hover (each member's own
 * chart has them), instead of the age strung after the name and a Next appt column. */
const v4FamCols = () => famCols().filter((c) => c.key !== "next").map((c) => (c.key === "name" ? { ...c, label: `<span${chg4("Each row keeps who, how they're related, their role, insurance and what they owe; the age after the name and the Next appt column moved to a card that opens on hover with the birthday, phone and next visit.")}>Patient</span>`, render: (r) => esc(r.name) }
  : c.key === "rel" ? { ...c, edit: "select", options: V4_REL } : c.key === "role" ? { ...c, edit: "select", options: V4_ROLE, render: (r) => (r.role !== "Member" ? tag(r.role, r.role === "Guarantor" ? "tagBlue" : "tagGray") : `<span class="text-gray-500"${chg4("A family member with no role reads Member, so the Role column has a value on every row.")}>Member</span>`) } : c));
const v4FamPeek = (r) => peekCard(esc(r.name), [["Age", `${r.age} y`], ["Birthday", fmtDateY(r.dob)], ["Cell phone", `<span class="tabular-nums">${esc(r.phone)}</span>`], ["Insurance", esc(r.ins)], ["Checked", esc(r.insSt[0])], ["Next appt", r.next ? nextLabel(r.next) : "None scheduled"]], "Click the name to open their preview.");
const famRows = (single) => (single ? [{ ...DATA.patient("p5"), rel: "Self", role: "Guarantor", ins: "Aetna Dental", insSt: ["Verified", "on"], owed: 740, single: true }] : FAM.map((f) => ({ ...DATA.patient(f.id), ...f })));
function familyHtml(state = "Walker family") {
  const single = state === "Just one member";
  const menu = single ? "" : `<div class="absolute end-2 top-[200px] z-20 ${R.menu} !w-56" role="menu" aria-label="Actions for Chloe Walker">
      <button type="button" role="menuitem" class="${R.menuItem}">${I("crown")}Set Guarantor</button><button type="button" role="menuitem" class="${R.menuItem}">${I("phone")}Set Contact</button>
      <button type="button" role="menuitem" class="${R.menuItem}">${I("split")}Split to own account</button><button type="button" role="menuitem" class="${R.menuItem}">${I("receipt")}View ledger</button>
      <div class="${R.menuSep}"></div><button type="button" role="menuitem" class="${R.menuDanger}">${I("user-minus")}Remove from family</button></div>`;
  return `<div class="relative ${single ? "" : "min-h-[392px]"}">
    <div class="flex items-center justify-between gap-4 mb-3">
      <div class="flex items-center gap-3"><h3 class="${R.sectionTitle}">${single ? "Nguyen" : "Walker"} family</h3><span class="${R.count}">${single ? 1 : 3}</span>
        <span class="text-[13px] text-gray-500">Family balance <span class="font-semibold text-gray-800 tabular-nums">${money(single ? 740 : 140)}</span> · Ins. est. <span class="text-gray-800 tabular-nums">${money(single ? 318 : 255)}</span></span></div>
      ${V2 ? (single ? "" : `<div class="flex items-center gap-2"><button type="button" class="${R.selectSm} !w-auto" aria-haspopup="menu" aria-label="Show: All members"${chg("The four member filters are one small menu (hidden when a family has under three people), so the family line fits on one row.")}>All members${I("chevron-down")}</button>${V4 ? `<span class="inline-flex"${chg4("Add family member is in sentence case, like every other button and the chart's Actions menu.")}>${button("Add family member", { v: "white", s: "sm", icon: "user-plus" })}</span>` : button("Add Family Member", { v: "white", s: "sm", icon: "user-plus" })}</div>`)
        : `<div class="flex items-center gap-2">${segmented(["All members", "Has balance", "No balance", "Insurance pending"], 0, { sm: true })}${button("Add Family Member", { v: "white", s: "sm", icon: "user-plus" })}</div>`}</div>
    <div data-grid="family"></div>
    ${single ? `<div class="mt-4 flex items-center justify-between gap-4 ${R.boxMuted} px-4 py-3"${chg("Add Family Member appears once: the header button is gone while this prompt shows.")}><p class="text-[13px] text-gray-600">Olivia is the only person in this family. Add a spouse or child to send one statement for everyone.</p>${button(V4 ? "Add family member" : "Add Family Member", { v: "white", s: "xs", icon: "user-plus" })}</div>`
      : `<p class="mt-3 ${R.help}">The guarantor gets one statement for the whole family. Chloe's $45.00 is waiting on Delta Dental.</p>`}
    ${menu}</div>`;
}
/* inChart: the Family tab beside the patient panel, where the table has about 700px: no Next appt (each member's own
 * chart shows it) and narrower columns, so it fits without scrolling sideways */
const V4_FAM_CHART_W = { name: 178, rel: 116, role: 110, ins: 112, owed: 150, act: 40 };
function mountFamily(host, single, inChart = false) {
  if (V4) { host.setAttribute("data-chg", "Relationship and Role are cells you click or type into, like a spreadsheet. Pick Guarantor for someone and the role moves from the old guarantor, without the row menu.");
    const cols = inChart ? v4FamCols().map((c) => ({ ...c, w: V4_FAM_CHART_W[c.key] })) : v4FamCols();
    const g4 = new Grid(host, { gutter: inChart ? 20 : 24, ...(inChart ? { sortable: false } : {}), columns: cols, peek: v4FamPeek, rows: famRows(single).map((r) => ({ ...r, role: r.role || "Member" })), title: "Family", toolbar: false, selectable: false, addColumn: false, footer: false, maxHeight: 260, onOpen: openPatientSheet, sheet: true,
      onCommit: (r, k, v, grid) => { if (k === "role" && v === "Guarantor") grid.data.forEach((x) => { if (x !== r && x.role === "Guarantor") x.role = "Member"; }); } });
    if (!single) { const rows = host.querySelectorAll("tbody tr"); const last = rows[rows.length - 1]; if (last) last.dataset.open = "1"; }
    return g4; }
  const g = new Grid(host, Object.assign({ gutter: 24, columns: famCols(), rows: famRows(single), title: "Family", toolbar: false, selectable: false, addColumn: false, calc: { owed: "sum" }, maxHeight: 260, onOpen: openPatientSheet },
    V2 ? { footer: false, calc: {} } : {}));
  if (V2) host.firstElementChild?.setAttribute("data-chg", "The totals row is gone: the family balance is already in the line above the table, and a one-person family had a total of one row.");
  if (!single) { const rows = host.querySelectorAll("tbody tr"); const last = rows[rows.length - 1]; if (last) last.dataset.open = "1"; }
  return g;
}

/* v4: a record's fields with a header row, for a page whose other tables have one (Insurance, Medical Hx): the same
 * header and 36px rows as the coverage and allergy tables beside them. heads: [label column, value column]. */
const v4PtHeaded = (rows, heads, { labelW = 140, title = "Fields" } = {}) => sheetTable({ preset: "section", sortable: false, title, rows: rows.map((r, i) => ({ id: `f${i}`, ...r })),
  columns: [{ key: "label", label: heads[0], w: labelW, render: (r) => `<span class="text-gray-500">${esc(r.label)}</span>` },
    { key: "value", label: heads[1], w: 160, grow: true, edit: (r) => (r.type === "none" ? null : r.type || "text"), options: (r) => r.options, placeholder: (r) => `Add ${r.label.replace(/^\w/, (m) => m.toLowerCase())}`, render: (r) => (r.html ? r.html(r) : esc(r.value)) }] });

/* ---------- Insurance and benefits ---------- */
/* Olivia's Aetna benefits: the one set of numbers the appointment panel, check-in and treatment plan also use. The
 * coordinator may move this into DATA.patient(id).benefits in src/data.js. */
const PT_BENEFITS = { max: 1500, used: 320, deductible: 50 };
/* v4: the plan's facts (status first) are a table you type into, and so are the coverage and frequency tables, the way
 * Dentrix and Eaglesoft staff key in a plan's coverage. The ⋯ is the standard Actions menu. */
const V4_INS_ST = [["Verified", "on"], ["Needs review", "needs"], ["Not verified", "off"]];
const v4InsActions = (rev) => [
  { label: "Plan", items: [{ icon: "git-compare", label: "Compare with Aetna's portal", hint: "The chart and the portal side by side, box by box", suggest: rev ? "Aetna's portal shows a different group number" : "" },
    { icon: "file-search", label: "Benefits breakdown", hint: "Aetna's full answer from the last check" }, { icon: "history", label: "Verification history", hint: "Every check, who ran it and what changed" },
    { icon: "printer", label: "Print benefits", hint: "One page for the patient or the chart" }] },
  { label: "Coverage", items: [{ icon: "plus", label: "Add secondary insurance", hint: "A second plan that pays after Aetna" }, { icon: "repeat", label: "Replace plan", hint: "New job, new carrier or a new card" },
    { icon: "users", label: "Use for family members", hint: "Add this plan to others it covers" }] },
  { label: "", items: [{ icon: "trash-2", label: "Remove plan", danger: true }] }];
function v4InsuranceHtml(state) {
  const rev = state === "Needs review", busy = state === "Verifying";
  const st0 = rev ? "Needs review" : "Verified", when = rev ? "today, 10:02 AM" : "Sep 24 by Asha";
  const mismatch = "Aetna's portal shows group 0848813, but the chart says 0848812. Check her card and save the right one; Compare with Aetna's portal is in Actions.";
  const f = (label, value, o = {}) => ({ label, value, type: o.options ? "select" : o.none ? "none" : "text", options: o.options, html: o.html });
  const num = (r) => `<span class="tabular-nums">${esc(r.value)}</span>`;
  const status = busy ? f("Status", "Checking", { none: true, html: () => `<span class="inline-flex items-center gap-1.5 text-gray-600">${I("loader-circle", "size-3.5 animate-spin text-gray-400")}Checking with Aetna…</span>` })
    : f("Status", st0, { options: V4_INS_ST.map(([l]) => l), html: (r) => `<span class="inline-flex items-center gap-2 min-w-0"${chg4("Verified is the first line of the plan's facts, with when it was checked, instead of sitting in the line with the buttons.")}><span class="${cx(R.dot, TONE_DOT[(V4_INS_ST.find(([l]) => l === r.value) || V4_INS_ST[2])[1]])}"></span>${esc(r.value)}${r.value === st0 ? `<span class="text-gray-500 truncate">· ${when}</span>` : ""}</span>` });
  const plan = [status, f("Carrier", "Aetna Dental"), f("Plan type", "PPO", { options: ["PPO", "HMO", "DHMO", "Indemnity"] }), f("Member ID", "W2841 7730", { html: num }),
    f("Group #", "0848812", { html: (r) => `<span class="inline-flex items-center gap-1.5"><span class="tabular-nums">${esc(r.value)}</span>${rev && r.value === "0848812" ? `<span data-tip="${esc(mismatch)}" tabindex="0" class="inline-flex"${chg4("The group number mismatch is one orange icon in its cell, with the details on hover; Compare is in Actions.")}>${I("circle-alert", "size-3.5 text-orange-500")}</span>` : ""}</span>` }),
    f("Subscriber", "Olivia Nguyen"), f("Relationship", "Self", { options: ["Self", "Spouse", "Child", "Other"] }), f("Employer", "Stanford Health Care"), f("Effective", "Jan 1, 2025", { html: num }), f("Term. date", "")];
  const meterRow = (label, used, max, sub) => `<div><div class="flex items-baseline justify-between mb-1.5"><span class="text-[13px] text-gray-500">${label}</span><span class="text-sm tabular-nums text-gray-800"><span class="font-semibold">${money(max - used)}</span> <span class="text-gray-500">left of ${money(max)}</span></span></div>
      ${busy ? `<div class="h-1.5 rounded-full ${R.skel}"></div>` : Chart.meter(max - used, max)}<p class="mt-1 text-xs text-gray-500 tabular-nums">${sub}</p></div>`;
  const PCT = ["100%", "90%", "80%", "70%", "60%", "50%", "Not covered"];
  const cov = [["Preventive", "100%", "Exams, cleanings, x-rays, fluoride"], ["Basic", "80%", "Fillings, extractions, deep cleaning"], ["Major", "50%", "Crowns, bridges, implants, dentures"], ["Orthodontic", "Not covered", "Braces and aligners"]];
  const LIMITS = ["2 per calendar year", "1 per calendar year", "1 every 6 months", "1 every 3 years", "1 every 5 years", "Up to age 14", "Up to age 16", "Not covered"];
  const freq = [["Exams", "2 per calendar year", "1 used · Mar 12"], ["Cleanings", "2 per calendar year", "1 used · Mar 12"], ["Bitewings", "1 per calendar year", "0 used"], ["Full mouth x-rays", "1 every 5 years", "Last Aug 2023"], ["Fluoride", "Up to age 16", "Not eligible"]];
  const covSheet = sheetTable({ preset: "section", sortable: false, title: "Coverage by category", rows: cov.map(([c, pct, d], i) => ({ id: `c${i}`, c, pct, d })),
    columns: [{ key: "c", label: "Category", w: 128, render: (r) => `<span class="font-medium">${esc(r.c)}</span>` },
      { key: "pct", label: "Coinsurance", w: 132, edit: busy ? null : "select", options: PCT, render: (r) => (busy ? `<span class="inline-block w-10 h-3 ${R.skel}"></span>` : `<span class="${r.pct.includes("%") ? "" : "text-gray-500"}">${esc(r.pct)}</span>`) },
      { key: "d", label: "What it covers", w: 160, grow: true, render: (r) => `<span class="text-gray-600">${esc(r.d)}</span>` }] });
  const freqSheet = sheetTable({ preset: "section", sortable: false, title: "Frequency limits", rows: freq.map(([a, b, c], i) => ({ id: `f${i}`, a, b, c })),
    columns: [{ key: "a", label: "Service", w: 150 }, { key: "b", label: "Limit", w: 160, grow: true, edit: busy ? null : "select", options: LIMITS, render: (r) => `<span class="text-gray-600">${esc(r.b)}</span>` },
      { key: "c", label: "This year", w: 140, num: true, render: (r) => `<span class="text-gray-600">${esc(r.c)}</span>` }] });
  return `<div class="flex items-center justify-between gap-4 mb-4">
      ${segmented(["Primary · Aetna", "Secondary"], 0, { sm: true })}
      <div class="flex items-center gap-1.5">${button("Verify now", { v: "white", s: "sm", icon: "refresh-cw", attrs: busy ? "disabled" : "" })}<span class="inline-flex"${chg4("The ⋯ at the top right is the standard Actions menu: compare with the portal (suggested when something doesn't match), benefits, history, printing and plan changes, with Remove plan last.")}>${actionsMenu(v4InsActions(rev), { dots: true, up: false, align: "end", open: V4_OPTS.open })}</span></div></div>
    <div class="grid grid-cols-[360px_1fr] gap-10">
      <div><section class="pb-4"><h3 class="${R.groupTitle} mb-2">Plan</h3><div${chg4("The plan's facts are a table you type into; the Edit button is gone.")}><div${chg4("The plan's table has a header row and 36px rows like the coverage and frequency tables beside it, so every table on the tab looks the same.")}>${v4PtHeaded(plan, ["Detail", "On file"], { labelW: 112, title: "Plan" })}</div></div></section>
        <section class="py-4 border-t border-gray-200/80"><h3 class="${R.groupTitle} mb-2">Waiting periods</h3>${v4PtHeaded([f("Basic", "None"), f("Major", "12 months, met")], ["Category", "Wait"], { labelW: 112, title: "Waiting periods" })}</section></div>
      <div class="space-y-6">
        <div class="grid grid-cols-2 gap-8">${meterRow("Annual maximum", PT_BENEFITS.used, PT_BENEFITS.max, `${money(PT_BENEFITS.used)} used this year · resets Jan 1`)}${meterRow("Deductible", 50, 50, "$50.00 of $50.00 met · family $150.00")}</div>
        <div><h3 class="${R.groupTitle} mb-2">Coverage by category</h3><div${chg4("Coinsurance and frequency limits are cells you type into, the way staff key in a plan's coverage in Dentrix or Eaglesoft; estimates use what's here.")}>${covSheet}</div></div>
        <div><h3 class="${R.groupTitle} mb-2">Frequency limits</h3>${freqSheet}</div></div></div>`;
}
function insuranceHtml(state = "Verified") {
  if (V4) return v4InsuranceHtml(state);
  const rev = state === "Needs review", busy = state === "Verifying";
  const status = busy ? `<span class="inline-flex items-center gap-1.5 text-sm text-gray-600">${I("loader-circle", "size-4 animate-spin text-gray-400")}Checking with Aetna…</span>` : rev ? statusDot("Needs review", "needs") : statusDot("Verified", "on");
  const meterRow = (label, used, max, sub) => `<div><div class="flex items-baseline justify-between mb-1.5"><span class="text-[13px] text-gray-500">${label}</span><span class="text-sm tabular-nums text-gray-800"><span class="font-semibold">${money(max - used)}</span> <span class="text-gray-500">left of ${money(max)}</span></span></div>
      ${busy ? `<div class="h-1.5 rounded-full ${R.skel}"></div>` : V2 ? `<div${label === "Annual maximum" ? chg("The meters fill with what's left, so the bar agrees with the bold number above it (it used to fill with what was used).") : ""}>${Chart.meter(max - used, max)}</div>` : Chart.meter(used, max)}<p class="mt-1 text-xs text-gray-500 tabular-nums">${sub}</p></div>`;
  const cov = [["Preventive", "100%", "Exams, cleanings, x-rays, fluoride"], ["Basic", "80%", "Fillings, extractions, deep cleaning"], ["Major", "50%", "Crowns, bridges, implants, dentures"], ["Orthodontic", "Not covered", ""]];
  const freq = [["Exams", "2 per calendar year", "1 used · Mar 12"], ["Cleanings", "2 per calendar year", "1 used · Mar 12"], ["Bitewings", "1 per calendar year", "0 used"], ["Full mouth x-rays", "1 every 5 years", "Last Aug 2023"], ["Fluoride", "Up to age 16", "Not eligible"]];
  return `<div class="flex items-center justify-between gap-4 mb-4">
      <div class="flex items-center gap-3">${segmented(["Primary · Aetna", "Secondary"], 0, { sm: true })}${status}${busy ? "" : `<span class="${R.caption}">${rev ? "Checked today, 10:02 AM" : "Checked Sep 24, 8:12 AM · by Asha"}</span>`}</div>
      <div class="flex items-center gap-1.5">${button("Verify now", { v: "white", s: "sm", icon: "refresh-cw", attrs: busy ? "disabled" : "" })}${iconButton("ellipsis", "More insurance actions", { v: "white", s: "iconSm" })}</div></div>
    ${rev && !V2 ? `<div class="mb-4 flex items-center justify-between gap-4">${note(`Aetna's portal shows group <span class="tabular-nums">0848813</span>, but the chart says <span class="tabular-nums">0848812</span>. Check her card and save the right one.`)}${button("Compare details", { v: "white", s: "xs", cls: "shrink-0" })}</div>` : ""}
    <div class="grid ${V2 ? "grid-cols-[360px_1fr]" : "grid-cols-[340px_1fr]"} gap-10">
      <div>${flatSection("Plan", `${kvRow("Carrier", "Aetna Dental")}${kvRow("Plan type", "PPO")}${kvRow("Member ID", '<span class="tabular-nums">W2841 7730</span>')}${kvRow("Group #", V2 && rev ? `<span class="inline-flex items-center gap-2 whitespace-nowrap"><span class="tabular-nums">0848812</span><span${chg("One problem, one mark: the group number mismatch is a small orange mark by Group # with the details and Compare details on hover, instead of a full-width note plus two more orange marks.")}>${alertMark("Doesn't match", `Aetna's portal shows group <span class="tabular-nums">0848813</span>, but the chart says <span class="tabular-nums">0848812</span>. Check her card and save the right one.`, { action: button("Compare details", { v: "white", s: "xs" }), align: "start" })}</span></span>` : `<span class="tabular-nums">0848812</span>${rev ? ` ${I("circle-alert", "size-3.5 inline -mt-0.5 text-orange-500")}` : ""}`)}${kvRow("Subscriber", "Olivia Nguyen")}${kvRow("Relationship", "Self")}${kvRow("Employer", "Stanford Health Care")}${kvRow("Effective", "Jan 1, 2025")}${kvRow("Term. date", V2 ? "" : '<span class="text-gray-400">None</span>')}`, V2 ? { actions: `<span${chg("The section's Edit is a small white button, not a blue link.")}>${button("Edit", { v: "white", s: "xs" })}</span>` } : undefined)}
        ${flatSection("Waiting periods", `${kvRow("Basic", "None")}${kvRow("Major", "12 months, met")}`, { actions: "" })}</div>
      <div class="space-y-6">
        <div class="grid grid-cols-2 gap-8">${meterRow("Annual maximum", PT_BENEFITS.used, PT_BENEFITS.max, `${money(PT_BENEFITS.used)} used this year · resets Jan 1`)}${meterRow("Deductible", 50, 50, "$50.00 of $50.00 met · family $150.00")}</div>
        <div><h3 class="${R.groupTitle} mb-2">Coverage by category</h3><div class="${R.tableBox}"><table class="w-full border-separate border-spacing-0 text-sm"><thead><tr><th class="${R.tHead}">Category</th><th class="${R.tHead} !text-end">Coinsurance</th><th class="${R.tHead}">What it covers</th></tr></thead>
          <tbody>${cov.map(([c, pct, d]) => `<tr><td class="${R.tCell} font-medium">${c}</td><td class="${R.tCell} text-end tabular-nums ${pct.includes("%") ? "" : "text-gray-500"}">${busy ? `<span class="inline-block w-10 h-3 ${R.skel}"></span>` : pct}</td><td class="${R.tCell} text-gray-600">${d || '<span class="text-gray-400">—</span>'}</td></tr>`).join("")}</tbody></table></div></div>
        <div><h3 class="${R.groupTitle} mb-2">Frequency limits</h3><div class="${R.tableBox}"><table class="w-full border-separate border-spacing-0 text-sm"><thead><tr><th class="${R.tHead}">Service</th><th class="${R.tHead}">Limit</th><th class="${R.tHead} !text-end">This year</th></tr></thead>
          <tbody>${freq.map(([a, b, c]) => `<tr><td class="${R.tCell}">${a}</td><td class="${R.tCell} text-gray-600">${b}</td><td class="${R.tCell} text-end text-gray-600 tabular-nums">${c}</td></tr>`).join("")}</tbody></table></div></div></div></div>`;
}

/* ---------- Medical history ---------- */
/* v4: vitals are a table you type into and allergies, medications and conditions are lists you type into: the last line
 * of each is empty, and typing in it adds one. Update history gives way to Mark reviewed. */
let V4_MED_SEQ = 0;
function v4MedList(title, cols, rows, add) {
  const blank = () => ({ id: `m${++V4_MED_SEQ}`, blank: true, ...Object.fromEntries(cols.map((c) => [c.key, ""])) });
  return sheetTable({ preset: "section", sortable: false, title, rows: [...rows.map((r) => ({ id: `m${++V4_MED_SEQ}`, ...r })), blank()],
    columns: cols.map((c, i) => ({ ...c, edit: i ? (r) => (r.blank ? null : c.edit || "text") : c.edit || "text", placeholder: i ? undefined : (r) => (r.blank ? add : "") })),
    onCommit: (r, k, v, g) => { if (r.blank && v) { r.blank = false; g.data.push(blank()); }
      const n = g.root.closest("section")?.querySelector("[data-med-count]"); if (n) n.textContent = g.data.filter((x) => !x.blank).length; } });
}
function v4MedicalHtml(state) {
  const old = state === "Out of date";
  const f = (label, value, o = {}) => ({ label, value, type: o.options ? "select" : "text", options: o.options, html: o.html });
  const bp = old ? "132/84" : "138/86";
  const vitals = [f("Blood pressure", bp, { html: (r) => `<span class="tabular-nums">${esc(r.value)}</span>${r.value === "138/86" ? `<span class="text-gray-500"> · slightly high</span>` : ""}` }),
    f("Heart rate", old ? "70 bpm" : "72 bpm", { html: (r) => `<span class="tabular-nums">${esc(r.value)}</span>` }), f("Tobacco", "Never", { options: ["Never", "Former", "Current"] }),
    f("Pregnancy status", "Not applicable", { options: ["Not applicable", "Not pregnant", "Pregnant"] })];
  const sev = ["Mild", "Moderate", "Severe"];
  const allergies = v4MedList("Allergies", [{ key: "a", label: "Allergy", w: 100, grow: true }, { key: "r", label: "Reaction", w: 100, render: (r) => `<span class="text-gray-600">${esc(r.r)}</span>` }, { key: "s", label: "Severity", w: 116, edit: "select", options: sev, render: (r) => `<span class="text-gray-600">${esc(r.s)}</span>` }],
    [{ a: "Latex", r: "Hives", s: "Moderate" }, { a: "Codeine", r: "Nausea", s: "Mild" }], "Add allergy");
  /* one value per cell: the "Once a day · blood pressure" and "Since 2019 · on medication" strings became columns */
  const grey = (k) => (r) => `<span class="${r[k] === "—" ? "text-gray-400" : "text-gray-600"}">${esc(r[k])}</span>`; // "—": not known, in grey
  const meds = v4MedList("Medications", [{ key: "m", label: "Medication", w: 120, grow: true }, { key: "d", label: "Directions", w: 112, render: grey("d") }, { key: "n", label: "Note", w: 128, render: grey("n") }],
    [{ m: "Metoprolol 25 mg", d: "Once a day", n: "Blood pressure" }, { m: "Atorvastatin 20 mg", d: "At night", n: "Cholesterol" }, { m: "Aspirin 81 mg", d: "Once a day", n: "May bleed more" }], "Add medication");
  const conds = v4MedList("Conditions", [{ key: "c", label: "Condition", w: 220 }, { key: "since", label: "Since", w: 120, render: grey("since") }, { key: "d", label: "Note", w: 200, grow: true, render: grey("d") }],
    [{ c: "Hypertension", since: "2019", d: "On medication" }, { c: "Knee replacement", since: "Feb 2024", d: "—" }, { c: "Osteoarthritis", since: "—", d: "Hands and knees" }], "Add condition");
  const head = (t, n) => `<h3 class="${R.groupTitle} mb-2 flex items-center gap-2">${t}${n ? ` <span class="${R.count}" data-med-count>${n}</span>` : ""}</h3>`;
  return `<div class="flex items-center justify-between gap-4 mb-4">
      <div>${old ? flag(`Last reviewed Mar 3, 2025. Review it with Olivia at check-in.`, "!text-gray-700") : `<p class="text-[13px] text-gray-500">Reviewed with the patient today at 10:41 AM · Jordan Kim, RDH</p>`}</div>
      <div class="flex items-center gap-1.5">${button("Send history form", { v: "white", s: "sm", icon: "send" })}${button("Mark reviewed", { v: old ? "solid" : "white", s: "sm", icon: "clipboard-check", attrs: chg4("Update history and Review now are one Mark reviewed button: the lists below are edited where they are, so the button only records that the history was gone over with the patient.") })}</div></div>
    <div class="grid grid-cols-2 gap-x-12 gap-y-6">
      <section><div class="flex items-center justify-between mb-2"><h3 class="${R.groupTitle} flex items-center gap-2">Patient alerts <span class="${R.count}">2</span></h3>${button("Manage patient alerts", { v: "white", s: "xs" })}</div>
        <div${chg4("The alerts are the same table as the lists below them: the alert and what to do, one line each. Why (her knee replacement, Feb 2024, per her surgeon; the latex reaction) opens on hover in a card beside the row.")}>${sheetTable({ preset: "section", sheet: false, sortable: false, title: "Patient alerts",
          rows: [{ id: "a0", a: "Premedicate", needs: true, d: "Amoxicillin 2 g, 1 hour before", why: [["What to do", "Amoxicillin 2 g, 1 hour before any cleaning or surgery"], ["Why", "Knee replacement, Feb 2024"], ["Ordered by", "Her surgeon"]] },
            { id: "a1", a: "Latex allergy", d: "Nitrile gloves, latex-free dam", why: [["What to do", "Use nitrile gloves and a latex-free dam"], ["Reaction", "Hives"], ["Severity", "Moderate"]] }],
          peek: (r) => peekCard(esc(r.a), r.why),
          columns: [{ key: "a", label: "Alert", w: 136, render: (r) => `<span class="inline-flex items-center gap-2 font-medium text-gray-800">${I(r.needs ? "circle-alert" : "pill", `size-4 shrink-0 ${r.needs ? "text-orange-500" : "text-gray-400"}`)}${esc(r.a)}</span>` },
            { key: "d", label: "What to do", w: 160, grow: true, render: (r) => `<span class="text-gray-600">${esc(r.d)}</span>` },
            { key: "s", label: "", w: 108, render: (r) => (r.needs ? `<span class="flex justify-end">${button("Snooze today", { v: "quiet", s: "xs", cls: "-my-1" })}</span>` : "") }] })}</div></section>
      <section>${head(old ? "Vitals · last taken Mar 3, 2025" : "Vitals · today")}<div${chg4("Vitals are a table you type into, one reading per line, instead of a box of four numbers. It has a header row and 36px rows like the alert, allergy and medication tables around it.")}>${v4PtHeaded(vitals, ["Vital", "Reading"], { labelW: 140, title: "Vitals" })}</div></section>
      <section>${head("Allergies", 2)}<div${chg4("Allergies, medications and conditions are lists you type into: click a cell to fix it, and type on the empty last line to add one.")}>${allergies}</div></section>
      <section>${head("Medications", 3)}<div${chg4("One value per cell: directions and what the medicine is for (or what to watch, like Aspirin's bleeding) are their own columns, instead of “Once a day · blood pressure” in one cell.")}>${meds}</div></section>
      <section class="col-span-2">${head("Conditions", 3)}<div${chg4("Since when is its own column, so “Since 2019 · on medication” isn't two facts in one cell; an unknown date reads as a grey dash.")}>${conds}</div></section></div>`;
}
function medicalHtml(state = "Reviewed today") {
  if (V4) return v4MedicalHtml(state);
  const old = state === "Out of date";
  const list = (rows) => `<ul class="divide-y divide-gray-200/80 rounded-lg border border-gray-200/80 [&>li]:px-3">${rows.map(([a, b, c = ""]) => `<li class="flex items-center justify-between gap-4 min-h-10 py-1.5"><div class="min-w-0"><p class="text-sm text-gray-800">${a}</p>${b ? `<p class="${R.caption}">${b}</p>` : ""}</div>${c ? `<span class="shrink-0 text-[13px] text-gray-500">${c}</span>` : ""}</li>`).join("")}</ul>`;
  const vital = (k, v, sub) => `<div class="min-w-0"><p class="text-xs text-gray-500${V2 ? " truncate whitespace-nowrap" : ""}">${k}</p><p class="mt-0.5 text-sm font-medium text-gray-800 tabular-nums">${v}</p>${sub ? `<p class="text-xs text-gray-500">${sub}</p>` : ""}</div>`;
  return `<div class="flex items-center justify-between gap-4 mb-4">
      <div>${old ? flag(`Last reviewed Mar 3, 2025. Review it with Olivia at check-in.`, "!text-gray-700") : `<p class="text-[13px] text-gray-500">Reviewed with the patient today at 10:41 AM · Jordan Kim, RDH</p>`}</div>
      <div class="flex items-center gap-1.5">${button("Send history form", { v: "white", s: "sm", icon: "send" })}${button(old ? "Review now" : "Update history", { v: old ? "solid" : "white", s: "sm", icon: "clipboard-pen" })}</div></div>
    <div class="grid grid-cols-2 gap-x-12 gap-y-6">
      <section><div class="flex items-center justify-between mb-2"><h3 class="${R.groupTitle} flex items-center gap-2">Patient alerts <span class="${R.count}">2</span></h3>${V2 ? `<span${chg("Manage patient alerts is a small white button, not a blue link.")}>${button("Manage patient alerts", { v: "white", s: "xs" })}</span>` : button("Manage patient alerts", { v: "link", s: "xs" })}</div>
        <ul class="divide-y divide-gray-200/80 rounded-lg border border-gray-200/80 [&>li]:px-3">
          <li class="flex items-start gap-3 py-2.5">${I("circle-alert", "size-4 mt-0.5 shrink-0 text-orange-500")}<div class="min-w-0 grow"><p class="text-sm font-medium text-gray-800">Premedicate</p><p class="${R.help}">Amoxicillin 2 g, 1 hour before any cleaning or surgery. Knee replacement, Feb 2024, per her surgeon.</p></div>${button("Snooze today", { v: "quiet", s: "xs" })}</li>
          <li class="flex items-start gap-3 py-2.5">${I("pill", "size-4 mt-0.5 shrink-0 text-gray-400")}<div class="min-w-0 grow"><p class="text-sm font-medium text-gray-800">Latex allergy</p><p class="${R.help}"${chg("The alert says only what changes the visit (nitrile gloves). The reaction is said once, under Allergies.")}>${V2 ? "Use nitrile gloves and a latex-free dam." : "Hives. Use nitrile gloves and a latex-free dam."}</p></div></li></ul></section>
      <section><h3 class="${R.groupTitle} mb-2">${old ? "Vitals · last taken Mar 3, 2025" : "Vitals · today"}</h3>
        <div class="grid grid-cols-4 gap-4 rounded-lg border border-gray-200/80 px-3 py-3${V2 ? " items-start" : ""}">${vital("Blood Pressure", old ? "132/84" : "138/86", old ? "" : "Slightly high")}${vital("Heart Rate", old ? "70 bpm" : "72 bpm")}${vital(V2 ? `<span title="Smoking / Tobacco"${chg("The tobacco label fits on one line, so Never lines up with the other three values (it sat 16px lower).")}>Tobacco</span>` : "Smoking / Tobacco", "Never")}${vital("Pregnancy Status", "Not applicable")}</div></section>
      <section><h3 class="${R.groupTitle} mb-2 flex items-center gap-2">Allergies <span class="${R.count}">2</span></h3>${list([["Latex", "Hives", "Moderate"], ["Codeine", "Nausea", "Mild"]])}</section>
      <section><h3 class="${R.groupTitle} mb-2 flex items-center gap-2">Medications <span class="${R.count}">3</span></h3>${list([["Metoprolol 25 mg", "Once a day · blood pressure"], ["Atorvastatin 20 mg", "At night · cholesterol"], ["Aspirin 81 mg", "Once a day · may bleed more"]])}</section>
      <section class="col-span-2"${chg("Knee replacement no longer repeats “needs premedication”; the Premedicate alert at the top says it.")}><h3 class="${R.groupTitle} mb-2 flex items-center gap-2">Conditions <span class="${R.count}">3</span></h3>
        <div class="grid grid-cols-3 gap-x-8 rounded-lg border border-gray-200/80 px-3 py-1">${[["Hypertension", "Since 2019 · on medication"], ["Knee replacement", V2 ? "Feb 2024" : "Feb 2024 · needs premedication"], ["Osteoarthritis", "Hands and knees"]].map(([a, b]) => `<div class="py-1.5"><p class="text-sm text-gray-800">${a}</p><p class="${R.caption}">${b}</p></div>`).join("")}</div></section></div>`;
}

/* The chart block: header, tabs, and the tab body. Tabs with a block of their own switch for real. */
const TAB_BODY = { 0: () => overview(), 2: () => familyHtml("Just one member"), 3: () => insuranceHtml(), 4: () => medicalHtml() };
function renderTab(el, i) {
  const body = el.querySelector("[data-tab-body]");
  body.innerHTML = TAB_BODY[i] ? TAB_BODY[i]() : `<div class="py-10 text-center"><p class="text-sm font-medium text-gray-800">${CHART_TABS[i][0]}</p><p class="${R.help}">This tab is drawn in its own group of blocks (Charting & treatment, Billing & payments, Forms, Messages).</p></div>`;
  icons(); const g = body.querySelector('[data-grid="family"]'); if (g) mountFamily(g, true, V4);
}
defineBlock({
  cat: "patients", id: "patients-chart", title: "Patient chart header and tabs",
  note: V2 ? "The top of a patient's chart: one bar with who they are and the quick actions (Collect payment is the one blue button), one line of alerts (orange only for Premedicate), and one line of facts: insurance, balances and the next visit. Overview, Family, Insurance and Medical Hx switch for real."
    : "The top of a patient's chart: who they are, alerts (orange only for Premedicate), insurance status, balances and the next visit on one line, with Collect payment as the one blue button. Overview, Family, Insurance and Medical Hx switch for real.",
  where: "PMS › Charts › a patient",
  states: ["Olivia Nguyen", "New patient", "Loading"],
  canvas: "bare",
  html: (state) => V4 ? v4ChartPage(state) : `${V2 ? v2ChartTop(state) : `${workspaceHeader({ parent: "Charts", title: state === "Loading" ? "Loading chart…" : state === "New patient" ? "Isabella Kim" : "Olivia Nguyen", actions: `${iconButton("chevron-up", "Previous patient", { s: "iconSm" })}${iconButton("chevron-down", "Next patient", { s: "iconSm" })}` })}
    ${chartHeader(state)}`}
    <div data-chart-tabs${V2 && state === "Loading" ? chg("Tab counts wait for the chart to load instead of showing numbers before the data arrives.") : ""}>${tabsWithSlot(CHART_TABS.map(([l, n]) => (n != null && !(V2 && state === "Loading") ? [l, state === "New patient" && l !== "Family" ? 0 : n] : l)), 0, "", "px-5 [&_nav]:!gap-x-4")}</div>
    <div class="px-5 py-5" data-tab-body>${state === "Loading" ? `<div class="grid grid-cols-2 gap-x-12">${[0, 1].map(() => `<div class="space-y-3">${skel("w-32", "h-4")}${Array.from({ length: 5 }, (_, i) => `<div class="grid grid-cols-[168px_1fr] gap-3">${skel("w-24")}${skel(["w-40", "w-28", "w-52", "w-32", "w-24"][i])}</div>`).join("")}</div>`).join("")}</div>` : state === "New patient" ? overview("Complete", "p9") : overview()}</div>`,
  mount: (el, state) => { if (state !== "Olivia Nguyen") return; wireTabs(el.querySelector("[data-chart-tabs]"), (i) => renderTab(el, i)); if (V4) v4WireMore(el, (i) => renderTab(el, i)); }
});

/* ================================================================ 3. Overview */
defineBlock({
  cat: "patients", id: "patients-overview", title: "Overview: contact and responsible party",
  note: V2 ? "The Overview tab: flat key-value rows in two columns. Click any value to edit it in place. Missing details read as a grey “Add …” prompt, with a small orange mark where the front desk must ask." : "The Overview tab: flat key-value rows in two columns, each group with its own Edit. Nothing is boxed. Missing details say so in grey with a small orange mark, so the front desk knows what to ask for.",
  where: "PMS › Charts › Overview",
  states: ["Complete", "Missing details"],
  canvas: "white",
  html: (state) => overview(state)
});

/* ================================================================ 4. Family */
defineBlock({
  cat: "patients", id: "patients-family", title: "Family members",
  note: "Everyone billed together, with the guarantor marked and each person's total outstanding. The row menu has the family actions; removing someone is the only red item.",
  where: "PMS › Charts › Family",
  states: ["Walker family", "Just one member"],
  canvas: "white",
  html: (state) => familyHtml(state),
  mount: (el, state) => mountFamily(el.querySelector('[data-grid="family"]'), state === "Just one member")
});

/* ================================================================ 5. Insurance and benefits */
defineBlock({
  cat: "patients", id: "patients-insurance", title: "Insurance and benefits",
  note: "The plan on file and what's left: annual maximum and deductible as blue meters, coverage by category, frequency limits and waiting periods. A mismatch with the payer's portal shows as one orange note with the fix.",
  ...(V2 ? { note: "The plan on file and what's left: annual maximum and deductible as blue meters that fill with what remains, coverage by category, frequency limits and waiting periods. A mismatch with the payer's portal is one orange mark by the field, with the fix on hover." } : {}),
  where: "PMS › Charts › Insurance",
  states: ["Verified", "Needs review", "Verifying"],
  canvas: "white",
  html: (state) => insuranceHtml(state)
});

/* ================================================================ 6. Medical history and alerts */
defineBlock({
  cat: "patients", id: "patients-medical", title: "Medical history and alerts",
  note: "Alerts first, then vitals, allergies, medications and conditions. Premedicate is the one orange item because the team must act on it before treatment. When the history is old, the page asks for a review.",
  where: "PMS › Charts › Medical Hx",
  states: ["Reviewed today", "Out of date"],
  canvas: "white",
  html: (state) => medicalHtml(state)
});

/* ================================================================ 7. New patient panel */
const fadedList = () => `${listHeader()}${listTabs(15)}<div class="px-4"><div class="py-2.5 flex items-center gap-2">${searchBox("Search by name, DOB, or chart number…", { w: "w-72" })}<span class="ms-auto">${button("New patient", { v: "solid", s: "sm", icon: "user-plus" })}</span></div>
  <table class="w-full table-fixed border-separate border-spacing-0 border-y border-gray-200/80"><thead><tr>${["Patient", "Chart #", "Status", "Provider", "Last Visit", "Balance"].map((h) => `<th class="${R.gridHead}">${h}</th>`).join("")}</tr></thead>
  <tbody>${listRows().sort((a, b) => a.name.localeCompare(b.name)).slice(0, 15).map((r) => `<tr><td class="${R.gridCell}"><span class="inline-flex items-center gap-2">${avatar(r.name, { size: 5 })}${r.name}</span></td><td class="${R.gridCell} tabular-nums">${r.chart}</td><td class="${R.gridCell}">${statusDot(PT_STATUS[r.st].label, PT_STATUS[r.st].tone)}</td><td class="${R.gridCell}">${DATA.provider(r.prov).name}</td><td class="${R.gridCell}">${r.lastVisit ? fmtDateY(r.lastVisit) : "—"}</td><td class="${R.gridCell} text-end tabular-nums">${money(r.balance)}</td></tr>`).join("")}</tbody></table></div>`;
/* v4: a new patient is the same table of fields as their Overview: type down the list, Enter moves to the next line */
function v4NewPatient(dup) {
  const f = (label, value = "", o = {}) => ({ label, value: dup ? value : o.keep ? value : "", type: o.options ? "select" : "text", options: o.options, html: o.html });
  const num = (r) => `<span class="tabular-nums">${esc(r.value)}</span>`, opt = ["Opted in", "Opted out"];
  const body = `${dup ? `<section class="${R.psec}">${note(`This looks like <span class="font-medium text-gray-800">Ava Thompson</span>, born Mar 14, 1988, chart #10012.`)}<div class="mt-2 ms-6 flex gap-2">${button("View record", { v: "white", s: "xs" })}${button("Create new record anyway", { v: "quiet", s: "xs" })}</div></section>` : ""}
    ${psec("Personal", `<div${chg4("A new patient is a table of fields you type into, the same as their Overview: type, press Enter, and the next line is ready. The boxes, the dental-care switch and the Self / Someone else switch became lines in the table.")}>${fieldTable([f("First name", "Ava"), f("Middle name"), f("Last name", "Thompson"), f("Date of birth", "03/14/1988", { html: num }),
      f("Gender", "", { options: ["Female", "Male", "Other", "Prefer not to say"] }), f("Preferred language", "English", { keep: true, options: ["English", "Spanish", "Vietnamese", "Mandarin"] }),
      f("Receives dental care", "Yes", { keep: true, options: ["Yes", "No, only pays or is a contact"] })], { labelW: 156, title: "Personal" })}</div>`)}
    ${psec("Contact", fieldTable([f("Cell phone", "(415) 555-0132", { html: num }), f("Email"), f("Preferred contact", "Text message", { keep: true, options: ["Text message", "Phone call", "Email"] }),
      f("Text messages", "Opted in", { keep: true, options: opt }), f("Email messages", "Opted in", { keep: true, options: opt }), f("Mail", "Opted out", { keep: true, options: opt })], { labelW: 156, title: "Contact" }))}
    ${psec("Billing", fieldTable([f("Responsible party", "Self", { keep: true, options: ["Self", "Someone else"] }), f("Statements by", "Text", { keep: true, options: ["Text", "Email", "Text and email", "Mail"] })], { labelW: 156, title: "Billing" }))}
    ${psec("Insurance", `<p class="text-sm text-gray-500">No insurance on file</p>`, { actions: button("Add insurance", { v: "white", s: "xs", icon: "plus" }) })}
    ${psec("Notes", `<textarea class="${R.textarea} !min-h-16" aria-label="Notes" placeholder="Any additional notes for front desk or staff..."></textarea>`)}`;
  return `<div class="relative overflow-hidden ${dup ? "h-[1040px]" : "h-[940px]"}"><div class="absolute inset-0 overflow-hidden" aria-hidden="true" inert data-scroll-ok><div class="w-[1096px] opacity-45 pointer-events-none">${fadedList()}</div></div>
    <div class="absolute inset-y-0 end-0 flex">${sheetPanel({ flush: true, w: 520, body, footer: `<span class="${R.caption} grow">You can add forms and insurance later.</span>${button("Cancel", { v: "white", s: "sm" })}${button("Save patient", { v: "solid", s: "sm" })}`,
      /* once a name is typed, the panel's header is the patient's one header (what patientHeader draws), marked New patient */
      ...(dup ? { title: `<span${chg4("Once a name is typed, the panel's header is the patient's one header: her name, the New patient mark and where she's being added.")}>Ava Thompson</span>`, lead: avatar("Ava Thompson", { size: 9 }), marks: patientMarks({ newPatient: true }), subtitle: "Not saved yet · Bayview Family Dental" }
        : { title: "New patient", subtitle: "Bayview Family Dental" }) })}</div></div>`;
}
defineBlock({
  cat: "patients", id: "patients-new", title: "New patient panel",
  note: "Adding a patient from the Charts page, in one side panel: name and birthday, how to reach them, who pays, and insurance if they have it. If the name and birthday match someone already in Asha, it says who before you save.",
  where: "PMS › Charts › New patient",
  states: ["Blank", "Possible duplicate"],
  canvas: "bare",
  html: (state) => {
    const dup = state === "Possible duplicate";
    const v = (x) => (dup ? `value="${x}"` : "");
    const lbl = (t, id, req) => `<label class="${R.label} block mb-1.5" for="${id}">${t}${req ? ' <span class="text-gray-400 font-normal">required</span>' : ""}</label>`;
    if (V4) return v4NewPatient(dup);
    const body = `${dup ? `<section class="${R.psec}">${note(`This looks like <span class="font-medium text-gray-800">Ava Thompson</span>, born Mar 14, 1988, chart #10012.`)}<div class="mt-2 ms-6 flex gap-2">${button("View record", { v: "white", s: "xs" })}${button("Create new record anyway", { v: "quiet", s: "xs" })}</div></section>` : ""}
      ${psec("Personal", `<div class="grid grid-cols-3 gap-3"><div>${lbl("First name", "np1", true)}<input id="np1" class="${R.input}" placeholder="First name" ${v("Ava")} /></div><div>${lbl("Middle name", "np2")}<input id="np2" class="${R.input}" placeholder="Optional" /></div><div>${lbl("Last name", "np3", true)}<input id="np3" class="${R.input}" placeholder="Last name" ${v("Thompson")} /></div></div>
        <div class="grid grid-cols-3 gap-3 mt-3"><div>${lbl(V2 ? "Date of birth" : "Date of Birth", "np4", true)}<input id="np4" class="${R.input} tabular-nums" placeholder="MM/DD/YYYY" ${v("03/14/1988")} /></div><div>${lbl("Gender", "np5")}<button id="np5" type="button" class="${R.select}"><span class="text-gray-400">Select</span>${I("chevrons-up-down")}</button></div><div>${lbl(V2 ? "Preferred language" : "Preferred Language", "np6")}<button id="np6" type="button" class="${R.select}">English${I("chevrons-up-down")}</button></div></div>
`)}
      <section class="${R.psec} flex items-center justify-between gap-4 !py-3"><div><p class="${R.label}">Receives dental care</p><p class="${R.help}">Off creates a non-patient contact, like a parent who only pays.</p></div>${sw(true, "Receives dental care")}</section>
      ${psec("Contact", `<div class="grid grid-cols-2 gap-3"><div>${lbl(V2 ? "Cell phone" : "Cell Phone", "np7")}<input id="np7" class="${R.input} tabular-nums" placeholder="(555) 555-0100" ${v("(415) 555-0132")} /></div><div>${lbl("Email", "np8")}<input id="np8" class="${R.input}" placeholder="name@example.com" /></div></div>
        <div class="grid grid-cols-2 gap-3 mt-3"><div>${lbl("Preferred Contact", "np9")}<button id="np9" type="button" class="${R.select}">Text message${I("chevrons-up-down")}</button></div><div><p class="${R.label} mb-1.5">Communication opt-ins</p><div class="flex items-center gap-4 h-9">${["SMS", "Email", "Mail"].map((c, i) => `<label class="inline-flex items-center gap-2 text-sm">${checkbox(i < 2, `${c} opt-in`)}${c}</label>`).join("")}</div></div></div>`)}
      ${psec("Responsible party", `<div class="flex items-center justify-between gap-3">${segmented(["Self", "Someone else"], 0, { sm: true })}<span class="${R.help}">Statements go to this person.</span></div>`)}
      ${psec("Insurance", `<p class="text-sm text-gray-500">No insurance on file</p>`, { actions: button("Add insurance", { v: "white", s: "xs", icon: "plus" }) })}
      ${psec("Notes", `<textarea class="${R.textarea} !min-h-16" aria-label="Notes" placeholder="Any additional notes for front desk or staff..."></textarea>`)}`;
    return `<div class="relative overflow-hidden ${dup ? "h-[1040px]" : "h-[940px]"}"><div class="absolute inset-0 overflow-hidden" aria-hidden="true" inert data-scroll-ok><div class="w-[1096px] opacity-45 pointer-events-none">${fadedList()}</div></div>
      <div class="absolute inset-y-0 end-0 flex">${sheetPanel({ flush: true, title: V2 ? `<span${chg("“New patient”, “Date of birth”, “Preferred language” and “Cell phone” are in sentence case, like the New patient button that opens this panel.")}>New patient</span>` : "New Patient", subtitle: "Bayview Family Dental", w: 520, body, footer: `<span class="${R.caption} grow">You can add forms and insurance later.</span>${button("Cancel", { v: "white", s: "sm" })}${button("Save patient", { v: "solid", s: "sm" })}` })}</div></div>`;
  }
});

/* v4 notes, read when the page draws (a review page can flip V4) */
const v4Note = (id, text) => { const b = BLOCKS.find((x) => x.id === id); if (!b) return; const was = b.note;
  Object.defineProperty(b, "note", { configurable: true, enumerable: true, get: () => (V4 ? text : was) }); };
v4Note("patients-chart", "A patient's chart in Asha's real layout: the patient panel down the left (the one patient header with alerts and the family balance as marks by the name, the key facts stacked, Schedule, Text and Collect payment with the ⋯ for the rest), and the tabs with the tab's content on the right. Overview, Family, Insurance and Medical Hx switch for real, and their fields are cells you type into.");
v4Note("patients-list", "The Charts page: one bar, the tabs, then the patient grid with search, Providers and Last visit in its toolbar. Every column has a value on every row (Status on each patient, a grey $0.00, None scheduled or None where there's nothing). Premedicate is the only alert in orange, because someone has to act on it. Click a name to preview the patient under the one patient header.");
v4Note("patients-overview", "The Overview tab: two columns of small tables you type into. Click a value or just type; Enter saves and moves down, and lists search as you type. An empty value reads “Add …”.");
v4Note("patients-family", "Everyone billed together: who, how they're related, their role, insurance and what they owe. Rest the pointer on a row for their age, birthday, phone and next visit. Relationship and Role are cells you type into; picking a new guarantor moves the role from the old one. The row menu has the other family actions; removing someone is the only red item.");
v4Note("patients-insurance", "The plan on file and what's left. The plan's facts (its status first), the coverage percentages and the frequency limits are cells you type into. A mismatch with the payer's portal is one orange icon in its cell, and Actions suggests the comparison.");
v4Note("patients-medical", "Alerts first, then vitals, allergies, medications and conditions as tables you type into, one value per cell; type on the empty last line to add one. Rest the pointer on an alert for why it's there. Premedicate is the one orange item. When the history is old, Mark reviewed is the blue button.");
v4Note("patients-new", "Adding a patient from the Charts page: one table of fields you type down, the same as their Overview, then insurance and notes. If the name and birthday match someone already in Asha, it says who before you save.");

})();
