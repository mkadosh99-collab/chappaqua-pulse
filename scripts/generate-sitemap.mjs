import { writeFileSync } from "fs";

// ---- Palette (Chappaqua Pulse: deep navy + red accent) ----
const NAVY = "#14264f";
const NAVY_DARK = "#0d1a38";
const NAVY_MID = "#243a6e";
const RED = "#c0202f";
const RED_DARK = "#9c1824";
const CARD = "#ffffff";
const TINT = "#eef2fa";
const TINT2 = "#f6f8fc";
const BORDER = "#cdd6e8";
const MUTED = "#5a6684";
const INK = "#1c2540";
const LINE = "#9fb0d0";

const FONT = "Inter, 'DejaVu Sans', Arial, sans-serif";
const MONO = "'DejaVu Sans Mono', 'Fira Code', monospace";

const W = 1720;
const H = 1240;

const parts = [];
const push = (s) => parts.push(s);

function esc(t) {
  return String(t)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function rrect(x, y, w, h, r, fill, stroke, sw = 1.5, extra = "") {
  push(
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${fill}"${
      stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ""
    }${extra ? " " + extra : ""}/>`
  );
}

function text(x, y, str, opts = {}) {
  const {
    size = 15,
    fill = INK,
    weight = 400,
    anchor = "start",
    font = FONT,
    spacing = "0",
    upper = false,
  } = opts;
  const content = upper ? String(str).toUpperCase() : str;
  push(
    `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${spacing}">${esc(
      content
    )}</text>`
  );
}

// Orthogonal connector helper (polyline of points)
function connect(points, color = LINE, sw = 2) {
  const d = points.map((p) => p.join(",")).join(" ");
  push(`<polyline points="${d}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>`);
}

// ---------------- Background ----------------
push(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${FONT}">`
);
push(`<defs>
  <linearGradient id="hdr" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${NAVY}"/>
    <stop offset="1" stop-color="${NAVY_DARK}"/>
  </linearGradient>
  <linearGradient id="root" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${NAVY_MID}"/>
    <stop offset="1" stop-color="${NAVY}"/>
  </linearGradient>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#1c2540" flood-opacity="0.16"/>
  </filter>
</defs>`);

rrect(0, 0, W, H, 0, "#f0f3f9");

// ---------------- Header band ----------------
const HEAD_H = 118;
rrect(0, 0, W, HEAD_H, 0, "url(#hdr)");
rrect(0, HEAD_H, W, 5, 0, RED);
text(48, 52, "Chappaqua Pulse", { size: 34, fill: "#ffffff", weight: 700 });
text(50, 86, "Site Map — pages, sections & navigation paths", {
  size: 17,
  fill: "#c7d2ea",
  weight: 400,
});
text(W - 48, 52, "chappaquapulse", {
  size: 18,
  fill: "#c7d2ea",
  weight: 600,
  anchor: "end",
});
text(W - 48, 82, "Weekly community discovery · Chappaqua, NY", {
  size: 14,
  fill: "#9fb0d0",
  weight: 400,
  anchor: "end",
});

// ---------------- Legend ----------------
const legend = [
  ["Page / route", NAVY],
  ["Tab / view", "#ffffff"],
  ["Section", TINT],
  ["External link", RED],
];
let lx = 48;
const ly = HEAD_H + 34;
legend.forEach(([label, color]) => {
  rrect(lx, ly - 12, 16, 16, 4, color, color === "#ffffff" ? BORDER : color, 1.5);
  text(lx + 24, ly + 1, label, { size: 13, fill: "#3a4664", weight: 500 });
  lx += 24 + label.length * 7.6 + 34;
});

// ---------------- Root node ----------------
const rootCx = W / 2;
const rootY = HEAD_H + 60;
const rootW = 300;
const rootH = 58;
rrect(rootCx - rootW / 2, rootY, rootW, rootH, 12, "url(#root)", NAVY_DARK, 1.5, 'filter="url(#soft)"');
text(rootCx, rootY + 27, "Chappaqua Pulse", { size: 20, fill: "#fff", weight: 700, anchor: "middle" });
text(rootCx, rootY + 46, "React SPA · Wouter routing", { size: 12.5, fill: "#b9c6e2", anchor: "middle" });

