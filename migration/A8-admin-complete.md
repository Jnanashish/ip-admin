# A8 — Admin Panel v2 Migration Complete

> Final wrap-up for the admin panel v2 migration (steps A1–A8). Date: 2026-04-25.

---

## 1. Overview

The admin panel has been replaced with a v2 stack: dedicated `/admin/jobs` and `/admin/companies` routes, react-hook-form + zod-driven forms, a Firebase ID-token API client (`src/api/v2/`), reusable form primitives (`src/Components/forms/v2/`), shadcn-based list pages with skeleton/loading states, slug-driven public job URLs, and a publish-time readiness gate that blocks broken posts. All legacy single-file widgets, the inline edit modal, the JSON-paste shortcut, and the `x-api-key` write paths are gone — the only out-of-scope code that still calls the legacy backend is the Banners / Canvas pipeline (read-only) and the Scraper module (its own back-office surface).

---

## 2. Files inventory

### 2.1 New files

**Pages — `src/pages/admin/`**
- `jobs-v2/JobsListV2.jsx`
- `jobs-v2/CreateJobV2.jsx`
- `jobs-v2/EditJobV2.jsx`
- `jobs-v2/JobFormV2.jsx`
- `jobs-v2/components/StatusBadge.jsx`
- `jobs-v2/components/JobsFilters.jsx`
- `jobs-v2/components/JobsTable.jsx`
- `jobs-v2/components/CompanyFilterSelect.jsx`
- `companies-v2/CompaniesListV2.jsx`
- `companies-v2/CompanyFormV2.jsx`
- `companies-v2/CreateCompanyV2.jsx`
- `companies-v2/EditCompanyV2.jsx`
- `companies-v2/components/CompaniesFilters.jsx`
- `companies-v2/components/CompaniesTable.jsx`
- `companies-v2/components/CompanyStatusBadge.jsx`

**Form primitives — `src/Components/forms/v2/`**
- `BatchYearChips.jsx`, `CompanyAsyncSelect.jsx`, `DisplayModeRadio.jsx`,
  `EmploymentTypeMultiSelect.jsx`, `JobLocationRepeater.jsx`,
  `ReadinessChecklist.jsx`, `ReadinessIndicator.jsx`, `RichTextEditor.jsx`,
  `SalaryFields.jsx`, `SeoSection.jsx`, `SlugField.jsx`, `StatusDropdown.jsx`,
  `TagInput.jsx`

**API client — `src/api/v2/`**
- `client.js` — `apiV2`, `buildQueryString` (Firebase ID-token auth, `{ status, data, error }` response shape)
- `jobs.js` — `createJobV2`, `updateJobV2`, `fetchJobV2`, `deleteJobV2`, `listJobsV2`
- `companies.js` — `createCompanyV2`, `updateCompanyV2`, `fetchCompanyV2`, `deleteCompanyV2`, `listCompaniesV2`

**Validators — `src/validators/v2/`**
- `jobFormSchema.js` (zod schema + enums: `EMPLOYMENT_TYPES`, `CATEGORIES`, `WORK_MODES`, `APPLY_PLATFORMS`, `JOB_STATUSES`, `DISPLAY_MODES`, `SLUG_REGEX`, `extractDirtyValues`)
- `companyFormSchema.js` (zod schema + enums: `COMPANY_TYPES`, `INDUSTRIES`, `EMPLOYEE_COUNTS`, `COMPANY_STATUSES`, `SPONSORSHIP_TIERS`)

**Utils — `src/utils/v2/`**
- `jsonLdPreview.js`

**UI primitives — `src/Components/ui/`**
- `skeleton.jsx`
- `table.jsx`

**Helpers**
- `src/Helpers/relativeTime.js`

### 2.2 Modified files

