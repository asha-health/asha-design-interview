/* v4 · Agent setup wizards, redesigned for office staff who aren't technical (blocks register only in v4 or on a
 * review page that sets window.ASHA_REVIEW). One block, "ai-agent-setup": Stephanie (Hygiene Recall) and Leena
 * (Schedule Optimizer) set up in four plain steps, every answer already picked, a live preview of the first text.
 * Settings come from HygieneRecallSetup/hygieneRecallSetupForm.ts and ScheduleOptimizerSetup/scheduleOptimizerSetupForm.ts.
 * Open questions are read at render time from V4_OPTS.wizard: shape (steps | page), ask (choices | form | fill),
 * preview (side | end | none), rest (more | ask | later). All data is invented. */
if (V4 || window.ASHA_REVIEW) {
V4_OPTS.wizard = Object.assign({ shape: "steps", ask: "choices", preview: "side", rest: "more" }, V4_OPTS.wizard || {});
(() => {
const WIZ_DEFAULTS = { shape: "steps", ask: "choices", preview: "side", rest: "more" };
const wizOpts = () => Object.assign({}, WIZ_DEFAULTS, V4_OPTS.wizard || {});
const OFFICE = "Bayview Family Dental";
const STORE = new Map(); let SEQ = 0;

/* ---------------------------------------------------------------- dates (today is Fri, Sep 25, 2026) */
const D0 = Date.UTC(2026, 8, 25), DAY = 864e5, WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayAt = (n) => new Date(D0 + n * DAY);
const weekday = (d) => { while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d = new Date(d.getTime() + DAY); return d; };
const fmtDay = (d) => `${WD[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
const isoDays = (iso) => Math.round((Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) - D0) / DAY);
const weeks = (days) => (days <= 7 ? "about a week" : `about ${Math.round(days / 7)} weeks`);
const before = (d) => (+d === 0 ? "once they're due" : +d === 30 ? "1 month before they're due" : +d % 7 === 0 ? `${d / 7} week${d === 7 ? "" : "s"} before they're due` : `${d} days before they're due`);
const ahead = (d) => (+d === 7 ? "1 week" : +d === 30 ? "1 month" : +d % 7 === 0 ? `${d / 7} weeks` : `${d} day${+d === 1 ? "" : "s"}`);
const windowWords = (d) => (+d === 7 ? "next week" : +d === 14 ? "next 2 weeks" : `next ${d} day${+d === 1 ? "" : "s"}`);
const listWords = (a) => (a.length < 2 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);

/* ---------------------------------------------------------------- invented practice data */
const SERVICES = [
  { v: "ace", l: "Adult cleaning and exam", min: 60, say: "cleaning and checkup", for: "adult" },
  { v: "ac", l: "Adult cleaning", min: 45, say: "cleaning", for: "adult" },
  { v: "cce", l: "Child cleaning and exam", min: 45, say: "cleaning and checkup", for: "kids" },
  { v: "cc", l: "Child cleaning", min: 30, say: "cleaning", for: "kids" },
  { v: "gum", l: "Gum-care cleaning", min: 60, say: "gum-care cleaning", for: "perio" },
  { v: "gumx", l: "Gum-care cleaning and exam", min: 75, say: "gum-care cleaning and checkup", for: "perio" }
];
const svc = (v) => SERVICES.find((s) => s.v === v);
const svcOpts = (g) => SERVICES.filter((s) => s.for === g).map((s) => ({ v: s.v, l: `${s.l} · ${s.min} min`, f: s.l.toLowerCase() }));
const PLANS = [["delta", "Delta Dental", 0.3], ["metlife", "MetLife", 0.15], ["cigna", "Cigna", 0.12], ["aetna", "Aetna", 0.12], ["guardian", "Guardian", 0.1], ["uc", "United Concordia", 0.06]];
const PLAN_OPTS = PLANS.map(([v, l]) => ({ v, l }));
/* Patients due, by how early she starts (0 = only once due, 14, 30 days ahead) */
const GROUPS = [
  { v: "adult", l: "Adults due for a cleaning", short: "adults", say: "Adult", n: [90, 116, 142] },
  { v: "kids", l: "Kids due for a cleaning", short: "kids", say: "Kid", n: [22, 30, 38] },
  { v: "perio", l: "Gum-care patients", sub: "They come every 3 to 4 months", short: "gum-care patients", say: "Gum care", n: [15, 18, 21] }
];
const dueCount = (g, d) => { const [a, b, c] = g.n; d = Math.max(0, +d || 0);
  return Math.round(d <= 14 ? a + (b - a) * (d / 14) : d <= 30 ? b + (c - b) * ((d - 14) / 16) : c + (c - b) * ((d - 30) / 16)); };
const RECALL_PTS = [
  { name: "Mason Reed", g: "adult", due: "2026-06-02", payer: "guardian", hyg: "Sofia" },
  { name: "Daniel Price", g: "perio", due: "2026-08-28", payer: "delta", hyg: "Jordan" },
  { name: "Noah Bennett", g: "kids", due: "2026-09-18", payer: "delta", hyg: "Sofia" },
  { name: "Emma Rodriguez", g: "adult", due: "2026-09-20", payer: "cigna", hyg: "Jordan" },
  { name: "Sophia Hughes", g: "adult", due: "2026-10-01", payer: "uc", hyg: "Sofia" },
  { name: "Lily Chen", g: "kids", due: "2026-10-06", payer: "metlife", hyg: "Jordan" },
  { name: "Grace Morales", g: "perio", due: "2026-10-09", payer: "aetna", hyg: "Sofia" },
  { name: "Henry Walsh", g: "adult", due: "2026-10-14", payer: "delta", hyg: "Jordan" },
  { name: "Ruby Okafor", g: "kids", due: "2026-10-20", payer: "", hyg: "Sofia" },
  { name: "Owen Brooks", g: "adult", due: "2026-10-23", payer: "metlife", hyg: "Jordan" }
];
const PROVIDERS = [{ v: "pr1", l: "Dr. Maya Patel", short: "Dr. Patel" }, { v: "pr2", l: "Dr. Ethan Brooks", short: "Dr. Brooks" }, { v: "pr3", l: "Sofia Ramirez, RDH", short: "Sofia" }, { v: "pr4", l: "Jordan Kim, RDH", short: "Jordan" }];
const VISIT_TYPES = [{ v: "clean", l: "Cleanings" }, { v: "exam", l: "Exams" }, { v: "fill", l: "Fillings" }, { v: "crown", l: "Crowns" }, { v: "np", l: "New patients" }];
const CONFIRM_DAY = "2026-10-02";
const CONFIRM_VISITS = [
  { t: "8:00 AM", name: "Liam Carter", p: "pr1", type: "crown" }, { t: "9:00 AM", name: "Chloe Park", p: "pr3", type: "clean" },
  { t: "10:00 AM", name: "Ethan Walker", p: "pr2", type: "fill" }, { t: "11:00 AM", name: "Mia Lopez", p: "pr4", type: "clean" },
  { t: "1:30 PM", name: "James Ortiz", p: "pr1", type: "exam" }, { t: "2:30 PM", name: "Zoe Turner", p: "pr3", type: "clean" },
  { t: "3:30 PM", name: "Isabella Kim", p: "pr2", type: "np" }];
const MOVE_UP = [
  { name: "Ava Thompson", booked: "2026-10-06" }, { name: "Chloe Park", booked: "2026-10-08" }, { name: "Ethan Walker", booked: "2026-10-13" },
  { name: "Mia Lopez", booked: "2026-10-15" }, { name: "James Ortiz", booked: "2026-10-20" }, { name: "Grace Morales", booked: "2026-11-10" }];
const RECALL_LISTS = [{ v: "prophy", l: "Prophy · every 6 months" }, { v: "child", l: "Child prophy · every 6 months" }, { v: "perio", l: "Perio maint · every 3 months" }, { v: "bwx", l: "Bitewings · every 12 months" }];
const VOICES = [{ v: "warm", l: "Warm and friendly" }, { v: "calm", l: "Calm and clear" }, { v: "bright", l: "Bright and upbeat" }, { v: "deep", l: "Warm, lower voice" }];
const MODEL_OPTS = [{ v: "std", l: "Asha standard", rec: true, f: "Asha standard" }, { v: "fast", l: "Faster, shorter replies", f: "faster, shorter replies" }];

const AGENTS = {
  steph: { name: "Stephanie", does: "Texts and calls patients who are due for a cleaning and books them in.", steps: ["Who to contact", "What to book", "How many a day", "Check and turn on"] },
  leena: { name: "Leena", does: "Confirms upcoming visits and offers last-minute openings to patients who'd like to come in sooner.", steps: ["What Leena does", "Confirming visits", "Filling openings", "Check and turn on"] }
};
const START = {
  steph: () => ({ name: "Stephanie", voice: "warm", context: "", groups: ["adult", "kids", "perio"], early: 30, visit_adult: "ace", visit_kids: "cce", visit_perio: "gum", sameHyg: false, soonest: 3,
    perDay: 20, skipIns: "none", skipPlans: [], recallAdult: "prophy", recallPerio: "perio", kidsAge: "13", codes: ["D1110", "D1120", "D4910"], doctor: "", offset: "1", model: "std" }),
  leena: () => ({ name: "Leena", voice: "calm", context: "", tasks: ["confirm", "fill"], confirmWhen: 7, confirmWhich: "all", confirmProviders: [], confirmTypes: [], fillWindow: 7, fillWho: 30, atOnce: 3,
    perOpening: "10", durations: ["30", "45", "60", "90"], fillProviders: "all", confirmSkip: "none", confirmSkipPlans: [], fillSkip: "none", fillSkipPlans: [], model: "std" })
};

/* ---------------------------------------------------------------- what Stephanie would do with these answers */
const stephPool = (a) => RECALL_PTS.filter((p) => a.groups.includes(p.g) && isoDays(p.due) <= +a.early && !(a.skipIns === "some" && a.skipPlans.includes(p.payer)));
const stephTotal = (a) => { const keep = 1 - (a.skipIns === "some" ? PLANS.filter(([v]) => a.skipPlans.includes(v)).reduce((s, p) => s + p[2], 0) : 0);
  return Math.round(GROUPS.filter((g) => a.groups.includes(g.v)).reduce((s, g) => s + dueCount(g, a.early), 0) * keep); };
/* "the adult cleaning and exam, child cleaning and exam or gum-care cleaning", for the groups she contacts */
const visitWords = (a) => { const v = [...new Set(GROUPS.filter((g) => a.groups.includes(g.v)).map((g) => (svc(a[`visit_${g.v}`]) || {}).l).filter(Boolean))].map((l) => `<b>${esc(l.toLowerCase())}</b>`);
  return v.length ? `the ${v.length < 2 ? v[0] : `${v.slice(0, -1).join(", ")} or ${v[v.length - 1]}`}` : "their visit"; };
const offerDays = (lead) => { const d1 = weekday(dayAt(1 + Math.max(1, +lead || 0))), d2 = weekday(new Date(d1.getTime() + DAY)); return [d1, d2]; };

/* ================================================================ the questions
 * A question: { k, type: "one" | "many" | "cards" | "group", q (said out loud), why (one grey line), opts: [{ v, l, sub,
 * right, rec, f (its words inside a fill-in sentence), reveal: [{ k, label, opts }] }], form: { ctl, unit, min, max, step, q } }
 * Steps: { name, nav, qs, extras (asked in the steps when rest = "ask", else under More settings), fill: [[parts], why] } */
function stephSteps(S) {
  const a = S.a, total = stephTotal(a);
  const groupsQ = { k: "groups", type: "many", q: `Which patients should ${a.name || "Stephanie"} contact?`, why: "Counts come from your recall lists, as of this morning.",
    opts: GROUPS.map((g) => ({ v: g.v, l: g.l, sub: g.sub, right: `${dueCount(g, a.early)} due`, f: g.short.replace(/^\w/, (m) => m.toUpperCase()) })), form: { ctl: "checks" } };
  const earlyQ = { k: "early", type: "one", q: "How early should she start?", why: "Reaching people before they're due gives them time to plan.",
    opts: [{ v: 30, l: "1 month before they're due", rec: true, f: "1 month before they're due" }, { v: 14, l: "2 weeks before", f: "2 weeks before they're due" }, { v: 0, l: "Once they're due", f: "once they're due" }],
    form: { ctl: "number", unit: "days before they're due", min: 0, max: 90 } };
  const visitsQ = { k: "visits", type: "group", q: "What visit should she book?", why: "We picked these from your services. Change one only if it's wrong.",
    items: GROUPS.map((g) => ({ k: `visit_${g.v}`, g: g.v, label: g.v === "adult" ? "Adults" : g.v === "kids" ? "Kids" : "Gum-care patients", opts: svcOpts(g.v) })) };
  const hygQ = { k: "sameHyg", type: "one", q: "Which hygienist should they see?", why: "Anyone free means more times to offer, so more patients book.",
    opts: [{ v: false, l: "Anyone who's free", rec: true, f: "anyone who's free" }, { v: true, l: "The same hygienist as last time", f: "the hygienist they saw last time" }],
    form: { ctl: "switch", q: "Book them with the same hygienist as last time?" } };
  const soonQ = { k: "soonest", type: "one", q: "How soon can she book them?", why: "3 days leaves time to check their insurance before the visit.",
    opts: [{ v: 1, l: "As soon as the next day", f: "as soon as the next day" }, { v: 3, l: "3 or more days out", rec: true, f: "3 or more days out" }, { v: 7, l: "A week or more out", f: "a week or more out" }],
    form: { ctl: "number", unit: "days out, at the soonest", min: 0, max: 30 } };
  const perQ = { k: "perDay", type: "one", q: "How many patients should she contact each day?", why: "Start lower if your hygiene schedule is already full.",
    opts: [10, 20, 40].map((n) => ({ v: n, l: `${n} a day`, rec: n === 20, right: total ? `everyone in ${weeks(Math.ceil(total / n))}` : "", f: String(n) })),
    form: { ctl: "slider", unit: "patients a day", min: 5, max: 100, step: 5 } };
  const insQ = { k: "skipIns", type: "one", q: "Should she skip anyone because of their insurance?", why: "Most offices contact everyone.",
    opts: [{ v: "none", l: "No, contact everyone", rec: true, f: "contact everyone, whatever their insurance" }, { v: "some", l: "Yes, skip some insurance plans", f: "skip patients on these plans:", reveal: [{ k: "skipPlans", label: "Skip", opts: PLAN_OPTS }] }] };
  const X = stephMore();
  const parts1 = []; GROUPS.filter((g) => a.groups.includes(g.v)).forEach((g, i, arr) => { parts1.push(i === 0 ? "Book " : i === arr.length - 1 ? " and " : ", ", `${g.short} for `, { k: `visit_${g.v}`, group: "visits" }); });
  return [
    { name: AGENTS.steph.steps[0], nav: a.groups.length ? `${total} patients due` : "", qs: [groupsQ, earlyQ], extras: [X.recallAdult, X.recallPerio],
      fill: [[["Contact ", { k: "groups" }, " who are due for a cleaning, ", { k: "early" }, "."], groupsQ.why]] },
    { name: AGENTS.steph.steps[1], nav: `${a.sameHyg ? "Same hygienist" : "Any hygienist"} · ${+a.soonest}+ days`, qs: [visitsQ, hygQ, soonQ], extras: [X.kidsAge, X.codes],
      fill: [[parts1.length ? [...parts1, "."] : ["Pick who to contact first."], visitsQ.why], [["Offer times with ", { k: "sameHyg" }, ", ", { k: "soonest" }, "."], soonQ.why]] },
    { name: AGENTS.steph.steps[2], nav: `${a.perDay} a day`, qs: [perQ, insQ], extras: [X.doctor, X.offset],
      fill: [[["Text up to ", { k: "perDay" }, " patients a day, and ", { k: "skipIns" }], perQ.why]] },
    { name: AGENTS.steph.steps[3], nav: "Review and turn on", review: true, qs: [], extras: [X.model] }
  ];
}
function stephMore() {
  return {
    recallAdult: { k: "recallAdult", type: "one", label: "Cleaning recall list", q: "Which of your recall lists has patients due for a cleaning?", why: "We matched this to your practice software.", opts: RECALL_LISTS, fill: ["Find adults and kids on your ", { k: "recallAdult" }, " recall list."] },
    recallPerio: { k: "recallPerio", type: "one", label: "Gum-care recall list", q: "Which recall list has your gum-care patients?", why: "We matched this to your practice software.", opts: RECALL_LISTS, fill: ["Find gum-care patients on your ", { k: "recallPerio" }, " recall list."] },
    kidsAge: { k: "kidsAge", type: "one", label: "Kids are under", q: "Up to what age does someone count as a kid?", why: "Kids get the kids' visit instead of the adult one.", opts: ["12", "13", "16", "18"].map((v) => ({ v, l: `${v} years old`, rec: v === "13", f: `${v} years old` })), fill: ["Book anyone under ", { k: "kidsAge" }, " as a kid."] },
    codes: { k: "codes", type: "many", label: "Counts as a cleaning", q: "Which past visits count as a cleaning?", why: "She checks these to see when someone last came in.",
      opts: [["D1110", "Adult cleaning"], ["D1120", "Child cleaning"], ["D4910", "Gum-care cleaning"], ["D4341", "Deep cleaning"]].map(([v, l]) => ({ v, l, right: v, f: l })), fill: ["Count ", { k: "codes" }, " as a past cleaning."] },
    doctor: { k: "doctor", type: "one", label: "Doctor named in texts", q: "Should her texts mention a doctor?", why: "For example: “Dr. Patel would like to see you for your cleaning.”",
      opts: [{ v: "", l: "No", rec: true, f: "no doctor" }, { v: "Dr. Patel", l: "Dr. Maya Patel", f: "Dr. Maya Patel" }, { v: "Dr. Brooks", l: "Dr. Ethan Brooks", f: "Dr. Ethan Brooks" }], fill: ["Mention ", { k: "doctor" }, " in her texts."] },
    offset: { k: "offset", type: "one", label: "Push due dates back", q: "Should due dates move a few days later?", why: "This changes due dates for the whole office, not just Stephanie.",
      opts: [{ v: "1", l: "No, keep the usual date", rec: true, f: "Keep the usual due dates" }, { v: "3", l: "3 days later", f: "Move due dates 3 days later" }, { v: "7", l: "A week later", f: "Move due dates a week later" }], fill: [{ k: "offset" }, " for the whole office."] },
    model: { k: "model", type: "one", label: "AI model", q: "Which AI should she use?", why: "The standard one suits almost every office.", opts: MODEL_OPTS, fill: ["Use ", { k: "model" }, " for her texts and calls."] }
  };
}
function leenaSteps(S) {
  const a = S.a, conf = a.tasks.includes("confirm"), fill = a.tasks.includes("fill"), X = leenaMore();
  const tasksQ = { k: "tasks", type: "cards", q: `What should ${a.name || "Leena"} do?`, why: "Most offices want both. Turn one off only if your team already does it.",
    opts: [{ v: "confirm", icon: "calendar-check", l: "Confirm upcoming visits", sub: `Texts patients ${+a.confirmWhen === 7 ? "a week" : ahead(a.confirmWhen)} before their visit to make sure they're coming.`, f: "confirm upcoming visits", does: "confirms upcoming visits" },
      { v: "fill", icon: "calendar-plus", l: "Fill last-minute openings", sub: "When a visit is cancelled, offers the time to patients who'd like to come in sooner.", f: "fill last-minute openings", does: "fills last-minute openings" }],
    form: { ctl: "switches" } };
  const whenQ = { k: "confirmWhen", type: "one", q: "How early should she ask patients to confirm?", why: "A week leaves time to fill the chair if someone can't make it.",
    opts: [{ v: 2, l: "2 days before", f: "2 days" }, { v: 7, l: "1 week before", rec: true, f: "1 week" }, { v: 14, l: "2 weeks before", f: "2 weeks" }],
    form: { ctl: "slider", unit: "days before the visit", min: 1, max: 14, step: 1 } };
  const whichQ = { k: "confirmWhich", type: "one", q: "Which visits should she confirm?", why: "Most offices confirm every visit.",
    opts: [{ v: "all", l: "All visits", rec: true, f: "every visit" }, { v: "some", l: "Only some providers or visit types", f: "only these:", reveal: [{ k: "confirmProviders", label: "Providers", opts: PROVIDERS }, { k: "confirmTypes", label: "Visit types", opts: VISIT_TYPES }] }] };
  const windowQ = { k: "fillWindow", type: "one", q: "Which openings should she try to fill?", why: "Openings further out usually fill on their own.",
    opts: [{ v: 2, l: "The next 2 days", f: "the next 2 days" }, { v: 7, l: "The next week", rec: true, f: "the next week" }, { v: 14, l: "The next 2 weeks", f: "the next 2 weeks" }],
    form: { ctl: "number", unit: "days from today", min: 1, max: 30 } };
  const whoQ = { k: "fillWho", type: "one", q: "Who should she offer them to?", why: "They already have a visit, so they're easy to move.",
    opts: [{ v: 30, l: "Patients already booked in the next month", rec: true, f: "booked in the next month" }, { v: 60, l: "Patients already booked in the next 2 months", f: "booked in the next 2 months" }],
    form: { ctl: "number", unit: "days out, at the latest", min: 7, max: 120, q: "Offer openings to patients booked up to" } };
  const onceQ = { k: "atOnce", type: "one", q: "How many should she text at once?", why: "The first to say yes gets the time.",
    opts: [{ v: 1, l: "1 at a time", right: "slower", f: "1" }, { v: 3, l: "3 at a time", rec: true, f: "3" }, { v: 5, l: "5 at a time", right: "faster", f: "5" }],
    form: { ctl: "slider", unit: "patients at once", min: 1, max: 10, step: 1 } };
  return [
    { name: AGENTS.leena.steps[0], nav: conf && fill ? "Confirming and filling" : conf ? "Confirming only" : fill ? "Filling only" : "", qs: [tasksQ], extras: [],
      fill: [[[`${a.name || "Leena"} should `, { k: "tasks" }, "."], tasksQ.why]] },
    { name: AGENTS.leena.steps[1], off: conf ? "" : "confirm", offWhat: "confirm visits", offWhy: "Turn it on to have her text patients before their visit to make sure they're coming.",
      nav: conf ? `${ahead(a.confirmWhen)} before · ${a.confirmWhich === "all" ? "all visits" : "some visits"}` : "Not doing this", qs: [whenQ, whichQ], extras: [X.confirmSkip],
      fill: [[["Text patients ", { k: "confirmWhen" }, " before their visit to confirm it, for ", { k: "confirmWhich" }], whenQ.why]] },
    { name: AGENTS.leena.steps[2], off: fill ? "" : "fill", offWhat: "fill last-minute openings", offWhy: "Turn it on to have her offer cancelled times to patients who'd like to come in sooner.",
      nav: fill ? `${windowWords(a.fillWindow).replace(/^\w/, (m) => m.toUpperCase())} · ${a.atOnce} at once` : "Not doing this", qs: [windowQ, whoQ, onceQ], extras: [X.perOpening, X.durations, X.fillProviders, X.fillSkip],
      fill: [[["Fill openings in ", { k: "fillWindow" }, ". Offer them to patients ", { k: "fillWho" }, ", ", { k: "atOnce" }, " at a time."], onceQ.why]] },
    { name: AGENTS.leena.steps[3], nav: "Review and turn on", review: true, qs: [], extras: [X.model] }
  ];
}
function leenaMore() {
  const skip = (k, when) => ({ k, type: "one", label: `Skip plans ${when}`, q: `Should she skip anyone's insurance ${when}?`, why: "Most offices don't skip anyone.",
    opts: [{ v: "none", l: "No, include everyone", rec: true, f: "include everyone" }, { v: "some", l: "Yes, skip some insurance plans", f: "skip these plans:", reveal: [{ k: `${k}Plans`, label: "Skip", opts: PLAN_OPTS }] }],
    fill: [`${when.replace(/^\w/, (m) => m.toUpperCase())}, `, { k }, ""] });
  return {
    perOpening: { k: "perOpening", type: "one", label: "Most asked per opening", q: "How many patients should she ask about one opening, in all?", why: "She stops when someone says yes or she reaches this number.",
      opts: ["5", "10", "20"].map((v) => ({ v, l: `${v} patients`, rec: v === "10", f: v })), fill: ["Ask up to ", { k: "perOpening" }, " patients about each opening."] },
    durations: { k: "durations", type: "many", label: "Visit lengths she can move", q: "Which visit lengths can she move?", why: "She only moves a visit that fits the opening.",
      opts: ["30", "45", "60", "90"].map((v) => ({ v, l: `${v} minutes`, f: `${v} min` })), fill: ["Move visits that are ", { k: "durations" }, " long."] },
    fillProviders: { k: "fillProviders", type: "one", label: "Openings to fill", q: "Whose openings should she fill?", why: "Most offices fill every provider's openings.",
      opts: [{ v: "all", l: "Every provider", rec: true, f: "every provider" }, { v: "hyg", l: "Only hygienists", f: "only hygienists" }, { v: "dr", l: "Only dentists", f: "only dentists" }], fill: ["Fill openings for ", { k: "fillProviders" }, "."] },
    confirmSkip: skip("confirmSkip", "when confirming"),
    fillSkip: skip("fillSkip", "when filling openings"),
    model: { k: "model", type: "one", label: "AI model", q: "Which AI should she use?", why: "The standard one suits almost every office.", opts: MODEL_OPTS, fill: ["Use ", { k: "model" }, " for her texts and calls."] }
  };
}
const stepsOf = (S) => (S.agent === "steph" ? stephSteps(S) : leenaSteps(S));
const moreOf = (S) => (S.agent === "steph" ? stephMore() : leenaMore());

