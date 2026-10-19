/* Tasks & lists blocks. Sources: routes/practice/tasks (TaskList, TasksTable, TaskFilters, TaskDetailPanel,
 * TaskDetailPanelChildTasks, InformationRequestResponder, informationRequestSpreadsheetModel, CreateTaskModal) and
 * routes/practice/lists (ListsConfig, WorklistRecordSheet, worklistRecordSections, unscheduledTreatment). */
(() => {

/* ============================================================ people and tasks */
const ME = "Priya Shah";
const STAFF = { "Nina Flores": "Billing", "Marcus Lee": "Billing", "Priya Shah": "Front desk", "Dana Cole": "Office manager", "Dr. Maya Patel": "Dentist", Asha: "Asha" };
const shortName = (n) => (n === "Asha" ? "Asha" : n.startsWith("Dr. ") ? "Dr. " + n.split(" ").pop() : `${n.split(" ")[0]} ${n.split(" ")[1][0]}.`);
const person = (n, { size = 5, short = false, first = false } = {}) => n === "Asha"
  ? `<span class="inline-flex items-center gap-x-2 min-w-0"><span class="flex size-${size} shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800">${I("sparkles", size > 5 ? "size-3.5" : "size-3")}</span>Asha</span>`
  : `<span class="inline-flex items-center gap-x-2 min-w-0">${avatar(n, { size })}<span class="truncate">${esc(first ? (n.startsWith("Dr. ") ? shortName(n) : n.split(" ")[0]) : short ? shortName(n) : n)}</span></span>`;
const TASK_STATUS = { pending: { label: "Pending", tone: "off" }, resolved: { label: "Resolved", tone: "on" }, failed: { label: "Failed", tone: "needs" } };
const URGENCY = { High: "signal-high", Medium: "signal-medium", Low: "signal-low" };
const urgency = (u) => `<span class="inline-flex items-center gap-x-1.5 text-gray-800">${I(URGENCY[u], "size-4 text-gray-500")}${u}</span>`;
const TYPE_TONE = { "Claim Rejections": "tagBlue", "EOB Posting": "tagBlue", "Missing EOBs": "tagBlue", "Pre-Auth Responses": "tagIndigo", "Information Request": "tagIndigo", Insurance: "tagIndigo", Onboarding: "tagTeal", Scheduling: "tagTeal", Clinical: "tagGray", Medication: "tagGray", Voicemail: "tagOutline" };
const GROUPS = [["All Tasks", "inbox"], ["Revenue Cycle", "receipt"], ["Front Office", "building-2"], ["Clinical", "stethoscope"], ["Scheduling", "calendar-days"], ["Calls & Messages", "phone"]];
const TASKS = [
  ["t1", "Cigna claim: tooth # missing", "Claim Rejections", "Revenue Cycle", "High", "pending", "2026-09-24", "Nina Flores", "p3", "2026-09-26"],
  ["t2", "MetLife needs crown #30 info", "Information Request", "Revenue Cycle", "High", "pending", "2026-09-22", "Nina Flores", "p2", "2026-09-29"],
  ["t3", "Verify Guardian plan by 2 PM", "Insurance", "Front Office", "High", "pending", "2026-09-25", "Priya Shah", "p6", "2026-09-25"],
  ["t4", "Post MetLife check #884213", "EOB Posting", "Revenue Cycle", "Medium", "pending", "2026-09-24", "Asha", "p2", "2026-09-26"],
  ["t5", "No EOB from Delta in 22 days", "Missing EOBs", "Revenue Cycle", "Medium", "pending", "2026-09-23", "Marcus Lee", "p1", "2026-09-30"],
  ["t6", "Book approved deep cleaning", "Pre-Auth Responses", "Revenue Cycle", "Medium", "pending", "2026-09-21", "Priya Shah", "p5", "2026-10-02"],
  ["t7", "Voicemail about his bill", "Voicemail", "Calls & Messages", "Medium", "pending", "2026-09-25", "Priya Shah", "p8", "2026-09-25"],
  ["t8", "Intake forms due by 9:30 AM", "Onboarding", "Front Office", "Medium", "pending", "2026-09-24", "Priya Shah", "p9", "2026-09-25"],
  ["t9", "Crown #14 late from the lab", "Clinical", "Clinical", "Medium", "pending", "2026-09-23", "Dana Cole", "p8", "2026-09-28"],
  ["t10", "Refill: chlorhexidine rinse", "Medication", "Clinical", "Low", "pending", "2026-09-25", "Dr. Maya Patel", "p5", "2026-09-26"],
  ["t11", "Move cleaning to a morning", "Scheduling", "Scheduling", "Low", "pending", "2026-09-22", "Priya Shah", "p14", "2026-10-01"],
  ["t12", "Voicemail: sore spot, denture", "Voicemail", "Calls & Messages", "High", "pending", "2026-09-25", "Priya Shah", "p15", "2026-09-25"],
  ["t13", "Couldn't download Guardian EOB", "Missing EOBs", "Revenue Cycle", "Medium", "failed", "2026-09-23", "Asha", "p6", ""],
  ["t14", "Couldn't reach Aetna portal", "Claim Rejections", "Revenue Cycle", "Low", "failed", "2026-09-24", "Asha", "p15", ""],
  ["t15", "Posted Delta ERA to 2 claims", "EOB Posting", "Revenue Cycle", "Low", "resolved", "2026-09-20", "Asha", "p10", ""],
  ["t16", "Add sealants to next cleaning", "Scheduling", "Scheduling", "Low", "resolved", "2026-09-18", "Priya Shah", "p4", ""],
  ["t17", "Voicemail: confirming Fri 3 PM", "Voicemail", "Calls & Messages", "Low", "resolved", "2026-09-24", "Priya Shah", "p7", ""]
].map(([id, title, type, group, urg, status, created, who, pt, due]) => ({ id, title, type, group, urg, status, created, who, pt, due }));

/* The Asana-style completion control: an unfilled circle check, filled blue when done. Silent (no toast). */
const checkCtl = (done, label, size = "size-5") => `<button type="button" role="checkbox" aria-checked="${done}" aria-label="${esc(label)}" data-check class="inline-flex shrink-0 items-center justify-center rounded-full cursor-pointer text-gray-400 hover:text-blue-600 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-blue-600/20" data-size="${size}">${I("circle-check", done ? `${size} fill-blue-600 text-white` : size)}</button>`;
function wireChecks(root, onToggle) {
  root.addEventListener("click", (e) => { const b = e.target.closest("[data-check]"); if (!b || !root.contains(b)) return; e.stopPropagation();
    const on = b.getAttribute("aria-checked") !== "true"; b.setAttribute("aria-checked", on);
    b.innerHTML = I("circle-check", on ? `${b.dataset.size} fill-blue-600 text-white` : b.dataset.size);
    const st = b.dataset.size === "size-6" && root.querySelector("[data-status]"); if (st) st.innerHTML = on ? statusDot("Resolved", "on") : statusDot("Pending", "off");
    icons(); if (onToggle) onToggle(b, on); });
}
const patientLink = (pid) => `<button type="button" class="${cx(R.btn, R.link, "text-sm")}">${esc(DATA.patient(pid).name)}</button>`;
/* v2 page frame and toolbar: one 16px page edge and one 232px side menu (as on the Revenue pages), and the one list
 * toolbar from blocks/revenue.js (search · dates · sort chip · filters · + · ⋯) */
const PG = V2 ? 16 : 12, NAV_W = V2 ? 232 : 208;
const FRAME_NOTE = "One 16px page edge and one 232px side menu on every Revenue, Reports, Tasks and Lists page, so the content doesn't jump when you switch pages.";
const ListGrid = () => (V2 && window.v2RiGrid) || Grid;
/* v2: the check is the task's one status signal, 20px for the task and its subtasks alike */
const CHECK = V2 ? "size-5" : "size-6", SUB_CHECK = V2 ? "size-5" : "size-4";
/* v2: relative times in the activity feed, the exact time on hover ("Sep 24, 8:02 AM" -> "Yesterday") */
const relTime = (when) => { const m = /^([A-Z][a-z]{2}) (\d+), (.+)$/.exec(when); if (!m) return when;
  const d = Math.round((Date.parse(TODAY) - Date.parse(`2026-${String(MONTHS.indexOf(m[1]) + 1).padStart(2, "0")}-${m[2].padStart(2, "0")}`)) / 86400000);
  return d <= 0 ? m[3] : d === 1 ? "Yesterday" : `${d} days ago`; };
const panelNav = (pos) => `<div class="me-auto flex items-center gap-1">${iconButton("chevron-up", "Previous", { s: "iconSm" })}${iconButton("chevron-down", "Next", { s: "iconSm" })}<span class="${R.caption} ms-1 tabular-nums">${pos}</span></div>`;
/* Grid totals row stays in view while rows scroll (same scoped rule the revenue file uses) */
if (!document.getElementById("ri-grid-style")) { const st = document.createElement("style"); st.id = "ri-grid-style";
  st.textContent = "[data-ri] .g-table tfoot td{position:sticky;bottom:0;z-index:2;background:#fff;box-shadow:inset 0 1px 0 rgb(229 231 235 / .8)}[data-ri] .g-table tfoot td.g-sticky{z-index:4}"; document.head.appendChild(st); }

/* Task detail body, shared by the drawn panel and the real Sheet: flat psec() sections, lines edge to edge */
const SUBTASKS = { t1: [["Add tooth #3 to line 3", "Nina Flores", "Sep 24", true], ["Attach the Sep 18 bitewing", "Nina Flores", "Sep 25", false], ["Resend the claim to Cigna", "Asha", "Sep 26", false]] };
/* Status on one line: one status button plus a grey caption. [data-status] is what the circle check updates. */
const statusLine = (st, caption) => `<section class="${R.psec} flex items-center justify-between gap-3 !py-3"><button type="button" class="${cx(R.btn, R.sm, R.white, "!ps-2.5")}" aria-haspopup="menu" aria-label="Change status"><span data-status>${statusDot(st.label, st.tone)}</span>${I("chevron-down", "!text-gray-400")}</button><span class="text-[13px] text-gray-500">${caption}</span></section>`;
function subtasks(list, done) {
  return bleed(`<table class="w-full border-separate border-spacing-0 text-sm"><tbody>${list.map(([s, who, due, d]) => { const on = done || d;
    return `<tr><td class="h-9 ps-5 pe-1 border-t border-gray-200/80 w-10">${checkCtl(on, on ? "Reopen subtask" : "Mark subtask resolved", SUB_CHECK)}</td><td class="h-9 px-1 border-t border-gray-200/80 ${on ? "text-gray-500 line-through decoration-gray-300" : "text-gray-800"}">${esc(s)}</td><td class="h-9 px-3 border-t border-gray-200/80 w-32">${person(who, { short: true })}</td><td class="h-9 pe-5 border-t border-gray-200/80 w-16 text-end text-[13px] text-gray-500">${due}</td></tr>`; }).join("")}</tbody></table>`);
}
const fileRowV2 = (icon, name, kind, size, by) => `<div class="group flex items-center gap-2.5 h-9 px-5 border-t border-gray-200/80" title="Added by ${esc(by)}">${I(icon, "size-4 shrink-0 text-gray-400")}<span class="min-w-0 truncate text-sm text-gray-800">${name}</span><span class="shrink-0 text-[13px] text-gray-400">· ${kind} · ${size}</span><span class="ms-auto opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">${iconButton("download", "Download file", { s: "iconXs" })}</span></div>`;
const activityV2 = (items) => `<ol class="space-y-3">${items.map(([who, what, when, comment]) => `<li class="flex gap-3">${who === "Asha" ? `<span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800">${I("sparkles", "size-3")}</span>` : avatar(who, { size: 6 })}
  <div class="min-w-0 grow"><div class="flex items-baseline gap-3"><p class="min-w-0 grow text-[13px] leading-6 text-gray-800"><span class="font-medium">${who}</span> <span class="text-gray-600">${what}</span></p><time class="shrink-0 whitespace-nowrap text-xs text-gray-400" title="${esc(when)}" data-tip="${esc(when)}">${relTime(when)}</time></div>${comment ? `<p class="mt-1 text-sm text-gray-800 ${R.boxMuted} px-3 py-2">${comment}</p>` : ""}</div></li>`).join("")}</ol>`;
const fileRow = (icon, name, meta) => `<div class="flex items-center gap-3 h-12 px-5 border-t border-gray-200/80"><span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-500">${I(icon, "size-4")}</span><div class="min-w-0 grow"><p class="text-sm text-gray-800 truncate">${name}</p><p class="${R.caption}">${meta}</p></div>${iconButton("download", "Download file", { s: "iconXs" })}</div>`;
const activity = (items) => `<ol class="space-y-3.5">${items.map(([who, what, when, comment]) => `<li class="flex gap-3">${who === "Asha" ? `<span class="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800">${I("sparkles", "size-3")}</span>` : avatar(who, { size: 6 })}
  <div class="min-w-0 grow"><p class="text-[13px] text-gray-800"><span class="font-medium">${who}</span> <span class="text-gray-600">${what}</span> <span class="text-gray-400">· ${when}</span></p>${comment ? `<p class="mt-1 text-sm text-gray-800 ${R.boxMuted} px-3 py-2">${comment}</p>` : ""}</div></li>`).join("")}</ol>`;
function taskBody(t, done) {
  const subs = SUBTASKS[t.id] || [["Check the payer's reason", t.who, fmtDate(t.created), false], ["Fix and follow up", t.who, t.due ? fmtDate(t.due) : "—", false]];
  const n = subs.filter((s) => done || s[3]).length;
  const desc = t.id === "t1" ? "Cigna sent back Emma Rodriguez's Sep 18 claim. Line 3 (D2391, one-surface filling) has no tooth number. The chart note says #3, occlusal. Add the tooth, attach the bitewing, and resend."
    : `${esc(t.title)}. Created from ${t.type === "Voicemail" ? "a voicemail" : "the " + t.type.toLowerCase() + " queue"} for ${esc(DATA.patient(t.pt).name)}.`;
  const acts = t.id === "t1" ? [["Asha", "created this task from Cigna's rejection", "Sep 24, 8:02 AM"], ["Nina Flores", "added tooth #3 to line 3", "Sep 24, 9:15 AM"], ["Dana Cole", "commented", "Sep 24, 11:40 AM", "The bitewing from the 18th is in Imaging. Use that one, not the pano."]]
    : [["Asha", "created this task", fmtDate(t.created) + ", 8:00 AM"]];
  if (done) acts.push([t.who, "marked this complete", "Sep 25, 2:14 PM"]);
  if (V4) return v4TaskBody(t, done, subs, n, desc, acts);
  if (V2) { const files = t.id === "t1" ? [fileRowV2("file-text", "Cigna 277CA rejection, Sep 24.pdf", "PDF", "88 KB", "Asha"), fileRowV2("image", "Bitewing right, Sep 18.png", "X-ray", "1.2 MB", "Nina Flores")] : [];
    return `${psec("", `<div${chg("The “Pending ▾” status row is gone: the circle check is the status, as in the real task panel. Due moved into the facts.")}>${metaGrid([["Assignee", person(t.who)], ["Urgency", urgency(t.urg)], ["Type", tag(t.type, "tagGray")], ["Patient", patientLink(t.pt)], ["Due", t.due ? fmtDateY(t.due) : '<span class="text-gray-400">No due date</span>']], 3)}</div>`)}
    ${psec("Description", `<p class="text-sm leading-6 text-gray-800">${desc}</p>`)}
    ${psec("Subtasks", `<div${chg("Subtask checks are the same 20px circle as the task's own check (they were 16px and 24px).")}>${subtasks(subs, done)}</div>`, { count: `${n} of ${subs.length}`, actions: button("Add", { v: "white", s: "xs", icon: "plus" }), cls: "!pb-0" })}
    ${psec("Attachments", files.length ? `<div${chg("Attachments are 36px one-line rows like subtasks: name, then type and size in grey; download shows when you point at the row.")}>${bleed(files.join(""))}</div>` : `<p class="${R.help}">No files yet.</p>`, { count: files.length || null, actions: button("Add", { v: "white", s: "xs", icon: "paperclip" }), cls: files.length ? "!pb-0" : "" })}
    ${psec("Activity", `<div${chg("Each activity line ends with a short grey time (“Yesterday”) that never wraps; the exact time shows on hover.")}>${activityV2(acts)}</div>`)}`; }
  const st = done ? TASK_STATUS.resolved : TASK_STATUS[t.status];
  const files = t.id === "t1" ? [fileRow("file-text", "Cigna 277CA rejection, Sep 24.pdf", "PDF · 88 KB · added by Asha"), fileRow("image", "Bitewing right, Sep 18.png", "X-ray · 1.2 MB · added by Nina Flores")] : [];
  return `${statusLine(st, t.due ? `Due ${fmtDateY(t.due)}` : "No due date")}
    ${psec("", metaGrid([["Assignee", person(t.who)], ["Urgency", urgency(t.urg)], ["Type", tag(t.type, TYPE_TONE[t.type])], ["Patient", patientLink(t.pt)]], 2))}
    ${psec("Description", `<p class="text-sm leading-6 text-gray-800">${desc}</p>`)}
    ${psec("Subtasks", subtasks(subs, done), { count: `${n} of ${subs.length}`, actions: button("Add", { v: "white", s: "xs", icon: "plus" }), cls: "!pb-0" })}
    ${psec("Attachments", files.length ? bleed(files.join("")) : `<p class="${R.help}">No files yet.</p>`, { count: files.length || null, actions: button("Add", { v: "white", s: "xs", icon: "paperclip" }), cls: files.length ? "!pb-0" : "" })}
    ${psec("Activity", activity(acts))}`;
}
const commentBox = () => `<div class="relative w-full"><input class="${R.input} pe-10" placeholder="Add a comment..." aria-label="Add a comment" /><span class="absolute inset-y-0 end-1 flex items-center">${iconButton("send-horizontal", "Send comment", { s: "iconXs" })}</span></div>`;
function openTaskSheet(t) {
  if (V4) { const done = t.status === "resolved";
    Sheet.open({ title: esc(t.title), lead: v4TaskCheck(done), subtitle: `Created ${fmtDate(t.created)} by ${t.who === "Asha" ? "Asha" : "Asha for " + esc(t.who)}`,
      actions: v4TaskMenu(t, done), body: taskBody(t, done), footer: commentBox(), flush: true });
    wireChecksOnce(); v4WireTask(Sheet.el); return; }
  Sheet.open({ title: esc(t.title), lead: `<div class="pt-0.5">${checkCtl(t.status === "resolved", "Mark task complete", CHECK)}</div>`, subtitle: `Created ${fmtDate(t.created)} by ${t.who === "Asha" ? "Asha" : "Asha for " + esc(t.who)}`,
    actions: iconButton("link", "Copy link to task", { s: "iconSm" }) + iconButton("ellipsis", "More actions", { s: "iconSm" }),
    body: taskBody(t, t.status === "resolved"), footer: commentBox(), flush: true });
  wireChecksOnce();
}
let sheetWired = false;
function wireChecksOnce() { if (sheetWired || !Sheet.el) return; sheetWired = true; wireChecks(Sheet.el); }

/* ============================================================ v4: a task's facts and subtasks are tables you type into,
 * Status is the facts table's first line (the circle check and it stay in step), and ⋯ is the one Actions menu */
const V4_TASK_TYPES = Object.keys(TYPE_TONE);
const v4TaskStatusDot = (v) => statusDot(v, v === "Resolved" ? "on" : v === "Failed" ? "needs" : "off");
const v4TaskCheck = (done) => `<span class="flex pt-0.5"${chg4("The circle check and the Status line stay in step: tick the circle or pick Resolved, and both change.")}>${checkCtl(done, done ? "Mark task incomplete" : "Mark task complete", CHECK)}</span>`;
function v4TaskFields(t, done, due) {
  const st = done ? "Resolved" : TASK_STATUS[t.status].label;
  return [{ label: "Status", value: st, type: "select", options: [...new Set(["Pending", "Resolved", st])], html: (r) => v4TaskStatusDot(r.value) },
    { label: "Assignee", value: t.who, type: "select", options: Object.keys(STAFF), html: (r) => person(r.value) },
    { label: "Urgency", value: t.urg, type: "select", options: ["High", "Medium", "Low"], html: (r) => urgency(r.value) },
    { label: "Type", value: t.type, type: "select", options: V4_TASK_TYPES, html: (r) => tag(r.value, "tagGray") },
    { label: "Patient", value: DATA.patient(t.pt).name, type: "none", html: () => patientLink(t.pt) },
    { label: "Due date", value: due === undefined ? (t.due ? fmtDateY(t.due) : "") : due, type: "text" }];
}
/* v4: a field table that names its group in the header band, used where a line table with a header band shares the
 * surface (so every table there has the same header treatment). Passed to fieldTable as its columns. */
const v4BandCols = (group, labelW) => [{ key: "label", label: group, w: labelW, render: (r) => `<span class="text-gray-500">${esc(r.label)}</span>` },
  { key: "value", label: "", w: 160, grow: true, edit: (r) => (r.type === "none" ? null : r.type || "text"), options: (r) => r.options, placeholder: (r) => `Add ${r.label.replace(/^\w/, (m) => m.toLowerCase())}`, render: (r) => (r.html ? r.html(r) : esc(r.value)) }];
/* Picking Resolved in the Status line fills the circle check in the header, quietly */
const v4TaskFacts = (t, done, due, band = false) => `<div data-v4-task-facts${chg4(`The task's facts are a small table you type into: click Assignee, Urgency, Type or Due date and change it right there. Status is its first line instead of a row of its own.${band ? " Its name, Task, sits in the same grey header band as the claim's tables below, so every table in the panel reads the same way." : ""}`)}>${fieldTable(v4TaskFields(t, done, due), { labelW: 120, title: "Task", ...(band ? { head: true, columns: v4BandCols("Task", 120) } : {}),
  onCommit: (r, key, v, g) => { if (r.label !== "Status") return; const c = g.root.closest("aside") && g.root.closest("aside").querySelector("header [data-check]"); if (!c) return;
    const on = v === "Resolved"; c.setAttribute("aria-checked", on); c.setAttribute("aria-label", on ? "Mark task incomplete" : "Mark task complete"); c.innerHTML = I("circle-check", on ? `${c.dataset.size} fill-blue-600 text-white` : c.dataset.size); icons(); } })}</div>`;
const v4SubCheck = (r) => `<button type="button" role="checkbox" aria-checked="${r.done}" aria-label="${r.done ? "Reopen subtask" : "Mark subtask resolved"}" data-act="v4-sub" data-v4-sub="${r.id}" class="inline-flex shrink-0 items-center justify-center rounded-full cursor-pointer text-gray-400 hover:text-blue-600 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-blue-600/20">${I("circle-check", r.done ? "size-5 fill-blue-600 text-white" : "size-5")}</button>`;
const v4SubLines = (subs, done) => ({ title: "Subtasks", head: false, rows: subs.map(([s, who, due, d], i) => ({ id: `st${i}`, s, who, due, done: done || d })),
  columns: [{ key: "done", label: "Done", w: 40, render: v4SubCheck },
    { key: "s", label: "Subtask", w: 160, grow: true, edit: "text", placeholder: () => "Name the subtask", render: (r) => `<span class="${r.done ? "text-gray-500 line-through decoration-gray-300" : "text-gray-800"}">${esc(r.s)}</span>` },
    { key: "who", label: "Assignee", w: 116, edit: "select", options: Object.keys(STAFF), render: (r) => person(r.who, { short: true }) },
    { key: "due", label: "Due", w: 76, edit: "text", placeholder: () => "Add date", render: (r) => `<span class="text-gray-500 tabular-nums">${esc(r.due)}</span>` }] });
/* v4: a task's files are the same compact table as its subtasks (file and who added it); the type and size open on hover */
const V4_TASK_FILES = { t1: [{ id: "tf1", icon: "file-text", name: "Cigna 277CA rejection, Sep 24.pdf", kind: "PDF", size: "88 KB", by: "Asha" }, { id: "tf2", icon: "image", name: "Bitewing right, Sep 18.png", kind: "X-ray", size: "1.2 MB", by: "Nina Flores" }] };
const v4TaskFiles = (files) => sheetTable({ sheet: false, head: false, title: "Attachments", rows: files, peek: (f) => peekCard(esc(f.name), [["Type", f.kind], ["Size", f.size], ["Added by", esc(f.by)]]),
  columns: [{ key: "name", label: "File", w: 200, grow: true, render: (f) => `<span class="inline-flex items-center gap-2 min-w-0">${I(f.icon, "size-4 shrink-0 text-gray-400")}<span class="truncate">${esc(f.name)}</span></span>` },
    { key: "by", label: "Added by", w: 120, render: (f) => person(f.by, { short: true }) },
    { key: "dl", label: "Download", w: 48, render: (f) => iconButton("download", `Download ${f.name}`, { s: "iconXs" }) }] });
function v4TaskBody(t, done, subs, n, desc, acts) {
  const files = V4_TASK_FILES[t.id] || [];
  return `${psec("", v4TaskFacts(t, done))}
    ${psec("Description", `<p class="text-sm leading-6 text-gray-800">${desc}</p>`)}
    ${psec("Subtasks", `<div data-v4-subs${chg4("Subtasks are a table you type into: click a subtask, who it's for or its date to change it; the circle still ticks it off.")}>${sheetTable(v4SubLines(subs, done))}</div>`, { count: `<span data-v4-subcount>${n} of ${subs.length}</span>`, actions: button("Add", { v: "white", s: "xs", icon: "plus" }) })}
    ${psec("Attachments", files.length ? `<div${chg4("Files are the same compact table as the subtasks, one line each: the file, who added it and download; its type and size show in a card when you point at the row, instead of a grey string after the name.")}>${v4TaskFiles(files)}</div>` : `<p class="${R.help}">No files yet.</p>`, { count: files.length || null, actions: button("Add", { v: "white", s: "xs", icon: "paperclip" }) })}
    ${psec("Activity", activityV2(acts))}`;
}
/* The task's Actions menu. What already has its own control here (the check, Status and the other facts, Add subtask,
 * Add file, the patient link, View claim) isn't repeated. */
function v4TaskActions(t, done) {
  const claim = t.id === "t1" ? { label: "Claim", items: [{ icon: "file-text", label: "Open claim", hint: "Cigna claim for Emma's Sep 18 visit" },
      { icon: "image", label: "Attach x-ray from Imaging", hint: "Pick an image already in her chart", suggest: done ? "" : "Dana says to use the Sep 18 bitewing" },
      { icon: "send", label: "Resend claim to Cigna", hint: "Send the fixed claim through the clearinghouse" }, { icon: "refresh-cw", label: "Refresh claim status", hint: "Ask Cigna for the latest" }] }
    : t.id === "t2" ? { label: "Claim", items: [{ icon: "file-search", label: "MetLife's letter", hint: "The request as MetLife sent it" }, { icon: "phone", label: "Call MetLife", hint: "Provider line, with reference MET-7730418 ready" },
      { icon: "refresh-cw", label: "Refresh claim status", hint: "Ask MetLife for the latest" }] } : null;
  return [{ label: "Task", items: [{ icon: "link", label: "Copy link to task", hint: "To paste in a message to a teammate" },
      { icon: "alarm-clock", label: "Snooze", hint: "Hide it from Pending until a date you pick", off: done ? "It's already resolved" : "" },
      { icon: "copy", label: "Duplicate task", hint: "A new task with the same details" }, { icon: "history", label: "Task history", hint: "Every change, who made it and when" }] },
    ...(claim ? [claim] : []), { label: "", items: [{ icon: "trash-2", label: "Delete task", danger: true }] }];
}
const v4TaskMenu = (t, done) => `<div class="flex"${chg4("The ⋯ and the link icon are one ⋯ menu: the task's actions in groups, searchable, with a sparkle on what Asha suggests now.")}>${actionsMenu(v4TaskActions(t, done), { dots: true, up: false, align: "end", open: V4_OPTS.open })}</div>`;
/* Previous / next in the header; where you are in the list ("1 of 12") is on their hover so the name keeps the room */
const v4PanelNav = (pos) => `${iconButton("chevron-up", `Previous · ${pos}`, { s: "iconSm" })}${iconButton("chevron-down", `Next · ${pos}`, { s: "iconSm", cls: "me-1" })}`;
const v4TaskPanel = (t, done, { w, pos, subtitle, body, footer = "" }) => sheetPanel({ w, flush: true, cls: "shrink-0", title: esc(t.title), subtitle, lead: v4TaskCheck(done),
  actions: `${v4PanelNav(pos)}${v4TaskMenu(t, done)}`, body, footer });
/* Subtask circles tick in the table; the header circle sets the Status line (wireChecks has already flipped it) */
function v4WireTask(root) {
  if (!root || root._v4Task) return; root._v4Task = true;
  root.addEventListener("click", (e) => {
    const sb = e.target.closest("[data-v4-sub]");
    if (sb) { const host = sb.closest("[data-sheet-host]"), g = host && host._grid, r = g && g.data.find((x) => x.id === sb.dataset.v4Sub); if (!r) return;
      r.done = !r.done; g.render(); const c = root.querySelector("[data-v4-subcount]"); if (c) c.textContent = `${g.data.filter((x) => x.done).length} of ${g.data.length}`; return; }
    const path = e.composedPath(), hc = path.find((n) => n.dataset && n.dataset.check !== undefined); // wireChecks has already redrawn the icon clicked
    if (!hc || !path.some((n) => n.tagName === "HEADER")) return;
    const host = root.querySelector("[data-v4-task-facts] [data-sheet-host]"), g = host && host._grid, st = g && g.data.find((x) => x.label === "Status");
    if (st) { st.value = hc.getAttribute("aria-checked") === "true" ? "Resolved" : "Pending"; g.render(); } });
}

/* ============================================================ 1. Tasks page */
const taskCols = () => [
  { key: "status", label: "Status", w: 118, kind: "text", value: (t) => TASK_STATUS[t.status].label, render: (t) => statusDot(TASK_STATUS[t.status].label, TASK_STATUS[t.status].tone) },
  { key: "title", label: "Task", icon: "list-checks", w: 230, kind: "text", open: true, render: (t) => esc(t.title) },
  { key: "urg", label: "Urgency", w: 112, kind: "text", value: (t) => ({ High: 0, Medium: 1, Low: 2 }[t.urg]), render: (t) => urgency(t.urg) },
  { key: "type", label: "Type", w: 170, kind: "text", render: (t) => tag(t.type, TYPE_TONE[t.type]) },
  { key: "created", label: "Date created", w: 112, kind: "date", render: (t) => fmtDate(t.created) },
  { key: "who", label: "Assignee", w: 120, kind: "text", render: (t) => person(t.who, { first: true }) }
];
/* v2: Status shows only where the tab mixes statuses (Assigned to me), as the real TasksTable does; Type is a grey tag */
const STATUS_NOTE = "No Status column under Pending, Resolved and Failed: the tab already says it (the real Tasks table hides it too). It shows only under Assigned to me, where statuses mix.";
const taskColsV2 = (withStatus) => [
  ...(withStatus ? [{ key: "status", label: "Status", w: 118, kind: "text", value: (t) => TASK_STATUS[t.status].label, render: (t) => statusDot(TASK_STATUS[t.status].label, TASK_STATUS[t.status].tone) }] : []),
  { key: "title", label: withStatus ? "Task" : `<span${chg(STATUS_NOTE)}>Task</span>`, icon: "list-checks", w: withStatus ? 240 : 300, kind: "text", open: true, value: (t) => t.title, render: (t) => esc(t.title) },
  { key: "urg", label: "Urgency", w: 112, kind: "text", value: (t) => ({ High: 0, Medium: 1, Low: 2 }[t.urg]), render: (t) => urgency(t.urg) },
  { key: "type", label: `<span${chg("Type is a plain grey tag: five tag colours next to avatars and icons made every row a pattern of badges.")}>Type</span>`, w: 170, kind: "text", value: (t) => t.type, render: (t) => tag(t.type, "tagGray") },
  { key: "created", label: "Date created", w: 112, kind: "date", render: (t) => fmtDate(t.created) },
  { key: "who", label: "Assignee", w: 120, kind: "text", render: (t) => person(t.who, { first: true }) }
];
/* v4: pointing at a task shows what the list leaves out (the patient, when it's due, its group) in a card */
const v4TaskPeek = (t) => peekCard(esc(t.title), [["Patient", esc(DATA.patient(t.pt).name)], ["Due", t.due ? fmtDateY(t.due) : '<span class="text-gray-500">No due date</span>'], ["Created", fmtDateY(t.created)], ["Group", t.group], ["Status", TASK_STATUS[t.status].label]]);
/* v4: Urgency and Assignee are cells you change right in the list, the way staff re-assign a pile of work */
const v4TaskCols = (withStatus) => taskColsV2(withStatus).map((c) => c.key === "urg" ? { ...c, w: 124, edit: "select", options: ["High", "Medium", "Low"] }
  : c.key === "who" ? { ...c, w: 140, edit: "select", options: Object.keys(STAFF) } : c);
const TASK_PERIODS = ["Last 7 days", "Last 30 days", "Last 90 days", "All time"], TASK_DAYS = [7, 30, 90, Infinity];
const SUBTABS = [["Pending", (t) => t.status === "pending"], ["Resolved", (t) => t.status === "resolved"], ["Assigned to me", (t) => t.who === ME && t.status !== "resolved"], ["Failed", (t) => t.status === "failed"]];
const inGroup = (g) => (t) => g === "All Tasks" || t.group === g;
const groupNav = (on, rows) => `<nav class="h-full border-e border-gray-200/80 p-3"${chg(FRAME_NOTE)} aria-label="Task groups"><p class="${R.navGroup} !pt-1">Groups</p>${GROUPS.map(([g, ic]) => { const n = rows.filter((t) => t.status === "pending" && inGroup(g)(t)).length;
  return `<button type="button" data-group="${g}" class="${g === on ? R.navItemOn : R.navItem}" ${g === on ? 'aria-current="page"' : ""}>${I(ic)}<span class="truncate">${g}</span><span class="ms-auto text-xs ${g === on ? "text-gray-600" : "text-gray-400"} tabular-nums">${n}</span></button>`; }).join("")}
  <p class="${R.navGroup}">Views</p>${V2 ? "" : `<button type="button" class="${R.navItem}">${I("user-round")}Assigned to me</button>`}<button type="button" class="${R.navItem}"${chg("The “Assigned to me” view in the side menu is gone: it was the same list as the Assigned to me tab.")}>${I("bot")}Agent flags<span class="ms-auto text-xs text-gray-400 tabular-nums">2</span></button></nav>`;
defineBlock({
  cat: "tasks", id: "tasks-page", thumb: true,
  title: "Tasks",
  note: "The Tasks page: groups on the left with open counts, Pending / Resolved / Assigned to me / Failed tabs, then the grid. Pick a group or a tab to filter, click a task to open it, tick rows for bulk actions.",
  where: "Main › Tasks",
  states: ["Normal", "Loading", "Nothing pending"],
  canvas: "bare",
  html: (state) => {
    const rows = state === "Nothing pending" ? TASKS.filter((t) => t.status === "resolved") : TASKS;
    const counts = SUBTABS.map(([, f]) => rows.filter(f).length);
    return `${workspaceHeader({ title: "Tasks", actions: `${iconButton("settings", "Task settings", { s: "iconSm" })}${button("Create task", { v: "solid", s: "sm", icon: "plus" })}` })}
    <div class="grid grid-cols-[${NAV_W}px_1fr]">
      <div class="border-e border-gray-200/80" data-groups>${groupNav("All Tasks", rows)}</div>
      <div class="min-w-0 ${V2 ? "px-4" : "px-3"} pb-4">
        <div data-subtabs>${V2 ? tabsWithSlot(SUBTABS.map(([l], i) => [l, counts[i]]), 0, "", "", { gutter: PG }) : tabsWithSlot(SUBTABS.map(([l], i) => [l, counts[i]]), 0, dateRangeButton("Last 30 days"), "")}</div>
        ${state === "Loading" ? (V2 ? `<div class="py-2.5 flex gap-2">${skel("w-44", "h-8")}${skel("w-36", "h-8")}${skel("w-28", "h-8")}</div>${gridSkeleton(["Task", "Urgency", "Type", "Date created", "Assignee"], 8, { gutter: PG })}`
          : `<div class="py-2.5 flex gap-2">${skel("w-32", "h-8")}${skel("w-48", "h-8")}${skel("w-16", "h-8")}</div>${gridSkeleton(["Status", "Task", "Urgency", "Type", "Date created", "Assignee"], 8, { gutter: 12 })}`) : `${V4 ? `<div${chg4("Point at a task to see the patient, the due date and its group in a card beside the row; the list keeps the five columns staff sort and re-assign by, and a click still opens the whole task.")}>` : ""}<div data-grid="tasks" data-ri${chg4("Urgency and Assignee are cells you change right in the list: click one (or just start typing) and pick; no need to open the task to re-assign it.")}></div>${V4 ? "</div>" : ""}`}
      </div>
    </div>`;
  },
  mount: (el, state) => {
    const host = el.querySelector('[data-grid="tasks"]'); if (!host) return;
    const all = state === "Nothing pending" ? TASKS.filter((t) => t.status === "resolved") : TASKS;
    let group = "All Tasks", sub = 0;
    const rows = () => all.filter((t) => inGroup(group)(t) && SUBTABS[sub][1](t));
    let days = 30;
    const g = new (ListGrid())(host, Object.assign({ gutter: PG, columns: V4 ? v4TaskCols(false) : V2 ? taskColsV2(false) : taskCols(), rows: rows(), title: "All Tasks", searchPlaceholder: "Search tasks", maxHeight: 400, addColumn: false, defaultSort: { key: "urg", dir: 1 },
      filters: [{ key: "urg", label: "Urgency", options: ["High", "Medium", "Low"].map((u) => ({ value: u, label: u })) }, { key: "who", label: "Assignee", options: Object.keys(STAFF).map((n) => ({ value: n, label: n })) }],
      calc: { created: "latest" },
      empty: { icon: "list-checks", title: "No pending tasks", body: "New tasks land here when Asha finds work for a person, or when someone on the team creates one.", action: "Create task" },
      bulk: [{ label: "Assign", icon: "user-round" }, { label: "Resolve", icon: "circle-check", run: (sel) => sel.forEach((t) => (t.status = "resolved")) }, { label: "Export", icon: "download" }, { label: "Delete", icon: "trash-2", danger: true }],
      onOpen: openTaskSheet }, V2 ? { footer: false, periods: TASK_PERIODS, period: 1, onPeriod: (i) => { days = TASK_DAYS[i]; refresh(); } } : {}, V4 ? { sheet: true, peek: v4TaskPeek } : {}));
    const recent = (t) => !V2 || daysSince(t.created) <= days;
    const refresh = () => { g.o.title = group; if (V2) g.o.columns = V4 ? v4TaskCols(sub === 2) : taskColsV2(sub === 2); g.setRows(rows().filter(recent)); g.render();
      const counts = SUBTABS.map(([, f]) => all.filter((t) => inGroup(group)(t) && f(t) && recent(t)).length);
      el.querySelectorAll("[data-subtabs] [data-tab]").forEach((tb, i) => { const c = tb.querySelector("span"); if (c) c.textContent = counts[i]; }); };
    wireTabs(el.querySelector("[data-subtabs]"), (i) => { sub = i; refresh(); });
    el.querySelector("[data-groups]").addEventListener("click", (e) => { const b = e.target.closest("[data-group]"); if (!b) return; group = b.dataset.group;
      el.querySelector("[data-groups]").innerHTML = groupNav(group, all); icons(); refresh(); });
  }
});

/* ============================================================ drawn panel frame (inline, static) */
const faded = (inner) => `<div class="min-w-0 grow overflow-hidden opacity-45 pointer-events-none select-none" aria-hidden="true" inert>${inner}</div>`;
const panel = (w, inner) => `<aside class="${w} shrink-0 bg-white border-s border-gray-200/80 shadow-[-12px_0_32px_-12px_rgba(17,24,39,0.16)] flex flex-col" aria-label="Details">${inner}</aside>`;
const panelTop = (pos, extra = "") => `<div class="flex items-center justify-between gap-2 h-11 px-3 border-b border-gray-200/80">
  <div class="flex items-center gap-1">${iconButton("chevron-up", "Previous", { s: "iconXs" })}${iconButton("chevron-down", "Next", { s: "iconXs" })}<span class="${R.caption} ms-1 tabular-nums">${pos}</span></div>
  <div class="flex items-center gap-0.5">${extra}${iconButton("link", "Copy link", { s: "iconXs" })}${iconButton("ellipsis", "More actions", { s: "iconXs" })}${iconButton("x", "Close", { s: "iconXs" })}</div></div>`;
const taskSliceV2 = (openId = "t1") => `${workspaceHeader({ title: "Tasks" })}<div class="px-4">${tabsWithSlot([["Pending", 12], ["Resolved", 3], ["Assigned to me", 6], ["Failed", 2]], 0, "", "", { gutter: 16 })}
  <table class="w-full mt-3 border-separate border-spacing-0"><thead><tr><th class="${R.tHead}">Task</th><th class="${R.tHead}">Urgency</th></tr></thead><tbody>${TASKS.slice(0, 12).map((t) => `<tr${t.id === openId ? ' class="bg-blue-50/70"' : ""}><td class="${R.tCell} max-w-0 truncate">${esc(t.title)}</td><td class="${R.tCell} w-28">${urgency(t.urg)}</td></tr>`).join("")}</tbody></table></div>`;
/* v2: the drawn panels are the kit's sheetPanel (44px top bar, 16px title), so they can't drift from the live Sheet */
const taskPanelV2 = (t, done, { w, pos, subtitle, body, footer = "" }) => sheetPanel({ w, flush: true, cls: "shrink-0", title: esc(t.title), subtitle,
  lead: `<span${chg("The task's check is 20px, the same as its subtasks, and a done task keeps its normal title: the filled check says it's done.")}>${checkCtl(done, done ? "Mark task incomplete" : "Mark task complete", CHECK)}</span>`,
  actions: `${panelNav(pos)}${iconButton("link", "Copy link", { s: "iconSm" })}${iconButton("ellipsis", "More actions", { s: "iconSm" })}`, body, footer });
const taskSlice = (openId = "t1", done = false) => V2 ? taskSliceV2(openId) : `${workspaceHeader({ title: "Tasks" })}<div class="px-4">${tabsWithSlot([["Pending", 12], ["Resolved", 3], ["Assigned to me", 6], ["Failed", 2]], 0, "", "")}
  <table class="w-full mt-3 border-separate border-spacing-0"><thead><tr><th class="${R.tHead}">Status</th><th class="${R.tHead}">Task</th></tr></thead><tbody>${TASKS.slice(0, 12).map((t) => { const st = TASK_STATUS[done && t.id === openId ? "resolved" : t.status]; return `<tr${t.id === openId ? ' class="bg-blue-50/70"' : ""}><td class="${R.tCell} w-28">${statusDot(st.label, st.tone)}</td><td class="${R.tCell} max-w-0 truncate">${esc(t.title)}</td></tr>`; }).join("")}</tbody></table></div>`;

/* ============================================================ 2. Task panel */
defineBlock({
  cat: "tasks", id: "tasks-task-panel", title: "Task panel",
  note: "A task opened from the list. The empty circle left of the title marks it done, quietly, with no pop-up. Patient is a blue link, subtasks use the same circle, then files and the activity with comments.",
  where: "Tasks › a task",
  states: ["Open", "Done"],
  canvas: "bare",
  html: (state) => { const t = TASKS[0], done = state === "Done";
    if (V4) return `<div class="flex min-h-[720px]">${faded(taskSlice("t1", done))}${v4TaskPanel(t, done, { w: 520, pos: "1 of 12", subtitle: "Created Sep 24 by Asha · Claim for Sep 18 visit", body: taskBody(t, done), footer: commentBox() })}</div>`;
    if (V2) return `<div class="flex min-h-[720px]">${faded(taskSlice("t1", done))}${taskPanelV2(t, done, { w: 460, pos: "1 of 12", subtitle: "Created Sep 24 by Asha · Claim for Sep 18 visit", body: taskBody(t, done), footer: commentBox() })}</div>`;
    return `<div class="flex min-h-[720px]">${faded(taskSlice("t1", done))}${panel("w-[460px]", `${panelTop("1 of 12")}
      <div class="grow overflow-y-auto">
        <div class="flex items-start gap-3 px-5 pt-4 pb-4"><div class="pt-0.5">${checkCtl(done, done ? "Mark task incomplete" : "Mark task complete", "size-6")}</div>
          <div class="min-w-0"><h2 class="text-lg font-semibold leading-snug ${done ? "text-gray-500" : "text-gray-800"}">${esc(t.title)}</h2><p class="${R.caption} mt-0.5">Created Sep 24 by Asha · Claim for Sep 18 visit</p></div></div>
        ${taskBody(t, done)}
      </div>
      <div class="px-5 py-3 border-t border-gray-200/80">${commentBox()}</div>`)}</div>`; },
  mount: (el) => { wireChecks(el, (b, on) => { if (V2 || b.dataset.size !== "size-6") return; const h = b.closest(".flex").querySelector("h2"); if (h) h.className = `text-lg font-semibold leading-snug ${on ? "text-gray-500" : "text-gray-800"}`; });
    if (V4) v4WireTask(el); }
});

/* ============================================================ 3. Information request responder */
const IR_ITEMS = [
  { q: "Date the root canal on #30 was finished", req: "A date. If it was done at another office, say which one.", draft: "Jun 30, 2026. Same visit as the buildup, done here by Dr. Brooks.", answer: "Jun 30, 2026. Same visit as the buildup, done here by Dr. Brooks." },
  { q: "Is the crown on #30 the first crown on this tooth? If it replaces an old crown, when was the old one placed?", req: "Yes or no, and a date if it's a replacement.", draft: "", answer: "First crown on #30. No prior crown on this tooth." },
  { q: "Pre-op x-ray of #30 showing the decay", req: "An image file. A periapical or bitewing taken before treatment.", file: "Periapical #30, Jun 2, 2026.png", done: true }
];
const spreadCell = "px-3 py-2 border-b border-e border-gray-200/80 text-sm align-top";
const spreadHead = "px-3 h-9 border-b border-e border-gray-200/80 text-sm font-medium text-gray-500 text-start align-middle";
/* v2: the claim is said once (facts plus the claim-form grid), no "#" column, Submit only once an answer has text */
const IR_PROCS = [["D3330", "Root canal, molar", "#30", 1150], ["D2950", "Core buildup", "#30", 295], ["D2740", "Crown, porcelain/ceramic", "#30", 1250]];
const IR_BAND = "h-7 px-3 border-b border-gray-200/80 bg-gray-50 text-start text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap";
function irResponderV2(answered) {
  const items = IR_ITEMS.map((it) => ({ ...it, done: answered || it.done })), nDone = items.filter((i) => i.done).length;
  const answerCell = (it, i) => it.done
    ? `<div class="px-3 py-2"><p class="text-sm text-gray-800">${it.file ? `<span class="inline-flex items-center gap-1.5">${I("image", "size-4 text-gray-500")}${it.file}</span>` : esc(it.answer)}</p>${answered ? "" : `<p class="${R.caption} mt-1 flex items-center gap-1">${I("check", "size-3.5 text-blue-600")}Response recorded · Nina Flores, Sep 23</p>`}</div>`
    : `<div class="relative"><textarea class="block w-full min-h-[84px] resize-none bg-transparent px-3 pt-2 pb-10 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:bg-blue-50/40" placeholder="Type your answer…" aria-label="Answer to item ${i + 1}" data-ir-answer>${esc(it.draft)}</textarea>
      <div class="absolute bottom-2 end-2" data-ir-submit ${it.draft ? "" : "hidden"}${it.draft ? chg("Submit shows only once an answer has text: no greyed-out button and no “Not submitted” label, so the grid has one blue button at a time.") : ""}>${button("Submit", { v: "solid", s: "xs" })}</div></div>`;
  return psec("Respond to this information request", `
    ${answered ? `<div class="mb-2">${infoRow("circle-check", "All 3 items answered. Asha sent them to MetLife on Sep 25 at 10:42 AM. The claim is back in review.", { tone: "blue" })}</div>` : ""}
    ${V4 ? `<div${chg4("The claim's facts are a small read-only table named Claim in its grey header band, like the claim lines under it, instead of a grey label over a box")}>${fieldTable([["Patient", "Liam Carter"], ["Payer", "MetLife Dental"], ["Service date", "Jun 30, 2026"], ["Reference", "MET-7730418"]].map(([label, value]) => ({ label, value, type: "none" })), { title: "Claim", labelW: 120, head: true, columns: v4BandCols("Claim", 120) })}</div>`
      : `<p class="${R.eyebrow} mb-1.5">Claim</p>
    <div${chg("The claim is said once: the sentence repeating patient, date and amount is gone, and so is the Amount row (the Total under the lines says it).")}>${kvTable([["Patient", "Liam Carter"], ["Payer", "MetLife Dental"], ["Service date", "Jun 30, 2026"], ["Reference", `<span class="tabular-nums">MET-7730418</span>`]], { cols: 2 })}</div>`}
    <div class="mt-3" data-ir-claim${chg("The claim lines use the claim form's compact grid: 28px rows and a small uppercase header band, so the headers no longer read like data.")}></div>
    <p class="${R.eyebrow} mt-5 mb-1.5">What MetLife asked for</p>
    <div class="${R.tableBox}"><div class="overflow-x-auto" data-scroll-ok><table class="table-fixed w-full border-separate border-spacing-0" data-kept="1">
      <colgroup><col style="width:46%"><col></colgroup>
      <thead><tr><th class="${IR_BAND} border-e"${chg("The “#” column is gone; the questions keep their order.")}>What Asha needs</th><th class="${IR_BAND}">Your answer</th></tr></thead>
      <tbody>${items.map((it, i) => `<tr><td class="${spreadCell}"><p class="text-gray-800 leading-snug">${esc(it.q)}</p><p class="${R.caption} mt-1">${esc(it.req)}</p></td><td class="border-b border-gray-200/80 p-0 align-top">${answerCell(it, i)}</td></tr>`).join("")}</tbody></table></div></div>`,
    { count: `<span data-tip="Asha sends the answers to MetLife once all are in."${answered ? "" : chg("“1 of 3 answered” is the section's count; what happens next shows on hover.")}>${nDone} of ${items.length}</span>`, actions: button("View claim", { v: "white", s: "xs", icon: "external-link" }) });
}
function irResponder(answered) {
  if (V2) return irResponderV2(answered);
  const items = IR_ITEMS.map((it) => ({ ...it, done: answered || it.done }));
  const nDone = items.filter((i) => i.done).length;
  const quad = (a, b, c, d) => `<tr><td class="${spreadCell} text-gray-500">${a}</td><td class="${spreadCell}">${b}</td><td class="${spreadCell} text-gray-500">${c}</td><td class="${spreadCell} !border-e-0">${d}</td></tr>`;
  const procs = [["D3330", "Root canal, molar", "#30", 1150], ["D2950", "Core buildup", "#30", 295], ["D2740", "Crown, porcelain/ceramic", "#30", 1250]];
  const answerCell = (it, i) => it.done
    ? `<div class="px-3 py-2"><p class="text-sm text-gray-800">${it.file ? `<span class="inline-flex items-center gap-1.5">${I("image", "size-4 text-gray-500")}${it.file}</span>` : esc(it.answer)}</p><p class="${R.caption} mt-1 flex items-center gap-1">${I("check", "size-3.5 text-blue-600")}Response recorded · Nina Flores, ${it.file ? "Sep 23" : "Sep 25"}</p></div>`
    : `<div class="relative"><textarea class="block w-full min-h-[84px] resize-none bg-transparent px-3 pt-2 pb-10 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden focus:bg-blue-50/40" placeholder="Type your answer…" aria-label="Answer to item ${i + 1}">${esc(it.draft)}</textarea>
      <div class="absolute bottom-2 end-2 flex items-center gap-1.5">${it.draft ? "" : `<span class="${R.caption}">Not submitted</span>`}${button("Submit", { v: "solid", s: "xs", attrs: it.draft ? "" : "disabled" })}</div></div>`;
  /* Both spreadsheets are boxed (rule 5): full border, 8px corners, inside the section padding */
  return psec("Respond to this information request", `
    <p class="${R.help} -mt-1 mb-3">For the MetLife claim for Liam Carter, service Jun 30, 2026, ${money(2695)}. ${answered ? "" : `${nDone} of ${items.length} answered. Asha sends them to MetLife once all are in.`}</p>
    ${answered ? `<div class="mb-2">${infoRow("circle-check", "All 3 items answered. Asha sent them to MetLife on Sep 25 at 10:42 AM. The claim is back in review.", { tone: "blue" })}</div>` : ""}
    <p class="${R.eyebrow} mb-1.5">Claim</p>
    <div class="${R.tableBox}"><div class="overflow-x-auto" data-scroll-ok><table class="table-fixed border-separate border-spacing-0">
      <colgroup><col style="width:112px"><col><col style="width:112px"><col style="width:140px"></colgroup>
      <tbody>${quad("Patient", "Liam Carter", "Payer", "MetLife Dental")}${quad("Amount", `<span class="tabular-nums">${money(2695)}</span>`, "Reference", `<span class="tabular-nums">MET-7730418</span>`)}
      <tr>${["Code", "Procedure", "Tooth", "Fee"].map((h, i) => `<th scope="col" class="${spreadHead} ${i === 3 ? "!border-e-0 !text-end" : ""}">${h}</th>`).join("")}</tr>
      ${procs.map(([c, d, t, f]) => `<tr><td class="${spreadCell} tabular-nums">${c}</td><td class="${spreadCell}">${d}</td><td class="${spreadCell} tabular-nums">${t}</td><td class="${spreadCell} !border-e-0 text-end tabular-nums">${money(f)}</td></tr>`).join("")}</tbody>
      <tfoot><tr><td colspan="3" class="px-3 h-9 border-e text-sm font-medium text-gray-800">Total</td><td class="px-3 h-9 text-end text-sm font-semibold tabular-nums">${money(procs.reduce((a, p) => a + p[3], 0))}</td></tr></tfoot></table></div></div>
    <p class="${R.eyebrow} mt-5 mb-1.5">What MetLife asked for</p>
    <div class="${R.tableBox}"><div class="overflow-x-auto" data-scroll-ok><table class="table-fixed border-separate border-spacing-0">
      <colgroup><col style="width:44px"><col style="width:42%"><col></colgroup>
      <thead><tr><th class="${R.tHead} !h-9 border-e">#</th><th class="${R.tHead} !h-9 border-e">What Asha needs</th><th class="${R.tHead} !h-9">Your answer</th></tr></thead>
      <tbody>${items.map((it, i) => `<tr><td class="${spreadCell} tabular-nums text-gray-500">${i + 1}</td><td class="${spreadCell}"><p class="text-gray-800 leading-snug">${esc(it.q)}</p><p class="${R.caption} mt-1">${esc(it.req)}</p></td><td class="border-b border-gray-200/80 p-0 align-top">${answerCell(it, i)}</td></tr>`).join("")}</tbody></table></div></div>`,
    { actions: button("View claim", { v: "white", s: "xs", icon: "external-link" }) });
}
defineBlock({
  cat: "tasks", id: "tasks-info-request", title: "Information request responder",
  note: "MetLife asked three questions before it will pay a crown. The claim sits above as a small spreadsheet, then one grid of what Asha needs, with the answer typed right in the cell and a small Submit in its corner.",
  where: "Tasks › an information request",
  states: ["Waiting on you", "Answered"],
  canvas: "bare",
  html: (state) => { const t = TASKS[1], done = state === "Answered";
    if (V4) return `<div class="flex min-h-[720px]">${faded(taskSlice("t2", done))}${v4TaskPanel(t, done, { w: 700, pos: "2 of 12", subtitle: "Created Sep 22 by Asha from MetLife's request",
      body: `${psec("", v4TaskFacts(t, done, "Sep 29, 2026", true))}
        ${psec("Description", `<p class="text-sm leading-6 text-gray-800">MetLife paid the root canal and buildup but is holding the crown on #30 until it gets these answers. If they don't hear back by Oct 5, they close the claim and Liam owes the full crown.</p>`)}
        ${irResponder(done)}` })}</div>`;
    if (V2) return `<div class="flex min-h-[720px]">${faded(taskSlice("t2", done))}${taskPanelV2(t, done, { w: 700, pos: "2 of 12", subtitle: "Created Sep 22 by Asha from MetLife's request",
      body: `${psec("", `<div${chg("The “Pending ▾” status row is gone: the circle check is the status, as in the real task panel. Due moved into the facts.")}>${metaGrid([["Assignee", person(t.who)], ["Urgency", urgency(t.urg)], ["Type", tag(t.type, "tagGray")], ["Patient", patientLink(t.pt)], ["Due", "Sep 29, 2026"]], 3)}</div>`)}
        ${psec("Description", `<p class="text-sm leading-6 text-gray-800">MetLife paid the root canal and buildup but is holding the crown on #30 until it gets these answers. If they don't hear back by Oct 5, they close the claim and Liam owes the full crown.</p>`)}
        ${irResponder(done)}` })}</div>`;
    return `<div class="flex min-h-[720px]">${faded(taskSlice("t2", done))}${panel("w-[700px]", `${panelTop("2 of 12")}
      <div class="grow overflow-y-auto">
        <div class="flex items-start gap-3 px-5 pt-4 pb-4"><div class="pt-0.5">${checkCtl(done, "Mark task complete", "size-6")}</div>
          <div class="min-w-0"><h2 class="text-lg font-semibold leading-snug text-gray-800">${esc(t.title)}</h2><p class="${R.caption} mt-0.5">Created Sep 22 by Asha from MetLife's request</p></div></div>
        ${statusLine(done ? TASK_STATUS.resolved : TASK_STATUS.pending, done ? "Due Sep 29, 2026 · done Sep 25" : "Due Sep 29, 2026 · 4 days left")}
        ${psec("", metaGrid([["Assignee", person(t.who)], ["Urgency", urgency(t.urg)], ["Type", tag(t.type, TYPE_TONE[t.type])], ["Patient", patientLink(t.pt)]], 4))}
        ${psec("Description", `<p class="text-sm leading-6 text-gray-800">MetLife paid the root canal and buildup but is holding the crown on #30 until it gets these answers. If they don't hear back by Oct 5, they close the claim and Liam owes the full crown.</p>`)}
        ${irResponder(done)}
      </div>`)}</div>`; },
  mount: (el) => {
    if (!V2) return;
    if (V4) { wireChecks(el); v4WireTask(el); }
    const host = el.querySelector("[data-ir-claim]");
    if (host) new Grid(host, { preset: "form", title: "Claim lines", rows: IR_PROCS.map(([code, desc, tooth, fee], i) => ({ id: i, code, desc, tooth, fee })),
      columns: [{ key: "code", label: "Code", w: 84, kind: "text", render: (r) => `<span class="tabular-nums">${r.code}</span>` }, { key: "desc", label: "Procedure", w: 300, kind: "text" },
        { key: "tooth", label: "Tooth", w: 72, kind: "text", render: (r) => `<span class="tabular-nums">${r.tooth}</span>` }, { key: "fee", label: "Fee", w: 112, num: true, kind: "money", render: (r) => money(r.fee) }],
      foot: ["Total", "", "", money(IR_PROCS.reduce((a, p) => a + p[3], 0))] });
    el.addEventListener("input", (e) => { const ta = e.target.closest("[data-ir-answer]"); if (!ta) return; const sb = ta.parentElement.querySelector("[data-ir-submit]"); if (sb) sb.hidden = !ta.value.trim(); });
  }
});

