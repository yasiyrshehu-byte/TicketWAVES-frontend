# TicketWAVES production deployment

## 1. MongoDB Atlas

Create a MongoDB database and copy the connection string.

Example:
mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/ticketwaves

Allow your Render service to connect to Atlas.

## 2. Render backend

Create a Render Web Service from the `backend/` directory.

Build command:
npm install

Start command:
npm start

Set these environment variables:

PORT=10000
MONGODB_URI=your Atlas connection string
JWT_SECRET=a long random secret
FRONTEND_URL=https://yasyirshehu-byte.github.io
ADMIN_EMAIL=your admin email
ADMIN_PASSWORD=a strong admin password
PAYMENTS_MODE=mock

After deploy, open:
https://YOUR-RENDER-SERVICE.onrender.com/health

You should receive JSON containing:
`"ok": true`

## 3. GitHub Pages frontend

Upload the contents of `frontend/` to the root of your GitHub Pages repository.

`index.html` must be at repository root.

Edit:
`frontend/assets/js/config.js`

Set:
`API_BASE: "https://YOUR-RENDER-SERVICE.onrender.com/api"`

Do not add `/api` twice.

## 4. First admin login

Use the ADMIN_EMAIL and ADMIN_PASSWORD environment variables you set on Render.
The backend creates the admin user automatically on first startup if it doesn't already exist.

## 5. Test in this order

1. Open `/health`.
2. Register a normal user.
3. Log in.
4. Log in as admin in `/admin/index.html`.
5. Create an event.
6. Add a ticket.
7. Open Discover and confirm the event appears.
8. Open the event and buy the ticket.
9. Complete the mock payment.
10. Open My Tickets and confirm the ticket appears with a barcode.
11. Log in as admin and confirm the order, paid order and revenue.
12. Create a separate giveaway for the normal user's email.
13. Log in as that user and confirm the giveaway ticket appears in My Tickets.
14. Edit the ticket section/row/seat in admin.
15. Refresh and confirm the change persists.
16. Suspend the user, log out, then confirm login is blocked.
17. Unsuspend the user and confirm login works again.

## Why records won't disappear

The backend writes users, events, tickets, orders and giveaways to MongoDB.
No critical record depends on localStorage.

LocalStorage only holds the JWT on the browser.

## Images

Event and giveaway gallery images are uploaded into MongoDB GridFS.
They are served through `/api/images/:id`.

This is intentional because Render's normal local filesystem is not a permanent storage
solution for production uploads.

## Real payments

`PAYMENTS_MODE=mock` is for end-to-end testing.

For production, implement Paystack initialization and verification in the order controller
and use webhook/verification before changing a ticket from `reserved` to `sold`.

Never put a Paystack secret key in the frontend.