/* What a person still has to fix, by step. Nothing is blocked: each shows as an orange mark with a way to fix it. */
function problems(S) {
  const a = S.a, p = {};
  if (S.agent === "steph") {
    if (!a.groups.length) p[0] = "Pick who to contact";
    if (a.skipIns === "some" && !a.skipPlans.length) p[2] = "Pick the plans to skip";
  } else {
    if (!a.tasks.length) p[0] = "Pick at least one job";
    if (a.tasks.includes("confirm") && a.confirmWhich === "some" && !a.confirmProviders.length && !a.confirmTypes.length) p[1] = "Pick providers or visit types";
  }
  if (S.opts.rest === "ask") {
    if (S.agent === "leena" && a.confirmSkip === "some" && !a.confirmSkipPlans.length && a.tasks.includes("confirm")) p[1] = p[1] || "Pick the plans to skip";
    if (S.agent === "leena" && a.fillSkip === "some" && !a.fillSkipPlans.length && a.tasks.includes("fill")) p[2] = p[2] || "Pick the plans to skip";
  }
  return p;
}

/* ================================================================ controls */
const nm = (S) => esc(S.a.name || AGENTS[S.agent].name);
const nameSpan = (S) => `<span data-wiz-name>${nm(S)}</span>`;
const optOf = (q, v) => (q.opts || []).find((o) => String(o.v) === String(v));
const SELECT = "block w-full appearance-none rounded-lg border border-gray-200 bg-white text-gray-800 shadow-2xs hover:border-gray-300 cursor-pointer focus:outline-hidden focus:border-blue-500 focus:ring-3 focus:ring-blue-600/15";
const selectEl = (k, opts, val, { label = "", cls = "w-full", size = "sm", words = false } = {}) => `<span class="relative inline-flex ${cls}"><select data-k="${k}" data-fk="${k}" aria-label="${esc(label)}" class="${SELECT} ${size === "sm" ? "h-8 ps-2.5 pe-8 text-[13px]" : size === "fill" ? "h-8 ps-2.5 pe-7 text-sm font-medium !text-gray-900" : "h-9 ps-3 pe-9 text-sm"}">${opts.map((o) => `<option value="${esc(o.v)}" ${String(o.v) === String(val) ? "selected" : ""}>${esc(words ? o.f || o.l : o.l)}${!words && o.rec ? " (recommended)" : ""}</option>`).join("")}</select>${I(size === "fill" ? "chevron-down" : "chevrons-up-down", "pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400")}</span>`;
const switchEl = (k, v, on, label) => `<button type="button" role="switch" aria-checked="${on}" aria-label="${esc(label)}" data-wiz-switch data-k="${k}"${v != null ? ` data-v="${esc(v)}"` : ""} data-fk="${k}:${v ?? ""}" class="${R.switchTrack}"><span class="${R.switchKnob}"></span></button>`;
const chip = (k, o, on, size = "xs") => `<button type="button" aria-pressed="${on}" data-wiz-chip data-k="${k}" data-v="${esc(o.v)}" data-fk="${k}:${o.v}" class="${cx(R.btn, R[size], on ? R.soft : R.white)}">${on ? I("check") : ""}${esc(o.f || o.l)}</button>`;
const chips = (S, r, size) => `<div class="flex flex-wrap items-center gap-1.5" role="group" aria-label="${esc(r.label)}">${r.opts.map((o) => chip(r.k, o, S.a[r.k].includes(o.v), size)).join("")}</div>`;
const reveals = (S, list) => list.map((r) => (list.length === 1 ? chips(S, r) : `<div class="flex items-start gap-3"><span class="w-20 shrink-0 pt-1 text-[13px] text-gray-500">${r.label}</span>${chips(S, r)}</div>`)).join("");
const recTag = () => `<span class="${cx(R.tag, R.tagGray)}">Recommended</span>`;

