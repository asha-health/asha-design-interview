/* Asha design system: page shell, router, overview, foundations and components. */

/* ------------------------------------------------------------ sample list for the components page */
const VENDOR_ROWS = [
  { id: 1, name: "Bayview Print Co.", status: "on", types: ["Printing", "Signage"], days: 7, open: 4, phone: "(510) 555-0142", contact: "Maria Chen", last: "2026-09-23" },
  { id: 2, name: "Clearline Office Supply", status: "on", types: ["Supplies", "Furniture"], days: 10, open: 2, phone: "(408) 555-0199", contact: "Dev Patel", last: "2026-09-19" },
  { id: 3, name: "Harbor Catering", status: "needs", types: ["Catering", "Coffee"], days: 14, open: 1, phone: "", contact: "", last: "2026-09-12" },
  { id: 4, name: "Precision IT Services", status: "on", types: ["IT", "Printing", "Shipping"], days: 5, open: 6, phone: "(916) 555-0107", contact: "Sam Ortiz", last: "2026-09-24" },
  { id: 5, name: "Summit Cleaning", status: "off", types: ["Cleaning"], days: 8, open: 0, phone: "(559) 555-0163", contact: "Lena Park", last: "2026-08-30" },
  { id: 6, name: "Northstar Freight", status: "on", types: ["Shipping"], days: 12, open: 3, phone: "(503) 555-0120", contact: "", last: "2026-09-21" }
];
const VENDOR_BUSY = ["Pacific Northwest Commercial Printing & Signage", "Golden State Office Furniture Outlet", "Allied Digital Managed IT Services", "Evergreen Corporate Catering Company", "Bayview Print Co.", "Cascade Freight & Same-Day Courier", "Clearline Office Supply", "Desert Sun Janitorial & Window Cleaning", "Harbor Catering", "Keystone Coffee & Breakroom Service", "Lakeshore Records Shredding Center", "Meridian Uniform & Linen Rental", "Northstar Freight", "Oak Valley Landscaping", "Riverbend Security Systems", "Sierra Water Delivery Service"]
  .map((name, i) => { const T = ["Printing", "Signage", "Supplies", "Furniture", "IT", "Shipping", "Catering", "Coffee", "Cleaning"];
    return { id: 100 + i, name, status: ["on", "on", "needs", "on", "off", "on"][i % 6], types: [...new Set([T[i % 9], T[(i * 4 + 2) % 9], T[(i * 7 + 5) % 9]].slice(0, 1 + (i % 3)))], days: [7, 10, 14, 5, 8, 21, 12][i % 7], open: (i * 5) % 11, phone: i % 6 === 2 ? "" : `(${[510, 408, 916, 559, 503][i % 5]}) 555-0${String(110 + i * 7).slice(-3)}`, contact: ["Maria Chen", "Dev Patel", "", "Sam Ortiz", "Lena Park", "Ana Ruiz", "Tom Becker", ""][i % 8], last: `2026-09-${String(24 - (i % 20)).padStart(2, "0")}` }; });
const TYPE_TONE = { Printing: "tagBlue", Signage: "tagBlue", Supplies: "tagIndigo", Furniture: "tagIndigo", IT: "tagTeal", Shipping: "tagTeal", Catering: "tagGray", Coffee: "tagGray", Cleaning: "tagGray" };
const VENDOR_STATUS = { on: "Active", off: "Paused", needs: "Needs a phone" };
const vendorColumns = () => [
  { key: "name", label: "Vendor", icon: "building-2", w: 272, edit: true, required: true, kind: "text", open: true, lead: (r) => avatar(r.name, { size: 5, square: true, solid: true }), render: (r) => esc(r.name) },
  { key: "status", label: "Status", icon: "circle-dot", w: 150, kind: "text", value: (r) => VENDOR_STATUS[r.status], render: (r) => statusDot(VENDOR_STATUS[r.status], r.status) },
  { key: "types", label: "Supplies", icon: "tag", w: 224, kind: "list", value: (r) => r.types.join(", "), render: (r) => r.types.length ? `<div class="flex items-center gap-x-1">${r.types.slice(0, 2).map((t) => tag(t, TYPE_TONE[t])).join("")}${r.types.length > 2 ? `<span class="text-xs text-gray-500">+${r.types.length - 2}</span>` : ""}</div>` : `<span class="text-gray-400">None set</span>` },
  { key: "days", label: "Lead time", icon: "timer", w: 128, num: true, edit: true, kind: "num", render: (r) => `${r.days} <span class="text-gray-500">days</span>` },
  { key: "open", label: "Open orders", icon: "package", w: 124, num: true, kind: "num", render: (r) => (r.open ? String(r.open) : `<span class="text-gray-400">0</span>`) },
  { key: "phone", label: "Phone", icon: "phone", w: 164, edit: true, kind: "text", render: (r) => (r.phone ? esc(r.phone) : flag("Add phone")) },
  { key: "contact", label: "Contact", icon: "user", w: 176, edit: true, kind: "text", render: (r) => (r.contact ? `<span class="inline-flex items-center gap-x-2">${avatar(r.contact, { size: 5 })}${esc(r.contact)}</span>` : `<span class="text-gray-400">No contact</span>`) },
  { key: "last", label: "Last order", icon: "calendar", w: 124, kind: "date", render: (r) => (r.last ? fmtDate(r.last) : `<span class="text-gray-400">No orders yet</span>`) }
];
function openVendorSheet(r) {
  Sheet.open({
    title: esc(r.name), lead: avatar(r.name, { size: 9, square: true, solid: true }),
    subtitle: `${statusDot(VENDOR_STATUS[r.status], r.status, "!text-[13px] !text-gray-500")} · ${r.days}-day lead time`,
    tabs: ["Overview", ["Orders", r.open], "Activity"],
    actions: iconButton("link", "Copy link", { s: "iconSm" }) + iconButton("ellipsis", "More", { s: "iconSm" }),
    body: `<div class="space-y-6">
      ${section("Details", `${kv("phone", "Phone", r.phone ? esc(r.phone) : flag("No phone yet"))}${kv("user", "Contact", r.contact ? esc(r.contact) : '<span class="text-gray-400">Set a contact…</span>')}${kv("timer", "Lead time", `${r.days} days`)}${kv("tag", "Supplies", r.types.length ? `<div class="flex flex-wrap gap-1">${r.types.map((t) => tag(t, TYPE_TONE[t])).join("")}</div>` : '<span class="text-gray-400">None set</span>')}${kv("calendar", "Last order", r.last ? fmtDate(r.last) : '<span class="text-gray-400">No orders yet</span>')}`)}
      <div class="border-t border-gray-200/80 pt-5">${section("Notes", `<textarea class="${R.textarea}" placeholder="Delivery times, who to call, anything the team should know"></textarea>`)}</div></div>`
  });
}
const vendorGrid = (el, rows, o = {}) => new Grid(el, Object.assign({ columns: vendorColumns(), rows, title: "All vendors", searchPlaceholder: "Search vendors", defaultSort: { key: "name", dir: 1 }, calc: { open: "sum", days: "avg" },
  filters: [{ key: "status", label: "Status", options: [{ value: "on", label: "Active", tone: "on" }, { value: "needs", label: "Needs a phone", tone: "needs" }, { value: "off", label: "Paused", tone: "off" }] }],
  primary: { label: "New vendor" }, empty: { icon: "truck", title: "No vendors yet", body: "Add the vendors you order from, and we'll track how long they take.", action: "Add a vendor" },
  bulk: [{ label: "Export", icon: "download" }, { label: "Pause", icon: "pause", run: (rows) => rows.forEach((r) => (r.status = "off")) }, { label: "Delete", icon: "trash-2", danger: true, run: (rows, g) => { g.data = g.data.filter((r) => !rows.includes(r)); } }],
  onOpen: openVendorSheet,
  onNew: (g) => { const id = Date.now() % 1e6; g.data.unshift({ id, name: "New vendor", status: "needs", types: [], days: 7, open: 0, phone: "", contact: "", last: "" }); g.q = ""; g.filters = {}; g.sort = null; g.render(); g.active = { r: g.visible.findIndex((r) => r.id === id), c: 0 }; g.editing = { id, key: "name" }; g.fresh = new Set([id]); g.render(); } }, o));

