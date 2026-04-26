# A4 — CompanyV2 Create / Edit Form

Wires the V2 form primitives (A2) and the Bearer-auth fetch client (A3) into a real Create/Edit flow against the new `/api/admin/companies/v2` endpoints. The legacy `/addcompany` form is still mounted; deletion is deferred to A8.

---

## Files created

| Path | Purpose |
|---|---|
| [src/validators/v2/companyFormSchema.js](../src/validators/v2/companyFormSchema.js) | Zod schema + enum constants (`COMPANY_TYPES`, `INDUSTRIES`, `EMPLOYEE_COUNTS`, `COMPANY_STATUSES`, `SPONSORSHIP_TIERS`) + `defaultCompanyValues()` + `mapCompanyResponseToFormValues()`. Re-exports `extractDirtyValues` from `jobFormSchema`. `superRefine` rules: sponsorship.activeUntil required when tier !== 'none'; ratings clamped 0–5; foundedYear clamped 1800–currentYear. |
| [src/pages/admin/companies-v2/CompanyFormV2.jsx](../src/pages/admin/companies-v2/CompanyFormV2.jsx) | Shared form. 9 sections, sticky footer, dirty-diff PATCH submit, server-error mapping, two-stage Delete dialog (confirm → 409 block dialog with link to filtered jobs listing). |
| [src/pages/admin/companies-v2/CreateCompanyV2.jsx](../src/pages/admin/companies-v2/CreateCompanyV2.jsx) | Renders `<CompanyFormV2 mode="create" initialValues={defaultCompanyValues()} />`. |
| [src/pages/admin/companies-v2/EditCompanyV2.jsx](../src/pages/admin/companies-v2/EditCompanyV2.jsx) | Reads `:id`, fetches via `fetchCompanyV2`, shows `Skeleton` while loading, `NotFound` for 404/error, otherwise renders the form. Reads `openJobsCount` off the response and passes it as a prop. |

## Files modified

| Path | Change |
|---|---|
| [src/api/v2/companies.js](../src/api/v2/companies.js) | Added `fetchCompanyV2`, `createCompanyV2`, `updateCompanyV2`, `deleteCompanyV2`. Existing `listCompaniesV2` untouched. |
| [src/Components/forms/v2/SeoSection.jsx](../src/Components/forms/v2/SeoSection.jsx) | Added two optional props — `generateMetaTitle` and `generateMetaDescription` — that override the built-in `makeMetaTitle` / `makeMetaDescription` helpers when supplied. Three-line additive change; existing `JobFormV2` call site is unaffected. |
| [src/App.js](../src/App.js) | Two new lazy imports + two `<Route>` entries inside the existing `<ProtectedRoute><AppLayout/>` block. No other lines touched. |

---

## Routes

**Added:**

```
/admin/companies/new       → CreateCompanyV2
/admin/companies/:id/edit  → EditCompanyV2
```

**Still mounted (deletion deferred to A8):** `/addcompany`, `/companys`, plus all other legacy admin routes.

---

## Form sections

1. **Identity** — companyName, slug (`<SlugField>` with `previewPrefix="careersat.tech/companies/"`, no random suffix).
2. **Branding** — website, logo.icon (with **Auto-fetch from website** button → `https://logo.clearbit.com/${hostname}`), logo.banner (with 3:1 aspect-ratio preview when URL is valid), logo.iconAlt, logo.bgColor (paired native `<input type="color">` swatch + hex `<Input>`, both wired to the same RHF field).
3. **Content** — description.short (textarea with live `n/160` counter; over-limit turns destructive), description.long (`<RichTextEditor>` / CKEditor).
4. **Classification** — companyType, industry, tags, techStack.
5. **Meta** — foundedYear (number 1800–currentYear), employeeCount, headquarters, locations.
6. **External links** — careerPageLink, socialLinks.{linkedin,twitter,instagram,glassdoor} in a 2-col grid.
7. **Ratings** — ratings.glassdoor, ratings.ambitionBox (number, 0–5, step 0.1).
8. **Lifecycle** — `<StatusDropdown variant="company">`, openJobsCount badge (when set), isVerified checkbox, sponsorship.tier select; sponsorship.activeUntil date input mounts only when tier !== 'none'.
9. **SEO** — `<SeoSection>` with company-shaped meta-title / meta-description generators (override props), driven by `autoFillFrom={{ name: companyName }}`.