/* "choices": the sentence, one grey line why, then big rows with the answer already picked */
function choiceQ(S, q) {
  const head = `<div class="mb-2.5"><p class="text-sm font-medium text-gray-900">${q.q}</p><p class="${R.help}">${q.why}</p></div>`;
  if (q.type === "cards") return `<section>${head}<div class="grid grid-cols-2 gap-3">${q.opts.map((o) => { const on = S.a[q.k].includes(o.v);
    return `<label class="flex cursor-pointer flex-col gap-2 rounded-lg border p-4 transition-[border-color,background-color] duration-150 ${on ? "border-blue-600 bg-blue-50/40 ring-1 ring-blue-600" : "border-gray-200 bg-white hover:border-gray-300"}">
      <span class="flex items-center justify-between"><span class="flex size-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">${I(o.icon, "size-4")}</span><input type="checkbox" class="${R.checkbox}" data-k="${q.k}" data-v="${o.v}" data-fk="${q.k}:${o.v}" ${on ? "checked" : ""} /></span>
      <span class="text-sm font-semibold text-gray-900">${o.l}</span><span class="text-[13px] leading-5 text-gray-500">${o.sub}</span></label>`; }).join("")}</div></section>`;
  if (q.type === "group") return `<section>${head}<div class="${R.box} divide-y divide-gray-200/80">${q.items.map((it) => {
    const on = S.a.groups.includes(it.g);
    return on ? `<div class="flex min-h-11 items-center gap-3 px-3 py-1.5"><span class="w-36 shrink-0 text-sm text-gray-800">${it.label}</span>${selectEl(it.k, it.opts, S.a[it.k], { label: `Visit for ${it.label.toLowerCase()}` })}</div>`
      : `<div class="flex min-h-11 items-center gap-3 px-3 py-1.5"><span class="w-36 shrink-0 text-sm text-gray-400">${it.label}</span><span class="grow text-[13px] text-gray-400">Not contacting them</span>${button("Contact them too", { v: "white", s: "xs", attrs: `data-wiz-chip data-k="groups" data-v="${it.g}" data-fk="groups:${it.g}"` })}</div>`; }).join("")}</div></section>`;
  const many = q.type === "many", val = S.a[q.k];
  return `<section>${head}<div class="${R.box} divide-y divide-gray-200/80 overflow-hidden" role="${many ? "group" : "radiogroup"}" aria-label="${esc(q.q)}">${q.opts.map((o) => {
    const on = many ? val.includes(o.v) : String(val) === String(o.v);
    const input = many ? `<input type="checkbox" class="${R.checkbox}" data-k="${q.k}" data-v="${esc(o.v)}" data-fk="${q.k}:${o.v}" ${on ? "checked" : ""} />`
      : `<input type="radio" class="${R.radio}" name="${S.uid}-${q.k}" value="${esc(o.v)}" data-k="${q.k}" data-fk="${q.k}:${o.v}" ${on ? "checked" : ""} />`;
    return `<div class="${on ? "bg-blue-50/40" : ""}"><label class="flex min-h-10 cursor-pointer items-center gap-3 px-3 py-2 transition-colors duration-100 ${on ? "" : "hover:bg-gray-50"}">${input}
      <span class="min-w-0"><span class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm ${on ? "font-medium text-gray-900" : "text-gray-800"}">${o.l}${o.rec ? recTag() : ""}</span>${o.sub ? `<span class="block text-[13px] text-gray-500">${o.sub}</span>` : ""}</span>
      ${o.right ? `<span class="ms-auto shrink-0 ps-3 text-[13px] tabular-nums text-gray-500" ${q.k === "perDay" || q.k === "groups" ? "data-pulse" : ""}>${o.right}</span>` : ""}</label>
      ${on && o.reveal ? `<div class="asha-reveal space-y-2 px-3 pb-3 ps-10">${reveals(S, o.reveal)}${problemLine(S, q)}</div>` : ""}</div>`; }).join("")}</div></section>`;
}
const problemLine = (S, q) => { const p = problems(S);
  const hit = (q.k === "skipIns" && p[2]) || (q.k === "confirmWhich" && p[1]) || (q.k === "confirmSkip" && p[1]) || (q.k === "fillSkip" && p[2]);
  return hit ? `<p>${flag(hit === "Pick providers or visit types" ? "Pick at least one provider or visit type, or choose all visits." : "Pick at least one plan, or choose to contact everyone.", "!text-[13px]")}</p>` : ""; };

