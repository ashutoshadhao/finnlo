# 💰 Finnlo — Personal Finance SaaS

Finnlo is a full-stack personal finance management application built with Next.js 14. It helps you track your income, expenses, and transactions across multiple accounts, visualize spending patterns through rich charts, and even calculate cashback earnings from popular Indian credit cards.

---

## ✨ Features

- **Dashboard Overview** — At-a-glance summary cards showing income, expenses, and remaining balance with trend indicators.
- **Transaction Management** — Add, edit, delete, and bulk-import transactions via CSV. Filter by date range and account.
- **Account Management** — Create and manage multiple financial accounts (e.g. savings, credit cards, wallets).
- **Category Management** — Organize transactions into custom spending categories.
- **Interactive Charts** — Visualize spending with Area, Bar, Line, Pie, Radar, and Radial charts powered by Recharts.
- **Credit Card Cashback Tracker** — Calculate estimated cashback earned per transaction for Indian credit cards:
  - 🛒 Flipkart Axis Bank Credit Card
  - 💳 SBI Cashback Credit Card
  - 📱 PhonePe SBI Black Credit Card
- **CSV Import** — Bulk-import transactions from CSV exports with a column-mapping UI.
- **Bank Connectivity** — Plaid integration for connecting real bank accounts.
- **Subscriptions** — LemonSqueezy-powered subscription management for premium features.
- **Authentication** — Secure sign-in / sign-up powered by Clerk.
- **Responsive UI** — Clean, modern interface built with Tailwind CSS and shadcn/ui components.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | [Clerk](https://clerk.com/) |
| Database | PostgreSQL via [Neon](https://neon.tech/) (serverless) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| API | [Hono](https://hono.dev/) |
| State / Data Fetching | [TanStack Query v5](https://tanstack.com/query) |
| Charts | [Recharts](https://recharts.org/) |
| Forms | React Hook Form + Zod |
| CSV Parsing | PapaParse |
| Bank Linking | [Plaid](https://plaid.com/) |
| Payments | [LemonSqueezy](https://www.lemonsqueezy.com/) |
| Package Manager | [Bun](https://bun.sh/) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- A [Neon](https://neon.tech/) PostgreSQL database
- A [Clerk](https://clerk.com/) account
- (Optional) A [Plaid](https://plaid.com/) account for bank connectivity
- (Optional) A [LemonSqueezy](https://www.lemonsqueezy.com/) account for subscriptions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/finnlo.git
cd finnlo
```

### 2. Install dependencies

```bash
bun install
# or
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://...

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Plaid (optional – for bank connectivity)
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ENV=sandbox

# LemonSqueezy (optional – for subscriptions)
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run database migrations

```bash
bun run db:generate
bun run db:migrate
```

### 5. Start the development server

```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📋 Available Scripts

| Script | Description |
|---|---|
| `bun dev` | Start the development server |
| `bun build` | Build for production |
| `bun start` | Start the production server |
| `bun lint` | Run ESLint |
| `bun run db:generate` | Generate Drizzle ORM migrations |
| `bun run db:migrate` | Apply database migrations |
| `bun run db:studio` | Open Drizzle Studio (DB GUI) |

---

## 📁 Project Structure

```
├── app/
│   ├── (auth)/          # Sign-in & sign-up pages (Clerk)
│   ├── (dashboard)/     # Protected app pages
│   │   ├── page.tsx     # Dashboard with charts & summary
│   │   ├── accounts/    # Account management
│   │   ├── categories/  # Category management
│   │   ├── transactions/# Transaction list & CSV import
│   │   └── settings/    # User settings & subscription
│   └── api/             # Hono API routes
├── components/          # Shared UI components & charts
├── db/                  # Drizzle schema & client
├── features/            # Feature-specific API, components & hooks
├── lib/                 # Utilities (cashback calculator, etc.)
├── providers/           # React context providers
└── scripts/             # Database migration & seed scripts
```

---


## 📄 License

This project is for personal and educational use.

---

> Made with ❤️ by **Ashutosh Adhao**
