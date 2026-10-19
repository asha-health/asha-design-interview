/* Settings blocks. Follow .agents/skills/asha-ui/references/settings-kit.md (INVENTORY.md §11). */
(() => {

/* The grey Reports-style settings menu, shared by the page blocks below */
function settingsMenu(active = "Labs") {
  const groups = [["Practice", [["building-2", "Practice info"], ["clock", "Hours & closures"], ["history", "Settings history"]]], ["Team & access", [["users", "Team members"], ["key-round", "Roles & permissions"]]], ["Clinical", [["list", "Procedure codes"], ["smile", "Tooth chart"], ["pen-line", "Note signing"], ["flask-conical", "Labs"]]], ["Insurance & claims", [["shield-check", "Clearinghouse"], ["hourglass", "Filing deadlines"], ["file-check", "ERA enrollment"]]], ["Connections", [["plug", "Practice software"], ["scan-line", "X-ray imaging"]]]];
  return `<nav class="h-full border-e border-gray-200/80 bg-white p-3" aria-label="Settings">
    <div class="relative mb-1">${searchBox("Search settings", { w: "w-full" })}<span class="absolute inset-y-0 end-0 flex items-center pe-1.5">${kbd("⌘K")}</span></div>
    ${groups.map(([g, items]) => `<p class="${R.navGroup}">${g}</p>${items.map(([ic, l]) => `<a class="${l === active ? R.navItemOn : R.navItem}" ${l === active ? 'aria-current="page"' : ""}>${I(ic)}${l}</a>`).join("")}`).join("")}
  </nav>`;
}

defineBlock({
  cat: "settings", id: "settings-labs-page", thumb: true,
  title: "A settings page with a list",
  note: "Practice Settings › Labs, built only from kit parts: the one-line header, the grey menu, a group of settings rows, and the Lists grid. Click a lab to open it.",
  where: "Settings › Clinical › Labs",
  states: ["A normal week", "First day, no labs", "Busy office"],
  canvas: "bare",
  html: () => `${workspaceHeader({ parent: "Practice Settings", title: "Bayview Family Dental" })}
    <div class="grid grid-cols-[232px_1fr]">
      ${settingsMenu("Labs")}
      <div class="min-w-0 pb-6">
        <div class="px-8 pt-7">
          <h1 class="${R.pageTitle}">Labs</h1>
          <p class="${R.secondary} mt-1">Where you send cases, and how long they usually take.</p>
          <h2 class="${R.groupTitle} mt-7 mb-2">Late cases</h2>
          <div class="${R.box} divide-y divide-gray-200/80">
            <div class="flex items-center justify-between gap-6 px-4 py-3 min-h-11"><div><p class="${R.label} flex items-center gap-1.5">Remind me when a case is late ${I("info", "size-3.5 text-gray-400")}</p><p class="${R.help}">We add a task the day after it was due back.</p></div>${sw(true, "Remind me when a case is late")}</div>
            <div class="flex items-center justify-between gap-6 px-4 py-3 min-h-11"><div><p class="${R.label}">Default turnaround</p><p class="${R.help}">Used when a lab has no turnaround set.</p></div><button type="button" class="${R.select} !w-36">7 days${I("chevrons-up-down")}</button></div>
          </div>
          <h2 class="${R.groupTitle} mt-8 flex items-center gap-2">Your labs</h2>
        </div>
        <div class="px-8" data-grid="labs"${chg4("Turnaround, Phone and Contact are cells you type into right in the list (click, or just start typing; Enter saves), and Makes is a list you tick several in. The lab's name still opens it for the rest.")}></div>
      </div>
    </div>`,
  mount: (el, state) => labGrid(el.querySelector('[data-grid="labs"]'), state === "Busy office" ? LAB_BUSY : state === "First day, no labs" ? [] : LAB_ROWS, Object.assign({ maxHeight: 360, gutter: 32 }, V4 ? v4LabOpts() : {}))
});

/* v4 labs: the everyday columns are typed into the list (sheet editing); the name opens the lab, whose header is the
 * standard record header with one Actions menu, and whose facts are a table you type into, Status first */
function v4LabOpts() {
  let grid = null;
  const cols = labColumns().map((c) => c.key === "name" ? { ...c, edit: (r) => (r.v4New ? "text" : null), placeholder: () => "Lab name" }
    : c.key === "types" ? { ...c, edit: "multi", options: Object.keys(TYPE_TONE) } : c.key === "days" ? { ...c, edit: "text" } : c.key === "phone" ? { ...c, edit: "text", placeholder: () => "Add phone" } : c.key === "contact" ? { ...c, edit: "text", placeholder: () => "Add contact" } : c);
  const openLab = (r, g) => { grid = g || grid;
    const f = (label, key, value, o = {}) => ({ label, key, value, type: o.type || "text", options: o.options, html: o.html });
    const rows = [f("Status", "status", LAB_STATUS[r.status], { type: "select", options: ["Active", "Paused"], html: (x) => statusDot(x.value, x.value === "Active" ? "on" : x.value === "Paused" ? "off" : "needs") }),
      f("Phone", "phone", r.phone), f("Contact", "contact", r.contact), f("Turnaround", "days", String(r.days), { html: (x) => `${esc(x.value)} <span class="text-gray-500">days</span>` }),
      f("Makes", "types", r.types, { type: "multi", options: Object.keys(TYPE_TONE) }),
      f("Last case", "last", r.last ? fmtDate(r.last) : "", { type: "none", html: (x) => (x.value ? esc(x.value) : '<span class="text-gray-400">No cases yet</span>') })];
    const sync = (x, key, v) => { if (x.key === "status") r.status = v === "Active" ? (r.phone ? "on" : "needs") : "off"; else if (x.key === "days") r.days = parseFloat(v) || r.days; else r[x.key] = v;
      if (x.key === "phone" && r.status !== "off") r.status = r.phone ? "on" : "needs"; if (grid) grid.render(); };
    Sheet.open({ title: esc(r.name), lead: avatar(r.name, { size: 9, square: true, solid: true }), subtitle: `${r.open} open ${r.open === 1 ? "case" : "cases"}`, tabs: ["Overview", ["Cases", r.open], "Activity"],
      actions: actionsMenu(v4LabActions(r), { dots: true, up: false, align: "end", open: V4_OPTS.open }), flush: true,
      body: `${psec("", fieldTable(rows, { labelW: 120, title: "Lab", onCommit: sync }))}${psec("Notes", `<textarea class="${R.textarea}" placeholder="Pickup times, who to call, anything the team should know"></textarea>`)}` }); };
  return { sheet: true, columns: cols, onOpen: openLab, onCommit: (r, key) => { if (key === "name") r.v4New = false; if (key === "phone" && r.status !== "off") r.status = r.phone ? "on" : "needs"; },
    onNew: (g) => { const id = Date.now() % 1e6; g.data.unshift({ id, name: "", v4New: true, status: "needs", types: [], days: 7, open: 0, phone: "", contact: "", last: "" }); g.q = ""; g.filters = {}; g.sort = null;
      g.render(); g.active = { r: g.visible.findIndex((x) => x.id === id), c: 0 }; g.fresh = new Set([id]); g.startEdit(); } };
}
/* The lab's Actions menu (Status, phone, contact and turnaround are typed into its table, so they aren't repeated) */
const v4LabActions = (r) => [
  { label: "Cases", items: [{ icon: "package-plus", label: "Send a case", hint: "Start a lab slip for this lab" }, { icon: "truck", label: "Ask for a pickup", hint: "Text the lab to collect today's cases", off: r.phone ? "" : "Add the lab's phone first" },
    { icon: "printer", label: "Print lab slips", hint: "Blank slips with your account number" }] },
  { label: "Lab", items: [{ icon: "link", label: "Copy link", hint: "To paste in a message to a teammate" }, { icon: "history", label: "Lab history", hint: "Every change, who made it and when" }] },
  { label: "", items: [{ icon: "trash-2", label: "Remove lab", hint: "Past cases stay on patients' charts", danger: true }] }];

/* ================================================================ settings kit, drawn locally
 * Mirrors apps/web/src/asha-ui/settings-rows.tsx, settings-fields.tsx, settings-lists.tsx and settings.tsx, with the
 * owner's round-2 recipe: a section title above ONE box; the box has no padding and a full-width hairline between rows;
 * every row is px-4 py-3 (44px minimum) with the label (14 medium) and one grey help line (13) on the left, and ONE right
 * column where selects (w-36), switches, values and chevrons all sit right-aligned and centred. A follow-up question is
 * its own row, indented. A value another page owns makes the whole row open that page (grey value + chevron). A row that
 * needs someone shows alertMark (icon + a few words) before its control, never an extra line. The (i) explains on hover. */
const sValue = (v) => `<span class="min-w-0 truncate text-sm tabular-nums text-gray-800">${v}</span>`;
const infoHint = (name, tip = "") => `<span class="group/info relative inline-flex shrink-0">
  <button type="button" class="inline-flex size-4 items-center justify-center rounded-full text-gray-400 hover:text-gray-700 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-blue-600/20 cursor-help" aria-label="What is ${esc(name)}?">${I("info", "size-3.5")}</button>
  ${tip ? `<span role="tooltip" class="pointer-events-none invisible opacity-0 transition-opacity duration-150 group-hover/info:visible group-hover/info:opacity-100 group-focus-within/info:visible group-focus-within/info:opacity-100 absolute bottom-full -start-2.5 z-30 mb-2 w-72 rounded-md bg-gray-900 px-2.5 py-2 text-xs leading-5 font-normal text-white shadow-md">${tip}<span class="absolute -bottom-1 start-3.5 size-2 rotate-45 bg-gray-900"></span></span>` : ""}</span>`;
const lockLine = (reason) => `<p class="flex items-center gap-1.5 text-[13px] leading-5 text-gray-500">${I("lock", "size-3.5 shrink-0 text-gray-400")}${reason}</p>`;
/* AshaSaveStatus, on the label line: "Saving…" · "✓ Saved" · "Couldn't save" (the reason takes the help line) */
/* v2: a save that worked shows nothing; a failed one is an orange icon with grey words (the inline-alert style) */
const saveStatus = (state) => V2 ? (state === "saving" ? `<span class="inline-flex items-center gap-1 text-xs font-normal text-gray-500" role="status">Saving…</span>`
    : state === "error" ? `<span class="inline-flex items-center gap-1 text-xs font-normal text-gray-600" role="status"${chg("'Couldn't save' is grey words with an orange icon, the same as every other alert, instead of orange text")}>${I("circle-alert", "size-3.5 text-orange-500")}Couldn't save</span>` : "")
  : state === "saving" ? `<span class="inline-flex items-center gap-1 text-xs font-normal text-gray-500" role="status">Saving…</span>`
  : state === "saved" ? `<span class="inline-flex items-center gap-1 text-xs font-normal text-gray-500" role="status">${I("check", "size-3.5")}Saved</span>`
  : state === "error" ? `<span class="inline-flex items-center gap-1 text-xs font-normal text-orange-700" role="status">${I("circle-alert", "size-3.5 text-orange-500")}Couldn't save</span>` : "";
/* AshaSettingsSection: small title (+ info, count, description, lock line, actions), then ONE box of rows */
function sSection(title, body, { count, info, desc, actions = "", flush = false, readOnly } = {}) {
  return `<section class="space-y-2">
    <div class="flex min-h-8 items-end justify-between gap-3"><div class="min-w-0">
      <div class="flex min-w-0 items-center gap-1.5"><h3 class="truncate text-sm font-semibold text-gray-800">${title}</h3>${info ? infoHint(title, info === true ? "" : info) : ""}${count != null ? `<span class="text-[13px] tabular-nums text-gray-500">${count}</span>` : ""}</div>
      ${desc ? `<p class="mt-0.5 ${R.help}">${desc}</p>` : ""}${readOnly ? `<div class="mt-0.5">${lockLine(readOnly)}</div>` : ""}</div>
      ${actions ? `<div class="flex shrink-0 items-center gap-2">${actions}</div>` : ""}</div>
    <div class="${R.box} ${flush ? "overflow-hidden" : ""} divide-y divide-gray-200/80">${body}</div></section>`;
}
/* AshaSettingsRow. owner: the value lives on another page, so the row opens it. follow: a follow-up row under this one. */
function sRow({ label, help = "", info = false, tip = "", control = "", alert = "", save, why = "", owner = "", readOnly = false, indent = false, stacked = false, follow = "", cls = "", attrs = "" }) {
  const helpText = save === "error" && why ? `<span class="text-gray-600">${why}</span>` : `${help}${owner ? `${help ? " · " : ""}Set in ${owner}` : ""}`;
  const left = `<div class="min-w-0 flex-1"><div class="flex min-w-0 items-center gap-1.5">${V2 && indent ? I("corner-down-right", "size-3.5 shrink-0 text-gray-300") : ""}<span class="text-sm font-medium text-gray-800">${label}</span>${info ? infoHint(label, tip) : ""}${save ? `<span class="ms-1.5 inline-flex">${saveStatus(save)}</span>` : ""}</div>
      ${helpText ? `<p class="mt-0.5 ${R.help}">${helpText}</p>` : ""}</div>`;
  const opens = owner && !readOnly;
  const right = control || alert ? `<div class="${stacked ? "mt-2.5" : "flex min-w-36 shrink-0 items-center justify-end gap-3"}">${alert}${control}${opens ? I("chevron-right", "size-4 shrink-0 text-gray-400 group-hover/row:text-gray-600") : ""}</div>` : "";
  const base = `${indent ? "ps-10" : "ps-4"} pe-4 py-3 min-h-11 ${save === "saved" && !V2 ? "asha-settle" : ""} ${cls}`;
  const row = opens
    ? `<button type="button" class="group/row flex w-full items-center gap-6 text-start hover:bg-gray-50 focus-visible:outline-hidden focus-visible:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg ${base}" aria-label="${esc(label)}: open ${esc(owner)}"${attrs}>${left}${right}</button>`
    : `<div class="${stacked ? "" : "flex items-center gap-6"} ${base}${V2 ? " group/row" : ""}"${attrs}>${left}${right}</div>`;
  return row + follow;
}
/* A value another page owns: grey-800 value; the row itself opens the owner (see sRow owner) */
const selectBtn = (v, w = "!w-36", label = "") => `<button type="button" class="${R.select} ${w}" ${label ? `aria-label="${esc(label)}"` : ""}>${v}${I("chevrons-up-down")}</button>`;
const xsWhite = (label, attrs = "") => button(label, { v: "white", s: "xs", attrs });
/* The page inside the settings shell (PracticeConfigView): one header bar, the grey menu, the page title and description */
const settingsPage = (active, title, desc, body, { top = "", max = "max-w-3xl" } = {}) => `${workspaceHeader({ parent: "Practice Settings", title: "Bayview Family Dental" })}
  <div class="grid grid-cols-[232px_1fr]">${settingsMenu(active)}
    <div class="min-w-0 px-8 pt-7 pb-8"><h1 class="${R.pageTitle}">${title}</h1><p class="${R.secondary} mt-1">${desc}</p>${top}
      <div class="mt-6 ${max} space-y-8">${body}</div></div></div>`;
/* A page's content alone, for blocks shown without the menu */
const pageBody = (title, desc, body, max = "max-w-3xl") => `<div class="${max}">${title ? `<h1 class="${R.pageTitle}">${title}</h1><p class="${R.secondary} mt-1">${desc}</p>` : ""}<div class="${title ? "mt-6" : ""} space-y-8">${body}</div></div>`;

/* ================================================================ 2. Settings rows */
defineBlock({
  cat: "settings", id: "settings-rows",
  title: "Settings rows",
  note: "Every kind of row on one real page: a switch with its follow-up question as the next row, a select, a value another page owns (the row opens that page), an (i) that explains on hover, and a row that needs someone. Also how saving and look-only pages read.",
  where: "Settings › Clinical › Note signing",
  states: ["Normal", "Saving", "Look only"],
  canvas: "bare",
  html: (state) => {
    const ro = state === "Look only", saving = state === "Saving";
    const ctl = (live, text) => (ro ? sValue(text) : live);
    return settingsPage("Note signing", "Note signing", "Who has to sign or co-sign clinical notes.", `
      ${sSection("Signing notes", `
        ${sRow({ label: "Notes must be signed", help: "A provider signs each clinical note before it's final.", info: true, tip: "Until a provider signs, the note stays a draft: it can still be changed, and it doesn't print on the chart.",
          control: ctl(sw(true, "Notes must be signed"), "On"),
          follow: sRow({ label: "Hygienist notes need a dentist to co-sign", help: "The dentist on the visit gets a task to co-sign.", indent: true, attrs: saving ? "" : chg("A follow-up question gets a small arrow, the same as on the Reminders page"), save: saving ? "error" : null, why: "Check your connection and try again.", control: ctl(sw(true, "Hygienist notes need a dentist to co-sign"), "On") }) })}
        ${sRow({ label: "Remind the provider after", help: "We add a task to their list while a note is unsigned.", save: saving ? "saved" : null, attrs: saving ? chg("A save that worked shows nothing: no '✓ Saved' line and no blue glow on the row") : "", control: ctl(selectBtn("1 day", "!w-36", "Remind the provider after"), "1 day") })}
        ${sRow({ label: "Sign for the whole day at once", help: "Lets a provider sign all of today's notes in one step.", info: true, save: saving ? "saving" : null,
          tip: "Instead of opening each note, the provider sees today's unsigned notes in one list and signs them all at once. Each note still gets its own signature and time.", control: ctl(sw(false, "Sign for the whole day at once"), "Off") })}`)}
      ${sSection("Providers who sign", `
        ${sRow({ label: "Providers", help: "Everyone who can sign notes.", owner: "Team members", readOnly: ro, control: sValue("4 providers") })}
        ${sRow({ label: "Signatures on file", help: "Printed notes and treatment plans show the provider's signature.", control: sValue("3 of 4"),
          alert: alertMark("1 missing", "Dr. Ethan Brooks has no signature on file, so his printed notes show a blank line.", { action: ro ? "" : xsWhite("Add his signature") }) })}
        ${sRow({ label: "Practice name on printed notes", help: "Shown at the top of every printed note.", owner: "Practice info", readOnly: ro, control: sValue("Bayview Family Dental") })}`)}`,
      { top: ro ? `<div class="mt-3">${lockLine("You can look at these settings. Priya Shah or Dr. Maya Patel can change them.")}</div>` : "" });
  }
});

/* ================================================================ 3. Connected services */
const CONN_DOT = { connected: "bg-blue-600", attention: "bg-orange-500", "not-connected": "bg-gray-300", checking: "bg-gray-400 motion-safe:animate-pulse", waiting: "bg-gray-300" };
const CONN_WORD = { connected: "Connected", attention: "Needs attention", "not-connected": "Not connected", checking: "Checking…", waiting: "Waiting" };
/* AshaConnectionRow (inset): outlined mark, service · vendor, one grey line, dot + status, a ghost action and ⋯ */
/* v2: a working or not-yet-connected service says nothing; a problem is one alertMark (no dot and word beside it) and the
 * row's button is the fix; a setup or check in progress keeps its dot and word. Rows are 52px with one grey line. */
function v2ConnRow({ icon, service, vendor, detail, checked, status, statusLabel, problem, problemShort, action, menu = "", markStatus = "", markAction = "" }) {
  const said = status === "attention" && problem ? alertMark(problemShort, problem)
    : ["connected", "not-connected"].includes(status) ? "" : `<span class="inline-flex items-center gap-2 text-[13px] ${status === "waiting" ? "text-gray-500" : "text-gray-700"}"><span class="${cx(R.dot, CONN_DOT[status])}"></span>${statusLabel || CONN_WORD[status]}</span>`;
  return `<section class="relative flex min-h-13 items-center gap-3 px-4 py-2.5" aria-label="${esc(service)} connection">
      <span class="flex size-8 shrink-0 items-center justify-center rounded-md border border-gray-200/80 bg-white text-gray-600 shadow-2xs">${I(icon, "size-4")}</span>
      <div class="min-w-0 flex-1"><p class="truncate text-sm leading-5 text-gray-800"><span class="font-medium">${service}</span>${vendor ? `<span class="text-gray-500"> · ${vendor}</span>` : ""}</p>
        <p class="truncate text-[13px] leading-5 text-gray-500">${detail}${checked ? `<span class="text-gray-400"> · </span>${checked}` : ""}</p></div>
      <div class="flex w-36 shrink-0 items-center"${markStatus}>${said}</div>
      <div class="w-32 shrink-0 text-end"${markAction}>${action || ""}</div>
      <div class="relative -me-1.5">${iconButton("ellipsis", `${service} options`, { s: "iconXs", v: "quiet", attrs: menu ? 'aria-expanded="true" aria-haspopup="menu"' : 'aria-haspopup="menu"', cls: menu ? "!bg-gray-100 !text-gray-800" : "" })}${menu}</div></section>`;
}
function connRow({ icon, service, vendor, detail, checked, status, statusLabel, problem, problemShort, fix, action, menu = "" }) {
  if (V2) return v2ConnRow(arguments[0]);
  const quiet = ["not-connected", "waiting"].includes(status);
  return `<section class="relative flex min-h-16 items-center gap-3 px-4 py-3" aria-label="${esc(service)} connection">
      <span class="flex size-8 shrink-0 items-center justify-center rounded-md border border-gray-200/80 bg-white text-gray-600 shadow-2xs">${I(icon, "size-4")}</span>
      <div class="min-w-0 flex-1"><p class="truncate text-sm leading-5 text-gray-800"><span class="font-medium">${service}</span>${vendor ? `<span class="text-gray-500"> · ${vendor}</span>` : ""}</p>
        <p class="truncate text-[13px] leading-5 text-gray-500">${detail}${checked ? `<span class="text-gray-400"> · </span>${checked}` : ""}</p></div>
      ${status === "attention" && problem ? `<span class="me-1">${alertMark(problemShort, problem, { action: fix })}</span>` : ""}
      <p class="inline-flex w-32 shrink-0 items-center gap-2 text-[13px] ${quiet ? "text-gray-500" : "text-gray-700"}"><span class="${cx(R.dot, CONN_DOT[status])}"></span>${statusLabel || CONN_WORD[status]}</p>
      <div class="w-24 shrink-0 text-end">${action || ""}</div>
      <div class="relative -me-1.5">${iconButton("ellipsis", `${service} options`, { s: "iconXs", v: "quiet", attrs: menu ? 'aria-expanded="true" aria-haspopup="menu"' : 'aria-haspopup="menu"', cls: menu ? "!bg-gray-100 !text-gray-800" : "" })}${menu}</div></section>`;
}
const CONN_MENU = `<div class="absolute end-0 top-full mt-1 z-20 ${R.menu} !w-52" role="menu" aria-label="Practice software options">
  <button type="button" role="menuitem" class="${R.menuItem}">${I("refresh-cw")}Check now</button><button type="button" role="menuitem" class="${R.menuItem}">${I("history")}What was copied</button><button type="button" role="menuitem" class="${R.menuItem}">${I("plug")}Reconnect</button>
  <div class="${R.menuSep}"></div><button type="button" role="menuitem" class="${R.menuDanger}">${I("unplug")}Disconnect</button></div>`;
const ghost = (label, attrs = "") => button(label, { v: "ghost", s: "sm", attrs });
function connections(state) {
  const fresh = state === "First setup", checking = state === "Checking";
  const st = (s) => (fresh ? "not-connected" : checking && s !== "waiting" ? "checking" : s);
  const rows = [
    { icon: "database", service: "Practice software", vendor: fresh ? "" : "Dentrix through NexHealth", detail: fresh ? "Where Asha reads patients and appointments from" : "Patients, appointments and the ledger", checked: fresh ? "" : checking ? "Checking now" : "Checked today, 8:02 AM", status: st("connected"), action: fresh ? button("Connect", { v: "solid", s: "sm" }) : ghost("Check now", checking ? "disabled" : ""), menu: state === "Normal" ? CONN_MENU : "" },
    { icon: "send", service: "Clearinghouse", vendor: fresh ? "" : "DentalXChange", detail: fresh ? "Sends claims to insurers and brings back payments" : "Sends claims, brings back ERAs and claim status", checked: fresh ? "" : checking ? "Checking now" : "Checked today, 7:55 AM", status: st("connected"), action: fresh ? ghost("Connect") : ghost("Open", checking ? "disabled" : "") },
    { icon: "credit-card", service: "Card payments", vendor: fresh ? "" : "Stripe", detail: fresh ? "Take cards at the desk and online" : "Stripe is checking your business details", checked: fresh ? "" : "Sent Sep 24 · usually 1–2 business days", status: fresh ? "not-connected" : "waiting", statusLabel: fresh ? "" : "In review", action: fresh ? ghost("Connect") : ghost("View details") },
    { icon: "phone", service: "Phones", vendor: fresh ? "" : "Asha phones", detail: fresh ? "Your phone and fax numbers in Asha" : "3 phone numbers and 1 fax number", checked: fresh ? "" : checking ? "Checking now" : "Checked today, 8:00 AM", status: st("connected"), action: fresh ? ghost("Connect") : ghost("Open", checking ? "disabled" : "") },
    { icon: "scan", service: "X-ray imaging (SOTA)", vendor: fresh ? "" : "SOTA Cloud", detail: fresh ? "Shows x-rays in the chart" : "Shows x-rays in the chart", checked: fresh ? "" : checking ? "Checking now" : "Last worked Sep 24, 5:48 PM", status: st("attention"), problemShort: "Password changed", problem: "SOTA Cloud stopped answering after its password was changed on Sep 24. New x-rays won't show in charts until you enter the new one.", fix: xsWhite("Update password"), action: fresh ? ghost("Connect") : ghost("Open", checking ? "disabled" : "") }
  ];
  if (V4) return v4Connections(rows, { fresh, checking });
  if (V2) {
    rows[0].action = fresh ? rows[0].action : ghost("Open", checking ? "disabled" : "");
    if (!fresh && !checking) rows[4].action = xsWhite("Update password");
    if (fresh) rows[0].markStatus = chg("'Not connected' isn't repeated next to every Connect button: the button says it");
    else if (!checking) { rows[0].markStatus = chg("A working service shows no status word, so the one problem is the only signal on the page");
      rows[0].markAction = chg("Check now left the row: it's in the ⋯ menu and in the header's Check all now");
      rows[4].markAction = chg("The broken service's button is the fix, Update password, instead of Open; the hover detail no longer repeats it"); }
  }
  return pageBody("Connections", "The outside services Asha works with, and whether each one is working.",
    sSection("Connected services", rows.map(connRow).join(""), { count: fresh ? "0 of 5" : "4 of 5", info: "Asha checks each service every few minutes. Anything that stops working turns orange here and on Home.", actions: fresh ? "" : button("Check all now", { v: "quiet", s: "sm", icon: "refresh-cw", attrs: checking ? "disabled" : "" }) }), "max-w-[920px]");
}
/* v4: the services are a table, one line each: the service, who provides it, how it's doing and the one button it needs.
 * What it does for the office and when Asha last checked it open in a card when you point at the row. */
const V4_CONN_WORD = { connected: "Connected", checking: "Checking…", waiting: "In review", "not-connected": "Not connected" };
function v4Connections(rows, { fresh, checking }) {
  const svc = (r) => `<span class="inline-flex items-center gap-2.5 min-w-0"><span class="flex size-6 shrink-0 items-center justify-center rounded-md border border-gray-200/80 bg-white text-gray-600">${I(r.icon, "size-3.5")}</span><span class="truncate font-medium text-gray-800">${r.service}</span></span>`;
  const status = (r) => r.status === "attention" ? `<span class="inline-flex items-center gap-1.5 text-gray-600" data-tip="${esc(r.problem)}" tabindex="0">${I("circle-alert", "size-3.5 shrink-0 text-orange-500")}${r.problemShort}</span>`
    : `<span class="inline-flex items-center gap-2 ${r.status === "connected" ? "text-gray-500" : "text-gray-700"}">${r.status === "connected" ? "" : `<span class="${cx(R.dot, CONN_DOT[r.status])}"></span>`}${r.statusLabel || V4_CONN_WORD[r.status]}</span>`;
  const act = (r, i) => (r.status === "attention" && !checking ? xsWhite("Update password") : r.icon === "database" && !fresh ? ghost("Open", checking ? "disabled" : "") : r.action || "");
  const dots = (r) => iconButton("ellipsis", `${r.service} options`, { s: "iconXs", attrs: 'aria-haspopup="menu"' });
  const columns = fresh
    ? [{ key: "service", label: "Service", w: 236, render: svc }, { key: "detail", label: "What it does", w: 320, grow: true, render: (r) => `<span class="text-gray-600">${r.detail}</span>` }, { key: "act", label: "", w: 112, render: act }]
    : [{ key: "service", label: "Service", w: 236, render: svc }, { key: "vendor", label: "Through", w: 220, render: (r) => esc(r.vendor) }, { key: "status", label: "Status", w: 168, grow: true, render: status },
      { key: "act", label: "", w: 156, render: act }, { key: "more", label: "", w: 56, render: dots }];
  const grid = sheetTable({ preset: "section", sheet: false, title: "Connected services", rows: rows.map((r, i) => ({ id: `c${i}`, ...r })), columns,
    peek: fresh ? null : (r) => peekCard(r.service, [["Through", esc(r.vendor)], ["Does", r.detail], ["Checked", r.checked]], r.status === "attention" ? r.problem : "") });
  return pageBody("Connections", "The outside services Asha works with, and whether each one is working.",
    v4Section("Connected services", `<div${chg4(fresh ? "Each service is one line of a table: what it is, what it does and its Connect button, the same table the services sit in once they're connected." : "Each service is one line of a table: the service, who provides it, how it's doing and the one button it needs. What it does and when Asha last checked it open in a card when you point at the row, instead of a second grey line under every name.")}>${grid}</div>`,
      { count: fresh ? "0 of 5" : "4 of 5", info: "Asha checks each service every few minutes. Anything that stops working turns orange here and on Home.", actions: fresh ? "" : button("Check all now", { v: "quiet", s: "sm", icon: "refresh-cw", attrs: checking ? "disabled" : "" }) }), "max-w-[920px]");
}
defineBlock({
  cat: "settings", id: "settings-connections",
  title: "Connected services",
  note: "One row per outside service: an outlined mark, service and vendor, one grey line, a dot and a word, a quiet action and a ⋯ menu (shown open). Only the broken one is orange; a few words say why, and resting on them shows the whole story and the fix.",
  where: "Settings › Connections",
  states: ["Normal", "Checking", "First setup"],
  canvas: "white",
  html: connections
});

/* ================================================================ 4. Office hours */
const DAY_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = [["8:00 AM – 5:00 PM", "12:00 – 1:00 PM"], ["8:00 AM – 5:00 PM", "12:00 – 1:00 PM"], ["8:00 AM – 5:00 PM", "12:00 – 1:00 PM"], ["7:00 AM – 4:00 PM", "12:00 – 12:30 PM"], ["7:00 AM – 2:00 PM", null], null, null];
const rangeBtn = (t, label, open = false) => `<button type="button" class="inline-flex h-8 shrink-0 items-center rounded-lg border border-gray-200/80 bg-white px-2.5 text-[13px] tabular-nums text-gray-800 hover:bg-gray-50 cursor-pointer ${open ? "border-blue-500 ring-3 ring-blue-600/15" : ""}" aria-label="${esc(label)}: ${t}" ${open ? 'aria-expanded="true"' : ""}>${t}</button>`;
/* AshaTimeRangeButton's pop-up, drawn open: start, "to", and an end list that only offers times after the start */
const rangePopover = `<div class="absolute start-0 top-full z-20 mt-1 ${R.popover} w-[312px] p-3" role="dialog" aria-label="Monday hours"${chg("The pop-up drops its explanation line; the end list simply offers only times after the start")}>
  <div class="flex items-center gap-2"><button type="button" class="${R.selectSm} !w-32" aria-label="Monday hours start">8:00 AM${I("chevrons-up-down")}</button><span class="text-[13px] text-gray-500">to</span><button type="button" class="${R.selectSm} !w-36 !border-blue-500 ring-3 ring-blue-600/15" aria-label="Monday hours end" aria-expanded="true">5:00 PM${I("chevrons-up-down")}</button></div>
  <div class="absolute start-[164px] top-[50px] z-30 w-36 rounded-lg border border-gray-200 bg-white p-1 shadow-lg" role="listbox" aria-label="End time">${["4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM"].map((t) => `<div role="option" aria-selected="${t === "5:00 PM"}" class="flex h-7 items-center justify-between rounded-md px-2 text-[13px] tabular-nums ${t === "5:00 PM" ? "bg-gray-100 text-gray-900" : "text-gray-700"}">${t}${t === "5:00 PM" ? I("check", "size-3.5 text-blue-600") : ""}</div>`).join("")}</div>
  ${V2 ? "" : `<p class="mt-2 w-36 text-xs leading-4 text-gray-500">The end list only shows times after the start.</p>`}</div>`;
function weekRow(i, { editing = false, saved = false } = {}) {
  const day = DAY_FULL[i], h = HOURS[i], open = !!h;
  /* v2: the switch, then the day, then its hours, read left to right (Cal.com), at the 44px settings row height */
  if (V2) return `<div class="flex min-h-11 items-center gap-x-4 px-4 py-2"${i === 0 ? chg("Each day reads left to right: its open switch, the day, then the hours, at the 44px settings row height (the switch used to sit 700px away at the far right)") : ""}>
    ${sw(open, `${day} open`)}<span class="w-28 shrink-0 text-sm font-medium ${open ? "text-gray-800" : "text-gray-500"}">${day}</span>
    ${open ? `<span class="relative">${rangeBtn(h[0], `${day} hours`, editing)}${editing ? rangePopover : ""}</span>${h[1] ? `<span class="flex items-center gap-2"><span class="text-[13px] text-gray-500">Lunch</span>${rangeBtn(h[1], `${day} lunch`)}</span>` : button("Add lunch", { v: "quiet", s: "xs", icon: "plus", cls: "-ms-1" })}` : `<span class="text-sm text-gray-500">Closed</span>`}
    ${i === 4 ? `<span class="ms-auto">${alertMark("2 visits after close", "Hyg 2 still has 2 visits after 2:00 PM on Friday, Oct 2. They stay booked; new visits stop at 2:00 PM.", { action: xsWhite("Show visits") })}</span>` : ""}</div>`;
  return `<div class="flex min-h-14 items-center gap-x-4 px-4 py-3 ${saved ? "asha-settle" : ""}">
    <span class="w-28 shrink-0 text-sm font-medium ${open ? "text-gray-800" : "text-gray-500"}">${day}</span>
    ${open ? `<span class="relative">${rangeBtn(h[0], `${day} hours`, editing)}${editing ? rangePopover : ""}</span>${h[1] ? `<span class="flex items-center gap-2"><span class="text-[13px] text-gray-500">Lunch</span>${rangeBtn(h[1], `${day} lunch`)}</span>` : button("Add lunch", { v: "quiet", s: "xs", icon: "plus", cls: "-ms-1" })}` : `<span class="text-sm text-gray-500">Closed</span>`}
    <span class="ms-auto flex items-center gap-4">${saved ? saveStatus("saved") : ""}${i === 4 ? alertMark("2 visits after close", "Hyg 2 still has 2 visits after 2:00 PM on Friday, Oct 2. They stay booked; new visits stop at 2:00 PM.", { action: xsWhite("Show visits") }) : ""}${sw(open, `${day} open`)}</span></div>`;
}
/* v4: a settings section whose body is a table (the table is the box, so there's no box around it) */
const v4Section = (title, body, { info, count, actions = "" } = {}) => `<section class="space-y-2"><div class="flex min-h-8 items-end justify-between gap-3"><div class="flex min-w-0 items-center gap-1.5"><h3 class="truncate text-sm font-semibold text-gray-800">${title}</h3>${info ? infoHint(title, info) : ""}${count != null ? `<span class="text-[13px] tabular-nums text-gray-500">${count}</span>` : ""}</div>${actions ? `<div class="flex shrink-0 items-center gap-2">${actions}</div>` : ""}</div>${body}</section>`;
const V4_TIMES = Array.from({ length: 29 }, (_, i) => { const m = 360 + i * 30, h = Math.floor(m / 60); return `${((h + 11) % 12) + 1}:${m % 60 ? "30" : "00"} ${h < 12 ? "AM" : "PM"}`; });
const v4Mins = (t) => { const m = /^(\d+):(\d+) (AM|PM)$/.exec(t || ""); return m ? ((+m[1] % 12) + (m[3] === "PM" ? 12 : 0)) * 60 + +m[2] : -1; };
const V4_LUNCH = ["No lunch", "11:30 AM – 12:00 PM", "12:00 – 12:30 PM", "12:00 – 1:00 PM", "12:30 – 1:30 PM", "1:00 – 2:00 PM"];
const V4_LATE = "Hyg 2 still has 2 visits after 2:00 PM on Friday, Oct 2. They stay booked; new visits stop at 2:00 PM.";
function v4HoursTable() {
  const rows = DAY_FULL.map((day, i) => { const h = HOURS[i], [from, to] = h ? h[0].split(" – ") : ["", ""]; return { id: `d${i}`, day, open: h ? "Open" : "Closed", from, to, lunch: h ? h[1] || "No lunch" : "" }; });
  const live = (r) => (r.open === "Open" ? "select" : null), dash = '<span class="text-gray-400">—</span>';
  return { preset: "section", title: "Office hours", rows,
    onCommit: (r, key, v) => { if (key === "open" && v === "Open" && !r.from) Object.assign(r, { from: "8:00 AM", to: "5:00 PM", lunch: "12:00 – 1:00 PM" });
      if (key === "from" && v4Mins(r.to) <= v4Mins(v)) r.to = V4_TIMES[Math.min(V4_TIMES.length - 1, V4_TIMES.indexOf(v) + 16)]; },
    columns: [{ key: "day", label: "Day", w: 120, render: (r) => `<span class="font-medium ${r.open === "Open" ? "text-gray-800" : "text-gray-500"}">${r.day}</span>` },
      { key: "open", label: "Open", w: 96, edit: "select", options: ["Open", "Closed"], render: (r) => (r.open === "Open" ? "Open" : '<span class="text-gray-500">Closed</span>') },
      { key: "from", label: "Opens", w: 108, edit: live, options: V4_TIMES, render: (r) => (r.open === "Open" ? `<span class="tabular-nums">${r.from}</span>` : dash) },
      { key: "to", label: "Closes", w: 108, edit: live, options: (r) => V4_TIMES.filter((t) => v4Mins(t) > v4Mins(r.from)), render: (r) => (r.open === "Open" ? `<span class="tabular-nums">${r.to}</span>` : dash) },
      { key: "lunch", label: "Lunch", w: 156, edit: live, options: V4_LUNCH, render: (r) => (r.open !== "Open" ? dash : r.lunch === "No lunch" ? '<span class="text-gray-500">No lunch</span>' : `<span class="tabular-nums">${r.lunch}</span>`) },
      { key: "note", label: "", w: 168, grow: true, render: (r) => (r.day === "Friday" && r.open === "Open" && v4Mins(r.to) < v4Mins("5:00 PM")
        ? `<span class="inline-flex items-center gap-1.5 text-[13px] text-gray-500" data-tip="${esc(V4_LATE)}" tabindex="0">${I("circle-alert", "size-3.5 shrink-0 text-orange-500")}2 visits after close</span>` : "") }] };
}
/* v4: holiday closures as a table you type into, under the week's table and with the same header band */
const V4_CLOSE_HOURS = ["Closed all day", "Closes at 12:00 PM", "Closes at 2:00 PM", "Opens at 10:00 AM"];
const v4ClosureTable = () => ({ preset: "section", title: "Holiday closures", rows: CLOSURES.map(([date, name, hours, booked], i) => ({ id: `h${i}`, date, name, hours, booked })),
  columns: [{ key: "date", label: "Date", w: 196, edit: "text", render: (r) => `<span class="tabular-nums">${esc(r.date)}</span>` },
    { key: "name", label: "Closure", w: 144, edit: "text" },
    { key: "hours", label: "Hours", w: 160, edit: "select", options: V4_CLOSE_HOURS },
    { key: "booked", label: "Visits booked", w: 196, grow: true, render: (r) => (r.booked ? `<span class="inline-flex items-center gap-1.5 text-gray-600" data-tip="${esc(`${r.booked} visits are booked on ${r.date.split(" – ")[0]} and the day after. They stay on the schedule until you move them.`)}" tabindex="0">${I("circle-alert", "size-3.5 shrink-0 text-orange-500")}${r.booked} visits</span>${button("Move them", { v: "white", s: "xs", cls: "ms-2" })}` : '<span class="text-gray-500">None</span>') },
    { key: "more", label: "", w: 56, render: (r) => iconButton("ellipsis", `${r.name} options`, { s: "iconXs" }) }] });
const dayChips = (on, closed) => `<div class="inline-flex flex-wrap items-center gap-1.5" role="group" aria-label="Days">${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => { const a = on.includes(i), c = closed.includes(i);
  return `<button type="button" aria-pressed="${a}" aria-label="${DAY_FULL[i]}${c ? " (office closed)" : ""}" class="inline-flex size-8 items-center justify-center rounded-full border text-xs font-semibold cursor-pointer ${a ? (V2 ? "border-transparent bg-blue-100 text-blue-800" : "border-blue-600 bg-blue-600 text-white") : c ? "border-dashed border-gray-300 bg-white text-gray-400" : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"}">${d}</button>`; }).join("")}</div>`;
const CLOSURES = [["Thu, Nov 26 – Fri, Nov 27", "Thanksgiving", "Closed all day", 4], ["Thu, Dec 24", "Christmas Eve", "Closes at 12:00 PM", 0], ["Fri, Dec 25", "Christmas Day", "Closed all day", 0], ["Fri, Jan 1, 2027", "New Year's Day", "Closed all day", 0]];
defineBlock({
  cat: "settings", id: "settings-office-hours",
  title: "Office hours and closures",
  note: "Each day on one line with its lunch break and an open switch; closed days just say Closed. A day with visits after close says so in a few words on its own line. Days are picked with round chips, and holiday closures warn when visits are already booked.",
  where: "Settings › Practice › Hours & closures",
  states: ["Normal", "Changing Monday"],
  canvas: "bare",
  html: (state) => {
    const edit = state === "Changing Monday";
    return settingsPage("Hours & closures", "Hours & closures", "When the office is open. Patients and Asha can only book inside these hours.", `
      ${V4 ? v4Section("Office hours", `<div data-v4-hours${chg4("The week is one table you type into, like the practice hours grid in Dentrix: Open, Opens, Closes and Lunch are cells; click one or start typing a time and pick it. The end list only offers times after the start.")}>${sheetTable(v4HoursTable())}</div>`, { info: "Patients, staff and Asha can only book inside these hours. Lunch blocks the schedule for every chair." })
        : sSection("Office hours", DAY_FULL.map((_, i) => weekRow(i, { editing: edit && i === 0 })).join(""), { info: "Patients, staff and Asha can only book inside these hours. Lunch blocks the schedule for every chair." })}
      ${sSection("Online booking", `${sRow({ label: "Patients can book online on", help: "Closed days are dashed; you can still pick them.", attrs: chg("Picked days are soft blue instead of four solid blue discs, the loudest thing on the page"), control: dayChips([0, 1, 2, 3], [5, 6]) })}${sRow({ label: "Latest booking time", help: "Online booking stops this long before closing.", control: selectBtn("1 hour", "!w-32", "Latest booking time") })}`)}
      ${V4 ? v4Section("Holiday closures", `<div${chg4("Holiday closures are a table you type into, like the week above: change the date, the name or the hours right in the cell. A closure with visits booked says so in a few words with the reason on hover, and every other row says None.")}>${sheetTable(v4ClosureTable())}</div>`, { count: CLOSURES.length, actions: button("Add closure", { v: "white", s: "sm", icon: "plus" }) })
        : sSection("Holiday closures", CLOSURES.map(([d, n, what, booked], ci) => `<div class="flex min-h-11 items-center gap-4 px-4 py-3"${ci === 1 ? chg("A closure with nothing booked says nothing; only the one with visits booked speaks up") : ""}>
          <span class="w-48 shrink-0 text-sm tabular-nums text-gray-800">${d}</span><div class="min-w-0 flex-1"><p class="truncate text-sm font-medium text-gray-800">${n}</p><p class="${R.help}">${what}</p></div>
          ${booked ? alertMark(`${booked} visits booked`, `${booked} visits are booked on ${d.split(" – ")[0]} and the day after. They stay on the schedule until you move them.`, { action: xsWhite("Move them") }) : V2 ? "" : `<span class="text-[13px] text-gray-500">No visits booked</span>`}
          <span class="-me-1.5">${iconButton("ellipsis", `${n} options`, { s: "iconXs" })}</span></div>`).join(""), { count: CLOSURES.length, actions: button("Add closure", { v: "white", s: "sm", icon: "plus" }) })}`);
  },
  /* v4 "Changing Monday": Monday's Closes list drawn open, the way the cell opens when you click it */
  mount: (el, state) => { if (!V4 || state !== "Changing Monday") return; mountSheets(el);
    const h = el.querySelector("[data-v4-hours] [data-sheet-host]"), g = h && h._grid; if (!g) return;
    g.quiet = true; g.active = { r: 0, c: 3 }; g.startEdit();
    requestAnimationFrame(() => { const m = h.querySelector('[data-role="pick-menu"]'), hi = m && m.querySelector('[data-hi="1"]'); if (hi) m.scrollTop = hi.offsetTop - 2 * hi.offsetHeight; }); }
});

/* ================================================================ 5. Setup steps */
const STEP_WORD = { done: "Done", now: "In progress", next: "Not started", problem: "Needs you" };
const stepMark = (s) => s === "done" ? `<span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">${I("check", "size-3")}</span>`
  : s === "now" ? `<span class="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-blue-600"><span class="size-1.5 rounded-full bg-blue-600"></span></span>`
  : s === "problem" ? `<span class="flex size-5 shrink-0 items-center justify-center rounded-full border border-orange-300"><span class="size-2 rounded-full bg-orange-500"></span></span>`
  : `<span class="size-5 shrink-0 rounded-full border border-gray-300"></span>`;
/* v4: matching Dentrix providers to the team is a table you pick in, under the step that needs it */
const V4_TEAM_NAMES = ["Dr. Maya Patel", "Dr. Ethan Brooks", "Sofia Ramirez", "Jordan Kim"];
const v4MatchMeta = (n) => (n ? `${n} ${n === 1 ? "provider" : "providers"} in Dentrix ${n === 1 ? "doesn't" : "don't"} match anyone on your team yet. Chairs are matched.` : "Every provider matches someone on your team. Chairs are matched.");
const v4MatchTable = () => ({ title: "Match providers", rows: [["DDS1", "Dr. M. Patel", "Dr. Maya Patel"], ["DDS2", "Dr. E. Brooks", "Dr. Ethan Brooks"], ["HYG1", "S. Ramirez, RDH", ""], ["HYG3", "J. Kim, RDH", ""]].map(([code, pms, team]) => ({ id: code, code, pms, team })),
  onCommit: (r, k, v, g) => { const m = g.root.closest("li") && g.root.closest("li").querySelector("[data-v4-match-meta]"); if (m) m.textContent = v4MatchMeta(g.data.filter((x) => !x.team).length); },
  columns: [{ key: "pms", label: "In Dentrix", w: 200, render: (r) => `${esc(r.pms)} <span class="text-gray-400 tabular-nums">· ${r.code}</span>` },
    { key: "team", label: "On your team", w: 200, grow: true, edit: "select", options: V4_TEAM_NAMES, placeholder: () => "Pick a team member" }] });
/* AshaSetupSteps: done · now · next · problem; every step keeps its action; the body sits under the current step */
const ghostXs = (label) => button(label, { v: "ghost", s: "xs" });
const setupSteps = (steps) => `<ol class="divide-y divide-gray-200/80" aria-label="Setup steps">${steps.map((s) => `<li class="px-4 py-3">
  <div class="flex min-h-7 items-center gap-3">${stepMark(s.state)}<span class="sr-only">${STEP_WORD[s.state]}: </span>
    <div class="min-w-0 flex-1"><p class="text-sm ${s.state === "next" ? "text-gray-500" : "font-medium text-gray-800"}">${s.label}</p>${s.line ? s.line : s.meta ? `<p class="${R.help}">${s.meta}</p>` : ""}</div>
    ${s.action ? `<div class="shrink-0">${s.action}</div>` : ""}</div>
  ${s.body ? `<div class="asha-reveal space-y-2 pb-1 ps-8 pt-2.5">${s.body}</div>` : ""}</li>`).join("")}</ol>`;
defineBlock({
  cat: "settings", id: "settings-setup-steps",
  title: "Setup steps",
  note: "Setup that happens in order over days, as one list: done, now, next and one step that needs a person. Nothing is locked; every step keeps its button. What to do now sits under the current step.",
  where: "Settings › Connections › Practice software",
  states: ["Setting up", "Done"],
  canvas: "bare",
  html: (state) => {
    const done = state === "Done";
    const steps = done ? [
      { state: "done", label: "Install the connector on your server", meta: "Done Sep 18 by Priya Shah", action: ghostXs("View guide") },
      { state: "done", label: "Approve Asha in Dentrix", meta: "Done Sep 18", action: ghostXs("View") },
      { state: "done", label: "Copy your records into Asha", meta: "Done Sep 25 · 66,400 appointments and 6 years of ledger", action: ghostXs("What was copied") },
      { state: "done", label: "Match providers and chairs", meta: "Done Sep 25 · 4 providers and 4 chairs", action: ghostXs("Change") },
      { state: "done", label: "Turn on write-back", meta: "Done Sep 25 · payments and notes go back to Dentrix", action: ghostXs("Change") }
    ] : [
      { state: "done", label: "Install the connector on your server", meta: "Done Sep 18 by Priya Shah", action: ghostXs("View guide") },
      { state: "done", label: "Approve Asha in Dentrix", meta: "Done Sep 18", action: ghostXs("View") },
      V4 ? { state: "now", label: "Copy your records into Asha", action: ghostXs("Pause"), line: `<div class="flex items-center gap-2.5 text-[13px] leading-5 text-gray-500"${chg4("The step copying records is two lines like the others: its title, then one line with the progress bar, how far along and the time left. The start time, the second count line and the extra sentence are gone")}><div class="w-28 shrink-0">${Chart.meter(62, 100)}</div><span class="truncate tabular-nums"><span class="text-gray-700">62%</span> · 41,208 of 66,400 appointments · about 2 hours left</span></div>` }
        : { state: "now", label: "Copy your records into Asha", meta: "Started today at 6:00 AM · usually about 6 hours", action: ghostXs("Pause"),
        body: `<div class="flex items-center gap-3"><div class="w-64">${Chart.meter(62, 100, { h: "h-2" })}</div><span class="text-[13px] tabular-nums text-gray-700">62%</span><span class="text-[13px] text-gray-500">about 2 hours left</span></div>
          <p class="text-[13px] text-gray-600 tabular-nums">41,208 of 66,400 appointments · patients and insurance are done · the ledger is next</p>
<p class="${R.help}">You can use Asha while this runs. Today's schedule is already in.</p>` },
      V4 ? { state: "problem", label: "Match providers and chairs", meta: `<span data-v4-match-meta>${v4MatchMeta(2)}</span>`, body: `<div class="max-w-[480px]"${chg4("The providers to match are a small table right under the step: pick the team member for each Dentrix provider in the cell, with no separate Match providers screen.")}>${sheetTable(v4MatchTable())}</div>` }
        : { state: "problem", label: "Match providers and chairs", meta: "2 providers in Dentrix don't match anyone on your team yet.", action: button("Match providers", { v: "white", s: "xs" }) },
      { state: "next", label: "Turn on write-back", meta: "Lets Asha post payments and notes back to Dentrix. About 5 minutes.", action: ghostXs("Set up") }
    ];
    return settingsPage("Practice software", "Practice software", "The practice software Asha reads patients and appointments from.", `
      ${sSection("Connection", connRow({ icon: "database", service: "Practice software", vendor: "Dentrix through NexHealth", detail: done ? "Patients, appointments and the ledger" : "Copying your records", checked: done ? "Checked today, 8:02 AM" : "Started today, 6:00 AM", status: done ? "connected" : "waiting", statusLabel: done ? "" : "Setting up", action: ghost(done ? "Check now" : "Open guide"), markStatus: done ? chg("A working connection shows no status word; only a setup in progress or a problem does") : "" }))}
      ${sSection("Setup", setupSteps(steps), { count: done ? "5 of 5 done" : "2 of 5 done", info: "Setup runs in order over a few days, but nothing is locked. You can open any step at any time." })}`);
  }
});

/* ================================================================ 6. Copy, secret and edit rows */
function qr(seed, px = 56) {
  const n = 21; let r = hash(seed), cells = "";
  const rnd = () => ((r = (r * 1103515245 + 12345) >>> 0) >>> 16) & 1;
  const inFinder = (x, y) => (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && rnd()) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  return `<svg viewBox="-1 -1 23 23" width="${px}" height="${px}" role="img" aria-label="Scan code for the kiosk link" class="shrink-0 rounded-md border border-gray-200/80 bg-white p-0.5" shape-rendering="crispEdges"><g fill="#1e2939">${finder(0, 0)}${finder(14, 0)}${finder(0, 14)}${cells}</g></svg>`;
}
const iconSmall = (icon, label) => iconButton(icon, label, { s: "iconXs", v: "quiet", cls: V2 ? "opacity-0 group-hover/row:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100" : "" });
const editor = (inner, { saving = false } = {}) => `<div class="flex flex-wrap items-center gap-2">${inner}${button("Cancel", { v: "ghost", s: "sm" })}${button(saving ? `${I("loader-circle", "animate-spin")}Saving…` : "Save", { v: "solid", s: "sm", attrs: saving ? "disabled" : "" })}</div>`;
/* v4: IDs on claims as a table you type into; a copy button shows on the row you point at */
const v4IdCheck = (r, v) => (r.id === "npi" && !/^\d{10}$/.test(v) ? `An NPI has 10 digits, and this one has ${v.replace(/\D/g, "").length}.` : r.id === "tax" && !/^\d{2}-\d{7}$/.test(v) ? "A tax ID looks like 94-3172856: 2 digits, a dash, then 7." : null);
const v4Tip = (tip) => `<span data-tip="${esc(tip)}" tabindex="0" class="inline-flex rounded-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600/30">${I("info", "size-3.5 text-gray-400")}</span>`;
const v4IdTable = () => ({ preset: "section", head: false, title: "IDs on claims",
  rows: [{ id: "npi", label: "Practice NPI", tip: "Goes on every claim as the billing provider: the 10-digit number that tells payers who is billing. Claims sent after you change it use the new NPI; claims already sent keep the old one.", value: "1487352961", edit: "text" },
    { id: "tax", label: "Tax ID", tip: "Your business tax number (EIN).", value: "94-3172856", edit: "text" },
    { id: "phone", label: "Office phone on claims", tip: "Printed in the billing provider box.", value: "(510) 555-0100", owner: "Practice info" }],
  onCommit: (r, k, v) => v4IdCheck(r, v),
  columns: [{ key: "label", label: "Field", w: 220, render: (r) => `<span class="inline-flex items-center gap-1.5"><span class="text-gray-500">${r.label}</span>${v4Tip(r.tip)}</span>` },
    { key: "value", label: "Value", w: 200, grow: true, edit: (r) => r.edit || null, render: (r) => `<span class="tabular-nums">${esc(r.value)}</span>${r.owner ? `<button type="button" data-act="owner" class="ms-2 inline-flex items-center gap-0.5 text-[13px] text-gray-500 hover:text-gray-700 cursor-pointer">Set in ${r.owner}${I("chevron-right", "size-3.5")}</button>` : ""}` },
    { key: "copy", label: "Copy", w: 48, render: (r) => iconButton("copy", `Copy ${r.label}`, { s: "iconXs", v: "quiet", attrs: 'data-act="copy"', cls: "opacity-0 [tr:hover_&]:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100" }) }] });
defineBlock({
  cat: "settings", id: "settings-copy-secret-edit",
  title: "Copy, secret and edit rows",
  note: "Values people read and paste more than they change: the kiosk link with Copy, Open and a scan code; an API key that is never shown, only replaced; and the NPI, which opens its own editor and says exactly why it didn't save.",
  where: "Settings › Check-in & kiosk · Practice info · Webhooks",
  states: ["Normal", "Changing the NPI", "Replacing the key"],
  canvas: "white",
  /* v4 "Changing the NPI": the 9-digit NPI was typed and didn't save; the cell keeps it with the orange mark */
  mount: (el, state) => { if (!V4 || state !== "Changing the NPI") return; mountSheets(el);
    const h = el.querySelector("[data-v4-ids] [data-sheet-host]"), g = h && h._grid, r = g && g.data.find((x) => x.id === "npi"); if (!r) return;
    r.value = "148735296"; g.failed.set("npi:value", v4IdCheck(r, r.value)); g.render(); },
  html: (state) => {
    const npi = state === "Changing the NPI", key = state === "Replacing the key";
    const change = (what) => (V2 ? button("Change", { v: "quiet", s: "xs", attrs: `aria-label="Change ${what}"` }) : xsWhite("Change", `aria-label="Change ${what}"`));
    return pageBody("", "", `
      ${sSection("Check-in tablet", `
        ${sRow({ label: "Kiosk link", help: "Open this on the check-in tablet in your waiting room.", stacked: true,
          control: `<div class="flex items-center gap-3">${qr("bayview-kiosk-7Q2M")}<div class="min-w-0"><p class="truncate text-sm tabular-nums text-gray-800">https://checkin.asha.health/bayview-family-dental/k/7Q2M</p><div class="mt-1.5 flex items-center gap-1.5">${button("Copy link", { v: "white", s: "xs", icon: "copy" })}${button("Open", { v: "quiet", s: "xs", icon: "external-link" })}${V2 ? change("kiosk link") : button("Change", { v: "quiet", s: "xs", icon: "pencil" })}</div></div></div>` })}
        ${sRow({ label: "Tablet PIN", help: "Staff enter it to leave kiosk mode.", attrs: chg("Change is a quiet button on every row, and the copy icon shows when you point at the row: these values get read and pasted far more than changed"), control: V2 ? `<span class="text-sm tabular-nums text-gray-800"${chg("Values use the app's normal font with even digits, not a typewriter font")}>4827</span>${iconSmall("copy", "Copy tablet PIN")}${change("tablet PIN")}` : `<span class="font-mono text-sm tracking-widest text-gray-800">4827</span>${iconSmall("copy", "Copy tablet PIN")}${change("tablet PIN")}` })}`, { desc: "From Check-in & kiosk." })}
      ${V4 ? v4Section("IDs on claims", `<p class="${R.help} -mt-1.5">From Practice info.</p><div data-v4-ids${chg4("The IDs are a table you type into: click the NPI or Tax ID (or tab to it and type), Enter saves. A value that can't be saved keeps an orange mark that says why; click it to try again. No Change, Cancel and Save buttons.")}>${sheetTable(v4IdTable())}</div>`)
        : sSection("IDs on claims", `
        ${sRow({ label: "Practice NPI", help: "Goes on every claim as the billing provider.", info: true, tip: "The 10-digit number that tells payers who is billing. Claims sent after you change it use the new NPI; claims already sent keep the old one.",
          save: npi ? "error" : null, why: "An NPI has 10 digits, and this one has 9.",
          control: npi ? editor(V2 ? `<input class="${R.inputSm} !w-44 tabular-nums" value="148735296" aria-label="Practice NPI" aria-invalid="true"${chg("The field keeps its normal border; the reason it didn't save is the grey line under the label")} />` : `<input class="${R.inputSm} !w-44 tabular-nums !border-orange-300" value="148735296" aria-label="Practice NPI" aria-invalid="true" />`) : `${sValue("1487352961")}${iconSmall("copy", "Copy Practice NPI")}${change("Practice NPI")}` })}
        ${sRow({ label: "Tax ID", help: "Your business tax number (EIN).", control: `${sValue("94-3172856")}${iconSmall("copy", "Copy Tax ID")}${change("Tax ID")}` })}
        ${sRow({ label: "Office phone on claims", help: "Printed in the billing provider box.", owner: "Practice info", control: sValue("(510) 555-0100") })}`, { desc: "From Practice info." })}
      ${sSection("Webhooks", `
        ${sRow({ label: "API key", help: key ? "Anything using the old key stops working as soon as you save." : "Asha signs every webhook with this key so your system knows it's really from us.", info: true, tip: "A shared secret between Asha and your system. Office staff can never read it back; they can only replace it.",
          control: key ? editor(`<input type="password" class="${R.inputSm} !w-56" placeholder="Paste the new key" aria-label="New API key" />`) : `<span class="inline-flex items-center gap-2"><span class="text-sm text-gray-700">On file</span><span class="${V2 ? "" : "font-mono "}text-[13px] tracking-widest text-gray-400" aria-hidden="true">••••••••</span></span>${xsWhite("Replace", 'aria-label="Replace API key"')}` })}
        ${sRow({ label: "Send events to", help: "Where Asha posts new appointments and payments.", control: `${sValue("https://hooks.bayviewdental.com/asha")}${iconSmall("copy", "Copy address")}${change("webhook address")}` })}`, { desc: "From Connections › Webhooks." })}`);
  }
});

/* ================================================================ 7. Team members and roles */
const TEAM = [
  { id: "t1", name: "Dr. Maya Patel", role: "Owner", status: "on", twoStep: true, last: "Today, 7:52 AM", email: "maya.patel@bayviewdental.com" },
  { id: "t2", name: "Priya Shah", role: "Office manager", status: "on", twoStep: true, last: "Today, 7:40 AM", email: "priya@bayviewdental.com" },
  { id: "t3", name: "Dr. Ethan Brooks", role: "Dentist", status: "on", twoStep: true, last: "Yesterday", email: "ethan.brooks@bayviewdental.com" },
  { id: "t4", name: "Sofia Ramirez", role: "Hygienist", status: "on", twoStep: false, last: "Today, 7:58 AM", email: "sofia@bayviewdental.com" },
  { id: "t5", name: "Jordan Kim", role: "Hygienist", status: "on", twoStep: false, last: "Sep 23", email: "jordan@bayviewdental.com" },
  { id: "t6", name: "Nina Flores", role: "Billing", status: "on", twoStep: true, last: "Today, 8:10 AM", email: "nina@bayviewdental.com" },
  { id: "t7", name: "Marcus Lee", role: "Front desk", status: "on", twoStep: false, last: "Today, 7:31 AM", email: "marcus@bayviewdental.com" },
  { id: "t8", name: "Carmen Diaz", role: "Dental assistant", status: "invited", twoStep: false, last: "", email: "carmen@bayviewdental.com" },
  { id: "t9", name: "Ben Adler", role: "Front desk", status: "expired", twoStep: false, last: "", email: "ben@bayviewdental.com" }
];
const TEAM_STATUS = { on: ["Active", "on"], invited: ["Invite sent Sep 24", "off"], expired: ["Invite expired", "needs"] };
const teamCols = () => [
  { key: "name", label: "Name", icon: "user", w: 200, open: true, kind: "text", lead: (t) => avatar(t.name.replace("Dr. ", ""), { size: 5 }), render: (t) => esc(t.name) },
  { key: "role", label: "Role", icon: "key-round", w: 140, kind: "text" },
  { key: "status", label: "Status", icon: "circle-dot", w: 160, kind: "text", value: (t) => TEAM_STATUS[t.status][0], render: (t) => statusDot(...TEAM_STATUS[t.status]) },
  { key: "twoStep", label: "Two-step sign-in", icon: "shield-check", w: 158, kind: "text", value: (t) => (t.twoStep ? "On" : "Off"), render: (t) => (t.status !== "on" ? `<span class="text-gray-400">—</span>` : t.twoStep ? "On" : `<span class="text-gray-500">Off</span>`) },
  { key: "last", label: "Last signed in", icon: "clock", w: 140, kind: "text", render: (t) => (t.last ? esc(t.last) : `<span class="text-gray-400">Never</span>`) }
];
/* v2: Active (the normal state) is blank, so the expired invite is the one thing that speaks; the name column fits "Dr. Ethan Brooks" */
const v2TeamCols = () => teamCols().map((c) => (c.key === "name" ? Object.assign(c, { w: 220 }) : c.key === "status" ? Object.assign(c, { normal: ["Active"], label: `<span${chg("Status shows only when unusual: Active members are blank, so the expired invite stands out (Attio and Linear members)")}>Status</span>` }) : c));
const statusButton = (word, tone) => `<button type="button" class="${cx(R.btn, R.sm, R.white, "!ps-2.5")}" aria-haspopup="menu" aria-label="Status: ${esc(word)}. Change status"><span class="${cx(R.dot, TONE_DOT[tone])}"></span>${esc(word)}${I("chevron-down", "!text-gray-400")}</button>`;
function openPerson(t) {
  const [word, tone] = TEAM_STATUS[t.status];
  Sheet.open({
    flush: true, title: esc(t.name), lead: avatar(t.name.replace("Dr. ", ""), { size: 9 }), subtitle: esc(t.email),
    actions: iconButton("ellipsis", "More", { s: "iconSm" }),
    body: `<section class="${R.psec} flex items-center justify-between gap-3 !py-3">${statusButton(t.status === "on" ? word : t.status === "invited" ? "Invited" : "Invite expired", tone)}<span class="text-[13px] text-gray-500">${t.status === "on" ? `Last signed in ${t.last.replace("Today", "today")}` : t.status === "invited" ? "Sent Sep 24 · lasts 7 days" : "Sent Sep 10 · never opened"}</span></section>
      ${t.status === "expired" ? psec("", infoRow("circle-alert", "This invite expired before it was used.", { tone: "needs", right: xsWhite("Send a new invite") }), { cls: "!py-2.5" }) : ""}
      ${psec("What they can do", `<div class="grid grid-cols-2 gap-3"><div class="space-y-1.5"><span class="${R.label}">Role</span>${selectBtn(t.role, "")}</div><div class="space-y-1.5"><span class="${R.label}">Locations</span>${selectBtn("Bayview Family Dental", "")}</div></div>
        <p class="${R.help} mt-2.5">Roles decide what each person sees and changes.</p>`, { actions: xsWhite("Roles & permissions") })}
      ${psec("Sign-in", metaGrid([["Two-step sign-in", t.status !== "on" ? '<span class="text-gray-400">After they join</span>' : t.twoStep ? "On" : "Off"], ["Sign-in method", "Email and password"]], 2))}`,
    footer: `${button("Remove from team", { v: "danger", s: "sm", icon: "user-minus" })}<span class="grow"></span>${button("Cancel", { v: "white", s: "sm", attrs: 'data-act="close-sheet"' })}${button("Save", { v: "solid", s: "sm" })}`
  });
}
/* v4 person panel: the standard header (an orange mark by the name when the invite expired), their facts as a table you
 * type into with Status first, and one Actions menu in the footer next to the one thing to do */
const V4_ROLES = ["Office manager", "Dentist", "Hygienist", "Dental assistant", "Billing", "Front desk"];
function v4OpenPerson(t, g) {
  const active = t.status === "on", expired = t.status === "expired";
  const rows = [active ? { label: "Status", value: "Active", type: "select", options: ["Active", "Deactivated"], html: (r) => statusDot(r.value, r.value === "Active" ? "on" : "off") }
      : { label: "Status", value: expired ? "Invite expired" : "Invited", type: "none", html: () => statusDot(expired ? "Invite expired" : "Invited", expired ? "needs" : "off") },
    { label: "Role", value: t.role, type: t.role === "Owner" ? "none" : "select", options: V4_ROLES },
    { label: "Locations", value: ["Bayview Family Dental"], type: "multi", options: ["Bayview Family Dental", "Bayview Family Dental Oakland"] },
    { label: "Email", value: t.email, type: active ? "none" : "text" },
    { label: "Two-step sign-in", value: t.twoStep ? "On" : "Off", type: "none", html: (r) => (active ? esc(r.value) : '<span class="text-gray-400">After they join</span>') },
    { label: active ? "Last signed in" : "Invite sent", value: active ? t.last : expired ? "Sep 10 · never opened" : "Sep 24 · lasts 7 days", type: "none" }];
  const acts = [{ label: "Sign-in", items: [{ icon: "key-round", label: "Reset password", hint: "Email them a link to set a new one", off: active ? "" : "They haven't joined yet" },
      { icon: "smartphone", label: "Turn off two-step sign-in", hint: "For a lost phone; they set it up again next time", off: !active ? "They haven't joined yet" : t.twoStep ? "" : "It's already off" },
      { icon: "log-out", label: "Sign out everywhere", hint: "End their sessions on every computer", off: active ? "" : "They haven't joined yet" }] },
    { label: "Team", items: [...(t.status === "invited" ? [{ icon: "mail", label: "Resend invite", hint: "Email the same link again" }] : []), { icon: "shield-check", label: "See what this role can do", hint: "Roles & permissions" },
      { icon: "history", label: "Activity", hint: "What they signed in to and changed" }] },
    { label: "", items: [{ icon: "user-minus", label: expired || t.status === "invited" ? "Cancel invite" : "Remove from team", danger: true }] }];
  Sheet.open({ flush: true, title: esc(t.name), lead: avatar(t.name.replace("Dr. ", ""), { size: 9 }), subtitle: esc(t.email),
    marks: expired ? recordMark("circle-alert", "This invite expired on Sep 17 before it was used. Send a new one to let them join.", true) : "",
    body: psec("", fieldTable(rows, { labelW: 140, title: "Team member", onCommit: (r, k, v) => { if (r.label === "Role") { t.role = v; if (g) g.render(); } } })),
    footer: `${actionsMenu(acts, { open: V4_OPTS.open })}<span class="grow"></span>${expired ? button("Send a new invite", { v: "solid", s: "sm", icon: "send" }) : ""}` });
}
const PARTS = [["Scheduling", "Seeing and changing appointments on the schedule."], ["Charts", "Clinical notes, the office journal, family notes and patient alerts."], ["Treatment plans", "Patient records, insurance checks and the provider list."], ["Claims", "Insurance claims: making, sending, appealing and writing off."], ["Payments & EOBs", "Payments, insurance payments and deleting entries from the ledger."], ["Statements", "Patient bills: making, cancelling and refunding them."], ["Revenue & reports", "Revenue, ROI, the morning huddle, practice stats and reports."], ["Settings", "Practice settings, like these pages."], ["Team", "Inviting staff and giving them roles."]];
const ROLES = [["Owner", 1, "Built-in"], ["Office manager", 1, "Built-in"], ["Front desk", 2, "Built-in"], ["Billing", 1, "Built-in"], ["Hygienist", 2, "Built-in"], ["Assistant", 1, "Custom"]];
const LEVELS = [ // per part: Office manager, Front desk, Billing, Hygienist, Assistant
  ["C", "C", "V", "C", "C"], ["C", "V", "V", "C", "C"], ["C", "C", "V", "C", "V"], ["C", "V", "C", "N", "N"], ["C", "C", "C", "N", "N"], ["C", "V", "C", "N", "N"], ["C", "N", "V", "N", "N"], ["C", "N", "N", "N", "N"], ["C", "N", "N", "N", "N"]];
const LEVEL_WORD = { C: "Change", V: "View", N: "None" };
/* v2 matrix: the chevron shows on hover or focus, None is a grey dash, the Owner column is plain text with one lock in its
 * header, and each part's description is a hover label on its name instead of an (i) on every row */
const v2LevelCell = (l, part, role) => `<button type="button" class="group/lv inline-flex h-7 items-center gap-1 rounded-md px-2 text-[13px] hover:bg-gray-100 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-blue-600/20 cursor-pointer ${l === "C" ? "text-gray-800" : l === "V" ? "text-gray-600" : "text-gray-400"}" aria-label="${esc(role)} · ${esc(part)}: ${LEVEL_WORD[l]}" aria-haspopup="listbox">${l === "N" ? "—" : LEVEL_WORD[l]}${I("chevron-down", "size-3 text-gray-400 opacity-0 group-hover/lv:opacity-100 group-focus-visible/lv:opacity-100")}</button>`;
function v2RolesMatrix() {
  /* data-kept: a permission matrix of controls stays a hand-built table (the grid conversion squeezed the part names) */
  return `<table class="w-full border-separate border-spacing-0" data-kept="1"><thead><tr><th class="${R.tHead} w-44 !ps-4">Part of Asha</th>${ROLES.map(([r, n, kind], ri) => `<th class="${R.tHead} !h-auto !px-3 py-2 align-bottom"><span class="flex items-center gap-1 text-sm font-medium text-gray-800">${r}${ri === 0 ? `<span class="inline-flex" role="img" aria-label="The owner can always change everything" data-tip="The owner can always change everything"${chg("One lock on the Owner header replaces nine lock icons down the column")}>${I("lock", "size-3 text-gray-400")}</span>` : ""}</span><span class="block text-xs font-normal text-gray-500">${n} ${n === 1 ? "person" : "people"}${kind === "Custom" ? " · custom" : ""}</span></th>`).join("")}</tr></thead>
    <tbody>${PARTS.map(([p, info], pi) => `<tr><td class="${R.tCell} !ps-4"><span class="cursor-default underline decoration-dotted decoration-gray-300 underline-offset-4" data-tip="${esc(info)}"${pi === 0 ? chg("Each part explains itself on hover of its name, instead of an (i) icon on every row") : ""}>${p}</span></td>
      <td class="${R.tCell}"><span class="px-2 text-[13px] text-gray-800">Change</span></td>${LEVELS[pi].map((l, ri) => `<td class="${R.tCell} !px-1"${pi === 0 && ri === 0 ? chg("Levels read as words: the chevron appears only when you point at a cell, and None is a grey dash") : ""}>${v2LevelCell(l, p, ROLES[ri + 1][0])}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}
/* v4 matrix: the same Change / View / None table, as cells you pick in like a spreadsheet (arrow keys, or type "v" for
 * View); the Owner column stays fixed */
const v4LevelText = (w) => (w === "Change" ? "Change" : w === "View" ? '<span class="text-gray-600">View</span>' : '<span class="text-gray-400">—</span>');
const v4RolesTable = () => ({ preset: "section", sortable: false, title: "What each role can do",
  rows: PARTS.map(([p, info], pi) => Object.assign({ id: `part${pi}`, part: p, info }, ...ROLES.slice(1).map(([r], ri) => ({ [`r${ri}`]: LEVEL_WORD[LEVELS[pi][ri]] })))),
  columns: [{ key: "part", label: "Part of Asha", w: 148, grow: true, render: (r) => `<span class="cursor-default underline decoration-dotted decoration-gray-300 underline-offset-4" data-tip="${esc(r.info)}">${r.part}</span>` },
    { key: "owner", label: `Owner <span class="inline-flex align-middle" role="img" aria-label="The owner can always change everything" data-tip="The owner can always change everything">${I("lock", "size-3 text-gray-400")}</span>`, w: 92, render: () => "Change" },
    ...ROLES.slice(1).map(([r, n, kind], ri) => ({ key: `r${ri}`, label: `<span${kind === "Custom" ? ' data-tip="A custom role your office made"' : ""}>${r}</span> <span class="font-normal text-gray-400 tabular-nums">${n}</span>`, w: [136, 108, 96, 104, 104][ri],
      edit: "select", options: ["Change", "View", "None"], render: (x) => v4LevelText(x[`r${ri}`]) }))] });
const levelCell = (l, part, role) => `<button type="button" class="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[13px] hover:bg-gray-100 cursor-pointer ${l === "C" ? "text-gray-800" : l === "V" ? "text-gray-600" : "text-gray-400"}" aria-label="${esc(role)} · ${esc(part)}: ${LEVEL_WORD[l]}" aria-haspopup="listbox">${LEVEL_WORD[l]}${I("chevron-down", "size-3 text-gray-400")}</button>`;
function rolesMatrix() {
  return `<table class="w-full border-separate border-spacing-0"><thead><tr><th class="${R.tHead} w-44 !ps-4">Part of Asha</th>${ROLES.map(([r, n, kind]) => `<th class="${R.tHead} !h-auto !px-3 py-2 align-bottom"><span class="block text-sm font-medium text-gray-800">${r}</span><span class="block text-xs font-normal text-gray-500">${n} ${n === 1 ? "person" : "people"}${kind === "Custom" ? " · custom" : ""}</span></th>`).join("")}</tr></thead>
    <tbody>${PARTS.map(([p, info], pi) => `<tr><td class="${R.tCell} !ps-4"><span class="inline-flex items-center gap-1.5">${p}${infoHint(p).replace(`aria-label="What is ${esc(p)}?"`, `aria-label="What is ${esc(p)}?" title="${esc(info)}"`)}</span></td>
      <td class="${R.tCell}"><span class="inline-flex items-center gap-1.5 px-2 text-[13px] text-gray-800">Change${I("lock", "size-3 text-gray-300")}</span></td>${LEVELS[pi].map((l, ri) => `<td class="${R.tCell} !px-1">${levelCell(l, p, ROLES[ri + 1][0])}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}
defineBlock({
  cat: "settings", id: "settings-team",
  title: "Team members, roles and permissions",
  note: "Team members is the Lists grid: invites that expired are the one orange thing, and a name opens the person. Roles & permissions is a plain matrix of Change, View or None per role; the Owner column can't be changed.",
  where: "Settings › Team & access",
  states: ["Team members", "Roles & permissions", "Loading"],
  canvas: "bare",
  html: (state) => {
    if (state === "Roles & permissions") return settingsPage("Roles & permissions", "Roles & permissions", "What each role can see and change in Asha.", `
      ${sSection("Permission checks", sRow({ label: "Enforce roles", help: "When off, everyone can use everything.", info: true, tip: "With this on, each person only sees and changes what their role allows. Turn it off only while you set roles up.", control: sw(true, "Enforce roles") }))}
      ${V4 ? v4Section("What each role can do", `<div data-v4-roles${chg4("The matrix is a table you pick in like a spreadsheet: click a cell (or arrow to it and type V for View) and pick Change, View or None; Enter saves. The Owner column stays fixed.")}>${sheetTable(v4RolesTable())}</div>`,
        { count: `${ROLES.length} roles`, info: "Change lets someone add, edit and delete. View lets them look only. None hides that part of Asha from them.", actions: button("New role", { v: "white", s: "sm", icon: "plus" }) })
        : `<div data-scroll-ok>${sSection("What each role can do", V2 ? v2RolesMatrix() : rolesMatrix(), { count: `${ROLES.length} roles`, flush: true, info: "Change lets someone add, edit and delete. View lets them look only. None hides that part of Asha from them.", actions: button("New role", { v: "white", s: "sm", icon: "plus" }) })}</div>`}`, { max: "max-w-none" });
    return `${workspaceHeader({ parent: "Practice Settings", title: "Bayview Family Dental" })}
      <div class="grid grid-cols-[232px_1fr]">${settingsMenu("Team members")}
        <div class="min-w-0 pb-6"><div class="px-8 pt-7"><h1 class="${R.pageTitle}">Team members</h1><p class="${R.secondary} mt-1">Who works here, what they can do, and where they can sign in from.</p>
          <h2 class="${R.groupTitle} mt-7 flex items-center gap-2"${state === "Loading" ? "" : chg("The toolbar no longer repeats 'Everyone 9' under this 'Team 9' title")}>Team <span class="text-[13px] font-normal tabular-nums text-gray-500">${TEAM.length}</span></h2></div>
          <div class="px-8">${state === "Loading" ? `<div class="py-2.5 flex gap-2">${skel("w-28", "h-8")}${skel("w-48", "h-8")}</div>${gridSkeleton(["Name", "Role", "Status", "Two-step sign-in", "Last signed in"], 7, { gutter: 32 })}` : `<div data-grid="team"${chg4("Role is a cell you pick right in the list (the owner's stays fixed). A name still opens the person, whose facts are a table you type into, with one Actions menu.")}></div>`}</div></div></div>`;
  },
  mount: (el) => {
    const host = el.querySelector('[data-grid="team"]'); if (!host) return;
    new Grid(host, Object.assign({ gutter: 32, columns: V2 ? v2TeamCols() : teamCols(), rows: TEAM, title: "Everyone", ...(V2 ? { viewButton: false, noun: "people" } : {}), searchPlaceholder: "Search team", maxHeight: 400, addColumn: false,
      filters: [{ key: "role", label: "Role", options: [...new Set(TEAM.map((t) => t.role))].map((r) => ({ value: r, label: r })) }, { key: "status", label: "Status", options: Object.entries(TEAM_STATUS).map(([value, [label, tone]]) => ({ value, label, tone })) }],
      primary: { label: "Invite person", icon: "user-plus" }, bulk: [{ label: "Change role", icon: "key-round" }, { label: "Remove", icon: "user-minus", danger: true }], onOpen: openPerson },
      V4 ? { sheet: true, columns: v2TeamCols().map((c) => (c.key === "role" ? { ...c, w: 168, edit: (t) => (t.role === "Owner" ? null : "select"), options: V4_ROLES } : c)), onOpen: v4OpenPerson } : {}));
  }
});

/* ================================================================ 8. Needs you + pending changes */
const INS = [
  { id: "i1", payer: "delta", pid: "94276", fee: "Delta PPO 2026", net: true, claims: "Electronic", changed: "fee" },
  { id: "i2", payer: "metlife", pid: "65978", fee: "MetLife PDP Plus", net: true, claims: "Electronic", changed: "net" },
  { id: "i3", payer: "cigna", pid: "62308", fee: "Office fees", net: false, claims: "Electronic" },
  { id: "i4", payer: "aetna", pid: "60054", fee: "", net: true, claims: "Electronic" },
  { id: "i5", payer: "guardian", pid: "64246", fee: "Guardian DentalGuard", net: true, claims: "Electronic", changed: "claims" },
  { id: "i6", payer: "uc", pid: "CDCA1", fee: "UCCI Advantage", net: false, claims: "Paper" }
];
const changedDot = (on) => `<span class="inline-flex w-1.5 shrink-0">${on ? `<span class="${cx(R.dot, "bg-blue-600 !size-1.5")}" title="Changed, not saved"></span><span class="sr-only">Changed, not saved.</span>` : ""}</span>`;
const insCols = (showChanges) => [
  { key: "payer", label: "Insurance", icon: "shield", w: 236, kind: "text", value: (r) => DATA.payer(r.payer).name, lead: (r) => avatar(DATA.payer(r.payer).name, { size: 5, square: true, solid: true }), render: (r) => esc(DATA.payer(r.payer).name) },
  { key: "pid", label: "Payer ID", icon: "hash", w: 108, kind: "text", render: (r) => `<span class="tabular-nums">${r.pid}</span>` },
  { key: "fee", label: "Fee schedule", icon: "list", w: 208, kind: "text", render: (r) => `<span class="flex items-center gap-2">${changedDot(showChanges && r.changed === "fee")}<button type="button" class="${R.selectSm} !h-7 !w-44 ${r.fee ? "" : "!text-gray-500"}">${r.fee || "Office fees"}${I("chevrons-up-down")}</button></span>` },
  { key: "net", label: "In network", icon: "handshake", w: 116, kind: "text", value: (r) => (r.net ? "Yes" : "No"), render: (r) => `<span class="flex items-center gap-2">${changedDot(showChanges && r.changed === "net")}${sw(showChanges && r.changed === "net" ? !r.net : r.net, `${DATA.payer(r.payer).short} in network`)}</span>` },
  { key: "claims", label: "Claims go", icon: "send", w: 136, kind: "text", render: (r) => `<span class="flex items-center gap-2">${changedDot(showChanges && r.changed === "claims")}${esc(r.claims)}</span>` }
];
/* v2 insurances: values read as text, and turn into a menu on hover or focus (a chevron appears); no blue "changed" dots */
const v2Pick = (value, label, muted = false) => `<button type="button" class="group/pk -mx-1.5 inline-flex h-7 max-w-full items-center gap-1 rounded-md px-1.5 text-[13px] ${muted ? "text-gray-500" : "text-gray-800"} hover:bg-gray-100 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-blue-600/20 cursor-pointer" aria-haspopup="menu" aria-label="${esc(label)}: ${esc(value)}"><span class="truncate">${esc(value)}</span>${I("chevron-down", "size-3.5 shrink-0 text-gray-400 opacity-0 group-hover/pk:opacity-100 group-focus-visible/pk:opacity-100")}</button>`;
const v2InsCols = (showChanges) => insCols(false).map((c) => (c.key === "fee" ? Object.assign(c, { render: (r) => v2Pick(r.fee || "Office fees", `${DATA.payer(r.payer).short} fee schedule`, !r.fee) })
  : c.key === "net" ? Object.assign(c, { value: (r) => ((showChanges && r.changed === "net" ? !r.net : r.net) ? "Yes" : "No"), render: (r) => v2Pick((showChanges && r.changed === "net" ? !r.net : r.net) ? "Yes" : "No", `${DATA.payer(r.payer).short} in network`) })
  : c.key === "claims" ? Object.assign(c, { render: (r) => esc(r.claims) }) : c));
const v2PendingBar = (n, saving) => `<div class="asha-reveal flex items-center justify-end gap-2 border-b border-gray-200/80 py-2.5 bg-white" data-pending${chg("Quiet edits: no blue 'changed' dots and no 'changes not saved' line, just Discard and Save; after Save the bar simply goes away")}>${button("Discard", { v: "ghost", s: "sm", attrs: `data-pend="discard" ${saving ? "disabled" : ""}` })}${button(saving ? `${I("loader-circle", "animate-spin")}Saving…` : `Save ${n} changes`, { v: "solid", s: "sm", attrs: `data-pend="save" ${saving ? "disabled" : ""}` })}</div>`;
/* v4 insurances: the everyday columns are cells you type or pick in; the name opens the insurance for the rest */
const V4_FEES = ["Office fees", "Delta PPO 2026", "MetLife PDP Plus", "Cigna DPPO 2026", "Aetna PPO 2026", "Guardian DentalGuard", "UCCI Advantage"];
const v4InsRows = (changed) => INS.map((r) => ({ ...r, net: (changed && r.changed === "net" ? !r.net : r.net) ? "Yes" : "No" }));
const v4InsCols = () => [{ ...insCols(false)[0], open: true },
  { key: "pid", label: "Payer ID", icon: "hash", w: 108, kind: "text", edit: "text", render: (r) => `<span class="tabular-nums">${esc(r.pid)}</span>` },
  { key: "fee", label: "Fee schedule", icon: "list", w: 208, kind: "text", edit: "select", options: V4_FEES, placeholder: () => "Office fees" },
  { key: "net", label: "In network", icon: "handshake", w: 116, kind: "text", edit: "select", options: ["Yes", "No"] },
  { key: "claims", label: "Claims go", icon: "send", w: 136, kind: "text", edit: "select", options: ["Electronic", "Paper"] }];
function v4OpenIns(r, g, changed) {
  const p = DATA.payer(r.payer);
  const rows = [{ label: "Payer ID", key: "pid", value: r.pid, type: "text" }, { label: "Fee schedule", key: "fee", value: r.fee, type: "select", options: V4_FEES },
    { label: "In network", key: "net", value: r.net, type: "select", options: ["Yes", "No"] }, { label: "Claims go", key: "claims", value: r.claims, type: "select", options: ["Electronic", "Paper"] },
    { label: "Claims phone", key: "phone", value: r.phone || "(800) 555-0142", type: "text" }, { label: "Portal login", key: "login", value: r.login || "bayview.billing", type: "text" },
    { label: "Filing deadline", key: "limit", value: r.limit || "1 year from the visit", type: "select", options: ["90 days from the visit", "6 months from the visit", "1 year from the visit"] }];
  const acts = [{ label: "Insurance", items: [{ icon: "refresh-cw", label: "Check payer ID", hint: "Make sure claims reach them through DentalXChange", suggest: r.payer === "delta" ? "Delta changed their payer ID on Sep 1" : "" },
      { icon: "globe", label: "Open payer portal", hint: "Sign in with the saved login" }, { icon: "list", label: "See the fee schedule", hint: "Every code and what they allow", off: r.fee ? "" : "No fee schedule picked yet" }] },
    { label: "Claims", items: [{ icon: "file-text", label: "Open claims to this insurer", hint: "Sent, waiting and denied" }, { icon: "users", label: "Patients with this plan", hint: "Everyone it covers" }] },
    { label: "", items: [{ icon: "archive", label: "Stop taking this insurance", hint: "Past claims stay as they are", danger: true }] }];
  Sheet.open({ flush: true, title: esc(p.name), lead: avatar(p.name, { size: 9, square: true, solid: true }), subtitle: `Payer ID <span class="tabular-nums">${esc(r.pid)}</span> · ${r.net === "Yes" ? "In network" : "Out of network"}`,
    actions: actionsMenu(acts, { dots: true, up: false, align: "end", open: V4_OPTS.open }),
    body: `${psec("", fieldTable(rows, { labelW: 140, title: "Insurance", onCommit: (x, k, v) => { r[x.key] = v; g.render(); if (changed) changed(); } }))}${psec("Notes", `<textarea class="${R.textarea}" placeholder="Who to ask for, what they need on claims, anything the team should know"></textarea>`)}` });
}
const NEEDS = [["Delta Dental of California", "Changed their payer ID to 94276 on Sep 1. Claims bounce until you confirm it.", "Confirm ID"], ["Guardian Dental", "The portal login stopped working on Sep 22, so Asha can't check claim status.", "Update login"], ["Aetna Dental", "No fee schedule is attached, so estimates use your office fees.", "Pick fee schedule"]];
const taskRow = ([t, why, act]) => `<div class="flex min-h-11 items-center gap-3 px-4 py-3"><span class="${cx(R.dot, TONE_DOT.needs)}" aria-hidden="true"></span><div class="min-w-0 flex-1"><p class="truncate text-sm font-medium text-gray-800">${t}</p><p class="${R.help}">${why}</p></div>${xsWhite(act)}</div>`;
/* AshaPendingChangesBar, with the brief's words: blue dot, "3 changes not saved", Discard, Save 3 changes */
const pendingBar = (n, saving) => `<div class="asha-reveal flex items-center gap-2 border-b border-gray-200/80 py-2.5 bg-white" data-pending>
  <span class="${cx(R.dot, "bg-blue-600")}" aria-hidden="true"></span><span class="text-[13px] text-gray-700" role="status">${n} changes not saved</span>
  <span class="ms-auto flex items-center gap-2">${button("Discard", { v: "ghost", s: "sm", attrs: `data-pend="discard" ${saving ? "disabled" : ""}` })}${button(saving ? `${I("loader-circle", "animate-spin")}Saving…` : `Save ${n} changes`, { v: "solid", s: "sm", attrs: `data-pend="save" ${saving ? "disabled" : ""}` })}</span></div>`;
defineBlock({
  cat: "settings", id: "settings-needs-you",
  title: "Needs you, and changes not saved",
  note: "A 'Needs you' section with one row and one button per thing a person must do, above the list it comes from. Edits to many rows wait in a pending bar until Save. The section disappears when nothing needs anyone.",
  where: "Settings › Insurance & claims › Insurances accepted",
  states: ["3 changes", "Saving", "Nothing needs you"],
  canvas: "white",
  html: (state) => {
    const quiet = state === "Nothing needs you";
    return pageBody("Insurances accepted", "The insurance plans you take, and how claims go to each one.", `
      ${quiet ? "" : sSection("Needs you", NEEDS.map(taskRow).join(""), { count: NEEDS.length })}
      <section class="space-y-2"><div class="flex min-h-8 items-end justify-between gap-3"><div class="flex items-center gap-1.5"><h3 class="text-sm font-semibold text-gray-800">Your insurances</h3><span class="text-[13px] tabular-nums text-gray-500">${INS.length}</span></div>${button("Add insurance", { v: "white", s: "sm", icon: "plus" })}</div>
        <div data-grid="ins"${chg4("Payer ID, Fee schedule, In network and Claims go are cells you type or pick in; a name opens the insurance for the rest. Changes here still wait for Save, since they change how claims go out.")}${chg("The insurance list is a section table (13px, row lines, no toolbar repeating 'All insurances 6'), and fee schedule and in-network read as text that opens a menu")}></div><div data-pend-slot>${quiet ? "" : V2 ? v2PendingBar(3, state === "Saving") : pendingBar(3, state === "Saving")}</div></section>`, "max-w-[920px]");
  },
  mount: (el, state) => {
    const quiet = state === "Nothing needs you";
    const host = el.querySelector('[data-grid="ins"]'); if (!host) return;
    if (V4) { let n = quiet ? 0 : 3; const slot = el.querySelector("[data-pend-slot]");
      const bar = (saving = false) => { slot.innerHTML = n ? v2PendingBar(n, saving) : ""; icons(); };
      const g = new Grid(host, { preset: "section", sheet: true, columns: v4InsCols(), rows: v4InsRows(!quiet), title: "Your insurances", maxHeight: 360, onOpen: (r) => v4OpenIns(r, g, () => { n++; bar(); }), onCommit: () => { n++; bar(); } });
      el.onclick = (e) => { const b = e.target.closest("[data-pend]"); if (!b) return; if (b.dataset.pend === "discard") { g.setRows(v4InsRows(false)); g.render(); } n = 0; bar(); };
      return; }
    if (V2) { const g = new Grid(host, { preset: "section", columns: v2InsCols(!quiet), rows: INS, title: "Your insurances", maxHeight: 360 });
      el.onclick = (e) => { const b = e.target.closest("[data-pend]"); if (!b) return; if (b.dataset.pend === "discard") { g.o.columns = v2InsCols(false); g.render(); } el.querySelector("[data-pend-slot]").innerHTML = ""; }; return; }
    const g = new Grid(host, { box: true, columns: insCols(!quiet), rows: INS, title: "All insurances", searchPlaceholder: "Search insurances", maxHeight: 360, addColumn: false, selectable: false, footer: false,
      filters: [{ key: "claims", label: "Claims go", options: [{ value: "Electronic", label: "Electronic" }, { value: "Paper", label: "Paper" }] }] });
    el.onclick = (e) => { const b = e.target.closest("[data-pend]"); if (!b) return;
      g.o.columns = insCols(false); g.render();
      el.querySelector("[data-pend-slot]").innerHTML = b.dataset.pend === "save" ? `<div class="asha-reveal flex items-center gap-1.5 border-b border-gray-200/80 py-2.5 text-[13px] text-gray-500" role="status">${I("check", "size-3.5")}Saved 3 changes</div>` : ""; icons(); };
  }
});


})();
