# A6 — Companies Listing v2 Page

Replaces the legacy card-based company listing with a server-paginated admin table at `/admin/companies` driven by `GET /api/admin/companies/v2`. Filters persist in the URL, per-row actions cover the day-to-day admin flow, and the legacy page stays reachable at `/admin/companies-legacy` until A9. Mirrors the A5 jobs-listing structure so both admin tables feel identical to operators.

The destructive action (Archive) hits `DELETE /api/admin/companies/v2/:id`. Unlike jobs, companies can have dependencies (open jobs / sponsorships), so the API may return **409 Conflict** — the dialog flips into a conflict state showing the server's reason instead of toasting and silently failing.

---

## Files created

| Path | Purpose |
|---|---|
| [src/pages/admin/companies-v2/CompaniesListV2.jsx](../src/pages/admin/companies-v2/CompaniesListV2.jsx) | Page shell. Header + filter bar + table + pagination footer. URL is the source of truth via `useSearchParams`; the fetch effect re-runs on any filter change. Defensive response parser tolerates `data` as array, `data.companies`, `data.items`, or `data.data` (backend list contract not yet pinned). |
| [src/pages/admin/companies-v2/components/CompaniesTable.jsx](../src/pages/admin/companies-v2/components/CompaniesTable.jsx) | Renders the table, the per-row Actions menu, and the Archive confirmation Dialog (with 409-conflict state). 5 skeleton rows during load. |
| [src/pages/admin/companies-v2/components/CompaniesFilters.jsx](../src/pages/admin/companies-v2/components/CompaniesFilters.jsx) | Filter bar: Search input (300ms debounce via `setTimeout` in a `useEffect`) + Status / Industry / Company-type Selects + "Clear filters" Button (rendered only when any filter is active). Receives `{ filters, onChange, onClear, hasActiveFilter }`; emits filter patches up to the page. Pulls `COMPANY_STATUSES`, `INDUSTRIES`, and `COMPANY_TYPES` from the existing form schema so the listing stays in sync if those enums evolve. |
| [src/pages/admin/companies-v2/components/CompanyStatusBadge.jsx](../src/pages/admin/companies-v2/components/CompanyStatusBadge.jsx) | `<Badge variant="outline">` with colored dot + label. Color map mirrors the `COMPANY_STATUSES` palette in [src/Components/forms/v2/StatusDropdown.jsx](../src/Components/forms/v2/StatusDropdown.jsx) (active=green, inactive=gray, archived=red) so badge ↔ select feel consistent. |

## Files modified

| Path | Change |
|---|---|
| [src/App.js](../src/App.js) | New lazy import `CompaniesListV2`. Two new routes inside the existing `<ProtectedRoute><AppLayout/>` block: `/admin/companies → CompaniesListV2` and `/admin/companies-legacy → CompanyList` (the existing v1 component, now reachable as a fallback). The original `/companys` route is left untouched and will be cleaned up in A9. |

---

## Routes

**Added:**

```
/admin/companies          → CompaniesListV2 (new)
/admin/companies-legacy   → CompanyList (legacy widget, transitional)
```

**Pre-existing, untouched:** `/admin/companies/new`, `/admin/companies/:id/edit`, `/companys` (legacy direct route, deletion deferred to A9).

---

## URL state contract

All filters round-trip through `useSearchParams`. The reader normalises missing params to safe defaults (`status`→`all`, `page`→`1`, `limit`→`20`); the writer drops any param that equals the default so URLs stay clean.

| Query param | Default (omitted) | Sent to API as |
|---|---|---|
| `search` | `""` | `search` |
| `status` | `all` | `status` |
| `industry` | `all` | `industry` |
| `companyType` | `all` | `companyType` |
| `page` | `1` | `page` |
| `limit` | `20` | `limit` |

`page` is auto-reset to 1 whenever a filter changes (unless the caller explicitly passes a `page` in the same patch — page-size changes do this). Search-input debouncing writes to the URL with `replace: true` to keep the back-button history clean.

---

## Behaviour notes

