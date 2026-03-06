# Installation and Deployment Guide

This guide covers local setup, validation, build, and deployment for MyDevice.

## 1. Prerequisites

- Node.js 22 LTS (recommended)
- npm 10+
- Git

## 2. Local Installation

```bash
npm install
```

## 2.1 Environment Variables

Create `.env.local` from `.env.example` and set site URL if needed:

- `VITE_SITE_URL=https://cityray.github.io/mydevice`
- Do not include a trailing slash

This variable is used by:

- Open Graph URL/image in `index.html`
- Generated `dist/sitemap.xml`
- Generated `dist/robots.txt`

## 3. Run in Development

```bash
npm run dev
```

Default local URL:

- `http://localhost:5173/mydevice/`

## 4. Validate Device Data

Run strict validation (fails on invalid schema or duplicate IDs):

```bash
npm run validate:devices
```

Run report mode (always exits 0):

```bash
npm run validate:devices:report
```

Normalize dataset (dedupe by `id`, then sort):

```bash
npm run normalize:devices
```

## 5. Build and Preview

```bash
npm run build
npm run preview
```

Notes:

- `npm run build` automatically runs strict device validation via `prebuild`.
- The build output is generated in `dist/`.

## 6. Deploy to GitHub Pages (GitHub Actions)

This project already includes workflow file:

- `.github/workflows/deploy.yml`

### 6.1 One-time repository setup

1. Open repository `Settings`.
2. Go to `Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.

### 6.2 Trigger deployment

Option A (recommended):

- Push to `main` branch.

Option B (manual):

1. Open `Actions` tab.
2. Select `Deploy to GitHub Pages`.
3. Click `Run workflow`.

The workflow sets `VITE_SITE_URL` automatically as:

- `https://<repository_owner>.github.io/<repository_name>`

### 6.3 Expected site URL

- `https://cityray.github.io/mydevice/`

## 7. Post-deploy Verification Checklist

- Open homepage: `/mydevice/`
- Open routes directly:
  - `/mydevice/devices`
  - `/mydevice/features`
  - `/mydevice/benchmark`
- Refresh each route and confirm SPA fallback works.
- Confirm SEO assets are reachable:
  - `/mydevice/robots.txt`
  - `/mydevice/sitemap.xml`

## 8. Troubleshooting

If deployment succeeds but pages are broken:

- Check `vite.config.ts` has `base: '/mydevice/'`.
- Check `src/main.tsx` uses `BrowserRouter basename="/mydevice"`.
- Ensure Pages source is set to `GitHub Actions`.
- Re-run deployment after fixing configuration.
