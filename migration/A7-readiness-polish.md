# A7 — Google for Jobs Readiness Polish on EditJobV2

> Adds verification helpers (Rich Results test + public preview), a per-field readiness checklist with one-click jumps to the relevant form section, and a dev-only "Copy as JSON-LD" helper. Edit page only — Create flow keeps the existing `<ReadinessIndicator>` badge unchanged.
> Date: 2026-04-25.

---

## Files created

| Path | Purpose |
|---|---|
| [src/utils/v2/jsonLdPreview.js](../src/utils/v2/jsonLdPreview.js) | Pure helper exporting `buildJobPostingJsonLd(job, frontendBaseUrl)`. Returns a plain object matching schema.org `JobPosting`, with `undefined` keys recursively stripped. Mirrors what the public site renders so operators can paste the output into Google's Rich Results validator without first deploying. |
| [src/Components/forms/v2/ReadinessChecklist.jsx](../src/Components/forms/v2/ReadinessChecklist.jsx) | New `<Card>` rendered below the Lifecycle section in edit mode. Lists 7 required + 2 optional Google-for-Jobs fields, each with a green/amber icon and (for missing required fields) a "Fix" link that scrolls the matching `<Card>` into view. Footer hosts the "Copy as JSON-LD" ghost button. |

## Files modified

| Path | Change |
|---|---|
| [src/pages/admin/jobs-v2/JobFormV2.jsx](../src/pages/admin/jobs-v2/JobFormV2.jsx) | Top-of-file `FRONTEND_URL` const (mirrors the pattern in `JobsTable.jsx`). Added `ExternalLink` icon import + `ReadinessChecklist` import. Header right-cluster expanded to a flex column: in edit mode, "Test on Google Rich Results" + "Preview on site" outline buttons stack above the existing readiness badge. New `handleJumpToSection(id)`, `openRichResultsTest`, `openPreview` handlers. `id="section-basics"`, `section-classification`, `section-location`, `section-description`, `section-dates` added to the 5 relevant `<Card>` blocks as scroll anchors. `<ReadinessChecklist>` mounted directly after the Lifecycle `<Card>`, gated on `mode === "edit"`. No other lines touched. |

---

## Header buttons — enable / disable rules

Both buttons render only in `mode === "edit"` and stack horizontally above the readiness badge.

| Button | Enabled when | Disabled tooltip |
|---|---|---|
| **Test on Google Rich Results** | `status === "published"` AND `slug` non-empty | Draft job → "Publish the job first". Published but no slug → "Save with a slug first". |
| **Preview on site** | `status === "published"` AND `slug` non-empty | Same disabled rules as above. |

`Test on Google Rich Results` opens `https://search.google.com/test/rich-results?url=<encoded public URL>` in a new tab. `Preview on site` opens `<FRONTEND_URL>/jobs/<slug>` directly. Both use `window.open(target, "_blank", "noopener")`.

`FRONTEND_URL` resolves to `process.env.REACT_APP_FRONTEND_URL` with a `https://careersat.tech` fallback — same constant pattern already used by [src/pages/admin/jobs-v2/components/JobsTable.jsx](../src/pages/admin/jobs-v2/components/JobsTable.jsx).

---

## Checklist fields

The required list is sourced from the Google for Jobs structured-data spec (the user-provided contract). It deliberately differs from the badge's required-field list (which gates the **Publish** button and includes `slug` and `batch` in addition).

### Required (renders icon + label + optional Fix link)

| Label | Predicate | Scroll target |
|---|---|---|
| Title | `!isEmpty(job.title)` | `section-basics` |
| Company | `!isEmpty(job.company)` | `section-basics` |
| Employment type | `job.employmentType?.length > 0` | `section-classification` |
| Date posted | `!isEmpty(job.datePosted)` | `section-dates` |
| Valid through | `!isEmpty(job.validThrough)` | `section-dates` |
| Location | `job.jobLocation?.length > 0` | `section-location` |
| Job description | `!isEmpty(job.jobDescription?.html)` | `section-description` |

`Job description` is conditional — only rendered when `job.displayMode === "internal"`. For `external_redirect` jobs the description lives on the redirect target, so we don't grade it here.

### Optional (no Fix link, muted helper text)

| Label | Predicate | Helper |
|---|---|---|
| Salary | `!isEmpty(baseSalary.min) \|\| !isEmpty(baseSalary.max)` | `optional, improves ranking` |
| SEO meta | `!isEmpty(seo.metaTitle) && !isEmpty(seo.metaDescription)` | `optional` |

### Fix-link scroll behavior

`handleJumpToSection(id)` does `document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })`. The five target `<Card>` blocks have stable `id` attributes — no portal/ref plumbing required. Guards against SSR by checking `typeof document !== "undefined"`.

---

## Component API

### `<ReadinessChecklist job onJumpToSection />`

| Prop | Type | Notes |
|---|---|---|
| `job` | object | Live form watch. Reads `title`, `company`, `employmentType[]`, `datePosted`, `validThrough`, `jobLocation[]`, `displayMode`, `jobDescription.html`, `baseSalary.{min,max}`, `seo.{metaTitle,metaDescription}`, `slug`, `companyName`, `companyDetails?` (consumed only by JSON-LD builder). |
| `onJumpToSection` | `(sectionId: string) => void` | Optional. When omitted, "Fix" links are not rendered. |

No exported helpers — the file is a single default-exported component.

### `buildJobPostingJsonLd(job, frontendBaseUrl)`

