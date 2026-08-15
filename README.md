# TicketWAVES MongoDB + Auth + Email + QR + Ticket Design Fix

## Render backend
Replace your current backend `index.js` and `package.json` with the files in `backend/`.
Keep your existing working `MONGODB_URI` and `PAYSTACK_SECRET_KEY` in Render.
Add:
- JWT_SECRET
- FRONTEND_URL=https://yasiyrshehu-byte.github.io/TicketWAVES-frontend
- PAYSTACK_CALLBACK_URL=https://yasiyrshehu-byte.github.io/TicketWAVES-frontend/payment-callback.html
- ADMIN_EMAIL
- EMAIL_SERVICE=gmail
- EMAIL_USER=your Gmail address
- EMAIL_PASSWORD=your 16-character Google App Password
- EMAIL_FROM=TicketWAVES <your Gmail address>

After deploy open: https://YOUR-RENDER-SERVICE.onrender.com/api/health
It must say database connected.

For email diagnostics, log in as admin and call POST /api/email/test with {"to":"your@email.com"} or use the admin UI when added.

## Frontend
Replace the matching files in your GitHub Pages repository:
- api-config.js
- login.js
- register.js
- my-tickets.js
- ticket.html
- transfer.js
- accept-transfer.html

The frontend API is set to your current Render service URL. If Render gives you a different service URL, update that URL in these files.

## Important
Do not put MONGODB_URI, PAYSTACK_SECRET_KEY or EMAIL_PASSWORD in GitHub Pages. Keep secrets in Render Environment Variables.
