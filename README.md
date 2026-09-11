# Masjid Al-Hilal — A House of Light, Open to All 🌙

> A mosque landing page that opens under a living night sky.

**Masjid Al-Hilal** is a dependency-light landing page for a community mosque.
Its background is a **Three.js night scene**: a golden low-poly wireframe
mosque (geodesic dome, twin minarets, finial), a glowing crescent moon,
700 stars and drifting gold motes — with mouse parallax and a gentle
scroll orbit. If Three.js can't load, a **pure-CSS night sky** (crescent +
twinkling stars) takes over, so the page never looks broken.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Three.js](https://img.shields.io/badge/three.js-r128-black.svg)]()
[![Build](https://img.shields.io/badge/build-not%20required-brightgreen.svg)]()

<img width="1349" height="3297" alt="image" src="https://github.com/user-attachments/assets/e6a789a1-851b-4048-8ed4-fbd67efec58d" />

---

## ✨ Features

- 🕌 **Wireframe mosque** — low-poly dome, minarets with balconies, finial,
  drawn as golden edge lines
- 🌙 **Crescent moon** — canvas-generated sprite with soft glow
- ⭐ **Night sky** — 700 stars + 130 rising gold motes, horizon fog
- 🖱️ **Mouse parallax & scroll orbit** — the scene breathes as you browse
- 🕰️ **Prayer-times strip** — five cards with a highlighted "next prayer"
- 📋 **Full mosque site** — about, programs, visit info, sadaqah CTA
- 🛡️ **CSS night fallback** — crescent + twinkling stars if the CDN is blocked
- ♻️ **Self-healing loop** — watchdog re-arms `requestAnimationFrame` if the
  browser stalls or throttles it
- ♿ **Reduced-motion aware** — UI animation freezes gracefully
- 📴 **Offline-friendly** — double-click `index.html`; fonts degrade to system

## 🚀 Quick Start

```bash
git clone https://github.com/AmiARMiess/masjid-al-hilal.git
cd masjid-al-hilal
open index.html        # works from file:// — no server needed
```

Three.js loads from cdnjs as a classic script; fonts (Marcellus + Inter)
from Google Fonts. Both degrade gracefully when offline.

## 📁 Structure

```
masjid-al-hilal/
├── index.html     # sections: hero, prayer times, about, programs, visit, give
├── style.css      # night palette, glass cards, CSS night-sky fallback
├── script.js      # Three.js scene + watchdog + scroll reveals
├── README.md      # this file
└── .gitattributes # line-ending + linguist rules
```

## 🧩 Sections

| Section       | Content                                          |
|---------------|--------------------------------------------------|
| Hero          | Next-prayer badge, serif headline, bilingual welcome |
| Prayer Times  | Fajr → Isha cards, Jumu'ah note, highlighted next prayer |
| About         | Story, checklist, 4 stat cards                   |
| Programs      | 6 glass cards (prayers, academy, youth, food bank…) |
| Visit         | Address · prayer schedule · accessibility notes  |
| Give          | Sadaqah CTA panel with donate / sponsor buttons  |
| Footer        | Trust line + quick links                         |

## 🎨 Theming

All tokens live in `:root` of `style.css`:

```css
:root{
  --night:#071120;     /* deep night blue  */
  --ink:#F3EFE6;       /* warm white text  */
  --gold:#E8C766;      /* mosque gold      */
  --emerald:#2BB39A;   /* accent green     */
  --grad:linear-gradient(120deg,var(--gold),var(--emerald));
}
```

Scene colors are in `script.js` (`GOLD = 0xE8C766`, stars `0xDCEBFF`) —
swap those hexes to rebrand the night.

## 🛡️ Fallback & Self-Healing

1. `window.THREE` missing → `body.no-three` → CSS night sky animates instead.
2. Scene init throws → same fallback, page stays fully usable.
3. Watchdog (400 ms) re-arms the render loop if Chrome pauses/throttles rAF.
4. `visibilitychange` / focus wake the loop after tab switches or sleep.

## ⚙️ Performance

- ~1,000 primitives total (lines + points) — trivially 60 fps
- Pixel ratio capped at 2, additive motes, no shadow maps, no post-processing
- All UI motion is transform/opacity only

## 🧑 Browser Support

Any browser with WebGL + `IntersectionObserver` (Chrome, Edge, Firefox,
Safari). Without WebGL or JS, the CSS night sky and full content remain.

## 📄 License

MIT — free for personal and commercial use. Please keep community use free.

---

*أهلًا وسهلاً — you are welcome here.*
