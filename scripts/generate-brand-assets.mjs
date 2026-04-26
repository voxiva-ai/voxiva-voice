import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const brandDir = join(process.cwd(), "src", "assets", "brand");
const tauriIconsDir = join(process.cwd(), "src-tauri", "icons");

mkdirSync(brandDir, { recursive: true });
mkdirSync(tauriIconsDir, { recursive: true });

const palette = {
  navy: "#0B1020",
  primaryBlue: "#5B8CFF",
  deepBlue: "#2D5BFF",
  gold: "#F0C14B",
  goldLight: "#FFE08A",
  white: "#FFFFFF",
  black: "#111827",
};

const blobs = {
  a: "M128 20C164 20 202 37 222 68C242 99 239 151 219 186C199 221 164 236 128 236C92 236 57 221 37 186C17 151 14 99 34 68C54 37 92 20 128 20Z",
  b: "M128 18C165 18 201 35 221 64C243 96 242 147 222 184C202 221 165 238 126 237C88 236 53 220 34 188C14 154 17 101 37 68C57 35 91 18 128 18Z",
  c: "M128 18C188 18 238 68 238 128C238 188 188 238 128 238C68 238 18 188 18 128C18 68 68 18 128 18Z",
};

const variants = {
  a: {
    title: "Voxiva mark variation A - primary",
    blob: blobs.a,
    ringWidth: 14,
    ringOpacity: 0.96,
    innerStroke: 5,
    wave: "M70 94C88 137 104 164 128 164C152 164 168 137 186 94",
    waveWidth: 22,
    highlightWidth: 6,
  },
  b: {
    title: "Voxiva mark variation B - softer organic blob",
    blob: blobs.b,
    ringWidth: 11,
    ringOpacity: 0.9,
    innerStroke: 4,
    wave: "M68 99C88 139 105 158 128 158C151 158 168 139 188 99",
    waveWidth: 20,
    highlightWidth: 5,
  },
  c: {
    title: "Voxiva mark variation C - geometric app icon",
    blob: blobs.c,
    ringWidth: 17,
    ringOpacity: 0.98,
    innerStroke: 6,
    wave: "M72 88C90 136 106 169 128 169C150 169 166 136 184 88",
    waveWidth: 24,
    highlightWidth: 6,
  },
};