// ---------------- Level 1: pages ----------------
const pageY = rootY + rootH + 66;
const pageH = 56;
function pageBox(cx, w, title, sub, color = NAVY) {
  rrect(cx - w / 2, pageY, w, pageH, 10, color, NAVY_DARK, 1.5, 'filter="url(#soft)"');
  text(cx, pageY + 25, title, { size: 17.5, fill: "#fff", weight: 700, anchor: "middle" });
  if (sub) text(cx, pageY + 44, sub, { size: 12.5, fill: "#c2cee8", anchor: "middle" });
}

const homeCx = 421;
const adminCx = 975;
const nfCx = 1265;
const extCx = 1555;

// Root -> pages bus
const busY = rootY + rootH + 32;
connect([[rootCx, rootY + rootH], [rootCx, busY]], LINE, 2.5);
connect([[homeCx, busY], [extCx, busY]], LINE, 2.5);
[homeCx, adminCx, nfCx, extCx].forEach((cx) => {
  connect([[cx, busY], [cx, pageY]], LINE, 2.5);
});

pageBox(homeCx, 220, "Home", "/", NAVY);
pageBox(adminCx, 230, "Admin", "/admin", NAVY);
pageBox(nfCx, 230, "Not Found", "404 fallback", NAVY);
pageBox(extCx, 230, "External Links", "off-site & utility", RED);

// ---------------- Home sub-branches (4 columns) ----------------
const colCenters = [130, 324, 518, 712];
const subY = pageY + pageH + 60;
const subH = 46;
const subW = 176;

// Home page -> distributor bus -> each column header
const subBusY = pageY + pageH + 30;
connect([[homeCx, pageY + pageH], [homeCx, subBusY]], LINE, 2.5);
connect([[colCenters[0], subBusY], [colCenters[3], subBusY]], LINE, 2.5);
colCenters.forEach((cx) => connect([[cx, subBusY], [cx, subY]], LINE, 2.5));

const subHeaders = ["Global", "Events", "Dining & Specials", "Retailers"];
const subSubs = ["persistent shell", "tab", "tab", "tab"];
colCenters.forEach((cx, i) => {
  rrect(cx - subW / 2, subY, subW, subH, 8, CARD, NAVY, 2, 'filter="url(#soft)"');
  rrect(cx - subW / 2, subY, 6, subH, 8, i === 0 ? NAVY_MID : RED);
  text(cx, subY + 21, subHeaders[i], { size: 14.5, fill: NAVY, weight: 700, anchor: "middle" });
  text(cx, subY + 38, subSubs[i], { size: 11, fill: MUTED, anchor: "middle", upper: true, spacing: "0.5" });
});

// ---------------- Leaf cards under columns (indented tree) ----------------
function leafStack(cx, startY, items) {
  const cardW = 178;
  const spineX = cx - cardW / 2 - 16;
  const cardX = cx - cardW / 2;
  let y = startY;
  const centers = [];
  items.forEach((it) => {
    const h = it.sub ? 60 : 42;
    rrect(cardX, y, cardW, h, 7, it.tint || TINT, BORDER, 1.25);
    rrect(cardX, y, 5, h, 7, it.accent || NAVY_MID);
    text(cardX + 15, y + (it.sub ? 24 : 26), it.title, { size: 13, fill: INK, weight: 650 });
    if (it.sub) text(cardX + 15, y + 43, it.sub, { size: 10.3, fill: MUTED });
    centers.push([y + h / 2, h]);
    y += h + 14;
  });
  // spine + stubs
  const firstCenter = centers[0][0];
  const lastCenter = centers[centers.length - 1][0];
  connect([[cx, startY - 14], [cx, startY - 6]], LINE, 2); // small tail from header
  connect([[spineX, startY - 6], [spineX, lastCenter]], LINE, 2);
  connect([[cx, startY - 6], [spineX, startY - 6]], LINE, 2);
  centers.forEach(([cyc]) => connect([[spineX, cyc], [cardX, cyc]], LINE, 2));
  return y;
}

