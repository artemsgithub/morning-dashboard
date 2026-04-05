# Morning Dashboard — Session Handoff Document

**Date:** April 5, 2026
**Branch:** `claude/setup-dashboard-app-2T77S`
**Repo:** `artemsgithub/morning-dashboard`
**Commits:** 8 (see history below)

---

## Project Overview

A full-screen morning dashboard app designed for an always-on tablet display. The aesthetic is **mid-century modern** with a warm, human feel inspired by Claude's color palette — signature orange (#D97757), sage green (#7A9E7E), cream/linen backgrounds, and DM Serif Display + Inter typography.

**Purpose:** Glanceable morning info — weather, a personal note, and a daily affirmation.

---

## Tech Stack

| Layer        | Choice                  |
|-------------|-------------------------|
| Framework   | React 19 + Vite 8       |
| Icons       | Lucide React            |
| Styling     | Hand-written CSS (no component library) |
| Fonts       | DM Serif Display (headings) + Inter (body) via Google Fonts |
| Deployment  | Vercel (Vite auto-detected) |
| PWA         | manifest.json (fullscreen, landscape) |

**No component library** — all visualizations (gauge bars, sun arc, percent bars) are custom-built with CSS and inline SVG. This was a deliberate choice to maintain full control over the mid-century design aesthetic.

---

## File Structure

```
morning-dashboard/
├── index.html                  # SVG grain filter, Google Fonts, PWA meta tags
├── vite.config.js
├── package.json
├── public/
│   ├── favicon.svg             # Orange circle favicon
│   └── manifest.json           # PWA: fullscreen, landscape, "Add to Home Screen"
├── src/
│   ├── main.jsx                # React entry point
│   ├── index.css               # Design tokens, global styles, grain texture
│   ├── App.jsx                 # Dashboard layout + wake lock + night mode
│   ├── App.css                 # All component styles
│   ├── hooks/
│   │   └── useWakeLock.js      # Screen Wake Lock API hook
│   ├── components/
│   │   ├── ClockHeader.jsx     # Live time + bold serif date
│   │   ├── WeatherCard.jsx     # Full weather display with visual gauges
│   │   ├── NotesCard.jsx       # Persistent note (localStorage)
│   │   └── AffirmationCard.jsx # Daily affirmation (localStorage, rotates daily)
│   └── data/
│       ├── placeholderWeather.js  # Mock weather data
│       └── affirmations.js        # Placeholder affirmation list
```

---

## Components Detail

### ClockHeader
- Live-updating time (every 1s) and date
- Left-aligned, time in DM Serif Display 5rem, date in bold serif 1.4rem

### WeatherCard
- **Header:** Large condition icon (64px, Lucide) + temperature + condition text + hi/lo
- **Hourly strip:** 7 time slots with weather icons (26px) and temps
- **AQI gauge:** Color-coded segmented bar (6 EPA breakpoints: green→red) with needle pointer, side by side with humidity
- **Humidity bar:** Sage green percent fill bar (24px thick pill)
- **Rain bar:** Clay orange percent fill bar with "when" text
- **Wind:** Large serif number + mph/direction
- **Sun arc:** SVG semicircle with dashed track, filled daylight portion, sun dot, sunrise/sunset labels
- All data currently from `src/data/placeholderWeather.js`
- Icon set supports: sun, cloud-sun, cloud, cloud-rain, cloud-snow, cloud-lightning, cloud-fog, cloud-drizzle, moon

### NotesCard
- Textarea with localStorage persistence (key: `morning-dashboard-note`)
- Text selection enabled (rest of UI has it disabled for kiosk mode)

### AffirmationCard
- Picks random affirmation, persists in localStorage with date stamp
- Same affirmation survives page refreshes all day
- Auto-rotates on new calendar day
- Manual "New affirmation" button overrides
- 15 placeholder affirmations in `src/data/affirmations.js`

---

## Tablet/Kiosk Optimizations

- **Wake Lock API** — keeps screen on, re-acquires on visibility change
- **PWA manifest** — fullscreen + landscape orientation for "Add to Home Screen"
- **Night mode** — auto-dims to 45% brightness 10pm–6am (CSS filter)
- **No scroll** — viewport locked to 100dvh, overflow hidden
- **Touch optimizations** — no overscroll bounce, no pull-to-refresh, no text selection (except notes), no tap highlight, no pinch-zoom
- **Internal scroll** — weather card has overflow-y auto if content exceeds on smaller tablets

---

## Design Tokens (CSS Custom Properties)

```css
--clay:        #D97757   /* Primary accent — Claude's orange */
--sage:        #7A9E7E   /* Secondary accent — organic green */
--cream:       #FDF6F0   /* Base background */
--walnut:      #3D2B1F   /* Headings & strong text */
--card-bg:     rgba(255, 255, 255, 0.72)  /* Frosted glass */
```

Background is a solid sage-tinted green (#E8EDE4) with an SVG feTurbulence grain overlay at 45% opacity.

---

## What's NOT Done Yet (Next Steps)

### 1. Weather API Integration
- Replace `src/data/placeholderWeather.js` with a real API
- API not yet chosen — candidates: OpenWeatherMap, WeatherAPI, Tomorrow.io, Open-Meteo (free)
- Need to decide: API key management (env vars), polling interval, error handling
- Sun arc position should be calculated dynamically from sunrise/sunset times + current time

### 2. Affirmation Database
- Currently a hardcoded array in `src/data/affirmations.js`
- Plan is to connect to a database (not yet set up)
- Could be Supabase, Firebase, or a simple JSON endpoint

### 3. No Component Library
- Decision was made to keep everything hand-built
- If future needs arise (modals, dropdowns, toggles), Radix UI was recommended as the best fit to preserve the custom aesthetic

### 4. Potential Enhancements
- Service worker for offline support (currently no SW)
- Auto-refresh weather on an interval
- Location detection for weather
- Multiple note slots or a to-do list
- Transition animations between day/night mode
- 192x192 and 512x512 PNG icons for the PWA manifest

---

## Commit History

```
180e536 fix: persist daily affirmation in localStorage, bold serif date
1b4b0be style: AQI and humidity side by side with thick pill-shaped bars
9efb1e4 style: scale up weather gauges and text for tablet readability
45167b3 feat: optimize for always-on tablet kiosk display
f8c5a6c feat: add visual weather gauges — AQI scale bar, percent bars, sun arc
6f111b4 style: replace gradient background with grainy sage green texture
4d27f70 style: left-align clock, green background, large weather condition icon
1125850 feat: scaffold morning dashboard with weather, notes, and affirmation components
```

---

## How to Run

```bash
npm install
npm run dev       # Dev server with HMR
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
```

Deploy to Vercel: connect the repo, it auto-detects Vite. No config needed.

---

## Key Design Decisions & Rationale

1. **No component library** — The mid-century aesthetic is too specific; libraries would fight the design. Custom CSS is lighter and gives full control.
2. **localStorage for persistence** — Notes and affirmations persist without a backend. Simple and works offline.
3. **SVG grain texture** — Generated via feTurbulence filter, no image assets to load. Gives that vintage paper feel.
4. **All gauges hand-built** — AQI segments, percent bars, sun arc are pure CSS/SVG. No charting library needed for these simple visualizations.
5. **Thick pill bars** — Optimized for glanceability on a tablet at arm's length, per user feedback.
