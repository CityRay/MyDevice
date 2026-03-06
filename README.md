# MyDevice

> Know your device — A tool for front-end developers & RWD designers

Detect and display your device's screen specifications in real-time: viewport size, resolution, pixel ratio, CSS/HTML5 feature support, media queries, and more.

## Features

- **Device Detection** — Real-time viewport, screen, pixel ratio, and orientation info
- **Feature Detection** — 65+ CSS & JavaScript features tested via native `CSS.supports()` and API checks (no Modernizr)
- **Media Queries** — Live detection of user preferences, display, interaction, and color media features
- **Benchmark Lab** — Run browser performance benchmarks with multi-run averages, environment context, export, and last-run comparison
- **Benchmark History** — Save the latest benchmark locally for comparison and clear the baseline when needed
- **Device Database** — Searchable, sortable specs for 100+ popular devices (smartphones, tablets, laptops)
- **Dark Mode** — Automatic via `prefers-color-scheme`
- **Responsive** — Works on all screen sizes

## Tech Stack

| Category  | Technology                                                 |
| --------- | ---------------------------------------------------------- |
| Build     | [Vite](https://vite.dev/)                                  |
| Framework | [React 19](https://react.dev/) + TypeScript                |
| Styling   | [Tailwind CSS 4](https://tailwindcss.com/)                 |
| Routing   | [React Router 7](https://reactrouter.com/) (BrowserRouter) |
| Icons     | [Lucide React](https://lucide.dev/)                        |
| Deploy    | GitHub Pages                                               |

## Prerequisites

- Node.js 22 LTS (recommended)
- npm 10+

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

- `VITE_SITE_URL` (optional for local, required for accurate SEO metadata in custom deploys)
- Example value: `https://cityray.github.io/MyDevice`
- Do not include a trailing slash

Create `.env.local` from `.env.example` (or copy values manually on Windows).

## Data Validation

The device dataset is validated before build to prevent duplicate IDs and malformed specs.

```bash
# Strict mode (fails on errors)
npm run validate:devices

# Report mode (prints summary and issues, always exits 0)
npm run validate:devices:report
```

`npm run build` automatically runs strict validation via `prebuild`.

To apply a conservative cleanup (dedupe by `id` and sort newest first):

```bash
npm run normalize:devices
```

This command updates `src/data/devices.json` in place.

## Project Structure

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Router setup
├── index.css                   # Tailwind + design tokens
├── routes/
│   ├── Home.tsx                # Device detection dashboard
│   ├── Devices.tsx             # Device database
│   ├── Benchmark.tsx           # Browser performance benchmark lab
│   ├── Features.tsx            # Feature detection report
│   └── NotFound.tsx            # 404 page
├── components/
│   ├── Layout.tsx              # Shared layout (header/footer)
│   ├── Navbar.tsx              # Responsive navigation
│   ├── Footer.tsx
│   ├── Card.tsx                # Info card
│   ├── Badge.tsx               # Status badge
│   ├── SortableTable.tsx       # Generic sortable table
│   └── CopyButton.tsx          # Copy to clipboard
├── hooks/
│   ├── useScreenInfo.ts        # Viewport/screen detection
│   ├── useFeatureDetection.ts  # CSS/JS feature detection
│   ├── useMediaQueries.ts      # Media query detection
│   └── useDevices.ts           # Device data management
├── data/
│   └── devices.json            # Device specifications database
├── types/
│   └── index.ts                # TypeScript type definitions
└── utils/
    └── clipboard.ts            # Clipboard utility
```

## Contributing

Contributions are welcome! Especially:

- **Adding devices** to `src/data/devices.json`
- **Improving detection** logic in hooks
- **Bug fixes** and accessibility improvements

## Deployment

Push to `main` branch triggers automatic deployment to GitHub Pages via GitHub Actions.

Before first deployment, set repository Pages source to `GitHub Actions` in:

- `Settings` → `Pages` → `Build and deployment` → `Source`

You can also deploy manually from:

- `Actions` → `Deploy to GitHub Pages` → `Run workflow`

The workflow injects `VITE_SITE_URL` automatically using repository owner and name, so the deployed metadata and sitemap stay in sync with the target Pages URL.

The SPA fallback is handled in CI by copying `dist/index.html` to `dist/404.html`, allowing BrowserRouter to handle all routes.

For a full install and deployment playbook, see `INSTALLATION.md`.

## License

MIT
