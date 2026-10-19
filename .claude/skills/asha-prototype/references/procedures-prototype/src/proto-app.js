/* The procedures prototype (round 1, Oct 10, 2026): a working copy of the chart screen (patient column, the tooth
 * chart, the Visit Worklist on the right, Recommended Treatment / Clinical History / Treatment Plans under the chart,
 * Billing's ledger) on invented data. Each open design question is a set of options in the floating panel; picking
 * an option plays a step-by-step walkthrough of it on the chart (Next / Back, no timers). Drawn with the design-system
 * library's own code (kit.js recipes, the data grid, the procedure picker, the tooth chart). Nothing here talks to
 * Asha; picks and comments save to answers.json through serve.py. See ../../SKILL.md for how it was used. */
(function () {
  const { Q, DECIDED, SC } = PROTO_DATA;
  const QBY = Object.fromEntries(Q.map((q) => [q.id, q]));
  const PROV = { patel: "Dr. Maya Patel", brooks: "Dr. Sam Brooks", kim: "Jen Kim, RDH" };
  const TODAY = "Oct 10, 2026";
  const WHO = "Lisa Chen";
  const LS = "bp-proto-r1-";
  const store = { get(k, d) { try { const v = localStorage.getItem(LS + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } } };
  const params = new URLSearchParams(location.search);
  const recKey = (q) => (q.opts.find((o) => o.rec) || q.opts[0]).k;
  const UI = {
    sc: params.get("sc") || store.get("sc", "two-plans"),
    show: Object.assign(Object.fromEntries(Q.map((q) => [q.id, recKey(q)])), store.get("show", {})),
    open: store.get("open", {}), qi: store.get("qi", 0), picks: {}, notes: {}, save: "", actual: store.get("actual", false), decidedOpen: false
  };
  const OV = {}; // a walkthrough's temporary settings for other questions that would clash with the option it plays
  Object.keys(UI.show).forEach((k) => { if (!QBY[k]) delete UI.show[k]; else if (!QBY[k].opts.some((o) => o.k === UI.show[k])) UI.show[k] = recKey(QBY[k]); });
  const pick = (id) => OV[id] || UI.show[id];
  let S = null;
  let seq = 0;
  const uid = (p) => `${p}${++seq}`;
  const $ = (id) => document.getElementById(id);

  /* ---------------- data ---------------- */
  const insRate = (code) => (/^D0|^D1/.test(code) ? 1 : /^D23/.test(code) ? 0.8 : 0.5);
  const ins = (p) => (p.fee == null ? null : Math.round(p.fee * insRate(p.code) * 100) / 100);
  const proc = (id, list, date, t, s, code, d, fee, prov, x = {}) => ({ id, list, date, t, s, code, d, fee, prov, status: "Planned", posted: false, ...x });
  const plan = (id, name, status, phases) => ({ id, name, status, phases: phases.map(([n, ids]) => ({ n, ids: [...ids] })) });
  const ALL_PLANS = () => [
    plan("p1", "Root canal and crown #19", "Presented", [["Phase 1 · Root canal", ["r1", "r2"]], ["Phase 2 · Crown", ["r3"]]]),
    plan("p2", "Upper crowns #3 and #14", "Not presented", [["Phase 1", ["r4", "r5"]]]),
    plan("p3", "Option B: implant instead of the bridge #19–#21, with bone graft (alternate)", "Not presented", [["Phase 1 · Extraction and graft", []], ["Phase 2 · Implant", []], ["Phase 3 · Crown on the implant", []]]),
    plan("p4", "Fillings before the wedding in June", "Accepted", [["Phase 1", []]]),
    plan("p5", "Night guard and whitening", "Not presented", [["Phase 1", []]]),
    plan("p6", "Option C: bridge #19–#21 (alternate)", "Not presented", [["Phase 1 · Preparation", []], ["Phase 2 · Bridge", []]]),
    plan("p7", "Deep cleaning, four quadrants", "Presented", [["Phase 1 · Upper", []], ["Phase 2 · Lower", []]]),
    plan("p8", "Replace old silver fillings, upper left", "Not presented", [["Phase 1", []]]),
    plan("p9", "Sealants and fluoride", "Accepted", [["Phase 1", []]]),
    plan("p10", "Crown #30 after the root canal", "Not presented", [["Phase 1", []]]),
    plan("p11", "Cosmetic bonding, front teeth (insurance won't cover)", "Not presented", [["Phase 1", []]]),
    plan("p12", "Option A: implant #19 with sinus lift and bone graft, staged over 9 months", "Presented", [["Phase 1 · Graft", []], ["Phase 2 · Implant", []], ["Phase 3 · Abutment and crown", []]])
  ];
  function base(planIds = ["p1", "p2"]) {
    const procs = [
      proc("v1", "visit", TODAY, "", "", "D0120", "Periodic oral evaluation", 75, "patel"),
      proc("v2", "visit", TODAY, "", "", "D1110", "Adult cleaning", 120, "kim"),
      proc("v3", "visit", TODAY, "", "", "D0274", "Bitewings, four images", 85, "kim"),
      proc("v4", "visit", TODAY, "30", "O", "D2391", "Composite, one surface, back tooth", 225, "patel"),
      proc("r1", "rec", "Sep 24, 2026", "19", "", "D3330", "Root canal, molar", 1200, "brooks"),
      proc("r2", "rec", "Sep 24, 2026", "19", "", "D2950", "Core buildup", 295, "brooks"),
      proc("r3", "rec", "Sep 24, 2026", "19", "", "D2740", "Crown, porcelain/ceramic", 1350, "patel"),
      proc("r4", "rec", "Sep 24, 2026", "3", "", "D2740", "Crown, porcelain/ceramic", 1350, "patel"),
      proc("r5", "rec", "Sep 24, 2026", "14", "", "D2740", "Crown, porcelain/ceramic", 1350, "patel"),
      proc("r6", "rec", TODAY, "31", "O", "D2391", "Composite, one surface, back tooth", 225, "patel"),
      proc("r7", "rec", TODAY, "2", "MO", "D2392", "Composite, two surfaces, back tooth", 285, "patel"),
      proc("h1", "history", "Oct 5, 2026", "", "", "D0120", "Periodic oral evaluation", 75, "patel", { status: "Completed", posted: true, closed: true }),
      proc("h2", "history", "Oct 1, 2026", "20", "O", "D2391", "Composite, one surface, back tooth", 200, "patel", { status: "Completed", posted: true, closed: true, paid: 200 })
    ];
    const ledger = [
      { id: "l1", date: "Oct 1, 2026", desc: "D2391 #20 Composite, one surface, back tooth", amt: 200, closed: true },
      { id: "l2", date: "Oct 1, 2026", desc: "Payment · Visa ending 4242", amt: -200, closed: true },
      { id: "l3", date: "Oct 5, 2026", desc: "D0120 Periodic oral evaluation", amt: 75, closed: true }
    ];
    return { procs, plans: ALL_PLANS().filter((p) => planIds.includes(p.id)), ledger, sel: { visit: new Set(), rec: new Set(), plan: new Set() },
      tab: "rec", view: "chart", top: "chart", tooth: 0, layers: { planned: true, completed: true, existing: true }, wList: "rec", cList: "rec", panel: null, tint: new Set(), menu: null, dialog: null, failNext: null, fails: [], lock: null,
      notes: [], flash: null, newVisit: new Set() };
  }
  const SETUP = {
    "two-plans": () => { const s = base(); s.sel.rec = new Set(["r6", "r7"]); return s; },
    "no-plan": () => { const s = base([]); s.sel.rec = new Set(["r6", "r7"]); return s; },
    "one-plan": () => { const s = base(["p2"]); s.sel.rec = new Set(["r6", "r7"]); return s; },
    "five-plans": () => { const s = base(["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9", "p10", "p11", "p12"]); s.sel.rec = new Set(["r6", "r7"]); return s; },
    "shared-crown": () => { const s = base(); s.sel.rec = new Set(["r4"]); return s; },
    "complete-missing": () => { const s = base(); P(s, "v4").fee = null;
      s.procs.splice(4, 0, proc("v5", "visit", TODAY, "", "", "D0140", "Limited evaluation, problem focused", 65, null));
      s.sel.visit = new Set(["v1", "v2", "v4", "v5"]); s.cList = "visit"; return s; },
    "net-drop": () => { const s = base(); s.failNext = { kind: "network" }; return s; },
    "coworker-fee": () => { const s = base(); s.failNext = { kind: "conflict", procId: "v4", theirs: 210, at: "9:41 AM" }; return s; },
    "lock": () => { const s = base(); s.lock = { until: Date.now() + 15000 }; return s; },
    "billed-status": () => { const s = base(); billNow(s, P(s, "v1")); s.sel.visit = new Set(["v1", "v2", "v3"]); s.cList = "visit"; return s; },
    "w-key": () => { const s = base(); s.sel.rec = new Set(["r6"]); s.sel.plan = new Set(["r4"]); s.panel = "p2"; s.wList = "plan"; return s; },
    "closed-day": () => { const s = base(); s.tab = "history"; return s; },
    "paid-lower": () => { const s = base(); s.tab = "history"; return s; },
    "just-billed": () => { const s = base(); billNow(s, P(s, "v1")); return s; },
    "perio": () => { const s = base(); s.sel.rec = new Set(["r6", "r7"]); return s; }
  };
  function P(s, id) { return s.procs.find((p) => p.id === id); }
  const get = (id) => P(S, id);
  const label = (p) => `${p.code}${p.t ? ` #${p.t}` : ""}`;
  const desc = (p) => `${label(p)} ${p.d}`;
  function billNow(s, p) { p.status = "Completed"; p.posted = true; s.ledger.push({ id: uid("l"), date: TODAY, desc: desc(p), amt: p.fee }); }
  const plansOf = (id) => S.plans.filter((pl) => pl.phases.some((ph) => ph.ids.includes(id)));
  const needs = (p) => (p.status === "Completed" ? null : p.prov == null ? "provider" : p.fee == null ? "fee" : null);
  const rowsOf = (list) => S.procs.filter((p) => p.list === list && (list !== "rec" || p.status !== "Completed"));
  const selected = (list) => [...(S.sel[list] || [])].filter((id) => get(id));
  const lockOn = () => S.lock && Date.now() < S.lock.until;
  const recVisible = () => S.view === "chart" && S.top === "chart" && S.tab === "rec";

  /* ---------------- saving: instant changes, with the scenario's network trouble, conflicts and the lock --------- */
  function snapshot() { return JSON.stringify({ procs: S.procs, plans: S.plans, ledger: S.ledger }); }
  function restore(snap) { const o = JSON.parse(snap); S.procs = o.procs; S.plans = o.plans; S.ledger = o.ledger; }
  /* change: one instant action. ids are the procedures it touches, list is where it was done, apply() makes it. */
  function change({ ids, list, label: what, apply, field }) {
    const visit = ids.some((id) => get(id) && get(id).list === "visit") || list === "visit";
    if (lockOn() && visit) {
      if (pick("wait-lock") === "refused") { notify({ tone: "orange", icon: "circle-alert", title: "This Visit has an active administrative correction." }); render(); return; }
      apply(); ids.forEach((id) => { const p = get(id); if (p) p.waiting = true; }); S.lock.waiting = (S.lock.waiting || 0) + 1; render(); return;
    }
    const f = S.failNext;
    if (f && f.kind === "network") {
      S.failNext = null; const snap = snapshot(); apply(); render();
      setTimeout(() => { restore(snap); addFail({ ids, list, what, msg: "Didn't save. The connection dropped for a moment.", redo: () => change({ ids, list, label: what, apply, field }) }); render(); }, 900);
      return;
    }
    if (f && f.kind === "conflict" && field === "fee" && ids.includes(f.procId)) {
      S.failNext = null; apply(); render();
      setTimeout(() => { const p = get(f.procId), mine = p.fee; p.fee = f.theirs; addConflict(p, mine, f, list); render(); }, 900);
      return;
    }
    apply(); render();
  }
  function addFail({ ids, list, what, msg, redo, kind = "retry", mine, p }) {
    const one = ids.length === 1 && get(ids[0]);
    if (!/ · /.test(what)) what = one ? `${what} · ${label(one)} ${one.d}` : `${what} · ${ids.length} procedures`;
    const fl = { id: uid("f"), procId: ids[0], list, what, msg, redo, kind, mine, n: ids.length };
    S.fails.push(fl);
    if (pick("failed-save") === "corner") notify({ tone: "orange", icon: "circle-alert", title: `${fl.what.split(" · ")[0]} didn't save · ${fl.what.split(" · ")[1] || ""}`, body: msg, fail: fl.id, ttl: 8000 });
  }
  function addConflict(p, mine, f, list) {
    const v = pick("cant-retry");
    const said = `${WHO} set the fee to ${money(f.theirs)} at ${f.at}, so yours (${money(mine)}) wasn't saved.`;
    if (v === "retry-dismiss") addFail({ ids: [p.id], list, what: `Fee · ${label(p)}`, msg: "The fee changed since you opened it.", kind: "retry", redo: () => { addConflict(p, mine, f, list); } });
    else if (v === "dismiss-only") addFail({ ids: [p.id], list, what: `Fee · ${label(p)}`, msg: said, kind: "dismiss" });
    else addFail({ ids: [p.id], list, what: `Fee · ${label(p)}`, msg: said, kind: "theirs", mine, redo: () => change({ ids: [p.id], list, label: "Fee", field: "fee-mine", apply: () => setFee(p, mine) }) });
  }
  function notify(n) {
    const note = { id: uid("n"), ...n }; S.notes.push(note);
    setTimeout(() => { S.notes = S.notes.filter((x) => x.id !== note.id); render(); }, n.ttl || 6000);
  }
  setInterval(() => {
    if (!S || !S.lock) return;
    const left = Math.ceil((S.lock.until - Date.now()) / 1000);
    document.querySelectorAll("[data-countdown]").forEach((el) => { el.textContent = left > 0 ? `${left} s` : "done"; });
    if (left <= 0 && !S.lock.done) {
      S.lock.done = true; S.procs.forEach((p) => { delete p.waiting; }); S.lock.waiting = 0; render();
    }
  }, 500);

  /* ---------------- actions ---------------- */
  function doComplete(p) {
    p.status = "Completed"; p.posted = true; delete p.flagged;
    S.ledger.push({ id: uid("l"), date: TODAY, desc: desc(p), amt: p.fee });
    if (p.list === "rec") { p.list = "history"; p.date = TODAY; }
  }
  function skipHint(ids, what, target) {
    const miss = { fee: [], provider: [] }, billed = [], ok = [];
    ids.forEach((id) => { const p = get(id); if (target === "Completed") { const n = needs(p); if (n) miss[n].push(p.code); else ok.push(id); }
      else if (p.posted) billed.push(p.code); else ok.push(id); });
    const why = [miss.fee.length && `${listCodes(miss.fee)} ${miss.fee.length > 1 ? "need" : "needs"} a fee`, miss.provider.length && `${listCodes(miss.provider)} ${miss.provider.length > 1 ? "need" : "needs"} a provider`,
      billed.length && { "leave-out": `${listCodes(billed)} ${billed.length > 1 ? "have" : "has"} a posted charge. Edit the charge instead`,
        "open-correction": `${listCodes(billed)} ${billed.length > 1 ? "have" : "has"} a posted charge; its charge correction opens next`,
        "one-review": null }[pick("billed-status")]].filter(Boolean).join(". ");
    if (billed.length && pick("billed-status") === "one-review") return `${what}: ${ids.length}. ${listCodes(billed)} ${billed.length > 1 ? "are" : "is"} billed; you review ${billed.length > 1 ? "their" : "its"} charge first`;
    return why ? `${what}: ${ok.length} of ${ids.length}. ${why}` : what;
  }
  const listCodes = (c) => (c.length <= 1 ? c[0] || "" : `${c.slice(0, -1).join(", ")} and ${c[c.length - 1]}`);
  function complete(ids, list) {
    const miss = ids.filter((id) => needs(get(id)));
    const ok = ids.filter((id) => !needs(get(id)) && get(id).status !== "Completed");
    S.sel[list] = new Set();
    if (ok.length) change({ ids: ok, list, label: "Mark completed", apply: () => ok.forEach((id) => doComplete(get(id))) });
    if (!miss.length) return render();
    const v = pick("skipped-complete");
    if (v === "open-each") S.dialog = { type: "editor", mode: "finish", queue: miss, idx: 0, list };
    else if (v === "mark-rows") miss.forEach((id) => { get(id).flagged = true; });
    render();
  }
  function setStatus(ids, status, list) {
    change({ ids, list, label: `Mark ${status.toLowerCase()}`, apply: () => ids.forEach((id) => { const p = get(id); p.status = status; delete p.flagged; }) });
  }
  function bulkStatus(status, ids, list) {
    const billed = ids.filter((id) => get(id).posted), rest = ids.filter((id) => !get(id).posted && get(id).status !== status);
    const v = pick("billed-status");
    S.sel[list] = new Set();
    if (!billed.length || v === "leave-out") { if (rest.length) setStatus(rest, status, list); else render(); return; }
    if (v === "open-correction") { if (rest.length) setStatus(rest, status, list); S.dialog = { type: "correction", queue: billed, idx: 0, status, list }; return render(); }
    S.dialog = { type: "review", billed, rest, status, list }; render();
  }
  function takeOffCharge(p, why) {
    S.ledger.push({ id: uid("l"), date: TODAY, desc: `${why} · ${desc(p)}`, amt: -p.fee }); p.posted = false;
  }
  function rowStatus(id, status, list) {
    const p = get(id);
    if (status === p.status) return render();
    if (status === "Completed") return complete([id], list);
    if (status === "Planned" && p.status === "Completed") return change({ ids: [id], list, label: "Return to Planned", apply: () => toPlanned(p) });
    if (status === "Not performed" && p.posted) return change({ ids: [id], list, label: "Mark not performed", apply: () => { takeOffCharge(p, "Not performed"); p.status = "Not performed"; } });
    setStatus([id], status, list);
  }
  function toPlanned(p) {
    if (p.posted) { if (p.closed) S.ledger.push({ id: uid("l"), date: TODAY, desc: `Undo completion · ${desc(p)} (from ${p.date}, a closed day)`, amt: -p.fee });
      else { const i = S.ledger.findIndex((l) => l.desc === desc(p) && l.amt === p.fee); if (i >= 0) S.ledger.splice(i, 1); } }
    p.status = "Planned"; p.posted = false; delete p.flagged; if (p.list === "history") p.list = "rec";
  }
  function setFee(p, fee) {
    const old = p.fee; p.fee = fee;
    if (p.posted && old != null && fee !== old) {
      S.ledger.push({ id: uid("l"), date: TODAY, desc: `Fee corrected · ${label(p)}: ${money(old)} to ${money(fee)}`, amt: fee - old });
    }
  }
  function addToVisit(list) {
    const ids = selected(list).filter((id) => get(id).list !== "visit" && get(id).status !== "Completed");
    S.sel[list] = new Set();
    if (!ids.length) return render();
    change({ ids, list: "visit", label: "Add to Visit Worklist", apply: () => ids.forEach((id) => { const p = get(id); p.list = "visit"; S.newVisit.add(id); }) });
    setTimeout(() => { ids.forEach((id) => S.newVisit.delete(id)); render(); }, 1600);
  }
  function addToPlan(planId, phase, ids, { open = pick("add-to-plan") === "open-plan" } = {}) {
    const pl = S.plans.find((x) => x.id === planId); if (!pl) return;
    const ph = pl.phases[phase == null ? 0 : phase];
    const fresh = ids.filter((id) => !pl.phases.some((x) => x.ids.includes(id)));
    ph.ids.push(...fresh);
    S.sel.rec = new Set(); S.menu = null; S.dialog = null;
    if (open) { S.panel = planId; S.tint = new Set(fresh); setTimeout(() => { S.tint = new Set(); render(); }, 2400); }
    else flash("plans");
    render();
  }
  function newPlan(ids) {
    const n = S.plans.filter((p) => /^New treatment plan/.test(p.name)).length;
    const pl = plan(uid("p"), `New treatment plan${n ? ` ${n + 1}` : ""}`, "Not presented", [["Phase 1", ids]]);
    S.plans.push(pl); S.sel.rec = new Set(); S.menu = null; S.dialog = null; S.panel = pl.id; S.tint = new Set(ids);
    setTimeout(() => { S.tint = new Set(); render(); }, 2400);
    render();
  }
  function flash(what) { S.flash = what; setTimeout(() => { S.flash = null; render(); }, 1400); }
  function removeProc(ids) {
    S.procs = S.procs.filter((p) => !ids.includes(p.id));
    S.plans.forEach((pl) => pl.phases.forEach((ph) => { ph.ids = ph.ids.filter((id) => !ids.includes(id)); }));
    ["visit", "rec", "plan"].forEach((l) => ids.forEach((id) => S.sel[l].delete(id)));
  }

  /* ---------------- drawing helpers ---------------- */
  const statusTone = { Planned: "off", Completed: "on", Referred: "mid", Deferred: "quiet", "Not performed": "quiet" };
  const planTone = { "Not presented": "off", Presented: "mid", Accepted: "on" };
  function tbtn(act, icon, name, { n = 1, tip, list = "", anchor = "", pressed = false, words = "", chevron = false, danger = false, extra = "" } = {}) {
    const off = n === 0;
    const t = off ? `${name}: tick procedures first` : tip || name;
    const cls = cx(R.btn, words ? R.xs : cx(R.xs, R.iconXs), R.quiet, words && "!text-gray-800 [&_svg]:!text-gray-500", off && "opacity-40 !cursor-default hover:!bg-transparent", pressed && "!bg-blue-50 !text-blue-700 [&_svg]:!text-blue-700", danger && !off && "!text-red-600");
    return `<button type="button" class="${cls}" ${off ? "" : `data-act="${act}"`} data-list="${list}" aria-disabled="${off}" aria-label="${esc(name)}" data-tip="${esc(t)}" ${anchor ? `data-anchor="${anchor}"` : ""} ${extra}>${I(icon)}${words ? `<span class="truncate max-w-[220px]">${esc(words)}</span>` : ""}${chevron ? I("chevron-down", "!size-3 text-gray-400") : ""}</button>`;
  }
  const sepV = `<span class="h-5 mx-1.5 border-s border-gray-200"></span>`;
  const wBadge = (list) => (pick("w-cue") === "key-badge" && S.wList === list ? `<span class="-ms-0.5 me-1" data-tip="W adds what's ticked here to the Visit Worklist">${kbd("W")}</span>` : "");
  const blueTop = (list) => (pick("w-cue") === "blue-line" && S.wList === list ? "shadow-[inset_0_2px_0_#155dfc]" : "");
  function failIcon(fails, anchor, { count = false } = {}) {
    if (!fails.length) return "";
    const tip = fails.length === 1 ? `${fails[0].what}: ${fails[0].msg}` : `${fails.length} changes need attention`;
    return `<button type="button" class="${cx(R.btn, R.xs, count ? "!px-1.5" : R.iconXs, R.quiet, "!text-orange-600 [&_svg]:!text-orange-500")}" data-act="fail-open" data-anchor="${anchor}" aria-label="${esc(tip)}" data-tip="${esc(tip)}">${I("circle-alert")}${count && fails.length > 1 ? `<span class="tabular-nums">${fails.length}</span>` : ""}</button>`;
  }
  const failsFor = (pred) => S.fails.filter(pred);

  /* ---------------- the app: the live chart's three columns (stack B ToothChart route, Oct 10) ---------------- */
  const statusIcon = (p) => {
    const tip = `Status: ${p.status}. Change`;
    const ic = p.status === "Completed" ? `<span class="inline-flex size-[18px] items-center justify-center rounded-full bg-blue-600 text-white">${I("check", "size-3 [stroke-width:3]")}</span>`
      : p.status === "Referred" ? I("circle-arrow-out-up-right", "size-[18px] text-gray-500") : p.status === "Deferred" ? I("circle-pause", "size-[18px] text-gray-500")
      : p.status === "Not performed" ? I("circle-slash", "size-[18px] text-gray-400") : I("circle", "size-[18px] text-gray-300");
    return `<button type="button" class="inline-flex size-7 items-center justify-center rounded-md hover:bg-gray-100 cursor-pointer" data-act="row-status" data-id="${p.id}" data-list="visit" data-anchor="st-${p.id}" aria-label="${esc(tip)}" data-tip="${esc(p.status)}">${ic}</button>`;
  };
  function railCol() {
    const fails = pick("failed-save") === "top-bar" ? S.fails : [];
    const ic = (n, l, on) => `<span class="flex size-9 items-center justify-center rounded-lg ${on ? "bg-gray-100 text-gray-900" : "text-gray-500"}" data-tip="${l}">${I(n, "size-[18px]")}</span>`;
    return `<nav class="flex flex-col items-center gap-1.5 py-3 border-e border-gray-200/80 bg-white" aria-label="App">
      ${ic("bell", "Notifications")}<span class="flex size-9 items-center justify-center">${failIcon(fails, "fail-top", { count: true })}</span>
      ${ic("house", "Home")}${ic("calendar", "Schedule")}${ic("users", "Patients", true)}${ic("list-checks", "Tasks")}${ic("trending-up", "Revenue")}${ic("message-square", "Messages")}${ic("phone", "Calls")}${ic("receipt", "Claims")}${ic("settings", "Settings")}
      <span class="grow"></span>${avatar("Ana Ruiz", { size: 8 })}</nav>`;
  }
  function patientCol() {
    const bal = S.ledger.reduce((a, l) => a + l.amt, 0) + S.procs.reduce((a, p) => a + (p.posted && p.paid && p.fee != null ? Math.max(0, p.paid - p.fee) : 0), 0);
    const tile = (icon, l, key) => { const on = (key === "chart" && S.view === "chart") || (key === "ledger" && S.view === "ledger");
      return `<button type="button" class="flex flex-col items-center justify-center gap-1 h-[52px] rounded-lg text-xs cursor-pointer ${on ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200" : "text-gray-600 hover:bg-gray-50"}" ${key ? `data-act="nav" data-nav="${key}"` : 'data-tip="Not in this prototype"'}>${I(icon, "size-4")}${l}</button>`; };
    const sec = (icon, t, sub) => `<div class="flex items-start gap-3 px-5 py-3 border-t border-gray-200/80">${I(icon, "size-4 mt-0.5 text-gray-400")}<div class="min-w-0"><p class="text-sm font-medium text-gray-900">${t}</p><p class="text-[13px] text-gray-500 truncate">${sub}</p></div></div>`;
    const nPlans = S.plans.length;
    return `<aside class="flex flex-col min-h-0 overflow-auto border-e border-gray-200/80 bg-white" data-keep-scroll="pt" aria-label="Patient">
      <div class="flex items-center justify-between h-12 px-4 text-[13px] text-gray-600"><span class="inline-flex items-center gap-1.5">${I("chevron-left", "size-4")}Back to charts</span>${iconButton("ellipsis", "More", { s: "iconXs" })}</div>
      <div class="px-5 pb-4"><div class="flex items-center gap-3">${avatar("Maria Lopez", { size: 12 })}<div class="min-w-0"><p class="text-[11px] font-medium tracking-wide text-gray-500">CHART # A010231</p><p class="text-base font-semibold text-gray-900">Maria Lopez</p><p class="text-[13px] text-gray-500">Mar 3, 1985 · 41 yrs · F</p></div></div>
        <div class="mt-3 flex items-center gap-2">${tag("Active", "tagGray")}<span class="inline-flex items-center gap-1 text-[13px] font-medium text-gray-800 tabular-nums" data-tip="Balance due">${I("wallet", "size-4 text-gray-400")}${money(bal)}</span></div></div>
      <div class="grid grid-cols-3 gap-1 px-4 pb-4">${tile("smile", "Charting", "chart")}${tile("user", "Overview")}${tile("users", "Family")}${tile("shield", "Insurance")}${tile("calendar", "Appts")}${tile("dollar-sign", "Billing", "ledger")}${tile("clipboard-list", "TX plans", "plans")}${tile("file-text", "Notes")}${tile("image", "Images")}${tile("flask-conical", "Labs")}${tile("history", "Medical Hx")}${tile("folder", "Docs")}</div>
      ${sec("calendar", "Appointments", "Oct 10, 2026 · 9:00 AM")}${sec("shield", "Insurance", "Delta Dental PPO · Primary")}${sec("clipboard-list", "Treatment Plans", nPlans ? `${nPlans} active treatment plan${nPlans > 1 ? "s" : ""}` : "No active treatment plans")}${sec("sticky-note", "Notes", "Family, PMS &amp; pinned notes")}</aside>`;
  }
  /* The odontogram: the design-system library's tooth chart (the app's own tooth art), fed Maria's procedures */
  const kindOf = (code) => (/^D27|^D67|^D6065/.test(code) ? "crown" : code === "D3330" ? "rct" : code === "D2950" ? "core" : /^D7140/.test(code) ? "extract" : /^D2[1-3]/.test(code) ? "surf" : null);
  function chartData() {
    const C = { 1: { missing: true }, 16: { missing: true }, 17: { missing: true }, 32: { missing: true },
      18: { items: [{ l: "existing", k: "surf", s: "MO" }] }, 15: { items: [{ l: "existing", k: "surf", s: "O" }] }, 13: { items: [{ l: "existing", k: "surf", s: "DO" }] },
      9: { items: [{ l: "existing", k: "surf", s: "M" }] }, 4: { items: [{ l: "existing", k: "crown" }] }, 29: { items: [{ l: "existing", k: "surf", s: "O" }] } };
    S.procs.forEach((p) => {
      const n = +p.t, k = kindOf(p.code); if (!n || !k || p.status === "Not performed") return;
      if (!S.layers[p.status === "Completed" ? "completed" : "planned"]) return;
      ((C[n] = C[n] || {}).items = C[n].items || []).push({ l: p.status === "Completed" ? "completed" : "planned", k, s: p.s || "O" });
    });
    if (!S.layers.existing) Object.values(C).forEach((c) => { if (c.items) c.items = c.items.filter((i) => i.l !== "existing"); });
    if (!(P(S, "r6") && P(S, "r6").status === "Completed")) C[31] = { ...(C[31] || {}), cond: [{ s: "O", label: "Caries" }] };
    return C;
  }
  function chartCenter() {
    const n = (l) => S.procs.filter((p) => +p.t && kindOf(p.code) && (l === "planned" ? p.status !== "Completed" && p.status !== "Not performed" : p.status === "Completed")).length;
    const pill = (k, l, c, dot) => { const on = k === "all" ? S.layers.planned && S.layers.completed && S.layers.existing : S.layers[k] && !(S.layers.planned && S.layers.completed && S.layers.existing);
      return `<button type="button" class="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[13px] cursor-pointer ${on ? "bg-blue-600 text-white" : "border border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50"}" data-act="layer" data-layer="${k}">${dot ? `<span class="${cx(R.dot, dot)}"></span>` : ""}${l}${c != null ? ` <span class="${on ? "text-white/80" : "text-gray-500"}">(${c})</span>` : ""}</button>`; };
    CL.setChart(chartData());
    return `<div class="flex items-center gap-2 px-5 pt-3"><span class="grow"></span>${pill("all", "All")}${pill("planned", "Planned", n("planned"), "bg-blue-500")}${pill("completed", "Completed", n("completed"), "bg-blue-900")}${pill("existing", "Existing", 7, "bg-gray-400")}
        <span class="grow"></span>${button("Add", { v: "ghost", s: "sm", icon: "plus", iconEnd: "chevron-down", cls: "[&_svg:last-child]:text-gray-400", attrs: 'data-tip="Add procedure (not in this prototype)"' })}</div>
      <div class="mx-5 mt-2 rounded-xl border border-gray-200/80 bg-gray-50/60 px-2 pt-2 pb-1 [&>svg]:!max-w-[700px]" data-chart>${CL.chartSVG({ sel: S.tooth || 0, pfx: "pc" })}<div class="py-2">${CL.symbolLegend()}</div></div>
      <p class="mt-2 flex items-center justify-center gap-1.5 text-xs text-gray-500">${I("keyboard", "size-3.5")}Press / or Ctrl/Command+/ for shortcuts</p>`;
  }
  function centerCol() {
    if (S.view === "ledger") return `<main class="min-w-0 min-h-0 overflow-auto bg-white" data-keep-scroll="ledger"><div class="flex items-center gap-3 h-16 px-5 border-b border-gray-200/80"><h1 class="text-lg font-semibold text-gray-900">Billing</h1><span class="text-[13px] text-gray-500">Ledger</span><span class="grow"></span>${button("Back to Charting", { v: "white", s: "sm", icon: "arrow-left", attrs: 'data-act="nav" data-nav="chart"' })}</div>${ledgerTable()}</main>`;
    const top = [["chart", "Tooth Chart"], ["perio", "Perio Chart"], ["screen", "Clinical Screenings"]];
    const tabsTop = `<nav class="${R.tabs} px-5" role="tablist">${top.map(([k, l]) => `<button type="button" class="${S.top === k ? R.tabOn : R.tab} cursor-pointer" ${k === "screen" ? 'data-tip="Not in this prototype"' : `data-act="top-tab" data-top="${k}"`} role="tab" aria-selected="${S.top === k}">${l}</button>`).join("")}<span class="grow"></span><span class="flex items-center gap-0.5 pb-1">${iconButton("maximize-2", "Expand", { s: "iconSm" })}${iconButton("ellipsis", "More", { s: "iconSm" })}</span></nav>`;
    const head = `<div class="flex items-center gap-3 h-16 px-5"><h1 class="text-lg font-semibold text-gray-900">Charting</h1><span class="${cx(R.tag, R.tagBlue)}">${I("clipboard-list", "size-3")}Visit in progress</span><span class="grow"></span><span class="text-[13px] text-gray-500">Charting for</span><span class="${R.selectSm} !w-52">${I("user", "size-4 text-gray-400")}<span class="grow">Dr. Maya Patel</span>${I("chevron-down", "size-4 text-gray-400")}</span></div>`;
    const body = S.top === "perio" ? emptyState({ icon: "activity", title: "Perio Chart", body: "Gum measurements would be here. Recommended Treatment is hidden on this tab, so C and W do nothing until you go back to the Tooth Chart." }) : `${chartCenter()}${lowerPane()}`;
    return `<main class="min-w-0 min-h-0 overflow-auto bg-white" data-keep-scroll="center">${head}${tabsTop}${body}</main>`;
  }
  const cols = {
    rec: [["Date", 104], ["Tooth", 56], ["Surf", 52], ["Code", 72], ["Description", 0], ["Provider", 128], ["Amount", 100], ["Ins est", 92], ["Patient est", 104]],
    history: [["Date", 136], ["Tooth", 56], ["Surf", 52], ["Code", 72], ["Description", 0], ["Provider", 128], ["Fee", 96], ["Status", 160]]
  };
  const numCol = (l) => ["Fee", "Amount", "Ins est", "Patient est"].includes(l);
  function tableHead(list, rows) {
    const c = cols[list], last = c.length - 1, sel = S.sel[list] || new Set();
    const all = list !== "history" && rows.length && rows.every((r) => sel.has(r.id));
    return `<thead><tr>${c.map(([l], i) => `<th class="${R.gridHead} ${i === 0 ? "!ps-4" : ""} ${numCol(l) ? "!text-end" : ""} ${i === last ? "!border-e-0 !pe-4" : ""}">${
      i === 0 && list !== "history" ? `<span class="inline-flex items-center gap-3">${checkbox(all, "Select all", `data-tickall="${list}"`)}${l}</span>` : l}</th>`).join("")}</tr></thead>`;
  }
  function endMarks(p, list) {
    const out = [];
    if (pick("failed-save") === "in-row") { const f = failsFor((x) => x.procId === p.id); if (f.length) out.push(failIcon(f, `fail-row-${p.id}`)); }
    if (p.waiting && pick("wait-lock") === "wait-in-row") out.push(`<span class="inline-flex text-gray-400" data-tip="Waiting for ${WHO} to finish correcting today's charges. It goes through on its own.">${I("clock", "size-4")}</span>`);
    return out.length ? `<span class="ms-auto flex items-center gap-1 shrink-0">${out.join("")}</span>` : "";
  }
  function statusCell(p, list) {
    if (p.flagged && needs(p)) return `<button type="button" class="inline-flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 cursor-pointer" data-act="finish-one" data-id="${p.id}" data-list="${list}" data-tip="Click to add the ${needs(p)} and complete it">${I("circle-alert", "size-3.5 text-orange-500")}Needs a ${needs(p)}</button>`;
    return `<button type="button" class="inline-flex items-center gap-1 -mx-1.5 px-1.5 h-7 rounded-md hover:bg-gray-100 cursor-pointer" data-act="row-status" data-id="${p.id}" data-list="${list}" data-anchor="st-${p.id}" aria-label="Status: ${p.status}. Change">${statusDot(p.status, statusTone[p.status])}${I("chevron-down", "size-3 text-gray-400")}</button>`;
  }
  function row(p, list) {
    const sel = S.sel[list] && S.sel[list].has(p.id);
    const c = cols[list], last = c.length - 1;
    const prov = p.prov ? esc(PROV[p.prov]) : `<span class="text-gray-400">—</span>`;
    const fee = p.fee == null ? `<span class="text-gray-400">—</span>` : money(p.fee);
    const descCell = `<span class="flex items-center gap-2 min-w-0"><span class="truncate">${esc(p.d)}</span>${p.posted && !p.waiting && list !== "history" ? `<span class="shrink-0 text-xs text-gray-400" data-tip="On the bill (posted to the ledger)">Billed</span>` : ""}${endMarks(p, list)}</span>`;
    const tick = list === "history" ? "" : `${checkbox(sel, `Select ${label(p)}`, `data-tick="${list}" data-id="${p.id}"`)}`;
    let cells;
    if (list === "visit") cells = [tick, p.t || `<span class="text-gray-400">—</span>`, p.s || `<span class="text-gray-400">—</span>`, p.code, descCell, prov, fee, statusCell(p, list)];
    else if (list === "rec") { const i = ins(p); cells = [`<span class="inline-flex items-center gap-3">${tick}<span class="tabular-nums">${p.date.replace(", 2026", "")}</span></span>`, p.t || "—", p.s || `<span class="text-gray-400">—</span>`, p.code, descCell, prov, fee, i == null ? "—" : money(i), i == null ? "—" : money(p.fee - i)]; }
    else cells = [`<span class="tabular-nums">${p.date}</span>${p.closed ? `<span class="ms-1.5 inline-flex align-[-2px] text-gray-400" data-tip="A closed day: the office already counted its money">${I("lock", "size-3.5")}</span>` : ""}`, p.t || "—", p.s || `<span class="text-gray-400">—</span>`, p.code, descCell, prov, fee, statusCell(p, list)];
    const tint = S.newVisit.has(p.id) && list === "visit" ? "bg-blue-50/70" : sel ? "bg-blue-50/40" : "";
    return `<tr class="g-row ${tint} cursor-pointer" data-act="open-row" data-id="${p.id}" data-list="${list}">${cells.map((v, i) => `<td class="${R.gridCell} ${i === 0 ? "!ps-4 !overflow-visible" : ""} ${numCol(c[i][0]) ? "text-end tabular-nums" : ""} ${i === last ? "!border-e-0 !pe-4" : ""} ${i === 4 ? "!overflow-visible" : ""}">${v}</td>`).join("")}</tr>`;
  }
  function table(list, rows, { foot = true, empty = "Nothing here" } = {}) {
    const c = cols[list];
    const body = rows.length ? rows.map((p) => row(p, list)).join("") : `<tr><td colspan="${c.length}" class="${R.gridCell} !ps-4 text-gray-400">${empty}</td></tr>`;
    const sum = rows.reduce((a, p) => a + (p.fee || 0), 0);
    const ft = foot && rows.length ? `<tfoot><tr><td class="${R.gridFoot} !ps-4" colspan="6">${rows.length} procedures · totals</td>${list === "rec"
      ? `<td class="${R.gridFoot} text-end tabular-nums"><span class="font-semibold text-gray-800">${money(sum)}</span></td><td class="${R.gridFoot} text-end tabular-nums"><span class="font-semibold text-gray-800">${money(rows.reduce((a, p) => a + (ins(p) || 0), 0))}</span></td><td class="${R.gridFoot} !border-e-0 !pe-4 text-end tabular-nums"><span class="font-semibold text-gray-800">${money(rows.reduce((a, p) => a + (p.fee || 0) - (ins(p) || 0), 0))}</span></td>`
      : `<td class="${R.gridFoot} text-end tabular-nums">Sum <span class="font-semibold text-gray-800">${money(sum)}</span></td><td class="${R.gridFoot} !border-e-0"></td>`}</tr></tfoot>` : "";
    return `<table class="g-table table-fixed w-full"><colgroup>${c.map(([, w]) => (w ? `<col style="width:${w}px">` : "<col>")).join("")}</colgroup>${tableHead(list, rows)}<tbody>${body}</tbody>${ft}</table>`;
  }

  /* The Visit panel on the right with its Worklist tab (stack B ChartWorkList: two-line rows, status circle on the right,
   * the always-visible icon toolbar you approved) */
  function visitRow(p) {
    const sel = S.sel.visit.has(p.id);
    const fee = p.fee == null ? `<span class="text-gray-400">No fee</span>` : money(p.fee);
    const sub = [p.t ? `#${p.t}${p.s ? ` ${p.s}` : ""}` : "", p.prov ? esc(PROV[p.prov]) : `<span class="text-gray-400">No provider</span>`, fee].filter(Boolean).join(`<span class="text-gray-300"> · </span>`);
    const right = p.flagged && needs(p) ? `<button type="button" class="inline-flex items-center gap-1.5 h-7 px-1.5 rounded-md text-[13px] text-gray-500 hover:bg-gray-100 hover:text-gray-800 cursor-pointer whitespace-nowrap" data-act="finish-one" data-id="${p.id}" data-list="visit" data-tip="Add the ${needs(p)} and complete it">${I("circle-alert", "size-3.5 text-orange-500")}Needs a ${needs(p)}</button>` : statusIcon(p);
    const tint = S.newVisit.has(p.id) ? "bg-blue-50/70" : sel ? "bg-blue-50/50" : "hover:bg-gray-50";
    return `<div class="flex items-center gap-3 px-4 py-2 border-b border-gray-200/80 cursor-pointer ${tint}" data-act="open-row" data-id="${p.id}" data-list="visit" role="row">
      ${checkbox(sel, `Select ${label(p)}`, `data-tick="visit" data-id="${p.id}"`)}
      <div class="min-w-0 grow"><p class="flex items-center gap-1.5 text-[13px] text-gray-900 min-w-0"><span class="font-mono text-[12.5px]">${p.code}</span><span class="text-gray-300">·</span><span class="truncate">${esc(p.d)}</span>${p.posted && !p.waiting ? `<span class="shrink-0 text-xs text-gray-400" data-tip="On the bill (posted to the ledger)">Billed</span>` : ""}</p>
        <p class="text-[13px] text-gray-500 truncate tabular-nums">${sub}</p></div>
      ${endMarks(p, "visit").replace("ms-auto ", "")}${right}</div>`;
  }
  function visitCol() {
    const rows = rowsOf("visit"), ids = selected("visit"), n = ids.length;
    const all = rows.length && rows.every((r) => S.sel.visit.has(r.id));
    const fails = pick("failed-save") === "in-toolbar" ? failsFor((f) => f.list === "visit") : [];
    const waitLine = pick("wait-lock") === "wait-banner" && lockOn() && S.lock.waiting
      ? `<div class="flex items-center gap-2 px-4 py-2 border-b border-gray-200/80 text-[13px] leading-5 text-gray-500">${I("clock", "size-3.5 shrink-0 text-gray-400")}${WHO} is correcting today's charges. ${S.lock.waiting} ${S.lock.waiting > 1 ? "changes wait" : "change waits"} and ${S.lock.waiting > 1 ? "go" : "goes"} through when they're done.</div>` : "";
    const tabs = [["list-checks", "Worklist", null, true], ["notebook-pen", "Notes", 1], ["info", "Visit Info"]];
    return `<aside class="relative flex flex-col min-h-0 border-s border-gray-200/80 bg-white" aria-label="Visit">
      <div class="px-5 pt-4"><div class="flex items-center gap-2"><h2 class="grow text-base font-semibold text-gray-900">Visit</h2><span class="text-[13px] font-medium text-blue-600">Change visit</span>${iconButton("panel-right", "Collapse", { s: "iconXs" })}</div>
        <div class="mt-1.5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[13px] text-gray-700"><span class="inline-flex items-center gap-1.5">${I("calendar", "size-3.5 text-gray-400")}October 10, 2026</span><span class="inline-flex items-center gap-1.5">${I("clock", "size-3.5 text-gray-400")}9:00 – 10:00 AM</span><span class="inline-flex items-center gap-1.5">${I("user", "size-3.5 text-gray-400")}Dr. Maya Patel</span><span class="inline-flex items-center gap-1.5">${I("map-pin", "size-3.5 text-gray-400")}Op 2</span></div></div>
      <nav class="${R.tabs} mt-3 px-5">${tabs.map(([ic, l, c, on]) => `<span class="${on ? R.tabOn : R.tab}">${I(ic, "size-4")}${l}${c ? ` <span class="${R.countBlue}">${c}</span>` : ""}</span>`).join("")}</nav>
      <div class="flex items-center gap-0.5 h-9 px-3 border-b border-gray-200/80">
        <span class="inline-flex size-7 items-center justify-center">${checkbox(all, "Select all", 'data-tickall="visit"')}</span>
        ${tbtn("complete", "circle-check", "Mark completed", { n, list: "visit", tip: n ? `${skipHint(ids, "Mark completed", "Completed")}  (C)` : "" })}
        ${tbtn("bulk-notperformed", "circle-slash", "Mark not performed", { n, list: "visit" })}
        ${tbtn("bulk-planned", "undo-2", "Return to Planned", { n, list: "visit" })}
        ${tbtn("bulk-referred", "circle-arrow-out-up-right", "Mark referred", { n, list: "visit", tip: n ? skipHint(ids, "Mark referred", "Referred") : "" })}
        ${sepV}${tbtn("provider", "user-round-cog", "Change provider", { n, list: "visit", anchor: "prov-visit", pressed: S.menu && S.menu.anchor === "prov-visit" })}
        ${tbtn("bulk-deferred", "circle-pause", "Mark deferred", { n, list: "visit", tip: n ? skipHint(ids, "Mark deferred", "Deferred") : "" })}
        ${sepV}${tbtn("remove-visit", "circle-x", "Remove from this Visit", { n, list: "visit", danger: true })}
        <span class="grow"></span>${failIcon(fails, "fail-tb-visit")}${n ? iconButton("x", "Clear selection", { s: "iconXs", attrs: 'data-act="clear" data-list="visit"' }) : ""}</div>
      ${waitLine}<div class="grow min-h-0 overflow-auto" data-keep-scroll="visit" role="rowgroup">${rows.length ? rows.map(visitRow).join("") : `<p class="px-5 py-6 text-[13px] text-gray-500">Nothing on today's visit yet.</p>`}</div>
      <div class="flex items-center gap-2 px-5 py-3 border-t border-gray-200/80">${button("Actions", { v: "white", s: "sm", iconEnd: "chevrons-up-down", cls: "[&_svg]:text-gray-400" })}<span class="grow"></span>${button("Check out", { v: "solid", s: "sm", icon: "log-out" })}</div>
      ${planPanel()}</aside>`;
  }
  function planButtons(n) {
    const q1 = pick("add-to-plan"), q3 = pick("none-or-one-plan"), q4 = pick("plan-buttons");
    const open = S.dialog && (S.dialog.type === "picker" || S.dialog.type === "today");
    const one = S.plans.length === 1 && q3 === "skip-when-obvious" ? S.plans[0] : null;
    const addName = one ? `Add to ${one.name}` : q4 === "icons-today" ? "Add to existing Treatment Plan" : "Add to plan";
    const newName = q4 === "icons-today" ? "New Treatment Plan" : "New plan";
    const newB = q4 === "two-worded" ? tbtn("new-plan", "clipboard-plus", newName, { n, list: "rec", words: newName }) : tbtn("new-plan", "clipboard-plus", newName, { n, list: "rec" });
    const addB = q4 === "two-worded" ? tbtn("add-plan", "folder-input", addName, { n, list: "rec", words: addName, anchor: "plan-btn", pressed: open })
      : tbtn("add-plan", "folder-input", addName, { n, list: "rec", anchor: "plan-btn", pressed: open });
    return newB + addB;
  }
  function recToolbar() {
    const ids = selected("rec"), n = ids.length;
    const fails = pick("failed-save") === "in-toolbar" ? failsFor((f) => f.list === "rec") : [];
    return `<div class="flex items-center gap-0.5 h-9 px-3 border-b border-gray-200/80 ${blueTop("rec")}">
      ${tbtn("to-visit", "list-plus", "Add to Visit Worklist", { n, list: "rec", tip: "Add to Visit Worklist (W)" })}${wBadge("rec")}${planButtons(n)}
      ${sepV}${tbtn("provider", "user-round-cog", "Change provider", { n, list: "rec", anchor: "prov-rec", chevron: true, pressed: S.menu && S.menu.anchor === "prov-rec" })}
      ${tbtn("bulk-referred", "arrow-up-right", "Mark referred", { n, list: "rec" })}${tbtn("complete", "circle-check", "Mark completed", { n, list: "rec", tip: n ? `${skipHint(ids, "Mark completed", "Completed")}  (C)` : "" })}${tbtn("bulk-deferred", "calendar-clock", "Mark deferred", { n, list: "rec" })}
      ${sepV}${tbtn("delete", "trash-2", "Delete", { n, list: "rec", danger: true })}
      <span class="grow"></span>${failIcon(fails, "fail-tb-rec")}${n ? iconButton("x", "Clear selection", { s: "iconXs", attrs: 'data-act="clear" data-list="rec"' }) : ""}</div>`;
  }
  function pills(rows) {
    const notIn = rows.filter((r) => !plansOf(r.id).length).length;
    const p = (l, n, on) => `<span class="inline-flex items-center gap-1 h-7 px-3 rounded-full text-[13px] whitespace-nowrap ${on ? "bg-blue-600 text-white" : "border border-gray-200 bg-white text-gray-800 shadow-2xs"}">${l}<span class="${on ? "text-white/80" : "text-gray-500"}">· ${n}</span></span>`;
    return `<div class="flex items-center gap-2 h-11 px-4">${p("All", rows.length, true)}${p("Not presented", rows.filter((r) => r.status === "Planned").length)}${p("Not in Treatment Plan", notIn)}${p("Referred", rows.filter((r) => r.status === "Referred").length)}${p("Deferred", rows.filter((r) => r.status === "Deferred").length)}</div>`;
  }
  function plansTable() {
    if (!S.plans.length) return emptyState({ icon: "clipboard-list", title: "No Treatment Plans yet", body: "Tick work in Recommended Treatment and press New plan." });
    const rows = S.plans.map((pl) => { const ps = pl.phases.flatMap((ph) => ph.ids).map(get).filter(Boolean), fee = ps.reduce((a, p) => a + (p.fee || 0), 0), insE = ps.reduce((a, p) => a + (ins(p) || 0), 0);
      return { id: pl.id, name: pl.name, status: pl.status, phases: pl.phases.length, n: ps.length, done: ps.filter((p) => p.status === "Completed").length, fee, ins: insE }; });
    return sheetTable({ preset: "page", sheet: false, toolbar: false, selectable: false, addColumn: false, gutter: 0, footer: false, title: "Treatment Plans", rowKey: "id", maxHeight: 4000, rows,
      rowAttrs: (r) => `data-act="open-plan" data-plan="${r.id}" data-on="${S.panel === r.id ? 1 : 0}"`,
      columns: [{ key: "name", label: "Plan Name", icon: "clipboard-list", w: 240, grow: true, render: (r) => `<span class="font-medium text-gray-800">${esc(r.name)}</span>` },
        { key: "status", label: "Status", icon: "circle-dot", w: 150, render: (r) => statusDot(r.status, planTone[r.status]) },
        { key: "phases", label: "Phases", icon: "layers", w: 92, num: true }, { key: "n", label: "Procedures", icon: "list", w: 120, num: true, render: (r) => `${r.n}${r.done ? `<span class="text-gray-500"> · ${r.done} done</span>` : ""}` },
        { key: "fee", label: "Total Fee", icon: "receipt", w: 116, num: true, render: (r) => money(r.fee) }, { key: "pte", label: "Pt Est.", icon: "wallet", w: 112, num: true, value: (r) => r.fee - r.ins, render: (r) => money(r.fee - r.ins) }] });
  }
  function ledgerTable() {
    const bal = S.ledger.reduce((a, l) => a + l.amt, 0);
    const rows = S.ledger.map((l) => `<tr class="g-row ${l.date === TODAY && l.amt < 0 ? "" : ""}"><td class="${R.gridCell} !ps-4 tabular-nums">${l.date}${l.closed ? `<span class="ms-1.5 inline-flex align-[-2px] text-gray-400" data-tip="A closed day: the office already counted its money, so its entries never change">${I("lock", "size-3.5")}</span>` : ""}</td><td class="${R.gridCell}">${esc(l.desc)}</td><td class="${R.gridCell} !border-e-0 !pe-4 text-end tabular-nums">${money(l.amt)}</td></tr>`).join("");
    const credit = S.procs.reduce((a, p) => a + (p.posted && p.paid && p.fee != null ? Math.max(0, p.paid - p.fee) : 0), 0);
    const sum = `Balance due <span class="font-semibold text-gray-800">${money(bal + credit)}</span>${credit ? ` <span class="ms-3" data-tip="Paid on Oct 1 but no longer charged. It can pay the next visit or be refunded.">Patient credit <span class="font-semibold text-gray-800">${money(credit)}</span></span>` : ""}`;
    return `<table class="g-table table-fixed w-full"><colgroup><col style="width:190px"><col><col style="width:330px"></colgroup><thead><tr><th class="${R.gridHead} !ps-4">Date</th><th class="${R.gridHead}">Description</th><th class="${R.gridHead} !border-e-0 !pe-4 !text-end">Amount</th></tr></thead><tbody>${rows}</tbody>
      <tfoot><tr><td class="${R.gridFoot} !ps-4" colspan="2">${S.ledger.length} entries</td><td class="${R.gridFoot} !border-e-0 !pe-4 text-end tabular-nums">${sum}</td></tr></tfoot></table>`;
  }
  function lowerPane() {
    const rec = rowsOf("rec"), hist = rowsOf("history");
    const tabs = [["rec", "Recommended Treatment", rec.length], ["history", "Clinical History", hist.length], ["plans", "Treatment Plans", S.plans.length]];
    const bar = `<nav class="${R.tabs} px-4" role="tablist">${tabs.map(([k, l, n]) => { const on = S.tab === k;
      return `<button type="button" class="${on ? R.tabOn : R.tab} cursor-pointer" data-act="tab" data-tab-key="${k}" role="tab" aria-selected="${on}">${l}${n != null ? ` <span class="${cx(on ? R.countBlue : R.count, S.flash === k && "!bg-blue-600 !text-white motion-safe:animate-pulse")}">${n}</span>` : ""}</button>`; }).join("")}</nav>`;
    let body = "";
    if (S.tab === "rec") body = `${recToolbar()}${pills(rec)}<div class="border-t border-gray-200/80">${table("rec", rec, { empty: "No recommended treatment" })}</div>`;
    else if (S.tab === "history") body = table("history", hist, { foot: false });
    else if (S.tab === "plans") body = plansTable();
    return `<section class="mt-4">${bar.replace(`${R.tabs} px-4"`, `${R.tabs} px-5"`)}${body}</section>`;
  }

  /* The plan open beside the chart (the library's side panel: header with facts, flat phase sections, boxed tables) */
  function planPanel() {
    const pl = S.plans.find((x) => x.id === S.panel); if (!pl) return "";
    const all = pl.phases.flatMap((ph) => ph.ids).map(get).filter(Boolean);
    const fee = all.reduce((a, r) => a + (r.fee || 0), 0), pt = all.reduce((a, r) => a + (r.fee || 0) - (ins(r) || 0), 0);
    const nsel = selected("plan").length;
    const tbl = (rs) => rs.length ? sheetTable({ preset: "panel", sheet: false, title: "Phase", rowKey: "id", maxHeight: 4000, rows: rs.map((r) => ({ id: r.id })),
      rowAttrs: (x) => `data-on="${S.tint.has(x.id) ? 1 : 0}"`,
      columns: [{ key: "sel", label: "", w: 36, render: (x) => { const r = get(x.id); return r.status === "Completed" ? "" : checkbox(S.sel.plan.has(r.id), `Select ${label(r)}`, `data-tick="plan" data-id="${r.id}"`); } },
        { key: "t", label: "Tooth", w: 56, render: (x) => { const r = get(x.id); return r.t ? `#${r.t}` : "—"; } }, { key: "code", label: "Code", w: 64, render: (x) => `<span class="tabular-nums text-gray-500">${get(x.id).code}</span>` },
        { key: "d", label: "Description", w: 140, grow: true, render: (x) => { const r = get(x.id); return `${esc(r.d)}${r.status === "Completed" ? ` <span class="text-gray-400">· Completed</span>` : r.list === "visit" ? ` <span class="text-gray-400">· On today's visit</span>` : ""}`; } },
        { key: "fee", label: "Fee", w: 92, num: true, render: (x) => { const r = get(x.id); return r.fee == null ? "—" : money(r.fee); } }, { key: "pt", label: "Pt est.", w: 84, num: true, render: (x) => { const r = get(x.id); return r.fee == null ? "—" : money(r.fee - ins(r)); } }] })
      : `<p class="text-[13px] text-gray-400">No procedures in this phase yet</p>`;
    const notIn = rowsOf("rec").filter((r) => r.status === "Planned" && !pl.phases.some((ph) => ph.ids.includes(r.id)));
    const rail = pick("add-to-plan") === "no-button" && notIn.length ? `<section class="px-5 py-4 border-b border-gray-200/80"><h3 class="${R.groupTitle} mb-2.5">Recommended treatment not in this plan <span class="${R.count}">${notIn.length}</span></h3>
      <div class="${R.tableBox}"><table class="table-fixed border-separate border-spacing-0"><colgroup><col style="width:52px"><col style="width:62px"><col><col style="width:88px"><col style="width:72px"></colgroup><tbody>${notIn.map((r) => `<tr><td class="${R.tCell} tabular-nums">${r.t ? `#${r.t}` : "—"}</td><td class="${R.tCell} tabular-nums">${r.code}</td><td class="${R.tCell} truncate">${esc(r.d)}</td><td class="${R.tCell} text-end tabular-nums">${money(r.fee)}</td><td class="${R.tCell} text-end">${button("Add", { v: "ghost", s: "xs", icon: "plus", cls: "!text-blue-700", attrs: `data-act="rail-add" data-id="${r.id}"` })}</td></tr>`).join("")}</tbody></table></div></section>` : "";
    const line = `<div class="flex items-center gap-0.5 h-9 px-3 border-b border-gray-200/80 ${blueTop("plan")}">${tbtn("to-visit", "list-plus", "Add to Visit Worklist", { n: nsel, list: "plan", tip: "Add to Visit Worklist (W)", words: "Add to Visit Worklist" })}${wBadge("plan")}</div>`;
    const head = recordHeader({ title: esc(pl.name), sub: "Maria Lopez · Treatment plan", actions: iconButton("ellipsis", "More actions", { s: "iconSm" }), end: iconButton("x", "Close", { s: "iconSm", attrs: 'data-act="close-panel"' }),
      facts: [["Status", statusDot(pl.status, planTone[pl.status])], ["Procedures", `${all.length}`], ["Total fee", money(fee)], ["Patient est.", money(pt)]] });
    const body = `${rail}${pl.phases.map((ph) => `<section class="px-5 py-4 border-b border-gray-200/80"><h3 class="${R.groupTitle} mb-2.5">${esc(ph.n)} <span class="${R.count}">${ph.ids.filter((id) => get(id)).length}</span></h3>${tbl(ph.ids.map(get).filter(Boolean))}</section>`).join("")}`;
    const foot = `<div class="flex items-center gap-2 px-5 py-3 border-t border-gray-200/80">${button("Actions", { v: "white", s: "sm", icon: "sparkles", iconEnd: "chevron-down", cls: "[&_svg:first-child]:!text-blue-600 [&_svg:last-child]:text-gray-400" })}<span class="grow"></span>${button("Present", { v: "white", s: "sm", icon: "presentation" })}${button("Send", { v: "solid", s: "sm", icon: "send" })}</div>`;
    return `<section class="absolute top-0 right-0 bottom-0 z-30 flex flex-col bg-white border-s border-gray-200/80 shadow-[-12px_0_32px_-12px_rgba(17,24,39,0.16)]" style="width:560px" aria-label="${esc(pl.name)}">${head}${line}<div class="grow min-h-0 overflow-auto">${body}</div>${foot}</section>`;
  }

  /* ---------------- menus ---------------- */
  const mItem = (icon, main, sub, attrs, { off = false, tip = "" } = {}) => `<button type="button" role="menuitem" class="${R.menuItem} !h-auto py-1.5 !items-start ${off ? "opacity-40 !cursor-default" : ""}" ${off ? "" : attrs} ${tip ? `data-tip="${esc(tip)}"` : ""}>${I(icon, "mt-0.5 shrink-0")}<span class="min-w-0 grow text-start"><span class="block truncate">${main}</span>${sub ? `<span class="block text-xs text-gray-500 truncate">${sub}</span>` : ""}</span></button>`;
  function planMenu() {
    const ids = selected("rec"), n = ids.length, q2 = pick("pick-phase"), q4 = pick("plan-buttons");
    const line = (p) => `${p.status}${p.phases.length > 1 ? ` · ${p.phases.length} phases` : ""} · ${p.phases.reduce((a, ph) => a + ph.ids.length, 0)} procedures`;
    const step = S.menu.step && S.plans.find((p) => p.id === S.menu.step);
    let body;
    if (step) {
      body = `<button type="button" class="${R.menuItem}" data-act="menu-back">${I("chevron-left")}<span class="truncate">${esc(step.name)}</span></button><div class="${R.menuSep}"></div><p class="${R.menuLabel}">Which phase?</p>${step.phases.map((ph, i) => `<button type="button" role="menuitem" class="${R.menuItem}" data-act="to-plan" data-plan="${step.id}" data-phase="${i}">${I("corner-down-right", "!size-3.5")}<span class="truncate">${esc(ph.n)}</span></button>`).join("")}`;
    } else {
      const block = (p) => {
        if (q2 === "phases-under-plan" && p.phases.length > 1)
          return `<div data-filter="${esc(p.name.toLowerCase())}"><p class="flex items-center gap-2 px-2 pt-2 pb-0.5 text-[13px] font-medium text-gray-800">${I("clipboard-list", "size-4 text-gray-500 shrink-0")}<span class="truncate">${esc(p.name)}</span></p><p class="ps-8 pb-1 text-xs text-gray-500 truncate">${line(p)}</p>
            ${p.phases.map((ph, i) => `<button type="button" role="menuitem" class="${R.menuItem} ps-8" data-act="to-plan" data-plan="${p.id}" data-phase="${i}">${I("corner-down-right", "!size-3.5 shrink-0")}<span class="truncate">Add to ${esc(ph.n)}</span></button>`).join("")}</div>`;
        const lastI = p.phases.length - 1;
        if (q2 === "last-phase") return `<div data-filter="${esc(p.name.toLowerCase())}">${mItem("clipboard-list", esc(p.name), `${line(p)}${p.phases.length > 1 ? ` · goes in ${esc(p.phases[lastI].n)}` : ""}`, `data-act="to-plan" data-plan="${p.id}" data-phase="${lastI}"`)}</div>`;
        return `<div data-filter="${esc(p.name.toLowerCase())}">${mItem("clipboard-list", esc(p.name), line(p), p.phases.length > 1 ? `data-act="menu-step" data-plan="${p.id}"` : `data-act="to-plan" data-plan="${p.id}" data-phase="0"`)}</div>`;
      };
      const search = S.plans.length > 4 ? `<div class="relative border-b border-gray-200/80 -m-1 mb-1"><span class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">${I("search", "size-4 text-gray-400")}</span><input data-plan-search class="w-full h-10 ps-9 pe-3 text-[13px] bg-transparent outline-hidden placeholder:text-gray-400" placeholder="Search plans" /></div>` : "";
      const newItem = mItem("clipboard-plus", `New plan with ${n === 1 ? "this one" : `these ${n}`}`, "", 'data-act="new-plan"');
      const list = S.plans.length ? `<p class="${R.menuLabel}">Add ${n} ${n === 1 ? "procedure" : "procedures"} to</p>${S.plans.map(block).join("")}` : "";
      body = q4 === "one-button" ? `${newItem}${list ? `<div class="${R.menuSep}"></div>${search}${list}` : ""}` : `${search}${list}${list ? `<div class="${R.menuSep}"></div>` : ""}${newItem}`;
    }
    return `<div class="${R.menu.replace("w-60", "")} absolute z-40 max-h-[460px] overflow-auto" data-pop="plan-btn" style="width:380px" role="menu">${body}</div>`;
  }
  function providerMenu(list) {
    return `<div class="${R.menu} absolute z-40" data-pop="prov-${list}" role="menu"><p class="${R.menuLabel}">Change provider to</p>${Object.entries(PROV).map(([k, v]) => `<button type="button" role="menuitem" class="${R.menuItem}" data-act="set-provider" data-prov="${k}" data-list="${list}">${avatar(v, { size: 5 })}<span class="truncate">${esc(v)}</span></button>`).join("")}</div>`;
  }
  function statusMenu(id, list) {
    const p = get(id);
    const opts = ["Planned", "Completed", "Referred", "Deferred", "Not performed"];
    const items = opts.map((s) => {
      const cur = s === p.status;
      const blocked = p.posted && (s === "Referred" || s === "Deferred");
      const name = s === "Planned" && p.status === "Completed" ? "Return to Planned" : s === "Completed" ? "Mark completed" : `Mark ${s.toLowerCase()}`;
      return `<button type="button" role="menuitemradio" aria-checked="${cur}" class="${R.menuItem} ${blocked ? "opacity-40 !cursor-default" : ""}" ${blocked ? `data-tip="${esc(`${p.code} has a posted charge. Edit the charge instead`)}"` : `data-act="set-status" data-id="${id}" data-status="${s}" data-list="${list}"`}><span class="${cx(R.dot, TONE_DOT[statusTone[s]])}"></span><span class="grow text-start">${name}</span>${cur ? I("check", "size-4 text-blue-600") : ""}</button>`;
    }).join("");
    return `<div class="${R.menu} absolute z-40" data-pop="st-${id}" data-align="end" role="menu">${items}</div>`;
  }
  function failMenu(anchor) {
    const v = pick("failed-save");
    let fails = S.fails;
    if (anchor.startsWith("fail-row-")) fails = S.fails.filter((f) => f.procId === anchor.slice(9));
    else if (anchor === "fail-tb-visit") fails = S.fails.filter((f) => f.list === "visit");
    else if (anchor === "fail-tb-rec") fails = S.fails.filter((f) => f.list === "rec");
    const acts = (f) => {
      const b = (verb, act) => `<button type="button" class="text-[13px] font-medium text-blue-600 hover:underline cursor-pointer" data-act="${act}" data-fail="${f.id}">${verb}</button>`;
      if (f.kind === "dismiss") return b("Dismiss", "fail-dismiss");
      if (f.kind === "theirs") return `${b(`Use mine (${money(f.mine)})`, "fail-retry")}${b("OK", "fail-dismiss")}`;
      return `${b("Retry", "fail-retry")}${b("Dismiss", "fail-dismiss")}`;
    };
    const items = fails.map((f) => `<div class="px-3 py-2.5 border-b last:border-b-0 border-gray-200/80"><p class="text-[13px] font-medium text-gray-800">${esc(f.what)}${v === "top-bar" ? ` <span class="font-normal text-gray-500">· Maria Lopez</span>` : ""}</p><p class="text-[13px] leading-5 text-gray-600">${esc(f.msg)}</p><p class="mt-1.5 flex gap-3">${acts(f)}</p></div>`).join("");
    return `<div class="${R.popover} absolute z-40 w-[340px] overflow-hidden" data-pop="${anchor}" data-align="${anchor === "fail-top" ? "" : "end"}" role="dialog" aria-label="Changes that need attention">${items}</div>`;
  }
  function menus() {
    const m = S.menu; if (!m) return "";
    if (m.type === "plan") return planMenu();
    if (m.type === "provider") return providerMenu(m.list);
    if (m.type === "status") return statusMenu(m.id, m.list);
    if (m.type === "fail") return failMenu(m.anchor);
    return "";
  }

  /* ---------------- dialogs ---------------- */
  const dlg = (title, body, foot, { icon = "", w = 480, name = "" } = {}) => `<div class="absolute inset-0 z-50 bg-gray-900/30"></div><div class="absolute inset-x-0 top-[120px] z-50 flex justify-center"><div class="${R.dialog}" style="width:${w}px" role="dialog" aria-label="${esc(name || title)}">
    <div class="flex items-center justify-between h-12 px-5 border-b border-gray-200/80"><h3 class="grow flex items-center gap-2 pe-3 text-base font-semibold text-gray-800">${icon ? I(icon, "size-4 text-blue-600") : ""}${title}</h3>${iconButton("x", "Close", { s: "iconSm", cls: "-me-2", attrs: 'data-act="dlg-close"' })}</div>
    <div class="p-5">${body}</div><div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200/80">${foot}</div></div></div>`;
  function todayWindow() {
    const d = S.dialog, n = selected("rec").length, plans = S.plans;
    if (!plans.length && pick("none-or-one-plan") !== "always-list") return dlg("Add to existing Treatment Plan", `<p class="text-[13px] text-gray-500">Search for the Treatment Plan and choose a phase for ${n} selected treatment items.</p>${emptyState({ icon: "folder-plus", title: "No editable Treatment Plans", body: "Create a new Treatment Plan with the selected treatment, or choose an active Treatment Plan that is not completed.", action: button("Create new Treatment Plan", { v: "white", s: "sm", icon: "folder-plus", attrs: 'data-act="new-plan"' }) })}`,
      `${button("Cancel", { v: "white", s: "sm", attrs: 'data-act="dlg-close"' })}${button(`Add ${n} to Treatment Plan`, { v: "solid", s: "sm", cls: "opacity-50 !cursor-default" })}`, { icon: "folder-plus" });
    const P0 = plans.find((p) => p.id === d.plan) || plans[0] || { id: "", phases: [], status: "Not presented" };
    const rowH = (p) => `<button type="button" data-filter="${esc(p.name.toLowerCase())}" class="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg border text-start cursor-pointer ${p.id === P0.id ? "border-blue-500 bg-blue-50/40" : "border-gray-200/80 hover:bg-gray-50"}" data-act="tw-plan" data-plan="${p.id}"><input type="radio" tabindex="-1" class="${R.radio}" ${p.id === P0.id ? "checked" : ""} /><span class="min-w-0"><span class="block truncate text-sm font-medium text-gray-800">${esc(p.name)}</span><span class="block text-xs text-gray-500">${p.status.toLowerCase()} · ${p.phases.reduce((a, ph) => a + ph.ids.length, 0)} treatments</span></span></button>`;
    const body = `<p class="text-[13px] text-gray-500 -mt-1">Search for the Treatment Plan and choose a phase for ${n} selected treatment items.</p>
      <div class="mt-4 space-y-1.5"><p class="text-sm font-medium text-gray-800">Treatment Plan</p><div class="relative"><span class="absolute inset-y-0 start-0 flex items-center ps-3">${I("search", "size-4 text-gray-400")}</span><input data-plan-search class="${R.input} ps-9" placeholder="Search Treatment Plans" /></div>
      <div class="space-y-2 pt-1 max-h-[230px] overflow-auto">${pick("none-or-one-plan") === "always-list" ? `<button type="button" class="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200/80 hover:bg-gray-50 text-start cursor-pointer" data-act="new-plan">${I("clipboard-plus", "size-4 text-blue-600")}<span class="text-sm font-medium text-gray-800">New plan with these ${n}</span></button>` : ""}${plans.map(rowH).join("")}</div></div>
      <div class="mt-4 space-y-1.5"><p class="text-sm font-medium text-gray-800">Phase</p><select class="${R.select}" data-tw-phase>${P0.phases.map((ph, i) => `<option value="${i}">${esc(ph.n)}</option>`).join("")}</select>
      ${P0.status !== "Not presented" ? `<p class="text-xs text-orange-700">This Treatment Plan has already advanced beyond draft. Adding treatment will require staff to review and re-present the updated Treatment Plan.</p>` : ""}</div>`;
    return dlg("Add to existing Treatment Plan", body, `${button("Cancel", { v: "white", s: "sm", attrs: 'data-act="dlg-close"' })}${button(`Add ${n} to Treatment Plan`, { v: "solid", s: "sm", attrs: `data-act="tw-add" data-plan="${P0.id}"` })}`, { icon: "folder-plus" });
  }

  /* The Add to plan window, two designs (both search first, since a patient can have many plans) */
  const planCount = (p) => p.phases.reduce((a, ph) => a + ph.ids.filter((id) => get(id)).length, 0);
  const planMeta = (p) => `${p.status} · ${planCount(p)} procedure${planCount(p) === 1 ? "" : "s"}`;
  const pkOpts = () => [...$("app").querySelectorAll("[data-pk-opt]")].filter((o) => !o.closest("[hidden]") && !o.hidden);
  function pkHi(i) { pkOpts().forEach((o, k) => { const on = k === i; o.dataset.hi = on ? "1" : "0"; o.classList.toggle("bg-gray-100", on); const ent = o.querySelector("[data-enter]"); if (ent) ent.innerHTML = on ? kbd("↵") : ""; if (on) o.scrollIntoView({ block: "nearest" }); }); }
  function pickerWindow() {
    const d = S.dialog, ids = selected("rec"), n = ids.length, v = pick("add-to-plan"), q3 = pick("none-or-one-plan");
    const work = ids.map(get);
    const showNew = q3 === "always-list" || !S.plans.length;
    if (v === "phase-rows") {
      /* The library's Procedure picker (clinical-procedure-picker): the search is the header, results are grouped
       * options you move through with the arrow keys, Enter or a click adds, key hints in the footer. */
      const opt = (attrs, main, side, filter) => `<button type="button" role="option" data-pk-opt ${attrs} ${filter != null ? `data-filter="${esc(filter)}"` : ""} class="flex w-full items-center gap-3 h-9 px-2 rounded-lg text-start text-sm text-gray-800 cursor-pointer hover:bg-gray-100">${main}<span class="ms-auto shrink-0 text-xs text-gray-400 tabular-nums">${side}</span><span class="w-6 shrink-0 flex justify-end" data-enter></span></button>`;
      const groups = S.plans.map((p) => {
        const f = p.name.toLowerCase();
        const head = `<p class="${R.menuLabel} pt-2 flex items-center gap-1.5 min-w-0"><span class="${cx(R.dot, TONE_DOT[planTone[p.status]])}"></span><span class="truncate">${esc(p.name)}</span><span class="shrink-0 font-normal text-gray-400">· ${p.status}</span></p>`;
        const rows = p.phases.map((ph, i) => opt(`data-act="pk-go" data-plan="${p.id}" data-phase="${i}"`, `${I(p.phases.length > 1 ? "corner-down-right" : "clipboard-list", "size-4 shrink-0 text-gray-400")}<span class="min-w-0 truncate">${p.phases.length > 1 ? esc(ph.n) : "Add to this plan"}</span>`, `${ph.ids.filter((x) => get(x)).length} procedures`, null)).join("");
        return `<div role="group" aria-label="${esc(p.name)}" data-filter="${esc(f)}">${head}${rows}</div>`;
      }).join("");
      const newGroup = showNew ? `<div role="group" aria-label="New plan" data-filter="new plan"><p class="${R.menuLabel} pt-2">New</p>${opt('data-act="pk-go" data-new="1"', `${I("clipboard-plus", "size-4 shrink-0 text-blue-600")}<span>New plan with ${n === 1 ? "this one" : `these ${n}`}</span>`, "", null)}</div>` : "";
      const chips = work.map((r) => `<span class="${cx(R.tag, R.tagOutline)} tabular-nums">${r.t ? `#${r.t} ` : ""}${r.code}</span>`).join("");
      return `<div class="absolute inset-0 z-50 bg-gray-900/30"></div><div class="absolute inset-x-0 top-[110px] z-50 flex justify-center"><div class="${R.popover} w-[680px] max-w-full overflow-hidden" role="dialog" aria-label="Add to plan" data-picker>
        <div class="flex items-center gap-2 h-12 px-4 border-b border-gray-200/80">${I("search", "size-4 text-gray-400")}<input data-plan-search class="h-full grow bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-hidden" placeholder="Search plans by name..." aria-label="Search plans" role="combobox" aria-expanded="true" />${kbd("Esc")}</div>
        <div class="flex items-center gap-2 h-11 px-4 border-b border-gray-200/80 text-[13px]"><span class="text-gray-500">Adding</span>${chips}<span class="ms-auto tabular-nums text-gray-500">${money(work.reduce((x, r) => x + (r.fee || 0), 0))}</span></div>
        <div class="h-[360px] overflow-y-auto px-2 pb-2" role="listbox" aria-label="Plans and phases" data-pk-list>${newGroup}${S.plans.length ? groups : `<p class="px-2 py-3 text-[13px] text-gray-500">Maria has no treatment plans yet.</p>`}<div data-none hidden>${emptyState({ icon: "search-x", title: "No plan matches", body: "Check the spelling, or start a new plan with these procedures." })}</div></div>
        <div class="flex items-center gap-4 h-10 px-4 border-t border-gray-200/80 text-xs text-gray-500"><span class="inline-flex items-center gap-1.5">${kbd("↑")}${kbd("↓")} Move</span><span class="inline-flex items-center gap-1.5">${kbd("↵")} Add here</span><span class="ms-auto">${S.plans.length} open plan${S.plans.length === 1 ? "" : "s"}</span></div></div></div>`;
    }
    /* plan-preview: the plans as the library's data grid (panel preset), the chosen plan's phases beside it, each phase's
     * work in the same compact grid, with "Add here" on the phase */
    const P = S.plans.find((x) => x.id === d.plan);
    const q = (d.q || "").toLowerCase().trim();
    const shown = S.plans.filter((p) => !q || q.split(/\s+/).every((w) => p.name.toLowerCase().includes(w)));
    const planGrid = sheetTable({ preset: "panel", sheet: false, title: "Plans", rowKey: "id", maxHeight: 330, rows: shown.map((p) => ({ id: p.id, name: p.name, status: p.status, n: planCount(p) })),
      rowAttrs: (r) => `data-act="pk-pick" data-plan="${r.id}" data-on="${d.plan === r.id ? 1 : 0}"`,
      empty: { icon: "search-x", title: "No plan matches", body: "Try another word." },
      columns: [{ key: "name", label: "Plan", w: 160, grow: true, render: (r) => `<span class="${d.plan === r.id ? "font-medium text-blue-700" : ""}">${esc(r.name)}</span>` },
        { key: "status", label: "Status", w: 118, render: (r) => statusDot(r.status, planTone[r.status]) }, { key: "n", label: "Proc.", w: 56, num: true }] });
    const phaseGrid = (ph) => { const rows = ph.ids.map(get).filter(Boolean);
      return rows.length ? sheetTable({ preset: "panel", sheet: false, title: ph.n, rowKey: "id", rows: rows.map((r) => ({ id: r.id, t: r.t, code: r.code, d: r.d, fee: r.fee })),
        columns: [{ key: "t", label: "Tooth", w: 56, render: (r) => (r.t ? `#${r.t}` : "—") }, { key: "code", label: "Code", w: 64, render: (r) => `<span class="tabular-nums text-gray-500">${r.code}</span>` }, { key: "d", label: "Description", w: 120, grow: true }, { key: "fee", label: "Fee", w: 88, num: true, render: (r) => money(r.fee) }] })
        : `<p class="text-[13px] text-gray-400">No procedures yet</p>`; };
    const right = P ? `<div class="flex items-start gap-2"><div class="min-w-0 grow"><p class="text-sm font-semibold text-gray-900">${esc(P.name)}</p><p class="text-xs text-gray-500">${planMeta(P)}${P.status !== "Not presented" ? " · present it again after adding" : ""}</p></div></div>
        <div class="mt-3 space-y-4">${P.phases.map((ph, i) => `<section><div class="flex items-center gap-2 mb-2"><h3 class="${R.groupTitle}">${esc(ph.n)}</h3><span class="${R.count}">${ph.ids.filter((x) => get(x)).length}</span><span class="grow"></span>${button(`Add ${n} here`, { v: "white", s: "xs", icon: "plus", attrs: `data-act="pk-go" data-plan="${P.id}" data-phase="${i}"` })}</div>${phaseGrid(ph)}</section>`).join("")}</div>`
      : emptyState({ icon: "clipboard-list", title: "Pick a plan", body: "Its phases and the work already in it show here." });
    const left = `<div class="relative">${I("search", "size-4 text-gray-500 absolute start-2.5 top-2")}<input data-plan-grid-search class="${R.search}" placeholder="Search plans" aria-label="Search plans" value="${esc(d.q || "")}" /></div>
      ${showNew ? `<div class="mt-2">${button(`New plan with ${n === 1 ? "this one" : `these ${n}`}`, { v: "white", s: "sm", icon: "clipboard-plus", cls: "w-full !justify-start", attrs: 'data-act="pk-go" data-new="1"' })}</div>` : ""}
      <div class="mt-2">${S.plans.length ? planGrid : `<p class="py-3 text-[13px] text-gray-500">Maria has no treatment plans yet.</p>`}</div>`;
    return dlg(`Add ${n} procedure${n === 1 ? "" : "s"} to a treatment plan`, `<div class="grid grid-cols-[420px_1fr] gap-5 h-[440px]"><div class="min-h-0 overflow-auto">${left}</div><div class="min-h-0 overflow-auto ps-5 border-s border-gray-200/80">${right}</div></div>`,
      `<span class="me-auto text-xs text-gray-500">${P ? "Press Add on the phase the work belongs in." : "Pick a plan on the left."}</span>${button("Cancel", { v: "white", s: "sm", attrs: 'data-act="dlg-close"' })}`, { icon: "folder-input", w: 900 });
  }
  function editor() {
    const d = S.dialog, id = d.mode === "finish" ? d.queue[d.idx] : d.id, p = get(id);
    const miss = d.mode === "finish" ? needs(p) : null;
    const title = d.mode === "finish" ? `Finish completing ${label(p)}` : `${label(p)} ${p.d}`;
    const step = d.mode === "finish" && d.queue.length > 1 ? `<span class="ms-auto text-[13px] font-normal text-gray-500">${d.idx + 1} of ${d.queue.length}</span>` : "";
    const field = (name, inner, hl) => `<label class="block space-y-1.5"><span class="flex items-center gap-2 ${R.label}">${name}${hl ? `<span class="text-xs font-normal text-gray-500">needed to complete</span>` : ""}</span>${inner}</label>`;
    const body = `${d.mode === "finish" ? `<p class="mb-4 text-[13px] text-gray-500">${esc(p.d)}${p.t ? ` · tooth #${p.t}${p.s ? ` ${p.s}` : ""}` : ""}. Completing puts it on the bill, so it needs a ${miss}.</p>` : ""}
      <div class="grid grid-cols-2 gap-4">${field("Fee", `<div class="relative"><span class="absolute inset-y-0 start-0 flex items-center ps-3 text-sm text-gray-500">$</span><input data-ed-fee inputmode="decimal" class="${R.input} ps-7 tabular-nums ${miss === "fee" ? "ring-2 ring-blue-600/30 border-blue-500" : ""}" value="${p.fee == null ? "" : p.fee.toFixed(2)}" placeholder="0.00" /></div>`, miss === "fee")}
      ${field("Provider", `<select data-ed-prov class="${R.select} ${miss === "provider" ? "ring-2 ring-blue-600/30 border-blue-500" : ""}"><option value="">Choose a provider</option>${Object.entries(PROV).map(([k, v]) => `<option value="${k}" ${p.prov === k ? "selected" : ""}>${esc(v)}</option>`).join("")}</select>`, miss === "provider")}</div>
      ${p.posted && p.paid ? `<p class="mt-4 text-[13px] text-gray-500">Paid ${money(p.paid)} on Oct 1. If you lower the fee, the extra becomes patient credit.</p>` : ""}`;
    const foot = d.mode === "finish" ? `${button(d.idx + 1 < d.queue.length ? "Skip" : "Skip", { v: "white", s: "sm", attrs: 'data-act="ed-skip"' })}${button("Complete", { v: "solid", s: "sm", icon: "circle-check", attrs: 'data-act="ed-complete"' })}`
      : `${button("Cancel", { v: "white", s: "sm", attrs: 'data-act="dlg-close"' })}${button("Save", { v: "solid", s: "sm", attrs: 'data-act="ed-save"' })}`;
    return dlg(`${esc(title)}${step}`, body, foot, { w: 480, name: title });
  }
  function correction() {
    const d = S.dialog, p = get(d.queue[d.idx]);
    const body = `<p class="text-[13px] text-gray-500 mb-4">${esc(desc(p))} was billed today. To mark it ${d.status.toLowerCase()}, take its charge off.</p>${moneySteps([["Posted charge", p.fee], ["Take it off (an entry today)", -p.fee]], ["Change to the bill", -p.fee])}`;
    return dlg(`Charge correction${d.queue.length > 1 ? ` · ${d.idx + 1} of ${d.queue.length}` : ""}`, body, `${button("Skip", { v: "white", s: "sm", attrs: 'data-act="corr-skip"' })}${button("Save correction", { v: "solid", s: "sm", attrs: 'data-act="corr-save"' })}`);
  }
  function review() {
    const d = S.dialog, all = d.billed.length + d.rest.length;
    const body = `<p class="text-[13px] text-gray-500 mb-4">${d.billed.length === 1 ? "One of these is" : `${d.billed.length} of these are`} already on the bill. Marking ${d.billed.length === 1 ? "it" : "them"} ${d.status.toLowerCase()} takes the charge off with an entry today.</p>
      ${moneySteps(d.billed.map((id) => [desc(get(id)), -get(id).fee, "billed today"]), d.billed.length > 1 ? ["Change to the bill", -d.billed.reduce((a, id) => a + get(id).fee, 0)] : null)}`;
    const verb = d.status === "Referred" ? "Refer" : "Defer";
    return dlg(`${verb} ${all}?`, body, `${d.rest.length ? button(`${verb} the other ${d.rest.length}`, { v: "white", s: "sm", attrs: 'data-act="rev-rest"' }) : button("Cancel", { v: "white", s: "sm", attrs: 'data-act="dlg-close"' })}${button(`${verb} all ${all}`, { v: "solid", s: "sm", attrs: 'data-act="rev-all"' })}`);
  }
  function dialogs() {
    const d = S.dialog; if (!d) return "";
    return { today: todayWindow, picker: pickerWindow, editor, correction, review }[d.type]();
  }
  function notes() {
    const v = pick("failed-save");
    return `<div class="absolute top-3 right-3 z-[55] flex flex-col gap-2">${S.notes.map((n) => alertCard({ icon: n.icon || "circle-alert", tone: n.tone || "orange", title: esc(n.title), body: n.body ? esc(n.body) : "",
      action: n.fail && S.fails.some((f) => f.id === n.fail) ? (S.fails.find((f) => f.id === n.fail).kind === "dismiss" ? "" : S.fails.find((f) => f.id === n.fail).kind === "theirs" ? "Use mine" : "Retry") : "",
      attrs: `data-note="${n.id}" ${n.fail ? `data-fail="${n.fail}"` : ""}` })).join("")}</div>`;
  }

  /* ---------------- render ---------------- */
  function render() {
    const root = $("app"); if (!root || !S) return;
    const scroll = root.querySelector("section .overflow-auto")?.scrollTop || 0;
    const srch = root.querySelector("[data-plan-search]"), srchVal = srch ? srch.value : "", srchFocus = srch && document.activeElement === srch;
    const kept = Object.fromEntries([...root.querySelectorAll("[data-keep-scroll]")].map((n) => [n.dataset.keepScroll, n.scrollTop]));
    root.innerHTML = `<div class="grid h-full" style="grid-template-columns:56px 272px minmax(0,1fr) 440px">${railCol()}${patientCol()}${centerCol()}${visitCol()}</div>${menus()}${dialogs()}${notes()}`;
    const sc = root.querySelector("section .overflow-auto"); if (sc) sc.scrollTop = scroll;
    root.querySelectorAll("[data-keep-scroll]").forEach((n) => { if (kept[n.dataset.keepScroll]) n.scrollTop = kept[n.dataset.keepScroll]; });
    const s2 = root.querySelector("[data-plan-search]");
    if (s2 && srchVal) { s2.value = srchVal; s2.dispatchEvent(new Event("input", { bubbles: true })); }
    if (s2 && (srchFocus || (S.dialog && S.dialog.fresh))) { s2.focus({ preventScroll: true }); if (S.dialog) S.dialog.fresh = false; }
    place(root); icons(); fit(); sidePanel(true);
    if (S.dialog && S.dialog.type === "picker" && root.querySelector("[data-picker]") && !pkOpts().some((o) => o.dataset.hi === "1")) pkHi(0);
    if (S.dialog && S.dialog.type === "picker" && root.querySelector("[data-plan-grid-search]") && S.dialog.fresh) { root.querySelector("[data-plan-grid-search]").focus({ preventScroll: true }); S.dialog.fresh = false; }
    if (Coach.on) requestAnimationFrame(coachRedraw);
    if (S.dialog && S.dialog.type === "editor" && S.dialog.mode === "finish") { const p = get(S.dialog.queue[S.dialog.idx]); const el = root.querySelector(needs(p) === "provider" ? "[data-ed-prov]" : "[data-ed-fee]"); if (el && document.activeElement !== el) el.focus({ preventScroll: true }); }
  }
  function place(root) {
    const s = scale(); const base = root.getBoundingClientRect();
    root.querySelectorAll("[data-pop]").forEach((m) => {
      const a = root.querySelector(`[data-anchor="${m.dataset.pop}"]`); if (!a) return;
      const r = a.getBoundingClientRect(); const left = (r.left - base.left) / s, right = (r.right - base.left) / s;
      const x = m.dataset.align === "end" ? right - m.offsetWidth : left;
      m.style.left = Math.max(8, Math.min(W - m.offsetWidth - 8, x)) + "px";
      m.style.top = Math.round((r.bottom - base.top) / s + 4) + "px";
    });
  }
  const W = 1720;
  const scale = () => Math.min(1, ($("stage").clientWidth || W) / W);
  function fit() {
    const root = $("app"), s = scale();
    /* Fit the window: scale to its width, and make the app exactly as tall as what's left, like the real chart
     * (the side columns stay put; the middle scrolls inside). */
    const top = $("stage-inner").getBoundingClientRect().top;
    const h = Math.max(480, innerHeight - top - 12);
    root.style.transform = s === 1 ? "" : `scale(${s})`;
    root.style.height = h / s + "px";
    $("stage-inner").style.height = h + "px";
  }

  /* ---------------- side panel: scenario, design switches, decided ---------------- */
  function sidePanel(soft) {
    const sc = SC.find((x) => x.id === UI.sc) || SC[0];
    const lock = S.lock && UI.sc === "lock" ? `<p class="mt-2 flex items-center gap-2 text-[13px] text-gray-600">${I("clock", "size-4 text-gray-400")}${WHO} finishes in <span data-countdown class="font-medium tabular-nums">${Math.max(0, Math.ceil((S.lock.until - Date.now()) / 1000))} s</span></p>` : "";
    const qHtml = (q, expanded) => {
      const cur = UI.show[q.id], saved = UI.picks[q.id];
      if (!expanded) {
        const o = q.opts.find((x) => x.k === cur);
        return `<button type="button" class="flex w-full items-center gap-2 px-3 h-9 text-start rounded-lg hover:bg-gray-50 cursor-pointer" data-side="expand" data-q="${q.id}">${I("chevron-right", "size-3.5 text-gray-400 shrink-0")}<span class="text-[13px] text-gray-800 truncate">${esc(q.short)}</span><span class="ms-auto text-[13px] text-gray-500 truncate max-w-[45%]">${saved ? `${I("check", "size-3.5 inline text-blue-600 align-[-2px]")} ` : ""}${esc(o.n)}</span></button>`;
      }
      const opts = q.opts.map((o, i) => { const on = o.k === cur;
        return `<button type="button" class="flex w-full gap-3 p-2.5 rounded-lg border text-start cursor-pointer ${on ? "border-blue-500 bg-blue-50/40" : "border-gray-200/80 hover:bg-gray-50"}" data-side="show" data-q="${q.id}" data-k="${o.k}" aria-pressed="${on}">
          <span class="flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${on ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}">${"ABCD"[i]}</span>
          <span class="min-w-0"><span class="flex flex-wrap items-center gap-1.5 text-[13px] font-medium text-gray-900">${esc(o.n)}${o.rec ? `<span class="${cx(R.tag, R.tagBlue)} !h-5">Recommended</span>` : ""}${saved === o.k ? `<span class="${cx(R.tag, "bg-gray-900 text-white")} !h-5">${I("check", "size-3")}Your pick</span>` : ""}</span><span class="mt-0.5 block text-[13px] leading-5 text-gray-600">${esc(o.t)}</span></span></button>`; }).join("");
      return `<div class="py-3 border-b border-gray-200/80 last:border-b-0" data-qbox="${q.id}">
        <div class="flex items-start gap-2"><p class="text-sm font-semibold text-gray-900 grow">${esc(q.q)}</p>${FLOWS[q.id] ? `<button type="button" class="shrink-0 inline-flex items-center gap-1 h-6 px-2 rounded-md text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 cursor-pointer" data-side="play" data-q="${q.id}">${I("play", "size-3")}Play</button>` : ""}</div>
        ${q.hint ? `<p class="mt-1 text-[13px] leading-5 text-gray-500">${esc(q.hint)}</p>` : ""}
        <div class="mt-2.5 space-y-1.5">${opts}</div>
        <div class="mt-2.5 flex items-center gap-2">${button(saved === cur ? "Picked" : "Pick the one showing", { v: saved === cur ? "soft" : "white", s: "xs", icon: saved === cur ? "check" : "", attrs: `data-side="pick" data-q="${q.id}"` })}
          <input data-side-note="${q.id}" class="${R.inputSm} !h-7 grow" placeholder="Comment (optional)" value="${esc(UI.notes[q.id] || "")}" /></div></div>`;
    };
    const qi = Math.min(Q.length - 1, Math.max(0, UI.qi || 0)), cq = Q[qi];
    const chip = (q, i) => { const on = i === qi, done = !!UI.picks[q.id];
      return `<button type="button" class="relative inline-flex size-8 items-center justify-center rounded-lg text-[13px] font-semibold cursor-pointer ${on ? "bg-blue-600 text-white" : done ? "bg-gray-100 text-gray-800 hover:bg-gray-200" : "ring-1 ring-inset ring-gray-200 text-gray-600 hover:bg-gray-50"}" data-side="goto" data-i="${i}" data-tip="${esc(`${i + 1}. ${q.short}${done ? " · picked" : ""}`)}" aria-label="${esc(`Question ${i + 1}: ${q.short}`)}" ${on ? 'aria-current="step"' : ""}>${i + 1}${done ? `<span class="absolute -top-1 -end-1 inline-flex size-3.5 items-center justify-center rounded-full bg-blue-600 ring-2 ring-white">${I("check", "size-2.5 text-white [stroke-width:3]")}</span>` : ""}</button>`; };
    const navBtn = (dir, off) => `<button type="button" class="inline-flex size-8 items-center justify-center rounded-lg ring-1 ring-inset ring-gray-200 text-gray-600 ${off ? "opacity-35 cursor-default" : "hover:bg-gray-50 cursor-pointer"}" ${off ? "disabled" : `data-side="${dir}"`} aria-label="${dir === "qprev" ? "Previous question" : "Next question"}">${I(dir === "qprev" ? "chevron-left" : "chevron-right", "size-4")}</button>`;
    const nPicked = Q.filter((q) => UI.picks[q.id]).length;
    const handOpen = UI.handOpen || sc.group === "Already decided";
    const alt = FLOWS[cq.id] && FLOWS[cq.id].alt;
    const html = `
      <div class="pb-3 border-b border-gray-200/80">
        <div class="flex items-center gap-2"><p class="grow text-xs font-medium text-gray-500">Design question ${qi + 1} of ${Q.length} · ${nPicked} picked</p>${navBtn("qprev", qi === 0)}${navBtn("qnext", qi === Q.length - 1)}</div>
        <div class="mt-2 flex flex-wrap gap-1.5">${Q.map(chip).join("")}</div>
      </div>
      ${qHtml(cq, true).replace('class="py-3 border-b border-gray-200/80 last:border-b-0"', 'class="pt-3 pb-4 border-b border-gray-200/80"')}
      <p class="pt-3 text-[13px] leading-5 text-gray-500">Tap an option to watch it on the chart, step by step.${alt ? ` Also try it with many plans: <button type="button" class="font-medium text-blue-600 hover:underline cursor-pointer" data-side="alt" data-q="${cq.id}">${esc(alt.name)}</button>.` : ""}</p>
      ${qi < Q.length - 1 ? `<div class="pt-2">${button(`Next question: ${esc(Q[qi + 1].short)}`, { v: "white", s: "sm", iconEnd: "arrow-right", cls: "w-full !justify-between", attrs: 'data-side="qnext"' })}</div>` : ""}
      <div class="pt-3 mt-3 border-t border-gray-200/80"><button type="button" class="flex w-full items-center gap-2 px-1 h-8 text-start cursor-pointer" data-side="hand">${I(handOpen ? "chevron-down" : "chevron-right", "size-3.5 text-gray-400")}<span class="text-xs font-medium text-gray-500">Try it by hand: ${esc(sc.name)}</span></button>
        ${handOpen ? `<div class="ps-6 pe-1 pb-1"><ol class="space-y-1 text-[13px] leading-5 text-gray-700 list-decimal ps-4">${sc.steps.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>${lock}<div class="mt-2">${button("Restart this scenario", { v: "white", s: "xs", icon: "rotate-ccw", attrs: 'data-side="restart"' })}</div><p class="mt-2 text-xs text-gray-500">Other scenarios are in the Scenario menu at the top.</p></div>` : ""}</div>
      <div class="pt-1"><button type="button" class="flex w-full items-center gap-2 px-1 h-8 text-start cursor-pointer" data-side="decided">${I(UI.decidedOpen ? "chevron-down" : "chevron-right", "size-3.5 text-gray-400")}<span class="text-xs font-medium text-gray-500">Already decided (${DECIDED.length}), built in here</span></button>
        ${UI.decidedOpen ? `<ul class="mt-1 space-y-1.5 ps-6 pe-1 text-[13px] leading-5 text-gray-600 list-disc">${DECIDED.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>` : ""}</div>
      <p class="mt-4 pt-3 border-t border-gray-200/80 text-xs leading-5 text-gray-400">Round 1, Oct 10, 2026, made by Claude Opus 5.5. Laid out like the live chart on the stack, drawn with the design-system library (its tooth chart is the app's own tooth art). Maria Lopez, the plans and every amount are invented; nothing touches Asha, and "saving" is pretend. Picks save to the decisions hub.</p>`;
    const el = $("side");
    if (soft && el.dataset.sig === sig()) { const cd = el.querySelector("[data-countdown]"); return; }
    const active = document.activeElement && document.activeElement.dataset && document.activeElement.dataset.sideNote;
    el.innerHTML = html; el.dataset.sig = sig(); icons();
    if (active) { const inp = el.querySelector(`[data-side-note="${active}"]`); if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); } }
    $("save-state").textContent = UI.save;
  }
  const sig = () => JSON.stringify([UI.sc, UI.show, UI.qi, UI.handOpen, UI.picks, UI.decidedOpen, !!(S && S.lock)]);

  /* ---------------- picks: saved to answers.json through serve.py, else this browser only ------------ */
  const DECK_DECISIONS = Q.map((q) => ({ id: q.id, question: q.q, options: Object.fromEntries(q.opts.map((o) => [o.k, o.n])) }));
  async function savePick(qid, choice) {
    const at = new Date().toISOString().replace(/\.\d+Z$/, "Z");
    if (choice !== undefined) UI.picks[qid] = choice;
    const answers = { [qid]: { choice: UI.picks[qid] || null, notes: UI.notes[qid] || "", savedAt: at } };
    store.set("picks", UI.picks); store.set("notes", UI.notes);
    UI.save = "Saving…"; $("save-state").textContent = UI.save;
    try {
      const r = await fetch("api/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers, decisions: DECK_DECISIONS }) });
      if (!r.ok) throw new Error(r.status);
      UI.save = `Saved to answers.json · ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    } catch (e) { UI.save = "Saved in this browser only (serve.py is not running)"; }
    $("save-state").textContent = UI.save; sidePanel();
  }
  async function loadPicks() {
    UI.picks = store.get("picks", {}); UI.notes = store.get("notes", {});
    try { const r = await fetch("api/answers"); if (r.ok) { const a = (await r.json()).answers || {};
      Object.entries(a).forEach(([k, v]) => { if (v.choice) UI.picks[k] = v.choice; if (v.notes) UI.notes[k] = v.notes; }); } } catch (e) { /* offline: browser copy only */ }
    sidePanel();
  }

  /* ---------------- events ---------------- */
  function onApp(e) {
    const t = e.target.closest("[data-act]");
    const inMenu = e.target.closest("[data-pop]");
    if (e.target.matches("input[data-tick], input[data-tickall]")) return; // handled by change
    const tooth = e.target.closest("[data-tooth]");
    if (tooth && !t) { const n = +tooth.dataset.tooth; S.tooth = S.tooth === n ? 0 : n; S.menu = null; return render(); }
    if (!t) { if (S.menu && !inMenu) { S.menu = null; render(); } return; }
    const a = t.dataset.act, list = t.dataset.list, id = t.dataset.id;
    const ids = list ? selected(list) : [];
    switch (a) {
      case "tab": S.tab = t.dataset.tabKey; S.menu = null; break;
      case "top-tab": S.top = t.dataset.top; S.menu = null; break;
      case "nav": if (t.dataset.nav === "plans") { S.view = "chart"; S.top = "chart"; S.tab = "plans"; } else S.view = t.dataset.nav; S.menu = null; break;
      case "layer": { const k = t.dataset.layer; S.layers = k === "all" ? { planned: true, completed: true, existing: true } : { planned: k === "planned", completed: k === "completed", existing: k === "existing" }; break; }
      case "bulk-notperformed": S.sel[list] = new Set(); return change({ ids, list, label: "Mark not performed", apply: () => ids.forEach((x) => { const p = get(x); if (p.posted) takeOffCharge(p, "Not performed"); p.status = "Not performed"; delete p.flagged; }) });
      case "bulk-planned": { const done = ids.filter((x) => get(x).status !== "Planned"); S.sel[list] = new Set(); if (!done.length) break;
        return change({ ids: done, list, label: "Return to Planned", apply: () => done.forEach((x) => { const p = get(x); if (p.status === "Completed") toPlanned(p); else p.status = "Planned"; }) }); }
      case "clear": S.sel[list] = new Set(); break;
      case "complete": return complete(ids, list);
      case "bulk-referred": return bulkStatus("Referred", ids, list);
      case "bulk-deferred": return bulkStatus("Deferred", ids, list);
      case "remove-visit": S.sel.visit = new Set(); return change({ ids, list, label: "Remove from this Visit", apply: () => ids.forEach((x) => { const p = get(x); if (p.status !== "Completed") p.list = "rec"; }) });
      case "delete": return change({ ids, list, label: "Delete", apply: () => removeProc(ids) });
      case "to-visit": return addToVisit(list);
      case "provider": S.menu = S.menu && S.menu.anchor === `prov-${list}` ? null : { type: "provider", list, anchor: `prov-${list}` }; break;
      case "set-provider": { const pr = t.dataset.prov; const target = selected(list); S.menu = null; S.sel[list] = new Set();
        return change({ ids: target, list, label: "Change provider", apply: () => target.forEach((x) => { get(x).prov = pr; }) }); }
      case "row-status": S.menu = S.menu && S.menu.anchor === `st-${id}` ? null : { type: "status", id, list, anchor: `st-${id}` }; break;
      case "set-status": S.menu = null; return rowStatus(id, t.dataset.status, list);
      case "open-row": if (e.target.closest("button,input,select,a")) return; S.menu = null; S.dialog = { type: "editor", mode: "edit", id, list }; break;
      case "finish-one": S.dialog = { type: "editor", mode: "finish", queue: [id], idx: 0, list }; break;
      case "new-plan": return newPlan(selected("rec"));
      case "add-plan": case "plan-menu": {
        const q1 = pick("add-to-plan"), q3 = pick("none-or-one-plan"), sel = selected("rec");
        if (S.plans.length <= 1 && q3 === "skip-when-obvious") { if (!S.plans.length) return newPlan(sel); return addToPlan(S.plans[0].id, S.plans[0].phases.length - 1, sel); }
        S.menu = null; S.dialog = q1 === "today-window" ? { type: "today", fresh: true } : { type: "picker", plan: null, phase: null, fresh: true }; break; }
      case "pk-pick": S.dialog.plan = t.dataset.plan; break;
      case "pk-go": if (t.dataset.new) return newPlan(selected("rec")); return addToPlan(t.dataset.plan, +t.dataset.phase, selected("rec"), { open: false });
      case "menu-step": S.menu.step = t.dataset.plan; break;
      case "menu-back": delete S.menu.step; break;
      case "to-plan": return addToPlan(t.dataset.plan, +t.dataset.phase, selected("rec"));
      case "tw-plan": S.dialog.plan = t.dataset.plan; break;
      case "tw-add": { const ph = +($("app").querySelector("[data-tw-phase]")?.value || 0); return addToPlan(t.dataset.plan, ph, selected("rec"), { open: false }); }
      case "open-plan": S.panel = t.dataset.plan; S.sel.plan = new Set(); break;
      case "close-panel": S.panel = null; S.sel.plan = new Set(); if (S.wList === "plan") S.wList = "rec"; break;
      case "rail-add": { const pl = S.plans.find((x) => x.id === S.panel); pl.phases[pl.phases.length - 1].ids.push(id); S.tint = new Set([id]); setTimeout(() => { S.tint = new Set(); render(); }, 1600); break; }
      case "fail-open": S.menu = S.menu && S.menu.anchor === t.dataset.anchor ? null : { type: "fail", anchor: t.dataset.anchor }; break;
      case "fail-retry": case "fail-dismiss": { const f = S.fails.find((x) => x.id === t.dataset.fail); S.fails = S.fails.filter((x) => x !== f); S.menu = null;
        if (f && a === "fail-retry" && f.redo) return f.redo(); break; }
      case "dlg-close": S.dialog = null; break;
      case "ed-save": case "ed-complete": case "ed-skip": return editorAct(a);
      case "corr-save": case "corr-skip": { const d = S.dialog, p = get(d.queue[d.idx]);
        if (a === "corr-save") { takeOffCharge(p, "Charge correction"); p.status = d.status; }
        if (d.idx + 1 < d.queue.length) d.idx++; else S.dialog = null; break; }
      case "rev-all": case "rev-rest": { const d = S.dialog; S.dialog = null;
        if (a === "rev-all") d.billed.forEach((x) => { const p = get(x); takeOffCharge(p, `Marked ${d.status.toLowerCase()}`); p.status = d.status; });
        if (d.rest.length) return setStatus(d.rest, d.status, d.list); break; }
      default: return;
    }
    render();
  }
  function editorAct(a) {
    const d = S.dialog, root = $("app");
    const id = d.mode === "finish" ? d.queue[d.idx] : d.id, p = get(id);
    const feeIn = root.querySelector("[data-ed-fee]").value.replace(/[$,\s]/g, ""), provIn = root.querySelector("[data-ed-prov]").value || null;
    const fee = feeIn === "" ? null : Math.round(parseFloat(feeIn) * 100) / 100;
    if (a === "ed-skip") { if (d.idx + 1 < d.queue.length) d.idx++; else S.dialog = null; return render(); }
    if (a === "ed-complete") {
      p.prov = provIn; if (fee != null && !Number.isNaN(fee)) p.fee = fee;
      if (needs(p)) { const inp = root.querySelector(needs(p) === "fee" ? "[data-ed-fee]" : "[data-ed-prov]"); inp.focus(); return; }
      if (d.idx + 1 < d.queue.length) d.idx++; else S.dialog = null;
      return change({ ids: [id], list: d.list, label: "Mark completed", apply: () => doComplete(p) });
    }
    S.dialog = null;
    const provChanged = provIn !== p.prov, feeChanged = fee != null && !Number.isNaN(fee) && fee !== p.fee;
    if (!provChanged && !feeChanged) return render();
    if (provChanged) p.prov = provIn;
    if (feeChanged) return change({ ids: [id], list: d.list, label: "Fee", field: "fee", apply: () => setFee(p, fee) });
    render();
  }
  function onTick(e) {
    const t = e.target;
    if (t.matches("input[data-tick]")) {
      const list = t.dataset.tick, s = S.sel[list];
      if (t.checked) s.add(t.dataset.id); else s.delete(t.dataset.id);
      if (list === "rec" || list === "plan") S.wList = list;
      if (list === "rec" || list === "visit") S.cList = list;
      S.menu = null; render();
    } else if (t.matches("input[data-tickall]")) {
      const list = t.dataset.tickall, rows = rowsOf(list);
      S.sel[list] = t.checked ? new Set(rows.map((r) => r.id)) : new Set();
      if (list === "rec") S.wList = "rec"; S.cList = list; S.menu = null; render();
    }
  }
  function onKey(e) {
    if (e.key === "Escape") { if (S.menu || S.dialog) { S.menu = null; S.dialog = null; render(); } return; }
    if (e.metaKey || e.ctrlKey || e.altKey || S.dialog || (e.target instanceof Element && e.target.closest("input,select,textarea,[contenteditable]"))) return;
    const k = e.key.toLowerCase();
    if (k === "w") {
      const list = S.wList; const visible = list === "rec" ? recVisible() : !!S.panel;
      if (visible && selected(list).length) { e.preventDefault(); addToVisit(list); }
    } else if (k === "c") {
      const list = S.cList; const visible = list === "visit" || recVisible();
      if (visible && selected(list).length) { e.preventDefault(); complete(selected(list), list); }
    }
  }
  function onSide(e) {
    const t = e.target.closest("[data-side]"); if (!t) return;
    const a = t.dataset.side, q = t.dataset.q;
    if (a === "show") { UI.show[q] = t.dataset.k; store.set("show", UI.show); S.menu = null; sidePanel(); if (FLOWS[q]) return play(q); render(); return; }
    if (a === "play") return play(q);
    if (a === "pick") { const inp = $("side").querySelector(`[data-side-note="${q}"]`); if (inp) UI.notes[q] = inp.value; return savePick(q, UI.show[q]); }
    if (a === "goto" || a === "qnext" || a === "qprev") {
      UI.qi = a === "goto" ? +t.dataset.i : Math.max(0, Math.min(Q.length - 1, (UI.qi || 0) + (a === "qnext" ? 1 : -1))); store.set("qi", UI.qi);
      const f = FLOWS[Q[UI.qi].id]; if (f && f.sc !== UI.sc) return start(f.sc); return sidePanel(); }
    if (a === "alt") { const f = FLOWS[q].alt; start(f.sc); return play(q); }
    if (a === "hand") { UI.handOpen = !UI.handOpen; return sidePanel(); }
    if (a === "expand") UI.open[q] = true;
    if (a === "collapse") UI.open[q] = false;
    if (a === "decided") UI.decidedOpen = !UI.decidedOpen;
    if (a === "restart") return start(UI.sc);
    store.set("open", UI.open); sidePanel();
  }
  function start(id, { keepCoach = false } = {}) {
    if (!keepCoach) stopCoach();
    UI.sc = SC.some((x) => x.id === id) ? id : SC[0].id; store.set("sc", UI.sc);
    S = SETUP[UI.sc](); $("scenario").value = UI.sc;
    const u = new URLSearchParams(location.search); u.set("sc", UI.sc); history.replaceState(null, "", "?" + u);
    render(); sidePanel();
  }

  /* ---------------- walkthroughs: picking an option plays it on the chart, step by step ---------------- */
  const Q$ = (sel) => (typeof sel === "function" ? sel() : $("app").querySelector(sel) || document.querySelector(sel));
  const phaseSection = (txt) => () => [...$("app").querySelectorAll("section h3")].find((h) => h.textContent.includes(txt))?.closest("section");
  let sideUi = () => {};
  const Coach = { on: false, token: 0, clicks: 0, idx: 0, target: 0, curIdx: 0, go: false };
  class Stop extends Error {}
  const sleep = (ms, tok) => new Promise((res, rej) => {
    let left = ms; const tickMs = 100;
    const t = setInterval(() => { if (tok !== Coach.token) { clearInterval(t); return rej(new Stop()); } left -= tickMs; if (left <= 0) { clearInterval(t); res(); } }, tickMs);
  });
  /* Each step waits for Next; nothing advances on a timer */
  const waitNext = (tok) => new Promise((res, rej) => { Coach.go = false;
    const t = setInterval(() => { if (tok !== Coach.token) { clearInterval(t); return rej(new Stop()); } if (Coach.go) { Coach.go = false; clearInterval(t); res(); } }, 60); });
  function coachDraw(el, say, { final = false } = {}) {
    const stage = $("stage-inner"), ring = $("coach-ring"), card = $("coach-card");
    const meta = Coach.meta;
    card.innerHTML = `<p class="text-xs font-medium text-gray-400">${esc(meta.letter)} · ${esc(meta.name)}${meta.ov ? `<span class="block font-normal text-gray-500">For this walkthrough: ${esc(meta.ov)}</span>` : ""}</p>
      <p class="mt-1 text-sm leading-6 text-white">${say}</p>
      <div class="mt-3 flex items-center gap-2"><button type="button" data-coach="back" ${Coach.curIdx ? "" : "disabled"} class="h-7 px-2.5 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-35 disabled:hover:bg-white/10 text-[13px] text-white cursor-pointer disabled:cursor-default">← Back</button>${final
        ? `<button type="button" data-coach="replay" class="h-7 px-2.5 rounded-md bg-white/10 hover:bg-white/20 text-[13px] text-white cursor-pointer">Replay</button><span class="grow"></span><button type="button" data-coach="close" class="h-7 px-2.5 rounded-md bg-blue-600 hover:bg-blue-500 text-[13px] font-medium text-white cursor-pointer">Back to choices</button>`
        : `<button type="button" data-coach="next" class="h-7 px-3 rounded-md bg-blue-600 hover:bg-blue-500 text-[13px] font-medium text-white cursor-pointer">Next →</button><span class="text-xs text-gray-500">Step ${Coach.curIdx + 1}</span><span class="grow"></span><button type="button" data-coach="close" class="h-7 px-2 rounded-md text-[13px] text-gray-400 hover:text-white cursor-pointer">Stop</button>`}</div>`;
    card.hidden = false;
    if (!el) { ring.hidden = true; card.style.left = "50%"; card.style.top = (scrollY + 120 - stage.getBoundingClientRect().top - scrollY) + "px"; return; }
    const b = stage.getBoundingClientRect();
    const rs = (Array.isArray(el) ? el.filter(Boolean) : [el]).map((x) => x.getBoundingClientRect());
    if (!rs.length) { ring.hidden = true; return; }
    const r = { left: Math.min(...rs.map((x) => x.left)), top: Math.min(...rs.map((x) => x.top)), right: Math.max(...rs.map((x) => x.right)), bottom: Math.max(...rs.map((x) => x.bottom)) };
    r.width = r.right - r.left; r.height = r.bottom - r.top;
    ring.hidden = false;
    Object.assign(ring.style, { left: r.left - b.left - 5 + "px", top: r.top - b.top - 5 + "px", width: r.width + 10 + "px", height: r.height + 10 + "px" });
    const cw = card.offsetWidth, ch = card.offsetHeight;
    const below = r.bottom + ch + 24 < innerHeight;
    card.style.top = (below ? r.bottom - b.top + 14 : r.top - b.top - ch - 14) + "px";
    card.style.left = Math.max(8, Math.min(b.width - cw - 8, r.left - b.left + r.width / 2 - cw / 2)) + "px";
  }
  function coachRedraw() { if (Coach.on && Coach.cur) coachDraw(Q$(Coach.cur.el), Coach.cur.say, { final: Coach.cur.final }); }
  function makeCtx(tok) {
    const show = async (el, say, final, idx) => {
      Coach.curIdx = idx;
      const got = Q$(el), node = Array.isArray(got) ? got[0] : got;
      if (node) { const r = node.getBoundingClientRect(), box = node.closest("[data-keep-scroll]")?.getBoundingClientRect() || { top: 70, bottom: innerHeight };
        if (r.top < box.top + 8 || r.bottom > box.bottom - 8) { node.scrollIntoView({ block: "center", behavior: UI.reduced ? "auto" : "smooth" }); await sleep(450, tok); } }
      Coach.cur = { el, say, final }; coachDraw(Q$(el), say, { final });
    };
    return {
      async step({ el, say, act, count = !!act }) {
        if (tok !== Coach.token) throw new Stop();
        const idx = Coach.idx++, fast = idx < Coach.target;
        if (!fast) { await show(el, say, false, idx); await waitNext(tok); $("coach-ring").classList.add("coach-press"); await sleep(220, tok); $("coach-ring").classList.remove("coach-press"); }
        if (act) { const got = Q$(el); act(Array.isArray(got) ? got[0] : got); if (count) Coach.clicks++; await sleep(fast ? 150 : 550, tok); }
      },
      async wait(ms) { await sleep(ms, tok); },
      async scenario(id) { start(id, { keepCoach: true }); await sleep(300, tok); },
      async done({ el, say }) { await show(el, say, true, Coach.idx++); }
    };
  }
  const click = (n) => n && n.click();
  const setVal = (v) => (n) => { if (n) { n.value = v; n.dispatchEvent(new Event("change", { bubbles: true })); } };
  const focusTip = (n) => { if (n) n.focus(); };
  const tipOf = (sel) => (Q$(sel)?.dataset.tip || "").replace(/\s+\(C\)$/, "");
  const clicks = () => `${Coach.clicks} click${Coach.clicks === 1 ? "" : "s"}`;
  const failSel = () => ({ "top-bar": '[data-anchor="fail-top"]', "in-row": () => $("app").querySelector('[data-act="fail-open"][data-anchor^="fail-row-"]'), "in-toolbar": '[data-anchor="fail-tb-visit"]', corner: "[data-note]" }[pick("failed-save")]);
  const failWhere = { "top-bar": "Today the row goes back quietly and an orange icon appears in the app's left bar. Nothing on the row itself.", "in-row": "The row goes back and a small orange icon sits at the end of that row.",
    "in-toolbar": "The row goes back and an orange icon appears at the end of the Visit Worklist toolbar.", corner: "The row goes back and a note slides into the window's top-right corner for 8 seconds." };
  async function openFailure(c, lead) {
    await c.wait(1100);
    const v = pick("failed-save");
    await c.step({ el: failSel(), say: `${lead} ${failWhere[v]}${v === "corner" ? "" : " Open it:"}`, act: v === "corner" ? null : click, count: false });
  }

  const typeSearch = (txt) => (n) => { if (n) { n.value = txt; n.dispatchEvent(new Event("input", { bubbles: true })); } };
  const pickRow = (plan, phase) => () => $("app").querySelector(`[data-act="pk-pick"][data-plan="${plan}"]${phase == null ? "" : `[data-phase="${phase}"]`}`);
  /* Pick a plan and phase inside whichever window is open */
  async function pickInWindow(c, plan, phase, { search = "", label: lbl } = {}) {
    if (Q$('[data-act="tw-add"]')) {
      if (search) await c.step({ el: "[data-plan-search]", say: `Type “${search}” to find it.`, act: typeSearch(search), count: false });
      await c.step({ el: `[data-act="tw-plan"][data-plan="${plan}"]`, say: "Pick the plan…", act: click });
      if (phase) await c.step({ el: "[data-tw-phase]", say: `…then its phase in a second box. It starts on Phase 1; the work belongs in ${lbl}.`, act: setVal(String(phase)) });
      return c.step({ el: '[data-act="tw-add"]', say: "Press Add.", act: click });
    }
    const go = () => $("app").querySelector(`[data-act="pk-go"][data-plan="${plan}"][data-phase="${phase}"]`);
    if (pick("add-to-plan") === "phase-rows") {
      if (search) await c.step({ el: "[data-plan-search]", say: `The cursor is already in the search, like the procedure picker. Type “${search}”.`, act: typeSearch(search), count: false });
      return c.step({ el: go, say: `Results are grouped by plan, with each phase as a line. Click ${lbl} (or use the arrow keys and Enter): it's added straight away.`, act: click });
    }
    if (search) await c.step({ el: "[data-plan-grid-search]", say: `The plans are a table with a search. Type “${search}”.`, act: (n) => { n.value = search; n.dispatchEvent(new Event("input", { bubbles: true })); }, count: false });
    await c.step({ el: () => $("app").querySelector(`tr[data-act="pk-pick"][data-plan="${plan}"]`), say: "Click the plan's row. Its phases and the work already in them show on the right…", act: click });
    return c.step({ el: () => go()?.closest("section"), say: `…then press “Add 2 here” on ${lbl}.`, act: () => click(go()) });
  }
  async function planFlow(c) {
    const q1 = pick("add-to-plan");
    await c.step({ el: () => [$("app").querySelector('[data-act="open-row"][data-id="r6"]'), $("app").querySelector('[data-act="open-row"][data-id="r7"]')], say: "Two fillings are ticked in Recommended Treatment: #31 and #2. They should go into “Root canal and crown #19”, Phase 2." });
    await c.step({ el: '[data-anchor="plan-btn"]', say: q1 === "today-window" ? "Press the folder icon, “Add to existing Treatment Plan”." : "Press Add to plan. It opens a window, with the cursor in the search.", act: click });
    await pickInWindow(c, "p1", 1, { label: "Phase 2 · Crown" });
    await c.step({ el: '[data-act="tab"][data-tab-key="plans"]', say: "The window closes and nothing else pops up. Let's check the plan.", act: click, count: false });
    await c.step({ el: '[data-act="open-plan"][data-plan="p1"]', say: "Open the plan.", act: click, count: false });
    return c.done({ el: phaseSection("Phase 2"), say: `Both fillings are in Phase 2 · Crown. Adding them took ${clicks()}.` });
  }
  async function manyFlow(c) {
    const q1 = pick("add-to-plan");
    await c.step({ el: '[data-act="tab"][data-tab-key="plans"]', say: "Maria has twelve open plans, some with long names and several phases.", ms: 0 });
    await c.step({ el: '[data-anchor="plan-btn"]', say: "With the two fillings ticked, press Add to plan.", act: click });
    await pickInWindow(c, "p3", 2, { search: "implant", label: "Phase 3 · Crown on the implant" });
    return c.done({ el: '[data-act="tab"][data-tab-key="plans"]', say: q1 === "today-window" ? `Done in ${clicks()}, but only because you changed the Phase box; it starts on Phase 1.` : `Search found the two implant plans out of twelve; one more click picked the phase. ${clicks()}.` });
  }
  async function buttonsFlow(c) {
    const q4 = pick("plan-buttons");
    await c.step({ el: '[data-act="new-plan"]', say: q4 === "icons-today" ? "Two look-alike icons: New Treatment Plan and Add to existing Treatment Plan. You only learn which is which by hovering:" : "The two plan buttons are written out: New plan and Add to plan.", act: q4 === "icons-today" ? focusTip : null, count: false });
    if (q4 === "icons-today") await c.step({ el: '[data-anchor="plan-btn"]', say: "…and the folder next to it.", act: focusTip, count: false });
    await c.step({ el: '[data-anchor="plan-btn"]', say: "Press Add to plan: it opens the window; nothing drops from the toolbar.", act: click });
    return c.done({ el: '[role="dialog"]', say: q4 === "icons-today" ? "The window opens. Staff learn the two icons by hovering until they remember them." : "The window opens. Nobody has to hover to find the right button." });
  }
  async function noneOneFlow(c) {
    const q3 = pick("none-or-one-plan");
    await c.step({ el: () => [$("app").querySelector('[data-act="open-row"][data-id="r6"]'), $("app").querySelector('[data-act="open-row"][data-id="r7"]')], say: "Maria has no treatment plans yet. Two fillings are ticked." });
    await c.step({ el: '[data-anchor="plan-btn"]', say: "Press Add to plan.", act: click });
    if (q3 === "skip-when-obvious") await c.step({ el: () => $("app").querySelector("section.absolute"), say: "Nothing to choose, so a new plan opens straight away with the fillings in it." });
    else if (Q$('[role="dialog"] [data-act="pk-go"][data-new]') || Q$('[role="dialog"] button[data-act="new-plan"]')) {
      const el = Q$('[data-act="pk-go"][data-new]') ? '[data-act="pk-go"][data-new]' : '[role="dialog"] [data-act="new-plan"]';
      await c.step({ el, say: q3 === "always-list" ? "The window opens with “New plan with these 2” at the top. Pick it." : "Today's window opens with nothing to pick, only a Create button.", act: click });
    }
    await c.wait(500);
    await c.scenario("one-plan");
    await c.step({ el: '[data-anchor="plan-btn"]', say: q3 === "skip-when-obvious" ? "Now with one plan. The button's name says where the work goes: “Add to Upper crowns #3 and #14”. Press it." : "Now Maria has one plan. Press Add to plan again.", act: click });
    if (q3 !== "skip-when-obvious") await pickInWindow(c, "p2", 0, { label: "Phase 1" });
    await c.step({ el: '[data-act="tab"][data-tab-key="plans"]', say: "Let's check the plan.", act: click, count: false });
    await c.step({ el: '[data-act="open-plan"][data-plan="p2"]', say: "Open it.", act: click, count: false });
    return c.done({ el: phaseSection("Phase 1"), say: q3 === "skip-when-obvious" ? "One click put them straight in. Easy to miss if you meant to start a new alternate plan instead." : q3 === "always-list" ? "In the plan. New plan stayed one click away inside the same window the whole time." : "In the plan, after picking the only plan there was." });
  }
  async function failFlow(c) {
    await c.step({ el: '[data-act="row-status"][data-id="v3"]', say: "Mark the bitewings referred: click the circle at the end of its row…", act: click });
    await c.step({ el: '[data-act="set-status"][data-id="v3"][data-status="Referred"]', say: "…and choose Mark referred. (The connection is about to drop.)", act: click });
    await c.step({ el: '[data-act="open-row"][data-id="v3"]', say: "It shows Referred straight away, like every instant change…", ms: 900 });
    await openFailure(c, "…but it didn't save.");
    const v = pick("failed-save");
    await c.step({ el: v === "corner" ? "[data-note] [data-toast-action]" : '[data-act="fail-retry"]', say: "It says what happened, with Retry. Press Retry.", act: click });
    return c.done({ el: '[data-act="open-row"][data-id="v3"]', say: "Saved: the bitewings are Referred." });
  }
  async function conflictFlow(c) {
    await c.step({ el: '[data-act="open-row"][data-id="v4"]', say: "Open the filling on #30.", act: (n) => click(n.querySelector(".grow")) });
    await c.step({ el: "[data-ed-fee]", say: "Change its fee from $225.00 to $200.00…", act: (n) => { n.value = "200.00"; } });
    await c.step({ el: '[data-act="ed-save"]', say: "…and save.", act: click });
    await openFailure(c, "Lisa Chen set it to $210.00 a moment earlier on another computer, so yours didn't save.");
    const k = pick("cant-retry"), v = pick("failed-save");
    const box = v === "corner" ? "[data-note]" : '[data-pop^="fail"]';
    if (k === "retry-dismiss") {
      await c.step({ el: box, say: "Today you get Retry and Dismiss. Press Retry…", act: () => click(Q$(v === "corner" ? "[data-note] [data-toast-action]" : '[data-act="fail-retry"]')) });
      await c.wait(900);
      return c.done({ el: failSel(), say: "…and it fails again: the fee already changed, so Retry can never work here. The row shows Lisa's $210.00." });
    }
    if (k === "dismiss-only") {
      await c.step({ el: box, say: "Only Dismiss, with the reason: who set what. Press Dismiss.", act: () => click(Q$('[data-act="fail-dismiss"]') || Q$('[data-note] [aria-label="Dismiss"]')) });
      return c.done({ el: '[data-act="open-row"][data-id="v4"]', say: "The row shows Lisa's $210.00. To put yours back you open the filling again." });
    }
    await c.step({ el: box, say: "The row already shows Lisa's $210.00, and the note says who set it. “Use mine” puts yours back. Press it.", act: () => click(Q$(v === "corner" ? "[data-note] [data-toast-action]" : '[data-act="fail-retry"]')) });
    await c.wait(500);
    return c.done({ el: '[data-act="open-row"][data-id="v4"]', say: "Your $200.00 is back, and it saved." });
  }
  async function completeFlow(c) {
    const k = pick("skipped-complete");
    await c.step({ el: () => [$("app").querySelector('[data-act="open-row"][data-id="v1"]'), $("app").querySelector('[data-act="open-row"][data-id="v2"]'), $("app").querySelector('[data-act="open-row"][data-id="v4"]'), $("app").querySelector('[data-act="open-row"][data-id="v5"]')], say: "Four are ticked in the Visit Worklist. The filling on #30 has no fee and the limited exam has no provider." });
    await c.step({ el: '[data-act="complete"][data-list="visit"]', say: `The button's tip warns before you click: “${esc(tipOf('[data-act="complete"][data-list="visit"]'))}”.`, act: focusTip, count: false });
    await c.step({ el: '[data-act="complete"][data-list="visit"]', say: "Press Mark completed.", act: click });
    if (k === "wait-in-list") return c.done({ el: () => [$("app").querySelector('[data-act="open-row"][data-id="v1"]'), $("app").querySelector('[data-act="open-row"][data-id="v2"]'), $("app").querySelector('[data-act="open-row"][data-id="v4"]'), $("app").querySelector('[data-act="open-row"][data-id="v5"]')], say: "Two were completed and billed. The filling and the exam stay Planned with nothing on them, so you have to remember to come back." });
    if (k === "mark-rows") {
      await c.step({ el: '[data-act="finish-one"][data-id="v4"]', say: "They stay Planned and say what's missing at the end of the row. Click it when you're ready.", act: click });
    } else await c.step({ el: '[role="dialog"]', say: "Right away a small window asks for the filling's fee. “1 of 2”, with Skip if you're not ready.", ms: 3800 });
    await c.step({ el: "[data-ed-fee]", say: "Type the fee, $225.00…", act: (n) => { n.value = "225.00"; } });
    await c.step({ el: '[data-act="ed-complete"]', say: "…and complete it.", act: click });
    if (k === "mark-rows") return c.done({ el: '[data-act="finish-one"][data-id="v5"]', say: "The filling is completed and billed. The exam still says Needs a provider until you're ready." });
    await c.step({ el: "[data-ed-prov]", say: "Next (2 of 2): the exam needs a provider.", act: setVal("patel") });
    await c.step({ el: '[data-act="ed-complete"]', say: "Complete it.", act: click });
    return c.done({ el: () => [$("app").querySelector('[data-act="open-row"][data-id="v1"]'), $("app").querySelector('[data-act="open-row"][data-id="v2"]'), $("app").querySelector('[data-act="open-row"][data-id="v4"]'), $("app").querySelector('[data-act="open-row"][data-id="v5"]')], say: "All four are completed and billed, in one go." });
  }
  async function lockFlow(c) {
    const k = pick("wait-lock");
    await c.step({ el: '[aria-label="Visit"]', say: "Lisa Chen is correcting today's visit charges on another computer for a few seconds. Nothing on screen says so yet." });
    await c.step({ el: '[data-act="row-status"][data-id="v2"]', say: "Mark the cleaning completed…", act: click });
    await c.step({ el: '[data-act="set-status"][data-id="v2"][data-status="Completed"]', say: "…choose Mark completed.", act: click });
    if (k === "refused") await c.step({ el: "[data-note]", say: "Refused: a note says the visit has an active administrative correction, and the cleaning goes back to Planned. You have to remember to redo it." });
    else if (k === "wait-in-row") await c.step({ el: '[data-act="open-row"][data-id="v2"] [data-tip^="Waiting"]', say: "It shows Completed with a small clock. Hover the clock: it's waiting for Lisa and goes through on its own." });
    else await c.step({ el: () => [...$("app").querySelectorAll('[aria-label="Visit"] div')].find((d) => /is correcting/.test(d.textContent) && d.children.length < 3), say: "One grey line above the list says Lisa is correcting charges and 1 change waits. The row looks normal." });
    await c.step({ el: '[data-act="open-row"][data-id="v2"]', say: "Skip ahead to when Lisa finishes…", act: () => { if (S.lock) S.lock.until = Date.now(); } , count: false });
    await c.wait(700);
    return c.done({ el: '[data-act="open-row"][data-id="v2"]', say: k === "refused" ? "Still Planned. Nothing happened on its own; you'd redo it now." : "It went through on its own: Completed and billed." });
  }
  async function billedFlow(c) {
    const k = pick("billed-status");
    await c.step({ el: () => [$("app").querySelector('[data-act="open-row"][data-id="v1"]'), $("app").querySelector('[data-act="open-row"][data-id="v2"]'), $("app").querySelector('[data-act="open-row"][data-id="v3"]')], say: "The exam was billed earlier today. The exam, cleaning and bitewings are ticked." });
    await c.step({ el: '[data-act="bulk-referred"][data-list="visit"]', say: `The tip on Mark referred: “${esc(tipOf('[data-act="bulk-referred"][data-list="visit"]'))}”.`, act: focusTip, count: false });
    await c.step({ el: '[data-act="bulk-referred"][data-list="visit"]', say: "Press it.", act: click });
    if (k === "leave-out") return c.done({ el: () => [$("app").querySelector('[data-act="open-row"][data-id="v1"]'), $("app").querySelector('[data-act="open-row"][data-id="v2"]'), $("app").querySelector('[data-act="open-row"][data-id="v3"]')], say: "The cleaning and bitewings are Referred. The exam stays Completed and billed; you correct its charge yourself later." });
    if (k === "open-correction") await c.step({ el: '[role="dialog"]', say: "The two change, then the exam's charge correction opens: take off $75.00. Save it.", act: () => click(Q$('[data-act="corr-save"]')) });
    else await c.step({ el: '[role="dialog"]', say: "One short window shows the −$75.00 entry it would add for the billed exam. Refer all 3.", act: () => click(Q$('[data-act="rev-all"]')) });
    await c.step({ el: '[data-act="nav"][data-nav="ledger"]', say: "All three are Referred. Billing shows what happened to the money:", act: click, count: false });
    return c.done({ el: () => [...$("app").querySelectorAll("tbody tr")].pop(), say: "The exam's $75.00 came off with a minus entry today; the original charge stays on the ledger." });
  }
  async function wFlow(c) {
    const k = pick("w-cue");
    const cue = k === "key-badge" ? '[data-tip^="W adds"]' : k === "blue-line" ? '[class*="inset_0_2px_0"]' : () => $("app").querySelector('section.absolute [data-act="to-visit"]')?.parentElement;
    await c.step({ el: cue, say: { "no-cue": "A filling is ticked in Recommended Treatment, and the crown is ticked in the open plan. Nothing says which one W will use (it's the plan, ticked last).", "key-badge": "Ticks in two lists. A small W sits on the plan's Add to Visit Worklist button: W will add the crown from the plan.", "blue-line": "Ticks in two lists. The plan has a thin blue line along its top: W will use it." }[k] });
    await c.step({ el: '[data-tick="rec"][data-id="r7"]', say: "Tick another filling in Recommended Treatment…", act: click });
    await c.step({ el: k === "no-cue" ? '[data-act="open-row"][data-id="r7"]' : cue, say: k === "no-cue" ? "…W now uses Recommended Treatment, but nothing shows it." : "…and the cue moves to Recommended Treatment.", ms: 2600 });
    await c.step({ el: '[aria-label="Visit"]', say: "Press W.", act: () => document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "w", bubbles: true })) });
    return c.done({ el: () => [$("app").querySelector('[data-act="open-row"][data-id="r6"]'), $("app").querySelector('[data-act="open-row"][data-id="r7"]')], say: "The two fillings from Recommended Treatment joined the Visit Worklist." });
  }
  const FLOWS = {
    "add-to-plan": { sc: "two-plans", run: planFlow, alt: { sc: "five-plans", run: manyFlow, name: "Twelve plans" } },
    "none-or-one-plan": { sc: "no-plan", run: noneOneFlow },
    "plan-buttons": { sc: "two-plans", run: buttonsFlow },
    "failed-save": { sc: "net-drop", run: failFlow },
    "cant-retry": { sc: "coworker-fee", run: conflictFlow },
    "skipped-complete": { sc: "complete-missing", run: completeFlow },
    "wait-lock": { sc: "lock", run: lockFlow },
    "billed-status": { sc: "billed-status", run: billedFlow },
    "w-cue": { sc: "w-key", run: wFlow }
  };
  async function play(qid, target = 0) {
    const f0 = FLOWS[qid]; if (!f0) return;
    const f = f0.alt && UI.sc === f0.alt.sc ? f0.alt : f0;
    const tok = ++Coach.token; Coach.on = true; Coach.clicks = 0; Coach.idx = 0; Coach.target = target; Coach.curIdx = target;
    const q = QBY[qid]; Object.keys(OV).forEach((k) => delete OV[k]); if (f.prep) f.prep();
    const i = q.opts.findIndex((o) => o.k === UI.show[qid]);
    const ovNote = Object.entries(OV).map(([k, v]) => `${QBY[k].short}: ${QBY[k].opts.find((o) => o.k === v).n.replace(/ \(today\)$/, "")}`).join(" · ");
    Coach.meta = { letter: "ABCD"[i], name: q.opts[i].n, qid, ov: ovNote };
    UI.sideWas = UI.side; UI.side = false; sideUi();
    start(f.sc, { keepCoach: true });
    try { await sleep(400, tok); await f.run(makeCtx(tok)); }
    catch (e) { if (!(e instanceof Stop)) { console.error(e); coachDraw(null, "This walkthrough hit a snag. Press Replay, or try it by hand.", { final: true }); } }
  }
  function stopCoach() { Object.keys(OV).forEach((k) => delete OV[k]); Coach.token++; Coach.on = false; Coach.cur = null; $("coach-ring").hidden = true; $("coach-card").hidden = true; }

  window.PROTO = {
    init() {
      $("scenario").innerHTML = [...new Set(SC.map((s) => s.group))].map((g) => `<optgroup label="${esc(g)}">${SC.filter((s) => s.group === g).map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join("")}</optgroup>`).join("");
      $("scenario").addEventListener("change", (e) => { const sc = SC.find((x) => x.id === e.target.value); const qi = sc && sc.qs.length ? Q.findIndex((q) => q.id === sc.qs[0]) : -1;
        if (qi >= 0) { UI.qi = qi; store.set("qi", qi); } start(e.target.value); });
      UI.side = store.get("side2", true); UI.left = store.get("left", false);
      sideUi = () => { document.body.classList.toggle("side-off", !UI.side); $("side-wrap").classList.toggle("on-left", UI.left);
        $("side-btn").className = `inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-[13px] font-medium cursor-pointer whitespace-nowrap ${UI.side ? "border-blue-200 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-800 shadow-2xs hover:bg-gray-50"}`;
        $("side-btn").innerHTML = `${I("sliders-horizontal", "size-4")}${UI.side ? "Hide steps &amp; design choices" : "Steps &amp; design choices"}`; icons(); };
      $("side-btn").addEventListener("click", () => { UI.side = !UI.side; store.set("side2", UI.side); sideUi(); });
      $("side-close").addEventListener("click", () => { UI.side = false; store.set("side2", false); sideUi(); });
      $("side-move").addEventListener("click", () => { UI.left = !UI.left; UI.pos = null; store.set("left", UI.left); store.set("pos", null); placeSide(); sideUi(); });
      /* Drag the panel by its header anywhere on screen; minimize folds it to the header */
      UI.pos = store.get("pos", null); UI.mini = store.get("mini", false);
      const wrap = $("side-wrap");
      const placeSide = () => {
        wrap.classList.toggle("mini", UI.mini);
        if (!UI.pos) { wrap.classList.remove("dragged"); wrap.style.left = wrap.style.top = wrap.style.height = ""; return; }
        const w = wrap.offsetWidth, x = Math.max(8, Math.min(innerWidth - w - 8, UI.pos.x)), y = Math.max(8, Math.min(innerHeight - 52, UI.pos.y));
        wrap.classList.add("dragged"); wrap.style.left = x + "px"; wrap.style.top = y + "px"; wrap.style.height = Math.max(240, innerHeight - y - 12) + "px";
      };
      $("side-min").addEventListener("click", () => { UI.mini = !UI.mini; store.set("mini", UI.mini); placeSide(); });
      $("side-head").addEventListener("pointerdown", (e) => {
        if (e.button !== 0 || e.target.closest("button")) return;
        const r = wrap.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
        wrap.classList.add("dragging"); $("side-head").setPointerCapture(e.pointerId);
        const move = (ev) => { UI.pos = { x: ev.clientX - dx, y: ev.clientY - dy }; placeSide(); };
        const up = () => { wrap.classList.remove("dragging"); store.set("pos", UI.pos); removeEventListener("pointermove", move); removeEventListener("pointerup", up); };
        addEventListener("pointermove", move); addEventListener("pointerup", up);
      });
      addEventListener("resize", placeSide);
      placeSide();
      sideUi();
      const app = $("app");
      app.addEventListener("click", onApp);
      app.addEventListener("change", onTick);
      app.addEventListener("input", (e) => { if (e.target.matches("[data-plan-grid-search]")) { S.dialog.q = e.target.value; render(); const i = $("app").querySelector("[data-plan-grid-search]"); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } return; } });
      app.addEventListener("input", (e) => { if (e.target.matches("[data-pk-list] ~ *, [data-picker] [data-plan-search]")) setTimeout(() => pkHi(0), 0); });
      app.addEventListener("keydown", (e) => { if (!e.target.matches("[data-picker] [data-plan-search]")) return;
        const opts = pkOpts(); if (!opts.length) return; const cur = Math.max(0, opts.findIndex((o) => o.dataset.hi === "1"));
        if (e.key === "ArrowDown") { e.preventDefault(); pkHi(Math.min(opts.length - 1, cur + 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); pkHi(Math.max(0, cur - 1)); }
        else if (e.key === "Enter") { e.preventDefault(); opts[cur].click(); } });
      app.addEventListener("mousemove", (e) => { const o = e.target.closest("[data-pk-opt]"); if (o && o.dataset.hi !== "1") pkHi(pkOpts().indexOf(o)); });
      app.addEventListener("input", (e) => { if (e.target.matches("[data-plan-search]")) { const v = e.target.value.toLowerCase().trim(); let any = false;
        app.querySelectorAll("[data-filter]").forEach((el) => { el.hidden = !!v && !v.split(/\s+/).every((w) => el.dataset.filter.includes(w)); any = any || !el.hidden; });
        const none = app.querySelector("[data-none]"); if (none) none.hidden = any || !v; } });
      app.addEventListener("click", (e) => { const n = e.target.closest("[data-note]"); if (!n) return;
        if (e.target.closest("[data-toast-action]")) { const f = S.fails.find((x) => x.id === n.dataset.fail); S.notes = S.notes.filter((x) => x.id !== n.dataset.note); S.fails = S.fails.filter((x) => x !== f); if (f && f.redo) f.redo(); render(); }
        else if (e.target.closest("[aria-label=Dismiss]")) { const f = n.dataset.fail; S.notes = S.notes.filter((x) => x.id !== n.dataset.note); S.fails = S.fails.filter((x) => x.id !== f); render(); } });
      $("side").addEventListener("click", onSide);
      $("coach-card").addEventListener("click", (e) => { const b = e.target.closest("[data-coach]"); if (!b) return; const a = b.dataset.coach;
        if (a === "next") Coach.go = true;
        else if (a === "back" && Coach.curIdx > 0) play(Coach.meta.qid, Coach.curIdx - 1);
        else if (a === "replay") play(Coach.meta.qid);
        else if (a === "close") { stopCoach(); UI.side = true; sideUi(); } });
      document.addEventListener("keydown", (e) => { if (!Coach.on || !Coach.cur || (e.target instanceof Element && e.target.closest("input,select,textarea"))) return;
        if (e.key === "ArrowRight" && !Coach.cur.final) { e.preventDefault(); Coach.go = true; }
        else if (e.key === "ArrowLeft" && Coach.curIdx > 0) { e.preventDefault(); play(Coach.meta.qid, Coach.curIdx - 1); } });
      addEventListener("scroll", () => { if (Coach.on) coachRedraw(); }, { passive: true, capture: true });
      UI.reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      $("side").addEventListener("change", (e) => { if (e.target.dataset.sideNote) { UI.notes[e.target.dataset.sideNote] = e.target.value; store.set("notes", UI.notes); if (UI.picks[e.target.dataset.sideNote]) savePick(e.target.dataset.sideNote); } });
      document.addEventListener("keydown", onKey);
      addEventListener("resize", () => { fit(); place($("app")); });
      start(UI.sc); loadPicks();
    }
  };
})();
