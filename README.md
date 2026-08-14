# TicketWAVES — GitHub Pages + Render

## IMPORTANT: this repository is already arranged for GitHub Pages.

`index.html` is at the repository ROOT.

Do NOT put the whole project inside another `frontend/` folder when deploying this version.

Repository root should look like:

```text
index.html
pages/
admin/
assets/
backend/
DEPLOYMENT.md
README.md
```

### GitHub Pages

1. Upload/extract ALL contents of this package into the root of your GitHub Pages repository.
2. GitHub Pages -> Settings -> Pages.
3. Choose **Deploy from a branch**.
4. Select your branch (usually `main`) and folder `/ (root)`.
5. Save.
6. Wait for the Pages deployment.
7. Open your GitHub Pages URL.

The site will open `index.html`, not this README.

### Render

The `backend/` folder is the Node/Express API. Deploy that folder as a Render Web Service.

Set these environment variables on Render:

- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `FRONTEND_URL=https://yasiyrshehu-byte.github.io`
- `PAYMENTS_MODE=mock` for initial testing

After mock checkout and ticket ownership work, configure Paystack securely on Render.

### API

The frontend is configured for:

`https://ticketwaves-backend-3.onrender.com/api`

Do not put the secret Paystack key or MongoDB credentials into GitHub.
