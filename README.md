# TicketWAVES Full Frontend Update

This package replaces the previous frontend with a mobile-first marketplace UI and a separate admin control centre.

## Included

For easiest GitHub Pages deployment, the site files are also copied at the ZIP root (`index.html`, `admin.html`, `assets/`). You can publish the ZIP root directly.

- `frontend/index.html` — public TicketWAVES app
- `frontend/admin.html` — admin app
- `frontend/assets/js/config.js` — Render API URL
- `frontend/assets/js/api.js` — API/auth/cache layer
- `frontend/assets/js/app.js` — user experience
- `frontend/assets/js/admin.js` — admin pages and CRUD actions
- `frontend/assets/css/app.css` — public design
- `frontend/assets/css/admin.css` — admin design
- `DEPLOYMENT.md` — GitHub Pages + Render deployment notes
- `backend-integration/README.md` — persistence and ticket ownership requirements

## Design

The public app uses the requested navigation:

Discover | For You | My Tickets | Sell | Account

The Account page contains notifications, location, favourites, edit details, security, orders and logout.

The admin app has separate pages for users, suspended users, events, tickets, available tickets, orders, paid orders, revenue, giveaways, create event, create giveaway and support.

## Critical persistence note

A static GitHub Pages frontend cannot permanently save user accounts or tickets. The Render backend and persistent database must do that. This frontend never treats localStorage as the permanent database.
