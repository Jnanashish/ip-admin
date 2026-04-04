# ip-admin

Admin dashboard for managing job postings, company details, and social media banners for a job portal (CareersAtTech/JobsAtTech).

## Tech Stack

- **React 18** with Create React App (react-scripts)
- **React Router v6** for routing
- **MUI v5** (Material UI) for UI components
- **SCSS Modules** for component-scoped styling
- **Firebase** for authentication (config in `src/Config/firebase_config.js`)
- **CKEditor 5** for rich text editing (job descriptions)
- **html-to-image / html2canvas** for banner generation

## Commands

- `npm start` — dev server
- `npm run build` — production build
- `npm test` — run tests

## Project Structure

```
src/
├── Apis/              # API helper functions per domain (Company.js)
├── Components/        # Reusable UI components (Button, Canvas, CkEditor, Header, Input, Loader, Searchbar)
├── Config/            # App config (firebase, editor)
├── Context/           # React Context (UserContext for auth)
├── Helpers/           # Utilities (API requests, endpoints, cookies, image helpers, toast, telegram)
├── Static/            # Static assets (images, logos)
├── pages/             # Route-level page components
│   ├── AddJobs.jsx
│   ├── Banners/
│   ├── CompanyList.jsx
│   ├── AddCompanyDetails.jsx
│   ├── JobList.jsx
│   └── Signinpage/
└── widgets/           # Feature widgets (complex UI sections)
    ├── Addjobs/       # Job creation/editing form (main feature)
    ├── Adhandler/     # Ad/banner management
    ├── CompanyDetails/
    ├── CompanyListing/
    ├── Dapoptype/
    └── Joblisting/    # Job listing with edit/delete
```

## Key Patterns

- **API calls**: Use `get`, `post`, `updateData`, `deleteData` from `src/Helpers/request.js` — all use native `fetch()` with base URL from `src/Backend.js` (env var `REACT_APP_BACKEND_URL`)
- **API endpoints**: Centralized in `src/Helpers/apiEndpoints.js`
- **State**: React `useState` + Context API (`UserContext`) — no external state library
- **Auth**: Cookie-based check (`getCookie("isLogedIn")`) + user email in context; routes protected via `RouterWrapper` in App.js
- **Routing**: All routes defined in `src/App.js` — `/addjob`, `/canvas`, `/addcompany`, `/companys`, `/jobs`, `/signin`
- **Toasts**: `react-toastify` via helpers in `src/Helpers/toast.js`
- **Pages are thin wrappers** that render widget components (e.g., `AddJobs.jsx` just renders `<AddjobsComponent />`)
- **Banner generation**: Canvas components in `src/Components/Canvas/` render HTML banners (Instagram, LinkedIn, CareersAtTech) that can be downloaded as images

## Environment Variables

All prefixed with `REACT_APP_`:
- `REACT_APP_BACKEND_URL` — API base URL
- `REACT_APP_FIREBASE_*` — Firebase config (API key, auth domain, project ID, etc.)
