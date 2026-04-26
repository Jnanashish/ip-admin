# A1 — Admin Panel Audit Report

> Source-of-truth read-only audit produced for the **admin panel v2 migration** (prompt A1 of 8).
> Repo: `ip-admin` (CareersAtTech / JobsAtTech back-office). Date: 2026-04-25.
> No application code was modified by this prompt.

---

## 1. Project Structure

### 1.1 `src/` tree (3 levels deep)

```
src/
├── App.css
├── App.js
├── Backend.js
├── index.js
├── Apis/
│   ├── Blog.js
│   └── Company.js
├── Components/
│   ├── Blog/
│   ├── Button/
│   │   └── CustomButton.jsx
│   ├── Canvas/
│   │   ├── CareersAtTechBanner.jsx
│   │   ├── Carousel.jsx
│   │   ├── JobsAtTechBanner.jsx
│   │   ├── LinkedinBanner.jsx
│   │   ├── canvas.module.scss
│   │   └── index.js
│   ├── CkEditor/
│   │   └── CkEditor.jsx
│   ├── Divider/
│   │   └── Divider.jsx
│   ├── Header/
│   │   └── index.jsx
│   ├── Input/
│   │   └── Textfield.jsx
│   ├── Layout/
│   │   ├── AppHeader.jsx
│   │   └── AppLayout.jsx
│   ├── Loader/
│   │   └── index.jsx
│   ├── Searchbar/
│   │   └── index.jsx
│   └── ui/                ← shadcn/ui primitives (see §3)
├── Config/
│   ├── editorConfig.js
│   └── firebase_config.js
├── Context/
│   ├── userContext.js     ← AuthProvider
│   └── themeContext.js    (per CLAUDE.md — manages `class="dark"`)
├── Helpers/
│   ├── JobListHelper/
│   ├── Telegram/
│   ├── apiEndpoints.js
│   ├── cookieHelpers.js
│   ├── imageHelpers.js
│   ├── parseErrorResponse.js
│   ├── request.js         ← legacy backend fetch wrapper
│   ├── sanitize.js
│   ├── scraperApiEndpoints.js
│   ├── scraperRequest.js  ← scraper backend fetch wrapper
│   ├── textTransform.js
│   ├── toast.js
│   └── utility.js
├── Static/
│   └── Image/
├── hooks/
├── lib/
├── pages/
│   ├── AddCompanyDetails.jsx
│   ├── AddJobs.jsx
│   ├── Analytics.jsx
│   ├── Banners/
│   ├── Blogs/
│   ├── CompanyList.jsx
│   ├── JobList.jsx
│   ├── Scraper/
│   └── SignIn/
└── widgets/
    ├── Addjobs/
    │   ├── Components/BackToDashboard.jsx
    │   ├── Helpers/{index.js, staticdata.js}
    │   ├── jobdataInfo.json
    │   └── index.js
    ├── AdManager/
    ├── AdPopupType/
    ├── Analytics/
    ├── Blog/
    │   ├── BlogEditor/
    │   ├── BlogListing/
    │   └── BlogPreview/
    ├── CompanyDetails/
    │   ├── CompanyDetails.jsx
    │   └── helper.js
    ├── CompanyListing/
    │   └── index.jsx
    ├── Joblisting/
    │   ├── Components/AdminLinkCard/AdminLinkCard.jsx
    │   ├── Components/EditData/EditData.jsx
    │   └── index.jsx
    └── Scraper/
        ├── Dashboard/
        ├── Health/
        ├── Logs/
        ├── Staging/
        └── StagingDetail/
```

### 1.2 Entry point

[src/index.js](src/index.js)

```js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
```

`<App>` lives in [src/App.js](src/App.js) and wraps the tree in `BrowserRouter → AuthProvider → ThemeProvider → AppRoutes`.

### 1.3 Router setup

