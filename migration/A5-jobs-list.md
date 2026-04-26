# A5 — Jobs Listing v2 Page

Replaces the legacy card-based job listing with a server-paginated admin table at `/admin/jobs` driven by `GET /api/admin/jobs/v2`. Filters persist in the URL, per-row actions cover the day-to-day admin flow, and the legacy page stays reachable at `/admin/jobs-legacy` until A8.

---

## Files created

| Path | Purpose |
|---|---|
| [src/pages/admin/jobs-v2/JobsListV2.jsx](../src/pages/admin/jobs-v2/JobsListV2.jsx) | Page shell. Header + filter bar + table + pagination footer. URL is the source of truth via `useSearchParams`; the fetch effect re-runs on any filter change. Defensive response parser tolerates `data` as array, `data.jobs`, `data.items`, or `data.data` (backend list contract not yet pinned). |
| [src/pages/admin/jobs-v2/components/JobsTable.jsx](../src/pages/admin/jobs-v2/components/JobsTable.jsx) | Renders the table, the per-row Actions menu, and the Archive confirmation Dialog. Owns the duplicate / archive / view-on-site behaviors. Skeleton rows during load; uses the new `Skeleton` and `Table` primitives. |
| [src/pages/admin/jobs-v2/components/JobsFilters.jsx](../src/pages/admin/jobs-v2/components/JobsFilters.jsx) | Filter bar: Search input (300ms debounce via `setTimeout` in a `useEffect`) + Status / Employment type / Batch Selects + Company Select + "Clear filters" Button (rendered only when any filter is active). Receives `{ filters, onChange, onClear, hasActiveFilter }`; emits filter patches up to the page. |
| [src/pages/admin/jobs-v2/components/CompanyFilterSelect.jsx](../src/pages/admin/jobs-v2/components/CompanyFilterSelect.jsx) | Filter-flavored variant of `CompanyAsyncSelect`. `Popover` + searchable list, lazy-loads via `listCompaniesV2({ limit: 100 })` on first open, has an "All companies" reset item. Plain `{ value, onChange }` props (no react-hook-form). |
| [src/pages/admin/jobs-v2/components/StatusBadge.jsx](../src/pages/admin/jobs-v2/components/StatusBadge.jsx) | `<Badge variant="outline">` with colored dot + label. Color map mirrors `JOB_STATUSES` in [src/Components/forms/v2/StatusDropdown.jsx](../src/Components/forms/v2/StatusDropdown.jsx) so the listing badge matches the form select. |
| [src/Components/ui/table.jsx](../src/Components/ui/table.jsx) | Standard shadcn table primitive (Table / Header / Body / Footer / Row / Head / Cell / Caption). Plain HTML elements with Tailwind styles — no `@tanstack/react-table` dependency added. |
| [src/Components/ui/skeleton.jsx](../src/Components/ui/skeleton.jsx) | One-line shadcn skeleton primitive (`animate-pulse rounded-md bg-muted`). |
| [src/Helpers/relativeTime.js](../src/Helpers/relativeTime.js) | `formatRelativeTime(input)` returning "just now" / "5 minutes ago" / "3 days ago" / "2 weeks ago" / "5 months ago" / "2 years ago". ~25 lines, no `dayjs` / `date-fns` added. |

## Files modified

| Path | Change |
|---|---|
| [src/pages/admin/jobs-v2/CreateJobV2.jsx](../src/pages/admin/jobs-v2/CreateJobV2.jsx) | Reads `useLocation().state?.duplicateFrom` and seeds the form with `{ ...defaultJobValues(), ...duplicateFrom }` when present. Falls back to `defaultJobValues()` for direct navigation. The duplicate payload is already stripped of `_id`/`id`/`slug`/`createdAt`/`updatedAt` upstream in `JobsTable.handleDuplicate`. |
| [src/App.js](../src/App.js) | New lazy import `JobsListV2`. Two new routes inside the existing `<ProtectedRoute><AppLayout/>` block: `/admin/jobs → JobsListV2` and `/admin/jobs-legacy → JobList` (the existing v1 component, now reachable as a fallback). The original `/jobs` route is left untouched and will be cleaned up in A8 alongside `/admin/jobs-legacy`. |

---

## Routes

**Added:**

```
/admin/jobs           → JobsListV2 (new)
/admin/jobs-legacy    → JobList (legacy widget, transitional)
```

**Pre-existing, untouched:** `/admin/jobs/new`, `/admin/jobs/:id/edit`, `/jobs` (legacy direct route, deletion deferred to A8).

---

## URL state contract

All filters round-trip through `useSearchParams`. The reader normalises missing params to safe defaults (`status`→`all`, `page`→`1`, `limit`→`20`); the writer drops any param that equals the default so URLs stay clean.