/* ------------------------------------------------------------ nav model */
const FOUNDATIONS = [["colour", "Colour"], ["type", "Text"], ["size", "Size and shape"], ["density", "Density"], ["motion", "Motion"]];
const COMPONENTS = [["buttons", "Buttons"], ["fields", "Fields"], ["tags", "Tags and status"], ["menus", "Menus and dialogs"], ["feedback", "Notes and toasts"], ["grid", "Data grid"], ["calendar", "Calendar"]];

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
      [`<span class="flex gap-1">${tag("Printing", "tagBlue")}${tag("IT", "tagTeal")}${tag("Furniture", "tagIndigo")}</span>`, "Pale Preline tags say what kind of thing something is. They never mean good or bad."]
    ].map(([a, b]) => `<div class="grid grid-cols-[160px_1fr] items-center gap-4 py-3 odd:pe-6">${a}<span class="text-[13px] text-gray-600">${b}</span></div>`).join("")}</div>`)}
  </div>`, "from Preline")}
  ${pageSection("type", "Text", "Inter. 14px is the default for almost everything, like shadcn. Headings stay a little tight.", `<div class="divide-y divide-gray-200/80 border-y border-gray-200/80">
    ${[["Display", R.display, "Good morning, Maya", "32 / 40 · semibold · tight"], ["Page title", R.pageTitle, "Projects", "24 / 32 · semibold · tight"], ["Section title", R.sectionTitle, "Project plan", "16 / 24 · semibold"], ["Group title", R.groupTitle, "Contact details", "14 / 20 · semibold"], ["Label", R.label, "Remind me when an order is late", "14 / 20 · medium"], ["Body", R.body, "Your order is ready to pick up.", "14 / 20 · regular"], ["Help", R.help, "Used when a vendor has no lead time set.", "13 / 20 · regular · gray-500"], ["Column header", "text-sm font-medium text-gray-500", "Name", "14 / 20 · medium · gray-500"], ["Small", R.caption, "Updated 2 minutes ago", "12 / 16 · gray-500"], ["Number", R.number, "$12,480.00", "24 / 32 · semibold · even-width digits"]]
      .map(([n, c, s, spec]) => `<div class="grid grid-cols-[180px_1fr_240px] items-center gap-6 py-3.5"><span class="text-[13px] text-gray-500">${n}</span><span class="${c}">${s}</span><span class="text-xs text-gray-400 tabular-nums">${spec}</span></div>`).join("")}</div>`, "Inter, shadcn scale")}
  ${pageSection("size", "Size and shape", "shadcn's sizing. Controls are 36px by default and 32px in busy toolbars. Corners and shadows stay small.", `<div class="grid grid-cols-2 gap-x-12 gap-y-10">
    ${specimen("Heights", `<div class="flex items-start gap-4">${[["28", "xs", "Inside chips and table cells"], ["32", "sm", "Toolbars, sidebar rows"], ["36", "md", "Default"], ["40", "lg", "Rare: a page's one big action"]].map(([h, s, n]) => `<div class="flex flex-col items-start gap-2 w-28"><div class="h-10 flex items-end">${button("Button", { v: "white", s })}</div><span class="text-xs font-medium text-gray-800">${h}px <span class="text-gray-400">${s}</span></span><span class="text-[11px] leading-4 text-gray-500">${n}</span></div>`).join("")}</div>`)}
    ${specimen("Corners", `<div class="flex items-start gap-5">${[["4px", "rounded-[4px]", "Checkboxes", "size-10"], ["6px", "rounded-md", "Items inside menus", "size-12"], ["8px", "rounded-lg", "Buttons, fields, boxes", "size-14"], ["12px", "rounded-xl", "Menus and dialogs only", "size-16"], ["Full", "rounded-full", "Tags, switches", "h-8 w-16"]].map(([v, c, n, sz]) => `<div class="flex flex-col items-start gap-2 w-24"><div class="h-16 flex items-end"><span class="block ${sz} ${c} border border-gray-300 bg-gray-50"></span></div><span class="text-xs font-medium text-gray-800">${v}</span><span class="text-[11px] leading-4 text-gray-500">${n}</span></div>`).join("")}</div>`)}
    ${specimen("Shadows", `<div class="flex items-start gap-5 bg-gray-50 rounded-xl p-5">${[["shadow-2xs", "Buttons, fields"], ["", "Boxes: a line, no shadow"], ["shadow-xl", "Menus, selection bar"], ["shadow-[0_24px_48px_-12px_rgba(17,24,39,0.25)]", "Dialogs"]].map(([c, n]) => `<div class="flex flex-col items-start gap-2 w-28"><span class="size-16 rounded-${c === "" ? "lg" : "xl"} bg-white border border-gray-200/80 ${c}"></span><span class="text-[11px] leading-4 text-gray-500">${n}</span></div>`).join("")}</div>`)}
    ${specimen("Focus", `<div class="flex items-center gap-4">${button("Tab to me", { v: "white", cls: "ring-3 ring-blue-600/20" })}<input class="${R.input} !w-56 !border-blue-500 ring-3 ring-blue-600/15" value="Focused field" aria-label="Focused field example" /></div><p class="${R.help} mt-3">A 3px soft blue ring, like shadcn's, in Preline blue.</p>`)}
  </div>`, "from shadcn")}
  ${pageSection("density", "Density", "People who work in lists all day dislike tall rows. These are the heights everything is built from.", `<div class="grid grid-cols-2 gap-x-12 gap-y-6">
    ${specimen("Row heights", `<div class="border-y border-gray-200/80 divide-y divide-gray-200/80">${[["Toolbar", "32px controls, 52px bar", "h-[52px]"], ["Grid header", "40px, 14px medium grey", "h-10"], ["Grid row", "36px", "h-9"], ["Grid totals", "32px, 12px grey", "h-8"], ["Settings row", "44px minimum, 8px padding", "min-h-11"], ["Sidebar row", "32px", "h-8"]].map(([a, b, h]) => `<div class="flex items-center justify-between ${h} text-sm"><span class="font-medium text-gray-800">${a}</span><span class="text-gray-500">${b}</span></div>`).join("")}</div>`)}
    ${specimen("Spacing", `<div class="space-y-2">${[[4, "Icon to text"], [8, "Between controls"], [12, "Cell padding"], [16, "Inside a box"], [24, "Between sections"], [32, "Page gutter"]].map(([p, n]) => `<div class="flex items-center gap-3"><span class="h-3 rounded-sm bg-blue-200" style="width:${p * 3}px"></span><span class="text-xs font-medium text-gray-800 w-10 tabular-nums">${p}px</span><span class="text-xs text-gray-500">${n}</span></div>`).join("")}</div>`)}
  </div>`)}
  ${pageSection("motion", "Motion", "One set of small, quick movements used everywhere. They confirm what you did without making you wait, and they turn off for anyone who asks their computer to reduce motion. Try each one.", motionCatalogue())}`;
}

/* ------------------------------------------------------------ motion catalogue */
const MOTIONS = [
  ["press", "Press", "Buttons dip 2% while held", "100ms · ease-out", "No dip", () => `<div class="flex gap-2">${button("Save", { v: "solid" })}${button("Export", { v: "white", icon: "download" })}${iconButton("ellipsis", "More", { v: "white" })}</div>`],
  ["hover", "Hover", "Rows and menu items fade their fill in", "100–120ms · ease", "Kept (colour only)", () => `<div class="w-56 -mx-1">${["Rename", "Duplicate", "Pause vendor"].map((l, i) => `<button type="button" class="${R.menuItem}">${I(["pencil", "copy", "pause"][i])}${l}</button>`).join("")}</div>`],
  ["menu", "Menus open", "Fade in and drop 3px from the button", "160ms · ease-out", "Appear instantly", () => `<div class="relative" data-demo-menu>${button("Status", { v: "white", s: "sm", iconEnd: "chevron-down", attrs: 'data-demo="menu" aria-expanded="false" aria-haspopup="menu"' })}<div data-slot></div></div>`],
  ["tabs", "Tabs", "The blue line slides to the new tab", "200ms · ease-out", "Line jumps", () => `<div data-demo-tabs>${tabsBar([["Drafts", 3], ["Sent", 4], ["Done", 3]], 1)}</div>`],
  ["seg", "Switch views", "The white thumb slides across", "200ms · ease-out", "Thumb jumps", () => segmented(["Day", "Week", "Month"], 0)],
  ["switch", "Switch and save glow", "The knob slides, then the row glows blue once to say it saved", "150ms slide · 1.2s glow", "Glow kept, no slide", () => `<div class="${R.box} divide-y divide-gray-200/80 w-full"><div class="flex items-center justify-between gap-4 px-3 min-h-11" data-row><span class="text-sm">Remind me when an order is late</span>${sw(true, "Remind me")}</div></div>`],
  ["check", "Tick", "The box pops a little as it fills", "180ms · ease-out", "Fills without the pop", () => `<div class="flex flex-col gap-2">${["Printing", "Signage", "Furniture"].map((l, i) => `<label class="inline-flex items-center gap-2 text-sm">${checkbox(i === 0)}${l}</label>`).join("")}</div>`],
  ["chip", "Filter chips", "A new chip grows in; the others stay still", "160ms · ease-out", "Appears instantly", () => `<div class="flex flex-wrap items-center gap-2" data-chips>${condChip("Status", "is", "Denied", 'data-demo="chipx"', "Remove")}${button("Add filter", { v: "quiet", s: "xs", icon: "plus", attrs: 'data-demo="chip"' })}</div>`],
  ["row", "New row", "Fades in from 4px above, then glows once", "220ms + 1.2s glow", "Glow only", () => `<div class="${R.tableBox} w-full"><table class="text-sm"><tbody data-rows>${["Bayview Print Co.", "Clearline Office Supply"].map((n) => `<tr><td class="${R.tCell}">${n}</td></tr>`).join("")}</tbody></table></div><div class="mt-2">${button("Add a vendor", { v: "white", s: "xs", icon: "plus", attrs: 'data-demo="row"' })}</div>`],
  ["save", "Edit in place", "Press Enter: the value settles with a glow and a quiet “Saved”", "1.2s glow", "Glow kept", () => `<div class="flex items-center gap-2 w-full"><input class="${R.inputSm} !w-32" value="7 days" data-demo="save" aria-label="Turnaround" /><span class="text-[13px] text-blue-600 opacity-0 transition-opacity duration-150" data-saved>${I("check", "size-3.5 inline")} Saved</span></div>`],
  ["toast", "Toast with Undo", "Slides up from the bottom and leaves after 4 seconds", "200ms in · 150ms out", "Appears and leaves instantly", () => button("Delete 2 vendors", { v: "danger", s: "sm", icon: "trash-2", attrs: 'data-demo="toast"' })],
  ["sheet", "Side panel", "Slides in from the right edge", "220ms · ease-out", "Appears instantly", () => button("Open a vendor", { v: "white", s: "sm", iconEnd: "panel-right-open", attrs: 'data-demo="sheet" data-opens-sheet' })],
  ["load", "Loading to content", "A soft light sweeps across the grey bars, then the content fades in where they were", "sweep 1.8s · fade 150ms", "Still bars", () => `<div class="w-full space-y-2" data-load>${skel("w-3/4")}${skel("w-1/2")}</div><div class="mt-2">${button("Load again", { v: "white", s: "xs", icon: "rotate-cw", attrs: 'data-demo="load"' })}</div>`],
  ["alert", "Row alert", "Hover or focus the words to see the whole sentence", "150ms · fade", "Appears instantly", () => `<div class="${R.box} w-full flex items-center justify-between gap-3 px-3 min-h-11"><span class="text-sm">Friday · 7 AM–2 PM</span>${alertMark("2 meetings after close", "Room 2 still has 2 meetings after 2:00 PM on Friday, Oct 2. They stay booked; new bookings stop at 2:00 PM.", { action: button("Show meetings", { v: "white", s: "xs" }) })}</div>`],
  ["ai", "Asha is thinking", "The step being worked on shimmers blue, with dots and a live ring", "shimmer 2.2s loop", "Plain text, no loop", () => `<div class="w-full rounded-lg asha-wash px-3 py-2 flex items-center gap-2.5"><span class="relative flex size-5 items-center justify-center"><span class="asha-ping absolute size-3.5 rounded-full bg-blue-400/35"></span><span class="relative size-2 rounded-full bg-blue-500"></span></span><span class="asha-shimmer text-sm font-medium">Reading 3 invoices from Bayview Print Co.</span><span class="inline-flex gap-1 items-end"><span class="asha-dot"></span><span class="asha-dot"></span><span class="asha-dot"></span></span></div>`]
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
    if (k === "chip") { const box = card("chip").querySelector("[data-chips]"); d.insertAdjacentHTML("beforebegin", condChip("Vendor", "is", ["Bayview Print Co.", "Harbor Catering", "Northstar Freight"][box.children.length % 3], 'data-demo="chipx"', "Remove", "asha-chip-in")); icons(); }
    if (k === "chipx") d.closest("[role=group]").remove();
    if (k === "row") { const tb = card("row").querySelector("[data-rows]"); tb.insertAdjacentHTML("afterbegin", `<tr class="asha-row-in"><td class="${R.tCell}">New vendor ${tb.children.length - 1}</td></tr>`); }
    if (k === "toast") toast("Deleted 2 vendors", { icon: "trash-2", action: "Undo", onAction: () => toast("Put back 2 vendors") });
    if (k === "sheet") openVendorSheet(VENDOR_ROWS[0]);
    if (k === "load") { const box = card("load").querySelector("[data-load]"); box.innerHTML = `${skel("w-3/4")}${skel("w-1/2")}`; setTimeout(() => { box.innerHTML = `<p class="text-sm text-gray-800 asha-reveal">Bayview Print Co. · 7 days</p><p class="${R.help} asha-reveal">4 orders open</p>`; }, 900); }
  });
  root.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.dataset.demo === "save") { Motion.settle(e.target); const s2 = card("save").querySelector("[data-saved]"); s2.style.opacity = 1; setTimeout(() => (s2.style.opacity = 0), 1600); } });
}
const setMotion = (reduced) => { if (reduced) document.documentElement.dataset.motion = "reduced"; else delete document.documentElement.dataset.motion; try { localStorage.setItem("asha-blend-motion", reduced ? "reduced" : "on"); } catch (_) {} };
try { if (localStorage.getItem("asha-blend-motion") === "reduced") document.documentElement.dataset.motion = "reduced"; } catch (_) {}

