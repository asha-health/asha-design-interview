/* Appointment flow prototype: the day schedule from the design-system library, with clickable appointments.
 *
 * - "Today's panel" opens the library's current appointment panel (SCHED.v4ApptSheet). Its Check in and Check out
 *   buttons open the library's current check-in and checkout blocks, so you can see where we are today.
 * - "Your design" opens yourFlyout() below: a plain dump of the visit's invented data, waiting for a real design.
 *
 * Everything is pretend: no network, no real patients. Rebuild with `python3 build.py` after editing src/. */
const PROTO = (() => {
  const $ = (id) => document.getElementById(id);
  const store = { get(k, d) { try { const v = localStorage.getItem("appt-flow:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("appt-flow:" + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } } };
  const UI = { scenario: null, appts: [], mode: store.get("mode", "today") };

  /* ---------------- the day ---------------- */
  function dayFor(sc) {
    const base = (sc.busy ? SCHED.busyDay() : SCHED.DAY).map((a) => ({ ...a }));
    return base.map((a) => (sc.set && sc.set[a.id] ? { ...a, ...sc.set[a.id] } : a));
  }
  /* The app's own sidebar, folded to its icon rail with Scheduling current, as on the real schedule */
  function rail() {
    $("rail").innerHTML = SHELL.sidebarCollapsed("Scheduling");
    $("rail").querySelectorAll('[role="tooltip"]').forEach((x) => x.remove()); // the library's specimen pins a Tasks tooltip open
  }
  function render() {
    $("app").innerHTML = `${SCHED.schedBar({ count: UI.appts.length })}<div id="day">${SCHED.dayGrid({ appts: UI.appts, util: UI.scenario.busy ? [100, 96, 94, 100] : undefined })}</div>`;
    icons();
  }
  function setScenario(id) {
    UI.scenario = PROTO_DATA.scenarios.find((s) => s.id === id) || PROTO_DATA.scenarios[0];
    UI.appts = dayFor(UI.scenario);
    $("scenario").value = UI.scenario.id;
    $("scenario-hint").textContent = UI.scenario.hint || "";
    store.set("scenario", UI.scenario.id);
    Sheet.close(); closeLibrary(); render();
    const focus = UI.scenario.focus && UI.appts.find((a) => a.id === UI.scenario.focus);
    if (focus) open(focus);
  }

  /* ---------------- the appointment panel ---------------- */
  function open(a) {
    // the library's generic v4 panel; openApptSheet always draws Olivia as checked in, which would hide her check-in
    if (UI.mode === "today") return V4 ? SCHED.v4ApptSheet(a) : SCHED.openApptSheet(a);
    yourFlyout(a, PROTO_DATA.visit(a));
  }

  /* YOUR DESIGN GOES HERE. Replace this with the panel you design (and add check-in and check-out the same way).
   * Draw with the library's kit (psec, sheetTable, button, statusDot, infoRow, Sheet, Grid ... in
   * docs/design-system/src/kit.js) so it looks like the rest of Asha. */
  function yourFlyout(a, v) {
    const st = SCHED.ST[a.st], op = SCHED.OPS[a.op], ins = v.insurance;
    const row = (k, val) => `<tr><td class="w-[170px] py-1 pe-4 text-[13px] text-gray-500 align-top whitespace-nowrap">${k}</td><td class="py-1 text-[13px] text-gray-800">${val}</td></tr>`;
    const tbl = (rows) => `<table class="w-full">${rows.join("")}</table>`;
    Sheet.open({
      flush: true, title: esc(v.patient.name), lead: avatar(v.patient.name, { size: 9 }),
      subtitle: `Fri, Sep 25 · ${SCHED.range(a.start, a.dur)} · ${op.name}`,
      body: `<section class="${R.psec}"><div class="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-[13px] text-gray-600">
          Not designed yet. This is the raw data for the visit; replace <code class="text-gray-800">yourFlyout()</code> in
          <code class="text-gray-800">src/proto-app.js</code> with your design.</div></section>
        ${psec("Appointment", tbl([row("Status", st.label), row("Visit", esc(a.what)), row("Provider", op.prov.name), row("Chips on the card", a.chips.map((k) => SCHED.CHIP[k][0]).join(", ") || "None")]))}
        ${psec("Patient", tbl([row("Age", v.patient.age), row("Phone", v.patient.phone), row("Email", v.patient.email || "None"), row("New patient", v.patient.newPatient ? "Yes" : "No")]))}
        ${psec("Alerts", v.alerts.length ? tbl(v.alerts.map((x) => row(x.kind, esc(x.text)))) : `<p class="text-[13px] text-gray-500">None</p>`)}
        ${psec("Insurance", ins ? tbl([row("Payer", `${ins.payer} ${ins.plan}`), row("Member ID", ins.memberId), row("Status", ins.status + (ins.verifiedAt ? ` · ${ins.verifiedAt}` : "")), row("Deductible left", money(ins.deductibleLeft)), row("Annual max used", `${money(ins.used)} of ${money(ins.annualMax)}`), ...(ins.note ? [row("Note", esc(ins.note))] : [])])
          : `<p class="text-[13px] text-gray-500">None on file${v.insuranceNote ? `. ${esc(v.insuranceNote)}` : ""}</p>`)}
        ${psec("Forms", tbl(v.forms.map((f) => row(esc(f.name), f.status + (f.when ? ` · ${f.when}` : "")))))}
        ${psec("Procedures", tbl(v.procedures.map((p) => row(`${p.code} ${p.tooth}`, `${esc(p.name)} · ${p.status} · fee ${money(p.fee)} · ins. est. ${money(p.insEst)} · pt. est. ${money(p.ptEst)}`))))}
        ${psec("Money", tbl([row("Due today for this visit", money(v.copayDue)), row("Patient balance", money(v.balance.patient)), row("Family balance", money(v.balance.family)), row("Insurance pending", money(v.balance.insurancePending)),
          ...v.balance.members.map((m) => row(`· ${esc(m.name)}`, money(m.amount) + (m.note ? ` (${esc(m.note)})` : ""))),
          row("Card on file", v.cardOnFile ? `${v.cardOnFile.brand} •• ${v.cardOnFile.last4}, expires ${v.cardOnFile.expires}${v.cardOnFile.declines ? ` · declines: ${esc(v.cardOnFile.declineReason)}` : ""}` : "None"),
          ...(v.paymentNote ? [row("Note", esc(v.paymentNote))] : [])]))}
        ${psec("Next", tbl([row("Recall", `${v.recall.type}, due ${v.recall.due}${v.recall.booked ? " (booked)" : ""}`), row("Next visit", v.nextVisit ? `${esc(v.nextVisit.what)} · ${v.nextVisit.when} · ${v.nextVisit.provider}` : "None planned"),
          ...(v.family || []).map((f) => row(`Family · ${esc(f.name)}`, `Next visit ${f.next}`))]))}`,
      footer: `<span class="grow"></span>${button("Close", { v: "white", s: "sm", attrs: 'data-act="close-sheet"' })}`
    });
  }

  /* ---------------- today's check-in and checkout, from the library ---------------- */
  function showLibrary(id) {
    const b = BLOCKS.find((x) => x.id === id); if (!b) return;
    const state = b.states ? b.states[0] : null, el = $("lib-overlay");
    el.innerHTML = `<div class="w-full max-w-[1120px] rounded-xl bg-white shadow-2xl overflow-hidden" role="dialog" aria-label="${esc(b.title)}">
      <div class="flex items-center gap-3 h-11 px-4 border-b border-gray-200/80"><p class="text-[13px] font-semibold text-gray-900">Today's design: ${esc(b.title)}</p>
        <span class="text-[13px] text-gray-500 truncate">from docs/design-system (${esc(b.id)})</span><span class="grow"></span>${iconButton("x", "Close", { s: "iconSm", attrs: 'data-act="close-lib"' })}</div>
      <div data-lib-body class="relative">${b.html(state)}</div></div>`;
    el.hidden = false;
    if (b.mount) b.mount(el.querySelector("[data-lib-body]"), state);
    icons();
  }
  function closeLibrary() { $("lib-overlay").hidden = true; $("lib-overlay").innerHTML = ""; }

  /* ---------------- wiring ---------------- */
  function flyoutSwitch() {
    $("flyout-switch").innerHTML = segmented(["Today's panel", "Your design"], UI.mode === "today" ? 0 : 1, { sm: true, attrs: 'aria-label="Which appointment panel"' });
  }
  function init() {
    rail();
    $("scenario").innerHTML = PROTO_DATA.scenarios.map((s) => `<option value="${s.id}">${esc(s.name)}</option>`).join("");
    $("scenario").addEventListener("change", (e) => setScenario(e.target.value));
    flyoutSwitch();
    $("flyout-switch").addEventListener("click", (e) => { const b = e.target.closest("[data-seg]"); if (!b) return;
      UI.mode = b.dataset.seg === "0" ? "today" : "yours"; store.set("mode", UI.mode); flyoutSwitch(); setScenario(UI.scenario.id); });
    $("app").addEventListener("click", (e) => {
      const c = e.target.closest("[data-appt]");
      if (c) { const a = UI.appts.find((x) => x.id === c.dataset.appt); if (a) open(a); return; }
      const n = e.target.closest('[data-act="names"]');
      if (n) { const off = n.getAttribute("aria-pressed") !== "true"; n.setAttribute("aria-pressed", off);
        $("app").querySelectorAll("[data-nm]").forEach((x) => (x.hidden = off)); $("app").querySelectorAll("[data-ini]").forEach((x) => (x.hidden = !off)); }
    });
    /* In today's panel, Check in and Check out open the library's current blocks */
    document.addEventListener("click", (e) => {
      if (e.target.closest('[data-act="close-lib"]') || e.target.id === "lib-overlay") return closeLibrary();
      const btn = e.target.closest(".sheet button"); if (!btn || UI.mode !== "today") return;
      const label = btn.textContent.trim();
      if (label === "Check in") showLibrary("schedule-checkin");
      else if (label === "Check out" || label === "Open checkout") showLibrary("billing-checkout-payment");
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("lib-overlay").hidden) { e.preventDefault(); closeLibrary(); } });
    setScenario(store.get("scenario", "normal"));
  }
  return { init, open, setScenario, showLibrary, UI };
})();