/* "form": the same questions as a normal settings form, labelled controls on the right */
function formRow(S, q) {
  const f = q.form || {}, a = S.a, lbl = f.q || q.q;
  /* A normal settings form: the label and its help on top, the control under it (switches sit on the right) */
  const row = (label, help, control, extra = "", inline = false) => (inline ? `<div class="flex items-center justify-between gap-6 px-4 py-3"><div class="min-w-0"><p class="${R.label}">${label}</p>${help ? `<p class="${R.help}">${help}</p>` : ""}</div><div class="shrink-0">${control}</div></div>`
    : `<div class="px-4 py-3"><p class="${R.label}">${label}</p>${help ? `<p class="${R.help}">${help}</p>` : ""}<div class="mt-2">${control}</div>${extra}</div>`);
  if (q.type === "group") return q.items.map((it) => row(`Visit for ${it.label.toLowerCase()}`, a.groups.includes(it.g) ? "" : "Not contacting them", selectEl(it.k, it.opts, a[it.k], { label: `Visit for ${it.label.toLowerCase()}`, cls: "w-64" }))).join("");
  if (q.type === "cards" || f.ctl === "switches") return q.opts.map((o) => row(o.l, o.sub, switchEl(q.k, o.v, a[q.k].includes(o.v), o.l), "", true)).join("");
  if (q.type === "many") return row(lbl, q.why, `<div class="flex flex-wrap gap-x-5 gap-y-2">${q.opts.map((o) => `<label class="inline-flex items-center gap-2 text-sm text-gray-800">${checkbox(a[q.k].includes(o.v), o.l, `data-k="${q.k}" data-v="${esc(o.v)}" data-fk="${q.k}:${o.v}"`)}${esc(o.f || o.l)}</label>`).join("")}</div>`);
  if (f.ctl === "switch") return row(lbl, q.why, switchEl(q.k, null, !!a[q.k], lbl), "", true);
  if (f.ctl === "number") return row(lbl, q.why, `<span class="inline-flex items-center gap-2"><input type="number" min="${f.min}" max="${f.max}" value="${esc(a[q.k])}" data-k="${q.k}" data-num data-fk="${q.k}" aria-label="${esc(lbl)}" class="${R.inputSm} !w-20 text-end tabular-nums" /><span class="text-[13px] text-gray-500">${f.unit}</span></span>`);
  if (f.ctl === "slider") return row(lbl, q.why, `<span class="inline-flex items-center gap-3"><input type="range" min="${f.min}" max="${f.max}" step="${f.step}" value="${esc(a[q.k])}" data-k="${q.k}" data-num data-fk="${q.k}" aria-label="${esc(lbl)}" class="w-56 accent-blue-600 cursor-pointer" /><span class="text-[13px] tabular-nums text-gray-800" data-range="${q.k}">${a[q.k]} ${f.unit}</span></span>`);
  const pick = optOf(q, a[q.k]);
  return row(lbl, q.why, selectEl(q.k, q.opts, a[q.k], { label: lbl, cls: "w-72" }), pick && pick.reveal ? `<div class="asha-reveal mt-3 space-y-2">${reveals(S, pick.reveal)}${problemLine(S, q)}</div>` : "");
}

