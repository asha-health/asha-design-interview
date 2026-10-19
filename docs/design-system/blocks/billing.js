/* Billing blocks. Labels from routes/practice/charts/components/Billing (BillingTab, CollectPaymentSheet,
 * NewPaymentPlanDialog, FamilyBalanceBreakdownModal), routes/practice/ledger, components/Specific/CheckoutV2 and
 * routes/practice/statements (INVENTORY.md §5). Every total is computed from the rows so the money always adds up. */
(() => {

/* ---------- money in cents, so sums never drift ---------- */
const add = (...v) => Math.round(v.reduce((a, b) => a + Math.round((b || 0) * 100), 0)) / 100;
const sum = (rows, k) => add(...rows.map((r) => (typeof k === "function" ? k(r) : r[k]) || 0));
const daysAgo = (iso) => Math.round((Date.parse(TODAY) - Date.parse(iso)) / 864e5);

/* ---------- the Walker family ledger (Ethan is the guarantor; Mia and Chloe are on his account) ----------
 * kind: proc (charge) · claim (no balance effect) · pay (payment) · adj (write-off / adjustment)
 * rem = what is still open on a charge (or an unapplied credit); ins = insurance still expected on it. */
const LEDGER = [
  { id: "l1", date: "2026-02-25", pt: "p10", kind: "proc", code: "D0120", desc: "Periodic exam", prov: "Dr. Patel", amt: 65, rem: 0 },
  { id: "l2", date: "2026-02-25", pt: "p10", kind: "proc", code: "D1110", desc: "Adult cleaning", prov: "Sofia R.", amt: 110, rem: 0 },
  { id: "l3", date: "2026-02-25", pt: "p10", kind: "proc", code: "D0274", desc: "Bitewings, four films", prov: "Sofia R.", amt: 78, rem: 0 },
  { id: "l4", date: "2026-02-26", pt: "p10", kind: "claim", code: "Claim", desc: "Delta Dental · 3 procedures", billed: 253 },
  { id: "l5", date: "2026-03-16", pt: "p10", kind: "pay", code: "Ins Pay", desc: "Delta Dental · Check #88213", amt: -202.4 },
  { id: "l6", date: "2026-03-16", pt: "p10", kind: "adj", code: "Write-off", desc: "PPO write-off · Delta Dental", amt: -50.6 },
  { id: "l7", date: "2026-08-25", pt: "p10", kind: "proc", code: "D0150", desc: "Comprehensive exam", prov: "Dr. Patel", amt: 95, rem: 19 },
  { id: "l8", date: "2026-08-25", pt: "p10", kind: "proc", code: "D0210", desc: "Full mouth x-rays", prov: "Dr. Patel", amt: 145, rem: 29 },
  { id: "l9", date: "2026-08-26", pt: "p10", kind: "claim", code: "Claim", desc: "Delta Dental · 2 procedures", billed: 240 },
  { id: "l10", date: "2026-09-15", pt: "p10", kind: "pay", code: "Ins Pay", desc: "Delta Dental · EFT #5520917", amt: -192 },
  { id: "l11", date: "2026-09-18", pt: "p10", kind: "proc", code: "D2392", tooth: "19", surf: "MO", desc: "Composite, two surfaces, back tooth", prov: "Dr. Patel", amt: 235, rem: 188, ins: 188 },
  { id: "l12", date: "2026-09-18", pt: "p10", kind: "proc", code: "D2391", tooth: "20", surf: "O", desc: "Composite, one surface, back tooth", prov: "Dr. Patel", amt: 185, rem: 148, ins: 148 },
  { id: "l13", date: "2026-09-18", pt: "p10", kind: "pay", code: "Patient Payment", desc: "Visa ····4242 · Checkout", amt: -84 },
  { id: "l14", date: "2026-09-19", pt: "p10", kind: "claim", code: "Claim", desc: "Delta Dental · 2 procedures", billed: 420 }
];
const FAMILY_ONLY = [
  { id: "m1", date: "2026-09-02", pt: "p11", kind: "pay", code: "Patient Payment", desc: "Check #1127 · Held as unapplied credit", amt: -25, rem: -25 },
  { id: "c1", date: "2026-09-25", pt: "p12", kind: "proc", code: "D1120", desc: "Child cleaning", prov: "Jordan K.", amt: 80, rem: 80, ins: 80 }
];
/* Running balance, computed (claims don't move the balance) */
function ledgerRows(family) {
  const rows = family ? [...LEDGER, ...FAMILY_ONLY].sort((a, b) => a.date.localeCompare(b.date)) : LEDGER;
  let b = 0;
  return rows.map((r) => { if (r.kind !== "claim") b = add(b, r.amt); return { ...r, bal: b }; });
}
function balances(family) {
  const rows = ledgerRows(family);
  const balance = rows[rows.length - 1].bal;
  const credits = -sum(rows.filter((r) => r.rem < 0), "rem");
  const insEst = sum(rows, "ins");
  const open = rows.filter((r) => r.rem);
  const bucket = (lo, hi) => sum(open.filter((r) => daysAgo(r.date) >= lo && daysAgo(r.date) <= hi), "rem");
  return { balance, credits, insEst, ptEst: add(balance, -insEst), aging: [["0–30", bucket(0, 30)], ["31–60", bucket(31, 60)], ["61–90", bucket(61, 90)], ["91+", bucket(91, 9999)]] };
}

/* Dentrix-style entry-type text colours: the one place colour sits on ledger text */
const ENTRY_TONE = { proc: "text-gray-800", claim: "text-blue-700 font-medium", pay: "text-emerald-700 font-medium", adj: "text-red-700 font-medium" };
const entryLabel = (r) => `<span class="tabular-nums ${ENTRY_TONE[r.kind]}">${esc(r.code)}</span>`;
const dim = (s = "—") => `<span class="text-gray-400">${s}</span>`;

/* v2: Tooth and Surf in one column, a narrower Code, and claim rows keep their billed amount in the description:
 * claims don't move the balance, so Amount only holds what changes it. */
const v2LedgerCols = (family) => [
  { key: "date", label: "Date", icon: "calendar", w: 96, kind: "date", render: (r) => `<span class="tabular-nums">${fmtDate(r.date)}</span>` },
  ...(family ? [{ key: "pt", label: "Patient", icon: "user", w: 92, kind: "text", value: (r) => DATA.patient(r.pt).name.split(" ")[0], render: (r) => esc(DATA.patient(r.pt).name.split(" ")[0]) }] : []),
  { key: "code", label: `<span${chg("Rows have no checkboxes: Print and Export are whole-ledger actions in the ⋯ menu. With Tooth merged, the Balance column fits without scrolling")}>Code</span>`, icon: "hash", w: 136, open: true, kind: "text", value: (r) => r.code, render: entryLabel },
  { key: "tooth", label: `<span${chg("Tooth and surface share one column (\"#19 MO\"), as at checkout; the two columns were empty on 10 of 14 rows")}>Tooth</span>`, w: 86, kind: "text", value: (r) => (r.tooth ? `#${r.tooth} ${r.surf || ""}` : ""), render: (r) => (r.tooth ? `<span class="tabular-nums">#${r.tooth} ${esc(r.surf || "")}</span>` : "") },
  { key: "desc", label: "Description", icon: "text", w: family ? 190 : 300, kind: "text", render: (r) => (r.kind === "claim" ? `<span title="${esc(r.desc)} · billed ${money(r.billed)}">${esc(r.desc)} <span class="text-gray-400 tabular-nums"${chg("A claim's billed amount moves into its description and Amount stays empty, because sending a claim doesn't change the balance")}>· billed ${money(r.billed)}</span></span>` : esc(r.desc)) },
  { key: "prov", label: "Provider", icon: "user-round", w: 124, kind: "text", value: (r) => r.prov || "", render: (r) => esc(r.prov || "") },
  { key: "amt", label: "Amount", w: 104, num: true, kind: "money", value: (r) => r.amt ?? 0, render: (r) => (r.kind === "claim" ? "" : money(r.amt)) },
  { key: "rem", label: `<span${chg("The totals row sums Remaining only and says \"14 entries\"; Amount's sum just repeated the balance")}>Remaining</span>`, w: 121, num: true, kind: "money", value: (r) => r.rem ?? "", render: (r) => (r.rem == null ? "" : r.rem === 0 ? dim("$0.00") : money(r.rem)) },
  { key: "bal", label: "Balance", w: 104, num: true, kind: "money", render: (r) => `<span class="font-medium">${money(r.bal)}</span>` }
];
/* v4: no patchy columns. Tooth folds into the description (#19 MO before the words), By names who did each entry (the
 * provider on a charge, a cell you change; who took a payment or posted a write-off; Asha for a claim she sent), a
 * claim's billed amount sits in Amount in grey (it doesn't move the balance), and Remaining shows a grey $0.00 on what's
 * fully applied. Every row has a value in every column. */
const V4B_BY = { l4: "Asha", l5: "Maria L.", l6: "Maria L.", l9: "Asha", l10: "Maria L.", l13: "Nina F.", l14: "Asha", m1: "Nina F." };
const v4bBy = (r) => r.prov || V4B_BY[r.id] || "Nina F.";
/* Most important first: the description shows its first part ("Delta Dental", "Visa ····4242"); the rest (the check or
 * EFT number, where it was taken, how many procedures a claim holds) and the entry's other facts open on hover */
const v4bToothDesc = (r) => `${r.tooth ? `<span class="tabular-nums text-gray-500 me-1.5">#${esc(r.tooth)}${r.surf ? ` ${esc(r.surf)}` : ""}</span>` : ""}${esc(r.desc.split(" · ")[0])}`;
const v4bLedgerPeek = (r) => { const parts = r.desc.split(" · ");
  return peekCard(`${esc(r.code)} · ${fmtDateY(r.date)}`, [["Patient", esc(DATA.patient(r.pt).name)], ["Tooth", r.tooth ? `#${esc(r.tooth)}${r.surf ? ` ${esc(r.surf)}` : ""}` : ""], ["Description", esc(parts[0])], ["Details", esc(parts.slice(1).join(", "))],
    [r.kind === "proc" ? "Provider" : "By", esc(v4bBy(r))], [r.kind === "claim" ? "Billed" : "Amount", `<span class="tabular-nums">${money(r.kind === "claim" ? r.billed : r.amt)}</span>`],
    ["Ins. est.", r.ins ? `<span class="tabular-nums">${money(r.ins)}</span>` : ""], ["Balance after", `<span class="tabular-nums">${money(r.bal)}</span>`]],
    r.kind === "claim" ? "A claim doesn't change the balance. Click the code to open it." : "Click the code to open the entry."); };
const v4bLedgerCols = (family) => [
  { key: "date", label: "Date", icon: "calendar", w: 84, kind: "date", render: (r) => `<span class="tabular-nums">${fmtDate(r.date)}</span>` },
  ...(family ? [{ key: "pt", label: "Patient", icon: "user", w: 84, kind: "text", value: (r) => DATA.patient(r.pt).name.split(" ")[0], render: (r) => esc(DATA.patient(r.pt).name.split(" ")[0]) }] : []),
  { key: "code", label: "Code", icon: "hash", w: 120, open: true, kind: "text", value: (r) => r.code, render: entryLabel },
  { key: "desc", label: `<span${chg4("Tooth and surface are the start of the description (\"#19 MO Composite…\"): the Tooth column was empty on 12 of 14 rows")}><span${chg4("A description shows its first part (Delta Dental, Visa ····4242, Check #1127); the check or EFT number, where a payment was taken and the rest of the entry open on hover in a card beside the row, instead of strung along the line.")}>Description</span></span>`, icon: "text", w: 160, grow: true, kind: "text", value: (r) => `${r.tooth ? `#${r.tooth} ${r.surf || ""} ` : ""}${r.desc}`, render: (r) => v4bToothDesc(r) },
  { key: "prov", label: `<span${chg4("Provider became By, so no row is blank: the provider on a charge (a cell you change, click it or type to search), who took a payment or posted a write-off, and Asha on the claims she sent")}>By</span>`, icon: "user-round", w: 112, kind: "text", value: v4bBy,
    edit: (r) => (r.kind === "proc" ? "select" : null), options: () => V4B_PROVIDERS(), render: (r) => esc(v4bBy(r)) },
  { key: "amt", label: `<span${chg4("A claim's billed amount is back in Amount, in grey because sending a claim doesn't change the balance; it was a blank cell with the amount squeezed into the description")}>Amount</span>`, w: 96, num: true, kind: "money", value: (r) => (r.kind === "claim" ? r.billed : r.amt ?? 0),
    render: (r) => (r.kind === "claim" ? `<span class="text-gray-400" data-tip="Billed to Delta Dental. A claim doesn't change the balance.">${money(r.billed)}</span>` : money(r.amt)) },
  { key: "rem", label: `<span${chg4("Remaining shows a grey $0.00 on payments and write-offs that are fully applied, and a grey dash on claims, instead of blank cells")}>Remaining</span>`, w: 104, num: true, kind: "money", value: (r) => r.rem ?? 0,
    render: (r) => (r.kind === "claim" ? dim() : !r.rem ? dim("$0.00") : money(r.rem)) },
  { key: "bal", label: "Balance", w: 96, num: true, kind: "money", render: (r) => `<span class="font-medium">${money(r.bal)}</span>` }
];
const ledgerCols = (family) => V4 ? v4bLedgerCols(family) : V2 ? v2LedgerCols(family) : [
  { key: "date", label: "Date", icon: "calendar", w: family ? 96 : 104, kind: "date", render: (r) => `<span class="tabular-nums">${fmtDate(r.date)}</span>` },
  ...(family ? [{ key: "pt", label: "Patient", icon: "user", w: 92, kind: "text", value: (r) => DATA.patient(r.pt).name.split(" ")[0], render: (r) => esc(DATA.patient(r.pt).name.split(" ")[0]) }] : []),
  { key: "code", label: "Code", icon: "hash", w: 136, open: true, kind: "text", render: entryLabel },
  { key: "tooth", label: "Tooth", w: family ? 60 : 64, kind: "text", value: (r) => r.tooth || "", render: (r) => (r.tooth ? `<span class="tabular-nums">#${r.tooth}</span>` : "") },
  { key: "surf", label: "Surf", w: family ? 54 : 58, kind: "text", value: (r) => r.surf || "", render: (r) => esc(r.surf || "") },
  { key: "desc", label: "Description", icon: "text", w: family ? 186 : 250, kind: "text", render: (r) => esc(r.desc) },
  { key: "prov", label: "Provider", icon: "user-round", w: family ? 100 : 108, kind: "text", value: (r) => r.prov || "", render: (r) => esc(r.prov || "") },
  { key: "amt", label: "Amount", w: 112, num: true, kind: "money", value: (r) => r.amt ?? 0, render: (r) => (r.kind === "claim" ? `<span class="text-gray-400">${money(r.billed)}</span>` : money(r.amt)) },
  { key: "rem", label: "Remaining", w: 112, num: true, kind: "money", value: (r) => r.rem ?? "", render: (r) => (r.rem == null ? "" : r.rem === 0 ? dim("$0.00") : money(r.rem)) },
  { key: "bal", label: "Balance", w: 112, num: true, kind: "money", render: (r) => `<span class="font-medium">${money(r.bal)}</span>` }
];
const LEDGER_TYPES = [{ value: "proc", label: "Procedures" }, { value: "claim", label: "Claims" }, { value: "pay", label: "Payments" }, { value: "adj", label: "Adjustments" }];
function ledgerGrid(host, family, o = {}) {
  return new Grid(host, Object.assign({
    columns: ledgerCols(family), rows: [...ledgerRows(family)].reverse(), title: family ? "Family ledger" : "Ledger", searchPlaceholder: "Search ledger", maxHeight: 360, addColumn: false,
    calc: V2 ? { rem: "sum" } : { amt: "sum", rem: "sum" }, filters: [{ key: "kind", label: "Type", options: LEDGER_TYPES }],
    empty: { icon: "receipt", title: "No ledger entries yet", body: "Charges show up here as soon as a procedure is completed.", action: "Add procedure" },
    bulk: [{ label: "Print", icon: "printer" }, { label: "Export", icon: "download" }],
    onOpen: (r) => openLedgerSheet(r, family)
  }, V2 ? { selectable: false, noun: "entries" } : {}, V4 ? { sheet: true, peek: v4bLedgerPeek } : {}, o));
}

/* ---------- small local helpers (candidates for the kit) ---------- */
/* Left-aligned equation waterfall: [op, label, amount, {total}]. No rule of its own: "=" and weight mark the totals. */
const waterfall = (rows) => `<div class="inline-grid grid-cols-[12px_auto_auto] items-center gap-x-4 gap-y-1.5 text-sm">${rows.map(([op, label, amt, o = {}]) =>
  `<span class="text-center text-gray-400 tabular-nums ${o.total ? "pt-1" : ""}">${op}</span><span class="${o.total ? "pt-1 font-medium text-gray-800" : "text-gray-600"}">${label}</span><span class="text-end tabular-nums ${o.total ? "pt-1 font-semibold text-gray-800" : "text-gray-800"}">${money(amt)}</span>`).join("")}</div>`;
/* ADA-style key/value spreadsheet, boxed (R.tableBox) inside a panel section's padding */
const kvBox = (pairs) => `<div class="${R.tableBox}"><table class="table-fixed border-separate border-spacing-0 text-sm"><colgroup><col class="w-[38%]"><col></colgroup><tbody>${pairs.map(([k, v]) => `<tr><td class="h-9 px-3 border-b border-e border-gray-200/80 bg-gray-50/60 text-[13px] text-gray-500 whitespace-nowrap">${k}</td><td class="h-9 px-3 border-b border-gray-200/80 text-gray-800 truncate">${v}</td></tr>`).join("")}</tbody></table></div>`;
/* A value cell that opens something: the whole cell is the button, with a chevron (no blue link) */
const openCell = (text, label) => `<button type="button" class="group -mx-3 flex h-9 w-[calc(100%+1.5rem)] items-center justify-between gap-2 px-3 text-start hover:bg-gray-50 cursor-pointer" aria-label="${esc(label)}"><span class="truncate">${text}</span>${I("chevron-right", "size-4 shrink-0 text-gray-400 group-hover:text-gray-600")}</button>`;
/* Status on one line: a status button (dot, word, chevron) and a grey caption on the right */
const statusLine = (label, tone, caption = "") => `<section class="${R.psec} flex items-center justify-between gap-3 !py-3"><button type="button" class="${cx(R.btn, R.sm, R.white, "!ps-2.5")}" aria-haspopup="menu" aria-label="Change status"><span class="${cx(R.dot, TONE_DOT[tone])}"></span>${esc(label)}${I("chevron-down", "!text-gray-400")}</button><span class="text-[13px] text-gray-500 truncate">${caption}</span></section>`;
/* Edge-to-edge simple table cells: first gets ps-5, last pe-5 (inside bleed) */
const edge = (i, n) => (i === 0 ? "!ps-5" : i === n - 1 ? "!pe-5" : "");
const faded = (html, w = 1094) => `<div class="grow min-w-0 overflow-hidden opacity-50 pointer-events-none select-none" aria-hidden="true" inert><div style="width:${w}px">${html}</div></div>`;
/* A static, read-only copy of the ledger rows for the faded page behind a panel */
const staticLedger = (rows, hi) => `<table class="w-full table-fixed border-separate border-spacing-0 text-sm"><colgroup><col class="w-[104px]"><col class="w-[136px]"><col class="w-[64px]"><col class="w-[58px]"><col><col class="w-[108px]"><col class="w-[112px]"><col class="w-[112px]"><col class="w-[112px]"></colgroup><thead><tr>${["Date", "Code", "Tooth", "Surf", "Description", "Provider", "Amount", "Remaining", "Balance"].map((h, i) => `<th class="${R.gridHead} ${i > 5 ? "!text-end" : ""}">${h}</th>`).join("")}</tr></thead>
  <tbody>${rows.map((x) => `<tr class="${x.id === hi ? "bg-blue-50" : ""}"><td class="${R.gridCell}">${fmtDate(x.date)}</td><td class="${R.gridCell}">${entryLabel(x)}</td><td class="${R.gridCell}">${x.tooth ? "#" + x.tooth : ""}</td><td class="${R.gridCell}">${x.surf || ""}</td><td class="${R.gridCell}">${esc(x.desc)}</td><td class="${R.gridCell}">${esc(x.prov || "")}</td><td class="${R.gridCell} text-end tabular-nums">${x.kind === "claim" ? dim(money(x.billed)) : money(x.amt)}</td><td class="${R.gridCell} text-end tabular-nums">${x.rem == null ? "" : money(x.rem)}</td><td class="${R.gridCell} text-end tabular-nums">${money(x.bal)}</td></tr>`).join("")}</tbody></table>`;
const field = (label, control, { hint = "", cls = "" } = {}) => `<div class="space-y-1.5 ${cls}"><span class="${R.label} block">${label}</span>${control}${hint ? `<p class="${R.help}">${hint}</p>` : ""}</div>`;
const selectBtn = (value, { icon, sm = false, cls = "", attrs = "" } = {}) => `<button type="button" class="${sm ? R.selectSm : R.select} ${cls}" ${attrs}><span class="inline-flex items-center gap-2 truncate">${icon ? I(icon, "!text-gray-500") : ""}${value}</span>${I("chevrons-up-down")}</button>`;
const moneyInput = (value, label, { cls = "", sm = false } = {}) => `<div class="relative ${cls}"><span class="absolute inset-y-0 start-0 flex items-center ps-3 text-sm text-gray-400">$</span><input class="${sm ? R.inputSm : R.input} !ps-7 text-end tabular-nums" value="${value}" aria-label="${esc(label)}" /></div>`;
/* Dialog frame. flush: the body is psec() sections, whose top line is the header's divider (full width). */
const dialogFrame = ({ title, sub = "", body, footer, w = "w-[560px]", label, flush = false }) => `<div class="${R.dialog} ${w}" role="dialog" aria-label="${esc(label || title)}">
  <div class="flex items-start justify-between gap-4 px-5 pt-4 pb-3.5 ${flush ? "" : "border-b border-gray-200/80"}"><div><h3 class="text-base font-semibold text-gray-800">${title}</h3>${sub ? `<p class="${R.help} mt-0.5">${sub}</p>` : ""}</div>${iconButton("x", "Close", { s: "iconSm", cls: "-me-2 -mt-1" })}</div>
  <div class="${flush ? "" : "p-5"}">${body}</div>
  <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200/80">${footer}</div></div>`;
const spinner = (cls = "size-4") => I("loader-circle", `${cls} animate-spin text-gray-500`);

/* ---------- v2 (billing-claims): one money sheet for claim, EOB, posting, checkout and ledger money ----------
 * v2bcSheet({title, columns: [{label, w, num, flex, render(row)}], rows, foot}) returns a placeholder that mounts as the
 * kit Grid with the "form" preset: the ADA claim form's compact look (28px rows, cell lines, small grey header band),
 * the same as ClaimFormSpreadsheet density="compact". The `flex` column (the description) takes the spare width, so
 * number columns never truncate. claims.js uses the same function (window.v2bcSheet). Kit candidate: claimSheet(). */
const V2BC_SHEETS = new Map(); let v2bcSeq = 0;
const v2bcSheet = (spec) => { const id = `bc${++v2bcSeq}`; V2BC_SHEETS.set(id, spec); return `<div data-v2-sheet="${id}"></div>`; };
function v2bcMountSheets() {
  document.querySelectorAll("[data-v2-sheet]").forEach((host) => {
    const spec = V2BC_SHEETS.get(host.dataset.v2Sheet); if (host.firstElementChild || !spec) return;
    const columns = spec.columns.map((c, i) => ({ key: `c${i}`, kind: c.num ? "money" : "text", w: 72, ...c }));
    const g = new Grid(host, { preset: "form", title: spec.title || "Lines", columns, rows: spec.rows.map((r, i) => ({ id: i, ...r })), foot: spec.foot || null, maxHeight: 4000 });
    /* the totals label spans the empty cells after it, like a merged cell on the claim form */
    const draw = g.render.bind(g);
    g.render = () => { draw(); const tr = host.querySelector("tfoot tr"); if (!tr) return; const first = tr.firstElementChild;
      while (first.nextElementSibling && !first.nextElementSibling.textContent.trim()) { first.colSpan += 1; first.nextElementSibling.remove(); } };
    g.render();
    const flex = columns.findIndex((c) => c.flex), avail = host.clientWidth - 2;
    if (flex >= 0 && avail > 0) { columns[flex].w = Math.max(columns[flex].w, avail - columns.reduce((a, c, i) => a + (i === flex ? 0 : g.colWidth(c, i)), 0)); g.render(); }
  });
}
if (V2) { window.v2bcSheet = v2bcSheet; const watch = () => new MutationObserver(v2bcMountSheets).observe(document.body, { childList: true, subtree: true });
  document.body ? watch() : addEventListener("DOMContentLoaded", watch); }
/* An orange marker with 2–4 words whose detail shows on hover (the kit's body-level data-tip), for cells and footers
 * where alertMark's popover would be clipped. */
const v2bcFlag = (short, tip) => `<span class="inline-flex items-center gap-1 text-[13px] text-gray-500 whitespace-nowrap" tabindex="0" data-tip="${esc(tip)}">${I("circle-alert", "size-3.5 shrink-0 text-orange-500")}${short}</span>`;
window.v2bcFlag = v2bcFlag;
/* How someone pays, in one row: method, the reader when it's a terminal, the amount when the row owns it, and the
 * collect button inline (Send to terminal · Record · Charge). Checkout and Collect payment both use it. */
const V2BC_METHOD_ICON = { "Card terminal": "smartphone", "Saved card": "credit-card", "New card": "credit-card", Cash: "banknote", Check: "file-text" };
function v2bcMethodRow({ method = "Card terminal", reader = false, amount = null, waiting = false, due = 0, who = "the patient", extra = "" }) {
  if (waiting) return `<div class="flex items-center gap-3 min-h-9">${spinner()}<div class="grow min-w-0"><p class="text-sm font-medium text-gray-800">Waiting for card…</p><p class="${R.help}">${method} · ${money(due)} sent to the Front desk reader. Ask ${who} to tap, insert or swipe.</p></div>${button("Cancel payment", { v: "white", s: "sm" })}</div>`;
  const cta = method === "Cash" || method === "Check" ? ["Record", "check"] : method === "Card terminal" ? ["Send to terminal", "send"] : ["Charge", "credit-card"];
  return `<div class="flex items-center gap-2">${selectBtn(method, { icon: V2BC_METHOD_ICON[method], cls: "!w-44 shrink-0" })}
    ${reader && method === "Card terminal" ? selectBtn(`Front desk reader ${statusDot("Connected", "on", "!text-[13px] !text-gray-500 ms-1")}`, { cls: "!w-72 shrink-0" }) : ""}
    ${amount != null ? moneyInput(amount.toFixed(2), "Amount", { cls: "w-32 shrink-0" }) : ""}${extra}
    <span class="ms-auto"></span>${button(cta[0], { v: "solid", icon: cta[1], cls: "shrink-0" })}</div>`;
}

/* ---------- v4 (billing-claims): one record header, one Actions menu, tables you type into ----------
 * Everything here is read at render time behind V4, so v1 and v2 draw exactly as before. */
const v4bNum = (s) => { const n = parseFloat(String(s ?? "").replace(/[$,\s−]/g, "")); return isFinite(n) ? Math.round(n * 100) / 100 : null; };
const v4bMoneyCell = (r) => `<span class="tabular-nums">${v4bNum(r.value) == null ? esc(r.value) : money(v4bNum(r.value))}</span>`;
const V4B_PROVIDERS = () => DATA.providers.map((p) => p.short);
/* v4 chart: the layout the chart has today, a patient panel on the left and the open tab on the right. The panel is
 * the one patient header (alerts and the family balance as marks by the name), a few facts (one label, one value; the
 * detail on hover), Text and Schedule, and the chart tabs as a list. The right side is the tab's own header (title,
 * Collect payment as the one blue button, the tab's ⋯) over its sub-tabs. A ⋯ at the top right of a header is the
 * standard Actions list (dots: true). */
const V4B_PATIENT_ACTIONS = () => [
  { label: "Patient", items: [{ icon: "bell-plus", label: "Manage alerts", hint: "Add or clear medical and office alerts" }, { icon: "users", label: "Add family member", hint: "Link someone to the Walker family" },
    { icon: "send", label: "Send forms", hint: "Text a link to forms to fill in" }, { icon: "smartphone", label: "Invite to patient portal", hint: "Text a sign-up link so Ethan can pay online" }] },
  { label: "Chart", items: [{ icon: "printer", label: "Print chart", hint: "Facts, history and the tooth chart" }, { icon: "link", label: "Copy chart link", hint: "To paste in a message to a teammate" }, { icon: "history", label: "Chart history", hint: "Every change, who made it and when" }] },
  { label: "", items: [{ icon: "git-merge", label: "Merge duplicate patient", danger: true }, { icon: "archive", label: "Archive patient", danger: true }] }];
const V4B_BILLING_ACTIONS = () => [
  { label: "Billing", items: [{ icon: "plus", label: "Add procedure", hint: "Post a completed procedure to the ledger" },
    { icon: "file-plus", label: "Create claim", hint: "Bill Delta Dental for charges not on a claim", off: "Every insurance charge is already on a claim" },
    { icon: "hand-coins", label: "Post insurance payment", hint: "Enter what Delta Dental paid from an EOB" }, { icon: "receipt", label: "Generate statement", hint: "Text or email what the family owes" },
    { icon: "calculator", label: "Explain patient responsibility", hint: "How Asha got the $48.00 patient estimate" }, { icon: "calendar-range", label: "New payment plan", hint: "Split the balance into monthly payments" }] },
  { label: "Ledger", items: [{ icon: "printer", label: "Print ledger", hint: "This location or the whole family" }, { icon: "download", label: "Export ledger", hint: "A spreadsheet for your accountant" },
    { icon: "history", label: "Ledger history", hint: "Every edit, who made it and when" }] },
  { label: "", items: [{ icon: "gavel", label: "Send to collections", danger: true, off: "Nothing is more than 90 days overdue" }] }];
const V4B_CHART_NAV = [["Overview", "layout-dashboard"], ["Charting", "smile"], ["Family", "users"], ["Insurance", "shield-check"], ["Appts", "calendar"], ["Billing", "receipt"],
  ["TX plans", "clipboard-list"], ["Notes", "sticky-note"], ["Images", "image"], ["Forms", "file-text"], ["Docs", "folder"], ["Comms", "message-square"]];
function v4bPatientPanel(mark) {
  const p = DATA.patient("p10");
  const top = `<div class="flex items-center gap-0.5 px-3 pt-3">${button("Charts", { v: "quiet", s: "xs", icon: "chevron-left", cls: "!text-gray-500" })}<span class="grow"></span>
    ${iconButton("chevron-up", "Previous patient", { s: "iconSm" })}${iconButton("chevron-down", "Next patient", { s: "iconSm" })}<span${mark ? chg4("The patient's ⋯ is the standard Actions list (alerts, family, forms, portal, print), at the top of the patient panel; billing's own actions moved to the Billing tab's ⋯") : ""}>${actionsMenu(V4B_PATIENT_ACTIONS(), { dots: true, up: false, align: "end", open: V4_OPTS.open })}</span></div>`;
  const facts = [["Insurance", "Delta Dental PPO", "Verified Sep 24"], ["Next visit", "Oct 2 · 10:30 AM", "Periodic exam · Dr. Patel"], ["Family", "Guarantor of 3", "Walker family: Ethan pays for Mia and Chloe"], ["Phone", p.phone, "Mobile · texts OK"]];
  return `<aside class="w-[296px] shrink-0 border-e border-gray-200/80 bg-white" aria-label="Patient"${mark ? chg4("The chart is laid out as it is today: the patient panel on the left and the open tab on the right. The panel holds the one patient header, four facts, Text and Schedule and the chart's tabs; the bar of tabs across the top is gone") : ""}>
    ${top}${patientHeader({ name: p.name, sub: `${p.age} y · Chart #10482`, alerts: p.alerts, familyBalance: balances(true).balance, rule: false })}
    <div class="flex gap-1.5 px-5 pb-3.5">${button("Text", { v: "white", s: "sm", icon: "message-square", cls: "grow" })}${button("Schedule", { v: "white", s: "sm", icon: "calendar-plus", cls: "grow" })}</div>
    <dl class="grid grid-cols-[88px_1fr] gap-x-3 gap-y-2 px-5 pb-4 text-[13px]"${mark ? chg4("Facts are one label and one value each, in the panel; what they hide (verified when, the visit type, who pays) shows on hover") : ""}>${facts.map(([l, v, more]) => `<dt class="text-gray-500">${l}</dt><dd class="min-w-0 truncate text-gray-800 tabular-nums" data-tip="${esc(more)}">${v}</dd>`).join("")}</dl>
    <nav class="grid grid-cols-2 gap-x-1 gap-y-0.5 px-3 py-2.5 border-t border-gray-200/80" aria-label="Chart">${V4B_CHART_NAV.map(([l, ic]) => `<a class="${l === "Billing" ? R.navItemOn : R.navItem}"${l === "Billing" ? ' aria-current="page"' : ""}>${I(ic)}${l}</a>`).join("")}</nav></aside>`;
}
/* The Billing tab's own header on the right of the chart: the title, then Collect payment and the tab's ⋯ */
function v4bBillingHead(mark) {
  return `<div class="flex items-center gap-1.5 px-4 pt-3.5 pb-2"><div class="min-w-0 grow"><h1 class="text-lg font-semibold text-gray-800">Billing</h1><p class="text-[13px] text-gray-500 tabular-nums">Last visit Sep 18 · Bayview Family Dental</p></div>
    ${button("Collect payment", { v: "solid", s: "sm", icon: "credit-card" })}<span${mark ? chg4("Billing's actions (Add procedure, Create claim, Post insurance payment and the rest) are the tab's ⋯, the standard Actions list, next to Collect payment") : ""}>${actionsMenu(V4B_BILLING_ACTIONS(), { dots: true, up: false, align: "end", open: V4_OPTS.open })}</span></div>`;
}
const v4bChart = (main, mark = false) => `<div class="flex min-h-[720px]">${v4bPatientPanel(mark)}<div class="min-w-0 grow">${v4bBillingHead(mark)}${main}</div></div>`;
/* The ledger rows as they look in v4, static, for the faded page behind a panel */
const v4bStaticLedger = (rows, hi) => { const H = ["Date", "Code", "Description", "By", "Amount", "Remaining", "Balance"];
  return `<table class="w-full table-fixed border-separate border-spacing-0 text-sm"><colgroup><col class="w-[96px]"><col class="w-[132px]"><col><col class="w-[112px]"><col class="w-[104px]"><col class="w-[112px]"><col class="w-[104px]"></colgroup><thead><tr>${H.map((h, i) => `<th class="${R.gridHead} ${i > 3 ? "!text-end" : ""}">${h}</th>`).join("")}</tr></thead>
  <tbody>${rows.map((x) => `<tr class="${x.id === hi ? "bg-blue-50" : ""}"><td class="${R.gridCell}">${fmtDate(x.date)}</td><td class="${R.gridCell}">${entryLabel(x)}</td><td class="${R.gridCell} truncate">${v4bToothDesc(x)}</td><td class="${R.gridCell}">${esc(v4bBy(x))}</td><td class="${R.gridCell} text-end tabular-nums">${x.kind === "claim" ? dim(money(x.billed)) : money(x.amt)}</td><td class="${R.gridCell} text-end tabular-nums">${x.kind === "claim" ? dim() : !x.rem ? dim("$0.00") : money(x.rem)}</td><td class="${R.gridCell} text-end tabular-nums">${money(x.bal)}</td></tr>`).join("")}</tbody></table>`; };
const v4bChartSlice = (hi) => v4bChart(`${tabsWithSlot(BILLING_TABS, 0, button("Adjust balance", { v: "white", s: "sm", icon: "sliders-horizontal" }))}<div class="p-4">${v2Tiles(balances(false), false)}</div><div class="px-4">${v4bStaticLedger([...ledgerRows(false)].reverse(), hi)}</div>`);

/* ---------- ledger entry detail (read-only first, Edit to change) ----------
 * Flush panel: psec() sections whose lines run edge to edge; key-value grids are boxed in R.tableBox;
 * the equations sit left-aligned inside the section padding. Each fact appears once. */
/* v4 ledger entry: no Edit mode. The fields staff fix are cells (provider, the insurance estimate, who collected it);
 * what Asha locked at posting reads as plain cells with a lock by the title saying why. ⋯ is the standard Actions menu. */
const V4B_COLLECTORS = ["Nina Flores · Front desk", "Maria Lopez · Front desk", "Priya Shah · Office manager"];
const v4bEntryActions = (r) => (r.kind === "proc" ? [
  { label: "Charge", items: [{ icon: "sliders-horizontal", label: "Adjust this charge", hint: "Write off or discount part of it" }, { icon: "sparkles", label: "Re-estimate insurance", hint: "Run the estimate again from Delta Dental's fee schedule" },
    { icon: "credit-card", label: "Apply a payment", hint: "Pay this charge from a payment or credit" }, { icon: "printer", label: "Print walkout", hint: "What was done and what's owed" }] },
  { label: "", items: [{ icon: "trash-2", label: "Delete charge", danger: true, off: "It's on the Delta Dental claim sent Sep 19. Take it off the claim first." }] }]
  : [{ label: "Payment", items: [{ icon: "printer", label: "Print receipt", hint: "A receipt for Ethan" }, { icon: "message-square", label: "Text receipt again", hint: "To (925) 555-0187" },
    { icon: "split", label: "Reapply payment", hint: "Move it to other charges" }, { icon: "undo-2", label: "Refund", hint: "Back to Visa ····4242" }] },
  { label: "", items: [{ icon: "ban", label: "Void payment", danger: true, off: "The card payment has settled. Refund it instead." }] }]);
function v4bEntryHead(r) {
  const proc = r.kind === "proc";
  return { title: proc ? `${r.code}${r.tooth ? ` · #${r.tooth} ${r.surf}` : ""}` : esc(r.code), subtitle: proc ? esc(r.desc) : fmtDateY(r.date),
    lead: `<span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">${I(proc ? "receipt" : r.kind === "adj" ? "circle-minus" : "credit-card", "size-4")}</span>`,
    marks: proc ? recordMark("lock", "On the Delta Dental claim sent Sep 19, so the date and fee are locked. Change them with an adjustment.") : recordMark("lock", "A processed card payment can't be edited. Refund or reapply it from Actions."),
    actions: "", footer: `<span class="flex"${chg4("Edit and ⋯ are gone from the header: the fields are cells you change in place, and ⋯ is the standard Actions menu down here, with greyed rows that say why they can't run")}>${actionsMenu(v4bEntryActions(r), { open: V4_OPTS.open })}</span><span class="grow"></span>` };
}
function v4bEntryFacts(r, ptLink) {
  const none = (label, value, html) => ({ label, value, type: "none", html });
  if (r.kind !== "proc") return [none("Date", fmtDateY(r.date)), none("Patient", "Ethan Walker", () => ptLink), none("Amount", money(-r.amt), () => `<span class="tabular-nums">${money(-r.amt)}</span>`),
    none("Payment method", r.id === "l13" ? "Visa ····4242 · card terminal" : esc(r.desc.split(" · ")[1] || r.desc)), { label: "Collected by", value: V4B_COLLECTORS[0], type: "select", options: V4B_COLLECTORS }];
  const ptEst = (ins) => add(r.rem, -(v4bNum(ins) || 0));
  return [none("Date of service", fmtDateY(r.date)), none("Patient", "Ethan Walker", () => ptLink), { label: "Provider", value: r.prov, type: "select", options: V4B_PROVIDERS() },
    none("Claim", "Delta Dental · sent Sep 19", (x) => `<button type="button" data-act="open-claim" class="inline-flex max-w-full items-center gap-1 text-gray-800 hover:underline decoration-gray-300 underline-offset-4 cursor-pointer">${esc(x.value)}${I("chevron-right", "size-3.5 shrink-0 text-gray-400")}</button>`),
    { label: "Ins. est.", value: (r.ins || 0).toFixed(2), type: "text", html: v4bMoneyCell, est: true }, none("Pt. est.", money(ptEst(r.ins || 0)), (x) => `<span class="tabular-nums text-gray-500">${esc(x.value)}</span>`)];
}
const v4bEntryCommit = (r) => (row, k, v, g) => {
  if (!row.est) return; const n = v4bNum(v);
  if (n == null || n < 0) return "Type an amount, like 150.00.";
  if (n > r.rem) return `The estimate can't be more than what's still open on the charge (${money(r.rem)}).`;
  const pt = g.data.find((x) => x.label === "Pt. est."); if (pt) pt.value = money(add(r.rem, -n));
};
function ledgerHead(r) {
  if (V4) return v4bEntryHead(r);
  const proc = r.kind === "proc";
  return {
    title: proc ? `${r.code}${r.tooth ? ` · #${r.tooth} ${r.surf}` : ""}` : esc(r.code),
    subtitle: proc ? esc(r.desc) : fmtDateY(r.date),
    lead: `<span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">${I(proc ? "receipt" : r.kind === "adj" ? "circle-minus" : "credit-card", "size-4")}</span>`,
    actions: button("Edit", { v: "white", s: "xs", icon: "pencil" }) + iconButton("ellipsis", "More, including Print", { s: "iconSm" })
  };
}
function ledgerDetail(r, family, tab = 0) {
  const rows = ledgerRows(family); const i = rows.findIndex((x) => x.id === r.id);
  const before = i > 0 ? rows[i - 1].bal : 0, after = rows[i].bal;
  const pt = DATA.patient(r.pt);
  const apps = r.id === "l13" ? [["l11", 47], ["l12", 37]] : r.id === "l11" ? [["l13", 47]] : r.id === "l12" ? [["l13", 37]] : [];
  const ptLink = `<a class="text-blue-600 hover:underline underline-offset-4" href="#">${esc(pt.name)}</a>`;
  if (V2) return v2LedgerDetail(r, { apps, before, after, ptLink }, tab);
  const head = r.kind === "proc"
    ? kvBox([["Date of service", fmtDateY(r.date)], ["Patient", ptLink], ["Provider", esc(r.prov)], ["Claim", r.date === "2026-09-18" ? openCell("Delta Dental · sent Sep 19", "Open the Delta Dental claim") : "Delta Dental · Paid"]])
    : kvBox([["Patient", ptLink], ["Payment method", r.id === "l13" ? "Credit card · Visa ····4242" : esc(r.desc.split(" · ")[1] || r.desc)], ["Collected by", "Nina Flores · Front desk"]]);
  const overview = `${psec("", head)}
    ${psec("Account balance", waterfall([["", "Balance before", before], [r.amt < 0 ? "−" : "+", r.kind === "proc" ? "This charge" : "This payment", Math.abs(r.amt)], ["=", "Balance after", after, { total: true }]]))}
    ${r.kind === "proc" ? psec("This charge", `${waterfall([["", "Fee charged", r.amt], ...apps.map(([id, a]) => ["−", `Patient payment · ${fmtDate(LEDGER.find((x) => x.id === id).date)}`, a]), ["=", "Remaining", r.rem, { total: true }]])}
      <p class="mt-3 text-[13px] text-gray-500">Insurance estimate <span class="text-gray-800 tabular-nums">${money(r.ins || 0)}</span> · Patient estimate <span class="text-gray-800 tabular-nums">${money(add(r.rem, -(r.ins || 0)))}</span></p>`)
      : psec("Where it went", waterfall([["", "Payment", Math.abs(r.amt)], ...apps.map(([id, a]) => { const x = LEDGER.find((y) => y.id === id); return ["−", `${x.code} · #${x.tooth} ${x.surf}`, a]; }), ["=", "Unapplied credit", add(Math.abs(r.amt), -sum(apps, (a) => a[1])), { total: true }]]))}`;
  const hd = ["Applied to", "Date", "Amount"];
  const application = psec(r.kind === "proc" ? "Payments and credits on this charge" : "Where this payment went", bleed(`<table class="w-full border-separate border-spacing-0 text-sm"><thead><tr>${hd.map((h, k) => `<th class="${R.tHead} ${edge(k, 3)} ${k === 2 ? "!text-end" : ""}">${h}</th>`).join("")}</tr></thead>
    <tbody>${apps.map(([id, a]) => { const x = LEDGER.find((y) => y.id === id); return `<tr><td class="${R.tCell} !ps-5">${entryLabel(x)} ${x.tooth ? `<span class="text-gray-500 tabular-nums">#${x.tooth} ${x.surf}</span>` : `<span class="text-gray-500">${esc(x.desc.split(" · ")[0])}</span>`}</td><td class="${R.tCell} tabular-nums">${fmtDate(x.date)}</td><td class="${R.tCell} !pe-5 text-end tabular-nums">${money(a)}</td></tr>`; }).join("")}
    ${r.kind === "pay" ? `<tr><td class="${R.tCell} !ps-5 text-gray-500">Unapplied credit</td><td class="${R.tCell}"></td><td class="${R.tCell} !pe-5 text-end tabular-nums text-gray-400">$0.00</td></tr>` : ""}</tbody>
    <tfoot><tr><td colspan="2" class="h-9 ps-5 pe-3 font-medium text-gray-800">Total applied</td><td class="h-9 pe-5 ps-3 text-end font-semibold tabular-nums">${money(sum(apps, (a) => a[1]))}</td></tr></tfoot></table>`), { count: apps.length });
  const notes = `${psec("", kvBox([["Entry ID", `<span class="tabular-nums">LE-${r.id.toUpperCase()}-4471</span>`], ["Location", "Bayview Family Dental"], ["Posted by", r.kind === "proc" ? "Dr. Maya Patel" : "Nina Flores"], ["Posted", `${fmtDate(r.date)}, 11:42 AM`], ["Locked at posting", "Yes"], ["Synced to practice software", "Yes"]]))}
    ${psec("Notes", `<textarea class="${R.textarea}" placeholder="Optional staff-facing ledger note" aria-label="Notes"></textarea>`)}`;
  const activity = psec("", `<ol class="relative space-y-4 ps-5 before:absolute before:start-[5px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-gray-200">${[[r.kind === "proc" ? "Charge posted" : "Payment recorded", `${fmtDate(r.date)}, 11:42 AM · ${r.kind === "proc" ? "Dr. Maya Patel" : "Nina Flores"}`], ...(r.id === "l11" || r.id === "l12" ? [["Added to claim · Delta Dental", "Sep 19, 8:05 AM · Asha"], ["Patient payment applied", "Sep 18, 11:48 AM · Nina Flores"]] : r.id === "l13" ? [["Receipt texted to (925) 555-0187", "Sep 18, 11:48 AM · Asha"]] : []), ["Synced to practice software", `${fmtDate(r.date)}, 11:43 AM · Asha`]]
    .map(([t, s]) => `<li class="relative"><span class="absolute -start-5 top-1.5 size-[11px] rounded-full border-2 border-white bg-gray-300"></span><p class="text-sm text-gray-800">${t}</p><p class="${R.caption}">${s}</p></li>`).join("")}</ol>`);
  return { body: [overview, application, notes, activity][tab], tabs: ["Overview", "Application", "Notes & metadata", "Activity"] };
}
/* v2: facts in kvTable (no label fill), money explanations as full-width tables (moneySteps), the Application sheet on
 * the claim-form look, and the Payment overview no longer repeats the Application tab. */
function v2LedgerDetail(r, { apps, before, after, ptLink }, tab) {
  const proc = r.kind === "proc", entry = (id) => LEDGER.find((y) => y.id === id);
  const openRow = (text, label) => `<button type="button" class="group -me-3 flex h-9 w-[calc(100%+0.75rem)] items-center justify-between gap-2 pe-3 text-start hover:bg-gray-50 cursor-pointer" aria-label="${esc(label)}"><span class="truncate">${text}</span>${I("chevron-right", "size-4 shrink-0 text-gray-400 group-hover:text-gray-600")}</button>`;
  const facts = (pairs, why) => `<div${chg(why)}>${kvTable(pairs)}</div>`;
  const head = V4 ? `<div${chg4(proc ? "The charge's facts are one table: Provider and the insurance estimate are cells you change in place (the patient estimate follows); the grey line under This charge that held the estimates is gone" : "The payment's facts are one table; Collected by is a cell you can fix, the rest is locked once the card is processed")}>${fieldTable(v4bEntryFacts(r, ptLink), { title: "Entry", onCommit: v4bEntryCommit(r) })}</div>`
    : proc
    ? facts([["Date of service", fmtDateY(r.date)], ["Patient", ptLink], ["Provider", esc(r.prov)], ["Claim", r.date === "2026-09-18" ? openRow("Delta Dental · sent Sep 19", "Open the Delta Dental claim") : "Delta Dental · Paid"]], "Facts are calm label / value rows: no grey fill behind the labels and no line between label and value")
    : facts([["Patient", ptLink], ["Payment method", r.id === "l13" ? "Credit card · Visa ····4242" : esc(r.desc.split(" · ")[1] || r.desc)], ["Collected by", "Nina Flores · Front desk"]], "Facts are calm label / value rows: no grey fill behind the labels and no line between label and value");
  const overview = `${psec("", head)}
    ${psec(`<span${chg("The balance math is a full-width table, so every amount ends on the same right edge (it was a half-width equation whose amounts didn't line up)")}>Account balance</span>`, ((t) => (proc ? t : `<div${chg("\"Where it went\" is gone from Overview: it repeated the Application tab's rows")}>${t}</div>`))(moneySteps([["Balance before", before], [proc ? "This charge" : "This payment", r.amt]], ["Balance after", after])))}
    ${proc ? psec("This charge", `${moneySteps([["Fee charged", r.amt], ...apps.map(([id, a]) => [`Patient payment · ${fmtDate(entry(id).date)}`, -a])], ["Remaining", r.rem])}
      ${V4 ? "" : `<p class="mt-3 text-[13px] text-gray-500">Insurance estimate <span class="text-gray-800 tabular-nums">${money(r.ins || 0)}</span> · Patient estimate <span class="text-gray-800 tabular-nums">${money(add(r.rem, -(r.ins || 0)))}</span></p>`}`)
      : ""}`;
  const rows = apps.map(([id, a]) => { const x = entry(id); return { x, a }; });
  if (!proc) rows.push({ credit: true, a: 0 });
  const application = psec(`<span${chg("Payments and charges show on the claim form's compact sheet, the same sheet as claims, EOBs and posting")}>${proc ? "Payments and credits on this charge" : "Where this payment went"}</span>`, v2bcSheet({ title: "Application", rows,
    columns: [{ label: "Applied to", w: 200, flex: true, render: (o) => (o.credit ? `<span class="text-gray-500">Unapplied credit</span>` : `${entryLabel(o.x)} ${o.x.tooth ? `<span class="text-gray-500 tabular-nums">#${o.x.tooth} ${o.x.surf}</span>` : `<span class="text-gray-500">${esc(o.x.desc.split(" · ")[0])}</span>`}`) },
      { label: "Date", w: 76, render: (o) => (o.x ? `<span class="tabular-nums">${fmtDate(o.x.date)}</span>` : V4 ? dim() : "") },
      { label: "Amount", w: 104, num: true, render: (o) => (o.a ? money(o.a) : dim("$0.00")) }],
    foot: ["Total applied", "", money(sum(apps, (a) => a[1]))] }), { count: apps.length });
  const meta = [["Entry ID", `LE-${r.id.toUpperCase()}-4471`], ["Location", "Bayview Family Dental"], ["Posted by", proc ? "Dr. Maya Patel" : "Nina Flores"], ["Posted", `${fmtDate(r.date)}, 11:42 AM`], ["Locked at posting", "Yes"], ["Synced to practice software", "Yes"]];
  const notes4 = V4 && `${psec("", `<div${chg4("The entry's record details use the same field table as its facts; they're plain cells because Asha writes them")}>${fieldTable(meta.map(([label, value]) => ({ label, value, type: "none" })), { title: "Entry details", labelW: 200 })}</div>`)}
    ${psec("Notes", `<textarea class="${R.textarea}" placeholder="Optional staff-facing ledger note" aria-label="Notes"></textarea>`)}`;
  const notes = `${psec("", facts([["Entry ID", `<span class="tabular-nums">LE-${r.id.toUpperCase()}-4471</span>`], ["Location", "Bayview Family Dental"], ["Posted by", proc ? "Dr. Maya Patel" : "Nina Flores"], ["Posted", `${fmtDate(r.date)}, 11:42 AM`], ["Locked at posting", "Yes"], ["Synced to practice software", "Yes"]], "Facts are calm label / value rows: no grey fill behind the labels and no line between label and value"))}
    ${psec("Notes", `<textarea class="${R.textarea}" placeholder="Optional staff-facing ledger note" aria-label="Notes"></textarea>`)}`;
  const activity = psec("", `<ol class="relative space-y-4 ps-5 before:absolute before:start-[5px] before:top-1.5 before:bottom-1.5 before:w-px before:bg-gray-200">${[[proc ? "Charge posted" : "Payment recorded", `${fmtDate(r.date)}, 11:42 AM · ${proc ? "Dr. Maya Patel" : "Nina Flores"}`], ...(r.id === "l11" || r.id === "l12" ? [["Added to claim · Delta Dental", "Sep 19, 8:05 AM · Asha"], ["Patient payment applied", "Sep 18, 11:48 AM · Nina Flores"]] : r.id === "l13" ? [["Receipt texted to (925) 555-0187", "Sep 18, 11:48 AM · Asha"]] : []), ["Synced to practice software", `${fmtDate(r.date)}, 11:43 AM · Asha`]]
    .map(([t, s]) => `<li class="relative"><span class="absolute -start-5 top-1.5 size-[11px] rounded-full border-2 border-white bg-gray-300"></span><p class="text-sm text-gray-800">${t}</p><p class="${R.caption}">${s}</p></li>`).join("")}</ol>`);
  return { body: [overview, application, V4 ? notes4 : notes, activity][tab], tabs: ["Overview", "Application", "Notes & metadata", "Activity"] };
}
function openLedgerSheet(r, family) {
  if (r.kind === "claim" && V4) { const open = r.date === "2026-09-19", st = open ? ["With payer", "off", "sent 6 days ago"] : ["Paid", "on", "paid in full"];
    return Sheet.open({ flush: true, title: "Delta Dental claim", subtitle: `${r.desc.split(" · ").slice(1).join(" · ")} · Sent ${fmtDate(r.date)}`,
      marks: recordMark("lock", "Sent to Delta Dental, so it's read-only here. Open the claim to correct it."),
      body: psec("Claim", `<div${chg4("The claim's status is the first line of its facts table instead of a row of its own")}>${fieldTable([{ label: "Status", value: st[0], type: "none", html: () => `<span class="inline-flex items-center gap-2"><span class="${cx(R.dot, TONE_DOT[st[1]])}"></span>${st[0]}<span class="text-gray-500">· ${st[2]}</span></span>` },
        { label: "Billed", value: money(r.billed), type: "none" }, { label: "Coverage", value: "Primary", type: "none" }, { label: "Patient", value: DATA.patient(r.pt).name, type: "none" }], { title: "Claim" })}</div>`),
      footer: button("Open claim", { v: "white", s: "sm", icon: "external-link" }) }); }
  if (r.kind === "claim") { const open = r.date === "2026-09-19";
    return Sheet.open({ flush: true, title: "Delta Dental claim", subtitle: `${r.desc.split(" · ").slice(1).join(" · ")} · Sent ${fmtDate(r.date)}`,
      body: `${statusLine(open ? "With payer" : "Paid", open ? "off" : "on", open ? "Sent 6 days ago" : "Paid in full")}${psec("Claim", metaGrid([["Billed", `<span class="tabular-nums">${money(r.billed)}</span>`], ["Coverage", "Primary"], ["Patient", esc(DATA.patient(r.pt).name)]], 3))}`,
      footer: button("Open claim", { v: "white", s: "sm", icon: "external-link" }) }); }
  const d = ledgerDetail(r, family), h = ledgerHead(r);
  Sheet.open({ flush: true, ...h, tabs: d.tabs, body: d.body });
  const nav = Sheet.el.querySelector("nav"), body = Sheet.el.querySelector(".overflow-y-auto");
  if (nav && body) wireTabs(nav, (i) => { body.innerHTML = ledgerDetail(r, family, i).body; icons(); });
}

/* ---------- chart header + Billing sub-tabs ---------- */
const CHART_TABS = ["Overview", "Charting", "Family", "Insurance", "Appts", "Billing", "TX plans", "Notes", "Images", "Forms", "Docs", "Comms"];
const BILLING_TABS = ["Ledger", "Statements", "Claims", "Pre-Auth", "Payments", "Payment Plans"];
function chartHeader() {
  const p = DATA.patient("p10");
  return `<div class="flex items-center gap-3 px-4 pt-3 pb-2.5">${avatar(p.name, { size: 9 })}
    <div class="min-w-0"><p class="text-base font-semibold text-gray-800 leading-tight">${p.name}</p><p class="text-[13px] text-gray-500 tabular-nums">${p.age} · Aug 8, 1979 · Chart #10482 · Guarantor of 3</p></div>
    <div class="ms-auto flex items-center gap-5 text-[13px]"><span class="text-gray-500">Delta Dental PPO</span>${statusDot("Ins. Verified", "on", "!text-[13px]")}<span class="text-gray-500">Next appt <span class="text-gray-800">Oct 2, 10:30 AM</span></span></div></div>
    ${tabsBar(CHART_TABS, 5, "px-4")}`;
}
function tiles(b, family) {
  const cell = (label, value, link = "") => `<div class="px-4 py-2.5 min-w-0"><p class="text-[13px] text-gray-500 whitespace-nowrap">${label}</p><p class="mt-0.5 flex flex-wrap items-baseline gap-x-2"><span class="${R.numberSm}">${money(value)}</span>${link}</p></div>`;
  const link = (t, attrs = "") => `<button type="button" class="${cx(R.btn, R.link, "!text-[13px] !font-normal")}" ${attrs}>${t}</button>`;
  const total = b.aging.reduce((a, x) => a + x[1], 0) || 1;
  return `<div class="grid grid-cols-[1.3fr_1fr] gap-3">
    <div class="${R.box} grid grid-cols-4 divide-x divide-gray-200/80">
      ${cell("Balance", b.balance, family ? link("By member", 'data-act="family-breakdown"') : "")}${cell("Credits", b.credits)}${cell("INS EST", b.insEst)}${cell("Patient EST", b.ptEst, link("Breakdown"))}</div>
    <div class="${R.box} grid grid-cols-4 divide-x divide-gray-200/80">${b.aging.map(([l, v]) => `<div class="px-4 py-2.5 min-w-0"><p class="text-[13px] text-gray-500 tabular-nums">${l} days</p><p class="text-sm font-medium tabular-nums mt-1 ${v ? "text-gray-800" : "text-gray-400"}">${money(v)}</p><div class="mt-1.5">${Chart.meter(Math.max(0, v), total)}</div></div>`).join("")}</div></div>`;
}
/* v2 tiles: a tile that opens something is a whole-tile button with a grey chevron (no blue links side by side); in
 * family scope the Balance tile shows the guarantor A/R, the same number the breakdown dialog leads with. */
const V2_GUARANTOR_AR_LAG = 80; // Chloe's cleaning from today, added to the family's aging overnight
function v2Tiles(b, family) {
  const tile = (label, value, open, why) => open
    ? `<button type="button" class="group relative flex flex-col items-start justify-start px-4 py-2.5 min-w-0 text-start hover:bg-gray-50 cursor-pointer" aria-label="${esc(open)}" ${label === "Balance" ? 'data-act="family-breakdown"' : ""}${chg(why)}>${I("chevron-right", "absolute top-2.5 end-2.5 size-4 text-gray-400 group-hover:text-gray-600")}<p class="text-[13px] text-gray-500 whitespace-nowrap">${label}</p><p class="mt-0.5 ${R.numberSm}">${money(value)}</p></button>`
    : `<div class="px-4 py-2.5 min-w-0"><p class="text-[13px] text-gray-500 whitespace-nowrap">${label}</p><p class="mt-0.5 ${R.numberSm}">${money(value)}</p></div>`;
  const total = b.aging.reduce((a, x) => a + x[1], 0) || 1;
  return `<div class="grid grid-cols-[1.3fr_1fr] gap-3">
    <div class="${R.box} overflow-hidden grid grid-cols-4 divide-x divide-gray-200/80">
      ${family ? tile("Balance", add(b.balance, -V2_GUARANTOR_AR_LAG), "Balance by family member", "In family scope the Balance tile shows the guarantor A/R, the same number the breakdown leads with (it showed one of three different family totals)") : tile("Balance", b.balance)}${tile("Credits", b.credits)}${tile("INS EST", b.insEst)}${tile("Patient EST", b.ptEst, "Patient EST breakdown", "Tiles that open something are whole-tile buttons with a grey chevron, so blue stays for the one main action (Collect payment)")}</div>
    <div class="${R.box} grid grid-cols-4 divide-x divide-gray-200/80">${b.aging.map(([l, v]) => `<div class="${V4 ? "px-3" : "px-4"} py-2.5 min-w-0"><p class="text-[13px] text-gray-500 tabular-nums${V4 ? " whitespace-nowrap" : ""}">${l} days</p><p class="text-sm font-medium tabular-nums mt-1 ${v ? "text-gray-800" : "text-gray-400"}">${money(v)}</p><div class="mt-1.5">${Chart.meter(Math.max(0, v), total)}</div></div>`).join("")}</div></div>`;
}
const billingActions = () => `${button("Adjust balance", { v: "white", s: "sm", icon: "sliders-horizontal" })}${button("Add procedure", { v: "white", s: "sm", icon: "plus" })}${button("Create claim", { v: "white", s: "sm", icon: "file-plus" })}${iconButton("ellipsis", "More actions", { v: "white", s: "iconSm" })}${button("Collect payment", { v: "solid", s: "sm", icon: "credit-card" })}`;

/* v4 Payments sub-tab: each cell holds one value. Method shows the card or payer and Applied to the visit or claim; how it
 * came in (card terminal, the EFT or check number) and how many charges it paid open on hover with the rest. */
const v4bPayments = (o) => { if (!V4) return o; const first = (t) => t.split(" · ")[0];
  return { ...o, peek: (r) => peekCard(`${esc(r.type)} · ${fmtDateY(r.date)}`, [["From", esc(first(r.how))], ["Details", esc(r.how.split(" · ").slice(1).join(", "))], ["Amount", `<span class="tabular-nums">${money(r.amt)}</span>`], ["Applied to", esc(first(r.to))], ["Charges", esc(r.to.split(" · ")[1] || "")]]),
    columns: o.columns.map((c) => ({ ...c, w: { date: 110, type: 150, how: 160, amt: 110, to: 170 }[c.key] || c.w })).map((c) => (c.key === "how" ? { ...c, label: `<span${chg4("Method and Applied to show one value each (Visa ····4242, Sep 18 visit); how it came in, the EFT or check number and how many charges it paid open on hover.")}>Method</span>`, render: (r) => esc(first(r.how)) } : c.key === "to" ? { ...c, render: (r) => esc(first(r.to)) } : c)) }; };
/* The other Billing sub-tabs: small grids of their own */
function subGrid(host, i, v2o = {}) {
  const base = { maxHeight: 360, addColumn: false, selectable: false, ...v2o };
  if (i === 1) return new Grid(host, { ...base, title: "Statements", searchPlaceholder: "Search statements", rows: [{ id: "s1", date: "2026-09-01", kind: "Monthly statement", amt: 48, via: "Email + Text", st: "Delivered" }, { id: "s0", date: "2026-10-01", kind: "Next statement · after Mia's credit", amt: 23, via: "Email + Text", st: "Scheduled" }],
    columns: [{ key: "date", label: "Date", icon: "calendar", w: 150, kind: "date", render: (r) => fmtDate(r.date) }, { key: "kind", label: "Statement", icon: "file-text", w: 260, open: true, kind: "text" }, { key: "amt", label: "Amount due", w: 140, num: true, kind: "money", render: (r) => money(r.amt) }, { key: "via", label: "Delivery", icon: "send", w: 200, kind: "text" }, { key: "st", label: "Status", icon: "circle-dot", w: 180, kind: "text", render: (r) => statusDot(r.st, r.st === "Delivered" ? "on" : "quiet") }] });
  if (i === 2) return new Grid(host, { ...base, title: "Claims", searchPlaceholder: "Search claims", calc: { billed: "sum", paid: "sum" }, rows: [{ id: "k3", svc: "2026-09-18", codes: "D2392 · D2391", billed: 420, paid: 0, st: "With payer" }, { id: "k2", svc: "2026-08-25", codes: "D0150 · D0210", billed: 240, paid: 192, st: "Paid" }, { id: "k1", svc: "2026-02-25", codes: "D0120 · D1110 · D0274", billed: 253, paid: 202.4, st: "Paid" }],
    columns: [{ key: "svc", label: "Service date", icon: "calendar", w: 150, kind: "date", render: (r) => fmtDate(r.svc) }, { key: "codes", label: "Procedures", icon: "list", w: 240, open: true, kind: "text", render: (r) => `<span class="tabular-nums">${r.codes}</span>` }, { key: "payer", label: "Payer", icon: "shield", w: 170, kind: "text", value: () => "Delta Dental" }, { key: "billed", label: "Billed", w: 130, num: true, kind: "money", render: (r) => money(r.billed) }, { key: "paid", label: "Paid", w: 130, num: true, kind: "money", render: (r) => (r.paid ? money(r.paid) : dim("$0.00")) }, { key: "st", label: "Status", icon: "circle-dot", w: 150, kind: "text", render: (r) => statusDot(r.st, r.st === "Paid" ? "on" : "off") }] });
  if (i === 4) return new Grid(host, v4bPayments({ ...base, title: "Payments", searchPlaceholder: "Search payments", calc: { amt: "sum" }, rows: [{ id: "y3", date: "2026-09-18", type: "Patient Payment", how: "Visa ····4242 · Card terminal", amt: 84, to: "Sep 18 visit · 2 charges" }, { id: "y2", date: "2026-09-15", type: "Ins Pay", how: "Delta Dental · EFT #5520917", amt: 192, to: "Aug 25 claim · 2 charges" }, { id: "y1", date: "2026-03-16", type: "Ins Pay", how: "Delta Dental · Check #88213", amt: 202.4, to: "Feb 25 claim · 3 charges" }],
    columns: [{ key: "date", label: "Date", icon: "calendar", w: 130, kind: "date", render: (r) => fmtDate(r.date) }, { key: "type", label: "Type", icon: "tag", w: 170, open: true, kind: "text", render: (r) => `<span class="text-emerald-700">${r.type}</span>` }, { key: "how", label: "Method", icon: "credit-card", w: 270, kind: "text" }, { key: "amt", label: "Amount", w: 130, num: true, kind: "money", render: (r) => money(r.amt) }, { key: "to", label: "Applied to", icon: "corner-down-right", w: 240, kind: "text" }] }));
  const empty = i === 3 ? ["file-check", "No pre-authorizations", "Send one before big work like crowns or implants, so Ethan knows what's covered.", "New Pre-Auth"] : ["calendar-range", "No payment plans", "No payment plans have been created for this family.", "New Plan"];
  host.innerHTML = `<div class="border-y border-gray-200/80 mt-2.5">${emptyState({ icon: empty[0], title: empty[1], body: empty[2], action: button(empty[3], { v: "white", s: "sm", icon: "plus" }) })}</div>`; icons();
}

/* ======================================================= 1. Chart Billing tab */
defineBlock({
  cat: "billing", id: "billing-chart-tab", thumb: true,
  title: "Chart Billing tab",
  note: "The Billing tab in a patient's chart: balances grouped in one box with the aging next to it, the one blue Collect payment, and the ledger under it. Sub-tabs and the location / family switch work; click a code to open the entry.",
  where: "Charts › Patient › Billing",
  states: ["This location", "All family members", "Loading"],
  canvas: "bare",
  html: (state) => {
    const family = state === "All family members", loading = state === "Loading";
    if (V4) return v4bChart(`<div data-billing-tabs>${tabsWithSlot(BILLING_TABS, 0, button("Adjust balance", { v: "white", s: "sm", icon: "sliders-horizontal" }))}</div>
      <div class="px-4 pt-3 pb-4">
        <div data-tiles>${loading ? `<div class="grid grid-cols-[1.3fr_1fr] gap-3">${[4, 4].map((n) => `<div class="${R.box} grid grid-cols-4 divide-x divide-gray-200/80">${Array.from({ length: n }, () => `<div class="px-4 py-2.5 space-y-2">${skel("w-16", "h-3")}${skel("w-20", "h-5")}</div>`).join("")}</div>`).join("")}</div>` : v2Tiles(balances(family), family)}</div>
        <div data-sub>${loading ? `<div class="py-2.5 flex gap-2">${skel("w-48", "h-8")}<span class="ms-auto">${skel("w-60", "h-8")}</span></div>${gridSkeleton(["Date", "Code", "Description", "By", "Amount", "Remaining", "Balance"], 6)}` : ""}</div>
      </div>`, true);
    if (V2) return `${chartHeader()}
      <div data-billing-tabs>${tabsWithSlot(BILLING_TABS, 0, `<span class="flex items-center gap-1.5"${chg("The actions sit in the sub-tab bar: Collect payment (used dozens of times a day) is the one solid button; Add procedure, Create claim, Post insurance payment, Generate statement and Explain patient responsibility are in ⋯. The line repeating the patient and location is gone.")}>${button("Adjust balance", { v: "white", s: "sm", icon: "sliders-horizontal" })}${iconButton("ellipsis", "More: Add procedure, Create claim, Post insurance payment, Generate statement, Explain patient responsibility", { v: "white", s: "iconSm" })}${button("Collect payment", { v: "solid", s: "sm", icon: "credit-card" })}</span>`)}</div>
      <div class="px-4 pt-3 pb-4">
        <div data-tiles>${loading ? `<div class="grid grid-cols-[1.3fr_1fr] gap-3"${chg("The loading tiles use the same 1.3 : 1 split as the loaded tiles, so nothing jumps when the numbers arrive")}>${[4, 4].map((n) => `<div class="${R.box} grid grid-cols-4 divide-x divide-gray-200/80">${Array.from({ length: n }, () => `<div class="px-4 py-2.5 space-y-2">${skel("w-16", "h-3")}${skel("w-20", "h-5")}</div>`).join("")}</div>`).join("")}</div>` : v2Tiles(balances(family), family)}</div>
        <div data-sub>${loading ? `<div class="py-2.5 flex gap-2">${skel("w-48", "h-8")}<span class="ms-auto">${skel("w-60", "h-8")}</span></div>${gridSkeleton(["Date", "Code", "Tooth", "Description", "Provider", "Amount", "Remaining", "Balance"], 6)}` : ""}</div>
      </div>`;
    return `${chartHeader()}
      <div data-billing-tabs>${tabsWithSlot(BILLING_TABS, 0, `<span class="text-[13px] text-gray-500">Show</span>${segmented(["This location", "All family members"], family ? 1 : 0, { sm: true, attrs: 'data-scope aria-label="Which ledger to show"' })}`)}</div>
      <div class="px-4 pt-3 pb-4">
        <div class="flex items-center justify-between gap-3 mb-3"><p class="text-[13px] text-gray-500">${family ? "Walker family · Ethan, Mia and Chloe" : "Ethan Walker · Bayview Family Dental"} ${loading ? " · Loading ledger…" : " · updated just now"}</p><div class="flex items-center gap-1.5">${billingActions()}</div></div>
        <div data-tiles>${loading ? `<div class="grid grid-cols-[1.25fr_1fr] gap-3">${[4, 4].map((n) => `<div class="${R.box} grid grid-cols-4 divide-x divide-gray-200/80">${Array.from({ length: n }, () => `<div class="px-4 py-3 space-y-2">${skel("w-16", "h-3")}${skel("w-20", "h-5")}</div>`).join("")}</div>`).join("")}</div>` : tiles(balances(family), family)}</div>
        <div data-sub>${loading ? `<div class="py-2.5 flex gap-2">${skel("w-28", "h-8")}${skel("w-48", "h-8")}</div>${gridSkeleton(["Date", "Code", "Tooth", "Surf", "Description", "Provider", "Amount", "Remaining", "Balance"], 6)}` : ""}</div>
      </div>`;
  },
  mount: (el, state) => {
    if (state === "Loading") return;
    let family = state === "All family members", tab = 0;
    const host = el.querySelector("[data-sub]");
    if (V2) {
      /* the location / family switch lives in the grid toolbar, before ⋯; the sub-tabs already name the view */
      const scope = () => `<span${chg("The This location / All family members switch moved into the grid's toolbar, next to the ledger it changes")}>${segmented(["This location", "All family members"], family ? 1 : 0, { sm: true, attrs: 'data-scope aria-label="Which ledger to show"' })}</span>`;
      const draw = () => { host.innerHTML = ""; const div = document.createElement("div"); host.appendChild(div); const o = { viewButton: false, toolbarExtra: scope() }; if (tab === 0) ledgerGrid(div, family, { maxHeight: 372, ...o }); else subGrid(div, tab, o); };
      draw();
      wireTabs(el.querySelector("[data-billing-tabs]"), (i) => { tab = i; draw(); });
      el.addEventListener("click", (e) => { const s = e.target.closest("[data-scope] [data-seg]"); if (!s || (s.dataset.seg === "1") === family) return; family = s.dataset.seg === "1"; el.querySelector("[data-tiles]").innerHTML = v2Tiles(balances(family), family); icons(); draw(); });
      return;
    }
    const draw = () => { host.innerHTML = ""; const div = document.createElement("div"); host.appendChild(div); if (tab === 0) ledgerGrid(div, family, { maxHeight: 372 }); else subGrid(div, tab); };
    draw();
    wireTabs(el.querySelector("[data-billing-tabs]"), (i) => { tab = i; draw(); });
    el.querySelector("[data-scope]").addEventListener("click", (e) => { const s = e.target.closest("[data-seg]"); if (!s) return; family = s.dataset.seg === "1"; el.querySelector("[data-tiles]").innerHTML = tiles(balances(family), family); icons(); draw(); });
  }
});

/* ======================================================= 2. Patient ledger table */
defineBlock({
  cat: "billing", id: "billing-ledger", title: "Patient ledger",
  note: "Every charge, claim, payment and write-off in date order, with what's still open and the running balance. Entry types keep the Dentrix colours offices know. The totals row matches the last balance.",
  where: "Charts › Patient › Billing › Ledger",
  states: ["Normal", "Family", "Empty"],
  canvas: "bare",
  html: (state) => `<div class="flex items-center justify-between gap-4 px-4 pt-3.5">
      <p class="text-sm text-gray-500">${state === "Family" ? "Walker family · Ethan, Mia and Chloe" : state === "Empty" ? "Isabella Kim · new patient" : "Ethan Walker"} · newest first</p>
      <div class="flex items-center gap-4 text-[13px] text-gray-500" aria-label="Entry types"><span>Entry types</span>${[["Charges", "proc"], ["Claims", "claim"], ["Payments", "pay"], ["Adjustments", "adj"]].map(([c, k]) => entryLabel({ code: c, kind: k })).join("")}</div></div>
    <div class="px-4 pb-4" data-grid="ledger"></div>`,
  mount: (el, state) => { const g = ledgerGrid(el.querySelector('[data-grid="ledger"]'), state === "Family", { maxHeight: 660 }); if (state === "Empty") { g.setRows([]); g.render(); } }
});

/* ======================================================= 3. Ledger entry detail panel */
defineBlock({
  cat: "billing", id: "billing-ledger-entry", title: "Ledger entry detail",
  note: "Opens read-only with Edit in the header. The balance is shown as a plain equation you read left to right, never as a big headline number. The tabs work.",
  where: "Charts › Billing › Ledger › entry",
  states: ["Charge", "Payment"],
  canvas: "bare",
  html: (state) => {
    const r = LEDGER.find((x) => x.id === (state === "Payment" ? "l13" : "l11"));
    const d = ledgerDetail(r, false, 0);
    const slice = V4 ? v4bChartSlice(r.id) : `${chartHeader()}${tabsWithSlot(BILLING_TABS, 0)}<div class="p-4">${(V2 ? v2Tiles : tiles)(balances(false), false)}</div>${staticLedger([...ledgerRows(false)].reverse(), r.id)}`;
    return `<div class="flex min-h-[600px]">${faded(slice)}${sheetPanel({ flush: true, cls: "shrink-0 !h-auto self-stretch", ...ledgerHead(r), tabs: d.tabs, tab: 0, body: d.body })}</div>`;
  },
  mount: (el, state) => { const r = LEDGER.find((x) => x.id === (state === "Payment" ? "l13" : "l11")); const aside = el.querySelector("aside"), body = aside.querySelector(".overflow-y-auto");
    wireTabs(aside.querySelector("nav"), (i) => { body.innerHTML = ledgerDetail(r, false, i).body; icons(); }); }
});

/* ======================================================= 4. Checkout (v2), Payment step */
const VISIT = [
  { code: "D0120", tooth: "", desc: "Periodic exam", fee: 65, allowed: 52, pct: 100 },
  { code: "D1110", tooth: "", desc: "Adult cleaning", fee: 110, allowed: 88, pct: 100 },
  { code: "D2391", tooth: "3", surf: "O", desc: "Composite, one surface, back tooth", fee: 185, allowed: 148, pct: 80 }
].map((l) => { const ins = Math.round(l.allowed * l.pct) / 100; return { ...l, ins, wo: add(l.fee, -l.allowed), pt: add(l.allowed, -ins) }; });
const PRIOR = 184; // Ava's balance before today's visit
const coStepBar = (steps, on, done = []) => `<nav class="flex items-center gap-1" aria-label="Checkout steps">${steps.map((s, i) => `${i ? I("chevron-right", "size-3.5 text-gray-300 shrink-0") : ""}<button type="button" class="${cx(R.btn, R.sm, i === on ? "bg-gray-100 border-transparent text-gray-900" : "bg-transparent border-transparent text-gray-600 hover:bg-gray-100")}" ${i === on ? 'aria-current="step"' : ""} data-step="${i}">
  ${done.includes(i) ? `<span class="flex size-5 items-center justify-center rounded-full bg-blue-600 text-white">${I("check", "!size-3")}</span>` : `<span class="flex size-5 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums ${i === on ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-500"}">${i + 1}</span>`}${s}</button>`).join("")}</nav>`;
/* v2 checkout: the charges on the claim-form sheet, one short money table for what's due today (the sheet's totals row
 * already carries fee, insurance, write-off and patient estimate), the shared kit step bar and the shared method row. */
const CO_STEPS = [["Review", "done"], ["Payment"], ["Next visits"], ["Finish"]];
function v2Checkout(state, t, due) {
  const waiting = state === "Waiting for card", cash = state === "Cash", p = DATA.patient("p1");
  const cash$ = (k) => ({ label: `<span${k === "fee" ? chg("Money columns use one vocabulary: Fee (nothing is billed yet at checkout), Ins. est., Write-off, Pt. est.") : ""}>${{ fee: "Fee", ins: MONEY_LABEL.insEst, wo: MONEY_LABEL.writeOff, pt: MONEY_LABEL.ptEst }[k]}</span>`, w: 96, num: true, render: (l) => (l[k] ? money(l[k]) : dim(money(0))) });
  const sheet = v2bcSheet({ title: "Today's charges", rows: VISIT, foot: ["Total", "", "", ...["fee", "ins", "wo", "pt"].map((k) => money(t[k]))],
    columns: [{ label: "Code", w: 68, render: (l) => `<span class="tabular-nums">${l.code}</span>` }, { label: "Tooth", w: 64, render: (l) => (l.tooth ? `<span class="tabular-nums">#${l.tooth} ${l.surf}</span>` : "") }, { label: "Description", w: 160, flex: true, render: (l) => esc(l.desc) }, cash$("fee"), cash$("ins"), cash$("wo"), cash$("pt")] });
  const due4 = (pt) => moneySteps([[`${MONEY_LABEL.ptEst} today`, pt], ["Prior balance", PRIOR]], ["Due today", add(pt, PRIOR)]);
  const sheet4 = V4 && (() => {
    const foot = (rows) => ["Total", "", ...["fee", "ins", "wo", "pt"].map((k) => money(sum(rows, k)))];
    const rows = VISIT.map((l, i) => ({ id: `v${i}`, ...l }));
    const derived = (k) => ({ key: k, label: k === "wo" ? MONEY_LABEL.writeOff : MONEY_LABEL.ptEst, w: 96, num: true, kind: "money", render: (l) => `<span class="text-gray-500">${money(l[k] || 0)}</span>` });
    return sheetTable({ preset: "form", title: "Today's charges", rows, foot: foot(rows),
      onCommit: (l, k, v, g) => {
        const cap = Math.min(l.allowed, l.fee); let why;
        if (k === "fee" && l.fee < 0) why = "Type a fee, like 185.00.";
        if (k === "ins" && l.ins > cap) why = `Delta Dental won't pay more than the allowed fee here (${money(cap)}).`;
        l.wo = add(l.fee, -cap); l.pt = Math.max(0, add(cap, -Math.min(l.ins, cap)));
        g.o.foot = foot(g.data);
        const dlg = g.root.closest('[role="dialog"]'), pt = sum(g.data, "pt");
        const box = dlg && dlg.querySelector("[data-due]"); if (box) box.innerHTML = due4(pt);
        const amt = dlg && dlg.querySelector('[data-method] input[aria-label="Amount"]'); if (amt) amt.value = add(pt, PRIOR).toFixed(2);
        return why;
      },
      columns: [{ key: "code", label: "Code", w: 68, render: (l) => `<span class="tabular-nums">${l.code}</span>` },
        { key: "desc", label: `<span${chg4("Tooth and surface start the description (\"#3 O Composite…\"); the Tooth column was empty on the exam and the cleaning")}>Description</span>`, w: 160, grow: true, render: (l) => `${l.tooth ? `<span class="tabular-nums text-gray-500 me-1.5">#${l.tooth} ${l.surf}</span>` : ""}${esc(l.desc)}` },
        { key: "fee", label: "Fee", w: 96, num: true, kind: "money", edit: "text", render: (l) => money(l.fee) }, { key: "ins", label: MONEY_LABEL.insEst, w: 96, num: true, kind: "money", edit: "text", render: (l) => money(l.ins) },
        derived("wo"), derived("pt")] });
  })();
  const extra = cash ? `<span class="text-[13px] text-gray-500 ps-1">Received</span>${moneyInput("220.00", "Amount received", { cls: "w-28 shrink-0" })}<span class="text-[13px] text-gray-500 whitespace-nowrap px-1">Change <span class="text-gray-800 tabular-nums font-medium">${money(add(220, -due))}</span></span>` : "";
  const head = V4 ? `<div${chg4("Checkout opens with the one patient header: Ava's name, her alert as one icon with the count and her balance as a wallet by the name, and the visit under it")}>${patientHeader({ name: p.name, sub: "Check out · Today, 9:00 AM · Op 1 · Dr. Maya Patel · Delta Dental PPO", alerts: p.alerts, familyBalance: PRIOR, rule: false,
      actions: segmented(["Patient checkout", "Insurance remittance"], 0, { sm: true }), end: iconButton("x", "Close", { s: "iconSm" }) })}</div>`
    : `<div class="flex items-center gap-3 px-5 pt-4 pb-3">${avatar(p.name, { size: 9 })}<div class="min-w-0 grow"><h2 class="text-base font-semibold text-gray-800">Check out ${p.name}</h2><p class="text-[13px] text-gray-500">Today, 9:00 AM · Op 1 · Dr. Maya Patel · Delta Dental PPO</p></div>
      ${segmented(["Patient checkout", "Insurance remittance"], 0, { sm: true })}${iconButton("x", "Close", { s: "iconSm" })}</div>`;
  return `<div class="${R.dialog} !w-full" role="dialog" aria-label="Check out ${p.name}">
    ${head}
    <div${chg("The library's one step bar: done steps get a blue check, and every step can be picked")}>${stepBar(CO_STEPS, 1)}</div>
    <div>
      ${psec(`<span${chg("Today's charges sit on the claim form's compact sheet, the same sheet as claims, EOBs and posting")}>Today's charges</span>`, V4 ? `<div${chg4("Fee and Ins. est. are cells you click or type into (Enter saves and moves down). Write-off, Pt. est., Due today and the amount to collect follow as you type; an estimate above the allowed fee gets the orange mark")}>${sheet4}</div>` : sheet, { count: VISIT.length, cls: "!border-t-0" })}
      <div class="grid grid-cols-2 border-t border-gray-200/80">
        ${psec("Due today", `<div${chg("Due today is a 3-row table: the charges' totals row already shows fee, insurance, write-off and patient estimate, so they aren't repeated")}${V4 ? " data-due" : ""}>${moneySteps([[`${MONEY_LABEL.ptEst} today`, t.pt], ["Prior balance", PRIOR]], ["Due today", due])}</div>`, { cls: "!border-t-0" })}
        ${psec("Apply to", `<div class="space-y-2">${[["This visit and prior balance", true], ["This visit only", false], ["Hold as unapplied credit", false]].map(([l, on]) => `<label class="flex items-center gap-2.5 text-sm text-gray-800"><input type="radio" name="apply-co2-${esc(state)}" class="${R.radio}" ${on ? "checked" : ""} ${waiting ? "disabled" : ""} />${l}</label>`).join("")}</div><p class="${R.help} mt-3">Oldest charges are paid first. Insurance estimates are from Delta Dental's fee schedule.</p>`, { cls: "!border-t-0 border-s" })}
      </div>
      ${psec("Method", `<div${chg("The method row is the same component as Collect payment: method, reader, amount and the collect button on one line")}${V4 ? " data-method" : ""}>${v2bcMethodRow({ method: cash ? "Cash" : "Card terminal", reader: true, amount: due, waiting, due, who: "Ava", extra })}</div>`)}
    </div>
    <div class="flex items-center justify-between gap-2 px-5 py-3 border-t border-gray-200/80">${button("Back", { v: "quiet", s: "sm", icon: "arrow-left" })}<div class="flex items-center gap-2"><span class="text-[13px] text-gray-500">${waiting ? "Finish the payment or cancel it to go on" : "You can skip payment and collect later"}</span>${button("Next visits", { v: "white", s: "sm", iconEnd: "arrow-right", attrs: waiting ? "disabled" : "" })}</div></div></div>`;
}
defineBlock({
  cat: "billing", id: "billing-checkout-payment", title: "Checkout, Payment step",
  note: "Checkout v2 on the Payment step. Any step can be picked. The totals read as one equation, and the collect button sits on the Method row itself: Send to terminal, Record, or Charge.",
  where: "Schedule › Appointment › Check out",
  states: ["Card terminal", "Cash", "Waiting for card"],
  html: (state) => {
    const t = { fee: sum(VISIT, "fee"), ins: sum(VISIT, "ins"), wo: sum(VISIT, "wo"), pt: sum(VISIT, "pt") };
    const due = add(t.pt, PRIOR), waiting = state === "Waiting for card", cash = state === "Cash";
    const p = DATA.patient("p1");
    if (V2) return v2Checkout(state, t, due);
    const lines = bleed(`<div class="overflow-x-auto" data-scroll-ok><table class="w-full border-separate border-spacing-0 text-sm"><thead><tr>${["Code", "Tooth", "Description", "Fee", "Ins. est.", "Write-off", "Patient est."].map((h, i) => `<th class="${R.tHead} ${edge(i, 7)} ${i >= 3 ? "!text-end w-28" : i < 2 ? "w-20" : ""}">${h}</th>`).join("")}</tr></thead>
      <tbody>${VISIT.map((l) => `<tr><td class="${R.tCell} !ps-5 tabular-nums">${l.code}</td><td class="${R.tCell} tabular-nums">${l.tooth ? `#${l.tooth} ${l.surf}` : dim()}</td><td class="${R.tCell} max-w-0 truncate">${l.desc}</td>${["fee", "ins", "wo", "pt"].map((k, j) => `<td class="${R.tCell} ${j === 3 ? "!pe-5" : ""} text-end tabular-nums ${!l[k] ? "text-gray-400" : ""}">${money(l[k])}</td>`).join("")}</tr>`).join("")}</tbody>
      <tfoot><tr><td colspan="3" class="h-9 ps-5 pe-3 font-medium text-gray-800">Total</td>${["fee", "ins", "wo", "pt"].map((k, j) => `<td class="h-9 ${j === 3 ? "ps-3 pe-5" : "px-3"} text-end font-semibold tabular-nums">${money(t[k])}</td>`).join("")}</tr></tfoot></table></div>`);
    const methodRow = waiting
      ? `<div class="flex items-center gap-3 min-h-9">${spinner()}<div class="grow"><p class="text-sm font-medium text-gray-800">Waiting for card…</p><p class="${R.help}">Card terminal · ${money(due)} sent to the Front desk reader. Ask Ava to tap, insert or swipe.</p></div>${button("Cancel payment", { v: "white", s: "sm" })}</div>`
      : `<div class="flex items-center gap-2">${selectBtn(cash ? "Cash" : "Card terminal", { icon: cash ? "banknote" : "smartphone", cls: "!w-44" })}
        ${cash ? `${moneyInput(due.toFixed(2), "Amount", { cls: "w-32" })}<span class="text-[13px] text-gray-500 ps-1">Received</span>${moneyInput("220.00", "Amount received", { cls: "w-28" })}<span class="text-[13px] text-gray-500 whitespace-nowrap px-1">Change <span class="text-gray-800 tabular-nums font-medium">${money(add(220, -due))}</span></span>`
               : `${selectBtn(`Front desk reader ${statusDot("Connected", "on", "!text-[13px] !text-gray-500 ms-1")}`, { cls: "!w-72" })}${moneyInput(due.toFixed(2), "Amount", { cls: "w-32" })}`}
        <span class="ms-auto"></span>${button(cash ? "Record" : "Send to terminal", { v: "solid", icon: cash ? "check" : "send" })}</div>`;
    return `<div class="${R.dialog} !w-full" role="dialog" aria-label="Check out ${p.name}">
      <div class="flex items-center gap-3 px-5 pt-4 pb-3">${avatar(p.name, { size: 9 })}<div class="min-w-0 grow"><h2 class="text-base font-semibold text-gray-800">Check out ${p.name}</h2><p class="text-[13px] text-gray-500">Today, 9:00 AM · Op 1 · Dr. Maya Patel · Delta Dental PPO</p></div>
        ${segmented(["Patient checkout", "Insurance remittance"], 0, { sm: true })}${iconButton("x", "Close", { s: "iconSm" })}</div>
      <div class="px-4 pb-2.5 border-b border-gray-200/80">${coStepBar(["Review", "Payment", "Next visits", "Finish"], 1, [0])}</div>
      <div>
        ${psec("Today's charges", lines, { count: VISIT.length, cls: "!border-t-0 !pb-0" })}
        <div class="grid grid-cols-2 border-t border-gray-200/80">
          ${psec("Patient responsibility", waterfall([["", "Office fee", t.fee], ["−", "Insurance estimate", t.ins], ["−", "Write-off", t.wo], ["=", "Patient responsibility", t.pt, { total: true }], ["+", "Prior balance", PRIOR], ["=", "Due today", due, { total: true }]]), { cls: "!border-t-0" })}
          ${psec("Apply to", `<div class="space-y-2">${[["This visit and prior balance", true], ["This visit only", false], ["Hold as unapplied credit", false]].map(([l, on]) => `<label class="flex items-center gap-2.5 text-sm text-gray-800"><input type="radio" name="apply-co-${esc(state)}" class="${R.radio}" ${on ? "checked" : ""} ${waiting ? "disabled" : ""} />${l}</label>`).join("")}</div><p class="${R.help} mt-3">Oldest charges are paid first. Insurance estimates are from Delta Dental's fee schedule.</p>`, { cls: "!border-t-0 border-s" })}
        </div>
        ${psec("Method", methodRow)}
      </div>
      <div class="flex items-center justify-between gap-2 px-5 py-3 border-t border-gray-200/80">${button("Back", { v: "quiet", s: "sm", icon: "arrow-left" })}<div class="flex items-center gap-2"><span class="text-[13px] text-gray-500">${waiting ? "Finish the payment or cancel it to go on" : "You can skip payment and collect later"}</span>${button("Next visits", { v: "white", s: "sm", iconEnd: "arrow-right", attrs: waiting ? "disabled" : "" })}</div></div></div>`;
  },
  mount: (el) => V2 ? el.addEventListener("click", (e) => { const b = e.target.closest("[data-steps] [data-step]"); if (b) b.closest("[data-steps]").outerHTML = stepBar(CO_STEPS, +b.dataset.step); icons(); })
    : el.querySelector("nav[aria-label='Checkout steps']")?.addEventListener("click", (e) => { const b = e.target.closest("[data-step]"); if (!b) return; [...b.parentElement.querySelectorAll("[data-step]")].forEach((x) => { const on = x === b; x.className = cx(R.btn, R.sm, on ? "bg-gray-100 border-transparent text-gray-900" : "bg-transparent border-transparent text-gray-600 hover:bg-gray-100"); on ? x.setAttribute("aria-current", "step") : x.removeAttribute("aria-current"); }); })
});

/* ======================================================= 5. Collect payment panel */
const APPLY = [["This patient", "Oldest charges first", 48], ["Family / guarantor", "Ethan, Mia and Chloe · after Mia's $25.00 credit", 23], ["Specific visit", "Aug 25 · Comprehensive exam, x-rays", 48], ["Treatment plan deposit", "Collect toward an accepted plan", null], ["Hold as unapplied credit", "Keep available for future allocation", null]];
/* v2 collect payment: amount and method first (the method row is shared with checkout, collect button inline), Apply to
 * as one boxed list of 36px rows, and Waiting for card keeps the panel in place. */
/* v4 collect payment: the payment's fields are one table you type into (amount, date, method, reader, receipt); the
 * collect button is the footer's one solid button and follows the amount and method. */
const V4B_METHODS = ["Card terminal", "Saved card · Visa ····4242", "New card", "Cash", "Check"];
const v4bCta = (method, amt) => (/^Card terminal/.test(method) ? [`Send ${money(amt)} to terminal`, "send"] : /^(Cash|Check)/.test(method) ? [`Record ${money(amt)}`, "check"] : [`Charge ${money(amt)}`, "credit-card"]);
function v4bCollectFields(amt, waiting) {
  const t = waiting ? "none" : null, row = (label, value, type, o = {}) => ({ label, value, type: t || type, ...o });
  const reader = (r) => `<span class="inline-flex items-center gap-2 min-w-0"><span class="truncate">${esc(r.value)}</span>${statusDot("Connected", "on", "!text-[13px] !text-gray-500")}</span>`;
  return [row("Amount", amt.toFixed(2), "text", { html: v4bMoneyCell, amount: true }), row("Date", "Sep 25, 2026", "text"),
    row("Method", "Card terminal", "select", { options: V4B_METHODS, method: true, html: (r) => `<span class="inline-flex items-center gap-2">${I(V2BC_METHOD_ICON[r.value.split(" · ")[0]] || "credit-card", "size-3.5 text-gray-500")}${esc(r.value)}</span>` }),
    row("Reader", "Front desk reader", "select", { options: ["Front desk reader", "Op 1 reader", "Op 2 reader"], html: reader }),
    row("Receipt", ["Text to (925) 555-0187"], "multi", { options: ["Text to (925) 555-0187", "Email to ethan.walker@example.com", "Print"], html: (r) => esc(listValues(r.value).join(" · ") || "No receipt") })];
}
const v4bCollectCommit = (row, k, v, g) => {
  const get = (f) => g.data.find(f), amt = v4bNum(get((x) => x.amount).value);
  if (row.amount && (amt == null || amt <= 0)) return "Type an amount, like 48.00.";
  const cta = g.root.closest("aside")?.querySelector("[data-collect-cta]"); if (!cta || amt == null) return;
  const [label, icon] = v4bCta(get((x) => x.method).value, amt); cta.innerHTML = button(label, { v: "solid", s: "sm", icon }); icons();
};
function v2Collect(state, b, amt) {
  const waiting = state === "Waiting for card";
  const lock = (html) => (waiting ? `<div class="opacity-60 pointer-events-none select-none" inert>${html}</div>` : html);
  const apply = `<div class="rounded-lg border border-gray-200/80 divide-y divide-gray-200/80" role="radiogroup" aria-label="Apply to"${chg("Apply to is one boxed list of 36px rows; each option's explanation shows on hover. The five rows took 265px.")}>${APPLY.map(([l, s, v], i) => `<label class="flex h-9 items-center gap-3 px-3 cursor-pointer hover:bg-gray-50" data-tip="${esc(s)}"><input type="radio" name="apply-cp2-${esc(state)}" class="${R.radio}" ${i === 0 ? "checked" : ""} /><span class="grow min-w-0 truncate text-sm text-gray-800">${l}</span>${v != null ? `<span class="text-sm tabular-nums text-gray-800">${money(v)}</span>` : ""}</label>`).join("")}</div>`;
  const method = waiting
    ? `<div${chg("While the card is on the reader only the method row changes; the rest of the panel stays put, as in checkout")}>${v2bcMethodRow({ waiting: true, due: amt, who: "Ethan" })}</div>`
    : `<div${chg("The collect button sits on the method row, as in checkout, with the same method names (Card terminal, Saved card, New card, Cash, Check)")}>${v2bcMethodRow({ method: "Card terminal" })}</div>`;
  const form = V4 ? `${psec("Payment", `${waiting ? `<div class="mb-3">${v2bcMethodRow({ waiting: true, due: amt, who: "Ethan" })}</div>` : ""}<div${chg4(waiting ? "While the card is on the reader the payment's fields are plain cells, so nothing changes mid-payment; Cancel payment stays in reach" : "The payment is one table of fields you type into: amount, date, method, reader and receipt (the receipt checkbox became a row where you tick text, email and print, any or all). The collect button moved to the footer and follows the amount and method: Send to terminal, Record or Charge")}>${fieldTable(v4bCollectFields(amt, waiting), { title: "Payment", onCommit: v4bCollectCommit })}</div><p class="${R.help} mt-2">We don't add card fees.</p>`)}
      ${psec("Apply to", lock(apply))}
      ${psec("Note", lock(`<textarea class="${R.textarea} !min-h-16" placeholder="Document payment details or comments…" aria-label="Payment note"></textarea>`))}`
    : `${psec(`<span${chg("The amount comes first: it's what the front desk types; Apply to is usually \"This patient\"")}>Payment</span>`, `<div class="space-y-4">${lock(`<div class="grid grid-cols-2 gap-3">${field("Amount", moneyInput(amt.toFixed(2), "Amount"))}${field("Date", selectBtn("Sep 25, 2026", { icon: "calendar" }))}</div>
        ${field("Reader", selectBtn(`Front desk reader ${statusDot("Connected", "on", "!text-[13px] !text-gray-500 ms-1")}`), { hint: "We don't add card fees." })}`)}
        ${field("Method", method)}</div>`)}
      ${psec("Apply to", lock(apply))}
      ${psec("Note and receipt", lock(`<div class="space-y-3"><textarea class="${R.textarea} !min-h-16" placeholder="Document payment details or comments…" aria-label="Payment note"></textarea>
        <label class="flex items-center gap-2.5 text-sm text-gray-800">${checkbox(true, "Text receipt")}Text receipt to (925) 555-0187</label></div>`))}`;
  const applied = [["D0150", "Comprehensive exam · Aug 25", 19], ["D0210", "Full mouth x-rays · Aug 25", 29]];
  const paid = `<section class="${R.psec} flex items-start gap-3"><span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">${I("check", "size-5")}</span><div><p class="text-base font-semibold text-gray-800">Payment recorded</p><p class="${R.help}">Visa ····4242 · receipt texted to (925) 555-0187</p></div></section>
    ${psec(`<span${chg("What the payment paid sits on the claim form's compact sheet, with a header row")}>Applied to</span>`, v2bcSheet({ title: "Applied to", rows: applied.map(([c, d, v]) => ({ c, d, v })), foot: ["Total applied", "", money(amt)],
      columns: [{ label: "Code", w: 72, render: (o) => `<span class="tabular-nums">${o.c}</span>` }, { label: "Description", w: 200, flex: true, render: (o) => `<span class="text-gray-600">${o.d}</span>` }, { label: "Amount", w: 96, num: true, render: (o) => money(o.v) }] }), { count: applied.length })}
    ${psec(`<span${chg("The balance math is a full-width table with one right-aligned amount column")}>Account balance</span>`, `${moneySteps([["Balance before", b.balance], ["This payment", -amt]], ["Balance after", add(b.balance, -amt)])}
      <p class="${R.help} mt-3">What's left, ${money(b.insEst)}, is waiting on Delta Dental for the Sep 18 fillings.</p>`)}`;
  const footer = V4 && state === "Ready" ? `${button("Send payment link", { v: "white", s: "sm", icon: "link" })}<span data-collect-cta>${button(v4bCta("Card terminal", amt)[0], { v: "solid", s: "sm", icon: "send" })}</span>`
    : state === "Ready" ? `<span${chg("The footer keeps only Send payment link; collecting happens on the method row")}>${button("Send payment link", { v: "white", s: "sm", icon: "link" })}</span>`
    : state === "Paid" ? `${button("Print receipt", { v: "white", s: "sm", icon: "printer" })}${button("Done", { v: "solid", s: "sm" })}` : "";
  const pt = DATA.patient("p10"), head = V4 ? { title: `<span${chg4("The panel's top is the one patient header: Ethan's name with his alerts and the family balance as marks by it, and what you're doing (Collect payment) under the name")}>${pt.name}</span>`, subtitle: `Collect payment · Patient est. ${money(b.ptEst)}`, marks: patientMarks({ alerts: pt.alerts, familyBalance: balances(true).balance }) }
    : { title: "Collect payment", subtitle: `Ethan Walker · Patient EST ${money(b.ptEst)}` };
  return `<div class="flex min-h-[700px]">${faded(V4 ? v4bChartSlice() : `${chartHeader()}${tabsWithSlot(BILLING_TABS, 0)}<div class="p-4">${v2Tiles(balances(false), false)}</div>${staticLedger([...ledgerRows(false)].reverse())}`)}${sheetPanel({ flush: true, cls: "shrink-0 !h-auto self-stretch",
    ...head, lead: avatar("Ethan Walker", { size: 9 }),
    body: state === "Paid" ? paid : form, footer })}</div>`;
}
defineBlock({
  cat: "billing", id: "billing-collect-payment", title: "Collect payment",
  note: "The side panel behind Collect payment: what the money applies to, the amount, how they're paying, and Send payment link when the patient isn't at the desk. The apply-to choices and methods switch.",
  where: "Charts › Billing › Collect payment",
  states: ["Ready", "Waiting for card", "Paid"],
  canvas: "bare",
  html: (state) => {
    const b = balances(false), amt = 48;
    if (V2) return v2Collect(state, b, amt);
    const ready = `${psec("Apply to", bleed(`<div role="radiogroup" aria-label="Apply to">${APPLY.map(([l, s, v], i) => `<label class="flex items-center gap-3 px-5 py-2 min-h-11 border-t border-gray-200/80 cursor-pointer hover:bg-gray-50"><input type="radio" name="apply-cp" class="${R.radio}" ${i === 0 ? "checked" : ""} /><span class="grow min-w-0"><span class="block text-sm text-gray-800">${l}</span><span class="block ${R.caption} truncate">${s}</span></span>${v != null ? `<span class="text-sm tabular-nums text-gray-800">${money(v)}</span>` : ""}</label>`).join("")}</div>`), { cls: "!pb-0" })}
      ${psec("Payment", `<div class="space-y-4"><div class="grid grid-cols-2 gap-3">${field("Amount", moneyInput(amt.toFixed(2), "Amount"))}${field("Date", selectBtn("Sep 25, 2026", { icon: "calendar" }))}</div>
        ${field("Method", `<div data-methods>${segmented(["Terminal", "Card on file", "New card", "Cash", "Check"], 0, { sm: true })}</div>`)}
        ${field("Reader", selectBtn(`Front desk reader ${statusDot("Connected", "on", "!text-[13px] !text-gray-500 ms-1")}`), { hint: "We don't add card fees." })}</div>`)}
      ${psec("Note and receipt", `<div class="space-y-3"><textarea class="${R.textarea} !min-h-16" placeholder="Document payment details or comments..." aria-label="Payment note"></textarea>
        <label class="flex items-center gap-2.5 text-sm text-gray-800">${checkbox(true, "Text receipt")}Text receipt to (925) 555-0187</label></div>`)}`;
    const waiting = `<section class="${R.psec} flex flex-col items-center text-center !pt-16 !pb-12 gap-2">${spinner("size-6")}<p class="text-base font-semibold text-gray-800 mt-2">Waiting for card...</p><p class="${R.help} max-w-72">${money(amt)} is on the Front desk reader. Ask Ethan to tap, insert or swipe.</p><div class="mt-4">${button("Cancel payment", { v: "white", s: "sm" })}</div></section>
      ${psec("Payment", metaGrid([["Apply to", "This patient, oldest first"], ["Receipt", "Text to (925) 555-0187"]], 2))}`;
    const applied = [["D0150", "Comprehensive exam · Aug 25", 19], ["D0210", "Full mouth x-rays · Aug 25", 29]];
    const paid = `<section class="${R.psec} flex items-start gap-3"><span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">${I("check", "size-5")}</span><div><p class="text-base font-semibold text-gray-800">Payment recorded</p><p class="${R.help}">Visa ····4242 · receipt texted to (925) 555-0187</p></div></section>
      ${psec("Applied to", bleed(`<table class="w-full border-separate border-spacing-0 text-sm"><tbody>${applied.map(([c, d, v], i) => `<tr><td class="${R.tCell} !ps-5 tabular-nums w-20 ${i ? "" : "border-t"}">${c}</td><td class="${R.tCell} text-gray-600 ${i ? "" : "border-t"}">${d}</td><td class="${R.tCell} !pe-5 text-end tabular-nums ${i ? "" : "border-t"}">${money(v)}</td></tr>`).join("")}</tbody><tfoot><tr><td colspan="2" class="h-9 ps-5 pe-3 font-medium">Total applied</td><td class="h-9 ps-3 pe-5 text-end font-semibold tabular-nums">${money(amt)}</td></tr></tfoot></table>`), { count: applied.length, cls: "!pb-0" })}
      ${psec("Account balance", `${waterfall([["", "Balance before", b.balance], ["−", "This payment", amt], ["=", "Balance after", add(b.balance, -amt), { total: true }]])}
        <p class="${R.help} mt-3">What's left, ${money(b.insEst)}, is waiting on Delta Dental for the Sep 18 fillings.</p>`)}`;
    const footer = state === "Ready" ? `${button("Send payment link", { v: "white", s: "sm", icon: "link" })}${button(`Send ${money(amt)} to terminal`, { v: "solid", s: "sm", icon: "send" })}`
      : state === "Paid" ? `${button("Print receipt", { v: "white", s: "sm", icon: "printer" })}${button("Done", { v: "solid", s: "sm" })}` : "";
    return `<div class="flex min-h-[700px]">${faded(`${chartHeader()}${tabsWithSlot(BILLING_TABS, 0)}<div class="p-4">${tiles(balances(false), false)}</div>${staticLedger([...ledgerRows(false)].reverse())}`)}${sheetPanel({ flush: true, cls: "shrink-0 !h-auto self-stretch",
      title: "Collect payment", subtitle: `Ethan Walker · Patient EST ${money(b.ptEst)}`, lead: avatar("Ethan Walker", { size: 9 }),
      body: state === "Ready" ? ready : state === "Waiting for card" ? waiting : paid, footer })}</div>`;
  }
});

/* ======================================================= 6. Payment plan dialog */
function planSchedule(total, n, start) {
  const monthly = Math.floor((total / n) * 100) / 100, out = []; let left = total;
  const [y, m] = start.split("-").map(Number);
  for (let i = 0; i < n; i++) { const amt = i === n - 1 ? left : monthly; left = add(left, -amt); const d = new Date(Date.UTC(y, m - 1 + i, 1)); out.push({ n: i + 1, date: `${MONTHS[d.getUTCMonth()]} 1, ${d.getUTCFullYear()}`, amt, left }); }
  return { monthly, rows: out };
}
/* v4 payment plan: the plan's settings are one table of fields you type into; the schedule beside it redraws as you
 * change the total, the number of payments or the start month. */
const V4B_STARTS = ["Oct 1, 2026", "Nov 1, 2026", "Dec 1, 2026", "Jan 1, 2027"];
const v4bStartIso = (label) => { const [m, , y] = label.replace(",", "").split(" "); return `${y}-${String(MONTHS.indexOf(m) + 1).padStart(2, "0")}-01`; };
function v4bPlanSchedule(total, n, start) {
  const s = planSchedule(total, n, v4bStartIso(start)), last = s.rows[n - 1];
  return section(`${money(s.monthly)}/month <span class="font-normal text-gray-500">× ${n} payments</span>`, `<p class="${R.help} -mt-1 mb-2.5 tabular-nums">${s.rows[0].date} – ${last.date} · next charge ${s.rows[0].date}${last.amt !== s.monthly ? ` · last payment is ${money(last.amt)} so the total matches` : ""}</p>
    ${v2bcSheet({ title: "Schedule", rows: s.rows, foot: ["Total", "", money(sum(s.rows, "amt")), ""],
      columns: [{ label: "#", w: 40, render: (r) => `<span class="text-gray-500 tabular-nums">${r.n}</span>` }, { label: "Date", w: 120, flex: true, render: (r) => `<span class="tabular-nums">${r.date}</span>` }, { label: "Amount", w: 104, num: true, render: (r) => `<span class="${r.amt !== s.monthly ? "font-medium" : ""}">${money(r.amt)}</span>` }, { label: "Left after", w: 104, num: true, render: (r) => (r.left ? money(r.left) : dim(money(0))) }] })}`);
}
function v4bPlanBody(n) {
  const rows = [{ label: "Plan name", value: "Crown and buildup on #30", type: "text" }, { label: "Total amount", value: "1320.00", type: "text", html: v4bMoneyCell, key: "total" },
    { label: "Number of payments", value: String(n), type: "select", options: ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"], key: "n" }, { label: "Start date", value: V4B_STARTS[0], type: "select", options: V4B_STARTS, key: "start" },
    { label: "Payment method", value: "Visa ····4242 · exp 08/28", type: "select", options: ["Visa ····4242 · exp 08/28", "Mastercard ····8810 · exp 03/27", "Pay each month at the desk"] },
    { label: "Auto-charge", value: "On the 1st of each month", type: "select", options: ["On the 1st of each month", "On the 15th of each month", "Off"] }];
  const onCommit = (row, k, v, g) => { const get = (key) => g.data.find((x) => x.key === key).value, total = v4bNum(get("total"));
    if (row.key === "total" && (total == null || total <= 0)) return "Type the plan's total, like 1,320.00.";
    const box = g.root.closest('[role="dialog"]')?.querySelector("[data-plan-schedule]"); if (box && total) { box.innerHTML = v4bPlanSchedule(total, +get("n"), get("start")); icons(); } };
  return `<div class="grid grid-cols-[1fr_1.1fr] gap-6">
    <div class="space-y-4"><div${chg4("The plan's settings are one table of fields you type into, like the rest of v4: name, total, number of payments, start, card and auto-charge (the switch became a row). Change the total, payments or start and the schedule redraws")}>${fieldTable(rows, { title: "Plan", labelW: 152, onCommit })}</div>
      ${field('Notes <span class="font-normal text-gray-400">(optional)</span>', `<textarea class="${R.textarea} !min-h-16" placeholder="Optional notes about this payment plan..." aria-label="Notes"></textarea>`)}</div>
    <div class="min-w-0" data-plan-schedule>${v4bPlanSchedule(1320, n, V4B_STARTS[0])}</div></div>`;
}
defineBlock({
  cat: "billing", id: "billing-payment-plan", title: "New payment plan",
  note: "Plan name, total, number of payments, start date and card, with the whole schedule underneath. When the total doesn't split evenly, the last payment takes the difference and says so.",
  where: "Charts › Billing › Payment Plans › New Plan",
  states: ["6 payments", "7 payments, uneven"],
  html: (state) => {
    const n = state === "6 payments" ? 6 : 7, total = 1320, s = planSchedule(total, n, "2026-10-01"), last = s.rows[n - 1];
    if (V4) return `<div class="flex justify-center">${dialogFrame({ title: "New Payment Plan", sub: "Set up an installment plan for Lucas Foster. Monthly payments are calculated automatically.", body: v4bPlanBody(n), w: "w-[820px]", footer: `${button("Cancel", { v: "white", s: "sm" })}${button("Create Plan", { v: "solid", s: "sm" })}` })}</div>`;
    const body = `<div class="grid grid-cols-[1fr_1.1fr] gap-6">
      <div class="space-y-4">
        ${field("Plan Name", `<input class="${R.input}" value="Crown and buildup on #30" aria-label="Plan Name" />`)}
        <div class="grid grid-cols-2 gap-3">${field("Total Amount", moneyInput("1,320.00", "Total Amount"))}${field("# of Payments", `<input class="${R.input} tabular-nums" value="${n}" aria-label="Number of payments" />`)}</div>
        ${field("Start Date", selectBtn("Oct 1, 2026", { icon: "calendar" }))}
        ${field("Payment Method", selectBtn("Visa ····4242 · exp 08/28", { icon: "credit-card" }))}
        <div class="flex items-center justify-between gap-6 min-h-11"><div><p class="${R.label}">Auto-charge</p><p class="${R.help}">Charge this card on the 1st of each month</p></div>${sw(true, "Auto-charge")}</div>
        ${field('Notes <span class="font-normal text-gray-400">(optional)</span>', `<textarea class="${R.textarea} !min-h-16" placeholder="Optional notes about this payment plan..." aria-label="Notes"></textarea>`)}
      </div>
      <div class="min-w-0">${section(`${money(s.monthly)}/month <span class="font-normal text-gray-500">× ${n} payments</span>`, `<p class="${R.help} -mt-1 mb-2.5 tabular-nums">${s.rows[0].date} – ${last.date} · next charge ${s.rows[0].date}${last.amt !== s.monthly ? ` · last payment is ${money(last.amt)} so the total matches` : ""}</p>
        ${V2 ? `<div${chg("The schedule uses the money-sheet look (compact rows, cell lines), like the other money tables")}>${v2bcSheet({ title: "Schedule", rows: s.rows, foot: ["Total", "", money(sum(s.rows, "amt")), ""],
          columns: [{ label: "#", w: 40, render: (r) => `<span class="text-gray-500 tabular-nums">${r.n}</span>` }, { label: "Date", w: 120, flex: true, render: (r) => `<span class="tabular-nums">${r.date}</span>` }, { label: "Amount", w: 104, num: true, render: (r) => `<span class="${r.amt !== s.monthly ? "font-medium" : ""}">${money(r.amt)}</span>` }, { label: "Left after", w: 104, num: true, render: (r) => (r.left ? money(r.left) : dim(money(0))) }] })}</div>` : `<div class="${R.tableBox}"><table class="border-separate border-spacing-0 text-sm"><thead><tr><th class="${R.tHead} w-10">#</th><th class="${R.tHead}">Date</th><th class="${R.tHead} !text-end">Amount</th><th class="${R.tHead} !text-end">Left after</th></tr></thead>
        <tbody>${s.rows.map((r) => `<tr><td class="${R.tCell} text-gray-500 tabular-nums">${r.n}</td><td class="${R.tCell} tabular-nums">${r.date}</td><td class="${R.tCell} text-end tabular-nums ${r.amt !== s.monthly ? "font-medium" : ""}">${money(r.amt)}</td><td class="${R.tCell} text-end tabular-nums ${r.left ? "" : "text-gray-400"}">${money(r.left)}</td></tr>`).join("")}</tbody>
        <tfoot><tr><td colspan="2" class="h-9 px-3 font-medium">Total</td><td class="h-9 px-3 text-end font-semibold tabular-nums">${money(sum(s.rows, "amt"))}</td><td></td></tr></tfoot></table></div>`}`)}</div></div>`;
    return `<div class="flex justify-center">${dialogFrame({ title: "New Payment Plan", sub: "Set up an installment plan for Lucas Foster. Monthly payments are calculated automatically.", body, w: "w-[820px]", footer: `${button("Cancel", { v: "white", s: "sm" })}${button("Create Plan", { v: "solid", s: "sm" })}` })}</div>`;
  }
});

/* ======================================================= 7. Statements batch page */
const STMT = [["p15", 2150, "Mail"], ["p8", 1320, "Email + Text"], ["p5", 740, "Email"], ["p13", 410, "Mail"], ["x1", 327.25, "Email + Text", "Zoe Martinez"], ["x2", 212.4, "Email", "Nora Castillo"], ["p1", 184, "Email + Text"], ["x3", 145, "Mail", "Samuel Greene"], ["x4", 88.1, "Text", "Aria Delgado"], ["p3", 62.5, "Email"], ["x5", 58, "Mail", "Henry Lawson"], ["p10", 23, "Email + Text"]]
  .map(([id, amt, via, name], i) => ({ id, name: name || DATA.patient(id).name, amt, via, fam: [2, 1, 1, 3, 2, 1, 1, 4, 1, 1, 2, 3][i], last: ["2026-08-24", "2026-08-24", "2026-08-24", "", "2026-08-24", "2026-07-24", "2026-08-24", "2026-08-24", "", "2026-08-24", "2026-06-24", "2026-09-01"][i], st: id === "x5" ? "needs" : id === "p13" ? "plan" : "ready" }));
const STMT_ST = { ready: ["Ready", "on"], needs: ["No address", "needs"], plan: ["On payment plan", "quiet"] };
const BATCHES = [["September 2026", "Sep 24", "Ready for review", "on", 12], ["August 2026", "Aug 24", "Sent", "off", 14], ["July 2026", "Jul 24", "Partially sent", "mid", 11], ["June 2026", "Jun 24", "Delivered", "off", 13], ["May 2026", "May 24", "Failed", "needs", 9]];
/* v2 statements: the batch name and status are the page title, the batch numbers are the grid's footer, and the grid
 * starts right under the header (the page had 5 rows, 176px, above the grid). */
function v2Statements({ none, proc, total, avg, list }) {
  const meta = `${proc ? "Started Sep 25, 9:02 AM by Nina Flores" : "Generated Sep 24, 9:02 AM by Asha"} · Bayview Family Dental · Avg / Patient ${money(avg)} · Totals include family account balances (not all collectible)`;
  const title = none ? "Statements" : `<span class="inline-flex items-center gap-2"${chg("The batch name and its status are the page title; who generated it, the average and the note about family balances show on the (i). The page lost 4 rows above the grid.")}>September 2026 ${statusDot(proc ? "Processing" : "Ready for review", proc ? "quiet" : "on", "!text-[13px] font-normal")}<span class="inline-flex text-gray-400 hover:text-gray-600 cursor-help" tabindex="0" data-tip="${esc(meta)}" aria-label="${esc(meta)}">${I("info", "size-4")}</span></span>`;
  return `${workspaceHeader({ parent: `Revenue Cycle${I("chevron-right", "inline size-3.5 mx-1.5 text-gray-300 align-[-2px]")}Statements`, title, actions: `${button("Statement settings", { v: "quiet", s: "sm", icon: "settings" })}${none ? "" : button("Generate statements", { v: "white", s: "sm", icon: "file-plus" })}` })}
    <div class="grid grid-cols-[248px_1fr] min-h-[560px]">
      <nav class="border-e border-gray-200/80 p-3" aria-label="Statement batches"><p class="${R.navGroup} !pt-1">All Batches</p>
        ${list.length ? list.map(([n, d, s, t, c], i) => `<a class="${i === 0 ? R.navItemOn : R.navItem} !h-auto py-2 flex-col !items-start !gap-0.5" ${i === 0 ? 'aria-current="page"' : ""}><span class="flex w-full items-center justify-between"><span>${n}</span><span class="text-xs text-gray-400 tabular-nums font-normal">${c}</span></span>${statusDot(s, t, "!text-xs !text-gray-500 font-normal")}</a>`).join("") : `<p class="px-2 py-2 ${R.help}">Batches you generate show up here.</p>`}</nav>
      <div class="min-w-0 px-4 pb-4">${none ? `<div class="${R.box} mt-4"${chg("One Generate statements button, solid, in the empty card; the header no longer repeats it")}>${emptyState({ icon: "mail", title: "No statement batches yet", body: "Generate a batch to send every family with a balance a statement by mail, email or text. Nothing is sent until you review it.", action: button("Generate statements", { v: "solid", s: "sm", icon: "file-plus" }) })}</div>`
        : proc ? `<div class="flex items-center gap-2 h-[52px] text-[13px] text-gray-600">${spinner("size-3.5")}Finalizing PDF… You can leave this page and return while drafts are prepared.</div><div${chg("The loading grid has the same column names as the loaded one (Last sent, not Last statement)")}>${gridSkeleton(["Guarantor", "Family", "Amount due", "Delivery", "Last sent", "Status"], 7)}</div>`
        : '<div data-grid="stmt"></div>'}</div></div>`;
}
/* v4 statements: Delivery is the column staff fix before sending, so it's a cell you change in the grid (no address?
 * switch the family to email and it's ready). A row still opens the statement, whose status is the first line of its
 * facts table. */
/* Delivery holds several ways at once (Email and Text), so it's a multi cell: ticks in the list, chips in the cell */
const V4B_VIA = ["Mail", "Email", "Text"];
const v4bVia = (v) => listValues(v).flatMap((x) => String(x).split(/\s*\+\s*/));
const v4bNeedsAddress = (via) => v4bVia(via).includes("Mail");
const V4B_NO_EMAIL = ["x3"]; // Samuel Greene has no email on file
const v4bAddress = (r) => (r.st === "needs" ? "" : `${120 + (hash(r.name) % 780)} ${["Laurel", "Alameda", "Bay", "Elm"][hash(r.name) % 4]} St, San Carlos, CA 94070`);
const V4B_STMT_ST = () => ({ ...STMT_ST, hold: ["Hold this month", "quiet"] });
const v4bStmtStatus = (r) => statusDot(...V4B_STMT_ST()[r.st]);
function v4bOpenStatement(r, g) {
  const stLabel = { ready: "Ready", plan: "On payment plan", hold: "Hold this month" };
  const rows = [{ label: "Status", value: r.st === "needs" ? "No address" : stLabel[r.st], type: "select", options: ["Ready", "Hold this month", "On payment plan"],
      html: (x) => `<span class="inline-flex items-center gap-2"><span class="${cx(R.dot, TONE_DOT[x.value === "No address" ? "needs" : x.value === "Ready" ? "on" : "quiet"])}"></span>${esc(x.value)}<span class="text-gray-500">· ${r.last ? `last sent ${fmtDate(r.last)}` : "first statement"}</span></span>` },
    { label: "Amount due", value: money(r.amt), type: "none" }, { label: "Family", value: `${r.fam} ${r.fam === 1 ? "person" : "people"}`, type: "none" },
    { label: "Delivery", value: v4bVia(r.via), type: "multi", options: V4B_VIA }, { label: "Mailing address", value: v4bAddress(r), type: "text" }];
  Sheet.open({ flush: true, title: esc(r.name), lead: avatar(r.name, { size: 9 }), subtitle: "September statement", tabs: ["Statement", "Activity"],
    marks: r.st === "needs" ? recordMark("circle-alert", "No mailing address on file. Add one below, or switch this family to email.", true) : "",
    body: psec("Statement", `<div${chg4("The statement's status is the first line of its facts table; Delivery and the mailing address are cells you fix right here")}>${fieldTable(rows, { title: "Statement",
      onCommit: (row, k, v) => { const src = g.data.find((x) => x.id === r.id); if (!src) return;
        if (row.label === "Delivery") { src.via = v; if (src.st === "needs" && !v4bNeedsAddress(v)) src.st = "ready"; }
        if (row.label === "Status") src.st = { Ready: "ready", "On payment plan": "plan", "Hold this month": "hold" }[v] || src.st;
        if (row.label === "Mailing address" && v && src.st === "needs") src.st = "ready";
        g.render(); } })}</div>`),
    footer: `${button("Preview", { v: "white", s: "sm", icon: "eye" })}${button("Send statement", { v: "solid", s: "sm", icon: "send" })}` });
}
function v4bStatementsGrid(host) {
  const g = new Grid(host, {
    gutter: 16, viewButton: false, noun: "patients", title: "In this batch", searchPlaceholder: "Search guarantors", maxHeight: 600, rows: STMT.map((r) => ({ ...r, via: v4bVia(r.via) })), addColumn: false, calc: { amt: "sum" }, sheet: true,
    columns: [
      { key: "name", label: "Guarantor", icon: "user", w: 196, open: true, kind: "text", lead: (r) => avatar(r.name, { size: 5 }), render: (r) => esc(r.name) },
      { key: "fam", label: "Family", icon: "users", w: 90, num: true, kind: "num", render: (r) => `${r.fam} <span class="text-gray-500">${r.fam === 1 ? "person" : "people"}</span>` },
      { key: "amt", label: "Amount due", w: 118, num: true, kind: "money", render: (r) => money(r.amt) },
      { key: "via", label: `<span${chg4("Delivery is a cell you change right in the list, and it holds several ways at once: tick Email and Text in its list (it stays open while you tick). Untick Mail for a family with no mailing address and the row is ready to send; a family with no email on file keeps the orange mark with the reason")}>Delivery</span>`, icon: "send", w: 150, kind: "text", edit: "multi", options: V4B_VIA, value: (r) => v4bVia(r.via).join(", ") },
      { key: "last", label: "Last sent", icon: "calendar", w: 118, kind: "date", render: (r) => (r.last ? fmtDate(r.last) : dim("First one")) },
      { key: "st", label: "Status", icon: "circle-dot", w: 158, kind: "text", normal: ["Ready"], value: (r) => V4B_STMT_ST()[r.st][0], render: v4bStmtStatus }
    ],
    filters: [{ key: "st", label: "Status", options: Object.entries(STMT_ST).map(([value, [label, tone]]) => ({ value, label, tone })) }, { key: "via", label: "Delivery", options: V4B_VIA.map((v) => ({ value: v, label: v })), match: (r, v) => v4bVia(r.via).includes(v) }],
    onCommit: (r, k, v) => { if (k !== "via") return;
      if (v4bVia(v).includes("Email") && V4B_NO_EMAIL.includes(r.id)) return `No email on file for ${r.name}. Add one in the chart first.`;
      if (!v4bVia(v).length) return "Pick at least one way to send it.";
      if (r.st === "needs" && !v4bNeedsAddress(v)) r.st = "ready"; },
    primary: { label: "Send selected", icon: "send" },
    bulk: [{ label: "Send", icon: "send" }, { label: "Download PDF", icon: "download" }, { label: "Remove from batch", icon: "x" }],
    onOpen: (r) => v4bOpenStatement(r, g)
  });
  return g;
}
defineBlock({
  cat: "billing", id: "billing-statements", title: "Statements batch",
  note: "A month's statement batch: batch statuses on the left, one plain line of numbers, then the grid. Send selected is the one blue button. Ticking rows brings up the bulk bar.",
  where: "Revenue Cycle › Statements",
  states: ["Ready for review", "Processing", "No batches yet"],
  canvas: "bare",
  html: (state) => {
    const none = state === "No batches yet", proc = state === "Processing";
    const total = sum(STMT, "amt"), avg = Math.round((total / STMT.length) * 100) / 100;
    const list = none ? [] : BATCHES.map((b, i) => (i === 0 && proc ? [b[0], "Sep 25", "Processing", "quiet", 12] : b));
    if (V2) return v2Statements({ none, proc, total, avg, list });
    return `${workspaceHeader({ parent: "Revenue Cycle", title: "Statements", actions: `${button("Statement settings", { v: "quiet", s: "sm", icon: "settings" })}${button("Generate statements", { v: none ? "solid" : "white", s: "sm", icon: "file-plus" })}` })}
    <div class="grid grid-cols-[248px_1fr] min-h-[560px]">
      <nav class="border-e border-gray-200/80 p-3" aria-label="Statement batches"><p class="${R.navGroup} !pt-1">All Batches</p>
        ${list.length ? list.map(([n, d, s, t, c], i) => `<a class="${i === 0 ? R.navItemOn : R.navItem} !h-auto py-2 flex-col !items-start !gap-0.5" ${i === 0 ? 'aria-current="page"' : ""}><span class="flex w-full items-center justify-between"><span>${n}</span><span class="text-xs text-gray-400 tabular-nums font-normal">${c}</span></span>${statusDot(s, t, "!text-xs !text-gray-500 font-normal")}</a>`).join("") : `<p class="px-2 py-2 ${R.help}">Batches you generate show up here.</p>`}</nav>
      <div class="min-w-0 px-6 pt-5 pb-4">${none ? `<div class="${R.box} mt-2">${emptyState({ icon: "mail", title: "No statement batches yet", body: "Generate a batch to send every family with a balance a statement by mail, email or text. Nothing is sent until you review it.", action: button("Generate statements", { v: "white", s: "sm", icon: "file-plus" }) })}</div>` : `
        <div class="flex items-center gap-3"><h1 class="${R.sectionTitle}">September 2026 statements</h1>${statusDot(proc ? "Processing" : "Ready for review", proc ? "quiet" : "on")}</div>
        <p class="mt-1 text-[13px] text-gray-500">${proc ? "Started Sep 25, 9:02 AM by Nina Flores" : "Generated Sep 24, 9:02 AM by Asha"} · Bayview Family Dental</p>
        <div class="mt-3 flex items-center gap-4 text-sm whitespace-nowrap">${[["Patients", String(STMT.length)], ["Total amount", money(total)], ["Avg / Patient", money(avg)]].map(([k, v]) => `<span class="text-gray-500">${k} <span class="ms-1 font-semibold text-gray-800 tabular-nums">${proc ? "—" : v}</span></span>`).join('<span class="h-4 border-s border-gray-200/80"></span>')}</div>
        <p class="mt-1 ${R.caption}">Totals include family account balances (not all collectible).</p>
        ${proc ? `<div class="mt-3 flex items-center gap-2 text-[13px] text-gray-600">${spinner("size-3.5")}Finalizing PDF… You can leave this page and return while drafts are prepared.</div><div class="mt-2">${gridSkeleton(["Guarantor", "Family", "Amount due", "Delivery", "Last statement", "Status"], 7, { gutter: 24 })}</div>` : '<div class="mt-1" data-grid="stmt"></div>'}`}</div></div>`;
  },
  mount: (el) => { const host = el.querySelector('[data-grid="stmt"]'); if (!host) return;
    if (V4) return v4bStatementsGrid(host);
    new Grid(host, {
      gutter: 24, title: "In this batch", searchPlaceholder: "Search guarantors", maxHeight: 510, rows: STMT, addColumn: false, calc: { amt: "sum" },
      ...(V2 ? { gutter: 16, viewButton: false, noun: "patients", maxHeight: 600 } : {}),
      columns: [
        { key: "name", label: "Guarantor", icon: "user", w: 196, open: true, kind: "text", lead: (r) => avatar(r.name, { size: 5 }), render: (r) => esc(r.name) },
        { key: "fam", label: "Family", icon: "users", w: 90, num: true, kind: "num", render: (r) => `${r.fam} <span class="text-gray-500">${r.fam === 1 ? "person" : "people"}</span>` },
        { key: "amt", label: "Amount due", w: 118, num: true, kind: "money", render: (r) => money(r.amt) },
        { key: "via", label: "Delivery", icon: "send", w: 118, kind: "text" },
        { key: "last", label: "Last sent", icon: "calendar", w: 118, kind: "date", render: (r) => (r.last ? fmtDate(r.last) : dim("First one")) },
        { key: "st", label: V2 ? `<span${chg("Status shows only when it's unusual: \"Ready\" rows are blank, so No address and On payment plan stand out")}>Status</span>` : "Status", icon: "circle-dot", w: 158, kind: "text", normal: ["Ready"], value: (r) => STMT_ST[r.st][0], render: (r) => statusDot(...STMT_ST[r.st]) }
      ],
      filters: [{ key: "st", label: "Status", options: Object.entries(STMT_ST).map(([value, [label, tone]]) => ({ value, label, tone })) }, { key: "via", label: "Delivery", options: ["Mail", "Email", "Text", "Email + Text"].map((v) => ({ value: v, label: v })) }],
      primary: { label: "Send selected", icon: "send" },
      bulk: [{ label: "Send", icon: "send" }, { label: "Download PDF", icon: "download" }, { label: "Remove from batch", icon: "x" }],
      onOpen: (r) => Sheet.open({ flush: true, title: esc(r.name), lead: avatar(r.name, { size: 9 }), subtitle: "September statement", tabs: ["Statement", "Activity"],
        body: `${statusLine(...STMT_ST[r.st], r.last ? `Last sent ${fmtDate(r.last)}` : "First statement for this family")}
          ${r.st === "needs" ? psec("Before sending", `<div class="-my-1.5">${infoRow("circle-alert", "No mailing address on file. Add one, or switch this family to email.", { tone: "needs" })}</div>`) : ""}
          ${psec("Statement", metaGrid([["Amount due", `<span class="tabular-nums">${money(r.amt)}</span>`], ["Family", `${r.fam} ${r.fam === 1 ? "person" : "people"}`], ["Delivery", r.via]], 3))}`,
        footer: `${button("Preview", { v: "white", s: "sm", icon: "eye" })}${button("Send statement", { v: "solid", s: "sm", icon: "send" })}` })
    });
  }
});

/* ======================================================= 8. Family balance breakdown */
defineBlock({
  cat: "billing", id: "billing-family-balance", title: "Family balance breakdown",
  note: "Opens from the family balance link. Each member with who the guarantor is. When the family total and the member rows don't match, a plain info note says why.",
  where: "Charts › Billing › Family balance",
  states: ["Normal", "Loading"],
  html: (state) => {
    const members = [["p10", "Guarantor", "Self"], ["p11", "", "Spouse"], ["p12", "", "Child"]].map(([id, role, rel]) => { const rows = ledgerRows(true).filter((r) => r.pt === id); return { p: DATA.patient(id), role, rel, bal: sum(rows, "amt"), ins: sum(rows, "ins") }; });
    const memberTotal = sum(members, "bal"), familyTotal = add(memberTotal, -80);
    const H = ["Member", "Relationship", "INS EST", "Balance", ""];
    const head = `<thead><tr>${H.map((h, i) => `<th class="${R.tHead} ${edge(i, H.length)} ${i === 2 || i === 3 ? "!text-end" : ""} ${i === 4 ? "w-12" : ""}">${h || '<span class="sr-only">Open</span>'}</th>`).join("")}</tr></thead>`;
    const body = state === "Loading"
      ? `<section class="${R.psec} space-y-2">${skel("w-44", "h-3.5")}${skel("w-28", "h-6")}</section>
        ${psec("Members", bleed(`<table class="w-full border-separate border-spacing-0 text-sm">${head}<tbody>${[1, 2, 3].map(() => `<tr><td class="${R.tCell} !ps-5"><span class="flex items-center gap-2">${skel("w-6", "h-6 !rounded-full")}${skel("w-32")}</span></td><td class="${R.tCell}">${skel("w-14")}</td><td class="${R.tCell}">${skel("w-14 ms-auto")}</td><td class="${R.tCell}">${skel("w-16 ms-auto")}</td><td class="${R.tCell} !pe-5"></td></tr>`).join("")}</tbody></table>`), { cls: "!pb-0" })}`
      : `<section class="${R.psec}"><p class="text-[13px] text-gray-500">Family balance <span class="text-gray-400">· guarantor A/R</span></p><p class="${R.numberSm} mt-0.5">${money(familyTotal)}</p>
        <div class="mt-2 -mb-1.5">${infoRow("info", `Family total differs from the member rows. Chloe's ${money(80)} cleaning from today isn't in the family's aging yet. It's added overnight, and the totals will match.`)}</div></section>
      ${psec("Members", bleed(`<table class="w-full border-separate border-spacing-0 text-sm">${head}
      <tbody>${members.map((m) => `<tr class="group cursor-pointer hover:bg-gray-50"><td class="${R.tCell} !ps-5"><span class="inline-flex items-center gap-2">${avatar(m.p.name, { size: 6 })}<span class="font-medium text-gray-800">${m.p.name}</span>${m.role ? tag(m.role, "tagOutline") : ""}</span></td><td class="${R.tCell} text-gray-600">${m.rel}</td><td class="${R.tCell} text-end tabular-nums ${m.ins ? "" : "text-gray-400"}">${money(m.ins)}</td><td class="${R.tCell} text-end tabular-nums">${money(m.bal)}</td><td class="${R.tCell} !ps-1 !pe-3 text-end">${iconButton("chevron-right", `View ${m.p.name}'s ledger`, { s: "iconXs", cls: "group-hover:text-gray-700" })}</td></tr>`).join("")}</tbody>
      <tfoot><tr><td colspan="3" class="h-9 ps-5 pe-3 font-medium text-gray-800">Member rows</td><td class="h-9 px-3 text-end font-semibold tabular-nums">${money(memberTotal)}</td><td></td></tr></tfoot></table>`), { count: members.length, cls: "!pb-0" })}`;
    if (V2) return `<div class="flex justify-center">${dialogFrame({ flush: true, title: "Family balance", sub: `<span${chg("The subtitle says who the guarantor is; it called the headline a live ledger balance, but the headline is the guarantor A/R")}>Ethan Walker is the guarantor</span>`, body, w: "w-[600px]", footer: `<span${chg("Close is gone from the footer: the × already closes the dialog")}>${button("View family ledger", { v: "white", s: "sm" })}</span>` })}</div>`;
    return `<div class="flex justify-center">${dialogFrame({ flush: true, title: "Family balance", sub: "Live ledger balance across linked family members.", body, w: "w-[600px]", footer: `${button("View family ledger", { v: "white", s: "sm" })}${button("Close", { v: "white", s: "sm" })}` })}</div>`;
  }
});

})();