function markInner(id, variant = variants.a, mode = "color") {
  const isWhite = mode === "white";
  const isBlack = mode === "black";
  const fill = isWhite || isBlack ? "none" : palette.navy;
  const ring = isWhite ? palette.white : isBlack ? palette.black : palette.primaryBlue;
  const inner = isWhite ? palette.white : isBlack ? palette.black : palette.deepBlue;
  const wave = isWhite ? palette.white : isBlack ? palette.black : palette.gold;
  const highlight = isWhite || isBlack ? "none" : palette.goldLight;

  return `
  <title>${variant.title}</title>
  <defs>
    <filter id="${id}-shadow" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#050816" flood-opacity="0.28"/>
    </filter>
    <linearGradient id="${id}-blue" x1="48" y1="26" x2="210" y2="228" gradientUnits="userSpaceOnUse">
      <stop stop-color="${palette.primaryBlue}"/>
      <stop offset="1" stop-color="${palette.deepBlue}"/>
    </linearGradient>
    <linearGradient id="${id}-gold" x1="76" y1="92" x2="180" y2="168" gradientUnits="userSpaceOnUse">
      <stop stop-color="${palette.goldLight}"/>
      <stop offset="1" stop-color="${palette.gold}"/>
    </linearGradient>
  </defs>
  <path d="${variant.blob}" fill="${fill}" stroke="${mode === "color" ? `url(#${id}-blue)` : ring}" stroke-width="${variant.ringWidth}" opacity="${variant.ringOpacity}" filter="${mode === "color" ? `url(#${id}-shadow)` : "none"}"/>
  <path d="${variant.blob}" fill="none" stroke="${inner}" stroke-width="${variant.innerStroke}" opacity="${mode === "color" ? "0.34" : "1"}"/>
  <path d="${variant.wave}" fill="none" stroke="${mode === "color" ? `url(#${id}-gold)` : wave}" stroke-width="${variant.waveWidth}" stroke-linecap="round" stroke-linejoin="round"/>
  ${highlight !== "none" ? `<path d="${variant.wave}" fill="none" stroke="${highlight}" stroke-width="${variant.highlightWidth}" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>` : ""}`;
}

function markSvg(id, variant = variants.a, mode = "color") {
  return `<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
${markInner(id, variant, mode)}
</svg>
`;
}

function markGroup(id, size = 72, x = 0, y = 0, variant = variants.a, mode = "color") {
  const scale = size / 256;
  return `<g transform="translate(${x} ${y}) scale(${scale})">${markInner(id, variant, mode)}</g>`;
}

function textStyle(color = palette.navy, weight = 760) {
  return `font-family="Nunito Sans, Avenir Next, Segoe UI, Inter, Arial, sans-serif" font-weight="${weight}" fill="${color}" letter-spacing="-1.8"`;
}

function wordmarkSvg(mode = "color") {
  const color = mode === "white" ? palette.white : mode === "black" ? palette.black : palette.navy;
  return `<svg width="420" height="104" viewBox="0 0 420 104" fill="none" xmlns="http://www.w3.org/2000/svg">
  <title>Voxiva wordmark</title>
  <text x="4" y="74" ${textStyle(color)} font-size="72">Voxiva</text>
  <circle cx="289" cy="28" r="5" fill="${mode === "color" ? palette.gold : color}"/>
</svg>
`;
}

function horizontalLockup(label = "Voxiva", width = 520, mode = "color") {
  const color = mode === "white" ? palette.white : mode === "black" ? palette.black : palette.navy;
  return `<svg width="${width}" height="128" viewBox="0 0 ${width} 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <title>${label} horizontal lockup</title>
  ${markGroup(`h-${label.replaceAll(" ", "-").toLowerCase()}-${mode}`, 82, 12, 23, variants.a, mode)}
  <text x="116" y="79" ${textStyle(color)} font-size="${label === "Voxiva" ? 64 : 58}">${label}</text>
  ${mode === "color" ? `<circle cx="${label === "Voxiva" ? 371 : 493}" cy="31" r="4.5" fill="${palette.gold}"/>` : ""}
</svg>
`;
}

function stackedLockup(label = "Voxiva", width = 420, mode = "color") {
  const color = mode === "white" ? palette.white : mode === "black" ? palette.black : palette.navy;
  return `<svg width="${width}" height="268" viewBox="0 0 ${width} 268" fill="none" xmlns="http://www.w3.org/2000/svg">
  <title>${label} stacked lockup</title>
  ${markGroup(`s-${label.replaceAll(" ", "-").toLowerCase()}-${mode}`, 116, (width - 116) / 2, 12, variants.a, mode)}
  <text x="${width / 2}" y="210" text-anchor="middle" ${textStyle(color)} font-size="${label === "Voxiva" ? 68 : 58}">${label}</text>
</svg>
`;
}

function appIconSvg() {
  return `<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <title>Voxiva app icon</title>
  <rect width="1024" height="1024" rx="224" fill="${palette.navy}"/>
  <circle cx="512" cy="512" r="372" fill="${palette.deepBlue}" opacity="0.18"/>
  <g transform="translate(112 112) scale(3.125)">
    ${markInner("app-icon", variants.a, "color")}
  </g>
</svg>
`;
}

function heroBannerSvg() {
  return `<svg width="1280" height="360" viewBox="0 0 1280 360" fill="none" xmlns="http://www.w3.org/2000/svg">
  <title>Voxiva Voice hero banner</title>
  <rect width="1280" height="360" rx="36" fill="${palette.navy}"/>
  <circle cx="1040" cy="42" r="230" fill="${palette.deepBlue}" opacity="0.20"/>
  <circle cx="112" cy="314" r="180" fill="${palette.primaryBlue}" opacity="0.10"/>
  <path d="M0 300C195 252 350 260 528 305C745 360 933 330 1280 230V360H0V300Z" fill="${palette.deepBlue}" opacity="0.18"/>
  ${markGroup("hero-mark", 132, 128, 96, variants.a, "color")}
  <text x="300" y="154" ${textStyle(palette.white)} font-size="74">Voxiva Voice</text>
  <text x="304" y="215" font-family="Nunito Sans, Avenir Next, Segoe UI, Inter, Arial, sans-serif" font-weight="560" fill="#C8D4FF" font-size="30" letter-spacing="-0.2">Stop typing. Just speak.</text>
  <rect x="302" y="244" width="146" height="7" rx="3.5" fill="${palette.gold}"/>
</svg>
`;
}

const files = {
  "voxiva-mark-a.svg": markSvg("mark-a", variants.a),
  "voxiva-mark-b.svg": markSvg("mark-b", variants.b),
  "voxiva-mark-c.svg": markSvg("mark-c", variants.c),
  "voxiva-mark.svg": markSvg("mark-primary", variants.a),
  "voxiva-wordmark.svg": wordmarkSvg("color"),
  "voxiva-lockup-horizontal.svg": horizontalLockup("Voxiva", 520, "color"),
  "voxiva-voice-lockup-horizontal.svg": horizontalLockup("Voxiva Voice", 640, "color"),
  "voxiva-lockup-stacked.svg": stackedLockup("Voxiva", 420, "color"),
  "voxiva-voice-lockup-stacked.svg": stackedLockup("Voxiva Voice", 520, "color"),
  "voxiva-mark-mono-white.svg": markSvg("mark-white", variants.a, "white"),
  "voxiva-mark-mono-black.svg": markSvg("mark-black", variants.a, "black"),
  "voxiva-lockup-mono-white.svg": horizontalLockup("Voxiva Voice", 640, "white"),
  "voxiva-lockup-mono-black.svg": horizontalLockup("Voxiva Voice", 640, "black"),
  "voxiva-app-icon.svg": appIconSvg(),
  "voxiva-hero-banner.svg": heroBannerSvg(),
};

for (const [file, content] of Object.entries(files)) {
  writeFileSync(join(brandDir, file), content, "utf8");
}

writeFileSync(join(tauriIconsDir, "app-icon.svg"), appIconSvg(), "utf8");

console.log(`Generated ${Object.keys(files).length} brand SVG assets.`);
