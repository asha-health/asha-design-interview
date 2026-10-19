/* Asha AI blocks. Labels from components/copilot/* (CopilotPanel, CopilotFollowUpInput, CopilotResourceCard,
 * blocks/WriteActionConfirmationBlock), routes/practice/aistaff, AiRecommendationBanner and Scribe (INVENTORY.md §12).
 * Calm by rule: plain-English milestones, "what Asha will do and why", confirm before any write, one small blue sparkle. */
(() => {

const P = (id) => DATA.patient(id);
const spark = (cls = "size-4") => I("sparkles", `${cls} shrink-0 text-blue-600`);
const ashaMark = (size = "size-7") => `<span class="flex ${size} shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-800">${I("sparkles", "size-4")}</span>`;
const userBubble = (text) => `<div class="flex justify-end"><p class="max-w-[85%] rounded-2xl rounded-br-md bg-gray-100 px-3.5 py-2 text-sm leading-5 text-gray-800">${text}</p></div>`;
/* A read-only table. pad: "box" (inside R.tableBox, sitting in the padding) · "5" (edge to edge in a panel, via bleed) · "4" (edge to edge in a card) */
const tbl = (heads, rows, foot, pad = "box") => {
  const edge = (i, n) => (pad === "box" ? "" : `${i === 0 ? `ps-${pad}` : ""} ${i === n - 1 ? `pe-${pad}` : ""}`);
  return `<table class="w-full border-separate border-spacing-0 text-sm">
  <thead><tr>${heads.map(([h, num], i) => `<th class="${R.tHead} ${num ? "!text-end" : ""} ${edge(i, heads.length)}">${h}</th>`).join("")}</tr></thead>
  <tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td class="${R.tCell} ${heads[i][1] ? "text-end tabular-nums" : ""} ${edge(i, r.length)}">${c}</td>`).join("")}</tr>`).join("")}</tbody>
  ${foot ? `<tfoot><tr>${foot.map((c, i) => `<td class="h-9 px-3 text-sm ${i ? "font-semibold" : "font-medium"} text-gray-800 ${heads[i][1] ? "text-end tabular-nums" : ""} ${edge(i, foot.length)}">${c}</td>`).join("")}</tr></tfoot>` : ""}</table>`;
};
const boxTable = (heads, rows, foot) => `<div class="${R.tableBox}">${tbl(heads, rows, foot)}</div>`;

/* ---------- thinking motion (main's CopilotThinkingMotion: shimmering phrase, three dots, a live ping, a soft wash on the live row) ----------
 * mount() runs again on every state switch, so every timer lives here and is cleared first. */
const clock = () => { const list = [];
  return { clear() { list.forEach((t) => { clearTimeout(t); clearInterval(t); }); list.length = 0; }, later: (fn, ms) => list.push(setTimeout(fn, ms)), every: (fn, ms) => list.push(setInterval(fn, ms)) }; };
const CO = clock(), SC = clock(); /* Copilot's and Scribe's timers, cleared separately */
const dots = (cls = "") => `<span class="inline-flex items-center gap-1 ${cls}" aria-hidden="true"><span class="asha-dot"></span><span class="asha-dot"></span><span class="asha-dot"></span></span>`;
const liveIcon = () => `<span class="relative flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-50" aria-hidden="true"><span class="asha-ping absolute size-3.5 rounded-full bg-blue-400/35"></span><span class="asha-breathe relative size-2 rounded-full bg-blue-600"></span></span>`;
/* The live line: the phrase fades in with a slow blue shimmer, then the dots. Screen readers hear srLabel once. */
const phrase = (text, srLabel = "Asha is working") => `<span class="sr-only">${srLabel}</span><span class="inline-flex min-w-0 items-center gap-1.5" aria-hidden="true"><span class="asha-fade truncate" data-phrase><span class="asha-shimmer text-sm font-medium">${text}</span></span>${dots("translate-y-px")}</span>`;
const STEPS = [
  { live: "Finding claims older than 30 days", done: "Found 3 claims older than 30 days", t: 1.3 },
  { live: "Checking what each payer last said", done: "Checked what 3 payers last said", t: 1.7 },
  { live: "Reading 3 EOBs and payer letters", done: "Read 3 EOBs and 2 payer letters", t: 1.8 },
  { live: "Deciding what your team should do", done: "Wrote up what to do next", t: 1.2 }
];
const PHRASES = ["Working on it", "Looking through your claims", "Checking what payers said", "Putting it together"];
const totalSecs = Math.round(STEPS.reduce((a, s) => a + s.t, 0));
/* v2: the phrase shimmers without its own dots; only the live step has dots */
const v2Phrase = (text, srLabel = "Asha is working") => `<span class="sr-only">${srLabel}</span><span class="inline-flex min-w-0 items-center gap-1.5" aria-hidden="true"><span class="asha-fade truncate" data-phrase><span class="asha-shimmer text-sm font-medium">${text}</span></span></span>`;
const livePhrase = (text) => (V2 ? v2Phrase(text) : phrase(text));
/* The step list. active = index of the live step (all before it are done). A thin rail joins the icons and fills blue as steps finish. */
function stepRows(active) {
  const n = STEPS.length, fill = (Math.min(active, n - 1) / (n - 1)) * 100;
  return `<ol class="relative" aria-label="What Asha checked">
    <span class="absolute start-[9px] top-4 bottom-4 w-px bg-gray-200" aria-hidden="true"><span class="absolute inset-x-0 top-0 bg-blue-600 transition-[height] duration-500 ease-out" style="height:${fill}%" data-rail></span></span>
    ${STEPS.map((s, i) => { const st = i < active ? "done" : i === active ? "live" : "next";
      return `<li class="relative -mx-2 flex h-8 items-center gap-2.5 rounded-md px-2 ${st === "live" ? "asha-wash" : ""} ${st === "done" && i === active - 1 ? "asha-fade" : ""}">
        ${st === "done" ? `<span class="relative flex size-5 shrink-0 items-center justify-center rounded-full bg-white">${I("circle-check", "size-4 text-blue-600")}</span>` : st === "live" ? liveIcon() : `<span class="relative flex size-5 shrink-0 items-center justify-center rounded-full bg-white"><span class="size-2 rounded-full border border-gray-300 bg-white"></span></span>`}
        <span class="min-w-0 grow truncate text-[13px] ${st === "done" ? "text-gray-600" : st === "live" ? "font-medium text-gray-800" : "text-gray-400"}">${st === "done" ? s.done : s.live}</span>
        ${st === "done" ? (V2 ? "" : `<span class="shrink-0 text-xs tabular-nums text-gray-400">${s.t.toFixed(1)}s</span>`) : st === "live" ? dots("shrink-0 me-1") : ""}</li>`; }).join("")}</ol>`;
}
function thinkingView(active, text, secs) {
  if (V2) return `<div class="flex min-h-7 items-center gap-2" aria-live="polite"><span class="min-w-0" data-phrase-host>${v2Phrase(text)}</span><span class="ms-auto shrink-0 text-xs tabular-nums text-gray-400" data-elapsed>${secs}s</span></div>
    <div class="mt-2" data-steps-live${chg("One Stop (the square in the box below), no seconds on each step, and moving dots only on the step Asha is on")}>${stepRows(active)}</div>`;
  return `<div class="flex min-h-7 items-center gap-2" aria-live="polite"><span class="min-w-0" data-phrase-host>${phrase(text)}</span><span class="ms-auto shrink-0 text-xs tabular-nums text-gray-400" data-elapsed>${secs}s</span></div>
    <div class="mt-2" data-steps-live>${stepRows(active)}</div>
    <div class="mt-3">${button("Stop", { v: "white", s: "xs", icon: "square", attrs: 'data-act="stop"' })}</div>`;
}
const STUCK = [["p6", "Guardian", 235, "Info requested", "needs", 145], ["p2", "MetLife", 2695, "Partial", "mid", 87], ["p13", "Cigna", 320, "Denied", "needs", 64]];
/* v4: the answer's claims as a compact table; the payer and amount are on hover, the name opens the claim */
const v4StuckTable = () => sheetTable({ sheet: false, title: "Claims waiting over 30 days", rows: STUCK.map(([pid, payer, amt, st, tone, d]) => ({ id: pid, pid, payer, amt, st, tone, d })), onOpen: () => {},
  peek: (r) => peekCard(`${esc(P(r.pid).name)}'s claim`, [["Payer", r.payer], ["Billed", `<span class="tabular-nums">${money(r.amt)}</span>`], ["Waiting", `${r.d} days`]], "Click the name to open the claim."),
  columns: [{ key: "pid", label: "Patient", w: 170, grow: true, open: true, render: (r) => esc(P(r.pid).name) }, { key: "st", label: "Status", w: 150, render: (r) => statusDot(r.st, r.tone) },
    { key: "d", label: "Waiting", w: 88, num: true, render: (r) => `<span class="tabular-nums">${r.d} days</span>` }] });
function answerView({ replay = false, enter = false } = {}) {
  const total = STUCK.reduce((a, r) => a + r[2], 0);
  return `<div class="space-y-4 ${enter ? "asha-enter" : ""}">
      <div class="flex items-center gap-2"><button type="button" data-act="steps" aria-expanded="false" class="inline-flex items-center gap-1.5 rounded-md text-[13px] text-gray-500 hover:text-gray-800 cursor-pointer">${I("circle-check", "size-4 text-blue-600")}Checked ${STEPS.length} things · ${totalSecs}s${I("chevron-right", "size-3.5 transition-transform")}</button>
        ${replay ? `<span class="ms-auto">${button("Replay", { v: "quiet", s: "xs", icon: "rotate-ccw", attrs: 'data-act="replay"' })}</span>` : ""}</div>
      <div data-steps hidden>${stepRows(STEPS.length)}</div>
      <p class="text-sm leading-6 text-gray-800"><span class="font-medium">3 claims</span> have waited more than 30 days, <span class="tabular-nums">${money(total)}</span> billed in all. Two need something from your team. One is waiting on MetLife.</p>
      ${V4 ? `<div${chg4("The stuck claims are one compact table: who, where each claim stands and how long it has waited. The payer and amount open in a card beside the panel when you point at a row, and the name opens the claim, so the separate list of claim links under the answer is gone.")}>${v4StuckTable()}</div>` : boxTable([["Patient"], ["Status"], ["Waiting", 1]], STUCK.map(([pid, payer, amt, st, tone, d]) => [esc(P(pid).name), statusDot(st, tone), `${d} days`]))}
      <div><p class="${R.groupTitle} mb-1.5">What I'd do next</p><ol class="space-y-2 text-sm leading-6 text-gray-800">
        <li class="flex gap-2"><span class="w-4 shrink-0 text-gray-400 tabular-nums">1.</span><span>Send Guardian the x-ray they asked for on Mason Reed's claim. ${flag("12 filing days left", "!inline-flex !text-[13px]")}</span></li>
        <li class="flex gap-2"><span class="w-4 shrink-0 text-gray-400 tabular-nums">2.</span><span>Appeal James Ortiz's denial with the pano from Jul 22. Cigna said it was missing.</span></li>
        <li class="flex gap-2"><span class="w-4 shrink-0 text-gray-400 tabular-nums">3.</span><span>Ask MetLife about the $1,384.50 still open on Liam Carter's root canal. Asha can make that call.</span></li></ol></div>
      ${V4 ? "" : V2 ? `<div class="${R.box} divide-y divide-gray-200/80"${chg("The claim cards name the claim and nothing more: payer and amount were already in the answer above")}>${STUCK.map(([pid]) => `<a href="#" class="flex h-10 items-center gap-3 px-3 hover:bg-gray-50"><span class="flex size-6 items-center justify-center rounded-md bg-gray-100 text-gray-500">${I("file-text", "size-3.5")}</span><span class="min-w-0 grow truncate text-[13px] font-medium text-gray-800">${esc(P(pid).name)}'s claim</span>${I("chevron-right", "size-4 text-gray-400")}</a>`).join("")}</div>`
      : `<div class="${R.box} divide-y divide-gray-200/80">${STUCK.map(([pid, payer, amt]) => `<a href="#" class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50"><span class="flex size-7 items-center justify-center rounded-md bg-gray-100 text-gray-500">${I("file-text", "size-4")}</span><span class="min-w-0 grow"><span class="block text-[13px] font-medium text-gray-800">View claim</span><span class="block truncate text-xs text-gray-500">${esc(P(pid).name)} · ${payer} · ${money(amt)}</span></span>${I("chevron-right", "size-4 text-gray-400")}</a>`).join("")}</div>`}
      <div class="flex items-center gap-0.5 -ms-1.5">${iconButton("copy", "Copy answer", { s: "iconXs" })}${iconButton("thumbs-up", "Good answer", { s: "iconXs" })}${iconButton("thumbs-down", "Bad answer", { s: "iconXs" })}</div>
      <div class="flex flex-wrap gap-1.5">${["Draft the appeal for James Ortiz", "Have Asha call MetLife"].map((t) => `<button type="button" class="${cx(R.btn, R.xs, R.white, "!font-normal")}">${t}</button>`).join("")}</div>
    </div>`;
}
const Q = "Which claims have been stuck with insurance for more than 30 days?";
function copilotBody(state) {
  if (state === "New chat") return `<div class="flex grow flex-col justify-end gap-6 pb-2">
    <div>${ashaMark("size-9")}<h2 class="mt-3 ${R.sectionTitle}">Good morning, Nina</h2><p class="${R.secondary} mt-0.5">Ask anything about your practice. Asha can look things up, and asks before it changes anything.</p></div>
    <div><p class="${R.eyebrow} mb-2">Try asking</p><div class="flex flex-col gap-1.5">${[["file-clock", "Which claims are stuck with insurance?"], ["calendar", "How many patients are scheduled today?"], ["list-checks", "What tasks are overdue?"], ["file-x", "Show me denied claims this month"]].map(([ic, t]) => `<button type="button" class="${cx(R.btn, R.sm, R.white, "!justify-start !font-normal")}">${I(ic, "!text-gray-400")}${t}</button>`).join("")}</div></div></div>`;
  const pre = STEPS.slice(0, 2).reduce((a, s) => a + s.t, 0);
  if (V2) return `<div class="space-y-5">${userBubble(Q)}
    <div class="min-w-0" data-msg${chg("No blue sparkle tile beside each answer: the answer starts at the panel's edge and gains 40px, and the one sparkle stays in the header")}>${state === "Thinking" ? thinkingView(2, PHRASES[0], Math.round(pre)) : answerView()}</div></div>`;
  return `<div class="space-y-5">${userBubble(Q)}
    <div class="flex items-start gap-3">${ashaMark()}<div class="min-w-0 grow pt-0.5" data-msg>${state === "Thinking" ? thinkingView(2, PHRASES[0], Math.round(pre)) : answerView()}</div></div></div>`;
}
/* The live demo: steps finish one by one, the rail fills, the phrase rotates, the timer ticks; then the list folds into
 * "Checked 4 things" and the answer fades in. It starts over after a pause. Reduced motion: it holds still. */