/* ============================================================ 4. Lists workbench */
const QUEUES = [["Hygiene recall", "sparkles", 148], ["Reschedule", "calendar-x", 23], ["Unscheduled treatment", "clipboard-list", 12], ["Reactivation", "user-round-plus", 212], ["New patients", "user-plus", 9], ["Post-op follow-up", "heart-pulse", 6], ["ASAP / waitlist", "timer", 14]];
const EXTRA_PEOPLE = { x1: ["Grace Mitchell", "(510) 555-0191"], x2: ["Daniel Price", "(209) 555-0126"], x3: ["Samuel Park", "(559) 555-0148"], x4: ["Zoe Martin", "(916) 555-0135"] };
const who = (id) => (DATA.patient(id) ? { name: DATA.patient(id).name, phone: DATA.patient(id).phone } : { name: EXTRA_PEOPLE[id][0], phone: EXTRA_PEOPLE[id][1] });
const UT_STATUS = { accepted: { label: "Accepted", tone: "on" }, partial: { label: "Partially accepted", tone: "mid" }, active: { label: "Active", tone: "off" } };
const daysSince = (s) => Math.round((Date.parse(TODAY) - Date.parse(s)) / 86400000);
const UT = [
  ["p13", "accepted", "Implant #19, crown #19", "Phase 1 · Implant body", "2026-07-22", 1180, 2170, "Priya Shah", "pr1", 3],
  ["p5", "accepted", "Deep cleaning, 4 quadrants", "Phase 1 · Right side", "2026-08-14", 832, 208, "Priya Shah", "pr3", 1],
  ["x1", "accepted", "Crown #3, core buildup #3", "Phase 1 · Crown prep", "2026-09-02", 772.5, 772.5, "Priya Shah", "pr1", 0],
  ["p2", "partial", "Crown #30, crown #31", "Phase 2 · Crown #31", "2026-06-30", 625, 625, "Dana Cole", "pr2", 2],
  ["p8", "accepted", "Root canal #14, crown #14", "Phase 1 · Root canal", "2026-09-10", 1340, 1060, "Priya Shah", "pr2", 0],
  ["x3", "accepted", "Implant #30", "Phase 1 · Implant body", "2026-05-19", 1050, 1050, "Dana Cole", "pr1", 3],
  ["p6", "partial", "Fillings #4 DO, #5 O", "Phase 2 · #5 occlusal", "2025-12-02", 148, 37, "Priya Shah", "pr2", 1],
  ["p10", "accepted", "Night guard", "Phase 1 · Impressions", "2026-02-25", 0, 450, "Dana Cole", "pr1", 2],
  ["x2", "active", "Extraction #32", "Phase 1 · Extraction", "2026-08-28", 148, 37, "", "pr2", 0],
  ["p1", "active", "Filling #19 MO", "Phase 1 · Filling", "2026-03-12", 188, 47, "", "pr1", 1],
  ["x4", "active", "Sealants #2, #15, #18, #31", "Phase 1 · Sealants", "2026-04-07", 220, 0, "", "pr3", 0],
  ["p15", "active", "Upper denture reline", "Phase 1 · Reline", "2026-01-09", 180, 245, "", "pr2", 3]
].map(([pid, status, tx, next, plan, ins, pt, owner, prov, attempts], i) => ({ id: "u" + i, pid, ...who(pid), status, tx, next, plan, age: daysSince(plan), ins, pt, owner, prov, attempts }));
const utCols = () => [
  { key: "name", label: "Contact", icon: "user", w: 184, kind: "text", open: true, lead: (r) => avatar(r.name, { size: 5 }), render: (r) => esc(r.name) },
  { key: "phone", label: "Phone", icon: "phone", w: 150, kind: "text", render: (r) => `<span class="tabular-nums">${esc(r.phone)}</span>` },
  { key: "status", label: "Status", icon: "circle-dot", w: 164, kind: "text", value: (r) => UT_STATUS[r.status].label, render: (r) => statusDot(UT_STATUS[r.status].label, UT_STATUS[r.status].tone) },
  { key: "tx", label: "Treatment", icon: "clipboard-list", w: 216, kind: "text", render: (r) => esc(r.tx) },
  { key: "next", label: "Next phase", icon: "arrow-right", w: 200, kind: "text", render: (r) => `<span class="text-gray-600">${esc(r.next)}</span>` },
  { key: "age", label: "Age", icon: "hourglass", w: 100, num: true, kind: "num", render: (r) => `${r.age} <span class="text-gray-500">days</span>` },
  { key: "ins", label: "Plan ins. est.", w: 128, num: true, kind: "money", render: (r) => (r.ins ? money(r.ins) : `<span class="text-gray-400">$0.00</span>`) },
  { key: "pt", label: "Plan patient est.", w: 140, num: true, kind: "money", render: (r) => (r.pt ? money(r.pt) : `<span class="text-gray-400">$0.00</span>`) },
  { key: "owner", label: "Owner", icon: "user-round", w: 148, kind: "text", render: (r) => (r.owner ? person(r.owner) : `<span class="text-gray-400">Unassigned</span>`) }
];
/* v2: front desk sorts by value and age, so those columns come right after Contact and Treatment; Phone goes last */
const utColsV2 = () => { const by = Object.fromEntries(utCols().map((c) => [c.key, c]));
  return [{ ...by.name, w: 200, label: `<span${chg("Columns are reordered so the plan estimates, Age and Owner are on screen; Phone moved to the end, and Contact is wide enough for full names.")}>Contact</span>` }, by.tx, { ...by.pt, w: 128 }, { ...by.ins, w: 120 }, { ...by.age, w: 96 }, by.owner, by.status, by.next, by.phone]; };
