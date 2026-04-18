# ip-admin

Admin dashboard for managing job postings, company details, and social media banners for a job portal (CareersAtTech/JobsAtTech).

## Tech Stack

- **React 18** with Create React App (react-scripts)
- **React Router v6** for routing
- **Tailwind CSS 3.4** + **shadcn/ui** (Radix UI primitives) — primary UI system
- **MUI v5** (Material UI) — co-exists with shadcn in some components
- **Lucide React** for icons
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
│   └── SignIn/
└── widgets/           # Feature widgets (complex UI sections)
    ├── Addjobs/       # Job creation/editing form (main feature)
    ├── AdManager/     # Ad banner/link management
    ├── AdPopupType/   # Ad popup type toggle
    ├── CompanyDetails/
    ├── CompanyListing/
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

## UI/Theme Rules

**All frontend code must follow `THEME_GUIDE.md` (project root).** Read it before any UI work. If a rule isn't covered there, default to shadcn/ui Neutral theme conventions.

### Font: Geist Only

- **Geist Sans** (`font-sans`) for all UI text. **Geist Mono** (`font-mono`) for code/IDs only.
- **Banned**: Inter, Roboto, Arial, Helvetica, system-ui, Poppins, SF Pro — override any dependency defaults.
- Weights: 400 (body), 500 (labels/nav), 600 (titles), 700 (metrics). No 100/300/800/900.

### Typographic Scale

| Role | Classes | Use |
|------|---------|-----|
| Page Title | `text-2xl font-semibold tracking-tight` | Top of every page |
| Section Title | `text-lg font-semibold tracking-tight` | Card group headers |
| Card Title | `text-sm font-medium text-muted-foreground` | Label above metric |
| Metric Value | `text-2xl font-bold tracking-tight` | Stat numbers |
| Body | `text-sm` | Default text, table cells, form labels |
| Body Muted | `text-sm text-muted-foreground` | Timestamps, helper text |
| Small/Caption | `text-xs text-muted-foreground` | Footnotes, pagination |
| Code | `font-mono text-sm` | IDs, URLs, API keys |

### Color System — Neutral Theme (HSL CSS Variables)

- All colors via semantic tokens — **never raw hex/rgb values**
- **Primary** (`--primary`): near-black in light, near-white in dark (neutral, not blue)
- **Dark mode**: `class="dark"` toggle, managed by `src/Context/themeContext.js`, persisted in localStorage
- Custom status colors: `--status-pending` (amber), `--status-approved` (green), `--status-rejected` (red), `--status-edited` (blue), `--status-draft` (gray)
- **Banned**: gradients, glassmorphism (`backdrop-blur` on cards), neon/saturated accents, colored sidebar backgrounds

### Components (shadcn/ui Primitives)

- Always start with the shadcn primitive — no custom implementations of existing components
- **Buttons**: `default` (primary CTA), `secondary` (cancel), `outline` (neutral), `ghost` (inline/icon), `destructive` (delete/reject), `link`
- **Badges for status**: `variant="outline"` + status color border/text (e.g., `border-amber-300 text-amber-600` for Pending)
- **Cards**: `border border-border` for separation — prefer border over shadow
- **Data Tables**: `@tanstack/react-table` + shadcn Table. Row click opens Sheet (slide-over), never navigates away.
- **Sidebar**: shadcn Sidebar suite. `w-64` expanded, `w-14` collapsed. Sheet overlay on mobile (<768px).
- **Icons**: Lucide React only, `h-4 w-4` default size, inherit parent text color, never icon-specific colors

### Spacing

- Page padding: `px-4 lg:px-6`, top: `pt-6`
- Section gaps: `gap-4` or `space-y-4`; page title to content: `space-y-6`
- Card padding: `p-6`; card grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`
- Sidebar: internal `px-3 py-2`, nav items `px-3 py-2`

### Border Radius

- Cards/dialogs: `rounded-lg` (0.5rem)
- Buttons/inputs/badges: `rounded-md` (0.375rem)
- Small elements (checkbox, toggle): `rounded-sm` (0.25rem)
- Avatars/status dots only: `rounded-full`
- **Banned**: `rounded-xl`, `rounded-2xl`, `rounded-3xl`

### Shadows & Elevation

- **Flat design** — prefer `border border-border` over shadows
- `shadow-sm`: optional card lift. `shadow-md`: dropdowns/popovers only. `shadow-lg`: dialogs/sheets only.
- **Banned**: `shadow-xl`, `shadow-2xl`, colored shadows, stacking border + shadow on same element

### Animation

- Hover: `transition-colors 150ms`. Sidebar collapse: `transition-[width] 200ms`. Loading: `animate-pulse` skeletons.
- shadcn built-in animations for Sheet/Dialog/Dropdown are fine.
- **Banned**: page transitions, card entrance animations, table row animations, any animation >300ms, parallax/scroll effects

### Responsive Breakpoints

| Breakpoint | Sidebar | Card Grid | Table |
|------------|---------|-----------|-------|
| <640px (mobile) | Sheet overlay | 1 col | Horizontal scroll |
| 640–1023px (tablet) | Sheet overlay | 2 cols | Horizontal scroll |
| 1024–1439px (laptop) | Collapsed (icon) | 4 cols | Full |
| 1440px+ (desktop) | Expanded | 4 cols | Full |

### Accessibility

- WCAG AA contrast (4.5:1 text, 3:1 large text)
- Visible `ring` focus on all interactive elements
- Keyboard navigable (Tab + Enter)
- `aria-label` on icon-only buttons
- Respect `prefers-reduced-motion`

### Existing Component Wrappers

**CustomButton** (`src/Components/Button/CustomButton.jsx`): wraps shadcn Button. Variant map: `contained→default`, `outlined→outline`, `text→ghost`, `destructive→destructive`. Size map: `small→sm`, `medium→default`, `large→lg`.

**CustomTextField** (`src/Components/Input/Textfield.jsx`): unified input/textarea/select via `type` prop. Full width default, optional label, error state `border-destructive`, select accepts `optionData` array.

**Loader** (`src/Components/Loader/`): fixed overlay with `bg-black/20 backdrop-blur-sm`, animated spinner.

## Environment Variables

All prefixed with `REACT_APP_`:
- `REACT_APP_BACKEND_URL` — API base URL
- `REACT_APP_FIREBASE_*` — Firebase config (API key, auth domain, project ID, etc.)
