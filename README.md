# Piron Finance

Access institutional-grade fixed income through simple on-chain pools. No minimums, no paperwork, no middlemen.

## What's in this repo

A **Turborepo** monorepo with two Next.js 14 apps:

| Workspace | What it is | Dev port | Production |
| --- | --- | --- | --- |
| [`apps/web`](apps/web) | Marketing site — how it works, institutions, blog, legal | 3000 | [piron.finance](https://piron.finance) |
| [`apps/app`](apps/app) | Investment platform — browse, invest, portfolio | 3001 | [app.piron.finance](https://app.piron.finance) |

Neither app is standalone: **`apps/app` requires the Piron backend API** (a separate service) for all pool, product, position, and transaction data. It reads chain state directly via wagmi, but everything else comes over REST.

A root `contracts/` directory may be present locally. It's gitignored and serves as reference context while developing — nothing builds or runs from it. The ABIs the app actually calls are committed at `apps/app/src/contracts/abis/`.

The admin and SPV operator consoles live in a separate repository.

## Getting started

Requires **Node 20+** and **npm 10.2.4** (pinned via `packageManager`).

```bash
npm install
npm run dev          # turbo runs every app: web on :3000, app on :3001
```

To run one app, use its workspace:

```bash
npm run dev -w @piron/app
npm run dev -w @piron/web
```

### Environment

Each app reads its own `.env.local` (not committed). `apps/app` needs at minimum:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3008/api/v1   # backend; required
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...           # required — the app throws on boot without it
```

Optional in `apps/app`:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_BASE_SEPOLIA_RPC`, `NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC` | Extra RPC fallback, appended *after* the public nodes |
| `NEXT_PUBLIC_ARC_TESTNET_RPC`, `NEXT_PUBLIC_ROBINHOOD_TESTNET_RPC` | Required for those chains — they have no public RPC |
| `NEXT_PUBLIC_POSTHOG_KEY` | Product analytics |

`apps/web` uses `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_X_URL`, `NEXT_PUBLIC_LINKEDIN_URL`.

On RPC configuration: keyless public nodes are always the primary transport. A `NEXT_PUBLIC_*` key ships in the client bundle and is hit by every browser, so a burned key would 429 across the whole user base — see the comments in [`apps/app/src/configs/index.ts`](apps/app/src/configs/index.ts).

## Products and pools

A **product** is one fund. It may be deployed on several networks, and each deployment is its own pool with its own shares — **shares are not fungible across chains**. A deposit on one network is redeemed on that same network.

The API exposes this as one product with `1..N` instances, and the UI follows it: the fund is the subject of the page, and the network is a control you set at deposit time. Aggregation follows one rule — **money sums** (TVL, cash, deployed value, investors), **per-unit rates are TVL-weighted averages** (NAV per share, APY).

Three pool types. The enums (`SINGLE_ASSET`, `STABLE_YIELD`, `LOCKED`) stay in code, contracts, and the database; the display names come from `poolTypeLabel()` in [`apps/app/src/lib/pool-helpers.ts`](apps/app/src/lib/pool-helpers.ts):

### Flexible Yield — `STABLE_YIELD`

Revolving treasury pools, open continuously. Shares are priced against NAV, updated from on-chain snapshots. Withdraw any time after the minimum holding period; requests settle through a FIFO queue.

### Fixed Yield — `LOCKED`

Configurable lock tiers, each with its own duration, fixed APY, and minimum deposit. Early exit is allowed with a transparent, pre-disclosed penalty.

### Term Deals — `SINGLE_ASSET`

Fixed-term exposure to one instrument (T-Bills, bonds). Each pool has a target raise, a funding window, a maturity date, and a coupon schedule.

## Platform app structure

```
apps/app/src/
  app/(dashboard)/          markets · product/[productKey] · pool/[id] · portfolio
  components/product/       fund page: sections, invest rail, cross-deployment maths
  components/dashboard/     shell, cards, stat rows
  components/ui/            primitives (button, card, select, menu, badge)
  hooks/                    data (TanStack Query) + write paths (deposit, exit, withdrawals)
  lib/api/                  client, endpoints, response types
  lib/constants/chains.ts   chain metadata, explorer URLs
  configs/                  wagmi config and chain definitions
  contracts/abis/           ABIs the app calls directly
```

Data is read through TanStack Query; writes go through wagmi. Theming is CSS custom properties in `globals.css` — semantic tokens (`--brand`, `--surface`, `--positive`) redefined under `.dark`, so components never hardcode a colour and both themes come free.

## Supported networks

Wired into the wallet config, in the order the app offers them:

| Network | Chain ID | |
| --- | --- | --- |
| Base Sepolia | 84532 | default the dashboard opens on |
| Arc Testnet | 5042002 | no public RPC — needs an endpoint |
| Arbitrum Sepolia | 421614 | |
| Robinhood Testnet | 46630 | no public RPC — needs an endpoint |
| Morph Holesky | 2810 | |
| Arbitrum One | 42161 | |

Pool addresses are never hardcoded — they come from the API at runtime, per deployment.

## Scripts

Run from the root; each fans out through Turborepo.

| Command | |
| --- | --- |
| `npm run dev` | every app in watch mode |
| `npm run build` | production builds |
| `npm run lint` | `next lint` per app |
| `npm run clean` | clear build output |

## License

Proprietary — Piron Finance.

## Contributing

This is a private repository. Contact the team for access.
