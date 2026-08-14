# TicketWAVES V2 deployment

## Why this version looks different
The previous deployment showed raw HTML because the browser was not receiving the CSS files.
This V2 package embeds the application CSS and JavaScript directly inside `index.html` and
`admin.html`, while also keeping the normal `assets/` files in the package.

That means GitHub Pages can render the design even if a relative `assets/` path was accidentally
omitted during deployment.

## GitHub Pages

1. Extract this ZIP.
2. Upload **all contents of the extracted folder** to the root of the GitHub Pages repository.
3. Make sure `index.html` is in the repository root.
4. Make sure `admin.html` is in the repository root.
5. Commit and push.
6. In GitHub: Settings -> Pages -> deploy from the branch/folder containing `index.html`.
7. Wait for the Pages deployment to finish.
8. Open the GitHub Pages URL in a private/incognito tab or hard-refresh the page.

Do not upload only `index.html`. Upload the whole package.

## Render backend

The frontend is configured for:

https://ticketwaves-backend-3.onrender.com

The code automatically adds `/api`.

Therefore, the configured value is the Render service root, **not** a URL ending in `/api`.

## Important data persistence

GitHub Pages is static hosting. It cannot permanently store user accounts, orders, tickets,
events or giveaways.

Those records must be written to your Render backend and MongoDB. LocalStorage is only a
temporary browser cache and must never be treated as the database.

The backend must persist:
- users
- suspended users
- events
- tickets
- available tickets
- orders
- paid orders
- revenue
- giveaways
- ticket ownership / transfers

## No email dependency for ticket ownership

Admin giveaways should assign the ticket directly to the recipient user record. Email can be
used as a notification later, but email delivery must not be required for the ticket to appear
in **My Tickets**.

Likewise, a paid order must create/persist the ticket record and associate it with the buyer's
user ID before the checkout/order request is considered successful.

## Gallery images

The Create Event and Create Giveaway screens use file inputs for device gallery uploads.
The selected image is previewed before submission. The backend should store the uploaded image
or a durable image-storage URL; do not store a temporary browser object URL as the permanent image.

## Admin navigation

The admin interface is split into pages for:
Overview, Users, Suspended Users, Events, All Tickets, Available Tickets, All Orders,
Paid Orders, Revenue, Giveaways, Create Event, Create Giveaway and Support.

Create Giveaway is intentionally separate from Create Event.
