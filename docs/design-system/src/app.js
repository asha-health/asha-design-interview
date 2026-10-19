/* Asha design blend — page shell: router, overview, foundations, components, block pages, build list. */
/* ?tables=grid rebuilds the hand-made tables as grids; see "tables as grids" below */
const GRID_TABLES = V2 || new URLSearchParams(location.search).get("tables") === "grid";

/* ------------------------------------------------------------ sample list for the components page */
const LAB_ROWS = [
  { id: 1, name: "Bayview Ceramics", status: "on", types: ["Crowns", "Veneers"], days: 7, open: 4, phone: "(510) 555-0142", contact: "Maria Chen", last: "2026-09-23" },
  { id: 2, name: "Clearline Ortho Lab", status: "on", types: ["Aligners", "Retainers"], days: 10, open: 2, phone: "(408) 555-0199", contact: "Dev Patel", last: "2026-09-19" },
  { id: 3, name: "Harbor Denture Studio", status: "needs", types: ["Dentures", "Partials"], days: 14, open: 1, phone: "", contact: "", last: "2026-09-12" },
  { id: 4, name: "Precision Crown & Bridge", status: "on", types: ["Crowns", "Bridges", "Implants"], days: 5, open: 6, phone: "(916) 555-0107", contact: "Sam Ortiz", last: "2026-09-24" },
  { id: 5, name: "Summit Dental Lab", status: "off", types: ["Night guards"], days: 8, open: 0, phone: "(559) 555-0163", contact: "Lena Park", last: "2026-08-30" },
  { id: 6, name: "Northstar Surgical Guides", status: "on", types: ["Implants"], days: 12, open: 3, phone: "(503) 555-0120", contact: "", last: "2026-09-21" }
];
const LAB_BUSY = ["Pacific Northwest Ceramic & Implant Studio", "Golden State Removable Prosthetics Lab", "Allied Digital Crown & Bridge Center", "Evergreen Orthodontic Appliance Workshop", "Bayview Ceramics", "Cascade Full-Arch Implant Laboratory", "Clearline Ortho Lab", "Desert Sun Denture & Partial Specialists", "Harbor Denture Studio", "Keystone Night Guard & Splint Lab", "Lakeshore Zirconia Milling Center", "Meridian Esthetic Veneer Studio", "Northstar Surgical Guide Lab", "Oak Valley Dental Arts", "Riverbend Precision Attachments", "Sierra Digital Smile Design Studio"]
  .map((name, i) => { const T = ["Crowns", "Bridges", "Veneers", "Implants", "Aligners", "Retainers", "Dentures", "Partials", "Night guards"];
    return { id: 100 + i, name, status: ["on", "on", "needs", "on", "off", "on"][i % 6], types: [...new Set([T[i % 9], T[(i * 4 + 2) % 9], T[(i * 7 + 5) % 9]].slice(0, 1 + (i % 3)))], days: [7, 10, 14, 5, 8, 21, 12][i % 7], open: (i * 5) % 11, phone: i % 6 === 2 ? "" : `(${[510, 408, 916, 559, 503][i % 5]}) 555-0${String(110 + i * 7).slice(-3)}`, contact: ["Maria Chen", "Dev Patel", "", "Sam Ortiz", "Lena Park", "Ana Ruiz", "Tom Becker", ""][i % 8], last: `2026-09-${String(24 - (i % 20)).padStart(2, "0")}` }; });
const TYPE_TONE = { Crowns: "tagBlue", Bridges: "tagBlue", Veneers: "tagIndigo", Implants: "tagIndigo", Aligners: "tagTeal", Retainers: "tagTeal", Dentures: "tagGray", Partials: "tagGray", "Night guards": "tagGray" };
const LAB_STATUS = { on: "Active", off: "Paused", needs: "Needs a phone" };
const labColumns = () => [
  { key: "name", label: "Lab", icon: "building-2", w: 272, edit: true, required: true, kind: "text", open: true, lead: (r) => avatar(r.name, { size: 5, square: true, solid: true }), render: (r) => esc(r.name) },
  { key: "status", label: "Status", icon: "circle-dot", w: 150, kind: "text", value: (r) => LAB_STATUS[r.status], render: (r) => statusDot(LAB_STATUS[r.status], r.status) },
  { key: "types", label: "Makes", icon: "tag", w: 224, kind: "list", value: (r) => r.types.join(", "), render: (r) => r.types.length ? `<div class="flex items-center gap-x-1">${r.types.slice(0, 2).map((t) => tag(t, TYPE_TONE[t])).join("")}${r.types.length > 2 ? `<span class="text-xs text-gray-500">+${r.types.length - 2}</span>` : ""}</div>` : `<span class="text-gray-400">None set</span>` },
  { key: "days", label: "Turnaround", icon: "timer", w: 128, num: true, edit: true, kind: "num", render: (r) => `${r.days} <span class="text-gray-500">days</span>` },
  { key: "open", label: "Open cases", icon: "package", w: 124, num: true, kind: "num", render: (r) => (r.open ? String(r.open) : `<span class="text-gray-400">0</span>`) },
  { key: "phone", label: "Phone", icon: "phone", w: 164, edit: true, kind: "text", render: (r) => (r.phone ? esc(r.phone) : flag("Add phone")) },
  { key: "contact", label: "Contact", icon: "user", w: 176, edit: true, kind: "text", render: (r) => (r.contact ? `<span class="inline-flex items-center gap-x-2">${avatar(r.contact, { size: 5 })}${esc(r.contact)}</span>` : `<span class="text-gray-400">No contact</span>`) },
  { key: "last", label: "Last case", icon: "calendar", w: 124, kind: "date", render: (r) => (r.last ? fmtDate(r.last) : `<span class="text-gray-400">No cases yet</span>`) }
];
function openLabSheet(r) {
  Sheet.open({
    title: esc(r.name), lead: avatar(r.name, { size: 9, square: true, solid: true }),
    subtitle: `${statusDot(LAB_STATUS[r.status], r.status, "!text-[13px] !text-gray-500")} · ${r.days}-day turnaround`,
    tabs: ["Overview", ["Cases", r.open], "Activity"],
    actions: iconButton("link", "Copy link", { s: "iconSm" }) + iconButton("ellipsis", "More", { s: "iconSm" }),
    body: `<div class="space-y-6">
      ${section("Details", `${kv("phone", "Phone", r.phone ? esc(r.phone) : flag("No phone yet"))}${kv("user", "Contact", r.contact ? esc(r.contact) : '<span class="text-gray-400">Set a contact…</span>')}${kv("timer", "Turnaround", `${r.days} days`)}${kv("tag", "Makes", r.types.length ? `<div class="flex flex-wrap gap-1">${r.types.map((t) => tag(t, TYPE_TONE[t])).join("")}</div>` : '<span class="text-gray-400">None set</span>')}${kv("calendar", "Last case", r.last ? fmtDate(r.last) : '<span class="text-gray-400">No cases yet</span>')}`)}
      <div class="border-t border-gray-200/80 pt-5">${section("Notes", `<textarea class="${R.textarea}" placeholder="Pickup times, who to call, anything the team should know"></textarea>`)}</div></div>`
  });
}
const labGrid = (el, rows, o = {}) => new Grid(el, Object.assign({ columns: labColumns(), rows, title: "All labs", searchPlaceholder: "Search labs", defaultSort: { key: "name", dir: 1 }, calc: { open: "sum", days: "avg" },
  filters: [{ key: "status", label: "Status", options: [{ value: "on", label: "Active", tone: "on" }, { value: "needs", label: "Needs a phone", tone: "needs" }, { value: "off", label: "Paused", tone: "off" }] }],
  primary: { label: "New lab" }, empty: { icon: "flask-conical", title: "No labs yet", body: "Add the labs you send cases to, and we'll track how long they take.", action: "Add a lab" },
  bulk: [{ label: "Export", icon: "download" }, { label: "Pause", icon: "pause", run: (rows) => rows.forEach((r) => (r.status = "off")) }, { label: "Delete", icon: "trash-2", danger: true, run: (rows, g) => { g.data = g.data.filter((r) => !rows.includes(r)); } }],
  onOpen: openLabSheet,
  onNew: (g) => { const id = Date.now() % 1e6; g.data.unshift({ id, name: "New lab", status: "needs", types: [], days: 7, open: 0, phone: "", contact: "", last: "" }); g.q = ""; g.filters = {}; g.sort = null; g.render(); g.active = { r: g.visible.findIndex((r) => r.id === id), c: 0 }; g.editing = { id, key: "name" }; g.fresh = new Set([id]); g.render(); } }, o));

/* ------------------------------------------------------------ nav model */
const FOUNDATIONS = [["colour", "Colour"], ["type", "Text"], ["size", "Size and shape"], ["density", "Density"], ["motion", "Motion"]];
const COMPONENTS = [["buttons", "Buttons"], ["fields", "Fields"], ["tags", "Tags and status"], ["menus", "Menus and dialogs"], ["feedback", "Notes and toasts"], ["grid", "Data grid"]];

