# Piron Finance Monorepo

Tokenizing global bond markets through decentralized investment pools.

## 🏗️ Architecture

This is a **Turborepo** monorepo containing:

- **`apps/web`** - Marketing site ([piron.finance](https://piron.finance))
- **`apps/app`** - Main application ([app.piron.finance](https://app.piron.finance))
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
```

## 📦 Apps

### Marketing Site (`apps/web`)

Public-facing marketing website built with Next.js 14.

**Features:**

- Modern landing page
- Investment network showcase
- Cross-border payment features
- Coming soon modal

**Tech Stack:**

- Next.js 14.2.5
- TailwindCSS
- Framer Motion
- Radix UI components

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
# Add any marketing site env vars here
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
```

## 📝 License

Proprietary - Piron Finance

## 🤝 Contributing

This is a private repository. Contact the team for access.
