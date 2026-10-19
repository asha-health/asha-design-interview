/* Appointment flow prototype: the invented data the appointment panel, check-in and check-out need, and the scenarios
 * in the menu at the top. Everything here is made up; no real patients, payers' member IDs or cards.
 *
 * The day itself (chairs, providers, appointment cards) comes from the design-system library: SCHED.DAY and
 * DATA in docs/design-system. "Today" is Friday, Sept 25, 2026, and the time is 10:40 AM.
 *
 * PROTO_DATA.visit(appt) returns everything known about one appointment's visit:
 *   patient   { id, name, age, dob, phone, email, family, guarantor, newPatient }
 *   insurance { payer, plan, memberId, subscriber, status, verifiedAt, coverage{category: %}, deductibleLeft,
 *               annualMax, used } or null when there's none on file
 *   forms     [{ name, status: "signed" | "not-signed" | "needs-update", when }]
 *   alerts    [{ kind: "medical" | "premed" | "allergy" | "note", text }]
 *   procedures[{ code, name, tooth, fee, insEst, ptEst, status: "planned" | "completed" }]
 *   balance   { patient, family, insurancePending, family members [{ name, amount }] }
 *   cardOnFile{ brand, last4, expires, declines } or null
 *   recall    { type, due, booked }   nextVisit { what, when, provider } or null
 *   copayDue  what the patient is asked for today, before any prior balance
 * Questions for the prototype go in PROTO_DATA.questions (see .claude/skills/asha-prototype). */
