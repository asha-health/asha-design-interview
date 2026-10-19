/* Block groups, in menu order. Each blocks/<id>.js file adds blocks with defineBlock({ cat: id, ... }). */
[
  { id: "shell", title: "App shell & navigation", icon: "panels-top-left", blurb: "The frame around every screen: the main menu, page headers, search for anything, and switching offices." },
  { id: "schedule", title: "Schedule", icon: "calendar-days", blurb: "The day by chair, appointment cards and details, finding a time, and confirming patients." },
  { id: "patients", title: "Patients", icon: "users", blurb: "Finding a patient, the chart header, family, insurance on file, and medical alerts." },
  { id: "clinical", title: "Charting & treatment", icon: "stethoscope", blurb: "The tooth chart, picking procedures, treatment plans with estimates, perio, and notes." },
  { id: "billing", title: "Billing & payments", icon: "wallet", blurb: "The ledger, balances, checkout, taking a payment, statements and payment plans." },
  { id: "claims", title: "Insurance & claims", icon: "shield-check", blurb: "The claims workbench, a claim, EOBs and posting insurance payments, eligibility and pre-auths." },
  { id: "revenue", title: "Revenue intelligence", icon: "chart-column", blurb: "Numbers across the top, A/R aging, production and collections, goals and scorecards." },
  { id: "tasks", title: "Tasks & lists", icon: "list-checks", blurb: "Work queues, a task with its checklist, information requests, recalls and call sheets." },
  { id: "comms", title: "Messages & reminders", icon: "message-square", blurb: "Texting patients, reminders, confirmations, reviews and calls." },
  { id: "forms", title: "Forms & documents", icon: "file-text", blurb: "Intake forms, signatures, filing documents to a chart, and consent." },
  { id: "settings", title: "Settings", icon: "settings", blurb: "Settings rows, lists of records, connected services, office hours and setup steps." },
  { id: "ai", title: "Asha AI", icon: "sparkles", blurb: "Copilot, suggestions you can accept or dismiss, and showing what Asha did and why." },
  { id: "states", title: "States & overlays", icon: "layers-2", blurb: "Empty, loading, error and read-only states, confirmations, side panels and pop-overs." }
].forEach(defineCategory);