All routes are declared in [src/App.js:40-78](src/App.js#L40-L78). Pages are `lazy()`-imported. Authenticated routes are nested under `<ProtectedRoute><AppLayout/></ProtectedRoute>`.

| Path | Component | File |
|------|-----------|------|
| `/signin` | `Signin` (or redirect to `/addjob` if logged in) | [src/pages/SignIn/](src/pages/SignIn/) |
| `/addjob` | `Addjobs` | [src/pages/AddJobs.jsx](src/pages/AddJobs.jsx) → [src/widgets/Addjobs/index.js](src/widgets/Addjobs/index.js) |
| `/canvas` | `Banners` | [src/pages/Banners/index.jsx](src/pages/Banners/) |
| `/addcompany` | `AddCompanyDetails` | [src/pages/AddCompanyDetails.jsx](src/pages/AddCompanyDetails.jsx) → [src/widgets/CompanyDetails/CompanyDetails.jsx](src/widgets/CompanyDetails/CompanyDetails.jsx) |
| `/companys` | `CompanyList` | [src/pages/CompanyList.jsx](src/pages/CompanyList.jsx) → [src/widgets/CompanyListing/index.jsx](src/widgets/CompanyListing/index.jsx) |
| `/jobs` | `JobList` | [src/pages/JobList.jsx](src/pages/JobList.jsx) → [src/widgets/Joblisting/index.jsx](src/widgets/Joblisting/index.jsx) |
| `/admin/scraper` | `ScraperDashboard` | [src/pages/Scraper/Dashboard.jsx](src/pages/Scraper/) |
| `/admin/scraper/staging` | `ScraperStaging` | [src/pages/Scraper/Staging.jsx](src/pages/Scraper/) |
| `/admin/scraper/staging/:id` | `ScraperStagingDetail` | [src/pages/Scraper/StagingDetail.jsx](src/pages/Scraper/) |
| `/admin/scraper/logs` | `ScraperLogs` | [src/pages/Scraper/Logs.jsx](src/pages/Scraper/) |
| `/admin/scraper/health` | `ScraperHealth` | [src/pages/Scraper/Health.jsx](src/pages/Scraper/) |
| `/analytics` | `Analytics` | [src/pages/Analytics.jsx](src/pages/Analytics.jsx) |
| `/blogs` | `BlogList` | [src/pages/Blogs/BlogList.jsx](src/pages/Blogs/) |
| `/blogs/new` | `BlogEditor` | [src/pages/Blogs/BlogEditor.jsx](src/pages/Blogs/) |
| `/blogs/:id/edit` | `BlogEditor` | (same) |
| `/blogs/:id/preview` | `BlogPreview` | [src/pages/Blogs/BlogPreview.jsx](src/pages/Blogs/) |
| `/` | redirect → `/addjob` (auth) or `/signin` | — |
| `*` | redirect → `/signin` | — |

---

## 2. Dependencies

From [package.json](package.json):

### `dependencies`
| Package | Version |
|---|---|
| `@ckeditor/ckeditor5-build-classic` | `^41.4.2` |
| `@ckeditor/ckeditor5-react` | `^6.3.0` |
| `@emotion/react` | `^11.14.0` |
| `@emotion/styled` | `^11.14.0` |
| `@fontsource/geist-mono` | `^5.2.7` |
| `@fontsource/geist-sans` | `^5.2.5` |
| `@mui/icons-material` | `^5.17.0` |
| `@mui/material` | `^5.17.0` |
| `@radix-ui/react-avatar` | `^1.1.11` |
| `@radix-ui/react-checkbox` | `^1.3.3` |
| `@radix-ui/react-collapsible` | `^1.1.12` |
| `@radix-ui/react-dialog` | `^1.1.15` |
| `@radix-ui/react-dropdown-menu` | `^2.1.16` |
| `@radix-ui/react-label` | `^2.1.8` |
| `@radix-ui/react-popover` | `^1.1.15` |
| `@radix-ui/react-scroll-area` | `^1.2.10` |
| `@radix-ui/react-select` | `^2.2.6` |
| `@radix-ui/react-separator` | `^1.1.8` |
| `@radix-ui/react-slot` | `^1.2.4` |
| `@radix-ui/react-switch` | `^1.2.6` |
| `@radix-ui/react-tooltip` | `^1.2.8` |
| `@testing-library/jest-dom` | `^5.17.0` |
| `@testing-library/react` | `^13.4.0` |
| `@testing-library/user-event` | `^13.5.0` |
| `class-variance-authority` | `^0.7.1` |
| `clsx` | `^2.1.1` |
| `compressorjs` | `^1.2.1` |
| `dompurify` | `^3.3.3` |
| `firebase` | `^11.0.0` |
| `html-to-image` | `^1.11.11` |
| `lucide-react` | `^1.7.0` |
| `react` | `^18.3.1` |
| `react-dom` | `^18.3.1` |
| `react-markdown` | `^10.1.0` |
| `react-router-dom` | `^6.30.0` |
| `react-scripts` | `5.0.1` |
| `react-toastify` | `^11.0.0` |
| `recharts` | `^3.8.1` |
| `remark-gfm` | `^4.0.1` |
| `sass` | `1.77.6` |
| `tailwind-merge` | `^3.5.0` |
| `tailwindcss-animate` | `^1.0.7` |

### `devDependencies`
| Package | Version |
|---|---|
| `autoprefixer` | `^10.4.27` |
| `postcss` | `^8.5.8` |
| `tailwindcss` | `^3.4.19` |

### v2 migration flags

| Required for v2 | Installed? | Notes |
|---|---|---|
| `@radix-ui/*` (shadcn primitives) | ✅ | 14 packages installed (avatar, checkbox, collapsible, dialog, dropdown-menu, label, popover, scroll-area, select, separator, slot, switch, tooltip). **Missing**: `react-hover-card`, `react-toast` (sonner used instead is also missing), `react-radio-group`, `react-tabs`, `react-toggle`, `react-accordion`, `react-aspect-ratio`, `react-progress`, `react-slider`, `react-toggle-group`, `react-context-menu`, `react-menubar`, `react-navigation-menu` — install on demand as v2 forms need them. |
| `react-hook-form` | ❌ NOT installed | Forms today use plain `useState`. Needs install for v2. |
| `zod` | ❌ NOT installed | Needs install for v2. |
| `@hookform/resolvers` | ❌ NOT installed | Needs install (for `zodResolver`). |
| `sonner` | ❌ NOT installed | — |
| `react-toastify` | ✅ `^11.0.0` | Currently in use; v2 may keep it or swap to sonner. |
| `lucide-react` | ✅ `^1.7.0` | **Note: very old major (1.x).** Current upstream is `0.4xx.x`/recent — this is the old fork. Icons used today still work; bumping should be considered separately. |

---

## 3. Styling Conventions

### 3.1 Tailwind config

[tailwind.config.js](tailwind.config.js)

- `darkMode: "class"` (toggled by `<html class="dark">` from [src/Context/themeContext.js](src/Context/themeContext.js)).
- `content: ["./src/**/*.{js,jsx}"]`.
- Color tokens are mapped to **HSL CSS variables**: `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `card`, `popover`, `border`, `input`, `ring`, `sidebar.*`, `chart.1..5`. One legacy hex remains: `"header-blue": "#0069ff"` for Canvas banners only.
- `borderRadius`: `lg = var(--radius)`, `md = calc(var(--radius) - 2px)`, `sm = calc(var(--radius) - 4px)`.
- Custom screens: `xs:480, sm:600, md:768, lg:900, xl:1200` (note: project overrides default Tailwind breakpoints).
- `fontFamily.sans = "Geist Sans"`, `fontFamily.mono = "Geist Mono"`.
- Plugin: `tailwindcss-animate`.

CSS variables are defined in [src/App.css:5-40](src/App.css#L5-L40). The light-mode primary is `221.2 83.2% 53.3%` (a blue, not the Neutral-theme near-black called for in CLAUDE.md). **THEME_GUIDE.md likely flags this as a drift to fix during v2.**

### 3.2 shadcn/ui component folder

`src/Components/ui/`. Path alias `Components/ui/*` (note the capital `C`) — see imports across the codebase, e.g. [src/widgets/Addjobs/index.js:11-15](src/widgets/Addjobs/index.js#L11-L15).

Components present (21):
```
avatar.jsx       button.jsx     card.jsx      chart.jsx     checkbox.jsx
collapsible.jsx  dialog.jsx     dropdown-menu.jsx  input.jsx label.jsx
popover.jsx      scroll-area.jsx  select.jsx  separator.jsx  sheet.jsx
sidebar.jsx      switch.jsx     textarea.jsx  tooltip.jsx   badge.jsx
breadcrumb.jsx
```

**Likely missing (will need adding for v2 forms)**: `form.jsx` (shadcn react-hook-form wrapper), `toast`/`sonner.jsx`, `tabs.jsx`, `radio-group.jsx`, `command.jsx`, `calendar.jsx` + `date-picker`, `accordion.jsx`, `progress.jsx`, `table.jsx` (if rich tables are in scope), `skeleton.jsx`.

### 3.3 MUI usage

A grep for `@mui/material` / `@mui/icons-material` returned **one** file:

- [src/Components/Canvas/index.js](src/Components/Canvas/index.js) — Canvas banner generator.

All other application UI has migrated to shadcn. MUI is essentially a Canvas-only legacy island — keep until banners are reworked separately. (`@emotion/react` and `@emotion/styled` are kept as MUI peer deps.)

---

## 4. API Client Patterns

### 4.1 Mechanism

Native `fetch()` wrapped in thin module-level helpers — **no axios, no react-query, no SWR**. Two parallel wrappers exist:

- [src/Helpers/request.js](src/Helpers/request.js) — primary backend (`REACT_APP_BACKEND_URL`), exports `get`, `post`, `updateData` (PUT), `deleteData`. Auth = static `x-api-key` header from `REACT_APP_API_KEY`.
- [src/Helpers/scraperRequest.js](src/Helpers/scraperRequest.js) — scraper backend (`REACT_APP_SCRAPER_URL`), exports `scraperGet`, `scraperPost`, `scraperDelete`. Auth = static `x-admin-secret` header.

Base URL is centralised in [src/Backend.js](src/Backend.js):

```js
export const API = process.env.REACT_APP_BACKEND_URL;
```

Endpoint paths are centralised in [src/Helpers/apiEndpoints.js](src/Helpers/apiEndpoints.js) (legacy backend) and [src/Helpers/scraperApiEndpoints.js](src/Helpers/scraperApiEndpoints.js) (scraper).

### 4.2 Request wrapper (legacy backend) — full file

```js
// src/Helpers/request.js
import { API } from "../Backend";
import { showSuccessToast, showErrorToast } from "./toast";
import { parseErrorResponse } from "./parseErrorResponse";

const API_KEY = process.env.REACT_APP_API_KEY;
const REQUEST_TIMEOUT_MS = 30000;

const getAuthHeaders = () => ({ "x-api-key": API_KEY });

const withTimeout = (promise, controller) => {
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    return promise.finally(() => clearTimeout(timer));
};

const labelFor = (name) => (name ? name : "Request");

export const post = async (url, body, apiname) => {
    const controller = new AbortController();
    try {
        const isFormData = body instanceof FormData;
        const headers = {
            ...getAuthHeaders(),
            ...(!isFormData && { "Content-Type": "application/json" }),
        };
        const res = await withTimeout(
            fetch(`${API}${url}`, { method: "POST", headers,
                body: isFormData ? body : JSON.stringify(body), signal: controller.signal }),
            controller
        );
        if (res.status === 200 || res.status === 201) {
            showSuccessToast(`${labelFor(apiname)} succeeded (POST)`);
            return await res.json();
        }
        const error = await parseErrorResponse(res, `Error occurred in ${apiname || ""} POST request.`);
        showErrorToast(error);
    } catch {
        showErrorToast("Network error. Please check your connection.");
        return null;
    }
};

export const get = async (url, apiname) => { /* same shape, GET */ };
export const deleteData = async (url, apiname) => { /* same shape, DELETE */ };
export const updateData = async (url, body, apiname) => { /* same shape, PUT */ };
```

### 4.3 Existing GET example — list companies

[src/Apis/Company.js:23-26](src/Apis/Company.js#L23-L26)

```js
import { get, deleteData } from "../Helpers/request";
import { apiEndpoint } from "../Helpers/apiEndpoints";

