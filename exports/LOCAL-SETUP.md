# Chappaqua Pulse — local development

This archive contains the current source code and project assets, including
the Get involved section. It does not include credentials, database contents,
Git history, installed dependencies, or Replit's internal workspace files.

## Requirements

- Node.js 22 LTS and npm
- PostgreSQL, running locally or hosted
- Internet access for fonts, maps, and event-source scraping

## Setup

1. Extract the ZIP and open the `chappaqua-pulse` folder in your editor.
2. Install dependencies:

   ```sh
   npm ci
   ```

3. Create a file named `.env` in the project root using this template.
   Replace the placeholders with your own LOCAL settings; no existing secrets
   are included in this download.

   ```dotenv
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/chappaqua_pulse
   ADMIN_PASSWORD=CHOOSE_YOUR_OWN_LOCAL_ADMIN_PASSWORD
   ```

   Create an empty PostgreSQL database named `chappaqua_pulse` first.
   The admin password is needed for business-submission review, not public browsing.
   Never commit `.env` or point the next command at a production database.

4. Create tables in your local database:

   ```sh
   node --env-file=.env node_modules/drizzle-kit/bin.cjs push
   ```

5. Start the app (works in macOS, Linux, and Windows terminals):

   ```sh
   node --env-file=.env --import tsx server/index.ts
   ```

6. Open http://localhost:5000 in your browser.
   If that port is in use, change PORT in `.env` (for example to 5001).

## Checks and production build

```sh
npm run check
npm run build
```

To run the production build locally, set `NODE_ENV=production` in `.env`, then:

```sh
node --env-file=.env dist/index.cjs
```

Switch back to `NODE_ENV=development` for development.
The existing npm dev/start scripts use Unix environment syntax; the explicit
Node commands above also work on Windows and load `.env` without extra packages.

## Notes

- The server enables `reusePort` only on Linux for macOS/Windows compatibility.
  Behavior on Replit's Linux server is unchanged.
- Business submissions and approvals stored in the existing database are not exported.
  A new local database starts without those records.
- Curated data and scraping code are included. External sources may be unavailable
  or change their pages over time.
- “Reach out” and “Submit event” use the existing contact email in the source.
  Update those links if you need a different recipient locally.
- This source archive does not transfer domain registration, publishing configuration
  stored outside the project, analytics history, or connected-service authorization.