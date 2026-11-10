# DevPulse - Multi-Tenant Issue Tracking & Collaboration Platform

A production-ready, full-stack issue tracking system built with **React 19**, **TypeScript**, and **Tailwind CSS**. Designed for engineering teams and client collaboration, DevPulse provides isolated multi-tenant organization workspaces, multi-project Kanban boards, client ticket triage workflows, real-time activity timelines, and an administrative control center.

---

## Live Application & Repositories

| Resource | Link |
| :--- | :--- |
| **Frontend Application** | [https://devpulsev2.vercel.app](https://devpulsev2.vercel.app) |
| **Backend API Service** | [https://dev-pulse-l2-a2.vercel.app](https://dev-pulse-l2-a2.vercel.app) |
| **Backend Repository** | [GitHub - FarhadNuri/Dev-Pulse-L2A2](https://github.com/FarhadNuri/Dev-Pulse-L2A2) |

---

## What's New in DevPulse

- **Multi-Tenant Organizations:** Users can create, switch between, and manage multiple isolated organization workspaces with custom branding and dedicated team rosters.
- **Multi-Project Workspaces:** Organize work into distinct projects with unique project keys, progress meters, and project-specific member lists.
- **Modern Kanban Engine:** Fluid drag-and-drop column workflows powered by `@dnd-kit`, complete with filter bars, priority tagging, and instant state synchronization.

- **File Attachments & Media Previews:** Upload screenshots and crash logs directly to tickets with drag-and-drop upload preview.
- **Chronological Activity Timeline:** Automatic audit trails logging status transitions, reassignments, label updates, and submission reviews.
- **Client Submission & Triage Workflow:** Client bug submissions enter an approval queue requiring maintainer review with structured accept/reject feedback dialogs.
- **Super-Admin Console:** Dedicated administrative portal (`/admin`) for platform-wide metrics, global organization directory, and user account management.
- **Modular API Architecture:** Replaced monolithic API calls with domain-driven service modules (`auth`, `orgs`, `projects`, `issues`, `comments`, `labels`, `attachments`, `activity`, `invitations`, `admin`) and centralized Axios interceptors.

---

## User Roles & Permissions

DevPulse supports a 5-tier role hierarchy spanning platform, workspace, and project levels:

| Capability | Super Admin | Org Admin | Maintainer | Contributor | Client |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Platform-wide Admin Console** (`/admin`) | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Manage Organization Settings & Billing** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Invite & Manage Org Members / Roles** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Create & Configure Projects** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Review & Approve Client Submissions** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Drag & Drop Status / Reassign Issues** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Direct Issue Creation (Auto-Approved)** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Client Issue Submission (Queue Required)**| ❌ | ❌ | ❌ | ❌ | ✅ |
| **Delete Any Issue / Comment** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **View Audit Activity Timeline** | ✅ | ✅ | ✅ | ✅ | Own Only |

---

## Tech Stack

### Frontend Architecture
- **Framework:** [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict typing across domain entities)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with custom dark-mode theme tokens
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Drag-and-Drop:** [@dnd-kit](https://dndkit.com/) (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`)
- **Routing:** [React Router v7](https://reactrouter.com/) (Protected routes, layout wrappers, and dynamic params)
- **HTTP Client:** [Axios](https://axios-http.com/) with request/response JWT interceptors
- **Icons & Notifications:** [Lucide Icons](https://lucide.dev/) & [React Hot Toast](https://react-hot-toast.com/)

### Backend Integration
- **Platform:** Node.js / Express REST API
- **Authentication:** Stateless JWT bearer tokens with persistent session restore
- **Storage & Uploads:** Multi-tenant MongoDB database and cloud attachment storage

---

## Project Architecture

```text
DevPulse-Client/
├── public/
│   ├── favicon.svg               # Vector brand pulse icon
│   └── screenshots/              # High-definition landing page preview assets
├── src/
│   ├── api/                      # Modular API service layer
│   │   ├── client.ts             # Axios instance & token interceptors
│   │   ├── auth.ts               # Login, registration, token refresh
│   │   ├── orgs.ts               # Organization CRUD & membership
│   │   ├── projects.ts           # Project lifecycle & members
│   │   ├── issues.ts             # Issues CRUD, status transitions, triage
│   │   ├── comments.ts           # Comment threads & reactions
│   │   ├── labels.ts             # Workspace label configuration
│   │   ├── attachments.ts        # File upload endpoints
│   │   ├── activity.ts           # Audit log history
│   │   ├── invitations.ts        # Email invitation tokens
│   │   ├── admin.ts              # Super-admin platform endpoints
│   │   └── index.ts              # Unified barrel export
│   ├── context/                  # Global React context providers
│   │   ├── AuthContext.tsx       # Session state, user payload, login/logout
│   │   ├── OrgContext.tsx        # Active organization & workspace switcher
│   │   └── ConfirmContext.tsx    # Accessible modal confirmation prompts
│   ├── hooks/                    # Reusable custom hooks
│   │   └── useDebounce.ts        # Input debounce for search & filters
│   ├── components/               # Core UI components
│   │   ├── AppLayout.tsx         # Workspace navigation shell & sidebar
│   │   ├── OrgRoute.tsx          # Organization context route guard
│   │   ├── KanbanBoard.tsx       # Drag-and-drop Kanban engine
│   │   ├── IssueCard.tsx         # Ticket preview card
│   │   ├── IssueDrawer.tsx       # Slide-over quick inspection panel
│   │   ├── IssueFilters.tsx      # Multi-facet search and filter toolbar
│   │   ├── IssueDetailsModal.tsx # Full-screen ticket detail & discussion
│   │   ├── ActivityTimeline.tsx  # Chronological issue audit trail
│   │   ├── CommentSection.tsx    # Threaded discussions with deletion
│   │   ├── AssigneePicker.tsx    # Member assignment dropdown
│   │   ├── LabelPicker.tsx       # Custom label selector
│   │   ├── AttachmentUploader.tsx# Drag-and-drop file uploader
│   │   ├── PendingApprovalPanel.tsx # Maintainer submission review queue
│   │   ├── RejectReasonDialog.tsx# Structured rejection feedback modal
│   │   ├── ProjectCard.tsx       # Project summary card with metrics
│   │   ├── ProjectMembersPanel.tsx # Scoped project access controller
│   │   ├── admin/                # Super-Admin console components
│   │   │   ├── AdminLayout.tsx
│   │   │   └── SuperAdminRoute.tsx
│   │   ├── landing/              # Marketing showcase sections
│   │   │   ├── Navbar.tsx, Hero.tsx, TaglineReveal.tsx, Proof.tsx
│   │   │   ├── ProblemSolution.tsx, HowItWorks.tsx, Benefits.tsx
│   │   │   └── FAQ.tsx, FinalCTA.tsx, Footer.tsx
│   │   └── org/                  # Workspace configuration components
│   │       ├── MembersTable.tsx, InviteMemberModal.tsx, ManageLabelsPanel.tsx
│   ├── pages/                    # Routed view pages
│   │   ├── LandingPage.tsx       # Public marketing page (/)
│   │   ├── LoginPage.tsx         # Authentication login (/login)
│   │   ├── SignupPage.tsx        # User registration (/signup)
│   │   ├── OnboardingPage.tsx    # First-time organization setup (/onboarding)
│   │   ├── InviteAcceptPage.tsx  # Invitation token acceptance (/invite/:token)
│   │   ├── DashboardPage.tsx     # Workspace executive overview (/dashboard)
│   │   ├── ProjectsGridPage.tsx  # Organization projects list (/orgs/:orgId/projects)
│   │   ├── IssuesPage.tsx        # Project Kanban & issue tracking
│   │   ├── OrgSettingsPage.tsx   # Workspace administration & labels
│   │   ├── MyRequestsPage.tsx    # User submitted ticket history
│   │   └── admin/                # Platform management views
│   │       ├── AdminDashboardPage.tsx
│   │       ├── AdminOrgsPage.tsx
│   │       └── AdminUsersPage.tsx
│   ├── types.ts                  # Domain models and TypeScript contracts
│   ├── utils.ts                  # Date formatting, initials, and helper functions
│   └── index.css                 # Theme tokens, fonts, and scrollbar styles
├── index.html                    # SEO metadata and Google font preconnects
├── package.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm** / **yarn**

### 1. Clone the Repository
```bash
git clone https://github.com/FarhadNuri/DevPulse-Client.git
cd DevPulse-Client
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your configuration values:
```env
# URL pointing to the DevPulse backend API
VITE_API_URL=http://localhost:5000

# Maintainer signup authorization secret
VITE_MAINTAINER_SECRET=your_secret_key_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 5. Build for Production
```bash
npm run build
npm run preview
```

---

## Application Routes Overview

| Route | Access | Description |
| :--- | :--- | :--- |
| `/` | Public | Marketing landing page with interactive showcase |
| `/login` | Public | Sign in to an existing account |
| `/signup` | Public | Register a new user or maintainer account |
| `/invite/:token` | Public / Auth | Accept an invitation to join an organization |
| `/dashboard` | Authenticated | Multi-tenant workspace metrics and activity |
| `/orgs/:orgId/projects` | Authenticated | Project directory for the active organization |
| `/orgs/:orgId/projects/:projectId` | Authenticated | Interactive Kanban board and issue management |
| `/orgs/:orgId/settings` | Org Admin / Maintainer | Workspace settings, members, and custom labels |
| `/orgs/:orgId/my-requests` | Authenticated | User submitted ticket tracking |
| `/admin` | Super Admin | Global system metrics, organizations, and user directory |

---

## Author & Support

**Farhad Nuri**
- **GitHub:** [@FarhadNuri](https://github.com/FarhadNuri)
- **LinkedIn:** [Farhad Nuri](https://www.linkedin.com/in/farhad-nuri-ba99a62a5/)
- **Email:** farhadnuri559@gmail.com

---

⭐ **Star this repository if you find it helpful!**
