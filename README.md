# TicketWAVES Frontend Update

This is a mobile-first TicketWAVES marketplace frontend with:

- Discover
- For You
- My Tickets
- Sell
- Account
- Working hash navigation (so GitHub Pages does not produce "Route not found")
- Barcode rendering for ticket codes
- Event cards and event detail modal
- Account settings
- Admin control centre with separate pages for users, suspended users, events, tickets, available tickets, orders, paid orders, revenue, giveaways, event creation and giveaway creation
- Gallery image upload on admin event/giveaway forms
- Ticket section/row/seat editing
- Local cache that never replaces the backend as the source of truth

## API URL

Edit `assets/js/config.js`:

`API_BASE_URL: "https://ticketwaves-backend-3.onrender.com"`

Do not add `/api` to the URL. The app adds `/api` automatically.

## Important

The browser cannot permanently store users, orders, tickets or revenue for every device. Those records must be saved by the Render backend/database. This frontend therefore treats the API as the source of truth.

If the backend returns an error, the UI will show it rather than silently pretending that a ticket was saved.
