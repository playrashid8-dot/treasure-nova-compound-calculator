# Treasure Nova Compound Calculator

Single-page calculator for a mathematical compound illustration. It runs entirely in the browser. There is no login, database, or backend.

Initial deposit is accounts × 60. Completed cycles are floor(days / 5). The final amount uses a 4/3 compound per cycle, rounded half-up to cents with integer math. The screen labels the multiplier as 1.3333333333.

Calculation is mathematical only and does not guarantee actual returns.

## Setup

```bash
npm install
npm run dev
npm run build
npm test
```

- `npm install` installs dependencies.
- `npm run dev` starts the local Vite dev server.
- `npm run build` writes the production site to `dist`.
- `npm test` runs the money checks with Node's built-in test runner (`node --test`). No browser is required.

## Deploy on Vercel

This repository is not deployed from here. To deploy it yourself:

1. Import the GitHub repository `playrashid8-dot/treasure-nova-compound-calculator` into Vercel.
2. Set the framework preset to **Vite**.
3. Use the build command `npm run build`.
4. Set the output directory to **dist**.
5. Deploy. No environment variables are required.
