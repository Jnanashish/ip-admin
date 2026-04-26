# A2 — V2 Form Primitives

> Built the 8 shared form primitives that v2 Add-Job and Add-Company forms (A4–A6) will compose from.
> Date: 2026-04-25.

## Files created

All primitives live under `src/components/forms/v2/`. (On macOS APFS — case-insensitive — the directory resolves to the existing `src/Components/forms/v2/`. On a case-sensitive Linux CI filesystem the lowercase path would create a sibling folder; imports in this repo use the capital-`C` `Components/...` form to match the on-disk casing. Flag for A8 cleanup.)

| File | Purpose |
|---|---|
| [src/components/forms/v2/SlugField.jsx](src/components/forms/v2/SlugField.jsx) | Auto-generating URL slug input with regenerate button, edit-mode warning, and live preview. Exports `validateSlug` (mirrors backend regex `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`). |
| [src/components/forms/v2/BatchYearChips.jsx](src/components/forms/v2/BatchYearChips.jsx) | Toggle chips for graduation years with From/To range-fill helper. |
| [src/components/forms/v2/EmploymentTypeMultiSelect.jsx](src/components/forms/v2/EmploymentTypeMultiSelect.jsx) | 5 fixed enum chips (FULL_TIME, PART_TIME, CONTRACTOR, INTERN, TEMPORARY). |
| [src/components/forms/v2/SalaryFields.jsx](src/components/forms/v2/SalaryFields.jsx) | Compensation card with currency / min / max / unit; Indian thousands grouping on blur. |
| [src/components/forms/v2/JobLocationRepeater.jsx](src/components/forms/v2/JobLocationRepeater.jsx) | `useFieldArray`-backed repeater of `{ city, region, country }` with Indian-states dropdown and Remote pre-fill. |
| [src/components/forms/v2/StatusDropdown.jsx](src/components/forms/v2/StatusDropdown.jsx) | Job/company status select with colored dots per option. |
| [src/components/forms/v2/SeoSection.jsx](src/components/forms/v2/SeoSection.jsx) | Collapsible card with metaTitle / metaDescription / ogImage, char counters, auto-fill, og preview. |
| [src/components/forms/v2/ReadinessIndicator.jsx](src/components/forms/v2/ReadinessIndicator.jsx) | Badge + popover summarising Google-for-Jobs readiness. Exports `computeReadiness(job)`. |
| [src/pages/V2ComponentsDemo.jsx](src/pages/V2ComponentsDemo.jsx) | Demo page wiring all 8 primitives into one `useForm`. |
| [src/App.js](src/App.js) | Added lazy import + route `/v2-components-demo`. |

Dependencies added to [package.json](package.json):

- `react-hook-form` `^7.73.1`
- `zod` `^4.3.6` (installed but not yet consumed by v2 primitives — will be used by A4/A5 form schemas)
- `@hookform/resolvers` `^5.2.2`

## Props API

### SlugField
| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | string | — | RHF field name |
| `control` | RHF `control` | — | from `useForm` |
| `autoGenerateFrom` | object | — | watched values, e.g. `{ companyName, title }` |
| `generate` | `(autoGenerateFrom) => string` | — | slug generator |
| `mode` | `'create' \| 'edit'` | `'create'` | edit-mode disables auto-regen and shows amber warning when slug becomes dirty |
| `previewPrefix` | string | `'careersat.tech/jobs/'` | shown beneath the input |
| `disabled` | boolean | `false` | |

### BatchYearChips
| Prop | Type | Default |
|---|---|---|
| `name` | string | — |
| `control` | RHF `control` | — |
| `minYear` | number | `2024` |
| `maxYear` | number | `2030` |

Value shape: `number[]`. Validation: at least one year selected.

### EmploymentTypeMultiSelect
| Prop | Type |
|---|---|
| `name` | string |
| `control` | RHF `control` |

Value shape: `string[]` of enum keys. Validation: at least one selected.

### SalaryFields
| Prop | Type |
|---|---|
| `name` | string (manages `${name}.{currency,min,max,unitText}` as a single object value) |
| `control` | RHF `control` |

Value shape: `{ currency: 'INR' \| 'USD' \| 'EUR' \| 'GBP', min: string, max: string, unitText: 'YEAR' \| 'MONTH' \| 'WEEK' \| 'DAY' \| 'HOUR' }`. Cross-field validation: min ≤ max.

### JobLocationRepeater
| Prop | Type |
|---|---|
| `name` | string |
| `control` | RHF `control` |

Value shape: `Array<{ city: string, region: string, country: string }>`. Default country `IN`.

### StatusDropdown
| Prop | Type | Default |
|---|---|---|
| `name` | string | — |
| `control` | RHF `control` | — |
| `variant` | `'job' \| 'company'` | `'job'` |

Job options: draft, published, paused, expired, archived. Company options: active, inactive, archived.

### SeoSection
| Prop | Type | Default |
|---|---|---|
| `name` | string (manages `${name}.{metaTitle,metaDescription,ogImage}`) | — |
| `control` | RHF `control` | — |
| `autoFillFrom` | `{ title, companyName, batch, location }` | `{}` |

Exports pure helpers `makeMetaTitle(autoFillFrom)` and `makeMetaDescription(autoFillFrom)`.

### ReadinessIndicator
| Prop | Type |
|---|---|
| `job` | current form values object |