| File | Change |
|---|---|
| `package.json` | Added `react-hook-form`, `zod`, `@hookform/resolvers` |
| `package-lock.json` | Lockfile sync for the new deps |
| `src/App.js` | Dropped legacy lazy imports & routes; repointed post-login redirect to `/admin/jobs` |
| `src/Components/Layout/AppLayout.jsx` | Sidebar nav URLs swapped to v2 (`/admin/jobs`, `/admin/jobs/new`, `/admin/companies`, `/admin/companies/new`); header link `/addjob` → `/admin/jobs` |
| `src/Components/Layout/AppHeader.jsx` | Breadcrumb `routeLabels` map repointed to v2; added regex labels for `/admin/jobs/:id/edit` and `/admin/companies/:id/edit`; "Home" link → `/admin/jobs` |
| `src/pages/SignIn/index.jsx` | Already-authed redirect target `/addjob` → `/admin/jobs` |
| `src/Apis/Company.js` | Removed `getCompanyList`, `deleteCompany`; kept `getCompanyDetailsHelper` (Banners) |
| `src/Helpers/apiEndpoints.js` | Removed legacy write keys (`addJobData`, `deleteJob`, `trackApplyClick`, `addCompanyDetails`, `updateCompanyDetails`, `deleteCompanyDetails`); kept `getAllJobDetails`, `updateJobDetails`, `getImagecdnUrl`, `getCompanyDetails` (still used by Scraper writeback / Banners / Canvas image upload) |
| `src/widgets/Addjobs/Helpers/index.js` | Removed `addJobDataHelper`, `updateJobDetails`, `generateLastDatetoApplyHelper`, `mapExperiencetoBatch`, `generateTagsfromRole`, internal `generateFormData`; kept `getJobDetailsHelper` (Banners) |

### 2.3 Deleted files

**Old job form & widget**
- `src/pages/AddJobs.jsx`
- `src/widgets/Addjobs/index.js`
- `src/widgets/Addjobs/Components/BackToDashboard.jsx`
- `src/widgets/Addjobs/Components/` (dir)
- `src/widgets/Addjobs/jobdataInfo.json`
- `src/widgets/Addjobs/Helpers/staticdata.js`

**Legacy job listing widget & inline edit modal**
- `src/widgets/Joblisting/index.jsx`
- `src/widgets/Joblisting/Components/EditData/EditData.jsx`
- `src/widgets/Joblisting/Components/AdminLinkCard/AdminLinkCard.jsx`
- `src/widgets/Joblisting/Components/EditData/`, `AdminLinkCard/`, `Components/`, `Joblisting/` (dirs)

**Old company form & listing widget**
- `src/pages/AddCompanyDetails.jsx`
- `src/widgets/CompanyDetails/CompanyDetails.jsx`
- `src/widgets/CompanyDetails/helper.js`
- `src/widgets/CompanyDetails/` (dir)
- `src/widgets/CompanyListing/index.jsx`
- `src/widgets/CompanyListing/` (dir)

**Legacy page wrappers**
- `src/pages/JobList.jsx`
- `src/pages/CompanyList.jsx`

**Demo & legacy fallback artifacts**
- `src/pages/V2ComponentsDemo.jsx`

**Optional cleanup (verified zero importers)**
- `src/Components/Header/index.jsx`
- `src/Components/Header/` (dir)

---

## 3. Routes

### 3.1 New admin routes

| Method | Path | Component |
|---|---|---|
| GET | `/admin/jobs` | `JobsListV2` |
| GET | `/admin/jobs/new` | `CreateJobV2` |
| GET | `/admin/jobs/:id/edit` | `EditJobV2` |
| GET | `/admin/companies` | `CompaniesListV2` |
| GET | `/admin/companies/new` | `CreateCompanyV2` |
| GET | `/admin/companies/:id/edit` | `EditCompanyV2` |

Post-sign-in redirect target: `/admin/jobs` (was `/addjob`).

### 3.2 Routes removed

- `/addjob`
- `/jobs`
- `/addcompany`
- `/companys`
- `/v2-components-demo`
- `/admin/jobs-legacy`
- `/admin/companies-legacy`

(All requests to these paths now fall through to the wildcard route and redirect to `/signin`.)