const leafStartY = subY + subH + 24;

leafStack(colCenters[0], leafStartY, [
  { title: "Header", sub: "nav · search · social · CTA" },
  { title: "Hero", sub: "title + quick-action tiles" },
  { title: "Footer", sub: "last-updated timestamp" },
]);

leafStack(colCenters[1], leafStartY, [
  { title: "Week / Month view", sub: "week & month toggle", accent: RED },
  { title: "Category filter", sub: "6 event categories", accent: RED },
  { title: "Event grid", sub: "event cards", accent: RED },
]);

leafStack(colCenters[2], leafStartY, [
  { title: "Specials filter", sub: "weekly · happy hr · brunch", accent: RED },
  { title: "Specials grid", sub: "current specials", accent: RED },
  { title: "Restaurant grid", sub: "8 local restaurants", accent: RED },
]);

leafStack(colCenters[3], leafStartY, [
  { title: "Retailers section", sub: "109 businesses by type", accent: RED },
]);

// ---------------- Admin children ----------------
leafStack(adminCx, subY, [
  { title: "Login", sub: "password gate", accent: NAVY_MID, tint: TINT2 },
  { title: "Dashboard", sub: "business submission cards", accent: NAVY_MID, tint: TINT2 },
  { title: "Approve / reject actions", sub: "moderate submissions", accent: RED, tint: TINT2 },
]);

// ---------------- Not Found children ----------------
leafStack(nfCx, subY, [
  { title: "404 Page", sub: "shown for unknown routes", accent: NAVY_MID, tint: TINT2 },
]);

// ---------------- External children ----------------
leafStack(extCx, subY, [
  { title: "Living Map", sub: "/living-map.html", accent: RED, tint: "#fbeced" },
  { title: "Submit an Event", sub: "mailto link", accent: RED, tint: "#fbeced" },
  { title: "Instagram", sub: "Chamber social", accent: RED, tint: "#fbeced" },
  { title: "Facebook", sub: "community social", accent: RED, tint: "#fbeced" },
]);

// ---------------- API footnote band ----------------
const apiY = H - 132;
rrect(40, apiY, W - 80, 96, 12, NAVY, NAVY_DARK, 1.5, 'filter="url(#soft)"');
text(64, apiY + 34, "API endpoints (Express backend)", { size: 15, fill: "#fff", weight: 700 });
text(64, apiY + 55, "In-memory storage · scraped events · restaurant data · business directory", {
  size: 12.5,
  fill: "#aebbd8",
});

const apis = [
  "GET /api/events",
  "GET /api/restaurants",
  "GET /api/specials",
  "GET /api/businesses",
  "POST /api/business-submissions",
  "POST /api/admin/login",
  "GET /api/admin/submissions",
  "PATCH /api/admin/submissions/:id",
];
let ax = 64;
let ayRow = apiY + 78;
const colWidth = (W - 80 - 48) / 4;
apis.forEach((a, i) => {
  const col = i % 4;
  const row = Math.floor(i / 4);
  const x = 64 + col * colWidth;
  const y = apiY + 78 + row * 0; // handled below
});
// two rows of 4
for (let i = 0; i < apis.length; i++) {
  const col = i % 4;
  const row = Math.floor(i / 4);
  const x = 64 + col * colWidth;
  const y = apiY + 76 + row * 20;
  push(
    `<circle cx="${x + 4}" cy="${y - 4}" r="3" fill="${RED}"/>`
  );
  text(x + 14, y, apis[i], { size: 12.5, fill: "#dfe6f4", font: MONO });
}

// footer note
text(W - 64, H - 16, "Generated diagram · not part of the running app", {
  size: 11.5,
  fill: "#8a97b5",
  anchor: "end",
});

push(`</svg>`);

const svg = parts.join("\n");
writeFileSync("attached_assets/sitemap/chappaqua-pulse-sitemap.svg", svg);
console.log("SVG written", svg.length, "bytes");
