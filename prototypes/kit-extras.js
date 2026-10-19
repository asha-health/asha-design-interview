/* Pieces the design-system library doesn't have yet, drawn the way the production app draws them. Load this after
 * kit.js (the prototypes' build.py does). The library itself stays untouched.
 *
 * DatePicker: the app's standard date picker (asha-ui's AshaDatePicker, used by checkout's payment date, Edit
 *   procedure and Labs): a small popover under the field, month and arrows on top, Su–Sa, today ringed, the chosen day
 *   blue. A pick calls onPick and closes. Esc or a click outside closes it.
 *     DatePicker.open(anchorEl, { value: new Date(2026, 8, 25), today: new Date(2026, 8, 25), onPick: (d) => ... })
 *   dayLabel(d) gives the app's short form: "Fri, Sep 25".
 *
 * parseClock(text): a typed time to minutes after midnight, or null. Takes "10:15", "1015", "10.15", "2pm", "2 p",
 *   "7". Without am or pm, 1 to 6 o'clock means the afternoon (nobody books a 3 AM cleaning). clockLabel(minutes)
 *   gives "2:00 PM". Pair it with a select of open times: what's typed goes first, Enter takes it. */
const DAY3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const dayLabel = (d) => `${DAY3[d.getDay()]}, ${MON3[d.getMonth()]} ${d.getDate()}`;
const sameDay = (a, b) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function parseClock(q) {
  const m = String(q || "").trim().toLowerCase().replace(/\s+/g, "").match(/^(\d{1,2})(?:[:.]?(\d{2}))?(a|am|p|pm)?$/);
  if (!m) return null;
  let h = +m[1]; const mi = m[2] ? +m[2] : 0;
  if (h > 23 || mi > 59) return null;
  if (m[3]) { if (h < 1 || h > 12) return null; h = (h % 12) + (m[3][0] === "p" ? 12 : 0); } else if (h >= 1 && h <= 6) h += 12;
  return h * 60 + mi;
}
const clockLabel = (mins) => { const h = Math.floor(mins / 60), m = mins % 60; return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };

const DatePicker = {
  el: null, o: null, month: null,
  monthHTML() {
    const { value, today } = this.o, month = this.month;
    const first = new Date(month.getFullYear(), month.getMonth(), 1), start = new Date(first); start.setDate(1 - first.getDay());
    const days = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    const nav = (dir, icon, label) => `<button type="button" data-cal-nav="${dir}" aria-label="${label}" class="absolute ${dir < 0 ? "left-1" : "right-1"} inline-flex size-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600/30">${I(icon, "size-4")}</button>`;
    const cell = (d) => {
      const out = d.getMonth() !== month.getMonth(), on = sameDay(d, value), now = sameDay(d, today);
      return `<span class="relative size-9 p-0 text-center"><button type="button" data-cal-day="${+d}"${now ? " data-today" : ""} aria-pressed="${on}" aria-label="${esc(dayLabel(d))}, ${d.getFullYear()}"
        class="${cx("inline-flex size-9 items-center justify-center rounded-md text-sm tabular-nums transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-600/30",
          on ? "bg-blue-600 text-white shadow-2xs hover:bg-blue-700" : cx(out ? "text-gray-300" : "text-gray-800", "hover:bg-gray-100", now && "font-semibold text-blue-600 ring-1 ring-inset ring-blue-500/50"))}">${d.getDate()}</button></span>`;
    };
    const weeks = Array.from({ length: 6 }, (_, w) => `<div class="flex w-full">${days.slice(w * 7, w * 7 + 7).map(cell).join("")}</div>`).join("");
    return `<div class="flex flex-col gap-3">
      <div class="relative flex h-9 items-center justify-center px-1">${nav(-1, "chevron-left", "Previous month")}<span class="text-sm font-semibold text-gray-900">${month.toLocaleString("en-US", { month: "long", year: "numeric" })}</span>${nav(1, "chevron-right", "Next month")}</div>
      <div><div class="flex">${["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((w) => `<span class="flex size-9 items-center justify-center text-[10px] font-semibold uppercase tracking-wide text-gray-400">${w}</span>`).join("")}</div>${weeks}</div></div>`;
  },
  open(anchor, o) {
    this.close();
    this.o = { today: new Date(), ...o };
    const base = this.o.value || this.o.today;
    this.month = new Date(base.getFullYear(), base.getMonth(), 1);
    const el = document.createElement("div");
    el.className = "fixed z-[90] w-auto rounded-lg border border-gray-200 bg-white p-2 shadow-lg";
    el.setAttribute("role", "dialog"); el.setAttribute("aria-label", o.label || "Choose a date");
    el.innerHTML = this.monthHTML(); document.body.appendChild(el); this.el = el; icons();
    const a = anchor.getBoundingClientRect(), h = el.offsetHeight, up = a.bottom + 4 + h > innerHeight && a.top - 4 - h > 0;
    Object.assign(el.style, { left: `${Math.max(8, Math.min(innerWidth - el.offsetWidth - 8, a.left))}px`, top: `${up ? a.top - 4 - h : a.bottom + 4}px` });
    el.addEventListener("click", (e) => {
      const n = e.target.closest("[data-cal-nav]");
      if (n) { this.month = new Date(this.month.getFullYear(), this.month.getMonth() + Number(n.dataset.calNav), 1); el.innerHTML = this.monthHTML(); icons(); return; }
      const d = e.target.closest("[data-cal-day]"); if (!d) return;
      const pick = new Date(Number(d.dataset.calDay)), cb = this.o.onPick; this.close(); if (cb) cb(pick);
    });
    this.anchor = anchor;
    this.away = (e) => { if (this.el && !this.el.contains(e.target) && !anchor.contains(e.target)) this.close(); };
    this.esc = (e) => { if (e.key === "Escape" && this.el) { e.preventDefault(); this.close(); anchor.focus({ preventScroll: true }); } };
    setTimeout(() => { document.addEventListener("mousedown", this.away); document.addEventListener("keydown", this.esc); }, 0);
    const first = el.querySelector('[aria-pressed="true"]') || el.querySelector("[data-today]") || el.querySelector("[data-cal-day]"); if (first) first.focus({ preventScroll: true });
  },
  close() {
    if (!this.el) return;
    this.el.remove(); this.el = null;
    document.removeEventListener("mousedown", this.away); document.removeEventListener("keydown", this.esc);
  }
};
