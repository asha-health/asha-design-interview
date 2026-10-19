/* Forms & documents blocks. Labels from routes/practice/forms (FormsDashboard, FormsListTable, FormBuilder,
 * FormBuilderFieldPropertiesEditor, FormResponses, ShareFormModal) and routes/practice/documents (DocumentsView,
 * DocumentOrganizationPrepareTable, documentTypes). INVENTORY.md §10. */
(() => {

/* ---------- local helpers ---------- */
const FORM_CAT = { Registration: "tagBlue", Clinical: "tagTeal", Insurance: "tagIndigo", Legal: "tagGray", Feedback: "tagOutline" };
const FORM_STATUS = { pub: { label: "Published", tone: "on" }, draft: { label: "Draft", tone: "off" } };
/* "Today, 6:30 AM" or "Sep 23, 4:10 PM" */
function when(iso) {
  const d = iso.slice(0, 10), h = +iso.slice(11, 13), m = iso.slice(14, 16);
  const t = `${h % 12 || 12}:${m} ${h >= 12 ? "PM" : "AM"}`;
  return `${d === TODAY ? "Today" : fmtDate(d)}, ${t}`;
}
const timeOf = (iso) => { const h = +iso.slice(11, 13); return `${h % 12 || 12}:${iso.slice(14, 16)} ${h >= 12 ? "PM" : "AM"}`; };
/* A small outlined file mark for grid rows (pdf / image / form) */
const fileMark = (icon = "file-text") => `<span class="flex size-5 shrink-0 items-center justify-center rounded-md border border-gray-200/80 bg-white text-gray-500" aria-hidden="true">${I(icon, "size-3")}</span>`;
/* A small scan code drawn from a seed: three finder squares and seeded modules. Decorative stand-in for a real QR. */
function qr(seed, px = 56) {
  const n = 21, s = hash(seed); let r = s, cells = "";
  const rnd = () => ((r = (r * 1103515245 + 12345) >>> 0) >>> 16) & 1;
  const inFinder = (x, y) => (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && rnd()) cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  const finder = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  return `<svg viewBox="-1 -1 23 23" width="${px}" height="${px}" role="img" aria-label="Scan code" class="shrink-0 rounded-md border border-gray-200/80 bg-white p-0.5" shape-rendering="crispEdges"><g fill="#1e2939">${finder(0, 0)}${finder(14, 0)}${finder(0, 14)}${cells}</g></svg>`;
}
/* A hand-drawn signature, as one SVG path */
const SIGNATURE = (name = "", cls = "h-16") => `<svg viewBox="0 0 260 80" class="${cls} w-auto" role="img" aria-label="Signature of ${esc(name)}"><path d="M14 58 C 22 30, 30 12, 38 18 C 46 24, 30 60, 26 66 C 40 44, 52 30, 60 40 C 64 46, 58 58, 66 56 C 74 54, 78 38, 86 40 C 92 42, 88 58, 96 56 C 104 54, 108 30, 116 26 C 120 24, 118 50, 124 60 C 130 50, 136 36, 146 38 C 154 40, 148 56, 158 54 C 170 50, 174 34, 184 36 C 194 38, 186 54, 198 52 C 212 50, 226 40, 246 36" fill="none" stroke="#1e2939" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M60 70 C 110 64, 170 66, 232 62" fill="none" stroke="#1e2939" stroke-width="1.4" stroke-linecap="round" opacity=".7"/></svg>`;

/* ================================================================ 1. Forms list */
const FORMS = [
  { id: "f1", title: "New patient registration", cat: "Registration", status: "pub", packet: "New patient packet", fields: 18, responses: 412, updated: "2026-09-12", by: "Priya Shah" },
  { id: "f2", title: "Medical history", cat: "Clinical", status: "pub", packet: "New patient packet", fields: 24, responses: 1284, updated: "2026-08-30", by: "Dr. Maya Patel" },
  { id: "f3", title: "HIPAA acknowledgement", cat: "Legal", status: "pub", packet: "New patient packet", fields: 3, responses: 408, updated: "2026-06-02", by: "Priya Shah" },
  { id: "f4", title: "Financial policy", cat: "Legal", status: "pub", packet: "New patient packet", fields: 4, responses: 405, updated: "2026-06-02", by: "Priya Shah" },
  { id: "f5", title: "Insurance information", cat: "Insurance", status: "pub", packet: "New patient packet", fields: 12, responses: 390, updated: "2026-07-14", by: "Nina Flores" },
  { id: "f6", title: "Medical history update", cat: "Clinical", status: "pub", packet: "Recall packet", fields: 9, responses: 1590, updated: "2026-08-30", by: "Dr. Maya Patel" },
  { id: "f7", title: "Consent for root canal treatment", cat: "Clinical", status: "pub", packet: "", fields: 6, responses: 37, updated: "2026-07-18", by: "Dr. Ethan Brooks" },
  { id: "f8", title: "Consent for extraction", cat: "Clinical", status: "pub", packet: "", fields: 6, responses: 52, updated: "2026-05-21", by: "Dr. Ethan Brooks" },
  { id: "f9", title: "Child medical history", cat: "Clinical", status: "draft", packet: "Child new patient packet", fields: 20, responses: 0, updated: "2026-09-24", by: "Priya Shah" },
  { id: "f10", title: "How was your visit?", cat: "Feedback", status: "pub", packet: "", fields: 5, responses: 96, updated: "2026-04-09", by: "Priya Shah" },
  { id: "f11", title: "Photo and x-ray release", cat: "Legal", status: "draft", packet: "", fields: 3, responses: 0, updated: "2026-09-22", by: "Priya Shah" }
];
const formCols = () => [
  { key: "title", label: "Form title", icon: "file-text", w: 272, open: true, kind: "text", lead: () => fileMark("file-text"), render: (f) => esc(f.title) },
  { key: "cat", label: "Category", icon: "tag", w: 132, kind: "text", render: (f) => tag(f.cat, FORM_CAT[f.cat]) },
  { key: "status", label: "Status", icon: "circle-dot", w: 128, kind: "text", value: (f) => FORM_STATUS[f.status].label, render: (f) => statusDot(FORM_STATUS[f.status].label, FORM_STATUS[f.status].tone) },
  { key: "packet", label: "In packet", icon: "folder", w: 208, kind: "text", render: (f) => (f.packet ? esc(f.packet) : `<span class="text-gray-400">Not in a packet</span>`) },
  { key: "responses", label: "Responses", icon: "inbox", w: 116, num: true, kind: "num", render: (f) => (f.responses ? f.responses.toLocaleString("en-US") : `<span class="text-gray-400">0</span>`) },
  { key: "updated", label: "Last updated", icon: "calendar", w: 132, kind: "date", render: (f) => fmtDate(f.updated) }
];
/* v2: categories are plain text (five tag colours meant nothing), Published (the normal state) is blank, and a form in no
 * packet leaves the cell empty instead of saying so four times */
const v2FormCols = () => { const c = Object.fromEntries(formCols().map((x) => [x.key, x]));
  return [c.title,
    Object.assign(c.cat, { render: (f) => esc(f.cat), label: `<span${chg("Category is plain text: five tag colours named a category without meaning anything")}>Category</span>` }),
    Object.assign(c.status, { normal: ["Published"], label: `<span${chg("Status shows only when unusual: Published forms are blank, so the two Drafts stand out")}>Status</span>` }),
    Object.assign(c.packet, { render: (f) => esc(f.packet), label: `<span${chg("A form in no packet leaves the cell blank instead of saying 'Not in a packet'")}>In packet</span>` }),
    c.responses, c.updated]; };
/* v4: the everyday columns are cells you change right in the list (click, pick); the name still opens the rest */
const v4FormCols = () => v2FormCols().map((c) => (c.key === "cat" ? Object.assign(c, { edit: "select", options: Object.keys(FORM_CAT), label: `<span${chg4("Category and In packet are cells you change right in the list (click and pick, or just type); the form's name still opens it for everything else")}>Category</span>` })
  : c.key === "packet" ? Object.assign(c, { edit: "select", options: () => [{ value: "", label: "Not in a packet" }, ...V4_FORM_PACKETS], placeholder: () => "Not in a packet",
    label: `<span${chg4("A form in no packet says “Not in a packet” in grey instead of a blank cell, so the column reads on every row")}>In packet</span>` }) : c));
const AUTOS = [
  { id: "a1", name: "New patient paperwork", sends: "New patient packet · 4 forms", when: "3 days before the visit", who: "New patients", how: "Text, then email", status: "on", sent: 46 },
  { id: "a2", name: "Yearly medical history", sends: "Medical history update", when: "2 days before the visit", who: "Last update over 12 months ago", how: "Text", status: "on", sent: 212 },
  { id: "a3", name: "Root canal consent", sends: "Consent for root canal treatment", when: "When D3310–D3330 is booked", who: "Anyone", how: "Text", status: "on", sent: 9 },
  { id: "a4", name: "Extraction consent", sends: "Consent for extraction", when: "When D7140 or D7210 is booked", who: "Anyone", how: "Text", status: "off", sent: 0 },
  { id: "a5", name: "After surgery check-in", sends: "How was your visit?", when: "1 day after the visit", who: "Oral surgery visits", how: "Text", status: "on", sent: 18 },
  { id: "a6", name: "Kids' paperwork", sends: "Child new patient packet", when: "3 days before the visit", who: "New patients under 18", how: "Email", status: "needs", sent: 0 }
];
const AUTO_STATUS = { on: ["On", "on"], off: ["Off", "off"], needs: ["Paused: a form is a draft", "needs"] };
const autoCols = () => [
  { key: "name", label: "Automation", icon: "zap", w: 208, open: true, kind: "text", render: (a) => esc(a.name) },
  { key: "sends", label: "Forms or packet", icon: "file-text", w: 236, kind: "text", render: (a) => esc(a.sends) },
  { key: "when", label: "When", icon: "clock", w: 212, kind: "text", render: (a) => esc(a.when) },
  { key: "who", label: "Who gets it", icon: "users", w: 212, kind: "text", render: (a) => esc(a.who) },
  { key: "status", label: "Status", icon: "circle-dot", w: 200, kind: "text", value: (a) => AUTO_STATUS[a.status][0], render: (a) => statusDot(...AUTO_STATUS[a.status]) },
  { key: "sent", label: "Sent, 30 days", icon: "send", w: 128, num: true, kind: "num", render: (a) => (a.sent ? String(a.sent) : `<span class="text-gray-400">0</span>`) }
];
const V4_AUTO_WHEN = ["3 days before the visit", "2 days before the visit", "1 day before the visit", "1 day after the visit", "When D3310–D3330 is booked", "When D7140 or D7210 is booked"];
const v4AutoCols = () => v2AutoCols().map((c) => (c.key === "when" ? Object.assign(c, { edit: "select", options: V4_AUTO_WHEN, label: `<span${chg4("When it sends and whether it's on are cells you change right in the list; the row still opens for the rest")}>When</span>` })
  : c.key === "status" ? Object.assign(c, { edit: "select", options: [{ value: "on", label: "On" }, { value: "off", label: "Off" }], label: "Status" }) : c));
const v2AutoCols = () => autoCols().map((c) => (c.key === "status" ? Object.assign(c, { normal: ["On"], label: `<span${chg("Status shows only when unusual: automations that are On are blank, so Off and Paused stand out")}>Status</span>` }) : c));
const SEND_STEPS = ["Link sent", "Form opened", "Completed", "Signed by patient"];
const HIST = [
  { id: "h1", pt: "p9", form: "New patient packet", at: "2026-09-25T06:30", by: "Automation", how: "Text", step: 4, times: ["2026-09-25T06:30", "2026-09-25T07:12", "2026-09-25T07:26", "2026-09-25T07:26"] },
  { id: "h2", pt: "p6", form: "Medical history update", at: "2026-09-25T07:45", by: "Automation", how: "Text", step: 2, times: ["2026-09-25T07:45", "2026-09-25T09:10"] },
  { id: "h3", pt: "p2", form: "Consent for root canal treatment", at: "2026-09-25T08:05", by: "Marcus Lee", how: "Secure link", step: 3, times: ["2026-09-25T08:05", "2026-09-25T08:06", "2026-09-25T08:14"] },
  { id: "h4", pt: "p4", form: "Child medical history", at: "2026-09-23T16:10", by: "Automation", how: "Email", step: 1, times: ["2026-09-23T16:10"] },
  { id: "h5", pt: "p5", form: "Medical history update", at: "2026-09-23T09:00", by: "Automation", how: "Text", step: 4, times: ["2026-09-23T09:00", "2026-09-23T12:41", "2026-09-23T12:50", "2026-09-23T12:50"] },
  { id: "h6", pt: "p8", form: "Consent for extraction", at: "2026-09-18T11:20", by: "Nina Flores", how: "Text", step: 1, expired: true, times: ["2026-09-18T11:20"] },
  { id: "h7", pt: "p3", form: "Medical history update", at: "2026-09-22T09:00", by: "Automation", how: "Text", step: 3, times: ["2026-09-22T09:00", "2026-09-22T18:02", "2026-09-22T18:09"] },
  { id: "h8", pt: "p10", form: "How was your visit?", at: "2026-09-21T10:00", by: "Automation", how: "Text", step: 3, times: ["2026-09-21T10:00", "2026-09-21T10:31", "2026-09-21T10:33"] },
  { id: "h9", pt: "p7", form: "Medical history update", at: "2026-09-21T09:00", by: "Automation", how: "Email", step: 2, times: ["2026-09-21T09:00", "2026-09-22T20:15"] }
];
const histStatus = (h) => (h.expired ? ["Link expired", "needs"] : [[, "Link sent", "Form opened", "Completed", "Signed by patient"][h.step], ["", "off", "mid", "on", "on"][h.step]]);
const histCols = () => [
  { key: "pt", label: "Patient", icon: "user", w: 196, open: true, kind: "text", value: (h) => DATA.patient(h.pt).name, lead: (h) => avatar(DATA.patient(h.pt).name, { size: 5 }), render: (h) => esc(DATA.patient(h.pt).name) },
  { key: "form", label: "Form", icon: "file-text", w: 244, kind: "text", render: (h) => esc(h.form) },
  { key: "at", label: "Sent", icon: "calendar", w: 150, kind: "date", render: (h) => when(h.at) },
  { key: "by", label: "Sent by", icon: "user-round", w: 146, kind: "text", render: (h) => (h.by === "Automation" ? `<span class="inline-flex items-center gap-x-2 text-gray-500">${I("zap", "size-3.5 text-gray-400")}Automation</span>` : `<span class="inline-flex items-center gap-x-2">${avatar(h.by, { size: 5 })}${esc(h.by)}</span>`) },
  { key: "how", label: "Method", icon: "send", w: 118, kind: "text" },
  { key: "status", label: "Status", icon: "circle-dot", w: 164, kind: "text", value: (h) => histStatus(h)[0], render: (h) => statusDot(...histStatus(h)) }
];
/* v4: where a sent form is, step by step with the time of each, in the card that opens when you point at its row */
const V4_STEP_SHORT = ["Sent", "Opened", "Completed", "Signed"];
const v4HistPeek = (h) => peekCard(`${esc(DATA.patient(h.pt).name)} · ${esc(h.form)}`, V4_STEP_SHORT.map((st, i) => [st, i < h.step ? when(h.times[i]) : '<span class="text-gray-400">Not yet</span>']),
  `${h.expired ? "The link expired before it was opened. " : ""}Sent by ${h.by === "Automation" ? "an automation" : esc(h.by)}, by ${h.how.toLowerCase()}.`);
/* The four send states as one track: a dot and a word each, with the time under it */
function sendTrack(h, { compact = false } = {}) {
  return `<ol class="grid grid-cols-4 gap-2" aria-label="Where this form is">${SEND_STEPS.map((s, i) => { const done = i < h.step;
    return `<li class="min-w-0"><span class="flex items-center gap-1.5 text-[13px] ${done ? "text-gray-800" : "text-gray-400"} whitespace-nowrap"><span class="${cx(R.dot, done ? TONE_DOT.on : TONE_DOT.quiet)}"></span>${s}</span>
      <span class="block ps-3.5 text-xs tabular-nums ${done ? "text-gray-500" : "text-gray-300"}">${done ? (compact ? timeOf(h.times[i]) : when(h.times[i])) : "Not yet"}</span></li>`; }).join("")}</ol>`;
}
const statusButton = (word, tone) => `<button type="button" class="${cx(R.btn, R.sm, R.white, "!ps-2.5")}" aria-haspopup="menu" aria-label="Status: ${esc(word)}. Change status"><span class="${cx(R.dot, TONE_DOT[tone])}"></span>${esc(word)}${I("chevron-down", "!text-gray-400")}</button>`;
const statusLine = (btn, caption) => `<section class="${R.psec} flex items-center justify-between gap-3 !py-3">${btn}<span class="min-w-0 truncate text-[13px] text-gray-500">${caption}</span></section>`;
/* v4: a form's facts are one small table you type into, with Status (Published or Draft) as its first line instead of
 * a row of its own; the ⋯ menu is the standard Actions menu in the footer */
const V4_FORM_PACKETS = ["New patient packet", "Recall packet", "Child new patient packet"];
const V4_FORM_FOLDERS = ["Patient Forms", "Consent Forms", "Insurance Verification", "Clinical Notes", "Miscellaneous"];
const v4FormActions = (f) => [
  { label: "Form", items: [{ icon: "languages", label: "Translate to Spanish", hint: "Asha drafts it for you to check" },
    { icon: "folder-plus", label: "Add to a packet", hint: "Send it with other forms in one link", off: f.packet ? `Already in the ${f.packet}` : "" }, { icon: "download", label: "Download responses", hint: "Every answer as a spreadsheet", off: f.responses ? "" : "No responses yet" },
    { icon: "history", label: "Form history", hint: "Who changed it and when" }] },
  { label: "", items: [{ icon: "archive", label: "Archive form", hint: "Patients stop getting it; responses stay in charts", danger: true }] }];
/* v4: a field table named in its header band, for a panel where a line table with a header band sits below it */
const v4FormBandCols = (group, labelW) => [{ key: "label", label: group, w: labelW, render: (r) => `<span class="text-gray-500">${esc(r.label)}</span>` },
  { key: "value", label: "", w: 160, grow: true, edit: (r) => (r.type === "none" ? null : r.type || "text"), options: (r) => r.options, placeholder: (r) => `Add ${r.label.replace(/^\w/, (m) => m.toLowerCase())}`, render: (r) => (r.html ? r.html(r) : esc(r.value)) }];
function v4OpenFormSheet(f) {
  const s = FORM_STATUS[f.status], dot = (v) => `<span class="${cx(R.dot, TONE_DOT[v === "Published" ? "on" : "off"])}"></span>`;
  Sheet.open({
    flush: true, title: esc(f.title), lead: `<span class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-200/80 bg-white text-gray-500">${I("file-text", "size-4")}</span>`,
    subtitle: `${f.fields} fields · English and Spanish`,
    tabs: ["Details", ["Responses", f.responses.toLocaleString("en-US")], "Automations"],
    actions: iconButton("copy", "Duplicate", { s: "iconSm" }),
    body: `${f.status === "draft" ? psec("", infoRow("circle-alert", "Patients can't get this form until it's published. Automations that use it are paused.", { tone: "needs" }), { cls: "!py-2.5" }) : ""}
      ${psec("", `<div${chg4("The form's facts are one table you click and type into, and Status (Published or Draft) is its first line instead of a row of its own. The table's name, Details, sits in the same grey header band as the Latest responses table below it")}>${fieldTable([
        { label: "Status", value: s.label, type: "select", options: ["Published", "Draft"], html: (r) => `<span class="inline-flex items-center gap-2 min-w-0">${dot(r.value)}${esc(r.value)}${r.value === s.label ? `<span class="truncate text-gray-500">· Updated ${fmtDate(f.updated)} by ${esc(f.by)}</span>` : ""}</span>` },
        { label: "Category", value: f.cat, type: "select", options: Object.keys(FORM_CAT) },
        { label: "In packet", value: f.packet, type: "select", options: [{ value: "", label: "Not in a packet" }, ...V4_FORM_PACKETS] },
        { label: "Signature", value: "Patient signs at the end", type: "select", options: ["Patient signs at the end", "No signature"] },
        { label: "Saves to", value: "Patient Forms", type: "select", options: V4_FORM_FOLDERS }], { title: "Form details", head: true, columns: v4FormBandCols("Details", 140) })}</div>`)}
      ${psec("Latest responses", `<div${chg4("Latest responses is the same compact table as every panel (boxed, small grey headers, 28px rows) instead of a hand-made list; point at a row to see when the form was sent, opened, completed and signed, in a card beside the panel")}>${sheetTable({ sheet: false, title: "Latest responses", rows: HIST.slice(0, 4), peek: v4HistPeek, columns: [
        { key: "pt", label: "Patient", w: 180, grow: true, render: (h) => `<span class="inline-flex items-center gap-2 min-w-0">${avatar(DATA.patient(h.pt).name, { size: 5 })}<span class="truncate">${esc(DATA.patient(h.pt).name)}</span></span>` },
        { key: "status", label: "Status", w: 156, render: (h) => statusDot(...histStatus(h)) },
        { key: "at", label: "Sent", w: 80, num: true, render: (h) => `<span class="text-gray-500">${fmtDate(h.at.slice(0, 10))}</span>` }] })}</div>`)}`,
    footer: `<span class="inline-flex"${chg4("The ⋯ menu in the header is now the standard Actions menu here in the footer: searchable, grouped, with greyed rows that say why they can't run yet")}>${actionsMenu(v4FormActions(f), { open: V4_OPTS.open })}</span><span class="grow"></span>${button("Preview", { v: "white", s: "sm", icon: "eye" })}${button("Edit form", { v: "white", s: "sm", icon: "pencil" })}${button("Send to Patient", { v: "solid", s: "sm", icon: "send" })}`
  });
}
/* v4: a sent form is read-only, so its facts are a table you can't type into, with where it is as the first line */
function v4OpenHistSheet(h) {
  const p = DATA.patient(h.pt), st = histStatus(h);
  Sheet.open({
    flush: true, title: esc(p.name), lead: avatar(p.name, { size: 9 }), subtitle: esc(h.form),
    body: `${h.expired ? psec("", infoRow("circle-alert", "The link expired before it was opened. Send a new one, or hand them the tablet at check-in.", { tone: "needs" }), { cls: "!py-2.5" }) : ""}
      ${psec("Sent", `<div${chg4("A sent form can't be changed, so its facts are a read-only table, and its status is the first line instead of a row of its own")}>${fieldTable([
        { label: "Status", value: st[0], type: "none", html: () => `<span class="inline-flex items-center gap-2 min-w-0"><span class="${cx(R.dot, TONE_DOT[st[1]])}"></span>${st[0]}<span class="truncate text-gray-500">· ${h.expired ? "Link lasted 7 days" : "Link lasts 7 days"}</span></span>` },
        { label: "Sent by", value: h.by, type: "none" }, { label: "Method", value: h.how, type: "none" },
        { label: "To", value: h.how === "Email" ? `${p.name.split(" ")[0].toLowerCase()}@example.com` : p.phone, type: "none" },
        { label: "Next visit", value: p.next ? when(p.next) : "None booked", type: "none" }], { title: "Sent form" })}</div>`)}
      ${psec("Where it is", `<ol class="-my-1" aria-label="Where this form is">${SEND_STEPS.map((stp, i) => { const done = i < h.step;
        return `<li class="flex h-8 items-center gap-2.5 text-sm ${done ? "text-gray-800" : "text-gray-400"}"><span class="${cx(R.dot, done ? TONE_DOT.on : TONE_DOT.quiet)}"></span>${stp}<span class="ms-auto text-[13px] tabular-nums ${done ? "text-gray-500" : "text-gray-300"}">${done ? when(h.times[i]) : "Not yet"}</span></li>`; }).join("")}</ol>`)}`,
    footer: `${button("Resend link", { v: "white", s: "sm", icon: "rotate-cw" })}${h.step >= 3 ? button("View responses", { v: "solid", s: "sm" }) : button("Copy secure link", { v: "solid", s: "sm", icon: "link" })}`
  });
}
function openFormSheet(f) {
  if (V4) return v4OpenFormSheet(f);
  const s = FORM_STATUS[f.status];
  Sheet.open({
    flush: true, title: esc(f.title), lead: `<span class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-200/80 bg-white text-gray-500">${I("file-text", "size-4")}</span>`,
    subtitle: `${f.fields} fields · English and Spanish`,
    tabs: ["Details", ["Responses", f.responses.toLocaleString("en-US")], "Automations"],
    actions: iconButton("copy", "Duplicate", { s: "iconSm" }) + iconButton("ellipsis", "More", { s: "iconSm" }),
    body: `${statusLine(statusButton(s.label, s.tone), `Updated ${fmtDate(f.updated)} by ${esc(f.by)}`)}
      ${f.status === "draft" ? psec("", infoRow("circle-alert", "Patients can't get this form until it's published. Automations that use it are paused.", { tone: "needs" }), { cls: "!py-2.5" }) : ""}
      ${psec("Details", metaGrid([["Category", tag(f.cat, FORM_CAT[f.cat])], ["In packet", f.packet ? esc(f.packet) : '<span class="text-gray-400">Not in a packet</span>'], ["Signature", "Patient signs at the end"], ["Saves to", "Patient Forms"]], 2))}
      ${psec("Latest responses", bleed(`<table class="w-full border-separate border-spacing-0"><thead><tr><th class="${R.tHead} ps-5">Patient</th><th class="${R.tHead}">Status</th><th class="${R.tHead} pe-5 !text-end">Sent</th></tr></thead><tbody>${HIST.slice(0, 4).map((h) => `<tr><td class="${R.tCell} ps-5"><span class="inline-flex items-center gap-2">${avatar(DATA.patient(h.pt).name, { size: 5 })}${esc(DATA.patient(h.pt).name)}</span></td><td class="${R.tCell}">${statusDot(...histStatus(h))}</td><td class="${R.tCell} pe-5 text-end text-gray-500 tabular-nums">${fmtDate(h.at.slice(0, 10))}</td></tr>`).join("")}</tbody></table>`), { cls: "!pb-0" })}`,
    footer: `${button("Preview", { v: "white", s: "sm", icon: "eye" })}${button("Edit form", { v: "white", s: "sm", icon: "pencil" })}${button("Send to Patient", { v: "solid", s: "sm", icon: "send" })}`
  });
}
function openHistSheet(h) {
  if (V4) return v4OpenHistSheet(h);
  const p = DATA.patient(h.pt), st = histStatus(h);
  Sheet.open({
    flush: true, title: esc(p.name), lead: avatar(p.name, { size: 9 }), subtitle: esc(h.form),
    body: `${statusLine(statusDot(...st), h.expired ? "Link lasted 7 days" : "Link lasts 7 days")}
      ${h.expired ? psec("", infoRow("circle-alert", "The link expired before it was opened. Send a new one, or hand them the tablet at check-in.", { tone: "needs" }), { cls: "!py-2.5" }) : ""}
      ${psec("Where it is", `<ol class="-my-1" aria-label="Where this form is">${SEND_STEPS.map((st, i) => { const done = i < h.step;
        return `<li class="flex h-8 items-center gap-2.5 text-sm ${done ? "text-gray-800" : "text-gray-400"}"><span class="${cx(R.dot, done ? TONE_DOT.on : TONE_DOT.quiet)}"></span>${st}<span class="ms-auto text-[13px] tabular-nums ${done ? "text-gray-500" : "text-gray-300"}">${done ? when(h.times[i]) : "Not yet"}</span></li>`; }).join("")}</ol>`)}
      ${psec("Sent", metaGrid([["Sent by", h.by === "Automation" ? "Automation" : esc(h.by)], ["Method", h.how], ["To", h.how === "Email" ? `${p.name.split(" ")[0].toLowerCase()}@example.com` : `<span class="tabular-nums">${p.phone}</span>`], ["Next visit", p.next ? when(p.next) : '<span class="text-gray-400">None booked</span>']], 2))}`,
    footer: `${button("Resend link", { v: "white", s: "sm", icon: "rotate-cw" })}${h.step >= 3 ? button("View responses", { v: "solid", s: "sm" }) : button("Copy secure link", { v: "solid", s: "sm", icon: "link" })}`
  });
}
const FORM_TABS = [["All Forms", FORMS.length], ["Automations", AUTOS.length], ["History", HIST.length]];
/* v2 first day: one place to start. "New form" and the four starters sit together in the empty state (the toolbar's
 * New form, a second New form and a separate template list used to compete). */
const v2FirstDayForms = () => `<div class="py-10"${chg("One place to start: New form and the four starters sit together in the empty state, instead of three competing New form buttons and lists")}>
  <div class="flex flex-col items-center gap-1 text-center"><span class="mb-2 flex size-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500">${I("file-text", "size-5")}</span>
    <p class="text-sm font-semibold text-gray-800">No forms yet</p><p class="${R.help} max-w-sm">Start from one of these, or build your own from a blank form.</p>
    <div class="mt-3">${button("New form", { v: "solid", s: "sm", icon: "plus" })}</div></div>
  <ul class="mx-auto mt-6 max-w-2xl rounded-lg border border-gray-200/80 divide-y divide-gray-200/80 [&>li]:px-3">${STARTERS.map(([t, d]) => `<li class="group/st flex h-11 items-center gap-3 hover:bg-gray-50">${fileMark()}<span class="w-56 shrink-0 truncate text-sm text-gray-800">${t}</span><span class="grow truncate text-[13px] text-gray-500">${d}</span><span class="opacity-0 group-hover/st:opacity-100 group-focus-within/st:opacity-100 [@media(hover:none)]:opacity-100">${button("Use this", { v: "quiet", s: "xs", attrs: `aria-label="Use ${t}"` })}</span></li>`).join("")}</ul></div>`;
const STARTERS = [["New patient registration", "Name, contact, insurance and emergency contact"], ["Medical history", "Medicines, allergies and conditions"], ["HIPAA acknowledgement", "Privacy notice with a signature"], ["Financial policy", "Payment terms with a signature"]];
defineBlock({
  cat: "forms", id: "forms-list", thumb: true,
  title: "Forms list",
  note: "The Forms page: one bar, three tabs with counts, then the grid. Automations are the rules that send forms before visits; History shows where each sent form is. Tabs switch and every row opens.",
  where: "Communications › Forms",
  states: ["Normal", "First day, no forms", "Loading"],
  canvas: "bare",
  html: (state) => {
    const empty = state === "First day, no forms";
    const tabs = FORM_TABS.map(([l, n]) => [l, empty ? 0 : n]);
    if (V2) return `${workspaceHeader({ parent: "Communications", title: "Forms", actions: `${button("Import", { v: "quiet", s: "sm", icon: "upload" })}${button("Send to Patient", { v: "white", s: "sm", icon: "send" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
      <div data-form-tabs${state === "Loading" ? chg("Count tabs stay blank while the list loads") : ""}>${tabsWithSlot(state === "Loading" ? FORM_TABS.map(([l]) => l) : tabs, 0, "")}</div>
      <div class="px-4 pb-4">${state === "Loading" ? `<div class="py-2.5 flex gap-2">${skel("w-48", "h-8")}</div>${gridSkeleton(["Form title", "Category", "Status", "In packet", "Responses", "Last updated"], 7)}` : `<div data-grid="forms"></div>`}</div>`;
    return `${workspaceHeader({ parent: "Communications", title: "Forms", actions: `${button("Import", { v: "quiet", s: "sm", icon: "upload" })}${button("Send to Patient", { v: "white", s: "sm", icon: "send" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
      <div data-form-tabs>${tabsWithSlot(tabs, 0, "")}</div>
      <div class="px-4 pb-4">${state === "Loading" ? `<div class="py-2.5 flex gap-2">${skel("w-32", "h-8")}${skel("w-48", "h-8")}</div>${gridSkeleton(["Form title", "Category", "Status", "In packet", "Responses", "Last updated"], 7)}` : `<div data-grid="forms"></div>`}
      ${empty ? `<div class="pt-5"><h3 class="${R.groupTitle} mb-2">Start from a template</h3><ul class="rounded-lg border border-gray-200/80 divide-y divide-gray-200/80 [&>li]:px-3">${STARTERS.map(([t, d]) => `<li class="flex h-11 items-center gap-3">${fileMark()}<span class="text-sm text-gray-800 w-64 truncate">${t}</span><span class="grow truncate text-[13px] text-gray-500">${d}</span>${button("Use this", { v: "white", s: "xs", attrs: `aria-label="Use ${t}"` })}</li>`).join("")}</ul></div>` : ""}</div>`;
  },
  mount: (el, state) => {
    const wrap = el.querySelector('[data-grid="forms"]'); if (!wrap) return;
    const empty = state === "First day, no forms";
    const configs = [
      { columns: formCols(), rows: empty ? [] : FORMS, title: "All Forms", searchPlaceholder: "Search forms…", defaultSort: { key: "title", dir: 1 }, calc: { responses: "sum" }, primary: { label: "New form" },
        filters: [{ key: "status", label: "Status", options: [{ value: "pub", label: "Published", tone: "on" }, { value: "draft", label: "Draft", tone: "off" }] }, { key: "cat", label: "Category", options: Object.keys(FORM_CAT).map((c) => ({ value: c, label: c })) }],
        empty: { icon: "file-text", title: "No forms yet", body: "Start from a template below, or build your own from a blank form.", action: "New form" },
        bulk: [{ label: "Send", icon: "send" }, { label: "Add to packet", icon: "folder-plus" }, { label: "Delete", icon: "trash-2", danger: true }], onOpen: openFormSheet },
      { columns: autoCols(), rows: empty ? [] : AUTOS, title: "Automations", searchPlaceholder: "Search automations", calc: { sent: "sum" }, primary: { label: "New automation" },
        filters: [{ key: "status", label: "Status", options: [{ value: "on", label: "On", tone: "on" }, { value: "off", label: "Off", tone: "off" }, { value: "needs", label: "Paused", tone: "needs" }] }],
        empty: { icon: "zap", title: "No automations yet", body: "Send forms on their own before visits, like new patient paperwork 3 days ahead.", action: "New automation" },
        bulk: [{ label: "Turn off", icon: "pause" }], onOpen: (a) => openFormSheet(FORMS.find((f) => a.sends.startsWith(f.title)) || FORMS[0]) },
      { columns: histCols(), rows: empty ? [] : HIST, title: "Sent forms", searchPlaceholder: "Search by patient name...", defaultSort: { key: "at", dir: -1 },
        filters: [{ key: "status", label: "Status", options: [["Link sent", "off"], ["Form opened", "mid"], ["Completed", "on"], ["Signed by patient", "on"], ["Link expired", "needs"]].map(([l, t]) => ({ value: l, label: l, tone: t })), match: (r, v) => histStatus(r)[0] === v }],
        empty: { icon: "send", title: "Nothing sent yet", body: "Forms you send, and the ones automations send, show up here with where each one is." },
        bulk: [{ label: "Resend", icon: "rotate-cw" }, { label: "Export", icon: "download" }], onOpen: openHistSheet }
    ];
    let host = wrap;
    if (empty) configs.forEach((c) => delete c.defaultSort);
    if (V2) { Object.assign(configs[0], { columns: v2FormCols(), viewButton: false, noun: "forms" }); Object.assign(configs[1], { columns: v2AutoCols(), viewButton: false, noun: "automations" }); Object.assign(configs[2], { viewButton: false, noun: "sent" }); }
    if (V4) { Object.assign(configs[0], { columns: v4FormCols(), sheet: true }); Object.assign(configs[1], { columns: v4AutoCols(), sheet: true }); Object.assign(configs[2], { peek: v4HistPeek, columns: histCols().map((c) => (c.key === "pt" ? Object.assign(c, { label: `<span${chg4("Point at a sent form to see when it was sent, opened, completed and signed, each with its time, in a card beside the row")}>Patient</span>` }) : c)) }); }
    const show = (i) => { const fresh = document.createElement("div"); host.replaceWith(fresh); host = fresh;
      if (V2 && empty && i === 0) { fresh.innerHTML = v2FirstDayForms(); icons(); return; }
      new Grid(fresh, Object.assign({ maxHeight: empty ? 260 : 480 }, configs[i])); };
    show(0);
    wireTabs(el.querySelector("[data-form-tabs]"), show);
  }
});

/* ================================================================ 2. Form builder */
const BUILD_FIELDS = [
  { type: "Explanatory Text", icon: "text", label: "Before you start" },
  { type: "Short Text", icon: "type", label: "Your physician's name" },
  { type: "Phone", icon: "phone", label: "Physician's phone" },
  { type: "Multiple Choice", icon: "circle-dot", label: "Are you taking any medicines?", req: true, chart: "Medications" },
  { type: "Long Text", icon: "align-left", label: "Which medicines, and how much?", req: true, cond: true, chart: "Medications", help: "Include vitamins and supplements." },
  { type: "Check All That Apply", icon: "square-check", label: "Are you allergic to any of these?", chart: "Allergies" },
  { type: "Check All That Apply", icon: "square-check", label: "Have you had any of these?", chart: "Conditions" },
  { type: "Multiple Choice", icon: "circle-dot", label: "Do you need antibiotics before dental visits?", req: true, chart: "Premedication" },
  { type: "Signature", icon: "pen-tool", label: "Patient signature", req: true }
];
const FIELD_TYPES = [["Short Text", "type"], ["Long Text", "align-left"], ["Number", "hash"], ["Date", "calendar"], ["Phone", "phone"], ["Dropdown", "list"], ["Multiple Choice", "circle-dot"], ["Check All That Apply", "square-check"], ["File Upload", "cloud-upload"], ["Acknowledgement", "toggle-left"], ["Explanatory Text", "text"], ["Signature", "pen-tool"]];
const lbl = (t, req) => `<p class="${R.label} mb-1.5">${t}${req ? ' <span class="text-gray-400" aria-label="required">*</span>' : ""}</p>`;
const pRadio = (items, on) => `<div class="flex flex-wrap gap-x-5 gap-y-2">${items.map((t, i) => `<label class="inline-flex items-center gap-2 text-sm text-gray-800"><input type="radio" class="${R.radio}" ${i === on ? "checked" : ""} tabindex="-1" />${t}</label>`).join("")}</div>`;
const pCheck = (items) => `<div class="grid grid-cols-2 gap-x-5 gap-y-2">${items.map((t) => `<label class="inline-flex items-center gap-2 text-sm text-gray-800">${checkbox(false, "", 'tabindex="-1"')}${t}</label>`).join("")}</div>`;
function previewField(f, i, sel) {
  const body = {
    "Explanatory Text": `<p class="text-sm leading-6 text-gray-600">Please answer as best you can. Dr. Patel reads this before your visit, and it stays in your chart.</p>`,
    "Short Text": `${lbl(f.label)}<input class="${R.input}" placeholder="Enter your answer" tabindex="-1" aria-label="${esc(f.label)}" />`,
    "Phone": `${lbl(f.label)}<input class="${R.input}" placeholder="(555) 555-0100" tabindex="-1" aria-label="${esc(f.label)}" />`,
    "Multiple Choice": `${lbl(f.label, f.req)}${pRadio(f.label.startsWith("Do you need") ? ["Yes", "No", "Not sure"] : ["Yes", "No"], -1)}`,
    "Long Text": `${lbl(f.label, f.req)}<textarea class="${R.textarea} !min-h-16" placeholder="${esc(f.help || "Enter your answer")}" tabindex="-1" aria-label="${esc(f.label)}"></textarea>`,
    "Check All That Apply": `${lbl(f.label)}${pCheck(f.label.includes("allergic") ? ["Penicillin", "Latex", "Codeine", "Local anesthetic"] : ["Heart condition", "Diabetes", "High blood pressure", "Joint replacement"])}`,
    "Signature": `${lbl(f.label, f.req)}<div class="h-20 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-end px-4 pb-3"><span class="text-gray-400 text-sm me-2">×</span><span class="grow border-b border-gray-300"></span></div>`
  }[f.type];
  return `<div class="relative rounded-lg px-3 py-3 -mx-3 ${sel ? "ring-2 ring-blue-600/40 bg-blue-50/30" : "hover:bg-gray-50"}" data-pick="${i}">
    ${f.cond ? `<p class="mb-2 inline-flex items-center gap-1.5 text-xs text-gray-500">${I("git-branch", "size-3.5 text-gray-400")}Shows when “Are you taking any medicines?” is Yes</p>` : ""}${body}
    ${sel ? `<div class="absolute -top-3.5 end-2 flex items-center gap-0.5 rounded-lg border border-gray-200/80 bg-white p-0.5 shadow-2xs">${iconButton("arrow-up", "Move up", { s: "iconXs" })}${iconButton("arrow-down", "Move down", { s: "iconXs" })}${iconButton("copy", "Duplicate field", { s: "iconXs" })}${iconButton("trash-2", "Delete field", { s: "iconXs" })}</div>` : ""}</div>`;
}
/* v2 builder: the 12 field types are one "Add field" menu at the end of the outline (like Attio's attribute type list),
 * the rail is 280px so questions read in full, a hover + between fields adds one in place, and the properties panel
 * uses psec() sections with one control height. */
const v2FieldMenu = (up) => `<div class="absolute start-0 ${up ? "bottom-full mb-1" : "top-full mt-1"} z-30 ${R.menu} max-h-80 overflow-y-auto" role="menu" aria-label="Field types" data-v2-field-menu hidden>${FIELD_TYPES.map(([t, ic]) => `<button type="button" role="menuitem" class="${R.menuItem}">${I(ic)}${t}</button>`).join("")}</div>`;
function v2BuilderRail(fields, selIdx, list, blank) {
  return `<aside class="flex flex-col border-e border-gray-200/80 bg-white p-3 overflow-y-auto" aria-label="Form fields"${chg("The field list is 280px wide, so questions read in full instead of 'Are you taking any me…'")}>
    <div class="flex items-center justify-between px-2 pt-1 pb-2"><h3 class="${R.groupTitle}">Form Fields</h3><span class="${R.count}">${fields.length}</span></div>${blank ? `<div class="rounded-lg bg-gray-50 px-3 py-4 text-center"><p class="text-[13px] font-medium text-gray-800">No fields yet</p><p class="text-xs text-gray-500 mt-0.5">Use Add field to add the first one.</p></div>` : list}
    <div class="relative mt-2 px-1"${chg("One Add field menu at the end of the outline replaces a wall of 12 field-type buttons")}>${button("Add field", { v: "white", s: "sm", icon: "plus", attrs: 'aria-haspopup="menu" data-v2-add-field' })}${v2FieldMenu(!blank)}</div></aside>`;
}
const v2AddBetween = (i) => `<div class="group/add relative -my-1 flex h-4 items-center justify-center"${i === 0 ? chg("Hover between two fields to add one right there") : ""}><span class="absolute inset-x-0 top-1/2 border-t border-dashed border-blue-300 opacity-0 group-hover/add:opacity-100 group-focus-within/add:opacity-100"></span><button type="button" class="relative flex size-5 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-2xs opacity-0 group-hover/add:opacity-100 focus-visible:opacity-100 hover:text-blue-600" aria-label="Add a field after field ${i + 1}" data-v2-add-field>${I("plus", "size-3")}</button></div>`;
function v2BuilderProps(f, blank) {
  const swRow = (label, help, on, extra = "") => psec("", `<div class="flex items-center justify-between gap-4"><div class="min-w-0"><p class="${R.label} flex items-center gap-1.5">${label}</p>${help ? `<p class="${R.help}">${help}</p>` : ""}</div>${sw(on, label.replace(/<[^>]+>/g, "").trim())}</div>${extra}`);
  const wrap = (bar, body) => `<div class="${R.bar}">${bar}</div><div class="[&>section:first-child]:border-t-0"${chg("The properties panel uses the standard panel sections and a 44px top bar, like every other side panel")}>${body}</div>`;
  if (blank) return wrap(`<h3 class="${R.groupTitle}">Form settings</h3>`, `${psec("", `<div class="space-y-4"><div class="space-y-1.5"><span class="${R.label}">Category</span><button type="button" class="${R.select}">Clinical${I("chevrons-up-down")}</button></div>
      <div class="space-y-1.5"><span class="${R.label}">Document folder</span><button type="button" class="${R.select}">Patient Forms${I("chevrons-up-down")}</button><p class="${R.help}">Where the signed PDF is saved in the chart.</p></div></div>`)}
    ${swRow("Ask for a signature", "Adds a signature at the end.", true)}${swRow("Offer in Spanish", "Asha translates it when you publish.", false)}`);
  return wrap(`<h3 class="${R.groupTitle}">Field properties</h3><span class="ms-auto -me-1.5">${iconButton("x", "Close properties", { s: "iconXs" })}</span>`, `${psec("", `<div class="space-y-4">
      <div class="space-y-1.5"><span class="${R.label}">Type</span><button type="button" class="${R.select}"><span class="inline-flex items-center gap-2">${I(f.icon, "!text-gray-500")}${f.type}</span>${I("chevrons-up-down")}</button></div>
      <div class="space-y-1.5"><label class="${R.label}" for="fb-l">Field label</label><input id="fb-l" class="${R.input}" value="${esc(f.label)}" /></div>
      <div class="space-y-1.5"><label class="${R.label}" for="fb-h">Helper text</label><input id="fb-h" class="${R.input}" value="${esc(f.help || "")}" placeholder="Optional help text" /></div></div>`)}
    ${swRow("Required", "", !!f.req)}
    ${psec("", `<div class="flex items-center justify-between gap-4"><div class="min-w-0"><p class="${R.label}">Save to chart</p><p class="${R.help}">Fills the patient's chart field.</p></div><button type="button" class="${R.select} !w-36"${chg("Every control in the panel is the same 36px height (Save to chart and the conditions were 32px)")}>${f.chart || "None"}${I("chevrons-up-down")}</button></div>`)}
    ${swRow(`Conditional logic ${I("info", "size-3.5 text-gray-400")}`, "Only ask this after a certain answer.", !!f.cond,
      f.cond ? `<div class="asha-reveal mt-3 space-y-2"><p class="text-xs font-medium text-gray-500">Show this field when:</p><button type="button" class="${R.select}"><span class="truncate">Are you taking any medicines?</span>${I("chevrons-up-down")}</button><div class="grid grid-cols-[72px_1fr] gap-2"><button type="button" class="${R.select}">is${I("chevrons-up-down")}</button><button type="button" class="${R.select}">Yes${I("chevrons-up-down")}</button></div></div>` : "")}`);
}
/* v4: the right panel's settings are one small table you type into (like a record's facts); conditional logic keeps
 * its own controls. The header's ⋯ is the standard Actions menu. */
const V4_FB_CHART = ["None", "Medications", "Allergies", "Conditions", "Premedication", "Emergency contact"];
const v4FbType = (v) => { const t = FIELD_TYPES.find(([n]) => n === v); return `<span class="inline-flex items-center gap-2 min-w-0">${I(t ? t[1] : "type", "size-4 shrink-0 text-gray-500")}<span class="truncate">${esc(v)}</span></span>`; };
function v4BuilderProps(f, blank) {
  const wrap = (bar, body) => `<div class="${R.bar}">${bar}</div><div class="[&>section:first-child]:border-t-0">${body}</div>`;
  if (blank) return wrap(`<h3 class="${R.groupTitle}">Form settings</h3>`, psec("", `<div${chg4("The form's settings are one small table you click and type into, the same as a form's details in its panel, instead of stacked dropdowns and switches")}>${fieldTable([
    { label: "Category", value: "Clinical", type: "select", options: Object.keys(FORM_CAT) },
    { label: "Saves to", value: "Patient Forms", type: "select", options: V4_FORM_FOLDERS },
    { label: "Signature", value: "Signs at the end", type: "select", options: ["Signs at the end", "No signature"] },
    { label: "Spanish", value: "Not offered", type: "select", options: ["Not offered", "Asha translates on publish"] }], { labelW: 96, title: "Form settings" })}</div>`));
  const swRow = (label, help, on, extra = "") => psec("", `<div class="flex items-center justify-between gap-4"><div class="min-w-0"><p class="${R.label} flex items-center gap-1.5">${label}</p>${help ? `<p class="${R.help}">${help}</p>` : ""}</div>${sw(on, label.replace(/<[^>]+>/g, "").trim())}</div>${extra}`);
  return wrap(`<h3 class="${R.groupTitle}">Field properties</h3><span class="ms-auto -me-1.5">${iconButton("x", "Close properties", { s: "iconXs" })}</span>`, `${psec("", `<div${chg4("The field's type, label, help, whether it's required and where it saves are one table you click and type into, instead of five stacked controls")}>${fieldTable([
    { label: "Type", value: f.type, type: "select", options: FIELD_TYPES.map(([n]) => n), html: (r) => v4FbType(r.value) },
    { label: "Label", value: f.label, type: "text" },
    { label: "Help text", value: f.help || "", type: "text" },
    { label: "Required", value: f.req ? "Yes" : "No", type: "select", options: ["Yes", "No"] },
    { label: "Saves to chart", value: f.chart || "None", type: "select", options: V4_FB_CHART }], { labelW: 104, title: "Field properties" })}</div>`)}
    ${swRow(`Conditional logic ${I("info", "size-3.5 text-gray-400")}`, "Only ask this after a certain answer.", !!f.cond,
      f.cond ? `<div class="asha-reveal mt-3 space-y-2"><p class="text-xs font-medium text-gray-500">Show this field when:</p><button type="button" class="${R.select}"><span class="truncate">Are you taking any medicines?</span>${I("chevrons-up-down")}</button><div class="grid grid-cols-[72px_1fr] gap-2"><button type="button" class="${R.select}">is${I("chevrons-up-down")}</button><button type="button" class="${R.select}">Yes${I("chevrons-up-down")}</button></div></div>` : "")}`);
}
const v4BuilderActions = (blank) => [
  { label: "Form", items: [{ icon: "copy", label: "Duplicate form", hint: "A copy to change without touching this one" }, { icon: "file-up", label: "Add fields from a PDF", hint: "Asha reads a paper form you already use" },
    { icon: "smartphone", label: "Send a test to my phone", hint: "Fill it in the way a patient would", off: blank ? "Add a field first" : "" }, { icon: "download", label: "Download as PDF", hint: "A blank copy to print", off: blank ? "Add a field first" : "" },
    { icon: "history", label: "Form history", hint: "Who changed it and when", off: blank ? "Nothing saved yet" : "" }] },
  { label: "", items: [{ icon: "trash-2", label: "Delete draft", hint: "Published forms are archived instead", danger: true }] }];
function builder(state, selIdx = 4) {
  const blank = state === "New blank form";
  const fields = blank ? [] : BUILD_FIELDS, f = fields[selIdx];
  const list = fields.length ? `<ol class="space-y-0.5">${fields.map((x, i) => `<li><button type="button" data-pick="${i}" class="${i === selIdx ? R.navItemOn : R.navItem} !text-[13px]" aria-current="${i === selIdx}">${I("grip-vertical", "!size-3.5 !text-gray-300")}<span class="w-4 text-xs tabular-nums text-gray-400">${i + 1}</span>${I(x.icon)}<span class="truncate">${esc(x.label)}</span>${x.cond ? I("git-branch", "ms-auto !size-3.5 !text-gray-400") : ""}</button></li>`).join("")}</ol>`
    : `<div class="rounded-lg bg-gray-50 px-3 py-4 text-center"><p class="text-[13px] font-medium text-gray-800">No fields yet</p><p class="text-xs text-gray-500 mt-0.5">Pick a type below to add the first one.</p></div>`;
  const left = V2 ? v2BuilderRail(fields, selIdx, list, blank) : `<aside class="border-e border-gray-200/80 bg-white p-3 overflow-y-auto" aria-label="Form fields">
    <div class="flex items-center justify-between px-2 pt-1 pb-2"><h3 class="${R.groupTitle}">Form Fields</h3><span class="${R.count}">${fields.length}</span></div>${list}
    <p class="${R.navGroup} !pt-5">Add a field</p><div class="flex flex-wrap gap-1.5 px-1">${FIELD_TYPES.map(([t, ic]) => button(t, { v: "white", s: "xs", icon: ic, cls: "!px-2 [&_svg]:!text-gray-500" })).join("")}</div></aside>`;
  const paper = blank
    ? `<div class="${R.box} p-6"><input class="w-full text-lg font-semibold text-gray-800 placeholder:text-gray-400 outline-hidden" placeholder="Form title" aria-label="Form title" tabindex="-1" /><input class="w-full mt-1 text-sm text-gray-500 placeholder:text-gray-400 outline-hidden" placeholder="Shown below the title when patients open the form" aria-label="Form description" tabindex="-1" />
        <div class="mt-6 flex flex-col items-center gap-1 rounded-lg border border-dashed border-gray-300 px-6 py-10 text-center"><span class="flex items-center justify-center size-10 mb-2 rounded-lg bg-gray-100 text-gray-500">${I("plus", "size-5")}</span><p class="text-sm font-semibold text-gray-800">Add your first field</p><p class="${R.help}">Pick a type on the left, or import a PDF you already use.</p><div class="mt-3 flex gap-2">${button("Short Text", { v: "white", s: "sm", icon: "type" })}${button("Import PDF", { v: "quiet", s: "sm", icon: "upload" })}</div></div></div>`
    : `<div class="${R.box} p-6"><h2 class="text-lg font-semibold text-gray-800">Medical history</h2><p class="${R.secondary} mt-0.5">Takes about 4 minutes. Your answers go to Dr. Patel's team only.</p>
        <div class="mt-5 space-y-2">${V2 ? fields.map((x, i) => previewField(x, i, i === selIdx) + (i < fields.length - 1 ? v2AddBetween(i) : "")).join("") : fields.map((x, i) => previewField(x, i, i === selIdx)).join("")}</div></div>`;
  /* The right panel: a title bar, then flat sections whose lines run edge to edge */
  const psx = (body, cls = "") => `<section class="border-t border-gray-200/80 px-4 py-3.5 ${cls}">${body}</section>`;
  const swRow = (label, help, on, extra = "") => psx(`<div class="flex items-center justify-between gap-4"><div class="min-w-0"><p class="${R.label} flex items-center gap-1.5">${label}</p>${help ? `<p class="${R.help}">${help}</p>` : ""}</div>${sw(on, label.replace(/<[^>]+>/g, "").trim())}</div>${extra}`);
  const props = V4 ? v4BuilderProps(f, blank) : V2 ? v2BuilderProps(f, blank) : blank
    ? `<div class="flex h-12 items-center px-4"><h3 class="${R.groupTitle}">Form settings</h3></div>
        ${psx(`<div class="space-y-4"><div class="space-y-1.5"><span class="${R.label}">Category</span><button type="button" class="${R.select}">Clinical${I("chevrons-up-down")}</button></div>
          <div class="space-y-1.5"><span class="${R.label}">Document folder</span><button type="button" class="${R.select}">Patient Forms${I("chevrons-up-down")}</button><p class="${R.help}">Where the signed PDF is saved in the chart.</p></div></div>`)}
        ${swRow("Ask for a signature", "Adds a signature at the end.", true)}
        ${swRow("Offer in Spanish", "Asha translates it when you publish.", false)}`
    : `<div class="flex h-12 items-center justify-between px-4"><h3 class="${R.groupTitle}">Field properties</h3><span class="-me-1.5">${iconButton("x", "Close properties", { s: "iconXs" })}</span></div>
      ${psx(`<div class="space-y-4">
        <div class="space-y-1.5"><span class="${R.label}">Type</span><button type="button" class="${R.select}"><span class="inline-flex items-center gap-2">${I(f.icon, "!text-gray-500")}${f.type}</span>${I("chevrons-up-down")}</button></div>
        <div class="space-y-1.5"><label class="${R.label}" for="fb-l">Field label</label><input id="fb-l" class="${R.input}" value="${esc(f.label)}" /></div>
        <div class="space-y-1.5"><label class="${R.label}" for="fb-h">Helper text</label><input id="fb-h" class="${R.input}" value="${esc(f.help || "")}" placeholder="Optional help text" /></div></div>`)}
      ${swRow("Required", "", !!f.req)}
      ${psx(`<div class="flex items-center justify-between gap-4"><div class="min-w-0"><p class="${R.label}">Save to chart</p><p class="${R.help}">Fills the patient's chart field.</p></div><button type="button" class="${R.selectSm} !w-32">${f.chart || "None"}${I("chevrons-up-down")}</button></div>`)}
      ${swRow(`Conditional logic ${I("info", "size-3.5 text-gray-400")}`, "Only ask this after a certain answer.", !!f.cond,
        f.cond ? `<div class="asha-reveal mt-3 space-y-2"><p class="text-xs font-medium text-gray-500">Show this field when:</p><button type="button" class="${R.selectSm}"><span class="truncate">Are you taking any medicines?</span>${I("chevrons-up-down")}</button><div class="grid grid-cols-[72px_1fr] gap-2"><button type="button" class="${R.selectSm}">is${I("chevrons-up-down")}</button><button type="button" class="${R.selectSm}">Yes${I("chevrons-up-down")}</button></div></div>` : "")}
`;
  return `${workspaceHeader({ parent: "Forms", title: blank ? "Untitled form" : "Medical history", actions: `<span class="inline-flex items-center gap-1.5 me-2 text-xs text-gray-500">${blank ? "Not saved yet" : `${I("check", "size-3.5")}Draft saved`}</span>${segmented([`${I("wrench", "size-3.5")}Build`, `${I("eye", "size-3.5")}Preview`], 0, { sm: true })}${iconButton("languages", "Translate", { s: "iconSm" })}${V4 ? `<span class="inline-flex"${chg4("The ⋯ menu is the standard Actions menu: searchable and grouped, with greyed rows that say why they can't run yet")}>${actionsMenu(v4BuilderActions(blank), { dots: true, up: false, align: "end", open: V4_OPTS.open })}</span>` : iconButton("ellipsis", "Form actions", { s: "iconSm" })}${button("Publish", { v: "solid", s: "sm", attrs: blank ? "disabled" : "" })}` })}
    <div class="grid ${V2 ? "grid-cols-[280px_1fr_300px]" : "grid-cols-[256px_1fr_300px]"} h-[700px]">${left}
      <div class="min-w-0 overflow-y-auto bg-gray-50/80 px-8 py-6" data-scroll-ok>${paper}</div>
      <aside class="border-s border-gray-200/80 bg-white overflow-y-auto" aria-label="${blank ? "Form settings" : "Field properties"}">${props}</aside></div>`;
}
defineBlock({
  cat: "forms", id: "forms-builder",
  title: "Form builder",
  note: "Fields and field types on the left, the form as patients see it in the middle, and the picked field's settings on the right, including 'Show this field when'. Click any field to pick it.",
  where: "Communications › Forms › Edit form",
  states: ["Editing a field", "New blank form"],
  canvas: "bare",
  html: (state) => builder(state),
  mount: (el, state) => {
    if (V2) { el.onclick = (e) => { const add = e.target.closest("[data-v2-add-field]"), menu = el.querySelector("[data-v2-field-menu]");
        if (add) { if (menu) menu.hidden = !menu.hidden; return; } if (menu && !e.target.closest("[data-v2-field-menu]")) menu.hidden = true;
        const p = e.target.closest("[data-pick]"); if (state === "New blank form" || !p || e.target.closest("[aria-label='Delete field'],[aria-label='Duplicate field']")) return;
        el.innerHTML = builder(state, +p.dataset.pick); icons(); }; return; }
    if (state === "New blank form") { el.onclick = null; return; }
    el.onclick = (e) => { const p = e.target.closest("[data-pick]"); if (!p || e.target.closest("[aria-label='Delete field'],[aria-label='Duplicate field']")) return;
      el.innerHTML = builder(state, +p.dataset.pick); icons(); };
  }
});

/* ================================================================ 3. Patient intake on a phone */
const PT = DATA.patient("p9");
const bigChoice = (t, on) => `<button type="button" aria-pressed="${on}" class="flex h-12 items-center gap-3 rounded-lg border px-4 text-base cursor-pointer ${on ? "border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600" : "border-gray-200 bg-white text-gray-800"}"><span class="flex size-5 items-center justify-center rounded-full border ${on ? "border-blue-600 bg-blue-600" : "border-gray-300"}">${on ? '<span class="size-2 rounded-full bg-white"></span>' : ""}</span>${t}</button>`;
const pill = (t, on) => `<button type="button" aria-pressed="${on}" class="inline-flex h-10 items-center gap-1.5 rounded-lg border px-3.5 text-[15px] cursor-pointer ${on ? "border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600" : "border-gray-200 bg-white text-gray-800"}">${on ? I("check", "size-4") : ""}${t}</button>`;
const bigBtn = (t, v = "solid", attrs = "") => `<button type="button" class="${cx(R.btn, R[v], "h-12 w-full text-base rounded-lg")}" ${attrs}>${t}</button>`;
function phone(screen) {
  return `<div class="mx-auto w-[410px] rounded-[54px] bg-gray-900 p-2.5 shadow-[0_24px_48px_-12px_rgba(17,24,39,0.35)]">
    <div class="relative flex h-[844px] w-[390px] flex-col overflow-hidden rounded-[44px] bg-white">
      <div class="flex h-12 shrink-0 items-end justify-between px-8 pb-1.5 text-[15px] font-semibold text-gray-900"><span class="tabular-nums">9:08</span><span class="absolute left-1/2 top-2.5 h-7 w-28 -translate-x-1/2 rounded-full bg-gray-900"></span><span class="flex items-center gap-1.5">${I("signal", "size-4")}${I("wifi", "size-4")}${I("battery-full", "size-5")}</span></div>
      ${screen}
      <span class="absolute bottom-2 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-gray-900"></span></div></div>`;
}
const intakeTop = (step, name, back = true) => `<div class="shrink-0 px-5 pt-2 pb-4 border-b border-gray-200/80">
  <div class="flex items-center justify-between h-10">${back ? `<button type="button" class="${cx(R.btn, R.ghost, "size-10 !px-0 -ms-2.5")}" aria-label="Back">${I("chevron-left", "!size-5")}</button>` : '<span class="size-10"></span>'}
    <span class="inline-flex items-center gap-2 text-sm font-semibold text-gray-800"><span class="flex size-6 items-center justify-center rounded-md bg-blue-600 text-[11px] font-semibold text-white" aria-hidden="true">B</span>Bayview Family Dental</span><span class="size-10"></span></div>
  ${step ? `<div class="mt-2 flex items-center justify-between text-[13px]"><span class="font-medium text-gray-800">${name}</span><span class="text-gray-500 tabular-nums">Step ${step} of 5</span></div><div class="mt-2">${Chart.meter(step, 5)}</div>` : ""}</div>`;
function intake(state) {
  if (state === "Done") return phone(`${intakeTop(0, "", false)}
    <div class="flex grow flex-col px-6 pt-10 pb-10">
      <span class="flex size-16 items-center justify-center rounded-full bg-blue-100 text-blue-700">${I("check", "size-8")}</span>
      <h1 class="mt-5 text-[26px] font-semibold leading-tight tracking-tight text-gray-900">You're all set, ${PT.name.split(" ")[0]}</h1>
      <p class="mt-2 text-base leading-6 text-gray-600">Bayview Family Dental has your forms. There's nothing else to fill in.</p>
      <div class="mt-6 rounded-lg border border-gray-200/80 p-4"><p class="text-[13px] font-medium text-gray-500">Your visit</p><p class="mt-1 text-lg font-semibold text-gray-900">Today at 9:30 AM</p><p class="text-[15px] text-gray-600">New patient exam with Dr. Maya Patel</p>
        <p class="mt-3 flex items-start gap-2 text-[15px] text-gray-600">${I("map-pin", "size-4 mt-1 shrink-0 text-gray-400")}1200 Bay Street, Suite 200<br />Oakland, CA</p></div>
      <div class="mt-4 space-y-2.5">${bigBtn(`${I("calendar-plus", "!size-5")}Add to calendar`, "white")}${bigBtn(`${I("navigation", "!size-5")}Get directions`, "white")}</div>
      <button type="button" class="mt-5 inline-flex items-center justify-center gap-2 text-[15px] font-medium text-blue-600 hover:underline underline-offset-4">${I("download", "size-4")}Download a copy of your forms</button>
      <p class="mt-auto text-center text-[13px] text-gray-500">You can close this page.</p></div>`);
  if (state === "Review & sign" && V2) return phone(`${intakeTop(5, "Check and sign")}
    <div class="grow overflow-hidden px-5 pt-5">
      <h1 class="text-[22px] font-semibold tracking-tight text-gray-900">Check your answers</h1>
      <div class="-mx-5 mt-3 divide-y divide-gray-200/80 border-y border-gray-200/80"${chg("Each answer group is one big tappable row with a chevron, instead of small blue Edit links down the edge")}>${[["About you", `${PT.name}, born ${fmtDateY(PT.dob)}`], ["Insurance", "No dental insurance. I'll pay at the visit."], ["Your health", "Medicines: Lisinopril 10 mg, once a day<br />Allergies: Latex"]].map(([h, b]) => `<button type="button" class="flex min-h-14 w-full items-center gap-3 px-5 py-2.5 text-start active:bg-gray-50 cursor-pointer" aria-label="Change ${h}"><span class="min-w-0 grow"><span class="block text-[13px] font-medium text-gray-500">${h}</span><span class="mt-0.5 block text-[15px] leading-6 text-gray-800">${b}</span></span>${I("chevron-right", "size-5 shrink-0 text-gray-400")}</button>`).join("")}</div>
      <div class="mt-3 space-y-3"${chg("Each agreement names its notice as one link in the sentence, instead of a separate Read link on the right")}>${[["I've read the ", "privacy notice (HIPAA)", ""], ["I agree to the ", "financial policy", ""]].map(([pre, link, post]) => `<label class="flex items-center gap-3 text-[15px] text-gray-800"><input type="checkbox" class="${R.checkbox} !size-5" checked /><span>${pre}<button type="button" class="font-medium text-blue-600 underline underline-offset-4 decoration-blue-600/30">${link}</button>${post}</span></label>`).join("")}</div>
      <div class="mt-4"><p class="text-[15px] font-medium text-gray-800">Sign with your finger</p>
        <div class="relative mt-2 h-28 rounded-lg border border-gray-200 bg-gray-50"><div class="absolute inset-x-5 top-3">${SIGNATURE(PT.name, "h-16")}</div><div class="absolute inset-x-5 bottom-6 flex items-end gap-2"><span class="text-gray-400">×</span><span class="grow border-b border-gray-300"></span></div>
          <span class="absolute end-1.5 top-1.5"${chg("Clear is a quiet button inside the signature box, so Sign and send is the only blue thing")}>${button("Clear", { v: "quiet", s: "xs" })}</span></div>
        <p class="mt-2 text-[13px] text-gray-500">Signing as ${PT.name} · ${fmtDateY(TODAY)}</p></div></div>
    <div class="shrink-0 border-t border-gray-200/80 px-5 pt-3 pb-7">${bigBtn("Sign and send")}</div>`);
  if (state === "Review & sign") return phone(`${intakeTop(5, "Check and sign")}
    <div class="grow overflow-hidden px-5 pt-5">
      <h1 class="text-[22px] font-semibold tracking-tight text-gray-900">Check your answers</h1>
      <div class="-mx-5 mt-3 divide-y divide-gray-200/80 border-y border-gray-200/80">${[["About you", `${PT.name}, born ${fmtDateY(PT.dob)}`], ["Insurance", "No dental insurance. I'll pay at the visit."], ["Your health", "Medicines: Lisinopril 10 mg, once a day<br />Allergies: Latex"]].map(([h, b]) => `<div class="px-5 py-2.5"><div class="flex items-center justify-between"><p class="text-[13px] font-medium text-gray-500">${h}</p><button type="button" class="text-[15px] font-medium text-blue-600">Edit</button></div><p class="mt-0.5 text-[15px] leading-6 text-gray-800">${b}</p></div>`).join("")}</div>
      <div class="mt-3 space-y-3">${[["I've read the privacy notice (HIPAA)"], ["I agree to the financial policy"]].map(([t]) => `<label class="flex items-center gap-3 text-[15px] text-gray-800"><input type="checkbox" class="${R.checkbox} !size-5" checked />${t}<button type="button" class="ms-auto text-[15px] font-medium text-blue-600">Read</button></label>`).join("")}</div>
      <div class="mt-4"><div class="flex items-center justify-between"><p class="text-[15px] font-medium text-gray-800">Sign with your finger</p><button type="button" class="text-[15px] font-medium text-blue-600">Clear</button></div>
        <div class="relative mt-2 h-28 rounded-lg border border-gray-200 bg-gray-50"><div class="absolute inset-x-5 top-3">${SIGNATURE(PT.name, "h-16")}</div><div class="absolute inset-x-5 bottom-6 flex items-end gap-2"><span class="text-gray-400">×</span><span class="grow border-b border-gray-300"></span></div></div>
        <p class="mt-2 text-[13px] text-gray-500">Signing as ${PT.name} · ${fmtDateY(TODAY)}</p></div></div>
    <div class="shrink-0 border-t border-gray-200/80 px-5 pt-3 pb-7">${bigBtn("Sign and send")}</div>`);
  return phone(`${intakeTop(3, "Your health")}
    <div class="grow overflow-hidden px-5 pt-5">
      <h1 class="text-[22px] font-semibold tracking-tight text-gray-900">A few health questions</h1>
      <p class="mt-1 text-[15px] leading-6 text-gray-500">This helps Dr. Patel keep you safe. Only your dental team sees it.</p>
      <fieldset class="mt-5"><legend class="text-base font-medium text-gray-900">Are you taking any medicines?</legend><div class="mt-2 grid grid-cols-2 gap-2">${bigChoice("Yes", true)}${bigChoice("No", false)}</div></fieldset>
      <div class="asha-reveal mt-4"><label class="text-base font-medium text-gray-900" for="in-med">Which ones, and how much?</label><p class="text-[13px] text-gray-500">Include vitamins and supplements.</p>
        <textarea id="in-med" class="${R.textarea} mt-2 !text-base !min-h-[72px]">Lisinopril 10 mg, once a day</textarea></div>
      <fieldset class="mt-5"><legend class="text-base font-medium text-gray-900">Are you allergic to any of these?</legend><p class="text-[13px] text-gray-500">Pick all that apply.</p><div class="mt-2 flex flex-wrap gap-2">${["Penicillin", "Latex", "Codeine", "Aspirin", "Local anesthetic", "None of these"].map((t) => pill(t, t === "Latex")).join("")}</div></fieldset>
</div>
    <div class="shrink-0 border-t border-gray-200/80 px-5 pt-3 pb-7">${bigBtn("Continue")}<p class="mt-2 flex items-center justify-center gap-1.5 text-[13px] text-gray-500">${I("check", "size-3.5")}Saved as you go · <button type="button" class="font-medium text-blue-600">Finish later</button></p></div>`);
}
defineBlock({
  cat: "forms", id: "forms-patient-intake",
  title: "Patient intake on a phone",
  note: "What a new patient sees after tapping the text link. Same colours and parts, but bigger: 16px text and 48px buttons, one question at a time, a follow-up that only appears after Yes, and nothing to log in to.",
  where: "Patient's phone › Secure form link",
  states: ["Filling", "Review & sign", "Done"],
  canvas: "gray",
  html: (state) => intake(state)
});

/* ================================================================ 4. Send form */
const SENT_TODAY = [HIST[0], HIST[1], HIST[2], HIST[3], HIST[4], HIST[5]];
function sendBody(method) {
  const first = PT.name.split(" ")[0];
  if (method === "Secure link") return `<div class="space-y-1.5"><span class="${R.label}">Secure link</span>
      <div class="flex items-center gap-3 rounded-lg border border-gray-200/80 p-3">${qr("isabella-np-packet", 64)}<div class="min-w-0 grow"><p class="truncate text-sm tabular-nums text-gray-800">forms.asha.health/b/7kq2-mx9p</p><p class="${R.caption} mt-0.5">Opens the packet for ${esc(PT.name)} only.</p>
        <div class="mt-2 flex gap-1.5">${button("Copy link", { v: "white", s: "xs", icon: "copy" })}${button("Open", { v: "quiet", s: "xs", icon: "external-link" })}</div></div></div></div>
    <div class="grid grid-cols-2 gap-3"><div class="space-y-1.5"><span class="${R.label}">Link expiration</span><button type="button" class="${R.select}">7 days${I("chevrons-up-down")}</button></div><div class="space-y-1.5"><span class="${R.label}">Language</span><button type="button" class="${R.select}">English${I("chevrons-up-down")}</button></div></div>
    ${note("Hand the check-in tablet over, or let them scan the code at the front desk.", "info")}`;
  if (method === "Email") return `<div class="space-y-1.5"><label class="${R.label}" for="sf-to">To</label><input id="sf-to" class="${R.input}" value="${first.toLowerCase()}.kim@example.com" /></div>
    <div class="space-y-1.5"><label class="${R.label}" for="sf-sub">Subject</label><input id="sf-sub" class="${R.input}" value="Your forms for Bayview Family Dental" /></div>
    <div class="space-y-1.5"><label class="${R.label}" for="sf-msg">Message</label><textarea id="sf-msg" class="${R.textarea} !min-h-24">Hi ${first}, please fill in your forms before your visit today at 9:30 AM. It takes about 8 minutes.</textarea><p class="${R.help}">The secure link is added under your message.</p></div>`;
  return `<div class="space-y-1.5"><span class="${R.label}">To</span><div class="flex h-9 items-center justify-between rounded-lg border border-gray-200 px-3 text-sm shadow-2xs"><span class="tabular-nums">${PT.phone}</span><span class="${R.caption}">Mobile · texts allowed</span></div></div>
    <div class="space-y-1.5"><label class="${R.label}" for="sf-txt">Message</label><textarea id="sf-txt" class="${R.textarea} !min-h-24">Hi ${first}, please fill in your forms for Bayview Family Dental before your visit today at 9:30 AM: {link}</textarea>
      <div class="flex items-center justify-between">${V2 ? `<span class="inline-flex"${chg("One Insert field menu (First name, Link, Form name) replaces three outlined chips, the same as in Reminders")}>${button("Insert field", { v: "quiet", s: "xs", icon: "braces", cls: "-ms-2", attrs: 'aria-haspopup="menu"' })}</span>` : `<div class="flex items-center gap-1.5"><span class="${R.caption}">Insert</span>${["First name", "Link", "Form name"].map((v) => `<button type="button" class="${cx(R.tag, R.tagOutline, "cursor-pointer hover:bg-gray-50")}">${v}</button>`).join("")}</div>`}<span class="text-xs tabular-nums text-gray-400">118 / 160</span></div></div>`;
}
const SEND_METHODS = ["Text", "Secure link", "Email"];
const sendDialog = (method) => `<div class="${R.dialog} !w-[456px] shrink-0" role="dialog" aria-label="Send Form to Patient">
  <div class="flex items-center justify-between h-13 px-5 border-b border-gray-200/80"><h3 class="text-base font-semibold text-gray-800">Send Form to Patient</h3>${iconButton("x", "Close", { s: "iconSm" })}</div>
  <div class="p-5 space-y-4">
    <div class="space-y-1.5"><span class="${R.label}">Patient</span><div class="flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-2.5 shadow-2xs">${avatar(PT.name, { size: 5 })}<span class="text-sm text-gray-800">${esc(PT.name)}</span><span class="text-[13px] text-gray-500">· New patient · visit today 9:30 AM</span><button type="button" class="ms-auto text-[13px] font-medium text-blue-600">Change</button></div></div>
    <div class="space-y-1.5"><span class="${R.label}">Forms</span><button type="button" class="${R.select}"${chg("The four form-name tags under the packet are gone: the select already says 4 forms, and the names are in its menu")}${V2 ? ` data-tip="New patient registration · Medical history · HIPAA acknowledgement · Financial policy"` : ""}><span class="inline-flex items-center gap-2">${I("folder", "!text-gray-500")}New patient packet <span class="text-gray-500">· 4 forms</span></span>${I("chevrons-up-down")}</button>
      ${V2 ? "" : `<div class="flex flex-wrap gap-1.5 pt-0.5">${["New patient registration", "Medical history", "HIPAA acknowledgement", "Financial policy"].map((t) => tag(t, "tagGray")).join("")}</div>`}</div>
    <div class="space-y-1.5"><span class="${R.label}">Send by</span><div data-send-method>${segmented([`${I("message-square")}Text`, `${I("link")}Secure link`, `${I("mail")}Email`], SEND_METHODS.indexOf(method))}</div></div>
    <div class="space-y-4" data-send-body>${sendBody(method)}</div></div>
  <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200/80" data-send-foot>${sendFoot(method)}</div></div>`;
/* v4: who, which forms, how and where it goes are one table of fields (How is a list; picking another redraws the
 * rows under it); the message stays a text box under the table */
const V4_SEND_FORMS = [["New patient packet", "4 forms"], ["Recall packet", "1 form"], ["Medical history update", ""], ["Consent for root canal treatment", ""], ["HIPAA acknowledgement", ""]];
const V4_SEND_ICON = { Text: "message-square", "Secure link": "link", Email: "mail" };
function v4SendDialog(method) {
  const first = PT.name.split(" ")[0];
  const rows = [
    { label: "Patient", value: PT.name, type: "select", options: DATA.patients.map((p) => p.name), html: (r) => `<span class="inline-flex items-center gap-2 min-w-0">${avatar(r.value, { size: 5 })}<span class="truncate">${esc(r.value)}</span>${r.value === PT.name ? '<span class="truncate text-gray-500">· visit today 9:30 AM</span>' : ""}</span>` },
    { label: "Forms", value: ["New patient packet"], type: "multi", options: V4_SEND_FORMS.map(([n, c]) => ({ value: n, label: c ? `${n} · ${c}` : n })) },
    { label: "Send by", value: method, type: "select", options: SEND_METHODS, html: (r) => `<span class="inline-flex items-center gap-2">${I(V4_SEND_ICON[r.value], "size-4 shrink-0 text-gray-400")}${esc(r.value)}</span>` },
    ...(method === "Text" ? [{ label: "To", value: PT.phone, type: "text", html: (r) => `<span class="tabular-nums">${esc(r.value)}</span> <span class="text-gray-500">· Mobile · texts allowed</span>` }]
      : method === "Email" ? [{ label: "To", value: `${first.toLowerCase()}.kim@example.com`, type: "text" }, { label: "Subject", value: "Your forms for Bayview Family Dental", type: "text" }]
      : [{ label: "Link lasts", value: "7 days", type: "select", options: ["24 hours", "3 days", "7 days", "30 days"] }, { label: "Language", value: "English", type: "select", options: ["English", "Spanish"] }])];
  const after = method === "Secure link" ? `<div class="flex items-center gap-3 rounded-lg border border-gray-200/80 p-3">${qr("isabella-np-packet", 64)}<div class="min-w-0 grow"><p class="truncate text-sm tabular-nums text-gray-800">forms.asha.health/b/7kq2-mx9p</p><p class="${R.caption} mt-0.5">Opens the packet for ${esc(PT.name)} only. Hand them the check-in tablet, or let them scan the code.</p>
        <div class="mt-2 flex gap-1.5">${button("Copy link", { v: "white", s: "xs", icon: "copy" })}${button("Open", { v: "quiet", s: "xs", icon: "external-link" })}</div></div></div>`
    : method === "Email" ? `<div class="space-y-1.5"><label class="${R.label}" for="sf-msg">Message</label><textarea id="sf-msg" class="${R.textarea} !min-h-24">Hi ${first}, please fill in your forms before your visit today at 9:30 AM. It takes about 8 minutes.</textarea><p class="${R.help}">The secure link is added under your message.</p></div>`
    : `<div class="space-y-1.5"><label class="${R.label}" for="sf-txt">Message</label><textarea id="sf-txt" class="${R.textarea} !min-h-24">Hi ${first}, please fill in your forms for Bayview Family Dental before your visit today at 9:30 AM: {link}</textarea>
      <div class="flex items-center justify-between">${button("Insert field", { v: "quiet", s: "xs", icon: "braces", cls: "-ms-2", attrs: 'aria-haspopup="menu"' })}<span class="text-xs tabular-nums text-gray-400">118 / 160</span></div></div>`;
  const pick = (r, k, v, g) => { if (r.label !== "Send by" || v === method) return; setTimeout(() => { const d = g.root.closest("[data-v4-send]"); if (d) { d.outerHTML = v4SendDialog(v); icons(); } }); };
  return `<div class="${R.dialog} !w-[456px] shrink-0" role="dialog" aria-label="Send Form to Patient" data-v4-send>
  <div class="flex items-center justify-between h-13 px-5 border-b border-gray-200/80"><h3 class="text-base font-semibold text-gray-800">Send Form to Patient</h3>${iconButton("x", "Close", { s: "iconSm" })}</div>
  <div class="p-5 space-y-4"><div${chg4("Who, which forms, how it's sent and where it goes are one table of fields you click and type into, like every dialog; Forms is a list you tick several in (a packet and a consent, say), and Send by redraws the rows under it")}>${fieldTable(rows, { labelW: 96, title: "Send forms", onCommit: pick })}</div>${after}</div>
  <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200/80">${sendFoot(method)}</div></div>`;
}
const sendFoot = (m) => (m === "Secure link" ? button("Done", { v: "solid", s: "sm" }) : `${button("Cancel", { v: "white", s: "sm" })}${button(m === "Text" ? "Send text" : "Send email", { v: "solid", s: "sm", icon: "send" })}`);
const trackRow = (h) => { const p = DATA.patient(h.pt);
  return `<li class="px-4 py-3"><div class="flex items-center gap-2 mb-2.5">${avatar(p.name, { size: 6 })}<span class="text-sm font-medium text-gray-800">${esc(p.name)}</span><span class="truncate text-[13px] text-gray-500">· ${esc(h.form)}</span>
    <span class="ms-auto flex h-7 shrink-0 items-center">${h.step === 1 ? alertMark(h.expired ? "Link expired" : "Not opened in 2 days", h.expired ? `The link to ${esc(p.name)} expired on ${fmtDate(h.at.slice(0, 10))} before it was opened.` : `${esc(p.name)} hasn't opened the link sent ${when(h.at)}. A new text usually does it.`, { action: button("Resend", { v: "white", s: "xs", icon: "rotate-cw" }) }) : h.step >= 3 ? button("View", { v: "white", s: "xs" }) : `<span class="${R.caption}">By ${h.how.toLowerCase()}</span>`}</span></div>${sendTrack(h, { compact: true })}</li>`; };
/* v2 "Sent this week": a section grid, one row per sent form. Status is the furthest step reached (hover for every step
 * and its time); a link not opened in 2 days, or expired, is grey words with an orange icon. */
const v2StepTip = (h) => SEND_STEPS.map((st, i) => `${st} ${i < h.step ? timeOf(h.times[i]) : "not yet"}`).join(" · ");
const v2SentCols = () => [
  { key: "pt", label: "Patient", w: 148, open: true, kind: "text", value: (h) => DATA.patient(h.pt).name, lead: (h) => avatar(DATA.patient(h.pt).name, { size: 5 }), render: (h) => esc(DATA.patient(h.pt).name) },
  { key: "form", label: "Form", w: 164, kind: "text", render: (h) => esc(h.form) },
  { key: "status", label: "Status", w: 160, kind: "text", value: (h) => histStatus(h)[0], render: (h) => {
    const p = DATA.patient(h.pt), alert = h.step === 1 && (h.expired ? "Link expired" : "Not opened in 2 days");
    const why = h.expired ? `The link to ${esc(p.name)} expired on ${fmtDate(h.at.slice(0, 10))} before it was opened. Open the row to send a new one.` : `${esc(p.name)} hasn't opened the link sent ${when(h.at)}. Open the row to resend it.`;
    return alert ? `<span class="inline-flex items-center gap-1 text-[13px] text-gray-500" data-tip="${why}">${I("circle-alert", "size-3.5 shrink-0 text-orange-500")}${alert}</span>`
      : `<span class="cursor-default text-gray-800" data-tip="${v2StepTip(h)}">${histStatus(h)[0]}</span>`; } },
  { key: "when", label: "When", w: 88, kind: "text", value: (h) => h.times[h.step - 1], render: (h) => { const t = h.times[h.step - 1]; return `<span class="text-gray-500 tabular-nums" title="${when(t)}">${t.slice(0, 10) === TODAY ? timeOf(t) : fmtDate(t.slice(0, 10))}</span>`; } }
];
/* v4: the status says how far the form got; the time of every step is in the row's card (no tip on the status) */
const v4SentCols = () => v2SentCols().map((c) => (c.key === "status" ? Object.assign(c, { label: `<span${chg4("Point at a row to see every step (sent, opened, completed, signed) with its time in a card, instead of a hover tip on the status word")}>Status</span>`,
  render: (h) => { const alert = h.step === 1 && (h.expired ? "Link expired" : "Not opened in 2 days");
    return alert ? `<span class="inline-flex items-center gap-1 text-[13px] text-gray-500">${I("circle-alert", "size-3.5 shrink-0 text-orange-500")}${alert}</span>` : esc(histStatus(h)[0]); } }) : c));
defineBlock({
  cat: "forms", id: "forms-send",
  title: "Send a form",
  note: "Send by text, secure link or email, then follow each one through Link sent, Form opened, Completed and Signed by patient. The Send by switch works.",
  where: "Forms › Send to Patient",
  states: SEND_METHODS,
  canvas: "gray",
  html: (state) => `<div class="flex items-start gap-6">${V4 ? v4SendDialog(state) : sendDialog(state)}
    <section class="min-w-0 grow"><div class="flex items-center justify-between mb-2"><h3 class="${R.groupTitle} flex items-center gap-2">Sent this week <span class="${R.count}">${SENT_TODAY.length}</span></h3>${button("See all in History", { v: "white", s: "xs" })}</div>
      ${V2 ? `<div data-grid="sent-week"${chg("Sent forms are a table (Patient, Form, Status, When) at 36px rows instead of 24 mini step trackers; hover a status for every step and its time")}></div>` : `<ol class="${R.box} divide-y divide-gray-200/80">${SENT_TODAY.map(trackRow).join("")}</ol>`}</section></div>`,
  mount: (el) => {
    if (V2) { const host = el.querySelector('[data-grid="sent-week"]'); if (host) new Grid(host, Object.assign({ preset: "section", columns: v2SentCols(), rows: SENT_TODAY, title: "Sent this week", sortable: false, maxHeight: 600, onOpen: openHistSheet }, V4 ? { columns: v4SentCols(), peek: v4HistPeek } : {})); }
    el.onclick = (e) => { const b = e.target.closest("[data-send-method] [data-seg]"); if (!b) return; const m = SEND_METHODS[+b.dataset.seg];
      el.querySelector("[data-send-body]").innerHTML = sendBody(m); el.querySelector("[data-send-foot]").innerHTML = sendFoot(m); icons(); };
  }
});

/* ================================================================ 5. Documents with AI filing review */
const FOLDERS = [["folder-open", "All documents", 1284], ["inbox", "Miscellaneous", 7], ["clipboard-list", "Patient Forms", 412], ["file-check", "Consent Forms", 96], ["shield-check", "Insurance Verification", 188], ["scan", "Imaging & Radiographs", 231], ["receipt", "EOBs & Remittances", 164], ["sticky-note", "Clinical Notes", 58], ["flask-conical", "Lab Cases", 41], ["send", "Referrals", 29], ["mail", "Correspondence", 33], ["file-text", "Treatment Plans", 25]];
const DOCS = [
  { id: "d1", name: "Scan 2026-09-25 08-12.pdf", kind: "pdf", pt: "p9", folder: "Patient Forms", title: "New patient registration, Sep 25", why: "Name and date of birth on page 1 match the chart.", size: "1.2 MB", pages: 3, at: "2026-09-25T08:12", by: "Front desk scanner" },
  { id: "d2", name: "Fax from Bay Oral Surgery.pdf", kind: "pdf", pt: "p13", folder: "Referrals", title: "Referral letter from Bay Oral Surgery", why: "Patient name and date of birth are in the fax header.", size: "640 KB", pages: 2, at: "2026-09-25T07:48", by: "Fax line" },
  { id: "d3", name: "IMG_4471.jpg", kind: "img", pt: "p1", folder: "Insurance Verification", title: "Insurance card, front", why: "Member ID matches the Delta Dental plan on file.", size: "2.8 MB", pages: 1, at: "2026-09-25T07:31", by: "Marcus Lee" },
  { id: "d4", name: "Lab slip 4471.pdf", kind: "pdf", pt: "p8", folder: "Lab Cases", title: "Bayview Ceramics lab slip, crown #30", why: "Case number matches the open lab case.", size: "310 KB", pages: 1, at: "2026-09-24T16:05", by: "Marcus Lee" },
  { id: "d5", name: "consent_signed.pdf", kind: "pdf", pt: "p2", folder: "Consent Forms", title: "Root canal consent, signed Sep 24", why: "Signed on the front desk pad for this patient.", size: "220 KB", pages: 2, at: "2026-09-24T14:40", by: "Signature pad" },
  { id: "d6", name: "document (3).pdf", kind: "pdf", pt: null, folder: "Miscellaneous", title: "", why: "The patient details could not be matched safely.", size: "95 KB", pages: 1, at: "2026-09-24T11:02", by: "Nina Flores" },
  { id: "d7", name: "Pano 2026-09-24.jpg", kind: "img", pt: "p5", folder: "Imaging & Radiographs", title: "Panoramic x-ray, Sep 24", why: "Taken on the imaging computer during her visit.", size: "4.1 MB", pages: 1, at: "2026-09-24T10:18", by: "X-ray imaging (SOTA)" }
];
const docIcon = (d) => (d.kind === "img" ? "image" : "file-text");
const docActions = (d) => `<div class="flex items-center gap-1">${d.pt ? button("Accept", { v: "soft", s: "xs", attrs: `data-doc="accept" data-id="${d.id}"` }) + button("Change", { v: "quiet", s: "xs" }) : button("Choose patient", { v: "white", s: "xs" })}</div>`;
const docCols = () => [
  { key: "name", label: "Document", icon: "file", w: 198, open: true, kind: "text", lead: (d) => fileMark(docIcon(d)), render: (d) => esc(d.name) },
  { key: "pt", label: "Suggested patient", icon: "user", w: 174, kind: "text", value: (d) => (d.pt ? DATA.patient(d.pt).name : ""), render: (d) => (d.pt ? `<span class="inline-flex items-center gap-x-2">${avatar(DATA.patient(d.pt).name, { size: 5 })}${esc(DATA.patient(d.pt).name)}</span>` : flag("No safe match")) },
  { key: "folder", label: "Folder", icon: "folder", w: 180, kind: "text", render: (d) => (d.pt ? esc(d.folder) : `<span class="text-gray-500">${esc(d.folder)}</span>`) },
  { key: "at", label: "Uploaded", icon: "calendar", w: 132, kind: "date", render: (d) => (d.at.slice(0, 10) === TODAY ? `Today ${timeOf(d.at)}` : fmtDate(d.at.slice(0, 10))) },
  { key: "act", label: "Filing", icon: "sparkles", w: 156, kind: "text", value: () => "", render: docActions }
];
/* v2 documents: one solid action (Accept all), white per-row Accept with Change moved into the opened row, the AI's title
 * as the document name (file name on hover) and its reason on hover of the suggested patient */
const v2DocActions = (d) => `<div class="flex items-center gap-1">${d.pt ? button("Accept", { v: "white", s: "xs", attrs: `data-doc="accept" data-id="${d.id}"` }) : button("Choose patient", { v: "white", s: "xs" })}</div>`;
const v2DocCols = () => [
  { key: "name", label: "Document", icon: "file", w: 244, open: true, kind: "text", value: (d) => d.title || d.name, lead: (d) => fileMark(docIcon(d)), render: (d) => `<span title="${esc(d.name)}">${esc(d.title || d.name)}</span>` },
  { key: "pt", label: "Suggested patient", icon: "user", w: 184, kind: "text", value: (d) => (d.pt ? DATA.patient(d.pt).name : ""), render: (d) => (d.pt ? `<span class="inline-flex items-center gap-x-2" data-tip="${esc(d.why)}">${avatar(DATA.patient(d.pt).name, { size: 5 })}${esc(DATA.patient(d.pt).name)}</span>` : `<span data-tip="${esc(d.why)}">${flag("No safe match")}</span>`) },
  { key: "folder", label: "Folder", icon: "folder", w: 148, kind: "text", render: (d) => (d.pt ? esc(d.folder) : `<span class="text-gray-500">${esc(d.folder)}</span>`) },
  { key: "at", label: "Uploaded", icon: "calendar", w: 126, kind: "date", render: (d) => (d.at.slice(0, 10) === TODAY ? `Today ${timeOf(d.at)}` : fmtDate(d.at.slice(0, 10))) },
  { key: "act", label: `<span${chg("Accept is a white button on each row and Change moved into the opened document, so 'Accept all' is the one blue action")}>Filing</span>`, icon: "sparkles", w: 144, kind: "text", value: () => "", render: v2DocActions }
];
const v2AcceptAll = (rows) => (rows.some((d) => d.pt) ? `<span class="inline-flex"${chg("Accept all is the one solid button on the page; Upload steps back to white while you review")}>${button(`Accept all ${rows.filter((d) => d.pt).length}`, { v: "solid", s: "sm", icon: "check-check" })}</span>` : "");
const v2ViewSwitch = (view) => `<div data-doc-view${chg("List and Grid moved into the toolbar; the All Documents / Review Queue tab row is gone because the sidebar already names the queue")}>${segmented([`${I("list")}List`, `${I("layout-grid")}Grid`], view === "Grid" ? 1 : 0, { sm: true })}</div>`;
/* v4: where Asha would file a document is two cells in the queue (patient and folder), so Change is gone: click the
 * cell and pick, or just start typing. Accept stays on each row. */
const V4_DOC_FOLDERS = () => FOLDERS.slice(1).map(([, l]) => l);
const V4_DOC_PATIENTS = () => DATA.patients.map((p) => ({ value: p.id, label: p.name }));
const v4DocPt = (d) => (d.pt && d.pt !== "none" ? DATA.patient(d.pt) : null);
const v4DocCols = () => v2DocCols().map((c) => (c.key === "pt" ? Object.assign(c, { edit: "select", options: V4_DOC_PATIENTS, label: `<span${chg4("Patient and folder are cells you change right in the queue (click and pick, or just type), so the Change button is gone")}>Suggested patient</span>`,
    render: (d) => { const p = v4DocPt(d); return p ? `<span class="inline-flex items-center gap-x-2 min-w-0">${avatar(p.name, { size: 5 })}<span class="truncate">${esc(p.name)}</span></span>` : `<span class="inline-flex items-center gap-1.5 text-gray-500">${I("circle-alert", "size-3.5 shrink-0 text-orange-500")}No safe match</span>`; } })
  : c.key === "folder" ? Object.assign(c, { edit: "select", options: V4_DOC_FOLDERS, render: (d) => esc(d.folder) })
  : c.key === "name" ? Object.assign(c, { label: `<span${chg4("Point at a document to see why Asha picked that patient, the file's own name, its size and who uploaded it, in one card beside the row; the reason used to hide behind the patient's name")}>Document</span>` })
  : c.key === "act" ? Object.assign(c, { label: `<span${chg4("Filing shows something on every row: Accept where Asha found the patient, and a grey “Pick a patient” where it couldn't, instead of a blank cell")}>Filing</span>`, render: (d) => (v4DocPt(d) ? button("Accept", { v: "white", s: "xs", attrs: `data-act="doc-accept" data-doc="accept" data-id="${d.id}"` }) : `<span class="text-[13px] text-gray-500">Pick a patient</span>`) }) : c));
/* v4: why Asha picked that patient, the file's own name, its size and who uploaded it open in a card when you point at the row */
const v4DocPeek = (d) => peekCard(esc(d.title || d.name), [["File", esc(d.name)], ["Size", `${d.size} · ${d.pages} ${d.pages === 1 ? "page" : "pages"}`], ["Uploaded by", esc(d.by)]], esc(d.why));
function v4OpenDocSheet(d) {
  const p = v4DocPt(d);
  Sheet.open({
    flush: true, title: esc(d.name), lead: `<span class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-200/80 bg-white text-gray-500">${I(docIcon(d), "size-4")}</span>`,
    subtitle: `${d.pages} ${d.pages === 1 ? "page" : "pages"} · ${d.size} · uploaded by ${esc(d.by)}`,
    actions: iconButton("download", "Download", { s: "iconSm" }) + iconButton("printer", "Print", { s: "iconSm" }),
    body: `<section class="${R.psec} !py-4"><div class="${R.boxMuted} flex h-56 items-center justify-center"><div class="h-48 w-36 rounded-sm bg-white shadow-sm p-3 space-y-1.5">${[70, 90, 60, 85, 40, 80, 75, 55].map((w) => `<span class="block h-1.5 rounded-full bg-gray-200" style="width:${w}%"></span>`).join("")}</div></div></section>
      ${psec("Where Asha would file it", `<div${chg4("Where it goes is a table you type into: pick the patient or folder, or retype the title, right here; the Change button is gone")}>${fieldTable([
        { label: "Patient", value: p ? p.id : "", type: "select", options: V4_DOC_PATIENTS(), html: (r) => { const q = DATA.patient(r.value); return q ? `<span class="inline-flex items-center gap-2 min-w-0">${avatar(q.name, { size: 5 })}<span class="truncate">${esc(q.name)}</span><span class="text-gray-500 tabular-nums">· born ${fmtDateY(q.dob)}</span></span>` : esc(r.value); } },
        { label: "Folder", value: d.folder, type: "select", options: V4_DOC_FOLDERS() },
        { label: "New title", value: d.title, type: "text" }], { title: "Where Asha would file it" })}</div>
        <div class="mt-3 -mb-1.5">${infoRow(p ? "sparkles" : "circle-alert", p ? esc(d.why) : "The patient details could not be matched safely. Pick the patient above and Asha files it from there.", { tone: p ? "blue" : "needs" })}</div>`)}`,
    footer: p ? button("Accept", { v: "solid", s: "sm", icon: "check" }) : `${button("Keep in Miscellaneous", { v: "white", s: "sm" })}${button("Accept", { v: "solid", s: "sm", icon: "check" })}`
  });
}
function openDocSheet(d) {
  if (V4) return v4OpenDocSheet(d);
  const p = d.pt && DATA.patient(d.pt);
  Sheet.open({
    flush: true, title: esc(d.name), lead: `<span class="flex size-9 shrink-0 items-center justify-center rounded-lg border border-gray-200/80 bg-white text-gray-500">${I(docIcon(d), "size-4")}</span>`,
    subtitle: `${d.pages} ${d.pages === 1 ? "page" : "pages"} · ${d.size} · uploaded by ${esc(d.by)}`,
    actions: iconButton("download", "Download", { s: "iconSm" }) + iconButton("printer", "Print", { s: "iconSm" }),
    body: `<section class="${R.psec} !py-4"><div class="${R.boxMuted} flex h-56 items-center justify-center"><div class="h-48 w-36 rounded-sm bg-white shadow-sm p-3 space-y-1.5">${[70, 90, 60, 85, 40, 80, 75, 55].map((w) => `<span class="block h-1.5 rounded-full bg-gray-200" style="width:${w}%"></span>`).join("")}</div></div></section>
      ${psec("Where Asha would file it", `${metaGrid([["Patient", p ? `<span class="inline-flex items-center gap-2">${avatar(p.name, { size: 5 })}${esc(p.name)}</span>` : '<span class="text-gray-400">Not matched</span>'], ["Born", p ? fmtDateY(p.dob) : '<span class="text-gray-400">—</span>'], ["Folder", esc(d.folder)], ["New title", d.title ? esc(d.title) : '<span class="text-gray-400">Keep current title</span>']], 2)}
        <div class="mt-3 -mb-1.5">${infoRow(p ? "sparkles" : "circle-alert", p ? esc(d.why) : "The patient details could not be matched safely. Pick the patient and Asha files it from there.", { tone: p ? "blue" : "needs" })}</div>`)}`,
    footer: p ? `${button("Change", { v: "white", s: "sm" })}${button("Accept", { v: "solid", s: "sm", icon: "check" })}` : `${button("Keep in Miscellaneous", { v: "white", s: "sm" })}${button("Choose patient", { v: "solid", s: "sm" })}`
  });
}
function docCard(d) {
  const p = d.pt && DATA.patient(d.pt);
  return `<article class="${R.box} overflow-hidden"><button type="button" class="block w-full cursor-pointer" data-doc-open="${d.id}" data-opens-sheet aria-label="Open ${esc(d.name)}">
    <div class="flex h-28 items-center justify-center bg-gray-50 border-b border-gray-200/80">${d.kind === "img" ? `<div class="flex h-20 w-28 items-center justify-center rounded-sm bg-gray-200 text-gray-400">${I("image", "size-6")}</div>` : `<div class="h-24 w-[72px] rounded-sm bg-white shadow-sm p-2 space-y-1">${[80, 60, 90, 50, 70, 85].map((w) => `<span class="block h-1 rounded-full bg-gray-200" style="width:${w}%"></span>`).join("")}</div>`}</div></button>
    <div class="p-3"><p class="truncate text-sm font-medium text-gray-800"${V2 ? ` title="${esc(d.name)}"` : ""}>${esc(V2 ? d.title || d.name : d.name)}</p>
      <p class="mt-1 flex items-center gap-1.5 text-[13px] text-gray-500 truncate">${p ? `${I("user", "size-3.5 shrink-0 text-gray-400")}${esc(p.name)}` : flag("No safe match", "!text-[13px]")}</p>
      <p class="flex items-center gap-1.5 text-[13px] text-gray-500 truncate">${I("folder", "size-3.5 shrink-0 text-gray-400")}${esc(d.folder)}</p>
      <div class="mt-2.5">${V2 ? v2DocActions(d) : docActions(d)}</div></div></article>`;
}
function docsMain(view, rows) {
  if (view === "Grid" && V2) return `<div class="flex items-center gap-2 py-2.5"><button type="button" class="${cx(R.btn, R.sm, R.ghost, "-ms-2")}">Review Queue <span class="${R.count}">${rows.length}</span>${I("chevron-down", "!text-gray-400")}</button><span class="h-5 border-s border-gray-200/80"></span>${searchBox("Search documents", { w: "w-48" })}${button("Filter", { v: "quiet", s: "sm", icon: "list-filter" })}<div class="ms-auto flex items-center gap-1.5">${v2ViewSwitch("Grid")}${v2AcceptAll(rows)}</div></div>
    <div class="grid grid-cols-3 gap-3 pb-1">${rows.map(docCard).join("")}</div>`;
  if (view === "Grid") return `<div class="flex items-center gap-2 py-2.5"><button type="button" class="${cx(R.btn, R.sm, R.ghost, "-ms-2")}">Review Queue <span class="${R.count}">${rows.length}</span>${I("chevron-down", "!text-gray-400")}</button><span class="h-5 border-s border-gray-200/80"></span>${searchBox("Search documents", { w: "w-48" })}${button("Filter", { v: "quiet", s: "xs", icon: "list-filter" })}<div class="ms-auto">${rows.some((d) => d.pt) ? button(`Accept all ${rows.filter((d) => d.pt).length}`, { v: "soft", s: "sm", icon: "check-check" }) : ""}</div></div>
    <div class="grid grid-cols-4 gap-3 pb-1">${rows.map(docCard).join("")}</div>`;
  return `<div data-grid="docs"></div>`;
}
defineBlock({
  cat: "forms", id: "forms-documents",
  title: "Documents with AI filing review",
  note: "The Review Queue: documents Asha wasn't sure enough to file on its own. Each shows the patient and folder Asha would use and why, with Accept and Change. List and grid views; Accept takes the row out.",
  where: "PMS › Documents › Review Queue",
  states: ["List", "Grid", "Nothing to review"],
  canvas: "bare",
  html: (state) => {
    const none = state === "Nothing to review", view = state === "Grid" ? "Grid" : "List";
    if (V2) return `${workspaceHeader({ parent: "PMS", title: "Documents", actions: `${button("Scan", { v: "quiet", s: "sm", icon: "scan-line" })}${button("AI File Documents", { v: "white", s: "sm", icon: "sparkles" })}${button("Upload", { v: "white", s: "sm", icon: "upload" })}` })}
      <div class="grid grid-cols-[240px_1fr]">
        <nav class="border-e border-gray-200/80 p-3" aria-label="Folders"${chg("Review Queue is the first item in the sidebar with its count, and the sidebar is 240px so folder names aren't cut off")}><a class="${R.navItemOn}" aria-current="page">${I("list-checks")}<span class="truncate">Review Queue</span><span class="ms-auto text-xs tabular-nums text-gray-500">${none ? 0 : DOCS.length}</span></a>
          <p class="${R.navGroup}">Folders</p>${FOLDERS.map(([ic, l, n]) => `<a class="${R.navItem}">${I(ic)}<span class="truncate">${l}</span><span class="ms-auto text-xs tabular-nums text-gray-400">${l === "Miscellaneous" && none ? 0 : n.toLocaleString("en-US")}</span></a>`).join("")}</nav>
        <div class="min-w-0"><div class="px-4 pb-4" data-doc-main>${docsMain(view, none ? [] : DOCS)}</div></div></div>`;
    return `${workspaceHeader({ parent: "PMS", title: "Documents", actions: `${button("Scan", { v: "quiet", s: "sm", icon: "scan-line" })}${button("AI File Documents", { v: "white", s: "sm", icon: "sparkles" })}${button("Upload", { v: "solid", s: "sm", icon: "upload" })}` })}
      <div class="grid grid-cols-[216px_1fr]">
        <nav class="border-e border-gray-200/80 p-3" aria-label="Folders"><p class="${R.navGroup} !pt-1">Folders</p>${FOLDERS.map(([ic, l, n], i) => `<a class="${i === 1 ? R.navItemOn : R.navItem}" ${i === 1 ? 'aria-current="page"' : ""}>${I(ic)}<span class="truncate">${l}</span><span class="ms-auto text-xs tabular-nums text-gray-400">${i === 1 && none ? 0 : n.toLocaleString("en-US")}</span></a>`).join("")}</nav>
        <div class="min-w-0">
          ${tabsWithSlot([["All Documents", "1,284"], ["Review Queue", none ? 0 : DOCS.length]], 1, `<div data-doc-view>${segmented([`${I("list")}List`, `${I("layout-grid")}Grid`], view === "Grid" ? 1 : 0, { sm: true })}</div>`)}
          <div class="px-4 pb-4" data-doc-main>${docsMain(view, none ? [] : DOCS)}</div></div></div>`;
  },
  mount: (el, state) => {
    const none = state === "Nothing to review"; let rows = none ? [] : V4 ? DOCS.map((d) => ({ ...d, pt: d.pt || "none" })) : DOCS.slice();
    const mountList = () => { const host = el.querySelector('[data-grid="docs"]'); if (!host) return;
      const g = new Grid(host, { columns: V4 ? v4DocCols() : V2 ? v2DocCols() : docCols(), rows, title: "Review Queue", ...(V2 ? { noun: "documents" } : {}), ...(V4 ? { sheet: true, peek: v4DocPeek } : {}), searchPlaceholder: "Search documents", addColumn: false, maxHeight: 400, defaultSort: none ? null : { key: "at", dir: -1 },
        filters: [{ key: "folder", label: "Folder", options: [...new Set(DOCS.map((d) => d.folder))].map((f) => ({ value: f, label: f })) }],
        toolbarExtra: V4 ? v2ViewSwitch("List") + v2AcceptAll(rows.filter(v4DocPt)) : V2 ? v2ViewSwitch("List") + v2AcceptAll(rows) : rows.some((d) => d.pt) ? button(`Accept all ${rows.filter((d) => d.pt).length}`, { v: "soft", s: "xs", icon: "check-check" }) : "",
        empty: { icon: "inbox", title: "Nothing waiting for review", body: "New uploads and faxes are filed on their own. When Asha isn't sure where one goes, it waits here for you." },
        bulk: [{ label: "Accept", icon: "check" }, { label: "Move to folder", icon: "folder-input" }], onOpen: openDocSheet });
      host.addEventListener("click", (e) => { const a = e.target.closest('[data-doc="accept"]'); if (!a) return; e.stopPropagation(); g.data = g.data.filter((r) => r.id !== a.dataset.id); rows = g.data; g.render(); }, true); };
    const show = (view) => { el.querySelector("[data-doc-main]").innerHTML = docsMain(view, V4 ? rows.map((d) => (d.pt === "none" ? { ...d, pt: null } : d)) : rows); icons(); if (view === "List") mountList(); };
    mountList();
    el.onclick = (e) => { const s = e.target.closest("[data-doc-view] [data-seg]"); if (s) return show(+s.dataset.seg ? "Grid" : "List");
      const a = e.target.closest('[data-doc="accept"]'); if (a) { rows = rows.filter((r) => r.id !== a.dataset.id); return show("Grid"); }
      const o = e.target.closest("[data-doc-open]"); if (o) openDocSheet(DOCS.find((d) => d.id === o.dataset.docOpen)); };
  }
});

/* ================================================================ 6. Signature capture and consent */
const CONSENT_PT = DATA.patient("p2");
/* v4: the consent's ⋯ menu is the standard Actions menu */
const v4ConsentActions = (signed, pad) => [
  { label: "Consent", items: [{ icon: "smartphone", label: "Text it to Liam to sign", hint: "He signs on his phone before the visit", off: signed ? "Already signed" : "" },
    { icon: "languages", label: "Show in Spanish", hint: "Switch the text Liam reads" }, { icon: "file-plus", label: "Add a note for the dentist", hint: "Questions Liam asked before signing" },
    { icon: "history", label: "Consent history", hint: "Who opened, sent and signed it" }] },
  { label: "", items: signed ? [{ icon: "file-x", label: "Void and ask again", hint: "Keeps this copy in the chart, marked void", danger: true }]
    : [{ icon: "trash-2", label: "Remove consent", hint: pad ? "Stops the request on the signature pad" : "Takes it off today's visit", danger: true }] }];
function consent(state) {
  const signed = state === "Signed", pad = state === "On the front desk pad";
  const acks = [["I understand the risks listed above.", true], ["I had the chance to ask questions before we start.", true], [`I agree to the office fee of ${money(1150)} before insurance.`, signed]];
  const sigArea = signed
    ? `<div class="relative h-40 rounded-lg border border-gray-200/80 bg-white"><div class="absolute inset-x-6 top-6">${SIGNATURE(CONSENT_PT.name, "h-20")}</div><div class="absolute inset-x-6 bottom-6 flex items-end gap-2"><span class="text-gray-400">×</span><span class="grow border-b border-gray-300"></span></div></div>`
    : pad
      ? `<div class="flex h-40 flex-col items-center justify-center gap-1 rounded-lg border border-gray-200/80 bg-gray-50 text-center px-6">${I("loader-circle", "size-5 text-gray-400 motion-safe:animate-spin")}<p class="mt-1 text-sm font-medium text-gray-800">Waiting for Liam to sign</p><p class="${R.help}">On the signature pad at Front desk 1. This updates on its own.</p></div>`
      : `<div class="relative h-40 rounded-lg border border-dashed border-gray-300 bg-gray-50 cursor-crosshair" role="img" aria-label="Empty signature box"><span class="absolute inset-0 flex items-center justify-center text-sm text-gray-400">Sign here with a mouse, pen or finger</span><div class="absolute inset-x-6 bottom-6 flex items-end gap-2"><span class="text-gray-400">×</span><span class="grow border-b border-gray-300"></span></div></div>`;
  return `<div class="${R.box}">
    <div class="flex items-start justify-between gap-4 px-5 py-4 border-b border-gray-200/80">
      <div class="flex items-start gap-3 min-w-0">${avatar(CONSENT_PT.name, { size: 9 })}<div class="min-w-0"><h3 class="${R.sectionTitle}">Consent for root canal treatment</h3>${V4 ? `<p class="${R.help}"${chg4("The line under the title says who and what in two parts, the patient and the procedure; their date of birth and the dentist show when you point at it, instead of five values strung together")}><span class="cursor-default underline decoration-dotted decoration-gray-300 underline-offset-4" data-tip="${esc(`Born ${fmtDateY(CONSENT_PT.dob)} · D3330 · Dr. Ethan Brooks`)}" tabindex="0">${esc(CONSENT_PT.name)} · Root canal on #19</span></p>` : `<p class="${R.help}">${esc(CONSENT_PT.name)} · born ${fmtDateY(CONSENT_PT.dob)} · Tooth #19 · D3330 Root canal, molar · Dr. Ethan Brooks</p>`}</div></div>
      <div class="flex items-center gap-3 shrink-0">${signed ? statusDot("Signed by patient", "on") : pad ? statusDot("Waiting for signature", "mid") : statusDot("Not signed", "off")}${iconButton("printer", "Print", { s: "iconSm" })}${V4 ? `<span class="inline-flex"${chg4("The ⋯ menu is the standard Actions menu: searchable and grouped, with greyed rows that say why they can't run yet")}>${actionsMenu(v4ConsentActions(signed, pad), { dots: true, up: false, align: "end", open: V4_OPTS.open })}</span>` : iconButton("ellipsis", "More", { s: "iconSm" })}</div></div>
    <div class="grid grid-cols-[1fr_400px]">
      <div class="flex flex-col border-e border-gray-200/80 text-sm leading-6 text-gray-700"><div class="grow space-y-4 px-5 pt-5 pb-4">
        <div><h4 class="${R.groupTitle}">What we'll do</h4><p>Dr. Brooks will clean out the infected nerve inside tooth #19, fill the canals, and seal the tooth. It usually takes one visit of about 90 minutes. The tooth will need a crown afterwards.</p></div>
        <div><h4 class="${R.groupTitle}">Risks</h4><ul class="list-disc ps-5 space-y-0.5"><li>Soreness for a few days, which pain relievers usually help.</li><li>A small chance a file breaks inside the canal or the tooth cracks.</li><li>The treatment may not work, and the tooth may still need to come out.</li></ul></div>
        <div><h4 class="${R.groupTitle}">Other choices</h4><p>Taking the tooth out (D7140), or doing nothing, which may lead to more pain and infection.</p></div>
</div>
        <fieldset class="border-t border-gray-200/80 px-5 py-4 space-y-2.5"><legend class="sr-only">Acknowledgements</legend>${acks.map(([t, on]) => `<label class="flex items-start gap-2.5 text-sm text-gray-800"><span class="mt-0.5 flex">${checkbox(on, t)}</span><span>${t}</span></label>`).join("")}</fieldset></div>
      <div class="flex flex-col"><div class="grow space-y-4 px-5 pt-5 pb-4">
        <div><div class="flex items-center justify-between mb-2"><span class="${R.label}">Patient signature</span>${signed ? `<span class="${R.caption}">Signed ${fmtDate(TODAY)}, 10:14 AM on Front desk 1</span>` : pad ? "" : `<button type="button" class="text-[13px] font-medium text-blue-600 hover:underline underline-offset-4">Clear</button>`}</div>${sigArea}</div>
        <div class="grid grid-cols-[1fr_128px] gap-3"><div class="space-y-1.5"><span class="${R.label}">Signed by</span>${signed ? `<p class="text-sm text-gray-800 h-9 flex items-center">Liam Carter, patient</p>` : `<button type="button" class="${R.select}">Liam Carter, patient${I("chevrons-up-down")}</button>`}</div><div class="space-y-1.5"><span class="${R.label}">Date</span><p class="text-sm text-gray-800 h-9 flex items-center tabular-nums">${fmtDateY(TODAY)}</p></div></div>
        <div class="space-y-1.5"><span class="${R.label}">Witness</span><p class="flex h-9 items-center gap-2 text-sm text-gray-800">${avatar("Marcus Lee", { size: 5 })}Marcus Lee, front desk</p></div>
        </div>${signed ? `<div class="border-t border-gray-200/80 px-5 py-4 space-y-2">${note("Saved to Consent Forms in Liam's chart, with the time, the pad it was signed on, and a copy of this text.", "info")}<div class="flex gap-2">${button("Download PDF", { v: "white", s: "sm", icon: "download" })}${button("Open in chart", { v: "quiet", s: "sm", icon: "external-link" })}</div></div>`
          : `<div class="border-t border-gray-200/80 px-5 py-4"><div class="flex items-center justify-end gap-2">${pad ? button("Sign here instead", { v: "white", s: "sm" }) + button("Cancel", { v: "quiet", s: "sm" }) : button("Send to signature pad", { v: "white", s: "sm", icon: "tablet-smartphone" }) + button("Save signed consent", { v: "solid", s: "sm", attrs: 'disabled aria-describedby="sig-need"' })}</div>${pad ? "" : `<p id="sig-need" class="${R.caption} text-end mt-2">Needs a signature and all three boxes ticked.</p>`}</div>`}
      </div></div></div>`;
}
defineBlock({
  cat: "forms", id: "forms-consent-signature",
  title: "Signature capture and consent",
  note: "A treatment consent in plain words with three things to tick, and a signature box. The patient signs here, or staff send it to the front desk signature pad and the screen waits for it.",
  where: "Patient chart › Forms › Consent",
  states: ["Ready to sign", "On the front desk pad", "Signed"],
  canvas: "gray",
  html: (state) => consent(state)
});

})();
