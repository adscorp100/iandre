// Builds the avatar crops, favicons and the OG image into public/.
// Runs before every build (npm "prebuild"). Text is converted to paths with
// opentype.js because sharp's SVG renderer cannot load web fonts.
import sharp from 'sharp';
import opentype from 'opentype.js';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { profile } from '../src/data.ts';

const require = createRequire(import.meta.url);
const fontFile = (w) => require.resolve(`@fontsource/inter/files/inter-latin-${w}-normal.woff`);
const toAB = (b) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
const inter400 = opentype.parse(toAB(readFileSync(fontFile(400))));
const inter600 = opentype.parse(toAB(readFileSync(fontFile(600))));

const pub = (p) => new URL(`../public/${p}`, import.meta.url).pathname;

// Lay out a single line as an SVG path, with tracking in em.
function textPath(font, text, x, y, size, tracking = 0) {
  const glyphs = [...text].map((c) => font.charToGlyph(c));
  const scale = size / font.unitsPerEm;
  let cx = x;
  let d = '';
  glyphs.forEach((g, i) => {
    d += g.getPath(cx, y, size).toPathData(2);
    cx += g.advanceWidth * scale + tracking * size;
    if (glyphs[i + 1]) cx += font.getKerningValue(g, glyphs[i + 1]) * scale;
  });
  return { d, width: cx - x };
}
const measure = (font, text, size, tracking = 0) => textPath(font, text, 0, 0, size, tracking).width;

// Source is a group photo kept OUT of public/ so it is never served.
// Every exported crop must leave out the two people beside Andre.
const SOURCE = new URL('../assets/andre-source.webp', import.meta.url).pathname;

// 1. Avatar crops. Shifted right and up so the full head shows; an exit sign
// still sits at the top-left edge (ask Andre for a purpose-shot headshot).
const crop = { left: 150, top: 0, width: 340, height: 340 };
// Person image for JSON-LD: wider head-and-shoulders, nobody else in frame.
const fullCrop = { left: 160, top: 0, width: 375, height: 375 };
// OG avatar: the avatar crop shifted right to drop the wall strip and sign.
const ogCrop = { left: 170, top: 10, width: 330, height: 330 };
// Original photo, uncropped. Andre approved it as is.
const photo = await sharp(SOURCE).png().toBuffer();
for (const s of [72, 144, 216]) {
  await sharp(photo).resize(s, s).webp({ quality: 85 }).toFile(pub(`andre-${s}.webp`));
}
await sharp(photo).resize(600, 600).webp({ quality: 88 }).toFile(pub(profile.photo.slice(1)));

// 2. Favicon: a dark circle with an Inter SemiBold "A" as a path.
function faviconSvg(fg, bg, withScheme) {
  const size = 40;
  const w = measure(inter600, 'A', size);
  const a = textPath(inter600, 'A', 32 - w / 2, 32 + size * 0.36, size);
  const style = withScheme
    ? `<style>circle{fill:${bg}}path{fill:${fg}}@media (prefers-color-scheme:dark){circle{fill:${fg}}path{fill:${bg}}}</style>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${style}<circle cx="32" cy="32" r="32" fill="${bg}"/><path fill="${fg}" d="${a.d}"/></svg>`;
}
writeFileSync(
  pub('favicon.svg'),
  faviconSvg('#ffffff', '#111111', false).replace(
    '<circle',
    '<style>@media (prefers-color-scheme:dark){circle{fill:#ededed}path{fill:#111111}}</style><circle',
  ),
);

// favicon.ico: a single 32px PNG wrapped in an ICO container.
const png32 = await sharp(Buffer.from(faviconSvg('#ffffff', '#111111', false))).resize(32, 32).png().toBuffer();
const ico = Buffer.alloc(22);
ico.writeUInt16LE(0, 0); ico.writeUInt16LE(1, 2); ico.writeUInt16LE(1, 4);
ico.writeUInt8(32, 6); ico.writeUInt8(32, 7); ico.writeUInt8(0, 8); ico.writeUInt8(0, 9);
ico.writeUInt16LE(1, 10); ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(png32.length, 14); ico.writeUInt32LE(22, 18);
writeFileSync(pub('favicon.ico'), Buffer.concat([ico, png32]));

// apple-touch-icon: solid square, no transparency.
const appleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#111111"/>${faviconSvg('#ffffff', '#111111', false).replace(/^<svg[^>]*>|<\/svg>$/g, '').replace(/<circle[^>]*\/>/, '')}</svg>`;
await sharp(Buffer.from(appleSvg)).resize(180, 180).flatten({ background: '#111111' }).png().toFile(pub('apple-touch-icon.png'));

// 3. OG image, 1200x630: text on the left, the Sydney artwork on the right, like the page.
const W = 1200, H = 630, M = 72, ART = 470, AV = 88;
const textMax = W - ART - M * 2;
const nameSize = 60, ledeSize = 30, ledeLine = 42;
const nameY = 300;
const name = textPath(inter600, profile.name, M, nameY, nameSize, -0.022);
const lines = [];
let cur = '';
for (const w of profile.lede.split(' ')) {
  const next = cur ? `${cur} ${w}` : w;
  if (cur && measure(inter400, next, ledeSize, -0.011) > textMax) { lines.push(cur); cur = w; } else cur = next;
}
if (cur) lines.push(cur);
const lede = lines.map((l, i) => textPath(inter400, l, M, nameY + 56 + i * ledeLine, ledeSize, -0.011).d).join('');
const domain = textPath(inter400, 'iandre.com', M, H - 64, 24);
const avatarPng = await sharp(photo).resize(AV * 2, AV * 2).png().toBuffer();
const ax = M, ay = 110;
const ART_SRC = new URL('../public/sydney.webp', import.meta.url).pathname;
const artPng = await sharp(ART_SRC).resize(ART * 2, H * 2, { fit: 'cover', position: 'centre' }).png().toBuffer();
const og = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#fbfaf8"/>
  <image x="${W - ART}" y="0" width="${ART}" height="${H}" preserveAspectRatio="xMidYMid slice" xlink:href="data:image/png;base64,${artPng.toString('base64')}"/>
  <path fill="#1a1a1a" d="${name.d}"/>
  <path fill="#5b5b5b" d="${lede}"/>
  <path fill="#8a8a8a" d="${domain.d}"/>
  <clipPath id="c"><circle cx="${ax + AV / 2}" cy="${ay + AV / 2}" r="${AV / 2}"/></clipPath>
  <image x="${ax}" y="${ay}" width="${AV}" height="${AV}" clip-path="url(#c)" xlink:href="data:image/png;base64,${avatarPng.toString('base64')}"/>
  <circle cx="${ax + AV / 2}" cy="${ay + AV / 2}" r="${AV / 2 - 0.5}" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="1"/>
</svg>`;
await sharp(Buffer.from(og)).png().toFile(pub('og.png'));
// 4. One-URL sitemap, lastmod is the build date.
writeFileSync(
  pub('sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${profile.url}/</loc><lastmod>${new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' })}</lastmod></url>\n</urlset>\n`,
);
console.log('assets ok');