const pageSection = (id, title, sub, body, source) => `<section id="${id}" class="scroll-mt-6 py-12 border-t border-gray-200/80 first:border-0 first:pt-0">
  <div class="flex items-baseline gap-x-3 mb-1"><h2 class="text-xl font-semibold tracking-tight text-gray-800">${title}</h2>${source ? `<span class="text-xs font-medium text-gray-400">${source}</span>` : ""}</div>
  ${sub ? `<p class="text-sm text-gray-500 max-w-2xl mb-6">${sub}</p>` : '<div class="mb-6"></div>'}${body}</section>`;
const specimen = (label, inner, cls = "") => `<div class="${cls}"><p class="${R.caption} mb-2.5">${label}</p>${inner}</div>`;
const pageHeader = (eyebrow, title, sub, extra = "") => `<header class="mb-10"><p class="text-sm font-medium text-blue-600 mb-2">${eyebrow}</p><h1 class="${R.display}">${title}</h1>${sub ? `<p class="mt-2 text-base text-gray-500 max-w-2xl">${sub}</p>` : ""}${extra}</header>`;

/* ------------------------------------------------------------ foundations */
const BLUE = [["50", "#EFF6FF"], ["100", "#DBEAFE"], ["200", "#BEDBFF"], ["300", "#8EC5FF"], ["400", "#51A2FF"], ["500", "#2B7FFF"], ["600", "#155DFC"], ["700", "#1447E6"], ["800", "#193CB8"], ["900", "#1C398E"]];
const GRAY = [["50", "#F9FAFB"], ["100", "#F3F4F6"], ["200", "#E5E7EB"], ["300", "#D1D5DC"], ["400", "#99A1AF"], ["500", "#6A7282"], ["600", "#4A5565"], ["700", "#364153"], ["800", "#1E2939"], ["900", "#101828"]];
const ROLE_BLUE = { "600": "Main button, links, on, checked", "700": "Hover and pressed", "100": "Soft fill: chips, soft buttons", "800": "Text on soft fill", "500": "Focus border", "200": "Chart bars (other)" };
const ROLE_GRAY = { "800": "Text", "500": "Secondary text", "400": "Empty cells, placeholders", "200": "Lines (at 80%)", "100": "Hover, the page you're on", "50": "Row hover, canvases", "900": "Tooltips, selection bar, toasts" };
const swatchRow = (scale, name, roles) => `<div class="grid grid-cols-10 gap-2">${scale.map(([k, hex]) => `
  <button type="button" class="flex flex-col self-start text-start group cursor-pointer" data-copy="${hex}" title="Copy ${hex}">
    <span class="block h-14 rounded-lg bg-${name}-${k} ${+k <= 100 ? "ring-1 ring-inset ring-black/5" : ""} group-hover:ring-2 group-hover:ring-blue-600/30"></span>
    <span class="mt-1.5 block text-xs font-medium text-gray-800">${name}-${k}</span><span class="block text-[11px] text-gray-400 tabular-nums">${hex}</span>
    ${roles[k] ? `<span class="mt-0.5 block text-[11px] leading-4 text-gray-500">${roles[k]}</span>` : ""}</button>`).join("")}</div>`;

function foundationsPage() {
  return `${pageHeader("Foundations", "The basics", "Colour from Preline, sizes from shadcn, and Asha's house rules on top.")}
  ${pageSection("colour", "Colour", "Preline's default palette: Tailwind 4 blue and gray, the same Tailwind the app uses. Click a swatch to copy it.", `<div class="space-y-8">
    ${specimen("Blue", swatchRow(BLUE, "blue", ROLE_BLUE))}${specimen("Gray", swatchRow(GRAY, "gray", ROLE_GRAY))}
    ${specimen("What each colour is allowed to mean", `<div class="grid grid-cols-2 gap-x-12 border-y border-gray-200/80 divide-y divide-gray-200/80">${[
      [statusDot("Active", "on"), "Blue means on, connected, selected, or the one thing to click."],
      [statusDot("Paused", "off"), "Grey is everything else. Most of the screen is grey and black."],
      [flag("Needs a person"), "Orange means only that a person must fix something. A small icon and normal grey text."],
      [`<span class="inline-flex items-center gap-x-1.5 text-sm text-red-600">${I("trash-2", "size-4")}Delete</span>`, "Red is only for deleting and for a thing that failed."],
      [`<span class="flex gap-1">${tag("Crowns", "tagBlue")}${tag("Aligners", "tagTeal")}${tag("Implants", "tagIndigo")}</span>`, "Pale Preline tags say what kind of thing something is. They never mean good or bad."],
      [`<span class="text-sm"><span class="text-blue-700 font-medium">Claim</span> · <span class="text-emerald-700 font-medium">Payment</span> · <span class="text-red-700 font-medium">ADJ</span></span>`, "One exception: ledger entry types keep the text colours offices know from Dentrix."]
    ].map(([a, b]) => `<div class="grid grid-cols-[160px_1fr] items-center gap-4 py-3 odd:pe-6">${a}<span class="text-[13px] text-gray-600">${b}</span></div>`).join("")}</div>`)}
  </div>`, "from Preline")}
  ${pageSection("type", "Text", "Inter. 14px is the default for almost everything, like shadcn. Headings stay a little tight.", `<div class="divide-y divide-gray-200/80 border-y border-gray-200/80">
    ${[["Display", R.display, "Good morning, Maya", "32 / 40 · semibold · tight"], ["Page title", R.pageTitle, "Claims", "24 / 32 · semibold · tight"], ["Section title", R.sectionTitle, "Treatment plan", "16 / 24 · semibold"], ["Group title", R.groupTitle, "Insurance", "14 / 20 · semibold"], ["Label", R.label, "Remind me when a case is late", "14 / 20 · medium"], ["Body", R.body, "Crown on #30 is ready to seat.", "14 / 20 · regular"], ["Help", R.help, "Used when a lab has no turnaround set.", "13 / 20 · regular · gray-500"], ["Column header", "text-sm font-medium text-gray-500", "Patient", "14 / 20 · medium · gray-500"], ["Small", R.caption, "Updated 2 minutes ago", "12 / 16 · gray-500"], ["Number", R.number, "$12,480.00", "24 / 32 · semibold · even-width digits"]]
      .map(([n, c, s, spec]) => `<div class="grid grid-cols-[180px_1fr_240px] items-center gap-6 py-3.5"><span class="text-[13px] text-gray-500">${n}</span><span class="${c}">${s}</span><span class="text-xs text-gray-400 tabular-nums">${spec}</span></div>`).join("")}</div>`, "Inter, shadcn scale")}
  ${pageSection("size", "Size and shape", "shadcn's sizing. Controls are 36px by default and 32px in busy toolbars. Corners and shadows stay small.", `<div class="grid grid-cols-2 gap-x-12 gap-y-10">
    ${specimen("Heights", `<div class="flex items-start gap-4">${[["28", "xs", "Inside chips and table cells"], ["32", "sm", "Toolbars, sidebar rows"], ["36", "md", "Default"], ["40", "lg", "Rare: a page's one big action"]].map(([h, s, n]) => `<div class="flex flex-col items-start gap-2 w-28"><div class="h-10 flex items-end">${button("Button", { v: "white", s })}</div><span class="text-xs font-medium text-gray-800">${h}px <span class="text-gray-400">${s}</span></span><span class="text-[11px] leading-4 text-gray-500">${n}</span></div>`).join("")}</div>`)}
    ${specimen("Corners", `<div class="flex items-start gap-5">${[["4px", "rounded-[4px]", "Checkboxes", "size-10"], ["6px", "rounded-md", "Items inside menus", "size-12"], ["8px", "rounded-lg", "Buttons, fields, boxes", "size-14"], ["12px", "rounded-xl", "Menus and dialogs only", "size-16"], ["Full", "rounded-full", "Tags, switches", "h-8 w-16"]].map(([v, c, n, sz]) => `<div class="flex flex-col items-start gap-2 w-24"><div class="h-16 flex items-end"><span class="block ${sz} ${c} border border-gray-300 bg-gray-50"></span></div><span class="text-xs font-medium text-gray-800">${v}</span><span class="text-[11px] leading-4 text-gray-500">${n}</span></div>`).join("")}</div>`)}
    ${specimen("Shadows", `<div class="flex items-start gap-5 bg-gray-50 rounded-xl p-5">${[["shadow-2xs", "Buttons, fields"], ["", "Boxes: a line, no shadow"], ["shadow-xl", "Menus, selection bar"], ["shadow-[0_24px_48px_-12px_rgba(17,24,39,0.25)]", "Dialogs"]].map(([c, n]) => `<div class="flex flex-col items-start gap-2 w-28"><span class="size-16 rounded-${c === "" ? "lg" : "xl"} bg-white border border-gray-200/80 ${c}"></span><span class="text-[11px] leading-4 text-gray-500">${n}</span></div>`).join("")}</div>`)}
    ${specimen("Focus", `<div class="flex items-center gap-4">${button("Tab to me", { v: "white", cls: "ring-3 ring-blue-600/20" })}<input class="${R.input} !w-56 !border-blue-500 ring-3 ring-blue-600/15" value="Focused field" aria-label="Focused field example" /></div><p class="${R.help} mt-3">A 3px soft blue ring, like shadcn's, in Preline blue.</p>`)}
  </div>`, "from shadcn")}
  ${pageSection("density", "Density", "Dental staff dislike tall rows. These are the heights everything is built from.", `<div class="grid grid-cols-2 gap-x-12 gap-y-6">
    ${specimen("Row heights", `<div class="border-y border-gray-200/80 divide-y divide-gray-200/80">${[["Toolbar", "32px controls, 52px bar", "h-[52px]"], ["Grid header", "40px, 14px medium grey", "h-10"], ["Grid row", "36px", "h-9"], ["Grid totals", "32px, 12px grey", "h-8"], ["Settings row", "44px minimum, 8px padding", "min-h-11"], ["Sidebar row", "32px", "h-8"]].map(([a, b, h]) => `<div class="flex items-center justify-between ${h} text-sm"><span class="font-medium text-gray-800">${a}</span><span class="text-gray-500">${b}</span></div>`).join("")}</div>`)}
    ${specimen("Spacing", `<div class="space-y-2">${[[4, "Icon to text"], [8, "Between controls"], [12, "Cell padding"], [16, "Inside a box"], [24, "Between sections"], [32, "Page gutter"]].map(([p, n]) => `<div class="flex items-center gap-3"><span class="h-3 rounded-sm bg-blue-200" style="width:${p * 3}px"></span><span class="text-xs font-medium text-gray-800 w-10 tabular-nums">${p}px</span><span class="text-xs text-gray-500">${n}</span></div>`).join("")}</div>`)}
  </div>`)}
  ${pageSection("motion", "Motion", "One set of small, quick movements used everywhere. They confirm what you did without making you wait, and they turn off for anyone who asks their computer to reduce motion. Try each one.", motionCatalogue())}`;
}

