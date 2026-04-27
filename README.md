# ip-admin

Internal admin dashboard (React SPA) for the **CareersAtTech / JobsAtTech** job portal. It is the operator-facing back office used by the content/ops team to manage everything that shows up on the public-facing job site.

> If you're Claude deciding where to route a task: pick this repo whenever the work is about the **admin UI** for managing jobs, companies, ads, or social banners. This repo is **frontend-only** — it talks to a separate backend over HTTP (`REACT_APP_BACKEND_URL`). API/server-side changes do **not** belong here.

## What this repo handles

This is a **React 18 + Create React App** single-page application. It owns:

- **Job management** — create, edit, list, and delete job postings (rich-text descriptions via CKEditor 5). Main widget: `src/widgets/Addjobs/` and `src/widgets/Joblisting/`.
- **Company management** — add/edit company profiles and list companies. Widgets: `src/widgets/CompanyDetails/`, `src/widgets/CompanyListing/`.
- **Ad / popup management** — manage ad banners, ad links, and ad popup types shown on the job portal. Widgets: `src/widgets/AdManager/`, `src/widgets/AdPopupType/`.
- **Social media banner generation** — HTML canvas–based banner composer for Instagram, LinkedIn, and CareersAtTech branding, exportable as images via `html-to-image` / `html2canvas`. See `src/Components/Canvas/` and `src/pages/Banners/`.
- **Authentication** — Firebase-backed sign-in with cookie + `UserContext` session. Route protection via `RouterWrapper` in `src/App.js`.
- **Theming** — Tailwind CSS + shadcn/ui (Neutral theme) with light/dark mode toggle (`src/Context/themeContext.js`). All UI rules live in `THEME_GUIDE.md` and `CLAUDE.md`.

## What this repo does NOT handle

- **No backend / API implementation.** All data access goes through `src/Helpers/request.js` → external service at `REACT_APP_BACKEND_URL`. Backend contracts are documented in `API_DOCS.md` for reference only; the server itself lives elsewhere.
- **No public-facing job site.** This is the admin panel — the candidate-facing CareersAtTech / JobsAtTech site is a separate codebase.
- **No mobile app.** Web only, responsive down to mobile breakpoints via Tailwind.

## Tech stack (at a glance)

React 18 (CRA) · React Router v6 · Tailwind CSS 3.4 + shadcn/ui (Radix) · MUI v5 (legacy, co-existing) · Lucide icons · Firebase Auth · CKEditor 5 · react-toastify · html-to-image / html2canvas.

## Route map

Defined in `src/App.js`:

| Route | Page | Purpose |
|-------|------|---------|
| `/signin` | `pages/SignIn/` | Firebase login |
| `/addjob` | `pages/AddJobs.jsx` | Create / edit a job posting |
| `/jobs` | `pages/JobList.jsx` | Browse & manage job postings |
| `/addcompany` | `pages/AddCompanyDetails.jsx` | Create / edit a company |
| `/companys` | `pages/CompanyList.jsx` | Browse & manage companies |
| `/canvas` | `pages/Banners/` | Social banner generator |

## Project layout

```
src/
├── Apis/          # Domain API helpers (Company.js)
├── Components/    # Reusable UI (Button, Canvas, CkEditor, Header, Input, Loader, Searchbar)
├── Config/        # Firebase + editor config
├── Context/       # UserContext, themeContext
├── Helpers/       # request.js, apiEndpoints.js, cookies, toast, telegram, image utils
├── Static/        # Image and logo assets
├── pages/         # Thin route-level wrappers
└── widgets/       # Feature widgets (the real work lives here)
```

Pages are intentionally thin — e.g. `AddJobs.jsx` just renders `<AddjobsComponent />`. Most logic lives under `src/widgets/`.

## Commands

```bash
npm start      # dev server (http://localhost:3000)
npm run build  # production build
npm test       # run tests
```

## Environment variables

All prefixed with `REACT_APP_` (see `.env.example`):

- `REACT_APP_BACKEND_URL` — base URL of the backend API
- `REACT_APP_FIREBASE_*` — Firebase Auth config (apiKey, authDomain, projectId, etc.)

## Further reading

- [`CLAUDE.md`](./CLAUDE.md) — project conventions, patterns, and hard rules for AI-assisted edits
- [`THEME_GUIDE.md`](./THEME_GUIDE.md) — UI/theme spec (must read before any frontend change)
- [`API_DOCS.md`](./API_DOCS.md) — backend API contract reference
- [`BACKEND_SECURITY_REQUIREMENTS.md`](./BACKEND_SECURITY_REQUIREMENTS.md), [`CORS_FIX_FOR_BACKEND.md`](./CORS_FIX_FOR_BACKEND.md), [`SECURITY_FIXES_SUMMARY.md`](./SECURITY_FIXES_SUMMARY.md) — notes for the backend team
