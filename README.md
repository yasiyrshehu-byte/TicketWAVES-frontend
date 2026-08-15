# TicketWAVES merged production test build

This build merges the useful features from the files supplied in the conversation with the working MongoDB/Render backend. It intentionally uses one canonical backend (`backend/index.js`) and one mobile-first frontend (`frontend/index.html`) to avoid conflicting duplicate SQLite/MongoDB and localhost files.

## Included
- MongoDB persistence
- JWT authentication
- Registration: first name, surname, phone, country, email, password
- Full country picker
- Welcome email + ticket/transfer emails
- Paystack initialize + verify flow
- Admin currency selection
- Event image upload from device gallery (stored as data URL)
- Ticket image upload from device gallery
- Global event visibility regardless of event country
- QR code generated server-side for every ticket
- Ticket view with event image, section/row/seat, QR code, directions, share link, transfer
- Public shareable ticket page
- Transfer invitation; recipient can create an account and the transfer token is preserved
- Admin dashboard, users, suspended users, events, tickets, orders, giveaways, create event, create ticket
- Admin ticket edit/delete
- Separate giveaway creation and email delivery
- Email status endpoint for admin diagnostics

## Render
Build command: `npm install`
Start command: `node index.js`

Set these Render environment variables (never commit secrets):
- MONGODB_URI
- JWT_SECRET
- PAYSTACK_SECRET_KEY
- EMAIL_USER
- EMAIL_PASSWORD (Gmail App Password, not normal Gmail password)
- EMAIL_SERVICE=gmail
- EMAIL_FROM
- FRONTEND_URL=https://yasiyrshehu-byte.github.io/TicketWAVES-frontend
- PAYSTACK_CALLBACK_URL=https://yasiyrshehu-byte.github.io/TicketWAVES-frontend/payment-callback.html
- ADMIN_EMAIL

## Frontend
Upload/replace the canonical `index.html` in the root of the GitHub Pages repository. The extra `ticket.html`, `accept-transfer.html`, and `payment-callback.html` files should sit beside it.

Do not use the old `localhost:5000` frontend scripts with this build.
