/* Calendar prototype: the design system's Calendar, full screen, with clickable events.
 * Clicking an event opens yourPanel() below, which only lists the event's raw data: that's where your design goes.
 * Everything is pretend: no network, no real people. Rebuild with `python3 build.py` after editing src/. */
const PROTO = (() => {
  let cal = null;

  /* YOUR DESIGN GOES HERE. Replace this with the panel you design. Draw with the library's kit (Sheet, psec, button,
   * statusDot, fieldTable, Grid, actionsMenu ... in docs/design-system/src/kit.js) so it looks like the rest of Asha. */
  function yourPanel(ev) {
    const s = calMin(ev.start), e = ev.end != null ? calMin(ev.end) : s + (ev.dur || 30), d = calDate(ev.date);
    const row = (k, v) => `<tr><td class="w-[140px] py-1 pe-4 text-[13px] text-gray-500 align-top whitespace-nowrap">${k}</td><td class="py-1 text-[13px] text-gray-800">${v}</td></tr>`;
    Sheet.open({
      flush: true, title: esc(ev.title), subtitle: `${CAL_DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()} · ${calRange(s, e)}`,
      body: `<section class="${R.psec}"><div class="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-[13px] text-gray-600">
          Not designed yet. This is the raw data for the event; replace <code class="text-gray-800">yourPanel()</code> in
          <code class="text-gray-800">src/proto-app.js</code> with your design.</div></section>
        ${psec("Event", `<table class="w-full">${Object.entries(ev).map(([k, v]) => row(esc(k), esc(String(v)))).join("")}</table>`)}`,
      footer: `<span class="grow"></span>${button("Close", { v: "white", s: "sm", attrs: 'data-act="close-sheet"' })}`
    });
  }

  function init() {
    cal = new Calendar(document.getElementById("app"), { date: PROTO_DATA.today, now: PROTO_DATA.now, view: "week", from: 7, to: 20,
      height: window.innerHeight - 56 - 24 - 54, events: PROTO_DATA.events, onOpen: yourPanel });
  }
  return { init, open: yourPanel, get calendar() { return cal; } };
})();
