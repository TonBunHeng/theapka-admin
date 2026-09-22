# TheapKa Admin (`theapka-admin`)

Administrative and Management Portal for **TheapKa Online**, a digital wedding invitation and wedding management platform for Cambodian couples.

This single application serves both **Platform Staff (Admin)** and **Executive Management (Super Admin)** through granular Role-Based Access Control (RBAC) and permissions.

---

## 1. Product Context & Architecture

```
THEAPKA ONLINE
├── USER         Couple / wedding owner        -> uses theapka-user (Separate App)
├── ADMIN        Platform staff / management   -> uses theapka-admin (THIS APP)
└── SUPER ADMIN  Full system control           -> uses theapka-admin (THIS APP)
```

### Core Security & RBAC Rules
- **One app, one login**: Admin and Super Admin log in through the same portal. The UI dynamically derives visible routes, menus, and actions based on the permissions returned by the API (`GET /api/auth/me`).
- **Super Admin privileges**: Super Admin is treated as having all permissions (`isSuperAdmin` bypasses all permission checks in `usePermission`).
- **Staff Access Only**: Couples (`role: "user"`) attempting to log into this portal are immediately rejected with an explicit access denied notice.
- **Private Couple Data**: Wedding guest lists and cash/monetary gift records are hidden behind locked cards requiring `guests.view` and `gifts.view`. Access to private data displays a persistent confidentiality notice: *"Access to this private data is logged."*
- **Audit Trails**: Every destructive or state-changing action (suspending users, archiving weddings, updating permissions, modifying gateway configs) requires a mandatory reason, which is dispatched to the backend audit log.
- **Self-Lockout Protection**: The last active Super Admin can never be disabled, deleted, or demoted.
- **Dual Currency Integrity**: Khmer Riel (`100,000 ៛`, 0 decimals) and US Dollars (`$25.00`, 2 decimals) are strictly aggregated and displayed as separate totals across all screens. Currencies are never mixed or summed.

---

## 2. Tech Stack

| Purpose | Technology |
|---|---|
| Framework | React 18 + Vite (JavaScript, JSX) |
| Styling | Tailwind CSS (Brand Design Tokens: Soft Gold & Deep Emerald) |
| Routing | React Router v6 with `React.lazy` code splitting |
| Server State | TanStack Query v5 |
| Tables | TanStack Table v8 (Server-side pagination, sorting, search, filtering) |
| Client State | Zustand (Auth & UI) |
| Forms & Validation | React Hook Form + Zod |
| HTTP Client | Axios instance with Sanctum Bearer tokens & 401/403 interceptors |
| Visual Charts | Recharts |
| Internationalization | i18next (English `en` & Khmer `km` - 100% complete) |
| Icons | Lucide React |
| Date Handling | Dayjs |

---

## 3. Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### Installation & Local Run
```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

The app will be available at `http://localhost:3000` (or the next available port, e.g. `http://localhost:3001`).

---

## 4. Test Logins (In-Memory Mock Layer)

The application includes a zero-dependency in-memory mock engine adhering to the Laravel + Sanctum API contract (`VITE_USE_MOCK=true` enabled in `.env`).

Two pre-configured staff accounts are ready for testing with convenient one-click buttons on `/login`:

| Account | Email | Password | Role | Access Scope |
|---|---|---|---|---|
| **Super Admin** | `super@theapka.test` | `password123` | `super_admin` | Full system access, all permissions, System suite visible |
| **Staff Admin** | `admin@theapka.test` | `password123` | `admin` | Limited permissions, System suite hidden, no private data |

### Testing RBAC Differences
1. **Log in as `super@theapka.test`**:
   - The **System Management** section appears in the sidebar (`Staff Accounts`, `Roles & Permissions`, `Settings`, `Security`, `Audit Logs`, `Payment Gateways`, `Backups`, `Maintenance`).
   - Access to `/system/admins`, `/system/roles`, and all audit state diffs.
2. **Log in as `admin@theapka.test`**:
   - The **System** section is completely removed from the sidebar.
   - Attempting direct navigation to `http://localhost:3000/system/admins` cleanly displays the **403 Forbidden** page.
   - Visiting `/weddings/wed_1` and opening the **Guest List** shows the locked card explaining that `guests.view` permission is required.
   - In `/payments`, the **Refund** button is hidden because standard admins lack `payments.refund`.

---

## 5. Directory Structure

