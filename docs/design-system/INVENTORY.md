# Asha screen inventory (from apps/web/src, 2026-09-25)

Real labels from the code. Use these words in blocks. Paths are under `apps/web/src/` in the repo at
this repo. Read a file when you need more detail.

Corrections to common assumptions: there is NO global command palette/search (AshaCommandPalette is per-screen:
Claims, Tooth chart, Scheduling, chart Billing tab); NO in-app notification center (browser notifications + sidebar
count badges); `AshaMetricStrip` does not exist (closest: AshaStatusSummaryStrip, AshaPipelineStrip, AshaQuickStats,
AshaStatGrid); `ClaimFormSpreadsheet` lives in `routes/practice/claims/components/`.

## 1. App shell
Sidebar (`components/Basic/PracticeSidebar/PracticeSidebarUtil.tsx`): Main: Home, AI Staff, Tasks, ROI Reports ·
PMS: Scheduling, Charts, Lists, Labs, Treatment Plans, Imaging, Documents, Scribe, Fee Schedules · Communications:
Calls, Faxes, Messaging, Campaigns, Forms, Team Chat · Revenue Cycle: RCM Overview, Biller Tasks, Claims, Payments,
Statements, EOBs, Bank Transactions, Reporting & Analytics, Revenue Intelligence · Other: Settings, Learning Center,
Support. Count badges: Tasks (own pending, blue), Messaging/Team Chat/Faxes unread. Collapses to an icon rail with
dot badges. Practice switcher (`components/PracticeSwitcher.tsx`): 280px popover, "Search practices...", "Select
practice". User menu: Invitations, "Sign out everywhere" (confirm). AshaWorkspaceHeader: 44px "Parent / Title" bar
with actions and optional count tabs — top of every list/workbench.

## 2. Schedule (`routes/practice/calendar/SchedulingCalendar.tsx`, `components/AppointmentCardV2.tsx`, `components/schedulingLegendBadges.tsx`)
Day view: one column per operatory (140–250px), 7 AM–7 PM, 15-min slots; Week view. Filters: Providers, Search
operatories. Toolbar: prev/next, "Appointments today", "Search appointments...", "Fit to screen", "Show/Hide patient
names", utilization panel, "Manage appointment statuses". Menu: Find open slots, ASAP / Waitlist, Cancelled, Pinned,
Block time, Daily Huddle, Utilization, Print schedule, Print route slips, Calendar settings.
Card legend chips: Unconfirmed, Confirmed, AI Confirmed, Manually Confirmed, Checked In, In Progress; Ins. Verified,
Ins. Pending, Ins. Retrying, Ins. Details Missing, Ins. Needs Review; Pt Claims Out., Fam Claims Out., Pt Bal. Due,
Fam Bal. Due, Claim Sent, Claim Denied; AI Booked, Forms Incomplete, Forms Complete, Med Alert, New Patient,
"Checkout finalizing", "Checkout needs attention". Appointment statuses: Scheduled, Confirmed, Checked In, In
Progress, Completed, Cancelled, Bumped.
Appointment flyout (`components/Specific/AppointmentDetailSheet/`): sections Status, Procedures, Financial,
Insurance, Forms, Clinical, Notes, Treatment plan. Fields When, Duration, Operatory, Provider, Primary Dr.,
Guarantor, Family size, Family balance, Deductible, Total office fee. Forms chips HIPAA, Consent, Financial Policy,
Medical Hx. Actions Edit appointment, Reschedule, Copy/Cut appointment, Cancel appointment, Show on calendar, Open
route slip, Print reminder, Refresh appointment financials, check-in/checkout.
Schedule dialog (`components/ScheduleSlotDialog.tsx`): services New Patient Exam, Prophy / Cleaning, Perio
Maintenance, Crown Prep…; durations "5 min"–"2 hours"; quick-add patient; "Review scheduling conflicts".
Find Appointment flyout (`components/Specific/FindOpenSlotsFlyout/`): filters Patient, Service, Provider,
Operatory/Chairs, Duration, Date range, Time of day (Morning/Afternoon); Confirm placement, Load more times; empty
"Ready to search", "No available slots found".
Waitlist/Cancelled (`components/WaitlistPanelInline.tsx`): offer states Waiting, Contacted, Accepted, Declined,
Booked, Withdrawn; Send offer, View Chart, "Send this opening by text?".
Check-in sheet (`CheckInSheet.tsx`): steps Demographics, Insurance, Forms, Copay, Payment, Recall, Handoff.

