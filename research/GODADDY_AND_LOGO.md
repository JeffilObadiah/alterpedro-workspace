# GoDaddy baseline + ALTER PEDRO logo assets
Prepared 2026-10-04 (IST). Raw data: `/workspace/research/godaddy/`, assets: `/workspace/alterpedro_assets/`.

## A. GoDaddy Lighthouse (13.5.0, mobile, `--preset=perf`, 3 runs each, same method as ALTERPEDRO_RESEARCH.md section 2)
Node v22.23.3 first on PATH. Run from the box (datacentre network, not a phone). Lab data only. Box clock is UTC; times converted.
Measured 2026-10-04: home 21:29:20, 21:30:23, 21:31:26 IST; builder 21:32:28, 21:33:43, 21:35:00 IST.
No block in Lighthouse (HTTP 200, real page). Warning "page loaded too slowly to finish within the time limit. Results may be incomplete." on home run 1 and builder runs 1-3.

| Page | LCP s (r1/r2/r3, median) | CLS | TBT s (r1/r2/r3, median) | Weight MiB (median) | JS transferred MiB (JS uncompressed) | Requests (median) | Perf score (r1/r2/r3, median) |
|---|---|---|---|---|---|---|---|
| https://www.godaddy.com/ | 3.41 / 3.29 / 3.20, **3.29** | 0.0025 (all) | 6.87 / 7.16 / 7.38, **7.16** | 3.59 / 3.64 / 3.60, **3.60** | 2.69 / 2.70 / 2.70, **2.70** (10.2 uncompressed) | 222/223/217, **222** | 54 / 56 / 56, **56** |
| https://www.godaddy.com/websites/website-builder (no redirect) | 3.41 / 3.43 / 3.44, **3.43** | 0.0227 (all) | 8.20 / 8.58 / 9.01, **8.58** | 3.86 / 3.65 / 3.65, **3.65** | 2.70 (all runs) (10.2 uncompressed) | 238/234/235, **235** | 53 / 54 / 53, **53** |

- Weight = Lighthouse total-byte-weight (first load, no scroll). JS = sum of transferSize of Script requests.
- FCP medians: home 3.14 s, builder 3.18 s. Raw: `home_run{1,2,3}.json`, `builder_run{1,2,3}.json`, summary script `summ.py`.
- LCP element: NOT reported by Lighthouse in the perf preset (audit absent). Separate observation with a PerformanceObserver in Chrome 154 (not Lighthouse, unthrottled): builder page LCP element = `<h2 class="... carousel-marquee__title">` text "Describe your idea.\nCreate your website in minutes." (mobile 3116 ms, desktop 1372 ms). Home LCP element: not measured.
- TBT of 7-9 s is high because of the box CPU (benchmarkIndex about 2700-2850) plus 2.7 MiB of compressed / 10.2 MiB uncompressed JS. Treat as relative. Perf score 53-56 means GoDaddy is mediocre on lab speed; its "premium feel" does not come from speed.