```
theapka-admin/
├── src/
│   ├── app/
│   │   ├── router.jsx                   # React Router v6 route configuration
│   │   ├── providers.jsx                # TanStack Query + i18n + Toast providers
│   │   └── layouts/
│   │       ├── AdminLayout.jsx          # Collapsible sidebar, sticky topbar, breadcrumb, maintenance banner
│   │       └── AuthLayout.jsx           # Clean branded auth card layout
│   ├── auth/
│   │   ├── authStore.js                 # Zustand store (user, role, permissions, tokens, logout, login)
│   │   ├── RequireAuth.jsx              # Redirects unauthenticated to /login
│   │   ├── RequireRole.jsx              # Checks specific role requirement (e.g. super_admin)
│   │   ├── RequirePermission.jsx        # Checks resource permission; redirects to /403 if missing
│   │   ├── Can.jsx                      # Conditional render component based on permission
│   │   └── usePermission.js             # can(permissionKey) hook (super_admin bypasses all checks)
│   ├── config/
│   │   ├── menu.js                      # Sidebar navigation structure with permission/role bindings
│   │   └── permissions.js               # Resource.action permission constants
│   ├── features/
│   │   ├── auth/                        # LoginPage, ForgotPasswordPage
│   │   ├── dashboard/                   # DashboardPage (KPI stat cards, charts, recent activity)
│   │   ├── users/                       # UsersListPage, UserDetailPage, ConfirmDialogs
│   │   ├── weddings/                    # WeddingsListPage, WeddingDetailPage, Private Data Cards
│   │   ├── invitations/                 # InvitationsListPage, InvitationPreviewModal, FlagModal
│   │   ├── templates/                   # TemplatesListPage, TemplateEditorPage (JsonEditor + LivePreview)
│   │   ├── content/                     # ContentListPage, ContentEditorModal (bilingual km/en)
│   │   ├── guests/                      # GuestsCrossSearchPage (masked phone reveal, audit logged)
│   │   ├── payments/                    # PaymentsListPage, PaymentDetailPage, Verify & Refund
│   │   ├── reports/                     # ReportsPage (Revenue, Signups, Conversion, Plans, CSV export)
│   │   ├── support/                     # SupportListPage, TicketDetailPage (chat-style conversation)
│   │   ├── media/                       # MediaGridPage, Lightbox Preview, Storage Quotas
│   │   ├── announcements/               # AnnouncementsListPage, AnnouncementModal
│   │   ├── profile/                     # ProfilePage (details, password reset, active sessions)
│   │   └── system/                      # SUPER ADMIN ONLY
│   │       ├── admin-accounts/          # AdminListPage, AdminCreateEditModal
│   │       ├── roles-permissions/       # RolesMatrixPage, AdminOverrideDrawer
│   │       ├── settings/                # SystemSettingsPage (tabbed config)
│   │       ├── security/                # SecuritySettingsPage, SessionsRevoke
│   │       ├── audit-logs/              # AuditLogsPage, AuditDiffDrawer (side-by-side)
│   │       ├── payment-config/          # PaymentConfigPage (Bakong KHQR, ABA PayWay)
│   │       ├── backup/                  # BackupsPage, RestoreConfirmModal (type RESTORE)
│   │       └── maintenance/             # MaintenanceSettingsPage
│   ├── components/                      # Handcrafted UI components (DataTable, Modal, Drawer, etc.)
│   ├── lib/
│   │   ├── api.js                       # Axios instance with Bearer token & 401/403 interceptors
│   │   ├── queryClient.js               # TanStack Query client configuration
│   │   ├── format.js                    # Currency (KHR ៛ / USD $), dates (dayjs), numbers
│   │   └── mock/                        # Mock server & seed data
│   ├── i18n/
│   │   ├── index.js                     # i18next initialization
│   │   ├── en.json                      # Complete English translations
│   │   └── km.json                      # Complete Khmer (ភាសាខ្មែរ) translations
│   ├── styles/index.css                 # Tailwind directives + Kantumruy Pro & custom scrollbars
│   └── main.jsx                         # App entrypoint
├── .env.example
├── tailwind.config.js                   # Custom design tokens (brand gold, deep emerald, neutral slate)
├── vite.config.js
└── package.json
```

---

## 6. Internationalization (i18n)

The interface supports English (`en`) and Khmer (`km`). The default interface language can be toggled using the language button in the top navigation bar.

Font typography is set to **Kantumruy Pro** to ensure clean, proportional rendering of Khmer vowels, diacritics, and sub-consonants across compact data tables and badges.

---

## 7. Production Verification

Production builds have been compiled and verified with zero errors:
```bash
npm run build
```
Build output produces optimized, chunk-split assets with dedicated chunks for large feature bundles (e.g. Recharts, TanStack Table, and the Super Admin suite).
# theapka-admin