function runThinking(msg, start = 0) {
  CO.clear();
  const t0 = Date.now() - STEPS.slice(0, start).reduce((a, s) => a + s.t, 0) * 1000;
  let active = start, pi = 0;
  const secs = () => Math.round((Date.now() - t0) / 1000);
  msg.innerHTML = thinkingView(active, PHRASES[pi], secs()); icons();
  CO.every(() => { const e = msg.querySelector("[data-elapsed]"); if (e) e.textContent = `${secs()}s`; }, 1000);
  CO.every(() => { const h = msg.querySelector("[data-phrase-host]"); if (!h) return; pi = (pi + 1) % PHRASES.length; h.innerHTML = livePhrase(PHRASES[pi]); }, 1800);
  const step = () => CO.later(() => {
    active++;
    const list = msg.querySelector("[data-steps-live]");
    if (active < STEPS.length) { if (list) { list.innerHTML = stepRows(active); icons(); } return step(); }
    if (list) { list.innerHTML = stepRows(active); icons(); }
    CO.later(() => { CO.clear(); msg.innerHTML = answerView({ replay: true, enter: true }); icons(); CO.later(() => runThinking(msg, 0), 9000); }, 500);
  }, STEPS[active].t * 1000);
  step();
}
function copilotPanel(state) {
  if (V2) return sheetPanel({ w: 520, cls: "min-h-0", flush: true, title: "Copilot", lead: `<span class="mt-0.5">${ashaMark("size-6")}</span>`,
    actions: `${iconButton("history", "Chat history", { s: "iconSm" })}${iconButton("square-pen", "New chat", { s: "iconSm" })}`,
    body: `<section class="flex min-h-full flex-col border-t border-gray-200/80 px-5 py-5" data-copilot-body>${copilotBody(state)}</section>`,
    footer: `<div class="w-full"${chg("The send button stays white until you type, and the small print under the box is gone (it repeated the New chat line)")}>
        <div class="flex items-end gap-2 rounded-xl border border-gray-200 bg-white p-1.5 ps-3 shadow-2xs focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-600/15">
          <textarea rows="1" class="block min-h-8 grow resize-none border-0 bg-transparent py-1.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden" placeholder="${state === "New chat" ? "Ask anything about your practice..." : "Ask a follow-up..."}" aria-label="Ask Copilot" data-ask></textarea>
          ${iconButton("mic", "Hold to talk", { s: "iconSm" })}<span data-send>${v2SendButton(state === "Thinking" ? "stop" : "idle")}</span></div></div>` });
  return sheetPanel({ w: 460, cls: "min-h-0", flush: true, title: "Copilot", lead: `<span class="mt-0.5">${ashaMark("size-6")}</span>`,
    actions: `${iconButton("history", "Chat history", { s: "iconSm" })}${iconButton("square-pen", "New chat", { s: "iconSm" })}`,
    body: `<section class="flex min-h-full flex-col border-t border-gray-200/80 px-5 py-5" data-copilot-body>${copilotBody(state)}</section>`,
    footer: `<div class="w-full">
        <div class="flex items-end gap-2 rounded-xl border border-gray-200 bg-white p-1.5 ps-3 shadow-2xs focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-600/15">
          <textarea rows="1" class="block min-h-8 grow resize-none border-0 bg-transparent py-1.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden" placeholder="${state === "New chat" ? "Ask anything about your practice..." : "Ask a follow-up..."}" aria-label="Ask Copilot"></textarea>
          ${iconButton("mic", "Hold to talk", { s: "iconSm" })}${iconButton(state === "Thinking" ? "square" : "arrow-up", state === "Thinking" ? "Stop" : "Send", { v: state === "Thinking" ? "white" : "solid", s: "iconSm" })}</div>
        <p class="mt-1.5 text-center text-[11px] text-gray-400">Asha asks before it changes anything. Check important answers.</p></div>` });
}
/* v2 composer button: white until there's text, solid to send, a white square while Asha works (the one Stop) */
const v2SendButton = (mode) => mode === "stop" ? iconButton("square", "Stop", { v: "white", s: "iconSm", attrs: 'data-act="stop"' }) : iconButton("arrow-up", "Send", { v: mode === "ready" ? "solid" : "white", s: "iconSm" });
function claimsSlice() {
  const rows = [["p8", "Sep 10", "MetLife", 1545, "Ready to send", "on"], ["p5", "Aug 14", "Aetna", 520, "Needs review", "needs"], ["p1", "Sep 2", "Delta Dental", 253, "With payer", "off"], ["p2", "Jun 30", "MetLife", 2695, "Partial", "mid"], ["p13", "Jul 22", "Cigna", 320, "Denied", "needs"], ["p10", "Aug 25", "Delta Dental", 240, "Paid", "on"], ["p6", "May 2", "Guardian", 235, "Info requested", "needs"], ["p15", "Sep 1", "Aetna", 465, "Awaiting EOB", "off"], ["p3", "Sep 18", "Cigna", 175, "Ready to send", "on"]];
  return `<div class="pointer-events-none select-none opacity-45" aria-hidden="true" inert>
    ${workspaceHeader({ parent: "Revenue Cycle", title: "Claims", actions: button("New claim", { v: "white", s: "sm", icon: "plus" }) })}
    ${tabsWithSlot([["To be sent", 2], ["Sent", 5], ["Adjudicated", 2]], 1, dateRangeButton("Last 90 days"))}
    <div class="px-4 pt-3">${V2 ? `<div class="${edgeToEdge(16)} [&_tr>*:last-child]:!border-e-0">` : ""}<table class="w-full border-separate border-spacing-0"><thead><tr>${["Patient", "Service date", "Payer", "Billed", "Status"].map((h, i) => `<th class="${R.gridHead} ${i === 3 ? "text-end" : ""}">${h}</th>`).join("")}</tr></thead>
    <tbody>${rows.map(([pid, d, pay, amt, st, tone]) => `<tr><td class="${R.gridCell}"><span class="inline-flex items-center gap-2">${avatar(P(pid).name, { size: 5 })}${esc(P(pid).name)}</span></td><td class="${R.gridCell}">${d}</td><td class="${R.gridCell}">${pay}</td><td class="${R.gridCell} text-end tabular-nums">${money(amt)}</td><td class="${R.gridCell}">${statusDot(st, tone)}</td></tr>`).join("")}</tbody></table>${V2 ? "</div>" : ""}</div></div>`;
}
defineBlock({
  cat: "ai", id: "ai-copilot", thumb: true,
  title: "Copilot panel",
  note: "Copilot opens beside the page you're on. While it works, a short phrase shimmers and each step it checks lights up in turn, then settles with a check and its time. Then it answers with a small table, what to do next, and links to the claims. Thinking plays live; Replay runs it again.",
  where: "Every screen › Copilot (⌘J)",
  states: ["Answer", "Thinking", "New chat"],
  canvas: "bare",
  html: (state) => V2 ? `<div class="grid h-[880px] grid-cols-[minmax(0,1fr)_520px]">
    <div class="min-w-0 overflow-hidden"${chg("The Claims list behind runs edge to edge (its lines stopped 16px short), and the panel is the standard 520px")}>${claimsSlice()}</div>${copilotPanel(state)}</div>`
    : `<div class="grid h-[880px] grid-cols-[minmax(0,1fr)_460px]">
    <div class="min-w-0 overflow-hidden">${claimsSlice()}</div>${copilotPanel(state)}</div>`,
  mount: (el, state) => {
    CO.clear();
    const body = el.querySelector("[data-copilot-body]"); if (!body) return;
    const msg = body.querySelector("[data-msg]");
    body.addEventListener("click", (e) => {
      const t = e.target.closest('[data-act="steps"]');
      if (t) { const box = t.closest(".space-y-4").querySelector("[data-steps]"); const open = box.hidden; box.hidden = !open; t.setAttribute("aria-expanded", open); t.lastElementChild.style.transform = open ? "rotate(90deg)" : ""; return; }
      if (e.target.closest('[data-act="replay"]')) return runThinking(msg, 0);
      if (e.target.closest('[data-act="stop"]')) { CO.clear(); msg.innerHTML = `<p class="flex items-center gap-2 text-sm text-gray-600">${I("circle-stop", "size-4 text-gray-400")}Stopped. Nothing was changed.<span class="ms-auto">${button("Replay", { v: "quiet", s: "xs", icon: "rotate-ccw", attrs: 'data-act="replay"' })}</span></p>`; icons(); }
    });
    if (state === "Thinking" && msg && !Motion.reduced()) runThinking(msg, 2);
    if (V2) {
      const send = el.querySelector("[data-send]"), ask = el.querySelector("[data-ask]");
      const stopNow = () => { CO.clear(); if (msg) { msg.innerHTML = `<p class="flex items-center gap-2 text-sm text-gray-600">${I("circle-stop", "size-4 text-gray-400")}Stopped. Nothing was changed.<span class="ms-auto">${button("Replay", { v: "quiet", s: "xs", icon: "rotate-ccw", attrs: 'data-act="replay"' })}</span></p>`; } send.innerHTML = v2SendButton(ask.value.trim() ? "ready" : "idle"); icons(); };
      send.addEventListener("click", (e) => { if (e.target.closest('[data-act="stop"]')) stopNow(); });
      ask.addEventListener("input", () => { if (send.querySelector('[data-act="stop"]')) return; send.innerHTML = v2SendButton(ask.value.trim() ? "ready" : "idle"); icons(); });
      body.addEventListener("click", (e) => { if (e.target.closest('[data-act="replay"]') && !send.querySelector('[data-act="stop"]')) { send.innerHTML = v2SendButton("stop"); icons(); } });
      /* when the live demo finishes and shows the answer, the square turns back into Send */
      new MutationObserver(() => { if (msg && msg.querySelector('[data-act="steps"]') && send.querySelector('[data-act="stop"]')) { send.innerHTML = v2SendButton(ask.value.trim() ? "ready" : "idle"); icons(); } }).observe(msg || body, { childList: true });
    }
  }
});

/* ============================================================ 2. Inline suggestion on a claim */
/* v2: the same two-line shape everywhere: sparkle, what to do and Accept / Dismiss on line 1, the reason in grey on line 2 */
const v2Suggest = (text, why, title, { attrs = ["", ""], mark = "" } = {}) => `<div class="min-w-0"${mark}><div class="flex items-center gap-2.5">${spark("size-4")}<p class="min-w-0 grow truncate text-sm font-medium text-gray-800">${text}</p><div class="flex shrink-0 gap-1">${button("Accept", { v: "white", s: "xs", attrs: attrs[0] })}${button("Dismiss", { v: "quiet", s: "xs", attrs: attrs[1] })}</div></div>
  <p class="mt-0.5 truncate ps-[26px] text-[13px] text-gray-500" title="${esc(title)}">${why}</p></div>`;
