// Post-build gate over ./dist. Fails the build (exit 1) on:
//  - '[PRICE]' left in the output when PRODUCTION=1
//  - more than 3 wine-accent usages on the built page (design rule: max 3 per screen; the page is one screen-flow, so we count the page)
//  - a primary button that is not ink, or that uses the accent
//  - red (danger tokens / red-ish hex) used anywhere outside the token definitions: errors use amber
//  - the placeholder TODO comment or the old placeholder tokens
// How accent usages are counted (each is one "usage"):
//   a) every HTML element whose class list contains `accent`
//   b) the focus ring: all CSS rules with :focus in the selector that use accent, counted ONCE (only one element has focus at a time)
//   c) any other CSS rule that references an accent token or an accent hex (counted 1 per rule; there should be none)
//   JS must not add accent: no accent class names or hex in built scripts.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const errors = [];
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = walk(dist);
const html = files.filter((f) => extname(f) === '.html');
const css = files.filter((f) => extname(f) === '.css');
const js = files.filter((f) => extname(f) === '.js');
if (!html.length) { console.error('check-build: no HTML in dist'); process.exit(1); }

// ---- [PRICE] ----
if (process.env.PRODUCTION === '1') {
  for (const f of files.filter((f) => /\.(html|js|css|txt|xml|json)$/.test(f))) {
    if (readFileSync(f, 'utf8').includes('[PRICE]')) errors.push(`PRODUCTION=1 and "[PRICE]" still present in ${f.replace(dist, 'dist/')}`);
  }
}
if (process.env.PRODUCTION === '1' && html.some((f) => /href="#book"/.test(readFileSync(f, 'utf8')))) {
  console.warn('check-build: WARNING PRODUCTION=1 but the booking link is still the "#book" placeholder (set BOOKING_URL).');
}

// ---- gather CSS (linked files + inline <style>) ----
const page = readFileSync(join(dist, 'index.html'), 'utf8');
let allCss = css.map((f) => readFileSync(f, 'utf8')).join('\n');
for (const m of page.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) allCss += '\n' + m[1];
allCss = allCss.replace(/\/\*[\s\S]*?\*\//g, '');

const ACCENT_VAR = /var\(--color-accent-[a-z-]+\)|var\(--focus-ring-color\)|#8B1538|#7A1030|#E0728F|#B01B45|#C4234F|#FBEAEF|#E8B4C2|#2A0E17|#5C1B30|rgba\(139,\s*21,\s*56/i;
const DANGER = /var\(--color-semantic-danger-[a-z-]+\)|#A32D2D|#9E2020|#8A2020|#781A1A|#FCEBEB|#E24B4A|#F09595|#C43A3A|#A62E2E|#341313|\bred\b/i;

// split into rules: selector{decls}. Skip :root / [data-theme] token definition blocks.
const rules = [...allCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map((m) => ({ sel: m[1].trim().replace(/^@media[^{]*\{/, '').trim(), body: m[2] }))
  .filter((r) => !/^(:root|\[data-theme)/.test(r.sel) && !r.sel.startsWith('@'));
let focusCounted = false;
let cssUses = 0;
const cssNotes = [];
for (const r of rules) {
  if (DANGER.test(r.body)) errors.push(`red/danger colour used in rule "${r.sel}" (errors must use amber)`);
  if (!ACCENT_VAR.test(r.body)) continue;
  if (/(^|[\s,.])accent\b|\.accent/.test(r.sel)) continue; // utility class: counted per HTML element below
  if (/:focus/.test(r.sel)) { if (!focusCounted) { focusCounted = true; cssUses++; cssNotes.push(`focus ring (${r.sel})`); } continue; }
  cssUses++; cssNotes.push(`rule ${r.sel}`);
}
// ---- HTML elements carrying the accent class ----
let htmlUses = 0;
const htmlNotes = [];
for (const f of html) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/<([a-z0-9-]+)\b[^>]*\bclass="([^"]*)"/g)) {
    if (m[2].split(/\s+/).includes('accent')) { htmlUses++; htmlNotes.push(`<${m[1]} class="${m[2]}"> in ${f.replace(dist, '')}`); }
  }
}
// ---- JS must not introduce accent ----
const scripts = js.map((f) => [f.replace(dist, 'dist/'), readFileSync(f, 'utf8')]);
for (const f of html) for (const m of readFileSync(f, 'utf8').matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) if (m[1].trim()) scripts.push([`${f.replace(dist, 'dist/')} (inline script)`, m[1]]);
for (const [name, src] of scripts) {
  if (/\baccent\b|8B1538/i.test(src)) errors.push(`accent referenced in script ${name}`);
  if (/\bred\b|danger/i.test(src)) errors.push(`red/danger referenced in script ${name}`);
}
const total = htmlUses + cssUses;
const MAX_ACCENT = 3;
if (total > MAX_ACCENT) errors.push(`wine accent used ${total} times (max ${MAX_ACCENT}): ${[...htmlNotes, ...cssNotes].join('; ')}`);

// ---- primary button must be ink ----
const primary = rules.filter((r) => /\.btn-primary(?![:\w-])/.test(r.sel) && !/:/.test(r.sel.replace(/\.btn-primary/, '')));
if (!primary.some((r) => /background:\s*var\(--color-neutral-900\)/.test(r.body))) errors.push('primary button (.btn-primary) is not background var(--color-neutral-900) (ink)');
for (const r of rules.filter((r) => /\.btn-primary/.test(r.sel))) if (ACCENT_VAR.test(r.body)) errors.push(`primary button rule "${r.sel}" uses the accent`);

// ---- no placeholder tokens ----
if (/\bTODO\b|placeholder design token/i.test(allCss)) errors.push('placeholder/TODO marker found in built CSS');

console.log(`check-build: accent usages = ${total} (html ${htmlUses}: ${htmlNotes.join(', ') || 'none'}; css ${cssUses}: ${cssNotes.join(', ') || 'none'}); max ${MAX_ACCENT}`);
if (errors.length) { console.error('check-build FAILED:\n - ' + errors.join('\n - ')); process.exit(1); }
console.log('check-build: OK');