(function () {
  /* Payers and contact details for the library's extra day-only patients (x1..x16) */
  const EXTRA_INFO = {
    x1: ["delta", "dprice@example.com"], x2: ["cigna", "nora.c@example.com"], x3: ["metlife", ""], x4: ["guardian", "ruby.a@example.com"],
    x5: [null, ""], x6: [null, "zoe.martin@example.com"], x7: ["cigna", "sdiaz@example.com"], x8: ["delta", "lily.chen@example.com"],
    x9: ["delta", ""], x10: ["guardian", "grace.h@example.com"], x11: ["aetna", ""], x12: ["uc", ""], x13: ["metlife", ""], x14: ["aetna", ""],
    x15: ["delta", ""], x16: ["cigna", ""]
  };
  /* Typical PPO coverage by procedure category */
  const COVER = { Diagnostic: 100, Preventive: 100, Restorative: 80, Endodontics: 80, Periodontics: 80, "Oral surgery": 80, Adjunctive: 80, Implants: 50 };
  const MAJOR = new Set(["D2740", "D6010", "D6058"]);

  function patientOf(a) {
    const p = DATA.patient(a.pt);
    if (p) return { id: p.id, name: p.name, age: p.age, dob: p.dob, phone: p.phone, email: `${p.name.split(" ")[0].toLowerCase()}@example.com`, family: p.family, guarantor: p.guarantor, newPatient: !p.lastVisit, payer: p.payer, balance: p.balance, insBalance: p.insBalance, alerts: p.alerts };
    const [payer, email] = EXTRA_INFO[a.pt] || [null, ""];
    return { id: a.pt, name: SCHED.ptName(a.pt), age: SCHED.ptAge(a.pt), dob: null, phone: "(415) 555-0100", email, family: SCHED.ptName(a.pt).split(" ").pop(), guarantor: true, newPatient: a.chips.includes("np"), payer, balance: 0, insBalance: 0, alerts: [] };
  }

  function defaultVisit(a) {
    const p = patientOf(a), payer = p.payer && DATA.payer(p.payer);
    const status = a.chips.includes("insmiss") ? "missing-details" : a.chips.includes("insrev") ? "needs-review" : a.chips.includes("pend") ? "pending" : a.chips.includes("ver") ? "verified" : "not-checked";
    const insurance = payer ? { payer: payer.name, plan: "PPO", memberId: `XQ${String(1000000 + p.name.length * 7919).slice(0, 7)}`, subscriber: "Self", status,
      verifiedAt: status === "verified" ? "Sep 22" : null, coverage: COVER, deductibleLeft: 0, annualMax: 1500, used: 320 } : null;
    const procedures = a.codes.map((code, i) => { const pr = DATA.proc(code) || { name: code, fee: 0, cat: "Adjunctive" };
      const pct = !insurance ? 0 : MAJOR.has(code) ? 50 : COVER[pr.cat] ?? 80, insEst = Math.round(pr.fee * pct) / 100;
      return { code, name: pr.name, tooth: (a.what.match(/#\d+/) || [""])[0], fee: pr.fee, insEst, ptEst: pr.fee - insEst, status: a.st === "done" ? "completed" : "planned" }; });
    const alerts = [...(p.alerts || []).map((t) => ({ kind: /allerg/i.test(t) ? "allergy" : /premed/i.test(t) ? "premed" : "medical", text: t })),
      ...(a.note && !(p.alerts || []).includes(a.note) ? [{ kind: a.chips.includes("premed") ? "premed" : "note", text: a.note }] : [])];
    const forms = a.chips.includes("forms") ? [{ name: "Medical history", status: "needs-update", when: "Sep 2025" }, { name: "Consent for treatment", status: "not-signed", when: "" }]
      : [{ name: "Medical history", status: "signed", when: "Mar 12" }, { name: "Privacy notice", status: "signed", when: "Mar 12" }];
    return {
      patient: p, insurance, forms, alerts, procedures,
      balance: { patient: p.balance, family: p.balance, insurancePending: p.insBalance, members: [] },
      cardOnFile: p.balance > 0 || a.chips.includes("bal") ? { brand: "Visa", last4: "4242", expires: "04/28", declines: false } : null,
      recall: { type: "Cleaning and exam", due: "Mar 25, 2027", booked: false }, nextVisit: null,
      copayDue: procedures.reduce((s, x) => s + x.ptEst, 0)
    };
  }

  /* Hand-written visits for the scenario patients; anything left out falls back to defaultVisit */
  const VISITS = {
    a17: (v) => ({ ...v, // Olivia Nguyen, deep cleaning UR and LR
      alerts: [{ kind: "premed", text: "Premedicate: amoxicillin 2 g, 1 hour before. Ask if it was taken." }, { kind: "allergy", text: "Latex allergy: use nitrile gloves" }],
      forms: [{ name: "Medical history", status: "needs-update", when: "Aug 2025" }, { name: "Consent for deep cleaning", status: "not-signed", when: "" }, { name: "Privacy notice", status: "signed", when: "Aug 14" }],
      balance: { patient: 740, family: 740, insurancePending: 318, members: [] },
      cardOnFile: { brand: "Visa", last4: "4242", expires: "04/28", declines: false },
      nextVisit: { what: "Perio maintenance", when: "In 3 months", provider: "Jordan Kim, RDH" } }),
    a14: (v) => ({ ...v, // Grace Holloway, unconfirmed, forms not done
      insurance: { ...v.insurance, status: "needs-review", verifiedAt: null, note: "Patient changed jobs; new Guardian card photo uploaded on the intake form, not entered yet" },
      forms: [{ name: "Medical history", status: "needs-update", when: "Sep 2025" }, { name: "Consent for treatment", status: "not-signed", when: "" }, { name: "Privacy notice", status: "not-signed", when: "" }] }),
    a8: (v) => ({ ...v, // Zoe Martin, walk-in emergency, self-pay
      insurance: null, cardOnFile: null,
      alerts: [{ kind: "note", text: "Walk-in. Pain on the lower left since Tuesday." }],
      forms: [{ name: "New patient intake", status: "not-signed", when: "" }, { name: "Medical history", status: "not-signed", when: "" }, { name: "Privacy notice", status: "signed", when: "10:31 AM" }],
      procedures: [{ code: "D0140", name: "Limited exam, problem focused", tooth: "", fee: 85, insEst: 0, ptEst: 85, status: "planned" }, { code: "D0220", name: "Periapical x-ray, first film", tooth: "", fee: 35, insEst: 0, ptEst: 35, status: "planned" }, { code: "D9110", name: "Emergency pain treatment", tooth: "", fee: 95, insEst: 0, ptEst: 95, status: "planned" }],
      copayDue: 215 }),
    a3: (v) => ({ ...v, // Liam Carter, root canal finishing
      insurance: { ...v.insurance, deductibleLeft: 50, used: 310 },
      procedures: [{ code: "D3330", name: "Root canal, molar", tooth: "#19", fee: 1150, insEst: 880, ptEst: 270, status: "completed" },
        { code: "D2950", name: "Core buildup", tooth: "#19", fee: 295, insEst: 0, ptEst: 0, status: "planned", nextVisit: true }, { code: "D2740", name: "Crown, porcelain/ceramic", tooth: "#19", fee: 1250, insEst: 0, ptEst: 0, status: "planned", nextVisit: true }],
      cardOnFile: null, copayDue: 270, paymentNote: "Wants to pay with an HSA card",
      nextVisit: { what: "Core buildup and crown prep #19", when: "In 2 to 3 weeks, 90 min", provider: "Dr. Maya Patel", booked: false } }),
    a13: (v) => ({ ...v, // Ethan Walker, family balance
      balance: { patient: 95, family: 140, insurancePending: 210, members: [{ name: "Ethan Walker", amount: 95 }, { name: "Mia Walker", amount: 0 }, { name: "Chloe Walker", amount: 45, note: "Delta paid less than estimated" }] },
      cardOnFile: { brand: "Mastercard", last4: "5100", expires: "11/27", declines: false },
      nextVisit: { what: "Perio maintenance", when: "In 3 months", provider: "Sofia Ramirez, RDH", booked: false },
      family: [{ name: "Mia Walker", next: "Oct 2, 10:30 AM" }, { name: "Chloe Walker", next: "Oct 2, 11:00 AM" }] }),
    a7: (v) => ({ ...v, // Isabella Kim, new patient, no insurance entered
      insurance: null, insuranceNote: "Patient uploaded a card photo (Cigna) on the intake form; nobody has entered it",
      procedures: v.procedures.map((p) => ({ ...p, status: "completed" })).concat([{ code: "D2391", name: "Composite, one surface, back tooth", tooth: "#14", fee: 185, insEst: 0, ptEst: 185, status: "planned", nextVisit: true }]),
      copayDue: 240, nextVisit: { what: "Filling #14", when: "Next 2 weeks, 30 min", provider: "Dr. Ethan Brooks", booked: false } }),
    a9: (v) => ({ ...v, // Samuel Diaz, card declined
      procedures: [{ code: "D2740", name: "Crown, porcelain/ceramic", tooth: "#19", fee: 1250, insEst: 625, ptEst: 625, status: "completed" }],
      balance: { patient: 120, family: 120, insurancePending: 0, members: [] }, copayDue: 625,
      cardOnFile: { brand: "Visa", last4: "0341", expires: "08/26", declines: true, declineReason: "Expired card" } })
  };

  /* Scenarios: override some cards on the day, then open one appointment. flow says which part of the journey the
   * scenario is about. */
  const scenarios = [
    { id: "normal", name: "A normal morning, 10:40 AM", hint: "Click any appointment to open its panel." },
    { id: "olivia-arrives", name: "Check in: Olivia Nguyen arrives (premedicate, unsigned consent, $740 balance)", flow: "check-in", focus: "a17", set: { a17: { st: "conf" } },
      hint: "She's at the desk for her 11:00. Did she premedicate? Her consent isn't signed and she owes $740." },
    { id: "grace-forms", name: "Check in: Grace Holloway, unconfirmed, forms and new insurance card", flow: "check-in", focus: "a14",
      hint: "Never confirmed, forms not done, and a new insurance card nobody has entered." },
    { id: "zoe-walkin", name: "Check in: Zoe Martin, walk-in emergency, no insurance", flow: "check-in", focus: "a8", set: { a8: { st: "conf" } },
      hint: "A new patient in pain, self-pay, intake forms not filled in." },
    { id: "liam-checkout", name: "Check out: Liam Carter after a root canal (book the crown, HSA card)", flow: "check-out", focus: "a3", set: { a3: { st: "done" } },
      hint: "Collect $270, book the buildup and crown in 2–3 weeks, and he wants to pay with an HSA card." },
    { id: "ethan-family", name: "Check out: Ethan Walker, family balance across three people", flow: "check-out", focus: "a13", set: { a13: { st: "done" } },
      hint: "His visit is $30; the family owes $140 across Ethan and Chloe." },
    { id: "isabella-noins", name: "Check out: Isabella Kim, new patient, insurance never entered", flow: "check-out", focus: "a7",
      hint: "Exam and x-rays done, a filling found; her Cigna card photo was never entered." },
    { id: "samuel-declined", name: "Check out fails: Samuel Diaz's card is declined", flow: "check-out", focus: "a9", set: { a9: { st: "done" } },
      hint: "Crown seated; $625 today plus $120 from before. The Visa on file expired in August." },
    { id: "busy", name: "A packed day (double-booked chairs)", busy: true, hint: "Every chair full, two visits side by side in Op 2." }
  ];

  const visit = (a) => { const base = defaultVisit(a); return VISITS[a.id] ? VISITS[a.id](base) : base; };
  window.PROTO_DATA = { scenarios, visit, questions: [] };
})();