## 3. Patients
List (`routes/practice/charts/`): "Search by name, DOB, or chart number…"; filters Providers, Insurance, Last visit,
Tags; columns Patient, Chart #, Status, Provider, Last Visit, Alerts. New patient sheet.
Chart (`components/PatientChartDetail.tsx`) tabs: Charting, Overview, Family, Insurance, Appts, Billing, TX plans,
Notes, Images, Post-Op, Labs, Medical Hx, Forms, Docs, Journal, Comms, Schedule, Audit Trail. Overview: Contact
Details, Communication Preferences (SMS/Email/Mail Opt-In, Preferred Contact, Best Time to Reach), Emergency Contact,
Responsible Party / Guarantor, Referral, Preferred Pharmacy, Staff Notes, Medical Profile. Patient Alerts ("Manage
patient alerts"). Insurance summary Used / Remaining / Deductible, "Annual Remaining". Aging 0–30 / 31–60 / 61–90 / 91+.
Family tab: columns Patient, Relationship, Role, Total outstanding; filters All members, Has balance, No balance,
Insurance pending; actions Set Guarantor, Set Contact, Split to own account, Remove from family, View ledger, Add
Family Member.
Insurance tab: Carrier, Plan type, Member ID, Group #, Subscriber, Relationship, Effective, Term. date; benefits
Preventive / Basic / Major, Annual maximum, deductible, Coinsurance, Copay, Waiting period, Frequency limitations,
Age limits, Orthodontic; statuses verified / pending / unverified / needs review / details missing.
Medical history: Allergies, Medications, Conditions, Medical Alerts, Blood Pressure, Heart Rate, Smoking / Tobacco,
Pregnancy Status.

## 4. Clinical
Tooth chart (`components/ToothChart/`): sub-tabs Tooth Chart, Perio Chart, Clinical Screenings. Layers Conditions,
Existing Restorations, Missing Teeth, Caries, Crowns, Bridges, Implants, Root Canals, Fractures / Watch, Planned,
Completed. Procedure statuses Existing, Planned, Completed, Referred, Declined, "No longer recommended". Tooth flyout:
Tooth Status (Present/Missing/Impacted/Unerupted/Supernumerary), Add Condition, Add Existing Restoration (Amalgam,
Composite, Crown, Bridge, Implant, Inlay, Onlay, Veneer, Post & Core, Root Canal), Mobility Grade. Case table: Code,
Tooth / Area, Site, Units, Office Fee, Insurance, Phases, Presented, Patient decision, Scheduling, Status.
Recommended treatment: Date, Code, Tooth, Surf, Description, Provider, Amount, INS EST, Patient EST.
Perio (`components/PerioChart/`): Comprehensive / Limited; scope Quadrant, Sextant (S1–S6), Specific teeth; steps
Probing Depths, BOP, Recession, Additional Findings, Review & Confirm; indices Avg PD, Max PD, Charted; voice entry.
Treatment plans: list columns Patient, Plan Name, Plan Date, Provider, Procedures, Total Fee, Ins Est., Pt Est.,
Status; statuses Draft, Proposed, Accepted, Partially Accepted, Declined, Completed, Expired; actions Mark Response,
Share Link, Download PDF, Print; metrics Acceptance Rate, Completion Rate, Average Value.
Clinical notes: Date, Type, Author / Provider, Codes, Status (Draft, Signed); rich text + signing. Rx: Drug name,
Dosage, Quantity, "Add Prescription".

## 5. Billing
Chart Billing tab (`components/Billing/BillingTab.tsx`): sub-tabs Ledger, Statements, Claims, Pre-Auth, Payments,
Payment Plans; scope This location / All Family Members; summary Credits, INS EST, Patient EST, Balance; actions
Collect payment, Adjust balance, Add Procedure, Create Claim, Post insurance payment, Generate statement, Explain
patient responsibility.
Ledger (`routes/practice/ledger/components/PatientLedgerEntriesTable.tsx`): Date, Patient, Code, Tooth, Surf, Check #,
Description, Provider, Payer, Amount, Remaining, Balance. Entry codes: procedure code, Patient Payment, Ins Pay, ADJ,
Write-off, Refund, Balance Fwd, Pending, Claim, Reversal. User pref: Dentrix-style entry type text colours (claim
blue, payments green, ADJ red); grouped balance tiles without red; abbreviated headers (Credits, INS EST, ADJ, Patient
EST); detail flyouts open read-only with Edit, tabs Overview / Application / Notes & metadata / Activity; balance as
left-aligned equation waterfall "Balance before" / "Balance after".
Checkout (`components/Specific/CheckoutV2/`): steps Review, Payment, Next Visits, Finish; methods Card terminal,
Saved card, New card, Cash, Check, ACH, Patient financing; rows Insurance estimate, Patient responsibility, Write-off,
Unapplied deposit. User pref: collect CTA inline on the Method row ("Send to terminal", "Record", "Charge"); finish
step shows post-op instructions per patient above receipts.
Collect Payment: Apply to This patient / Family / Specific visit / Treatment plan deposit / "Hold as unapplied
credit"; Send Payment Link; "Waiting for card...". Payment plan: Plan Name, Total Amount, # of Payments, Start Date,
Payment Method, "Next scheduled charge". Family balance modal. Statements page: batch statuses Processing, Ready for
review, Sent, Partially sent, Delivered, Failed; metrics Patients, Total amount, Avg / Patient; Send selected.

## 6. Insurance / RCM
Claims (`routes/practice/claims/`): toggle Claims / Pre-Auths; tabs Unbatched Claims, To Be Sent, Sent, Adjudicated,
Closed, Archived; columns Patient, Service date, Procedures, Payer, Claim type (Primary/Secondary), Amount (Billed),
Paid, Status, Biller, Sent date, Updated; optional EOB received, EOB allowed. Statuses Draft, Validation Ready / Needs
Review, AI Analyzing/Ready/Failed, Submitted, Accepted, Rejected, With Payer, Awaiting EOB, EOB Received, Paid, Partial
Pay, Denied, Info Requested, Needs posting, Needs secondary billing. Timely filing: "Filing days remaining". Date
range: Last 7/30/90 days, Year to date. "Run AI Analysis on selected", saved views, Columns, Export CSV. User pref: no
top stat cards; date picker in the tab bar's right slot; sort shown in headers; compact "Partial"; ledger-posted
checkmark.
Unsent claim flyout: Preview Claim, Edit claim, "Narrative & attachments"; grid Line, Code, Description, Service
date, Tooth / surface, Billed. Sent claim flyout: Patient & coverage, Providers, Primary adjudication by procedure
(Line, Code, Charged, Allowed, Paid, Patient resp., Adjustments), Coordination of benefits; actions Post payment,
Auto-post from EOB, View EOB, Fix & Resubmit, Prepare Appeal, Create Secondary Claim, Write Off, Void Claim. User
pref: History tab only (no Notes); View source EOB in the Actions menu; searchable Actions menu.
Payment posting modal (`components/PaymentPostingModal.tsx`): header Transaction date, Check#, Method, Payment type,
Claim, EOB, Ins. Paid Amount, Insurance adjustment type (2-column field grid); lines Description, Provider, Charge,
Other Cr., Allowed, Adj., Ins. Est., Ins. Paid, Balance, Pt. Resp.; totals Total billed, Allowed, Insurance paid,
Patient resp, Write-offs; bottom tabs Notes, Deductibles; "Possible duplicate payment" warning. Save posts all lines.
EOBs page: Document, Type, Payer, Provider, Uploaded, Status, Outcome; user pref EOB list shows Patient/Payer/Dates/
Total billed/Insurance paid only; Match/Re-match, View Claim, View Source EOB as header links.
Pre-auths: Draft, Pending, Requested, Response received, Approved, Partial Approved, Denied; Expires.
Eligibility: Payer, Member ID, Group Number, Date of Service; results Service Type Benefits, Procedure Code Benefits
(Coverage Status, In Network, Coinsurance, Copay, Limitations).
RCM Overview: Needs Attention, "Why these claims are stuck", "How old are these claims", "Who owns the next step"
(Asha / Your team); cards Claims missing EOBs, Fully paid EOBs not posted, Denials awaiting action, Insurance
collection rate. A/R aging buckets Current (0-30), 31-60, 61-90, 91-120, 120+; views Guarantor A/R, Insurance A/R,
Carrier Breakdown. Bank Transactions: Exact Match, Fuzzy Match, No Match, Auto-Matched, Needs Review. ERA enrollment:
Payer, Transaction (835 ERA…), NPI, Status.

## 7. Revenue Intelligence (`routes/practice/revenuereports/`)
Financial: Daily Huddle (tabs Balances, Claims, Insurance, Plans, Tasks), Daily Reconciliation (Card Net, Deposits,
Expected Net), RCM Activity, Production & Collections (Scheduled/Completed/Net Production, Adjustments, Net
Collections, Production Collection Ratio), Collections Summary, Adjustments, A/R Aging. Clinical: Case Acceptance
(Acceptance Rate, Diagnosed Value, Accepted Value, Unscheduled Value), Hygiene Metrics (Re-appointment %, Perio %,
Fluoride %, Production / Visit). Operations: Patient Flow (New/Active/Lost, Retention Rate), Scheduling (Fill Rate,
Cancel Rate, No-Show Rate), Provider Scorecard (Gross Production, Production / Hour, Case Acceptance). Goals. Dates:
Today, Yesterday, This Week, This Month, Last Month, This Quarter, YTD, Custom. RI colour rule: dark numbers, grey
captions, blue bars only; no green/red values; one-line toolbar (search · dates · Sort · chips · + · ⋯).

## 8. Tasks / Lists
Tasks: groups All Tasks, Revenue Cycle, Front Office, Clinical, Scheduling, Calls & Messages; types Claim Rejections,
EOB Posting, Missing EOBs, Pre-Auth Responses, Information Request, Voicemail; columns Status, Task, Urgency
(High/Medium/Low), Type, Date Created, Assignee; statuses Pending, Resolved, Failed. Flyout: Description, Subtasks,
Attachments, Comments, Activity. User pref: Asana-style unfilled CircleCheck left of title; subtasks compact table;
silent completion; IR responder section "Respond to this information request" with a horizontal grid of items and an
xs Submit inside the answer cell.
Lists (`routes/practice/lists/`): queues Hygiene recall, Reschedule, Unscheduled treatment, Reactivation, New
patients, Post-op follow-up, Approved pre-auths, Referred patients, Benefit max, ASAP / waitlist; work status Open,
Snoozed, Completed, Dismissed; filters Due window (Overdue / Next 7/30/90 days), Recall type, Owner, Payer, Contact
outcome. Unscheduled treatment columns: Contact, Phone, Status, Treatment, Next phase, Age, Plan insurance est., Plan
patient est., Owner, Provider. Record flyout (WorklistRecordSheet): Primary contact, Last contact, Next follow-up,
Attempts, Notes, "No contact logged yet", "Attempt limit reached"; icon quick actions; shared Follow-up section.

## 9. Communication
Messaging: All Messages / Resolved, "Search conversations...", New Conversation; channels SMS, Email, Fax, AI Call,
Missed Call, Voicemail, Internal Note; thread templates, Attach image, Call patient, Open chart, Upcoming appointments.
Calls: Name, Phone, Date, Duration, Insurance, Summary; Inbound/Outbound; detail Call Details, Transcript. Campaigns:
triggers Recall Due, Birthday, Reactivation, Appointment No-Show…; statuses Scheduled, In progress, Sent, Completed;
metrics Audience size, Additional revenue, SMS replies. Faxes: Fax Inbox, Sent, Archived; Matched / Not Matched,
Urgent / Routine. No staff reviews surface.

## 10. Forms & documents
Forms: tabs All Forms, Automations, History, Import; field types Long Text, Number, Dropdown, Multiple Choice, Check
All That Apply, File Upload, Acknowledgement, Explanatory Text; send states Link Sent, Form Opened, Completed, Signed
by Patient; Send to Patient, Secure Link, Translate. Documents: All Documents, AI File Documents, Review Queue;
columns Title, Patient, Size, Uploaded by, Uploaded; grid/list toggle; scanner dialog. Kiosk check-in, patient intake.

## 11. Settings (`routes/practice/practiceconfig/settingsMenu.ts`)
Practice: Practice info, Hours & closures, Equipment & orders, Settings history, Setup checklist · Team & access:
Team members, Roles & permissions, Sign-in rules · Scheduling: Scheduling setup, Calendar display, Online booking,
Check-in & kiosk · Clinical: Procedure codes, Procedure bundles, Tooth chart, Appointment notes, Note signing,
Medical history, Treatment plan sharing, Labs · Patient forms · Phones & messages · Payments: Card payments, Card
readers, Payment options, Online bill pay · Insurance & claims: Billing dentist & claims, Insurances accepted,
Clearinghouse, Claim follow-up, Filing deadlines, ERA enrollment, Payer portals & logins · Alerts & reports · AI: AI
agents, AI usage & plan, Pause all AI · Connections: Practice software, X-ray imaging (SOTA), Passwords & logins,
Webhooks. Kit: see `.claude/skills/asha-ui/references/design-system.md` (AshaSettingsSection/Row, AshaSettingsList,
AshaConnectionRow, AshaSettingsNote, AshaSettingsLinkedValue, AshaSecretRow, AshaCopyRow, AshaSetupSteps,
AshaSettingsWeekRow, AshaPendingChangesBar, "Needs you" section).

## 12. AI
Copilot panel/home (`components/copilot/`): "Ask anything about your practice...", "Ask a follow-up...", chat
history, New chat, push-to-talk; resource links View Claim / EOB / Patient / Task. Chat blocks: ClaimsTableBlock,
PatientsTableBlock, MetricCardBlock, PatientCardBlock, EobActionSummaryCard, ClaimGenRecommendationBlock,
RejectionActionCard, WriteActionConfirmationBlock, AshaAnalysisCard. User pref: thinking view shows plain-English
milestones; resource cards, no Sources box for practice staff. AI Staff: Agent, Status, Action, "Activate Agent". AI
banners on claims/EOBs (`AiRecommendationBanner.tsx`), Scribe, Claim AI Analysis tab.

## 13. Reports (`routes/practice/reporting/`)
Financial: Day Sheet, Deposit Slip, Ledger Report, Payment Analysis, Patient/Family Balances, Credit Balances,
Unapplied Credits, Provider Aging, Procedure Summary. Insurance: Outstanding Claims, Unsent Claims, Rejections /
Denials, Payer Performance, Pre-Authorization, Pending Eligibility. Scheduling: Appointment List, Scheduled vs Actual
Production. Patients/Clinical: Patient Directory, New Patients Seen, Referral Analysis, Recare Management, Medical
Alerts & Premedication, Lab Cases. Admin: Audit Log. Controls: Results / Charts / Metrics, Daily/Weekly/Monthly,
Download CSV/PDF, Print.