/* ------------------------------------------------------------ motion catalogue */
const MOTIONS = [
  ["press", "Press", "Buttons dip 2% while held", "100ms · ease-out", "No dip", () => `<div class="flex gap-2">${button("Save", { v: "solid" })}${button("Export", { v: "white", icon: "download" })}${iconButton("ellipsis", "More", { v: "white" })}</div>`],
  ["hover", "Hover", "Rows and menu items fade their fill in", "100–120ms · ease", "Kept (colour only)", () => `<div class="w-56 -mx-1">${["Rename", "Duplicate", "Pause lab"].map((l, i) => `<button type="button" class="${R.menuItem}">${I(["pencil", "copy", "pause"][i])}${l}</button>`).join("")}</div>`],
  ["menu", "Menus open", "Fade in and drop 3px from the button", "160ms · ease-out", "Appear instantly", () => `<div class="relative" data-demo-menu>${button("Status", { v: "white", s: "sm", iconEnd: "chevron-down", attrs: 'data-demo="menu" aria-expanded="false" aria-haspopup="menu"' })}<div data-slot></div></div>`],
  ["tabs", "Tabs", "The blue line slides to the new tab", "200ms · ease-out", "Line jumps", () => `<div data-demo-tabs>${tabsBar([["To be sent", 3], ["Sent", 4], ["Adjudicated", 3]], 1)}</div>`],
  ["seg", "Switch views", "The white thumb slides across", "200ms · ease-out", "Thumb jumps", () => segmented(["Day", "Week", "Month"], 0)],
  ["switch", "Switch and save glow", "The knob slides, then the row glows blue once to say it saved", "150ms slide · 1.2s glow", "Glow kept, no slide", () => `<div class="${R.box} divide-y divide-gray-200/80 w-full"><div class="flex items-center justify-between gap-4 px-3 min-h-11" data-row><span class="text-sm">Remind me when a case is late</span>${sw(true, "Remind me")}</div></div>`],
  ["check", "Tick", "The box pops a little as it fills", "180ms · ease-out", "Fills without the pop", () => `<div class="flex flex-col gap-2">${["Crowns", "Bridges", "Implants"].map((l, i) => `<label class="inline-flex items-center gap-2 text-sm">${checkbox(i === 0)}${l}</label>`).join("")}</div>`],
  ["chip", "Filter chips", "A new chip grows in; the others stay still", "160ms · ease-out", "Appears instantly", () => `<div class="flex flex-wrap items-center gap-2" data-chips>${condChip("Status", "is", "Denied", 'data-demo="chipx"', "Remove")}${button("Add filter", { v: "quiet", s: "xs", icon: "plus", attrs: 'data-demo="chip"' })}</div>`],
  ["row", "New row", "Fades in from 4px above, then glows once", "220ms + 1.2s glow", "Glow only", () => `<div class="${R.tableBox} w-full"><table class="text-sm"><tbody data-rows>${["Bayview Ceramics", "Clearline Ortho Lab"].map((n) => `<tr><td class="${R.tCell}">${n}</td></tr>`).join("")}</tbody></table></div><div class="mt-2">${button("Add a lab", { v: "white", s: "xs", icon: "plus", attrs: 'data-demo="row"' })}</div>`],
  ["save", "Edit in place", "Press Enter: the value settles with a glow and a quiet “Saved”", "1.2s glow", "Glow kept", () => `<div class="flex items-center gap-2 w-full"><input class="${R.inputSm} !w-32" value="7 days" data-demo="save" aria-label="Turnaround" /><span class="text-[13px] text-blue-600 opacity-0 transition-opacity duration-150" data-saved>${I("check", "size-3.5 inline")} Saved</span></div>`],
  ["toast", "Toast with Undo", "Slides up from the bottom and leaves after 4 seconds", "200ms in · 150ms out", "Appears and leaves instantly", () => button("Delete 2 labs", { v: "danger", s: "sm", icon: "trash-2", attrs: 'data-demo="toast"' })],
  ["sheet", "Side panel", "Slides in from the right edge", "220ms · ease-out", "Appears instantly", () => button("Open a lab", { v: "white", s: "sm", iconEnd: "panel-right-open", attrs: 'data-demo="sheet" data-opens-sheet' })],
  ["load", "Loading to content", "A soft light sweeps across the grey bars, then the content fades in where they were", "sweep 1.8s · fade 150ms", "Still bars", () => `<div class="w-full space-y-2" data-load>${skel("w-3/4")}${skel("w-1/2")}</div><div class="mt-2">${button("Load again", { v: "white", s: "xs", icon: "rotate-cw", attrs: 'data-demo="load"' })}</div>`],
  ["alert", "Row alert", "Hover or focus the words to see the whole sentence", "150ms · fade", "Appears instantly", () => `<div class="${R.box} w-full flex items-center justify-between gap-3 px-3 min-h-11"><span class="text-sm">Friday · 7 AM–2 PM</span>${alertMark("2 visits after close", "Hyg 2 still has 2 visits after 2:00 PM on Friday, Oct 2. They stay booked; new visits stop at 2:00 PM.", { action: button("Show visits", { v: "white", s: "xs" }) })}</div>`],
  ["ai", "Asha is thinking", "The step being worked on shimmers blue, with dots and a live ring", "shimmer 2.2s loop", "Plain text, no loop", () => `<div class="w-full rounded-lg asha-wash px-3 py-2 flex items-center gap-2.5"><span class="relative flex size-5 items-center justify-center"><span class="asha-ping absolute size-3.5 rounded-full bg-blue-400/35"></span><span class="relative size-2 rounded-full bg-blue-500"></span></span><span class="asha-shimmer text-sm font-medium">Reading 3 EOBs from MetLife</span><span class="inline-flex gap-1 items-end"><span class="asha-dot"></span><span class="asha-dot"></span><span class="asha-dot"></span></span></div>`]
];
function motionCatalogue() {
  return `<div class="flex items-center gap-3 mb-5"><span class="${R.caption}">Animations</span>${segmented(["On", "Reduced"], document.documentElement.dataset.motion === "reduced" ? 1 : 0, { sm: true, attrs: 'data-motion-switch' })}<span class="${R.help}">“Reduced” shows what people with reduce-motion turned on will see, everywhere on this page.</span></div>
  <div class="grid grid-cols-3 gap-4">${MOTIONS.map(([id, t, what, spec, reduced, demo]) => `<div class="${R.box} flex flex-col p-4" data-motion-card="${id}">
    <p class="${R.groupTitle}">${t}</p><p class="${R.help}">${what}</p>
    <div class="grow flex items-center min-h-24 py-4"><div class="w-full">${demo()}</div></div>
    <div class="border-t border-gray-200/80 -mx-4 px-4 pt-2.5 flex justify-between gap-2 text-xs text-gray-500"><span class="tabular-nums">${spec}</span><span>Reduced: ${reduced}</span></div></div>`).join("")}</div>`;
}
function mountMotion(root) {
  const card = (id) => root.querySelector(`[data-motion-card="${id}"]`);
  if (!card("menu")) return;
  wireTabs(card("tabs"), () => {});
  root.addEventListener("click", (e) => {
    const d = e.target.closest("[data-demo]"); if (!d) return; const k = d.dataset.demo;
    if (k === "menu") { const open = d.getAttribute("aria-expanded") !== "true"; d.setAttribute("aria-expanded", open); const slot = card("menu").querySelector("[data-slot]");
      slot.innerHTML = open ? `<div class="absolute start-0 top-full mt-1 z-30 ${R.menu} !w-44" role="menu">${[["on", "Confirmed"], ["off", "Unconfirmed"], ["needs", "Needs a call"]].map(([t, l]) => `<button type="button" class="${R.menuItem}"><span class="${cx(R.dot, TONE_DOT[t])}"></span>${l}</button>`).join("")}</div>` : ""; }
    if (k === "chip") { const box = card("chip").querySelector("[data-chips]"); d.insertAdjacentHTML("beforebegin", condChip("Payer", "is", ["MetLife", "Cigna", "Aetna"][box.children.length % 3], 'data-demo="chipx"', "Remove", "asha-chip-in")); icons(); }
    if (k === "chipx") d.closest("[role=group]").remove();
    if (k === "row") { const tb = card("row").querySelector("[data-rows]"); tb.insertAdjacentHTML("afterbegin", `<tr class="asha-row-in"><td class="${R.tCell}">New lab ${tb.children.length - 1}</td></tr>`); }
    if (k === "toast") toast("Deleted 2 labs", { icon: "trash-2", action: "Undo", onAction: () => toast("Put back 2 labs") });
    if (k === "sheet") openLabSheet(LAB_ROWS[0]);
    if (k === "load") { const box = card("load").querySelector("[data-load]"); box.innerHTML = `${skel("w-3/4")}${skel("w-1/2")}`; setTimeout(() => { box.innerHTML = `<p class="text-sm text-gray-800 asha-reveal">Bayview Ceramics · 7 days</p><p class="${R.help} asha-reveal">4 cases open</p>`; }, 900); }
  });
  root.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.dataset.demo === "save") { Motion.settle(e.target); const s2 = card("save").querySelector("[data-saved]"); s2.style.opacity = 1; setTimeout(() => (s2.style.opacity = 0), 1600); } });
}
const setMotion = (reduced) => { if (reduced) document.documentElement.dataset.motion = "reduced"; else delete document.documentElement.dataset.motion; try { localStorage.setItem("asha-blend-motion", reduced ? "reduced" : "on"); } catch (_) {} };
try { if (localStorage.getItem("asha-blend-motion") === "reduced") document.documentElement.dataset.motion = "reduced"; } catch (_) {}

