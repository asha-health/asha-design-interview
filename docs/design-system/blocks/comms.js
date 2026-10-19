/* Messages & reminders blocks. Labels from components/Specific/Messages*, routes/practice/{messages,calls,campaigns,faxes}
 * and MessagesSettings (INVENTORY.md §9). Inbound texts are grey, the office's texts are blue, internal notes are grey boxes. */
(() => {

/* ---------- shared bits ---------- */
const P = (id) => DATA.patient(id);
const OFFICE = "Bayview Family Dental";
const OFFICE_PHONE = "(415) 555-0100";
const CH = { sms: ["message-square", "Text"], email: ["mail", "Email"], ai: ["phone-incoming", "AI call"], missed: ["phone-missed", "Missed call"], vm: ["voicemail", "Voicemail"], booking: ["calendar-plus", "Online booking"] };
const asha = (who = "Asha") => `<span class="inline-flex items-center gap-x-1 text-blue-700">${I("sparkles", "size-3")}${esc(who)}</span>`;
const chBadge = (ch) => `<span class="absolute -bottom-0.5 -end-0.5 flex size-4 items-center justify-center rounded-full bg-white ring-1 ring-gray-200/80 text-gray-500" title="${CH[ch][1]}">${I(CH[ch][0], "size-2.5")}</span>`;
const vr = () => `<span class="h-5 shrink-0 border-s border-gray-200/80"></span>`;

/* A day divider inside a thread */
const dayRule = (label) => `<div class="flex items-center gap-3 py-1"><span class="grow border-t border-gray-200/80"></span><span class="text-xs font-medium text-gray-500">${label}</span><span class="grow border-t border-gray-200/80"></span></div>`;

/* One text. m: {dir:'in'|'out', text, time, by (staff name or 'Asha · <agent>'), ai, receipt:'delivered'|'read'|'failed'|'sending', readAt} */
function bubble(m) {
  if (m.kind === "note") return `<div class="mx-auto w-full max-w-[88%] ${R.boxMuted} px-3.5 py-2.5">
      <p class="flex items-center gap-x-1.5 text-xs font-medium text-gray-600">${I("lock", "size-3.5 text-gray-400")}Internal note · ${esc(m.by)} <span class="font-normal text-gray-400">· ${m.time}</span><span class="ms-auto font-normal text-gray-400">Only visible to your team</span></p>
      <p class="mt-1 text-sm text-gray-800">${m.text}</p></div>`;
  if (m.kind === "event") return `<div class="flex justify-center"><span class="inline-flex items-center gap-x-1.5 text-xs text-gray-500">${I(m.icon || "info", "size-3.5 text-gray-400")}${m.text} <span class="text-gray-400">· ${m.time}</span></span></div>`;
  const out = m.dir === "out";
  const receipt = { read: `${I("check-check", "size-3.5 text-blue-600")}Read${m.readAt ? " " + m.readAt : ""}`, delivered: `${I("check", "size-3.5 text-gray-400")}Delivered`, sending: `${I("loader-circle", "size-3.5 animate-spin text-gray-400")}Sending…`, failed: `<span class="inline-flex items-center gap-x-1 text-red-600">${I("circle-x", "size-3.5")}Not delivered.</span>${m.why ? `<span class="text-gray-500">${m.why}</span>` : ""}${button("Retry", { v: "white", s: "xs", icon: "rotate-cw", cls: "!h-6 ms-1" })}` }[m.receipt] || "";
  const who = out ? (m.ai ? asha(m.by) : esc(m.by || "")) : "";
  return `<div class="flex ${out ? "justify-end" : "justify-start"}"><div class="flex max-w-[76%] flex-col ${out ? "items-end" : "items-start"}">
    <div class="px-3.5 py-2 text-sm leading-5 ${out ? "rounded-2xl rounded-br-md bg-blue-600 text-white" : "rounded-2xl rounded-bl-md bg-gray-100 text-gray-800"} ${m.receipt === "failed" ? "opacity-70" : ""}">${m.text}</div>
    <p class="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-gray-500">${who ? `${who}<span class="text-gray-300">·</span>` : ""}<span class="tabular-nums">${m.time}</span>${receipt && m.receipt !== "failed" ? `<span class="text-gray-300">·</span><span class="inline-flex items-center gap-x-1">${receipt}</span>` : ""}</p>
    ${m.receipt === "failed" ? `<p class="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs">${receipt}</p>` : ""}
  </div></div>`;
}
/* v2: a thread shows the sender and time once per run of texts from the same person, and the delivery mark only under
 * the newest text the office sent, as an icon that names itself on hover (the legend card is gone). */
const V2_RECEIPT = { read: ["check-check", "text-blue-600"], delivered: ["check", "text-gray-400"], sending: ["loader-circle", "animate-spin text-gray-400"] };
function v2CommsThread(msgs) {
  const who = (m) => (m && !m.day && !m.kind ? `${m.dir}|${m.by || ""}` : "");
  const newestOut = msgs.reduce((a, m, i) => (who(m) && m.dir === "out" && m.receipt !== "failed" ? i : a), -1);
  let groupedMarked = false;
  return msgs.map((m, i) => {
    if (m.day) return dayRule(m.day);
    if (m.kind === "note") return `<div class="mx-auto w-full max-w-[88%] ${R.boxMuted} px-3.5 py-2.5">
      <p class="flex items-center gap-x-1.5 text-xs font-medium text-gray-600"${chg("An internal note says 'only your team sees this' with its lock icon on hover, so its name line stays on one line")}><span class="inline-flex" role="img" aria-label="Only visible to your team" data-tip="Only visible to your team">${I("lock", "size-3.5 text-gray-400")}</span>Internal note · ${esc(m.by)} <span class="font-normal text-gray-400">· ${m.time}</span></p>
      <p class="mt-1 text-sm text-gray-800">${m.text}</p></div>`;
    if (m.kind) return bubble(m);
    const runEnd = who(msgs[i + 1]) !== who(m), out = m.dir === "out", failed = m.receipt === "failed";
    const markGroup = !runEnd && !groupedMarked && (groupedMarked = true);
    const tip = m.receipt === "read" ? `Read${m.readAt ? " " + m.readAt : ""}` : m.receipt === "delivered" ? "Delivered" : "Sending…";
    const rc = i === newestOut && V2_RECEIPT[m.receipt] ? `<span class="text-gray-300">·</span><span class="inline-flex" role="img" aria-label="${tip}" data-tip="${tip}">${I(V2_RECEIPT[m.receipt][0], `size-3.5 ${V2_RECEIPT[m.receipt][1]}`)}</span>` : "";
    const meta = runEnd || failed ? `<p class="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-gray-500"${rc ? chg("Only the newest text shows a delivery mark, an icon that says Read or Delivered on hover; older texts drop the repeated 'Read' line") : ""}>${out ? `${m.ai ? asha(m.by) : esc(m.by || "")}<span class="text-gray-300">·</span>` : ""}<span class="tabular-nums">${m.time}</span>${rc}</p>` : rc ? `<p class="mt-1 flex items-center text-xs">${rc.replace('<span class="text-gray-300">·</span>', "")}</p>` : "";
    const fail = failed ? `<p class="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs"><span class="inline-flex items-center gap-x-1 text-red-600" data-tip="Not delivered: the carrier rejected it">${I("circle-x", "size-3.5")}Not delivered.</span>${m.why ? `<span class="text-gray-500">${m.why}</span>` : ""}${button("Retry", { v: "white", s: "xs", icon: "rotate-cw", cls: "!h-6 ms-1" })}</p>` : "";
    return `<div class="flex ${out ? "justify-end" : "justify-start"}"${markGroup ? chg("Texts in a row from the same person share one name and time line") : ""}><div class="flex max-w-[76%] flex-col ${out ? "items-end" : "items-start"}">
      <div class="px-3.5 py-2 text-sm leading-5 ${out ? "rounded-2xl rounded-br-md bg-blue-600 text-white" : "rounded-2xl rounded-bl-md bg-gray-100 text-gray-800"} ${failed ? "opacity-70" : ""}">${m.text}</div>${meta}${fail}</div></div>`;
  }).join("");
}
const threadBody = (msgs) => (V2 ? v2CommsThread(msgs) : msgs.map((m) => (m.day ? dayRule(m.day) : bubble(m))).join(""));

/* ---------- conversations ---------- */
const CONVOS = [
  { id: "k1", pt: "p1", ch: "sms", time: "8:24 AM", unread: false, assigned: "Nina Flores", snippet: "Of course! We can take care of the $184.00 at checkout today.", thread: [
    { day: "Yesterday" },
    { dir: "out", ai: true, by: "Asha · Appointment reminder", time: "10:00 AM", receipt: "read", readAt: "10:13 AM", text: `Hi Ava, this is ${OFFICE}. Reminder: your cleaning with Sofia is tomorrow, Fri Sep 25 at 9:00 AM. Reply YES to confirm or call ${OFFICE_PHONE} to change it.` },
    { dir: "in", time: "10:14 AM", text: "YES" },
    { dir: "out", ai: true, by: "Asha · AI Receptionist", time: "10:14 AM", receipt: "read", readAt: "10:15 AM", text: "Thanks, Ava. You're confirmed for 9:00 AM tomorrow. See you then!" },
    { kind: "event", icon: "calendar-check", text: "Appointment marked Confirmed", time: "10:14 AM" },
    { day: "Today" },
    { dir: "in", time: "8:12 AM", text: "Hi! Quick question. I got a statement for $184. Can I pay that when I come in this morning?" },
    { kind: "note", by: "Nina Flores", time: "8:20 AM", text: "Balance is her crown copay from March. Fine to collect at checkout. Sofia knows." },
    { dir: "out", by: "Nina Flores", time: "8:24 AM", receipt: "read", readAt: "8:25 AM", text: "Of course! We can take care of the $184.00 at checkout today. See you at 9." }
  ] },
  { id: "k2", pt: "p8", ch: "sms", time: "8:05 AM", unread: true, assigned: "", snippet: "Is my crown back from the lab yet? I'm booked Monday.", thread: [
    { day: "Today" },
    { dir: "in", time: "8:03 AM", text: "Morning. Is my crown back from the lab yet?" },
    { dir: "in", time: "8:05 AM", text: "I'm booked Monday at 9 and want to make sure before I take the morning off." }
  ] },
  { id: "k3", pt: "p13", ch: "missed", time: "7:58 AM", unread: true, assigned: "", needs: "Missed call · callback needed", snippet: "Missed call from (707) 555-0154. No voicemail.", thread: [
    { day: "Today" },
    { kind: "event", icon: "phone-missed", text: "Missed call from (707) 555-0154. No voicemail left", time: "7:58 AM" },
    { dir: "out", ai: true, by: "Asha · AI Receptionist", time: "7:59 AM", receipt: "delivered", text: `Hi James, sorry we missed your call to ${OFFICE}. Reply here or call us back at ${OFFICE_PHONE} and we'll help right away.` }
  ] },
  { id: "k4", pt: "p5", ch: "ai", time: "7:41 AM", unread: false, assigned: "", snippet: "AI Receptionist confirmed today's 11:00 AM visit.", thread: [
    { day: "Today" },
    { kind: "event", icon: "phone-incoming", text: "Call answered by Asha · AI Receptionist · 3:12", time: "7:38 AM" },
    { dir: "out", ai: true, by: "Asha · AI Receptionist", time: "7:41 AM", receipt: "read", readAt: "7:44 AM", text: "Thanks for calling, Olivia. You're set for today at 11:00 AM with Dr. Brooks. Please take your premedication an hour before." },
    { dir: "in", time: "7:44 AM", text: "Will do, thank you" }
  ] },
  { id: "k5", pt: "p9", ch: "booking", time: "Yesterday", unread: false, assigned: "", snippet: "New online booking: Comprehensive exam, Fri 9:30 AM.", thread: [
    { day: "Yesterday" },
    { kind: "event", icon: "calendar-plus", text: "New online booking · Comprehensive exam · Fri Sep 25, 9:30 AM", time: "6:48 PM" },
    { dir: "out", ai: true, by: "Asha · Patient Intake", time: "6:49 PM", receipt: "read", readAt: "7:02 PM", text: "Welcome to Bayview Family Dental, Isabella! Please fill in your health history before your visit. It takes about 5 minutes: bayview.asha.health/f/x8Q2" },
    { dir: "in", time: "7:05 PM", text: "Done! I don't have dental insurance right now, is that ok?" },
    { dir: "out", ai: true, by: "Asha · Patient Intake", time: "7:05 PM", receipt: "read", readAt: "7:06 PM", text: "Totally fine. The exam and x-rays are $240.00 for self-pay patients, and we'll go over any treatment costs before we start." }
  ] },
  { id: "k6", pt: "p10", ch: "email", time: "Yesterday", unread: false, assigned: "Marcus Lee", snippet: "Question about my September statement", thread: [
    { day: "Yesterday" },
    { dir: "in", time: "2:16 PM", text: "Hi, my statement says $95.00 but I thought insurance covered my exam. Can you check?" },
    { dir: "out", by: "Marcus Lee", time: "3:02 PM", receipt: "delivered", text: "Hi Ethan, Delta paid 80% of the x-rays and the rest is your share. I've attached the EOB. Happy to set up a payment if that helps." }
  ] },
  { id: "k7", pt: "p3", ch: "vm", time: "Sep 23", unread: false, assigned: "", snippet: "Voicemail · 0:41 · Wants to move her cleaning to a Saturday.", thread: [
    { day: "Wed, Sep 23" },
    { kind: "event", icon: "voicemail", text: "Voicemail · 0:41 · “Hi, it's Emma, can I move my cleaning to a Saturday?”", time: "5:52 PM" }
  ] },
  { id: "k8", pt: "p6", ch: "sms", time: "Sep 22", unread: false, resolved: true, assigned: "", snippet: "Perfect, see you then.", thread: [{ day: "Tue, Sep 22" }, { dir: "in", time: "11:02 AM", text: "Perfect, see you then." }] },
  { id: "k9", pt: "p15", ch: "sms", time: "Sep 18", unread: false, resolved: true, assigned: "", snippet: "Thanks for sending the denture estimate.", thread: [{ day: "Fri, Sep 18" }, { dir: "in", time: "4:40 PM", text: "Thanks for sending the denture estimate." }] }
];

function convoRow(c, on) {
  const p = P(c.pt);
  return `<button type="button" data-convo="${c.id}" aria-current="${on}" class="flex w-full items-start gap-x-3 px-3 py-2.5 rounded-lg text-start cursor-pointer ${on ? "bg-gray-100" : "hover:bg-gray-50"}">
    <span class="relative mt-0.5">${avatar(p.name, { size: 8 })}${chBadge(c.ch)}</span>
    <span class="min-w-0 grow">
      <span class="flex items-center gap-x-2"><span class="truncate text-sm ${c.unread ? "font-semibold text-gray-900" : "font-medium text-gray-800"}">${esc(p.name)}</span><span class="ms-auto shrink-0 text-xs tabular-nums ${c.unread ? "font-medium text-blue-600" : "text-gray-500"}">${c.time}</span></span>
      <span class="mt-0.5 flex items-center gap-x-2"><span class="truncate text-[13px] ${c.unread ? "text-gray-800" : "text-gray-500"}">${esc(c.snippet)}</span>${c.needs ? `<span class="ms-auto inline-flex shrink-0" role="img" aria-label="${esc(c.needs)}" title="${esc(c.needs)}">${I("circle-alert", "size-3.5 text-orange-500")}</span>` : ""}${c.unread ? `<span class="${c.needs ? "" : "ms-auto"} size-2 shrink-0 rounded-full bg-blue-600" aria-label="Unread"></span>` : ""}</span>
    </span></button>`;
}
function listPane(state, tab = 0, q = "", sel = "k1") {
  const rows = CONVOS.filter((c) => (tab ? c.resolved : !c.resolved) && (!q || P(c.pt).name.toLowerCase().includes(q.toLowerCase())));
  const body = state === "Loading" ? Array.from({ length: 7 }, () => `<div class="flex items-start gap-3 px-3 py-3"><span class="size-8 shrink-0 ${R.skel} !rounded-full"></span><span class="grow space-y-2">${skel("w-2/3")}${skel("w-11/12", "h-3")}</span></div>`).join("")
    : state === "Empty" ? emptyState({ icon: "message-square", title: "No conversations yet", body: "Texts, emails and calls with patients show up here as they come in.", action: button("New conversation", { v: "white", s: "sm", icon: "plus" }) })
    : rows.length ? rows.map((c) => convoRow(c, c.id === sel)).join("") : emptyState({ icon: "search-x", title: tab ? "No resolved conversations" : "Nothing matches", body: q ? "Try a different name." : "" });
  const open = CONVOS.filter((c) => !c.resolved).length, res = CONVOS.length - open;
  return `<div class="flex min-h-0 flex-col border-e border-gray-200/80">
    <div class="px-3 pt-1 border-b border-gray-200/80" data-list-tabs>${tabsBar(state === "Loading" ? ["All messages", "Resolved"] : [["All messages", state === "Normal" ? open : 0], ["Resolved", state === "Normal" ? res : 0]], tab, "!gap-x-4 !border-0")}</div>
    <div class="flex items-center gap-2 px-3 py-2.5">${searchBox("Search conversations...", { w: "grow", value: q, attrs: 'data-role="convo-search"' })}${iconButton("list-filter", "Filter conversations", { s: "iconSm" })}</div>
    <div class="min-h-0 grow overflow-y-auto px-1.5 pb-2 space-y-0.5" data-list>${body}</div></div>`;
}

function composer({ text = "", mode = 0, templates = false } = {}) {
  if (V2) return v2CommsComposer({ text, mode, templates });
  return `<div class="relative border-t border-gray-200/80 p-3">
    ${templates ? templateMenu() : ""}
    <div class="rounded-lg border border-gray-200 bg-white shadow-2xs focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-600/15">
      <div class="flex items-center gap-2 px-2 pt-2">${segmented(["Text", "Email", "Internal note"], mode, { sm: true })}<span class="ms-auto text-xs text-gray-400">From ${OFFICE_PHONE}</span></div>
      <textarea class="block w-full min-h-11 resize-none border-0 bg-transparent px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden" placeholder="Type a message..." aria-label="Message">${esc(text)}</textarea>
      <div class="flex items-center gap-1 px-1.5 pb-1.5">
        ${button("Templates", { v: templates ? "soft" : "quiet", s: "xs", icon: "file-text", attrs: `aria-haspopup="menu" aria-expanded="${templates}"` })}
        ${iconButton("paperclip", "Attach image", { s: "iconXs" })}${iconButton("smile", "Add emoji", { s: "iconXs" })}
        <span class="ms-auto me-1 text-xs text-gray-400 tabular-nums">${text ? `${text.length} / 160 · 1 text` : `${kbd("↵")} to send`}</span>
        ${button("Send", { v: "solid", s: "xs", icon: "send", attrs: text ? "" : "disabled" })}
      </div></div></div>`;
}
/* v2: one box, a text box that grows from one line, and one bottom row. Text / Email / Internal note and the From number
 * live in the first button's menu instead of a segmented row above the text. */
function v2CommsComposer({ text = "", mode = 0, templates = false }) {
  const [mi, ml] = [["message-square", "Text"], ["mail", "Email"], ["lock", "Internal note"]][mode];
  return `<div class="relative border-t border-gray-200/80 p-3">
    ${templates ? templateMenu() : ""}
    <div class="rounded-lg border border-gray-200 ${mode === 2 ? "bg-gray-50" : "bg-white"} shadow-2xs focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-600/15"${chg("The reply box is one line that grows as you type; Text, Email or Internal note and the From number moved into the first button's menu (about 40px more thread)")}>
      <textarea rows="1" class="block w-full min-h-10 max-h-40 [field-sizing:content] resize-none border-0 bg-transparent px-3 pt-2.5 pb-1 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden" placeholder="Type a message..." aria-label="Message">${esc(text)}</textarea>
      <div class="flex items-center gap-1 px-1.5 pb-1.5">
        ${button(ml, { v: "quiet", s: "xs", icon: mi, iconEnd: "chevron-down", attrs: `aria-haspopup="menu" aria-label="Send as ${ml} from ${OFFICE_PHONE}" data-tip="${ml} from ${OFFICE_PHONE}"` })}
        ${button("Templates", { v: templates ? "soft" : "quiet", s: "xs", icon: "file-text", attrs: `aria-haspopup="menu" aria-expanded="${templates}"` })}
        ${iconButton("paperclip", "Attach image", { s: "iconXs" })}${iconButton("smile", "Add emoji", { s: "iconXs" })}
        <span class="ms-auto me-1 text-xs text-gray-400 tabular-nums">${text ? `${text.length} / 160 · 1 text` : `${kbd("↵")} to send`}</span>
        ${button("Send", { v: "solid", s: "xs", icon: "send", attrs: text ? "" : "disabled" })}
      </div></div></div>`;
}
const TEMPLATES = [["Appointments", [["Appointment reminder", "Hi {{Patient Name}}, a reminder about your visit on {{Appointment Date}} at…"], ["Running late", "Hi {{Patient Name}}, we're running about 10 minutes behind today…"]]], ["Billing", [["Balance due", "Hi {{Patient Name}}, you have a balance of {{Balance}}. Pay here…"], ["Payment link", "Here's a secure link to pay {{Practice Name}}…"]]], ["Insurance", [["Insurance card request", "Could you send a photo of the front and back of your card?"]]]];
function templateMenu() {
  return `<div class="absolute bottom-[calc(100%-6px)] start-3 z-20 w-[360px] ${R.popover} p-1" role="menu" aria-label="Message templates">
    <div class="relative mb-1"><span class="absolute inset-y-0 start-0 flex items-center ps-2 pointer-events-none">${I("search", "size-4 text-gray-400")}</span><input class="w-full h-8 ps-8 pe-2 text-[13px] bg-transparent outline-hidden placeholder:text-gray-400 border-b border-gray-200/80" placeholder="Search custom messages…" aria-label="Search custom messages" /></div>
    ${TEMPLATES.map(([g, items], gi) => `<p class="${R.menuLabel}">${g}</p>${items.map(([t, prev], i) => `<button type="button" role="menuitem" class="flex w-full flex-col items-start gap-0.5 rounded-lg px-2 py-1.5 text-start cursor-pointer hover:bg-gray-100 ${gi === 0 && i === 1 ? "bg-gray-100" : ""}"><span class="text-[13px] font-medium text-gray-800">${t}</span><span class="w-full truncate text-xs text-gray-500">${esc(prev)}</span></button>`).join("")}`).join("")}
    <div class="${R.menuSep}"></div><button type="button" class="${R.menuItem}">${I("settings-2")}Manage templates</button></div>`;
}

/* v4: the conversation's ⋯ is the one Actions menu. Assign, Call, Resolve (the header) and Open chart and Send payment
 * link (the patient pane) already have buttons, so they aren't repeated here. */
const v4ConvoActions = (c) => { const first = P(c.pt).name.split(" ")[0];
  return [
    { label: "Conversation", items: [{ icon: "flag", label: "Flag conversation", hint: "Keep it at the top until someone handles it" }, { icon: "mail", label: "Mark as unread", hint: "Bring it back as new for the team" },
      { icon: "alarm-clock", label: "Snooze", hint: "Hide it until a time you pick" }, { icon: "notebook-pen", label: "Save to chart", hint: `Copy this thread into ${first}'s chart notes`, suggest: c.id === "k1" ? "Ava agreed to pay $184.00 at checkout; worth a note on her chart" : "" },
      { icon: "link", label: "Copy link", hint: "To paste in a message to a teammate" }] },
    { label: "Patient", items: [{ icon: "calendar-plus", label: "Schedule appointment", hint: `Book ${first} without leaving the thread`, suggest: c.id === "k7" ? "She asked to move her cleaning to a Saturday" : "" },
      { icon: "send", label: "Send forms", hint: "Text a link to forms to fill in" }, { icon: "list-plus", label: "Add to ASAP list", hint: "Offer an earlier time if one opens" }] },
    { label: "", items: [{ icon: "message-square-off", label: "Opt out of texts", danger: true }, { icon: "ban", label: "Block number", danger: true }] }]; };
/* v4: Assign is the teammate's initials (or the assign icon), named on hover, so the patient's name and number keep their room next to Actions */
const v4AssignBtn = (c) => { const tip = c.assigned ? `Assigned to ${c.assigned}. Click to change` : "Assign conversation";
  return `<span class="inline-flex"${chg4("Assign shows just the teammate's initials (their name on hover), so the patient's name and number fit next to the Actions menu.")}><button type="button" class="${cx(R.btn, R.xs, R.ghost, "text-gray-600 !px-1.5")}" aria-label="${esc(tip)}" data-tip="${esc(tip)}">${c.assigned ? avatar(c.assigned, { size: 5 }) : I("user-round-plus")}</button></span>`; };
const v4ConvoMenu = (c) => `<div class="ms-0.5"${chg4("The ⋯ is the one Actions menu: searchable, grouped by conversation and patient, with a sparkle on what Asha suggests now; Flag lives here.")}>${actionsMenu(v4ConvoActions(c), { dots: true, up: false, align: "end", open: V4_OPTS.open })}</div>`;
/* v4: a table of fields like the kit's fieldTable, with a grey hint per row (r.ph) */
const v4CommsFields = (rows, { labelW = 140, title = "Fields", onCommit = null, band = false } = {}) => sheetTable({ title, head: band, onCommit,
  rows: rows.map((r, i) => ({ id: `f${i}`, type: "text", ...r })),
  columns: [{ key: "label", label: band ? title : "Field", w: labelW, render: (r) => `<span class="text-gray-500">${esc(r.label)}</span>` },
    { key: "value", label: band ? "" : "Value", w: 160, grow: true, edit: (r) => (r.type === "none" ? null : r.type), options: (r) => r.options, placeholder: (r) => r.ph || `Add ${r.label.toLowerCase()}`, render: (r) => (r.html ? r.html(r) : esc(r.value)) }] });
const v4Dot = (tone, word) => `<span class="inline-flex items-center gap-2 min-w-0"><span class="${cx(R.dot, TONE_DOT[tone])}"></span>${esc(word)}</span>`;
function threadPane(state, c) {
  if (state === "Loading") return `<div class="flex min-h-0 flex-col"><div class="flex items-center gap-3 h-14 px-4 border-b border-gray-200/80"><span class="size-8 ${R.skel} !rounded-full"></span><span class="space-y-1.5">${skel("w-32")}${skel("w-24", "h-3")}</span></div>
    <div class="grow space-y-4 p-5">${[["w-56", "start"], ["w-72", "end"], ["w-40", "start"], ["w-64", "end"]].map(([w, s]) => `<div class="flex justify-${s}"><span class="block ${w} h-10 rounded-2xl ${R.skel}"></span></div>`).join("")}</div>${composer()}</div>`;
  if (state === "Empty" || !c) return `<div class="flex min-h-0 flex-col items-center justify-center">${emptyState({ icon: "messages-square", title: "Pick a conversation", body: "Or start one. Patients get texts from your office number, " + OFFICE_PHONE + "." })}</div>`;
  const p = P(c.pt);
  return `<div class="flex min-h-0 flex-col">
    <div class="flex items-center gap-3 h-14 shrink-0 px-4 border-b border-gray-200/80">
      ${avatar(p.name, { size: 8 })}
      <div class="min-w-0"><p class="truncate text-sm font-semibold text-gray-800">${esc(p.name)}</p><p class="text-xs text-gray-500 tabular-nums${V4 ? " truncate" : ""}">${p.phone} · ${CH[c.ch][1]}</p></div>
      <div class="ms-auto flex items-center gap-1${V4 ? " shrink-0" : ""}">
        ${V4 ? v4AssignBtn(c) : `<button type="button" class="${cx(R.btn, R.xs, R.ghost, "text-gray-600")}" aria-label="Assign conversation">${c.assigned ? avatar(c.assigned, { size: 5 }) + esc(c.assigned.split(" ")[0]) : `${I("user-round-plus")}Assign`}</button>`}
        ${iconButton("phone", "Call patient", { s: "iconSm" })}${V2 ? "" : iconButton("flag", "Flag this conversation", { s: "iconSm" })}
        ${button(c.resolved ? "Reopen" : "Resolve", { v: "white", s: "sm", icon: c.resolved ? "rotate-ccw" : "check" })}
        ${V4 ? v4ConvoMenu(c) : V2 ? `<span class="inline-flex"${chg("Flag moved into the ⋯ menu, so the header has four controls instead of five")}>${iconButton("ellipsis", "More conversation actions, including Flag", { s: "iconSm" })}</span>` : iconButton("ellipsis", "More conversation actions", { s: "iconSm" })}</div></div>
    <div class="min-h-0 grow overflow-y-auto px-5 py-4 space-y-3" data-thread>${threadBody(c.thread)}</div>
    ${composer()}</div>`;
}

const INFO_APPTS = { p1: [["Today, 9:00 AM", "Adult cleaning, Periodic exam", "Hyg 1 · Sofia R."], ["Mar 26, 2027, 9:00 AM", "Adult cleaning", "Hyg 1 · Sofia R."]], p8: [["Mon, Sep 28, 9:00 AM", "Crown seat #30", "Op 1 · Dr. Patel"]], p13: [], p5: [["Today, 11:00 AM", "Perio maintenance", "Op 2 · Dr. Brooks"]], p9: [["Today, 9:30 AM", "Comprehensive exam, Full mouth x-rays", "Op 1 · Dr. Patel"]], p10: [["Today, 10:30 AM", "Periodic exam", "Op 1 · Dr. Patel"]], p3: [["Today, 8:00 AM", "Adult cleaning", "Hyg 2 · Jordan K."]] };
function infoPane(state, c) {
  if (V2) return v2CommsInfoPane(state, c);
  if (state === "Loading") return `<div class="border-s border-gray-200/80 p-4 space-y-3">${skel("w-24", "h-9")}${skel("w-3/4")}${skel("w-1/2", "h-3")}<div class="pt-4 space-y-2">${skel()}${skel("w-5/6")}${skel("w-2/3")}</div></div>`;
  if (state === "Empty" || !c) return `<div class="border-s border-gray-200/80 bg-white"></div>`;
  const p = P(c.pt), pay = p.payer ? DATA.payer(p.payer).short : null;
  const appts = INFO_APPTS[p.id] || [];
  const sec = (title, body, extra = "") => `<section class="px-4 py-3.5 border-t border-gray-200/80"><div class="mb-2 flex min-h-6 items-center justify-between gap-2"><h3 class="text-xs font-medium text-gray-500">${title}</h3>${extra}</div>${body}</section>`;
  return `<aside class="min-h-0 overflow-y-auto border-s border-gray-200/80" aria-label="Patient info">
    <div class="px-4 pt-4 pb-3.5">
      ${avatar(p.name, { size: 10 })}
      <p class="mt-2 text-sm font-semibold text-gray-800">${esc(p.name)}</p>
      <p class="text-[13px] text-gray-500 tabular-nums">${fmtDateY(p.dob)} · ${p.age} yrs</p>
      <div class="mt-2.5 flex gap-1.5">${button("Open chart", { v: "white", s: "xs", icon: "file-user" })}${iconButton("phone", "Call patient", { v: "white", s: "iconXs" })}</div>
    </div>
    ${sec("Upcoming appointments", appts.length ? `<ul class="space-y-2.5">${appts.map(([when, what, where]) => `<li class="text-[13px]"><p class="font-medium text-gray-800">${when}</p><p class="text-gray-600 truncate">${what}</p><p class="text-xs text-gray-500">${where}</p></li>`).join("")}</ul>` : `<p class="text-[13px] text-gray-500">Nothing booked.</p>`, appts.length ? "" : button("Schedule", { v: "white", s: "xs", icon: "calendar-plus" }))}
    ${sec("Balance", `<div class="space-y-1 text-[13px]"><div class="flex justify-between"><span class="text-gray-500">Patient</span><span class="font-medium tabular-nums text-gray-800">${money(p.balance)}</span></div><div class="flex justify-between"><span class="text-gray-500">Ins. est.</span><span class="tabular-nums text-gray-800">${money(p.insBalance)}</span></div></div>`, p.balance ? button("Send payment link", { v: "white", s: "xs" }) : "")}
    ${sec("Insurance", pay ? `<p class="text-[13px] text-gray-800">${pay}</p><div class="mt-1">${statusDot("Ins. verified", "on", "!text-[13px] !text-gray-600")}</div>` : `<p class="text-[13px] text-gray-500">Self-pay</p>`)}
    ${p.alerts.length ? sec("Alerts", `<div class="-my-1.5 [&>div]:text-[13px]">${p.alerts.map((a) => (a === "Premedicate" ? infoRow("circle-alert", a, { tone: "needs" }) : infoRow(/allergy/i.test(a) ? "pill" : "heart-pulse", esc(a)))).join("")}</div>`) : ""}
  </aside>`;
}
/* v2: the patient pane is the standard 300px context pane built from psec() sections (14px titles, 20px padding), with
 * one Call button on the screen (the thread header's) and no "Ins. verified" status for the normal case. */
/* v4: the patient pane starts with the one patient header (alerts as one icon with the count, the family balance as a
 * wallet), so the Balance and Alerts sections are gone; Send payment link sits with Open chart */
/* v4: a patient's upcoming visits as a compact table; the chair and provider are on hover */
const v4CommsAppts = (appts) => sheetTable({ sheet: false, title: "Upcoming appointments", rows: appts.map(([when, what, where], i) => ({ id: `ap${i}`, when, what, where })),
  peek: (r) => peekCard(esc(r.when), [["Visit", esc(r.what)], ["Chair", esc(r.where.split(" · ")[0])], ["With", esc(r.where.split(" · ")[1] || "")]]),
  columns: [{ key: "when", label: "When", w: 140, render: (r) => `<span class="tabular-nums">${esc(r.when.replace(/, \d{4},/, ","))}</span>` }, { key: "what", label: "Visit", w: 120, grow: true, render: (r) => esc(r.what) }] });
function v4CommsInfoPane(c) {
  const p = P(c.pt), pay = p.payer ? DATA.payer(p.payer).short : null, appts = INFO_APPTS[p.id] || [];
  return `<aside class="min-h-0 overflow-y-auto border-s border-gray-200/80" aria-label="Patient info">
    <div${chg4("The pane starts with the one patient header: her medical alerts are one icon with the count by the name (orange when someone must act first) and the family balance is a wallet with the amount, so the Balance and Alerts sections are gone. The thread already shows her picture, so the pane doesn't repeat it, and the pane is 20px wider so her name fits")}>${patientHeader({ name: esc(p.name), sub: `${fmtDateY(p.dob)} · ${p.age} yrs`, alerts: p.alerts, familyBalance: p.balance, lead: "", rule: false })}</div>
    <div class="flex gap-1.5 px-5 pb-4">${button("Open chart", { v: "white", s: "xs", icon: "file-user" })}${p.balance ? button("Send payment link", { v: "white", s: "xs" }) : ""}</div>
    ${psec("Upcoming appointments", appts.length ? `<div${chg4("Upcoming visits are a compact table, when and what, one line each; the chair and provider open in a card beside the pane when you point at a visit, instead of three stacked lines per visit.")}>${v4CommsAppts(appts)}</div>` : `<p class="text-[13px] text-gray-500">Nothing booked.</p>`, { actions: appts.length ? "" : button("Schedule", { v: "white", s: "xs", icon: "calendar-plus" }) })}
    ${psec("Insurance", pay ? `<p class="text-[13px] text-gray-800">${pay}</p><p class="text-[13px] text-gray-500 tabular-nums">${MONEY_LABEL.insEst} ${money(p.insBalance)}</p>` : `<p class="text-[13px] text-gray-500">Self-pay</p>`)}
  </aside>`;
}
function v2CommsInfoPane(state, c) {
  if (V4 && state !== "Loading" && state !== "Empty" && c) return v4CommsInfoPane(c);
  if (state === "Loading") return `<div class="border-s border-gray-200/80 p-5 space-y-3">${skel("w-24", "h-9")}${skel("w-3/4")}${skel("w-1/2", "h-3")}<div class="pt-4 space-y-2">${skel()}${skel("w-5/6")}${skel("w-2/3")}</div></div>`;
  if (state === "Empty" || !c) return `<div class="border-s border-gray-200/80 bg-white"></div>`;
  const p = P(c.pt), pay = p.payer ? DATA.payer(p.payer).short : null, appts = INFO_APPTS[p.id] || [];
  return `<aside class="min-h-0 overflow-y-auto border-s border-gray-200/80" aria-label="Patient info"${chg("The patient pane is the standard 300px side panel: same section titles and padding as every other panel")}>
    <div class="px-5 pt-4 pb-4">
      ${avatar(p.name, { size: 10 })}
      <p class="mt-2 text-sm font-semibold text-gray-800">${esc(p.name)}</p>
      <p class="text-[13px] text-gray-500 tabular-nums">${fmtDateY(p.dob)} · ${p.age} yrs</p>
      <div class="mt-2.5 flex gap-1.5"${chg("The second Call button is gone; Call stays in the thread header")}>${button("Open chart", { v: "white", s: "xs", icon: "file-user" })}</div>
    </div>
    ${psec("Upcoming appointments", appts.length ? `<ul class="space-y-2.5">${appts.map(([when, what, where]) => `<li class="text-[13px]"><p class="font-medium text-gray-800">${when}</p><p class="text-gray-600 truncate">${what}</p><p class="text-xs text-gray-500">${where}</p></li>`).join("")}</ul>` : `<p class="text-[13px] text-gray-500">Nothing booked.</p>`, { actions: appts.length ? "" : button("Schedule", { v: "white", s: "xs", icon: "calendar-plus" }) })}
    ${psec("Balance", `<div class="space-y-1 text-[13px]"><div class="flex justify-between"><span class="text-gray-500">Patient</span><span class="font-medium tabular-nums text-gray-800">${money(p.balance)}</span></div><div class="flex justify-between"><span class="text-gray-500">${MONEY_LABEL.insEst}</span><span class="tabular-nums text-gray-800">${money(p.insBalance)}</span></div></div>`, { actions: p.balance ? button("Send payment link", { v: "white", s: "xs" }) : "" })}
    ${psec("Insurance", pay ? `<p class="text-[13px] text-gray-800"${chg("Insurance shows the plan only; 'Verified' is the normal case, so only a problem would show here")}>${pay}</p>` : `<p class="text-[13px] text-gray-500">Self-pay</p>`)}
    ${p.alerts.length ? psec("Alerts", `<div class="-my-1.5 [&>div]:text-[13px]">${p.alerts.map((a) => (a === "Premedicate" ? infoRow("circle-alert", a, { tone: "needs" }) : infoRow(/allergy/i.test(a) ? "pill" : "heart-pulse", esc(a)))).join("")}</div>`) : ""}
  </aside>`;
}

/* ============================================================ 1. Messaging inbox */
defineBlock({
  cat: "comms", id: "comms-inbox", thumb: true,
  title: "Messaging inbox",
  note: "Three panes: conversations, the thread, and the patient beside it. The office's texts are blue, the patient's are grey, and Asha's texts say which helper sent them. Click a conversation, switch to Resolved, or search.",
  where: "Communications › Messaging",
  states: ["Normal", "Empty", "Loading"],
  canvas: "bare",
  html: (state) => `${workspaceHeader({ parent: "Communications", title: "Messaging", actions: `${button("All lines", { v: "quiet", s: "sm", icon: "phone", iconEnd: "chevron-down" })}${iconButton("settings-2", "Messaging settings", { s: "iconSm" })}${button("New conversation", { v: "solid", s: "sm", icon: "square-pen" })}` })}
    <div class="grid h-[640px] ${V4 ? "grid-cols-[300px_minmax(0,1fr)_320px]" : V2 ? "grid-cols-[300px_minmax(0,1fr)_300px]" : "grid-cols-[300px_minmax(0,1fr)_256px]"}" data-inbox>
      ${listPane(state)}${threadPane(state, state === "Normal" ? CONVOS[0] : null)}${infoPane(state, state === "Normal" ? CONVOS[0] : null)}
    </div>`,
  mount: (el, state) => {
    if (state !== "Normal") return;
    const root = el.querySelector("[data-inbox]"); let tab = 0, q = "", sel = "k1";
    const draw = () => { const c = CONVOS.find((x) => x.id === sel);
      root.innerHTML = listPane("Normal", tab, q, sel) + threadPane("Normal", c) + infoPane("Normal", c); icons();
      const s = root.querySelector('[data-role="convo-search"]'); if (q && s) { s.focus(); s.setSelectionRange(q.length, q.length); }
      const th = root.querySelector("[data-thread]"); if (th) th.scrollTop = th.scrollHeight; };
    const th = root.querySelector("[data-thread]"); if (th) th.scrollTop = th.scrollHeight;
    root.addEventListener("click", (e) => {
      const b = e.target.closest("[data-convo]"); if (b) { sel = b.dataset.convo; const c = CONVOS.find((x) => x.id === sel); c.unread = false; return draw(); }
      const t = e.target.closest("[data-list-tabs] [data-tab]"); if (t) { tab = +t.dataset.tab; const first = CONVOS.find((c) => (tab ? c.resolved : !c.resolved)); sel = first ? first.id : sel; draw(); }
    });
    root.addEventListener("input", (e) => { if (e.target.dataset.role === "convo-search") { q = e.target.value; draw(); } });
  }
});

/* ============================================================ 2. Text thread details */
defineBlock({
  cat: "comms", id: "comms-thread-details", title: "Text thread details",
  note: "The parts of one thread up close: read and delivered marks, a text Asha sent with the helper's name, an internal note only the team sees, and the reply box with templates, Attach and Send.",
  where: "Communications › Messaging › a conversation",
  states: ["Templates open", "Writing a reply", "Couldn't send"],
  canvas: "gray",
  html: (state) => {
    const c = CONVOS[0], p = P(c.pt);
    const msgs = [{ day: "Yesterday" }, ...c.thread.slice(3)];
    if (state === "Couldn't send") msgs.push({ dir: "out", by: "Nina Flores", time: "8:31 AM", receipt: "failed", why: "The carrier rejected it. Try again or call.", text: "Also, your insurance renewed this month, so bring your new card if you have one." });
    const draft = state === "Writing a reply" ? "Hi Ava, we're running about 10 minutes behind. You're still all set for 9:00 AM, no need to rush." : "";
    const part = (label, body) => `<div class="px-5 py-4 border-t border-gray-200/80"><p class="${R.caption} mb-2.5">${label}</p>${body}</div>`;
    /* v2: no legend card (no Asha screen has one). The thread sits at inbox width beside the real patient pane, and each
     * mark explains itself on hover. */
    if (V2) return `<div class="${R.box} overflow-visible grid grid-cols-[minmax(0,1fr)_300px]"${chg("The 'What each mark means' card is gone: the thread sits beside the real patient pane, and each delivery mark explains itself on hover")}>
      <div class="flex min-w-0 flex-col">
        <div class="flex items-center gap-3 h-14 px-4 border-b border-gray-200/80">${avatar(p.name, { size: 8 })}<div><p class="text-sm font-semibold text-gray-800">${esc(p.name)}</p><p class="text-xs text-gray-500 tabular-nums">${p.phone} · Text</p></div><div class="ms-auto flex items-center gap-1">${iconButton("phone", "Call patient", { s: "iconSm" })}${button("Resolve", { v: "white", s: "sm", icon: "check" })}${V4 ? v4ConvoMenu(c) : iconButton("ellipsis", "More conversation actions, including Flag", { s: "iconSm" })}</div></div>
        <div class="grow px-5 pt-4 pb-5 space-y-3">${threadBody(msgs)}</div>
        ${composer({ text: draft, templates: state === "Templates open" })}
      </div>${infoPane("Normal", c)}</div>`;
    return `<div class="grid grid-cols-[minmax(0,1fr)_340px] items-start gap-6">
      <div class="${R.box} overflow-visible">
        <div class="flex items-center gap-3 h-14 px-4 border-b border-gray-200/80">${avatar(p.name, { size: 8 })}<div><p class="text-sm font-semibold text-gray-800">${esc(p.name)}</p><p class="text-xs text-gray-500 tabular-nums">${p.phone} · Text</p></div><div class="ms-auto flex items-center gap-1">${iconButton("phone", "Call patient", { s: "iconSm" })}${button("Resolve", { v: "white", s: "sm", icon: "check" })}</div></div>
        <div class="px-5 pt-4 pb-5 space-y-3">${msgs.map((m) => (m.day ? dayRule(m.day) : bubble(m))).join("")}</div>
        ${composer({ text: draft, templates: state === "Templates open" })}
      </div>
      <div class="${R.box}">
        <h3 class="${R.groupTitle} px-5 py-3.5">What each mark means</h3>
        ${part("Delivery", `<div class="space-y-2 text-[13px] text-gray-700">${[["loader-circle", "text-gray-400", "Sending…", "On its way"], ["check", "text-gray-400", "Delivered", "On the patient's phone"], ["check-check", "text-blue-600", "Read", "They opened it"], ["circle-x", "text-red-600", "Not delivered", "Retry, or call instead"]].map(([ic, c, l, d]) => `<p class="grid grid-cols-[16px_104px_1fr] items-center gap-2">${I(ic, `size-3.5 ${c}`)}<span class="text-gray-500">${l}</span><span>${d}</span></p>`).join("")}</div><p class="${R.help} mt-2">Read shows only when the patient's phone reports it.</p>`)}
        ${part("Sent by Asha", `<p class="flex items-center gap-x-1.5 text-xs text-gray-500">${asha("Asha · AI Receptionist")}<span class="text-gray-300">·</span>10:14 AM</p><p class="${R.help} mt-1.5">Every text an AI helper sends names the helper, so you always know who said what.</p>`)}
        ${part("Internal note", bubble({ kind: "note", by: "Nina Flores", time: "8:20 AM", text: "Fine to collect at checkout." }).replace("max-w-[88%]", "max-w-full").replace(/<span class="ms-auto[^<]*<\/span>/, "") + `<p class="${R.help} mt-1.5">Grey, with a lock. Patients never see it.</p>`)}
      </div></div>`;
  }
});

/* ============================================================ 3. Reminders & confirmations */
const SAMPLE = { "Patient Name": "Ava", "Practice Name": OFFICE, "Appointment Date": "Fri, Sep 25", "Appointment Time": "9:00 AM", "Provider": "Sofia", "Office Phone": OFFICE_PHONE };
const DEFAULT_TPL = "Hi {{Patient Name}}, this is {{Practice Name}}. Reminder: your visit with {{Provider}} is {{Appointment Date}} at {{Appointment Time}}. Reply YES to confirm or call {{Office Phone}} to change it.";
const fillTpl = (t, when) => esc(t).replace(/\{\{([^}]+)\}\}/g, (m, k) => (k === "Appointment Date" ? { 0: "on Fri, Sep 25", 1: "on Fri, Sep 25", 2: "today" }[when] : SAMPLE[k] ?? m)).replace(/ is on /, " is on ");
function phonePreview(tpl, when, on) {
  const stamp = ["Fri, Sep 18 · 10:00 AM", "Wed, Sep 23 · 10:00 AM", "Today · 7:00 AM"][when];
  const text = fillTpl(tpl, when);
  return `<div class="mx-auto w-[292px] rounded-[44px] border border-gray-200/80 bg-white p-2.5 shadow-2xs">
    <div class="relative h-[540px] overflow-hidden rounded-[36px] bg-gray-50">
      <div class="flex items-center justify-between px-6 pt-3 text-[11px] font-semibold text-gray-800"><span>9:41</span><span class="absolute left-1/2 top-2.5 h-5 w-20 -translate-x-1/2 rounded-full bg-gray-900"></span><span class="flex items-center gap-1">${I("signal", "size-3")}${I("wifi", "size-3")}${I("battery-full", "size-3.5")}</span></div>
      <div class="mt-3 flex flex-col items-center border-b border-gray-200/80 bg-white pb-2.5">${avatar(OFFICE, { size: 9 })}<p class="mt-1 text-[11px] font-medium text-gray-800">${OFFICE}</p><p class="text-[10px] text-gray-500 tabular-nums">${OFFICE_PHONE}</p></div>
      ${on ? `<div class="space-y-2 px-3 pt-3" data-preview-body>
        <p class="text-center text-[10px] text-gray-400">Text Message · ${stamp}</p>
        <div class="max-w-[82%] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-[12px] leading-[17px] text-gray-800 ring-1 ring-gray-200/80" data-preview-text>${text}</div>
        <div class="flex justify-end"><div class="rounded-2xl rounded-br-md bg-blue-600 px-3 py-1.5 text-[12px] text-white">YES</div></div>
        <div class="max-w-[82%] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-[12px] leading-[17px] text-gray-800 ring-1 ring-gray-200/80">Thanks, Ava. You're confirmed. See you then!</div>
      </div>` : `<div class="flex h-80 flex-col items-center justify-center gap-2 px-8 text-center">${I("bell-off", "size-5 text-gray-400")}<p class="text-[12px] text-gray-500">Reminders are off. Patients won't get a text before their visit.</p></div>`}
      <div class="absolute inset-x-3 bottom-4 flex items-center gap-2 rounded-full border border-gray-200/80 bg-white px-3 py-1.5 text-[11px] text-gray-400">Text Message<span class="ms-auto flex size-5 items-center justify-center rounded-full bg-gray-200 text-white">${I("arrow-up", "size-3")}</span></div>
    </div></div>`;
}
const setRow = (label, help, control, { info = false, cls = "", stacked = false } = {}) => `<div class="${stacked ? "" : "flex items-center justify-between gap-6"} px-4 py-2.5 min-h-11 ${cls}">
  <div class="min-w-0"><p class="${R.label} flex items-center gap-1.5">${label}${info ? `<button type="button" aria-label="What is this?" class="text-gray-400 hover:text-gray-600">${I("info", "size-3.5")}</button>` : ""}</p>${help ? `<p class="${R.help}">${help}</p>` : ""}</div>${stacked ? `<div class="mt-2.5">${control}</div>` : `<div class="shrink-0">${control}</div>`}</div>`;
const chipToggle = (label, on) => `<button type="button" aria-pressed="${on}" data-chip class="${cx(R.btn, R.xs, on ? R.soft : R.white)}">${on ? I("check") : ""}${label}</button>`;
/* v2 reminders: settings-row anatomy (one line, control right), one multi-select for when to send, one Insert field menu,
 * fields as grey pills in the message, and the registration problem as an alertMark on the switch it blocks. */
const V2_VARS = [["Patient Name", "Patient name"], ["Appointment Date", "Visit date"], ["Appointment Time", "Visit time"], ["Provider", "Provider"], ["Office Phone", "Office phone"], ["Practice Name", "Practice name"]];
const v2Pill = (k) => `<span contenteditable="false" data-pill="${esc(k)}" class="mx-px inline-flex items-center rounded-md bg-gray-100 px-1.5 text-[13px] leading-5 text-gray-700">${esc((V2_VARS.find(([v]) => v === k) || [k, k])[1])}</span>`;
const v2Editor = (tpl) => esc(tpl).replace(/\{\{([^}]+)\}\}/g, (m, k) => v2Pill(k));
const v2TplOf = (el) => { const d = el.cloneNode(true); d.querySelectorAll("[data-pill]").forEach((p) => p.replaceWith(`{{${p.dataset.pill}}}`)); return d.textContent; };
const V2_WHEN = [["7 days before", true], ["2 days before", true], ["1 day before", false], ["2 hours before", true]];
const v2WhenLabel = (picked) => picked.filter(([, on]) => on).map(([l]) => l.replace(" before", "")).join(", ") || "Pick when";
const v2WhenMenu = (picked) => `<div class="absolute end-0 top-full mt-1 z-30 ${R.menu} !w-52" role="menu" aria-label="When to send" data-v2-when-menu hidden>${picked.map(([l, on], i) => `<button type="button" role="menuitemcheckbox" aria-checked="${on}" class="${R.menuItem}" data-v2-when="${i}">${l}${on ? I("check", "ms-auto !text-blue-600") : ""}</button>`).join("")}</div>`;
function v2CommsReminders(state) {
  const on = state !== "Reminders off";
  const follow = (label, control) => `<div class="flex items-center justify-between gap-6 ps-10 pe-4 py-2.5 min-h-11"${chg("A follow-up question is indented with a small arrow and no grey fill, the same as on every settings page")}><p class="${R.label} flex items-center gap-1.5">${I("corner-down-right", "size-3.5 text-gray-300")}${label}</p><div class="shrink-0">${control}</div></div>`;
  return `${workspaceHeader({ parent: "Practice Settings", title: OFFICE })}
    <div class="px-8 pt-7 pb-8">
      <h1 class="${R.pageTitle}">Reminders and confirmations</h1>
      <p class="${R.secondary} mt-1">The texts patients get before a visit, and what happens when they reply.</p>
      <div class="mt-7 grid grid-cols-[minmax(0,1fr)_300px] items-start gap-10">
        <div class="min-w-0 space-y-8">
          <section><h2 class="${R.groupTitle} mb-2">Reminders</h2>
            <div class="${R.box} divide-y divide-gray-200/80"${on ? "" : chg("The extra 'Turn this on' note under the box is gone: the switch and the phone already say reminders are off")}>
              ${setRow("Send appointment reminders", `By text, from your office number ${OFFICE_PHONE}.`, `<div class="flex items-center gap-3">${state === "Needs you" ? `<span class="inline-flex"${chg("The registration problem is a few words on the switch it blocks, with the fix on hover, instead of a sentence row inside the box")}>${alertMark("Not sending yet", "Reminders can't go out yet. Your texting number needs its carrier registration finished. It takes about 5 minutes.", { action: button("Finish registration", { v: "white", s: "xs" }) })}</span>` : ""}${sw(on, "Send appointment reminders")}</div>`, { info: true })}
              ${on ? `${setRow("When to send", "Up to three texts before each visit.", `<div class="relative" data-v2-when-wrap${chg("When to send is one select with checkmarks in its menu, instead of a stacked row of blue chips")}><button type="button" class="${R.select} !w-56" aria-haspopup="menu" data-v2-when-btn><span class="truncate" data-v2-when-label>${v2WhenLabel(V2_WHEN)}</span>${I("chevrons-up-down")}</button>${v2WhenMenu(V2_WHEN)}</div>`)}
              ${setRow("Quiet hours", "Texts that fall in this window wait until morning.", `<button type="button" class="${R.select} !w-52 whitespace-nowrap">${I("moon", "!text-gray-500")}<span class="grow text-start">8:00 PM – 8:00 AM</span>${I("chevrons-up-down")}</button>`)}` : ""}
            </div></section>
          ${on ? `<section><h2 class="${R.groupTitle} mb-2">Confirmations</h2>
            <div class="${R.box} divide-y divide-gray-200/80">
              ${setRow("Ask patients to confirm", "Adds “Reply YES to confirm” to each reminder.", sw(true, "Ask patients to confirm"), { info: true })}
              ${follow("When they reply YES", `<button type="button" class="${R.select} !w-64"><span class="inline-flex items-center gap-2">${statusDot("Confirmed", "on")}<span class="text-gray-500">on the schedule</span></span>${I("chevrons-up-down")}</button>`)}
              ${setRow("If there's no reply by the day before", "Asha follows up once, then the front desk takes over.", `<button type="button" class="${R.select} !w-64">Asha calls, then adds a task${I("chevrons-up-down")}</button>`)}
            </div></section>
          <section><div class="mb-2 flex items-center justify-between"><h2 class="${R.groupTitle}">Message</h2>${button("Reset to default", { v: "quiet", s: "xs", icon: "rotate-ccw" })}</div>
            <div class="${R.box} p-4">
              <div id="rem-tpl" role="textbox" aria-multiline="true" aria-label="Reminder text" contenteditable="true" class="${R.textarea} min-h-24 !h-auto whitespace-pre-wrap leading-6" data-role="tpl"${chg("Fields show as grey pills in the message instead of raw {{Patient Name}} code")}>${v2Editor(DEFAULT_TPL)}</div>
              <div class="mt-2.5 flex items-center justify-between gap-3"><p class="${R.help}" data-role="count"></p>
                <div class="relative shrink-0"${chg("One Insert field menu replaces five bordered + buttons")}>${button("Insert field", { v: "quiet", s: "xs", icon: "braces", attrs: 'aria-haspopup="menu" data-v2-insert-btn' })}
                  <div class="absolute end-0 bottom-full mb-1 z-30 ${R.menu} !w-48" role="menu" aria-label="Insert field" data-v2-insert-menu hidden>${V2_VARS.slice(0, 5).map(([v, l]) => `<button type="button" role="menuitem" class="${R.menuItem}" data-v2-var="${v}">${l}</button>`).join("")}</div></div></div>
            </div></section>` : ""}
        </div>
        <div class="sticky top-4">
          <div class="mb-3 flex items-center justify-between"><p class="text-xs font-medium text-gray-500">What Ava sees</p>${segmented(["7 days", "2 days", "2 hours"], 1, { sm: true, attrs: 'data-role="when"' })}</div>
          <div data-role="phone">${phonePreview(DEFAULT_TPL, 1, on)}</div>
          <p class="${R.caption} mt-3 text-center">Sample patient. Real texts use each patient's details.</p>
        </div>
      </div></div>`;
}
defineBlock({
  cat: "comms", id: "comms-reminders", title: "Reminders and confirmations",
  note: "Settings rows on the left and the text the patient will actually get on the right. Edit the message and the phone updates as you type. Pick 7 days, 2 days or 2 hours to see each one.",
  where: "Settings › Phones & messages › Reminders",
  states: ["Normal", "Needs you", "Reminders off"],
  canvas: "bare",
  html: (state) => {
    if (V2) return v2CommsReminders(state);
    const on = state !== "Reminders off";
    return `${workspaceHeader({ parent: "Practice Settings", title: OFFICE })}
    <div class="px-8 pt-7 pb-8">
      <h1 class="${R.pageTitle}">Reminders and confirmations</h1>
      <p class="${R.secondary} mt-1">The texts patients get before a visit, and what happens when they reply.</p>
      <div class="mt-7 grid grid-cols-[minmax(0,1fr)_300px] items-start gap-10">
        <div class="min-w-0 space-y-8">
          <section><h2 class="${R.groupTitle} mb-2">Reminders</h2>
            <div class="${R.box} divide-y divide-gray-200/80">
              ${state === "Needs you" ? `<div class="flex items-center justify-between gap-4 px-4 py-3">${note(`Reminders can't go out yet. Your texting number needs its carrier registration finished. It takes about 5 minutes.`)}${button("Finish registration", { v: "white", s: "xs", cls: "shrink-0" })}</div>` : ""}
              ${setRow("Send appointment reminders", `By text, from your office number ${OFFICE_PHONE}.`, sw(on, "Send appointment reminders"), { info: true })}
              ${on ? `${setRow("When to send", "Up to three texts before each visit.", `<div class="flex flex-wrap gap-1.5">${chipToggle("7 days before", true)}${chipToggle("2 days before", true)}${chipToggle("2 hours before", true)}${chipToggle("1 day before", false)}</div>`, { stacked: true })}
              ${setRow("Quiet hours", "Texts that fall in this window wait until morning.", `<button type="button" class="${R.select} !w-52 whitespace-nowrap">${I("moon", "!text-gray-500")}<span class="grow text-start">8:00 PM – 8:00 AM</span>${I("chevrons-up-down")}</button>`)}` : ""}
            </div>${on ? "" : `<div class="mt-3">${note("Turn this on to text patients before each visit. You'll pick when the texts go out and what they say.", "info")}</div>`}</section>
          ${on ? `<section><h2 class="${R.groupTitle} mb-2">Confirmations</h2>
            <div class="${R.box} divide-y divide-gray-200/80">
              ${setRow("Ask patients to confirm", "Adds “Reply YES to confirm” to each reminder.", sw(true, "Ask patients to confirm"), { info: true })}
              <div class="bg-gray-50/60">${setRow(`<span class="text-gray-400">${I("corner-down-right", "size-3.5")}</span>When they reply YES`, "", `<button type="button" class="${R.select} !w-64"><span class="inline-flex items-center gap-2">${statusDot("Confirmed", "on")}<span class="text-gray-500">on the schedule</span></span>${I("chevrons-up-down")}</button>`, { cls: "ps-8" })}</div>
              ${setRow("If there's no reply by the day before", "Asha follows up once, then the front desk takes over.", `<button type="button" class="${R.select} !w-64">Asha calls, then adds a task${I("chevrons-up-down")}</button>`)}
            </div></section>
          <section><div class="mb-2 flex items-center justify-between"><h2 class="${R.groupTitle}">Message</h2>${button("Reset to default", { v: "quiet", s: "xs", icon: "rotate-ccw" })}</div>
            <div class="${R.box} p-4">
              <label class="sr-only" for="rem-tpl">Reminder text</label>
              <textarea id="rem-tpl" class="${R.textarea} min-h-24" data-role="tpl">${esc(DEFAULT_TPL)}</textarea>
              <div class="mt-2.5 flex flex-wrap items-center gap-1.5"><span class="me-1 text-xs text-gray-500">Insert</span>${[["Patient Name", "Name"], ["Appointment Date", "Date"], ["Appointment Time", "Time"], ["Provider", "Provider"], ["Office Phone", "Office phone"]].map(([v, l]) => `<button type="button" data-var="${v}" title="Insert {{${v}}}" class="${cx(R.btn, R.xs, R.white, "!h-6 !px-2 !text-xs")}">${I("plus")}${l}</button>`).join("")}</div>
              <p class="${R.help} mt-2.5" data-role="count"></p>
            </div></section>` : ""}
        </div>
        <div class="sticky top-4">
          <div class="mb-3 flex items-center justify-between"><p class="text-xs font-medium text-gray-500">What Ava sees</p>${segmented(["7 days", "2 days", "2 hours"], 1, { sm: true, attrs: 'data-role="when"' })}</div>
          <div data-role="phone">${phonePreview(DEFAULT_TPL, 1, on)}</div>
          <p class="${R.caption} mt-3 text-center">Sample patient. Real texts use each patient's details.</p>
        </div>
      </div></div>`;
  },
  mount: (el, state) => {
    if (V2) return v2CommsRemindersMount(el, state);
    const on = state !== "Reminders off"; let when = 1;
    const ta = el.querySelector('[data-role="tpl"]'), phone = el.querySelector('[data-role="phone"]'), count = el.querySelector('[data-role="count"]');
    const draw = () => { const t = ta ? ta.value : DEFAULT_TPL; phone.innerHTML = phonePreview(t, when, on); icons();
      if (count) { const n = fillTpl(t, when).replace(/&[a-z#0-9]+;/g, "x").length, texts = Math.ceil(n / 160);
        count.innerHTML = texts > 1 ? flag(`${n} characters, so each reminder goes out as ${texts} texts. Shorten it to stay at 1.`, "!text-[13px]") : `${n} of 160 characters · 1 text`; icons(); } };
    draw();
    if (ta) ta.addEventListener("input", draw);
    el.addEventListener("click", (e) => {
      const v = e.target.closest("[data-var]"); if (v && ta) { const s = ta.selectionStart ?? ta.value.length; ta.value = ta.value.slice(0, s) + `{{${v.dataset.var}}}` + ta.value.slice(s); draw(); }
      const w = e.target.closest('[data-role="when"] [data-seg]'); if (w) { when = +w.dataset.seg; draw(); }
      const c = e.target.closest("[data-chip]"); if (c) { const now = c.getAttribute("aria-pressed") !== "true"; c.setAttribute("aria-pressed", now); c.className = cx(R.btn, R.xs, now ? R.soft : R.white); c.innerHTML = (now ? I("check") : "") + c.textContent; icons(); }
    });
  }
});

function v2CommsRemindersMount(el, state) {
  const on = state !== "Reminders off", picked = V2_WHEN.map(([l, v]) => [l, v]); let when = 1, caret = null;
  const ed = el.querySelector('[data-role="tpl"]'), phone = el.querySelector('[data-role="phone"]'), count = el.querySelector('[data-role="count"]');
  const draw = () => { const t = ed ? v2TplOf(ed) : DEFAULT_TPL; phone.innerHTML = phonePreview(t, when, on); icons();
    if (count) { const n = fillTpl(t, when).replace(/&[a-z#0-9]+;/g, "x").length, texts = Math.ceil(n / 160);
      count.innerHTML = texts > 1 ? flag(`${n} characters, so each reminder goes out as ${texts} texts. Shorten it to stay at 1.`, "!text-[13px]") : `${n} of 160 characters · 1 text`; icons(); } };
  draw();
  if (ed) { ed.addEventListener("input", draw); const keep = () => { const s = getSelection(); if (s.rangeCount && ed.contains(s.anchorNode)) caret = s.getRangeAt(0).cloneRange(); }; ed.addEventListener("keyup", keep); ed.addEventListener("mouseup", keep); }
  const toggle = (sel, open) => { const m = el.querySelector(sel); if (m) m.hidden = open == null ? !m.hidden : !open; };
  el.onclick = (e) => {
    if (e.target.closest("[data-v2-insert-btn]")) return toggle("[data-v2-insert-menu]");
    const v = e.target.closest("[data-v2-var]");
    if (v && ed) { const pill = document.createRange().createContextualFragment(v2Pill(v.dataset.v2Var));
      if (caret) { caret.deleteContents(); caret.insertNode(pill); caret.collapse(false); } else ed.appendChild(pill);
      toggle("[data-v2-insert-menu]", false); return draw(); }
    if (e.target.closest("[data-v2-when-btn]")) return toggle("[data-v2-when-menu]");
    const w2 = e.target.closest("[data-v2-when]");
    if (w2) { const i = +w2.dataset.v2When; picked[i][1] = !picked[i][1]; const wrap = el.querySelector("[data-v2-when-wrap]");
      wrap.querySelector("[data-v2-when-label]").textContent = v2WhenLabel(picked); wrap.querySelector("[data-v2-when-menu]").outerHTML = v2WhenMenu(picked); toggle("[data-v2-when-menu]", true); return icons(); }
    const w = e.target.closest('[data-role="when"] [data-seg]'); if (w) { when = +w.dataset.seg; draw(); }
    if (!e.target.closest("[data-v2-when-wrap],[data-v2-insert-menu]")) { toggle("[data-v2-when-menu]", false); toggle("[data-v2-insert-menu]", false); }
  };
}

/* ============================================================ 4. Calls */
const CALLS = [
  { id: 1, pt: "p5", name: "Olivia Nguyen", phone: "(650) 555-0101", date: "Today", time: "8:42 AM", sort: 9, dur: "3:12", dir: "in", by: "AI Receptionist", ai: true, outcome: "Appointment confirmed", summary: "Confirmed today's 11:00 AM perio visit. Reminded her to premedicate an hour before." },
  { id: 2, pt: "p9", name: "Isabella Kim", phone: "(925) 555-0120", date: "Today", time: "8:15 AM", sort: 8, dur: "5:40", dir: "in", by: "AI Receptionist", ai: true, outcome: "New patient booked", summary: "New patient. Booked a comprehensive exam today at 9:30 AM. No insurance; quoted $240.00 self-pay." },
  { id: 3, pt: "p13", name: "James Ortiz", phone: "(707) 555-0154", date: "Today", time: "7:58 AM", sort: 7, dur: "", dir: "missed", by: "", outcome: "Missed call - callback needed", summary: "" },
  { id: 4, pt: null, name: "MetLife Dental", phone: "(800) 555-0142", date: "Yesterday", time: "4:48 PM", sort: 6, dur: "11:26", dir: "out", by: "AI Insurance Caller", ai: true, outcome: "Claim status found", summary: "Asked about Lucas Foster's crown claim. The rep says the EOB mails Sep 30. Reference #ML-55120." },
  { id: 5, pt: "p8", name: "Lucas Foster", phone: "(408) 555-0165", date: "Yesterday", time: "4:31 PM", sort: 5, dur: "2:05", dir: "out", by: "Nina Flores", outcome: "Answered question", summary: "Told him the crown arrives Monday morning. Kept his Sep 28 9:00 AM seat appointment." },
  { id: 6, pt: "p1", name: "Ava Thompson", phone: "(415) 555-0132", date: "Yesterday", time: "10:20 AM", sort: 4, dur: "1:18", dir: "in", by: "AI Receptionist", ai: true, outcome: "Answered question", summary: "Asked whether she can pay her $184.00 balance at her visit. Told her yes." },
  { id: 7, pt: "p10", name: "Ethan Walker", phone: "(925) 555-0187", date: "Sep 23", time: "3:02 PM", sort: 3, dur: "4:26", dir: "in", by: "Marcus Lee", outcome: "Answered question", summary: "Questions about his September statement. Walked through what Delta paid and his share." },
  { id: 8, pt: "p15", name: "Benjamin Scott", phone: "(831) 555-0173", date: "Sep 23", time: "11:40 AM", sort: 2, dur: "0:52", dir: "vm", by: "", outcome: "Voicemail", summary: "Voicemail: wants to know what a denture reline costs and if Aetna helps with it." },
  { id: 9, pt: "p7", name: "Sophia Hughes", phone: "(408) 555-0112", date: "Sep 22", time: "9:05 AM", sort: 1, dur: "2:47", dir: "in", by: "AI Receptionist", ai: true, outcome: "Rescheduled", summary: "Moved her Oct 1 cleaning to Oct 8 at 3:00 PM with Jordan." }
];
const DIR = { in: ["phone-incoming", "Inbound"], out: ["phone-outgoing", "Outbound"], missed: ["phone-missed", "Missed"], vm: ["voicemail", "Voicemail"] };
const callCols = () => [
  { key: "name", label: "Name", icon: "user", w: 184, open: true, kind: "text", lead: (r) => (r.pt ? avatar(r.name, { size: 5 }) : avatar(r.name, { size: 5, square: true, solid: true })), render: (r) => esc(r.name) },
  { key: "sort", label: "Date", icon: "calendar", w: 184, kind: "num", render: (r) => `<span class="inline-flex items-center gap-x-1.5">${I(DIR[r.dir][0], "size-3.5 text-gray-400")}${r.date}<span class="text-gray-500">${r.time}</span></span>` },
  { key: "summary", label: "Summary", icon: "text", w: 340, kind: "text", value: (r) => r.summary || r.outcome, render: (r) => (r.dir === "missed" ? flag("Missed call · callback needed") : `<span class="text-gray-700">${esc(r.summary)}</span>`) },
  { key: "dur", label: "Duration", icon: "timer", w: 104, num: true, kind: "text", render: (r) => (r.dur ? `<span class="tabular-nums">${r.dur}</span>` : `<span class="text-gray-400">—</span>`) },
  { key: "ins", label: "Insurance", icon: "shield", w: 136, kind: "text", value: (r) => (r.pt && P(r.pt).payer ? DATA.payer(P(r.pt).payer).short : ""), render: (r) => (r.pt ? (P(r.pt).payer ? DATA.payer(P(r.pt).payer).short : `<span class="text-gray-500">Self-pay</span>`) : `<span class="text-gray-400">—</span>`) },
  { key: "phone", label: "Phone", icon: "phone", w: 140, kind: "text", render: (r) => `<span class="tabular-nums">${r.phone}</span>` },
  { key: "by", label: "Handled by", icon: "headset", w: 172, kind: "text", render: (r) => (r.ai ? `<span class="inline-flex items-center gap-x-2"><span class="flex size-5 items-center justify-center rounded-full bg-blue-100 text-blue-800">${I("sparkles", "size-3")}</span>${r.by}</span>` : r.by ? `<span class="inline-flex items-center gap-x-2">${avatar(r.by, { size: 5 })}${r.by}</span>` : `<span class="text-gray-400">No one</span>`) }
];
const TRANSCRIPT = [["Asha", "0:00", `Thanks for calling ${OFFICE}, this is Asha. How can I help?`], ["Caller", "0:04", "Hi, it's Olivia Nguyen. I have an appointment today and wanted to make sure it's still on."], ["Asha", "0:10", "Let me check. You're booked today at 11:00 AM with Dr. Brooks for perio maintenance. I'll mark it confirmed."], ["Caller", "0:21", "Great. Do I need to take my antibiotics before?"], ["Asha", "0:26", "Yes. Your chart says to premedicate. Please take it about an hour before, so around 10:00 AM."], ["Caller", "0:34", "Okay, will do. Thank you!"], ["Asha", "0:36", "You're welcome. See you at 11."]];
/* Olivia's call has the full transcript; the others show how the call opened */
function callTranscript(r) {
  const first = r.name.split(" ")[0], agent = r.ai ? "Asha" : r.by;
  if (r.id === 1) return TRANSCRIPT.map(([w, t, l]) => [w === "Asha" ? "Asha" : first, t, l]);
  if (r.dir === "vm") return [[first, "0:00", "Hi, it's Benjamin Scott. I wanted to ask what a denture reline costs, and whether Aetna helps with it. Call me back when you can, thanks."]];
  const open = r.dir === "out" ? `Hi, this is ${agent === "Asha" ? "Asha" : agent.split(" ")[0]} calling from ${OFFICE}.` : `Thanks for calling ${OFFICE}, this is ${agent === "Asha" ? "Asha" : agent.split(" ")[0]}. How can I help?`;
  const reply = r.pt ? (r.dir === "out" ? `Oh hi, yes, this is ${first}.` : `Hi, it's ${r.name}. I had a quick question.`) : "Provider services, this is Dana. Can I have the NPI and the patient's member ID?";
  return [[agent, "0:00", open], [r.pt ? first : "MetLife rep", "0:05", reply]];
}
/* The open call, laid out like a flush side panel: header, full-width tab line, psec() sections */
function callPanel(r, tab = 0) {
  if (!r) return `<div class="flex h-full items-center justify-center">${emptyState({ icon: "phone", title: "Pick a call", body: "Its summary, transcript and recording show here." })}</div>`;
  const body = callBody(r, tab);
  return `<div class="flex h-full flex-col">
    <div class="flex items-start gap-3 px-5 pt-4 pb-1">${r.pt ? avatar(r.name, { size: 9 }) : avatar(r.name, { size: 9, square: true, solid: true })}
      <div class="min-w-0 grow"><h2 class="truncate text-base font-semibold text-gray-800">${esc(r.name)}</h2><p class="mt-0.5 text-[13px] text-gray-500 tabular-nums">${DIR[r.dir][1]} · ${r.date}, ${r.time}${r.dur ? " · " + r.dur : ""}</p></div>
      <div class="-me-2 flex items-center gap-0.5">${iconButton("phone", "Call back", { s: "iconSm" })}${r.pt ? iconButton("file-user", "Open chart", { s: "iconSm" }) : ""}${iconButton("ellipsis", "More", { s: "iconSm" })}</div></div>
    <div class="px-5 border-b border-gray-200/80" data-call-tabs>${tabsBar(["Summary", "Transcript", "Call details"], tab, "!border-0")}</div>
    <div class="grow overflow-y-auto [&>section:first-child]:border-t-0">${body}</div></div>`;
}
/* The open call's sections: Summary, Transcript or Call details */
/* v4: the call's outcome is the first line of its facts (no section of its own), and the caller's patient is a cell you
 * can change when Asha matched the wrong one. The transcript and call details stay read-only: they're what happened. */
const V4_OUTCOMES = [["Appointment confirmed", "on"], ["New patient booked", "on"], ["Rescheduled", "on"], ["Answered question", "on"], ["Claim status found", "on"], ["Voicemail", "off"], ["Callback needed", "needs"], ["No answer", "off"]];
const V4_CALL_APPT = { 1: "Today, 11:00 AM · Perio maintenance", 2: "Today, 9:30 AM · Comprehensive exam", 5: "Mon, Sep 28, 9:00 AM · Crown seat #30", 6: "Today, 9:00 AM · Cleaning, exam", 7: "Today, 10:30 AM · Periodic exam", 9: "Thu, Oct 8, 3:00 PM · Cleaning" };
const v4Outcome = (r) => (r.dir === "missed" ? "Callback needed" : r.outcome);
const v4OutcomeRow = (r) => ({ label: "Outcome", value: v4Outcome(r), type: "select", options: V4_OUTCOMES.map(([l]) => l), html: (x) => v4Dot((V4_OUTCOMES.find(([l]) => l === x.value) || [0, "on"])[1], x.value) });
function v4CallFacts(r) {
  if (r.dir === "missed") { const p = P(r.pt);
    return v4CommsFields([v4OutcomeRow(r), { label: "Patient", value: r.name, type: "select", options: CALLS.filter((x) => x.pt).map((x) => x.name).filter((v, i, a) => a.indexOf(v) === i), html: (x) => `<span class="inline-flex items-center gap-2 min-w-0">${avatar(x.value, { size: 5 })}${esc(x.value)}</span>` },
      { label: "Matched by", value: "Phone number", type: "none" }, { label: "Insurance", value: DATA.payer(p.payer).name, type: "none" },
      { label: "Next visit", value: "Not scheduled", type: "none", html: (x) => `<span class="text-gray-500">${x.value}</span>` }, { label: "Last visit", value: fmtDateY(p.lastVisit), type: "none" }], { title: "Call" }); }
  return v4CommsFields([v4OutcomeRow(r), ...(r.pt ? [{ label: "Appointment", value: V4_CALL_APPT[r.id] || "Nothing booked", type: "none", html: (x) => (V4_CALL_APPT[r.id] ? `${esc(x.value)} <a href="#" class="ms-1 text-blue-600 hover:underline underline-offset-4">View</a>` : `<span class="text-gray-500">${esc(x.value)}</span>`) }] : [])], { title: "Call" });
}
function callBody(r, tab) {
  const wave = Array.from({ length: 44 }, (_, i) => 5 + Math.round(Math.abs(Math.sin(i * 1.7) * 9 + Math.sin(i * 0.45) * 6)));
  const body = tab === 0 ? (r.dir === "missed"
      ? `${psec("", `${note("No one answered and no voicemail was left. Call James back, or Asha can text him.")}<div class="mt-3 flex gap-2">${button("Call back", { v: "solid", s: "sm", icon: "phone" })}${button("Text instead", { v: "white", s: "sm", icon: "message-square" })}</div>`)}
        ${V4 ? psec("Details", `<div${chg4("The call's outcome, Callback needed, is the first line of its facts, and the patient is a cell you can change if Asha matched the wrong caller.")}>${v4CallFacts(r)}</div>`) : psec("Caller", metaGrid([["Patient", esc(r.name)], ["Matched by", "Phone number"], ["Insurance", DATA.payer(P(r.pt).payer).name], ["Balance", money(P(r.pt).balance)], ["Next visit", '<span class="text-gray-500">Not scheduled</span>'], ["Last visit", fmtDateY(P(r.pt).lastVisit)]], 2))}`
      : `${psec("", `<div class="mb-1.5 flex items-center gap-2">${r.ai ? tag("AI call", "tagBlue") : tag("Staff call", "tagGray")}<span class="text-[13px] text-gray-500">${r.ai ? `Answered by ${asha("Asha · " + r.by)}` : `Handled by ${esc(r.by || "voicemail")}`}</span></div>
          <p class="text-sm leading-6 text-gray-800">${esc(r.summary)}</p>
          <div class="mt-3 flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5">${iconButton("play", "Play recording", { v: "soft", s: "iconSm", cls: "rounded-full" })}
            <div class="flex h-7 grow items-center gap-[2px]" aria-hidden="true">${wave.map((h, i) => `<span class="w-[3px] rounded-full ${i < 14 ? "bg-blue-600" : "bg-gray-200"}" style="height:${h * 1.4}px"></span>`).join("")}</div>
            <span class="shrink-0 whitespace-nowrap text-xs text-gray-500 tabular-nums">0:48 / ${r.dur}</span></div>`)}
        ${V4 ? psec("Details", `<div${chg4("The outcome is the first line of the call's facts instead of a section of its own; pick another if Asha got it wrong.")}>${v4CallFacts(r)}</div>`) : psec("Outcome", r.pt ? `<button type="button" class="group -mx-2 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-1.5 text-start hover:bg-gray-50 cursor-pointer" aria-label="View appointment">${statusDot(r.outcome, "on")}<span class="ms-auto text-[13px] text-gray-500">View appointment</span>${I("chevron-right", "size-4 shrink-0 text-gray-400 group-hover:text-gray-600")}</button>` : statusDot(r.outcome, "on"))}
        ${r.id === 1 ? psec("Asha also did", `<ul class="space-y-1.5 text-[13px] text-gray-700">${["Marked the 11:00 AM visit Confirmed", "Added a premedication reminder to today's huddle"].map((t) => `<li class="flex gap-2">${I("check", "size-4 shrink-0 text-blue-600")}${t}</li>`).join("")}</ul>`) : ""}`)
    : tab === 1 ? psec("", r.dir === "missed" ? `<p class="${R.secondary}">No transcript. The call was not answered.</p>` : `<ol class="space-y-3.5">${callTranscript(r).map(([who, t, line]) => `<li class="grid grid-cols-[52px_1fr] gap-3"><span class="pt-0.5 text-xs tabular-nums text-gray-400">${t}</span><div><p class="text-xs font-medium ${who === "Asha" ? "text-blue-700" : "text-gray-500"}">${esc(who)}</p><p class="text-sm leading-6 text-gray-800">${esc(line)}</p></div></li>`).join("")}</ol>${r.id === 1 || r.dir === "vm" ? "" : `<p class="${R.help} mt-4">Showing how the call started. ${button("Open full transcript", { v: "link", s: "xs", cls: "text-[13px]" })}</p>`}`)
    : psec("", metaGrid([["From", `<span class="tabular-nums">${r.dir === "out" ? OFFICE_PHONE : r.phone}</span>`], ["To", `<span class="tabular-nums">${r.dir === "out" ? r.phone : OFFICE_PHONE + " · Main line"}</span>`], ["Handled by", r.by || "No one"], ["Insurance", r.pt && P(r.pt).payer ? DATA.payer(P(r.pt).payer).name : "—"]], 2));
  return body;
}
/* v2 calls: no docked panel. The list keeps all seven columns at 1440px; a call opens as the 520px sheet over the list
 * (drawn in place for the Missed call state), the same as claims. */
const v2CallCols = () => { const c = Object.fromEntries(callCols().map((x) => [x.key, x]));
  return [Object.assign(c.name, { w: 168 }), Object.assign(c.sort, { w: 180 }), Object.assign(c.dur, { w: 112 }), Object.assign(c.ins, { w: 136 }), Object.assign(c.phone, { w: 144 }), Object.assign(c.by, { w: 168 }), Object.assign(c.summary, { w: 160 })]; };
/* v4: the list shows who, when, what happened and who handled it; the duration, number, insurance and outcome open in a
 * card when you point at the row, so the summary gets the room it needs */
const v4CallCols = () => { const c = Object.fromEntries(callCols().map((x) => [x.key, x]));
  return [Object.assign(c.name, { w: 176 }), Object.assign(c.sort, { w: 192 }), Object.assign(c.summary, { w: 404, grow: true, label: `<span${chg4("The list keeps who called, when, what happened and who handled it, and the summary gets the room to be read; duration, phone, insurance and the outcome open in a card when you point at a call.")}>Summary</span>` }), Object.assign(c.by, { w: 184 })]; };
const v4CallPeek = (r) => peekCard(esc(r.name), [["Outcome", esc(v4Outcome(r))], ["Duration", r.dur ? `<span class="tabular-nums">${r.dur}</span>` : '<span class="text-gray-500">Not answered</span>'], ["Phone", `<span class="tabular-nums">${r.phone}</span>`],
  ["Insurance", r.pt ? (P(r.pt).payer ? DATA.payer(P(r.pt).payer).short : "Self-pay") : '<span class="text-gray-500">Not a patient</span>'], ["Direction", DIR[r.dir][1]]]);
const v2CallSheet = (r, tab = 0) => ({ flush: true, title: esc(r.name), subtitle: `<span class="tabular-nums">${DIR[r.dir][1]} · ${r.date}, ${r.time}${r.dur ? " · " + r.dur : ""}</span>`,
  lead: avatar(r.name, { size: 9, square: !r.pt }), tabs: ["Summary", "Transcript", "Call details"], tab,
  marks: V4 && r.pt ? `<span class="flex items-center gap-2"${chg4("A call from a patient has the one patient header: their medical alerts as one icon with the count and the family balance as a wallet, by the name, so Balance is no longer a line in the call's facts")}>${patientMarks({ alerts: P(r.pt).alerts, familyBalance: P(r.pt).balance })}</span>` : "",
  actions: `${iconButton("phone", "Call back", { s: "iconSm" })}${r.pt ? iconButton("file-user", "Open chart", { s: "iconSm" }) : ""}${V4 ? `<div class="ms-1"${chg4("The ⋯ is the one Actions menu: searchable, grouped by call and patient; Call back and Open chart keep their own buttons.")}>${actionsMenu(v4CallActions(r), { dots: true, up: false, align: "end", open: V4_OPTS.open })}</div>` : iconButton("ellipsis", "More", { s: "iconSm" })}`,
  body: `${callBody(r, tab)}<span hidden data-v2-call="${r.id}"></span>` });
/* v4: the call's Actions menu (Call back and Open chart have their own buttons in the header) */
const v4CallActions = (r) => { const first = r.pt ? P(r.pt).name.split(" ")[0] : "";
  return [
    { label: "Call", items: [{ icon: "notebook-pen", label: "Save summary to chart", hint: r.pt ? `Add the summary to ${first}'s chart notes` : "Pick a patient chart for the summary", suggest: r.id === 4 ? "MetLife gave a reference number for Lucas Foster's claim" : "" },
      { icon: "list-checks", label: "Create task", hint: "Follow up on this call", suggest: r.dir === "missed" ? "No one has called James back yet" : r.dir === "vm" ? "Benjamin is waiting for a price" : "" },
      { icon: "download", label: "Download recording", hint: "Save the audio file", off: r.dir === "missed" ? "The call wasn't answered, so there's no recording" : "" },
      { icon: "copy", label: "Copy transcript", hint: "To paste into a note or message", off: r.dir === "missed" ? "The call wasn't answered" : "" }] },
    { label: "Patient", items: r.pt ? [{ icon: "message-square", label: "Text patient", hint: `Open ${first}'s text thread` }, { icon: "calendar-plus", label: "Schedule appointment", hint: `Book ${first} a visit` }]
      : [{ icon: "user-round-search", label: "Link to a patient", hint: "Say which patient this call was about", suggest: "The call was about Lucas Foster's crown claim" }] },
    { label: "", items: [{ icon: "trash-2", label: "Delete recording", danger: true, off: r.dir === "missed" ? "There's no recording" : "" }] }]; };
/* A record panel drawn in place over the list (a picture of the sheet open); its close button removes it */
const v2Overlay = (o, note) => `<div class="absolute inset-y-0 end-0 z-10" data-v2-panel${chg(note)}>${sheetPanel(Object.assign({}, o, { closeAttrs: "data-v2-close-panel" }))}</div>`;
if (V2) document.addEventListener("click", (e) => {
  if (e.target.closest("[data-v2-close-panel]")) return e.target.closest("[data-v2-panel]")?.remove();
  const t = e.target.closest("aside [data-tab]"), aside = t && t.closest("aside"), m = aside && aside.querySelector("[data-v2-call]"); if (!m) return;
  const o = v2CallSheet(CALLS.find((x) => String(x.id) === m.dataset.v2Call), +t.dataset.tab);
  if (aside.classList.contains("sheet")) Sheet.open(o); else { aside.outerHTML = sheetPanel(Object.assign(o, { closeAttrs: "data-v2-close-panel" })); icons(); }
});
const CALL_TABS = ["All calls", "Inbound", "Outbound", "Missed"];
function v2CommsCalls(state) {
  const quiet = state === "Empty" || state === "Loading";
  return `${workspaceHeader({ parent: "Communications", title: "Calls", actions: `${button("Call settings", { v: "quiet", s: "sm", icon: "settings-2" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
    <div data-calls-tabs${state === "Loading" ? chg("Count tabs stay blank while the list loads, instead of showing numbers before the rows arrive") : ""}>${tabsWithSlot(quiet ? CALL_TABS : [["All calls", 9], ["Inbound", 6], ["Outbound", 2], ["Missed", 1]], 0, dateRangeButton("Last 7 days"))}</div>
    <div class="relative h-[560px] overflow-hidden">
      <div class="px-4">${state === "Loading" ? `<div class="py-2.5 flex gap-2">${skel("w-48", "h-8")}</div><div${chg("The loading table has the same seven columns as the real one, so nothing jumps when calls arrive")}>${gridSkeleton(V4 ? ["Name", "Date", "Summary", "Handled by"] : ["Name", "Date", "Duration", "Insurance", "Phone", "Handled by", "Summary"], 9)}</div>`
        : `<div data-grid="calls"${chg("All seven columns fit on screen: Duration, Insurance, Phone and Handled by were hidden behind a docked 400px panel")}></div>`}</div>
      ${state === "Missed call" ? v2Overlay(v2CallSheet(CALLS[2]), "A call opens as the standard 520px panel over the list, like claims, instead of a docked panel that squeezed the list") : ""}
    </div>`;
}
function v2CommsCallsMount(el, state) {
  const host = el.querySelector('[data-grid="calls"]'); if (!host) return;
  const sets = [(r) => true, (r) => r.dir === "in", (r) => r.dir === "out", (r) => r.dir === "missed"];
  const g = new Grid(host, { columns: V4 ? v4CallCols() : v2CallCols(), rows: state === "Empty" ? [] : CALLS, title: "All calls", viewButton: false, noun: "calls", searchPlaceholder: "Search calls", maxHeight: 486, selectable: false, addColumn: false, footer: true,
    defaultSort: { key: "sort", dir: -1 }, ...(V4 ? { peek: v4CallPeek } : {}),
    filters: [{ key: "dir", label: "Direction", options: Object.entries(DIR).map(([value, [, label]]) => ({ value, label })) }],
    empty: { icon: "phone", title: "No calls in the last 7 days", body: "Calls to your office number show up here with a summary." },
    onOpen: (r) => { el.querySelector("[data-v2-panel]")?.remove(); Sheet.open(v2CallSheet(r)); } });
  if (state === "Missed call") { g.openId = CALLS[2].id; g.render(); }
  wireTabs(el.querySelector("[data-calls-tabs]"), (i) => { g.setRows(state === "Empty" ? [] : CALLS.filter(sets[i])); g.o.title = CALL_TABS[i]; g.render(); });
}
defineBlock({
  cat: "comms", id: "comms-calls", title: "Calls",
  note: "Every call with a one-line summary, and the open call beside it: what happened, the recording, the transcript and details. Calls Asha answered say so. Click a name to open it.",
  where: "Communications › Calls",
  states: ["Normal", "Missed call", "Loading", "Empty"],
  canvas: "bare",
  html: (state) => V2 ? v2CommsCalls(state) : `${workspaceHeader({ parent: "Communications", title: "Calls", actions: `${button("Call settings", { v: "quiet", s: "sm", icon: "settings-2" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
    <div data-calls-tabs>${tabsWithSlot(state === "Empty" ? ["All calls", "Inbound", "Outbound", "Missed"] : [["All calls", 9], ["Inbound", 6], ["Outbound", 2], ["Missed", 1]], 0, dateRangeButton("Last 7 days"))}</div>
    <div class="grid h-[560px] grid-cols-[minmax(0,1fr)_400px]">
      <div class="min-w-0 px-4">${state === "Loading" ? `<div class="py-2.5 flex gap-2">${skel("w-32", "h-8")}${skel("w-48", "h-8")}</div>${gridSkeleton(["Name", "Date", "Summary", "Duration"], 9)}` : '<div data-grid="calls"></div>'}</div>
      <div class="min-h-0 border-s border-gray-200/80" data-call-panel>${state === "Loading" ? `<div class="p-5 space-y-3">${skel("w-40", "h-5")}${skel("w-56", "h-3")}<div class="pt-6 space-y-2">${skel()}${skel("w-5/6")}${skel("w-2/3")}</div></div>` : state === "Empty" ? callPanel(null) : callPanel(CALLS[state === "Missed call" ? 2 : 0])}</div>
    </div>`,
  mount: (el, state) => {
    if (V2) return v2CommsCallsMount(el, state);
    const host = el.querySelector('[data-grid="calls"]'); if (!host) return;
    const panel = el.querySelector("[data-call-panel]"); let cur = state === "Empty" ? null : CALLS[state === "Missed call" ? 2 : 0], tab = 0;
    const draw = () => { panel.innerHTML = callPanel(cur, tab); icons(); };
    panel.addEventListener("click", (e) => { const t = e.target.closest("[data-call-tabs] [data-tab]"); if (t) { tab = +t.dataset.tab; draw(); } });
    const sets = [(r) => true, (r) => r.dir === "in", (r) => r.dir === "out", (r) => r.dir === "missed"];
    const g = new Grid(host, { columns: callCols(), rows: state === "Empty" ? [] : CALLS, title: "All calls", searchPlaceholder: "Search calls", maxHeight: 486, selectable: false, addColumn: false, footer: true,
      defaultSort: { key: "sort", dir: -1 },
      filters: [{ key: "dir", label: "Direction", options: Object.entries(DIR).map(([value, [, label]]) => ({ value, label })) }],
      empty: { icon: "phone", title: "No calls in the last 7 days", body: "Calls to your office number show up here with a summary." },
      onOpen: (r) => { cur = r; tab = 0; draw(); } });
    if (cur) { g.openId = cur.id; g.render(); }
    wireTabs(el.querySelector("[data-calls-tabs]"), (i) => { g.setRows(state === "Empty" ? [] : CALLS.filter(sets[i])); g.o.title = ["All calls", "Inbound", "Outbound", "Missed"][i]; g.render(); });
  }
});

/* ============================================================ 5. Campaigns */
const TRIG = { recall: ["Recall due", "tagBlue"], birthday: ["Birthday", "tagTeal"], react: ["Reactivation", "tagIndigo"], noshow: ["Appointment no-show", "tagGray"], tx: ["Unscheduled treatment", "tagIndigo"], review: ["After visit", "tagTeal"] };
const CSTAT = { live: ["Live", "on"], sched: ["Scheduled", "mid"], paused: ["Paused", "off"], draft: ["Draft", "quiet"], done: ["Completed", "off"] };
const CAMPAIGNS = [
  { id: 1, name: "Hygiene recall, 6+ months overdue", trig: "recall", status: "live", ch: ["sms", "email", "ai"], aud: 312, sent: 540, replies: 86, booked: 41, rev: 12640, last: "2026-09-25" },
  { id: 2, name: "Unscheduled crowns and root canals", trig: "tx", status: "live", ch: ["sms", "ai"], aud: 58, sent: 104, replies: 19, booked: 9, rev: 14820, last: "2026-09-24" },
  { id: 3, name: "Welcome back: no visit in 18 months", trig: "react", status: "live", ch: ["sms", "email"], aud: 427, sent: 812, replies: 63, booked: 22, rev: 6910, last: "2026-09-23" },
  { id: 4, name: "Missed appointment follow-up", trig: "noshow", status: "live", ch: ["sms"], aud: 14, sent: 14, replies: 9, booked: 6, rev: 1180, last: "2026-09-25" },
  { id: 5, name: "Birthday wishes", trig: "birthday", status: "live", ch: ["sms"], aud: 1204, sent: 96, replies: 31, booked: 0, rev: 0, last: "2026-09-25" },
  { id: 6, name: "Use your benefits before Dec 31", trig: "tx", status: "sched", ch: ["sms", "email"], aud: 386, sent: 0, replies: 0, booked: 0, rev: 0, last: "" },
  { id: 7, name: "Summer whitening offer", trig: "react", status: "done", ch: ["email"], aud: 940, sent: 940, replies: 12, booked: 7, rev: 2450, last: "2026-08-31" },
  { id: 8, name: "Google review request", trig: "review", status: "paused", ch: ["sms"], aud: 0, sent: 210, replies: 44, booked: 0, rev: 0, last: "2026-09-02" },
  { id: 9, name: "Perio maintenance reminder", trig: "recall", status: "draft", ch: ["sms", "ai"], aud: 88, sent: 0, replies: 0, booked: 0, rev: 0, last: "" }
];
const CAMP_SETS = [(r) => ["live", "sched", "paused"].includes(r.status), (r) => r.status === "draft", (r) => r.status === "done"];
const chIcons = (list) => `<span class="inline-flex items-center gap-x-1.5 text-gray-500">${list.map((c) => `<span title="${{ sms: "Text", email: "Email", ai: "AI call" }[c]}">${I({ sms: "message-square", email: "mail", ai: "phone" }[c], "size-3.5")}</span>`).join("")}</span>`;
const campCols = () => [
  { key: "name", label: "Campaign", icon: "megaphone", w: 300, open: true, kind: "text", render: (r) => esc(r.name) },
  { key: "trig", label: "Trigger", icon: "zap", w: 176, kind: "text", value: (r) => TRIG[r.trig][0], render: (r) => tag(...TRIG[r.trig]) },
  { key: "status", label: "Status", icon: "circle-dot", w: 124, kind: "text", value: (r) => CSTAT[r.status][0], render: (r) => statusDot(...CSTAT[r.status]) },
  { key: "ch", label: "Sends by", icon: "send", w: 120, kind: "list", value: (r) => r.ch.join(" "), render: (r) => chIcons(r.ch) },
  { key: "aud", label: "Audience size", icon: "users", w: 150, num: true, kind: "num", render: (r) => (r.aud ? r.aud.toLocaleString() : `<span class="text-gray-400">0</span>`) },
  { key: "replies", label: "SMS replies", icon: "reply", w: 136, num: true, kind: "num", render: (r) => (r.replies ? String(r.replies) : `<span class="text-gray-400">0</span>`) },
  { key: "booked", label: "Booked", icon: "calendar-check", w: 112, num: true, kind: "num", render: (r) => (r.booked ? String(r.booked) : `<span class="text-gray-400">0</span>`) },
  { key: "rev", label: "Additional revenue", icon: "banknote", w: 164, num: true, kind: "money", render: (r) => (r.rev ? money(r.rev, { cents: false }) : `<span class="text-gray-400">$0</span>`) },
  { key: "last", label: "Last sent", icon: "calendar", w: 116, kind: "date", render: (r) => (r.last ? fmtDate(r.last) : `<span class="text-gray-400">Not yet</span>`) }
];
const STEPS = [["Day 0", "message-square", "Text", "Hi {{Patient Name}}, it's been a while since your last cleaning at Bayview Family Dental. Book here or reply with a day that works: bayview.asha.health/b"], ["Day 3", "mail", "Email", "Subject: Your smile is due for a check-in. With a Book now button and your office hours."], ["Day 7", "phone", "AI call · AI Hygiene Recall", "Asha calls once between 10 AM and 6 PM, offers the next two open hygiene times, and books the one they pick."]];
const REPLIES = [["p10", "Can I come in next Thursday after 4?", "Booked", "on", "9:12 AM"], ["p3", "Saturdays only please", "Offered Sat, Oct 3", "mid", "8:40 AM"], ["p14", "STOP", "Opted out", "off", "Yesterday"], ["p6", "Is Sofia still there? I'd like her again", "Booked", "on", "Yesterday"], ["p11", "What does my insurance cover?", "Needs a reply", "needs", "Sep 23"]];
/* v2: one status button (dot, word, chevron) whose menu holds Pause / Turn on, as on every panel */
const v2StatusBtn = (word, tone) => `<button type="button" class="${cx(R.btn, R.sm, R.white, "!ps-2.5")}" aria-haspopup="menu" aria-label="Status: ${esc(word)}. Change status"><span class="${cx(R.dot, TONE_DOT[tone])}"></span>${esc(word)}${I("chevron-down", "!text-gray-400")}</button>`;
/* v2 columns: what the campaign brought in sits on screen next to its name; Live (the normal state) is blank; triggers
 * are plain text (four tag colours named a trigger without meaning anything) */
const v2CampCols = () => { const c = Object.fromEntries(campCols().map((x) => [x.key, x]));
  return [Object.assign(c.name, { w: 252 }), Object.assign(c.status, { w: 112, normal: ["Live"], label: `<span${chg("Status shows only when unusual: Live campaigns are blank, so Scheduled and Paused stand out")}>Status</span>` }), c.aud, c.replies, c.booked,
    Object.assign(c.rev, { label: `<span${chg("Additional revenue, the column the list is sorted by, is on screen next to Booked instead of past the right edge")}>Additional revenue</span>` }), c.last,
    Object.assign(c.trig, { render: (r) => `<span class="text-gray-700">${TRIG[r.trig][0]}</span>` }), c.ch]; };
/* v4: a campaign's one Actions menu. Edit campaign has its own button; Pause and Turn on live in the status. */
const v4CampActions = (r) => [
  { label: "Campaign", items: [{ icon: "send", label: "Send a test to yourself", hint: "Text and email the first step to your phone", suggest: r.status === "sched" ? "It starts Oct 1; check the text before it goes" : "" },
    { icon: "copy", label: "Duplicate campaign", hint: "Start a new one from these steps" }, { icon: "download", label: "Export results", hint: "Replies and bookings as a spreadsheet", off: r.sent ? "" : "Nothing has been sent yet" },
    { icon: "history", label: "Campaign history", hint: "Who changed it and when" }] },
  { label: "", items: [{ icon: "archive", label: "Archive campaign", danger: true, off: r.status === "live" ? "Pause it first; it's still sending" : "" }] }];
const v4CampStatus = (word, tone) => `<button type="button" class="${cx(R.btn, R.xs, R.white, "!ps-2")}" aria-haspopup="menu" aria-label="Status: ${esc(word)}. Change status"><span class="${cx(R.dot, TONE_DOT[tone])}"></span>${esc(word)}${I("chevron-down", "!text-gray-400")}</button>`;
function v4CampaignTop(c) {
  return recordHeader({ size: "page", title: esc(c.name), sub: `Outreach campaign · ${TRIG[c.trig][0]} · Last sent ${fmtDateY(c.last)}`,
    marks: `<span class="inline-flex"${chg4("The status (Live, with Pause in its menu) is a mark by the name, and the campaign's own header replaces the bar above it.")}>${v4CampStatus(...CSTAT[c.status])}</span>`,
    actions: `${button("Edit campaign", { v: "white", s: "sm", icon: "pencil" })}<div${chg4("The ⋯ is the one Actions menu: searchable, with Archive greyed while the campaign is still sending and the reason on hover.")}>${actionsMenu(v4CampActions(c), { dots: true, up: false, align: "end", open: V4_OPTS.open })}</div>` });
}
/* v4: the latest replies as a compact table; the reply's words are on hover */
const v4CampReplies = () => sheetTable({ sheet: false, title: "Latest SMS replies", rows: REPLIES.map(([pid, text, st, tone, t], i) => ({ id: `rp${i}`, pid, text, st, tone, t })),
  peek: (r) => peekCard(esc(P(r.pid).name), [["Replied", r.t], ["Result", statusDot(r.st, r.tone)]], `“${esc(r.text)}”`),
  columns: [{ key: "pid", label: "Patient", w: 140, grow: true, render: (r) => `<span class="inline-flex items-center gap-2 min-w-0">${avatar(P(r.pid).name, { size: 5 })}<span class="truncate">${esc(P(r.pid).name)}</span></span>` },
    { key: "st", label: "Result", w: 160, render: (r) => statusDot(r.st, r.tone) }, { key: "t", label: "When", w: 76, num: true, render: (r) => `<span class="text-gray-500">${r.t}</span>` }] });
function campaignDetail() {
  const c = CAMPAIGNS[0];
  return `${V4 ? `<div class="[&>header]:!px-6">${v4CampaignTop(c)}</div>` : workspaceHeader({ parent: "Campaigns", title: esc(c.name), actions: `${V2 ? `<span class="inline-flex"${chg("One status button (Live, with Pause in its menu) replaces a loose status word plus a separate Pause button")}>${v2StatusBtn("Live", "on")}</span>` : `${statusDot("Live", "on", "me-2 !text-[13px]")}${button("Pause", { v: "white", s: "sm", icon: "pause" })}`}${button("Edit campaign", { v: "white", s: "sm", icon: "pencil" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
    <div class="px-6"${chg("The number strip and the tab line run edge to edge instead of stopping 24px short of both sides")}>${metricStrip([["Audience size", "312", { sub: "Due 6+ months, no visit booked" }], ["Communications sent", "540"], ["SMS replies", "86", { delta: "28%" }], ["Appointments booked", "41", { goal: 68, sub: "Goal 60 this quarter" }], ["Additional revenue", "$12,640", { sub: "From booked visits so far" }]], "!border-t-0", V2 ? { gutter: 24 } : undefined)}</div>
    <div class="px-6">${V2 ? tabsWithSlot(["Steps", ["Audience", 312], ["Replies", 86], "Runs", "Settings"], 0, "", "", { gutter: 24 }) : tabsBar(["Steps", ["Audience", 312], ["Replies", 86], "Runs", "Settings"], 0)}</div>
    <div class="grid grid-cols-[minmax(0,1fr)_380px] gap-8 px-6 py-5">
      <div class="min-w-0"><div class="mb-2 flex items-center justify-between"><h3 class="${R.groupTitle}">Steps</h3>${V2 ? "" : `<span class="${R.caption}">Stops when a patient books, replies STOP, or already has a visit</span>`}</div>
        <ol class="${R.box} divide-y divide-gray-200/80">${STEPS.map(([d, ic, ch, text], i) => `<li class="grid grid-cols-[64px_1fr] gap-3 px-4 py-3.5">
          <div><p class="text-xs font-medium text-gray-500">${d}</p><span class="mt-1.5 flex size-7 items-center justify-center rounded-md border border-gray-200/80 text-gray-600">${I(ic, "size-3.5")}</span></div>
          <div class="min-w-0"><div class="flex items-center gap-2"><p class="text-sm font-medium text-gray-800">${ch}</p><span class="${R.count}">${[312, 271, 118][i]} sent</span></div><p class="mt-1 text-[13px] leading-5 text-gray-600">${esc(text)}</p></div></li>`).join("")}</ol>${V2 ? `<p class="${R.help} mt-2"${chg("The stop rule is a help line under the steps instead of a caption floating beside the title")}>Stops when a patient books, replies STOP, or already has a visit.</p>` : ""}</div>
      <div><div class="mb-2 flex items-center justify-between"><h3 class="${R.groupTitle}">Latest SMS replies</h3>${V2 ? `<span class="inline-flex"${chg("View all is a small white button, like every section action, not a blue link")}>${button("View all", { v: "white", s: "xs" })}</span>` : button("View all", { v: "link", s: "xs", cls: "text-[13px]" })}</div>
        ${V4 ? `<div${chg4("The latest replies are a compact table: who, what came of it and when, so the one that needs a reply stands out; the reply itself opens in a card when you point at the row, instead of a name, a quote and a status stacked in each row.")}>${v4CampReplies()}</div>` : `<ul class="rounded-lg border border-gray-200/80 divide-y divide-gray-200/80 [&>li]:px-3">${REPLIES.map(([pid, text, st, tone, t]) => `<li class="flex items-start gap-3 py-2.5">${avatar(P(pid).name, { size: 7 })}<div class="min-w-0 grow"><div class="flex items-center gap-2"><p class="truncate text-sm font-medium text-gray-800">${esc(P(pid).name)}</p><span class="ms-auto shrink-0 text-xs text-gray-500">${t}</span></div><p class="truncate text-[13px] text-gray-600">“${esc(text)}”</p><div class="mt-0.5">${statusDot(st, tone, "!text-xs !text-gray-500")}</div></div></li>`).join("")}</ul>`}</div>
    </div>`;
}
/* v4 campaign panel: Status is the first line of its facts table (Pause and Turn on are in its list), the numbers stay a
 * strip, and the footer has the one Actions menu and Edit campaign */
function v4CampSheet(r) {
  const word = CSTAT[r.status][0], when = r.last ? `Last sent ${fmtDateY(r.last)}` : "Not sent yet";
  const facts = [{ label: "Status", value: word, type: "select", options: ["Live", "Scheduled", "Paused", "Draft", "Completed"],
      html: (x) => `<span class="inline-flex items-center gap-2 min-w-0"><span class="${cx(R.dot, TONE_DOT[(Object.values(CSTAT).find(([l]) => l === x.value) || [0, "off"])[1]])}"></span>${esc(x.value)}${x.value === word ? `<span class="text-gray-500 truncate">· ${when}</span>` : ""}</span>` },
    { label: "Trigger", value: TRIG[r.trig][0], type: "select", options: Object.values(TRIG).map(([l]) => l) },
    { label: "Sends by", value: r.ch.map((c) => ({ sms: "Text", email: "Email", ai: "AI call" }[c])), type: "multi", options: ["Text", "Email", "AI call"] },
    { label: "Communications sent", value: r.sent.toLocaleString(), type: "none", html: (x) => `<span class="tabular-nums">${x.value}</span>` },
    { label: "Additional revenue", value: r.rev ? money(r.rev) : "$0.00", type: "none", html: (x) => `<span class="tabular-nums">${x.value}</span>` }];
  return { flush: true, title: esc(r.name), subtitle: `Outreach campaign · ${TRIG[r.trig][0]}`, tabs: ["Overview", "Steps", "Replies"],
    actions: iconButton("external-link", "Open campaign", { s: "iconSm" }),
    body: `${psec("Details", `<div${chg4("Status is the first line of the campaign's facts instead of a row of its own (Pause and Turn on are in its list); trigger is a cell you can change, and Sends by is a list you tick several in.")}>${v4CommsFields(facts, { labelW: 168, title: "Details" })}</div>`)}
      <section class="grid grid-cols-3 divide-x divide-gray-200/80 border-t border-gray-200/80">${[["Audience", r.aud.toLocaleString()], ["Replies", String(r.replies)], ["Booked", String(r.booked)]].map((m) => `<div class="px-5 py-4">${metric(...m)}</div>`).join("")}</section>`,
    footer: `<div${chg4("One Actions menu on the left; the Pause button is gone because Status holds Pause and Turn on.")}>${actionsMenu(v4CampActions(r), { open: V4_OPTS.open })}</div><span class="grow"></span>${button("Edit campaign", { v: "solid", s: "sm" })}` };
}
defineBlock({
  cat: "comms", id: "comms-campaigns", title: "Campaigns",
  note: "Outreach that runs on its own: what starts it, whether it's live, how many patients it reaches, replies, bookings and the money it brought in. The detail shows each step and the latest replies.",
  where: "Communications › Campaigns",
  states: ["List", "Campaign detail", "Loading"],
  canvas: "bare",
  html: (state) => state === "Campaign detail" ? campaignDetail() : `${workspaceHeader({ parent: "Communications", title: "Campaigns", actions: `${button("Email senders", { v: "quiet", s: "sm", icon: "at-sign" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
    ${V2 && state === "Loading" ? `<div data-camp-tabs${chg("Count tabs stay blank while the list loads")}>${tabsWithSlot(["Active", "Drafts", "Completed"], 0, dateRangeButton("Last 90 days"))}</div>` : `<div data-camp-tabs>${tabsWithSlot(CAMP_SETS.map((f, i) => [["Active", "Drafts", "Completed"][i], CAMPAIGNS.filter(f).length]), 0, dateRangeButton("Last 90 days"))}</div>`}
    <div class="px-4 pb-4">${state === "Loading" ? (V2 ? `<div class="py-2.5 flex gap-2">${skel("w-48", "h-8")}</div><div${chg("The loading table has the same columns, in the same order, as the real one")}>${gridSkeleton(["Campaign", "Status", "Audience size", "SMS replies", "Booked", "Additional revenue", "Last sent"], 7)}</div>` : `<div class="py-2.5 flex gap-2">${skel("w-32", "h-8")}${skel("w-48", "h-8")}</div>${gridSkeleton(["Campaign", "Trigger", "Status", "Audience size", "SMS replies", "Additional revenue"], 7)}`) : '<div data-grid="camps"></div>'}</div>`,
  mount: (el) => {
    const host = el.querySelector('[data-grid="camps"]'); if (!host) return;
    const sets = CAMP_SETS;
    const g = new Grid(host, { columns: V2 ? v2CampCols() : campCols(), rows: CAMPAIGNS.filter(sets[0]), title: "Active", ...(V2 ? { viewButton: false, noun: "campaigns" } : {}), searchPlaceholder: "Search campaigns", maxHeight: 400,
      defaultSort: { key: "rev", dir: -1 }, calc: { aud: "sum", booked: "sum", rev: "sum" },
      filters: [{ key: "trig", label: "Trigger", options: Object.entries(TRIG).map(([value, [label]]) => ({ value, label })) }, { key: "status", label: "Status", options: Object.entries(CSTAT).map(([value, [label, tone]]) => ({ value, label, tone })) }],
      primary: { label: "New campaign" },
      empty: { icon: "megaphone", title: "No campaigns here", body: "Start from a recall, reactivation or birthday template.", action: "New campaign" },
      bulk: [{ label: "Pause", icon: "pause", run: (rows) => rows.forEach((r) => (r.status = "paused")) }, { label: "Export", icon: "download" }],
      /* Flush panel: status on one line, numbers as a full-width strip, facts in a label-over-value grid */
      onOpen: (r) => Sheet.open(V4 ? v4CampSheet(r) : { flush: true, title: esc(r.name), subtitle: `Outreach campaign · ${TRIG[r.trig][0]}`, tabs: ["Overview", "Steps", "Replies"],
        actions: iconButton("external-link", "Open campaign", { s: "iconSm" }),
        body: `<section class="${R.psec} flex items-center justify-between gap-3 !py-3"><button type="button" class="${cx(R.btn, R.sm, R.white, "!ps-2.5")}" aria-haspopup="menu" aria-label="Change campaign status"><span class="${cx(R.dot, TONE_DOT[CSTAT[r.status][1]])}"></span>${CSTAT[r.status][0]}${I("chevron-down", "!text-gray-400")}</button><span class="text-[13px] text-gray-500">${r.last ? `Last sent ${fmtDateY(r.last)}` : "Not sent yet"}</span></section>
          <section class="grid grid-cols-3 divide-x divide-gray-200/80 border-t border-gray-200/80">${[["Audience", r.aud.toLocaleString()], ["Replies", String(r.replies)], ["Booked", String(r.booked)]].map((m) => `<div class="px-5 py-4">${metric(...m)}</div>`).join("")}</section>
          ${psec("Details", metaGrid([["Sends by", chIcons(r.ch)], ["Communications sent", r.sent.toLocaleString()], ["Additional revenue", r.rev ? money(r.rev) : "$0.00"]]))}`,
        footer: `${button(r.status === "live" ? "Pause" : "Turn on", { v: "white", s: "sm", icon: r.status === "live" ? "pause" : "play" })}${button("Edit campaign", { v: "solid", s: "sm" })}` }) });
    wireTabs(el.querySelector("[data-camp-tabs]"), (i) => { g.setRows(CAMPAIGNS.filter(sets[i])); g.o.title = ["Active", "Drafts", "Completed"][i]; g.render(); });
  }
});

/* ============================================================ 6. Faxes */
const FTYPE = { eob: ["EOB", "tagBlue"], ref: ["Referral", "tagIndigo"], rec: ["Records request", "tagGray"], lab: ["Lab slip", "tagTeal"], med: ["Medical clearance", "tagGray"] };
const FAXES = [
  { id: 1, from: "Bay Area Oral Surgery", num: "(510) 555-0190", recv: "Today", time: "9:12 AM", sort: 9, pages: 3, type: "ref", pt: "p2", urgent: true, unread: true, summary: "Referral back for Liam Carter after #32 was removed on Sep 21. Healing well. Asks for a 2-week post-op check and to hold the blood thinner note on file." },
  { id: 2, from: "MetLife Dental", num: "(800) 555-0142", recv: "Today", time: "8:47 AM", sort: 8, pages: 2, type: "eob", pt: "p8", urgent: false, unread: true, summary: "EOB for Lucas Foster, crown #30 and buildup. MetLife paid $1,310.50 on check #884120." },
  { id: 3, from: "Dr. Alan Pierce, MD", num: "(415) 555-0177", recv: "Today", time: "7:30 AM", sort: 7, pages: 1, type: "med", pt: null, urgent: true, unread: true, summary: "Medical clearance for a patient named “J. Ortis”, DOB 03/11/1966, for extraction under local anesthesia. Cleared with no changes to medications." },
  { id: 4, from: "Precision Crown & Bridge", num: "(916) 555-0107", recv: "Yesterday", time: "3:18 PM", sort: 6, pages: 1, type: "lab", pt: "p8", urgent: false, unread: false, summary: "Lab slip: crown #30, shade A2, ships Sep 26 for Monday delivery." },
  { id: 5, from: "Valley Family Dentistry", num: "(650) 555-0133", recv: "Yesterday", time: "11:02 AM", sort: 5, pages: 4, type: "rec", pt: null, urgent: false, unread: false, summary: "Records request for a patient transferring out: x-rays and last 2 years of notes. Signed release attached." },
  { id: 6, from: "Aetna Dental", num: "(800) 555-0120", recv: "Sep 23", time: "2:40 PM", sort: 4, pages: 2, type: "eob", pt: "p5", urgent: false, unread: false, summary: "EOB for Olivia Nguyen, deep cleaning, 2 quadrants. $0.00 paid: frequency limit reached." },
  { id: 7, from: "Cigna Dental", num: "(800) 555-0166", recv: "Sep 22", time: "10:15 AM", sort: 3, pages: 1, type: "eob", pt: "p13", urgent: false, unread: false, summary: "Denial for James Ortiz, surgical extraction. Needs the pano x-ray to reconsider." }
];
const FAX_SENT = [
  { id: 21, from: "Cigna Dental", num: "(800) 555-0166", recv: "Today", time: "8:02 AM", sort: 9, pages: 3, type: "eob", pt: "p13", urgent: false, unread: false, summary: "Sent the pano x-ray and narrative for James Ortiz's surgical extraction appeal." },
  { id: 22, from: "Bay Area Oral Surgery", num: "(510) 555-0190", recv: "Sep 18", time: "1:30 PM", sort: 5, pages: 5, type: "ref", pt: "p2", urgent: true, unread: false, summary: "Referral for Liam Carter: remove #32, partly impacted. Pano and medication list attached." },
  { id: 23, from: "Valley Family Dentistry", num: "(650) 555-0133", recv: "Sep 16", time: "10:40 AM", sort: 3, pages: 12, type: "rec", pt: "p7", urgent: false, unread: false, summary: "Records for Sophia Hughes: x-rays and 2 years of notes, with her signed release." }
];
const FAX_ARCHIVED = [
  { id: 31, from: "Delta Dental of California", num: "(800) 555-0111", recv: "Sep 10", time: "9:20 AM", sort: 2, pages: 2, type: "eob", pt: "p10", urgent: false, unread: false, summary: "EOB for Ethan Walker's exam and x-rays. Delta paid $192.00." },
  { id: 32, from: "Unknown sender", num: "(209) 555-0198", recv: "Sep 4", time: "6:12 PM", sort: 1, pages: 1, type: "rec", pt: null, urgent: false, unread: false, summary: "A blank cover page with no message. Archived as spam." }
];
const faxCols = () => [
  { key: "from", label: "From", icon: "printer", w: 224, open: true, kind: "text", lead: (r) => avatar(r.from, { size: 5, square: true, solid: true }), render: (r) => `<span class="${r.unread ? "font-semibold" : ""}">${esc(r.from)}</span>` },
  { key: "pt", label: "Patient", icon: "user", w: 184, kind: "text", value: (r) => (r.pt ? P(r.pt).name : ""), render: (r) => (r.pt ? `<span class="inline-flex items-center gap-x-2">${avatar(P(r.pt).name, { size: 5 })}${esc(P(r.pt).name)}</span>` : statusDot("Not matched", "needs")) },
  { key: "urgent", label: "Priority", icon: "flag", w: 112, kind: "text", value: (r) => (r.urgent ? "Urgent" : "Routine"), render: (r) => (r.urgent ? statusDot("Urgent", "needs") : statusDot("Routine", "off")) },
  { key: "sort", label: "Received", icon: "calendar", w: 150, kind: "num", render: (r) => `${r.recv} <span class="text-gray-500">${r.time}</span>` },
  { key: "type", label: "Type", icon: "tag", w: 160, kind: "text", value: (r) => FTYPE[r.type][0], render: (r) => tag(...FTYPE[r.type]) },
  { key: "pages", label: "Pages", icon: "files", w: 88, num: true, kind: "num" }
];
/* The fax's parts, shared by the docked panel (v1) and the sheet (v2) */
function faxPage(r) {
  return `<div class="w-[112px] shrink-0 rounded-md bg-gray-100 p-2"><div class="rounded-[2px] bg-white px-2 py-2.5 shadow-2xs ring-1 ring-gray-200/80" aria-label="Fax page 1 preview">
      <p class="truncate text-[6px] font-semibold tracking-wide text-gray-800 uppercase">${esc(r.from)}</p>
      <div class="mt-1.5 space-y-1">${[92, 100, 84, 96, 70, 100, 88, 60, 94, 78].map((w) => `<span class="block h-[3px] rounded-full bg-gray-200" style="width:${w}%"></span>`).join("")}</div>
      <p class="mt-2 text-[6px] text-gray-400">Page 1 of ${r.pages}</p></div></div>`;
}
function faxMatchSec(r) {
  const p = r.pt && P(r.pt);
  return p ? `<div class="flex items-center gap-3">${avatar(p.name, { size: 8 })}<div class="min-w-0 grow"><p class="text-sm font-medium text-gray-800">${esc(p.name)}</p><p class="text-xs text-gray-500 tabular-nums">${fmtDateY(p.dob)} · #${1000 + +p.id.slice(1) * 37}</p></div>${V2 ? "" : statusDot("Matched", "on", "!text-[13px]")}${button("Change", { v: "quiet", s: "xs" })}</div>`
    : `<p class="mb-2">${flag("Asha couldn't tell who this is for. Pick the patient.", "!text-[13px]")}</p>${searchBox("Search patients", { w: "w-full", value: "Ortiz" })}
       ${bleed(`<ul class="mt-3">${[["p13", "Name is close, DOB matches"], ["p9", "Same last visit day only"]].slice(0, r.id === 3 ? 1 : 2).map(([id, why]) => `<li class="flex items-center gap-3 px-5 py-2 border-t border-gray-200/80">${avatar(P(id).name, { size: 7 })}<div class="min-w-0 grow"><p class="text-sm text-gray-800">${esc(P(id).name)} <span class="text-gray-500 tabular-nums">· ${fmtDateY(P(id).dob)}</span></p><p class="text-xs text-gray-500">${why}</p></div>${button("Pick", { v: "white", s: "xs" })}</li>`).join("")}</ul>`)}`;
}
function faxPanel(r) {
  const p = r.pt && P(r.pt);
  const page = faxPage(r);
  const matchSec = faxMatchSec(r);
  return `<div class="flex h-full flex-col">
    <div class="flex items-start gap-3 px-5 pt-4 pb-4"><div class="min-w-0 grow"><div class="flex items-center gap-2">${tag(...FTYPE[r.type])}${r.urgent ? statusDot("Urgent", "needs", "!text-[13px]") : ""}</div><h2 class="mt-1.5 truncate text-base font-semibold text-gray-800">${esc(r.from)}</h2><p class="mt-0.5 text-[13px] text-gray-500 tabular-nums">${r.recv}, ${r.time} · ${r.pages} ${r.pages === 1 ? "page" : "pages"}</p></div>
      <div class="-me-2 flex items-center gap-0.5">${iconButton("download", "Download fax", { s: "iconSm" })}${iconButton("printer", "Print", { s: "iconSm" })}${iconButton("archive", "Archive fax", { s: "iconSm" })}</div></div>
    <div class="grow overflow-y-auto">
      <section class="${R.psec} flex gap-4">${page}<div class="min-w-0"><h3 class="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">${I("sparkles", "size-3.5 text-blue-600")}What Asha read</h3><p class="text-[13px] leading-5 text-gray-800">${esc(r.summary)}</p>${button("Open full fax", { v: "white", s: "xs", icon: "maximize-2", cls: "mt-2" })}</div></section>
      ${psec("Patient", matchSec, { cls: p ? "" : "!pb-0" })}
      ${psec("File as", `<div class="grid grid-cols-2 gap-2"><button type="button" class="${R.selectSm}">${{ ref: "Referral letter", eob: "EOB", med: "Medical clearance", lab: "Lab slip", rec: "Records request" }[r.type]}${I("chevrons-up-down")}</button><button type="button" class="${R.selectSm}">Chart › Documents${I("chevrons-up-down")}</button></div>`)}
    </div>
    <div class="flex items-center justify-end gap-2 border-t border-gray-200/80 px-5 py-3">${button("Archive", { v: "white", s: "sm" })}${button("Upload to chart", { v: "solid", s: "sm", icon: "file-up", attrs: p ? "" : "disabled" })}</div></div>`;
}
/* v2 faxes: no docked panel (it hid Type and Pages); a fax opens as the 520px sheet. Routine is blank, Not matched is grey
 * words with an orange icon (so Urgent is the only dot), and the fax type is plain text instead of five tag colours. */
const FAX_FILE = { ref: "Referral letter", eob: "EOB", med: "Medical clearance", lab: "Lab slip", rec: "Records request" };
const v2FaxCols = () => { const c = Object.fromEntries(faxCols().map((x) => [x.key, x]));
  return [c.from,
    Object.assign(c.pt, { render: (r) => (r.pt ? `<span class="inline-flex items-center gap-x-2">${avatar(P(r.pt).name, { size: 5 })}${esc(P(r.pt).name)}</span>` : `<span class="inline-flex items-center gap-1 text-[13px] text-gray-500" data-tip="Asha couldn't tell who this fax is for. Open it to pick the patient.">${I("circle-alert", "size-3.5 shrink-0 text-orange-500")}Not matched</span>`),
      label: `<span${chg("Not matched is grey words with an orange icon, so the Urgent dot is the only dot on a row")}>Patient</span>` }),
    Object.assign(c.urgent, { normal: ["Routine"], label: `<span${chg("Priority shows only when unusual: Routine faxes are blank, so Urgent stands out")}>Priority</span>` }),
    c.sort, Object.assign(c.type, { render: (r) => `<span class="text-gray-700">${FTYPE[r.type][0]}</span>`, label: `<span${chg("The fax type is plain text: five tag colours named a type without meaning anything")}>Type</span>` }), c.pages]; };
/* v4: the inbox keeps who sent it, the patient, priority, when and what kind; what Asha read on it, the pages and the
 * number open in a card when you point at the row, so a fax can be triaged without opening it */
const v4FaxCols = () => v2FaxCols().filter((c) => c.key !== "pages").map((c) => (c.key === "from" ? Object.assign(c, { label: `<span${chg4("Point at a fax to read what Asha read on it, with its pages and number, in a card beside the row; Pages left the list, so a fax can be sorted without opening it.")}>From</span>` }) : c));
const v4FaxPeek = (r) => peekCard(esc(r.from), [["Type", FTYPE[r.type][0]], ["Pages", r.pages], ["Fax number", `<span class="tabular-nums">${r.num}</span>`]], esc(r.summary));
const v2FaxSheet = (r) => { const p = r.pt && P(r.pt);
  return { flush: true, title: esc(r.from),
    subtitle: `<span class="inline-flex flex-wrap items-center gap-x-2"${chg("Type, time and pages are one line under the name, with Urgent as an orange icon only when urgent, instead of a tag row above the title")}><span class="tabular-nums">${FTYPE[r.type][0]} · ${r.recv}, ${r.time} · ${r.pages} ${r.pages === 1 ? "page" : "pages"}</span>${r.urgent ? alertMark("Urgent", "The sender marked this fax urgent. File it and let the provider know today.") : ""}</span>`,
    actions: `<span class="inline-flex gap-0.5"${chg("One Archive, in the footer: the header's archive icon is gone")}>${iconButton("download", "Download fax", { s: "iconSm" })}${iconButton("printer", "Print", { s: "iconSm" })}</span>`,
    body: `<section class="${R.psec} flex gap-4">${faxPage(r)}<div class="min-w-0"><h3 class="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">${I("sparkles", "size-3.5 text-blue-600")}What Asha read</h3><p class="text-[13px] leading-5 text-gray-800">${esc(r.summary)}</p>${button("Open full fax", { v: "white", s: "xs", icon: "maximize-2", cls: "mt-2" })}</div></section>
      ${psec("Patient", p ? `<div${chg("A matched patient shows no 'Matched' status, just the patient and Change")}>${faxMatchSec(r)}</div>` : faxMatchSec(r), { cls: p ? "" : "!pb-0" })}
      ${psec("File as", `<div class="grid grid-cols-2 gap-2"><button type="button" class="${R.selectSm}">${FAX_FILE[r.type]}${I("chevrons-up-down")}</button><button type="button" class="${R.selectSm}">Chart › Documents${I("chevrons-up-down")}</button></div>`)}`,
    footer: `${button("Archive", { v: "white", s: "sm" })}${button("Upload to chart", { v: "solid", s: "sm", icon: "file-up", attrs: p ? "" : "disabled" })}` }; };
/* v4 fax panel: who it's for and how it's filed are one table you type into (Patient searches as you type); a fax Asha
 * couldn't match lists its best guesses under the table, and picking one fills the Patient cell. */
const V4_FAX_PTS = ["p13", "p9", "p2", "p8", "p5", "p1", "p3"];
const v4FaxPtHtml = (x) => { const id = V4_FAX_PTS.find((i) => P(i).name === x.value);
  return `<span class="inline-flex items-center gap-2 min-w-0">${avatar(x.value, { size: 5 })}${esc(x.value)}${id ? `<span class="text-gray-500 tabular-nums truncate">· ${fmtDateY(P(id).dob)}</span>` : ""}</span>`; };
const v4FaxPicked = (aside) => { if (!aside) return; const m = aside.querySelector("[data-v4-fax-matches]"); if (m) m.hidden = true; };
const v4FaxSheet = (r) => { const p = r.pt && P(r.pt), base = v2FaxSheet(r);
  const rows = [{ label: "Patient", value: p ? p.name : "", type: "select", options: V4_FAX_PTS.map((i) => P(i).name), ph: "Pick the patient", html: v4FaxPtHtml },
    { label: "File as", value: FAX_FILE[r.type], type: "select", options: Object.values(FAX_FILE) },
    { label: "Folder", value: "Chart › Documents", type: "select", options: ["Chart › Documents", "Chart › Insurance", "Chart › Referrals", "Chart › Lab cases"] }];
  const guesses = p ? "" : `<section class="${R.psec}" data-v4-fax-matches><p class="mb-2">${flag("Asha couldn't tell who this is for. Pick the patient above, or one of these.", "!text-[13px]")}</p>
    <div${chg4("Asha's guesses are a compact table: the patient, when they were born and why Asha thinks so, with Pick on the row; the last visit opens in a card when you point at it.")}>${sheetTable({ sheet: false, title: "Possible matches", rows: [["p13", "Name is close, DOB matches"], ["p9", "Same last visit day only"]].slice(0, r.id === 3 ? 1 : 2).map(([id, why]) => ({ id, why })),
      peek: (x) => peekCard(esc(P(x.id).name), [["Born", fmtDateY(P(x.id).dob)], ["Last visit", P(x.id).lastVisit ? fmtDateY(P(x.id).lastVisit) : "None"], ["Why", esc(x.why)]]),
      columns: [{ key: "id", label: "Patient", w: 150, render: (x) => `<span class="inline-flex items-center gap-2 min-w-0">${avatar(P(x.id).name, { size: 5 })}<span class="truncate">${esc(P(x.id).name)}</span></span>` },
        { key: "dob", label: "Born", w: 108, render: (x) => `<span class="tabular-nums">${fmtDateY(P(x.id).dob)}</span>` }, { key: "why", label: "Why", w: 120, grow: true, render: (x) => `<span class="text-gray-600">${esc(x.why)}</span>` },
        { key: "pick", label: "", w: 76, render: (x) => button("Pick", { v: "white", s: "xs", attrs: `data-v4-fax-pick="${esc(P(x.id).name)}"` }) }] })}</div></section>`;
  return Object.assign(base, {
    subtitle: `<span class="tabular-nums">${FTYPE[r.type][0]} · ${r.recv}, ${r.time} · ${r.pages} ${r.pages === 1 ? "page" : "pages"}</span>`,
    marks: r.urgent ? `<span class="inline-flex"${chg4("Urgent is a small orange mark by the sender's name, the way every record's header shows what needs attention, instead of words in the line under it.")}>${recordMark("circle-alert", "Urgent: the sender marked this fax urgent. File it and let the provider know today.", true)}</span>` : "",
    body: `<section class="${R.psec} flex gap-4">${faxPage(r)}<div class="min-w-0"><h3 class="mb-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">${I("sparkles", "size-3.5 text-blue-600")}What Asha read</h3><p class="text-[13px] leading-5 text-gray-800">${esc(r.summary)}</p>${button("Open full fax", { v: "white", s: "xs", icon: "maximize-2", cls: "mt-2" })}</div></section>
      ${psec(p ? "Filing" : "", `<div data-v4-fax-filing${chg4(p ? "Who the fax is for and how it's filed are one table you type into: Patient searches as you type, and File as and Folder are lists in place." : "Who the fax is for and how it's filed are one table you type into, named Filing in its grey header band like the table of Asha's guesses below it: Patient searches as you type, and File as and Folder are lists in place.")}>${v4CommsFields(rows, { labelW: 112, title: "Filing", band: !p, onCommit: (x, k, v, g) => { if (x.label === "Patient" && v) v4FaxPicked(g.root.closest("aside")); } })}</div>`)}${guesses}`,
    footer: `${button("Archive", { v: "white", s: "sm" })}<span class="inline-flex"${p ? "" : chg4("Upload to chart is never greyed out: with no patient yet, it opens the Patient cell so you can pick one")}>${button("Upload to chart", { v: "solid", s: "sm", icon: "file-up", attrs: "data-v4-fax-upload" })}</span>` }); };
let v4FaxWired = false;
const v4FaxWire = () => { if (v4FaxWired) return; v4FaxWired = true;
  document.addEventListener("click", (e) => { const u = e.target.closest("[data-v4-fax-upload]"), ga = u && u.closest("aside")?.querySelector("[data-v4-fax-filing] [data-sheet-host]")?._grid;
    if (ga && !ga.data[0].value) { ga.active = { r: 0, c: 1 }; ga.startEdit(); return; }
    const b = e.target.closest("[data-v4-fax-pick]"); if (!b) return; const aside = b.closest("aside"), g = aside && aside.querySelector("[data-v4-fax-filing] [data-sheet-host]")?._grid;
    if (g) { g.data[0].value = b.dataset.v4FaxPick; g.render(); } v4FaxPicked(aside); }); };
const FAX_TABS = ["Fax inbox", "Sent", "Archived"];
function v2CommsFaxes(state) {
  const loading = state === "Loading";
  return `${workspaceHeader({ parent: "Communications", title: "Faxes", actions: `${button("Fax settings", { v: "quiet", s: "sm", icon: "settings-2" })}${button("Send fax", { v: "white", s: "sm", icon: "send" })}` })}
    <div data-fax-tabs${loading ? chg("Count tabs stay blank while the list loads") : ""}>${tabsWithSlot(loading ? FAX_TABS : [["Fax inbox", FAXES.length], ["Sent", FAX_SENT.length], ["Archived", FAX_ARCHIVED.length]], 0, dateRangeButton("Last 7 days"))}</div>
    <div class="relative h-[600px] overflow-hidden">
      <div class="px-4">${loading ? `<div class="py-2.5 flex gap-2">${skel("w-48", "h-8")}</div><div${chg("The loading table has the same six columns as the real one")}>${gridSkeleton(V4 ? ["From", "Patient", "Priority", "Received", "Type"] : ["From", "Patient", "Priority", "Received", "Type", "Pages"], 8)}</div>`
        : `<div data-grid="faxes"${chg("All six columns fit: Type and Pages were hidden behind a docked 420px panel")}></div>`}</div>
      ${state === "Not matched" ? v2Overlay((V4 ? v4FaxSheet : v2FaxSheet)(FAXES[2]), "A fax opens as the standard 520px panel over the list instead of a docked panel that squeezed the list") : ""}
    </div>`;
}
function v2CommsFaxesMount(el, state) {
  const host = el.querySelector('[data-grid="faxes"]'); if (!host) return;
  const g = new Grid(host, { columns: V4 ? v4FaxCols() : v2FaxCols(), rows: FAXES, title: "Fax inbox", viewButton: false, noun: "faxes", searchPlaceholder: "Search faxes", maxHeight: 520, addColumn: false,
    defaultSort: { key: "sort", dir: -1 }, calc: V4 ? {} : { pages: "sum" }, ...(V4 ? { peek: v4FaxPeek } : {}),
    filters: [{ key: "urgent", label: "Priority", options: [{ value: "u", label: "Urgent", tone: "needs" }, { value: "r", label: "Routine", tone: "off" }], match: (r, v) => (v === "u") === r.urgent }, { key: "pt", label: "Patient", options: [{ value: "m", label: "Matched", tone: "on" }, { value: "n", label: "Not matched", tone: "needs" }], match: (r, v) => (v === "m") === !!r.pt }],
    bulk: [{ label: "Archive", icon: "archive" }, { label: "Mark as read", icon: "mail-open" }],
    onOpen: (r) => { r.unread = false; el.querySelector("[data-v2-panel]")?.remove(); Sheet.open(V4 ? v4FaxSheet(r) : v2FaxSheet(r)); } });
  if (V4) v4FaxWire();
  if (state === "Not matched") { g.openId = FAXES[2].id; g.render(); }
  const lists = [FAXES, FAX_SENT, FAX_ARCHIVED];
  wireTabs(el.querySelector("[data-fax-tabs]"), (i) => { g.setRows(lists[i]); g.o.title = FAX_TABS[i]; g.cols[0].label = i === 1 ? "To" : "From"; g.render(); });
}
defineBlock({
  cat: "comms", id: "comms-faxes", title: "Faxes",
  note: "Incoming faxes with who they're from, what kind they are, the patient Asha matched, and priority. The open fax shows the page, what Asha read, and Upload to chart. A fax Asha couldn't match asks you to pick the patient.",
  where: "Communications › Faxes",
  states: ["Matched", "Not matched", "Loading"],
  canvas: "bare",
  html: (state) => V2 ? v2CommsFaxes(state) : `${workspaceHeader({ parent: "Communications", title: "Faxes", actions: `${button("Fax settings", { v: "quiet", s: "sm", icon: "settings-2" })}${button("Send fax", { v: "white", s: "sm", icon: "send" })}` })}
    <div data-fax-tabs>${tabsWithSlot([["Fax inbox", FAXES.length], ["Sent", FAX_SENT.length], ["Archived", FAX_ARCHIVED.length]], 0, dateRangeButton("Last 7 days"))}</div>
    <div class="grid h-[600px] grid-cols-[minmax(0,1fr)_420px]">
      <div class="min-w-0 px-4">${state === "Loading" ? `<div class="py-2.5 flex gap-2">${skel("w-32", "h-8")}${skel("w-48", "h-8")}</div>${gridSkeleton(["From", "Patient", "Priority", "Received"], 8)}` : '<div data-grid="faxes"></div>'}</div>
      <div class="min-h-0 border-s border-gray-200/80" data-fax-panel>${state === "Loading" ? `<div class="p-5 space-y-3">${skel("w-20", "h-5")}${skel("w-48", "h-5")}<div class="pt-3">${skel("w-full", "h-64")}</div></div>` : faxPanel(FAXES[state === "Not matched" ? 2 : 0])}</div>
    </div>`,
  mount: (el, state) => {
    if (V2) return v2CommsFaxesMount(el, state);
    const host = el.querySelector('[data-grid="faxes"]'); if (!host) return;
    const panel = el.querySelector("[data-fax-panel]"); const first = FAXES[state === "Not matched" ? 2 : 0];
    const g = new Grid(host, { columns: faxCols(), rows: FAXES, title: "Fax inbox", searchPlaceholder: "Search faxes", maxHeight: 520, addColumn: false,
      defaultSort: { key: "sort", dir: -1 }, calc: { pages: "sum" },
      filters: [{ key: "urgent", label: "Priority", options: [{ value: "u", label: "Urgent", tone: "needs" }, { value: "r", label: "Routine", tone: "off" }], match: (r, v) => (v === "u") === r.urgent }, { key: "pt", label: "Patient", options: [{ value: "m", label: "Matched", tone: "on" }, { value: "n", label: "Not matched", tone: "needs" }], match: (r, v) => (v === "m") === !!r.pt }],
      bulk: [{ label: "Archive", icon: "archive" }, { label: "Mark as read", icon: "mail-open" }],
      onOpen: (r) => { r.unread = false; panel.innerHTML = faxPanel(r); icons(); } });
    g.openId = first.id; g.render();
    const lists = [FAXES, FAX_SENT, FAX_ARCHIVED];
    wireTabs(el.querySelector("[data-fax-tabs]"), (i) => { g.setRows(lists[i]); g.o.title = ["Fax inbox", "Sent", "Archived"][i]; g.cols[0].label = i === 1 ? "To" : "From"; g.render(); if (lists[i][0]) { panel.innerHTML = faxPanel(lists[i][0]); icons(); } });
  }
});

})();