### Hero (what the page shows)
Direct page reads (headless Chrome with a normal Chrome user agent) got **HTTP 403 "Access Denied" from GoDaddy's CDN (Akamai) on https://www.godaddy.com/**. WebFetch and curl also got 403. Only Lighthouse loaded it. I did not try to get around the block. So the home DOM was not read. What I have for home:
- Headline, exact (from Lighthouse layout-shift node label of `h2.ux-text > span`, i.e. page DOM): "Your domain unlocks everything, get a .com for just $0.01/1st yr." (https://www.godaddy.com/)
- From the Lighthouse end-of-load screenshot only (less reliable, text read off an image; earlier research discarded such reads): a CTA button "Find Your .com"; a domain search box "Type the domain you want"; a badge "FOR ALL CUSTOMERS SAVE $23"; a "BEST OFFER" badge; dark navy/purple gradient with floating glossy 3D icons; carousel pagination dots with prev/next arrows. Whether it autoplays, whether there is video, and what animates on load: **not measured** for home. Lighthouse requests list showed no .mp4/.webm Media request on home run 2.

Builder page https://www.godaddy.com/websites/website-builder (read OK, HTTP 200, mobile 390x844 + desktop 1440x900; `godaddy/dom_builder_*.json/png`):
- H1 (as rendered, uppercase): "GODADDY WEBSITE BUILDER". H2 headline: "Describe your idea. Create your website in minutes."
- Sub: "With a few prompts GoDaddy Website Builder generates your website, web app, pages, databases and logic in minutes, no coding required. Start for free with 50 AI credits a month. No credit card required."
- CTAs: nav "Start for Free" (href `#`); "Start Building for Free" (desktop, y=559, no href); prompt chips "Redesign with a fresh look", "Build an online store", "Create a business directory"; top bar "Call (480) 651-9738 for a demo" (desktop only).
- Video: 4 `<video>` elements exist (muted, loop) but none visible in the first screen, none had a source loaded, no video requests seen. So no hero video.
- Animation (computed CSS): entrance `animateIn` 1.2 s on a hero block on load; `glowShift` 5 s loop; three floating cards `carousel-card-float` loops of 7.6 s, 8.8 s and 9 s. 17 running animations on desktop, 10 on mobile.
- Not tested: scroll animations, click behaviour. Nothing was typed or submitted.

## B. Logo v2 (/workspace/alterpedro_logo_v2.png, 2172x724 RGBA)
Note: the file has real transparency already (corner alpha 0, RGB near black); it is not black on an opaque white background. Used its alpha channel.
Potrace 1.16 installed via apt. Method: alpha 4x bicubic upscale, 50% threshold, `potrace -t 4 -a 1.0 -O 0.4 --tight`. No hand edits except changing `pt` units to px in the svg root.
Mark = the 3 connected components left of the text (x 99-871, y 133-575 in source px); text starts at x 832, so the two overlap in x but do not touch.

Files (bytes): see /workspace/alterpedro_assets/ (helpers in `_work/`):
- logo-full.svg 27,218 (viewBox 1992.2x440.3, 12 paths); logo-full-light.svg 27,218 (#F5F5F2)
- logo-mark.svg 12,483 (viewBox 769.9x440.3, 3 paths); logo-mark-light.svg 12,483
- logo-full-640.webp 12,966 (640x146); logo-full-640-light.webp 12,972
- logo-full-1280.webp 31,694 (1280x292); logo-full-1280-light.webp 31,698
- logo-mark.webp 13,530 (512x298); logo-mark-light.webp 13,534
- contact-sheet.png 271,097 and contact-sheet.webp 62,662 (1800x1260; white, #F5F5F2, #0E0E0E)
WebP is lossless with alpha (lossy q92 was only 3-7% smaller, not worth it). Raster crops carry 8 px (source) padding; SVGs are tight to the ink.

Trace fidelity (SVG rendered at 4x with cairosvg vs 4x source alpha thresholded at 50%):
- Full: IoU 0.986, max edge deviation 0.71 source px, 99.9th percentile 0.25 px, 12 shapes vs 12 shapes. Mark: IoU 0.988, max 0.56 px.
- Only 1 (full) and 2 (mark) places deviate by more than 0.5 px, each 2 px at 4x. Ink area is 0.5-0.7% larger in the SVG than the source (strokes very slightly bolder).
- This is a trace of a raster; hairlines and sharp serif tips were rounded slightly by potrace (alphamax 1.0). I could not view the images myself, so "rough edges" are judged by the numbers above, not by eye. A human check of the swash tip, the A apex and the hairline serifs at large size is advised.
- At 640 px wide the logo is 0.29x of the source, so the thinnest swash hairlines will be about 1 px or less. Use 1280 for retina/hero use. Not tested on a device.
- The contact sheet was rendered; first version overlapped the mark thumbnail with the logo (my layout bug) and was fixed.