Sticky footer: **Save changes** primary button + **Delete** (destructive, edit only). No Publish gate.

---

## Behaviour notes

- **Auth.** Inherits Bearer ID-token from `apiV2` (A3) — no per-call code in this PR.
- **Create flow.** `POST /api/admin/companies/v2` → 201/200 fires a success toast and `navigate('/admin/companies/:id/edit', { replace: true })`. 409 maps the spec'd message to the slug field via `setError`. 400 walks `error.fieldErrors|errors|details`. Anything else fires a generic toast.
- **Edit flow.** `extractDirtyValues(values, dirtyFields)` walks `dirtyFields` recursively and emits only the dirty subtree. Empty diff fires an info toast and skips the request. **Sponsorship special case:** if `dirtyFields.sponsorship.tier` is set, we force-include the full `sponsorship` object so a `tier → none` transition clears `activeUntil` server-side even when the date field itself isn't dirty.
- **Delete flow.** Confirmation Dialog → `DELETE /api/admin/companies/v2/:id`. On 200/204 → success toast → navigate `/admin/companies` (with the same TODO comment as A3 — listing v2 not built yet). On 409 → close confirm dialog and open a second "Cannot delete" dialog reading `error.activeJobsCount` (or `count`) with a "View jobs" link to `/admin/jobs?company=${id}`.
- **openJobsCount** is server-derived and **not** part of the schema. `EditCompanyV2` reads it off the GET response and passes it as a prop. The lifecycle section renders `"{N} active jobs reference this company."` only when the value is a non-negative number.
- **SEO defaults.** `metaTitle = ${companyName} — Careers & Jobs at CareersAt.Tech`. `metaDescription` prefers `description.short` if present, else falls back to `Find fresher tech jobs at ${companyName}. Apply for open roles at ${companyName} on CareersAt.Tech.`. Both are trimmed to 155 characters.

---

## Deviations from spec

1. **`description.long` uses CKEditor** (`RichTextEditor`), not a plain Textarea — matches the job form's `jobDescription.html` and lets admins write headings, bullets, and links. Spec allows either.
2. **SeoSection extended in place** rather than cloned. Three-line additive change; backward-compatible with the existing job form. Future entities can pass entity-shaped generators.
3. **Industry enum stores the spec's display labels** (`"Fintech"`, `"AI/ML"`, ...) as values directly, not snake-cased tokens. Avoids a token/label map and a backend-format guessing game. Re-evaluate if backend rejects them.
4. **Single "Save changes" button** on edit (no draft/publish split). Companies use the `status` enum directly; there's no Google-for-Jobs analog to gate publishing.
5. **No `<ReadinessIndicator>`** — companies have no readiness predicate.
6. **Sponsorship tier transition force-includes the full sponsorship object** in the PATCH payload (see Behaviour notes).
7. **Delete navigates to `/admin/companies`** even though that listing doesn't exist yet — matches the A3 pattern (jobs same situation). Inline TODO comments mark the dependency.
8. **Date inputs use plain `<input type="date">`** (no date-picker library). Consistent with A2/A3.
9. **`openJobsCount` is a prop, not a schema field.** Including it in the schema would leak it into PATCH payloads.

---

## Verification

- `CI=false npm run build` → "Compiled with warnings". Zero new warnings come from any of `src/validators/v2/companyFormSchema.js`, `src/api/v2/companies.js`, `src/pages/admin/companies-v2/*.jsx`, or the modified `src/Components/forms/v2/SeoSection.jsx`. The single emitted warning (`'showErrorToast' is defined but never used` in `src/widgets/Blog/BlogListing/index.jsx`) pre-existed.
- Routes `/admin/companies/new` and `/admin/companies/:id/edit` are reachable behind the existing `ProtectedRoute` guard.

End-to-end submit testing (POST → 201 redirect, PATCH → dirty diff, DELETE → confirm → 200 redirect or 409 block dialog, plus error branches) requires a live `/api/admin/companies/v2` backend and is left for the integration smoke test. The plan file [you-are-working-in-velvety-eclipse.md](../../../.claude/plans/you-are-working-in-velvety-eclipse.md) lists the full smoke checklist.