export const getCompanyList = async () => {
    const res = await get(`${apiEndpoint.getCompanyDetails}`); // GET /companydetails/get
    return res;
};
```

And the parameterised GET used by both Add Job and Job Listing:

[src/widgets/Addjobs/Helpers/index.js:20-38](src/widgets/Addjobs/Helpers/index.js#L20-L38)

```js
export const getJobDetailsHelper = async (params, page, size = 10) => {
    if (!!params && !!params?.key && !!params?.value) {
        let apiUrl = `${apiEndpoint.getAllJobDetails}?${params?.key}=${params?.value}`;
        if (page && size) apiUrl += `&page=${page}&size=${size}`;
        const data = await get(apiUrl);  // GET /jd/get?<key>=<value>&page=…
        if (!!data) showInfoToast(`Company details found in database`);
        else showWarnToast(`Company details not found`);
        return data;
    }
    return null;
};
```

### 4.4 Central baseUrl / instance?

There is no axios/fetch instance — the wrappers above are functional and re-resolve `process.env.REACT_APP_BACKEND_URL` per call via the imported `API`. Endpoint paths are stitched inline by callers.

### 4.5 Auth on requests

**Static API key only** — `x-api-key: REACT_APP_API_KEY` on every legacy-backend call, `x-admin-secret: REACT_APP_ADMIN_SECRET` on every scraper call. **Firebase ID tokens are NOT attached to requests** today. Firebase Auth is used only client-side to gate route access (see §11). The user-context note at [src/Context/userContext.js:33-34](src/Context/userContext.js#L33-L34) explicitly flags this:

```js
// NOTE: Client-side admin check — backend should verify via Firebase Custom Claims
setIsAdmin(firebaseUser.email === process.env.REACT_APP_ADMIN_EMAIL);
```

For v2, the migration likely needs to swap to `Authorization: Bearer <idToken>` (per CLAUDE.md `main-fe` pattern: `await user?.getIdToken()` before each call).

---

## 5. Existing Job Forms

### 5.1 Files

| Role | File |
|---|---|
| Route | [src/App.js:56](src/App.js#L56) (`<Route path="/addjob" element={<Addjobs />} />`) |
| Lazy import | [src/App.js:18](src/App.js#L18) |
| Page wrapper | [src/pages/AddJobs.jsx](src/pages/AddJobs.jsx) — thin wrapper around the widget |
| Page component (the form) | [src/widgets/Addjobs/index.js](src/widgets/Addjobs/index.js) (~847 lines, single file) |
| Sub-component | [src/widgets/Addjobs/Components/BackToDashboard.jsx](src/widgets/Addjobs/Components/BackToDashboard.jsx) |
| Helpers (API + transforms) | [src/widgets/Addjobs/Helpers/index.js](src/widgets/Addjobs/Helpers/index.js) — `addJobDataHelper`, `updateJobDetails`, `getJobDetailsHelper`, `generateLastDatetoApplyHelper`, `mapExperiencetoBatch`, `generateTagsfromRole` |
| Static option lists | [src/widgets/Addjobs/Helpers/staticdata.js](src/widgets/Addjobs/Helpers/staticdata.js) — `degreeOptions`, `batchOptions`, `expOptions`, `locOptions`, `jobTypeOptions`, `companyTypeOptions`, `categorytags`, `workmodeOptions`, `platformOptions`, `companyTypeOption` |
| Sample JSON for paste-import | [src/widgets/Addjobs/jobdataInfo.json](src/widgets/Addjobs/jobdataInfo.json) |
| Inline edit form (legacy) | [src/widgets/Joblisting/Components/EditData/EditData.jsx](src/widgets/Joblisting/Components/EditData/EditData.jsx) — duplicates much of the Add form, embeds CKEditor inline (used only from JobListing's drawer/modal flow) |
| **Validation schema** | **None.** The form uses ad-hoc `disabled={!link || !tags?.length}` and a small `validateForm()` in `EditData.jsx` (`title`, `companyName`, `link` required). No Zod/Yup. |
| Shared form-state library | **None** — plain `useState({...})` + a `handleInputChange(setter, key, value)` helper. |
| API entry points called | `POST /jd/add` (`apiEndpoint.addJobData`), `PUT /jd/update/:id` (`apiEndpoint.updateJobDetails`), `GET /jd/get?key=value` (`apiEndpoint.getAllJobDetails`), plus `POST /companydetails/add` & `PUT /companydetails/update/:id` (because the form also persists company info inline). |

### 5.2 Backend endpoints used by the job form

From [src/Helpers/apiEndpoints.js](src/Helpers/apiEndpoints.js):

```js
getAllJobDetails:  "/jd/get",
deleteJob:         "/jd/delete",
updateJobDetails:  "/jd/update/",   // append :id
addJobData:        "/jd/add",
trackApplyClick:   "/jd/update/count",
getImagecdnUrl:    "/jd/getposterlink",
addCompanyDetails: "/companydetails/add",
getCompanyDetails: "/companydetails/get",
updateCompanyDetails: "/companydetails/update",
deleteCompanyDetails: "/companydetails/delete",
```

The Add Job form posts a **`FormData`** (not JSON) built by `generateFormData()` in [src/widgets/Addjobs/Helpers/index.js:61-104](src/widgets/Addjobs/Helpers/index.js#L61-L104). Allowed fields:

```
title, link, batch, role, jobtype, degree, salary, jobdesc, eligibility,
experience, lastdate, skills, responsibility, aboutCompany, location,
jdpage, companytype, companyName, tags, workMode, benifits, platform,
jobId, imagePath, companyId, isActive, skilltags
```

`jdpage` is forced to `"true"`/`"false"` strings, defaulting to `true` when raw value is `undefined`/`null`/`true`/`"true"`.

### 5.3 Page component — full source

> Full file is [src/widgets/Addjobs/index.js](src/widgets/Addjobs/index.js) (847 lines, too long to inline verbatim). Behavioural summary:

- Maintains **two state objects**: `jobdetails` (job side, ~30 keys) and `companyDetails` (company side, ~7 keys).
- On mount: fetches company list (`GET /companydetails/get`), reads `?jobid=<24-hex>` query param, generates a default `lastdate = today + 30d`.
- On `Job Id` blur: `getJobDetailsHelper({ key, value })` populates both state objects in update mode.
- On company select (via `<SearchBar />`): hydrates company logo + info from `/companydetails/get?id=`.
- On submit (`addJobDetails`):
  1. If existing company → `updateCompanyDetailsHelper` (PUT `/companydetails/update/:id`)
  2. Else → `submitCompanyDetailsHelper` (POST `/companydetails/add`)
  3. If editing → `updateJobDetails` (PUT `/jd/update/:id`)
  4. Else → `addJobDataHelper` (POST `/jd/add`)
  5. Navigate to `/jobs` on 2xx.
- A **JSON-paste shortcut** at the top accepts a parsed object with keys mirroring the state shape and `extractJobData()` merges it in (with `safeUrl` sanitisation for `link`).
- Renders a **Canvas** banner-generator at the bottom (`<Canvas jobdetails={…} companyDetails={…} igbannertitle={…} />`).
- Heavy use of `useMemo`/`useCallback` for tag chip lists.

Imports already use shadcn primitives: `Button`, `Badge`, `Switch`, `Label`, `Card*`. Custom inputs are `CustomTextField` and `CustomCKEditor`. Lucide icons: `CloudDownload`, `Copy`, `X`.

### 5.4 What the legacy `EditData` modal-form does

[src/widgets/Joblisting/Components/EditData/EditData.jsx](src/widgets/Joblisting/Components/EditData/EditData.jsx) is the inline editor exposed from the Job Dashboard. It:

- Holds its own `jobDetails` `useState` (~22 fields, subset of the Add form).
- Sanitises `link` via `safeUrl`.
- Validates **inline** (`title`, `companyName`, `link`).
- Calls `updateJobDetails(jobDetails, id)` (PUT `/jd/update/:id`) for save and `addJobDataHelper(jobDetails)` (POST `/jd/add`) for repost.
- Embeds CKEditor directly (not via the `CustomCKEditor` wrapper) — duplicated config import.

This component is a strong candidate for **deletion in A8**: v2's single canonical job form will replace it.

---

## 6. Existing Company Forms

### 6.1 Files

| Role | File |
|---|---|
| Route | [src/App.js:58](src/App.js#L58) (`<Route path="/addcompany" element={<AddCompanyDetails />} />`) |
| Lazy import | [src/App.js:22](src/App.js#L22) |
| Page wrapper | [src/pages/AddCompanyDetails.jsx](src/pages/AddCompanyDetails.jsx) |
| Page component | [src/widgets/CompanyDetails/CompanyDetails.jsx](src/widgets/CompanyDetails/CompanyDetails.jsx) |
| API helpers | [src/widgets/CompanyDetails/helper.js](src/widgets/CompanyDetails/helper.js) — `submitCompanyDetailsHelper`, `updateCompanyDetailsHelper`, `buildCompanyFormData` |
| Read helpers | [src/Apis/Company.js](src/Apis/Company.js) — `getCompanyDetailsHelper`, `getCompanyList`, `deleteCompany` |
| Validation | **None.** Submit is gated by `disabled={!companyName || !largeLogo || !smallLogo}`. |
| Form-state library | **None** — plain `useState`. |

### 6.2 Backend endpoints

```
POST   /companydetails/add        ← submit
PUT    /companydetails/update/:id ← edit
GET    /companydetails/get        ← list / by id / by name
DELETE /companydetails/delete/:id ← delete
```

`buildCompanyFormData` ([src/widgets/CompanyDetails/helper.js:5-21](src/widgets/CompanyDetails/helper.js#L5-L21)) sends a `FormData` with these fields:

```
smallLogo, largeLogo, companyInfo, companyType,
careerPageLink, linkedinPageLink, companyName
```

> ⚠ The page-level state key is `careersPageLink` (with an `s`), but the API field is `careerPageLink` (no `s`). The form maps them carefully — easy to break in v2; preserve.

### 6.3 Page component — full source

```jsx
// src/widgets/CompanyDetails/CompanyDetails.jsx
import React, { useState, useEffect } from "react";