/* ------------------------------------------------------------ calendar demo: an ordinary work week */
const CAL_TODAY = "2026-09-25";
const CAL_EVENTS = [
  ...["2026-09-21", "2026-09-22", "2026-09-23", "2026-09-24", "2026-09-25"].map((date, i) => ({ id: `standup${i}`, date, start: "9:00", dur: 15, title: "Team standup", detail: "Video call", color: "blue", faded: date < CAL_TODAY })),
  { id: "plan", date: "2026-09-21", start: "10:00", end: "12:00", title: "Quarterly planning", detail: "Big room", color: "indigo", faded: true },
  { id: "lunch", date: "2026-09-21", start: "12:30", end: "13:30", title: "Lunch with Priya", detail: "Corner café", color: "teal", faded: true },
  { id: "review", date: "2026-09-22", start: "13:00", end: "14:00", title: "Design review", detail: "Room 2", color: "indigo", faded: true },
  { id: "kids", date: "2026-09-22", start: "16:00", end: "16:45", title: "Pick up the kids", color: "gray", faded: true },
  { id: "vendor", date: "2026-09-23", start: "10:00", end: "10:30", title: "Vendor call", detail: "Cancelled by them", color: "sky", cancelled: true },
  { id: "focus", date: "2026-09-23", start: "14:00", end: "16:00", title: "Focus time", color: "gray", faded: true },
  { id: "allhands", date: "2026-09-24", start: "11:00", end: "12:00", title: "All hands", detail: "Main hall and video", color: "blue", faded: true },
  { id: "onesam", date: "2026-09-25", start: "11:00", end: "11:30", title: "1:1 with Sam", detail: "Sam's desk", color: "sky" },
  { id: "interview", date: "2026-09-25", start: "11:00", end: "12:00", title: "Interview: product designer", detail: "Room 3", color: "blue" },
  { id: "wrap", date: "2026-09-25", start: "16:00", end: "16:30", title: "Weekly wrap-up", detail: "Video call", color: "teal" },
  { id: "gym", date: "2026-09-26", start: "8:00", end: "9:00", title: "Gym", color: "gray" }
];
const CAL_PEOPLE = [{ id: "alex", label: "Alex Chen", sub: "Design" }, { id: "sam", label: "Sam Ortiz", sub: "Engineering" }, { id: "priya", label: "Priya Raman", sub: "Product" }, { id: "jo", label: "Jo Becker", sub: "Support" }];
const CAL_PEOPLE_EVENTS = [
  { id: "p1", col: "alex", start: "9:00", dur: 15, title: "Team standup", color: "blue", faded: true }, { id: "p2", col: "sam", start: "9:00", dur: 15, title: "Team standup", color: "blue", faded: true },
  { id: "p3", col: "priya", start: "9:00", dur: 15, title: "Team standup", color: "blue", faded: true }, { id: "p4", col: "jo", start: "8:00", end: "10:00", title: "Morning queue", color: "gray", faded: true },
  { id: "p5", col: "alex", start: "11:00", end: "12:00", title: "Interview: product designer", detail: "Room 3", color: "blue" }, { id: "p6", col: "sam", start: "11:00", end: "11:30", title: "1:1 with Sam", color: "sky" },
  { id: "p7", col: "priya", start: "10:00", end: "11:30", title: "Roadmap draft", color: "indigo" }, { id: "p8", col: "priya", start: "11:00", end: "12:00", title: "Interview: product designer", detail: "Room 3", color: "blue" },
  { id: "p9", col: "jo", start: "12:00", end: "13:00", title: "Lunch", color: "teal" }, { id: "p10", col: "sam", start: "14:00", end: "16:00", title: "Focus time", color: "gray" },
  { id: "p11", col: "alex", start: "16:00", end: "16:30", title: "Weekly wrap-up", color: "teal" }, { id: "p12", col: "jo", start: "16:00", end: "16:30", title: "Weekly wrap-up", color: "teal" }
];
function openCalEvent(ev) {
  const s = calMin(ev.start), e = ev.end != null ? calMin(ev.end) : s + (ev.dur || 30), d = calDate(ev.date || CAL_TODAY);
  Sheet.open({ title: esc(ev.title), subtitle: `${CAL_DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()} · ${calRange(s, e)}`,
    body: `<div class="space-y-1">${kv("map-pin", "Where", ev.detail ? esc(ev.detail) : '<span class="text-gray-400">Add a place</span>')}${kv("clock", "Length", `${e - s} min`)}${kv("bell", "Reminder", "10 minutes before")}</div>`,
    footer: `${button("Delete", { v: "danger", s: "sm", icon: "trash-2" })}<span class="grow"></span>${button("Close", { v: "white", s: "sm", attrs: 'data-act="close-sheet"' })}` });
}
function mountCalendars(root) {
  const week = root.querySelector("#cal-week"), people = root.querySelector("#cal-people"); if (!week) return;
  new Calendar(week, { date: CAL_TODAY, now: "10:40", from: 7, to: 19, height: 560, events: CAL_EVENTS, onOpen: openCalEvent });
  new Calendar(people, { date: CAL_TODAY, now: "10:40", from: 7, to: 18, height: 480, columns: CAL_PEOPLE, events: CAL_PEOPLE_EVENTS, onOpen: openCalEvent });
}

