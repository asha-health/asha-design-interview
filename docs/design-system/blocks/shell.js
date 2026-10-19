/* Shell blocks. Sources: components/Basic/PracticeSidebar/ (PracticeSidebarUtil, PracticeSidebarView, PracticeSwitcher),
 * asha-ui/layout.tsx (AshaWorkspaceHeader), asha-ui/overlays.tsx (AshaCommandPalette, AshaConfirmDialog),
 * asha-ui/toolbar.tsx, asha-ui/settings-rows.tsx (AshaSetupSteps), routes/practice/home/components/SetupChecklist.tsx. */
(() => {

/* ---------- shared local data ---------- */
const PRACTICE = { name: "Bayview Family Dental", city: "Walnut Creek, CA" };
const ME = { name: "Nina Flores", role: "Office manager", email: "nina@bayviewfamilydental.com" };

/* Real sidebar sections and items (PracticeSidebarUtil.tsx). count: [n, "you"|"unread"] */
const NAV = [
  ["Main", [["house", "Home"], ["bot", "AI Staff"], ["square-check", "Tasks", [12, "you"]], ["trending-up", "ROI Reports"]]],
  ["PMS", [["calendar", "Scheduling"], ["file-heart", "Charts"], ["list-checks", "Lists"], ["flask-conical", "Labs"], ["clipboard-check", "Treatment Plans"], ["stethoscope", "Imaging"], ["file-text", "Documents"], ["mic", "Scribe"], ["receipt", "Fee Schedules"]]],
  ["Communications", [["phone", "Calls"], ["mail", "Faxes", [3, "unread"]], ["message-square", "Messaging", [5, "unread"]], ["megaphone", "Campaigns"], ["clipboard-list", "Forms"], ["users", "Team Chat", [2, "unread"]]]],
  ["Revenue Cycle", [["clipboard-list", "RCM Overview"], ["inbox", "Biller Tasks"], ["receipt", "Claims"], ["dollar-sign", "Payments"], ["file-text", "Statements"], ["credit-card", "EOBs"], ["landmark", "Bank Transactions"], ["chart-column", "Reporting & Analytics"], ["chart-line", "Revenue Intelligence"]]],
  ["Other", [["settings", "Settings"], ["graduation-cap", "Learning Center"], ["life-buoy", "Support"]]]
];

const logoMark = (size = "size-7") => `<span class="flex ${size} shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-semibold" aria-hidden="true">a</span>`;
const practiceMark = (size = 7) => avatar(PRACTICE.name, { size, square: true, solid: true });

/* The practice switcher trigger at the top of the sidebar */
const switcherTrigger = (open = false) => `<button type="button" aria-haspopup="dialog" aria-expanded="${open}" aria-label="Switch practice, current: ${esc(PRACTICE.name)}"
  class="flex w-full items-center gap-2 h-12 px-2 rounded-lg border ${open ? "border-blue-500 ring-3 ring-blue-600/15" : "border-gray-200/80 hover:bg-gray-50"} bg-white text-start cursor-pointer">
  ${practiceMark(7)}<span class="min-w-0 grow"><span class="block truncate text-[13px] font-medium text-gray-800">${esc(PRACTICE.name)}</span><span class="block truncate text-xs text-gray-500">${PRACTICE.city}</span></span>${I("chevrons-up-down", "size-4 shrink-0 text-gray-400")}</button>`;

/* The user button at the bottom of the sidebar */
const userButton = (open = false) => `<button type="button" aria-haspopup="menu" aria-expanded="${open}" class="flex w-full items-center gap-2.5 h-12 px-2 rounded-lg ${open ? "bg-gray-100" : "hover:bg-gray-100"} text-start cursor-pointer">
  ${avatar(ME.name, { size: 8 })}<span class="min-w-0 grow"><span class="block truncate text-sm font-medium text-gray-800">${ME.name}</span><span class="block truncate text-xs text-gray-500">${ME.role}</span></span>
  <span class="${R.countBlue}" aria-label="2 pending invitations">2</span>${I("chevron-up", "size-4 shrink-0 text-gray-400")}</button>`;

const navCount = (c, on) => (c ? `<span class="ms-auto ${c[1] === "you" || on ? R.countBlue : R.count}" aria-label="${c[0]} ${c[1] === "you" ? "assigned to you" : "unread"}">${c[0]}</span>` : "");

/* v2: the 44px header row is the practice switcher (Attio's workspace row), so the sidebar's first line meets the page header's */
const v2ShellSwitcher = (open = false) => `<button type="button" aria-haspopup="dialog" aria-expanded="${open}" aria-label="Switch practice, current: ${esc(PRACTICE.name)}"
  class="flex min-w-0 grow items-center gap-2 h-8 px-1.5 rounded-lg ${open ? "bg-gray-100" : "hover:bg-gray-100"} text-start cursor-pointer"${chg("The practice switcher is the sidebar's 44px header row: no separate \"Asha Health\" brand row and no bordered card, so the first line meets the page header's line")}>
  ${practiceMark(6)}<span class="min-w-0 grow truncate text-[13px] font-medium text-gray-800">${esc(PRACTICE.name)}</span>${I("chevrons-up-down", "size-4 shrink-0 text-gray-400")}</button>`;
const v2NavItem = (ic, l, c, active, mark = "") => `<a href="#" data-nav-item="${esc(l)}" class="${l === active ? R.navItemOn : R.navItem}" ${l === active ? 'aria-current="page"' : ""}${mark}>${I(ic)}<span class="truncate">${esc(l)}</span>${navCount(c, l === active)}</a>`;
function v2SidebarExpanded(active, { switcherOpen = false, userOpen = false } = {}) {
  return `<aside class="flex h-full w-[248px] shrink-0 flex-col border-e border-gray-200/80 bg-white" aria-label="Main menu">
    <div class="${R.bar} !gap-1 !px-2">${v2ShellSwitcher(switcherOpen)}${iconButton("panel-left", "Collapse sidebar", { s: "iconSm" })}</div>
    <nav class="min-h-0 grow overflow-y-auto px-2 pt-2 pb-3" data-nav>
      ${NAV.map(([g, items], gi) => `${gi ? `<p class="${R.navGroup}">${g}</p>` : ""}${items.map(([ic, l, c], i) => v2NavItem(ic, l, c, active, !gi && !i ? chg("No \"Main\" label over the first group: Home, AI Staff and Tasks need no heading") : "")).join("")}`).join("")}
    </nav>
    <div class="shrink-0 border-t border-gray-200/80 p-2">${userButton(userOpen)}</div></aside>`;
}
function v2SidebarCollapsed(active, tipFor = "Tasks") {
  let tipTop = 0, y = 44 + 4; /* header + nav padding; Tasks sits in the first group, before any separator */
  const groups = NAV.map(([g, items], gi) => `${gi ? '<span class="block mx-3 my-2 border-t border-gray-200/80" aria-hidden="true"></span>' : ""}<p class="sr-only">${g}</p>${items.map(([ic, l, c], i) => {
    if (l === tipFor) tipTop = y; y += 40;
    return `<a href="#" data-nav-item="${esc(l)}" aria-label="${esc(l)}${c ? `, ${c[0]} ${c[1] === "you" ? "assigned to you" : "unread"}` : ""}" class="relative mx-auto flex size-9 items-center justify-center rounded-lg ${l === active ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"} cursor-pointer" ${l === active ? 'aria-current="page"' : ""}${!gi && !i ? chg("Rail icons are 16px, the same as in the open sidebar (they were 18px)") : ""}>${I(ic, "size-4")}${c ? '<span class="absolute top-1.5 end-1.5 size-2 rounded-full bg-blue-600 ring-2 ring-white" aria-hidden="true"></span>' : ""}</a>`;
  }).join('<span class="block h-1"></span>')}`).join("");
  return `<aside class="relative flex h-full w-14 shrink-0 flex-col border-e border-gray-200/80 bg-white" aria-label="Main menu, collapsed">
    <div class="${R.bar} justify-center !px-0"${chg("The rail's top is the 44px practice row, in line with the page header; Expand moves to the bottom beside you")}><button type="button" class="rounded-md cursor-pointer" aria-label="Switch practice, current: ${esc(PRACTICE.name)}" title="${esc(PRACTICE.name)}">${practiceMark(7)}</button></div>
    <nav class="min-h-0 grow overflow-y-auto [scrollbar-width:none] pt-1" data-nav>${groups}</nav>
    <div class="shrink-0 border-t border-gray-200/80 flex flex-col items-center gap-1 py-2">${iconButton("panel-left", "Expand sidebar", { s: "iconSm" })}<button type="button" class="relative rounded-full cursor-pointer" aria-label="Open user menu, 2 pending invitations">${avatar(ME.name, { size: 8 })}<span class="absolute -top-0.5 -end-0.5 size-2.5 rounded-full bg-blue-600 ring-2 ring-white" aria-hidden="true"></span></button></div>
    <span class="${R.tooltip} absolute start-[52px] z-10 whitespace-nowrap" style="top:${tipTop + 10}px" role="tooltip">Tasks <span class="text-white/60">12 assigned to you</span></span>
  </aside>`;
}

function sidebarExpanded(active, opts = {}) {
  if (V2) return v2SidebarExpanded(active, opts);
  const { switcherOpen = false, userOpen = false } = opts;
  return `<aside class="flex h-full w-[248px] shrink-0 flex-col border-e border-gray-200/80 bg-white" aria-label="Main menu">
    <div class="flex h-14 shrink-0 items-center justify-between gap-2 px-3 border-b border-gray-200/80">
      <span class="flex items-center gap-2.5">${logoMark()}<span class="text-sm font-semibold text-gray-800">Asha Health</span></span>
      ${iconButton("panel-left", "Collapse sidebar", { s: "iconSm" })}</div>
    <div class="shrink-0 px-2 pt-2">${switcherTrigger(switcherOpen)}</div>
    <nav class="min-h-0 grow overflow-y-auto px-2 pb-3" data-nav>
      ${NAV.map(([g, items]) => `<p class="${R.navGroup}">${g}</p>${items.map(([ic, l, c]) => `<a href="#" data-nav-item="${esc(l)}" class="${l === active ? R.navItemOn : R.navItem}" ${l === active ? 'aria-current="page"' : ""}>${I(ic)}<span class="truncate">${esc(l)}</span>${navCount(c, l === active)}</a>`).join("")}`).join("")}
    </nav>
    <div class="shrink-0 border-t border-gray-200/80 p-2">${userButton(userOpen)}</div></aside>`;
}

function sidebarCollapsed(active, tipFor = "Tasks") {
  if (V2) return v2SidebarCollapsed(active, tipFor);
  let tipTop = 0, y = 56 + 48; /* header + switcher */
  const groups = NAV.map(([g, items], gi) => `${gi ? '<span class="block mx-3 my-2 border-t border-gray-200/80" aria-hidden="true"></span>' : ""}<p class="sr-only">${g}</p>${items.map(([ic, l, c]) => {
    if (l === tipFor) tipTop = y; y += 40;
    return `<a href="#" data-nav-item="${esc(l)}" aria-label="${esc(l)}${c ? `, ${c[0]} ${c[1] === "you" ? "assigned to you" : "unread"}` : ""}" class="relative mx-auto flex size-9 items-center justify-center rounded-lg ${l === active ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"} cursor-pointer" ${l === active ? 'aria-current="page"' : ""}>${I(ic, "size-[18px]")}${c ? '<span class="absolute top-1.5 end-1.5 size-2 rounded-full bg-blue-600 ring-2 ring-white" aria-hidden="true"></span>' : ""}</a>`;
  }).join('<span class="block h-1"></span>')}`).join("");
  return `<aside class="relative flex h-full w-14 shrink-0 flex-col border-e border-gray-200/80 bg-white" aria-label="Main menu, collapsed">
    <div class="flex h-14 shrink-0 items-center justify-center border-b border-gray-200/80">${iconButton("panel-left", "Expand sidebar", { s: "iconSm" })}</div>
    <div class="flex h-12 shrink-0 items-center justify-center"><button type="button" class="rounded-md cursor-pointer" aria-label="Switch practice, current: ${esc(PRACTICE.name)}" title="${esc(PRACTICE.name)}">${practiceMark(7)}</button></div>
    <nav class="min-h-0 grow overflow-y-auto [scrollbar-width:none] pt-1" data-nav>${groups}</nav>
    <div class="shrink-0 border-t border-gray-200/80 flex h-14 items-center justify-center"><button type="button" class="relative rounded-full cursor-pointer" aria-label="Open user menu, 2 pending invitations">${avatar(ME.name, { size: 8 })}<span class="absolute -top-0.5 -end-0.5 size-2.5 rounded-full bg-blue-600 ring-2 ring-white" aria-hidden="true"></span></button></div>
    <span class="${R.tooltip} absolute start-[52px] z-10 whitespace-nowrap" style="top:${tipTop + 10}px" role="tooltip">Tasks <span class="text-white/60">12 assigned to you</span></span>
  </aside>`;
}

/* A quiet Tasks page to sit beside the sidebar */
const TASK_ROWS = [
  ["Pending", "Post the MetLife EOB for Liam Carter", "High", "EOB Posting", "Sep 24", "Nina Flores"],
  ["Pending", "Resubmit claim with the pano for James Ortiz", "High", "Claim Rejections", "Sep 24", "Marcus Lee"],
  ["Pending", "Call Guardian about the missing EOB for Mason Reed", "Medium", "Missing EOBs", "Sep 23", "Nina Flores"],
  ["Pending", "Answer Aetna's request for perio charting", "Medium", "Information Request", "Sep 23", "Asha"],
  ["Pending", "Return voicemail from Olivia Nguyen", "Low", "Voicemail", "Sep 22", "Front desk"],
  ["Resolved", "Check pre-auth response for Lucas Foster's crown", "Medium", "Pre-Auth Responses", "Sep 22", "Marcus Lee"],
  ["Pending", "Post Delta Dental ERA from Sep 21", "Low", "EOB Posting", "Sep 21", "Asha"],
  ["Failed", "Send statement to Benjamin Scott", "Medium", "Statements", "Sep 21", "Nina Flores"],
  ["Pending", "Confirm Emma Rodriguez's new insurance", "Low", "Front Office", "Sep 20", "Front desk"],
  ["Resolved", "Write off small balance for Mia Walker", "Low", "Adjustments", "Sep 19", "Nina Flores"],
  ["Pending", "Follow up on Cigna appeal for James Ortiz", "High", "Claim Rejections", "Sep 18", "Marcus Lee"],
  ["Pending", "Upload Noah Bennett's school form", "Low", "Documents", "Sep 18", "Front desk"],
  ["Pending", "Verify United Concordia plan for Sophia Hughes", "Medium", "Front Office", "Sep 17", "Asha"],
  ["Resolved", "Match bank deposit of $2,418.60", "Medium", "Bank Transactions", "Sep 17", "Nina Flores"],
  ["Pending", "Call lab about Harper Lee Nguyen's night guard", "Low", "Clinical", "Sep 16", "Front desk"]
];
const TASK_TONE = { Pending: "off", Resolved: "on", Failed: "needs" };
const who = (n) => (n === "Asha" ? `<span class="inline-flex items-center gap-x-2"><span class="flex size-5 items-center justify-center rounded-full bg-blue-100 text-blue-800">${I("sparkles", "size-3")}</span>Asha</span>` : `<span class="inline-flex items-center gap-x-2">${avatar(n, { size: 5 })}${esc(n)}</span>`);
/* v2: the list beside the sidebar runs edge to edge through the page gutter, and Pending (the usual status) is blank */
function v2TasksPage() {
  const heads = [["Status", 104], ["Task", 0], ["Urgency", 84], ["Type", 148], ["Created", 80], ["Assignee", 136]];
  return `<div class="min-w-0 grow flex flex-col"${chg("The task list behind runs edge to edge (its lines stopped 16px short), and Pending, the usual status, is left blank so Failed stands out")}><div class="min-w-0 grow flex flex-col bg-white opacity-60 pointer-events-none select-none" aria-hidden="true" inert>
    ${workspaceHeader({ title: "Tasks", actions: button("New task", { v: "solid", s: "sm", icon: "plus" }) })}
    ${tabsWithSlot([["All Tasks", 48], ["Revenue Cycle", 21], ["Front Office", 9], ["Clinical", 6], "Scheduling"], 0, "")}
    <div class="px-4 pt-3 min-w-0 overflow-hidden" data-scroll-ok><div class="${edgeToEdge(16)}"><table class="w-full table-fixed border-separate border-spacing-0">
      <colgroup>${heads.map(([, w]) => `<col ${w ? `style="width:${w}px"` : ""}>`).join("")}</colgroup>
      <thead><tr>${heads.map(([h]) => `<th class="${R.tHead}">${h}</th>`).join("")}</tr></thead>
      <tbody>${TASK_ROWS.map((r) => `<tr><td class="${R.tCell}">${r[0] === "Pending" ? "" : statusDot(r[0], TASK_TONE[r[0]])}</td><td class="${R.tCell} max-w-0 truncate font-medium">${esc(r[1])}</td><td class="${R.tCell} text-gray-600">${r[2]}</td><td class="${R.tCell} max-w-0 truncate text-gray-600">${r[3]}</td><td class="${R.tCell} text-gray-600 tabular-nums">${r[4]}</td><td class="${R.tCell} max-w-0 truncate">${who(r[5])}</td></tr>`).join("")}</tbody></table></div></div></div></div>`;
}
function tasksPage() {
  if (V2) return v2TasksPage();
  const heads = [["Status", 104], ["Task", 0], ["Urgency", 84], ["Type", 148], ["Created", 80], ["Assignee", 136]];
  return `<div class="min-w-0 grow flex flex-col bg-white opacity-60 pointer-events-none select-none" aria-hidden="true" inert>
    ${workspaceHeader({ title: "Tasks", actions: button("New task", { v: "solid", s: "sm", icon: "plus" }) })}
    ${tabsWithSlot([["All Tasks", 48], ["Revenue Cycle", 21], ["Front Office", 9], ["Clinical", 6], "Scheduling"], 0, "")}
    <div class="px-4 pt-3 min-w-0 overflow-hidden" data-scroll-ok><table class="w-full table-fixed border-separate border-spacing-0">
      <colgroup>${heads.map(([, w]) => `<col ${w ? `style="width:${w}px"` : ""}>`).join("")}</colgroup>
      <thead><tr>${heads.map(([h]) => `<th class="${R.tHead}">${h}</th>`).join("")}</tr></thead>
      <tbody>${TASK_ROWS.map((r) => `<tr><td class="${R.tCell}">${statusDot(r[0], TASK_TONE[r[0]])}</td><td class="${R.tCell} max-w-0 truncate font-medium">${esc(r[1])}</td><td class="${R.tCell} text-gray-600">${r[2]}</td><td class="${R.tCell} max-w-0 truncate text-gray-600">${r[3]}</td><td class="${R.tCell} text-gray-600 tabular-nums">${r[4]}</td><td class="${R.tCell} max-w-0 truncate">${who(r[5])}</td></tr>`).join("")}</tbody></table></div></div>`;
}

/* ============================================================ 1. Main sidebar */
defineBlock({
  cat: "shell", id: "shell-sidebar", thumb: true,
  title: "Main sidebar",
  note: "Every Asha screen sits beside this menu: the practice switcher at the top, the real sections and items, count badges, and you at the bottom. It folds into an icon rail with dot badges. Click an item to move there.",
  where: "Every screen",
  states: ["Expanded", "Collapsed icon rail"],
  canvas: "bare",
  html: (state) => `<div class="flex h-[860px]" data-shell-root>${state === "Collapsed icon rail" ? sidebarCollapsed("Tasks") : sidebarExpanded("Tasks")}${tasksPage()}</div>`,
  mount: (el) => {
    const root = el.querySelector("[data-shell-root]"); if (!root) return;
    root.addEventListener("click", (e) => {
      const a = e.target.closest("[data-nav-item]"); if (!a) return; e.preventDefault();
      const collapsed = !!root.querySelector('[aria-label="Main menu, collapsed"]');
      root.querySelectorAll("[data-nav-item]").forEach((x) => {
        const on = x === a; if (on) x.setAttribute("aria-current", "page"); else x.removeAttribute("aria-current");
        if (collapsed) { x.classList.toggle("bg-gray-100", on); x.classList.toggle("text-gray-900", on); x.classList.toggle("text-gray-500", !on); }
        else { x.className = on ? R.navItemOn : R.navItem; const c = x.querySelector("[aria-label]"); if (c && !/assigned/.test(c.getAttribute("aria-label"))) c.className = `ms-auto ${on ? R.countBlue : R.count}`; }
      });
    });
  }
});

/* ============================================================ 2. Workspace header variants */
const specimenBox = (label, inner, mark = "") => `<div><p class="${R.eyebrow} mb-2">${label}</p><div class="${R.box} overflow-hidden"${mark}>${inner}</div></div>`;
/* The first rows of the list under a header, faded, so the header reads in context. rows: arrays of cells; num: column indexes that are money */
const faintRows = (cols, rows, num = []) => `<div class="px-4 opacity-60 pointer-events-none" aria-hidden="true">${V2 ? `<div class="${edgeToEdge(16)}">` : ""}<table class="w-full table-fixed border-separate border-spacing-0">
  <thead><tr>${cols.map((c, i) => `<th class="${R.tHead} ${num.includes(i) ? "text-end" : ""}">${c}</th>`).join("")}</tr></thead>
  <tbody>${rows.map((r, ri) => `<tr>${r.map((v, i) => `<td class="${R.tCell} ${ri === rows.length - 1 ? "!border-b-0" : ""} ${num.includes(i) ? "text-end tabular-nums" : ""} max-w-0 truncate">${v}</td>`).join("")}</tr>`).join("")}</tbody></table>${V2 ? "</div>" : ""}</div>`;
const v2FaintMark = () => chg("The rows under the header run edge to edge of the box (their lines stopped 16px short of both sides)");
/* v4: a page that shows one record has no bar above it. The patient chart keeps Asha's real layout: the patient panel
 * on the left (back to Charts with the ⋯, who they are in the one patient header, their key facts, the chart's
 * sections) and the section on the right, whose own header holds the visit actions and previous/next. */
const V4_SHELL_ACTIONS = [
  { label: "Patient", items: [{ icon: "send", label: "Send forms", hint: "Text a link to forms to fill in" }, { icon: "receipt", label: "Send statement", hint: "Text or email what's owed", suggest: "The balance is 45 days old" },
    { icon: "users", label: "Add family member", hint: "Link someone to this family" }, { icon: "bell-plus", label: "Manage alerts", hint: "Add or clear medical and office alerts" }] },
  { label: "Chart", items: [{ icon: "printer", label: "Print chart", hint: "Facts, history and the tooth chart" }, { icon: "link", label: "Copy chart link", hint: "To paste in a message to a teammate" }, { icon: "history", label: "Chart history", hint: "Every change, who made it and when" }] },
  { label: "", items: [{ icon: "archive", label: "Archive patient", danger: true }] }];
/* specimenBox without overflow-hidden, so the Actions menu can open past the box */
const v4ShellSpecimen = (label, inner, mark = "") => `<div><p class="${R.eyebrow} mb-2">${label}</p><div class="${R.box} relative z-10"${mark}>${inner}</div></div>`;
const V4_SHELL_SECTIONS = [["layout-dashboard", "Overview"], ["smile", "Tooth chart"], ["activity", "Perio chart"], ["book-open", "Ledger"], ["clipboard-list", "Treatment plans"], ["folder", "Documents"]];
function v4ShellRecordPage(long) {
  const name = long ? "Alexandria Catherine Montgomery-Vanderbilt" : "Olivia Nguyen";
  const facts = [["Insurance", "Aetna Dental PPO", "Verified Sep 24"], ["Ins. est.", money(318), "2 claims out"], ["Next visit", "Today · 11:00 AM", "Deep cleaning · Hyg 2"]];
  const panel = `<aside class="min-w-0 border-e border-gray-200/80" aria-label="Patient"${chg4("The patient panel sits on the left, as on Asha's chart today: back to Charts and the ⋯ on top, then the one patient header (the alerts as one orange icon with their count, the family balance as a wallet), one label and one value per fact, and the chart's sections")}>
      <div class="flex items-center justify-between gap-2 px-5 pt-3"><a href="#" class="inline-flex items-center gap-1 -ms-1 rounded-md px-1 h-7 text-[13px] text-gray-500 hover:text-gray-800 hover:bg-gray-100">${I("chevron-left", "size-4")}Charts</a>
        <span class="-me-2">${actionsMenu(V4_SHELL_ACTIONS, { dots: true, up: false, align: "end", open: V4_OPTS.open })}</span></div>
      ${patientHeader({ name, sub: "42 y · Chart #10357", alerts: ["Premedicate: amoxicillin 2 g, 1 hour before", "Latex allergy"], familyBalance: 740 })}
      <dl class="px-5 py-2 border-b border-gray-200/80">${facts.map(([k, v, more]) => `<div class="${R.kvRow} !grid-cols-[112px_1fr] !min-h-8"><dt class="${R.kvKey}">${k}</dt><dd class="min-w-0 truncate text-gray-800 tabular-nums"${more ? ` data-tip="${esc(more)}"` : ""}>${v}</dd></div>`).join("")}</dl>
      <nav class="flex flex-col gap-0.5 p-3" aria-label="Chart sections">${V4_SHELL_SECTIONS.map(([ic, l], i) => `<a href="#" class="${i ? R.navItem : R.navItemOn}"${i ? "" : ' aria-current="page"'}>${I(ic)}<span class="truncate">${l}</span></a>`).join("")}</nav></aside>`;
  const main = `<div class="min-w-0"><div class="${R.bar} !px-5"${chg4("The right side's header names the section and holds the visit actions (Collect payment is the one blue button) and previous/next patient; there's no bar above the patient")}><h2 class="min-w-0 grow truncate text-sm font-semibold text-gray-800">Overview</h2>
      ${button("Schedule", { v: "white", s: "sm", icon: "calendar-plus" })}${button("Collect payment", { v: "solid", s: "sm", icon: "credit-card" })}<span class="h-5 mx-1 border-s border-gray-200/80"></span>${iconButton("chevron-up", "Previous patient", { s: "iconSm" })}${iconButton("chevron-down", "Next patient", { s: "iconSm" })}</div>
    <div class="grid grid-cols-2 gap-x-10 px-5 py-4 opacity-60 pointer-events-none" aria-hidden="true">${[["Contact details", [["Cell phone", "(650) 555-0101"], ["Email", "o.nguyen@example.com"], ["Address", "418 Alma St, Palo Alto"]]], ["Communication preferences", [["Text messages", "Opted in"], ["Preferred contact", "Text message"], ["Best time to reach", "Weekday mornings"]]]]
      .map(([t, rows]) => `<section><h3 class="${R.groupTitle} mb-1">${t}</h3>${rows.map(([k, v]) => `<div class="${R.kvRow}"><span class="${R.kvKey}">${k}</span><span class="min-w-0 truncate text-gray-800">${v}</span></div>`).join("")}</section>`).join("")}</div></div>`;
  return `<div class="grid grid-cols-[352px_minmax(0,1fr)]">${panel}${main}</div>`;
}
defineBlock({
  cat: "shell", id: "shell-headers",
  title: "Workspace header variants",
  note: "The 44px one-line bar at the top of every list: \"Parent › Title\" on the left, actions on the right. Count tabs sit under it with dates in their right slot. Long names cut off with an ellipsis instead of wrapping.",
  where: "Top of every list and workbench",
  states: ["Normal", "Long names"],
  canvas: "gray",
  html: (state) => {
    const long = state === "Long names";
    const practice = long ? "Bayview Family Dental of Walnut Creek — Pediatric, Orthodontic & Implant Center on Ygnacio Valley Road" : PRACTICE.name;
    const eob = long ? "Delta Dental of California, Federal Employee Program" : "Delta Dental";
    return `<div class="space-y-6" data-headers>
    ${specimenBox("Plain", workspaceHeader({ parent: long ? "Practice Settings" : "Revenue Cycle", title: long ? practice : "Bank Transactions", actions: `${button("Import statement", { v: "white", s: "sm", icon: "upload" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` }))}
    ${specimenBox("With count tabs", `${workspaceHeader({ parent: "Communications", title: long ? "Faxes received at the Walnut Creek front desk and the second-floor oral surgery suite, plus the old eFax number" : "Faxes", actions: `${button("Send fax", { v: "solid", s: "sm", icon: "send" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
      <div data-tabs-a>${tabsWithSlot([["Fax inbox", long ? "1,284" : 12], ["Sent", long ? "9,999+" : 48], ["Archived", long ? "12,410" : 311]], 0, "")}</div>`)}
    ${V2 ? specimenBox("With dates in the right slot", `${workspaceHeader({ parent: "Revenue Cycle", title: "EOBs", actions: `<span class="inline-flex"${chg("Auto-post is an action, so it sits with Upload EOB in the header; the tab slot keeps only the dates")}>${button("Auto-post", { v: "white", s: "sm", icon: "zap" })}</span>${button("Upload EOB", { v: "solid", s: "sm", icon: "upload" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
      <div data-tabs-b>${tabsWithSlot([["All EOBs", 38], ["Needs posting", 7], ["Posted", 29], "Not matched"], 1, dateRangeButton(long ? "Aug 27 – Sep 25, 2026" : "Last 30 days"))}</div>
      ${faintRows(["Patient", "Payer", "Dates", "Total billed", "Insurance paid"], [["Liam Carter", "MetLife", "Jun 30 – Jul 18", money(2695), money(1310.5)], ["Ethan Walker", eob, "Aug 25 – Sep 9", money(240), money(192)]], [3, 4])}`, v2FaintMark())
    : specimenBox("With dates and actions in the right slot", `${workspaceHeader({ parent: "Revenue Cycle", title: "EOBs", actions: `${button("Upload EOB", { v: "solid", s: "sm", icon: "upload" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
      <div data-tabs-b>${tabsWithSlot([["All EOBs", 38], ["Needs posting", 7], ["Posted", 29], "Not matched"], 1, `${dateRangeButton(long ? "Aug 27 – Sep 25, 2026" : "Last 30 days")}${button("Auto-post", { v: "white", s: "sm", icon: "zap" })}`)}</div>
      ${faintRows(["Patient", "Payer", "Dates", "Total billed", "Insurance paid"], [["Liam Carter", "MetLife", "Jun 30 – Jul 18", money(2695), money(1310.5)], ["Ethan Walker", eob, "Aug 25 – Sep 9", money(240), money(192)]], [3, 4])}`)}
    ${V4 ? v4ShellSpecimen("A patient's chart", v4ShellRecordPage(long)) : ""}
    ${specimenBox("With a segmented toggle", `${workspaceHeader({ parent: "Revenue Intelligence", title: "A/R Aging", actions: `${segmented(["Guarantor A/R", "Insurance A/R", "Carrier breakdown"], 0, { sm: true })}<span class="h-5 mx-1 border-s border-gray-200/80"></span>${button("Export", { v: "quiet", s: "sm", icon: "download" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
      ${faintRows(["Guarantor", "Current (0-30)", "31-60", "61-90", "91-120"], [["Benjamin Scott", money(0), money(0), money(640), money(1510)], ["Lucas Foster", money(1320), money(0), money(0), money(0)]], [1, 2, 3, 4])}`, V2 ? v2FaintMark() : "")}
    </div>`;
  },
  mount: (el) => { const a = el.querySelector("[data-tabs-a]"), b = el.querySelector("[data-tabs-b]"); if (a) wireTabs(a, () => {}); if (b) wireTabs(b, () => {}); }
});

/* ============================================================ 3. Practice switcher popover */
const PRACTICES = [
  { name: "Bayview Family Dental", city: "Walnut Creek, CA", chairs: 6 },
  { name: "Bayview Family Dental Oakland", city: "Oakland, CA", chairs: 4 },
  { name: "Diablo Valley Dental Care", city: "Danville, CA", chairs: 5 },
  { name: "Harbor Kids Dentistry", city: "Alameda, CA", chairs: 3 },
  { name: "Marina Smiles Orthodontics", city: "San Francisco, CA", chairs: 4 },
  { name: "Sunset Dental Group", city: "San Francisco, CA", chairs: 8 },
  { name: "Walnut Creek Oral Surgery", city: "Walnut Creek, CA", chairs: 2 }
];
const hl = (text, q) => { if (!q) return esc(text); const i = text.toLowerCase().indexOf(q.toLowerCase()); return i < 0 ? esc(text) : `${esc(text.slice(0, i))}<mark class="bg-transparent font-semibold text-gray-900">${esc(text.slice(i, i + q.length))}</mark>${esc(text.slice(i + q.length))}`; };
/* v2: one-line 36px rows, the city grey inline, no chair counts, grey outlined marks */
function v2PracticeList(q, current) {
  const list = PRACTICES.filter((p) => !q || (p.name + " " + p.city).toLowerCase().includes(q.toLowerCase()));
  if (!list.length) return `<div class="py-8 px-4 text-center"><p class="text-sm font-medium text-gray-800">No practices found.</p><p class="${R.help} mt-0.5">Check the spelling, or ask your admin to add you to that office.</p></div>`;
  return `<div class="px-1 pb-1" role="listbox" aria-label="Practices">${list.map((p, i) => `<button type="button" role="option" aria-selected="${p.name === current}" data-practice="${esc(p.name)}" class="flex w-full h-9 items-center gap-x-2.5 px-2 rounded-lg text-start cursor-pointer hover:bg-gray-100 ${i === 0 && q ? "bg-gray-100" : ""}"${i === 0 ? chg("One-line rows: the office name with its city in grey, no chair counts, and grey marks instead of a rainbow of logos") : ""}>
    ${avatar(p.name, { size: 6, square: true })}<span class="min-w-0 grow truncate text-sm text-gray-800 ${p.name === current ? "font-medium" : ""}">${hl(p.name, q)}<span class="ms-1.5 font-normal text-gray-500">${hl(p.city, q)}</span></span>
    ${p.name === current ? I("check", "size-4 shrink-0 text-blue-600") : ""}</button>`).join("")}</div>`;
}
function practiceList(q, current) {
  if (V2) return v2PracticeList(q, current);
  const list = PRACTICES.filter((p) => !q || (p.name + " " + p.city).toLowerCase().includes(q.toLowerCase()));
  if (!list.length) return `<div class="py-8 px-4 text-center"><p class="text-sm font-medium text-gray-800">No practices found.</p><p class="${R.help} mt-0.5">Check the spelling, or ask your admin to add you to that office.</p></div>`;
  return `<div class="p-1" role="listbox" aria-label="Practices">${list.map((p, i) => `<button type="button" role="option" aria-selected="${p.name === current}" data-practice="${esc(p.name)}" class="flex w-full items-center gap-x-2.5 px-2 py-1.5 rounded-lg text-start cursor-pointer hover:bg-gray-100 ${i === 0 && q ? "bg-gray-100" : ""}">
    ${avatar(p.name, { size: 7, square: true, solid: true })}<span class="min-w-0 grow"><span class="block truncate text-sm text-gray-800 ${p.name === current ? "font-medium" : ""}">${hl(p.name, q)}</span><span class="block truncate text-xs text-gray-500">${hl(p.city, q)} · ${p.chairs} chairs</span></span>
    ${p.name === current ? I("check", "size-4 shrink-0 text-blue-600") : ""}</button>`).join("")}</div>`;
}
defineBlock({
  cat: "shell", id: "shell-practice-switcher",
  title: "Practice switcher",
  note: "Opens beside the practice name at the top of the sidebar. Search as you type, and a check marks the office you're in. Try typing or picking another office.",
  where: "Sidebar › Practice",
  states: ["Open", "Searching", "No results"],
  canvas: "bare",
  html: (state) => {
    const q = state === "Searching" ? "walnut" : state === "No results" ? "fremont" : "";
    if (V2) return `<div class="relative flex h-[600px]" data-switcher>${sidebarExpanded("Tasks", { switcherOpen: true })}${tasksPage()}
      <div class="absolute z-10 top-[46px] start-2 w-[280px] ${R.popover} overflow-hidden" role="dialog" aria-label="Select practice"${chg("280px like the real popover; it drops from the header row, with no title, subtitle or \"7 practices available\" footer")}>
        <div class="relative border-b border-gray-200/80"><span class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">${I("search", "size-4 text-gray-400")}</span>
          <input data-q class="block w-full h-10 ps-9 pe-3 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden" placeholder="Search practices..." aria-label="Search practices" value="${esc(q)}" /></div>
        <p class="${R.menuLabel} px-3 pt-2">Select practice</p>
        <div class="max-h-[300px] overflow-y-auto" data-list>${practiceList(q, PRACTICE.name)}</div>
      </div></div>`;
    return `<div class="relative flex h-[600px]" data-switcher>${sidebarExpanded("Tasks", { switcherOpen: true })}${tasksPage()}
      <div class="absolute z-10 top-[58px] start-[256px] w-[296px] ${R.popover} overflow-hidden" role="dialog" aria-label="Switch practice">
        <div class="px-3 pt-3 pb-2"><p class="text-sm font-semibold text-gray-800">Switch practice</p><p class="${R.caption}">Pick the office you want to work in.</p></div>
        <div class="relative border-y border-gray-200/80"><span class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">${I("search", "size-4 text-gray-400")}</span>
          <input data-q class="block w-full h-10 ps-9 pe-3 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden" placeholder="Search practices..." aria-label="Search practices" value="${esc(q)}" /></div>
        <div class="max-h-[300px] overflow-y-auto" data-list>${practiceList(q, PRACTICE.name)}</div>
        <div class="flex items-center justify-between px-3 h-9 border-t border-gray-200/80"><span class="${R.caption} tabular-nums" data-count>${PRACTICES.length} practices available</span>${kbd("esc")}</div>
      </div></div>`;
  },
  mount: (el) => {
    const root = el.querySelector("[data-switcher]"); if (!root) return;
    let current = PRACTICE.name;
    const input = root.querySelector("[data-q]"), list = root.querySelector("[data-list]");
    const draw = () => { list.innerHTML = practiceList(input.value.trim(), current); icons(); };
    root.querySelector('[aria-label="Main menu"]').addEventListener("click", (e) => { if (e.target.closest("a")) e.preventDefault(); });
    input.addEventListener("input", draw);
    list.addEventListener("click", (e) => { const b = e.target.closest("[data-practice]"); if (!b) return; current = b.dataset.practice; draw(); });
  }
});

/* ============================================================ 4. Command palette (per screen) */
const PAL_CLAIMS = [
  { pt: "p1", date: "2026-09-02", payer: "delta", codes: "D0120 · D1110 · D0274", amt: 253, st: ["With payer", "off"] },
  { pt: "p1", date: "2026-03-12", payer: "delta", codes: "D0120 · D1110", amt: 175, st: ["Paid", "on"] },
  { pt: "p2", date: "2026-06-30", payer: "metlife", codes: "D3330 · D2950 · D2740", amt: 2695, st: ["Partial", "mid"] },
  { pt: "p13", date: "2026-07-22", payer: "cigna", codes: "D7210", amt: 320, st: ["Denied", "needs"] },
  { pt: "p8", date: "2026-09-10", payer: "metlife", codes: "D2740 · D2950", amt: 1545, st: ["Ready to send", "on"] }
];
/* v4: a result names itself and gives one detail; the rest is in a card beside the palette for the highlighted result */
const v4PalClaimPeek = (c) => peekCard(`${esc(DATA.patient(c.pt).name)} · ${fmtDate(c.date)}`, [["Payer", DATA.payer(c.payer).name], ["Codes", c.codes], ["Billed", `<span class="tabular-nums">${money(c.amt)}</span>`], ["Status", statusDot(c.st[0], c.st[1])]]);
const v4PalPatientPeek = (p) => peekCard(esc(p.name), [["Age", p.age], ["Chart", `#${10200 + +p.id.slice(1) * 31}`], ["Insurance", p.payer ? DATA.payer(p.payer).short : "None on file"], ["Next visit", p.next ? fmtDate(p.next.slice(0, 10)) : "Not scheduled"]]);
const keys = (k) => `<span class="flex shrink-0 items-center gap-0.5">${[].concat(k).map((x) => kbd(x)).join("")}</span>`;
function paletteGroups(q) {
  const t = q.trim().toLowerCase();
  if (!t) return [
    ["Recent", [
      { icon: "receipt", label: "Liam Carter · Jun 30", desc: "MetLife · D3330 · D2950 · D2740 · $2,695.00", short: "MetLife · $2,695.00", peek: v4PalClaimPeek(PAL_CLAIMS[2]), right: statusDot("Partial", "mid", "!text-[13px]"), st: "Partial" },
      { icon: "user", label: "Ava Thompson", desc: "Patient · 38 · Chart #10231", short: "Chart #10231", peek: v4PalPatientPeek(DATA.patient("p1")), right: "" }]],
    ["Actions", [
      { icon: "plus", label: "New claim", right: keys("N") },
      { icon: "send", label: "Send 3 ready claims", desc: "Everything in To be sent that passed checks", right: keys(["⌘", "↵"]) },
      { icon: "sparkles", label: "Run AI analysis on selected", right: keys("A") },
      { icon: "download", label: "Export CSV", right: keys("E") }]],
    ["Go to", [
      { icon: "arrow-right", label: "To be sent", desc: "3 claims", right: keys("2") },
      { icon: "arrow-right", label: "Sent", desc: "4 claims", right: keys("3") },
      { icon: "arrow-down", label: "Next claim", desc: "While a claim panel is open", right: keys(["↓"]) }]]
  ];
  const pts = DATA.patients.filter((p) => p.name.toLowerCase().includes(t)).slice(0, 3).map((p) => ({ icon: "user", label: hl(p.name, q.trim()), raw: true, desc: `Patient · ${p.age} · Chart #${10200 + +p.id.slice(1) * 31}${p.payer ? " · " + DATA.payer(p.payer).short : ""}`, short: `Chart #${10200 + +p.id.slice(1) * 31}`, peek: v4PalPatientPeek(p), right: "" }));
  const cls = PAL_CLAIMS.filter((c) => DATA.patient(c.pt).name.toLowerCase().includes(t) || DATA.payer(c.payer).short.toLowerCase().includes(t)).map((c) => ({ icon: "receipt", label: `${hl(DATA.patient(c.pt).name, q.trim())} · ${fmtDate(c.date)}`, raw: true, desc: `${DATA.payer(c.payer).short} · ${c.codes} · ${money(c.amt)}`, short: `${DATA.payer(c.payer).short} · ${money(c.amt)}`, peek: v4PalClaimPeek(c), right: statusDot(c.st[0], c.st[1], "!text-[13px]"), st: c.st[0] }));
  const acts = [{ icon: "plus", label: "New claim", right: keys("N") }, { icon: "download", label: "Export CSV", right: keys("E") }, { icon: "sparkles", label: "Run AI analysis on selected", right: keys("A") }].filter((a) => a.label.toLowerCase().includes(t));
  if (!pts.length && !cls.length && !acts.length) return [];
  if (pts.length) acts.push({ icon: "plus", label: `New claim for ${esc(DATA.patient(DATA.patients.find((p) => p.name.toLowerCase().includes(t)).id).name)}`, right: "" });
  return [["Patients", pts], ["Claims", cls], ["Actions", acts]].filter(([, items]) => items.length);
}
/* v2: one-line 36px rows (label, then grey detail inline), a grey highlight like every menu, and a status word only when
 * a claim needs someone (Denied, Needs review); no results is one plain line */
const V2_PAL_LOUD = ["Denied", "Needs review"];
function v2PaletteList(q, active = 0) {
  const groups = paletteGroups(q);
  if (!groups.length) return `<p class="py-6 px-4 text-center text-[13px] text-gray-500"${chg("No results is one plain line, not a 220px icon block, like the real command menu")}>No matches for “${esc(q.trim())}”. Try a name, payer or “New claim”.</p>`;
  let n = -1, marked = false;
  return groups.map(([g, items]) => `<div role="group" aria-label="${g}"><p class="${R.menuLabel} px-2.5">${g}</p>${items.map((it) => { n++;
    const loud = !it.st || V2_PAL_LOUD.includes(it.st);
    const mark = V4 ? (!marked && it.short ? ((marked = true), chg4("A result is its name and one detail (the payer and amount, or the chart number); the codes, age, insurance and next visit show in a card beside the palette for the highlighted result, as you arrow or point")) : "")
      : !marked && it.desc ? ((marked = true), chg("Every result is one 36px line, the detail grey beside the name; the highlight is grey like other menus, and claims show a status only when it needs someone")) : "";
    const desc = V4 && it.short ? it.short : it.desc;
    return `<div role="option" aria-selected="${n === active}" data-opt="${n}" class="flex h-9 items-center justify-between gap-4 px-2.5 rounded-lg cursor-pointer ${n === active ? "bg-gray-100" : "hover:bg-gray-50"}"${mark}>
      <span class="flex min-w-0 items-center gap-2.5">${I(it.icon, "size-4 shrink-0 text-gray-500")}<span class="min-w-0 truncate text-[13px] text-gray-800">${it.raw ? it.label : esc(it.label)}${desc ? `<span class="ms-2 text-gray-500">${esc(desc)}</span>` : ""}</span></span>${loud ? it.right || "" : ""}</div>`; }).join("")}</div>`).join('<div class="h-1"></div>');
}
function paletteList(q, active = 0) {
  if (V2) return v2PaletteList(q, active);
  const groups = paletteGroups(q);
  if (!groups.length) return `<div class="py-14 px-6 text-center"><span class="mx-auto flex items-center justify-center size-10 mb-3 rounded-lg bg-gray-100 text-gray-500">${I("search-x", "size-5")}</span>
    <p class="text-sm font-semibold text-gray-800">No matches for “${esc(q.trim())}”</p><p class="${R.help} mt-1">Try a patient's name, a payer, or an action like “New claim”.</p></div>`;
  let n = -1;
  return groups.map(([g, items]) => `<div role="group" aria-label="${g}"><p class="${R.menuLabel} px-2.5">${g}</p>${items.map((it) => { n++;
    return `<div role="option" aria-selected="${n === active}" data-opt="${n}" class="flex items-center justify-between gap-4 px-2.5 py-2 rounded-lg cursor-pointer ${n === active ? "bg-blue-50" : "hover:bg-gray-50"}">
      <span class="flex min-w-0 items-center gap-2.5">${I(it.icon, "size-4 shrink-0 text-gray-500")}<span class="min-w-0"><span class="block truncate text-[13px] text-gray-800">${it.raw ? it.label : esc(it.label)}</span>${it.desc ? `<span class="block truncate text-xs text-gray-500">${esc(it.desc)}</span>` : ""}</span></span>${it.right || ""}</div>`; }).join("")}</div>`).join('<div class="h-1"></div>');
}
const paletteCount = (q) => { const all = 9, n = paletteGroups(q).reduce((a, [, i]) => a + i.length, 0); return q.trim() ? `${n} ${n === 1 ? "result" : "results"}` : `${all} suggestions`; };
function claimsBackdrop() {
  const rows = CLAIMS_BG.map((c) => { const p = DATA.patient(c[0]); return `<tr><td class="${R.gridCell}"><span class="inline-flex items-center gap-x-2.5">${checkbox(false, "Select row")}${avatar(p.name, { size: 5 })}<span class="font-medium">${esc(p.name)}</span></span></td><td class="${R.gridCell}">${fmtDate(c[1])}</td><td class="${R.gridCell}">${DATA.payer(c[2]).short}</td><td class="${R.gridCell} text-end tabular-nums">${money(c[3])}</td><td class="${R.gridCell}">${statusDot(c[4], c[5])}</td><td class="${R.gridCell} text-end tabular-nums text-gray-500">${c[6]}</td></tr>`; }).join("");
  return `<div aria-hidden="true" inert class="pointer-events-none select-none">${workspaceHeader({ parent: "Revenue Cycle", title: "Claims", actions: `${segmented(["Claims", "Pre-auths"], 0, { sm: true })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
    ${tabsWithSlot([["Unbatched claims", 6], ["To be sent", 3], ["Sent", 4], ["Adjudicated", 3], "Closed", "Archived"], 2, dateRangeButton("Last 30 days"))}
    <div class="px-4 pt-3">${V2 ? `<div class="${edgeToEdge(16)} [&_tr>*:last-child]:!border-e-0">` : ""}<table class="w-full table-fixed border-separate border-spacing-0"><colgroup><col style="width:220px"><col><col><col><col><col></colgroup><thead><tr>${["Patient", "Service date", "Payer", "Billed", "Status", "Filing days left"].map((h, i) => `<th class="${R.gridHead} ${i === 3 || i === 5 ? "text-end" : ""}">${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>${V2 ? "</div>" : ""}</div></div>`;
}
const CLAIMS_BG = [["p6", "2026-05-02", "guardian", 235, "Info requested", "needs", 12], ["p13", "2026-07-22", "cigna", 320, "Denied", "needs", 26], ["p15", "2026-09-01", "aetna", 465, "Awaiting EOB", "off", 341], ["p1", "2026-09-02", "delta", 253, "With payer", "off", 342], ["p2", "2026-06-30", "metlife", 2695, "Partial", "mid", 278], ["p10", "2026-08-25", "delta", 240, "Paid", "on", 334], ["p3", "2026-09-18", "cigna", 175, "Ready to send", "on", 358], ["p8", "2026-09-10", "metlife", 1545, "Ready to send", "on", 350], ["p5", "2026-08-14", "aetna", 520, "Needs review", "needs", 324], ["p12", "2026-02-25", "delta", 175, "Paid", "on", 150], ["p9", "2026-09-21", "delta", 110, "With payer", "off", 356], ["p4", "2026-09-19", "delta", 80, "Awaiting EOB", "off", 354]];
defineBlock({
  cat: "shell", id: "shell-command-palette",
  title: "Command palette on Claims",
  note: "Press ⌘K (or /) on Claims to find a patient or claim, or run an action, without leaving the page. Results group into Patients, Claims and Actions, with keys on the right. It works: type, and use ↑ ↓.",
  where: "Revenue Cycle › Claims · ⌘K",
  states: ["Suggestions", "Typing \"ava\"", "No results"],
  canvas: "bare",
  html: (state) => {
    const q = state === "Suggestions" ? "" : state === "No results" ? "crown prep lab" : "ava";
    return `<div class="relative h-[660px] overflow-hidden" data-scroll-ok data-palette-root>${V2 ? `<div${chg("The Claims list behind runs edge to edge through the page gutter (its lines stopped 16px short)")}>${claimsBackdrop()}</div>` : claimsBackdrop()}
      <div class="absolute inset-0 bg-gray-900/20" aria-hidden="true"></div>
      <div class="absolute left-1/2 top-16 -translate-x-1/2 w-[640px] max-w-[calc(100%-32px)] ${R.popover} overflow-hidden flex flex-col max-h-[540px]" role="dialog" aria-label="Claims commands">
        <label class="relative block border-b border-gray-200/80 shrink-0"><span class="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none">${I("search", "size-4 text-gray-400")}</span>
          <input data-q class="block w-full h-12 ps-11 pe-24 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden" placeholder="Search patients, claims and actions…" aria-label="Search patients, claims and actions" value="${esc(q)}" />
          <span class="absolute inset-y-0 end-0 flex items-center pe-3 gap-1.5">${tag("Claims", "tagOutline")}</span></label>
        <div class="min-h-0 grow overflow-y-auto p-1.5" data-list role="listbox" aria-label="Results">${paletteList(q)}</div>
        ${V2 ? "" : `<div class="flex shrink-0 items-center justify-between gap-2 h-10 px-4 border-t border-gray-200/80 text-xs text-gray-500">
          <span class="tabular-nums" data-count>${paletteCount(q)}</span>
          <span class="flex items-center gap-1.5">${kbd("↑")}${kbd("↓")}<span>to move</span><span class="text-gray-300">·</span>${kbd("↵")}<span>to open</span><span class="text-gray-300">·</span>${kbd("esc")}<span>to close</span></span></div>`}
      </div></div>`;
  },
  mount: (el) => {
    const root = el.querySelector("[data-palette-root]"); if (!root) return;
    const input = root.querySelector("[data-q]"), list = root.querySelector("[data-list]"), count = root.querySelector("[data-count]");
    let active = 0;
    let draw = () => { list.innerHTML = paletteList(input.value, active); if (count) count.textContent = paletteCount(input.value); icons(); };
    input.addEventListener("input", () => { active = 0; draw(); });
    input.addEventListener("keydown", (e) => { const n = list.querySelectorAll("[data-opt]").length; if (!n) return;
      if (e.key === "ArrowDown") { e.preventDefault(); active = (active + 1) % n; draw(); }
      if (e.key === "ArrowUp") { e.preventDefault(); active = (active - 1 + n) % n; draw(); } });
    list.addEventListener("mousemove", (e) => { const o = e.target.closest("[data-opt]"); if (o && +o.dataset.opt !== active) { active = +o.dataset.opt; draw(); } });
    if (!V4) return;
    /* v4: the highlighted result's details in the kit's peek card, beside the palette (left of it if there's no room) */
    const items = () => paletteGroups(input.value).flatMap(([, it]) => it), dlg = root.querySelector('[role="dialog"]');
    const peek = () => { const it = items()[active], o = list.querySelector(`[data-opt="${active}"]`); if (!it || !it.peek || !o) return Peek.hide();
      Peek.show(o, it.peek); const d = dlg.getBoundingClientRect(), r = o.getBoundingClientRect(), w = Peek.el.offsetWidth;
      Peek.el.style.left = `${d.right + 8 + w < innerWidth ? d.right + 8 : Math.max(8, d.left - w - 8)}px`; Peek.el.style.top = `${Math.max(8, Math.min(innerHeight - Peek.el.offsetHeight - 8, r.top))}px`; };
    const redraw = draw; draw = () => { redraw(); peek(); };
    list.addEventListener("mouseleave", () => Peek.hide()); input.addEventListener("blur", () => Peek.hide()); input.addEventListener("focus", peek);
  }
});

/* ============================================================ 5. One-line toolbar anatomy */
const pin = (n, inner) => `<span class="relative inline-flex shrink-0">${inner}<span class="absolute -top-7 left-1/2 -translate-x-1/2 flex size-5 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white tabular-nums" aria-hidden="true">${n}</span></span>`;
const TOOL_PARTS = [
  ["View", "Which saved view you're on, with its count. Save as view lives in this menu, not on the bar."],
  ["Search", "Finds rows by patient, payer or code as you type."],
  ["Dates", "The date range sits on the same line, never in a second row."],
  ["Sort", "Picks the order. A custom order shows as a chip beside the filters; its × puts the usual order back."],
  ["Condition chips", "Each sort or filter reads like a sentence: a dark field, a grey “is”, a blue value. The × removes it."],
  ["Add filter", "The square + adds another condition to the same line."],
  ["More", "Columns, Export CSV and anything used rarely."]
];
/* v2 toolbar specimen: only applied chips are bordered (dates, Sort and + are quiet), chips that don't fit fold into one
 * "+N" chip (Attio's "+1"), and the toolbar and its table sit in one box so no line stops short */
const V2_TOOL_PARTS = [
  ["View", "Which saved view you're on, with its count. Save as view lives in this menu, not on the bar."],
  ["Search", "Finds rows by patient, payer or code as you type."],
  ["Dates", "The date range sits on the same line, as a quiet button, never in a second row."],
  ["Sort", "Picks the order. A custom order shows as a chip beside the filters; its × puts the usual order back."],
  ["Condition chips", "Each sort or filter reads like a sentence: a dark field, a grey “is”, a blue value. Chips that don't fit fold into one “+N” chip that lists the rest."],
  ["Add filter", "The quiet + adds another condition to the same line. Only applied chips have a border."],
  ["More", "Columns, Export CSV and anything used rarely."]
];
function v2ShellToolbar(state) {
  const chips = state === "No filters" ? [] : state === "Many filters" ? [["Status is", "Denied"], ["Payer is", "Delta Dental"], ["Biller is", "Nina Flores"], ["Type is", "Secondary"], ["Billed is over", "$500.00"]] : [["Status is", "Denied"]];
  const custom = state !== "No filters", shown = chips.slice(0, 1), more = chips.length - shown.length;
  const chipHtml = (custom ? condChip("Sorted by", "", `Service date ${I("arrow-down", "size-3.5")}`, "", "Remove sort") : "") + shown.map(([k, v]) => `${condChip(k.replace(/ is$/, ""), / is$/.test(k) ? "is" : "", v, "", `Remove ${k} ${v} filter`)}`).join("")
    + (more ? `<button type="button" class="${R.chip} !items-center justify-center px-2 font-medium text-gray-700 cursor-pointer" aria-haspopup="menu" aria-label="${more} more filters"${chg("Chips that don't fit fold into one \"+4\" chip that opens the list, instead of fading out under the +")}>+${more}</button>` : "");
  const quietDates = button("This month", { v: "ghost", s: "sm", icon: "calendar", iconEnd: "chevron-down", cls: "[&_svg:last-child]:text-gray-400", attrs: chg("Dates and + are quiet buttons, so the applied chips are the only bordered things on the bar") });
  return `<div class="pt-8">
    <div class="${R.box}"${chg("The toolbar and the rows under it sit in one box, so no line stops short of the edge; With payer, the usual status, is blank")}>
      <div class="flex items-center gap-2 h-12 px-4 border-b border-gray-200/80 min-w-0" role="toolbar" aria-label="Claims toolbar">
        ${pin(1, `<button type="button" class="${cx(R.btn, R.sm, R.ghost, "-ms-2")}">All claims <span class="${R.count}">24</span>${I("chevron-down", "!text-gray-400")}</button>`)}
        <span class="h-5 shrink-0 border-s border-gray-200/80"></span>
        ${pin(2, searchBox("Search claims", { w: "w-40" }))}
        ${pin(3, quietDates)}
        ${pin(4, button("Sort", { v: "ghost", s: "sm", icon: "arrow-up-down", attrs: 'aria-haspopup="menu"' }))}
        ${custom ? `<span class="relative shrink-0"><span class="absolute -top-7 left-4 flex size-5 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white" aria-hidden="true">5</span><span class="flex min-w-0 items-center gap-1.5">${chipHtml}</span></span>` : ""}
        ${pin(6, iconButton("plus", "Add a filter", { v: "ghost", s: "iconSm" }))}
        <span class="ms-auto">${pin(7, iconButton("ellipsis", "More: columns, export, save view", { s: "iconSm" }))}</span>
      </div>
      <div class="opacity-50 pointer-events-none" aria-hidden="true"><table class="w-full table-fixed border-separate border-spacing-0 [&_tr>*:first-child]:!ps-4 [&_tr>*:last-child]:!pe-4 [&_tbody_tr:last-child>td]:!border-b-0"><thead><tr>${["Patient", "Service date", "Payer", "Billed", "Status"].map((h, i) => `<th class="${R.gridHead} ${i === 3 ? "text-end" : ""} last:border-e-0">${h}</th>`).join("")}</tr></thead>
        <tbody>${[["p13", "2026-07-22", "cigna", 320, "Denied", "needs"], ["p1", "2026-09-02", "delta", 253, "With payer", "off"]].map((c) => `<tr><td class="${R.gridCell}">${esc(DATA.patient(c[0]).name)}</td><td class="${R.gridCell}">${fmtDate(c[1])}</td><td class="${R.gridCell}">${DATA.payer(c[2]).short}</td><td class="${R.gridCell} text-end tabular-nums">${money(c[3])}</td><td class="${R.gridCell} border-e-0">${c[4] === "Denied" ? statusDot(c[4], c[5]) : ""}</td></tr>`).join("")}</tbody></table></div>
    </div>
    <ol class="mt-6 grid grid-cols-4 gap-x-6 gap-y-4">${V2_TOOL_PARTS.map(([t, d], i) => `<li class="flex gap-x-2.5"><span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white tabular-nums mt-px">${i + 1}</span><span><span class="block text-sm font-medium text-gray-800">${t}</span><span class="block ${R.help}">${d}</span></span></li>`).join("")}</ol>
    ${custom ? "" : `<p class="mt-5">${note("With the usual order and no filters there are no chips (5). The + and ⋯ stay where they are.", "info")}</p>`}
  </div>`;
}
defineBlock({
  cat: "shell", id: "shell-toolbar",
  title: "The one-line toolbar",
  note: V2 ? "Every list uses the same single line: view, search, dates, Sort, condition chips, + and ⋯. A custom sort and each filter show as white Attio chips that read like a sentence, and they're the only bordered things on the bar. Controls are 32px tall and it never wraps; chips that don't fit fold into one “+4” chip that lists the rest."
    : "Every list uses the same single line: view, search, dates, Sort, condition chips, the square + and ⋯. A custom sort and each filter show as white Attio chips that read like a sentence. Controls are 32px tall and it never wraps; with many chips they scroll sideways.",
  where: "Claims, Lists, Revenue Intelligence",
  states: ["With filters", "No filters", "Many filters"],
  canvas: "white",
  html: (state) => {
    if (V2) return v2ShellToolbar(state);
    const chips = state === "No filters" ? [] : state === "Many filters" ? [["Status is", "Denied"], ["Payer is", "Delta Dental"], ["Biller is", "Nina Flores"], ["Type is", "Secondary"], ["Billed is over", "$500.00"]] : [["Status is", "Denied"]];
    const custom = state !== "No filters";
    const chipHtml = (custom ? condChip("Sorted by", "", `Service date ${I("arrow-down", "size-3.5")}`, "", "Remove sort") : "") + chips.map(([k, v]) => `${condChip(k.replace(/ is$/, ""), / is$/.test(k) ? "is" : "", v, "", `Remove ${k} ${v} filter`)}`).join("");
    return `<div class="pt-8">
      <div class="flex items-center gap-2 h-12 border-b border-gray-200/80 min-w-0" role="toolbar" aria-label="Claims toolbar">
        ${pin(1, `<button type="button" class="${cx(R.btn, R.sm, R.ghost, "-ms-2")}">All claims <span class="${R.count}">24</span>${I("chevron-down", "!text-gray-400")}</button>`)}
        <span class="h-5 shrink-0 border-s border-gray-200/80"></span>
        ${pin(2, searchBox("Search claims", { w: "w-48" }))}
        ${pin(3, dateRangeButton("This month"))}
        ${pin(4, button("Sort", { v: "ghost", s: "sm", icon: "arrow-up-down", attrs: 'aria-haspopup="menu"' }))}
        ${custom ? `<span class="relative min-w-0 shrink">${`<span class="absolute -top-7 left-4 flex size-5 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white" aria-hidden="true">5</span>`}<span class="flex min-w-0 items-center gap-1.5 overflow-x-auto [scrollbar-width:none]" data-scroll-ok ${chips.length > 3 ? 'style="mask-image:linear-gradient(to right,#000 80%,transparent);-webkit-mask-image:linear-gradient(to right,#000 80%,transparent)"' : ""}>${chipHtml}</span></span>` : ""}
        ${pin(6, iconButton("plus", "Add a filter", { v: "white", s: "iconSm" }))}
        <span class="ms-auto">${pin(7, iconButton("ellipsis", "More: columns, export, save view", { s: "iconSm" }))}</span>
      </div>
      <div class="opacity-50 pointer-events-none" aria-hidden="true"><table class="w-full table-fixed border-separate border-spacing-0"><thead><tr>${["Patient", "Service date", "Payer", "Billed", "Status"].map((h, i) => `<th class="${R.gridHead} ${i === 3 ? "text-end" : ""} last:border-e-0">${h}</th>`).join("")}</tr></thead>
        <tbody>${[["p13", "2026-07-22", "cigna", 320, "Denied", "needs"], ["p1", "2026-09-02", "delta", 253, "With payer", "off"]].map((c) => `<tr><td class="${R.gridCell}">${esc(DATA.patient(c[0]).name)}</td><td class="${R.gridCell}">${fmtDate(c[1])}</td><td class="${R.gridCell}">${DATA.payer(c[2]).short}</td><td class="${R.gridCell} text-end tabular-nums">${money(c[3])}</td><td class="${R.gridCell} border-e-0">${statusDot(c[4], c[5])}</td></tr>`).join("")}</tbody></table></div>
      <ol class="mt-6 grid grid-cols-4 gap-x-6 gap-y-4">${TOOL_PARTS.map(([t, d], i) => `<li class="flex gap-x-2.5"><span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white tabular-nums mt-px">${i + 1}</span><span><span class="block text-sm font-medium text-gray-800">${t}</span><span class="block ${R.help}">${d}</span></span></li>`).join("")}</ol>
      ${custom ? "" : `<p class="mt-5">${note("With the usual order and no filters there are no chips (5). The + and ⋯ stay where they are.", "info")}</p>`}
    </div>`;
  }
});

/* ============================================================ 6. Home setup checklist */
/* v4: every step is two lines, its title and one line under it. The step in progress shows its parts on that line
 * (a check on the ones done), with no "2 of 3 parts done" count and no extra sentence; Continue stays. */
function v4ShellSetupSteps(S, first, mark, word) {
  const parts = first ? [["Practice name", true], ["Tax ID", false], ["Owner's NPI", false]] : [["Address", true], ["4 chairs", true], ["Office hours", false]];
  const partsLine = `<p class="flex flex-wrap items-center gap-x-1.5 text-[13px] leading-5 text-gray-500"${chg4("One line under the step shows its parts, with a check on the ones done. The “2 of 3 parts done” count and the extra sentence are gone, so every step reads as two lines")}>${parts.map(([t, ok], i) => `${i ? '<span aria-hidden="true">·</span>' : ""}<span class="inline-flex items-center gap-1 ${ok ? "text-gray-600" : ""}">${t}${ok ? `${I("check", "size-3.5 text-blue-600")}<span class="sr-only"> done</span>` : ""}</span>`).join("")}</p>`;
  return `<ol class="divide-y divide-gray-200/80" aria-label="Setup steps">${S.map((s) => s.st === "done"
    ? `<li><a href="#" class="group flex min-h-8 items-center gap-3 px-4 py-3 hover:bg-gray-50">${mark(s.st)}<span class="sr-only">${word[s.st]}: </span>
        <div class="min-w-0 grow"><p class="text-sm font-medium text-gray-800">${s.t}</p><p class="text-[13px] leading-5 text-gray-500">${s.meta}</p></div>${I("chevron-right", "size-4 shrink-0 text-gray-300 group-hover:text-gray-500")}</a></li>`
    : `<li class="flex min-h-8 items-center gap-3 px-4 py-3">${mark(s.st)}<span class="sr-only">${word[s.st]}: </span>
      <div class="min-w-0 grow"><p class="text-sm ${s.st === "next" ? "text-gray-500" : "font-medium text-gray-800"}">${s.t}</p>${s.body ? partsLine : `<p class="truncate text-[13px] leading-5 ${s.st === "problem" ? "text-gray-600" : "text-gray-500"}">${s.meta}</p>`}</div>
      <div class="shrink-0">${s.act}</div></li>`).join("")}</ol>`;
}
function setupSteps(first) {
  const S = first ? [
    { t: "Fill in the registration form", st: "now", meta: "About 5 minutes", act: button("Continue", { v: "solid", s: "xs" }), body: true },
    { t: "Connect your practice software", st: "next", meta: "Usually done the same day", act: button("Connect", { v: "white", s: "xs" }) },
    { t: "Set up your first location", st: "next", meta: "Address, hours and chairs", act: button("Set up", { v: "white", s: "xs" }) },
    { t: "Enroll with the clearinghouse", st: "next", meta: "Payers take 3–10 business days", act: button("Start", { v: "white", s: "xs" }) },
    { t: "Hire an AI agent", st: "next", meta: "Pick one from the list", act: button("Browse agents", { v: "white", s: "xs" }) }
  ] : [
    { t: "Fill in the registration form", st: "done", meta: "Done Sep 18 by Nina Flores", act: button("View", { v: "ghost", s: "xs" }) },
    { t: "Connect your practice software", st: "done", meta: "Dentrix · connected Sep 19", act: button("Open", { v: "ghost", s: "xs" }) },
    { t: "Set up your first location", st: "now", meta: "2 of 3 parts done", act: button("Continue", { v: "solid", s: "xs" }), body: true },
    { t: "Enroll with the clearinghouse", st: "problem", meta: "Delta Dental sent the form back: the NPI doesn't match your tax ID.", act: button("Fix NPI", { v: "white", s: "xs" }) },
    { t: "Hire an AI agent", st: "next", meta: "Pick one from the list", act: button("Browse agents", { v: "white", s: "xs" }) }
  ];
  const mark = (st) => st === "done" ? `<span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">${I("check", "size-3")}</span>`
    : st === "now" ? `<span class="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-blue-600"><span class="size-1.5 rounded-full bg-blue-600"></span></span>`
    : st === "problem" ? `<span class="flex size-5 shrink-0 items-center justify-center rounded-full border border-orange-300"><span class="size-2 rounded-full bg-orange-500"></span></span>`
    : `<span class="size-5 shrink-0 rounded-full border border-gray-300"></span>`;
  const word = { done: "Done", now: "In progress", next: "Not started", problem: "Needs you" };
  const body = first ? `<p class="${R.help}">We use this for billing and your contract. Have your tax ID and the owner's NPI handy.</p>
      <div class="flex items-center gap-4 text-[13px] text-gray-600"><span class="inline-flex items-center gap-1.5">${I("circle-check", "size-4 text-blue-600")}Practice name</span><span class="inline-flex items-center gap-1.5">${I("circle-dashed", "size-4 text-gray-400")}Tax ID</span><span class="inline-flex items-center gap-1.5">${I("circle-dashed", "size-4 text-gray-400")}Owner's NPI</span></div>`
    : `<p class="${R.help}">Tell us your address, hours and chairs so Asha can book and confirm visits.</p>
      <div class="flex items-center gap-4 text-[13px] text-gray-600"><span class="inline-flex items-center gap-1.5">${I("circle-check", "size-4 text-blue-600")}Address</span><span class="inline-flex items-center gap-1.5">${I("circle-check", "size-4 text-blue-600")}4 chairs</span><span class="inline-flex items-center gap-1.5">${I("circle-dashed", "size-4 text-gray-400")}Office hours</span></div>`;
  if (V4) return v4ShellSetupSteps(S, first, mark, word);
  if (V2) { let doneMarked = false;
    return `<ol class="divide-y divide-gray-200/80" aria-label="Setup steps">${S.map((s) => s.st === "done"
      ? `<li><a href="#" class="group flex min-h-8 items-center gap-3 px-4 py-3 hover:bg-gray-50"${doneMarked ? "" : ((doneMarked = true), chg("A done step is a quiet link to what was set up, with a grey chevron, instead of a View or Open button"))}>${mark(s.st)}<span class="sr-only">${word[s.st]}: </span>
          <div class="min-w-0 grow"><p class="text-sm font-medium text-gray-800">${s.t}</p><p class="text-[13px] leading-5 text-gray-500">${s.meta}</p></div>${I("chevron-right", "size-4 shrink-0 text-gray-300 group-hover:text-gray-500")}</a></li>`
      : `<li class="px-4 py-3">
    <div class="flex min-h-8 items-center gap-3">${mark(s.st)}<span class="sr-only">${word[s.st]}: </span>
      <div class="min-w-0 grow"><p class="text-sm ${s.st === "next" ? "text-gray-500" : "font-medium text-gray-800"}">${s.t}</p><p class="text-[13px] leading-5 ${s.st === "problem" ? "text-gray-600" : "text-gray-500"}">${s.meta}</p></div>
      <div class="shrink-0">${s.act}</div></div>
    ${s.body ? `<div class="space-y-2.5 ps-8 pt-2 pb-1">${body}</div>` : ""}</li>`).join("")}</ol>`; }
  return `<ol class="divide-y divide-gray-200/80" aria-label="Setup steps">${S.map((s) => `<li class="px-4 py-3">
    <div class="flex min-h-8 items-center gap-3">${mark(s.st)}<span class="sr-only">${word[s.st]}: </span>
      <div class="min-w-0 grow"><p class="text-sm ${s.st === "next" ? "text-gray-500" : "font-medium text-gray-800"}">${s.t}</p><p class="text-[13px] leading-5 ${s.st === "problem" ? "text-gray-600" : "text-gray-500"}">${s.meta}</p></div>
      <div class="shrink-0">${s.act}</div></div>
    ${s.body ? `<div class="space-y-2.5 ps-8 pt-2 pb-1">${body}</div>` : ""}</li>`).join("")}</ol>`;
}
defineBlock({
  cat: "shell", id: "shell-home-setup",
  title: "Home setup checklist",
  note: "A new office's first steps on Home, in order: done, now, next, or a problem only a person can fix. Every step keeps its button, so nothing is locked behind an earlier step.",
  where: "Home",
  states: ["In progress", "First day"],
  canvas: "bare",
  html: (state) => {
    const first = state === "First day", done = first ? 0 : 2;
    return `${workspaceHeader({ title: "Home", actions: `${button("Invite your team", { v: "white", s: "sm", icon: "user-plus" })}` })}
    <div class="px-8 pt-7 pb-8">
      <h1 class="${R.pageTitle}">Good morning, Nina</h1><p class="${R.secondary} mt-1">Friday, September 25 · ${PRACTICE.name}</p>
      <div class="mt-6 grid grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
        <section class="${R.box}" aria-labelledby="setup-h">
          <div class="px-4 pt-4 pb-3 border-b border-gray-200/80">
            <div class="flex items-center justify-between gap-4"><h2 id="setup-h" class="${R.sectionTitle}">Setup checklist</h2><span class="text-[13px] text-gray-500 tabular-nums"${chg("Progress is said once, \"2 of 5 done\": the segment bar and the \"One step needs you\" line repeated it")}>${done} of 5 done</span></div>
            ${V2 ? "" : `<div class="mt-2.5 grid grid-cols-5 gap-1.5" aria-hidden="true">${[0, 1, 2, 3, 4].map((i) => `<span class="h-1.5 rounded-full ${i < done ? "bg-blue-600" : "bg-gray-100"}"></span>`).join("")}</div>
            <p class="${R.help} mt-2.5">Finish these to get your AI staff up and running.${first ? "" : " One step needs you."}</p>`}</div>
          ${setupSteps(first)}
        </section>
        <aside class="${R.box}" aria-label="Today">
          <section class="px-4 pt-3.5 pb-3"><h2 class="${R.groupTitle} mb-1">Today</h2>
            ${V2 ? `<div${chg("Today's numbers line up at the right edge of the card instead of floating mid-card")}>${[["calendar", "Appointments", 34], ["message-square", "Unconfirmed", 5], ["receipt", "Claims to send", 3], ["square-check", "Your tasks", 12]].map(([ic, k, n]) => `<div class="flex min-h-9 items-center justify-between gap-3 text-sm"><span class="${R.kvKey}">${I(ic)}${k}</span><span class="tabular-nums ${first ? "text-gray-400" : "text-gray-800"}">${first ? "—" : n}</span></div>`).join("")}</div>`
            : `${kv("calendar", "Appointments", first ? '<span class="text-gray-400">—</span>' : `<span class="tabular-nums">34</span>`)}
            ${kv("message-square", "Unconfirmed", first ? '<span class="text-gray-400">—</span>' : `<span class="tabular-nums">5</span>`)}
            ${kv("receipt", "Claims to send", first ? '<span class="text-gray-400">—</span>' : `<span class="tabular-nums">3</span>`)}
            ${kv("square-check", "Your tasks", first ? '<span class="text-gray-400">—</span>' : `<span class="tabular-nums">12</span>`)}`}
            <p class="${R.caption} mt-2">${first ? "These fill in once your practice software is connected." : "Updated 8:42 AM from Dentrix."}</p></section>
          <section class="border-t border-gray-200/80 pt-3 pb-1.5"><h2 class="${R.groupTitle} px-4 mb-1">Need a hand?</h2>
            ${[["book-open", "Read the setup guide"], ["calendar-plus", "Book an onboarding call"]].map(([ic, t]) => `<a href="#" class="group flex items-center gap-2.5 px-4 py-2 text-sm text-gray-800 hover:bg-gray-50">${I(ic, "size-4 shrink-0 text-gray-400")}<span class="min-w-0 grow truncate">${t}</span>${I("chevron-right", "size-4 shrink-0 text-gray-300 group-hover:text-gray-500")}</a>`).join("")}</section>
        </aside>
      </div></div>`;
  }
});

/* ============================================================ 7. User menu + sign out everywhere */
const userMenu = () => `<div class="${R.menu} !w-64" role="menu" aria-label="Your account">
  <div class="flex items-center gap-2.5 px-2 pt-1.5 pb-2">${avatar(ME.name, { size: 8 })}<div class="min-w-0"><p class="truncate text-sm font-medium text-gray-800">${ME.name}</p><p class="truncate text-xs text-gray-500">${ME.email}</p></div></div>
  <div class="${R.menuSep}"></div>
  <button type="button" role="menuitem" class="${R.menuItem}">${I("settings")}Account settings</button>
  <button type="button" role="menuitem" class="${R.menuItem}">${I("mail-check")}<span class="grow text-start">Invitations</span><span class="${R.countBlue}" aria-label="2 pending invitations">2</span></button>
  <button type="button" role="menuitem" class="${R.menuItem}">${I("building")}Organization settings</button>
  <button type="button" role="menuitem" class="${R.menuItem}">${I("eye-off")}<span class="grow text-start">Privacy screen</span><span class="flex gap-0.5">${kbd("Shift")}${kbd("P")}</span></button>
  <div class="${R.menuSep}"></div>
  <button type="button" role="menuitem" class="${R.menuItem}">${I("log-out")}Sign out</button>
  ${V2 ? `<div class="${R.menuSep}"></div><button type="button" role="menuitem" class="${R.menuDanger}" data-act="all-devices"${chg("\"Sign out everywhere\" uses the same words as its confirm button, in red after a line, since it signs out every computer")}>${I("monitor-off")}Sign out everywhere</button>`
  : `<button type="button" role="menuitem" class="${R.menuItem}" data-act="all-devices">${I("monitor-off")}Sign out of all devices</button>`}</div>`;
const v2SignOutDialog = () => `<div class="${R.dialog}" role="alertdialog" aria-modal="true" aria-labelledby="so-t" aria-describedby="so-d">
  <div class="p-5"${chg("A plain dialog: no icon circle pushing the title right, and the reassurance is one sentence in the body instead of a separate note")}><h2 id="so-t" class="${R.sectionTitle}">Sign out everywhere?</h2><p id="so-d" class="${R.help} mt-1">This ends your sign-in on every computer, so anyone using this account elsewhere signs in again. Reminders, claims and your AI staff keep running.</p></div>
  <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200/80">${button("Cancel", { v: "white", s: "md", attrs: 'data-act="cancel"' })}${button("Sign out everywhere", { v: "dangerSolid", s: "md", attrs: 'data-act="confirm"' })}</div></div>`;
const signOutDialog = () => V2 ? v2SignOutDialog() : `<div class="${R.dialog}" role="alertdialog" aria-modal="true" aria-labelledby="so-t" aria-describedby="so-d">
  <div class="flex gap-x-3.5 p-5"><span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">${I("monitor-off", "size-4")}</span>
    <div><h2 id="so-t" class="${R.sectionTitle}">Sign out of all devices?</h2><p id="so-d" class="${R.help} mt-1">This ends this account's session on every computer. Anyone using this account elsewhere will need to sign in again.</p>
      <p class="mt-3">${note("Reminders, claims and your AI staff keep running. Only sign-ins end.", "info")}</p></div></div>
  <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200/80">${button("Cancel", { v: "white", s: "md", attrs: 'data-act="cancel"' })}${button("Sign out everywhere", { v: "dangerSolid", s: "md", attrs: 'data-act="confirm"' })}</div></div>`;
defineBlock({
  cat: "shell", id: "shell-user-menu",
  title: "User menu and sign out everywhere",
  note: "Your name at the bottom of the sidebar opens this menu, with a count on Invitations. Signing out of every device asks first, says exactly what happens, and uses the red button. Try it.",
  where: "Sidebar › Your name",
  states: ["Menu", "Confirm sign out everywhere"],
  canvas: "bare",
  html: (state) => {
    const confirm = state !== "Menu";
    return `<div class="relative flex h-[600px]" data-user-root>${sidebarExpanded("Tasks", { userOpen: !confirm })}${tasksPage()}
      <div data-layer>${confirm ? confirmLayer() : menuLayer()}</div></div>`;
  },
  mount: (el) => {
    const root = el.querySelector("[data-user-root]"); if (!root) return;
    const layer = root.querySelector("[data-layer]");
    root.addEventListener("click", (e) => {
      if (e.target.closest('[data-act="all-devices"]')) { layer.innerHTML = confirmLayer(); icons(); root.querySelector('[data-act="cancel"]').focus(); }
      else if (e.target.closest('[data-act="cancel"],[data-act="confirm"]')) { layer.innerHTML = menuLayer(); icons(); }
      else if (e.target.closest("a")) e.preventDefault();
    });
  }
});
function menuLayer() { return `<div class="absolute z-10 bottom-[62px] start-2">${userMenu()}</div>`; }
function confirmLayer() { return `<div class="absolute inset-0 z-10 bg-gray-900/20" aria-hidden="true"></div><div class="absolute inset-0 z-10 flex items-center justify-center">${signOutDialog()}</div>`; }

})();