- **Auth.** Inherits Bearer ID-token from `apiV2` (A3) — no per-call code in this PR.
- **Fetch.** `listCompaniesV2(buildApiQuery(filters))` runs in a `useEffect` keyed on `[filters, reloadKey]`. Cancellation flag prevents stale writes if the user changes filters mid-flight.
- **Response parsing.** `parseCompaniesResponse(data)` accepts `data` as a bare array, or an object with `companies` / `items` / `data` arrays plus optional `total` / `totalCount` and `pages`. `totalPages` falls back to `Math.ceil(total / limit)` when `pages` is absent.
- **Loading state.** Table renders 5 `<TableRow>` skeletons inside the same column layout, so row heights don't jump when data lands.
- **Empty state.** When `companies.length === 0` and not loading, the table is replaced by a centered Card reading "No companies match your filters" with a ghost "Clear filters" Button (only when a filter is active).
- **Status badge.** `CompanyStatusBadge` mirrors the dot colors used by `StatusDropdown` (green / gray / red for active / inactive / archived).
- **Verified column.** Green `CheckCircle2` icon when `isVerified === true`, muted `—` otherwise.
- **Open jobs column.** Reads `company.openJobsCount` directly from the list response (server-derived). Falls back to `—` when the backend omits the field.
- **Per-row actions.** Three-dot `DropdownMenu` with:
  - **Edit** → `/admin/companies/{id}/edit`.
  - **View public page** → only rendered when `status === "active"` AND `slug` is set. Opens `${REACT_APP_FRONTEND_URL || "https://careersat.tech"}/companies/{slug}` in a new tab with `noopener,noreferrer`.
  - **Archive** (destructive item) → opens a local `Dialog`. See conflict handling below.
- **Archive flow with 409 handling.** `deleteCompanyV2(id)` returns `{ status, error }`:
  - `200`/`204` → success toast, dialog closes, parent `reloadKey` bumps so the list refetches.
  - `409` → dialog flips to a **conflict state**: title becomes "Cannot archive {companyName}", body shows the server's `error.message` (string-or-object tolerant), footer has a single "Close" button. Fallback copy when the server returns no message: *"This company has active jobs or other dependencies. Resolve them before archiving."*
  - Any other non-2xx → error toast, dialog stays in confirm state so the operator can retry.

---

## Out of scope (intentional)

- **Bulk archive / multi-select** — no checkbox column. If reintroduction is needed later, this is the place to layer it in (`<TableHead>` checkbox column + a footer toolbar).
- **Column sorting** — backend hasn't documented a `sort` param; deferred.
- **Active-jobs preview list inside the 409 dialog** — we surface only the server's message, not a drill-in. Operators can navigate to `/admin/jobs?companyId=…` if needed.
- **Duplicate action** — A5 had it for jobs; intentionally omitted here per task scope.
- **Removing the legacy `/companys` route** — deferred to A9 alongside the broader v1 cleanup.

---

## Backend contract assumptions

`GET /api/admin/companies/v2` is treated as a generic query endpoint that accepts `search`, `status`, `industry`, `companyType`, `page`, `limit` and returns either a raw array or `{ companies|items|data, total|totalCount, pages? }`. None of these params are required by the client wrapper (`buildQueryString` strips empties), so unknown params are silently ignored by the backend. The exact response shape can be tightened once the v2 list contract lands — the parser already accepts the most common envelopes.

`DELETE /api/admin/companies/v2/:id` is expected to return `409` when the company has dependencies (active jobs, sponsorships, etc.). The error body is parsed by the v2 client into `res.error`, which can be either a string or `{ message }`; the table tolerates both.

`openJobsCount` is read straight off the list-response item. If the backend doesn't yet emit it, the column shows `—` and no separate fetch fan-out is performed.

---

## Verification checklist

1. `npm start`, sign in.
2. `/admin/companies` — table loads with first page of v2 companies, filters at top, "Add company" CTA on the right.
3. Type in Search — after 300ms, URL updates with `?search=…`, list refetches; back button does not stack each keystroke.
4. Pick Status="Active", Industry="Fintech", Type="startup" — URL reflects all params, list filters; reload restores filters from URL.
5. Click "Clear filters" — filter chips reset, URL stripped of filter params, list refetches.
6. Click a company name — navigates to `/admin/companies/{id}/edit`.
7. Open actions on an active company with a slug — see Edit / View public page / Archive. On an inactive or archived company (or one without a slug), View public page is hidden.
8. View public page opens `https://careersat.tech/companies/{slug}` in a new tab.
9. Archive on a company with no open jobs → confirm in dialog → row disappears, toast shown, list refetches.
10. Archive on a company with open jobs → backend returns 409 → dialog flips to conflict state showing the server message; only "Close" button visible; clicking Close dismisses the dialog.
11. Verified column shows a green check on verified rows, muted `—` on others.
12. Open jobs column shows numeric count when `openJobsCount` is present, `—` otherwise.
13. Page-size Select to 50 → list refetches with `limit=50`, `page` resets to 1.
14. Previous / Next buttons disable correctly at page boundaries; "Page X of Y" updates.
15. With no results, the empty state Card renders with a working "Clear filters" shortcut (only when a filter is active).
16. `/admin/companies-legacy` still loads the old card-based widget (deletion in A9).
17. Toggle dark mode — table, badges, skeletons, dialog all remain legible.

---

## Build

`npm run build` succeeds with no new warnings introduced from the A6 files (existing project-wide ESLint warnings unchanged).