/* ------------------------------------------------------------ components */
function componentsPage() {
  return `${pageHeader("Components", "The pieces", "Everything is built from these. Preline colours at shadcn sizes, with Attio's grid.")}
  ${pageSection("buttons", "Buttons", "Preline's styles, trimmed to 36px. One blue button per area. Everything else is white, soft or quiet.", `<div class="space-y-8">
    ${specimen("Styles", `<div class="flex flex-wrap items-center gap-3">${button("Save", { v: "solid" })}${button("Export", { v: "white", icon: "download" })}${button("Add filter", { v: "soft", icon: "plus" })}${button("Duplicate", { v: "ghost", icon: "copy" })}${button("Cancel", { v: "quiet" })}${button("Learn more", { v: "link" })}${button("Delete vendor", { v: "danger", icon: "trash-2" })}${button("Cancel order", { v: "dangerSolid" })}</div>`)}
    ${specimen("Sizes", `<div class="flex flex-wrap items-center gap-3">${button("Large", { v: "solid", s: "lg" })}${button("Default", { v: "solid" })}${button("Small", { v: "solid", s: "sm" })}${button("Tiny", { v: "solid", s: "xs" })}<span class="h-6 border-s border-gray-200/80 mx-1"></span>${iconButton("ellipsis", "More", { v: "white", s: "iconMd" })}${iconButton("printer", "Print", { v: "white", s: "iconSm" })}${iconButton("plus", "Add", { v: "quiet", s: "iconXs" })}</div>`)}
    ${specimen("With a shortcut, pending, and a split action", `<div class="flex flex-wrap items-center gap-3">${button(`Cancel <kbd class="${R.kbd} !border-transparent !bg-gray-100">Esc</kbd>`, { v: "white" })}${button(`Place order <kbd class="${R.kbd} !border-white/20 !bg-white/10 !text-white/80">↵</kbd>`, { v: "solid" })}${button(`${I("loader-circle", "animate-spin")}Sending…`, { v: "solid", attrs: "disabled" })}<div class="inline-flex">${button("Send", { v: "solid", cls: "rounded-e-none" })}${iconButton("chevron-down", "More send options", { v: "solid", cls: "rounded-s-none border-s border-s-white/20" })}</div></div>`)}
  </div>`, "Preline colours · shadcn sizes")}
  ${pageSection("fields", "Fields", "A grey line that turns blue when you type. Labels sit to the left in settings, above in dialogs.", `<div class="grid grid-cols-2 gap-x-12 gap-y-8">
    ${specimen("Text", `<div class="space-y-1.5"><label class="${R.label}" for="f1">Vendor name</label><input id="f1" class="${R.input}" placeholder="e.g. Bayview Print Co." /><p class="${R.help}">Shown on purchase orders.</p></div>`)}
    ${specimen("With a problem", `<div class="space-y-1.5"><label class="${R.label}" for="f2">Phone</label><input id="f2" class="${R.inputBad}" value="555-01" /><div class="asha-reveal">${note("That number looks too short.")}</div></div>`)}
    ${specimen("Money and dates", `<div class="grid grid-cols-2 gap-3"><div class="space-y-1.5"><span class="${R.label}">Amount</span><div class="relative"><span class="absolute inset-y-0 start-0 flex items-center ps-3 text-sm text-gray-400">$</span><input class="${R.input} !ps-7 text-end tabular-nums" value="184.00" aria-label="Amount" /></div></div><div class="space-y-1.5"><span class="${R.label}">Date</span><button type="button" class="${R.select}"><span class="inline-flex items-center gap-2">${I("calendar", "!text-gray-500")}Sep 25, 2026</span></button></div></div>`)}
    ${specimen("Search (toolbars)", `${searchBox("Search people", { w: "w-full" })}<p class="${R.help} mt-1.5">Filled grey, turns white when you click in. From Preline.</p>`)}
    ${specimen("Switches, boxes and dots", `<div class="flex flex-wrap items-center gap-x-6 gap-y-4"><label class="inline-flex items-center gap-x-2.5 text-sm">${sw(true, "On")}On</label><label class="inline-flex items-center gap-x-2.5 text-sm">${sw(false, "Off")}Off</label><label class="inline-flex items-center gap-x-2 text-sm">${checkbox(true)}Checked</label><label class="inline-flex items-center gap-x-2 text-sm">${checkbox(false)}Not checked</label><label class="inline-flex items-center gap-x-2 text-sm"><input type="radio" name="rr" class="${R.radio}" checked />Printing</label><label class="inline-flex items-center gap-x-2 text-sm"><input type="radio" name="rr" class="${R.radio}" />Signage</label></div>`)}
    ${specimen("Two ways to switch views", `<div class="flex flex-wrap items-center gap-6">${segmented(["Table", "Board", "Calendar"])}${tabsBar([["Drafts", 14], ["Sent", 38], ["Done", 9]], 0, "grow")}</div><p class="${R.help} mt-2">Grey segments switch how one list looks. Blue underline tabs switch between lists.</p>`)}
    ${specimen("Settings row", `<div class="border-y border-gray-200/80 divide-y divide-gray-200/80"><div class="flex items-center justify-between gap-6 py-2 min-h-11"><div><p class="${R.label} flex items-center gap-1.5">Remind me when an order is late ${I("info", "size-3.5 text-gray-400")}</p><p class="${R.help}">We add a task the day after it was due back.</p></div>${sw(true, "Remind me when an order is late")}</div><div class="flex items-center justify-between gap-6 py-2 min-h-11"><div><p class="${R.label}">Default lead time</p><p class="${R.help}">Used when a vendor has no lead time set.</p></div><button type="button" class="${R.select} !w-36">7 days${I("chevrons-up-down")}</button></div></div>`, "col-span-2")}
  </div>`, "Preline colours · shadcn sizes")}
  ${pageSection("tags", "Tags and status", "Pale tags say what kind of thing something is. Status is always a dot and a word.", `<div class="grid grid-cols-2 gap-x-12 gap-y-8">
    ${specimen("Tags", `<div class="flex flex-wrap gap-2">${tag("Printing", "tagBlue")}${tag("Furniture", "tagIndigo")}${tag("IT", "tagTeal")}${tag("Cleaning", "tagGray")}${tag("New vendor", "tagOutline")}</div>`)}
    ${specimen("Status", `<div class="flex flex-wrap gap-x-6 gap-y-2">${statusDot("Connected", "on")}${statusDot("Paused", "off")}${statusDot("Needs you", "needs")}${statusDot("Not started", "quiet")}</div>`)}
    ${specimen("Needs a person", `${flag("Harbor Catering has no phone number.")}<p class="${R.help} mt-1.5">A small orange icon and normal grey text. Never a yellow band.</p>`)}
    ${specimen("Counts, shortcuts, avatars", `<div class="flex flex-wrap items-center gap-4"><span class="${R.count}">12</span><span class="${R.countBlue}">3</span>${kbd("⌘K")}<span class="${R.tooltip}">Copy link <span class="text-white/60">⌘C</span></span><span class="flex -space-x-1.5">${["Maya Patel", "Ethan Brooks", "Sofia Ramirez"].map((n) => `<span class="ring-2 ring-white rounded-full">${avatar(n, { size: 7 })}</span>`).join("")}</span></div>`)}
  </div>`, "Preline colours")}
  ${pageSection("menus", "Menus and dialogs", "Short menus with an icon on the left and the shortcut on the right. Dialogs are small and sit near the top.", `<div class="flex flex-wrap items-start gap-12 bg-gray-50 px-6 py-8 rounded-xl">
    ${specimen("Menu", `<div class="${R.menu}" role="menu"><div class="relative mb-1"><span class="absolute inset-y-0 start-0 flex items-center ps-2 pointer-events-none">${I("search", "size-4 text-gray-400")}</span><input class="w-full h-8 ps-8 pe-2 text-[13px] bg-transparent outline-hidden placeholder:text-gray-400 border-b border-gray-200/80" placeholder="Search actions" aria-label="Search actions" /></div>
      <button class="${R.menuItem}">${I("pencil")}Rename<span class="ms-auto text-xs text-gray-400">R</span></button><button class="${R.menuItem}">${I("copy")}Duplicate<span class="ms-auto text-xs text-gray-400">⌘D</span></button><button class="${R.menuItem}">${I("link")}Copy link<span class="ms-auto text-xs text-gray-400">⌘C</span></button><button class="${R.menuItem}">${I("pause")}Pause vendor</button><div class="${R.menuSep}"></div><button class="${R.menuDanger}">${I("trash-2")}Delete vendor<span class="ms-auto text-xs text-red-400">⌫</span></button></div>`)}
    ${specimen("Dialog", `<div class="${R.dialog}" role="dialog" aria-label="Add a vendor"><div class="flex items-center justify-between h-13 px-5 border-b border-gray-200/80"><h3 class="text-base font-semibold text-gray-800">Add a vendor</h3>${iconButton("x", "Close", { s: "iconSm" })}</div>
      <div class="p-5 space-y-4"><div class="space-y-1.5"><label class="${R.label}" for="d1">Name</label><input id="d1" class="${R.input}" placeholder="e.g. Bayview Print Co." /></div><div class="grid grid-cols-2 gap-3"><div class="space-y-1.5"><label class="${R.label}" for="d2">Phone</label><input id="d2" class="${R.input}" placeholder="(555) 555-0100" /></div><div class="space-y-1.5"><span class="${R.label}">Lead time</span><button type="button" class="${R.select}">7 days${I("chevrons-up-down")}</button></div></div></div>
      <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200/80">${button(`Cancel <kbd class="${R.kbd} !border-transparent !bg-gray-100">Esc</kbd>`, { v: "white", s: "sm" })}${button(`Add vendor <kbd class="${R.kbd} !border-white/20 !bg-white/10 !text-white/80">↵</kbd>`, { v: "solid", s: "sm" })}</div></div>`)}
  </div>`, "Preline surfaces · Attio layout")}
  ${pageSection("feedback", "Notes and toasts", "Guidance sits next to the thing it's about. Toasts are only for things that happened somewhere else.", `<div class="grid grid-cols-2 gap-x-12 gap-y-8">
    ${specimen("Notes", `<div class="space-y-2">${note("Harbor Catering has no phone number. <a class=\"text-blue-600 hover:underline\" href=\"#\">Add one</a>")}${note("Changes here apply to all three locations.", "info")}${note("The mail server didn't answer. We'll try again in 5 minutes.", "error")}</div>`)}
    ${specimen("Toast", `<div class="flex flex-col gap-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 p-5">${alertCard({ title: "Order sent to Bayview Print Co.", action: "Undo" })}${alertCard({ lead: avatar("Nina Flores", { size: 8 }), title: "Nina Flores", time: "now", body: "Can you call Olivia back about her quote?" })}</div>` )}
    ${specimen("Save status on a row", `<div class="flex items-center gap-6 text-[13px]"><span class="inline-flex items-center gap-1.5 text-gray-500">${I("loader-circle", "size-3.5 animate-spin")}Saving…</span><span class="inline-flex items-center gap-1.5 text-blue-600">${I("check", "size-3.5")}Saved</span>${flag("Couldn't save. Phone must have 10 digits.", "!text-[13px]")}</div>`)}
    ${specimen("Loading", `<div class="space-y-2.5">${skel("w-2/3")}${skel("w-full")}${skel("w-5/6")}</div>`)}
  </div>`)}
  ${pageSection("grid", "Data grid", "Attio's grid in our colours. Search, sort by clicking a column name, filter, tick rows, click a cell and use the arrow keys, press Enter to edit, click a name to open it, or click the grey totals row.", `
    <div class="flex items-center gap-3 mb-2"><span class="${R.caption}">Show</span>${segmented(["A normal week", "First day, no vendors", "Busy office, long names"], 0, { sm: true, attrs: 'id="ds"' })}</div>
    <div id="grid-demo"></div>
    <div class="mt-12"><h3 class="${R.groupTitle}">One grid, four presentations</h3><p class="${R.help} mt-1 mb-5 max-w-2xl">The same component and the same four lines. Pick the presentation by where the table sits; override a setting only when you must.</p>
      <div class="grid grid-cols-2 gap-x-8 gap-y-10">${GRID_PRESET_SPECS.map(([k, t, d]) => specimen(`<span class="font-medium text-gray-800">${t}</span> · ${d}`, k === "page"
        ? `<div class="rounded-xl border border-gray-200/80 overflow-hidden bg-white"><div class="px-4" data-preset="page"></div></div>` : `<div data-preset="${k}"></div>`)).join("")}</div></div>`, "from Attio")}
  ${pageSection("calendar", "Calendar", "A time grid like Google Calendar's: hours down the side, a column per day, and events you can click. Today, the arrows and Day / Week move it; overlapping events sit side by side. The same grid can split one day into a column per person or room.", `<div class="space-y-10">
    ${specimen("Week", `<div class="${R.box} overflow-hidden" id="cal-week"></div>`)}
    ${specimen("One day, a column per person", `<div class="${R.box} overflow-hidden" id="cal-people"></div>`)}</div>`, "from Google Calendar")}`;
}