/* ------------------------------------------------------------ components */
function componentsPage() {
  return `${pageHeader("Components", "The pieces", "Every block is built from these. Preline colours at shadcn sizes, with Attio's grid.")}
  ${pageSection("buttons", "Buttons", "Preline's styles, trimmed to 36px. One blue button per area. Everything else is white, soft or quiet.", `<div class="space-y-8">
    ${specimen("Styles", `<div class="flex flex-wrap items-center gap-3">${button("Save", { v: "solid" })}${button("Export", { v: "white", icon: "download" })}${button("Add filter", { v: "soft", icon: "plus" })}${button("Duplicate", { v: "ghost", icon: "copy" })}${button("Cancel", { v: "quiet" })}${button("Learn more", { v: "link" })}${button("Delete lab", { v: "danger", icon: "trash-2" })}${button("Void claim", { v: "dangerSolid" })}</div>`)}
    ${specimen("Sizes", `<div class="flex flex-wrap items-center gap-3">${button("Large", { v: "solid", s: "lg" })}${button("Default", { v: "solid" })}${button("Small", { v: "solid", s: "sm" })}${button("Tiny", { v: "solid", s: "xs" })}<span class="h-6 border-s border-gray-200/80 mx-1"></span>${iconButton("ellipsis", "More", { v: "white", s: "iconMd" })}${iconButton("printer", "Print", { v: "white", s: "iconSm" })}${iconButton("plus", "Add", { v: "quiet", s: "iconXs" })}</div>`)}
    ${specimen("With a shortcut, pending, and a split action", `<div class="flex flex-wrap items-center gap-3">${button(`Cancel <kbd class="${R.kbd} !border-transparent !bg-gray-100">Esc</kbd>`, { v: "white" })}${button(`Post payment <kbd class="${R.kbd} !border-white/20 !bg-white/10 !text-white/80">↵</kbd>`, { v: "solid" })}${button(`${I("loader-circle", "animate-spin")}Sending…`, { v: "solid", attrs: "disabled" })}<div class="inline-flex">${button("Send claim", { v: "solid", cls: "rounded-e-none" })}${iconButton("chevron-down", "More send options", { v: "solid", cls: "rounded-s-none border-s border-s-white/20" })}</div></div>`)}
  </div>`, "Preline colours · shadcn sizes")}
  ${pageSection("fields", "Fields", "A grey line that turns blue when you type. Labels sit to the left in settings, above in dialogs.", `<div class="grid grid-cols-2 gap-x-12 gap-y-8">
    ${specimen("Text", `<div class="space-y-1.5"><label class="${R.label}" for="f1">Lab name</label><input id="f1" class="${R.input}" placeholder="e.g. Bayview Ceramics" /><p class="${R.help}">Shown on case slips.</p></div>`)}
    ${specimen("With a problem", `<div class="space-y-1.5"><label class="${R.label}" for="f2">Phone</label><input id="f2" class="${R.inputBad}" value="555-01" /><div class="asha-reveal">${note("That number looks too short.")}</div></div>`)}
    ${specimen("Money and dates", `<div class="grid grid-cols-2 gap-3"><div class="space-y-1.5"><span class="${R.label}">Amount</span><div class="relative"><span class="absolute inset-y-0 start-0 flex items-center ps-3 text-sm text-gray-400">$</span><input class="${R.input} !ps-7 text-end tabular-nums" value="184.00" aria-label="Amount" /></div></div><div class="space-y-1.5"><span class="${R.label}">Date</span><button type="button" class="${R.select}"><span class="inline-flex items-center gap-2">${I("calendar", "!text-gray-500")}Sep 25, 2026</span></button></div></div>`)}
    ${specimen("Search (toolbars)", `${searchBox("Search patients", { w: "w-full" })}<p class="${R.help} mt-1.5">Filled grey, turns white when you click in. From Preline.</p>`)}
    ${specimen("Switches, boxes and dots", `<div class="flex flex-wrap items-center gap-x-6 gap-y-4"><label class="inline-flex items-center gap-x-2.5 text-sm">${sw(true, "On")}On</label><label class="inline-flex items-center gap-x-2.5 text-sm">${sw(false, "Off")}Off</label><label class="inline-flex items-center gap-x-2 text-sm">${checkbox(true)}Checked</label><label class="inline-flex items-center gap-x-2 text-sm">${checkbox(false)}Not checked</label><label class="inline-flex items-center gap-x-2 text-sm"><input type="radio" name="rr" class="${R.radio}" checked />Crowns</label><label class="inline-flex items-center gap-x-2 text-sm"><input type="radio" name="rr" class="${R.radio}" />Bridges</label></div>`)}
    ${specimen("Two ways to switch views", `<div class="flex flex-wrap items-center gap-6">${segmented(["Table", "Board", "Calendar"])}${tabsBar([["To be sent", 14], ["Sent", 38], ["Adjudicated", 9]], 0, "grow")}</div><p class="${R.help} mt-2">Grey segments switch how one list looks. Blue underline tabs switch between lists.</p>`)}
    ${specimen("Settings row", `<div class="border-y border-gray-200/80 divide-y divide-gray-200/80"><div class="flex items-center justify-between gap-6 py-2 min-h-11"><div><p class="${R.label} flex items-center gap-1.5">Remind me when a case is late ${I("info", "size-3.5 text-gray-400")}</p><p class="${R.help}">We add a task the day after it was due back.</p></div>${sw(true, "Remind me when a case is late")}</div><div class="flex items-center justify-between gap-6 py-2 min-h-11"><div><p class="${R.label}">Default turnaround</p><p class="${R.help}">Used when a lab has no turnaround set.</p></div><button type="button" class="${R.select} !w-36">7 days${I("chevrons-up-down")}</button></div></div>`, "col-span-2")}
  </div>`, "Preline colours · shadcn sizes")}
  ${pageSection("tags", "Tags and status", "Pale tags say what kind of thing something is. Status is always a dot and a word.", `<div class="grid grid-cols-2 gap-x-12 gap-y-8">
    ${specimen("Tags", `<div class="flex flex-wrap gap-2">${tag("Crowns", "tagBlue")}${tag("Implants", "tagIndigo")}${tag("Aligners", "tagTeal")}${tag("Dentures", "tagGray")}${tag("New patient", "tagOutline")}</div>`)}
    ${specimen("Status", `<div class="flex flex-wrap gap-x-6 gap-y-2">${statusDot("Connected", "on")}${statusDot("Paused", "off")}${statusDot("Needs you", "needs")}${statusDot("Not started", "quiet")}</div>`)}
    ${specimen("Needs a person", `${flag("Harbor Denture Studio has no phone number.")}<p class="${R.help} mt-1.5">A small orange icon and normal grey text. Never a yellow band.</p>`)}
    ${specimen("Counts, shortcuts, avatars", `<div class="flex flex-wrap items-center gap-4"><span class="${R.count}">12</span><span class="${R.countBlue}">3</span>${kbd("⌘K")}<span class="${R.tooltip}">Copy link <span class="text-white/60">⌘C</span></span><span class="flex -space-x-1.5">${["Maya Patel", "Ethan Brooks", "Sofia Ramirez"].map((n) => `<span class="ring-2 ring-white rounded-full">${avatar(n, { size: 7 })}</span>`).join("")}</span></div>`)}
  </div>`, "Preline colours")}
  ${pageSection("menus", "Menus and dialogs", "Short menus with an icon on the left and the shortcut on the right. Dialogs are small and sit near the top.", `<div class="flex flex-wrap items-start gap-12 bg-gray-50 px-6 py-8 rounded-xl">
    ${specimen("Menu", `<div class="${R.menu}" role="menu"><div class="relative mb-1"><span class="absolute inset-y-0 start-0 flex items-center ps-2 pointer-events-none">${I("search", "size-4 text-gray-400")}</span><input class="w-full h-8 ps-8 pe-2 text-[13px] bg-transparent outline-hidden placeholder:text-gray-400 border-b border-gray-200/80" placeholder="Search actions" aria-label="Search actions" /></div>
      <button class="${R.menuItem}">${I("pencil")}Rename<span class="ms-auto text-xs text-gray-400">R</span></button><button class="${R.menuItem}">${I("copy")}Duplicate<span class="ms-auto text-xs text-gray-400">⌘D</span></button><button class="${R.menuItem}">${I("link")}Copy link<span class="ms-auto text-xs text-gray-400">⌘C</span></button><button class="${R.menuItem}">${I("pause")}Pause lab</button><div class="${R.menuSep}"></div><button class="${R.menuDanger}">${I("trash-2")}Delete lab<span class="ms-auto text-xs text-red-400">⌫</span></button></div>`)}
    ${specimen("Dialog", `<div class="${R.dialog}" role="dialog" aria-label="Add a lab"><div class="flex items-center justify-between h-13 px-5 border-b border-gray-200/80"><h3 class="text-base font-semibold text-gray-800">Add a lab</h3>${iconButton("x", "Close", { s: "iconSm" })}</div>
      <div class="p-5 space-y-4"><div class="space-y-1.5"><label class="${R.label}" for="d1">Name</label><input id="d1" class="${R.input}" placeholder="e.g. Bayview Ceramics" /></div><div class="grid grid-cols-2 gap-3"><div class="space-y-1.5"><label class="${R.label}" for="d2">Phone</label><input id="d2" class="${R.input}" placeholder="(555) 555-0100" /></div><div class="space-y-1.5"><span class="${R.label}">Turnaround</span><button type="button" class="${R.select}">7 days${I("chevrons-up-down")}</button></div></div></div>
      <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200/80">${button(`Cancel <kbd class="${R.kbd} !border-transparent !bg-gray-100">Esc</kbd>`, { v: "white", s: "sm" })}${button(`Add lab <kbd class="${R.kbd} !border-white/20 !bg-white/10 !text-white/80">↵</kbd>`, { v: "solid", s: "sm" })}</div></div>`)}
  </div>`, "Preline surfaces · Attio layout")}
  ${pageSection("feedback", "Notes and toasts", "Guidance sits next to the thing it's about. Toasts are only for things that happened somewhere else.", `<div class="grid grid-cols-2 gap-x-12 gap-y-8">
    ${specimen("Notes", `<div class="space-y-2">${note("Harbor Denture Studio has no phone number. <a class=\"text-blue-600 hover:underline\" href=\"#\">Add one</a>")}${note("Changes here apply to all three locations.", "info")}${note("The clearinghouse didn't answer. We'll try again in 5 minutes.", "error")}</div>`)}
    ${specimen("Toast", V4 ? `<div class="flex flex-col gap-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 p-5">${alertCard({ title: "Claim sent to Delta Dental", action: "Undo" })}${alertCard({ lead: avatar("Nina Flores", { size: 8 }), title: "Nina Flores", time: "now", body: "Can you call Olivia back about her crown estimate?" })}</div>` : `<div class="${R.toast}">${I("check", "size-4 text-blue-300")}<span class="grow">Claim sent to Delta Dental</span>${button("Undo", { v: "onDark", s: "xs" })}</div>`)}
    ${specimen("Save status on a row", `<div class="flex items-center gap-6 text-[13px]"><span class="inline-flex items-center gap-1.5 text-gray-500">${I("loader-circle", "size-3.5 animate-spin")}Saving…</span><span class="inline-flex items-center gap-1.5 text-blue-600">${I("check", "size-3.5")}Saved</span>${flag("Couldn't save. Phone must have 10 digits.", "!text-[13px]")}</div>`)}
    ${specimen("Loading", `<div class="space-y-2.5">${skel("w-2/3")}${skel("w-full")}${skel("w-5/6")}</div>`)}
  </div>`)}
  ${pageSection("grid", "Data grid", "Attio's grid in our colours. Search, sort by clicking a column name, filter, tick rows, click a cell and use the arrow keys, press Enter to edit, click a name to open it, or click the grey totals row.", `
    <div class="flex items-center gap-3 mb-2"><span class="${R.caption}">Show</span>${segmented(["A normal week", "First day, no labs", "Busy office, long names"], 0, { sm: true, attrs: 'id="ds"' })}</div>
    <div id="grid-demo"></div>
    <div class="mt-12"><h3 class="${R.groupTitle}">One grid, four presentations</h3><p class="${R.help} mt-1 mb-5 max-w-2xl">The same component and the same four lines. Pick the presentation by where the table sits; override a setting only when you must.</p>
      <div class="grid grid-cols-2 gap-x-8 gap-y-10">${GRID_PRESET_SPECS.map(([k, t, d]) => specimen(`<span class="font-medium text-gray-800">${t}</span> · ${d}`, k === "page"
        ? `<div class="rounded-xl border border-gray-200/80 overflow-hidden bg-white"><div class="px-4" data-preset="page"></div></div>` : `<div data-preset="${k}"></div>`)).join("")}</div></div>`, "from Attio")}`;
}

