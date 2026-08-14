# DEPLOYMENT — TicketWAVES

## 1. GitHub Pages

This ZIP is different from the previous one.

The previous package had:

`frontend/index.html`

at the repository root level, which caused GitHub Pages to show the README instead of the website when the repository was configured for `/ (root)`.

**This package has:**

`index.html`

directly at the root.

Upload the CONTENTS of this ZIP to the root of your GitHub Pages repository.

You should see:

- index.html
- pages/
- admin/
- assets/
- backend/
- README.md
- DEPLOYMENT.md

Do not create:

`TicketWAVES/frontend/index.html`

for the Pages root deployment.

### Pages setting

GitHub repository -> Settings -> Pages -> Deploy from a branch -> main -> `/ (root)`.

## 2. Render

The frontend is static and belongs on GitHub Pages.

The backend belongs on Render.

For the existing Render service, the API base is:

https://ticketwaves-backend-3.onrender.com/api

The backend must have a working MongoDB URI.

## 3. MongoDB persistence

MongoDB is the permanent source of truth for:

- users
- suspended users
- events
- tickets
- available tickets
- orders
- paid orders
- giveaways
- ticket ownership
- revenue

Do not use browser localStorage as the database.

## 4. Initial testing

Set:

`PAYMENTS_MODE=mock`

on Render while testing.

Then test in this order:

1. Register a user.
2. Log in.
3. Admin creates an event.
4. Admin creates a ticket.
5. User sees the event/ticket.
6. User creates an order.
7. Complete mock payment.
8. Check My Tickets.
9. Verify ticket code/barcode and owner.
10. Admin gives a ticket away.
11. Recipient opens My Tickets.
12. Refresh the browser and confirm the data remains.
13. Log out and log back in and confirm the data remains.

Only after that configure live Paystack.

## 5. Images

Gallery uploads are sent to the backend. The backend must be connected to MongoDB/GridFS so image records are not temporary browser object URLs.

## 6. If you still see README

If your GitHub Pages URL still shows README after uploading this package:

- open repository Settings -> Pages
- confirm source is the correct branch
- confirm folder is `/ (root)`
- confirm `index.html` exists beside `README.md`
- wait for the Pages deployment to finish
- hard refresh / private tab

If `index.html` is inside a folder, Pages is publishing the wrong location.