/* v4: Owner is a cell you pick right in the list; everything else stays as the treatment plan says */
const UT_OWNERS = [{ value: "Priya Shah", label: "Priya Shah" }, { value: "Dana Cole", label: "Dana Cole" }, { value: "", label: "Unassigned" }];
/* v4: the queue shows what a caller works from (who, what, what they'd pay, how old, whose call); status, the next phase,
 * the phone and the insurance estimate open in a card when you point at the row */
const v4UtCols = () => { const by = Object.fromEntries(utColsV2().map((c) => [c.key, c]));
  return [{ ...by.name, label: `<span${chg4("The queue keeps the five columns a caller works from: who, the treatment, what the patient would pay, how old the plan is and whose call it is. Status, next phase, phone and the insurance estimate moved into a card that opens when you point at the row.")}>Contact</span>` },
    { ...by.tx, w: 236 }, { ...by.pt, w: 140 }, by.age, { ...by.owner, edit: "select", options: UT_OWNERS, placeholder: () => "Unassigned" }]; };
const v4UtPeek = (r) => peekCard(esc(r.name), [["Status", statusDot(UT_STATUS[r.status].label, UT_STATUS[r.status].tone)], ["Next phase", esc(r.next)], ["Phone", `<span class="tabular-nums">${esc(r.phone)}</span>`],
  [MONEY_LABEL.insEst, `<span class="tabular-nums">${money(r.ins)}</span>`], ["Provider", DATA.provider(r.prov).name]]);
