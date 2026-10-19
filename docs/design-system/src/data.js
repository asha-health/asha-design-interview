/* Shared invented sample data. Every block draws from here so the same people, payers and codes
 * show up everywhere. No real patients. "Today" is Friday, Sept 25, 2026. */
const TODAY = "2026-09-25";
const DATA = (() => {
  const providers = [
    { id: "pr1", name: "Dr. Maya Patel", short: "Dr. Patel", role: "Dentist", tone: "blue" },
    { id: "pr2", name: "Dr. Ethan Brooks", short: "Dr. Brooks", role: "Dentist", tone: "indigo" },
    { id: "pr3", name: "Sofia Ramirez, RDH", short: "Sofia R.", role: "Hygienist", tone: "teal" },
    { id: "pr4", name: "Jordan Kim, RDH", short: "Jordan K.", role: "Hygienist", tone: "sky" }
  ];
  const operatories = [
    { id: "op1", name: "Op 1", provider: "pr1" },
    { id: "op2", name: "Op 2", provider: "pr2" },
    { id: "op3", name: "Hyg 1", provider: "pr3" },
    { id: "op4", name: "Hyg 2", provider: "pr4" }
  ];
  const payers = [
    { id: "delta", name: "Delta Dental of California", short: "Delta Dental" },
    { id: "metlife", name: "MetLife Dental", short: "MetLife" },
    { id: "cigna", name: "Cigna Dental", short: "Cigna" },
    { id: "aetna", name: "Aetna Dental", short: "Aetna" },
    { id: "guardian", name: "Guardian Dental", short: "Guardian" },
    { id: "uc", name: "United Concordia", short: "United Concordia" }
  ];
  /* Short plain-language names for common CDT codes, with the office fee */
  const procedures = [
    { code: "D0120", name: "Periodic exam", fee: 65, cat: "Diagnostic" },
    { code: "D0150", name: "Comprehensive exam", fee: 95, cat: "Diagnostic" },
    { code: "D0210", name: "Full mouth x-rays", fee: 145, cat: "Diagnostic" },
    { code: "D0274", name: "Bitewings, four films", fee: 78, cat: "Diagnostic" },
    { code: "D0330", name: "Panoramic x-ray", fee: 120, cat: "Diagnostic" },
    { code: "D1110", name: "Adult cleaning", fee: 110, cat: "Preventive" },
    { code: "D1120", name: "Child cleaning", fee: 80, cat: "Preventive" },
    { code: "D1208", name: "Fluoride", fee: 40, cat: "Preventive" },
    { code: "D1351", name: "Sealant, per tooth", fee: 55, cat: "Preventive" },
    { code: "D2391", name: "Composite, one surface, back tooth", fee: 185, cat: "Restorative" },
    { code: "D2392", name: "Composite, two surfaces, back tooth", fee: 235, cat: "Restorative" },
    { code: "D2740", name: "Crown, porcelain/ceramic", fee: 1250, cat: "Restorative" },
    { code: "D2950", name: "Core buildup", fee: 295, cat: "Restorative" },
    { code: "D3330", name: "Root canal, molar", fee: 1150, cat: "Endodontics" },
    { code: "D4341", name: "Deep cleaning, 4+ teeth per quadrant", fee: 260, cat: "Periodontics" },
    { code: "D4910", name: "Perio maintenance", fee: 150, cat: "Periodontics" },
    { code: "D6010", name: "Implant body", fee: 2100, cat: "Implants" },
    { code: "D7140", name: "Extraction, erupted tooth", fee: 185, cat: "Oral surgery" },
    { code: "D7210", name: "Surgical extraction", fee: 320, cat: "Oral surgery" },
    { code: "D9110", name: "Emergency pain treatment", fee: 95, cat: "Adjunctive" }
  ];
  const proc = (code) => procedures.find((p) => p.code === code);
  /* Patients. age, family (guarantor first), payer, balances in dollars. */
  const patients = [
    { id: "p1", name: "Ava Thompson", dob: "1988-03-14", age: 38, phone: "(415) 555-0132", family: "Thompson", guarantor: true, payer: "delta", balance: 184.0, insBalance: 412.0, next: "2026-09-25T09:00", alerts: ["Penicillin allergy"], lastVisit: "2026-03-12" },
    { id: "p2", name: "Liam Carter", dob: "1975-11-02", age: 50, phone: "(415) 555-0178", family: "Carter", guarantor: true, payer: "metlife", balance: 0, insBalance: 1250.0, next: "2026-09-25T10:00", alerts: ["Takes blood thinners"], lastVisit: "2026-06-30" },
    { id: "p3", name: "Emma Rodriguez", dob: "1996-07-21", age: 30, phone: "(510) 555-0144", family: "Rodriguez", guarantor: true, payer: "cigna", balance: 62.5, insBalance: 0, next: "2026-09-25T08:00", alerts: [], lastVisit: "2026-03-20" },
    { id: "p4", name: "Noah Bennett", dob: "2014-05-09", age: 12, phone: "(510) 555-0144", family: "Bennett", guarantor: false, payer: "delta", balance: 0, insBalance: 80.0, next: "2026-09-25T13:00", alerts: [], lastVisit: "2026-03-18" },
    { id: "p5", name: "Olivia Nguyen", dob: "1969-01-30", age: 57, phone: "(650) 555-0101", family: "Nguyen", guarantor: true, payer: "aetna", balance: 740.0, insBalance: 318.0, next: "2026-09-25T11:00", alerts: ["Latex allergy", "Premedicate"], lastVisit: "2026-08-14" },
    { id: "p6", name: "Mason Reed", dob: "1991-09-12", age: 35, phone: "(650) 555-0199", family: "Reed", guarantor: true, payer: "guardian", balance: 25.0, insBalance: 0, next: "2026-09-25T14:00", alerts: [], lastVisit: "2025-12-02" },
    { id: "p7", name: "Sophia Hughes", dob: "1983-12-05", age: 42, phone: "(408) 555-0112", family: "Hughes", guarantor: true, payer: "uc", balance: 0, insBalance: 0, next: "2026-09-25T15:00", alerts: [], lastVisit: "2026-04-01" },
    { id: "p8", name: "Lucas Foster", dob: "1958-04-18", age: 68, phone: "(408) 555-0165", family: "Foster", guarantor: true, payer: "metlife", balance: 1320.0, insBalance: 890.0, next: "2026-09-28T09:00", alerts: ["Diabetic"], lastVisit: "2026-09-10" },
    { id: "p9", name: "Isabella Kim", dob: "2001-02-27", age: 25, phone: "(925) 555-0120", family: "Kim", guarantor: true, payer: null, balance: 0, insBalance: 0, next: "2026-09-25T09:30", alerts: [], lastVisit: null },
    { id: "p10", name: "Ethan Walker", dob: "1979-08-08", age: 47, phone: "(925) 555-0187", family: "Walker", guarantor: true, payer: "delta", balance: 95.0, insBalance: 210.0, next: "2026-09-25T10:30", alerts: [], lastVisit: "2026-02-25" },
    { id: "p11", name: "Mia Walker", dob: "1981-06-16", age: 45, phone: "(925) 555-0187", family: "Walker", guarantor: false, payer: "delta", balance: 0, insBalance: 0, next: "2026-10-02T10:30", alerts: [], lastVisit: "2026-02-25" },
    { id: "p12", name: "Chloe Walker", dob: "2016-10-03", age: 9, phone: "(925) 555-0187", family: "Walker", guarantor: false, payer: "delta", balance: 0, insBalance: 45.0, next: "2026-10-02T11:00", alerts: [], lastVisit: "2026-02-25" },
    { id: "p13", name: "James Ortiz", dob: "1966-03-11", age: 60, phone: "(707) 555-0154", family: "Ortiz", guarantor: true, payer: "cigna", balance: 410.0, insBalance: 1180.0, next: null, alerts: ["Heart condition"], lastVisit: "2026-07-22" },
    { id: "p14", name: "Harper Lee Nguyen", dob: "1993-05-25", age: 33, phone: "(707) 555-0141", family: "Lee Nguyen", guarantor: true, payer: "guardian", balance: 0, insBalance: 0, next: "2026-11-12T08:30", alerts: [], lastVisit: "2026-05-12" },
    { id: "p15", name: "Benjamin Scott", dob: "1954-09-01", age: 72, phone: "(831) 555-0173", family: "Scott", guarantor: true, payer: "aetna", balance: 2150.0, insBalance: 0, next: null, alerts: ["Dentures"], lastVisit: "2026-01-09" }
  ];
  const patient = (id) => patients.find((p) => p.id === id);
  const payer = (id) => payers.find((p) => p.id === id);
  const provider = (id) => providers.find((p) => p.id === id);
  return { providers, operatories, payers, procedures, proc, patients, patient, payer, provider };
})();
