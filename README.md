# TicketWAVES frontend — deployment ready

## What was repaired
- All HTML pages use relative `./css/` and `./js/` paths.
- Mobile-first responsive styling.
- Exact section/row/seat selection before payment.
- Payment currency selector (uses currencies supplied by the backend; until the backend supports more currencies it will show the event currency).
- Login/register flows preserve transfer invitations.
- A recipient without an account can create an account from the transfer email and then receive the ticket.
- A recipient with an account can sign in from the transfer email and accept the ticket.
- My Tickets and individual ticket pages.
- Admin login/dashboard UI, event creation, seat generation, free-ticket issuance, and support inbox.
- Customer support contact.
- No Paystack secret or admin password is stored in the frontend.

## GitHub Pages
1. Upload the CONTENTS of this folder to the repository root.
2. In `config.js`, replace `https://YOUR-BACKEND-DOMAIN/api` with the public HTTPS URL of your backend.
3. Enable GitHub Pages for the `main` branch/root.
4. Do not upload `.env`, Paystack secret keys, SMTP passwords, or admin passwords.

## Backend contract
The frontend expects the API routes documented by the backend project:
- `/auth/register`
- `/auth/login`
- `/users/me`
- `/events`
- `/events/:id`
- `/events/:id/seats`
- `/payment/initialize`
- `/payment/verify/:reference`
- `/tickets/me`
- `/tickets/:id`
- `/transfers`
- `/transfers/invitation/:token`
- `/transfers/accept`
- `/support`
- `/admin/stats`
- `/admin/events`
- `/admin/free-ticket-options`
- `/admin/free-ticket`
- `/admin/support`

Important: the frontend cannot make a payment, create a ticket, or send an email by itself. Those operations must be completed and verified by the deployed backend.

## Venue seat-map workflow

Admin no longer needs to type sections and rows for every event. Create a venue once in the Admin page, upload the venue seat-map image, and upload a CSV or JSON seat-data file. The backend should import those seats into the venue template. Future events select the saved venue and automatically reuse its sections, rows, seats, prices and map image.

CSV example:
section,row,seat,price,currency,status
N110,24,1,150,NGN,Available
N110,24,2,150,NGN,Available
N110,25,1,150,NGN,Available

JSON example:
[{"section":"N110","row":"24","seat":"1","price":150,"currency":"NGN","status":"Available"}]

The image is the visual map; the CSV/JSON is what makes the sections/rows/seats clickable and purchasable. An image alone cannot reliably determine every seat and price.
