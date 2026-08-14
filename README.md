# TicketWAVES — Complete Connected Stack

This repository contains a complete TicketWAVES frontend and Node/Express/MongoDB backend.

## Architecture

- `frontend/` — GitHub Pages-compatible static marketplace and admin UI
- `backend/` — Express API
- MongoDB — permanent source of truth for users, events, tickets, orders and giveaways
- MongoDB GridFS — permanent gallery image storage
- JWT — authentication
- bcrypt — password hashing
- Code128 barcode — ticket barcode

## Important

Do not deploy only the frontend and expect data to persist. GitHub Pages is static hosting.
Deploy `backend/` to Render and connect it to MongoDB Atlas.

The frontend is configured for:
`https://ticketwaves-backend-3.onrender.com`

Change `frontend/assets/js/config.js` if your Render service URL changes.

## Backend environment

Copy `.env.example` to `.env` and set:
- MONGODB_URI
- JWT_SECRET
- ADMIN_EMAIL
- ADMIN_PASSWORD
- FRONTEND_URL

For development, `PAYMENTS_MODE=mock` lets you test the complete order -> paid -> ticket ownership
flow without an external payment provider. For real payments, replace this with a Paystack
integration and set `PAYSTACK_SECRET_KEY`.

## Data persistence

All important records are MongoDB documents. Ticket ownership is stored on the Ticket document
and paid orders update ticket status to `sold` and owner to the buyer. Admin giveaways create
a `given` ticket directly owned by the recipient. Email is never required to issue a ticket.

## Gallery images

Images are uploaded from the browser with multipart/form-data and stored in MongoDB GridFS.
This avoids relying on Render's ephemeral filesystem.

## Deployment

See `DEPLOYMENT.md`.