function suggestionLine(st) {
  if (st === "Accepted") return `<div class="flex items-center gap-2.5 py-3" aria-live="polite">${I("check", "size-4 shrink-0 text-blue-600")}<p class="grow text-sm text-gray-800">Attached the panoramic x-ray from Jul 22.</p>${button("Undo", { v: "quiet", s: "xs", attrs: 'data-sg="undo"' })}</div>`;
  if (st === "Dismissed") return `<div class="flex items-center gap-2.5 py-3" aria-live="polite">${I("eye-off", "size-4 shrink-0 text-gray-400")}<p class="grow text-sm text-gray-500">Dismissed. Asha won't suggest this again on this claim.</p>${button("Undo", { v: "quiet", s: "xs", attrs: 'data-sg="undo"' })}</div>`;
  if (V2) return `<div class="py-3">${v2Suggest("Attach the pano x-ray and resubmit.", `Cigna denied this for a missing x-ray, and the <a href="#" class="text-blue-600 hover:underline underline-offset-4">pano from Jul 22</a> is already in the chart.`, "Cigna denied this for a missing x-ray, and the pano from Jul 22 is already in the chart.",
    { attrs: ['data-sg="accept"', 'data-sg="dismiss"'], mark: chg("The suggestion is the same compact line as everywhere else: Accept and Dismiss beside it, the reason on one grey line, and the pano is a link inside the reason") })}</div>`;
  return `<div class="flex items-start gap-2.5 py-3">${spark("mt-0.5 size-4")}
    <div class="min-w-0 grow"><p class="text-sm leading-5 text-gray-800"><span class="font-medium">Attach the pano x-ray and resubmit.</span> <span class="text-gray-600">Cigna denied this for a missing x-ray, and the pano from Jul 22 is already in the chart.</span></p>
    <div class="mt-2 flex items-center gap-1">${button("Accept", { v: "white", s: "xs", attrs: 'data-sg="accept"' })}${button("Dismiss", { v: "quiet", s: "xs", attrs: 'data-sg="dismiss"' })}${button("See the pano", { v: "link", s: "xs", cls: "ms-2 text-[13px]" })}</div></div></div>`;
}
const files0 = (ok) => (ok ? [["image", "Panoramic x-ray", "Jul 22 · added by Asha just now"]] : []);
const statusButton = (word, tone) => `<button type="button" class="${cx(R.btn, R.sm, R.white, "!ps-2.5")}" aria-haspopup="menu" aria-label="Status: ${esc(word)}. Change status"><span class="${cx(R.dot, TONE_DOT[tone])}"></span>${esc(word)}${I("chevron-down", "!text-gray-400")}</button>`;
/* v4: the denied claim's facts are a table you type into, with Status as its first line (no status row of its own);
 * the line is a cell you can fix before resubmitting; Actions is the standard searchable menu */
const V4_AI_CLAIM_ST = [["Denied", "needs"], ["Ready to resubmit", "on"], ["Appealing", "mid"], ["Closed", "quiet"]];
const v4AiClaimDot = (v) => `<span class="${cx(R.dot, TONE_DOT[(V4_AI_CLAIM_ST.find(([l]) => l === v) || [0, "off"])[1]])}"></span>`;
const v4AiClaimFacts = (ok) => [
  { label: "Status", value: ok ? "Ready to resubmit" : "Denied", type: "select", options: V4_AI_CLAIM_ST.map(([l]) => l), html: (r) => `<span class="inline-flex items-center gap-2 min-w-0">${v4AiClaimDot(r.value)}${esc(r.value)}</span>` },
  { label: "Filing deadline", value: "Oct 21, 2026", type: "none", html: (r) => `<span class="inline-flex items-center gap-2 min-w-0"><span class="tabular-nums">${r.value}</span><span class="inline-flex items-center gap-1 text-gray-500">${I("circle-alert", "size-3.5 shrink-0 text-orange-500")}26 days left</span></span>` },
  { label: "Denied for", value: "No x-ray attached", type: "none" }];
function v4AiClaimLines() {
  const foot = (rs) => ["Total", "", "", money(rs.reduce((a, r) => a + r.fee, 0)), money(0)];
  const rows = [{ id: "l1", code: "D7210", tooth: "#32", desc: "Surgical extraction", fee: 320, paid: 0 }];
  return { title: "Procedures", rows, foot: foot(rows), onCommit: (r, k, v, g) => { g.o.foot = foot(g.data); },
    columns: [{ key: "code", label: "Code", w: 72, render: (r) => `<span class="tabular-nums">${r.code}</span>` }, { key: "tooth", label: "Tooth", w: 64, edit: "text", render: (r) => `<span class="tabular-nums">${esc(r.tooth)}</span>` },
      { key: "desc", label: "Description", w: 140, grow: true }, { key: "fee", label: "Billed", w: 92, num: true, kind: "money", edit: "text", render: (r) => money(r.fee) },
      { key: "paid", label: "Paid", w: 80, num: true, render: (r) => `<span class="text-gray-400">${money(r.paid)}</span>` }] };
}
const v4AiClaimActions = (ok) => [
  { label: "Claim", items: [{ icon: "eye", label: "Preview claim", hint: "The ADA form as Cigna got it" }, { icon: "refresh-cw", label: "Refresh claim status", hint: "Ask Cigna for the latest" },
    { icon: "scale", label: "Prepare appeal", hint: "Start a letter for the denied line", off: ok ? "" : "Attach the x-ray first; most denials like this are paid on resubmission" },
    { icon: "phone-outgoing", label: "Have Asha call Cigna", hint: "AI Insurance Caller asks what else they need" }, { icon: "eraser", label: "Write off", hint: "Write off what the patient won't owe" }] },
  { label: "Patient", items: [{ icon: "message-square", label: "Text patient", hint: "Let her know the claim is being fixed" }, { icon: "file-heart", label: "Open chart", hint: "Her x-rays, notes and ledger" }] },
  { label: "", items: [{ icon: "ban", label: "Void claim", danger: true }] }];
function v4ClaimPanel(st) {
  const p = P("p13"), ok = st === "Accepted", files = files0(ok);
  return `<div class="flex flex-col overflow-hidden rounded-lg border border-gray-200/80 bg-white" aria-label="Claim for ${esc(p.name)}">${sheetInner({
    flush: true, title: esc(p.name), lead: avatar(p.name, { size: 9 }), subtitle: "Cigna · Primary · Service Jul 22",
    actions: iconButton("external-link", "Open in Claims", { s: "iconSm" }), tabs: ["Claim", "EOB", "History"],
    body: `<section class="${R.psec}"${chg4("Status is the first line of the claim's facts, a list you pick from, instead of a row of its own; the filing deadline is a fact with a small orange mark")}>${fieldTable(v4AiClaimFacts(ok), { title: "Claim facts" })}</section>
      <section class="border-t border-gray-200/80 px-5" data-suggest>${suggestionLine(st)}</section>
      ${psec("Procedures", `<div${chg4("The tooth and the billed amount are cells you click and type into, so a biller fixes the line right here before resubmitting")}>${sheetTable(v4AiClaimLines())}</div>`)}
      ${psec("Attachments", files.length ? `<ul class="-my-1">${files.map(([ic, t, sub]) => `<li class="flex items-center gap-3 py-1"><span class="flex size-7 items-center justify-center rounded-md bg-gray-100 text-gray-500">${I(ic, "size-4")}</span><span class="grow"><span class="block text-sm text-gray-800">${t}</span><span class="block text-xs text-gray-500">${sub}</span></span></li>`).join("")}</ul>` : `<p class="${R.secondary}">None yet.</p>`, { count: files.length || undefined, actions: button("Add", { v: "white", s: "xs", icon: "plus" }) })}`,
    footer: `<span class="inline-flex"${chg4("Actions is the standard menu every record uses: searchable, grouped, and Prepare appeal stays in the list, greyed, with the reason it should wait")}>${actionsMenu(v4AiClaimActions(ok), { open: V4_OPTS.open })}</span><span class="grow"></span>${button("Fix & resubmit", { v: "solid", s: "sm" })}` })}</div>`;
}
function claimPanel(st) {
  if (V4) return v4ClaimPanel(st);
  const p = P("p13"), ok = st === "Accepted";
  const attCount = V2 && !files0(ok).length ? undefined : files0(ok).length;
  const files = ok ? [["image", "Panoramic x-ray", "Jul 22 · added by Asha just now"]] : [];
  return `<div class="flex flex-col overflow-hidden rounded-lg border border-gray-200/80 bg-white" aria-label="Claim for ${esc(p.name)}">${sheetInner({
    flush: true, title: esc(p.name), lead: avatar(p.name, { size: 9 }), subtitle: "Cigna · Primary · Service Jul 22",
    actions: iconButton("external-link", "Open in Claims", { s: "iconSm" }), tabs: ["Claim", "EOB", "History"],
    body: `<section class="${R.psec} flex items-center justify-between gap-3 !py-3">${statusButton(ok ? "Ready to resubmit" : "Denied", ok ? "on" : "needs")}${flag("26 filing days left", "!text-[13px]")}</section>
      <section class="border-t border-gray-200/80 px-5" data-suggest>${suggestionLine(st)}</section>
      ${psec("Procedures", bleed(tbl([["Code"], ["Tooth"], ["Description"], ["Billed", 1], ["Paid", 1]], [["D7210", "#32", "Surgical extraction", money(320), `<span class="text-gray-400">${money(0)}</span>`]], ["Total", "", "", money(320), money(0)], "5")), { cls: "!pb-1" })}
      ${psec("Attachments", files.length ? `<ul class="-my-1">${files.map(([ic, t, sub]) => `<li class="flex items-center gap-3 py-1"><span class="flex size-7 items-center justify-center rounded-md bg-gray-100 text-gray-500">${I(ic, "size-4")}</span><span class="grow"><span class="block text-sm text-gray-800">${t}</span><span class="block text-xs text-gray-500">${sub}</span></span></li>`).join("")}</ul>` : `<p class="${R.secondary}">None yet.</p>`, { count: attCount, actions: button("Add", { v: "white", s: "xs", icon: "plus" }) })}`,
    footer: `${button("Actions", { v: "white", s: "sm", iconEnd: "chevron-down" })}${button("Fix & resubmit", { v: "solid", s: "sm" })}` })}</div>`;
}
defineBlock({
  cat: "ai", id: "ai-inline-suggestion", title: "Inline suggestion",
  note: "One quiet line where the work is: a small blue sparkle, what Asha suggests, why, and Accept or Dismiss. Not a banner. Accepting shows what changed with an Undo. Try Accept and Dismiss.",
  where: "Claims › a denied claim",
  states: ["Suggestion", "Accepted", "Dismissed"],
  canvas: "gray",
  html: (state) => {
    const spec = (where, text, why, acts = true) => `<div class="py-3.5 first:pt-0 last:pb-0"><p class="${R.caption} mb-2">${where}</p><div class="flex items-start gap-2.5">${spark("mt-0.5 size-4")}<p class="grow text-sm leading-5 text-gray-800"><span class="font-medium">${text}</span> <span class="text-gray-600">${why}</span></p>${acts ? `<div class="flex shrink-0 gap-1">${button("Accept", { v: "white", s: "xs" })}${button("Dismiss", { v: "quiet", s: "xs" })}</div>` : ""}</div></div>`;
    if (V2) return `<div class="grid grid-cols-[520px_minmax(0,1fr)] items-start gap-6">
      <div class="rounded-lg border border-gray-200/80 bg-white" data-claim-panel${chg("The claim panel is the standard 520px wide, and Attachments shows no \"0\" beside \"None yet\"")}>${claimPanel(state)}</div>
      <div class="${R.box} p-5"><h3 class="${R.groupTitle}">The same line in other places</h3><p class="${R.help} mb-4">Always the same two lines, next to the thing it's about, with the reason in plain words.</p>
        <div class="divide-y divide-gray-200/80 [&>div]:py-3.5 [&>div:first-child]:pt-0 [&>div:last-child]:pb-0">
          ${[["On an EOB line", "Write off $42.00 as a contractual adjustment.", "Delta's allowed amount is below your fee, and your rules write these off."], ["On an appointment", "Move this to Hyg 2 at 2:00 PM.", "Jordan is free then, and Emma asked for afternoons."], ["On a task", "Mark this done.", "The patient paid $184.00 at checkout this morning."]].map(([w, t, why]) => `<div><p class="${R.caption} mb-2">${w}</p>${v2Suggest(t, esc(why), why)}</div>`).join("")}
        </div></div></div>`;
    return `<div class="grid grid-cols-[460px_minmax(0,1fr)] items-start gap-6">
      <div class="rounded-lg border border-gray-200/80 bg-white" data-claim-panel>${claimPanel(state)}</div>
      <div class="${R.box} p-5"><h3 class="${R.groupTitle}">The same line in other places</h3><p class="${R.help} mb-4">Always one line, next to the thing it's about, with the reason in plain words.</p>
        <div class="divide-y divide-gray-200/80">
          ${spec("On an EOB line", "Write off $42.00 as a contractual adjustment.", "Delta's allowed amount is below your fee, and your rules write these off.")}
          ${spec("On an appointment", "Move this to Hyg 2 at 2:00 PM.", "Jordan is free then, and Emma asked for afternoons.")}
          ${spec("On a task", "Mark this done.", "The patient paid $184.00 at checkout this morning.")}
        </div></div></div>`;
  },
  mount: (el, state) => {
    const panel = el.querySelector("[data-claim-panel]"); let st = state;
    panel.addEventListener("click", (e) => { const b = e.target.closest("[data-sg]"); if (!b) return;
      st = { accept: "Accepted", dismiss: "Dismissed", undo: "Suggestion" }[b.dataset.sg]; panel.innerHTML = claimPanel(st); icons(); });
  }
});