/* "fill": each answer is a blank inside one plain sentence */
function fillSentence(S, parts, why, qs) {
  const find = (k) => qs.flatMap((q) => (q.type === "group" ? q.items.map((it) => ({ k: it.k, type: "one", opts: it.opts })) : [q])).find((q) => q.k === k);
  let tail = "";
  const html = parts.map((p) => { if (typeof p === "string") return esc(p); const q = find(p.k); if (!q) return "";
    if (q.type === "many" || q.type === "cards") return `<span class="mx-0.5 inline-flex flex-wrap gap-1 align-middle">${q.opts.map((o) => chip(q.k, o, S.a[q.k].includes(o.v), "sm")).join("")}</span>`;
    const pick = optOf(q, S.a[q.k]); if (pick && pick.reveal) tail = `<div class="asha-reveal mt-1 space-y-2">${reveals(S, pick.reveal)}${problemLine(S, q)}</div>`;
    return `<span class="mx-0.5 inline-flex align-middle">${selectEl(q.k, q.opts, S.a[q.k], { label: q.q || q.k, cls: "", size: "fill", words: true })}</span>`; }).join("");
  return `<div><p class="text-[15px] leading-10 text-gray-800">${html}</p>${why ? `<p class="${R.help}">${why}</p>` : ""}${tail}</div>`;
}

/* One step's questions in the chosen way of asking */
function questions(S, i) {
  const st = stepsOf(S)[i], ask = S.opts.ask, extras = S.opts.rest === "ask" ? st.extras : [];
  if (ask === "form") { const qs = st.qs.concat(extras); return qs.length ? `<div class="${R.box} divide-y divide-gray-200/80">${qs.map((q) => formRow(S, q)).join("")}</div>` : ""; }
  if (ask === "fill") return `<div class="space-y-5">${(st.fill || []).map(([parts, why]) => fillSentence(S, parts, why, st.qs)).join("")}${extras.map((q) => fillSentence(S, q.fill, q.why, [q])).join("")}</div>`;
  return `<div class="space-y-7">${st.qs.concat(extras).map((q) => choiceQ(S, q)).join("")}</div>`;
}

/* ================================================================ the plain-English summary of what will happen */
function summary(S) {
  const a = S.a, n = nameSpan(S), p = problems(S);
  if (S.agent === "steph") {
    const total = stephTotal(a), gs = GROUPS.filter((g) => a.groups.includes(g.v)).map((g) => g.short);
    const plans = PLANS.filter(([v]) => a.skipPlans.includes(v)).map(([, l]) => l);
    return [
      { icon: "clock", step: 2, text: `Starting tomorrow at 8 AM, ${n} texts up to <b>${a.perDay} patients a day</b>.` },
      p[0] ? { icon: "users", step: 0, needs: true, text: "She has no one to contact yet. Pick who she should contact." }
        : { icon: "users", step: 0, text: `She contacts ${listWords(gs)} <b>${before(a.early)}</b>. That's <b data-pulse>${total} patients</b> right now.` },
      { icon: "calendar", step: 1, text: `She books ${visitWords(a)} with <b>${a.sameHyg ? "the same hygienist as last time" : "any hygienist who's free"}</b>, ${+a.soonest <= 1 ? "as soon as the next day" : `${a.soonest} or more days out`}.` },
      p[2] ? { icon: "shield", step: 2, needs: true, text: "Pick which insurance plans she should skip, or let her contact everyone." }
        : { icon: "shield", step: 2, text: a.skipIns === "some" ? `She skips patients on ${listWords(plans)}.` : "She contacts everyone, whatever their insurance." },
      { icon: "message-circle", step: null, text: "If someone doesn't reply, she texts again the next day, then calls." }
    ];
  }
  const conf = a.tasks.includes("confirm"), fill = a.tasks.includes("fill"), rows = [];
  const only = [...PROVIDERS.filter((x) => a.confirmProviders.includes(x.v)).map((x) => x.short), ...VISIT_TYPES.filter((x) => a.confirmTypes.includes(x.v)).map((x) => x.l.toLowerCase())];
  if (!conf && !fill) rows.push({ icon: "circle-alert", step: 0, needs: true, text: `${n} has nothing to do yet. Pick at least one job for her.` });
  rows.push(conf ? (p[1] ? { icon: "calendar-check", step: 1, needs: true, text: "Pick which providers or visit types she should confirm." }
    : { icon: "calendar-check", step: 1, text: `Every morning at 8 AM, ${n} texts patients <b>${ahead(a.confirmWhen)} before their visit</b> to confirm it${a.confirmWhich === "all" ? "" : `. Only ${listWords(only)}`}.` })
    : { icon: "calendar-check", step: 0, off: true, text: `${n} won't confirm visits.` });
  rows.push(fill ? { icon: "calendar-plus", step: 2, text: `When a time opens up in <b>the ${windowWords(a.fillWindow)}</b>, she texts <b>${a.atOnce} ${+a.atOnce === 1 ? "patient" : "patients"} at a time</b> who are booked in the next ${+a.fillWho === 30 ? "month" : +a.fillWho === 60 ? "2 months" : `${a.fillWho} days`}. The first to say yes gets it.` }
    : { icon: "calendar-plus", step: 0, off: true, text: "She won't fill last-minute openings." });
  return rows;
}
const summaryBox = (S, rows, { change = true } = {}) => `<div class="${R.box} divide-y divide-gray-200/80">${rows.map((r) => `<div class="flex items-start gap-3 px-4 py-3">${I(r.needs ? "circle-alert" : r.icon, `size-4 mt-0.5 shrink-0 ${r.needs ? "text-orange-500" : "text-gray-400"}`)}
  <p class="min-w-0 grow text-sm leading-6 ${r.needs ? "text-gray-600" : r.off ? "text-gray-500" : "text-gray-800"} [&_b]:font-semibold [&_b]:text-gray-900">${r.text}</p>
  ${change && r.step != null ? button(r.needs ? "Fix" : r.off ? "Turn it on" : "Change", { v: r.needs || r.off ? "white" : "quiet", s: "xs", cls: "-me-1 shrink-0", attrs: r.off ? `data-wiz-task="${r.icon === "calendar-check" ? "confirm" : "fill"}"` : `data-wiz-go="${r.step}"` }) : ""}</div>`).join("")}</div>`;

/* ================================================================ preview: the text the patient gets, and who's first */
function phone(msgs, stamp) {
  return `<div class="relative h-[268px] overflow-hidden"><div class="mx-auto w-[252px] rounded-t-[34px] border border-b-0 border-gray-200/80 bg-white px-2 pt-2 shadow-2xs">
    <div class="h-[300px] rounded-t-[27px] bg-gray-50">
      <div class="relative flex items-center justify-between px-5 pt-2 text-[10px] font-semibold text-gray-800"><span>9:41</span><span class="absolute left-1/2 top-1.5 h-4 w-16 -translate-x-1/2 rounded-full bg-gray-900"></span><span class="flex items-center gap-1">${I("signal", "size-3")}${I("wifi", "size-3")}${I("battery-full", "size-3.5")}</span></div>
      <div class="mt-2 flex flex-col items-center border-b border-gray-200/80 bg-white pb-1.5">${avatar(OFFICE, { size: 7 })}<p class="mt-0.5 text-[10px] font-medium text-gray-800">${OFFICE}</p></div>
      <div class="space-y-1.5 px-2.5 pt-2" data-pulse-text><p class="text-center text-[10px] text-gray-400">Text message · ${stamp}</p>
        ${msgs.map(([dir, t]) => dir === "in" ? `<div class="max-w-[94%] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-[12px] leading-[17px] text-gray-800 ring-1 ring-gray-200/80">${t}</div>`
          : `<div class="ms-auto w-fit rounded-2xl rounded-br-md bg-blue-600 px-3 py-1.5 text-[12px] text-white">${t}</div>`).join("")}</div></div></div>
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-gray-50 to-transparent"></div></div>`;
}
/* A small preview list is the library's Grid in its "panel" look (compact rows, small grey headers). rows: arrays of
 * cell HTML, or { label } for a grey group line; widths: px per column, 0 for the one that takes the rest. */
const miniTable = (heads, rows, widths) => sheetTable({ sheet: false, title: heads.map(([h]) => h).join(", "),
  columns: heads.map(([h, end], i) => ({ key: `c${i}`, label: h, w: widths[i] || 96, grow: !widths[i], num: !!end, render: (r) => r.cells[i] })),
  /* a row array may carry .peek: the rest of that patient's details, shown in a card beside the preview on hover */
  ...(rows.some((r) => r.peek) ? { peek: (r) => r.peek || "" } : {}),
  rows: rows.map((r, i) => ({ id: `r${i}`, peek: r.peek, cells: r.label ? [`<span class="text-xs font-medium text-gray-500">${r.label}</span>`, ...heads.slice(1).map((_, j) => (j === heads.length - 2 && r.right ? `<span class="text-xs text-gray-500">${r.right}</span>` : ""))] : r })) });
const cap = (t) => `<p class="mb-2 text-xs font-medium text-gray-500">${t}</p>`;