import { companyTypeOptions } from "../Addjobs/Helpers/staticdata";
import { generateLinkfromImage } from "../../Helpers/imageHelpers";
import { showErrorToast } from "../../Helpers/toast";
import { submitCompanyDetailsHelper, updateCompanyDetailsHelper } from "./helper";
import CustomButton from "../../Components/Button/CustomButton";
import CustomTextField from "../../Components/Input/Textfield";
import { Card, CardContent, CardHeader, CardTitle } from "Components/ui/card";

import { get } from "../../Helpers/request";
import { apiEndpoint } from "../../Helpers/apiEndpoints";
import { safeUrl } from "../../Helpers/sanitize";

const CompanyDetails = () => {
    const [companyDetails, setCompanyDetails] = useState({
        companyName: "", companyInfo: "", linkedinPageLink: "",
        careersPageLink: "", companyType: "", smallLogo: "", largeLogo: "",
    });
    const [isCompanydetailPresent, setIsCompanydetailPresent] = useState(false);
    const [companyId, setCompanyId] = useState();

    const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    const handleCompanyLogoInput = async (e, compressImage = true) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            showErrorToast("Only JPEG, PNG, and WebP images are allowed");
            e.target.value = "";
            return;
        }
        if (compressImage) {
            const link = await generateLinkfromImage(e);
            handleCompanyDetailChange("smallLogo", link);
        } else {
            if (file.size < 1000000) {
                const link = await generateLinkfromImage(e, false);
                handleCompanyDetailChange("largeLogo", link);
            } else {
                showErrorToast("Image size should be less than 1mb");
            }
        }
    };

    const submitCompanyDetails = async () => {
        const res = await submitCompanyDetailsHelper(companyDetails);
        if (!!res) {
            setCompanyDetails({ /* reset */ });
        }
    };

    const updateCompanyDetails = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const companyid = urlParams.get("companyid") || companyId;
        const res = await updateCompanyDetailsHelper(companyDetails, companyid);
        if (!!res) {
            window.location.href = "/companys";
            setCompanyDetails({ /* reset */ });
        }
    };

    const handleButtonClick = () => {
        if (isCompanydetailPresent) updateCompanyDetails();
        else submitCompanyDetails();
    };

    const handleCompanyDetailChange = (key, value) => {
        setCompanyDetails({ ...companyDetails, [key]: value });
    };

    const handleCompanynameChange = async (value) => {
        if (!!value) {
            const res = await get(`${apiEndpoint.getCompanyDetails}?companyname=${value}`);
            const data = res[0];
            setCompanyId(data?._id);
            if (!!data?.companyName && !!data?.smallLogo) {
                setIsCompanydetailPresent(true);
                setCompanyDetails({
                    companyName: data?.companyName || "",
                    companyInfo: data?.companyInfo || "",
                    linkedinPageLink: data?.linkedinPageLink || "",
                    careersPageLink: data?.careerPageLink || "",  // ← maps API → form key
                    companyType: data?.companyType || "",
                    smallLogo: data?.smallLogo || "",
                    largeLogo: data?.largeLogo || "",
                });
            }
        }
    };

    const getQueryparam = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const companyid = urlParams.get("companyid");
        if (companyid && /^[a-f\d]{24}$/i.test(companyid)) {
            setCompanyId(companyid);
            const res = await get(`${apiEndpoint.getCompanyDetails}?id=${companyid}`);
            const data = res[0];
            if (!!data) {
                setIsCompanydetailPresent(true);
                setCompanyDetails({
                    companyName: data?.companyName,
                    companyInfo: data?.companyInfo,
                    linkedinPageLink: safeUrl(data?.linkedinPageLink || "#"),
                    careersPageLink: safeUrl(data?.careerPageLink || "#"),
                    companyType: data?.companyType,
                    smallLogo: data?.smallLogo,
                    largeLogo: data?.largeLogo,
                });
            }
        }
    };

    useEffect(() => { getQueryparam(); }, []);

    return (
        <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight mb-6">
                {isCompanydetailPresent ? "Update" : "Add"} Company Details
            </h2>

            <Card className="shadow-md">
                <CardHeader><CardTitle className="text-lg">Company Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <CustomTextField label="Company name"
                        onBlur={(val) => handleCompanynameChange(val)}
                        value={companyDetails.companyName}
                        onChange={(val) => handleCompanyDetailChange("companyName", val)} fullWidth />
                    <CustomTextField multiline rows={4} label="Company info"
                        value={companyDetails.companyInfo}
                        onChange={(val) => handleCompanyDetailChange("companyInfo", val)} fullWidth />
                    <CustomTextField label="Company type" type="select" optionData={companyTypeOptions}
                        value={companyDetails.companyType}
                        onChange={(val) => handleCompanyDetailChange("companyType", val)} fullWidth />
                    <CustomTextField label="Careers page"
                        value={companyDetails.careersPageLink}
                        onChange={(val) => handleCompanyDetailChange("careersPageLink", val)} fullWidth />
                    <CustomTextField label="Linkedin link"
                        value={companyDetails.linkedinPageLink}
                        onChange={(val) => handleCompanyDetailChange("linkedinPageLink", val)} fullWidth />
                </CardContent>
            </Card>

            <Card className="mt-4">
                <CardHeader><CardTitle className="text-lg">Company Logos</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    {/* small logo + large logo file inputs (omitted for brevity — see source) */}
                </CardContent>
            </Card>

            <div className="mt-6 mb-10">
                <CustomButton
                    disabled={!companyDetails.companyName || !companyDetails.largeLogo || !companyDetails.smallLogo}
                    onClick={handleButtonClick}
                    label={isCompanydetailPresent ? "Update company details" : "Submit company details"}
                />
            </div>
        </div>
    );
};

