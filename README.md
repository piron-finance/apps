# Piron Finance Monorepo

Tokenizing global bond markets through decentralized investment pools.

## 🏗️ Architecture

This is a **Turborepo** monorepo containing:

- **`apps/web`** - Marketing site ([piron.finance](https://piron.finance))
- **`apps/app`** - Main application ([app.piron.finance](https://app.piron.finance))
- **`apps/cms`** - Sanity Studio for the blog CMS
- **`packages/*`** - Shared packages and utilities

## 🚀 Getting Started

### Prerequisites

- Node.js 20.17+ (or 18.20+)
- npm 10+

### Installation

```bash
# Install all dependencies
npm install

# Start development servers
npm run dev
```

This will start:

- **Marketing site** → http://localhost:3000
- **Main app** → http://localhost:3001

### Available Commands

| Command         | Description                        |
| --------------- | ---------------------------------- |
| `npm run dev`   | Start all apps in development mode |
| `npm run build` | Build all apps for production      |
| `npm run lint`  | Lint all apps                      |
| `npm run clean` | Clean build artifacts              |

### Running Individual Apps

```bash
# Marketing site only
npm run dev --filter=@piron/web

# Main app only
npm run dev --filter=@piron/app

# Sanity Studio
npm run studio --workspace=@piron/cms
```

## 📦 Apps

### Marketing Site (`apps/web`)

Public-facing marketing website built with Next.js 14.

**Features:**

- Modern landing page
- Investment network showcase
- Cross-border payment features
- Coming soon modal
- CMS-backed blog

**Tech Stack:**

- Next.js 14.2.5
- TailwindCSS
- Framer Motion
- Radix UI components
- Sanity content integration

### CMS Studio (`apps/cms`)

Sanity Studio used by marketing and editorial teams to manage blog content.

**Features:**

- Blog publishing without code changes
- Authors, categories, and blog settings
- SEO and social metadata fields
- Hero and featured post controls

**Tech Stack:**

- Sanity Studio
- React 18
- Structured content schemas

### Main Application (`apps/app`)

Core investment platform with authentication and blockchain integration.

**Features:**

- Dashboard with portfolio overview
- Investment pool management
- Wallet integration (Web3Modal + Wagmi)
- User authentication (Clerk)
- Real-time data (Convex)

**Tech Stack:**

- Next.js 14.2.5
- Clerk (Auth)
- Convex (Backend)
- Wagmi + Viem (Web3)
- TailwindCSS
- Radix UI components

## 🌍 Deployment

### Vercel Deployment (Recommended)

1. Connect your GitHub repo to Vercel
2. Create two projects:

#### Project 1: Marketing Site

```
Name: piron-web
Framework: Next.js
Root Directory: apps/web
Build Command: cd ../.. && npm run build --filter=@piron/web
Output Directory: apps/web/.next
Install Command: npm install
Domain: piron.finance
```

#### Project 2: Main App

```
Name: piron-app
Framework: Next.js
Root Directory: apps/app
Build Command: cd ../.. && npm run build --filter=@piron/app
Output Directory: apps/app/.next
Install Command: npm install
Domain: app.piron.finance
```

### Environment Variables

#### Marketing Site (`apps/web`)

```env
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_X_URL=https://x.com/pironfinance
NEXT_PUBLIC_LINKEDIN_URL=
SANITY_PROJECT_ID=
SANITY_DATASET=production
SANITY_API_VERSION=2026-04-06
SANITY_API_READ_TOKEN=
SANITY_REVALIDATE_SECRET=
```

#### CMS Studio (`apps/cms`)

```env
SANITY_STUDIO_PROJECT_ID=
SANITY_STUDIO_DATASET=production
```

#### Main App (`apps/app`)

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/overview
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/overview

# Convex Backend
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOYMENT=

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

## 🔧 Development

### Project Structure

```
piron/
├── apps/
│   ├── app/          # Main application
│   │   ├── src/
│   │   │   ├── app/           # Next.js App Router
│   │   │   ├── components/    # React components
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   └── lib/           # Utilities
│   │   ├── convex/            # Convex backend
│   │   └── package.json
│   │
│   └── web/          # Marketing site
│       ├── src/
│       │   ├── app/           # Next.js App Router
│       │   └── components/    # React components
│       └── package.json
│
│   └── cms/          # Sanity Studio
│       ├── src/
│       │   └── schemaTypes/   # Blog content model
│       ├── sanity.config.ts
│       └── package.json
│
├── packages/         # Shared packages
│   ├── config/
│   ├── ui/
│   └── utils/
│
├── package.json      # Root package.json
├── turbo.json        # Turborepo config
└── README.md
```

### Adding Dependencies

```bash
# Install to root (build tools, shared deps)
npm install -D <package>

# Install to specific app
npm install -w @piron/web <package>
npm install -w @piron/app <package>
npm install -w @piron/cms <package>
```

## ✍️ Blog CMS Setup

To make the `/blog` route editable by non-engineering teams:

1. Create a Sanity project and dataset.
2. Set `SANITY_STUDIO_PROJECT_ID` and `SANITY_STUDIO_DATASET` when running `apps/cms`.
3. Set `SANITY_PROJECT_ID`, `SANITY_DATASET`, and `NEXT_PUBLIC_SITE_URL` in the marketing site environment.
4. Optionally set `NEXT_PUBLIC_X_URL` and `NEXT_PUBLIC_LINKEDIN_URL` to surface your social links on the site.
5. Optionally set `SANITY_API_READ_TOKEN` if your dataset is private.
6. Create a Sanity webhook that points to `/api/revalidate` on the marketing site and use the same `SANITY_REVALIDATE_SECRET` value in both places.
7. In Studio, create at least one author, one category, the singleton `Blog settings` document, and your posts.

Until Sanity is configured, the blog renders seeded sample content so the route stays usable during setup.

## 📝 License

Proprietary - Piron Finance

## 🤝 Contributing

This is a private repository. Contact the team for access.