function previewParts(S) {
  const a = S.a, name = nm(S);
  if (S.agent === "steph") {
    const pool = stephPool(a), total = stephTotal(a), p = pool[0];
    if (!p) return { phone: `<div class="flex h-[200px] flex-col items-center justify-center gap-2 px-6 text-center">${I("users", "size-5 text-gray-400")}<p class="text-[13px] text-gray-500">Pick who to contact to see the first text she'd send.</p></div>`, list: "" };
    const first = p.name.split(" ")[0], s = svc(a[`visit_${p.g}`]) || svcOpts(p.g)[0], [d1, d2] = offerDays(a.soonest);
    const lead = a.doctor ? `${esc(a.doctor)} would like to see you for your ${s.say}.` : `You're due for your ${s.say}.`;
    const text = `Hi ${esc(first)}, it's ${name} from ${OFFICE}. ${lead} I can book you${a.sameHyg ? ` with ${p.hyg}, who you saw last time,` : ""} on ${fmtDay(d1)} at 9:00 AM or ${fmtDay(d2)} at 3:30 PM. Which works for you?`;
    const rows = pool.slice(0, 5).map((x) => Object.assign([esc(x.name), GROUPS.find((g) => g.v === x.g).say, fmtDate(x.due)],
      { peek: peekCard(esc(x.name), [["Due", fmtDate(x.due)], ["Insurance", x.payer ? PLANS.find(([v]) => v === x.payer)[1] : "None on file"], ["Hygienist", x.hyg]], a.sameHyg ? `She'd offer times with ${x.hyg}.` : "") }));
    return {
      who: first,
      phone: phone([["in", text]], "Tomorrow, 8:00 AM"),
      list: `${cap("Who she'd contact first")}<div${chg4("Point at a patient in the preview to see their insurance and the hygienist they saw last, in a card beside it; the list keeps who, which group and when they're due")}>${miniTable([["Patient"], ["Group"], ["Due", true]], rows, [0, 76, 72])}</div>
        <p class="mt-2.5 text-[13px] leading-5 text-gray-600 [&_b]:font-semibold [&_b]:text-gray-900" data-pulse><b>${total}</b> patients are due. She'll contact <b>${Math.min(a.perDay, total)}</b> tomorrow and everyone in ${weeks(Math.ceil(total / Math.max(1, a.perDay)))}.</p>`
    };
  }
  const conf = a.tasks.includes("confirm"), fill = a.tasks.includes("fill");
  const showFill = fill && (S.step === 2 || !conf) && !(S.opts.shape === "page" && S.open !== 2 && conf);
  if (!conf && !fill) return { phone: `<div class="flex h-[200px] flex-col items-center justify-center gap-2 px-6 text-center">${I("calendar-x-2", "size-5 text-gray-400")}<p class="text-[13px] text-gray-500">${name} has nothing to do yet. Pick at least one job to see her texts.</p></div>`, list: "" };
  if (showFill) {
    const p = MOVE_UP[0], n = +a.atOnce;
    const text = `Hi ${p.name.split(" ")[0]}, it's ${name} from ${OFFICE}. A time just opened with Sofia on Mon, Sep 28 at 2:00 PM. You're booked for ${fmtDate(p.booked)} now. Would you like the earlier time? Reply YES and it's yours.`;
    const pool = MOVE_UP.filter((x) => isoDays(x.booked) <= +a.fillWho).slice(0, 5);
    const count = (k) => `${k} ${k === 1 ? "patient" : "patients"}`;
    const rows = [{ label: "Texted at once", right: count(Math.min(n, pool.length)) }, ...pool.slice(0, n).map((x) => [esc(x.name), fmtDate(x.booked)]),
      ...(pool.length > n ? [{ label: "If no one says yes", right: count(pool.length - n) }, ...pool.slice(n).map((x) => [`<span class="text-gray-600">${esc(x.name)}</span>`, fmtDate(x.booked)])] : [])];
    return { who: p.name.split(" ")[0], phone: phone([["in", text]], "Today, 9:14 AM"),
      list: `${cap("Who she'd text about Mon, Sep 28, 2:00 PM")}<div${chg4("Each group line says how many patients are in it where the date would go, so the Booked now column has a value on every line")}>${miniTable([["Patient"], ["Booked now", true]], rows, [0, 96])}</div>
        <p class="mt-2.5 text-[13px] leading-5 text-gray-600" data-pulse>A 60-minute opening with Sofia. The first to say yes gets it.</p>` };
  }
  const send = new Date(Date.UTC(2026, 9, 2) - (+a.confirmWhen || 0) * DAY), v = CONFIRM_VISITS[0];
  const pick = CONFIRM_VISITS.filter((x) => a.confirmWhich === "all" || (!a.confirmProviders.length || a.confirmProviders.includes(x.p)) && (!a.confirmTypes.length || a.confirmTypes.includes(x.type)));
  const f = pick[0] || v, prov = PROVIDERS.find((x) => x.v === f.p);
  const text = `Hi ${f.name.split(" ")[0]}, it's ${name} from ${OFFICE}. Can you still make your visit with ${prov.short} on Fri, Oct 2 at ${f.t}? Reply YES to confirm, or tell me if you need a new time.`;
  return { who: f.name.split(" ")[0], phone: phone([["in", text], ["out", "YES"]], `${fmtDay(send)}, 8:00 AM`),
    list: `${cap("Visits she'd confirm on Fri, Oct 2")}<div${chg4("Point at a visit in the preview to see what kind of visit it is and the provider's full name, in a card beside it")}>${miniTable([["Patient"], ["Time"], ["With"]], pick.slice(0, 5).map((x) => Object.assign([esc(x.name), `<span class="tabular-nums">${x.t}</span>`, PROVIDERS.find((y) => y.v === x.p).short],
      { peek: peekCard(esc(x.name), [["Visit", VISIT_TYPES.find((y) => y.v === x.type).l.replace(/s$/, "")], ["When", `Fri, Oct 2 · ${x.t}`], ["With", PROVIDERS.find((y) => y.v === x.p).l]]) })), [0, 86, 80])}</div>
      <p class="mt-2.5 text-[13px] leading-5 text-gray-600 [&_b]:font-semibold [&_b]:text-gray-900" data-pulse>She texts them on <b>${fmtDay(send)}</b>, ${ahead(a.confirmWhen)} before.${pick.length > 5 ? ` ${pick.length - 5} more that day.` : ""}</p>` };
}
/* No phone mock-up (owner, 2026-10-01): the preview is who she'd contact and what happens; an empty-state note still shows */
const noPhone = (p) => (p.phone && !p.phone.includes("9:41") ? p.phone : "");
const previewHtml = (S) => { const p = previewParts(S); return `<div class="space-y-5 px-5 py-5"${chg4("No phone mock-up: the preview shows who she'd contact first and how long it takes to reach everyone.")}>${noPhone(p) ? `<div>${noPhone(p)}</div>` : ""}${p.list ? `<div>${p.list}</div>` : ""}</div>`; };

/* ================================================================ the last step: check, name and voice, notes, the rest */
function lastStep(S) {
  const a = S.a, rest = S.opts.rest, more = moreOf(S), keys = Object.keys(more);
  const fieldRows = keys.map((k) => { const q = more[k], v = a[k];
    if (q.type === "many") return { k, label: q.label, value: k === "codes" ? v.join(", ") : `${listWords(v)} min`, type: "none" };
    if (q.k.endsWith("Skip")) return { k, label: q.label, value: v === "some" ? listWords(PLANS.filter(([x]) => a[`${k}Plans`].includes(x)).map(([, l]) => l)) || "None" : "None", type: "select", options: ["None", ...PLANS.map(([, l]) => l)] };
    const o = optOf(q, v); return { k, label: q.label, value: o ? o.l : "", type: "select", options: q.opts.map((x) => x.l) }; });
  const restHtml = rest === "more" ? `<section><button type="button" data-wiz-more aria-expanded="${!!S.moreOpen}" class="group -mx-2 flex w-[calc(100%+1rem)] items-center gap-2 rounded-lg px-2 py-1.5 text-start cursor-pointer hover:bg-gray-50">
      ${I("chevron-right", `size-4 shrink-0 text-gray-400 motion-safe:transition-transform ${S.moreOpen ? "rotate-90" : ""}`)}<span class="shrink-0 text-sm font-semibold text-gray-800">More settings</span><span class="truncate text-[13px] text-gray-500">${keys.length} settings, already set for you</span></button>
      ${S.moreOpen ? `<div class="asha-reveal mt-2">${fieldTable(fieldRows, { labelW: 176, onCommit: (r, key, val) => { const q = more[r.k]; if (q.k.endsWith("Skip")) { const pl = PLANS.find(([, l]) => l === val); a[r.k] = pl ? "some" : "none"; a[`${r.k}Plans`] = pl ? [pl[0]] : []; } else { const o = q.opts.find((x) => x.l === val); if (o) a[r.k] = o.v; } S.redraw && S.redraw({ main: false }); } })}</div>` : ""}</section>`
    : rest === "later" ? `<p class="flex items-center gap-2 text-[13px] text-gray-500">${I("settings-2", "size-4 text-gray-400")}Change anything else later in ${nameSpan(S)}'s settings.</p>` : "";
  const extras = rest === "ask" ? questions(S, 3) : "";
  const body = `<div class="space-y-7">
    <section><h3 class="${R.groupTitle} mb-2">Here's what will happen</h3>${summaryBox(S, summary(S))}</section>
    <section><h3 class="${R.groupTitle} mb-2">Her name and voice</h3><div class="flex flex-wrap items-center gap-2">
      <input class="${R.input} !w-36" value="${nm(S)}" data-k="name" data-text data-fk="name" aria-label="Her name" />
      ${selectEl("voice", VOICES, a.voice, { label: "Her voice", cls: "w-44", size: "md" })}
      ${button("Listen", { v: "white", s: "md", icon: "play", attrs: 'data-wiz-listen aria-label="Listen to her voice"' })}</div>
      <p class="${R.help} mt-1.5">Patients see her name in texts and hear this voice on calls.</p></section>
    <section><h3 class="${R.groupTitle}">Anything she should know?</h3><p class="${R.help} mb-2">She reads this before every text and call.</p>
      <textarea class="${R.textarea} !min-h-16" rows="2" data-k="context" data-text data-fk="context" aria-label="Anything she should know" placeholder="${S.agent === "steph" ? "For example: We're closed on Fridays. Dr. Patel's patients like morning visits." : "For example: Never move a visit by more than two weeks. We open at 7 AM on Tuesdays."}">${esc(a.context)}</textarea></section>
    ${extras ? `<section><h3 class="${R.groupTitle} mb-2">One more thing</h3>${extras}</section>` : ""}
    ${restHtml}</div>`;
  if (S.opts.preview === "end" && S.opts.shape === "steps") return `<div class="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-7">${body}<aside class="sticky top-0" aria-label="Preview">${previewInline(S)}</aside></div>`;
  return body;
}
const previewInline = (S, two = false) => { const p = previewParts(S); return `<div class="space-y-5 rounded-lg bg-gray-50 px-4 py-4" data-wiz-preview-inline="${two ? 2 : 1}">${noPhone(p) ? `<div>${noPhone(p)}</div>` : ""}${p.list ? `<div>${p.list}</div>` : ""}</div>`; };