/* ------------------------------------------------------------ block pages */
function blockFrame(b) {
  const states = b.states;
  const canvas = { gray: "bg-gray-50/80", white: "bg-white", bare: "bg-white" }[b.canvas];
  return `<article id="b-${b.id}" data-block="${b.id}" class="scroll-mt-6 py-10 border-t border-gray-200/80 first:border-0 first:pt-2">
    <header class="flex items-end justify-between gap-6 mb-3">
      <div class="min-w-0"><h3 class="text-base font-semibold text-gray-800">${b.title}</h3>${b.note ? `<p class="text-sm text-gray-500 mt-0.5 max-w-3xl">${b.note}</p>` : ""}</div>
      <div class="flex items-center gap-3 shrink-0">${b.where ? `<span class="inline-flex items-center gap-1.5 text-xs text-gray-400">${I("map-pin", "size-3.5")}${b.where}</span>` : ""}
        ${states && states.length > 1 ? `<div data-state-switch="${b.id}">${segmented(states, 0, { sm: true })}</div>` : ""}</div>
    </header>
    <div data-canvas="${b.id}" class="relative rounded-xl border border-gray-200/80 ${canvas} ${b.pad && b.canvas !== "bare" ? "p-6" : ""} overflow-hidden">${renderBlock(b, states ? states[0] : null)}</div>
    ${V2 ? `<ol data-chg-list="${b.id}" class="mt-3 space-y-1.5 text-[13px] text-gray-700" hidden></ol>` : ""}
  </article>`;
}
function renderBlock(b, state) { try { return b.html(state); } catch (err) { console.error(`block ${b.id}`, err); return `<p class="text-sm text-red-600">Block ${esc(b.id)} failed: ${esc(err.message)}</p>`; } }
function mountBlock(b, el, state) { if (b.mount) try { b.mount(el, state); } catch (err) { console.error(`mount ${b.id}`, err); } if (HL) requestAnimationFrame(() => markChanges(el)); }
function blocksPage(catId) {
  const cat = CATEGORIES.find((c) => c.id === catId); const list = BLOCKS.filter((b) => b.cat === catId);
  if (!cat) return `<p class="text-sm text-gray-500">No such category.</p>`;
  const sysNote = V2 && HL && SYSTEM_CHANGES.length ? `<details class="mb-6 rounded-lg border border-orange-200 bg-orange-50/40 px-4 py-2.5 text-[13px] text-gray-700"><summary class="cursor-pointer font-medium text-gray-800">${SYSTEM_CHANGES.length} ${V4 ? "v4" : "v2"} changes apply to every block here (not outlined)</summary><ul class="mt-2 space-y-1.5">${SYSTEM_CHANGES.map(([a, n]) => `<li><span class="font-medium text-gray-800">${esc(a)}:</span> ${esc(n)}</li>`).join("")}</ul></details>` : "";
  return `${sysNote}${pageHeader(`Blocks · ${list.length}`, cat.title, cat.blurb, list.length > 3 ? `<div class="mt-5 flex flex-wrap gap-1.5">${list.map((b) => `<a href="#/blocks/${catId}/${b.id}" class="${cx(R.btn, R.xs, R.white)}">${b.title}</a>`).join("")}</div>` : "")}
    ${list.map(blockFrame).join("") || emptyState({ icon: "layout-template", title: "No blocks yet" })}`;
}