---

## 4. Environment variables

| Var | Status | Purpose |
|---|---|---|
| `REACT_APP_FRONTEND_URL` | **NEW (required)** | Base URL of the public job site (`careers-at-tech` repo). Used to render the public job URL on the edit page and to build the "Test on Google Rich Results" link. |
| `REACT_APP_BACKEND_URL` | unchanged | API base. v2 client appends `/api/admin/{jobs,companies}/v2` paths. |
| `REACT_APP_FIREBASE_*` | unchanged | Firebase Auth config — v2 client uses `await user.getIdToken()` for `Authorization: Bearer …` (replacing `x-api-key`). |
| `REACT_APP_API_KEY` | unchanged | Still attached by `Helpers/request.js` to the few read endpoints retained for Banners / Canvas. |
| `REACT_APP_ADMIN_EMAIL` | unchanged | Client-side admin gate (still TODO: replace with Firebase Custom Claims server-side). |

---

## 5. Smoke test results

The 10-step flow in the plan requires a live browser session, Firebase Google OAuth, the v2 admin backend (`/api/admin/jobs/v2`, `/api/admin/companies/v2`), Clearbit logo lookup, and a configured `REACT_APP_FRONTEND_URL`. Those interactions cannot be performed from a headless CLI, so steps 1–10 are reported as **BLOCKED (manual verification required)**. The CLI-verifiable signals all PASS.

| # | Step | Result | Notes |
|---|------|--------|-------|
| — | `npm run build` | PASS | Compiles clean. Pre-existing lint warnings (unused `DropdownMenuSeparator` in `AppLayout.jsx`, unused `Loader` in `SignIn/index.jsx`) only — none introduced by A8. |
| — | Dev server (`npm start`) | PASS | Webpack compiles with the same two warnings. App shell mounts and the title tag renders (`<title>Admin Panel | CareersatTech</title>`). |
| — | Route wiring (HTTP 200 on every v2 path) | PASS | `/`, `/signin`, `/admin/jobs`, `/admin/jobs/new`, `/admin/companies`, `/admin/companies/new` all serve the SPA shell. Deleted paths (`/addjob`, `/v2-components-demo`, `/admin/jobs-legacy`) also return 200 because CRA serves `index.html` for all paths; client-side router matches `*` and redirects to `/signin`. |
| — | Grep — no residual imports of deleted symbols/paths | PASS | Only residue: a stale comment in `src/widgets/Scraper/Staging/Helpers/index.js:28` referencing the deleted `widgets/Addjobs/index.js`. Comment-only, no runtime impact, out-of-scope module. |
| 1 | Sign in via `/signin` (Firebase popup) → redirect to `/admin/jobs` | BLOCKED | Cannot run Firebase OAuth from CLI. Code-level verification PASSES: `src/App.js:54` and `src/pages/SignIn/index.jsx:46` both target `/admin/jobs`. |
| 2 | `/admin/companies` list | BLOCKED | Requires auth + `listCompaniesV2` against live v2 backend. |
| 3 | `/admin/companies/new` → create company, Clearbit auto-fetch, redirect to edit | BLOCKED | Requires auth + Clearbit network call + live v2 backend. |
| 4 | `/admin/jobs` list | BLOCKED | Requires auth + `listJobsV2`. |
| 5 | `/admin/jobs/new` → create job, internal mode, all required fields | BLOCKED | Requires auth + live v2 backend. |
| 6 | "Publish" → `ReadinessIndicator` green, button enabled | BLOCKED | Requires Step 5. |
| 7 | "Test on Google Rich Results" opens Google's tool with public URL | BLOCKED | Requires `REACT_APP_FRONTEND_URL` configured + Step 5. |
| 8 | Public URL matches slug pattern | BLOCKED | Requires Step 7. |
| 9 | Delete test job (confirmation dialog) | BLOCKED | Requires Step 5. |
| 10 | Delete test company (no active jobs) | BLOCKED | Requires Step 9 cleanup. |

