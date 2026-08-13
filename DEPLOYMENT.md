# TicketWAVES frontend deployment

## 1. Put the frontend on GitHub Pages
Upload these files/folders to the repository root:
- `index.html`
- all other `.html` pages
- `config.js`
- `css/`
- `js/`
- `images/`
- `.nojekyll`

Do NOT upload the backend secrets.

## 2. Set the backend URL
Edit `config.js`:
`API_BASE_URL: "https://YOUR-BACKEND-DOMAIN/api"`

The backend must be HTTPS when the frontend is HTTPS.

## 3. Transfer invitation
The transfer email links to:
`accept-transfer.html?token=...`

If the recipient has no account:
- Create account with the exact recipient email.
- The transfer token is preserved.
- The frontend calls the backend to accept the ticket after registration.

If the recipient already has an account:
- Sign in with the recipient email.
- The token is preserved.
- The frontend calls the backend to accept the ticket.

## 4. Payment
The checkout page sends:
`eventId`, `seatIds`, and `currency` to `/payment/initialize`.

The backend must validate the selected seats again and verify the Paystack transaction before creating tickets.

## 5. Admin
The admin password is a backend credential. Never put it in HTML or JavaScript.
