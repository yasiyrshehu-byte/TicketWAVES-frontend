# TicketWAVES Frontend V2

This version fixes the most visible deployment problem from the previous ZIP: raw/un-styled
HTML caused by CSS assets not being served.

The user app has:
- Discover
- For You
- My Tickets
- Sell
- Account
- Account notifications, location, country, favourites, edit details, security and orders
- Event search and event cards
- Ticket details with barcode/ticket code
- Transfer UI
- Gallery image upload support through the admin forms

The admin app has separate pages for users, suspended users, events, tickets, available tickets,
orders, paid orders, revenue, giveaways, event creation and giveaway creation.

This is a frontend package. Permanent data persistence still belongs to the Render backend and
MongoDB.
