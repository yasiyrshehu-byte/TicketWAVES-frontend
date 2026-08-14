# TicketWAVES updated build

## Render backend Environment Variables
Keep your working MONGODB_URI. Add/fix:
- MONGODB_URI = your MongoDB Atlas connection string
- JWT_SECRET = a long random secret
- PAYSTACK_SECRET_KEY = your Paystack secret key
- EMAIL_USER = Gmail address used to send TicketWAVES mail
- EMAIL_PASSWORD = Gmail App Password (not your normal Gmail password)
- EMAIL_FROM = TicketWAVES <same Gmail address> (optional)
- FRONTEND_URL = https://yasiyrshehu-byte.github.io/TicketWAVES-frontend
- PAYSTACK_CALLBACK_URL = https://yasiyrshehu-byte.github.io/TicketWAVES-frontend/payment-callback.html
- ADMIN_EMAIL = the email address that should be the TicketWAVES admin

Do not put these secrets in GitHub frontend files.

## Render
Build command: npm install
Start command: npm start

After changing Environment Variables, redeploy.

## Frontend
Upload the CONTENTS of frontend/ to the root of the GitHub Pages repository, replacing the old files.

## What is fixed
- Registration: first name, surname, phone, country, email, password
- 100+ country picker
- Welcome email on registration
- Global event visibility; country selection no longer hides events
- Admin currency selector
- Ticket currency stored on event/ticket
- Real Paystack initialize + verify
- SMTP/Gmail email sending
- QR code generated for every ticket
- Ticket page follows the supplied Ticketmaster-style reference: event image, date/time, venue, section/row/seat, QR code, directions, share
- Share button creates a public ticket URL
- Transfer email can invite a non-user; recipient can create an account and then accept
- Transfer recipient must use the email the invitation was sent to
