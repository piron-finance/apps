# Piron Finance

Access institutional-grade fixed income through simple on-chain pools. No minimums, no paperwork, no middlemen.

## Architecture

This is a **Turborepo** monorepo containing:

- **`apps/web`** — Marketing site ([piron.finance](https://piron.finance))
- **`apps/app`** — Investment platform ([app.piron.finance](https://app.piron.finance))
- **`apps/cms`** — Sanity Studio for blog content management

## Pool Types

### Single-Asset Pools

Fixed-term investments in individual instruments (T-Bills, bonds). Each pool has a target raise, minimum funding threshold, maturity date, and coupon schedule.

### Stable Yield Pools

Revolving treasury pools with continuous deposits. Pricing is NAV-based (shares priced per Net Asset Value). Withdrawals go through a FIFO queue for liquidity management.

### Locked Pools

Configurable lock tiers with fixed APY. Each tier defines its own duration, APY rate, and minimum deposit. Early exit is allowed with a penalty.

## What You Can Do

- Browse investment pools across single-asset, stable yield, and locked strategies
- Connect your wallet and deposit into pools
- Track your portfolio, positions, and transaction history
- Manage withdrawals and view yield performance

## Supported Chains

- Arbitrum
- Base
- Stellar

## License

Proprietary — Piron Finance

## Contributing

This is a private repository. Contact the team for access.