const PLAN_PERIODS = ["Any time", "Last 90 days", "Last 6 months", "Last 12 months"], PLAN_DAYS = [Infinity, 90, 182, 365];
const UT_TABS = [["All", () => true], ["Accepted", (r) => r.status === "accepted"], ["Partially accepted", (r) => r.status === "partial"], ["Active", (r) => r.status === "active"]];
const queueNav = (on) => `<nav class="h-full border-e border-gray-200/80 p-3"${chg(FRAME_NOTE)} aria-label="Queues"><p class="${R.navGroup} !pt-1">Queues</p>${QUEUES.map(([q, ic, n]) => `<a class="${q === on ? R.navItemOn : R.navItem}" ${q === on ? 'aria-current="page"' : ""}>${I(ic)}<span class="truncate">${q}</span><span class="ms-auto text-xs ${q === on ? "text-gray-600" : "text-gray-400"} tabular-nums">${n}</span></a>`).join("")}
  <p class="${R.navGroup}">Saved views</p><a class="${R.navItem}">${I("bookmark")}<span class="truncate">Implants over $2k</span></a><a class="${R.navItem}">${I("bookmark")}<span class="truncate">My callbacks this week</span></a></nav>`;
defineBlock({
  cat: "tasks", id: "tasks-lists-workbench", title: "Lists workbench",
  note: "Lists: work queues on the left with counts, the open queue's tabs, and the grid. Unscheduled treatment shows who has accepted work that isn't booked yet and what it's worth. Tabs filter; click a name for the call sheet.",
  where: "PMS › Lists › Unscheduled treatment",
  states: ["Normal", "Loading"],
  canvas: "bare",
  html: (state) => V2 ? `${workspaceHeader({ parent: "Lists", title: `Unscheduled treatment<button type="button" class="ms-1 inline-flex size-5 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 align-middle" data-tip="Accepted or active treatment that has not been scheduled yet." aria-label="Accepted or active treatment that has not been scheduled yet."${chg("The help line above the tabs is gone; it shows when you point at the (i) after the title.")}>${I("info", "size-3.5")}</button>`, actions: `${button("Print list", { v: "quiet", s: "sm", icon: "printer" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
    <div class="grid grid-cols-[${NAV_W}px_1fr]">
      ${queueNav("Unscheduled treatment")}
      <div class="min-w-0 px-4 pb-4">
        <div data-ut-tabs>${tabsWithSlot(UT_TABS.map(([l, f]) => [l, UT.filter(f).length]), 0, "", "", { gutter: PG })}</div>
        ${state === "Loading" ? `<div class="py-2.5 flex gap-2">${skel("w-44", "h-8")}${skel("w-44", "h-8")}${skel("w-28", "h-8")}</div>${gridSkeleton(V4 ? ["Contact", "Treatment", "Plan patient est.", "Age", "Owner"] : ["Contact", "Treatment", "Plan patient est.", "Plan ins. est.", "Age", "Owner"], 8, { gutter: PG })}` : `<div data-grid="ut" data-ri${chg4("Owner is a cell you pick right in the list, so handing out the calls doesn't mean opening each patient.")}></div>`}
      </div>
    </div>`
    : `${workspaceHeader({ parent: "Lists", title: "Unscheduled treatment", actions: `${button("Print list", { v: "quiet", s: "sm", icon: "printer" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
    <div class="grid grid-cols-[252px_1fr]">
      ${queueNav("Unscheduled treatment")}
      <div class="min-w-0 px-4 pb-4">
        <p class="${R.help} pt-3">Accepted or active treatment that has not been scheduled yet.</p>
        <div data-ut-tabs>${tabsWithSlot(UT_TABS.map(([l, f]) => [l, UT.filter(f).length]), 0, button("Plan date: any time", { v: "white", s: "sm", icon: "calendar", iconEnd: "chevron-down", cls: "[&_svg:last-child]:text-gray-400" }), "")}</div>
        ${state === "Loading" ? `<div class="py-2.5 flex gap-2">${skel("w-32", "h-8")}${skel("w-48", "h-8")}${skel("w-24", "h-8")}</div>${gridSkeleton(["Contact", "Phone", "Status", "Treatment", "Next phase"], 8)}` : `<div data-grid="ut" data-ri></div>`}
      </div>
    </div>`,
  mount: (el) => {
    const host = el.querySelector('[data-grid="ut"]'); if (!host) return;
    let tab = 0, maxAge = Infinity; const rowsNow = () => UT.filter(UT_TABS[tab][1]).filter((r) => r.age <= maxAge);
    const g = new (ListGrid())(host, Object.assign({ columns: V4 ? v4UtCols() : V2 ? utColsV2() : utCols(), rows: UT, title: "All unscheduled treatment", searchPlaceholder: "Search patients", maxHeight: 440, defaultSort: { key: "age", dir: -1 }, calc: { ins: "sum", pt: "sum" },
      filters: [{ key: "owner", label: "Owner", options: [{ value: "Priya Shah", label: "Priya Shah" }, { value: "Dana Cole", label: "Dana Cole" }, { value: "", label: "Unassigned" }] }, { key: "prov", label: "Provider", options: DATA.providers.map((p) => ({ value: p.id, label: p.name })) }],
      empty: { icon: "clipboard-list", title: "No unscheduled treatment found", body: "Accepted plans that aren't booked show up here." },
      bulk: [{ label: "Assign owner", icon: "user-round" }, { label: "Send text", icon: "message-square" }, { label: "Snooze", icon: "alarm-clock" }, { label: "Export", icon: "download" }],
      onOpen: (r) => { Sheet.open({ title: esc(r.name), lead: avatar(r.name, { size: 9 }), marks: V4 ? v4UtMarks(r) : "", subtitle: `Unscheduled treatment · <span class="tabular-nums">${esc(r.phone)}</span>`, actions: V4 ? "" : iconButton("ellipsis", V2 ? "More: snooze, close work" : "Record actions", { s: "iconSm" }), body: callBody(r, r.attempts >= 3, r.attempts), footer: callFooter(r.attempts >= 3, r), flush: true }); } },
      V4 ? { sheet: true, peek: v4UtPeek, calc: { pt: "sum" } } : {}, V2 ? { noun: "patients", periods: PLAN_PERIODS, period: 0, periodLabel: (i) => `Plan date: ${PLAN_PERIODS[i].toLowerCase()}`, onPeriod: (i, grid) => { maxAge = PLAN_DAYS[i]; grid.setRows(rowsNow()); } } : {}));
    wireTabs(el.querySelector("[data-ut-tabs]"), (i) => { tab = i; g.o.title = i ? UT_TABS[i][0] : "All unscheduled treatment"; g.setRows(V2 ? rowsNow() : UT.filter(UT_TABS[i][1])); g.render(); });
  }
});

/* ============================================================ 5. Call sheet */
const OUTCOMES = ["No answer", "Left voicemail", "Delivery failed", "Delivered, no response yet", "Reached recipient", "Declined follow-up", "Callback agreed"];
const quick = () => `<div class="flex items-center gap-1.5">${[["phone", "Call"], ["message-square", "Text"], ["mail", "Email"], ["calendar-plus", "Schedule"]].map(([ic, l]) => iconButton(ic, l, { v: "white", s: "iconSm" })).join("")}</div>`;
/* v2: no status row (an open item is never unusual); attempts are a fact in Follow-up; notes only when there are some */
const logOutcome = () => psec("Log an outcome", `<div class="space-y-3">
      <div class="space-y-1.5"><span class="${R.label}">How</span><div>${segmented(["Phone", "Text message", "Email", "In person"], 0, { sm: true })}</div></div>
      <div class="grid grid-cols-2 gap-3"><div class="space-y-1.5"><span class="${R.label}">Outcome</span><button type="button" class="${R.select}" aria-haspopup="listbox"><span class="text-gray-400">Pick an outcome</span>${I("chevrons-up-down")}</button></div>
        <div class="space-y-1.5"><span class="${R.label}">Follow up on</span><button type="button" class="${R.select}"><span class="inline-flex items-center gap-2">${I("calendar", "!text-gray-500")}Oct 2, 2026</span>${I("chevron-down")}</button></div></div>
      <textarea class="${R.textarea} !min-h-16" placeholder="What did they say? (optional)" aria-label="Note"></textarea></div>`);
function callBodyV2(r, limit, tries) {
  const last = tries ? `${limit ? "No answer" : "Left voicemail"} · ${limit ? "Sep 24" : "Sep 22"}` : '<span class="text-gray-400">No contact logged yet</span>';
  const attempts = limit ? alertMark("3 of 3", "Attempt limit reached. Review the Journal history before more outreach. He asked us to call after 4 PM.", { action: button("Open full Journal history", { v: "white", s: "xs" }), align: "start" })
    : `<span class="tabular-nums">${tries} of 3</span>`;
  return `${psec("Treatment plan", metaGrid([["Plan", esc(r.tx)], ["Status", statusDot(UT_STATUS[r.status].label, UT_STATUS[r.status].tone)], ["Next phase", esc(r.next)], ["Provider", DATA.provider(r.prov).name], ["Plan date", `${fmtDateY(r.plan)} <span class="text-gray-500">· ${r.age} days</span>`], ["Value", `<span class="tabular-nums">${money(r.ins + r.pt)}</span>`], ["Plan ins. est.", `<span class="tabular-nums">${money(r.ins)}</span>`], ["Plan patient est.", `<span class="tabular-nums">${money(r.pt)}</span>`]], 2))}
    ${psec("Follow-up", `<div${chg("The “● Open ▾” status row is gone (an open item is never unusual). Attempts are a fact in Follow-up, and the empty “No notes” line is gone.")}>${metaGrid([["Last contact", last], ["Owner", r.owner ? person(r.owner) : '<span class="text-gray-400">Unassigned</span>'], ["Attempts", attempts], ...(limit ? [["Next follow-up", "Oct 1, 2026"], ["Channel", "Phone"]] : [])], 2)}
      ${limit ? `<p class="mt-3 text-sm text-gray-800">Wants to wait until his FSA resets in January. Asked us to call after 4 PM.</p>` : ""}</div>`)}
    ${logOutcome()}`;
}
function callBody(r, limit, tries = limit ? 3 : 0) {
  if (V4) return v4CallBody(r, limit, tries);
  if (V2) return callBodyV2(r, limit, tries);
  const last = tries ? `${limit ? "No answer" : "Left voicemail"} · ${limit ? "Sep 24" : "Sep 22"}` : '<span class="text-gray-400">No contact logged yet</span>';
  /* Status on one line; the attempt limit is an inline mark whose full reason and action open on hover */
  const right = limit ? alertMark("3 of 3 attempts", "Attempt limit reached. Review the Journal history before more outreach. He asked us to call after 4 PM.", { action: button("Open full Journal history", { v: "white", s: "xs" }) })
    : `<span class="text-[13px] text-gray-500">${tries} of 3 attempts</span>`;
  return `<section class="${R.psec} flex items-center justify-between gap-3 !py-3"><button type="button" class="${cx(R.btn, R.sm, R.white, "!ps-2.5")}" aria-haspopup="menu" aria-label="Change work status"><span class="${cx(R.dot, TONE_DOT.on)}"></span>Open${I("chevron-down", "!text-gray-400")}</button>${right}</section>
    ${psec("Treatment plan", metaGrid([["Plan", esc(r.tx)], ["Status", statusDot(UT_STATUS[r.status].label, UT_STATUS[r.status].tone)], ["Next phase", esc(r.next)], ["Provider", DATA.provider(r.prov).name], ["Plan date", `${fmtDateY(r.plan)} <span class="text-gray-500">· ${r.age} days</span>`], ["Value", `<span class="tabular-nums">${money(r.ins + r.pt)}</span>`], ["Plan ins. est.", `<span class="tabular-nums">${money(r.ins)}</span>`], ["Plan patient est.", `<span class="tabular-nums">${money(r.pt)}</span>`]], 2))}
    ${psec("Follow-up", `${metaGrid([["Last contact", last], ["Owner", r.owner ? person(r.owner) : '<span class="text-gray-400">Unassigned</span>'], ...(limit ? [["Next follow-up", "Oct 1, 2026"], ["Channel", "Phone"]] : [])], 2)}
      <p class="mt-3 text-sm ${limit ? "text-gray-800" : "text-gray-400"}">${limit ? "Wants to wait until his FSA resets in January. Asked us to call after 4 PM." : "No notes"}</p>`)}
    ${psec("Log an outcome", `<div class="space-y-3">
      <div class="space-y-1.5"><span class="${R.label}">How</span><div>${segmented(["Phone", "Text message", "Email", "In person"], 0, { sm: true })}</div></div>
      <div class="grid grid-cols-2 gap-3"><div class="space-y-1.5"><span class="${R.label}">Outcome</span><button type="button" class="${R.select}" aria-haspopup="listbox"><span class="text-gray-400">Pick an outcome</span>${I("chevrons-up-down")}</button></div>
        <div class="space-y-1.5"><span class="${R.label}">Follow up on</span><button type="button" class="${R.select}"><span class="inline-flex items-center gap-2">${I("calendar", "!text-gray-500")}Oct 2, 2026</span>${I("chevron-down")}</button></div></div>
      <textarea class="${R.textarea} !min-h-16" placeholder="What did they say? (optional)" aria-label="Note"></textarea></div>`)}`;
}
/* v4: the work item's facts are a table you type into, Status first; logging an outcome is the same table of fields */
const V4_CALL_LIMIT = "Attempt limit reached. Review the Journal history before more outreach. He asked us to call after 4 PM.";
function v4CallBody(r, limit, tries) {
  const last = tries ? `${limit ? "No answer" : "Left voicemail"} · ${limit ? "Sep 24" : "Sep 22"}` : "";
  const fields = [{ label: "Status", value: "Open", type: "select", options: ["Open", "Snoozed", "Closed"], html: (f) => statusDot(f.value, f.value === "Open" ? "on" : "off") },
    { label: "Owner", value: r.owner, type: "select", options: UT_OWNERS, html: (f) => person(f.value) },
    { label: "Last contact", value: last || "-", type: "none", html: () => (last ? esc(last) : '<span class="text-gray-400">No contact logged yet</span>') },
    { label: "Attempts", value: `${tries} of 3`, type: "none", html: () => (limit ? `<span class="inline-flex items-center gap-1.5 tabular-nums"><span data-tip="${esc(V4_CALL_LIMIT)}" tabindex="0" class="inline-flex rounded-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600/30">${I("circle-alert", "size-3.5 text-orange-500")}</span>3 of 3</span>` : `<span class="tabular-nums">${tries} of 3</span>`) },
    { label: "Next follow-up", value: limit ? "Oct 1, 2026" : "", type: "text" },
    { label: "Channel", value: limit ? "Phone" : "", type: "select", options: ["Phone", "Text message", "Email", "In person"] }];
  const log = [{ label: "How", value: "Phone", type: "select", options: ["Phone", "Text message", "Email", "In person"] }, { label: "Outcome", value: "", type: "select", options: OUTCOMES },
    { label: "Follow up on", value: "Oct 2, 2026", type: "text" }];
  return `${psec("", `<div${chg4("The treatment plan is one line of a compact table: the treatment, the next step and what the patient would pay, the three things said on the call; its header band names it, like the two tables below. Its status, provider, plan date, insurance estimate and total open in a card when you point at it, instead of eight facts in a block.")}>${v4UtPlan(r)}</div>`)}
    ${psec("", `<div${chg4("The follow-up facts are a table you type into, and the work's status (Open, Snoozed, Closed) is its first line instead of a row of its own. Its name sits in the table's grey header band, like the treatment plan's column names above, instead of a title over it.")}>${fieldTable(fields, { labelW: 132, title: "Follow-up", head: true, columns: v4BandCols("Follow-up", 132) })}</div>
      ${limit ? `<p class="mt-3 text-sm text-gray-800">Wants to wait until his FSA resets in January. Asked us to call after 4 PM.</p>` : ""}`)}
    ${psec("", `<div${chg4("Logging a call is the same table of fields, named in its header band: How, Outcome and Follow up on are one line each, then the note.")}>${fieldTable(log, { labelW: 132, title: "Log an outcome", head: true, columns: v4BandCols("Log an outcome", 132) })}</div>
      <textarea class="${R.textarea} !min-h-16 mt-3" placeholder="What did they say? (optional)" aria-label="Note"></textarea>`)}`;
}
/* v4: the plan as one row of a compact table; the rest of it is on hover */
const v4UtPlan = (r) => sheetTable({ sheet: false, title: "Treatment plan", rows: [{ ...r, id: "plan" }],
  peek: (x) => peekCard(esc(x.tx), [["Status", statusDot(UT_STATUS[x.status].label, UT_STATUS[x.status].tone)], ["Phase", esc(x.next.split(" · ")[0])], ["Provider", DATA.provider(x.prov).name],
    ["Plan date", `${fmtDateY(x.plan)} <span class="text-gray-500">· ${x.age} days ago</span>`], [MONEY_LABEL.insEst, money(x.ins)], ["Total", money(x.ins + x.pt)]], "Open treatment plan is in Actions."),
  columns: [{ key: "tx", label: "Treatment", w: 150, grow: true, render: (x) => esc(x.tx) }, { key: "next", label: "Next step", w: 140, render: (x) => esc(x.next.split(" · ").pop()) },
    { key: "pt", label: "Patient est.", w: 108, num: true, render: (x) => `<span class="tabular-nums">${money(x.pt)}</span>` }] });
/* v4: a list panel is about a patient, so its header is the one patient header: alerts as one icon with the count and
 * the family balance as a wallet, by the name */
const v4UtMarks = (r) => { const p = DATA.patients.find((x) => x.name === r.name); return p ? `<span class="flex items-center gap-2"${chg4("The panel's header is the one patient header: medical alerts are one icon with the count by the name (orange when someone must act first) and the family balance a wallet with the amount")}>${patientMarks({ alerts: p.alerts, familyBalance: p.balance })}</span>` : ""; };
/* The work item's Actions menu. The quick icons (call, text, email, schedule), Open chart and the Status line
 * (which closes the work) aren't repeated here. */
const v4CallActions = (limit, r = UT[0]) => [
  { label: "Follow-up", items: [{ icon: "alarm-clock", label: "Snooze until…", hint: "Take them off the list until a date you pick", suggest: limit ? "He asked us to wait until his FSA resets in January" : "" },
    { icon: "book-open", label: "Open full Journal history", hint: "Every call, text and note for this patient", suggest: limit ? "3 of 3 tries used: read the history before calling again" : "" },
    { icon: "arrow-right-left", label: "Move to another list", hint: "Reactivation, ASAP list or recall" }, { icon: "link", label: "Copy link", hint: "To paste in a message to a teammate" }] },
  { label: "Treatment plan", items: [{ icon: "clipboard-list", label: "Open treatment plan", hint: `${r.tx} · ${DATA.provider(r.prov).name}` }, { icon: "send", label: "Text the estimate", hint: "The plan and what they'd pay, to sign on their phone" },
    { icon: "shield-check", label: "Re-check benefits", hint: "See what insurance will pay now" }, { icon: "printer", label: "Print estimate" }] },
  { label: "", items: [{ icon: "circle-x", label: "Remove from this list", danger: true }] }];
const callFooter = (limit, r) => V4 ? `<div class="flex"${chg4("Snooze, Close work and the rest are in one Actions menu by Save outcome, grouped and searchable, with a sparkle on what Asha suggests now.")}>${actionsMenu(v4CallActions(limit, r), { open: V4_OPTS.open })}</div><span class="grow"></span>${button("Save outcome", { v: "solid", s: "sm" })}`
  : V2 ? `<span${chg("Logging what happened is the only button in the footer. Snooze and Close work moved to the ⋯ menu at the top.")}>${button("Save outcome", { v: "solid", s: "sm" })}</span>` : `${button("Snooze", { v: "white", s: "sm", icon: "alarm-clock" })}${button("Close work", { v: "white", s: "sm" })}${button("Save outcome", { v: "solid", s: "sm" })}`;
const listSlice = () => `${workspaceHeader({ parent: "Lists", title: "Unscheduled treatment" })}<div class="px-4">${tabsWithSlot([["All", 12], ["Accepted", 6], ["Partially accepted", 2], ["Active", 4]], 0, "", "")}
  <table class="w-full mt-3 border-separate border-spacing-0"><thead><tr><th class="${R.tHead}">Contact</th><th class="${R.tHead}">Treatment</th><th class="${R.tHead} text-end">Age</th></tr></thead><tbody>${UT.slice(0, 12).map((r, i) => `<tr${i === 0 ? ' class="bg-blue-50/70"' : ""}><td class="${R.tCell}">${esc(r.name)}</td><td class="${R.tCell} max-w-0 truncate">${esc(r.tx)}</td><td class="${R.tCell} text-end tabular-nums">${r.age}</td></tr>`).join("")}</tbody></table></div>`;
defineBlock({
  cat: "tasks", id: "tasks-call-sheet", title: "Call sheet",
  note: "The record panel every Lists queue shares: who to call, icon quick actions, the treatment, then the shared Follow-up section and a place to log what happened. After three tries it says so, and still lets you log another.",
  where: "Lists › a patient in any queue",
  states: ["No contact yet", "Attempt limit reached"],
  canvas: "bare",
  html: (state) => { const r = UT[0], limit = state !== "No contact yet";
    if (V4) return `<div class="flex min-h-[720px]">${faded(listSlice())}${sheetPanel({ w: 460, flush: true, cls: "shrink-0", title: esc(r.name), lead: avatar(r.name, { size: 10 }), marks: v4UtMarks(r),
      subtitle: `<span class="tabular-nums">${esc(r.phone)}</span> · 60 years · Cigna Dental`, actions: v4PanelNav("1 of 12"),
      body: `${psec("", `<div class="flex items-center justify-between">${quick()}${button("Open chart", { v: "white", s: "xs", iconEnd: "arrow-up-right" })}</div>`, { cls: "!py-3" })}${callBody(r, limit)}`, footer: callFooter(limit, r) })}</div>`;
    if (V2) return `<div class="flex min-h-[720px]">${faded(listSlice())}${sheetPanel({ w: 460, flush: true, cls: "shrink-0", title: esc(r.name), lead: avatar(r.name, { size: 10 }),
      subtitle: `<span class="tabular-nums">${esc(r.phone)}</span> · 60 years · Cigna Dental`,
      actions: `${panelNav("1 of 12")}${iconButton("link", "Copy link", { s: "iconSm" })}${iconButton("ellipsis", "More: snooze, close work", { s: "iconSm" })}`,
      body: `${psec("", `<div class="flex items-center justify-between">${quick()}${button("Open chart", { v: "white", s: "xs", iconEnd: "arrow-up-right" })}</div>`, { cls: "!py-3" })}${callBody(r, limit)}`, footer: callFooter() })}</div>`;
    return `<div class="flex min-h-[720px]">${faded(listSlice())}${panel("w-[460px]", `${panelTop("1 of 12")}
      <div class="grow overflow-y-auto">
        <div class="px-5 pt-4 pb-4"><div class="flex items-center gap-3">${avatar(r.name, { size: 10 })}<div class="min-w-0 grow"><h2 class="text-base font-semibold text-gray-800">${esc(r.name)}</h2><p class="text-[13px] text-gray-500"><span class="tabular-nums">${esc(r.phone)}</span> · 60 years · Cigna Dental</p></div></div>
          <div class="flex items-center justify-between mt-3">${quick()}${button("Open chart", { v: "white", s: "xs", iconEnd: "arrow-up-right" })}</div></div>
        ${callBody(r, limit)}
      </div>
      <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200/80">${callFooter()}</div>`)}</div>`; }
});

/* ============================================================ 6. Create task dialog */
/* v2: Attio's quick-task form. Title and description, then one row of 32px pickers whose label is the chosen value
 * (Assignee · Urgency · Type · Due · Patient · file), then Cancel / Create task. Same fields, about half the height. */
function createDialogV2(f, bad) {
  const set = f || bad;
  const pick = (label, value, icon, lead = "") => `<button type="button" class="${cx(R.btn, R.sm, R.white, value ? "" : "!text-gray-500")}" aria-haspopup="listbox" aria-label="${esc(label)}${value ? ": " + esc(String(value).replace(/<[^>]+>/g, "")) : ""}">${lead || I(icon, value ? "!text-gray-500" : "!text-gray-400")}${value || label}</button>`;
  return `<div class="flex justify-center pt-2 pb-4"><div class="${R.dialog}" role="dialog" aria-label="Create task"${chg("One 480px dialog with a 44px header, like every other dialog (it was 560px with a 52px header).")}>
    <div class="flex items-center justify-between h-11 px-5 border-b border-gray-200/80"><h3 class="text-base font-semibold text-gray-800">Create task</h3>${iconButton("x", "Close", { s: "iconSm", cls: "-me-2" })}</div>
    <div class="p-5 space-y-3">
      <div><input class="${bad ? R.inputBad : R.input}" placeholder="Task title" value="${f ? "Call Aetna about Olivia's deep cleaning claim" : ""}" aria-label="Title (required)" aria-required="true" />${bad ? `<div class="mt-1.5">${note("Add a title so the team knows what this task is.", "error")}</div>` : ""}</div>
      <textarea class="${R.textarea}" placeholder="Add a description" aria-label="Description">${set ? "Aetna says the perio chart never arrived. Fax it to (800) 555-0199 and ask them to reopen the claim for Aug 14." : ""}</textarea>
      <div class="flex flex-wrap items-center gap-2"${chg("Assignee, urgency, type, due date, patient and file are one row of small pickers instead of eight labelled fields: the dialog is about half as tall, and each picker shows what you chose.")}>
        ${pick("Assignee", set ? "Nina Flores" : "", "at-sign", set ? avatar("Nina Flores", { size: 5 }) : "")}
        <span${chg("“Urgency” and “Type” use the same words as the Tasks list and the task panel (this dialog said “Priority” and “Category”).")}>${pick("Urgency", `Urgency: ${set ? "High" : "Medium"}`, set ? "signal-high" : "signal-medium")}</span>
        ${pick("Type", set ? "Insurance" : "", "tag")}
        ${pick("Due date", set ? "Mon, Sep 28" : "", "calendar")}
        ${pick("Patient", set ? "Olivia Nguyen" : "", "user-round", set ? avatar("Olivia Nguyen", { size: 5 }) : "")}
        ${f ? pick("Attachment", "Aetna letter, Sep 21.pdf", "paperclip") : iconButton("paperclip", "Attach a file", { v: "white", s: "iconSm" })}
      </div>
    </div>
    <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200/80">${button(`Cancel <kbd class="${R.kbd} !border-transparent !bg-gray-100">Esc</kbd>`, { v: "white", s: "sm" })}${button(`Create task <kbd class="${R.kbd} !border-white/20 !bg-white/10 !text-white/80">⌘↵</kbd>`, { v: "solid", s: "sm" })}</div>
  </div></div>`;
}
/* v4: the dialog's choices are the same table of fields as the task panel: one line each, click or type to pick */
const V4_PATIENTS = ["Olivia Nguyen", "Emma Rodriguez", "Liam Carter", "James Ortiz", "Grace Mitchell", "Daniel Price"];
function v4CreateDialog(f, bad) {
  const set = f || bad;
  const rows = [{ label: "Assignee", value: set ? "Nina Flores" : "", type: "select", options: Object.keys(STAFF), html: (r) => person(r.value) },
    { label: "Urgency", value: set ? "High" : "Medium", type: "select", options: ["High", "Medium", "Low"], html: (r) => urgency(r.value) },
    { label: "Type", value: set ? "Insurance" : "", type: "select", options: V4_TASK_TYPES, html: (r) => tag(r.value, "tagGray") },
    { label: "Due date", value: set ? "Mon, Sep 28, 2026" : "", type: "text" },
    { label: "Patient", value: set ? "Olivia Nguyen" : "", type: "select", options: V4_PATIENTS, html: (r) => person(r.value) },
    { label: "Attachment", value: f ? "Aetna letter, Sep 21.pdf" : "", type: "none", html: (r) => (r.value ? `<span class="inline-flex items-center gap-1.5 min-w-0">${I("file-text", "size-4 shrink-0 text-gray-400")}<span class="truncate">${esc(r.value)}</span><span class="shrink-0 text-gray-400">· 184 KB</span></span>`
      : `<button type="button" data-act="attach" class="inline-flex items-center gap-1.5 text-gray-400 hover:text-gray-600 cursor-pointer">${I("paperclip", "size-3.5")}Attach a file</button>`) }];
  return `<div class="flex justify-center pt-2 pb-4"><div class="${R.dialog}" role="dialog" aria-label="Create task">
    <div class="flex items-center justify-between h-11 px-5 border-b border-gray-200/80"><h3 class="text-base font-semibold text-gray-800">Create task</h3>${iconButton("x", "Close", { s: "iconSm", cls: "-me-2" })}</div>
    <div class="p-5 space-y-3">
      <div><input class="${bad ? R.inputBad : R.input}" placeholder="Task title" value="${f ? "Call Aetna about Olivia's deep cleaning claim" : ""}" aria-label="Title (required)" aria-required="true" />${bad ? `<div class="mt-1.5">${note("Add a title so the team knows what this task is.", "error")}</div>` : ""}</div>
      <textarea class="${R.textarea}" placeholder="Add a description" aria-label="Description">${set ? "Aetna says the perio chart never arrived. Fax it to (800) 555-0199 and ask them to reopen the claim for Aug 14." : ""}</textarea>
      <div${chg4("Who, how urgent, what kind, when, the patient and a file are one table of fields, the same as in the task panel: click a line (or tab to it and type) to pick.")}>${fieldTable(rows, { labelW: 120, title: "New task" })}</div>
    </div>
    <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200/80">${button(`Cancel <kbd class="${R.kbd} !border-transparent !bg-gray-100">Esc</kbd>`, { v: "white", s: "sm" })}${button(`Create task <kbd class="${R.kbd} !border-white/20 !bg-white/10 !text-white/80">⌘↵</kbd>`, { v: "solid", s: "sm" })}</div>
  </div></div>`;
}
defineBlock({
  cat: "tasks", id: "tasks-create-dialog", title: "Create task dialog",
  note: "A small dialog near the top of the screen. Title and description first, then who, how urgent, what kind, and when. Patient and a file are optional. A missing title says so under the field and never greys out the button.",
  where: "Tasks › Create task",
  states: ["Blank", "Filled", "Missing title"],
  canvas: "gray",
  html: (state) => { const f = state === "Filled", bad = state === "Missing title";
    if (V4) return v4CreateDialog(f, bad);
    if (V2) return createDialogV2(f, bad);
    const field = (label, inner, req) => `<div class="space-y-1.5"><label class="${R.label}">${label}${req ? ' <span class="text-gray-400 font-normal">required</span>' : ""}</label>${inner}</div>`;
    const sel = (v, ph, icon) => `<button type="button" class="${R.select}">${v ? `<span class="inline-flex items-center gap-2 min-w-0">${v}</span>` : `<span class="inline-flex items-center gap-2 text-gray-400">${icon ? I(icon, "!text-gray-400") : ""}${ph}</span>`}${I("chevrons-up-down")}</button>`;
    return `<div class="flex justify-center pt-2 pb-4"><div class="${R.dialog} !w-[560px]" role="dialog" aria-label="Create task">
      <div class="flex items-center justify-between h-13 px-5 border-b border-gray-200/80"><h3 class="text-base font-semibold text-gray-800">Create task</h3>${iconButton("x", "Close", { s: "iconSm" })}</div>
      <div class="p-5 space-y-4">
        ${field("Title", `<input class="${bad ? R.inputBad : R.input}" placeholder="Enter task title" value="${f ? "Call Aetna about Olivia's deep cleaning claim" : ""}" aria-label="Title" />${bad ? note("Add a title so the team knows what this task is.", "error") : ""}`, true)}
        ${field("Description", `<textarea class="${R.textarea}" placeholder="Enter task description" aria-label="Description">${f || bad ? "Aetna says the perio chart never arrived. Fax it to (800) 555-0199 and ask them to reopen the claim for Aug 14." : ""}</textarea>`, true)}
        <div class="grid grid-cols-2 gap-4">
          ${field("Assignee", sel(f || bad ? person("Nina Flores") : "", "Pick a teammate", "user-round"))}
          ${field("Priority", `<div>${segmented(["Low", "Medium", "High"], f || bad ? 2 : 1)}</div>`)}
          ${field("Category", sel(f || bad ? `${I("receipt", "!text-gray-500")}Revenue Cycle · Insurance` : "", "Pick a category", "tag"))}
          ${field("Due date", sel(f || bad ? `${I("calendar", "!text-gray-500")}Mon, Sep 28, 2026` : "", "No due date", "calendar"))}
        </div>
        ${field("Patient <span class=\"text-gray-400 font-normal\">optional</span>", f || bad ? `<div class="flex items-center gap-2 h-9 px-2 border border-gray-200 rounded-lg shadow-2xs"><span class="inline-flex items-center gap-1.5 h-6 ps-1 pe-1 rounded-md bg-gray-100 text-[13px] text-gray-800">${avatar("Olivia Nguyen", { size: 5 })}Olivia Nguyen <span class="text-gray-500">· Jan 30, 1969</span>${iconButton("x", "Remove patient", { s: "iconXs", cls: "!size-5" })}</span></div>` : searchBox("Search patients…", { w: "w-full" }).replace(R.search, R.input + " !ps-8"))}
        ${field("Attachment <span class=\"text-gray-400 font-normal\">optional</span>", f ? `<div class="flex items-center gap-3 h-11 px-3 border border-gray-200/80 rounded-lg"><span class="flex size-7 items-center justify-center rounded-md bg-gray-100 text-gray-500">${I("file-text", "size-4")}</span><div class="min-w-0 grow"><p class="text-sm text-gray-800 truncate">Aetna letter, Sep 21.pdf</p><p class="${R.caption}">184 KB</p></div>${iconButton("x", "Remove file", { s: "iconXs" })}</div>`
          : `<div class="flex items-center justify-center gap-2 h-14 rounded-lg border border-dashed border-gray-300 text-[13px] text-gray-500">${I("upload", "size-4 text-gray-400")}Drop a file here or <button type="button" class="${cx(R.btn, R.link, "text-[13px]")}">browse</button></div>`)}
      </div>
      <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200/80">${button(`Cancel <kbd class="${R.kbd} !border-transparent !bg-gray-100">Esc</kbd>`, { v: "white", s: "sm" })}${button(`Create task <kbd class="${R.kbd} !border-white/20 !bg-white/10 !text-white/80">⌘↵</kbd>`, { v: "solid", s: "sm" })}</div>
    </div></div>`; }
});

})();