/* ============================================================ 3. Write-action confirmation */
const POST_LINES = [["D3330", "#19", 1150, 1030, 560, 120], ["D2950", "#19", 295, 265, 147.5, 30], ["D2740", "#19", 1250, 1085, 603, 165]];
/* v2: the claim-form look (28px rows, small grey headers, cell lines), edge to edge in the card. Kept hand-built so the
 * row's orange mark can open its popover; the shared grid clips cell overflow. */
const v2FormTable = (heads, rows, foot) => {
  const edge = (i, n) => `${i === 0 ? "ps-4" : ""} ${i === n - 1 ? "pe-4 !border-e-0" : ""}`;
  return `<table data-kept="1" class="w-full border-separate border-spacing-0 text-[13px]">
  <thead><tr>${heads.map(([h, num], i) => `<th class="h-7 px-2 border-b border-e border-gray-200/80 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500 whitespace-nowrap ${num ? "text-end" : "text-start"} ${edge(i, heads.length)}">${h}</th>`).join("")}</tr></thead>
  <tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td class="h-7 px-2 border-b border-e border-gray-200/80 text-gray-800 whitespace-nowrap ${heads[i][1] ? "text-end tabular-nums" : ""} ${edge(i, r.length)}">${c}</td>`).join("")}</tr>`).join("")}</tbody>
  <tfoot><tr>${foot.map((c, i) => `<td class="h-7 px-2 border-e border-gray-200/80 bg-gray-50 font-medium text-gray-800 whitespace-nowrap ${heads[i][1] ? "text-end tabular-nums" : ""} ${edge(i, foot.length)}">${c}</td>`).join("")}</tr></tfoot></table>`;
};
function v2ConfirmCard(st) {
  const sum = (i) => POST_LINES.reduce((a, l) => a + l[i], 0), pt = sum(3) - sum(4), bad = st === "Couldn't post";
  const foot = st === "Posted" ? `<p class="grow text-[13px] text-gray-500">Posted 3 lines at 9:14 AM · Nina Flores confirmed</p>${button("View in ledger", { v: "white", s: "sm" })}${button("Undo", { v: "white", s: "sm", icon: "undo-2", attrs: 'data-wa="undo"' })}`
    : bad ? `<p class="grow text-[13px] text-gray-500">Nothing was changed.</p>${button("Cancel", { v: "quiet", s: "sm", attrs: 'data-wa="cancel"' })}${button("Review line 2", { v: "solid", s: "sm" })}`
    : st === "Cancelled" ? `<p class="grow text-[13px] text-gray-500">Cancelled. Nothing was posted.</p>${button("Start again", { v: "white", s: "sm", attrs: 'data-wa="undo"' })}`
    : `<p class="grow text-[13px] text-gray-500">You can reverse this from the ledger later.</p>${button("Cancel", { v: "quiet", s: "sm", attrs: `data-wa="cancel" ${st === "Posting" ? "disabled" : ""}` })}${button("Edit", { v: "white", s: "sm", icon: "pencil", attrs: st === "Posting" ? "disabled" : "" })}${button(st === "Posting" ? `${I("loader-circle", "animate-spin")}Posting…` : "Confirm", { v: "solid", s: "sm", attrs: `data-wa="confirm" ${st === "Posting" ? "disabled" : ""}` })}`;
  const code = (l, i) => (bad && i === 1 ? `<span class="inline-flex items-center gap-2.5">${l[0]}<span class="inline-flex"${chg("The problem shows on the one line it's about, as an orange mark with the reason on hover, instead of a red note above the table and a red code")}>${alertMark("Already paid", "Paid Sep 20 with check #883901, so posting it again would count it twice.", { align: "start" })}</span></span>` : l[0]);
  return `<div class="${R.box}" role="group" aria-label="Post insurance payment">
    <div class="px-4 pt-4"${chg("One status: the header no longer repeats \"Waiting for you\", \"Posting\" or \"Couldn't post\" next to the buttons that already say it, and the icon tile and eyebrow are gone")}><p class="text-base font-semibold text-gray-800">${bad ? "Asha can't post this yet" : `${st === "Posted" ? "Asha posted" : "Asha will post"} <span class="tabular-nums">${money(sum(4))}</span> to 3 lines`}</p><p class="mt-0.5 text-[13px] text-gray-500">Liam Carter · MetLife Dental · Check #884120</p></div>
    <div class="mt-3 border-y border-gray-200/80"${chg("The lines use the claim form's compact look: 28px rows, small grey headers and cell lines")}>${v2FormTable([["Code"], ["Tooth"], ["Charge", 1], ["Allowed", 1], ["Ins. paid", 1], ["Write-off", 1]], POST_LINES.map((l, i) => [code(l, i), l[1], money(l[2]), money(l[3]), money(l[4]), money(l[5])]), ["Total", "", money(sum(2)), money(sum(3)), money(sum(4)), money(sum(5))])}</div>
    <div class="px-4 py-3"><p class="mb-1.5 text-xs font-medium text-gray-500">${st === "Posted" ? "What changed" : "What else changes"}</p><ul class="space-y-1 text-[13px] text-gray-700">
      <li class="flex gap-2">${I("dot", "size-4 shrink-0 text-gray-400")}<span>Liam Carter's balance goes up by <span class="font-medium tabular-nums text-gray-800">${money(pt)}</span>, his share after insurance.</span></li>
      <li class="flex gap-2">${I("dot", "size-4 shrink-0 text-gray-400")}<span><span class="tabular-nums">${money(sum(5))}</span> is written off as a contractual adjustment.</span></li>
      <li class="flex gap-2">${I("dot", "size-4 shrink-0 text-gray-400")}<span>The claim moves to Adjudicated.</span></li></ul></div>
    ${bad ? "" : `<p class="flex items-start gap-2 border-t border-gray-200/80 px-4 py-3 text-[13px] leading-5 text-gray-600">${spark("mt-0.5 size-3.5")}<span><span class="font-medium text-gray-800">Why:</span> the EOB's codes, tooth and charges match the claim line for line, and none of it has been posted yet.</span></p>`}
    <div class="flex items-center justify-end gap-2 border-t border-gray-200/80 px-4 py-3">${foot}</div></div>`;
}
/* v4: before confirming, the amounts Asha read off the EOB are cells you can correct (the claim form's sheet), so the
 * Edit step is gone; once posting starts they're read-only. Totals and the sentence above follow your edits. */
let v4WaLines = null;
const v4WaReset = () => { v4WaLines = POST_LINES.map(([code, tooth, charge, allowed, paid, wo], i) => ({ id: `w${i}`, code, tooth, charge, allowed, paid, wo })); };
const v4WaSum = (k) => (v4WaLines || []).reduce((a, l) => a + (+l[k] || 0), 0);
const v4WaFoot = () => ["Total", "", money(v4WaSum("charge")), money(v4WaSum("allowed")), money(v4WaSum("paid")), money(v4WaSum("wo"))];
function v4WaTable(st) {
  const edit = st === "Waiting for you" || st === "Couldn't post" ? "text" : null, bad = st === "Couldn't post";
  return sheetTable({ preset: "form", box: false, gutter: 16, title: "Lines Asha will post", rows: v4WaLines, foot: v4WaFoot(),
    onCommit: (r, k, v, g) => {
      v4WaLines = g.data; g.o.foot = v4WaFoot(); const card = g.root.closest("[data-wa-card]");
      if (card) [["total", money(v4WaSum("paid"))], ["pt", money(v4WaSum("allowed") - v4WaSum("paid"))], ["wo", money(v4WaSum("wo"))]].forEach(([n, t]) => card.querySelectorAll(`[data-wa-${n}]`).forEach((s) => (s.textContent = t)));
      if (k === "paid" && r.paid > r.allowed) return `Insurance paid can't be more than the allowed ${money(r.allowed)}. Check the EOB line.`;
    },
    columns: [{ key: "code", label: "Code", w: 96, grow: true, render: (r) => (bad && r.id === "w1" ? `<span class="inline-flex items-center gap-1.5">${r.code}<span data-tip="Paid Sep 20 with check #883901, so posting it again would count it twice." tabindex="0" class="inline-flex rounded-sm">${I("circle-alert", "size-3.5 shrink-0 text-orange-500")}</span></span>` : r.code) },
      { key: "tooth", label: "Tooth", w: 64 }, { key: "charge", label: "Charge", w: 88, num: true, kind: "money", render: (r) => money(r.charge) },
      { key: "allowed", label: "Allowed", w: 88, num: true, kind: "money", edit, render: (r) => money(r.allowed) }, { key: "paid", label: "Ins. paid", w: 88, num: true, kind: "money", edit, render: (r) => money(r.paid) },
      { key: "wo", label: "Write-off", w: 104, num: true, kind: "money", edit, render: (r) => money(r.wo) }] });
}
function v4ConfirmCard(st) {
  if (!v4WaLines) v4WaReset();
  const bad = st === "Couldn't post", sum = v4WaSum, pt = sum("allowed") - sum("paid");
  const foot = st === "Posted" ? `<p class="grow text-[13px] text-gray-500">Posted 3 lines at 9:14 AM · Nina Flores confirmed</p>${button("View in ledger", { v: "white", s: "sm" })}${button("Undo", { v: "white", s: "sm", icon: "undo-2", attrs: 'data-wa="undo"' })}`
    : bad ? `<p class="grow text-[13px] text-gray-500">Nothing was changed. Fix line 2 above, then confirm.</p>${button("Cancel", { v: "quiet", s: "sm", attrs: 'data-wa="cancel"' })}${button("Confirm", { v: "solid", s: "sm", attrs: 'data-wa="confirm"' })}`
    : st === "Cancelled" ? `<p class="grow text-[13px] text-gray-500">Cancelled. Nothing was posted.</p>${button("Start again", { v: "white", s: "sm", attrs: 'data-wa="undo"' })}`
    : `<p class="grow text-[13px] text-gray-500"${st === "Posting" ? "" : chg4("The Edit button is gone: fix any amount in the table, then Confirm")}>You can reverse this from the ledger later.</p>${button("Cancel", { v: "quiet", s: "sm", attrs: `data-wa="cancel" ${st === "Posting" ? "disabled" : ""}` })}${button(st === "Posting" ? `${I("loader-circle", "animate-spin")}Posting…` : "Confirm", { v: "solid", s: "sm", attrs: `data-wa="confirm" ${st === "Posting" ? "disabled" : ""}` })}`;
  const tableNote = st === "Posting" || st === "Posted" ? "" : bad ? chg4("Line 2's problem is an orange mark on its code with the reason on hover, and the amounts stay cells you can fix without starting over")
    : chg4("The amounts Asha read off the EOB are cells on the claim form's sheet: click one and type to correct it before confirming; totals and the sentence above follow");
  return `<div class="${R.box}" role="group" aria-label="Post insurance payment">
    <div class="px-4 pt-4"><p class="text-base font-semibold text-gray-800">${bad ? "Asha can't post this yet" : `${st === "Posted" ? "Asha posted" : "Asha will post"} <span class="tabular-nums" data-wa-total>${money(sum("paid"))}</span> to 3 lines`}</p><p class="mt-0.5 text-[13px] text-gray-500">Liam Carter · MetLife Dental · Check #884120</p></div>
    <div class="mt-3 px-4 [&_tr>*:last-child]:!border-e-0"${tableNote}>${v4WaTable(st)}</div>
    <div class="px-4 py-3"><p class="mb-1.5 text-xs font-medium text-gray-500">${st === "Posted" ? "What changed" : "What else changes"}</p><ul class="space-y-1 text-[13px] text-gray-700">
      <li class="flex gap-2">${I("dot", "size-4 shrink-0 text-gray-400")}<span>Liam Carter's balance goes up by <span class="font-medium tabular-nums text-gray-800" data-wa-pt>${money(pt)}</span>, his share after insurance.</span></li>
      <li class="flex gap-2">${I("dot", "size-4 shrink-0 text-gray-400")}<span><span class="tabular-nums" data-wa-wo>${money(sum("wo"))}</span> is written off as a contractual adjustment.</span></li>
      <li class="flex gap-2">${I("dot", "size-4 shrink-0 text-gray-400")}<span>The claim moves to Adjudicated.</span></li></ul></div>
    ${bad ? "" : `<p class="flex items-start gap-2 border-t border-gray-200/80 px-4 py-3 text-[13px] leading-5 text-gray-600">${spark("mt-0.5 size-3.5")}<span><span class="font-medium text-gray-800">Why:</span> the EOB's codes, tooth and charges match the claim line for line, and none of it has been posted yet.</span></p>`}
    <div class="flex items-center justify-end gap-2 border-t border-gray-200/80 px-4 py-3">${foot}</div></div>`;
}
function confirmCard(st) {
  if (V4) return v4ConfirmCard(st);
  if (V2) return v2ConfirmCard(st);
  const sum = (i) => POST_LINES.reduce((a, l) => a + l[i], 0);
  const pt = sum(3) - sum(4);
  const status = { "Waiting for you": statusDot("Waiting for you", "off", "!text-[13px]"), Posting: `<span class="inline-flex items-center">${phrase("Posting 3 lines", "Posting 3 lines")}</span>`, Posted: statusDot("Posted", "on", "!text-[13px]"), "Couldn't post": `<span class="${R.status} !text-[13px] text-red-600">${I("circle-x", "size-3.5")}Couldn't post</span>`, Cancelled: statusDot("Cancelled", "quiet", "!text-[13px]") }[st];
  const foot = st === "Posted" ? `<p class="grow text-[13px] text-gray-500">Posted 3 lines at 9:14 AM · Nina Flores confirmed</p>${button("View in ledger", { v: "white", s: "sm" })}${button("Undo", { v: "white", s: "sm", icon: "undo-2", attrs: 'data-wa="undo"' })}`
    : st === "Couldn't post" ? `<p class="grow text-[13px] text-gray-500">Nothing was changed.</p>${button("Cancel", { v: "quiet", s: "sm", attrs: 'data-wa="cancel"' })}${button("Review line 2", { v: "solid", s: "sm" })}`
    : st === "Cancelled" ? `<p class="grow text-[13px] text-gray-500">Cancelled. Nothing was posted.</p>${button("Start again", { v: "white", s: "sm", attrs: 'data-wa="undo"' })}`
    : `<p class="grow text-[13px] text-gray-500">You can reverse this from the ledger later.</p>${button("Cancel", { v: "quiet", s: "sm", attrs: `data-wa="cancel" ${st === "Posting" ? "disabled" : ""}` })}${button("Edit", { v: "white", s: "sm", icon: "pencil", attrs: st === "Posting" ? "disabled" : "" })}${button(st === "Posting" ? `${I("loader-circle", "animate-spin")}Posting…` : "Confirm", { v: "solid", s: "sm", attrs: `data-wa="confirm" ${st === "Posting" ? "disabled" : ""}` })}`;
  return `<div class="${R.box}" role="group" aria-label="Post insurance payment">
    <div class="flex items-start gap-3 px-4 pt-4">
      <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">${I("receipt", "size-4")}</span>
      <div class="min-w-0 grow"><p class="text-xs font-medium text-gray-500">Post insurance payment</p><p class="mt-0.5 text-base font-semibold text-gray-800">${st === "Posted" ? "Asha posted" : "Asha will post"} <span class="tabular-nums">${money(sum(4))}</span> to 3 lines</p><p class="mt-0.5 text-[13px] text-gray-500">Liam Carter · MetLife Dental · Check #884120</p></div>
      <div class="shrink-0 pt-0.5">${status}</div></div>
    ${st === "Couldn't post" ? `<div class="px-4 pt-3">${note("Line 2 (D2950) was already paid on Sep 20 with check #883901, so posting it again would count it twice.", "error")}</div>` : ""}
    <div class="mt-3 border-y border-gray-200/80">${tbl([["Code"], ["Tooth"], ["Charge", 1], ["Allowed", 1], ["Ins. paid", 1], ["Write-off", 1]], POST_LINES.map((l, i) => [`<span class="${st === "Couldn't post" && i === 1 ? "text-red-600 font-medium" : ""}">${l[0]}</span>`, l[1], money(l[2]), money(l[3]), money(l[4]), money(l[5])]), ["Total", "", money(sum(2)), money(sum(3)), money(sum(4)), money(sum(5))], "4")}</div>
    <div class="px-4 py-3"><p class="mb-1.5 text-xs font-medium text-gray-500">${st === "Posted" ? "What changed" : "What else changes"}</p><ul class="space-y-1 text-[13px] text-gray-700">
      <li class="flex gap-2">${I("dot", "size-4 shrink-0 text-gray-400")}<span>Liam Carter's balance goes up by <span class="font-medium tabular-nums text-gray-800">${money(pt)}</span>, his share after insurance.</span></li>
      <li class="flex gap-2">${I("dot", "size-4 shrink-0 text-gray-400")}<span><span class="tabular-nums">${money(sum(5))}</span> is written off as a contractual adjustment.</span></li>
      <li class="flex gap-2">${I("dot", "size-4 shrink-0 text-gray-400")}<span>The claim moves to Adjudicated.</span></li></ul></div>
    ${st === "Couldn't post" ? "" : `<p class="flex items-start gap-2 border-t border-gray-200/80 px-4 py-3 text-[13px] leading-5 text-gray-600">${spark("mt-0.5 size-3.5")}<span><span class="font-medium text-gray-800">Why:</span> the EOB's codes, tooth and charges match the claim line for line, and none of it has been posted yet.</span></p>`}
    <div class="flex items-center justify-end gap-2 border-t border-gray-200/80 px-4 py-3">${foot}</div></div>`;
}
defineBlock({
  cat: "ai", id: "ai-write-confirm", title: "Confirm before Asha writes",
  note: "Before Asha changes anything it says exactly what it will do, to which lines, and why, then waits. Confirm, Edit or Cancel. After posting there's an Undo. Try Confirm.",
  where: "Copilot › a payment Asha prepared",
  states: ["Waiting for you", "Posting", "Posted", "Couldn't post"],
  canvas: "gray",
  html: (state) => (V4 && v4WaReset(), V2) ? `<div class="mx-auto max-w-[640px] space-y-4">
    ${userBubble("Post the MetLife EOB for Liam Carter")}
    <div class="min-w-0 space-y-3"${chg("No blue sparkle tile beside Asha's message, the same as in Copilot")}><p class="pt-1 text-sm leading-6 text-gray-800">I read the EOB MetLife sent on Sep 22. It matches the root canal claim, so here's what I'd post. Nothing changes until you confirm.</p>
      <div data-wa-card>${confirmCard(state)}</div></div></div>`
    : `<div class="mx-auto max-w-[640px] space-y-4">
    ${userBubble("Post the MetLife EOB for Liam Carter")}
    <div class="flex items-start gap-3">${ashaMark()}<div class="min-w-0 grow space-y-3"><p class="pt-1 text-sm leading-6 text-gray-800">I read the EOB MetLife sent on Sep 22. It matches the root canal claim, so here's what I'd post. Nothing changes until you confirm.</p>
      <div data-wa-card>${confirmCard(state)}</div></div></div></div>`,
  mount: (el, state) => {
    const host = el.querySelector("[data-wa-card]"); let timer;
    host.addEventListener("click", (e) => { const b = e.target.closest("[data-wa]"); if (!b) return; clearTimeout(timer);
      const go = (s) => { host.innerHTML = confirmCard(s); icons(); };
      if (b.dataset.wa === "confirm") { go("Posting"); timer = setTimeout(() => go("Posted"), 1100); }
      if (b.dataset.wa === "cancel") go("Cancelled");
      if (b.dataset.wa === "undo") go("Waiting for you"); });
  }
});

/* ============================================================ 4. AI Staff */
const AST = { on: ["Active", "on"], off: ["Not active", "off"], needs: ["Needs setup", "needs"], paused: ["Paused", "off"] };
const AGENTS = [
  { id: 1, name: "AI Receptionist", icon: "phone", does: "Answers calls and texts, books and confirms visits.", st: "on", done: 412, unit: "calls", hrs: 38 },
  { id: 2, name: "AI Insurance Verification", icon: "shield-check", does: "Checks benefits 3 days before each visit.", st: "on", done: 186, unit: "checks", hrs: 31 },
  { id: 3, name: "AI Insurance Caller", icon: "phone-outgoing", does: "Calls payers when the portal has no answer.", st: "on", done: 38, unit: "calls", hrs: 19 },
  { id: 4, name: "AI Hygiene Recall", icon: "calendar-heart", does: "Texts and calls patients due for a cleaning.", st: "on", done: 540, unit: "messages", hrs: 22 },
  { id: 5, name: "AI Patient Intake", icon: "clipboard-list", does: "Sends new patients their forms, then follows up.", st: "on", done: 64, unit: "forms", hrs: 9 },
  { id: 6, name: "AI Patient Billing", icon: "wallet", does: "Sends statements and payment links.", st: "needs", done: 0, unit: "", hrs: 0, why: "Connect card payments first" },
  { id: 7, name: "AI Case Acceptance", icon: "clipboard-check", does: "Follows up on treatment that isn't scheduled.", st: "off", done: 0, unit: "", hrs: 0 },
  { id: 8, name: "AI Collections", icon: "hand-coins", does: "Reminds patients about balances over 30 days.", st: "off", done: 0, unit: "", hrs: 0 },
  { id: 9, name: "AI Schedule Optimizer", icon: "calendar-range", does: "Fills cancellations from the ASAP list.", st: "paused", done: 17, unit: "openings filled", hrs: 4 }
];
const agentMark = (a) => `<span class="flex size-5 shrink-0 items-center justify-center rounded-md ${a.st === "on" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-500"}">${I(a.icon, "size-3")}</span>`;
const agentCols = () => [
  { key: "name", label: "Agent", icon: "bot", w: 236, open: true, kind: "text", lead: agentMark, render: (a) => esc(a.name) },
  { key: "st", label: "Status", icon: "circle-dot", w: 140, kind: "text", value: (a) => AST[a.st][0], render: (a) => statusDot(...AST[a.st]) },
  { key: "act", label: "Action", icon: "mouse-pointer-click", w: 180, kind: "text", value: (a) => a.st, render: (a) => (a.st === "on" ? button("Settings", { v: "quiet", s: "xs", icon: "settings-2", cls: "-ms-2" }) : a.st === "needs" ? `<span class="inline-flex items-center gap-2">${button("Finish setting up", { v: "white", s: "xs" })}</span>` : a.st === "paused" ? button("Turn back on", { v: "white", s: "xs", icon: "play" }) : button("Activate agent", { v: "white", s: "xs" })) },
  { key: "does", label: "What it does", icon: "text", w: 364, kind: "text", render: (a) => `<span class="text-gray-600">${esc(a.does)}</span>` },
  { key: "done", label: "Past 30 days", icon: "activity", w: 150, num: true, kind: "num", render: (a) => (a.done ? `${a.done.toLocaleString()} <span class="text-gray-500">${a.unit}</span>` : `<span class="text-gray-400">—</span>`) },
  { key: "hrs", label: "Staff time saved", icon: "clock", w: 150, num: true, kind: "num", render: (a) => (a.hrs ? `${a.hrs} <span class="text-gray-500">hrs</span>` : `<span class="text-gray-400">—</span>`) },
];
/* v2: grey tiles; columns ordered by what an owner reads (what it does, how much it handled, the time it saved); the
 * Status cell is blank for Active and otherwise holds the one action that agent needs */