export default CompanyDetails;
```

> The omitted JSX blocks for the two file-input cards are at [src/widgets/CompanyDetails/CompanyDetails.jsx:209-246](src/widgets/CompanyDetails/CompanyDetails.jsx#L209-L246).

Note: the update path uses `window.location.href = "/companys"` (full reload) rather than `useNavigate()`. v2 should swap to navigate.

---

## 7. Existing Listing Pages

### 7.1 Jobs listing — `/jobs`

| Item | Value |
|---|---|
| Page wrapper | [src/pages/JobList.jsx](src/pages/JobList.jsx) |
| Widget | [src/widgets/Joblisting/index.jsx](src/widgets/Joblisting/index.jsx) |
| Sub-components | [src/widgets/Joblisting/Components/AdminLinkCard/AdminLinkCard.jsx](src/widgets/Joblisting/Components/AdminLinkCard/AdminLinkCard.jsx), [src/widgets/Joblisting/Components/EditData/EditData.jsx](src/widgets/Joblisting/Components/EditData/EditData.jsx) |
| API hit | `getJobDetailsHelper({ key, value }, page, size = 10)` → `GET /jd/get?<key>=<value>&page=&size=` |
| Pagination | "Load more" button increments `pageno`; results are appended client-side. |
| Search | Single input. Debounced 500ms. Two modes: `id:<jobId>` → `?jobId=…`; otherwise → `?companyname=…`. |
| Bulk select | Checkbox per card, bulk-action footer for WhatsApp / Website-Link broadcast. |
| Per-row actions | Banner (opens `/canvas?jobid=…&companyname=…`), Copy Link, Expired toggle (PUT `/jd/update/:id` with `isActive=!isActive`), Telegram (admin-only), IG caption, LinkedIn caption, WhatsApp message. |
| Columns / display | Card layout, not a tabular grid. Each card shows `title`, `companyName`, `role`, `imagePath`, etc. via `<AdminLinkCard>` and a row of action buttons. |
| Filters | None beyond the search input. No status/tag/location filter. |
| State | `jobData[]`, `filteredData[]`, `jobCount`, `selectedJob[]`, `pageno`, `companyName`. |

### 7.2 Companies listing — `/companys`

| Item | Value |
|---|---|
| Page wrapper | [src/pages/CompanyList.jsx](src/pages/CompanyList.jsx) |
| Widget | [src/widgets/CompanyListing/index.jsx](src/widgets/CompanyListing/index.jsx) |
| API hit | `getCompanyList()` → `GET /companydetails/get` (no params; returns full list); `deleteCompany(id)` → `DELETE /companydetails/delete/:id` |
| Pagination | None — all companies fetched up front. |
| Search | Client-side filter on `companyName.toLowerCase().includes(query)`. |
| Display | Card per company. Shows small logo, company name, count badge `{listedJobs.length} jobs`, "Info present" badge if `companyInfo !== "N"`, large logo, and a list of recent jobs via `<AdminLinkCard … isPreview />`. |
| Per-row actions | Update (`navigate('/addcompany?companyid=…')`), Delete (`deleteCompany`). |

---

## 8. Shared Components

| Component | File | Wraps | shadcn / MUI / vanilla |
|---|---|---|---|
| `CustomTextField` | [src/Components/Input/Textfield.jsx](src/Components/Input/Textfield.jsx) | shadcn `Input` / `Textarea` / `Select` / `Label` | shadcn |
| `CustomButton` | [src/Components/Button/CustomButton.jsx](src/Components/Button/CustomButton.jsx) | shadcn `Button` (with MUI-style variant/size mapping) | shadcn |
| `CustomCKEditor` | [src/Components/CkEditor/CkEditor.jsx](src/Components/CkEditor/CkEditor.jsx) | `@ckeditor/ckeditor5-react` `CKEditor` + `ClassicEditor` | vanilla (3rd-party) |
| `CustomDivider` | [src/Components/Divider/Divider.jsx](src/Components/Divider/Divider.jsx) | hairline div | vanilla |
| `Loader` | [src/Components/Loader/index.jsx](src/Components/Loader/index.jsx) | full-screen spinner overlay | vanilla |
| `SearchBar` | [src/Components/Searchbar/index.jsx](src/Components/Searchbar/index.jsx) | wraps `CustomTextField` + a custom dropdown of company suggestions | shadcn (via wrapper) |
| `AppLayout` / `AppHeader` | [src/Components/Layout/AppLayout.jsx](src/Components/Layout/AppLayout.jsx), [src/Components/Layout/AppHeader.jsx](src/Components/Layout/AppHeader.jsx) | shadcn `Sidebar*`, `DropdownMenu`, `Avatar` | shadcn |
| `Header` | [src/Components/Header/index.jsx](src/Components/Header/index.jsx) | (legacy header — likely unused since AppHeader exists) | check before deletion |
| `Canvas/*` | [src/Components/Canvas/](src/Components/Canvas/) | banner generators (Instagram / LinkedIn / CareersAtTech / JobsAtTech) | **MUI** + html-to-image |
| `AdminLinkCard` | [src/widgets/Joblisting/Components/AdminLinkCard/AdminLinkCard.jsx](src/widgets/Joblisting/Components/AdminLinkCard/AdminLinkCard.jsx) | job/company display card | shadcn |
| Editor (legacy) | [src/widgets/Joblisting/Components/EditData/EditData.jsx](src/widgets/Joblisting/Components/EditData/EditData.jsx) | inline edit form | shadcn (badges, input) + CKEditor inline |

There is **no** generic `<DatePicker>`, `<TagInput>`, `<MultiSelect>`, `<RichTextEditor>` (separate from `CustomCKEditor`), or `<FormField>` wrapper. v2 will need at least:

- shadcn-style `<RichTextEditor>` wrapper around CKEditor (or replacement, e.g. tiptap).
- `<TagInput>` / chip input (currently inline in Add Job).
- `<DatePicker>` (currently `<input type="date" />`).
- shadcn `<Form>` + `<FormField>` (react-hook-form bridge).

---

## 9. Form State Management

**Today**: plain `useState` everywhere. No `react-hook-form`, `formik`, or `react-final-form`.

- The Add-Job form keeps two large objects (`jobdetails`, `companyDetails`) and mutates them with a manual `handleInputChange(setStateFunction, key, value)` helper that tolerates both `(setter, "key", value)` and `(setter, { partialObj })` call shapes.
- Validation is ad-hoc: submit-button `disabled` predicates and a hand-rolled `validateForm()` in `EditData`.
- Zod / Yup schemas: **none anywhere in the repo.**

### 9.1 Pattern example — minimal

[src/widgets/CompanyDetails/CompanyDetails.jsx:15-97](src/widgets/CompanyDetails/CompanyDetails.jsx#L15-L97):

```jsx
const [companyDetails, setCompanyDetails] = useState({
    companyName: "", companyInfo: "", linkedinPageLink: "",
    careersPageLink: "", companyType: "", smallLogo: "", largeLogo: "",
});
const [isCompanydetailPresent, setIsCompanydetailPresent] = useState(false);

const handleCompanyDetailChange = (key, value) => {
    setCompanyDetails({ ...companyDetails, [key]: value });
};
// …
<CustomTextField label="Company name"
    value={companyDetails.companyName}
    onChange={(val) => handleCompanyDetailChange("companyName", val)} />
```

### 9.2 Pattern example — multi-shape helper

[src/widgets/Addjobs/index.js:204-218](src/widgets/Addjobs/index.js#L204-L218):

```jsx
const handleInputChange = (setStateFunction, key, value) => {
    if (typeof key === "object" && key !== null) {
        setStateFunction((prev) => ({ ...prev, ...key }));
    } else if (typeof key === "string") {
        setStateFunction((prev) => ({ ...prev, [key]: value }));
    }
};
```

### 9.3 v2 implication

v2 will introduce `react-hook-form` + `zod` + `@hookform/resolvers`. shadcn's `<Form>` recipe uses:

```ts
const form = useForm<JobV2>({ resolver: zodResolver(jobV2Schema), defaultValues });
<Form {...form}>
  <FormField control={form.control} name="title" render={({ field }) => (
    <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
  )} />
</Form>
```

Add the shadcn `form.jsx` primitive to `src/Components/ui/` once `react-hook-form` lands.

---

## 10. Toasts / Notifications

- Library: **`react-toastify`** v11.
- `<ToastContainer autoClose={2000} />` mounted in [src/App.js:51](src/App.js#L51).
- Thin wrapper at [src/Helpers/toast.js](src/Helpers/toast.js):

```js
import { toast } from "react-toastify";
export function showSuccessToast(m) { toast.success(m) }
export function showErrorToast(m)   { toast.error(m) }
export function showInfoToast(m)    { toast.info(m) }
export function showWarnToast(m)    { toast.warn(m) }
```

- Usage example — [src/widgets/Addjobs/Helpers/index.js:111-118](src/widgets/Addjobs/Helpers/index.js#L111-L118):

```js
const res = await post(apiEndpoint.addJobData, formData, "Add new job");
if (!!res) { showSuccessToast("Job data added successfully"); return { status: 200 }; }
showErrorToast("An error occurred while adding Job"); return { status: 404 };
```

> Quirk: `request.js` itself fires its own success toast (`{label} succeeded (POST)`) which doubles up with the per-call helper toasts. v2 should pick one layer, not both.

For v2, either keep `react-toastify` or migrate to **sonner** (shadcn's preferred toast). Decision is non-blocking.

---

## 11. Auth Flow

### 11.1 Wiring

- Firebase config: [src/Config/firebase_config.js](src/Config/firebase_config.js) (Firebase v11).
- Provider: [src/Context/userContext.js](src/Context/userContext.js) (`AuthProvider` + `UserContext`).
- Persistence: `browserLocalPersistence`, plus a 30-day stale-session check using `localStorage["auth_login_ts"]`.
- Admin flag: client-side string compare against `REACT_APP_ADMIN_EMAIL` (the file itself notes this should be replaced with Firebase Custom Claims server-side).
- Sign-in page: [src/pages/SignIn/](src/pages/SignIn/).
- Sign-out: `logout()` from `UserContext`, fired from the `AppLayout` user dropdown.
- API auth: see §4.5 — **NOT** Firebase ID token; static `x-api-key`.

### 11.2 Route guard — full source

[src/App.js:34-38](src/App.js#L34-L38):

```jsx
function ProtectedRoute({ children }) {
    const { user, loading } = useContext(UserContext);
    if (loading) return <Loader />;
    return user?.email ? children : <Navigate to="/signin" />;
}
```

Used as a layout route at [src/App.js:55](src/App.js#L55):

```jsx
<Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
    <Route path="/addjob" element={<Addjobs />} />
    {/* … */}