Pure function. Returns a plain object — caller is responsible for `JSON.stringify`. Output shape (keys with no value are stripped):

```jsonc
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Frontend Engineer",
  "description": "<p>About the role…</p>",
  "datePosted": "2026-04-25",
  "validThrough": "2026-05-30",
  "employmentType": ["FULL_TIME"],
  "hiringOrganization": {
    "@type": "Organization",
    "name": "Acme Corp",
    "sameAs": "https://acme.example",   // companyDetails.website if present
    "logo": "https://…/logo.png"        // companyDetails.logo if present
  },
  "jobLocation": [
    {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Bengaluru",
        "addressRegion": "Karnataka",
        "addressCountry": "IN"
      }
    }
  ],
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "INR",
    "value": {
      "@type": "QuantitativeValue",
      "minValue": 1500000,
      "maxValue": 2500000,
      "unitText": "YEAR"
    }
  },
  "url": "https://careersat.tech/jobs/frontend-engineer-acme",
  "identifier": { "@type": "PropertyValue", "name": "careersat.tech", "value": "frontend-engineer-acme" }
}
```

`description` falls back to `seo.metaDescription || title` when `displayMode !== "internal"` (external-redirect jobs don't carry HTML on our side). `baseSalary` is omitted entirely when both `min` and `max` are blank. `url` and `identifier` are omitted when no slug exists.

This is a **preview**, not the source of truth — the public site's renderer remains the contract for what Google sees in production. If they drift, update both.

---

## Page screenshot description (edit mode, published job)

The header row now reads: page title left, and on the right a vertical stack of (top) two outline buttons "Test on Google Rich Results" and "Preview on site" rendered side-by-side, each prefixed with a 4×4 `<ExternalLink>` icon, then (bottom) the existing green/red readiness badge. For a draft, both buttons render greyed out with `disabled` cursor and a hover tooltip explaining why.

The form body is unchanged through the first 10 sections. Immediately after the Lifecycle card a new `<Card>` titled **"Google for Jobs readiness"** appears, before the SEO and Slug cards. Inside it:

- Muted "Required" subhead, then 7 rows. Filled rows show `<CheckCircle2>` in green; missing rows show `<AlertCircle>` in amber followed by a small "Fix" link button. Clicking "Fix" smoothly scrolls the page to the related card.
- Muted "Optional, improves ranking" subhead, then 2 rows (Salary, SEO meta) with the same icon pattern but no Fix link — instead, a small muted caption ("optional, improves ranking" / "optional") sits to the right of the label.
- Right-aligned `<Button variant="ghost">` "Copy as JSON-LD" with a `<Code>` icon at the bottom of the card. Clicking writes the formatted JSON to the clipboard and shows a green toast "JSON-LD copied to clipboard".

In create mode, the new buttons and the checklist card do not render — the form looks identical to A3.

---

## Compile verification

`CI=false npm run build` → "Compiled with warnings". Warnings are in pre-existing files (`src/widgets/Blog/BlogListing/index.jsx`, `src/widgets/Joblisting/Components/EditData/EditData.jsx`); zero warnings come from any file touched in this change.

## Smoke checklist (run manually)

1. `npm start`, sign in, open an existing **draft** job at `/admin/jobs/:id/edit` → both header buttons disabled with tooltips. Checklist card shows whichever rows are missing.
2. Toggle Title empty → row flips amber + Fix appears. Click Fix → page scrolls to Basics card. Restore Title → row goes green + Fix disappears.
3. Switch `displayMode` to **External redirect** → "Job description" row disappears. Switch back → row returns.
4. Empty `baseSalary` → Salary row amber + "optional, improves ranking" muted helper. Fill min only → goes green. No Fix link in either state.
5. Publish the job (status `published`) and ensure a slug is set → header buttons enable. Click "Test on Google Rich Results" → opens `https://search.google.com/test/rich-results?url=<encoded URL>` in a new tab. Click "Preview on site" → opens the public job page.
6. Click "Copy as JSON-LD" → green toast. Paste into a scratch buffer → valid JSON, `@context: "https://schema.org"`, `@type: "JobPosting"`, no `undefined` values, salary block present iff min/max non-empty.
7. Open `/admin/jobs/new` → no header buttons, no checklist card; the existing badge is the only readiness UI (Create flow unchanged).

---

## Carry-over notes

- **Path casing**: import for the new component uses the capital-`C` `Components/forms/v2/ReadinessChecklist` form to match the on-disk casing convention from A2. The new helper imports as `utils/v2/jsonLdPreview` (lowercase `utils/`) since that directory was created lowercase.
- **Two readiness sources of truth**: the badge (`computeReadiness` from `ReadinessIndicator.jsx`) requires `slug` + `batch` to gate the Publish button; the new checklist follows the Google-for-Jobs spec from the task and excludes `slug`/`batch`. Kept separate intentionally — collapsing them would change Publish gating.
- **JSON-LD drift risk**: `buildJobPostingJsonLd` mirrors what we expect the public site to emit, but is not actually wired to it. If the backend's renderer changes shape (e.g. adds `directApply`, alters `jobLocationType` for remote), update [src/utils/v2/jsonLdPreview.js](../src/utils/v2/jsonLdPreview.js) in lockstep.
- **`watched` vs. `readinessJob`**: the checklist is fed `watched` directly (not the trimmed `readinessJob` memo used by the badge) so it can read `baseSalary`, `seo`, `companyDetails`, and `slug` for the JSON-LD preview without expanding the memo's projection.