const V2_ACTION = { off: ["Activate agent", ""], needs: ["Finish setting up", ""], paused: ["Turn back on", "play"] };
const v2AgentMark = (a) => `<span class="flex size-5 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-500">${I(a.icon, "size-3")}</span>`;
const v2AgentCols = () => [
  { key: "name", label: "Agent", icon: "bot", w: 240, open: true, kind: "text", lead: v2AgentMark, render: (a) => esc(a.name) },
  { key: "does", label: "What it does", icon: "text", w: 360, kind: "text", render: (a) => `<span class="text-gray-600">${esc(a.does)}</span>` },
  { key: "done", label: "Past 30 days", icon: "activity", w: 140, num: true, kind: "num", render: (a) => (a.done ? `${a.done.toLocaleString()} <span class="text-gray-500">${a.unit}</span>` : `<span class="text-gray-400">—</span>`) },
  { key: "hrs", label: "Staff time saved", icon: "clock", w: 140, num: true, kind: "num", render: (a) => (a.hrs ? `${a.hrs} <span class="text-gray-500">hrs</span>` : `<span class="text-gray-400">—</span>`) },
  { key: "st", label: V4 ? `<span${chg4("An active agent's Status cell says Active with its dot instead of being blank; the others keep the one button they need")}>Status</span>` : "Status", icon: "circle-dot", w: 180, kind: "text", normal: ["Active"], value: (a) => AST[a.st][0],
    render: (a) => { if (!V2_ACTION[a.st]) return statusDot(...AST[a.st]); const [l, ic] = V2_ACTION[a.st]; return button(l, { v: "white", s: "xs", icon: ic || undefined, attrs: `aria-label="${esc(AST[a.st][0])}: ${esc(l)}"` }); } }
];
/* A loading grid that is the real grid: same toolbar (disabled), same header, grey bars in the cells */
class V2AiBusyGrid extends Grid { render() { super.render(); this.root.setAttribute("aria-busy", "true"); this.root.querySelectorAll("input,button").forEach((b) => (b.disabled = true)); } }
function v2AiSkeletonGrid(host, cols, n, o = {}) {
  const W = [70, 45, 60, 35, 55, 40];
  const columns = cols.map((c, ci) => Object.assign({}, c, { open: false, normal: null, value: () => "", label: String(c.label).replace(/<[^>]+>/g, ""), lead: c.lead ? () => `<span class="size-5 shrink-0 rounded-md ${R.skel}"></span>` : null,
    render: (r) => `<span class="block h-3 ${R.skel} ${c.num ? "ms-auto" : ""}" style="width:${W[(r.id + ci) % 6]}%"></span>` }));
  return new V2AiBusyGrid(host, Object.assign({ columns, rows: Array.from({ length: n }, (_, i) => ({ id: i })), viewButton: false, footer: false, maxHeight: 2000 }, o));
}
const AGENT_SINCE = { on: "On since Aug 3", paused: "Paused Sep 22 by Priya Shah", off: "Never turned on", needs: "Setup started Sep 20" };
/* v4: the agent's status is the first line of a small table of its settings you type into (no status row of its own) */
const V4_AGENT_ST = { on: "Active", paused: "Paused", off: "Not active", needs: "Needs setup" };
const v4AgentFacts = (a) => `<section class="${R.psec}"${chg4("Status is the first line of the agent's facts, a list you pick from (Active, Paused, Not active), instead of a row of its own; who it hands work to is one more line you can change")}>${fieldTable([
  { label: "Status", value: V4_AGENT_ST[a.st], type: "select", options: ["Active", "Paused", "Not active"], html: (r) => { const k = Object.keys(V4_AGENT_ST).find((x) => V4_AGENT_ST[x] === r.value) || "off";
    return `<span class="inline-flex items-center gap-2 min-w-0"><span class="${cx(R.dot, TONE_DOT[AST[k][1]])}"></span>${esc(r.value)}${k === a.st ? `<span class="truncate text-gray-500">· ${AGENT_SINCE[a.st]}</span>` : ""}</span>`; } },
  { label: "Hands work to", value: a.id === 6 ? "Nina Flores" : "Front desk", type: "select", options: ["Front desk", "Nina Flores", "Priya Shah", "Marcus Lee"] }], { title: `${a.name} settings` })}</section>`;
