# HandleHub — reference-matched rebuild

This version was rebuilt around the supplied HandleHub page exports. It keeps the compact dark/blue HandleHub marketplace style while retaining the full Next.js + Prisma + crypto invoice backend.

## Important behavior

- Listing cards open category-scoped URLs such as `/instagram/olie` rather than `/listing/...`.
- Legacy `/listing/[id]` links redirect to the new category URL.
- The header Telegram button, Add listing button, seller contact, escrow channel, and escrow chat all use `https://t.me/rainownsyou`.
- Clicking **Buy now** opens a simple payment modal.
- Buyers can choose BTC, LTC, SOL, or ETH.
- Invoices are created server-side and expire in **10–20 minutes** (`20` by default).
- Invoice status polls automatically and blockchain verification happens on the backend.

## Local setup

1. Install Node.js 20+ and PostgreSQL, or use the included Docker Compose database.
2. Copy `.env.example` to `.env` and fill in the required RPC/API/database values.
3. Install dependencies:

```bash
npm install
```

4. Generate Prisma and initialize the database:

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

5. Start development:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Netlify

Push the project to GitHub and import the repo into Netlify.

- Build command: `npm run build`
- Publish directory: `.next`
- Node version: 20 or newer

Add all values from `.env.example` under **Site configuration → Environment variables**. Use a hosted PostgreSQL database in production (for example Neon or Supabase Postgres).

Run the Prisma schema against the hosted database once from your PC:

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

Then deploy on Netlify.

## Payment configuration

Receiving addresses are public-only. Never put wallet private keys, seed phrases, or recovery phrases in this project.

Blockchain provider keys / RPC URLs remain server-only environment variables.