/* ------------------------------------------------------------ overview */
/* How Asha screens work: the rules every screen follows (from the owner's review of every screen) */
const PRINCIPLES = [
  ["Most important first", "Each surface shows what its most frequent job needs, as a data grid with the few columns that matter; the rest of a row's details open on hover in a card beside the panel, and the whole record on click, instead of every value strung along one line."],
  ["Record header", "Every panel and record page use one header: who or what it is and one line of facts on the left, the actions and close (or previous and next) on the same row."],
  ["One person header", "Every panel about a person shares one header: alerts as one icon with the count (orange when someone must act first) and any balance as a wallet with the amount, instead of a list of warnings."],
  ["Actions menu", "Every ⋯ menu on a record is the same Actions button: a searchable list grouped by what each action is about, one line each, a sparkle on what Asha suggests now, and greyed rows that say why they can't run yet."],
  ["Typing into tables", "A record's facts are a small table you type into, and lines people fix are cells on the data grid: click or just type, Enter saves and moves down, Tab moves on, lists search as you type. Saves are silent; a failed save leaves an orange mark with a retry."],
  ["Status", "A record's status is the first line of its facts table instead of a row of its own."],
  ["No patchy columns", "Every column shows a value on every row. A column that's mostly blank reads as broken, so a column only a few rows use is folded into another column or dropped."],
  ["Header facts", "Facts in a header are one label and one value each; anything more shows on the value's hover."],
  ["Compact tables in panels", "Every table in a panel or flyout is the compact data grid size (28px rows, 13px text), editable or not, so a panel never mixes table sizes."],
  ["Steppers", "Step bars never show an alert icon; a problem shows inside its own step."],
  ["Toasts", "Toasts are the light, frosted card in the top-right corner, and only for something you can undo or something still running out of view."],
  ["The first-day test", "Anything people set up has to pass one test: could someone new to the job and new to software do it alone? Every answer comes filled in with what most teams pick (marked Recommended), every question is asked the way you'd say it out loud, and rare settings sit behind More settings."]
];
function overviewPage() {
  return `${pageHeader("Asha design system", "One design, three sources", "Preline's blues and colours, shadcn's sizes and clean finish, and Attio's data grid. Everything here works, so click around.")}
  <div class="grid grid-cols-3 border-y border-gray-200/80 divide-x divide-gray-200/80 mb-12">
    ${[["palette", "Colour", "from Preline", ["Blue-600 buttons, one shade darker on hover", "Soft blue fills for chips and soft buttons", "Cool greys for text and lines", "Pale tags for kinds of things"]], ["ruler", "Size and finish", "from shadcn", ["36px buttons and fields, 32px in toolbars", "14px text almost everywhere", "8px corners, 12px on menus and dialogs", "Barely-there shadows, soft blue focus ring"]], ["table-2", "Data grid", "from Attio", ["A line between columns, no box", "Filters and sort as chips on one line", "A totals row you can change", "Click a cell, use the arrow keys"]]]
      .map(([ic, t, src, pts]) => `<div class="p-6 first:ps-0"><div class="flex items-center gap-x-2 mb-3"><span class="flex items-center justify-center size-8 rounded-lg bg-blue-100 text-blue-800">${I(ic, "size-4")}</span><div><p class="text-sm font-semibold text-gray-800 leading-tight">${t}</p><p class="text-xs text-gray-500">${src}</p></div></div><ul class="space-y-1.5">${pts.map((p) => `<li class="flex gap-x-2 text-sm text-gray-700">${I("check", "size-4 mt-0.5 shrink-0 text-blue-600")}${p}</li>`).join("")}</ul></div>`).join("")}
  </div>
  <h2 class="text-xl font-semibold tracking-tight text-gray-800 mb-1">How Asha screens work</h2>
  <p class="${R.help} mb-4 max-w-3xl">The rules every screen follows. The full reasoning is in <code class="text-gray-800">.claude/skills/asha-ui/references/ux-principles.md</code>.</p>
  <ol class="border-y border-gray-200/80 divide-y divide-gray-200/80 mb-12">${PRINCIPLES.map(([area, note]) => `<li class="grid grid-cols-[200px_1fr] gap-6 py-3 text-sm"><span class="font-medium text-gray-800">${esc(area)}</span><span class="text-gray-600">${esc(note)}</span></li>`).join("")}</ol>
  <div class="grid grid-cols-2 gap-5">${[["#/foundations/colour", "swatch-book", "Foundations", "Colour, text, size and shape, density and motion."], ["#/components/buttons", "component", "Components", "Buttons, fields, tags, menus and dialogs, notes and toasts, the data grid and the calendar."]]
    .map(([href, ic, t, d]) => `<a href="${href}" class="group flex items-start gap-3 ${R.box} p-4 hover:border-gray-300 transition-colors"><span class="flex items-center justify-center size-8 shrink-0 rounded-lg bg-gray-100 text-gray-600">${I(ic, "size-4")}</span><span><span class="block text-sm font-semibold text-gray-800 group-hover:text-blue-600">${t}</span><span class="block ${R.help}">${d}</span></span></a>`).join("")}</div>`;
}

