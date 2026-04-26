# A3 — JobV2 Create / Edit Form

Wires the V2 form primitives from A2 into a real Create/Edit flow against the new `/api/admin/jobs/v2` endpoints. Old routes (`/addjob`, `/jobs`) are still mounted; their removal is deferred to A8.

---

## Files created

| Path | Purpose |
|---|---|
| [src/api/v2/client.js](../src/api/v2/client.js) | Shared fetch wrapper for v2. Attaches `Authorization: Bearer <firebaseIdToken>` from `auth.currentUser.getIdToken()`. Returns `{ status, data, error }` so callers can branch on 400/409/404 without re-parsing. No auto-toasts. Supports GET / POST / PATCH / DELETE. Includes a `buildQueryString(query)` helper. |
| [src/api/v2/jobs.js](../src/api/v2/jobs.js) | Domain client: `createJobV2`, `updateJobV2`, `fetchJobV2`, `deleteJobV2`, `listJobsV2`. Base URL `/api/admin/jobs/v2`. |
| [src/api/v2/companies.js](../src/api/v2/companies.js) | `listCompaniesV2({ limit, search })` — used by the company picker. Will be extended in A5. |
| [src/validators/v2/jobFormSchema.js](../src/validators/v2/jobFormSchema.js) | Zod schema + enum constants + `defaultJobValues()` + `mapJobResponseToFormValues()` + `extractDirtyValues()`. Conditional rule via `superRefine`: `jobDescription.html` is required when `displayMode === 'internal'`. Cross-field rule: `experience.max ≥ experience.min`. |
| [src/Components/forms/v2/CompanyAsyncSelect.jsx](../src/Components/forms/v2/CompanyAsyncSelect.jsx) | Searchable Popover + scrollable filtered list. Lazy-fetches once via `listCompaniesV2({ limit: 100 })` on first open. Selecting a row writes both `company` (id) and `companyName` to RHF. |
| [src/Components/forms/v2/TagInput.jsx](../src/Components/forms/v2/TagInput.jsx) | RHF-controlled chip input. Enter / comma to add, Backspace on empty draft to remove last, click `×` per chip. Optional `suggestions` prop drives a popover-style autocomplete list. Used 4×: `degree`, `requiredSkills`, `preferredSkills`, `topicTags`. |
| [src/Components/forms/v2/RichTextEditor.jsx](../src/Components/forms/v2/RichTextEditor.jsx) | Thin `useController` wrapper around the existing `@ckeditor/ckeditor5-react`. Re-uses [src/Config/editorConfig.js](../src/Config/editorConfig.js). Passes `config` as a prop instead of mutating `ClassicEditor.defaultConfig` (the legacy [CkEditor.jsx](../src/Components/CkEditor/CkEditor.jsx) is left untouched). |
| [src/Components/forms/v2/DisplayModeRadio.jsx](../src/Components/forms/v2/DisplayModeRadio.jsx) | Two clickable cards (`internal` / `external_redirect`) with `role="radiogroup"` semantics. No new Radix dep — see deviation #1. |
| [src/pages/admin/jobs-v2/JobFormV2.jsx](../src/pages/admin/jobs-v2/JobFormV2.jsx) | Shared form. 12 sections, sticky footer, dirty-diff PATCH submit, server-error mapping, delete confirmation Dialog. Skill autocomplete fetched once on mount via `listJobsV2({ limit: 0 })`. |
| [src/pages/admin/jobs-v2/CreateJobV2.jsx](../src/pages/admin/jobs-v2/CreateJobV2.jsx) | Renders `<JobFormV2 mode="create" initialValues={defaultJobValues()} />`. |
| [src/pages/admin/jobs-v2/EditJobV2.jsx](../src/pages/admin/jobs-v2/EditJobV2.jsx) | Reads `:id` from `useParams`, fetches via `fetchJobV2`, shows `Skeleton` while loading, `NotFound` empty-state for 404/error, otherwise renders `<JobFormV2 mode="edit" jobId={id} initialValues={…}/>`. |

## Files modified

| Path | Change |
|---|---|
| [src/App.js](../src/App.js) | Added 2 lazy imports + 2 `<Route>` entries inside the existing `<ProtectedRoute><AppLayout/>` block. No other lines touched. |

---

## Routes

**Added:**

