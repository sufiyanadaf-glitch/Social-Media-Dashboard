# Pulse Board: Multi-Platform Content Performance Dashboard

High-fidelity front-end prototype (HTML + Tailwind CSS + Chart.js) for the
Social Media Dashboard (SMD) project.

## How to run

You need a modern browser and an internet connection (Tailwind, Chart.js and
Google Fonts load from CDNs).

**Option 1: just open it**
1. Unzip the folder.
2. Double-click `index.html`.

**Option 2: local server (recommended)**
```bash
cd social-media-dashboard
python -m http.server 8000      # or: python3 -m http.server 8000
```
Then open http://localhost:8000

Other servers work too: `npx serve`, or the VS Code "Live Server" extension
(right-click `index.html` > Open with Live Server).

## Demo login

- Email: `admin@smd.demo`
- Password: `Dashboard@2026`

## Project structure

```
social-media-dashboard/
├── index.html          Login page
├── dashboard.html      Main dashboard
├── assets/             Background images (bg-light.svg, bg-dark.svg)
├── css/styles.css      Theme colours (light/dark), backgrounds, chips, live dot
└── js/
    ├── data.js         12 simulated platforms (followers, engagement rate)
    ├── auth.js         Demo authentication and session handling
    ├── theme.js        Light/dark theme toggle (remembered in the browser)
    └── dashboard.js    Mock-live engine, charts, table, CSV export
```

## How it maps to the objectives

**O1: Secure, centralized architecture, 10+ platforms**
- 12 simulated platforms are aggregated into one data model (`data.js`).
- Followers and Engagement Rate are the core metrics in the KPIs, charts and table.
- Access is gated by a login with hashed-password comparison, a 30-minute idle
  timeout, and a 30-second lockout after 3 failed attempts.

**O2: Front-end prototype with mock-live tracking and responsive design**
- Values update on a timer (1/3/5/10 s, pause/resume) to simulate live data.
- Charts: live engagement line chart, followers bar chart, audience-share doughnut.
- Sortable and searchable platform table, live activity feed, CSV export.
- Responsive layout with Tailwind breakpoints; keyboard focus and reduced-motion support.
- Light and dark themes: use the Dark/Light button on the login page or in the dashboard header. The first visit follows your system setting, and your choice is remembered. Charts, tables and backgrounds all switch.

## Limits to mention in your report

- Authentication is client-side and for demonstration only. A real system
  needs server-side auth, HTTPS, and OAuth tokens kept on the server.
- Data is randomly generated; real platforms expose data through separate,
  proprietary APIs, which is the fragmentation problem the project addresses.
  A production design would add per-platform API adapters feeding a
  normalized store, with WebSocket or polling updates to the browser.

## Changing the background

Replace `assets/bg-light.svg` and `assets/bg-dark.svg` with your own images,
or edit the `url(...)` paths near the top of `css/styles.css`. After editing,
hard-refresh the browser (Ctrl+F5) so it does not show the cached version.
