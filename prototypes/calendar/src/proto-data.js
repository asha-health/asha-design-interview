/* Calendar prototype: the invented events on the calendar. Everything here is made up.
 * "Today" is Friday, Sept 25, 2026, and the time is 10:40 AM.
 *
 * Each event: { id, title, detail, date ("YYYY-MM-DD"), start "9:30", end "10:15" (or dur in minutes),
 *   color: "blue" | "indigo" | "teal" | "sky" | "gray", faded, cancelled }. Add whatever else your design needs.
 * Questions for the prototype go in PROTO_DATA.questions (see .claude/skills/asha-prototype). */
(function () {
  const today = "2026-09-25";
  const week = ["2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24", "2026-09-25"];
  const events = [
    ...week.map((date, i) => ({ id: `standup-${i}`, date, start: "9:00", dur: 15, title: "Team standup", detail: "Video call", color: "blue" })),
    { id: "planning", date: "2026-09-21", start: "10:00", end: "12:00", title: "Quarterly planning", detail: "Big room", color: "indigo" },
    { id: "lunch-priya", date: "2026-09-21", start: "12:30", end: "13:30", title: "Lunch with Priya", detail: "Corner café", color: "teal" },
    { id: "design-review", date: "2026-09-22", start: "13:00", end: "14:00", title: "Design review", detail: "Room 2", color: "indigo" },
    { id: "kids", date: "2026-09-22", start: "16:00", end: "16:45", title: "Pick up the kids", color: "gray" },
    { id: "vendor", date: "2026-09-23", start: "10:00", end: "10:30", title: "Vendor call", detail: "Cancelled by them", color: "sky", cancelled: true },
    { id: "focus", date: "2026-09-23", start: "14:00", end: "16:00", title: "Focus time", color: "gray" },
    { id: "all-hands", date: "2026-09-24", start: "11:00", end: "12:00", title: "All hands", detail: "Main hall and video", color: "blue" },
    { id: "one-sam", date: "2026-09-25", start: "11:00", end: "11:30", title: "1:1 with Sam", detail: "Sam's desk", color: "sky" },
    { id: "interview", date: "2026-09-25", start: "11:00", end: "12:00", title: "Interview", detail: "Room 3", color: "blue" },
    { id: "budget", date: "2026-09-25", start: "13:30", end: "14:30", title: "Budget check-in", detail: "Room 2", color: "indigo" },
    { id: "wrap-up", date: "2026-09-25", start: "16:00", end: "16:30", title: "Weekly wrap-up", detail: "Video call", color: "teal" },
    { id: "gym", date: "2026-09-26", start: "8:00", end: "9:00", title: "Gym", color: "gray" }
  ].map((e) => ({ ...e, faded: e.faded ?? (e.date < today) }));
  window.PROTO_DATA = { today, now: "10:40", events, questions: [] };
})();