Required keys (always): `title`, `slug`, `company`, `employmentType[]`, `batch[]`, `validThrough`, `jobLocation[]`, `datePosted`. If `job.displayMode === 'internal'`, also requires `job.jobDescription.html`. Exports `computeReadiness(job)` returning `{ ready: boolean, missing: string[] }`.

## Demo route

[/v2-components-demo](http://localhost:3000/v2-components-demo) — added in [src/App.js](src/App.js) alongside the existing `lazy()` imports, mounted inside the protected `<AppLayout>` block. Will be deleted in A8.

## Demo page screenshot description

The page renders inside the standard sidebar+header `AppLayout` with a max-width 4xl content column. Top of the page shows the section title "V2 Form Primitives — Demo" in 24px semibold, with a one-line muted description under it. Anchored top-right is the `ReadinessIndicator` badge — initially red ("Missing fields") because the seed form is empty.

Below that, the form is a vertical stack of `Card`-wrapped sections, separated by `gap-6`:

1. **Seed inputs** — a 2-column grid with Job title, Company name, Date posted, Valid through. These drive auto-generation in downstream cards.
2. **SlugField** — single input with a "Regenerate" outline button on its right. Beneath the input: a monospace muted line `careersat.tech/jobs/<slug>`. As the user types in the seed inputs above, the slug auto-fills after a 300ms debounce (e.g. typing "Frontend Engineer" + "Acme" produces `frontend-engineer-acme`).
3. **BatchYearChips** — a row of 7 pill-shaped chips (2024–2030), each toggleable, with a small From/To select pair and a "Fill range" button below.
4. **EmploymentTypeMultiSelect** — 5 pill-shaped chips: Full-time, Part-time, Contract, Internship, Temporary.
5. **SalaryFields** — its own subcard ("Compensation" muted-grey title) with a 4-column grid: Currency select, Min input, Max input, Per select.
6. **JobLocationRepeater** — empty state message "No locations added" until "Add location" / "Remote" buttons are clicked. Each row is a 3-column grid of City / Region / Country plus a trash icon.
7. **StatusDropdown ×2** — two dropdowns side-by-side (job + company variants). Each option shows a small colored dot to the left of its label.
8. **SeoSection** — a collapsed `Card` with "SEO & Meta" muted header and a chevron toggle on the right. When expanded, three fields stack vertically: Meta title (with char counter "0/60"), Meta description (textarea, "0/160"), OG image URL (with thumbnail preview when valid). Each text field has a "Reset to auto-generated" ghost button.

A right-aligned primary "Log values to console" submit button sits at the bottom.

The `ReadinessIndicator` badge at the top updates live as fields are filled — flips from red `Missing fields` to green `Ready for Google for Jobs` once all 8 required fields are present. Click the badge to pop a list of remaining missing labels.

## Compile verification

`CI=false npm run build` → "Compiled with warnings". Zero warnings come from `src/Components/forms/v2/*` or `src/pages/V2ComponentsDemo.jsx`; all reported warnings pre-exist in other files. The dev server bundles without runtime errors.

## End-to-end smoke checklist (run manually)

1. `npm start`, sign in, navigate to `/v2-components-demo`.
2. Type "Frontend Engineer" + "Acme Corp" in seed → slug fills `frontend-engineer-acme` after ~300ms; preview shows `careersat.tech/jobs/frontend-engineer-acme`. Type a capital → forced lowercase. Type `bad slug!` → red error.
3. Pick batch year 2026 → highlights filled. Pick From=2025/To=2028, click Fill range → 2025/2026/2027/2028 all selected.
4. Submit with empty employment type → "Pick at least one employment type" error.
5. Salary min=200000, max=100000 → "Min must be ≤ Max". Enter 1200000 in min → blur → renders `12,00,000`.
6. Add location → row appears. Click Remote → city pre-filled with `Remote`. Click trash icon → row removed.
7. Open job status dropdown → 5 colored dots visible (gray/green/yellow/orange/red).
8. Expand SEO card → counters tick as you type. Type 70+ chars in title → counter goes red and input border turns destructive. Click Reset → fills from current title+companyName.
9. With most fields empty, badge stays red. Fill all 8 required → flips green.

## Carry-over notes for A4–A8

- **Path casing landmine**: imports use `Components/forms/v2/...` (capital `C`). On Linux CI this is required; on macOS the directory was created via lowercase path due to APFS but resolves to the same on-disk dir. Don't author imports as `components/...` (lowercase) in any future v2 code.
- **`zod` is installed but not yet consumed**. A4 should add `jobV2Schema.ts`-equivalents and pass via `zodResolver(schema)` in `useForm`.
- **Slug regex** is duplicated against the backend. If the backend's `validateSlug` ever changes, update [src/components/forms/v2/SlugField.jsx](src/components/forms/v2/SlugField.jsx) `SLUG_REGEX` in lockstep.
- **Lucide v1.7.0 (old fork)** is fine for the icons used here (`RefreshCw`, `Plus`, `Trash2`, `ChevronDown`, `CheckCircle2`, `AlertCircle`). A separate dependency-bump task should consider upgrading to current `lucide-react`.
- **shadcn `Form` wrapper** was deliberately not introduced. Each primitive uses bare `useController` and renders its own `<Label>` + error `<p>`. A4 can either keep this style or layer in `<Form>` later — both are compatible.
- **Demo route** must be removed in A8 (`/v2-components-demo` route in [src/App.js](src/App.js), the `lazy()` import, and [src/pages/V2ComponentsDemo.jsx](src/pages/V2ComponentsDemo.jsx)).