```
/admin/jobs/new       → CreateJobV2
/admin/jobs/:id/edit  → EditJobV2
```

**Still mounted (deletion deferred to A8):** `/addjob`, `/jobs`, `/v2-components-demo`, plus all other legacy admin routes.

---

## Form state at a glance

### Empty state — `/admin/jobs/new`

Page header on the left reads **"Create job"** (`text-2xl font-semibold tracking-tight`) with a one-line muted helper underneath. Top-right corner shows the `<ReadinessIndicator>` badge in red (`border-red-500 text-red-600`) with `<AlertCircle>` icon and the label **"Missing fields"**. Clicking it pops a list of every required field that's still empty.

Below the header sits a stack of 12 `<Card>` blocks separated by `space-y-6`:

1. **Basics** — empty Title input, "Select a company" trigger button, disabled placeholder Company name input ("Auto-filled from selected company"), DisplayModeRadio with the **"Show on CareersAt.Tech"** card highlighted (default `internal`), empty Apply link input.
2. **Classification** — five greyed-out `EmploymentTypeMultiSelect` chips, two empty Selects ("Select category" / "Select work mode") side-by-side at md+.
3. **Eligibility** — full row of greyed-out `BatchYearChips`, an empty TagInput for Degree, two side-by-side number inputs (Min / Max experience).
4. **Location** — a single empty `JobLocationRepeater` row with city / region / country empty + a "Remote" preset button.
5. **Compensation** — `SalaryFields` showing `INR / 0 / 0 / Year` defaults.
6. **Description** — visible (default mode is internal). Empty CKEditor with a muted helper line "Tip: Use clear headings for Responsibilities, Requirements, and Benefits."
7. **Skills & Tags** — three empty TagInputs.
8. **Apply platform** — empty Select.
9. **Dates** — Date posted prefilled to today (e.g. `2026-04-25`), Application deadline empty.
10. **Lifecycle** — `StatusDropdown` showing **Draft** with grey dot, unchecked **Verified job** checkbox.
11. **SEO** — collapsed by default (`SeoSection`'s built-in collapsible header).
12. **Slug** — empty input next to a "Regenerate" button. Below it the muted preview line: `careersat.tech/jobs/`.

Sticky footer at the bottom (`fixed bottom-0 ... border-t bg-background`) shows two right-aligned buttons: **Save as Draft** (outline) and **Publish** (primary, **disabled**, with hover tooltip "Fill all required fields to publish"). Delete is not rendered (create mode).

### Filled state — `/admin/jobs/:id/edit`

Same layout, but populated. Page title reads **"Edit job"**, subhead reads **"Update fields and save. Only changed fields are sent."** Readiness badge in the top-right is green with `<CheckCircle2>` and label **"Ready for Google for Jobs"**.

- Title shows the job title; Company picker shows the selected company name; Company name input is auto-populated and disabled.
- DisplayModeRadio's selected card has `border-primary bg-primary/5` highlighting and a `<Check>` icon top-right of the chosen option.
- EmploymentTypeMultiSelect shows the selected types as filled chips; BatchYearChips show selected years filled.
- JobLocationRepeater renders one or more populated rows with trash icons.
- SalaryFields reformats the min/max on blur (e.g. `1200000` → `12,00,000`).
- If the user dirties the slug, an amber line **"Changing the slug will break existing URLs."** appears under it (driven by `SlugField`'s `mode="edit"` warning).
- Skills & Tags chips render; typing in `Required skills` triggers a dropdown of cached unique values from the rest of the catalog (deduped against current chips).
- Sticky footer now shows **Delete** (destructive, left) on the far left, plus **Save as Draft** (outline) and **Publish** (primary, enabled because Readiness is green) on the right.
- Clicking Delete opens a centred Dialog: **"Delete this job?"** with body copy and Cancel / Delete buttons.

### Conditional Description

When the user flips DisplayModeRadio to **"Redirect directly to company career page"**, the entire Description card unmounts. Switching back re-mounts it with the same value (RHF retains the field state).

---

## Behaviour notes

- **Auth.** Every v2 fetch attaches `Authorization: Bearer <firebaseIdToken>` resolved from `auth.currentUser.getIdToken()`. Falls back to no-auth if the token is unavailable (caller handles the 401). The legacy [Helpers/request.js](../src/Helpers/request.js) is **not** touched — it still uses the static `x-api-key` header for legacy callers.
- **Create flow.** `POST /api/admin/jobs/v2` → 201/200 fires a success toast and `navigate('/admin/jobs/:id/edit', { replace: true })`. 400 maps `error.fieldErrors` (or `error.errors` / `error.details`) onto `setError(path, …)`. 409 fires a "Slug already taken — try regenerating" toast. Anything else fires a generic error toast.
- **Edit flow.** `extractDirtyValues(values, dirtyFields)` walks `dirtyFields` recursively and emits only the dirty subtree (whole arrays are sent if any element inside is dirty — RHF's standard behaviour). Empty diff fires an info toast and skips the request. Otherwise PATCH; on success `reset(values)` clears the dirty state. Same error branching as Create.
- **Delete flow.** Confirmation Dialog → `DELETE /api/admin/jobs/v2/:id`. On success navigates to `/admin/jobs` (note: the listing page lands in A5; until then `/admin/jobs` will fall through to the catch-all redirect to `/signin` while authenticated users may need to re-route manually — flagged inline in the source).
- **Skill suggestions.** `listJobsV2({ limit: 0 })` runs once on mount in `JobFormV2`. Failures are silently swallowed (suggestions stay empty); the field still works. The unique-skill set is cached in component state for the lifetime of the form.
- **Publish gating.** The Publish button uses `computeReadiness(readinessJob)` from the existing primitive — the form passes the same shape (`title`, `slug`, `company`, `employmentType`, `batch`, `validThrough`, `jobLocation`, `datePosted`, `displayMode`, `jobDescription`) that the primitive's `REQUIRED_FIELDS` list expects.

---

## Deviations from spec

1. **DisplayMode uses two clickable cards instead of a generic `RadioGroup` primitive.** No `radio-group.jsx` exists in [src/Components/ui/](../src/Components/ui/), and `@radix-ui/react-radio-group` isn't installed. Adding a Radix dep + shadcn primitive for one field is over-investment; the spec's UX is two labeled options with descriptions, which a card-button group with `role="radiogroup"` and `role="radio"` renders cleanly. Implemented as `DisplayModeRadio.jsx` colocated with the other v2 form primitives.
2. **Date inputs use plain `<input type="date">`.** Matches the existing demo. No date-picker library is installed; introducing one would be a separate decision out of scope for A3.
3. **Auth uses `Authorization: Bearer <firebaseIdToken>` (not `x-api-key`).** The spec said "match existing pattern" but the existing pattern is the legacy `x-api-key`, while the spec also explicitly required Firebase tokens. A1 audit §4.5 already flagged this swap as the v2 direction. Legacy [Helpers/request.js](../src/Helpers/request.js) is left untouched.
4. **PATCH support added in the v2 client only.** Legacy [Helpers/request.js](../src/Helpers/request.js) has no PATCH; rather than amend it, the new [src/api/v2/client.js](../src/api/v2/client.js) supports all four verbs cleanly.
5. **404 / fetch error on edit renders inline, not a dedicated 404 page.** Smaller blast radius; a global 404 route can come later if other pages need it.
6. **Delete navigates to `/admin/jobs`** even though that page doesn't exist until A5. There's an inline source comment marking the dependency. The legacy `/jobs` is still mounted as a temporary fallback.
7. **Empty `validThrough` warning is UI-only**, not a Zod failure — matches the spec's "show warning". Schema-level blocking would prevent saving drafts with missing dates, which the spec explicitly allows.
8. **Optional enum fields use `value || undefined` in the shadcn Select.** Radix `<Select>` cannot have value `""`; the form's defaults use `""` (clean for Zod / submit), so we coerce on render only. No data-shape implication.

---

## Verification

The dev server compiles cleanly with no warnings or errors from any file under `src/api/v2/`, `src/validators/v2/`, `src/Components/forms/v2/` (new files), or `src/pages/admin/jobs-v2/`. All pre-existing warnings in the build log are unchanged from before A3. Routes `/admin/jobs/new` and `/admin/jobs/:id/edit` are reachable behind the existing `ProtectedRoute` guard.

End-to-end submit testing (POST → 201 redirect, PATCH → dirty diff, DELETE → confirm → redirect, plus error branches) requires a live `/api/admin/jobs/v2` backend and is left for the integration smoke test.
