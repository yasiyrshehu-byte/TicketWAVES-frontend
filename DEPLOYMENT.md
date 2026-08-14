# TicketWAVES deployment

## 1. Frontend on GitHub Pages

Upload the contents of `frontend/` to the GitHub Pages branch/root used by your site.

The important files are:

- `index.html`
- `admin.html`
- `assets/css/app.css`
- `assets/css/admin.css`
- `assets/js/config.js`
- `assets/js/api.js`
- `assets/js/app.js`
- `assets/js/admin.js`

This version uses hash routes (`#discover`, `#tickets`, `#account`, etc.) so GitHub Pages will not try to find physical `/tickets.html` or `/profile.html` routes.

## 2. Render URL

Open `frontend/assets/js/config.js` and make sure:

`API_BASE_URL` is your Render service root.

For the current service:

`https://ticketwaves-backend-3.onrender.com`

Do NOT put `/api` into `API_BASE_URL`.

The frontend automatically calls:

`https://ticketwaves-backend-3.onrender.com/api/...`

## 3. Backend persistence is required

GitHub Pages is static hosting. It cannot permanently save:

- users
- passwords
- tickets
- orders
- paid orders
- giveaways
- event records
- revenue
- suspended users

Those must be stored in the Render backend database.

If data disappears after a few minutes, check the Render backend and MongoDB connection. A frontend cannot repair a database that is dropping or resetting records.

## 4. Required API resources

The frontend is designed around these REST resources:

### Public/user

- `GET /api/events`
- `GET /api/events/:eventId/tickets`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/orders/my-tickets`
- `GET /api/tickets/my`
- `POST /api/orders`

### Admin

- `GET /api/admin/stats`
- `GET /api/admin/users`
- `GET /api/admin/users/suspended`
- `GET /api/admin/events`
- `GET /api/admin/tickets`
- `GET /api/admin/tickets/available`
- `GET /api/admin/orders`
- `GET /api/admin/orders/paid`
- `GET /api/admin/revenue`
- `GET /api/admin/giveaways`
- `POST /api/admin/events`
- `PATCH /api/admin/events/:id`
- `DELETE /api/admin/events/:id`
- `PATCH /api/admin/tickets/:id`
- `DELETE /api/admin/tickets/:id`
- `POST /api/admin/giveaways`
- `POST /api/admin/tickets/:id/give`
- `PATCH /api/admin/users/:id/suspend`

Your existing backend may use different names. In that case update only `assets/js/admin.js` and `assets/js/app.js` endpoint arrays.

## 5. Gallery images

Admin event creation does not ask for an image URL.

The admin selects an image from the phone/computer gallery. The frontend:

1. reads the local image;
2. resizes it;
3. compresses it;
4. sends it to the backend as `image`.

The backend should store it permanently (for example as a base64 field for a small prototype or, preferably, in object storage and save the resulting file reference).

## 6. Email

Admin giveaway does not depend on email delivery.

A giveaway should directly change the ticket's `owner/userId` in the database and make it appear in that user's My Tickets.

Email can be added separately as a notification, but email must never be the thing that creates or transfers ownership.

## 7. Render free plan

Render's free service can sleep after inactivity. The first request can therefore be slow.

This does not mean the database should be deleted. If records are actually disappearing, verify the database connection and whether the backend is using an ephemeral/local database instead of persistent MongoDB.

## 8. Test checklist

1. Create a test account.
2. Refresh the browser.
3. Log out and log back in.
4. Create an event in admin.
5. Upload an image from gallery.
6. Refresh admin.
7. Open the public Discover page.
8. Confirm the event remains.
9. Create/add a ticket.
10. Buy or assign the ticket.
11. Open My Tickets.
12. Open the ticket and confirm barcode, section, row, seat and order number.
13. Refresh again.
14. Log in from another device/browser and confirm the same server-side record exists.
15. Give a ticket to an existing account and confirm it appears directly in that user's My Tickets.

If step 13 or 14 loses data, fix the backend/database rather than adding more localStorage.