</Route>
```

### 11.3 AuthProvider — full source

```js
// src/Context/userContext.js
export const AUTH_LOGIN_TS_KEY = "auth_login_ts";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const isSessionExpired = () => {
    const loginTs = localStorage.getItem(AUTH_LOGIN_TS_KEY);
    if (!loginTs) return true;
    return Date.now() - Number(loginTs) > THIRTY_DAYS_MS;
};

export const UserContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const unsubscribeRef = useRef(null);

    useEffect(() => {
        setPersistence(auth, browserLocalPersistence)
            .then(() => {
                unsubscribeRef.current = onAuthStateChanged(auth, (firebaseUser) => {
                    if (firebaseUser) {
                        if (isSessionExpired()) {
                            localStorage.removeItem(AUTH_LOGIN_TS_KEY);
                            signOut(auth); return;
                        }
                        setUser({ email: firebaseUser.email });
                        setIsAdmin(firebaseUser.email === process.env.REACT_APP_ADMIN_EMAIL);
                    } else { setUser(null); setIsAdmin(false); }
                    setLoading(false);
                });
            }).catch(() => setLoading(false));

        return () => { if (unsubscribeRef.current) unsubscribeRef.current(); };
    }, []);

    const logout = async () => {
        localStorage.removeItem(AUTH_LOGIN_TS_KEY);
        await signOut(auth);
        setUser(null); setIsAdmin(false);
    };

    return (
        <UserContext.Provider value={{ user, setUser, isAdmin, setIsAdmin, loading, logout }}>
            {children}
        </UserContext.Provider>
    );
};
```

---

## 12. CKEditor Usage

CKEditor 5 (`@ckeditor/ckeditor5-build-classic` + `@ckeditor/ckeditor5-react`) is used in **three** places:

1. **`CustomCKEditor` wrapper** — [src/Components/CkEditor/CkEditor.jsx](src/Components/CkEditor/CkEditor.jsx). Used by the Add-Job form ([src/widgets/Addjobs/index.js:795-799](src/widgets/Addjobs/index.js#L795-L799)) for `Job Description`, `Eligibility`, `Responsibility`, `Benefits`, `Skills needed`, and `About the company`.

   ```jsx
   import { CKEditor } from "@ckeditor/ckeditor5-react";
   import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
   import { config } from "../../Config/editorConfig";

   const CustomCKEditor = (props) => {
       ClassicEditor.defaultConfig = config;  // ⚠ mutates global default
       const { label, value } = props;
       return (
           <>
               {!!label && <p className="my-4 mb-2 text-foreground font-semibold">{label}</p>}
               <CKEditor editor={ClassicEditor} data={value || ""}
                   onChange={(_, editor) => props.onChange(editor.getData())} />
           </>
       );
   };
   ```

2. **`EditData` legacy modal** — [src/widgets/Joblisting/Components/EditData/EditData.jsx:5-7](src/widgets/Joblisting/Components/EditData/EditData.jsx#L5-L7) imports `CKEditor` and `ClassicEditor` directly (does not use the wrapper) and DOMPurify-sanitises before passing `data`.

3. **Blog editor** — [src/widgets/Blog/BlogEditor/](src/widgets/Blog/BlogEditor/) (out of scope for v2 forms but uses the same dependencies).

### CKEditor toolbar config

[src/Config/editorConfig.js](src/Config/editorConfig.js):

```js
export const config = {
    toolbar: {
        items: [
            'bold', 'italic', '|',
            'bulletedList', 'numberedList', 'indent', 'outdent', '|',
            'heading', '|',
            'undo', 'redo'
        ]
    }
}
```

For v2: keep CKEditor or swap to a lighter editor (tiptap). If keeping, harden `CustomCKEditor` (don't mutate `defaultConfig` per render, accept config prop, sanitise on read & write).

---

## 13. Theme & Brand

From [tailwind.config.js](tailwind.config.js) and [src/App.css](src/App.css):

- **Font**: `Geist Sans` / `Geist Mono`, loaded via `@fontsource/geist-sans` and `@fontsource/geist-mono` and registered in [src/App.js:10-11](src/App.js#L10-L11). No Inter / Roboto / Arial. Tailwind `font-sans` / `font-mono` map correctly.
- **Background (light)**: `hsl(0 0% 100%)` (pure white).
- **Foreground (light)**: `hsl(222.2 84% 4.9%)` (near-black).
- **Primary (light)**: `hsl(221.2 83.2% 53.3%)` — a vivid blue. **This drifts from CLAUDE.md's "Neutral theme = near-black primary" rule**, flag for v2.
- **Sidebar background**: `hsl(0 0% 98%)` (off-white in light mode).
- **Border / input / ring**: `hsl(214.3 31.8% 91.4%)`.
- **Destructive**: `hsl(0 84.2% 60.2%)` (red).
- **Charts**: 5-step palette (`12 76% 61%`, `173 58% 39%`, `197 37% 24%`, `43 74% 66%`, `27 87% 67%`).
- **Radius**: `--radius: 0.5rem` (so `rounded-lg` = 0.5rem, `rounded-md` = 0.375rem, `rounded-sm` = 0.25rem).
- **Dark mode**: `class="dark"` toggle, switched via [src/Context/themeContext.js](src/Context/themeContext.js), persisted in `localStorage`.
- **Legacy bridge**: `colors["header-blue"] = "#0069ff"` is reserved for the Canvas banner generators (kept).

---

## 14. What to Delete (prep for A8)

> **Nothing is deleted in this audit.** This is an inventory. Mark each item as candidate at A8.

### Old job form
- [src/pages/AddJobs.jsx](src/pages/AddJobs.jsx) — **(delete entire file)** once v2 page replaces the route at `/addjob`. (Trivial wrapper, 13 lines.)
- [src/widgets/Addjobs/index.js](src/widgets/Addjobs/index.js) — **(delete entire file)** legacy 847-line monolithic form.
- [src/widgets/Addjobs/Components/BackToDashboard.jsx](src/widgets/Addjobs/Components/BackToDashboard.jsx) — **(delete entire file)** unless v2 page reuses it.
- [src/widgets/Addjobs/Helpers/index.js](src/widgets/Addjobs/Helpers/index.js) — **(remove specific exports only)**: `addJobDataHelper`, `updateJobDetails`, `getJobDetailsHelper`, `generateLastDatetoApplyHelper`, `mapExperiencetoBatch`, `generateTagsfromRole`, internal `generateFormData`. **Keep nothing** if A8 confirms the JobListing is also rebuilt; otherwise keep the helpers JobListing still calls (`updateJobDetails`, `getJobDetailsHelper`).
- [src/widgets/Addjobs/Helpers/staticdata.js](src/widgets/Addjobs/Helpers/staticdata.js) — **(remove specific exports only)** if v2 schema replaces these option lists with backend-driven enums. Otherwise keep verbatim.
- [src/widgets/Addjobs/jobdataInfo.json](src/widgets/Addjobs/jobdataInfo.json) — **(delete entire file)** sample for paste-import; v2 likely won't ship it.

### Legacy inline edit modal
- [src/widgets/Joblisting/Components/EditData/EditData.jsx](src/widgets/Joblisting/Components/EditData/EditData.jsx) — **(delete entire file)** v2's canonical job form supersedes it. Verify no other importers before deletion (`grep -r "EditData"` should turn up only the JobListing widget; if so, the import there must be removed simultaneously).

### Old company form
- [src/pages/AddCompanyDetails.jsx](src/pages/AddCompanyDetails.jsx) — **(delete entire file)** when v2 replaces `/addcompany`.
- [src/widgets/CompanyDetails/CompanyDetails.jsx](src/widgets/CompanyDetails/CompanyDetails.jsx) — **(delete entire file)**.
- [src/widgets/CompanyDetails/helper.js](src/widgets/CompanyDetails/helper.js) — **(delete entire file)** if `submitCompanyDetailsHelper` / `updateCompanyDetailsHelper` (which the *job* form calls inline) are also replaced. If v2 keeps inline company persistence inside the job form, port these helpers to v2's API client first, then delete.

### Legacy validation schemas
- **None to delete** — there are no Zod/Yup schemas anywhere. (v2 introduces them.)

### Legacy API client methods to remove
- [src/Helpers/apiEndpoints.js](src/Helpers/apiEndpoints.js) — **(remove specific exports only)** drop these keys once v2 endpoints replace them, otherwise keep:
  - `addJobData`, `updateJobDetails`, `deleteJob`, `getAllJobDetails`, `getImagecdnUrl`, `trackApplyClick` (jobs)
  - `addCompanyDetails`, `updateCompanyDetails`, `deleteCompanyDetails`, `getCompanyDetails` (companies)
- [src/Apis/Company.js](src/Apis/Company.js) — **(remove specific exports only)** `getCompanyDetailsHelper`, `getCompanyList`, `deleteCompany` once v2 has its own client. Keep until JobListing & CompanyListing are rebuilt.
- [src/Helpers/request.js](src/Helpers/request.js) — **KEEP** unless v2 ships a brand-new client (e.g. an `apiFetch` that attaches Firebase ID tokens). If swapped, delete after callers migrate.

### Optional cleanups (verify usage first)
- [src/Components/Header/index.jsx](src/Components/Header/index.jsx) — **(verify, then delete entire file)**: appears superseded by `AppLayout` + `AppHeader`. Run `grep -r "Components/Header"` before A8.
- [src/Components/Input/Textfield.jsx](src/Components/Input/Textfield.jsx) — **(remove specific exports only / file)**: once v2 forms use shadcn `<Form>` + `<Input>`/`<Textarea>`/`<Select>` directly, this MUI-styled wrapper has no callers. Verify with `grep -r "CustomTextField"`.
- [src/Components/Button/CustomButton.jsx](src/Components/Button/CustomButton.jsx) — **(verify, then delete entire file)**: same — v2 should call shadcn `<Button>` directly.
- [src/Components/CkEditor/CkEditor.jsx](src/Components/CkEditor/CkEditor.jsx) — **KEEP** if v2 form still wants CKEditor for description fields, but plan to harden (remove the `ClassicEditor.defaultConfig = config` mutation). Otherwise delete and replace with a tiptap-based `<RichTextEditor>`.

### Out of scope for A8 (do not touch)
- Canvas (`src/Components/Canvas/*`) — banner generation pipeline, MUI-only island, used by `/canvas`.
- Scraper module (`src/widgets/Scraper/*`, `src/pages/Scraper/*`, `src/Helpers/scraperRequest.js`, `src/Helpers/scraperApiEndpoints.js`).
- Blog module (`src/widgets/Blog/*`, `src/pages/Blogs/*`, `src/Apis/Blog.js`).
- Analytics page.
- Ad Manager / Ad Popup widgets.
- Sign-in page.

---

## Appendix — quick stats

- 21 shadcn primitives present; ~14 Radix packages installed.
- 1 file still imports `@mui/material` (Canvas).
- 0 Zod / Yup schemas across the repo.
- 0 form libraries (rhf/formik) installed.
- 1 toast library: `react-toastify`.
- Auth: Firebase v11 client-side gate; backend uses static API key.
- API style: hand-rolled `fetch()` + `FormData` (not JSON) for create/update on jobs and companies.