/* ------------------------------------------------------------ overview */
/* v2: what changed, listed once on the Overview (system changes) and counted per block */
let CHANGE_COUNTS = null; // nothing changes them without a reload, so render every block once per page load, not per visit
function v2Changes() {
  const per = CHANGE_COUNTS || (CHANGE_COUNTS = BLOCKS.map((b) => { const notes = new Set();
    (b.states && b.states.length ? b.states : [null]).forEach((st) => { const html = renderBlock(b, st); for (const m of html.matchAll(/data-chg="([^"]*)"/g)) notes.add(m[1]); });
    return { b, n: notes.size }; }).filter((x) => x.n));
  const sys = SYSTEM_CHANGES;
  return `<section class="mb-12 rounded-xl border border-orange-200 bg-orange-50/40 p-6">
    <div class="flex items-center gap-2 mb-1">${I("highlighter", "size-4 text-orange-500")}<h2 class="text-base font-semibold text-gray-800">${V4 ? "How Asha screens work: the v4 principles" : "What changed in v2"}</h2></div>
    <p class="${R.help} mb-5 max-w-3xl">${V4 ? "v4 builds on v2: one header for every record, one Actions menu, statuses inside the facts, and tables you type into like a spreadsheet (the way Dentrix and Eaglesoft staff work), plus the ADA claim form and the agent setup wizards." : "A UX review of every block against Attio and Preline: hierarchy, clutter, how often staff do each thing, and consistency (row heights, control heights, bars, colour)."} ${sys.length} changes apply to every block; ${per.reduce((a, x) => a + x.n, 0)} more are in ${per.length} blocks. Turn on <span class="font-medium">Highlight changes</span> in the sidebar to see each one outlined and numbered.</p>
    <div class="grid grid-cols-2 gap-8">
      <div><h3 class="${R.groupTitle} mb-2">${V4 ? "Principles (every block)" : "Every block"}</h3><ol class="space-y-2 text-[13px] text-gray-700">${sys.map(([area, note]) => `<li class="flex gap-2"><span class="shrink-0 font-medium text-gray-800 w-28">${esc(area)}</span><span>${esc(note)}</span></li>`).join("")}</ol></div>
      <div><h3 class="${R.groupTitle} mb-2">Blocks with changes</h3><div class="${R.tableBox} bg-white"><table class="w-full border-separate border-spacing-0 text-[13px]"><tbody>${per.map(({ b, n }) => `<tr><td class="h-8 px-3 border-b border-gray-200/80"><a class="text-gray-800 hover:underline" href="#/blocks/${b.cat}/${b.id}">${esc(b.title)}</a></td><td class="h-8 px-3 border-b border-gray-200/80 text-gray-500">${esc((CATEGORIES.find((c) => c.id === b.cat) || {}).title || b.cat)}</td><td class="h-8 px-3 border-b border-gray-200/80 text-end tabular-nums text-gray-800">${n}</td></tr>`).join("")}</tbody></table></div></div>
    </div></section>`;
}
function overviewPage() {
  const total = BLOCKS.length;
  return `${V2 ? v2Changes() : ""}${pageHeader("Asha design system", "One design, three sources", "Preline's blues and colours, shadcn's sizes and clean finish, and Attio's data grid, shown as the real blocks a dental office uses every day. Everything here works, so click around.")}
  <div class="grid grid-cols-3 border-y border-gray-200/80 divide-x divide-gray-200/80 mb-12">
    ${[["palette", "Colour", "from Preline", ["Blue-600 buttons, one shade darker on hover", "Soft blue fills for chips and soft buttons", "Cool greys for text and lines", "Pale tags for kinds of things"]], ["ruler", "Size and finish", "from shadcn", ["36px buttons and fields, 32px in toolbars", "14px text almost everywhere", "8px corners, 12px on menus and dialogs", "Barely-there shadows, soft blue focus ring"]], ["table-2", "Data grid", "from Attio", ["A line between columns, no box", "Filters and sort as chips on one line", "A totals row you can change", "Click a cell, use the arrow keys"]]]
      .map(([ic, t, src, pts]) => `<div class="p-6 first:ps-0"><div class="flex items-center gap-x-2 mb-3"><span class="flex items-center justify-center size-8 rounded-lg bg-blue-100 text-blue-800">${I(ic, "size-4")}</span><div><p class="text-sm font-semibold text-gray-800 leading-tight">${t}</p><p class="text-xs text-gray-500">${src}</p></div></div><ul class="space-y-1.5">${pts.map((p) => `<li class="flex gap-x-2 text-sm text-gray-700">${I("check", "size-4 mt-0.5 shrink-0 text-blue-600")}${p}</li>`).join("")}</ul></div>`).join("")}
  </div>
  <div class="flex items-baseline justify-between mb-4"><h2 class="text-xl font-semibold tracking-tight text-gray-800">Blocks</h2><span class="text-sm text-gray-500 tabular-nums">${total} blocks in ${CATEGORIES.filter((c) => BLOCKS.some((b) => b.cat === c.id)).length} groups</span></div>
  <div class="grid grid-cols-3 gap-5">${CATEGORIES.map((c) => { const list = BLOCKS.filter((b) => b.cat === c.id); const t = list.find((b) => b.thumb) || list[0];
    return `<a href="#/blocks/${c.id}" class="group block">
      <div class="relative h-44 rounded-xl border border-gray-200/80 bg-gray-50 overflow-hidden group-hover:border-gray-300 transition-colors" data-thumb="${t ? t.id : ""}">${t ? "" : `<div class="h-full flex items-center justify-center text-gray-300">${I(c.icon, "size-8")}</div>`}</div>
      <div class="mt-2.5 flex items-center justify-between"><p class="text-sm font-semibold text-gray-800 group-hover:text-blue-600">${c.title}</p><span class="text-xs text-gray-500 tabular-nums">${list.length} ${list.length === 1 ? "block" : "blocks"}</span></div>
      <p class="text-[13px] text-gray-500 line-clamp-1">${c.blurb}</p></a>`; }).join("")}</div>`;
}
function mountThumbs(root) {
  root.querySelectorAll("[data-thumb]").forEach((box) => {
    const b = BLOCKS.find((x) => x.id === box.dataset.thumb); if (!b) return;
    const W = b.thumbWidth || 1100;
    box.innerHTML = `<div aria-hidden="true" inert class="pointer-events-none absolute top-0 left-0 origin-top-left ${b.canvas === "gray" ? "p-6" : ""}" style="width:${W}px">${renderBlock(b, b.states ? b.states[0] : null)}</div>`;
    const inner = box.firstElementChild, fit = () => { inner.style.transform = `scale(${box.clientWidth / W})`; };
    mountBlock(b, inner, b.states ? b.states[0] : null);
    fit(); new ResizeObserver(fit).observe(box);
  });
}

/* ------------------------------------------------------------ build list */
function buildPage() {
  return `${pageHeader("Build list", "Every recipe, by name", "The class recipes every block uses. This is what we'd put into asha-ui.")}
    <div class="flex items-center gap-3 mb-3">${button("Copy all", { v: "white", s: "sm", icon: "copy", attrs: 'data-copy-all="1"' })}<span id="copied" class="${R.caption}"></span></div>
    <div class="border-y border-gray-200/80 divide-y divide-gray-100">${Object.entries(R).map(([k, v]) => `<div class="grid grid-cols-[140px_1fr] gap-4 py-2"><code class="text-[13px] font-medium text-gray-800">${k}</code><code class="text-xs leading-5 text-gray-500 break-words">${esc(v)}</code></div>`).join("")}</div>`;
}

/* ------------------------------------------------------------ shell + router */
function sidebar(route) {
  const [, page, part] = route;
  const link = (href, label, on, icon, count) => `<a href="${href}" class="${on ? R.navItemOn : R.navItem}" ${on ? 'aria-current="page"' : ""}>${icon ? I(icon) : ""}<span class="truncate">${label}</span>${count != null ? `<span class="ms-auto text-xs text-gray-400 tabular-nums">${count}</span>` : ""}</a>`;
  return `<div class="flex items-center gap-x-2 px-2 mb-4"><span class="flex items-center justify-center size-7 rounded-lg bg-blue-600 text-white">${I("layers", "size-4")}</span><div class="leading-tight"><p class="text-sm font-semibold text-gray-800">Asha design</p><p class="text-xs text-gray-500">Blend · Sept 25</p></div></div>
    <div class="px-2 mb-2">${segmented(["v1", "v2", "v4"], V4 ? 2 : V2 ? 1 : 0, { sm: true, attrs: 'data-v2-switch aria-label="Design system version"' })}</div>
    ${V2 ? `<label class="mx-2 mb-2 flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-[13px] text-gray-700 hover:bg-gray-100 cursor-pointer"><span class="inline-flex items-center gap-2">${I("highlighter", "size-4 text-orange-500")}Highlight changes</span>${`<input type="checkbox" class="sr-only peer" data-hl-switch ${HL ? "checked" : ""} /><span aria-hidden="true" class="relative h-5 w-9 shrink-0 rounded-full bg-gray-200 transition-colors peer-checked:bg-orange-500 after:absolute after:top-0.5 after:start-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-4"></span>`}</label>` : ""}
    ${V2 ? '<div class="mb-4"></div>' : `<div class="px-2 mb-4">${segmented(["Tables as-is", "Tables as grids"], GRID_TABLES ? 1 : 0, { sm: true, attrs: 'data-version-switch aria-label="Table rendering"' })}</div>`}
    ${link("#/", "Overview", !page, "house")}
    <p class="${R.navGroup}">Foundations</p>${FOUNDATIONS.map(([id, l]) => link(`#/foundations/${id}`, l, page === "foundations" && part === id)).join("")}
    <p class="${R.navGroup}">Components</p>${COMPONENTS.map(([id, l]) => link(`#/components/${id}`, l, page === "components" && part === id)).join("")}
    <p class="${R.navGroup}">Blocks</p>${CATEGORIES.map((c) => link(`#/blocks/${c.id}`, c.title, page === "blocks" && part === c.id, c.icon, BLOCKS.filter((b) => b.cat === c.id).length)).join("")}
    <p class="${R.navGroup}">More</p>${link("#/build", "Build list", page === "build", "code")}
    ${/settings-overhaul/.test(location.pathname) ? link("boards/preline.html", "Preline board", false, "palette") + link("boards/shadcn.html", "shadcn board", false, "ruler") + link("boards/attio.html", "Attio board", false, "table-2") : ""}
    <div class="mt-4 mx-2 pt-3 border-t border-gray-200/80"><p class="${R.eyebrow} mb-1.5">Animations</p>${segmented(["On", "Reduced"], document.documentElement.dataset.motion === "reduced" ? 1 : 0, { sm: true, attrs: "data-motion-switch" })}</div>`;
}
function parseRoute() { const h = location.hash.replace(/^#\/?/, ""); const [page, part, sub] = h.split("/"); return [h, page || "", part || "", sub || ""]; }
function route() {
  const r = parseRoute(); const [, page, part, sub] = r;
  document.getElementById("nav").innerHTML = sidebar(r);
  const main = document.getElementById("main");
  main.innerHTML = page === "foundations" ? foundationsPage() : page === "components" ? componentsPage() : page === "blocks" ? blocksPage(part) : page === "build" ? buildPage() : overviewPage();
  icons();
  if (page === "components") mountPresetSpecimens(main);
  if (page === "components") { const ds = document.getElementById("ds"); const g = labGrid(document.getElementById("grid-demo"), LAB_ROWS, { maxHeight: 440, box: true });
    ds.addEventListener("click", (e) => { const b = e.target.closest("[data-seg]"); if (!b) return; g.setRows([LAB_ROWS, [], LAB_BUSY][+b.dataset.seg]); g.q = ""; g.filters = {}; g.sort = g.baseline.sort && { ...g.baseline.sort }; g.render(); }); }
  if (page === "foundations") mountMotion(main);
  if (page === "blocks") main.querySelectorAll("[data-canvas]").forEach((el) => { const b = BLOCKS.find((x) => x.id === el.dataset.canvas); mountBlock(b, el, b.states ? b.states[0] : null); });
  if (!page) mountThumbs(main);
  icons();
  const target = page === "blocks" ? (sub ? document.getElementById(`b-${sub}`) : null) : part ? document.getElementById(part) : null;
  if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
  document.title = page === "blocks" ? `${(CATEGORIES.find((c) => c.id === part) || {}).title || "Blocks"} · Asha design` : "Asha design blend";
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.insertAdjacentHTML("afterbegin", `<div class="grid grid-cols-[248px_1fr] min-h-screen"><aside id="nav" class="sticky top-0 h-screen overflow-y-auto border-e border-gray-200/80 bg-white px-3 py-5"></aside><main id="main" class="min-w-0 px-12 pb-24 pt-10 max-w-[1320px]"></main></div>`);
  window.addEventListener("hashchange", route); route();
  document.addEventListener("click", (e) => {
    const sw = e.target.closest("[data-state-switch] [data-seg]");
    if (sw) { const wrap = sw.closest("[data-state-switch]"); const b = BLOCKS.find((x) => x.id === wrap.dataset.stateSwitch); const state = b.states[+sw.dataset.seg];
      const prev = sw.parentElement.querySelector('[aria-selected="true"]');
      [...sw.parentElement.children].forEach((x) => { const on = x === sw; x.className = on ? R.segOnSm : R.segItemSm; x.setAttribute("aria-selected", on); });
      Motion.glide(sw.parentElement, prev, sw, "thumb");
      const el = document.querySelector(`[data-canvas="${b.id}"]`); el.innerHTML = renderBlock(b, state); icons(); mountBlock(b, el, state); icons(); Motion.play(el, "asha-fade"); }
    const ms = e.target.closest("[data-motion-switch] [data-seg]"); if (ms) setMotion(ms.dataset.seg === "1");
    const play = e.target.closest("[data-play]");
    if (play) { const d = document.querySelector(`[data-demo="${play.dataset.play}"]`); const cls = `asha-${play.dataset.play}`; d.classList.remove(cls); void d.offsetWidth; d.classList.add(cls); }
    const c = e.target.closest("[data-copy]");
    const copy = (text, msg) => { try { navigator.clipboard.writeText(text).then(() => { const el = document.getElementById("copied"); if (el && msg) el.textContent = msg; }); } catch (_) {} };
    if (c) copy(c.dataset.copy);
    if (e.target.closest("[data-copy-all]")) copy(Object.entries(R).map(([k, v]) => `${k}: ${v}`).join("\n"), "Copied.");
  });
});

/* ------------------------------------------------------------ page 2: tables as grids
 * Add ?tables=grid to the page's address (index.html or dev.html). Every hand-made table with a header row (in side
 * panels, dialogs, popovers and page sections) is rebuilt through Grid.fromTable, the same component as the Lists
 * pages, in the presentation that fits where it sits (GRID_PRESETS in kit.js): "section" on a page, "panel" in a
 * flyout, dialog or popover, "form" for money sheets with 4+ number columns. The card gets
 * the panel's gutter when the table used to run edge to edge. Page grids, loading skeletons, key-value sheets
 * without a header row and the perio chart stay as they are. */
function upgradeTables(root) {
  root.querySelectorAll("table").forEach((t) => {
    if (t.dataset.kept || t.classList.contains("g-table") || !t.tHead || !t.tBodies[0] || !t.tBodies[0].rows.length || !t.getClientRects().length) return;
    if (t.closest("[inert],[aria-hidden='true'],.g-wrap") || t.tHead.querySelector("th.select-none") || t.querySelector("textarea")) { t.dataset.kept = "1"; return; }
    const surface = t.closest(".asha-pop,aside,[role=dialog],[data-canvas]") || document.body, pop = surface.classList.contains("asha-pop");
    /* replace the table together with any bare wrappers around it (a box, a bleed, a scroll frame) */
    let target = t;
    for (let p = t.parentElement; p && p !== surface && p.children.length === 1; p = p.parentElement) {
      const cs = getComputedStyle(p); if (parseFloat(cs.paddingLeft) > 0 && parseFloat(cs.marginLeft) >= 0) break; target = p; }
    /* a card never touches the panel edge: if the spot it lands in has no side padding, give it the panel's gutter */
    const parent = target.parentElement, pcs = getComputedStyle(parent), sr = surface.getBoundingClientRect(), pr = parent.getBoundingClientRect();
    const flush = pr.left + parseFloat(pcs.paddingLeft) - (sr.left + parseFloat(getComputedStyle(surface).borderLeftWidth)) < 2 && surface !== document.body;
    const gut = pop ? 16 : 20, width = pr.width - parseFloat(pcs.paddingLeft) - parseFloat(pcs.paddingRight) - (flush ? 2 * gut : 0) - 2;
    const host = document.createElement("div"); host.dataset.gridFromTable = "";
    if (flush) host.style.margin = `16px ${gut}px`;
    target.before(host);
    /* the presentation: on a page, "section"; in a flyout, dialog or popover, "panel"; a money sheet with 4+ number
     * columns is a "form" (cell lines, like the claim form) */
    const heads = [...t.tHead.rows[0].cells], numCols = heads.filter((th, i) => /text-end|text-right/.test(th.className)).length;
    const preset = surface.matches("[data-canvas]") ? "section" : numCols >= 4 ? "form" : "panel";
    try { Grid.fromTable(t, host, { width, preset }); target.remove();
      /* A section that trimmed its bottom padding for an edge-to-edge table gets normal padding back under the card */
      const sec = host.closest("section");
      if (sec && parseFloat(getComputedStyle(sec).paddingBottom) < 16 && sec.lastElementChild.contains(host)) sec.style.setProperty("padding-bottom", "16px", "important"); }
    catch (err) { console.error("grid from table", err); host.remove(); t.dataset.kept = "1"; }
  });
}
if (GRID_TABLES) {
  let queued = false;
  const run = () => { queued = false; upgradeTables(document.body); };
  new MutationObserver(() => { if (!queued) { queued = true; requestAnimationFrame(run); } }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });
  document.addEventListener("DOMContentLoaded", run); run();
}
document.addEventListener("click", (e) => { const v = e.target.closest("[data-version-switch] [data-seg]"); if (!v) return;
  const url = new URL(location.href);
  if (v.dataset.seg === "1") url.searchParams.set("tables", "grid"); else url.searchParams.delete("tables");
  location.href = url.toString(); });

/* ------------------------------------------------------------ components: one grid, four presentations */
const GRID_PRESET_SPECS = [
  ["page", "Page", "the main list of a page: edge to edge, 36px rows, cell lines, toolbar and sorting"],
  ["section", "Section", "a table among other content on a page: a card, 13px text, row lines only"],
  ["panel", "Panel", "in a flyout, dialog or popover: a card, 28px rows, small headers and totals on grey, row lines only"],
  ["form", "Form", "a money sheet like the claim form: compact, with cell lines"]
];
function mountPresetSpecimens(root) {
  const lines = [["D0120", "Periodic exam", 65, 52], ["D1110", "Adult cleaning", 110, 88], ["D0274", "Bitewings, four films", 78, 62.4], ["D2391", "Composite, one surface, back tooth", 185, 118.4]]
    .map(([code, desc, fee, ins], i) => ({ id: i, code, desc, fee, ins, pt: Math.round((fee - ins) * 100) / 100 }));
  const cash = (k, w = 80) => ({ key: k, label: { fee: "Fee", ins: "Ins. est.", pt: "Pt. est." }[k], w, num: true, kind: "money", render: (r) => money(r[k]) });
  const columns = [{ key: "code", label: "Code", w: 72, kind: "text" }, { key: "desc", label: "Description", w: 150, kind: "text" }, cash("fee"), cash("ins"), cash("pt")];
  const sum = (k) => money(lines.reduce((a, r) => a + r[k], 0));
  root.querySelectorAll("[data-preset]").forEach((el) => {
    const preset = el.dataset.preset;
    new Grid(el, preset === "page"
      ? { preset, columns: [columns[0], columns[1], cash("fee", 104), cash("ins", 104), cash("pt", 104)], rows: lines, title: "Procedures", searchPlaceholder: "Search procedures", selectable: false, addColumn: false, maxHeight: 320, calc: { fee: "sum", ins: "sum", pt: "sum" } }
      : { preset, columns, rows: lines, title: "Procedures", sortable: false, foot: ["Total", "", sum("fee"), sum("ins"), sum("pt")] });
  });
}

/* ------------------------------------------------------------ v2: highlight what changed
 * Every element a v2 block marks with chg("why") gets a number. With "Highlight changes" on, the element is outlined
 * and a numbered badge is drawn on a layer above the canvas (nothing inside the block moves), and the block's
 * "What changed" list explains each number. Hover a badge to read its reason. */
const HL = V2 && new URLSearchParams(location.search).get("hl") === "1";
if (HL) document.documentElement.dataset.hl = "1";
function markChanges(canvas) {
  const id = canvas.dataset.canvas, list = document.querySelector(`[data-chg-list="${id}"]`);
  canvas.querySelectorAll(":scope > [data-chg-layer]").forEach((n) => n.remove());
  const marks = [...canvas.querySelectorAll("[data-chg]")].filter((n) => n.getClientRects().length && !n.closest("[aria-hidden='true'],[inert]"));
  const notes = [];
  marks.forEach((m) => { let i = notes.indexOf(m.dataset.chg); if (i < 0) { notes.push(m.dataset.chg); i = notes.length - 1; } m.dataset.chgN = i + 1; });
  if (list) {
    list.hidden = !HL || !notes.length;
    list.innerHTML = notes.length ? `<li class="flex items-center gap-2 font-medium text-gray-800">${I("highlighter", "size-4 text-orange-500")}What changed in ${V4 ? "v4" : "v2"}</li>` + notes.map((n, i) => `<li class="flex items-start gap-2"><span class="mt-px inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[11px] font-semibold text-white tabular-nums">${i + 1}</span><span>${esc(n)}</span></li>`).join("") : "";
    icons();
  }
  if (!HL || !marks.length) return;
  const layer = document.createElement("div"); layer.dataset.chgLayer = ""; layer.className = "pointer-events-none absolute inset-0 z-[70]";
  const c = canvas.getBoundingClientRect(), seen = new Set();
  marks.forEach((m) => {
    const r = m.getBoundingClientRect(), n = m.dataset.chgN;
    const box = document.createElement("div");
    box.className = "absolute rounded-[5px] ring-2 ring-orange-500/90";
    // outline 2px outside the element, but never past the canvas edges
    const L = Math.max(1, r.left - c.left - 2), T = Math.max(1, r.top - c.top - 2), R = Math.min(c.width - 1, r.right - c.left + 2), B = Math.min(c.height - 1, r.bottom - c.top + 2);
    Object.assign(box.style, { left: `${L}px`, top: `${T}px`, width: `${Math.max(0, R - L)}px`, height: `${Math.max(0, B - T)}px` });
    layer.appendChild(box);
    if (seen.has(n)) return; seen.add(n);
    const tag = document.createElement("span");
    tag.className = "pointer-events-auto absolute inline-flex size-5 items-center justify-center rounded-full bg-orange-500 text-[11px] font-semibold text-white shadow-sm tabular-nums cursor-help";
    tag.textContent = n; tag.dataset.tip = m.dataset.chg;
    Object.assign(tag.style, { left: `${Math.max(2, r.left - c.left - 10)}px`, top: `${Math.max(2, r.top - c.top - 10)}px` });
    layer.appendChild(tag);
  });
  canvas.appendChild(layer);
}
if (HL) { // change marks are only drawn while Highlight changes is on
  let t = null;
  addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => document.querySelectorAll("[data-canvas]").forEach(markChanges), 150); });
  // re-mark after any change inside a canvas (tabs, steps, state switches); ignore our own badge layer
  let queued = false;
  new MutationObserver((muts) => {
    const inCanvas = (m) => m.target.closest?.("[data-canvas]") && ![...m.addedNodes, ...m.removedNodes].every((n) => n.dataset && "chgLayer" in n.dataset);
    if (queued || !muts.some(inCanvas)) return;
    queued = true; requestAnimationFrame(() => { queued = false; document.querySelectorAll("[data-canvas]").forEach(markChanges); });
  }).observe(document.body, { childList: true, subtree: true });
}
document.addEventListener("click", (e) => {
  const v = e.target.closest("[data-v2-switch] [data-seg]"); if (!v) return;
  const url = new URL(location.href);
  if (v.dataset.seg === "0") { url.searchParams.set("v", "1"); url.searchParams.delete("hl"); } else if (v.dataset.seg === "1") url.searchParams.set("v", "2"); else url.searchParams.delete("v"); // v4 is the default
  location.href = url.toString();
});
document.addEventListener("change", (e) => {
  if (!e.target.matches("[data-hl-switch]")) return;
  const url = new URL(location.href);
  if (e.target.checked) url.searchParams.set("hl", "1"); else url.searchParams.delete("hl");
  history.replaceState(null, "", url.toString());
  location.reload();
});
