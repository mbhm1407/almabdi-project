# Contributing Guide

Thank you for helping improve **المحضر الذكي — Smart Judicial Minutes**.

## Prerequisites

- Node.js 20+
- npm 10+
- (Optional) Docker for container builds

## Getting started

```bash
cd smart-judicial-minutes
npm install
cp packages/server/.env.example packages/server/.env   # fill in Azure/Entra values
npm run dev                                             # API :3978 + client :5173
```

## Project layout

- `packages/shared` — domain types + Zod schemas (`@smj/shared`)
- `packages/server` — Express REST API (`@smj/server`)
- `packages/client` — React + Fluent UI v9 Teams tab (`@smj/client`)
- `teams-app` — Teams manifest + icons
- `docs` — documentation and diagrams

## Quality gates (must pass before a PR)

```bash
npm run lint            # ESLint (0 warnings)
npm run format:check    # Prettier
npm run typecheck       # tsc --noEmit (all workspaces)
npm test                # Vitest unit/integration
npm run test:coverage   # with coverage
npm run build           # production build (no warnings)
node scripts/validate-manifest.mjs
npm run e2e --workspace @smj/client   # Playwright (requires a built client)
```

CI (GitHub Actions) runs all of the above plus a dependency/security audit and
Docker image builds.

## Conventions

- **Strict TypeScript**; no `any` unless justified.
- **Feature-based** folders; keep transport (routes) → application (services) →
  infrastructure (repositories) separation.
- User-facing text is **Arabic-first** and centralized in
  `packages/client/src/strings.ts`.
- All new API input must be validated with **Zod**; all DB access must be
  **parameterized**.
- Add tests with every change; keep the suite green.

## Commit & PR

- Use clear, imperative commit messages.
- Reference the affected package(s).
- Do not commit secrets or `.env` files.

---

**Designed and Developed by Mohammed Al-Maabdi** (mbmaabdi@moj.gov.sa)
Ministry of Justice — Kingdom of Saudi Arabia