**Action for the admin running the manual smoke test:** ensure `REACT_APP_FRONTEND_URL` is set in `.env.local`, log in with the Firebase admin account, then walk steps 1–10 against a backend that exposes `/api/admin/jobs/v2` and `/api/admin/companies/v2`. Any step that fails should be filed as a follow-up bug — none of them depend on legacy code paths that were just removed.

---

## 6. What's next

### 6.1 Frontend repo (`careers-at-tech`)

The admin panel now produces v2 job records with stable slugs and a clean schema, but the public site needs to render them:

1. **`/jobs/[slug]` route** — server-rendered job detail page reading from the v2 jobs API.
2. **JSON-LD `JobPosting` injection** — emit structured data on every job page (title, description, datePosted, validThrough, hiringOrganization, employmentType, jobLocation, baseSalary, applicantLocationRequirements). Reuse the field shapes from `src/utils/v2/jsonLdPreview.js`.
3. **Sitemap** — auto-generate `/sitemap.xml` from the `/api/jobs/v2?status=published&limit=…` listing; ping Google when new jobs publish.
4. **Google Search Console** — submit the new sitemap, watch the rich-results report for invalid `JobPosting` entries.

### 6.2 Data backfill

Existing legacy `jd` records do not satisfy the v2 schema (no slug, employment-type strings differ, status enum is new). Two options:

- **Manual re-entry** — pick the still-relevant ~80 active postings from the legacy DB and re-create them in `/admin/jobs/new`. Lowest risk, suitable for the current backlog size.
- **One-time migration script** — server-side job that maps `jd` → `jobs_v2`. Required transforms: `slug = slugify(title + companyName + _id_suffix)`, `employmentType: jobtype` (normalize "Full-time" / "Internship" / "Contract"), `status = "published"` if `isActive`, else `"archived"`, `category` from `tags[0]`, drop the FormData-only `imagePath` if absent. Run as a dry-run report first; never blind-INSERT.

---

## 7. Known issues / follow-ups

- **Banners blocks final cleanup.** `src/pages/Banners/index.jsx` still imports `getCompanyDetailsHelper` from `src/Apis/Company.js` and `getJobDetailsHelper` from `src/widgets/Addjobs/Helpers/index.js`. Until Banners moves to the v2 read endpoints (or a dedicated banner-data hook), those two helper files cannot be deleted. Same story for `apiEndpoint.getAllJobDetails`, `apiEndpoint.getCompanyDetails`, `apiEndpoint.getImagecdnUrl`.
- **Scraper still writes via legacy endpoint.** `src/widgets/Scraper/Staging/Helpers/index.js:140` calls `apiEndpoint.updateJobDetails`. The Scraper module is owned separately; track for migration to the v2 admin client.
- **Stale comment.** `src/widgets/Scraper/Staging/Helpers/index.js:28` references the deleted `widgets/Addjobs/index.js`. Cosmetic only; clean up alongside the Scraper migration.
- **`CustomTextField` / `CustomButton` retained.** `SignIn`, `Searchbar`, `Canvas`, and the various Scraper/Blog/AdManager screens still use these legacy MUI-style wrappers. Replace alongside each respective module's v2 cleanup; not blocking A8.
- **Active-state highlighting in sidebar.** With nested URLs (`/admin/jobs/new` is a child of `/admin/jobs`), the existing `startsWith(item.url + "/")` rule lights up "Job Dashboard" and "Add Job" simultaneously when you're on `/admin/jobs/new`. Cosmetic; tighten to exact-match on the parent item if it bothers reviewers.
- **Theme drift.** `--primary` is still a vivid blue (`hsl(221.2 83.2% 53.3%)`) instead of the Neutral-theme near-black called for in `THEME_GUIDE.md`. Out of scope for A8 but flagged for a follow-up CSS pass.
- **Server-side admin gate still TODO.** `src/Context/userContext.js:34` notes the admin check should move to Firebase Custom Claims. v2 backend already validates the ID token, but role-based authorization is still client-side only.