| Query param | Default (omitted) | Sent to API as |
|---|---|---|
| `search` | `""` | `search` |
| `status` | `all` | `status` |
| `employmentType` | `all` | `employmentType` |
| `batch` | `all` | `batch` |
| `companyId` | `all` | `companyId` |
| `page` | `1` | `page` |
| `limit` | `20` | `limit` |

`page` is auto-reset to 1 whenever a filter changes (unless the caller explicitly passes a `page` in the same patch — page-size changes do this). Search-input debouncing writes to the URL with `replace: true` to keep the back-button history clean.

---

## Behaviour notes

- **Auth.** Inherits Bearer ID-token from `apiV2` (A3) — no per-call code in this PR.
- **Fetch.** `listJobsV2(buildApiQuery(filters))` runs in a `useEffect` keyed on `[filters, reloadKey]`. Cancellation flag prevents stale writes if the user changes filters mid-flight.
- **Response parsing.** `parseJobsResponse(data)` accepts `data` as a bare array, or an object with `jobs` / `items` / `data` arrays plus optional `total` / `totalCount` and `pages`. `totalPages` falls back to `Math.ceil(total / limit)` when `pages` is absent.
- **Loading state.** Table renders 5 `<TableRow>` skeletons inside the same column layout, so the row heights don't jump when data lands.
- **Empty state.** When `jobs.length === 0` and not loading, the table is replaced by a centered Card reading "No jobs match your filters" with a ghost "Clear filters" Button (only when a filter is active).
- **Status badge.** `StatusBadge` mirrors the dot colors used by `StatusDropdown` (gray / green / yellow / orange / red for draft / published / paused / expired / archived) so badge ↔ select feel consistent.
- **Per-row actions.** Three-dot `DropdownMenu` with:
  - **Edit** → `/admin/jobs/{id}/edit`.
  - **View on site** → only rendered when `status === "published"` AND `slug` is set. Opens `${REACT_APP_FRONTEND_URL || "https://careersat.tech"}/jobs/{slug}` in a new tab with `noopener,noreferrer`.
  - **Duplicate** → `fetchJobV2(id)` → `mapJobResponseToFormValues` → strip `_id`/`id`/`slug`/`createdAt`/`updatedAt` → `navigate('/admin/jobs/new', { state: { duplicateFrom } })`. Toast on fetch error.
  - **Archive** (destructive item) → opens a local `Dialog`. On confirm: `deleteJobV2(id)` → success toast → trigger refetch via `setReloadKey(k => k + 1)`. Disables the buttons during the in-flight request.

---

## Out of scope (intentional)

- **Bulk WhatsApp / Telegram / website-link broadcasts** from the v1 listing — dropped per A1 §14 cleanup intent. If reintroduction is needed later, this is the place to layer it in (`<TableHead>` checkbox column + a footer toolbar).
- **Column sorting** — backend hasn't documented a `sort` param; deferred.
- **Table virtualization** — page size is capped at 100, plain DOM rendering is fine.
- **Tanstack Table** — not added; the list is server-driven and we don't need client-side row models.

---

## Backend contract assumptions

`GET /api/admin/jobs/v2` is treated as a generic query endpoint that accepts `search`, `status`, `employmentType`, `batch`, `companyId`, `page`, `limit` and returns either a raw array or `{ jobs|items|data, total|totalCount, pages? }`. None of these params are required by the client wrapper (`buildQueryString` strips empties), so unknown params are silently ignored by the backend. The exact response shape can be tightened once the v2 list contract lands — the parser already accepts the most common envelopes.

---

## Verification checklist

1. `npm start`, sign in.
2. `/admin/jobs` — table loads with first page of v2 jobs, filters at top, "Create new job" CTA on the right.
3. Type in Search — after 300ms, URL updates with `?search=…`, list refetches; back button does not stack each keystroke.
4. Pick Status="Published", Company="<one>", Batch="2026" — URL reflects all params, list filters; reload restores filters from URL.
5. Click "Clear filters" — filter chips reset, URL stripped of filter params, list refetches.
6. Click a job title — navigates to `/admin/jobs/{id}/edit`.
7. Open actions menu on a published job with a slug — see Edit / View on site / Duplicate / Archive. On a draft job (no slug), View on site is hidden.
8. View on site opens `https://careersat.tech/jobs/{slug}` in a new tab.
9. Duplicate → fetch loads the source job → navigates to `/admin/jobs/new` with form pre-filled (slug empty, dates re-defaulted, company carried over).
10. Archive → confirm in dialog → row disappears, toast shown, list refetches.
11. Page-size Select to 50 → list refetches with `limit=50`, `page` resets to 1.
12. Previous / Next buttons disable correctly at page boundaries; "Page X of Y" updates.
13. With no results, the empty state Card renders with a working "Clear filters" shortcut.
14. `/admin/jobs-legacy` still loads the old card-based widget (deletion in A8).
15. Toggle dark mode — table, badges, skeletons, popover all remain legible.

---

## Build

`npm run build` succeeds with no new warnings introduced from the A5 files (existing project-wide ESLint warnings unchanged).