/* A step that's turned off stays in the list: say so plainly, with one click to turn it on */
const offPanel = (S, st) => `<div class="flex flex-col items-center justify-center gap-1 px-6 py-16 text-center">
  <span class="mb-2 flex size-10 items-center justify-center rounded-lg bg-gray-100 text-gray-500">${I("circle-pause", "size-5")}</span>
  <p class="text-sm font-semibold text-gray-800">${nameSpan(S)} won't ${st.offWhat}</p><p class="${R.help} max-w-sm">${st.offWhy}</p>
  <div class="mt-3">${button("Turn it on", { v: "white", s: "sm", attrs: `data-wiz-task="${st.off}"` })}</div></div>`;

/* ================================================================ frame: header, steps, main, preview, footer */
function navHtml(S) {
  const st = stepsOf(S), p = problems(S);
  return `<nav class="flex flex-col gap-0.5 p-3" aria-label="Setup steps">${st.map((s, i) => {
    const on = i === S.step, prob = p[i], done = !on && S.seen.has(i) && !prob && !s.off;
    const mark = done ? `<span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">${I("check", "size-3")}</span>`
      : `<span class="flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums ${on ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}">${i + 1}</span>`;
    return `<div class="rounded-lg ${on ? "bg-gray-100" : "hover:bg-gray-50"}"><button type="button" data-wiz-step="${i}" class="flex w-full cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-start focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-blue-600/20" ${on ? 'aria-current="step"' : ""}>${mark}
      <span class="min-w-0"><span class="block text-sm leading-5 ${on ? "font-medium text-gray-900" : s.off ? "text-gray-500" : "text-gray-700"}">${s.name}</span><span class="block text-xs leading-[18px] text-gray-500">${s.nav}</span></span></button>
      ${s.off ? `<div class="ps-10 pb-2">${button("Turn it on", { v: "white", s: "xs", attrs: `data-wiz-task="${s.off}"` })}</div>` : ""}</div>`; }).join("")}</nav>`;
}
function mainHtml(S) {
  if (S.opts.shape === "page") return pageMain(S);
  const st = stepsOf(S)[S.step];
  /* a problem the step's questions don't already point at (nothing picked yet) shows at the top of its body */
  const prob = !st.off && !st.review && S.step === 0 && problems(S)[0];
  const inner = `${prob ? `<p class="mb-4"${chg4("The stepper never shows an alert icon: what's missing is said inside the step, as an orange icon and grey text")}>${flag(`${prob}.`, "!text-[13px]")}</p>` : ""}${st.off ? offPanel(S, st) : st.review ? lastStep(S) : questions(S, S.step)}`;
  const wide = S.opts.preview !== "side";
  return `<div class="px-7 py-6 ${wide && !(st.review && S.opts.preview === "end") ? "max-w-[640px]" : ""}" data-wiz-body>${inner}</div>`;
}
function pageMain(S) {
  const st = stepsOf(S), sum = summary(S), p = problems(S);
  /* Without the preview column the page is wide: keep lines of text and fields at a readable width; dividers stay full width */
  const narrow = S.opts.preview === "side" ? "" : "[&>*]:max-w-[720px]";
  const secs = st.slice(0, 3).map((s, i) => { const open = S.open === i;
    const act = open ? button("Done", { v: "white", s: "xs", attrs: 'data-wiz-edit=""' }) : s.off ? button("Turn it on", { v: "white", s: "xs", attrs: `data-wiz-task="${s.off}"` }) : button(p[i] ? "Fix" : "Change", { v: "white", s: "xs", attrs: `data-wiz-edit="${i}"` });
    const lines = sum.filter((r) => r.step === i && !r.off);
    const closed = s.off ? `<p class="text-sm text-gray-500">${nameSpan(S)} won't ${s.offWhat}.</p>`
      : S.agent === "leena" && i === 0 ? `<p class="text-sm text-gray-800">${p[0] ? flag("Pick at least one job for her.") : `${nameSpan(S)} ${listWords(st[0].qs[0].opts.filter((o) => S.a.tasks.includes(o.v)).map((o) => o.does))}.`}</p>`
      : `<div class="space-y-1.5">${lines.map((r) => `<p class="flex items-start gap-2.5 text-sm leading-6 ${r.needs ? "text-gray-600" : "text-gray-800"} [&_b]:font-semibold [&_b]:text-gray-900">${I(r.needs ? "circle-alert" : r.icon, `size-4 mt-1 shrink-0 ${r.needs ? "text-orange-500" : "text-gray-400"}`)}<span>${r.text}</span></p>`).join("")}</div>`;
    return `<section class="border-t border-gray-200/80 px-7 py-5 first:border-t-0 ${open ? "bg-gray-50/40" : ""} ${narrow}" data-wiz-sec="${i}"><div class="mb-2.5 flex min-h-7 items-center justify-between gap-3"><h3 class="flex items-center gap-2 ${R.groupTitle}">${p[i] ? I("circle-alert", "size-4 text-orange-500") : ""}${s.name}</h3>${act}</div>
      ${open ? `<div class="asha-reveal">${questions(S, i)}</div>` : closed}</section>`; }).join("");
  const last = stepsOf(S)[3];
  return `<div data-wiz-body>${secs}<section class="border-t border-gray-200/80 px-7 py-5 ${narrow}"><div class="space-y-7">${lastStepPage(S, last)}</div></section>
    ${S.opts.preview === "end" ? `<section class="border-t border-gray-200/80 px-7 py-5"><h3 class="${R.groupTitle} mb-3">What patients will get</h3>${previewInline(S, true)}</section>` : ""}</div>`;
}
/* The page shape's last section is the last step without its summary (each section already says what will happen) */
const lastStepPage = (S) => lastStep(Object.assign(Object.create(S), { opts: Object.assign({}, S.opts, { preview: "none" }) })).replace(/<section><h3[^>]*>Here's what will happen<\/h3>[\s\S]*?<\/section>/, "");

function footHtml(S) {
  const st = stepsOf(S), last = S.opts.shape === "page" || S.step === st.length - 1, p = problems(S), firstProb = Object.keys(p)[0];
  if (S.on) return `${statusDot(`${nm(S)} is on. She starts tomorrow at 8 AM.`, "on")}<span class="grow"></span>${button("Done", { v: "solid", s: "md" })}`;
  if (S.saved) return `${statusDot(`Saved. ${nm(S)} stays off until you turn her on.`, "off")}<span class="grow"></span>${button(`<span>Turn on ${nameSpan(S)}</span>`, { v: "solid", s: "md", attrs: "data-wiz-on" })}`;
  const fix = firstProb != null ? `<button type="button" data-wiz-fix="${firstProb}" class="inline-flex items-center gap-1.5 rounded-md px-1.5 h-7 text-[13px] text-gray-500 hover:bg-gray-100 hover:text-gray-700 cursor-pointer">${I("circle-alert", "size-4 text-orange-500")}${p[firstProb]}</button>` : "";
  const back = S.opts.shape === "steps" && S.step > 0 ? button("Back", { v: "white", s: "md", attrs: `data-wiz-go="${S.step - 1}"` }) : "";
  return `${back}${fix}<span class="grow"></span>${last ? `${button("Save and turn on later", { v: "white", s: "md", attrs: "data-wiz-later" })}${button(`<span>Turn on ${nameSpan(S)}</span>`, { v: "solid", s: "md", attrs: "data-wiz-on" })}`
    : button("Continue", { v: "solid", s: "md", attrs: `data-wiz-go="${S.step + 1}"` })}`;
}
function regions(S) {
  const side = S.opts.preview === "side";
  return `${S.opts.shape === "steps" ? `<div class="w-[216px] shrink-0 overflow-y-auto border-e border-gray-200/80" data-wiz-nav>${navHtml(S)}</div>` : ""}
    <div class="min-w-0 grow overflow-y-auto" data-wiz-main>${mainHtml(S)}</div>
    ${side ? `<aside class="w-[312px] shrink-0 overflow-y-auto border-s border-gray-200/80 bg-gray-50" data-wiz-preview aria-label="Preview">${previewHtml(S)}</aside>` : ""}`;
}
/* The page behind the dialog: AI Staff, faded */
const behind = () => `<div class="absolute inset-0 overflow-hidden" aria-hidden="true" inert data-scroll-ok><div class="w-[1096px] opacity-45 pointer-events-none">
  ${workspaceHeader({ title: "AI Staff", actions: button("Hire more", { v: "solid", s: "sm", icon: "user-plus" }) })}
  <div class="px-4">${[["AI Receptionist", "Answers calls and texts, books and confirms visits.", "Active"], ["AI Hygiene Recall", "Texts and calls patients due for a cleaning.", "Needs setup"], ["AI Schedule Optimizer", "Confirms visits and fills cancellations.", "Needs setup"], ["AI Insurance Verification", "Checks benefits 3 days before each visit.", "Active"], ["AI Patient Intake", "Sends new patients their forms, then follows up.", "Active"], ["AI Patient Billing", "Sends statements and payment links.", "Not active"], ["AI Case Acceptance", "Follows up on treatment that isn't scheduled.", "Not active"], ["AI Collections", "Reminds patients about balances over 30 days.", "Not active"]]
    .map(([n, d, s]) => `<div class="flex h-11 items-center gap-3 border-b border-gray-200/80 text-sm"><span class="size-5 rounded-md bg-gray-100"></span><span class="w-56 font-medium text-gray-800">${n}</span><span class="grow text-gray-600">${d}</span><span class="w-32 text-gray-500">${s}</span></div>`).join("")}</div></div>
  <div class="absolute inset-0 bg-gray-900/25"></div></div>`;

function frame(S) {
  const A = AGENTS[S.agent];
  return `<div class="relative h-[768px] overflow-hidden" data-wiz-uid="${S.uid}">${behind()}
    <div class="${R.dialog.replace(/w-\[\d+px\]/, "")} absolute left-1/2 top-6 flex h-[720px] w-[calc(100%-48px)] max-w-[1100px] -translate-x-1/2 flex-col overflow-hidden" role="dialog" aria-modal="true" aria-label="Set up ${esc(A.name)}"${chg4("This is the new plain-language setup wizard: four short steps you can open in any order, every answer already picked with the recommended one marked, and a live preview of the first text a patient would get")}>
      ${recordHeader({ lead: avatar(A.name, { size: 9 }), title: `Set up ${nameSpan(S)}`, sub: A.does, end: iconButton("x", "Close", { s: "iconSm" }) })}
      <div class="flex min-h-0 grow" data-wiz-regions>${regions(S)}</div>
      <footer class="flex items-center gap-2 border-t border-gray-200/80 px-5 py-3" data-wiz-foot>${footHtml(S)}</footer></div></div>`;
}

/* ================================================================ state, rendering and wiring */
const STATE_START = {
  "Stephanie · Who to contact": ["steph", 0], "Stephanie · Check and turn on": ["steph", 3],
  "Leena · What Leena does": ["leena", 0], "Leena · Filling openings": ["leena", 2], "Leena · Check and turn on": ["leena", 3]
};
function makeState(label) {
  const [agent, step] = STATE_START[label] || STATE_START["Stephanie · Who to contact"];
  const S = { uid: `wiz${++SEQ}`, agent, step, a: START[agent](), seen: new Set(Array.from({ length: step + 1 }, (_, i) => i)), opts: wizOpts(), open: step < 3 ? step : null, moreOpen: false, on: false };
  STORE.set(S.uid, S); return S;
}
function mount(el) {
  const root = el.querySelector("[data-wiz-uid]"); if (!root) return; const S = STORE.get(root.dataset.wizUid); if (!S) return;
  const q = (sel) => root.querySelector(sel);
  const pulses = () => [...root.querySelectorAll("[data-pulse]")].map((n) => n.textContent);
  /* Redraw what changed; keep scroll and focus; glow a preview number that changed */
  S.redraw = ({ main = true, nav = true, step = false } = {}) => {
    const before = pulses(), fk = document.activeElement && root.contains(document.activeElement) ? document.activeElement.dataset.fk : null;
    const m = q("[data-wiz-main]"), top = m ? m.scrollTop : 0;
    if (main && nav) { q("[data-wiz-regions]").innerHTML = regions(S); }
    else { const pv = q("[data-wiz-preview]"); if (pv) pv.innerHTML = previewHtml(S); const pi = q("[data-wiz-preview-inline]"); if (pi) pi.outerHTML = previewInline(S, pi.dataset.wizPreviewInline === "2"); if (nav && q("[data-wiz-nav]")) q("[data-wiz-nav]").innerHTML = navHtml(S); }
    q("[data-wiz-foot]").innerHTML = footHtml(S); icons();
    const m2 = q("[data-wiz-main]"); if (m2) { if (step) { m2.scrollTop = 0; Motion.play(q("[data-wiz-body]"), "asha-enter"); } else m2.scrollTop = top; }
    if (fk) { const f = [...root.querySelectorAll("[data-fk]")].find((n) => n.dataset.fk === fk); if (f) f.focus({ preventScroll: true }); }
    const after = step ? [] : [...root.querySelectorAll("[data-pulse]")]; after.forEach((n, i) => { if (before[i] != null && before[i] !== n.textContent) Motion.settle(n); });
  };
  const go = (i) => { const n = stepsOf(S).length; i = Math.max(0, Math.min(n - 1, +i));
    if (S.opts.shape === "page") { S.open = i < 3 ? i : null; return S.redraw(); }
    S.seen.add(S.step); S.step = i; S.seen.add(i); S.redraw({ step: true }); };
  const toggleIn = (k, v) => { const arr = S.a[k]; const i = arr.indexOf(v); i >= 0 ? arr.splice(i, 1) : arr.push(v); };
  const setFrom = (k, raw) => { const st = stepsOf(S), all = [...st.flatMap((s) => s.qs.concat(s.extras)), ...Object.values(moreOf(S))].flatMap((x) => (x.type === "group" ? x.items.map((it) => ({ k: it.k, opts: it.opts })) : [x]));
    const def = all.find((x) => x.k === k); const o = def && def.opts && def.opts.find((x) => String(x.v) === String(raw)); S.a[k] = o ? o.v : raw; };
  root.addEventListener("click", (e) => {
    const t = e.target.closest("[data-wiz-step],[data-wiz-go],[data-wiz-chip],[data-wiz-switch],[data-wiz-task],[data-wiz-edit],[data-wiz-fix],[data-wiz-more],[data-wiz-listen],[data-wiz-on],[data-wiz-later]");
    if (!t || !root.contains(t)) return; const d = t.dataset;
    if (d.wizStep != null) return go(d.wizStep);
    if (d.wizGo != null) return go(d.wizGo);
    if (d.wizFix != null) return go(d.wizFix);
    if (t.hasAttribute("data-wiz-chip")) { toggleIn(d.k, d.v); return S.redraw(); }
    if (t.hasAttribute("data-wiz-switch")) { d.v != null ? toggleIn(d.k, d.v) : (S.a[d.k] = !S.a[d.k]); return S.redraw(); }
    if (d.wizTask != null) { if (!S.a.tasks.includes(d.wizTask)) S.a.tasks.push(d.wizTask); return S.redraw(); }
    if (d.wizEdit != null) { S.open = d.wizEdit === "" ? null : +d.wizEdit; return S.redraw(); }
    if (t.hasAttribute("data-wiz-more")) { S.moreOpen = !S.moreOpen; return S.redraw(); }
    if (t.hasAttribute("data-wiz-listen")) { if (t.dataset.playing) return; t.dataset.playing = "1"; const html = t.innerHTML; t.innerHTML = `${I("volume-2")}Playing…`; icons(); setTimeout(() => { t.innerHTML = html; delete t.dataset.playing; icons(); }, 2400); return; }
    if (t.hasAttribute("data-wiz-later")) { S.saved = true; return S.redraw({ main: false }); }
    if (t.hasAttribute("data-wiz-on")) { const p = problems(S), first = Object.keys(p)[0]; if (first != null) return go(first); S.on = true; return S.redraw(); }
  });
  root.addEventListener("change", (e) => { const t = e.target; const k = t.dataset && t.dataset.k; if (!k || t.hasAttribute("data-text")) return;
    if (t.type === "checkbox") toggleIn(k, t.dataset.v); else if (t.hasAttribute("data-num")) S.a[k] = Math.max(+t.min || 0, Math.min(+t.max || 999, +t.value || 0)); else setFrom(k, t.value);
    S.redraw(); });
  root.addEventListener("input", (e) => { const t = e.target, k = t.dataset && t.dataset.k; if (!k) return;
    if (t.type === "range") { S.a[k] = +t.value; const lab = root.querySelector(`[data-range="${k}"]`); if (lab) lab.textContent = lab.textContent.replace(/^\d+/, t.value); return S.redraw({ main: false }); }
    if (!t.hasAttribute("data-text")) return; S.a[k] = t.value;
    if (k === "name") root.querySelectorAll("[data-wiz-name]").forEach((n) => (n.textContent = t.value || AGENTS[S.agent].name));
    S.redraw({ main: false, nav: false }); });
}

defineBlock({
  cat: "ai", id: "ai-agent-setup", title: "Agent setup wizard",
  note: "Setting up an AI helper in four plain steps you can open in any order. Every answer is already picked, with the recommended one marked, and the right side shows the first text a patient would get and who she'd contact first, updating as you change answers. Rarely changed settings wait under More settings.",
  where: "AI Staff › Set up an agent",
  states: Object.keys(STATE_START),
  canvas: "bare",
  html: (state) => frame(makeState(state)),
  mount: (el) => mount(el)
});
})();
}