/* ------------------------------------------------------------ shell + router */
function sidebar(route) {
  const [, page, part] = route;
  const link = (href, label, on, icon) => `<a href="${href}" class="${on ? R.navItemOn : R.navItem}" ${on ? 'aria-current="page"' : ""}>${icon ? I(icon) : ""}<span class="truncate">${label}</span></a>`;
  return `<div class="flex items-center gap-x-2 px-2 mb-4"><span class="flex items-center justify-center size-7 rounded-lg bg-blue-600 text-white">${I("layers", "size-4")}</span><div class="leading-tight"><p class="text-sm font-semibold text-gray-800">Asha design</p><p class="text-xs text-gray-500">Design system</p></div></div>
    ${link("#/", "Overview", !page, "house")}
    <p class="${R.navGroup}">Foundations</p>${FOUNDATIONS.map(([id, l]) => link(`#/foundations/${id}`, l, page === "foundations" && part === id)).join("")}
    <p class="${R.navGroup}">Components</p>${COMPONENTS.map(([id, l]) => link(`#/components/${id}`, l, page === "components" && part === id)).join("")}
    <div class="mt-4 mx-2 pt-3 border-t border-gray-200/80"><p class="${R.eyebrow} mb-1.5">Animations</p>${segmented(["On", "Reduced"], document.documentElement.dataset.motion === "reduced" ? 1 : 0, { sm: true, attrs: "data-motion-switch" })}</div>`;
}
function parseRoute() { const h = location.hash.replace(/^#\/?/, ""); const [page, part, sub] = h.split("/"); return [h, page || "", part || "", sub || ""]; }
function route() {
  const r = parseRoute(); const [, page, part] = r;
  document.getElementById("nav").innerHTML = sidebar(r);
  const main = document.getElementById("main");
  main.innerHTML = page === "foundations" ? foundationsPage() : page === "components" ? componentsPage() : overviewPage();
  icons();
  if (page === "components") { mountPresetSpecimens(main); mountCalendars(main); }
  if (page === "components") { const ds = document.getElementById("ds"); const g = vendorGrid(document.getElementById("grid-demo"), VENDOR_ROWS, { maxHeight: 440, box: true });
    ds.addEventListener("click", (e) => { const b = e.target.closest("[data-seg]"); if (!b) return; g.setRows([VENDOR_ROWS, [], VENDOR_BUSY][+b.dataset.seg]); g.q = ""; g.filters = {}; g.sort = g.baseline.sort && { ...g.baseline.sort }; g.render(); }); }
  if (page === "foundations") mountMotion(main);
  icons();
  const target = part ? document.getElementById(part) : null;
  if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
  document.title = "Asha design system";
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.insertAdjacentHTML("afterbegin", `<div class="grid grid-cols-[248px_1fr] min-h-screen"><aside id="nav" class="sticky top-0 h-screen overflow-y-auto border-e border-gray-200/80 bg-white px-3 py-5"></aside><main id="main" class="min-w-0 px-12 pb-24 pt-10 max-w-[1320px]"></main></div>`);
  window.addEventListener("hashchange", route); route();
  document.addEventListener("click", (e) => {
    const ms = e.target.closest("[data-motion-switch] [data-seg]"); if (ms) setMotion(ms.dataset.seg === "1");
    const play = e.target.closest("[data-play]");
    if (play) { const d = document.querySelector(`[data-demo="${play.dataset.play}"]`); const cls = `asha-${play.dataset.play}`; d.classList.remove(cls); void d.offsetWidth; d.classList.add(cls); }
    const c = e.target.closest("[data-copy]");
    const copy = (text, msg) => { try { navigator.clipboard.writeText(text).then(() => { const el = document.getElementById("copied"); if (el && msg) el.textContent = msg; }); } catch (_) {} };
    if (c) copy(c.dataset.copy);
  });
});

/* ------------------------------------------------------------ components: one grid, four presentations */
const GRID_PRESET_SPECS = [
  ["page", "Page", "the main list of a page: edge to edge, 36px rows, cell lines, toolbar and sorting"],
  ["section", "Section", "a table among other content on a page: a card, 13px text, row lines only"],
  ["panel", "Panel", "in a flyout, dialog or popover: a card, 28px rows, small headers and totals on grey, row lines only"],
  ["form", "Form", "a money sheet like an invoice: compact, with cell lines"]
];
function mountPresetSpecimens(root) {
  const lines = [["P-100", "Business cards, 500", 65, 52], ["P-210", "Letterhead, 1,000 sheets", 110, 88], ["S-040", "Window sign", 78, 62.4], ["S-115", "Trade show banner, 6 ft", 185, 118.4]]
    .map(([code, desc, fee, ins], i) => ({ id: i, code, desc, fee, ins, pt: Math.round((fee - ins) * 100) / 100 }));
  const cash = (k, w = 80) => ({ key: k, label: { fee: "Price", ins: "Discount", pt: "You pay" }[k], w, num: true, kind: "money", render: (r) => money(r[k]) });
  const columns = [{ key: "code", label: "Code", w: 72, kind: "text" }, { key: "desc", label: "Description", w: 150, kind: "text" }, cash("fee"), cash("ins"), cash("pt")];
  const sum = (k) => money(lines.reduce((a, r) => a + r[k], 0));
  root.querySelectorAll("[data-preset]").forEach((el) => {
    const preset = el.dataset.preset;
    new Grid(el, preset === "page"
      ? { preset, columns: [columns[0], columns[1], cash("fee", 104), cash("ins", 104), cash("pt", 104)], rows: lines, title: "Items", searchPlaceholder: "Search items", selectable: false, addColumn: false, maxHeight: 320, calc: { fee: "sum", ins: "sum", pt: "sum" } }
      : { preset, columns, rows: lines, title: "Items", sortable: false, foot: ["Total", "", sum("fee"), sum("ins"), sum("pt")] });
  });
}
