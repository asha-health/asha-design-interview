/* Insurance & claims blocks. Real labels from routes/practice/claims (see INVENTORY.md §6). */
(() => {

/* ---------- shared claim data ---------- */
const CLAIM_STATUS = {
  ready: { label: "Ready to send", tone: "on" },
  review: { label: "Needs review", tone: "needs" },
  payer: { label: "With payer", tone: "off" },
  awaiting: { label: "Awaiting EOB", tone: "off" },
  paid: { label: "Paid", tone: "on" },
  partial: { label: "Partial", tone: "mid" },
  denied: { label: "Denied", tone: "needs" },
  info: { label: "Info requested", tone: "needs" }
};
const CLAIMS = [
  { id: "c1", pt: "p8", svc: "2026-09-10", codes: ["D2740", "D2950"], payer: "metlife", type: "Primary", billed: 1545, paid: 0, status: "ready", biller: "Asha", sent: "", filing: 350 },
  { id: "c2", pt: "p5", svc: "2026-08-14", codes: ["D4341", "D4341"], payer: "aetna", type: "Primary", billed: 520, paid: 0, status: "review", biller: "Nina Flores", sent: "", filing: 324 },
  { id: "c3", pt: "p1", svc: "2026-09-02", codes: ["D0120", "D1110", "D0274"], payer: "delta", type: "Primary", billed: 253, paid: 0, status: "payer", biller: "Asha", sent: "2026-09-03", filing: 342 },
  { id: "c4", pt: "p2", svc: "2026-06-30", codes: ["D3330", "D2950", "D2740"], payer: "metlife", type: "Primary", billed: 2695, paid: 1310.5, status: "partial", biller: "Nina Flores", sent: "2026-07-01", filing: 278 },
  { id: "c5", pt: "p13", svc: "2026-07-22", codes: ["D7210"], payer: "cigna", type: "Primary", billed: 320, paid: 0, status: "denied", biller: "Asha", sent: "2026-07-23", filing: 26 },
  { id: "c6", pt: "p10", svc: "2026-08-25", codes: ["D0150", "D0210"], payer: "delta", type: "Primary", billed: 240, paid: 192, status: "paid", biller: "Asha", sent: "2026-08-26", filing: 334 },
  { id: "c7", pt: "p6", svc: "2026-05-02", codes: ["D2392"], payer: "guardian", type: "Primary", billed: 235, paid: 0, status: "info", biller: "Marcus Lee", sent: "2026-05-03", filing: 12 },
  { id: "c8", pt: "p15", svc: "2026-09-01", codes: ["D7140", "D7140", "D9110"], payer: "aetna", type: "Secondary", billed: 465, paid: 0, status: "awaiting", biller: "Asha", sent: "2026-09-08", filing: 341 },
  { id: "c9", pt: "p12", svc: "2026-02-25", codes: ["D1120", "D1208", "D1351"], payer: "delta", type: "Primary", billed: 175, paid: 175, status: "paid", biller: "Asha", sent: "2026-02-26", filing: 150 },
  { id: "c10", pt: "p3", svc: "2026-09-18", codes: ["D0120", "D1110"], payer: "cigna", type: "Primary", billed: 175, paid: 0, status: "ready", biller: "Asha", sent: "", filing: 358 }
];
const claimCols = () => [
  { key: "pt", label: "Patient", icon: "user", w: 200, open: true, kind: "text", value: (c) => DATA.patient(c.pt).name, lead: (c) => avatar(DATA.patient(c.pt).name, { size: 5 }), render: (c) => esc(DATA.patient(c.pt).name) },
  { key: "svc", label: "Service date", icon: "calendar", w: 124, kind: "date", render: (c) => fmtDate(c.svc) },
  { key: "codes", label: "Procedures", icon: "list", w: 188, kind: "list", value: (c) => c.codes.join(" "), render: (c) => `<span class="tabular-nums">${c.codes.slice(0, 2).join(" · ")}</span>${c.codes.length > 2 ? ` <span class="text-xs text-gray-500">+${c.codes.length - 2}</span>` : ""}` },
  { key: "payer", label: "Payer", icon: "shield", w: 150, kind: "text", value: (c) => DATA.payer(c.payer).short, render: (c) => esc(DATA.payer(c.payer).short) },
  { key: "type", label: V2 ? `<span${chg("Type shows only Secondary; Primary (9 of 10 rows) is left blank so the exception stands out")}>Type</span>` : "Type", icon: "layers", w: 104, kind: "text", normal: ["Primary"], render: (c) => (c.type === "Primary" ? "Primary" : `<span class="text-gray-500">Secondary</span>`) },
  { key: "billed", label: "Billed", icon: "receipt", w: 116, num: true, kind: "money", render: (c) => money(c.billed) },
  { key: "paid", label: "Paid", icon: "banknote", w: 116, num: true, kind: "money", render: (c) => (c.paid ? money(c.paid) : `<span class="text-gray-400">$0.00</span>`) },
  { key: "status", label: "Status", icon: "circle-dot", w: 150, kind: "text", value: (c) => CLAIM_STATUS[c.status].label, render: (c) => statusDot(CLAIM_STATUS[c.status].label, CLAIM_STATUS[c.status].tone) },
  { key: "filing", label: "Filing days left", icon: "hourglass", w: 140, num: true, kind: "num", render: (c) => (c.filing <= 30 ? `<span class="${R.flag} justify-end w-full">${I("circle-alert")}<span class="text-gray-800 tabular-nums">${c.filing}</span></span>` : `<span class="text-gray-500">${c.filing}</span>`) },
  { key: "biller", label: "Biller", icon: "user-round", w: 150, kind: "text", render: (c) => (c.biller === "Asha" ? `<span class="inline-flex items-center gap-x-2"><span class="flex size-5 items-center justify-center rounded-full bg-blue-100 text-blue-800">${I("sparkles", "size-3")}</span>Asha</span>` : `<span class="inline-flex items-center gap-x-2">${avatar(c.biller, { size: 5 })}${esc(c.biller)}</span>`) },
  { key: "sent", label: "Sent", icon: "send", w: 104, kind: "date", render: (c) => (c.sent ? fmtDate(c.sent) : `<span class="text-gray-400">Not sent</span>`) }
];

/* Status on one line: a status button (dot, word, chevron) and a grey caption on the right */
const statusLine = (label, tone, caption = "") => `<section class="${R.psec} flex items-center justify-between gap-3 !py-3"><button type="button" class="${cx(R.btn, R.sm, R.white, "!ps-2.5")}" aria-haspopup="menu" aria-label="Change status"><span class="${cx(R.dot, TONE_DOT[tone])}"></span>${esc(label)}${I("chevron-down", "!text-gray-400")}</button><span class="text-[13px] text-gray-500 truncate">${caption}</span></section>`;
const filingCaption = (n) => (n <= 30 ? `<span class="inline-flex items-center gap-1">${I("circle-alert", "size-3.5 text-orange-500")}${n} filing days left</span>` : `${n} filing days left`);
/* One alert row in its own section (rule: alerts are plain rows) */
const alertSec = (title, text) => psec(title, `<div class="-my-1.5">${infoRow("circle-alert", text, { tone: "needs" })}</div>`);

/* ---------- v2: one claim sheet ----------
 * Every claim money table (claim, EOB, the claim behind a stuck alert) is the same sheet: # · Tooth · Code ·
 * Description · Billed, and once the payer answered, Allowed · Write-off · Ins. paid · Pt. resp. It mounts as the kit
 * Grid's "form" preset through v2bcSheet (blocks/billing.js), so it looks like ClaimFormSpreadsheet's compact sheet.
 * A Date column joins only when the lines span more than one date. CARC codes show on hover over the amounts they
 * explain, instead of an Adjustments column that repeated two other columns. */
const v2bcSheet = window.v2bcSheet, v2bcFlag = window.v2bcFlag;
const CARC = { "CO-45": "CO-45 · Charge exceeds the fee schedule. The office writes this off.", "PR-2": "PR-2 · Coinsurance. The patient pays this." };
const v2SheetW = 760; // claim, EOB and posting flyouts open at the claim-form width
function v2ClaimSheet(lines, { adjudicated = false, title = "Claim lines" } = {}) {
  const tipped = (txt, tip) => (tip ? `<span class="cursor-help underline decoration-dotted decoration-gray-300 underline-offset-4" tabindex="0" data-tip="${esc(tip)}">${txt}</span>` : txt);
  const m = (k, label, w, tipKey) => ({ label, w, num: true, render: (l) => (l[k] == null ? cDim() : tipped(l[k] ? money(l[k]) : cDim(money(0)), tipKey && l[tipKey])) });
  const dates = new Set(lines.map((l) => l.date)).size > 1;
  const columns = [{ label: "#", w: 32, render: (l) => `<span class="text-gray-500 tabular-nums">${l.line}</span>` },
    ...(dates ? [{ label: "Date", w: 64, render: (l) => `<span class="tabular-nums">${fmtDate(l.date)}</span>` }] : []),
    { label: V4 ? `<span${chg4("Lines that don't need a tooth (exams, cleanings, x-rays) show a grey dash in Tooth instead of a blank cell")}>Tooth</span>` : "Tooth", w: 60, render: (l) => (l.tooth ? `<span class="tabular-nums">#${l.tooth}</span>` : V4 ? cDim() : "") },
    { label: "Code", w: 62, render: (l) => `<span class="tabular-nums">${l.code}</span>` },
    { label: "Description", w: 110, flex: true, render: (l) => `<span title="${esc(l.desc)}">${esc(l.desc)}</span>` },
    m("billed", MONEY_LABEL.billed, 84),
    ...(adjudicated ? [m("allowed", MONEY_LABEL.allowed, 84), m("wo", MONEY_LABEL.writeOff, 92, "woTip"), m("paid", MONEY_LABEL.insPaid, 88), m("pt", MONEY_LABEL.ptResp, 84, "ptTip")] : [])];
  const tot = (k) => money(cSum(lines, k));
  return v2bcSheet({ title, rows: lines, columns, foot: ["Total", ...(dates ? [""] : []), "", "", "", tot("billed"), ...(adjudicated ? ["allowed", "wo", "paid", "pt"].map(tot) : [])] });
}
/* The lines of a workbench claim for the sheet (same numbers as claimLines below) */
function v2LinesOf(c) {
  return c.codes.map((code, i) => { const p = DATA.proc(code), tooth = ["30", "30", "", "19", "14"][i] || "";
    const allowed = Math.round(p.fee * 0.82 * 100) / 100, paid = c.status === "paid" ? allowed * 0.8 : c.status === "partial" ? allowed * 0.5 : 0, pt = c.status === "paid" || c.status === "partial" ? cAdd(allowed, -paid) : 0;
    return { line: i + 1, date: c.svc, code, tooth: /^D[2367]/.test(code) ? tooth : "", desc: p.name, billed: p.fee, allowed, wo: cAdd(p.fee, -allowed), paid: Math.round(paid * 100) / 100, pt, woTip: CARC["CO-45"], ptTip: pt ? CARC["PR-2"] : "" }; });
}
/* Open a claim in the shared Sheet at the claim-form width; the Sheet goes back to its record width when it closes */
function v2WideSheet() {
  const el = Sheet.el; if (!el) return; el.style.width = `${v2SheetW}px`;
  const mo = new MutationObserver(() => { if (el.dataset.open === "0") { el.style.width = ""; mo.disconnect(); } });
  mo.observe(el, { attributes: true, attributeFilter: ["data-open"] });
}

/* ---------- v4 (billing-claims): one record header, one Actions menu, tables you type into ----------
 * Everything here is read at render time behind V4, so v1 and v2 draw exactly as before. */
const v4cNum = (s) => { const n = parseFloat(String(s ?? "").replace(/[$,\s]/g, "")); return isFinite(n) ? Math.round(n * 100) / 100 : null; };
const v4cStatus = (label, tone, note = "") => `<span class="inline-flex items-center gap-2 min-w-0"><span class="${cx(R.dot, TONE_DOT[tone])}"></span>${esc(label)}${note ? `<span class="text-gray-500 truncate">· ${note}</span>` : ""}</span>`;
const v4cNeeds = (label, note = "") => `<span class="inline-flex items-center gap-1.5 min-w-0">${I("circle-alert", "size-3.5 shrink-0 text-orange-500")}<span>${esc(label)}</span>${note ? `<span class="text-gray-500 truncate">· ${note}</span>` : ""}</span>`;
const v4cNone = (label, value, html) => ({ label, value, type: "none", html });
const v4cNums = (r) => `<span class="tabular-nums">${esc(r.value)}</span>`;
const v4cMoney = (r) => `<span class="tabular-nums">${v4cNum(r.value) == null ? esc(r.value) : money(v4cNum(r.value))}</span>`;
/* Two field tables side by side, for the wide claim panels and pages */
const v4cPair = (left, right, o = {}) => `<div class="grid grid-cols-2 gap-x-6 items-start">${fieldTable(left, o)}${fieldTable(right, o)}</div>`;
const V4C_BILLERS = ["Asha", "Nina Flores", "Marcus Lee"];
const v4cBiller = (r) => (r.value === "Asha" ? `<span class="inline-flex items-center gap-x-2"><span class="flex size-5 items-center justify-center rounded-full bg-blue-100 text-blue-800">${I("sparkles", "size-3")}</span>Asha</span>` : `<span class="inline-flex items-center gap-x-2">${avatar(r.value, { size: 5 })}${esc(r.value)}</span>`);
const v4cToothNeeded = (code) => /^D[23]/.test(code || "");
/* A claim's Actions menu, by where the claim is. What the panel's own button does (Send claim, Fix & resubmit, Post
 * payment, Close claim) and what's a cell (Biller) isn't repeated. */
function v4cClaimActions(c) {
  const payer = DATA.payer(c.payer).short, answered = ["paid", "partial", "denied"].includes(c.status), noEob = answered ? "" : `No EOB from ${payer} yet`;
  if (!c.sent) return [
    { label: "Claim", items: [{ icon: "eye", label: "Preview claim", hint: `The ADA form as ${payer} will get it` }, { icon: "shield-check", label: "Check eligibility", hint: `Ask ${payer} what's covered today` },
      { icon: "paperclip", label: "Attach x-rays or a narrative", hint: "What payers ask for with crowns and root canals" },
      { icon: "sparkles", label: "Check for denials", hint: "Asha reads the claim for common denial reasons", suggest: c.status === "review" ? "It was flagged for review before it goes out" : "" },
      { icon: "pause", label: "Hold claim", hint: "Keep it out of tonight's batch" }] },
    { label: "Lines", items: [{ icon: "list-plus", label: "Add completed procedure", hint: "Pull in another procedure from the ledger" },
      { icon: "split", label: "Split claim", hint: "Send some lines on a second claim", off: c.codes.length < 2 ? "The claim has only one line" : "" }] },
    { label: "", items: [{ icon: "trash-2", label: "Delete claim", danger: true }] }];
  const waited = cDays(c.sent);
  return [
    { label: "Payment", items: [...(c.status === "paid" || c.status === "partial" ? [{ icon: "hand-coins", label: "Post payment", hint: `Enter what ${payer} paid, line by line` }] : []),
      { icon: "wand-sparkles", label: "Auto-post from EOB", hint: "Fill the payment from the EOB for you to check", off: noEob }, { icon: "file-search", label: "View source EOB", hint: "Open the EOB this claim was paid on", off: noEob }] },
    { label: "Claim", items: [{ icon: "eye", label: "Preview claim", hint: `The ADA form as ${payer} got it` },
      { icon: "refresh-cw", label: "Refresh claim status", hint: `Ask ${payer} for the latest`, suggest: ["payer", "awaiting"].includes(c.status) && waited > 30 ? `No answer from ${payer} in ${waited} days` : "" },
      { icon: "paperclip", label: "Send additional attachments", hint: "X-rays, perio charts or a narrative", suggest: c.status === "info" ? `${payer} asked for more information` : "" },
      { icon: "scale", label: "Prepare appeal", hint: "Start a letter for a denied line", off: c.status === "denied" || c.status === "partial" ? "" : "Nothing on this claim was denied" },
      { icon: "copy-plus", label: "Create secondary claim", hint: "Bill the rest to a second plan", off: c.type === "Secondary" ? "This is already the secondary claim" : "No secondary insurance on file" },
      { icon: "eraser", label: "Write off", hint: "Write off what the patient won't owe" }] },
    { label: "", items: [{ icon: "ban", label: "Void claim", danger: true }] }];
}
/* Lines of a claim that hasn't gone out yet: Tooth and Billed are cells you type into, the total follows */
function v4cDraftLines(lines) {
  const foot = (rows) => ["Total", "", money(cSum(rows, "billed"))];
  const rows = lines.map((l, i) => ({ id: `dl${i}`, ...l }));
  return sheetTable({ title: "Claim lines", rows, foot: foot(rows),
    onCommit: (l, k, v, g) => { g.o.foot = foot(g.data); if (k === "tooth") l.tooth = v = v.replace(/^#/, "");
      if (k === "tooth" && !v && v4cToothNeeded(l.code)) return `${l.desc} needs a tooth number. The payer denies the line without one.`;
      if (k === "billed" && !(v > 0)) return "Type the fee, like 1,250.00."; },
    columns: [{ key: "code", label: "Procedure", w: 160, grow: true, render: (l) => `<span class="tabular-nums text-gray-500 me-2">${l.code}</span>${esc(l.desc)}` },
      { key: "tooth", label: "Tooth", w: 72, edit: "text", placeholder: (l) => (v4cToothNeeded(l.code) ? "Add" : "—"), render: (l) => (l.tooth ? `<span class="tabular-nums">#${esc(l.tooth)}</span>` : "") },
      { key: "billed", label: MONEY_LABEL.billed, w: 104, num: true, kind: "money", edit: "text", render: (l) => money(l.billed) }] });
}
function v4cOpenClaim(c) {
  const p = DATA.patient(c.pt), s = CLAIM_STATUS[c.status], payer = DATA.payer(c.payer), sent = !!c.sent, answered = c.status === "paid" || c.status === "partial";
  const facts = [v4cNone("Status", s.label, () => v4cStatus(s.label, s.tone, sent ? `sent ${fmtDate(c.sent)}` : "not sent yet")),
    v4cNone("Filing days left", String(c.filing), () => (c.filing <= 30 ? v4cNeeds(String(c.filing), "send or fix it soon") : `<span class="tabular-nums">${c.filing}</span>`)),
    { label: "Biller", value: c.biller, type: "select", options: V4C_BILLERS, html: v4cBiller }];
  const member = `XK${String(hash(p.id)).slice(0, 9)}`;
  const cover = [v4cNone("Payer", `${payer.name} PPO`), v4cNone("Subscriber", `${p.name} · Self`), sent ? v4cNone("Member ID", member, v4cNums) : { label: "Member ID", value: member, type: "text", html: v4cNums },
    sent ? v4cNone("Treating dentist", "Dr. Maya Patel") : { label: "Treating dentist", value: "Dr. Maya Patel", type: "select", options: ["Dr. Maya Patel", "Dr. Ethan Brooks"] }];
  const primary = !sent ? button("Send claim", { v: "solid", s: "sm", icon: "send" }) : c.status === "denied" ? button("Fix & resubmit", { v: "solid", s: "sm" }) : answered ? button("Close claim", { v: "solid", s: "sm" }) : button("Post payment", { v: "solid", s: "sm" });
  Sheet.open({ flush: true, title: esc(p.name), lead: avatar(p.name, { size: 9 }), subtitle: `${payer.short} · ${c.type} · Service ${fmtDate(c.svc)}`, tabs: ["Claim", "EOB", "History"],
    marks: sent ? recordMark("lock", `Sent to ${payer.short} ${fmtDate(c.sent)}, so its lines are read-only. Correct the claim to change them.`) : "",
    actions: iconButton("external-link", "Open in Claims", { s: "iconSm" }),
    body: `${psec("Claim", `<div${chg4("The claim's status is the first line of its facts table, with when it was sent; the row of its own is gone. Biller is a cell you change in place")}>${fieldTable(facts, { title: "Claim" })}</div>`)}
      ${c.status === "denied" ? alertSec("Before resubmitting", "Denied: the payer says the x-ray was missing. Attach the pano and resubmit, or prepare an appeal.") : ""}
      ${psec("Procedures", sent ? v2ClaimSheet(v2LinesOf(c), { adjudicated: answered }) : `<div${chg4("Before the claim goes out, Tooth and Billed are cells you type into and the total follows; a filling or crown without a tooth gets the orange mark, and a line that needs no tooth shows a grey dash")}>${v4cDraftLines(v2LinesOf(c))}</div>`, { count: c.codes.length })}
      ${psec("Patient & coverage", `<div${chg4(sent ? "Patient and coverage use the same field table, read-only once the claim is sent" : "Member ID and the treating dentist are cells you fix before sending")}>${fieldTable(cover, { title: "Patient & coverage" })}</div>`)}`,
    footer: `<span class="flex"${chg4("Actions is the standard menu, grouped by payment and claim, with what can't run yet greyed and the reason on hover")}>${actionsMenu(v4cClaimActions(c), { open: V4_OPTS.open })}</span><span class="grow"></span>${primary}` });
  v2WideSheet();
}

/* ADA-style line items for one claim, sized for a 460px panel and boxed (R.tableBox) */
function claimLines(c) {
  const lines = c.codes.map((code, i) => { const p = DATA.proc(code); const tooth = ["30", "30", "", "19", "14"][i] || "";
    const allowed = Math.round(p.fee * 0.82 * 100) / 100, paid = c.status === "paid" ? allowed * 0.8 : c.status === "partial" ? allowed * 0.5 : 0;
    return { line: i + 1, code, tooth, desc: p.name, billed: p.fee, allowed, paid, pt: c.status === "paid" || c.status === "partial" ? allowed - paid : 0 }; });
  const t = (k) => lines.reduce((a, l) => a + l[k], 0), K = ["billed", "paid", "pt"];
  return `<div class="${R.tableBox}"><table class="table-fixed border-separate border-spacing-0 text-sm"><colgroup><col><col class="w-[86px]"><col class="w-[74px]"><col class="w-[76px]"></colgroup>
    <thead><tr>${["Procedure", "Billed", "Paid", "Pt resp."].map((h, i) => `<th class="${R.tHead} ${i ? "!text-end" : ""}">${h}</th>`).join("")}</tr></thead>
    <tbody>${lines.map((l) => `<tr><td class="${R.tCell} max-w-0 truncate" title="${esc(l.desc)}"><span class="tabular-nums">${l.code}</span>${l.tooth && /^D[2367]/.test(l.code) ? ` <span class="tabular-nums text-gray-500">#${l.tooth}</span>` : ""} <span class="text-gray-500">${l.desc}</span></td>${K.map((k) => `<td class="${R.tCell} text-end tabular-nums ${!l[k] ? "text-gray-400" : ""}">${money(l[k])}</td>`).join("")}</tr>`).join("")}</tbody>
    <tfoot><tr><td class="h-9 px-3 text-sm font-medium text-gray-800">Total</td>${K.map((k) => `<td class="h-9 px-3 text-end text-sm font-semibold tabular-nums">${money(t(k))}</td>`).join("")}</tr></tfoot></table></div>`;
}
function openClaimSheet(c) {
  const p = DATA.patient(c.pt), s = CLAIM_STATUS[c.status];
  if (V4) return v4cOpenClaim(c);
  if (V2) {
    Sheet.open({ flush: true, title: esc(p.name), lead: avatar(p.name, { size: 9 }), subtitle: `${DATA.payer(c.payer).short} · ${c.type} · Service ${fmtDate(c.svc)}`, tabs: ["Claim", "EOB", "History"],
      actions: iconButton("external-link", "Open in Claims", { s: "iconSm" }),
      body: `${statusLine(s.label, s.tone, filingCaption(c.filing))}
        ${c.status === "denied" ? alertSec("Before resubmitting", "Denied: the payer says the x-ray was missing. Attach the pano and resubmit, or prepare an appeal.") : ""}
        ${psec("Procedures", v2ClaimSheet(v2LinesOf(c), { adjudicated: c.status === "paid" || c.status === "partial" }), { count: c.codes.length })}
        ${psec("Patient & coverage", kvTable([["Payer", `${DATA.payer(c.payer).name} PPO`], ["Subscriber", `${esc(p.name)} <span class="text-gray-500">· Self</span>`], ["Member ID", `<span class="tabular-nums">XK${String(hash(p.id)).slice(0, 9)}</span>`], ["Treating dentist", "Dr. Maya Patel"]], { cols: 2 }))}`,
      footer: `${button("Actions", { v: "white", s: "sm", iconEnd: "chevron-down" })}${c.status === "ready" ? button("Send claim", { v: "solid", s: "sm", icon: "send" }) : c.status === "denied" ? button("Fix & resubmit", { v: "solid", s: "sm" }) : button("Post payment", { v: "solid", s: "sm" })}`
    });
    return v2WideSheet();
  }
  Sheet.open({
    flush: true, title: esc(p.name), lead: avatar(p.name, { size: 9 }),
    subtitle: `${DATA.payer(c.payer).short} · ${c.type} · Service ${fmtDate(c.svc)}`,
    tabs: ["Claim", "EOB", "History"],
    actions: iconButton("external-link", "Open in Claims", { s: "iconSm" }),
    body: `${statusLine(s.label, s.tone, filingCaption(c.filing))}
      ${c.status === "denied" ? alertSec("Before resubmitting", "Denied: the payer says the x-ray was missing. Attach the pano and resubmit, or prepare an appeal.") : ""}
      ${psec("Procedures", claimLines(c), { count: c.codes.length })}
      ${psec("Patient & coverage", metaGrid([["Subscriber", `${esc(p.name)} <span class="text-gray-500">· Self</span>`], ["Member ID", `<span class="tabular-nums">XK${String(hash(p.id)).slice(0, 9)}</span>`], ["Plan", `${DATA.payer(c.payer).name} PPO`], ["Treating dentist", "Dr. Maya Patel"]], 2))}`,
    footer: `${button("Actions", { v: "white", s: "sm", iconEnd: "chevron-down" })}${c.status === "ready" ? button("Send claim", { v: "solid", s: "sm", icon: "send" }) : c.status === "denied" ? button("Fix & resubmit", { v: "solid", s: "sm" }) : button("Post payment", { v: "solid", s: "sm" })}`
  });
}

/* ---------- Claims workbench ---------- */
const CLAIM_TABS = [["Unbatched claims", []], ["To be sent", ["ready", "review"]], ["Sent", ["payer", "awaiting", "info", "denied"]], ["Adjudicated", ["paid", "partial"]], ["Closed", []], ["Archived", []]];
defineBlock({
  cat: "claims", id: "claims-workbench", thumb: true,
  title: "Claims workbench",
  note: "The Claims page: one bar across the top, tabs with counts and the dates on the right, then the grid. No summary tiles above it. The tabs work.",
  where: "Revenue Cycle › Claims",
  states: ["Normal", "Loading"],
  canvas: "bare",
  html: (state) => {
    const tabs = CLAIM_TABS.map(([l, st], i) => (i === 0 ? [l, 6] : st.length ? [l, CLAIMS.filter((c) => st.includes(c.status)).length] : l));
    return `${workspaceHeader({ parent: "Revenue Cycle", title: "Claims", actions: `${segmented(["Claims", "Pre-auths"], 0, { sm: true })}${button("Auto-submit schedule", { v: "quiet", s: "sm", icon: "clock" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
      <div data-claim-tabs>${tabsWithSlot(tabs, 2, dateRangeButton("Last 30 days"))}</div>
      <div class="px-4 pb-4">${state === "Loading" ? `<div class="py-2.5 flex gap-2">${skel("w-40", "h-8")}${skel("w-48", "h-8")}</div>${gridSkeleton(["Patient", "Service date", "Procedures", "Payer", "Billed", "Status", "Filing days left"], 7)}` : '<div data-grid="claims"></div>'}</div>`;
  },
  mount: (el) => {
    const host = el.querySelector('[data-grid="claims"]'); if (!host) return;
    const rowsFor = (i) => CLAIMS.filter((c) => CLAIM_TABS[i][1].includes(c.status));
    const g = new Grid(host, {
      ...(V2 ? { viewButton: false, noun: "claims" } : {}),
      columns: claimCols(), rows: rowsFor(2), title: "Sent", searchPlaceholder: "Search claims", maxHeight: 420,
      defaultSort: { key: "svc", dir: 1 }, calc: { billed: "sum", paid: "sum" },
      filters: [{ key: "status", label: "Status", options: Object.entries(CLAIM_STATUS).map(([value, s]) => ({ value, label: s.label, tone: s.tone })) }, { key: "payer", label: "Payer", options: DATA.payers.map((p) => ({ value: p.id, label: p.short })) }],
      primary: { label: "New claim" },
      empty: { icon: "send", title: "Nothing here", body: "Claims move into this tab on their own as they're sent and paid." },
      bulk: [{ label: "Send", icon: "send" }, { label: "Run AI analysis", icon: "sparkles" }, { label: "Export", icon: "download" }],
      onOpen: openClaimSheet
    });
    wireTabs(el.querySelector("[data-claim-tabs]"), (i) => { g.o.title = CLAIM_TABS[i][0]; g.setRows(rowsFor(i)); g.filters = {}; g.q = ""; g.render(); });
  }
});

/* =====================================================================================================
 * More insurance blocks. Labels from SentClaimSheet / SentClaimActionsFooter / sentClaimSpreadsheetModel,
 * PaymentPostingModal, EobFlyout(HeaderMeta) + EobPayerStatementTab, BenefitsTable, PreAuthSection,
 * RcmOverview (AlertDetail), UnclaimedChargesWorkspace. Totals are computed from the lines.
 * ===================================================================================================== */
const cAdd = (...v) => Math.round(v.reduce((a, b) => a + Math.round((b || 0) * 100), 0)) / 100;
const cSum = (rows, k) => cAdd(...rows.map((r) => (typeof k === "function" ? k(r) : r[k]) || 0));
const cDays = (iso) => Math.round((Date.parse(TODAY) - Date.parse(iso)) / 864e5);
const isoMinus = (days) => new Date(Date.parse(TODAY) - days * 864e5).toISOString().slice(0, 10);
const cDim = (s = "—") => `<span class="text-gray-400">${s}</span>`;
const cFaded = (html, w = 1094) => `<div class="grow min-w-0 overflow-hidden opacity-50 pointer-events-none select-none" aria-hidden="true" inert data-scroll-ok><div style="width:${w}px">${html}</div></div>`;
/* Meta strip: small grey label over the value (MetaStrip) */
const metaStrip = (items) => `<div class="flex flex-wrap items-start gap-x-6 gap-y-2">${items.map(([k, v]) => `<div class="min-w-0"><p class="text-xs text-gray-500">${k}</p><div class="mt-0.5 text-sm text-gray-800 flex items-center gap-3 whitespace-nowrap">${v}</div></div>`).join("")}</div>`;
/* ADA-style key/value spreadsheet, one or two pairs per row */
const kvSheet = (pairs, two = false) => { const rows = []; for (let i = 0; i < pairs.length; i += two ? 2 : 1) rows.push(pairs.slice(i, i + (two ? 2 : 1)));
  const k = "h-9 px-3 border-b border-e border-gray-200/80 bg-gray-50/60 text-[13px] text-gray-500 whitespace-nowrap", v = "h-9 px-3 border-b border-gray-200/80 text-gray-800 truncate";
  return `<table class="w-full table-fixed border-separate border-spacing-0 border-y border-gray-200/80 text-sm"><colgroup>${two ? '<col class="w-[22%]"><col class="w-[28%]"><col class="w-[22%]"><col class="w-[28%]">' : '<col class="w-[38%]"><col>'}</colgroup><tbody>${rows.map((r) => `<tr>${r.map(([a, b], i) => `<td class="${k}">${a}</td><td class="${v} ${two && i === 0 ? "border-e" : ""}">${b}</td>`).join("")}</tr>`).join("")}</tbody></table>`; };
const cField = (label, control, cls = "") => `<div class="space-y-1.5 min-w-0 ${cls}"><span class="${R.label} block">${label}</span>${control}</div>`;
const cSelect = (value, icon) => `<button type="button" class="${R.select}"><span class="inline-flex items-center gap-2 truncate">${icon ? I(icon, "!text-gray-500") : ""}${value}</span>${I("chevrons-up-down")}</button>`;
const timeline = (items) => `<ol class="relative space-y-4 ps-6 before:absolute before:start-[5px] before:top-2 before:bottom-2 before:w-px before:bg-gray-200">${items.map(([t, s, on], i) => `<li class="relative"><span class="absolute -start-6 top-1 size-[11px] rounded-full border-2 border-white ${on ? "bg-blue-600" : "bg-gray-300"}"></span><p class="text-sm text-gray-800">${t}</p><p class="${R.caption} mt-0.5">${s}</p></li>`).join("")}</ol>`;
const payerName = (id) => (id ? DATA.payer(id).short : "No insurance");

/* A static copy of the claims grid for the faded page behind a panel */
function claimsSlice(rows, hi, tabIndex) {
  const cols = claimCols().filter((c) => ["pt", "svc", "codes", "payer", "type", "billed", "paid", "status", "filing"].includes(c.key));
  return `${workspaceHeader({ parent: "Revenue Cycle", title: "Claims" })}${tabsWithSlot(CLAIM_TABS.map(([l]) => l), tabIndex, dateRangeButton("Last 90 days"))}<div class="px-4 pt-3"><table class="w-full table-fixed border-separate border-spacing-0 text-sm"><colgroup>${cols.map((c) => `<col style="width:${c.w}px">`).join("")}</colgroup>
    <thead><tr>${cols.map((c) => `<th class="${R.gridHead} ${c.num ? "!text-end" : ""}">${c.label}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((r) => `<tr class="${r.id === hi ? "bg-blue-50" : ""}">${cols.map((c, i) => `<td class="${R.gridCell} ${c.num ? "text-end tabular-nums" : ""}">${i === 0 ? `<span class="inline-flex items-center gap-2">${c.lead(r)}${c.render(r)}</span>` : c.render(r)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}

/* ---------- the MetLife claim for Liam Carter's root canal, buildup and crown on #19 (claim c4) ---------- */
const ADJ = [
  { line: 1, code: "D3330", tooth: "19", charged: 1150, allowed: 855, paid: 684, est: 684, adj: [["CO-45", 295], ["PR-2", 171]] },
  { line: 2, code: "D2950", tooth: "19", charged: 295, allowed: 240, paid: 120, est: 144, adj: [["CO-45", 55], ["PR-2", 120]] },
  { line: 3, code: "D2740", tooth: "19", charged: 1250, allowed: 1013, paid: 506.5, est: 625, adj: [["CO-45", 237], ["PR-2", 506.5]] }
].map((l) => ({ ...l, pt: cAdd(l.allowed, -l.paid), wo: cAdd(l.charged, -l.allowed), desc: DATA.proc(l.code).name, prov: l.code === "D3330" ? "Dr. Brooks" : "Dr. Patel" }));
const C4 = CLAIMS.find((c) => c.id === "c4");
const adjTable = () => `<div class="${R.tableBox}"><table class="table-fixed border-separate border-spacing-0 text-sm"><colgroup><col class="w-11"><col class="w-[72px]"><col class="w-[92px]"><col class="w-[88px]"><col class="w-[88px]"><col class="w-[108px]"><col></colgroup>
  <thead><tr>${["Line", "Code", "Charged", "Allowed", "Paid", "Patient resp.", "Adjustments"].map((h, i) => `<th class="${R.tHead} ${i >= 2 && i <= 5 ? "!text-end" : ""}">${h}</th>`).join("")}</tr></thead>
  <tbody>${ADJ.map((l) => `<tr><td class="${R.tCell} text-gray-500 tabular-nums">${l.line}</td><td class="${R.tCell} tabular-nums">${l.code}</td>${["charged", "allowed", "paid", "pt"].map((k) => `<td class="${R.tCell} text-end tabular-nums">${money(l[k])}</td>`).join("")}<td class="${R.tCell} text-[13px] text-gray-600 tabular-nums truncate" title="${l.adj.map(([c, a]) => `${c} ${money(a)}`).join(" · ")}">${l.adj.map(([c, a]) => `${c} ${money(a)}`).join(" · ")}</td></tr>`).join("")}</tbody>
  <tfoot><tr><td colspan="2" class="h-9 px-3 font-medium text-gray-800">Total</td>${["charged", "allowed", "paid", "pt"].map((k) => `<td class="h-9 px-3 text-end font-semibold tabular-nums">${money(cSum(ADJ, k))}</td>`).join("")}<td class="h-9 px-3 text-[13px] text-gray-600 tabular-nums truncate">CO-45 ${money(cSum(ADJ, "wo"))}</td></tr></tfoot></table></div>`;
/* v2 sent claim: the Claim tab is the one place for billed, allowed, written off and paid (the EOB tab repeated the same
 * lines under other names); facts are grouped like the ADA form in kvTable; History names each moment in sentence case. */
const V2_C4_LINES = ADJ.map((l) => ({ line: l.line, date: C4.svc, tooth: l.tooth, code: l.code, desc: l.desc, billed: l.charged, allowed: l.allowed, wo: l.wo, paid: l.paid, pt: l.pt, woTip: CARC["CO-45"], ptTip: CARC["PR-2"] }));
function v2SentClaimBody(tab) {
  const p = DATA.patient("p2");
  if (tab === 1) return `${psec(`<span${chg("The EOB tab keeps only how and when MetLife paid, the remarks and the source EOB; its second line table (the same lines as the Claim tab under other names) is gone")}>Payment</span>`, kvTable([["Payment method", "Paper check"], ["Check / EFT", `<span class="tabular-nums">#004418820</span>`], ["Payment date", "Aug 12, 2026"], ["Source EOB", "MetLife EOB · received Aug 14 · scanned"]], { cols: 2 }))}
    ${psec("Payer remarks", `<div class="space-y-1 text-sm text-gray-700"><p><span class="tabular-nums text-gray-500 me-1.5">CO-45</span>Charge exceeds the fee schedule. The office writes this off.</p><p><span class="tabular-nums text-gray-500 me-1.5">PR-2</span>Coinsurance. The patient pays this.</p></div>`)}`;
  if (tab === 2) {
    const items = [["Patient billed", "Sep 1, 8:00 AM · on the September statement · Asha", 797.5], ["Payment posted", "Aug 15, 10:20 AM · to 3 lines · Nina Flores", 1310.5], ["EOB received", "Aug 14, 6:02 AM · paper check #004418820, scanned · patient owes $797.50", 1310.5],
      ["With payer", "Jul 2, 9:15 AM · MetLife acknowledged the claim"], ["Accepted by clearinghouse", "Jul 1, 8:07 AM · DentalXChange"], ["Claim submitted", "Jul 1, 8:05 AM · Asha, with x-ray and narrative", 2695], ["Claim created", "Jun 30, 4:12 PM · from 3 completed procedures · Dr. Ethan Brooks"]];
    return psec("", `<ol class="relative space-y-4 ps-7 before:absolute before:start-[9px] before:top-2 before:bottom-2 before:w-px before:bg-gray-200"${chg("History names each moment in sentence case: done steps get a check, the latest is in bold, and amounts sit in their own right-hand column instead of inside the titles")}>${items.map(([t, sub, amt], i) => `<li class="relative flex items-start gap-4">
      ${i === 0 ? '<span class="absolute -start-7 top-0.5 flex size-[19px] items-center justify-center rounded-full bg-white ring-1 ring-blue-200"><span class="size-[9px] rounded-full bg-blue-600"></span></span>' : `<span class="absolute -start-7 top-0.5 flex size-[19px] items-center justify-center rounded-full bg-gray-100 text-gray-500">${I("check", "size-3")}</span>`}
      <div class="min-w-0 grow"><p class="text-sm ${i === 0 ? "font-medium text-gray-900" : "text-gray-800"}">${t}</p><p class="${R.caption} mt-0.5">${sub}</p></div>${amt ? `<span class="shrink-0 text-sm tabular-nums text-gray-800">${money(amt)}</span>` : ""}</li>`).join("")}</ol>`, { cls: "!py-5" });
  }
  return `${statusLine(CLAIM_STATUS.partial.label, "mid", `${filingCaption(C4.filing)} · payment posted Aug 15`)}
    ${psec(`<span${chg("One claim sheet in the claim form's compact look: Billed, Allowed, Write-off, Ins. paid, Pt. resp. Hover a write-off or patient amount to read its payer code; the Adjustments column that repeated them and was cut off is gone")}>Primary adjudication by procedure</span>`, v2ClaimSheet(V2_C4_LINES, { adjudicated: true, title: "Primary adjudication by procedure" }), { count: ADJ.length })}
    ${psec(`<span${chg("The claim's facts are grouped like the ADA form, two label / value pairs per row with no grey label fill (they were three separate fact grids)")}>Payer &amp; subscriber</span>`, kvTable([["Plan", "MetLife PDP Plus"], ["Payer claim #", `<span class="tabular-nums">MX260701-00418</span>`], ["Subscriber", `${esc(p.name)} <span class="text-gray-500">· Self</span>`], ["Member ID", `<span class="tabular-nums">XK20417793</span>`], ["Group #", `<span class="tabular-nums">0081142</span>`], ["Plan year", "Jan 1 – Dec 31, 2026"], ["Secondary", cDim("None on file")], ["Clearinghouse", "DentalXChange"]], { cols: 2 }))}
    ${psec("Billing &amp; treating dentist", kvTable([["Billing provider", "Bayview Family Dental"], ["Tax ID", '<span class="tabular-nums">94-3318402</span>'], ["Treating dentist", "Dr. Ethan Brooks"], ["Individual NPI", '<span class="tabular-nums">1487390215</span>'], ["Biller", `<span class="inline-flex items-center gap-1.5">${avatar(C4.biller, { size: 5 })}${C4.biller}</span>`]], { cols: 2 }))}
    ${psec("Narrative &amp; attachments", `<p class="text-sm text-gray-700">Tooth #19 had a large carious lesion into the pulp. Root canal done Jun 30; buildup and crown placed the same day to protect the tooth.</p>
      <div class="mt-2.5 flex flex-wrap gap-2">${[["image", "Periapical x-ray #19 · Jun 30"], ["image", "Bitewings · Jun 12"], ["file-text", "Narrative.pdf"]].map(([ic, l]) => `<span class="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-gray-200/80 text-[13px] text-gray-700">${I(ic, "size-3.5 text-gray-400")}${l}</span>`).join("")}</div>`, { actions: button("Add", { v: "white", s: "xs", icon: "paperclip" }) })}`;
}
/* v4 sent claim (second pass): the Claim tab is only the claim as it went to MetLife, laid out like the ADA claim form
 * block below (its recommended layout, cells you can still fix); the EOB tab is MetLife's answer laid out like a dental
 * EOB; History is unchanged. V4C_ADA is filled in by the claim form block. */
let V4C_ADA = null;
function v4cSentClaimBody(tab) {
  if (tab === 2) return v2SentClaimBody(2);
  if (!V4C_ADA) return "";
  return tab === 1 ? V4C_ADA.eob() : V4C_ADA.claim("The Claim tab is only the claim as sent, laid out like the ADA claim form (the same layout as the claim form block), and you can still fix its boxes. The adjudication table moved to the EOB tab. The status is the first line of the claim's table");
}
/* Panel body per tab: flush psec() sections, facts in metaGrid, tables boxed. Each fact shows once. */
function sentClaimBody(tab) {
  const p = DATA.patient("p2");
  if (V4) return v4cSentClaimBody(tab);
  if (V2) return v2SentClaimBody(tab);
  if (tab === 1) return `${psec("Payer & payment", metaGrid([["Payment method", "Paper check"], ["Check / EFT", `<span class="tabular-nums">#004418820</span>`], ["Payment date", "Aug 12, 2026"]], 3))}
    ${psec("Explanation of benefits", `<div class="${R.tableBox}"><table class="border-separate border-spacing-0 text-sm"><thead><tr>${["Code", "Tooth", "Submitted", "Allowed", "Plan %", "Insurance paid", "Patient Resp."].map((h, i) => `<th class="${R.tHead} ${i >= 2 ? "!text-end" : ""}">${h}</th>`).join("")}</tr></thead>
      <tbody>${ADJ.map((l) => `<tr><td class="${R.tCell} tabular-nums">${l.code}</td><td class="${R.tCell} tabular-nums">#${l.tooth}</td><td class="${R.tCell} text-end tabular-nums">${money(l.charged)}</td><td class="${R.tCell} text-end tabular-nums">${money(l.allowed)}</td><td class="${R.tCell} text-end tabular-nums">${l.code === "D3330" ? "80%" : "50%"}</td><td class="${R.tCell} text-end tabular-nums">${money(l.paid)}</td><td class="${R.tCell} text-end tabular-nums">${money(l.pt)}</td></tr>`).join("")}</tbody>
      <tfoot><tr><td colspan="2" class="h-9 px-3 font-medium text-gray-800">Total</td>${["charged", "allowed"].map((k) => `<td class="h-9 px-3 text-end font-semibold tabular-nums">${money(cSum(ADJ, k))}</td>`).join("")}<td></td>${["paid", "pt"].map((k) => `<td class="h-9 px-3 text-end font-semibold tabular-nums">${money(cSum(ADJ, k))}</td>`).join("")}</tr></tfoot></table></div>`)}
    ${psec("Payer remarks", `<div class="space-y-1 text-sm text-gray-700"><p><span class="tabular-nums text-gray-500 me-1.5">CO-45</span>Charge exceeds the fee schedule. The office writes this off.</p><p><span class="tabular-nums text-gray-500 me-1.5">PR-2</span>Coinsurance. The patient pays this.</p></div>`)}`;
  if (tab === 2) return psec("", timeline([
    ["Patient billed", "Sep 1, 8:00 AM · on the September statement · Asha", true],
    ["Payment posted · $1,310.50 to 3 lines", "Aug 15, 10:20 AM · Nina Flores"],
    ["EOB received · paid $1,310.50, patient owes $797.50", "Aug 14, 6:02 AM · paper check #004418820, scanned"],
    ["With payer", "Jul 2, 9:15 AM · MetLife acknowledged the claim"],
    ["Accepted by clearinghouse", "Jul 1, 8:07 AM · DentalXChange"],
    ["Claim Submitted", "Jul 1, 8:05 AM · Asha, with x-ray and narrative"],
    ["Claim Created", "Jun 30, 4:12 PM · from 3 completed procedures · Dr. Ethan Brooks"]]), { cls: "!py-5" });
  return `${statusLine(CLAIM_STATUS.partial.label, "mid", `${filingCaption(C4.filing)} · payment posted Aug 15`)}
    ${psec("Claim", metaGrid([["Biller", `<span class="inline-flex items-center gap-1.5">${avatar(C4.biller, { size: 5 })}${C4.biller}</span>`], ["Payer claim #", `<span class="tabular-nums">MX260701-00418</span>`], ["Clearinghouse", "DentalXChange"]], 3))}
    ${psec("Primary adjudication by procedure", adjTable(), { count: ADJ.length })}
    ${psec("Patient & coverage", metaGrid([["Subscriber", `${esc(p.name)} <span class="text-gray-500">· Self</span>`], ["Member ID", `<span class="tabular-nums">XK20417793</span>`], ["Plan", "MetLife PDP Plus"], ["Group #", `<span class="tabular-nums">0081142</span>`], ["Secondary", cDim("None on file")], ["Plan year", "Jan 1 – Dec 31, 2026"]], 3))}
    ${psec("Narrative & attachments", `<p class="text-sm text-gray-700">Tooth #19 had a large carious lesion into the pulp. Root canal done Jun 30; buildup and crown placed the same day to protect the tooth.</p>
      <div class="mt-2.5 flex flex-wrap gap-2">${[["image", "Periapical x-ray #19 · Jun 30"], ["image", "Bitewings · Jun 12"], ["file-text", "Narrative.pdf"]].map(([ic, l]) => `<span class="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg border border-gray-200/80 text-[13px] text-gray-700">${I(ic, "size-3.5 text-gray-400")}${l}</span>`).join("")}</div>`, { actions: button("Add", { v: "white", s: "xs", icon: "paperclip" }) })}
    ${psec("Providers", metaGrid([["Billing provider", "Bayview Family Dental"], ["Rendering", "Dr. Ethan Brooks"], ["Individual NPI", '<span class="tabular-nums">1487390215</span>'], ["Tax ID", '<span class="tabular-nums">94-3318402</span>']], 4))}`;
}
const V2_ACTIONS_MENU = `<div class="absolute start-5 bottom-[60px] z-20 ${R.menu} !w-64" role="menu" aria-label="Claim actions"${chg("Menu items are in sentence case like the rest of the app (\"Preview claim\", not \"Preview Claim\")")}>
  <div class="relative mb-1"><span class="absolute inset-y-0 start-0 flex items-center ps-2 pointer-events-none">${I("search", "size-4 text-gray-400")}</span><input class="w-full h-8 ps-8 pe-2 text-[13px] bg-transparent outline-hidden placeholder:text-gray-400 border-b border-gray-200/80" placeholder="Search actions…" aria-label="Search actions" /></div>
  <p class="${R.menuLabel}">Payment</p>
  ${[["hand-coins", "Post payment"], ["sparkles", "Auto-post from EOB"], ["file-search", "View source EOB", "focus"]].map(([ic, l, f]) => `<button type="button" role="menuitem" class="${R.menuItem} ${f ? "bg-gray-100" : ""}">${I(ic)}${l}${f ? '<span class="ms-auto text-xs text-gray-400">↵</span>' : ""}</button>`).join("")}
  <p class="${R.menuLabel}">Claim</p>
  ${[["eye", "Preview claim"], ["refresh-cw", "Refresh claim status"], ["paperclip", "Send additional attachments"], ["scale", "Prepare appeal"], ["copy-plus", "Create secondary claim"], ["eraser", "Write off"]].map(([ic, l]) => `<button type="button" role="menuitem" class="${R.menuItem}">${I(ic)}${l}</button>`).join("")}
  <div class="${R.menuSep}"></div><button type="button" role="menuitem" class="${R.menuDanger}">${I("ban")}Void claim</button></div>`;
const ACTIONS_MENU = `<div class="absolute start-5 bottom-[60px] z-20 ${R.menu} !w-64" role="menu" aria-label="Claim actions">
  <div class="relative mb-1"><span class="absolute inset-y-0 start-0 flex items-center ps-2 pointer-events-none">${I("search", "size-4 text-gray-400")}</span><input class="w-full h-8 ps-8 pe-2 text-[13px] bg-transparent outline-hidden placeholder:text-gray-400 border-b border-gray-200/80" placeholder="Search actions..." aria-label="Search actions" /></div>
  <p class="${R.menuLabel}">Payment</p>
  ${[["hand-coins", "Post payment"], ["sparkles", "Auto-post from EOB"], ["file-search", "View source EOB", "focus"]].map(([ic, l, f]) => `<button type="button" role="menuitem" class="${R.menuItem} ${f ? "bg-gray-100" : ""}">${I(ic)}${l}${f ? '<span class="ms-auto text-xs text-gray-400">↵</span>' : ""}</button>`).join("")}
  <p class="${R.menuLabel}">Claim</p>
  ${[["eye", "Preview Claim"], ["refresh-cw", "Refresh Claim Status"], ["paperclip", "Send Additional Attachments"], ["scale", "Prepare Appeal"], ["copy-plus", "Create Secondary Claim"], ["eraser", "Write Off"]].map(([ic, l]) => `<button type="button" role="menuitem" class="${R.menuItem}">${I(ic)}${l}</button>`).join("")}
  <div class="${R.menuSep}"></div><button type="button" role="menuitem" class="${R.menuDanger}">${I("ban")}Void Claim</button></div>`;

/* v4: the claim's Actions menu on the standard component (the one every record uses) */
const CLAIM_ACTIONS = [
  { label: "Payment", items: [{ icon: "hand-coins", label: "Post payment", hint: "Enter what MetLife paid, line by line" }, { icon: "wand-sparkles", label: "Auto-post from EOB", hint: "Fill the payment from the EOB for you to check" },
    { icon: "file-search", label: "View source EOB", hint: "Open the EOB this claim was paid on" }] },
  { label: "Claim", items: [{ icon: "eye", label: "Preview claim", hint: "The ADA form as MetLife got it" }, { icon: "refresh-cw", label: "Refresh claim status", hint: "Ask MetLife for the latest" },
    { icon: "paperclip", label: "Send additional attachments", hint: "X-rays, perio charts or a narrative" }, { icon: "scale", label: "Prepare appeal", hint: "Start a letter for a denied line", suggest: "MetLife paid $142.50 less than estimated on the buildup and crown" },
    { icon: "copy-plus", label: "Create secondary claim", hint: "Bill the rest to a second plan", off: "No secondary insurance on file" }, { icon: "eraser", label: "Write off", hint: "Write off what the patient won't owe" }] },
  { label: "", items: [{ icon: "ban", label: "Void claim", danger: true }] }];

/* ======================================================= 2. Sent claim panel */
defineBlock({
  cat: "claims", id: "claims-sent-panel", title: "Sent claim",
  note: V4 ? "A claim after the payer answered. Claim is only the claim as it went out, laid out like the ADA claim form block (most used boxes first, the rest behind More claim details), and its boxes are still cells you can fix. EOB is the payer's answer laid out like a dental EOB: payment, payer and claim facts, the services with billed, allowed, write-off, deductible, plan %, insurance paid, patient responsibility and remark codes, what went toward the plan's limits, and the remark code legend. History is a timeline. Actions is the standard menu." : "A claim after the payer answered: status and filing days in the header, then Primary adjudication by procedure, where every line adds up. History is a timeline. The Actions menu is searchable, and View source EOB lives there.",
  where: "Revenue Cycle › Claims › Adjudicated › claim",
  states: ["Claim", "EOB", "History"],
  canvas: "bare",
  html: (state) => {
    const tab = ["Claim", "EOB", "History"].indexOf(state), p = DATA.patient("p2");
    const rows = CLAIMS.filter((c) => ["paid", "partial"].includes(c.status));
    return `<div class="flex min-h-[720px]">${cFaded(claimsSlice(rows, "c4", 3))}${sheetPanel({
      flush: true, w: V4 ? 1000 : 760, cls: "relative shrink-0 !h-auto self-stretch", lead: avatar(p.name, { size: 9 }),
      title: `<a class="hover:underline underline-offset-4" href="#">${p.name}</a>`, subtitle: `MetLife · Primary · Service ${fmtDate(C4.svc)} · Sent ${fmtDate(C4.sent)}`,
      actions: (V2 ? `<span class="me-1 text-[13px] text-gray-500 tabular-nums whitespace-nowrap"${chg("Prev / next say where you are in the queue: \"1 of 3 in Adjudicated\"")}>1 of ${rows.length} in Adjudicated</span>` : "") + iconButton("chevron-up", "Previous claim", { s: "iconSm" }) + iconButton("chevron-down", "Next claim", { s: "iconSm" }) + iconButton("external-link", "Open in Claims", { s: "iconSm" }),
      marks: "",
      tabs: ["Claim", "EOB", "History"], tab, body: sentClaimBody(tab),
      footer: `${V4 ? `<span class="flex"${chg4("The Actions button is the standard Actions menu every record uses: search it, actions grouped by payment and claim, a sparkle on Prepare appeal because MetLife paid $142.50 less than estimated, and Create secondary claim greyed with the reason")}>${actionsMenu(CLAIM_ACTIONS, { open: V4_OPTS.open })}</span>` : button("Actions", { v: "white", s: "sm", iconEnd: tab === 0 ? "chevron-up" : "chevron-down", attrs: `aria-haspopup="menu" aria-expanded="${tab === 0}"` })}<span class="grow"></span>${button("Close claim", { v: "solid", s: "sm" })}`
    }).replace(/<\/aside>$/, `${tab === 0 && !V4 ? (V2 ? V2_ACTIONS_MENU : ACTIONS_MENU) : ""}</aside>`)}</div>`;
  },
  mount: (el) => { const aside = el.querySelector("aside"), body = aside.querySelector(".overflow-y-auto"); const menu = V4 ? null : aside.querySelector('[role="menu"]'); // v4: the [role=menu] is the Actions menu, which stays
    const ada = () => { if (V4 && V4C_ADA) V4C_ADA.wire(aside); }; ada();
    wireTabs(aside.querySelector("nav"), (i) => { body.innerHTML = sentClaimBody(i); if (menu) menu.remove(); icons(); ada(); }); }
});

/* ======================================================= 3. Payment posting (EOB posting v2) */
const postHead = (dup) => [["Transaction date", cSelect(dup ? "Sep 25, 2026" : "Aug 15, 2026", "calendar")], ["Check #", `<input class="${R.input} tabular-nums" value="004418820" aria-label="Check number" />`], ["Method", cSelect("Check", "banknote")], ["Payment type", cSelect("Insurance check", "")], ["Claim", cSelect(`MetLife · ${fmtDate(C4.svc)} · ${money(C4.billed)}`, "file-text")], ["EOB", cSelect("MetLife EOB · received Aug 14", "file-search")], ["Ins. paid amount", `<div class="relative"><span class="absolute inset-y-0 start-0 flex items-center ps-3 text-sm text-gray-400">$</span><input class="${R.input} !ps-7 text-end tabular-nums" value="1,310.50" aria-label="Insurance paid amount" data-check /></div>`], ["Adjustment type", cSelect("PPO write-off (CO-45)", "")]];
const POST_COLS = [["Description", ""], ["Provider", ""], ["Charge", "charged"], ["Allowed", "allowed", 1], ["Adj.", "wo", 1], ["Ins. Est.", "est"], ["Ins. Paid", "paid", 1], ["Balance", "bal"], ["Pt. Resp.", "pt"]];
function postLines(lines) {
  const calc = lines.map((l) => ({ ...l, bal: cAdd(l.charged, -l.wo, -l.paid), pt: cAdd(l.charged, -l.wo, -l.paid) }));
  const cell = "h-9 px-3 border-b border-e border-gray-200/80 text-sm whitespace-nowrap";
  return `<div class="${R.tableBox} !overflow-x-auto" data-scroll-ok><table class="table-fixed border-separate border-spacing-0 text-sm"><colgroup><col class="w-[236px]"><col class="w-[96px]">${POST_COLS.slice(2).map(() => "<col>").join("")}</colgroup>
    <thead><tr>${POST_COLS.map(([h], i) => `<th class="${R.gridHead} ${i >= 2 ? "!text-end" : ""} ${i === POST_COLS.length - 1 ? "!border-e-0" : ""}">${h}</th>`).join("")}</tr></thead>
    <tbody>${calc.map((l, r) => `<tr><td class="${cell} truncate"><span class="tabular-nums">${l.code}</span> <span class="text-gray-500 tabular-nums">#${l.tooth}</span> ${l.desc}</td><td class="${cell} text-gray-600">${l.prov}</td>${POST_COLS.slice(2).map(([, k, edit], i) => edit
      ? `<td class="${cell} !p-0 bg-white"><input class="w-full h-9 px-3 bg-transparent text-end tabular-nums outline-hidden hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-500" value="${money(l[k])}" data-line="${r}" data-k="${k}" aria-label="${POST_COLS[i + 2][0]} for line ${r + 1}" /></td>`
      : `<td class="${cell} text-end tabular-nums ${k === "est" ? "text-gray-500" : ""} ${i === POST_COLS.length - 3 ? "!border-e-0" : ""}">${money(l[k])}</td>`).join("")}</tr>`).join("")}</tbody>
    <tfoot><tr><td colspan="2" class="h-9 px-3 font-medium text-gray-800">Totals</td>${POST_COLS.slice(2).map(([, k]) => `<td class="h-9 px-3 text-end font-semibold tabular-nums">${money(cSum(calc, k))}</td>`).join("")}</tr></tfoot></table></div>`;
}
/* v2 payment posting: horizontal header fields (label left, 32px control right) so the lines start higher; the lines on
 * the claim form's compact sheet with pencil marks on the columns you can type in; alerts as orange marks where you act
 * (the duplicate next to Save anyway, a check mismatch in the totals row), and a fixed-height bottom tab. */
const V2_POST_COLS = [[MONEY_LABEL.billed, "charged"], [MONEY_LABEL.allowed, "allowed", 1], [MONEY_LABEL.writeOff, "wo", 1], [MONEY_LABEL.insEst, "est"], [MONEY_LABEL.insPaid, "paid", 1], [MONEY_LABEL.balance, "bal"], [MONEY_LABEL.ptResp, "pt"]];
const V2_PT_PAID = { D2950: 40 }; // Liam paid $40.00 toward the buildup at the visit, so Balance and Pt. resp. differ on that line
const v2Field = (label, control) => `<div class="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-3"><span class="text-[13px] text-gray-500">${label}</span>${control}</div>`;
const v2SelSm = (v, icon) => `<button type="button" class="${R.selectSm}"><span class="inline-flex items-center gap-2 truncate">${icon ? I(icon, "!text-gray-500") : ""}${v}</span>${I("chevrons-up-down")}</button>`;
const v2PostHead = (dup) => [["Transaction date", v2SelSm(dup ? "Sep 25, 2026" : "Aug 15, 2026", "calendar")], ["Check #", `<input class="${R.inputSm} tabular-nums" value="004418820" aria-label="Check number" />`], ["Method", v2SelSm("Check")], ["Payment type", v2SelSm("Insurance check")], ["Claim", v2SelSm(`MetLife · ${fmtDate(C4.svc)} · ${money(C4.billed)}`)], ["EOB", v2SelSm("MetLife EOB · received Aug 14")], ["Ins. paid amount", `<div class="relative"><span class="absolute inset-y-0 start-0 flex items-center ps-2.5 text-[13px] text-gray-400">$</span><input class="${R.inputSm} !ps-6 text-end tabular-nums" value="1,310.50" aria-label="Insurance paid amount" data-check /></div>`], ["Adjustment type", v2SelSm("PPO write-off (CO-45)")]];
function v2PostLines(lines, check) {
  const calc = lines.map((l) => { const ptPaid = V2_PT_PAID[l.code] || 0; return { ...l, ptPaid, pt: cAdd(l.charged, -l.wo, -l.paid), bal: cAdd(l.charged, -l.wo, -l.paid, -ptPaid) }; });
  const th = "h-7 px-2 border-b border-e border-gray-200/80 bg-gray-50 text-start text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap";
  const td = "h-7 px-2 border-b border-e border-gray-200/80 text-[13px] leading-none text-gray-800 whitespace-nowrap", ft = "h-7 px-2 border-e border-gray-200/80 bg-gray-50 text-[13px] font-medium text-gray-800 whitespace-nowrap";
  const paid = cSum(calc, "paid"), off = Math.abs(paid - check) > 0.004;
  const pencil = `<span class="inline-flex" tabindex="0" data-tip="You can edit this column">${I("pencil", "size-3 text-gray-400")}</span>`;
  return `<div class="${R.tableBox} !overflow-x-auto" data-scroll-ok><table class="w-full table-fixed border-separate border-spacing-0" data-kept="1"><colgroup><col><col class="w-[92px]">${V2_POST_COLS.map(() => '<col class="w-[96px]">').join("")}</colgroup>
    <thead><tr><th class="${th}">Description</th><th class="${th}">Provider</th>${V2_POST_COLS.map(([h, k, edit], i) => `<th class="${th} !text-end ${i === V2_POST_COLS.length - 1 ? "!border-e-0" : ""}"><span class="inline-flex items-center gap-1"${edit && k === "allowed" ? chg("A small pencil marks the columns you can type in (hover it); the caption under the table that explained this is gone") : ""}>${edit ? pencil : ""}${h}</span></th>`).join("")}</tr></thead>
    <tbody>${calc.map((l, r) => `<tr><td class="${td} truncate"><span class="tabular-nums">${l.code}</span> <span class="text-gray-500 tabular-nums">#${l.tooth}</span> ${l.desc}</td><td class="${td} text-gray-600">${l.prov}</td>${V2_POST_COLS.map(([, k, edit], i) => edit
      ? `<td class="${td} !p-0"><input class="w-full h-7 px-2 bg-transparent text-[13px] text-end tabular-nums outline-hidden hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-500" value="${money(l[k])}" data-line="${r}" data-k="${k}" aria-label="${V2_POST_COLS[i][0]} for line ${r + 1}" /></td>`
      : `<td class="${td} text-end tabular-nums ${k === "est" ? "text-gray-500" : ""} ${i === V2_POST_COLS.length - 1 ? "!border-e-0" : ""}">${k === "bal" && l.ptPaid ? `<span class="cursor-help underline decoration-dotted decoration-gray-300 underline-offset-4" tabindex="0" data-tip="Liam paid ${money(l.ptPaid)} toward this at the visit"${chg("One sample line has a patient payment, so Balance and Pt. resp. differ and each column earns its place (they were identical on every line)")}>${money(l[k])}</span>` : money(l[k])}</td>`).join("")}</tr>`).join("")}</tbody>
    <tfoot><tr><td colspan="2" class="${ft}"><span class="flex items-center justify-between gap-3">Total${off ? v2bcFlag("Doesn't match check", `The lines add up to ${money(paid)}, but the check says ${money(check)}. Fix a line or the Ins. paid amount.`) : ""}</span></td>${V2_POST_COLS.map(([, k], i) => `<td class="${ft} text-end font-semibold tabular-nums ${i === V2_POST_COLS.length - 1 ? "!border-e-0" : ""}">${money(cSum(calc, k))}</td>`).join("")}</tr></tfoot></table></div>`;
}
function v2Posting(dup) {
  const up = (html) => `<span class="[&_[role=tooltip]]:!top-auto [&_[role=tooltip]]:bottom-full [&_[role=tooltip]]:!mt-0 [&_[role=tooltip]]:mb-1.5">${html}</span>`;
  return `<div class="${R.dialog} !w-full" role="dialog" aria-label="Insurance Payment">
    <div class="flex items-start justify-between gap-4 px-5 pt-4 pb-3.5"><div><h3 class="text-base font-semibold text-gray-800">Insurance Payment</h3><p class="${R.help} mt-0.5">Apply an insurance payment to the selected claim. Liam Carter · MetLife · Service ${fmtDate(C4.svc)}</p></div><div class="flex items-center gap-0.5 -me-2">${iconButton("maximize-2", "Maximize", { s: "iconSm" })}${iconButton("x", "Close", { s: "iconSm" })}</div></div>
    ${psec("", `<div class="grid grid-cols-2 gap-x-8 gap-y-2"${chg("Header fields sit label-left with 32px controls: the 8 fields take about 160px instead of 322px, so the lines and totals fit without scrolling. Decorative icons in the selects are gone.")}>${v2PostHead(dup).map(([l, c]) => v2Field(l, c)).join("")}</div>`)}
    ${psec(`<span${chg("The lines use the claim form's compact sheet (28px rows, cell lines) and the shared money words: Billed, Allowed, Write-off, Ins. est., Ins. paid, Balance, Pt. resp.")}>Line items</span>`, `<div data-lines>${v2PostLines(ADJ, C4.paid)}</div>`, { count: ADJ.length })}
    <section class="border-t border-gray-200/80" data-bottom-tabs><div class="px-5 border-b border-gray-200/80">${tabsBar(["Notes", "Deductibles"], 0, "!border-0")}</div><div class="h-[124px] overflow-y-auto" data-bottom${chg("Notes and Deductibles have one fixed height, so the dialog doesn't resize when you switch tabs")}>${v2BottomTab(0)}</div></section>
    <div class="flex items-center justify-between gap-2 px-5 py-3 border-t border-gray-200/80"><label class="inline-flex items-center gap-2 text-sm text-gray-700">${checkbox(false, "Expecting another insurance payment")}Expecting another insurance payment</label>
      <div class="flex items-center gap-2">${dup ? `<span class="me-1"${chg("The duplicate warning is an orange mark right where you'd click Save anyway, not a two-line banner across the top")}>${up(alertMark("Possible duplicate", `MetLife already paid ${money(C4.paid)} on this claim with check #004418820, posted Aug 15 by Nina Flores. Saving again would count it twice.`))}</span>${button("Go back and edit", { v: "white", s: "sm" })}${button("Save anyway", { v: "solid", s: "sm" })}` : `<span class="text-[13px] text-gray-500">Save posts all ${ADJ.length} lines</span>${button("Cancel", { v: "white", s: "sm" })}${button("Save", { v: "solid", s: "sm" })}`}</div></div></div>`;
}
function v2BottomTab(i) {
  if (i === 1) return `<div class="px-5 py-3">${v2bcSheet({ title: "Deductibles", rows: [["Individual · Liam Carter", 50, 50, 0, 0], ["Family · Carter", 150, 50, 0, 100]],
    columns: [{ label: "Deductible", w: 180, flex: true, render: (r) => r[0] }, ...["Amount", "Met before this EOB", "Applied on this EOB", "Left"].map((label, k) => ({ label, w: 96, num: true, render: (r) => (r[k + 1] ? money(r[k + 1]) : cDim(money(0))) }))] })}</div>`;
  return `<div class="px-5 py-3"><textarea class="${R.textarea} !min-h-[92px]" placeholder="Optional notes to store with this posting" aria-label="Notes">Crown paid at 50%. Patient owes $797.50; added to the next statement.</textarea></div>`;
}
/* v4 payment posting: the eight payment fields are two field tables you type into; the lines are the claim-form grid
 * with spreadsheet editing (Allowed, Write-off, Ins. paid); typing Allowed fills Write-off, and Balance, Pt. resp. and
 * the totals follow. The totals row rechecks the lines against the check amount whenever either changes. */
function v4cPostLines(st) {
  const calc = (l) => { l.pt = cAdd(l.charged, -l.wo, -l.paid); l.bal = cAdd(l.pt, -(V2_PT_PAID[l.code] || 0)); return l; };
  const rows = ADJ.map((l, i) => calc({ id: `pl${i}`, code: l.code, tooth: l.tooth, desc: l.desc, prov: l.prov, charged: l.charged, allowed: l.allowed, wo: l.wo, est: l.est, paid: l.paid }));
  const K = ["charged", "allowed", "wo", "est", "paid", "bal", "pt"];
  st.foot = (rs) => { const paid = cSum(rs, "paid"), off = Math.abs(paid - st.check) > 0.004;
    return [`<span class="flex items-center justify-between gap-3">Total${off ? v2bcFlag("Doesn't match check", `The lines add up to ${money(paid)}, but the check says ${money(st.check)}. Fix a line or the Ins. paid amount.`) : ""}</span>`, "", ...K.map((k) => money(cSum(rs, k)))]; };
  const m = (key, label, edit, render) => ({ key, label, w: 96, num: true, kind: "money", ...(edit ? { edit: "text" } : {}), render: render || ((l) => (l[key] ? money(l[key]) : cDim(money(0)))) });
  return sheetTable({ preset: "form", title: "Line items", rows, foot: st.foot(rows),
    onCommit: (l, k, v, g) => { let why;
      if (v < 0) why = "Type an amount, like 855.00.";
      else if (k === "allowed") { if (v > l.charged) why = `Allowed can't be more than what was billed (${money(l.charged)}).`; else l.wo = cAdd(l.charged, -v); }
      calc(l); g.o.foot = st.foot(g.data); return why; },
    columns: [{ key: "desc", label: "Description", w: 200, grow: true, render: (l) => `<span class="tabular-nums">${l.code}</span> <span class="text-gray-500 tabular-nums">#${l.tooth}</span> ${esc(l.desc)}` },
      { key: "prov", label: "Provider", w: 92, render: (l) => `<span class="text-gray-600">${esc(l.prov)}</span>` },
      m("charged", MONEY_LABEL.billed), m("allowed", MONEY_LABEL.allowed, true), m("wo", MONEY_LABEL.writeOff, true), m("est", MONEY_LABEL.insEst, false, (l) => `<span class="text-gray-500">${money(l.est)}</span>`),
      m("paid", MONEY_LABEL.insPaid, true), m("bal", MONEY_LABEL.balance, false, (l) => (V2_PT_PAID[l.code] ? `<span class="cursor-help underline decoration-dotted decoration-gray-300 underline-offset-4" tabindex="0" data-tip="Liam paid ${money(V2_PT_PAID[l.code])} toward this at the visit">${money(l.bal)}</span>` : money(l.bal))),
      m("pt", MONEY_LABEL.ptResp, false, (l) => money(l.pt))] });
}
function v4cPostHead(dup, st) {
  const claim = `MetLife · ${fmtDate(C4.svc)} · ${money(C4.billed)}`;
  const left = [{ label: "Transaction date", value: dup ? "Sep 25, 2026" : "Aug 15, 2026", type: "text" }, { label: "Check #", value: "004418820", type: "text", html: v4cNums },
    { label: "Method", value: "Check", type: "select", options: ["Check", "EFT", "Virtual card"] }, { label: "Payment type", value: "Insurance check", type: "select", options: ["Insurance check", "Insurance EFT", "Capitation"] }];
  const right = [{ label: "Claim", value: claim, type: "select", options: [claim, `MetLife · Jun 12 · ${money(245)}`] }, { label: "EOB", value: "MetLife EOB · received Aug 14", type: "select", options: ["MetLife EOB · received Aug 14", "Upload another EOB"] },
    { label: "Ins. paid amount", value: C4.paid.toFixed(2), type: "text", html: v4cMoney, check: true }, { label: "Adjustment type", value: "PPO write-off (CO-45)", type: "select", options: ["PPO write-off (CO-45)", "Contractual adjustment", "Courtesy adjustment"] }];
  const onCommit = (row, k, v, g) => { if (!row.check) return; const n = v4cNum(v); if (n == null || n < 0) return "Type the check amount, like 1,310.50."; st.check = n;
    const lines = g.root.closest('[role="dialog"]')?.querySelector("[data-post-lines] [data-sheet-host]")?._grid; if (lines) { lines.o.foot = st.foot(lines.data); lines.render(); } };
  return v4cPair(left, right, { title: "Payment", labelW: 136, onCommit });
}
function v4cBottomTab(i) {
  if (i !== 1) return v2BottomTab(0);
  const rows = [{ id: "d1", name: "Individual · Liam Carter", amt: 50, met: 50, applied: 0 }, { id: "d2", name: "Family · Carter", amt: 150, met: 50, applied: 0 }];
  const amt = (k) => ({ key: k, label: { amt: "Amount", met: "Met before this EOB" }[k], w: 140, num: true, kind: "money", render: (r) => (r[k] ? money(r[k]) : cDim(money(0))) });
  return `<div class="px-5 py-3"${chg4("Applied on this EOB is a cell you type into when MetLife took part of the deductible; Left follows")}>${sheetTable({ preset: "form", title: "Deductibles", rows,
    onCommit: (r, k, v) => (v < 0 ? "Type an amount, like 50.00." : cAdd(r.met, v) > r.amt ? `Only ${money(cAdd(r.amt, -r.met))} of this deductible is left to meet.` : undefined),
    columns: [{ key: "name", label: "Deductible", w: 180, grow: true }, amt("amt"), amt("met"), { key: "applied", label: "Applied on this EOB", w: 150, num: true, kind: "money", edit: "text", render: (r) => (r.applied ? money(r.applied) : cDim(money(0))) },
      { key: "left", label: "Left", w: 96, num: true, kind: "money", render: (r) => { const l = Math.max(0, cAdd(r.amt, -r.met, -r.applied)); return l ? money(l) : cDim(money(0)); } }] })}</div>`;
}
function v4cPosting(dup) {
  const st = { check: C4.paid, foot: () => [] };
  const up = (html) => `<span class="[&_[role=tooltip]]:!top-auto [&_[role=tooltip]]:bottom-full [&_[role=tooltip]]:!mt-0 [&_[role=tooltip]]:mb-1.5">${html}</span>`;
  return `<div class="${R.dialog} !w-full" role="dialog" aria-label="Insurance Payment">
    <div class="flex items-start justify-between gap-4 px-5 pt-4 pb-3.5"><div><h3 class="text-base font-semibold text-gray-800">Insurance Payment</h3><p class="${R.help} mt-0.5">Apply an insurance payment to the selected claim. Liam Carter · MetLife · Service ${fmtDate(C4.svc)}</p></div><div class="flex items-center gap-0.5 -me-2">${iconButton("maximize-2", "Maximize", { s: "iconSm" })}${iconButton("x", "Close", { s: "iconSm" })}</div></div>
    ${psec("", `<div${chg4("The eight payment fields are two small tables you type into, label on the left like Dentrix: click a cell or just type, lists search as you type, Enter saves and moves down. Change Ins. paid amount and the totals row rechecks it against the lines")}>${v4cPostHead(dup, st)}</div>`)}
    ${psec("Line items", `<div data-post-lines${chg4("Allowed, Write-off and Ins. paid are spreadsheet cells: click or type, Enter saves and moves down. Typing Allowed fills Write-off; Balance, Pt. resp. and the totals follow. The pencils on the headers are gone")}>${v4cPostLines(st)}</div>`, { count: ADJ.length })}
    <section class="border-t border-gray-200/80" data-bottom-tabs><div class="px-5 border-b border-gray-200/80">${tabsBar(["Notes", "Deductibles"], 0, "!border-0")}</div><div class="h-[124px] overflow-y-auto" data-bottom>${v4cBottomTab(0)}</div></section>
    <div class="flex items-center justify-between gap-2 px-5 py-3 border-t border-gray-200/80"><label class="inline-flex items-center gap-2 text-sm text-gray-700">${checkbox(false, "Expecting another insurance payment")}Expecting another insurance payment</label>
      <div class="flex items-center gap-2">${dup ? `<span class="me-1">${up(alertMark("Possible duplicate", `MetLife already paid ${money(C4.paid)} on this claim with check #004418820, posted Aug 15 by Nina Flores. Saving again would count it twice.`))}</span>${button("Go back and edit", { v: "white", s: "sm" })}${button("Save anyway", { v: "solid", s: "sm" })}` : `<span class="text-[13px] text-gray-500">Save posts all ${ADJ.length} lines</span>${button("Cancel", { v: "white", s: "sm" })}${button("Save", { v: "solid", s: "sm" })}`}</div></div></div>`;
}
defineBlock({
  cat: "claims", id: "claims-payment-posting", title: "Payment posting",
  note: "Posting an insurance payment from an EOB. The header fields sit in a two-column grid; the lines are one spreadsheet with no status or action columns. Type in Allowed, Adj. or Ins. Paid and the balances and totals redo themselves. Save posts every line.",
  where: "Revenue Cycle › Claims › Post payment",
  states: ["Ready to save", "Possible duplicate"],
  html: (state) => {
    const dup = state === "Possible duplicate";
    if (V4) return v4cPosting(dup);
    if (V2) return v2Posting(dup);
    return `<div class="${R.dialog} !w-full" role="dialog" aria-label="Insurance Payment">
      <div class="flex items-start justify-between gap-4 px-5 pt-4 pb-3.5"><div><h3 class="text-base font-semibold text-gray-800">Insurance Payment</h3><p class="${R.help} mt-0.5">Apply an insurance payment to the selected claim. Liam Carter · MetLife · Service ${fmtDate(C4.svc)}</p></div><div class="flex items-center gap-0.5 -me-2">${iconButton("maximize-2", "Maximize", { s: "iconSm" })}${iconButton("x", "Close", { s: "iconSm" })}</div></div>
      ${dup ? psec("", `<div class="-my-1.5">${infoRow("circle-alert", `<span class="font-medium">Possible duplicate payment.</span> MetLife already paid ${money(C4.paid)} on this claim with check #004418820, posted Aug 15 by Nina Flores. Saving again would count it twice. You can save these amounts or go back to make changes.`, { tone: "needs" })}</div>`) : ""}
      ${psec("", `<div class="grid grid-cols-2 gap-x-5 gap-y-3.5">${postHead(dup).map(([l, c]) => cField(l, c)).join("")}</div>`)}
      ${psec("Line items", `<div class="mb-2.5 empty:hidden" data-mismatch></div><div data-lines>${postLines(ADJ)}</div><p class="${R.caption} mt-2">Allowed, Adj. and Ins. Paid can be changed. Balance and Pt. Resp. follow. From the MetLife EOB, received Aug 14.</p>`, { count: ADJ.length })}
      <section class="border-t border-gray-200/80" data-bottom-tabs><div class="px-5 border-b border-gray-200/80">${tabsBar(["Notes", "Deductibles"], 0, "!border-0")}</div><div data-bottom>${bottomTab(0)}</div></section>
      <div class="flex items-center justify-between gap-2 px-5 py-3 border-t border-gray-200/80"><label class="inline-flex items-center gap-2 text-sm text-gray-700">${checkbox(false, "Expecting another insurance payment")}Expecting another insurance payment</label>
        <div class="flex items-center gap-2">${dup ? `${button("Go back and edit", { v: "white", s: "sm" })}${button("Save anyway", { v: "solid", s: "sm" })}` : `<span class="text-[13px] text-gray-500">Save posts all ${ADJ.length} lines</span>${button("Cancel", { v: "white", s: "sm" })}${button("Save", { v: "solid", s: "sm" })}`}</div></div></div>`;
  },
  mount: (el) => {
    if (V4) return wireTabs(el.querySelector("[data-bottom-tabs]"), (i) => { el.querySelector("[data-bottom]").innerHTML = v4cBottomTab(i); icons(); });
    if (V2) {
      const lines = ADJ.map((l) => ({ ...l })), host = el.querySelector("[data-lines]"), check = el.querySelector("[data-check]");
      const ck = () => parseFloat(check.value.replace(/,/g, "")) || 0;
      const draw = () => { const focus = document.activeElement && host.contains(document.activeElement) ? [document.activeElement.dataset.line, document.activeElement.dataset.k] : null;
        host.innerHTML = v2PostLines(lines, ck()); icons();
        if (focus && focus[0] != null) { const n = host.querySelector(`[data-line="${focus[0]}"][data-k="${focus[1]}"]`); if (n) n.focus(); } };
      host.addEventListener("change", (e) => { const t = e.target.closest("[data-line]"); if (!t) return; const v = parseFloat(t.value.replace(/[$,]/g, ""));
        if (isFinite(v)) lines[+t.dataset.line][t.dataset.k] = Math.round(v * 100) / 100;
        /* Re-draw after the event finishes: replacing the focused input inside its own change event makes Chrome fire it twice */
        if (host._pending) return; host._pending = true; requestAnimationFrame(() => { host._pending = false; draw(); }); });
      check.addEventListener("change", draw);
      wireTabs(el.querySelector("[data-bottom-tabs]"), (i) => { el.querySelector("[data-bottom]").innerHTML = v2BottomTab(i); icons(); });
      return;
    }
    const lines = ADJ.map((l) => ({ ...l })), host = el.querySelector("[data-lines]"), mm = el.querySelector("[data-mismatch]"), check = el.querySelector("[data-check]");
    const checkMsg = () => { const paid = cSum(lines, "paid"), ck = parseFloat(check.value.replace(/,/g, "")) || 0;
      mm.innerHTML = Math.abs(paid - ck) > 0.004 ? infoRow("circle-alert", `The lines add up to ${money(paid)}, but the check says ${money(ck)}. Fix a line or the Ins. paid amount before saving.`, { tone: "needs" }) : ""; icons(); };
    host.addEventListener("change", (e) => { const t = e.target.closest("[data-line]"); if (!t) return; const v = parseFloat(t.value.replace(/[$,]/g, ""));
      if (isFinite(v)) lines[+t.dataset.line][t.dataset.k] = Math.round(v * 100) / 100;
      /* Re-draw after the event finishes: replacing the focused input inside its own change event makes Chrome fire it twice */
      if (host._pending) return; host._pending = true;
      requestAnimationFrame(() => { host._pending = false; const focus = document.activeElement && document.activeElement.dataset ? [document.activeElement.dataset.line, document.activeElement.dataset.k] : null;
        host.innerHTML = postLines(lines); checkMsg(); icons();
        if (focus && focus[0] != null) { const n = host.querySelector(`[data-line="${focus[0]}"][data-k="${focus[1]}"]`); if (n) n.focus(); } }); });
    check.addEventListener("change", checkMsg);
    wireTabs(el.querySelector("[data-bottom-tabs]"), (i) => { el.querySelector("[data-bottom]").innerHTML = bottomTab(i); icons(); });
  }
});
function bottomTab(i) {
  if (i === 1) return `<div class="px-5 py-4"><div class="${R.tableBox}"><table class="border-separate border-spacing-0 text-sm"><thead><tr>${["Deductible", "Amount", "Met before this EOB", "Applied on this EOB", "Left"].map((h, k) => `<th class="${R.tHead} ${k ? "!text-end" : ""}">${h}</th>`).join("")}</tr></thead>
    <tbody><tr><td class="${R.tCell}">Individual · Liam Carter</td><td class="${R.tCell} text-end tabular-nums">$50.00</td><td class="${R.tCell} text-end tabular-nums">$50.00</td><td class="${R.tCell} text-end tabular-nums text-gray-400">$0.00</td><td class="${R.tCell} text-end tabular-nums text-gray-400">$0.00</td></tr>
    <tr><td class="${R.tCell}">Family · Carter</td><td class="${R.tCell} text-end tabular-nums">$150.00</td><td class="${R.tCell} text-end tabular-nums">$50.00</td><td class="${R.tCell} text-end tabular-nums text-gray-400">$0.00</td><td class="${R.tCell} text-end tabular-nums">$100.00</td></tr></tbody></table></div></div>`;
  return `<div class="px-5 py-4"><textarea class="${R.textarea} !min-h-16" placeholder="Optional notes to store with this posting" aria-label="Notes">Crown paid at 50%. Patient owes $797.50; added to the next statement.</textarea></div>`;
}

/* ======================================================= 4. EOBs list + EOB panel */
const EOBS = [
  { id: "e1", pt: "p2", payer: "metlife", svc: "2026-06-30", rec: "2026-08-14", billed: 2695, paid: 1310.5, claim: "c4", check: "Check #004418820", posted: "Aug 15 by Nina Flores" },
  { id: "e7", pt: "p7", payer: "uc", svc: "2026-04-01", rec: "2026-09-22", billed: 253, paid: 202.4, claim: null, check: "EFT #71190342" },
  { id: "e2", pt: "p10", payer: "delta", svc: "2026-08-25", rec: "2026-09-15", billed: 240, paid: 192, claim: "c6", check: "EFT #5520917", posted: "Sep 15 by Asha" },
  { id: "e4", pt: "p13", payer: "cigna", svc: "2026-07-22", rec: "2026-08-20", billed: 320, paid: 0, claim: "c5", check: "No payment", posted: "Aug 20 by Asha" },
  { id: "e5", pt: "p5", payer: "aetna", svc: "2026-06-12", rec: "2026-07-09", billed: 150, paid: 120, claim: "x", check: "EFT #3309215", posted: "Jul 10 by Asha" },
  { id: "e6", pt: "p6", payer: "guardian", svc: "2026-05-12", rec: "2026-06-10", billed: 175, paid: 140, claim: "x", check: "Check #611084", posted: "Jun 11 by Marcus Lee" },
  { id: "e8", pt: "p3", payer: "cigna", svc: "2026-03-20", rec: "2026-04-15", billed: 253, paid: 202.4, claim: "x", check: "EFT #2201877", posted: "Apr 15 by Asha" },
  { id: "e3", pt: "p12", payer: "delta", svc: "2026-02-25", rec: "2026-03-12", billed: 175, paid: 175, claim: "c9", check: "EFT #5105583", posted: "Mar 12 by Asha" }
];
/* [code, tooth, submitted, allowed, insurance paid, patient resp.] — each EOB's lines add up to its row in the list */
const CLEANING = [["D0120", "", 65, 52, 52, 0], ["D1110", "", 110, 88, 88, 0], ["D0274", "", 78, 62.4, 62.4, 0]];
const EOB_LINES = { e1: ADJ.map((l) => [l.code, l.tooth, l.charged, l.allowed, l.paid, l.pt]), e7: CLEANING, e8: CLEANING, e2: [["D0150", "", 95, 95, 76, 19], ["D0210", "", 145, 145, 116, 29]],
  e4: [["D7210", "32", 320, 0, 0, 0]], e5: [["D4910", "", 150, 150, 120, 30]], e6: [["D0120", "", 65, 52, 52, 0], ["D1110", "", 110, 88, 88, 0]], e3: [["D1120", "", 80, 80, 80, 0], ["D1208", "", 40, 40, 40, 0], ["D1351", "3", 55, 55, 55, 0]] };
const eobLinesFor = (e) => EOB_LINES[e.id];
/* v2 EOB panel: the standard overlay sheet at the claim-form width; matched or not as a plain caption (no status button
 * that implied a menu); the lines on the shared claim sheet. */
function v2EobPanel(e) {
  const p = DATA.patient(e.pt), raw = eobLinesFor(e);
  const lines = raw.map(([code, tooth, billed, allowed, paid, pt], i) => ({ line: i + 1, date: e.svc, code, tooth, desc: DATA.proc(code).name, billed, allowed, wo: allowed ? cAdd(billed, -allowed) : null, paid, pt,
    woTip: allowed && billed > allowed ? CARC["CO-45"] : "", ptTip: pt ? CARC["PR-2"] : "" }));
  const linked = e.claim && e.claim !== "x" ? CLAIMS.find((c) => c.id === e.claim) : null;
  const claimRow = (main, sub) => `<button type="button" class="group -mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-1.5 text-start hover:bg-gray-50 cursor-pointer" aria-label="View claim">
      <div class="min-w-0 grow"><p class="text-sm text-gray-800 truncate">${main}</p><p class="${R.help} truncate">${sub}</p></div>${I("chevron-right", "size-4 shrink-0 text-gray-400 group-hover:text-gray-600")}</button>`;
  const caption = `Received ${fmtDate(e.rec)}${e.posted ? ` · posted ${esc(e.posted.split(" by ")[0])}` : " · not posted"}`;
  return sheetPanel({
    flush: true, w: v2SheetW, cls: "h-full", lead: avatar(p.name, { size: 9 }), title: esc(p.name), subtitle: `${DATA.payer(e.payer).name} · ${esc(e.check)}`,
    actions: iconButton("ellipsis", "More", { s: "iconSm" }),
    tabs: ["Payer statement", "Ledger"],
    body: `<section class="${R.psec} !py-3 text-[13px] text-gray-500"${chg("Matched or not is a plain line: the \"Matched ▾\" button suggested a status menu that doesn't exist (matching happens with Match / Re-match)")}>${e.claim ? caption : `<span class="inline-flex items-center gap-1.5">${I("circle-alert", "size-3.5 text-orange-500")}<span class="text-gray-800">Not matched</span></span> · ${caption}`}</section>
      ${e.claim
        ? psec("Claim", claimRow(`${DATA.payer(e.payer).short} · Primary · Service ${fmtDate(e.svc)}`, linked ? `${linked.codes.join(" · ")} · billed ${money(linked.billed)}` : `Billed ${money(e.billed)} · ${lines.length} ${lines.length === 1 ? "procedure" : "procedures"}`), { actions: button("Re-match", { v: "white", s: "xs", icon: "link", attrs: 'data-act="rematch"' }) })
        : psec("Claim", `<div class="-my-1.5">${infoRow("circle-alert", "Link this EOB to a claim before it can be posted.", { tone: "needs" })}</div>`, { actions: button("Match", { v: "white", s: "xs", icon: "link", attrs: 'data-act="rematch"' }) })}
      ${psec(`<span${chg("The EOB lines are the same claim sheet as the claim itself, with the same money words")}>Explanation of benefits</span>`, v2ClaimSheet(lines, { adjudicated: true, title: "Explanation of benefits" }), { count: lines.length, actions: button("View source EOB", { v: "white", s: "xs", icon: "file-search" }) })}`
  });
}
/* v4 EOB panel: matched or not is the first line of the EOB's facts table, with the claim it pays as the next line; the
 * header's ⋯ is the standard Actions menu in the footer. The EOB's lines stay read-only: they're what the payer sent. */
function v4cEobActions(e) {
  const payer = DATA.payer(e.payer).short, why = !e.claim ? "Match it to a claim first" : e.posted ? `Already posted ${e.posted}` : "";
  return [{ label: "Payment", items: [{ icon: "hand-coins", label: "Post payment", hint: `Enter what ${payer} paid, line by line`, off: why }, { icon: "wand-sparkles", label: "Auto-post", hint: "Fill the payment from this EOB for you to check", off: why },
      { icon: "split", label: "Split across claims", hint: "When one check pays more than one claim" }] },
    { label: "EOB", items: [{ icon: "download", label: "Download PDF", hint: `The EOB as ${payer} sent it` }, { icon: "printer", label: "Print", hint: "For the patient's paper chart" }, { icon: "history", label: "EOB history", hint: "Who matched and posted it, and when" }] },
    { label: "", items: [{ icon: "archive", label: "Archive EOB", danger: true }] }];
}
function v4cEobPanel(e) {
  const p = DATA.patient(e.pt), raw = eobLinesFor(e), payer = DATA.payer(e.payer);
  const lines = raw.map(([code, tooth, billed, allowed, paid, pt], i) => ({ line: i + 1, date: e.svc, code, tooth, desc: DATA.proc(code).name, billed, allowed, wo: allowed ? cAdd(billed, -allowed) : null, paid, pt,
    woTip: allowed && billed > allowed ? CARC["CO-45"] : "", ptTip: pt ? CARC["PR-2"] : "" }));
  const linked = e.claim && e.claim !== "x" ? CLAIMS.find((c) => c.id === e.claim) : null;
  const claim = e.claim ? `${payer.short} · Primary · Service ${fmtDate(e.svc)} · ${linked ? linked.codes.join(" · ") : `${lines.length} ${lines.length === 1 ? "procedure" : "procedures"}`} · billed ${money(linked ? linked.billed : e.billed)}` : "";
  const facts = [v4cNone("Status", e.claim ? "Matched" : "Not matched", () => (e.claim ? v4cStatus("Matched", "on", e.posted ? `posted ${esc(e.posted)}` : "not posted yet") : v4cNeeds("Not matched", "link it to a claim before posting"))),
    v4cNone("Claim", claim, (r) => (e.claim ? `<button type="button" data-act="view-claim" class="inline-flex max-w-full items-center gap-1 text-gray-800 hover:underline decoration-gray-300 underline-offset-4 cursor-pointer" aria-label="View claim"><span class="truncate">${esc(r.value)}</span>${I("chevron-right", "size-3.5 shrink-0 text-gray-400")}</button>` : cDim("None yet"))),
    v4cNone("Payment", e.check, v4cNums), v4cNone("Received", fmtDateY(e.rec))];
  return sheetPanel({
    flush: true, w: v2SheetW, cls: "h-full", lead: avatar(p.name, { size: 9 }), title: esc(p.name), subtitle: `${payer.name} · ${esc(e.check)}`,
    tabs: ["Payer statement", "Ledger"],
    body: `${psec("EOB", `<div${chg4("Matched or not is the first line of the EOB's facts table, with the claim it pays on the next line (click it to open the claim); the status line and the separate Claim section are gone")}>${fieldTable(facts, { title: "EOB", labelW: 112 })}</div>`, { actions: button(e.claim ? "Re-match" : "Match", { v: "white", s: "xs", icon: "link", attrs: 'data-act="rematch"' }) })}
      ${psec("Explanation of benefits", v2ClaimSheet(lines, { adjudicated: true, title: "Explanation of benefits" }), { count: lines.length, actions: button("View source EOB", { v: "white", s: "xs", icon: "file-search" }) })}`,
    footer: `<span class="flex"${chg4("The ⋯ in the header is now the standard Actions menu down here: post, auto-post (greyed with the reason when it can't run), split, download, print and archive. Match and View source EOB keep their own buttons, so they aren't repeated")}>${actionsMenu(v4cEobActions(e), { open: V4_OPTS.open })}</span><span class="grow"></span>`
  });
}
function eobPanel(e) {
  const p = DATA.patient(e.pt), lines = eobLinesFor(e);
  const tot = (i) => cSum(lines, (l) => l[i]);
  const th = "h-10 px-2.5 border-b border-gray-200/80 text-[13px] font-medium text-gray-500 whitespace-nowrap", td = "h-9 px-2.5 border-b border-gray-200/80 text-[13px] text-gray-800 whitespace-nowrap tabular-nums";
  const linked = e.claim && e.claim !== "x" ? CLAIMS.find((c) => c.id === e.claim) : null;
  const claimRow = (main, sub) => `<button type="button" class="group -mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-1.5 text-start hover:bg-gray-50 cursor-pointer" aria-label="View claim">
      <div class="min-w-0 grow"><p class="text-sm text-gray-800 truncate">${main}</p><p class="${R.help} truncate">${sub}</p></div>${I("chevron-right", "size-4 shrink-0 text-gray-400 group-hover:text-gray-600")}</button>`;
  return sheetPanel({
    flush: true, cls: "shrink-0 !h-auto self-stretch", lead: avatar(p.name, { size: 9 }), title: esc(p.name), subtitle: `${DATA.payer(e.payer).name} · ${esc(e.check)}`,
    actions: iconButton("ellipsis", "More", { s: "iconSm" }),
    tabs: ["Payer statement", "Ledger"],
    body: `${statusLine(e.claim ? "Matched" : "Not matched", e.claim ? "on" : "needs", `Received ${fmtDate(e.rec)}${e.posted ? ` · posted ${esc(e.posted.split(" by ")[0])}` : " · not posted"}`)}
      ${e.claim
        ? psec("Claim", claimRow(`${DATA.payer(e.payer).short} · Primary · Service ${fmtDate(e.svc)}`, linked ? `${linked.codes.join(" · ")} · billed ${money(linked.billed)}` : `Billed ${money(e.billed)} · ${lines.length} ${lines.length === 1 ? "procedure" : "procedures"}`), { actions: button("Re-match", { v: "white", s: "xs", icon: "link", attrs: 'data-act="rematch"' }) })
        : psec("Claim", `<div class="-my-1.5">${infoRow("circle-alert", "Link this EOB to a claim before it can be posted.", { tone: "needs" })}</div>`, { actions: button("Match", { v: "white", s: "xs", icon: "link", attrs: 'data-act="rematch"' }) })}
      ${psec("Explanation of benefits", `<div class="${R.tableBox}"><table class="border-separate border-spacing-0"><thead><tr>${["Code", "Submitted", "Allowed", "Ins. paid", "Pt. resp."].map((h, i) => `<th class="${th} ${i ? "text-end" : "text-start"}">${h}</th>`).join("")}</tr></thead>
        <tbody>${lines.map((l) => `<tr><td class="${td}">${l[0]}${l[1] ? ` <span class="text-gray-500">#${l[1]}</span>` : ""}</td>${[2, 3, 4, 5].map((i) => `<td class="${td} text-end ${l[i] ? "" : "text-gray-400"}">${money(l[i])}</td>`).join("")}</tr>`).join("")}</tbody>
        <tfoot><tr><td class="h-9 px-2.5 text-[13px] font-medium text-gray-800">Totals</td>${[2, 3, 4, 5].map((i) => `<td class="h-9 px-2.5 text-end text-[13px] font-semibold tabular-nums">${money(tot(i))}</td>`).join("")}</tr></tfoot></table></div>`, { count: lines.length, actions: button("View source EOB", { v: "white", s: "xs", icon: "file-search" }) })}`
  });
}
defineBlock({
  cat: "claims", id: "claims-eobs", title: "EOBs list and EOB panel",
  note: "The EOB list shows only Patient, Payer, Dates, Total billed and Insurance paid. A row opens the read-only EOB: matched or not on one line, the linked claim as a row you click, Match or Re-match and View source EOB as one small button per section. Click a row to switch.",
  where: "Revenue Cycle › EOBs",
  states: ["Matched", "Not matched"],
  canvas: "bare",
  html: (state) => {
    const e = EOBS.find((x) => x.id === (state === "Not matched" ? "e7" : "e1"));
    if (V2) return `${workspaceHeader({ parent: "Revenue Cycle", title: "EOBs", actions: `${button("Upload EOB", { v: "solid", s: "sm", icon: "upload" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
      <div class="relative min-h-[680px]"><div class="min-w-0">${tabsWithSlot([["All EOBs", EOBS.length], ["Not matched", EOBS.filter((x) => !x.claim).length], "Archived"], 0, dateRangeButton("Year to date"))}<div class="px-4" data-grid="eobs"></div></div>
      <div class="absolute inset-y-0 end-0 z-10 flex" data-eob-panel${chg("The EOB opens as the standard overlay sheet at the claim-form width (760px), like every other claim panel, instead of a narrower panel pushed beside the list")}>${(V4 ? v4cEobPanel : v2EobPanel)(e)}</div></div>`;
    return `${workspaceHeader({ parent: "Revenue Cycle", title: "EOBs", actions: `${button("Upload EOB", { v: "solid", s: "sm", icon: "upload" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
      <div class="flex min-h-[640px]"><div class="min-w-0 grow">${tabsWithSlot([["All EOBs", EOBS.length], ["Not matched", EOBS.filter((x) => !x.claim).length], "Archived"], 0, dateRangeButton("Year to date"))}<div class="px-3" data-grid="eobs"></div></div>
      <div class="flex" data-eob-panel>${eobPanel(e)}</div></div>`;
  },
  mount: (el, state) => {
    const slot = el.querySelector("[data-eob-panel]"), pick = state === "Not matched" ? "e7" : "e1";
    if (V2) {
      const g = new Grid(el.querySelector('[data-grid="eobs"]'), { gutter: 16, viewButton: false, noun: "EOBs",
        title: "All EOBs", searchPlaceholder: "Search EOBs", rows: EOBS, maxHeight: 560, selectable: false, addColumn: false, calc: { billed: "sum", paid: "sum" },
        columns: [
          { key: "pt", label: "Patient", icon: "user", w: 168, open: true, kind: "text", value: (r) => DATA.patient(r.pt).name, render: (r) => `${esc(DATA.patient(r.pt).name)}${r.claim ? "" : ` <span class="inline-flex align-[-2px] ms-1" role="img" aria-label="Not matched" data-tip="Not matched"${chg("An EOB that isn't matched to a claim carries a small orange mark (hover: Not matched), so you can find it from the list; still no Status column")}>${I("circle-alert", "size-3.5 text-orange-500")}</span>`}` },
          { key: "payer", label: "Payer", icon: "shield", w: 112, kind: "text", value: (r) => payerName(r.payer), render: (r) => esc(payerName(r.payer)) },
          { key: "rec", label: "Dates", icon: "calendar", w: 132, kind: "date", render: (r) => `<span class="text-[13px]" title="Service ${fmtDate(r.svc)}, received ${fmtDate(r.rec)}">${fmtDate(r.svc)} <span class="text-gray-400">/</span> ${fmtDate(r.rec)}</span>` },
          { key: "billed", label: "Total billed", w: 104, num: true, kind: "money", render: (r) => money(r.billed) },
          { key: "paid", label: "Insurance paid", w: 126, num: true, kind: "money", render: (r) => (r.paid ? money(r.paid) : cDim("$0.00")) }
        ],
        filters: [{ key: "payer", label: "Payer", options: DATA.payers.map((p) => ({ value: p.id, label: p.short })) }],
        onOpen: (r) => { slot.innerHTML = (V4 ? v4cEobPanel : v2EobPanel)(r); icons(); }
      });
      g.openId = pick; g.render();
      return;
    }
    const g = new Grid(el.querySelector('[data-grid="eobs"]'), { gutter: 12,
      title: "All EOBs", searchPlaceholder: "Search EOBs", rows: EOBS, maxHeight: 520, selectable: false, addColumn: false, calc: { billed: "sum", paid: "sum" },
      columns: [
        { key: "pt", label: "Patient", icon: "user", w: 136, open: true, kind: "text", value: (r) => DATA.patient(r.pt).name, render: (r) => esc(DATA.patient(r.pt).name) },
        { key: "payer", label: "Payer", icon: "shield", w: 112, kind: "text", value: (r) => payerName(r.payer), render: (r) => esc(payerName(r.payer)) },
        { key: "rec", label: "Dates", icon: "calendar", w: 132, kind: "date", render: (r) => `<span class="text-[13px]" title="Service ${fmtDate(r.svc)}, received ${fmtDate(r.rec)}">${fmtDate(r.svc)} <span class="text-gray-400">/</span> ${fmtDate(r.rec)}</span>` },
        { key: "billed", label: "Total billed", w: 104, num: true, kind: "money", render: (r) => money(r.billed) },
        { key: "paid", label: "Insurance paid", w: 126, num: true, kind: "money", render: (r) => (r.paid ? money(r.paid) : cDim("$0.00")) }
      ],
      filters: [{ key: "payer", label: "Payer", options: DATA.payers.map((p) => ({ value: p.id, label: p.short })) }],
      onOpen: (r) => { slot.innerHTML = eobPanel(r); icons(); }
    });
    g.openId = pick; g.render();
  }
});

/* ======================================================= 5. Eligibility and benefits result */
const BENEFITS = [["Diagnostic", 100, "Exams 2 per calendar year"], ["Preventive", 100, "Cleanings 2 per calendar year"], ["Radiographs", 100, "Bitewings once a year · full mouth once in 5 years"], ["Basic restorative", 80, ""], ["Endodontics", 80, ""], ["Periodontics", 80, "Perio maintenance 4 per year"], ["Oral surgery", 80, ""], ["Major restorative", 50, "Crowns 1 per tooth in 5 years · 12-month waiting period"], ["Orthodontics", 0, "Not covered on this plan"]];
/* v2 eligibility: the sources switch sits in the top bar in both states, so the header never reflows; the one alert is a
 * mark beside "Needs review"; facts drop what the title already says; the benefits table shows a coverage or network
 * word only when it isn't the usual Active / Yes, and hides Copay ($0.00 everywhere) and Coinsurance (100% − Plan pays). */
function v2Eligibility(review, p, meters) {
  return `${workspaceHeader({ parent: "Eligibility", title: p.name, actions: `<span class="me-1"${chg("The verification sources switch has a fixed place in the top bar, so the header stays one line in both states (it wrapped to three lines when review was needed)")}>${segmented(["Payer Response", "Faxback", "Insurance Call"], 0, { sm: true, attrs: 'aria-label="Eligibility verification sources"' })}</span><span class="h-5 border-s border-gray-200/80"></span>${button("Print", { v: "quiet", s: "sm", icon: "printer" })}${button("Verify again", { v: "white", s: "sm", icon: "refresh-cw" })}${review ? button("Mark reviewed", { v: "solid", s: "sm", icon: "check" }) : ""}` })}
    <div class="px-6 py-5 space-y-6">
      <div class="flex items-center justify-between gap-6"><div class="flex min-w-0 items-center gap-3">${avatar(p.name, { size: 10 })}<div class="min-w-0"><p class="text-base font-semibold text-gray-800 truncate"${chg("The plan title is 16px like every other screen title (it was 18px)")}>MetLife Dental · PDP Plus</p><p class="text-[13px] text-gray-500 truncate">Checked Sep 25, 7:40 AM for the visit on Sep 28 · by Asha</p></div></div>
        <div class="flex shrink-0 items-start gap-6">${metaStrip([["Coverage Status", statusDot("Active", "on")], ["In Network", "Yes"], ["Verification", `${statusDot(review ? "Needs review" : "Verified", review ? "needs" : "on")}${review ? `<span${chg("One orange mark beside Needs review says what to check, with Listen to the call on hover; the two-line note across the page that said the same thing is gone")}>${alertMark("Waiting period unclear", "The payer response and the insurance call disagree on the crown waiting period: the payer says it's met; the call says 3 months are left. Check before Lucas's visit on Sep 28.", { action: button("Listen to the call", { v: "white", s: "xs", icon: "play" }) })}</span>` : ""}`]])}</div></div>
      <div${chg("Facts are calm label / value rows with no grey label fill; Payer and Date of Service are gone because the title and subtitle already say them")}>${kvTable([["Member ID", '<span class="tabular-nums">XK88210457</span>'], ["Subscriber", `${p.name} · Self`], ["Group Number", '<span class="tabular-nums">0081142</span>'], ["Plan year", "Jan 1 – Dec 31, 2026"]], { cols: 2 })}</div>
      <div class="${R.box} grid grid-cols-3 divide-x divide-gray-200/80">${meters.map(([l, max, used, word]) => `<div class="px-4 py-3"><p class="text-[13px] text-gray-500">${l}</p><p class="mt-0.5"><span class="${R.numberSm}">${money(cAdd(max, -used))}</span> <span class="text-[13px] text-gray-500">left of ${money(max)}</span></p><div class="mt-2">${Chart.meter(used, max)}</div><p class="${R.caption} mt-1.5 tabular-nums">${money(used)} ${word}</p></div>`).join("")}</div>
      ${section("Service Type Benefits", `<div class="${R.tableBox}"><table class="w-full border-separate border-spacing-0 text-sm"><thead><tr>${["Service", `<span${chg("Coverage shows only when unusual: Active is blank, so Not Covered stands out. In Network (Yes on every covered row, and in the header), Copay ($0.00 everywhere) and Coinsurance (always 100% minus Plan pays) are hidden.")}>Coverage Status</span>`, "Plan pays", "Limitations"].map((h, i) => `<th class="${R.tHead} ${i === 2 ? "!text-end" : ""}">${h}</th>`).join("")}</tr></thead>
        <tbody>${BENEFITS.map(([sv, pct, lim]) => `<tr><td class="${R.tCell} font-medium">${sv}</td><td class="${R.tCell}">${pct ? "" : statusDot("Not Covered", "off")}</td><td class="${R.tCell} text-end tabular-nums">${pct ? pct + "%" : cDim()}</td><td class="${R.tCell} ${lim ? "text-gray-600" : ""}">${lim || cDim()}</td></tr>`).join("")}</tbody></table></div>`)}
      ${section("Procedure Code Benefits", `<div class="${R.tableBox}"><table class="w-full border-separate border-spacing-0 text-sm"><thead><tr>${["Code", "Service", "Plan pays", "Frequency", "Last done"].map((h, i) => `<th class="${R.tHead} ${i === 2 ? "!text-end" : ""}">${h}</th>`).join("")}</tr></thead>
        <tbody>${[["D4910", "Perio maintenance", "80%", "4 per year", "Jun 12, 2026"], ["D0274", "Bitewings, four films", "100%", "Once a year", "Sep 10, 2025"], ["D2740", "Crown, porcelain/ceramic", "50%", "1 per tooth in 5 years", "#30 · Sep 10, 2026"]].map((r) => `<tr>${r.map((v, i) => `<td class="${R.tCell} ${i === 0 || i === 2 ? "tabular-nums" : ""} ${i === 2 ? "text-end" : ""}">${v}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`)}
    </div>`;
}
/* v4 eligibility: the page shows one record, so its top is the one record header (page size): Lucas, his plan, the
 * sources switch and the actions on one row, the alert as a mark by his name. Verification, coverage and network are the
 * first lines of one facts table; Member ID and Group number are cells staff fix before Verify again. */
function v4cEligibility(review, p, meters) {
  const why = "The payer response and the insurance call disagree on the crown waiting period: the payer says it's met; the call says 3 months are left. Check before Lucas's visit on Sep 28.";
  /* the one patient header: his medical alert and balance as marks by the name, then the review alert */
  const head = patientHeader({ size: "page", name: p.name, sub: "MetLife Dental · PDP Plus · for the visit on Sep 28",
    marks: `<span class="flex items-center gap-2"${chg4("The top is the one patient header every surface about a patient uses: Lucas's medical alert as one icon with the count and his balance as a wallet by the name")}>${patientMarks({ alerts: p.alerts, familyBalance: p.balance })}</span>${review ? `<span${chg4("The one alert is an orange mark by his name (Listen to the call is in its hover), where the record header puts what needs attention")}>${alertMark("Waiting period unclear", why, { action: button("Listen to the call", { v: "white", s: "xs", icon: "play" }), align: "start" })}</span>` : ""}`,
    actions: `${segmented(["Payer Response", "Faxback", "Insurance Call"], 0, { sm: true, attrs: 'aria-label="Eligibility verification sources"' })}<span class="h-5 mx-1 border-s border-gray-200/80"></span>${button("Print", { v: "quiet", s: "sm", icon: "printer" })}${button("Verify again", { v: "white", s: "sm", icon: "refresh-cw" })}${review ? button("Mark reviewed", { v: "solid", s: "sm", icon: "check" }) : ""}` });
  const left = [v4cNone("Verification", review ? "Needs review" : "Verified", () => v4cStatus(review ? "Needs review" : "Verified", review ? "needs" : "on", "checked Sep 25, 7:40 AM by Asha")),
    v4cNone("Coverage", "Active", () => v4cStatus("Active", "on")), v4cNone("In network", "Yes"), v4cNone("Plan year", "Jan 1 – Dec 31, 2026")];
  const right = [v4cNone("Subscriber", `${p.name} · Self`), { label: "Member ID", value: "XK88210457", type: "text", html: v4cNums }, { label: "Group number", value: "0081142", type: "text", html: v4cNums }, v4cNone("Date of service", "Sep 28, 2026")];
  return `<div${chg4("The page's top is the one record header: who it's for, the plan and the visit, with the sources switch, Print, Verify again and Mark reviewed on the same row. The bar above it and the second title row are gone")}>${head}</div>
    <div class="px-5 py-5 space-y-6">
      <div${chg4("Verification, coverage and network are the first lines of one facts table instead of a strip in the header; Member ID and Group number are cells you fix in place before Verify again")}>${v4cPair(left, right, { title: "Eligibility", labelW: 128 })}</div>
      <div class="${R.box} grid grid-cols-3 divide-x divide-gray-200/80">${meters.map(([l, max, used, word]) => `<div class="px-4 py-3"><p class="text-[13px] text-gray-500">${l}</p><p class="mt-0.5"><span class="${R.numberSm}">${money(cAdd(max, -used))}</span> <span class="text-[13px] text-gray-500">left of ${money(max)}</span></p><div class="mt-2">${Chart.meter(used, max)}</div><p class="${R.caption} mt-1.5 tabular-nums">${money(used)} ${word}</p></div>`).join("")}</div>
      ${section("Service Type Benefits", `<div class="${R.tableBox}"><table class="w-full border-separate border-spacing-0 text-sm"><thead><tr>${["Service", `<span${chg4("Coverage Status is gone: it was blank on 8 of 9 rows (every covered service is Active). The one service that isn't covered says Not covered where its percentage would be")}>Plan pays</span>`, "Limitations"].map((h, i) => `<th class="${R.tHead} ${i === 1 ? "!text-end w-36" : ""}">${h}</th>`).join("")}</tr></thead>
        <tbody>${BENEFITS.map(([sv, pct, lim]) => `<tr><td class="${R.tCell} font-medium">${sv}</td><td class="${R.tCell} text-end tabular-nums">${pct ? pct + "%" : `<span class="text-gray-500">Not covered</span>`}</td><td class="${R.tCell} ${lim ? "text-gray-600" : ""}">${lim || cDim()}</td></tr>`).join("")}</tbody></table></div>`)}
      ${section("Procedure Code Benefits", `<div class="${R.tableBox}"><table class="w-full border-separate border-spacing-0 text-sm"><thead><tr>${["Code", "Service", "Plan pays", "Frequency", "Last done"].map((h, i) => `<th class="${R.tHead} ${i === 2 ? "!text-end" : ""}">${h}</th>`).join("")}</tr></thead>
        <tbody>${[["D4910", "Perio maintenance", "80%", "4 per year", "Jun 12, 2026"], ["D0274", "Bitewings, four films", "100%", "Once a year", "Sep 10, 2025"], ["D2740", "Crown, porcelain/ceramic", "50%", "1 per tooth in 5 years", "#30 · Sep 10, 2026"]].map((r) => `<tr>${r.map((v, i) => `<td class="${R.tCell} ${i === 0 || i === 2 ? "tabular-nums" : ""} ${i === 2 ? "text-end" : ""}">${v}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`)}
    </div>`;
}
defineBlock({
  cat: "claims", id: "claims-eligibility", title: "Eligibility and benefits",
  note: "The answer to an eligibility check: coverage and network status, what's left of the yearly maximum and deductible, and the service type benefits table. When sources disagree, one orange line says what to check.",
  where: "Insurance › Eligibility › check",
  states: ["Verified", "Needs review"],
  canvas: "bare",
  html: (state) => {
    const review = state === "Needs review", p = DATA.patient("p8");
    const meters = [["Annual maximum", 1500, 410, "used"], ["Deductible · individual", 50, 50, "met"], ["Deductible · family", 150, 100, "met"]];
    if (V4) return v4cEligibility(review, p, meters);
    if (V2) return v2Eligibility(review, p, meters);
    return `${workspaceHeader({ parent: "Eligibility", title: p.name, actions: `${button("Print", { v: "quiet", s: "sm", icon: "printer" })}${button("Verify again", { v: review ? "white" : "white", s: "sm", icon: "refresh-cw" })}${review ? button("Mark reviewed", { v: "solid", s: "sm", icon: "check" }) : ""}` })}
    <div class="px-6 py-5 space-y-6">
      <div class="flex items-start justify-between gap-6"><div class="flex items-center gap-3">${avatar(p.name, { size: 10 })}<div><p class="text-lg font-semibold text-gray-800">MetLife Dental · PDP Plus</p><p class="text-[13px] text-gray-500">Checked Sep 25, 7:40 AM for the visit on Sep 28 · by Asha</p></div></div>
        <div class="flex items-center gap-6 pt-1">${metaStrip([["Coverage Status", statusDot("Active", "on")], ["In Network", "Yes"], ["Verification", statusDot(review ? "Needs review" : "Verified", review ? "needs" : "on")], ["Eligibility verification sources", segmented(["Payer Response", "Faxback", "Insurance Call"], 0, { sm: true })]])}</div></div>
      ${review ? note(`<span class="font-medium text-gray-800">The payer response and the insurance call disagree on the crown waiting period.</span> The payer says it's met; the call says 3 months are left. Check before Lucas's visit on Sep 28.`) : ""}
      <div class="${R.tableBox}">${kvSheet([["Payer", "MetLife Dental"], ["Member ID", '<span class="tabular-nums">XK88210457</span>'], ["Subscriber", `${p.name} · Self`], ["Group Number", '<span class="tabular-nums">0081142</span>'], ["Date of Service", "Sep 28, 2026"], ["Plan year", "Jan 1 – Dec 31, 2026"]], true)}</div>
      <div class="${R.box} grid grid-cols-3 divide-x divide-gray-200/80">${meters.map(([l, max, used, word]) => `<div class="px-4 py-3"><p class="text-[13px] text-gray-500">${l}</p><p class="mt-0.5"><span class="${R.numberSm}">${money(cAdd(max, -used))}</span> <span class="text-[13px] text-gray-500">left of ${money(max)}</span></p><div class="mt-2">${Chart.meter(used, max)}</div><p class="${R.caption} mt-1.5 tabular-nums">${money(used)} ${word}</p></div>`).join("")}</div>
      ${section("Service Type Benefits", `<div class="${R.tableBox}"><table class="w-full border-separate border-spacing-0 text-sm"><thead><tr>${["Service", "Coverage Status", "In Network", "Plan pays", "Coinsurance", "Copay", "Limitations"].map((h, i) => `<th class="${R.tHead} ${i >= 3 && i <= 5 ? "!text-end" : ""}">${h}</th>`).join("")}</tr></thead>
        <tbody>${BENEFITS.map(([s, pct, lim]) => { const flagged = review && s === "Major restorative";
          return `<tr><td class="${R.tCell} font-medium">${s}</td><td class="${R.tCell}">${pct ? statusDot("Active", "on") : statusDot("Not Covered", "off")}</td><td class="${R.tCell}">${pct ? "Yes" : cDim()}</td><td class="${R.tCell} text-end tabular-nums">${pct ? pct + "%" : cDim()}</td><td class="${R.tCell} text-end tabular-nums">${pct ? 100 - pct + "%" : cDim()}</td><td class="${R.tCell} text-end tabular-nums">${pct ? "$0.00" : cDim()}</td><td class="${R.tCell} ${lim ? "text-gray-600" : ""}">${flagged ? `<span class="flex items-center gap-3"><span class="truncate">${lim.split(" · ")[0]}</span>${alertMark("Waiting period unclear", "Waiting period: the payer response says it's met; the insurance call says 3 months are left.", { action: button("Listen to the call", { v: "white", s: "xs", icon: "play" }) })}</span>` : lim || cDim()}</td></tr>`; }).join("")}</tbody></table></div>
        <p class="${R.caption} mt-2">Coinsurance is the patient's share after the deductible.</p>`)}
      ${section("Procedure Code Benefits", `<div class="${R.tableBox}"><table class="w-full border-separate border-spacing-0 text-sm"><thead><tr>${["Code", "Service", "Plan pays", "Frequency", "Last done"].map((h, i) => `<th class="${R.tHead} ${i === 2 ? "!text-end" : ""}">${h}</th>`).join("")}</tr></thead>
        <tbody>${[["D4910", "Perio maintenance", "80%", "4 per year", "Jun 12, 2026"], ["D0274", "Bitewings, four films", "100%", "Once a year", "Sep 10, 2025"], ["D2740", "Crown, porcelain/ceramic", "50%", "1 per tooth in 5 years", "#30 · Sep 10, 2026"]].map((r) => `<tr>${r.map((v, i) => `<td class="${R.tCell} ${i === 0 || i === 2 ? "tabular-nums" : ""} ${i === 2 ? "text-end" : ""}">${v}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`)}
    </div>`;
  }
});

/* ======================================================= 6. Pre-auths list */
const PA_ST = { draft: ["Draft", "quiet"], requested: ["Requested", "off"], approved: ["Approved", "on"], partial: ["Partial Approved", "mid"], denied: ["Denied", "needs"] };
const PREAUTHS = [
  { id: "pa1", pt: "p8", payer: "metlife", codes: ["D2740", "D2950"], tooth: "30", est: 1545, appr: 772.5, st: "approved", sent: "2026-08-20", exp: "2027-02-20" },
  { id: "pa2", pt: "p5", payer: "aetna", codes: ["D4341", "D4341", "D4341", "D4341"], tooth: "", est: 1040, appr: 520, st: "partial", sent: "2026-08-28", exp: "2026-10-28" },
  { id: "pa3", pt: "p13", payer: "cigna", codes: ["D6010"], tooth: "19", est: 2100, appr: 0, st: "denied", sent: "2026-08-05", exp: "" },
  { id: "pa8", pt: "p6", payer: "guardian", codes: ["D6010"], tooth: "30", est: 2100, appr: 1050, st: "approved", sent: "2026-07-10", exp: "2026-10-10" },
  { id: "pa9", pt: "p2", payer: "metlife", codes: ["D4341", "D4341"], tooth: "", est: 520, appr: 416, st: "approved", sent: "2026-06-02", exp: "2026-12-02" },
  { id: "pa4", pt: "p15", payer: "aetna", codes: ["D7210", "D7210"], tooth: "", est: 640, appr: 0, st: "requested", sent: "2026-09-18", exp: "" },
  { id: "pa5", pt: "p7", payer: "uc", codes: ["D2740"], tooth: "14", est: 1250, appr: 0, st: "requested", sent: "2026-09-22", exp: "" },
  { id: "pa6", pt: "p3", payer: "cigna", codes: ["D3330"], tooth: "30", est: 1150, appr: 0, st: "draft", sent: "", exp: "" },
  { id: "pa7", pt: "p14", payer: "guardian", codes: ["D2740", "D2950"], tooth: "3", est: 1545, appr: 0, st: "draft", sent: "", exp: "" }
];
const PA_TABS = [["To Be Sent", ["draft"]], ["Sent", ["requested"]], ["Responded", ["approved", "partial", "denied"]], ["Archived", []]];
const paCols = () => [
  { key: "pt", label: "Patient", icon: "user", w: 198, open: true, kind: "text", value: (r) => DATA.patient(r.pt).name, lead: (r) => avatar(DATA.patient(r.pt).name, { size: 5 }), render: (r) => esc(DATA.patient(r.pt).name) },
  { key: "codes", label: "Procedures", icon: "list", w: 150, kind: "list", value: (r) => r.codes.join(" "), render: (r) => `<span class="tabular-nums">${[...new Set(r.codes)].join(" · ")}</span>${r.codes.length > new Set(r.codes).size ? ` <span class="text-xs text-gray-500">×${r.codes.length}</span>` : ""}${r.tooth ? ` <span class="text-gray-500 tabular-nums">#${r.tooth}</span>` : ""}` },
  { key: "payer", label: "Payer", icon: "shield", w: 104, kind: "text", value: (r) => DATA.payer(r.payer).short, render: (r) => esc(DATA.payer(r.payer).short) },
  { key: "est", label: "Est. Amount", w: 116, num: true, kind: "money", render: (r) => money(r.est) },
  { key: "appr", label: "Approved", w: 102, num: true, kind: "money", render: (r) => (r.st === "approved" || r.st === "partial" ? money(r.appr) : cDim(r.st === "denied" ? "$0.00" : "—")) },
  { key: "st", label: "Status", icon: "circle-dot", w: 150, kind: "text", value: (r) => PA_ST[r.st][0], render: (r) => statusDot(...PA_ST[r.st]) },
  { key: "sent", label: "Sent", icon: "send", w: 86, kind: "date", render: (r) => (r.sent ? fmtDate(r.sent) : cDim("Not sent")) },
  { key: "exp", label: "Expires", icon: "hourglass", w: 152, kind: "date", render: (r) => { if (!r.exp) return cDim(); const d = -cDays(r.exp); return d <= 30 ? flag(`<span class="text-gray-800">${fmtDate(r.exp)}</span> · ${d} days`) : fmtDate(r.exp) + (r.exp.slice(0, 4) !== "2026" ? `, ${r.exp.slice(0, 4)}` : ""); } }
];
/* v2 pre-auths: each tab shows only the columns that can hold a value there (To be sent: no status, approval, sent date
 * or expiry yet); status shows only for Partial Approved and Denied; a near expiry is the date plus an orange mark. */
const V2_PA_TABS = [["To be sent", ["draft"]], ["Sent", ["requested"]], ["Responded", ["approved", "partial", "denied"]], ["Archived", []]];
function v2PaCols(tab) {
  const c = Object.fromEntries(paCols().map((x) => [x.key, x]));
  const codes = { ...c.codes, w: 180, label: `<span${chg("Each tab shows only the columns that can have a value there (To be sent had Status, Approved, Sent and Expires all empty); Procedures is wider so codes aren't cut")}>Procedures</span>` };
  const exp = { ...c.exp, ...(V4 ? { label: `<span${chg4("A pre-auth with no expiry (a denial) shows a grey dash instead of a blank cell")}>Expires</span>` } : {}), w: 176, render: (r) => { if (!r.exp) return V4 ? cDim() : ""; const d = -cDays(r.exp), when = fmtDate(r.exp) + (r.exp.slice(0, 4) !== "2026" ? `, ${r.exp.slice(0, 4)}` : "");
    return d <= 30 ? `<span class="inline-flex items-center gap-2"><span class="tabular-nums">${when}</span>${v2bcFlag(`${d} days left`, `The approval runs out ${fmtDateY(r.exp)}: get the patient scheduled before then`)}</span>` : when; } };
  const st = { ...c.st, normal: ["Approved"], label: `<span${chg("Status shows only for Partial Approved and Denied; Approved rows are blank")}>Status</span>` };
  const base = [c.pt, codes, c.payer, c.est];
  return tab === 0 ? base : tab === 1 ? [...base, c.sent] : tab === 2 ? [...base, c.appr, st, exp] : [...base, c.st];
}
/* v4 pre-auth panel: the status is the first line of its facts table; when the payer's letter comes, staff set Status,
 * the reference number and the expiry right there, and type what was approved on each line. */
const V4C_PA_ANSWERS = ["Requested", "Approved", "Partial Approved", "Denied"];
function v4cOpenPreauth(r, g) {
  const s = PA_ST[r.st], draft = r.st === "draft", payer = DATA.payer(r.payer), p = DATA.patient(r.pt);
  const note = r.exp ? `expires ${fmtDate(r.exp)}` : r.sent ? `sent ${fmtDate(r.sent)}` : "not sent yet";
  const toneOf = (label) => (Object.values(PA_ST).find(([l]) => l === label) || s)[1];
  const facts = [{ label: "Status", value: s[0], type: draft ? "none" : "select", options: V4C_PA_ANSWERS, html: (x) => v4cStatus(x.value, toneOf(x.value), x.value === s[0] ? note : ""), status: true },
    v4cNone("Payer", payer.name), draft ? v4cNone("Reference #", "", () => cDim("Given when it's sent")) : { label: "Reference #", value: r.sent ? `PA-${String(hash(r.id)).slice(0, 7)}` : "", type: "text", html: v4cNums },
    { label: "Expiry date", value: r.exp ? fmtDateY(r.exp) : "", type: draft || r.st === "denied" ? "none" : "text", html: (x) => { const d = r.exp && x.value === fmtDateY(r.exp) ? -cDays(r.exp) : null; return d != null && d <= 30 ? v4cNeeds(x.value, `${d} days left, get ${p.name.split(" ")[0]} scheduled`) : esc(x.value); } }];
  /* what the payer approved, spread over the lines in proportion to their fees (the last line takes the rounding) */
  let left = r.st === "approved" || r.st === "partial" ? r.appr : 0;
  const rows = r.codes.map((c, i) => { const fee = DATA.proc(c).fee, a = i === r.codes.length - 1 ? left : Math.round((r.appr * fee / r.est) * 100) / 100; left = cAdd(left, -a);
    return { id: `pl${i}`, code: c, desc: DATA.proc(c).name, fee, appr: r.st === "approved" || r.st === "partial" ? a : r.st === "denied" ? 0 : "" }; });
  const foot = (rs) => ["Total", money(cSum(rs, "fee")), rs.some((x) => x.appr !== "") ? money(cSum(rs, "appr")) : ""];
  const lines = sheetTable({ title: "Procedures", rows, foot: foot(rows),
    onCommit: (l, k, v, gr) => { gr.o.foot = foot(gr.data); if (v < 0) return "Type an amount, like 500.00."; if (k === "appr" && v > l.fee) return `The payer can't approve more than the fee (${money(l.fee)}).`; },
    columns: [{ key: "code", label: "Procedure", w: 180, grow: true, render: (l) => `<span class="tabular-nums text-gray-500 me-2">${l.code}</span>${esc(l.desc)}` },
      { key: "fee", label: "Requested", w: 104, num: true, kind: "money", edit: draft ? "text" : null, render: (l) => money(l.fee) },
      ...(draft ? [] : [{ key: "appr", label: "Approved", w: 104, num: true, kind: "money", edit: "text", placeholder: () => "Add", render: (l) => (l.appr ? money(l.appr) : cDim(money(0))) }])] });
  Sheet.open({ flush: true, title: esc(p.name), lead: avatar(p.name, { size: 9 }), subtitle: `${payer.short} · Pre-authorization`, tabs: ["Overview", "History"],
    body: `${psec("Pre-authorization", `<div${chg4(draft ? "The pre-auth's status is the first line of its facts table instead of a row of its own" : "The pre-auth's status is the first line of its facts table instead of a row of its own. When the payer's letter comes, set Status, the reference number and the expiry right here")}>${fieldTable(facts, { title: "Pre-authorization", labelW: 120,
        onCommit: (row, k, v) => { if (!row.status) return; const key = Object.keys(PA_ST).find((x) => PA_ST[x][0] === v); if (key && g) { r.st = key; g.render(); } } })}</div>`)}
      ${r.st === "denied" ? alertSec("Next step", "Denied: Cigna says an implant isn't covered on this plan. Tell James, or ask about a bridge instead.") : ""}
      ${psec("Procedures", `<div${chg4(draft ? "The procedures are the compact grid; while it's a draft, Requested is a cell you type into and the total follows" : "The procedures are the compact grid: type what the payer approved on each line from its letter, and the total follows")}>${lines}</div>`, { count: r.codes.length })}`,
    footer: r.st === "draft" ? button("Send to payer", { v: "solid", s: "sm", icon: "send" }) : button("Schedule treatment", { v: "solid", s: "sm", icon: "calendar-plus" }) });
}
defineBlock({
  cat: "claims", id: "claims-preauths", title: "Pre-auths",
  note: "The Pre-auths side of Claims, with To Be Sent, Sent and Responded tabs. Approvals running out within 30 days get the orange flag, because someone needs to get the patient scheduled.",
  where: "Revenue Cycle › Claims › Pre-auths",
  states: ["Responded", "To be sent", "Loading"],
  canvas: "bare",
  html: (state) => {
    const on = state === "To be sent" ? 0 : 2;
    if (V2) return `${workspaceHeader({ parent: "Revenue Cycle", title: "Claims", actions: `${segmented(["Claims", "Pre-auths"], 1, { sm: true })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
      <div data-pa-tabs${chg("Tab names are in sentence case like the Claims tabs next to them (\"To be sent\")")}>${tabsWithSlot(V2_PA_TABS.map(([l, st]) => (st.length ? [l, PREAUTHS.filter((p) => st.includes(p.st)).length] : l)), on, dateRangeButton("Last 90 days"))}</div>
      <div class="px-4 pb-4">${state === "Loading" ? `<div class="py-2.5 flex gap-2">${skel("w-48", "h-8")}</div><div${chg("The loading grid has the same columns and names as the loaded one")}>${gridSkeleton(["Patient", "Procedures", "Payer", "Est. Amount", "Approved", "Status", "Expires"], 6)}</div>` : '<div data-grid="pa"></div>'}</div>`;
    return `${workspaceHeader({ parent: "Revenue Cycle", title: "Claims", actions: `${segmented(["Claims", "Pre-auths"], 1, { sm: true })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
      <div data-pa-tabs>${tabsWithSlot(PA_TABS.map(([l, st]) => (st.length ? [l, PREAUTHS.filter((p) => st.includes(p.st)).length] : l)), on, dateRangeButton("Last 90 days"))}</div>
      <div class="px-4 pb-4">${state === "Loading" ? `<div class="py-2.5 flex gap-2">${skel("w-36", "h-8")}${skel("w-48", "h-8")}</div>${gridSkeleton(["Patient", "Procedures", "Payer", "Est. Amount", "Approved", "Status", "Sent date", "Expires"], 6)}` : '<div data-grid="pa"></div>'}</div>`;
  },
  mount: (el, state) => {
    const host = el.querySelector('[data-grid="pa"]'); if (!host) return;
    let tab = state === "To be sent" ? 0 : 2; const rowsFor = (i) => PREAUTHS.filter((p) => PA_TABS[i][1].includes(p.st));
    const g = new Grid(host, {
      ...(V2 ? { viewButton: false, noun: "pre-auths", maxHeight: 420 } : {}),
      columns: V2 ? v2PaCols(tab) : paCols(), rows: rowsFor(tab), title: PA_TABS[tab][0], searchPlaceholder: V2 ? "Search pre-auths…" : "Search pre-auths...", maxHeight: 420, addColumn: false, calc: { est: "sum", appr: "sum" },
      filters: [{ key: "st", label: "Status", options: Object.entries(PA_ST).map(([value, [label, tone]]) => ({ value, label, tone })) }, { key: "payer", label: "Payer", options: DATA.payers.map((p) => ({ value: p.id, label: p.short })) }],
      primary: { label: "New Pre-Auth" },
      empty: { icon: "file-check", title: "No pre-authorizations here", body: "Archived pre-authorizations will appear here." },
      bulk: [{ label: "Run AI Analysis on selected", icon: "sparkles" }, { label: "Archive", icon: "archive" }],
      onOpen: (r, gr) => { if (V4) return v4cOpenPreauth(r, gr); const s = PA_ST[r.st];
        Sheet.open({ flush: true, title: esc(DATA.patient(r.pt).name), lead: avatar(DATA.patient(r.pt).name, { size: 9 }), subtitle: `${DATA.payer(r.payer).short} · Pre-authorization`, tabs: ["Overview", "History"],
          body: `${statusLine(s[0], s[1], r.exp ? `Expires ${fmtDateY(r.exp)}` : r.sent ? `Sent ${fmtDate(r.sent)}` : "Not sent yet")}
            ${r.st === "denied" ? alertSec("Next step", "Denied: Cigna says an implant isn't covered on this plan. Tell James, or ask about a bridge instead.") : ""}
            ${psec("Procedures", `<div class="${R.tableBox}"><table class="table-fixed border-separate border-spacing-0 text-sm"><colgroup><col class="w-[76px]"><col><col class="w-[104px]"></colgroup><thead><tr><th class="${R.tHead}">Code</th><th class="${R.tHead}">Description</th><th class="${R.tHead} !text-end">Requested</th></tr></thead><tbody>${r.codes.map((c) => `<tr><td class="${R.tCell} tabular-nums">${c}</td><td class="${R.tCell} truncate">${DATA.proc(c).name}</td><td class="${R.tCell} text-end tabular-nums">${money(DATA.proc(c).fee)}</td></tr>`).join("")}</tbody><tfoot><tr><td colspan="2" class="h-9 px-3 font-medium">Total</td><td class="h-9 px-3 text-end font-semibold tabular-nums">${money(r.est)}</td></tr></tfoot></table></div>`, { count: r.codes.length })}`,
          footer: r.st === "draft" ? button("Send to payer", { v: "solid", s: "sm", icon: "send" }) : button("Schedule treatment", { v: "solid", s: "sm", icon: "calendar-plus" }) }); }
    });
    wireTabs(el.querySelector("[data-pa-tabs]"), (i) => { tab = i; g.o.title = PA_TABS[i][0]; if (V2) g.o.columns = v2PaCols(i); g.setRows(rowsFor(i)); g.filters = {}; g.q = ""; g.render(); });
  }
});

/* ======================================================= 7. RCM overview: Needs attention */
const STUCK = [[34, "p1", "delta", ["D0120", "D1110", "D0274"], "No response from payer", "Asha"], [38, "p10", "delta", ["D2392", "D2391"], "No response from payer", "Asha"], [41, "p6", "guardian", ["D2392"], "Needs x-rays", "Your team"], [44, "p3", "cigna", ["D0120", "D1110"], "No response from payer", "Asha"],
  [47, "p14", "guardian", ["D0150", "D0210"], "No response from payer", "Asha"], [52, "p15", "aetna", ["D7140", "D7140"], "Payer portal only", "Your team"], [55, "p7", "uc", ["D2740"], "No response from payer", "Asha"], [58, "p11", "delta", ["D1110", "D0274"], "Sent to the wrong payer", "Your team"],
  [63, "p13", "cigna", ["D7210"], "No response from payer", "Asha"], [71, "p5", "aetna", ["D4341", "D4341"], "Needs perio chart", "Your team"], [77, "p2", "metlife", ["D2950"], "No response from payer", "Asha"], [88, "p8", "metlife", ["D0330"], "No response from payer", "Asha"],
  [96, "p4", "delta", ["D1120", "D1208"], "Claim lost by payer", "Asha"], [118, "p12", "delta", ["D1351", "D1351"], "Payer portal only", "Your team"]]
  .map(([d, pt, payer, codes, why, owner], i) => ({ id: "s" + i, days: d, pt, payer, codes, why, owner, sent: isoMinus(d), svc: isoMinus(d + 1), amt: codes.reduce((a, c) => a + DATA.proc(c).fee, 0) }));
const AGE = [["Fresh", 30, 45], ["Watch", 46, 60], ["At risk", 61, 90], ["Past due", 91, 999]].map(([label, lo, hi]) => { const r = STUCK.filter((s) => s.days >= lo && s.days <= hi); return { label, lo, hi, n: r.length, amt: cSum(r, "amt") }; });
const ALERTS = [["Claims missing EOBs", STUCK.length, cSum(STUCK, "amt"), "EOB"], ["Denials awaiting action", 3, 1185, "Claim"], ["Fully paid EOBs not posted", 5, 2342.4, "EOB"], ["Rejected claims with no action taken", 2, 520, "Claim"], ["Upcoming visits not verified", 6, null, "Patient"], ["Unbilled patient balances", 4, 612.5, "Ledger"]];
/* v2 needs attention: no heading or cards above the list. One 36px age row (a blue stacked bar with its numbers on it,
 * darker = older) and an owner switch in the grid's toolbar that filters the rows. */
const V2_AGE_TONE = ["bg-blue-200", "bg-blue-400", "bg-blue-600", "bg-blue-800"];
function v2AgeRow(loading) {
  const total = STUCK.length;
  return `<div class="flex h-9 items-center gap-4 mt-1.5"${chg("How old the claims are is one row above the list: a blue bar (darker = older) with the count beside each bucket's name. The heading, its Send follow-ups button (still a bulk action) and two cards (about 190px) that repeated the Waiting and Owner columns are gone; the alert's explanation is on the (i).")}>
    <span class="inline-flex shrink-0 items-center gap-1.5 text-[13px] text-gray-700"><span class="inline-flex text-gray-400 hover:text-gray-600 cursor-help" tabindex="0" data-tip="Claims sent more than 30 days ago with no EOB back yet" aria-label="Claims sent more than 30 days ago with no EOB back yet">${I("info", "size-4")}</span>${loading ? skel("w-32", "h-3.5") : `<span class="tabular-nums">${total} claims · ${money(cSum(STUCK, "amt"))}</span>`}</span>
    ${loading ? `<span class="grow">${skel("w-full", "h-2")}</span>` : `<div class="flex h-2 grow overflow-hidden rounded-full bg-gray-100 gap-px" role="img" aria-label="${AGE.map((a) => `${a.label} ${a.n}`).join(", ")}">${AGE.map((a, i) => `<div class="${V2_AGE_TONE[i]}" style="width:${(a.n / total) * 100}%"></div>`).join("")}</div>`}
    <div class="flex shrink-0 items-center gap-3.5">${AGE.map((a, i) => `<span class="inline-flex items-center gap-1.5 text-[13px] text-gray-600" data-tip="${a.hi < 999 ? `${a.lo}–${a.hi}` : `${a.lo}+`} days · ${money(a.amt, { cents: false })}"><span class="size-2.5 rounded-sm ${V2_AGE_TONE[i]}"></span>${a.label} <span class="font-medium text-gray-800 tabular-nums">${loading ? "–" : a.n}</span></span>`).join("")}</div></div>`;
}
defineBlock({
  cat: "claims", id: "claims-rcm-needs-attention", title: "RCM overview: Needs attention",
  note: "Where claims are stuck. Pick an alert on the left; the right side shows how old the claims are as one blue stacked bar, who owns the next step (Asha or your team), and the claims themselves.",
  where: "Revenue Cycle › RCM Overview",
  states: ["Normal", "Loading"],
  canvas: "bare",
  html: (state) => {
    const loading = state === "Loading", own = (o) => STUCK.filter((s) => s.owner === o);
    return `${workspaceHeader({ parent: "Revenue Cycle", title: "RCM Overview", actions: iconButton("ellipsis", "More", { s: "iconSm" }) })}
      ${tabsWithSlot([["Needs attention", ALERTS.length], "Completed activity"], 0, dateRangeButton("Last 90 days"))}
      <div class="grid grid-cols-[272px_1fr] min-h-[600px]">
        <nav class="border-e border-gray-200/80 p-3" aria-label="Alerts">${ALERTS.map(([l, n, amt, kind], i) => `<a class="${i === 0 ? R.navItemOn : R.navItem} !h-auto py-2 !items-start" ${i === 0 ? 'aria-current="page"' : ""}><span class="grow min-w-0"><span class="block truncate">${l}</span><span class="block text-xs text-gray-500 font-normal">${kind}${amt && !loading ? ` · <span class="tabular-nums">${money(amt, { cents: false })}</span>` : ""}</span></span><span class="${i === 0 ? R.countBlue : R.count}">${loading ? "–" : n}</span></a>`).join("")}</nav>
        ${V2 ? `<div class="min-w-0 px-4 pb-4">${v2AgeRow(loading)}${loading ? `<div class="py-2.5 flex gap-2">${skel("w-48", "h-8")}<span class="ms-auto">${skel("w-56", "h-8")}</span></div>${gridSkeleton(["Patient", "Payer", "Waiting", "Amount", "Why it's stuck", "Owner"], 6)}` : '<div data-grid="stuck"></div>'}</div></div>` : `<div class="min-w-0 px-5 pt-4 pb-4">
          <div class="flex items-start justify-between gap-4"><div><h2 class="${R.sectionTitle}">Claims missing EOBs</h2><p class="${R.help}">Claims sent more than 30 days ago with no EOB back yet. ${loading ? "" : `${STUCK.length} claims · ${money(cSum(STUCK, "amt"))}`}</p></div>${button("Send follow-ups", { v: "white", s: "sm", icon: "send" })}</div>
          <div class="mt-4 grid grid-cols-[1.5fr_1fr] gap-3">
            <div class="${R.box} px-4 py-3"><p class="${R.groupTitle}">How old are these claims</p><div class="mt-3">${loading ? skel("w-full", "h-2.5") : Chart.stack(AGE.map((a) => ({ label: `${a.label} · ${a.hi < 999 ? `${a.lo}–${a.hi}` : `${a.lo}+`} days`, value: a.amt, fmt: `${a.n} · ${money(a.amt, { cents: false })}` })))}</div></div>
            <div class="${R.box} px-4 py-3"><p class="${R.groupTitle}">Who owns the next step</p><div class="mt-2 space-y-2">${[["Asha", "Calls or checks the payer portal"], ["Your team", "Needs x-rays, a login or a fix"]].map(([o, d]) => { const r = own(o); return `<div class="flex items-center gap-3"><span class="w-20 text-sm text-gray-800">${o}</span><div class="grow">${loading ? skel("w-full", "h-1.5") : Chart.meter(r.length, STUCK.length)}</div><span class="w-6 text-end text-sm font-medium tabular-nums">${loading ? "" : r.length}</span></div><p class="${R.caption} -mt-1 ps-[92px]">${d}</p>`; }).join("")}</div></div>
          </div>
          <div class="mt-1">${loading ? `<div class="py-2.5">${skel("w-48", "h-8")}</div>${gridSkeleton(["Patient", "Payer", "Waiting", "Amount", "Why it's stuck", "Owner"], 6, { gutter: 20 })}` : '<div data-grid="stuck"></div>'}</div>
        </div></div>`}`;
  },
  mount: (el) => { const host = el.querySelector('[data-grid="stuck"]'); if (!host) return;
    const rows = V4 ? STUCK.map((x) => ({ ...x })) : STUCK; let on = 0; // v4: owners change in place, so the page works on its own copy
    const owners = ["All", "Asha", "Your team"], ownerSeg = (on) => `<span${chg("Who owns the next step is a switch in the toolbar that filters the list: All, Asha or Your team, each with its count")}>${segmented(owners.map((o) => `${o} <span class="text-gray-400 tabular-nums">${o === "All" ? rows.length : rows.filter((x) => x.owner === o).length}</span>`), on, { sm: true, attrs: 'data-owner aria-label="Who owns the next step"' })}</span>`;
    const ownerCell = (r) => (r.owner === "Asha" ? `<span class="inline-flex items-center gap-x-2"><span class="flex size-5 items-center justify-center rounded-full bg-blue-100 text-blue-800">${I("sparkles", "size-3")}</span>Asha</span>` : `<span class="inline-flex items-center gap-x-2">${I("users", "size-4 text-gray-400")}Your team</span>`);
    const g = new Grid(host, { gutter: 20,
      title: "Claims missing EOBs", searchPlaceholder: "Search claims", rows, maxHeight: 332, addColumn: false, defaultSort: { key: "days", dir: -1 }, calc: { amt: "sum" },
      columns: [
        { key: "pt", label: "Patient", icon: "user", w: 150, open: true, kind: "text", value: (r) => DATA.patient(r.pt).name, render: (r) => esc(DATA.patient(r.pt).name) },
        { key: "payer", label: "Payer", icon: "shield", w: 108, kind: "text", value: (r) => DATA.payer(r.payer).short, render: (r) => esc(DATA.payer(r.payer).short) },
        { key: "days", label: "Waiting", w: 104, num: true, kind: "num", render: (r) => (r.days > 90 ? `<span class="${R.flag} justify-end w-full">${I("circle-alert")}<span class="text-gray-800 tabular-nums">${r.days} days</span></span>` : `${r.days} <span class="text-gray-500">days</span>`) },
        { key: "amt", label: "Amount", w: 100, num: true, kind: "money", render: (r) => money(r.amt) },
        { key: "why", label: "Why it's stuck", icon: "circle-help", w: 180, kind: "text" },
        V4 ? { key: "owner", label: `<span${chg4("Owner is a cell you change in place: hand a claim to Asha or take it for your team without opening it. The switch's counts follow")}>Owner</span>`, icon: "user-round", w: 128, kind: "text", edit: "select", options: ["Asha", "Your team"], render: ownerCell }
          : { key: "owner", label: "Owner", icon: "user-round", w: 118, kind: "text", render: ownerCell }
      ],
      filters: [{ key: "owner", label: "Owner", options: [{ value: "Asha", label: "Asha" }, { value: "Your team", label: "Your team" }] }, { key: "payer", label: "Payer", options: DATA.payers.map((p) => ({ value: p.id, label: p.short })) }],
      bulk: [{ label: "Send follow-ups", icon: "send" }, { label: "Assign to me", icon: "user-round" }],
      ...(V2 ? { gutter: 16, viewButton: false, noun: "claims", maxHeight: 520, toolbarExtra: ownerSeg(0), filters: [{ key: "payer", label: "Payer", options: DATA.payers.map((p) => ({ value: p.id, label: p.short })) }] } : {}),
      ...(V4 ? { sheet: true, onCommit: (r, k, v, gr) => { const src = rows.find((x) => x.id === r.id); if (k !== "owner" || !src) return; src.owner = v; gr.o.toolbarExtra = ownerSeg(on); } } : {}),
      onOpen: (r) => { const c = { id: r.id, pt: r.pt, svc: r.svc, codes: r.codes, payer: r.payer, type: "Primary", billed: r.amt, paid: 0, status: "awaiting", biller: r.owner === "Asha" ? "Asha" : "Nina Flores", sent: r.sent, filing: 365 - r.days }; openClaimSheet(c); }
    });
    if (V2) el.addEventListener("click", (e) => { const b = e.target.closest("[data-owner] [data-seg]"); if (!b) return; const o = owners[on = +b.dataset.seg];
      g.o.toolbarExtra = ownerSeg(+b.dataset.seg); g.setRows(o === "All" ? rows : rows.filter((x) => x.owner === o)); g.render(); });
  }
});

/* ======================================================= 8. Unbatched charges workspace */
const UNB = [
  { id: "g1", pt: "p1", date: "2026-09-25", payer: "delta", lines: [["D0120", "", "", "pr1"], ["D1110", "", "", "pr3"], ["D2391", "3", "O", "pr1"]] },
  { id: "g5", pt: "p5", date: "2026-09-25", payer: "aetna", lines: [["D4910", "", "", "pr3"], ["D1208", "", "", "pr3", true]] },
  { id: "g2", pt: "p4", date: "2026-09-24", payer: "delta", lines: [["D1120", "", "", "pr4"], ["D1208", "", "", "pr4"], ["D1351", "3", "O", "pr4"], ["D1351", "14", "O", "pr4"]] },
  { id: "g3", pt: "p3", date: "2026-09-25", payer: "cigna", lines: [["D0120", "", "", "pr2"], ["D1110", "", "", "pr3"], ["D0274", "", "", "pr3"]] },
  { id: "g4", pt: "p6", date: "2026-09-24", payer: "guardian", lines: [["D2392", "14", "MO", "pr2"]] },
  { id: "g6", pt: "p7", date: "2026-09-22", payer: "uc", lines: [["D0150", "", "", "pr1"], ["D0210", "", "", "pr1"]] }
].map((g) => ({ ...g, lines: g.lines.map(([code, tooth, surf, prov, dnb], i) => ({ id: `${g.id}-${i}`, code, tooth, surf, prov, dnb: !!dnb, fee: DATA.proc(code).fee })) }));
function unbatchedTable(groups, sel) {
  const W = [44, 150, 0, 150, 150, 116, 176];
  const head = ["", "Procedure", "Description", "Provider", "Payer", "Amount", "Do not bill insurance"];
  const billable = (g) => g.lines.filter((l) => !l.dnb);
  return `<div class="g-wrap border-y border-gray-200/80 overflow-auto max-h-[468px] ${edgeToEdge(16)}" data-scroll-ok><table class="w-full table-fixed border-separate border-spacing-0 text-sm"><colgroup>${W.map((w) => (w ? `<col style="width:${w}px">` : "<col>")).join("")}</colgroup>
    <thead class="sticky top-0 z-10 bg-white"><tr>${head.map((h, i) => `<th class="${R.gridHead} bg-white ${i === 0 ? "!px-0 text-center" : ""} ${i === 5 ? "!text-end" : ""} ${i === 6 ? "!text-center !border-e-0" : ""}">${i === 0 ? checkbox(groups.every((g) => sel.has(g.id) || !billable(g).length), "Select all unbatched claims on this page", 'data-act="all"') : h}</th>`).join("")}</tr></thead>
    <tbody>${groups.map((g) => { const p = DATA.patient(g.pt), bill = billable(g), can = bill.length > 0, filingDays = 365 - cDays(g.date);
      return `<tr class="bg-gray-50/70"><td class="h-10 border-b border-gray-200/80"><span class="flex justify-center">${checkbox(sel.has(g.id), `Select ${p.name} ${fmtDate(g.date)}`, `data-act="grp" data-g="${g.id}" ${can ? "" : "disabled"}`)}</span></td>
        <td colspan="4" class="h-10 px-3 border-b border-gray-200/80"><span class="inline-flex items-center gap-2">${avatar(p.name, { size: 5 })}<span class="font-medium text-gray-800">${p.name}</span><span class="text-gray-500">· ${fmtDate(g.date)} · ${DATA.payer(g.payer).short} · ${g.lines.length} ${g.lines.length === 1 ? "procedure" : "procedures"}</span><span class="text-[13px] text-gray-400">· ${filingDays} filing days left</span></span></td>
        <td class="h-10 px-3 border-b border-gray-200/80 text-end font-semibold tabular-nums">${money(cSum(bill, "fee"))}</td><td class="h-10 px-3 border-b border-gray-200/80 text-center text-[13px] text-gray-500">${can ? "" : "Nothing to bill"}</td></tr>
        ${g.lines.map((l) => `<tr class="${l.dnb ? "text-gray-400" : ""}"><td class="${R.gridCell} !border-e-0"></td><td class="${R.gridCell} tabular-nums ${l.dnb ? "!text-gray-400" : ""}">${l.code}${l.tooth ? ` <span class="text-gray-500">#${l.tooth}${l.surf ? " " + l.surf : ""}</span>` : ""}</td><td class="${R.gridCell} ${l.dnb ? "!text-gray-400" : ""}">${DATA.proc(l.code).name}${l.dnb ? ' <span class="text-[13px]">· patient pays</span>' : ""}</td><td class="${R.gridCell} ${l.dnb ? "!text-gray-400" : ""}">${DATA.provider(l.prov).short}</td><td class="${R.gridCell} ${l.dnb ? "!text-gray-400" : ""}">${DATA.payer(g.payer).short}</td><td class="${R.gridCell} text-end tabular-nums ${l.dnb ? "!text-gray-400 line-through" : ""}">${money(l.fee)}</td><td class="${R.gridCell} !border-e-0"><span class="flex justify-center">${checkbox(l.dnb, `Do not bill insurance for ${l.code}`, `data-act="dnb" data-l="${l.id}"`)}</span></td></tr>`).join("")}`; }).join("")}</tbody></table></div>`;
}
/* v2 unbatched: no Payer column (the group row names the payer), filing days only when 30 or fewer, 36px group rows, no
 * strikethrough, and the grouping shown as a toolbar chip like the rest of Claims. Kit candidate: Grid groupBy. */
function v2UnbatchedTable(groups, sel) {
  const W = [44, 150, 0, 160, 116, 176];
  const head = ["", "Procedure", "Description", "Provider", "Amount", "Do not bill insurance"];
  const billable = (g) => g.lines.filter((l) => !l.dnb);
  return `<div class="g-wrap border-y border-gray-200/80 overflow-auto max-h-[468px] ${edgeToEdge(16)}" data-scroll-ok><table class="w-full table-fixed border-separate border-spacing-0 text-sm"><colgroup>${W.map((w) => (w ? `<col style="width:${w}px">` : "<col>")).join("")}</colgroup>
    <thead class="sticky top-0 z-10 bg-white"><tr>${head.map((h, i) => `<th class="${R.gridHead} bg-white ${i === 0 ? "!px-0 text-center" : ""} ${i === 4 ? "!text-end" : ""} ${i === 5 ? "!text-center !border-e-0" : ""}">${i === 0 ? checkbox(groups.every((g) => sel.has(g.id) || !billable(g).length), "Select all unbatched claims on this page", 'data-act="all"') : i === 2 ? `<span${chg("The Payer column is gone (each group row already names the payer), so descriptions have room")}>${h}</span>` : h}</th>`).join("")}</tr></thead>
    <tbody>${groups.map((g, gi) => { const p = DATA.patient(g.pt), bill = billable(g), can = bill.length > 0, filingDays = 365 - cDays(g.date);
      return `<tr class="bg-gray-50/70"><td class="h-9 border-b border-gray-200/80"><span class="flex justify-center">${checkbox(sel.has(g.id), `Select ${p.name} ${fmtDate(g.date)}`, `data-act="grp" data-g="${g.id}" ${can ? "" : "disabled"}`)}</span></td>
        <td colspan="3" class="h-9 px-3 border-b border-gray-200/80"><span class="inline-flex items-center gap-2"${gi === 0 ? chg("Group rows are 36px like every other row, and filing days show only when 30 or fewer are left (with an orange mark); \"365 filing days left\" was on every group") : ""}>${avatar(p.name, { size: 5 })}<span class="font-medium text-gray-800">${p.name}</span><span class="text-gray-500">· ${fmtDate(g.date)} · ${DATA.payer(g.payer).short} · ${g.lines.length} ${g.lines.length === 1 ? "procedure" : "procedures"}</span>${filingDays <= 30 ? v2bcFlag(`${filingDays} filing days left`, "Send this claim soon: the payer's filing limit is close") : ""}</span></td>
        <td class="h-9 px-3 border-b border-gray-200/80 text-end font-semibold tabular-nums">${money(cSum(bill, "fee"))}</td><td class="h-9 px-3 border-b border-gray-200/80 text-center text-[13px] text-gray-500">${can ? "" : "Nothing to bill"}</td></tr>
        ${g.lines.map((l) => `<tr class="${l.dnb ? "text-gray-400" : ""}"><td class="${R.gridCell} !border-e-0"></td><td class="${R.gridCell} tabular-nums ${l.dnb ? "!text-gray-400" : ""}">${l.code}${l.tooth ? ` <span class="text-gray-500">#${l.tooth}${l.surf ? " " + l.surf : ""}</span>` : ""}</td><td class="${R.gridCell} ${l.dnb ? "!text-gray-400" : ""}">${DATA.proc(l.code).name}${l.dnb ? ' <span class="text-[13px]">· patient pays</span>' : ""}</td><td class="${R.gridCell} ${l.dnb ? "!text-gray-400" : ""}">${DATA.provider(l.prov).short}</td><td class="${R.gridCell} text-end tabular-nums ${l.dnb ? "!text-gray-400" : ""}">${l.dnb ? `<span${chg("A fee the patient pays is grey with \"· patient pays\", without strikethrough (quiet edits)")}>${money(l.fee)}</span>` : money(l.fee)}</td><td class="${R.gridCell} !border-e-0"><span class="flex justify-center">${checkbox(l.dnb, `Do not bill insurance for ${l.code}`, `data-act="dnb" data-l="${l.id}"`)}</span></td></tr>`).join("")}`; }).join("")}</tbody></table></div>`;
}
defineBlock({
  cat: "claims", id: "claims-unbatched", title: "Unbatched charges",
  note: "Completed procedures that aren't on a claim yet, grouped by patient and service date. Tick Do not bill insurance for anything the patient pays for; the group total follows. Tick groups, then Create claims.",
  where: "Revenue Cycle › Claims › Unbatched claims",
  states: ["Normal", "Loading", "Empty"],
  canvas: "bare",
  html: (state) => `${workspaceHeader({ parent: "Revenue Cycle", title: "Claims", actions: `${segmented(["Claims", "Pre-auths"], 0, { sm: true })}${button("Auto-submit schedule", { v: "quiet", s: "sm", icon: "clock" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
    ${tabsWithSlot(CLAIM_TABS.map(([l, st], i) => (i === 0 ? [l, state === "Empty" ? 0 : UNB.length] : st.length ? [l, CLAIMS.filter((c) => st.includes(c.status)).length] : l)), 0, dateRangeButton("Last 30 days"))}
    <div class="px-4 pb-4" data-unb>
      <div class="flex items-center gap-2 py-2.5">${searchBox("Search patient, procedure, payer, or provider", { w: "w-80" })}${V2 ? `<span${chg("The grouping is a toolbar chip like the other Claims filters, instead of a loose caption")}>${condChip("Grouped by", "", "Patient and date", "", "Remove grouping")}</span>` : `<span class="text-[13px] text-gray-500 ps-1">Grouped by patient and service date</span>`}
        <div class="ms-auto flex items-center gap-2"><span class="text-[13px] text-gray-500 tabular-nums" data-sel-sum></span>${iconButton("ellipsis", "Charge actions", { s: "iconSm" })}<span data-create></span></div></div>
      ${state === "Loading" ? (V2 ? `<div class="flex items-center gap-2 pb-2 text-[13px] text-gray-500">${I("loader-circle", "size-3.5 animate-spin")}Loading unbatched claims…</div><div${chg("The loading grid has the same columns as the loaded one")}>${gridSkeleton(["", "Procedure", "Description", "Provider", "Amount", "Do not bill insurance"], 7)}</div>` : `<div class="flex items-center gap-2 pb-2 text-[13px] text-gray-500">${I("loader-circle", "size-3.5 animate-spin")}Loading unbatched claims...</div>${gridSkeleton(["", "Procedure", "Description", "Provider", "Payer", "Amount", "Do not bill insurance"], 7)}`)
        : state === "Empty" ? `<div class="border-y border-gray-200/80 ${edgeToEdge(16)}">${emptyState({ icon: "file-plus", title: "No unbatched claims in this service-date range", body: "Every completed procedure with insurance is on a claim. Try a longer range if you're looking for something older.", action: button("Last 90 days", { v: "white", s: "sm", icon: "calendar" }) })}</div>`
        : '<div data-table></div>'}
    </div>`,
  mount: (el, state) => {
    const box = el.querySelector("[data-table]"), create = el.querySelector("[data-create]"), selSum = el.querySelector("[data-sel-sum]");
    const groups = UNB.map((g) => ({ ...g, lines: g.lines.map((l) => ({ ...l })) })), sel = new Set(state === "Normal" ? ["g1", "g5", "g3"] : []);
    const draw = () => {
      if (box) box.innerHTML = (V2 ? v2UnbatchedTable : unbatchedTable)(groups, sel);
      const picked = groups.filter((g) => sel.has(g.id)), amt = cSum(picked, (g) => cSum(g.lines.filter((l) => !l.dnb), "fee"));
      selSum.textContent = picked.length ? `${picked.length} selected · ${money(amt)}` : "";
      create.innerHTML = button(picked.length ? `Create ${picked.length} ${picked.length === 1 ? "claim" : "claims"}` : "Create claims", { v: "solid", s: "sm", icon: "file-plus", attrs: picked.length ? "" : "disabled" });
      const all = el.querySelector('[data-act="all"]'); if (all) all.indeterminate = picked.length > 0 && !all.checked;
      icons();
    };
    draw();
    if (!box) return;
    box.addEventListener("change", (e) => { const t = e.target, a = t.dataset.act;
      if (a === "grp") t.checked ? sel.add(t.dataset.g) : sel.delete(t.dataset.g);
      if (a === "all") groups.forEach((g) => (t.checked && g.lines.some((l) => !l.dnb) ? sel.add(g.id) : sel.delete(g.id)));
      if (a === "dnb") groups.forEach((g) => { g.lines.forEach((l) => { if (l.id === t.dataset.l) l.dnb = t.checked; }); if (!g.lines.some((l) => !l.dnb)) sel.delete(g.id); });
      draw(); });
  }
});

/* ======================================================= v4: the claim as the ADA form (second pass)
 * The claim panel built from the ADA 2024 claim form's boxes, most used first. Every box is a cell you click or type
 * into (the kit Grid's sheet editing) and keeps its ADA number as a small grey number before its label. What billers
 * touch on most claims comes first: status and biller, the plan, subscriber and patient, the billing and treating
 * dentist, and the record of services. The boxes most claims leave alone (claim type and frequency, other coverage,
 * missing teeth, diagnosis codes, signatures, ortho / prosthesis / accident, addresses and extra IDs) sit behind
 * "More claim details", and the rare service-line boxes (25, 26, 29a, 29b, modifiers) behind the lines' "Every box".
 * Every table carries the same grey header band: field tables carry their group's name in it.
 * Three layouts to compare, picked with V4_OPTS.ada (default "sheet"):
 *   sheet  One claim sheet: today's claim flyout on the data grid. Label · value · label · value, one card, a grey band
 *          per section, addresses across the row. More claim details opens a second sheet in the same shape.
 *   boxes  Box groups: one small table per ADA group, three across. More claim details opens the rare groups the same way.
 *   lines  Lines first: the record of services on top, then two tables (coverage; claim and providers), then each rare
 *          group as one row with its gist that opens in place.
 * Follow-up boxes (5–11a, 20–22, 41–42, 44, 46–47, original claim #) appear only when the box they hang off says
 * they apply. A box that's empty or wrong shows the orange icon with the reason on hover; nothing blocks Send claim.
 * The sent claim panel's Claim tab (claims-sent-panel) reuses this, with the EOB tab laid out like a dental EOB. */
if (V4 || window.ASHA_REVIEW) (() => {
const ADA_STATES = ["Ready to send", "Missing info", "Sent (read-only)"];
const ADA_TRIES = ["sheet", "boxes", "lines"], ADA_DEFAULT = "sheet";
const adaTry = () => (ADA_TRIES.includes(V4_OPTS.ada) ? V4_OPTS.ada : ADA_DEFAULT);
let ADA_ID = 0;
const adaId = () => `ada${++ADA_ID}`;
const npiCheck = (v) => (!v ? "Add the 10-digit NPI. Claims without one are rejected." : /^\d{10}$/.test(v) ? null : `An NPI has 10 digits; this one has ${String(v).replace(/\D/g, "").length}.`);
const dateCheck = (need) => (v) => (!v ? need : /^\d{2}\/\d{2}\/\d{4}$/.test(v) ? null : "Use MM/DD/YYYY, like 06/30/2026.");
const optDate = (v) => (!v || /^\d{2}\/\d{2}\/\d{4}$/.test(v) ? null : "Use MM/DD/YYYY, like 06/30/2026.");
const need = (why) => (v) => (v ? null : why);
const grey = (s) => `<span class="text-gray-500">${s}</span>`;
const nums = (r) => `<span class="tabular-nums">${esc(r.value)}</span>`;
/* One box: F("13", "Date of birth", "11/02/1975", { check, options, multi, none, html, more, wide, ph, peek }).
 * more(value) lists the follow-up boxes for that answer (kept per answer, so typed values survive a change back);
 * wide: the value takes the whole row (addresses, remarks); ph: the grey hint when it's empty. */
const F = (box, label, value, o = {}) => ({ id: adaId(), box, label, value: value ?? "", type: o.options ? (o.multi ? "multi" : "select") : o.none ? "none" : "text", ...o });
const GENDER = ["Male", "Female", "Other"], YES_NO = ["No", "Yes"], REL = ["Self", "Spouse", "Dependent child", "Other"];
const TEETH = [...Array.from({ length: 32 }, (_, i) => String(i + 1)), ..."ABCDEFGHIJKLMNOPQRST"];
const kids = (f) => { if (!f.more) return []; f._kids = f._kids || {}; const k = String(f.value); return f._kids[k] || (f._kids[k] = f.more(f.value) || []); };
const expand = (fields) => fields.flatMap((f) => [f, ...expand(kids(f))]);
const empty = (v) => v === "" || v == null || (Array.isArray(v) && !v.length);

/* ---- the cells of a field table: box number + label, then the value you edit ---- */
const boxLabel = (f, indent, boxes = true, short = false) => `<span class="flex items-baseline min-w-0 ${indent ? "ps-5" : ""}">${boxes ? `<span class="w-8 shrink-0 text-gray-400 tabular-nums">${f.box || ""}</span>` : ""}<span class="truncate text-gray-500">${esc(short && f.short || f.label)}</span></span>`;
const valOf = (f, v) => (empty(v) ? cDim(f.ph && !/^Add /.test(f.ph) ? f.ph : "None") : f.html ? f.html({ ...f, value: v }) : Array.isArray(v) ? `<span class="tabular-nums">${esc(v.join(", "))}</span>` : esc(v));
function fieldCols(sides, ro, labelW = 172, boxes = true, short = false) {
  return sides.flatMap((s) => [
    { key: `${s}l`, label: "", w: labelW, render: (r) => (r.grp ? foldLabel(r) : r[s] ? boxLabel(r[s], r.indent, boxes, short) : "") },
    { key: `${s}v`, label: "", w: 120, grow: true,
      edit: (r) => (ro || !r[s] || r[s].type === "none" ? null : r[s].type), options: (r) => (r[s] && r[s].options) || [],
      placeholder: (r) => (r[s] ? r[s].ph || `Add ${(short && r[s].short || r[s].label).replace(/^[A-Z](?![A-Z#])/, (m) => m.toLowerCase())}` : ""),
      flag: (r) => (r[s] && r[s].check ? r[s].check(r[`${s}v`]) : null),
      render: (r) => (r.grp ? (r.open ? "" : grey(esc(r.grp.sum ? r.grp.sum() : ""))) : r[s] ? valOf(r[s], r[`${s}v`]) : "") }]);
}
/* A change to a box: keep it on the box, redraw the follow-ups it brings, tell the panel (totals, flags) */
function adaCommit(row, key, v, g) {
  const f = row[key[0]]; if (!f) return; f.value = v;
  if (f.more && g.o.ada.build) g.data = g.o.ada.build();
  g.root.dispatchEvent(new CustomEvent("ada-change", { bubbles: true, detail: { f } }));
}
const bandHtml = (title, range) => `${esc(title)}${range ? ` <span class="ms-1 font-normal text-gray-400 tabular-nums normal-case">${range}</span>` : ""}`;
const G = (key, title, range, fields, sum) => ({ key, title, range, fields, sum });
const rowsOf = (fields, indent) => expand(fields).map((f) => ({ id: f.id, l: f, lv: f.value, indent }));
const peekOf = (r) => (r.l && r.l.peek ? r.l.peek() : r.r && r.r.peek ? r.r.peek() : "");

/* A group of boxes as one small table, its name in the grey header band */
function adaTable(gp, ro, o = {}) {
  const build = () => rowsOf(gp.fields);
  return sheetTable({ preset: "panel", title: gp.title, rows: build(), ada: { build, band: bandHtml(gp.title, gp.range) }, peek: peekOf, columns: fieldCols(["l"], ro, o.labelW, gp.fields.some((f) => f.box), o.short), onCommit: adaCommit });
}
/* Several groups in one sheet, two boxes to a row like today's claim flyout: label · value · label · value. Each
 * group starts with its grey band; a wide box (an address, the remarks) takes the row, and an odd box out does too */
function adaQuad(title, groups, ro) {
  const build = () => groups.flatMap((gp) => {
    const out = [{ id: `band-${gp.key}`, band: bandHtml(gp.title, gp.range) }]; let pend = null;
    const push = (a, b) => out.push({ id: a.id, l: a, lv: a.value, r: b || null, rv: b ? b.value : "", span: !b });
    expand(gp.fields).forEach((f) => { if (f.wide) { if (pend) push(pend); pend = null; push(f); } else if (pend) { push(pend, f); pend = null; } else pend = f; });
    if (pend) push(pend); return out; });
  return sheetTable({ preset: "form", title, head: false, rows: build(), ada: { build }, peek: peekOf, columns: fieldCols(["l", "r"], ro, 176), onCommit: adaCommit });
}
/* The rare groups as one table: a row per group with its gist; click it (or Enter) to open its boxes in place */
const foldLabel = (r) => `<span class="flex items-center gap-1.5 min-w-0 cursor-pointer">${I(r.open ? "chevron-down" : "chevron-right", "size-3.5 shrink-0 text-gray-400")}<span class="truncate text-gray-800">${esc(r.grp.title)}</span><span class="shrink-0 text-gray-400 tabular-nums">${r.grp.range}</span></span>`;
function adaFold(groups, ro) {
  const open = new Set();
  const build = () => groups.flatMap((gp) => [{ id: `grp-${gp.key}`, grp: gp, open: open.has(gp.key) }, ...(open.has(gp.key) ? rowsOf(gp.fields, true) : [])]);
  return sheetTable({ preset: "panel", title: "More claim details", rows: build(), ada: { build, open, band: bandHtml("More claim details", "") }, peek: peekOf, columns: fieldCols(["l"], ro, 320), onCommit: adaCommit,
    onOpen: (r, g) => { g.openId = null; if (r.grp) adaFoldToggle(g, r); } });
}
function adaFoldToggle(g, r) {
  const o = g.o.ada.open; o.has(r.grp.key) ? o.delete(r.grp.key) : o.add(r.grp.key);
  g.data = g.o.ada.build(); g.active = null; g.render();
}

/* ---- Record of services (24–32): only the claim's real lines, then one row to add a line ----
 * Columns follow today's claim flyout (Line, Code, Date, Description, Tooth, Surface, Fee) with each ADA box number in
 * grey. The rare boxes (25 area, 26 tooth system, 29a diagnosis pointer, 29b quantity, modifiers) join with Every box. */
const AREAS = [{ value: "", label: "None (tooth-specific)" }, ...[["00", "Whole mouth"], ["01", "Upper arch"], ["02", "Lower arch"], ["10", "Upper right"], ["20", "Upper left"], ["30", "Lower left"], ["40", "Lower right"]].map(([v, l]) => ({ value: v, label: `${v} · ${l}` }))];
const CODES = DATA.procedures.map((p) => ({ value: p.code, label: `${p.code} · ${p.name}` }));
const toothNeeded = (code) => /^D[23]/.test(code || "");
const adaLineEntry = () => ({ id: adaId(), kind: "add", n: "", date: "", area: "", sys: "", tooth: "", surf: "", code: "", diag: "", qty: "", mod: "", desc: "", fee: "" });
function adaLines(m, ro, add) {
  const rows = [...m.lines.map((l, i) => ({ id: adaId(), kind: "line", n: i + 1, area: "", sys: "JP", surf: "", qty: 1, mod: [], ...l })), ...(add ? [adaLineEntry()] : [])];
  const line = (r) => r.kind === "line", ed = (k) => (r) => (!ro && line(r) ? k : null);
  const H = (box, label, full) => `<span data-tip="${esc(full)}">${box ? `<span class="font-normal text-gray-400">${box}</span> ` : ""}${label}</span>`;
  const dash = (k) => (r) => (!line(r) ? "" : empty(r[k]) ? cDim() : `<span class="tabular-nums">${esc(Array.isArray(r[k]) ? r[k].join(", ") : r[k])}</span>`);
  const all = [
    { key: "n", label: H("", "#", "Line"), w: 40, render: (r) => (line(r) ? `<span class="text-gray-500 tabular-nums">${r.n}</span>` : I("plus", "size-3.5 text-gray-400")) },
    { key: "code", label: H("29", "Code", "Box 29. Procedure code"), w: 104, edit: (r) => (ro ? null : "select"), options: CODES, placeholder: (r) => (line(r) ? "Add code" : "Add procedure"),
      flag: (r) => (line(r) && !r.code ? "Add the procedure code." : null), render: (r) => `<span class="tabular-nums">${esc(r.code)}</span>` },
    { key: "date", label: H("24", "Date", "Box 24. Procedure date"), w: 108, edit: ed("text"), placeholder: () => "MM/DD/YYYY", flag: (r) => (line(r) ? dateCheck("Add the procedure date.")(r.date) : null), render: dash("date") },
    { key: "desc", label: H("30", "Description", "Box 30. Description"), w: 150, grow: true, render: (r) => (line(r) ? `<span title="${esc(r.desc)}">${esc(r.desc)}</span>` : "") },
    { key: "area", rare: true, label: H("25", "Area", "Box 25. Area of oral cavity"), w: 76, edit: ed("select"), options: AREAS, placeholder: () => "—", render: dash("area") },
    { key: "sys", rare: true, label: H("26", "Sys.", "Box 26. Tooth system: JP permanent and primary"), w: 72, edit: ed("select"), options: ["JP", "JO"], render: dash("sys") },
    { key: "tooth", label: H("27", "Tooth", "Box 27. Tooth number(s) or letter(s)"), w: 80, edit: ed("text"), placeholder: (r) => (toothNeeded(r.code) ? "Add" : "—"),
      flag: (r) => (line(r) && toothNeeded(r.code) && !r.tooth ? `${DATA.proc(r.code)?.name || "This procedure"} needs a tooth number. MetLife denies the line without one.` : null), render: dash("tooth") },
    { key: "surf", label: H("28", "Surf.", "Box 28. Tooth surface"), w: 76, edit: ed("text"), placeholder: () => "—", render: dash("surf") },
    { key: "diag", rare: true, label: H("29a", "Diag.", "Box 29a. Diagnosis pointer: letters from box 34a"), w: 84, edit: ed("multi"), options: ["A", "B", "C", "D"], placeholder: () => "—", render: dash("diag") },
    { key: "qty", rare: true, label: H("29b", "Qty", "Box 29b. Quantity"), w: 68, num: true, kind: "num", edit: ed("text"), render: dash("qty") },
    { key: "mod", rare: true, label: H("", "Mod.", "Procedure modifiers, for electronic claims"), w: 80, edit: ed("multi"), options: ["KX", "GY"], placeholder: () => "—", render: dash("mod") },
    { key: "fee", label: H("31", "Fee", "Box 31. Fee"), w: 108, num: true, kind: "money", edit: ed("text"), render: (r) => (line(r) ? money(+r.fee || 0) : "") }];
  const base = all.filter((c) => !c.rare);
  /* 32 Total fee: the lines plus 31a Other fee(s) (a box in More claim details) */
  const foot = (rs, cols) => cols.map((c) => (c.key === "code" ? `<span class="font-normal text-gray-400">32</span> Total fee` : c.key === "fee" ? money(cAdd(cSum(rs.filter(line), (r) => +r.fee || 0), v4cNum(m.other.value) || 0)) : ""));
  return sheetTable({ preset: "form", title: "Record of services provided", rows, columns: base, foot: foot(rows, base), ada: { lines: true, base, all, foot },
    peek: (r) => (line(r) && r.desc ? peekCard(`${esc(r.code)} · ${esc(r.desc)}`, [["Area (25)", r.area || "None"], ["System (26)", r.sys || "JP"], ["Diagnosis (29a)", (Array.isArray(r.diag) ? r.diag : [r.diag]).filter(Boolean).join(", ") || "None"], ["Quantity (29b)", r.qty || 1]], "Turn on Every box to edit these.") : ""),
    onCommit: (r, k, v, g) => {
      if (k === "code") { const p = DATA.proc(v); if (p) Object.assign(r, { desc: p.name, fee: p.fee });
        if (r.kind === "add") { const n = g.data.filter(line).length; Object.assign(r, { kind: "line", n: n + 1, date: (g.data.find(line) || {}).date || "", sys: "JP", qty: 1, mod: [] }); if (n + 1 < 10) g.data.push(adaLineEntry()); } }
      if (k === "tooth") r.tooth = String(v).replace(/^#/, "");
      g.o.foot = foot(g.data, g.o.columns);
      const count = g.root.closest("section")?.querySelector("[data-ada-count]"); if (count) count.textContent = g.data.filter(line).length;
    } });
}

/* ---- Liam Carter's MetLife claim (C4) as boxes; "Missing info" empties two and mistypes one; sent: as MetLife got it ---- */
function adaModel(state, sent = false) {
  const miss = state === ADA_STATES[1], gone = sent || state === ADA_STATES[2];
  const date = (need) => ({ check: dateCheck(need), html: nums });
  const x = {
    plan: F("3", "Dental plan", "MetLife Dental", { short: "Plan", options: DATA.payers.map((p) => p.name), check: need("Add the dental plan.") }),
    payerId: F("3a", "Payer ID", "64012", { check: need("Add the payer ID for electronic claims."), html: nums }),
    group: F("16", "Group #", "0081142", { html: nums }),
    sub: F("12", "Subscriber", "Liam Carter", { short: "Name", check: need("Add the subscriber's name.") }),
    subDob: F("13", "Subscriber DOB", miss ? "" : "11/02/1975", { short: "Date of birth", ...date("MetLife rejects a claim without the subscriber's date of birth.") }),
    subId: F("15", "Subscriber ID", "XK20417793", { short: "ID", check: need("Add the ID from the insurance card."), html: nums }),
    rel: F("18", "Relationship", "Self", { options: REL, more: (v) => (v === "Self" ? [] : [F("20", "Patient", "", { check: need("Add the patient's name.") }), F("21", "Patient DOB", "", date("Add the patient's date of birth.")),
      F("22", "Patient gender", "", { options: GENDER }), F("20", "Patient address", "", { wide: true, ph: "Add street, city, state, ZIP" })]) }),
    patId: F("23", "Patient ID", "20417", { html: nums }),
    bill: F("48", "Billing dentist", "Bayview Family Dental", { short: "Name", options: ["Bayview Family Dental", "Dr. Ethan Brooks", "Dr. Maya Patel"], check: need("Add the billing office's name.") }),
    billNpi: F("49", "Billing NPI", "1679542013", { short: "NPI", check: npiCheck, html: nums }),
    tin: F("51", "Tax ID", "94-3318402", { check: need("Add the office's tax ID."), html: nums }),
    treat: F("53", "Treating dentist", "Dr. Ethan Brooks", { short: "Name", options: ["Dr. Ethan Brooks", "Dr. Maya Patel"] }),
    treatNpi: F("54", "Treating NPI", miss ? "148739021" : "1487390215", { short: "NPI", check: npiCheck, html: nums }),
    lic: F("55", "License", "CA 64821", { html: nums }),
    remarks: F("35", "Remarks", "Deep decay into the pulp on #19. Root canal, buildup and crown done Jun 30. Pre-op x-ray attached.", { wide: true, ph: "Add remarks for MetLife", html: (r) => `<span title="${esc(r.value)}">${esc(r.value)}</span>` }),
    encl: F("39", "Enclosures", "3 attached", { none: true, peek: () => peekCard("Enclosures (39) · 3", [["Periapical x-ray", "#19 · Jun 30 · for D3330"], ["Bitewings", "Jun 12 · for D2740"], ["Narrative", "Narrative.pdf · for D2950"]], "Attach more from Actions.") }),
    preauth: F("2", "Preauthorization #", "", { ph: "None" }),
    other: F("31a", "Other fee(s)", "0.00", { html: (r) => `<span class="tabular-nums">${money(v4cNum(r.value) || 0)}</span>` })
  };
  const status = gone ? F("", "Status", "Partial", { none: true, html: () => v4cStatus("Partial", "mid", "posted Aug 15") })
    : F("", "Status", miss ? "Needs review" : "Ready to send", { none: true, html: (r) => v4cStatus(r.value, miss ? "needs" : "on") });
  const biller = F("", "Biller", C4.biller, { options: V4C_BILLERS, html: v4cBiller });
  const claim = gone ? [status, F("", "Payer claim #", "MX260701-00418", { none: true, html: nums }), F("", "Sent", "Jul 1, 2026 via DentalXChange", { none: true }), biller] : [status, biller];
  const coverage = (v) => (v === "None" ? [] : [F("5", "Other policyholder", "", { check: need("Needed when there's other coverage.") }), F("6", "Their date of birth", "", { check: optDate, html: nums }), F("7", "Their gender", "", { options: GENDER }),
    F("8", "Their subscriber ID", "", { check: need("Needed when there's other coverage.") }), F("9", "Their group #", ""), F("10", "Patient's relationship", "", { options: REL }),
    F("11", "Other carrier", "", { wide: true, ph: "Add carrier name and address", check: need("Needed when there's other coverage.") }), F("11a", "Other payer ID", "")]);
  const SPEC = ["1223G0001X · General practice", "1223E0200X · Endodontics", "1223P0221X · Pediatric dentistry", "1223X0400X · Orthodontics"];
  const f = {
    type: F("1", "Type of transaction", "Statement of actual services", { options: ["Statement of actual services", "Request for predetermination / preauthorization", "EPSDT / Title XIX"] }),
    freq: F("", "Frequency", "1 · Original", { options: ["1 · Original", "7 · Replacement", "8 · Void"], more: (v) => (/^[78]/.test(v) ? [F("", "Original payer claim #", "", { check: need("A replacement or void needs the payer's claim # for the original.") })] : []) }),
    otherCov: F("4", "Other coverage", "None", { options: ["None", "Dental", "Medical", "Dental and medical"], more: coverage }),
    missing: F("33", "Missing teeth", ["1", "16", "17", "32"], { options: TEETH, multi: true }),
    dxA: F("34a", "Diagnosis A", "K04.02", { html: (r) => `<span class="tabular-nums">${esc(r.value)}</span>${r.value === "K04.02" ? grey(" · irreversible pulpitis") : ""}` }),
    dxB: F("34a", "Diagnosis B", "K02.53", { html: (r) => `<span class="tabular-nums">${esc(r.value)}</span>${r.value === "K02.53" ? grey(" · decay into the pulp") : ""}` }),
    consent: F("36", "Patient consent", "Signature on file", { options: ["Signature on file", "Not signed"] }),
    place: F("38", "Place of treatment", "11 · Office", { options: ["11 · Office", "22 · Outpatient hospital", "21 · Inpatient hospital", "31 · Skilled nursing facility", "12 · Home"] }),
    ortho: F("40", "Orthodontics", "No", { options: YES_NO, more: (v) => (v === "Yes" ? [F("41", "Appliance placed", "", date("Add the date the appliance was placed.")), F("", "Total months", "", { check: need("Add the months of treatment in total.") }), F("42", "Months remaining", "", { check: need("Add the months of treatment left.") })] : []) }),
    prosth: F("43", "Prosthesis replaced", "No", { options: YES_NO, more: (v) => (v === "Yes" ? [F("44", "Prior placement", "", date("Add when the old one was placed."))] : []) }),
    accident: F("45", "Resulting from", "Not an accident", { options: ["Not an accident", "Occupational illness / injury", "Auto accident", "Other accident"],
      more: (v) => (v === "Not an accident" ? [] : [F("46", "Date of accident", "", date("Add the date of the accident.")), ...(v === "Auto accident" ? [F("47", "Auto accident state", "", { ph: "Add state, like CA", check: need("Add the state of the auto accident.") })] : [])]) })
  };
  const rare = [
    G("details", "Claim details", "1, 31a", [f.type, F("", "Claim #", "20417-0630", { none: true, html: nums }), f.freq, F("", "Referral #", "", { ph: "None" }), x.other,
      F("", "Created from", "3 completed procedures · Jun 30", { none: true }), ...(gone ? [F("", "Clearinghouse ID", "DXC-4471220118", { none: true, html: nums }), F("", "Filing days left", String(C4.filing), { none: true, html: nums })] : [])],
      () => f.type.value),
    G("other", "Other coverage", "4–11a", [f.otherCov], () => (f.otherCov.value === "None" ? "None" : `${f.otherCov.value} coverage`)),
    G("dx", "Missing teeth and diagnosis", "33–34a", [f.missing, F("34", "Code list qualifier", "AB · ICD-10-CM", { options: ["AB · ICD-10-CM"] }), f.dxA, f.dxB, F("34a", "Diagnosis C", "", { ph: "None" }), F("34a", "Diagnosis D", "", { ph: "None" })],
      () => `${f.missing.value.length} missing · ${[f.dxA, f.dxB].filter((d) => d.value).length} diagnosis codes`),
    G("sign", "Signatures", "36–37, 53–53a", [f.consent, F("37", "Benefits paid to", "This office", { options: ["This office", "The subscriber"] }), F("53", "Dentist signature", "Signed · on file", { options: ["Signed · on file", "Not signed"] }), F("53a", "Locum tenens", "No", { options: YES_NO })],
      () => (f.consent.value === "Signature on file" ? "On file" : f.consent.value)),
    G("tx", "Ortho, prosthesis and accident", "38–47", [f.place, F("39a", "Last SRP date", "", { ph: "None", check: optDate }), f.ortho, f.prosth, f.accident],
      () => [f.ortho.value === "Yes" && "Ortho", f.prosth.value === "Yes" && "Replacement", f.accident.value !== "Not an accident" && f.accident.value].filter(Boolean).join(", ") || "None apply"),
    G("people", "Plan and subscriber details", "3, 12–17", [F("3", "Payer address", "PO Box 40217, Dayton, OH 45401", { wide: true }), F("", "Plan", "MetLife PDP Plus"), F("", "Plan year", "Jan 1 – Dec 31, 2026", { none: true }),
      F("12", "Subscriber address", "1484 Laurel St, San Carlos, CA 94070", { wide: true }), F("14", "Subscriber gender", "Male", { options: GENDER }), F("17", "Employer", "Harbor Freight Logistics")], () => "Addresses, plan, employer"),
    G("prov", "Provider details", "48–58", [F("", "Bill as", "Practice", { options: ["Practice", "Treating dentist", "Another provider"] }), F("", "Billing specialty", SPEC[0], { options: SPEC }),
      F("48", "Billing address", "880 Bay Rd, Redwood City, CA 94063", { wide: true }), F("50", "Billing license", "", { ph: "Not needed for a practice" }), F("52", "Billing phone", "(650) 555-0110", { html: nums }),
      F("52a", "Other billing ID", "", { ph: "None" }), F("56a", "Treating specialty", SPEC[0], { options: SPEC }), F("56", "Treatment location", "880 Bay Rd, Redwood City, CA 94063", { wide: true }),
      F("57", "Treating phone", "(650) 555-0110", { html: nums }), F("58", "Other treating ID", "", { ph: "None" })],
      () => "Addresses, phones, specialty, IDs")];
  return { x, claim, rare, other: x.other,
    /* the same boxes in two orders: pairs for the sheet (read across), lists for small tables (read down) */
    covPairs: [x.plan, x.payerId, x.sub, x.subId, x.subDob, x.group, x.rel, x.patId], covList: [x.plan, x.payerId, x.group, x.sub, x.subDob, x.subId, x.rel, x.patId],
    provPairs: [x.bill, x.billNpi, x.treat, x.treatNpi, x.tin, x.lic], provList: [x.bill, x.billNpi, x.tin, x.treat, x.treatNpi, x.lic],
    payer: [x.remarks, x.encl, x.preauth],
    lines: ADJ.map((l, i) => ({ date: "06/30/2026", tooth: miss && i === 1 ? "" : l.tooth, code: l.code, diag: [l.code === "D3330" ? "A" : "B"], desc: l.desc, fee: l.charged })) };
}

/* ---- the three layouts ---- */
const everyBox = () => `<span class="inline-flex items-center gap-2 text-[13px] text-gray-500" data-ada-cols data-tip="Show boxes 25, 26, 29a, 29b and modifiers">Every box${sw(false, "Show every box on the lines")}</span>`;
const linesSec = (m, ro, add, under, note) => psec(`<span${chg4(note)}>Record of services</span><span class="font-normal text-gray-400 tabular-nums">24–32</span><span data-ada-count class="${R.count}">${m.lines.length}</span>`,
  `${adaLines(m, ro, add)}${under ? `<div class="mt-3">${under}</div>` : ""}`, { actions: everyBox() });
function adaMore(body, note) {
  return `<section class="${R.psec} !py-0" data-ada-more-sec${chg4(note)}><button type="button" data-ada-more aria-expanded="false" class="-mx-5 px-5 flex w-[calc(100%+2.5rem)] items-center gap-2 h-11 text-start cursor-pointer hover:bg-gray-50 focus-visible:outline-hidden focus-visible:bg-gray-50">
    ${I("chevron-right", "size-4 shrink-0 text-gray-400 transition-transform")}<span class="${R.groupTitle} shrink-0">More claim details</span><span data-ada-more-flag hidden class="inline-flex shrink-0" data-tip="A box in here needs a fix">${I("circle-alert", "size-3.5 text-orange-500")}</span>
    <span class="text-[13px] text-gray-500 truncate">Other coverage, missing teeth, diagnosis codes, signatures, ortho, addresses</span></button><div data-ada-more-body hidden class="pb-4">${body}</div></section>`;
}
const up = (n, items) => `<div class="grid gap-4 items-start" style="grid-template-columns:repeat(${n},minmax(0,1fr))">${items.join("")}</div>`;
const upCols = (cols) => `<div class="grid gap-4 items-start" style="grid-template-columns:repeat(${cols.length},minmax(0,1fr))">${cols.map((c) => `<div class="space-y-4 min-w-0">${c.join("")}</div>`).join("")}</div>`;
const ADA_LAYOUTS = {
  sheet: (m, ro, add, lead) => psec("", `<div${chg4(lead || "One claim sheet, like today's claim flyout on the data grid: two boxes to a row (label, value, label, value), a grey band per group, and only the boxes most claims need. Each label keeps its ADA box number in grey")}>${adaQuad("Claim, coverage and providers", [G("claim", "Claim", "", m.claim), G("cov", "Coverage", "3–23", m.covPairs), G("prov", "Providers", "48–55", m.provPairs)], ro)}</div>`)
    + linesSec(m, ro, add, adaQuad("For the payer", [G("payer", "For the payer", "2, 35, 39", m.payer)], ro), "Record of services shows only the claim's lines and one row to add a line (no blank rows); 31a and 32 are one Total fee row. Area, tooth system, diagnosis pointer, quantity and modifiers join with Every box")
    + adaMore(adaQuad("More claim details", m.rare, ro), "Boxes most claims leave alone (claim type and frequency, other coverage, missing teeth, diagnosis codes, signatures, ortho, prosthesis, accident, addresses and extra IDs) open with More claim details, in the same sheet shape; no tooth diagram"),
  boxes: (m, ro, add, lead) => {
    const T = (gp) => adaTable(gp, ro, { labelW: 128, short: true }), W = (gp) => adaTable(gp, ro, { labelW: 176 });
    return psec("", `<div class="space-y-4"${chg4(lead || "Box groups: one small table per ADA group, three across, each with its group name and box numbers in the grey header band")}>${up(3, [T(G("claim", "Claim", "", m.claim)), T(G("plan", "Dental plan", "3, 16", [m.x.plan, m.x.payerId, m.x.group])), T(G("sub", "Subscriber", "12–15", [m.x.sub, m.x.subDob, m.x.subId]))])}
        ${up(3, [T(G("pat", "Patient", "18–23", [m.x.rel, m.x.patId])), T(G("bill", "Billing dentist", "48–51", [m.x.bill, m.x.billNpi, m.x.tin])), T(G("treat", "Treating dentist", "53–55", [m.x.treat, m.x.treatNpi, m.x.lic]))])}</div>`)
      + linesSec(m, ro, add, W(G("payer", "For the payer", "2, 35, 39", m.payer)), "Record of services shows only the claim's lines and one row to add a line; Every box adds the rare line boxes")
      + adaMore(`<div class="space-y-4">${upCols([[W(m.rare[0]), W(m.rare[1]), W(m.rare[3])], [W(m.rare[2]), W(m.rare[4])]])}${up(2, [W(m.rare[5]), W(m.rare[6])])}</div>`, "The rare groups open with More claim details as the same small tables");
  },
  lines: (m, ro, add, lead) => linesSec(m, ro, add, adaTable(G("payer", "For the payer", "2, 35, 39", m.payer), ro), lead || "Lines first: the record of services is what billers fix most, so it opens the panel")
    + psec("", `<div${chg4("Coverage on the left; the claim's status, biller and both dentists on the right, two tables of eight boxes")}>${up(2, [adaTable(G("cov", "Coverage", "3–23", m.covList), ro), adaTable(G("cp", "Claim and providers", "48–55", [...m.claim, ...m.provList]), ro)])}</div>`)
    + psec("", `<div${chg4("Each rare group is one row with its gist; click it to open its boxes right there")}>${adaFold(m.rare, ro)}</div>`)
};
const adaBody = (state, kind = adaTry()) => ADA_LAYOUTS[kind](adaModel(state), state === ADA_STATES[2], state !== ADA_STATES[2]);

/* ---- wiring: band rows, merged cells and the orange icons after each render of a table; the toggles ---- */
function adaDecorate(g, after) {
  const draw = g.render.bind(g), band = g.o.ada && g.o.ada.band;
  g.render = () => { draw();
    if (band) { const tr = g.root.querySelector("thead tr"); if (tr) { const ths = [...tr.children]; ths[0].colSpan = g.cols.length; ths[0].innerHTML = `<span class="block truncate">${band}</span>`; ths.slice(1).forEach((t) => t.remove()); } }
    g.root.querySelectorAll("tbody tr.g-row").forEach((tr, i) => { const r = g.visible[i], tds = [...tr.children]; if (!r) return;
      if (r.band) { tr.dataset.adaBand = ""; const td = tds[0]; td.colSpan = tds.length; td.className = cx(R.gridHead, g.fit("th"), "!border-e-0"); td.dataset.active = "0"; td.innerHTML = `<span class="block truncate">${r.band}</span>`; tds.slice(1).forEach((t) => t.remove()); }
      else if (r.span && tds.length === 4) { tds[1].colSpan = 3; tds[2].remove(); tds[3].remove(); }
      else if (r.grp) { tr.classList.add("cursor-pointer"); tr.dataset.adaGrp = ""; }
      else if (r.kind === "add" && tds.length > 2) { tds[1].colSpan = tds.length - 1; tds.slice(2).forEach((t) => t.remove()); } });
    g.root.querySelectorAll("td[data-r]").forEach((td) => {
      const c = g.cols[+td.dataset.c], r = g.visible[+td.dataset.r], why = c && c.flag && r && c.flag(r);
      if (!why || td.querySelector('[data-role="edit"],[data-role="pick-search"]')) return;
      const mark = `<span data-ada-flag data-tip="${esc(why)}" aria-label="${esc(why)}" role="img" class="inline-flex shrink-0">${I("circle-alert", "size-3.5 text-orange-500")}</span>`;
      const box = td.firstElementChild;
      if (box && box.matches("div.flex")) box.firstElementChild.insertAdjacentHTML("afterend", mark);
      else td.innerHTML = `<div class="flex items-center gap-1.5 min-w-0 ${c.num ? "justify-end" : ""}"><span class="min-w-0 truncate">${td.innerHTML}</span>${mark}</div>`;
    });
    icons(); after(); };
  // a band row isn't a cell: clicking it doesn't select; a rare group's row opens and closes
  g.root.addEventListener("mousedown", (e) => { if (e.target.closest("tr[data-ada-band],tr[data-ada-grp]")) { e.stopPropagation(); e.preventDefault(); } }, true);
  if (g.o.ada && g.o.ada.open) g.root.addEventListener("click", (e) => { const tr = e.target.closest("tbody tr.g-row"); if (!tr) return; const r = g.visible[[...tr.parentElement.children].indexOf(tr)]; if (r && r.grp) adaFoldToggle(g, r); });
  g.render();
}
const adaMarkTip = (n) => `${n} ${n === 1 ? "box needs" : "boxes need"} a fix before MetLife will pay. You can still send it.`;
function adaWire(aside) {
  mountSheets(aside);
  const grids = () => [...aside.querySelectorAll("[data-sheet-host]")].map((h) => h._grid).filter(Boolean);
  const refresh = () => {
    const mark = aside.querySelector("[data-ada-mark]"), n = aside.querySelectorAll("[data-ada-flag]").length;
    if (mark) { mark.hidden = !n; mark.firstElementChild.dataset.tip = adaMarkTip(n); }
    aside.querySelectorAll("[data-ada-more-sec]").forEach((s) => { s.querySelector("[data-ada-more-flag]").hidden = !s.querySelector("[data-ada-more-body] [data-ada-flag]"); });
  };
  grids().filter((g) => !g._ada).forEach((g) => { g._ada = true; adaDecorate(g, refresh); });
  refresh();
  if (aside._adaWired) return; aside._adaWired = true;
  // One form, one selected box: moving into a table clears the selection left in the others
  aside.addEventListener("focusin", (e) => grids().forEach((g) => { if (g.active && !g.editing && !g.root.contains(e.target)) { g.active = null; g.render(); } }));
  aside.addEventListener("ada-change", (e) => { if (e.detail.f.box !== "31a") return; grids().filter((g) => g.o.ada && g.o.ada.lines).forEach((g) => { g.o.foot = g.o.ada.foot(g.data, g.o.columns); g.render(); }); });
  aside.addEventListener("click", (e) => {
    const more = e.target.closest("[data-ada-more]");
    if (more) { const open = more.getAttribute("aria-expanded") !== "true", body = more.parentElement.querySelector("[data-ada-more-body]");
      more.setAttribute("aria-expanded", open); body.hidden = !open; const chev = more.querySelector("svg"); if (chev) chev.style.transform = open ? "rotate(90deg)" : "";
      if (open) Motion.play(body, "asha-fade"); return; }
    const sw = e.target.closest("[data-ada-cols] [role=switch]");
    if (sw) { const on = sw.getAttribute("aria-checked") !== "true", g = grids().find((x) => x.o.ada && x.o.ada.lines && sw.closest("section").contains(x.root)); if (!g) return;
      g.o.columns = on ? g.o.ada.all : g.o.ada.base; g.o.foot = g.o.ada.foot(g.data, g.o.columns); g.active = null; g.render(); }
  });
}

/* ---- the EOB, laid out like a dental EOB (the ADA's model EOB statement): payment and payer, claim and patient,
 * the services the payer adjudicated, what went toward the plan's limits, and what each remark code means ---- */
const REMARKS = { "CO-45": "Charge exceeds the fee schedule. The office writes this off.", "PR-2": "Coinsurance. The patient pays this.",
  "N130": "Buildups and crowns are major services on this plan, paid at 50%." };
const EOB_PCT = { D3330: 80, D2950: 50, D2740: 50 };
function adaEobBody() {
  const L = ADJ.map((l) => ({ id: `eob${l.line}`, ...l, ded: 0, pct: EOB_PCT[l.code], codes: ["CO-45", "PR-2", ...(EOB_PCT[l.code] === 50 ? ["N130"] : [])] }));
  const N = (box, label, value, html) => F(box, label, value, { none: true, html });
  const tbl = (key, title, fields) => adaTable(G(key, title, "", fields), true, { labelW: 144 });
  const m = (k) => (r) => `<span class="tabular-nums">${money(r[k])}</span>`;
  const services = sheetTable({ preset: "form", title: "Services", rows: L, peek: (r) => peekCard(`${r.code} · ${esc(r.desc)}`, [["Tooth", `#${r.tooth}`], ["Covered at", `${r.pct}%`], ["Deductible", money(r.ded)], ...r.codes.map((c) => [c, esc(REMARKS[c])])]),
    columns: [{ key: "date", label: "Date", w: 64, render: () => `<span class="tabular-nums">${fmtDate(C4.svc)}</span>` }, { key: "code", label: "Code", w: 68, render: (r) => `<span class="tabular-nums">${r.code}</span>` },
      { key: "tooth", label: "Tooth", w: 60, render: (r) => `<span class="tabular-nums">#${r.tooth}</span>` },
      { key: "charged", label: MONEY_LABEL.billed, w: 88, num: true, render: m("charged") }, { key: "allowed", label: MONEY_LABEL.allowed, w: 88, num: true, render: m("allowed") },
      { key: "wo", label: MONEY_LABEL.writeOff, w: 88, num: true, render: m("wo") }, { key: "ded", label: "Deductible", w: 92, num: true, render: (r) => `<span class="tabular-nums ${r.ded ? "" : "text-gray-400"}">${money(r.ded)}</span>` },
      { key: "pct", label: "Plan %", w: 68, num: true, render: (r) => `<span class="tabular-nums">${r.pct}%</span>` }, { key: "paid", label: MONEY_LABEL.insPaid, w: 88, num: true, render: m("paid") },
      { key: "pt", label: MONEY_LABEL.ptResp, w: 88, num: true, render: m("pt") }, { key: "codes", label: "Remarks", w: 140, grow: true, render: (r) => `<span class="tabular-nums">${r.codes.join(", ")}</span>` }],
    foot: ["Total", "", "", ...["charged", "allowed", "wo", "ded"].map((k) => money(cSum(L, k))), "", money(cSum(L, "paid")), money(cSum(L, "pt")), ""] });
  const legend = sheetTable({ preset: "panel", title: "Remark codes", rows: Object.entries(REMARKS).map(([code, text]) => ({ id: code, code, text })),
    columns: [{ key: "code", label: "Remark code", w: 116, render: (r) => `<span class="tabular-nums">${r.code}</span>` }, { key: "text", label: "What it means", w: 200, grow: true }] });
  return psec("", `<div${chg4("The EOB tab is laid out like a dental EOB: how MetLife paid, who it paid, and the claim and patient it paid for, each a small table with its name in the grey band. The status is the first line of the payment table")}>${up(3, [
      tbl("pay", "Payment", [N("", "Status", "Posted", () => v4cStatus("Posted", "on", "Aug 15")), N("", "Check #", "004418820", nums), N("", "Method", "Paper check"), N("", "Paid on", "Aug 12, 2026"), N("", "Check amount", "1310.50", (r) => `<span class="tabular-nums">${money(1310.5)}</span>`),
        N("", "Bank match", "Matched · Aug 13 deposit"), F("", "Source", "Scanned Aug 14", { none: true, peek: () => peekCard("Source EOB", [["Received", "Aug 14, 2026 · paper"], ["Read by", "Asha"], ["Confidence", "98%"]], "View source EOB opens the scan.") })]),
      tbl("payer", "Payer and provider", [N("", "Payer", "MetLife Dental"), N("", "Payer ID", "64012", nums), N("", "Payee", "Bayview Family Dental"), N("", "Payee NPI", "1679542013", nums), N("", "Tax ID", "94-3318402", nums), N("", "Dentist", "Dr. Ethan Brooks")]),
      tbl("claim", "Claim and patient", [N("", "Payer claim #", "MX260701-00418", nums), N("", "Claim #", "20417-0630", nums), N("", "Patient", "Liam Carter"), N("", "Date of birth", "11/02/1975", nums), N("", "Subscriber ID", "XK20417793", nums),
        N("", "Group #", "0081142", nums), N("", "Processed as", "Primary"), N("", "Reviewed by", "Auto-adjudicated")])])}</div>`)
    + psec(`<span${chg4("The adjudication moved here from the Claim tab and reads like the EOB's line table: billed, allowed, write-off, deductible, plan %, insurance paid, patient responsibility and remark codes, with totals. Hover a line for what its remark codes mean")}>Services</span>`, services, { count: L.length, actions: button("View source EOB", { v: "white", s: "xs", icon: "file-search" }) })
    + psec("", `<div class="grid gap-4 items-start" style="grid-template-columns:minmax(0,1fr) minmax(0,2fr)"${chg4("Under the lines, as on an EOB: what the claim used of the plan's limits, and what each remark code means")}>${[
      tbl("limits", "Applied to the plan", [N("", "Deductible", "0", () => `<span class="tabular-nums">${money(0)}</span>`), N("", "Annual maximum", "1310.50", () => `<span class="tabular-nums">${money(1310.5)}</span>`),
        N("", "Ortho maximum", "0", () => `<span class="tabular-nums">${money(0)}</span>`), N("", "Out-of-pocket limit", "None on this plan"), N("", "Other carrier paid", "0", () => `<span class="tabular-nums">${money(0)}</span>`),
        N("", "Patient owes", "797.50", () => `<span class="tabular-nums">${money(cSum(L, "pt"))}</span>`)]), legend].join("")}</div>`);
}

/* The sent claim panel's tabs: Claim is the claim as sent, editable, in the recommended layout; EOB the adjudication */
V4C_ADA = { claim: (lead) => ADA_LAYOUTS[adaTry()](adaModel(ADA_STATES[0], true), false, false, lead), eob: adaEobBody, wire: adaWire };

const DRAFT_ACTIONS = (miss) => [
  { label: "Claim", items: [{ icon: "eye", label: "Preview claim", hint: "The ADA form as MetLife will get it" }, { icon: "shield-check", label: "Check eligibility", hint: "Ask MetLife what's covered today" },
    { icon: "paperclip", label: "Attach x-rays or a narrative", hint: "What MetLife asks for with a crown or root canal" },
    { icon: "sparkles", label: "Check for denials", hint: "Asha reads the form for common denial reasons", suggest: miss ? "Three boxes are empty or look wrong" : "" },
    { icon: "user-round", label: "Assign biller", hint: "Who follows this claim up" }, { icon: "pause", label: "Hold claim", hint: "Keep it out of tonight's batch" }] },
  { label: "Lines", items: [{ icon: "list-plus", label: "Add completed procedure", hint: "Pull in another procedure from the ledger" }, { icon: "split", label: "Split claim", hint: "Send some lines on a second claim" }] },
  { label: "", items: [{ icon: "trash-2", label: "Delete claim", danger: true }] }];

defineBlock({
  cat: "claims", id: "claims-ada-form", title: "Claim form (ADA)",
  note: "The claim panel built from the ADA claim form's boxes, most used first: status and biller, the plan, subscriber and patient, both dentists, then the record of services (only its real lines and one row to add a line). Every box is a cell with its ADA number in grey; Enter saves and moves down. The boxes most claims leave alone (claim type, other coverage, missing teeth, diagnosis codes, signatures, ortho, prosthesis, accident, addresses) open with More claim details; the rare line boxes with Every box. A box that's empty or wrong has the orange icon with the reason on hover; Send claim never waits for it. Three layouts (V4_OPTS.ada): sheet (recommended, today's claim flyout on the data grid), boxes, lines.",
  where: "Revenue Cycle › Claims › claim",
  states: ADA_STATES,
  canvas: "bare",
  html: (state) => {
    const ro = state === ADA_STATES[2], miss = state === ADA_STATES[1], p = DATA.patient("p2");
    const rows = ro ? CLAIMS.filter((c) => ["paid", "partial"].includes(c.status)) : [{ ...C4, status: miss ? "review" : "ready", sent: "", paid: 0 }, ...CLAIMS.filter((c) => ["ready", "review"].includes(c.status))];
    const queue = ro ? "Adjudicated" : "To be sent";
    return `<div class="flex min-h-[720px]">${cFaded(claimsSlice(rows, "c4", ro ? 3 : 1))}<div class="flex shrink-0"${chg4("Second pass: the claim panel puts what billers use on most claims first, as cells you type into with each ADA box number in grey; the rare boxes wait behind More claim details instead of a tooth diagram and blank rows up front")}>${sheetPanel({
      flush: true, w: 1000, cls: "relative shrink-0 !h-auto self-stretch", lead: avatar(p.name, { size: 9 }),
      title: `<a class="hover:underline underline-offset-4" href="#">${p.name}</a>`,
      subtitle: `MetLife · Primary · Service ${fmtDate(C4.svc)} · ${ro ? `Sent ${fmtDate(C4.sent)}` : `${C4.filing} filing days left`}`,
      marks: ro ? recordMark("lock", `Sent to MetLife ${fmtDate(C4.sent)}, so the form is read-only. Correct the claim to change it.`) : `<span data-ada-mark${miss ? "" : " hidden"}>${recordMark("circle-alert", adaMarkTip(3), true)}</span>`,
      actions: `<span class="me-1 text-[13px] text-gray-500 tabular-nums whitespace-nowrap">1 of ${rows.length} in ${queue}</span>${iconButton("chevron-up", "Previous claim", { s: "iconSm" })}${iconButton("chevron-down", "Next claim", { s: "iconSm" })}${iconButton("external-link", "Open in Claims", { s: "iconSm" })}`,
      body: adaBody(state),
      footer: `${actionsMenu(ro ? CLAIM_ACTIONS : DRAFT_ACTIONS(miss), { open: V4_OPTS.open })}<span class="grow"></span>${ro ? button("Correct claim", { v: "solid", s: "sm", icon: "pencil-line" }) : button("Send claim", { v: "solid", s: "sm", icon: "send" })}`
    })}</div></div>`;
  },
  mount: (el) => adaWire(el.querySelector("aside"))
});
})();


})();
