# TicketWAVES — Fast Auth Test Build

## Important
This build keeps MongoDB/Mongoose as the database. Do not mix the old SQLite controllers into this backend.

## Auth improvements
- Registration no longer waits for SMTP/email delivery before returning the account/token.
- Login and registration have a 12-second frontend timeout with clear errors.
- Login/register buttons show a processing state and are protected from double-clicks.
- bcrypt password hashing uses a faster production-safe cost of 10.
- MongoDB connection timeouts are capped at 10 seconds.

## Render environment variables
Set these on the backend service:
- MONGODB_URI
- JWT_SECRET
- PAYSTACK_SECRET_KEY
- EMAIL_USER
- EMAIL_PASSWORD (Gmail App Password)
- EMAIL_SERVICE=gmail
- EMAIL_FROM
- FRONTEND_URL=https://yasiyrshehu-byte.github.io/TicketWAVES-frontend
- PAYSTACK_CALLBACK_URL=https://yasiyrshehu-byte.github.io/TicketWAVES-frontend/payment-callback.html
- ADMIN_EMAIL

## Test order
1. Deploy backend and wait until Render shows the service as live.
2. Open `https://ticketwaves-backend-3.onrender.com/api/health` and confirm `status: online` and `database: connected`.
3. Open the GitHub Pages frontend.
4. Create a new account.
5. Confirm it immediately opens the account page.
6. Log out and log back in.

Email is deliberately asynchronous: a slow/broken SMTP server must not block account creation.