function openAgent(a) {
  const own = { 1: [["Book, move and confirm visits", true], ["Answer questions about hours, directions and insurance accepted", true], ["Cancel a visit", false], ["Promise a price", false]], 2: [["Check benefits on payer portals", true], ["Update the insurance on a chart", false]] }[a.id] || [["Send texts and emails from your office number", true], ["Change a patient's balance", false]];
  Sheet.open({
    flush: true, title: esc(a.name), lead: `<span class="flex size-9 shrink-0 items-center justify-center rounded-lg ${a.st === "on" && !V2 ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-500"}">${I(a.icon, "size-4")}</span>`,
    subtitle: esc(a.does), tabs: ["Overview", "Rules", "Activity"],
    body: `${V4 ? v4AgentFacts(a) : `<section class="${R.psec} flex items-center justify-between gap-3 !py-3">${statusButton(...AST[a.st])}<span class="text-[13px] text-gray-500">${AGENT_SINCE[a.st]}</span></section>`}
      ${a.st === "needs" ? psec("", infoRow("circle-alert", "Card payments must be connected first. It takes about 10 minutes.", { tone: "needs", right: button("Connect", { v: "white", s: "xs" }) }), { cls: "!py-2.5" }) : ""}
      ${psec("What it may do", `<ul class="space-y-2">${own.map(([t, ok]) => `<li class="flex items-start gap-2 text-sm text-gray-800">${ok ? I("check", "size-4 mt-0.5 shrink-0 text-blue-600") : I("hand", "size-4 mt-0.5 shrink-0 text-gray-400")}<span>${t}${ok ? "" : ' <span class="text-gray-500">· asks you first</span>'}</span></li>`).join("")}</ul>`, { actions: button("Edit rules", { v: "white", s: "xs", icon: "pencil" }) })}
      ${psec("Past 30 days", metaGrid([["Handled", a.done ? `${a.done} ${a.unit}` : "—"], ["Staff time saved", a.hrs ? `${a.hrs} hours` : "—"], ["Handed to your team", a.done ? `${Math.round(a.done * 0.06)} times` : "—"]]))}`,
    footer: a.st === "on" ? `${button("Open settings", { v: "solid", s: "sm" })}` : a.st === "needs" ? button("Finish setting up", { v: "solid", s: "sm" }) : a.st === "paused" ? button("Turn back on", { v: "solid", s: "sm", icon: "play" }) : button("Activate agent", { v: "solid", s: "sm" })
  });
}
defineBlock({
  cat: "ai", id: "ai-staff", title: "AI Staff",
  note: "Every AI helper the office can hire: what it does in one line, whether it's on, how much it handled, and the one action it needs. Click an agent to see what it may do on its own and what it asks you first.",
  where: "Main › AI Staff",
  states: ["Normal", "Loading"],
  canvas: "bare",
  html: (state) => V2 ? `<div${chg("The header is just \"AI Staff\", like other main screens, without the practice name in front")}>${workspaceHeader({ title: "AI Staff", actions: `${button("Pause all AI", { v: "quiet", s: "sm", icon: "pause" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}</div>
    <div data-staff-tabs>${tabsWithSlot([["All agents", AGENTS.length], ["Active", AGENTS.filter((a) => a.st === "on").length], ["Not active", AGENTS.filter((a) => a.st !== "on").length]], 0, dateRangeButton("Past 30 days"))}</div>
    <div class="px-4 pb-4"><div data-grid="${state === "Loading" ? "agents-loading" : "agents"}"${chg(state === "Loading" ? "Loading draws the real toolbar and the same columns in the same order as the loaded list, so nothing moves when it arrives" : "Status and its action are one cell: blank when the agent is active, otherwise the one button it needs. Settings buttons are gone (the row opens the agent), tiles are grey, and Staff time saved is on screen")}></div></div>`
    : `${workspaceHeader({ parent: "Bayview Family Dental", title: "AI Staff", actions: `${button("Pause all AI", { v: "quiet", s: "sm", icon: "pause" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
    <div data-staff-tabs>${tabsWithSlot([["All agents", AGENTS.length], ["Active", AGENTS.filter((a) => a.st === "on").length], ["Not active", AGENTS.filter((a) => a.st !== "on").length]], 0, dateRangeButton("Past 30 days"))}</div>
    <div class="px-4 pb-4">${state === "Loading" ? `<div class="py-2.5 flex gap-2">${skel("w-32", "h-8")}${skel("w-48", "h-8")}</div>${gridSkeleton(["Agent", "What it does", "Status", "Past 30 days", "Action"], 8)}` : '<div data-grid="agents"></div>'}</div>`,
  mount: (el) => {
    const busy = el.querySelector('[data-grid="agents-loading"]');
    if (busy) return v2AiSkeletonGrid(busy, v2AgentCols(), 8, { title: "All agents", searchPlaceholder: "Search agents", selectable: false, addColumn: false, primary: { label: "Hire more", icon: "user-plus" }, filters: [{ key: "st", label: "Status", options: [] }] });
    const host = el.querySelector('[data-grid="agents"]'); if (!host) return;
    const sets = [() => true, (a) => a.st === "on", (a) => a.st !== "on"];
    const g = new Grid(host, { columns: V2 ? v2AgentCols() : agentCols(), viewButton: false, noun: V2 ? "agents" : "count", rows: AGENTS, title: "All agents", searchPlaceholder: "Search agents", maxHeight: 440, selectable: false, addColumn: false,
      calc: { done: null, hrs: "sum" }, primary: { label: "Hire more", icon: "user-plus" },
      filters: [{ key: "st", label: "Status", options: Object.entries(AST).map(([value, [label, tone]]) => ({ value, label, tone })) }],
      onOpen: openAgent });
    wireTabs(el.querySelector("[data-staff-tabs]"), (i) => { g.setRows(AGENTS.filter(sets[i])); g.o.title = ["All agents", "Active", "Not active"][i]; g.render(); });
  }
});

/* ============================================================ 5. What Asha did */
const KIND = { claim: ["file-text", "Claims"], eob: ["receipt", "EOBs"], call: ["phone", "Calls"], msg: ["message-square", "Messages"] };
const ACTS = [
  { id: 1, day: "Today", t: "9:14 AM", k: "eob", title: "Posted MetLife's <b>$1,310.50</b> payment to Liam Carter's 3 claim lines", why: "The EOB matched the claim line for line.", link: "View EOB", undo: true },
  { id: 2, day: "Today", t: "8:59 AM", k: "claim", title: "Sent Lucas Foster's crown claim to MetLife, <b>$1,545.00</b>", why: "Every check passed, and the x-ray and narrative were attached.", link: "View claim", cant: "MetLife already has it" },
  { id: 3, day: "Today", t: "8:42 AM", k: "call", title: "Answered Olivia Nguyen's call and confirmed her 11:00 AM visit", why: "She called to ask if the visit was still on.", link: "View call" },
  { id: 4, day: "Today", t: "8:15 AM", k: "call", title: "Booked Isabella Kim, a new patient, for a comprehensive exam at 9:30 AM", why: "She asked for the first opening this week. Self-pay, quoted $240.00.", link: "View appointment" },
  { id: 5, day: "Today", t: "8:05 AM", k: "claim", title: "Drafted an appeal for James Ortiz's denied extraction", why: "Appeals need the dentist's signature, so it's waiting for you.", link: "Review appeal", needs: true },
  { id: 6, day: "Today", t: "7:59 AM", k: "msg", title: "Texted James Ortiz after a missed call", why: "No one answered and he left no voicemail.", link: "View conversation" },
  { id: 7, day: "Yesterday", t: "6:02 PM", k: "eob", title: "Wrote off <b>$42.00</b> on Ava Thompson's cleaning as a contractual adjustment", why: "Delta's allowed amount is below your fee, and your rules write these off.", link: "View ledger entry", undo: true },
  { id: 8, day: "Yesterday", t: "4:48 PM", k: "call", title: "Called MetLife about Lucas Foster's claim", why: "Nothing new on the portal after 14 days. The rep said the EOB mails Sep 30 (ref #ML-55120).", link: "View call" },
  { id: 9, day: "Yesterday", t: "10:00 AM", k: "msg", title: "Sent 36 appointment reminders", why: "These visits are 2 days away, as set in Reminders.", link: "View list" },
  { id: 10, day: "Yesterday", t: "7:30 AM", k: "eob", title: "Matched an Aetna EOB to Olivia Nguyen's deep cleaning claim", why: "Same patient, date of service and codes. $0.00 paid: frequency limit.", link: "View EOB", undo: true }
];
/* A row opens what it's about (the whole row, with a chevron); Undo or Review sit on top of it */
function actRow(a, undone) {
  const right = a.needs ? `<div class="flex items-center gap-3">${statusDot("Needs you", "needs", "!text-[13px]")}${button("Review", { v: "white", s: "xs" })}</div>`
    : undone ? `<span class="inline-flex items-center gap-1.5 text-[13px] text-gray-500">${I("undo-2", "size-3.5")}Undone by you · just now</span>`
    : a.undo ? button("Undo", { v: "white", s: "xs", icon: "undo-2", attrs: `data-undo="${a.id}"` })
    : a.cant ? `<span class="text-[13px] text-gray-400">Can't undo: ${a.cant}</span>` : "";
  return `<li class="group relative -mx-3 grid grid-cols-[72px_28px_minmax(0,1fr)_auto_16px] items-start gap-x-3 rounded-lg px-3 py-3 hover:bg-gray-50">
    <a href="#" class="absolute inset-0 rounded-lg focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-blue-600/20" aria-label="${esc(a.link)}: ${esc(a.title.replace(/<[^>]+>/g, ""))}"></a>
    <span class="pt-0.5 text-[13px] tabular-nums text-gray-500">${a.t}</span>
    <span class="relative z-10 flex size-7 items-center justify-center rounded-full border border-gray-200/80 bg-white text-gray-500 pointer-events-none">${I(KIND[a.k][0], "size-3.5")}</span>
    <div class="min-w-0 pt-0.5 pointer-events-none ${undone ? "opacity-60" : ""}"><p class="text-sm text-gray-800 [&_b]:font-semibold [&_b]:tabular-nums">${a.title}</p>
      <p class="mt-0.5 text-[13px] leading-5 text-gray-500"><span class="text-gray-600">Why:</span> ${esc(a.why)}</p></div>
    <div class="relative z-10 pt-0.5">${right}</div>
    <span class="pt-1.5 pointer-events-none">${I("chevron-right", "size-4 text-gray-300 group-hover:text-gray-500")}</span></li>`;
}
/* v2: quieter rows: Undo is a borderless button, rows that can't be undone show nothing (the reason is on hover), no "Why:" */
function v2ActRow(a, undone, first) {
  const right = a.needs ? `<div class="flex items-center gap-3">${statusDot("Needs you", "needs", "!text-[13px]")}${button("Review", { v: "white", s: "xs" })}</div>`
    : undone ? `<span class="inline-flex items-center gap-1.5 text-[13px] text-gray-500">${I("undo-2", "size-3.5")}Undone by you · just now</span>`
    : a.undo ? `<span class="inline-flex"${first.undo ? "" : ((first.undo = true), chg("Undo is a quiet borderless button, and rows that can't be undone show nothing; the reason is in the row's hover tip"))}>${button("Undo", { v: "ghost", s: "xs", icon: "undo-2", attrs: `data-undo="${a.id}"` })}</span>` : "";
  return `<li class="group relative -mx-3 grid grid-cols-[72px_28px_minmax(0,1fr)_auto_16px] items-start gap-x-3 rounded-lg px-3 py-2.5 hover:bg-gray-50" ${a.cant ? `title="Can't undo: ${esc(a.cant)}"` : ""}>
    <a href="#" class="absolute inset-0 rounded-lg focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-blue-600/20" aria-label="${esc(a.link)}: ${esc(a.title.replace(/<[^>]+>/g, ""))}${a.cant ? `. Can't undo: ${esc(a.cant)}` : ""}"></a>
    <span class="pt-0.5 text-[13px] tabular-nums text-gray-500">${a.t}</span>
    <span class="relative z-10 flex size-7 items-center justify-center rounded-full border border-gray-200/80 bg-white text-gray-500 pointer-events-none">${I(KIND[a.k][0], "size-3.5")}</span>
    <div class="min-w-0 pt-0.5 pointer-events-none ${undone ? "opacity-60" : ""}"><p class="text-sm text-gray-800 [&_b]:font-semibold [&_b]:tabular-nums">${a.title}</p>
      <p class="mt-0.5 text-[13px] leading-5 text-gray-500"${first.why ? "" : ((first.why = true), chg("No \"Why:\" label ten times over: the grey line under each event is the reason"))}>${esc(a.why)}</p></div>
    <div class="relative z-10 pt-0.5">${right}</div>
    <span class="pt-1.5 pointer-events-none">${I("chevron-right", "size-4 text-gray-300 group-hover:text-gray-500")}</span></li>`;
}
/* v4: the log as a table; the reason, the link and why it can't be undone are in the row's card. The last column always
 * says something: Undo, Undone, Review, or a grey word for why there's nothing to undo. */
const v4ActUndo = (a, undone) => a.needs ? `<span class="inline-flex items-center gap-2"><span class="inline-flex items-center gap-1 text-gray-600">${I("circle-alert", "size-3.5 shrink-0 text-orange-500")}Needs you</span>${button("Review", { v: "white", s: "xs" })}</span>`
  : undone ? `<span class="inline-flex items-center gap-1.5 text-gray-500">${I("undo-2", "size-3.5")}Undone just now</span>`
  : a.undo ? button("Undo", { v: "ghost", s: "xs", icon: "undo-2", cls: "-ms-2", attrs: `data-undo="${a.id}"` })
  : `<span class="text-gray-500">${a.cant ? "Can't undo" : "Nothing to undo"}</span>`;
const v4ActTable = (rows, undone) => sheetTable({ preset: "page", sheet: false, toolbar: false, selectable: false, footer: false, addColumn: false, sortable: false, gutter: 16, maxHeight: 4000, title: "What Asha did",
  rows: rows.map((a) => ({ ...a, id: a.id, gone: undone.has(a.id) })), onOpen: () => {},
  peek: (a) => peekCard(a.title.replace(/<[^>]+>/g, ""), [["Why", esc(a.why)], ["When", `${a.day}, ${a.t}`], ["Opens", a.link]], a.cant ? `Can't undo: ${esc(a.cant)}.` : a.undo ? "Undo puts it back the way it was." : ""),
  columns: [{ key: "t", label: "When", w: 176, render: (a) => `<span class="tabular-nums text-gray-600">${a.day}, ${a.t}</span>` },
    { key: "title", label: "What Asha did", w: 520, grow: true, open: true, lead: (a) => `<span class="flex size-5 shrink-0 items-center justify-center rounded-md bg-gray-100 text-gray-500">${I(KIND[a.k][0], "size-3")}</span>`,
      render: (a) => `<span class="${a.gone ? "opacity-60" : ""} [&_b]:font-semibold [&_b]:tabular-nums">${a.title}</span>` },
    { key: "undo", label: "Undo", w: 200, render: (a) => v4ActUndo(a, a.gone) }] });
function actList(state, tab = 0, undone = new Set()) {
  if (state === "Loading") return `<div class="space-y-5 py-4">${Array.from({ length: 6 }, () => `<div class="grid grid-cols-[72px_28px_1fr] gap-x-3">${skel("w-14", "h-3")}<span class="size-7 ${R.skel} !rounded-full"></span><span class="space-y-2">${skel("w-3/4")}${skel("w-1/2", "h-3")}</span></div>`).join("")}</div>`;
  const keys = [null, "claim", "eob", "call", "msg"];
  const rows = state === "Empty" ? [] : ACTS.filter((a) => !keys[tab] || a.k === keys[tab]);
  if (!rows.length) return emptyState({ icon: "sparkles", title: "Nothing in the last 2 days", body: "When Asha sends a claim, posts a payment or answers a call, it shows here with the reason. Turn on an agent to get started.", action: button("Open AI Staff", { v: "white", s: "sm" }) });
  if (V4) return `<div${chg4("The log is one table, a line per thing Asha did: when, what it did and whether you can undo it. Why it did it, what the line opens and why something can't be undone show in a card when you point at the row, instead of a grey sentence under every line.")}>${v4ActTable(rows, undone)}</div>`;
  const days = [...new Set(rows.map((a) => a.day))], first = {};
  return days.map((d) => `<section class="pt-4"><h3 class="mb-1 text-xs font-medium text-gray-500">${d}</h3>
    <ol class="relative before:absolute before:inset-y-3 before:start-[98px] before:w-px before:bg-gray-200/80">${rows.filter((a) => a.day === d).map((a) => (V2 ? v2ActRow(a, undone.has(a.id), first) : actRow(a, undone.has(a.id)))).join("")}</ol></section>`).join("");
}
defineBlock({
  cat: "ai", id: "ai-activity", title: "What Asha did",
  note: "A plain log of everything Asha did across claims, EOBs, calls and texts, each with the reason. Undo is offered where it's safe; where it isn't, the line says why. The tabs filter and Undo works.",
  where: "AI Staff › Activity",
  states: ["Normal", "Empty", "Loading"],
  canvas: "bare",
  html: (state) => {
    const n = (k) => (state === "Normal" ? ACTS.filter((a) => !k || a.k === k).length : null);
    return `${workspaceHeader({ parent: "AI Staff", title: "What Asha did", actions: `${button("Export", { v: "quiet", s: "sm", icon: "download" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
    <div data-act-tabs>${tabsWithSlot([["All", n(null)], ["Claims", n("claim")], ["EOBs", n("eob")], ["Calls", n("call")], ["Messages", n("msg")]].map(([l, c]) => (c == null ? l : [l, c])), 0, `${state === "Normal" ? `<span class="me-2">${flag("1 needs you", "!text-[13px]")}</span>` : ""}${dateRangeButton("Last 2 days")}`)}</div>
    ${V2 ? `<div class="px-4 pb-6" data-act-list${state === "Normal" ? chg("The feed runs the full width of the page, so Undo and the chevrons line up under the date button instead of floating mid-page") : ""}>${actList(state)}</div>` : `<div class="${state === "Normal" ? "max-w-[920px]" : ""} px-6 pb-6" data-act-list>${actList(state)}</div>`}`;
  },
  mount: (el, state) => {
    if (state !== "Normal") return;
    const list = el.querySelector("[data-act-list]"); let tab = 0; const undone = new Set();
    const draw = () => { list.innerHTML = actList(state, tab, undone); icons(); };
    wireTabs(el.querySelector("[data-act-tabs]"), (i) => { tab = i; draw(); });
    list.addEventListener("click", (e) => { const b = e.target.closest("[data-undo]"); if (b) { undone.add(+b.dataset.undo); draw(); } });
  }
});

/* ============================================================ 6. Scribe */
const TX = [["Dr. Patel", "12:02", "Okay Ava, the cleaning looks great. Sofia said you've been flossing more?"], ["Ava", "12:08", "Trying to! Every other day at least."], ["Dr. Patel", "12:31", "Good. On the bitewings I can see a small cavity on the chewing surface of number 30, lower right."], ["Ava", "12:40", "Is that the one that's been a little sensitive to cold?"], ["Dr. Patel", "12:46", "Probably, yes. It's small, so a tooth-colored filling will do. We can do it in about thirty minutes next visit."], ["Ava", "12:52", "Okay. Can we do it before my insurance resets in January?"], ["Dr. Patel", "12:58", "Absolutely. Gums look healthy, no pockets over three. Let's see you back in six months for your cleaning, and"]];
const CODES = [["D0120", "Periodic exam", "", 65, "Heard: the exam today", true], ["D0274", "Bitewings, four films", "", 78, "Heard: “on the bitewings”", true], ["D1110", "Adult cleaning", "", 110, "From today's appointment", true], ["D2391", "Composite, one surface", "#30 O", 185, "Heard: “small cavity on the chewing surface of number 30”", false]];
/* v2: a boxed compact table; what Asha heard sits behind a small quote icon; the code planned for next visit says where it goes */
function v2ScribeCodes(accepted) {
  const th = (h, cls = "") => `<th class="h-9 px-3 border-b border-gray-200/80 text-start text-[13px] font-medium text-gray-500 whitespace-nowrap ${cls}">${h}</th>`;
  const td = (c, cls = "") => `<td class="h-9 px-3 border-b border-gray-200/80 text-[13px] text-gray-800 whitespace-nowrap ${cls}">${c}</td>`;
  return `<div class="${R.tableBox}"${chg("The codes are a boxed compact table with 36px rows; what Asha heard opens from the small quote icon, and the next-visit code says it goes on the treatment plan")}><table data-kept="1" class="w-full table-fixed border-separate border-spacing-0"><colgroup><col class="w-[76px]"><col><col class="w-[72px]"><col class="w-[88px]"><col class="w-[104px]"></colgroup>
    <thead><tr>${th("Code")}${th("Description")}${th("Tooth")}${th("Fee", "!text-end")}${th('<span class="sr-only">Accept</span>')}</tr></thead>
    <tbody>${CODES.map(([code, name, tooth, fee, why, onAppt], i) => { const on = accepted.has(i);
      return `<tr>${td(`<span class="font-medium tabular-nums">${code}</span>`)}${td(`<span class="flex min-w-0 items-center gap-1.5"><span class="truncate">${name}${onAppt ? "" : ' <span class="text-gray-500">· next visit</span>'}</span><button type="button" class="shrink-0 rounded text-gray-400 hover:text-gray-700 cursor-help" data-tip="${esc(why)}" aria-label="${esc(why)}">${I("quote", "size-3.5")}</button></span>`)}${td(tooth ? `<span class="tabular-nums">${tooth}</span>` : '<span class="text-gray-400">—</span>')}${td(money(fee), "text-end tabular-nums")}${td(on ? `<button type="button" data-code="${i}" class="${cx(R.btn, R.xs, R.ghost, "text-blue-600 w-[84px]")}" aria-pressed="true">${I("check")}Added</button>` : `<button type="button" data-code="${i}" class="${cx(R.btn, R.xs, R.white, "w-[84px]")}" aria-pressed="false">${I("plus")}Accept</button>`, "!py-0 text-end")}</tr>`; }).join("")}</tbody></table></div>`;
}
/* v4: the codes are the data grid with spreadsheet editing: the dentist fixes a code or a tooth number by clicking and
 * typing (a code is a list that searches as you type) before accepting; the fee follows the code */
const V4_SCRIBE_CODES = () => DATA.procedures.map((p) => ({ value: p.code, label: `${p.code} · ${p.name}` }));
function v4ScribeCodes(accepted) {
  const rows = CODES.map(([code, name, tooth, fee, why, onAppt], i) => ({ id: `sc${i}`, code, name, tooth, fee, why, onAppt, on: accepted.has(i) }));
  return `<div${chg4("The codes are cells you can fix: click a code to pick another (the fee follows) or type a tooth number, then accept; nothing goes on the chart until it's signed")}>${sheetTable({ title: "Codes Asha heard", rows,
    onCommit: (r, k, v) => { if (k === "code") { const p = DATA.proc(v); if (p) Object.assign(r, { name: p.name, fee: p.fee, why: "Changed by you" }); } },
    columns: [{ key: "code", label: "Code", w: 84, edit: "select", options: V4_SCRIBE_CODES, render: (r) => `<span class="font-medium tabular-nums">${esc(r.code)}</span>` },
      { key: "name", label: "Description", w: 180, grow: true, render: (r) => `<span class="flex min-w-0 items-center gap-1.5"><span class="truncate">${esc(r.name)}${r.onAppt ? "" : ' <span class="text-gray-500">· next visit</span>'}</span><span class="shrink-0 rounded text-gray-400 cursor-help" data-tip="${esc(r.why)}" tabindex="0" aria-label="${esc(r.why)}">${I("quote", "size-3.5")}</span></span>` },
      { key: "tooth", label: `<span${chg4("A code with no tooth (an exam, a cleaning) shows a grey dash instead of a blank cell; click it to add one")}>Tooth</span>`, w: 72, edit: "text", placeholder: () => "—", render: (r) => `<span class="tabular-nums">${esc(r.tooth)}</span>` },
      { key: "fee", label: "Fee", w: 84, num: true, kind: "money", render: (r) => money(r.fee) },
      { key: "on", label: '<span class="sr-only">Accept</span>', w: 104, render: (r) => (r.on ? `<button type="button" data-act="scribe-code" data-code="${r.id}" class="${cx(R.btn, R.xs, R.ghost, "text-blue-600 w-[84px]")}" aria-pressed="true">${I("check")}Added</button>`
        : `<button type="button" data-act="scribe-code" data-code="${r.id}" class="${cx(R.btn, R.xs, R.white, "w-[84px]")}" aria-pressed="false">${I("plus")}Accept</button>`) }] })}</div>`;
}
function scribeCodes(accepted) {
  if (V4) return v4ScribeCodes(accepted);
  if (V2) return v2ScribeCodes(accepted);
  return `<ul class="border-t border-gray-200/80">${CODES.map(([code, name, th, fee, why, onAppt], i) => {
    const on = accepted.has(i);
    return `<li class="flex items-start gap-3 border-b border-gray-200/80 py-2.5 ps-5 pe-5 last:border-b-0">
      <div class="min-w-0 grow"><p class="text-sm text-gray-800"><span class="font-medium tabular-nums">${code}</span> · ${name}${th ? ` <span class="text-gray-500 tabular-nums">· ${th}</span>` : ""}</p><p class="mt-0.5 text-xs text-gray-500">${esc(why)}${!onAppt ? " · planned for next visit" : ""}</p></div>
      <span class="pt-0.5 text-sm tabular-nums text-gray-800">${money(fee)}</span>
      ${on ? `<button type="button" data-code="${i}" class="${cx(R.btn, R.xs, R.ghost, "text-blue-600 w-[84px]")}" aria-pressed="true">${I("check")}Added</button>` : `<button type="button" data-code="${i}" class="${cx(R.btn, R.xs, R.white, "w-[84px]")}" aria-pressed="false">${I("plus")}Accept</button>`}</li>`; }).join("")}</ul>`;
}
const SCRIBE_PHRASES = ["Drafting the plan", "Matching codes to what was said", "Listening for the next step"];
function scribeNote(state) {
  const live = state === "Listening";
  let titled = false;
  const block = (t, body, cls = "") => V2 ? `<section class="border-t border-gray-200/80 px-5 py-3.5 first:border-t-0 ${cls}"><h4 class="mb-1 ${R.groupTitle}"${titled ? "" : ((titled = true), chg("Note section titles are 14px like \"Codes Asha heard\" in the same pane, not small grey labels"))}>${t}</h4>${body}</section>`
    : `<section class="border-t border-gray-200/80 px-5 py-3.5 first:border-t-0 ${cls}"><h4 class="mb-1 text-xs font-medium text-gray-500">${t}</h4>${body}</section>`;
  return `${block("Chief complaint", `<p class="text-sm leading-6 text-gray-800">Routine recall. Some sensitivity to cold, lower right.</p>`)}
    ${block("Findings", `<p class="text-sm leading-6 text-gray-800">Bitewings taken. Small occlusal caries on #30. Gingiva healthy, probing depths 3 mm or less, no bleeding noted. Home care improved; flossing about every other day.</p>`)}
    ${block("Assessment & plan", live ? `<p class="text-sm leading-6 text-gray-800">Composite, occlusal, #30 next visit (about 30 min), before benefits reset in January.</p>
        <div class="asha-wash -mx-2 mt-2 flex h-8 items-center gap-2.5 rounded-md px-2">${liveIcon()}<span class="min-w-0" data-scribe-phrase>${phrase(SCRIBE_PHRASES[0], "Scribe is drafting")}</span></div>
        <div class="mt-2 space-y-2"><span class="asha-sweep block w-11/12 h-3 rounded-md bg-gray-100"></span><span class="asha-sweep block w-2/3 h-3 rounded-md bg-gray-100"></span></div>`
      : `<p class="text-sm leading-6 text-gray-800">Composite, occlusal, #30 next visit (about 30 min), before benefits reset in January. Recall in 6 months for periodic exam and prophy.</p>`)}`;
}
defineBlock({
  cat: "ai", id: "ai-scribe", title: "Scribe",
  note: "Scribe listens to the visit and drafts the note as people talk, with the codes it heard and why. Nothing goes on the chart until the dentist accepts the codes and signs. Try Accept on a code.",
  where: "PMS › Scribe › a visit",
  states: ["Listening", "Draft ready"],
  canvas: "bare",
  html: (state) => {
    const live = state === "Listening", p = P("p1");
    const accepted = new Set(live ? [0, 2] : [0, 1, 2]);
    if (V2) return `${workspaceHeader({ parent: "Scribe", title: `${esc(p.name)} · Periodic exam`, actions: live
      ? `<span class="me-1 inline-flex items-center gap-2 text-[13px] text-gray-600"${chg("The header shows how long you've been recording (\"12m 58s\"), so it can't be read as a clock time")}><span class="relative flex size-2"><span class="asha-ping absolute inline-flex size-full rounded-full bg-blue-400 opacity-60"></span><span class="relative inline-flex size-2 rounded-full bg-blue-600"></span></span>Listening · <span class="tabular-nums" data-clock>12m 58s</span></span>${button("Pause", { v: "white", s: "sm", icon: "pause" })}${button("End session", { v: "solid", s: "sm", icon: "square" })}`
      : `<span class="me-1">${statusDot("Draft ready", "on", "!text-[13px]")}</span>${button("Copy", { v: "white", s: "sm", icon: "copy" })}${button("Sign & send to chart", { v: "solid", s: "sm", icon: "pen-line" })}` })}
    <div class="grid h-[720px] grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"${chg("The note the dentist signs gets more room than the transcript (3 to 2 instead of half and half)")}>
      <section class="flex min-h-0 flex-col border-e border-gray-200/80" aria-label="Transcript">
        <div class="flex h-11 shrink-0 items-center justify-between border-b border-gray-200/80 px-5"><h3 class="${R.groupTitle}">Transcript</h3><span class="${R.caption}"${chg("The caption says when recording started, so the times beside each line read as time into the visit")}>Dr. Maya Patel · Op 1 · Started 9:00 AM</span></div>
        <ol class="min-h-0 grow space-y-3.5 overflow-y-auto px-5 py-4" data-tx>${(live ? TX : [...TX.slice(0, -1), [TX[6][0], TX[6][1], TX[6][2] + " we'll book your filling on the way out."], ["Ava", "13:07", "Sounds good, thank you!"]]).map(([who, t, line], i) => `<li class="grid grid-cols-[44px_1fr] gap-3"><span class="pt-0.5 text-xs tabular-nums text-gray-400">${t}</span><div><p class="text-xs font-medium ${who === "Ava" ? "text-gray-500" : "text-gray-800"}">${who}</p><p class="text-sm leading-6 ${live && i === TX.length - 1 ? "text-gray-500" : "text-gray-800"}">${esc(line)}${live && i === TX.length - 1 ? `<span class="ms-0.5 inline-block h-4 w-px translate-y-0.5 bg-blue-600 motion-safe:animate-pulse"></span>` : ""}</p></div></li>`).join("")}</ol>
      </section>
      <section class="flex min-h-0 flex-col" aria-label="Clinical note">
        <div class="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-gray-200/80 px-5"><h3 class="${R.groupTitle} flex items-center gap-1.5">${spark("size-3.5")}Clinical note</h3>
          <div class="flex items-center gap-1.5"${chg("No second \"Drafting\" status here: the header and the live line already say it")}><button type="button" class="${R.selectSm} !w-auto">Template: Periodic exam${I("chevrons-up-down")}</button></div></div>
        <div class="min-h-0 grow overflow-y-auto">
          ${scribeNote(state)}
          ${psec("Codes Asha heard", `<div data-codes>${scribeCodes(accepted)}</div>`, { actions: `<span class="${R.caption}">Today's codes go on the ledger, next visit's on the treatment plan</span>` })}
        </div>
      </section></div>`;
    return `${workspaceHeader({ parent: "Scribe", title: `${esc(p.name)} · Periodic exam`, actions: live
      ? `<span class="me-1 inline-flex items-center gap-2 text-[13px] text-gray-600"><span class="relative flex size-2"><span class="asha-ping absolute inline-flex size-full rounded-full bg-blue-400 opacity-60"></span><span class="relative inline-flex size-2 rounded-full bg-blue-600"></span></span>Listening · <span class="tabular-nums" data-clock>12:58</span></span>${button("Pause", { v: "white", s: "sm", icon: "pause" })}${button("End session", { v: "solid", s: "sm", icon: "square" })}`
      : `<span class="me-1">${statusDot("Draft ready", "on", "!text-[13px]")}</span>${button("Copy", { v: "white", s: "sm", icon: "copy" })}${button("Sign & send to chart", { v: "solid", s: "sm", icon: "pen-line" })}` })}
    <div class="grid h-[720px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section class="flex min-h-0 flex-col border-e border-gray-200/80" aria-label="Transcript">
        <div class="flex h-11 shrink-0 items-center justify-between border-b border-gray-200/80 px-5"><h3 class="${R.groupTitle}">Transcript</h3><span class="${R.caption}">Dr. Maya Patel · Op 1 · Today 9:00 AM</span></div>
        <ol class="min-h-0 grow space-y-3.5 overflow-y-auto px-5 py-4" data-tx>${(live ? TX : [...TX.slice(0, -1), [TX[6][0], TX[6][1], TX[6][2] + " we'll book your filling on the way out."], ["Ava", "13:07", "Sounds good, thank you!"]]).map(([who, t, line], i) => `<li class="grid grid-cols-[44px_1fr] gap-3"><span class="pt-0.5 text-xs tabular-nums text-gray-400">${t}</span><div><p class="text-xs font-medium ${who === "Ava" ? "text-gray-500" : "text-gray-800"}">${who}</p><p class="text-sm leading-6 ${live && i === TX.length - 1 ? "text-gray-500" : "text-gray-800"}">${esc(line)}${live && i === TX.length - 1 ? `<span class="ms-0.5 inline-block h-4 w-px translate-y-0.5 bg-blue-600 motion-safe:animate-pulse"></span>` : ""}</p></div></li>`).join("")}</ol>
      </section>
      <section class="flex min-h-0 flex-col" aria-label="Clinical note">
        <div class="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-gray-200/80 px-5"><h3 class="${R.groupTitle} flex items-center gap-1.5">${spark("size-3.5")}Clinical note</h3>
          <div class="flex items-center gap-1.5"><button type="button" class="${R.selectSm} !w-auto">Template: Periodic exam${I("chevrons-up-down")}</button>${statusDot(live ? "Drafting" : "Draft", "off", "!text-[13px] !text-gray-500 ms-1")}</div></div>
        <div class="min-h-0 grow overflow-y-auto">
          ${scribeNote(state)}
          ${psec("Codes Asha heard", bleed(`<div data-codes>${scribeCodes(accepted)}</div>`), { actions: `<span class="${R.caption}">Only accepted codes go on the ledger</span>`, cls: "!pb-0" })}
        </div>
      </section></div>`;
  },
  mount: (el, state) => {
    SC.clear();
    if (state === "Listening" && !Motion.reduced()) {
      let pi = 0, sec = 12 * 60 + 58;
      SC.every(() => { const h = el.querySelector("[data-scribe-phrase]"); if (!h) return; pi = (pi + 1) % SCRIBE_PHRASES.length; h.innerHTML = phrase(SCRIBE_PHRASES[pi], "Scribe is drafting"); }, 1800);
      SC.every(() => { const c = el.querySelector("[data-clock]"); if (!c) return; sec++; c.textContent = V2 ? `${Math.floor(sec / 60)}m ${String(sec % 60).padStart(2, "0")}s` : `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`; }, 1000);
    }
    const accepted = new Set(state === "Listening" ? [0, 2] : [0, 1, 2]); const box = el.querySelector("[data-codes]");
    const tx = el.querySelector("[data-tx]"); if (tx) tx.scrollTop = tx.scrollHeight;
    if (V4) return box.addEventListener("click", (e) => { const b = e.target.closest('[data-act="scribe-code"]'), g = box.querySelector("[data-sheet-host]")?._grid; if (!b || !g) return;
      const r = g.data.find((x) => x.id === b.dataset.code); if (r) { r.on = !r.on; g.render(); } });
    box.addEventListener("click", (e) => { const b = e.target.closest("[data-code]"); if (!b) return; const i = +b.dataset.code; accepted.has(i) ? accepted.delete(i) : accepted.add(i); box.innerHTML = scribeCodes(accepted); icons(); });
  }
});

})();
