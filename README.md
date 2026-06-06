# DevPulse - Issue Tracking & Collaboration Platform

A modern, full-stack issue tracking system built with React and TypeScript, featuring role-based access control, real-time comments, and intuitive kanban boards.

## About

DevPulse is a production-ready issue management platform designed for development teams and client collaboration. It streamlines bug tracking, feature requests, and client feedback with a clean, dark-themed interface. The application features secure authentication, comprehensive commenting system, and flexible views—all optimized for both desktop and mobile devices.

## Live Application

> Explore DevPulse in action:
>
> **🌐 https://devpulsev2.vercel.app/**
>
> Track issues, collaborate with teams, and deliver quality software

## Backend Repo

> Explore DevPulse backend:
>
> **🌐 https://github.com/FarhadNuri/Dev-Pulse-L2A2**
>
>


## Features

### Core Functionality

- **Multi-Role System** - Three distinct roles: Client, Contributor, and Maintainer
- **Issue Management** - Create, edit, and track bugs and feature requests
- **Approval Workflow** - Client submissions require maintainer approval
- **Comments System** - Real-time discussion on any issue with role badges
- **Multiple Views** - Switch between List View and Kanban Board
- **Issue Details Modal** - Click any card for full details and comments
- **Smart Filtering** - Filter by type, status, and search across issues

### Technical Highlights

- **Role-Based Access Control** - Fine-grained permissions per user role
- **JWT Authentication** - Secure token-based authentication with localStorage
- **Responsive Design** - Mobile-first UI with Tailwind CSS
- **Drag-and-Drop** - Intuitive kanban board with @dnd-kit
- **Type Safety** - Full TypeScript implementation
- **Optimized Loading** - Prevents redirect on page reload

---

## Key Features by Role

### Client
- Submit issues with app name
- Track submission approval status
- View and comment on own submissions
- Personal dashboard view

**Contributor**
- View all approved issues
- Create and manage issues
- Comment on any issue
- Edit own issues

**Maintainer**
- Full access to all issues
- Approve/reject client submissions
- Delete any issue or comment
- Manage issue status and workflow

---

## User Roles & Permissions

| Feature | Client | Contributor | Maintainer |
|---------|--------|-------------|------------|
| View approved issues | ✅ Own only | ✅ All | ✅ All |
| Create issues | ✅ Requires approval | ✅ Auto-approved | ✅ Auto-approved |
| Edit issues | ❌ | ✅ Own only | ✅ All |
| Delete issues | ✅ Own only | ❌ | ✅ All |
| View comments | ✅ | ✅ | ✅ |
| Add comments | ✅ | ✅ | ✅ |
| Delete comments | ✅ Own only | ✅ Own only | ✅ All |
| Approve submissions | ❌ | ❌ | ✅ |
| Drag-and-drop status | ❌ | ✅ | ✅ |

## Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **React Hot Toast** - Toast notifications
- **@dnd-kit** - Drag-and-drop functionality

### Backend
- **Node.js/Express** - RESTful API (deployed separately)
- **JWT** - Authentication tokens
- **RESTful Architecture** - Clean API design



## Project Architecture

```
devpulse-client/
├── src/
│   ├── api.ts                    # API client & endpoints
│   ├── types.ts                  # TypeScript interfaces
│   ├── utils.ts                  # Helper functions
│   ├── hooks.tsx                 # Auth context & hooks
│   ├── components/               # Reusable components
│   │   ├── Header.tsx            # Navigation header
│   │   ├── Footer.tsx            # App footer
│   │   ├── IssueCard.tsx         # Issue display card
│   │   ├── KanbanBoard.tsx       # Drag-and-drop board
│   │   ├── CommentSection.tsx    # Comments UI
│   │   ├── IssueDetailsModal.tsx # Full issue view
│   │   ├── NewIssueModal.tsx     # Create issue form
│   │   ├── EditIssueModal.tsx    # Edit issue form
│   │   ├── ClientDashboard.tsx   # Client-specific view
│   │   ├── PendingApprovalPanel.tsx # Approval queue
│   │   ├── Modal.tsx             # Base modal component
│   │   └── Spinner.tsx           # Loading indicator
│   └── pages/                    # Route pages
│       ├── IssuesPage.tsx        # Main dashboard
│       ├── LoginPage.tsx         # Authentication
│       └── SignupPage.tsx        # Registration
├── public/                        # Static assets
└── dist/                          # Production build
```

## API Integration

DevPulse connects to a RESTful backend API:

**Base URL:** `https://dev-pulse-l2-a2.vercel.app`

### Key Endpoints

**Authentication**
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - User login

**Issues**
- `GET /api/issues` - List all issues
- `POST /api/issues` - Create issue
- `PATCH /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue
- `GET /api/issues/pending` - Pending approvals
- `PATCH /api/issues/:id/approve` - Approve/reject

**Comments**
- `GET /api/issues/:id/comments` - List comments (public)
- `POST /api/issues/:id/comments` - Add comment (auth)
- `DELETE /api/comments/:id` - Delete comment (auth)

## Authentication Flow

### Initial Load
```
App Start → Check localStorage → 
  Token Found? 
    → Restore Session → Navigate to Dashboard
    → No Token → Show Login Page
```

### Login Process
```
User Login → API Call → Receive JWT Token →
  Save to localStorage → Update Auth Context → 
  Redirect to Dashboard
```

### Auth Persistence
- JWT token stored in `localStorage` as `devpulse_token`
- User object stored as `devpulse_user`
- Loading state prevents premature redirects on reload
- Automatic session restoration on page refresh


## Getting Started

**Farhad Nuri**
- Email: farhadnuri559@gmail.com
- GitHub: [@FarhadNuri](https://github.com/FarhadNuri)
- LinkedIn: [Farhad Nuri](https://www.linkedin.com/in/farhad-nuri-ba99a62a5/)


---

**⭐ Star this repo if you found it helpful!**

