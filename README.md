# ProjectHub &ndash; Student Project Showcase

[![Python](https://img.shields.io/badge/Python-3.11+-3776ab.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479a1.svg?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A modern, full-stack academic and developer portfolio platform designed for students to showcase innovative engineering and software projects, share system architectures and problem statements, receive constructive peer feedback, and connect with academic institutions and recruiters.

---

## The Problem It Solves

Students frequently build high-quality capstone projects, hackathon prototypes, and research applications. However:
- Projects are often scattered across personal GitHub accounts without live demonstrations, visual documentation, or explanations of the engineering problem and proposed solution.
- Finding relevant peer projects by specialization (AI, IoT, Cybersecurity, Web Development) is fragmented across disconnected forums.
- Recruiters and professors lack an organized, verified academic showcase to discover student technical capabilities.

**ProjectHub** bridges this gap by offering a dedicated, professional showcase platform where student engineering achievements are clearly documented, easily discoverable, and peer-reviewed.

---

## Key Value Proposition & Intended Users

- **Student Creators**: Document engineering challenges, system architecture, tech stacks, live demos, and GitHub code in a single public portfolio.
- **Academic Institutions & Peers**: Explore peer solutions across engineering specializations, exchange technical feedback, and bookmark innovative references.
- **Technical Recruiters**: Review structured student profiles highlighting verified skill tags, university affiliations, and working software builds.

---

## Project Screenshots

Visual previews of the application interface are organized in the [`screenshots/`](./screenshots) directory:

| Screenshot | Description |
| :--- | :--- |
| ![Homepage](./screenshots/01-homepage.png) | **Homepage Showcase**: Hero banner, featured student projects, discipline categories, and live discovery search bar. |
| ![Project Discovery](./screenshots/02-projects-explore.png) | **Project Exploration**: Multi-facet filtering by category, technical stack tag, and sorting metrics. |
| ![Project Detail](./screenshots/03-project-detail.png) | **Engineering Documentation**: Problem statement, proposed solution, GitHub repo button, live demo link, and discussion thread. |
| ![Student Dashboard](./screenshots/04-student-dashboard.png) | **Student Dashboard**: Real-time project metrics (total, published, drafts, likes) and project management table. |
| ![Project Submission](./screenshots/05-submit-project.png) | **Project Submission**: Structured submission form with client-side validation and cover image upload preview. |
| ![Student Profile](./screenshots/06-student-profile.png) | **Public Profile**: University affiliation, department, graduation year, technical skills, and published catalog. |
| ![Admin Portal](./screenshots/07-admin-portal.png) | **Administration & Moderation**: Catalog moderation, flagged project reviews, and user account controls. |
| ![Dark Mode](./screenshots/08-dark-mode.png) | **Dark Mode Theme**: Restrained dark theme with persistent user preference storage. |

> *Note: Refer to [`screenshots/README.md`](./screenshots/README.md) for full instructions and recommended capture viewports.*

---

## Features

### Completed & Implemented Features

- **Project Discovery & Filtering**: Real-time keyword search, category filter, technology stack tag, and sorting (newest, oldest, alphabetical, most liked) backed by MySQL server-side pagination.
- **Detailed Project Documentation**: Dedicated `/projects/[id]` pages featuring the problem statement, proposed architectural solution, full overview, cover banner, and live external demo/repo buttons.
- **Student Engagement & Social**:
  - Live **Like** and **Save to Favorites** toggling with duplicate prevention.
  - Dedicated **Saved Favorites** page (`/favorites`).
  - Threaded discussion comments with owner and administrator deletion rights.
  - Project violation reporting modal for moderation review.
- **Student Workspace & Dashboard (`/dashboard`)**:
  - Real-time project metrics (total submissions, published count, draft count, total likes received).
  - Tabbed management table (*All*, *Published*, *Drafts*) with one-click status toggling, direct editing, and destructive delete confirmation modals.
- **Project Submission & Editing (`/submit` & `/projects/[id]/edit`)**:
  - Validation with character limits and URL formatting checks.
  - Local image upload supporting PNG, JPG, and WebP (capped at 5MB) with UUID-randomized filenames.
  - Dirty form state detection prompting before leaving unsaved changes.
- **Student Profiles (`/students/[id]` & `/profile`)**:
  - Public portfolio displaying university affiliation, department, graduation year, biography, verified skill tags, social links, and published works.
  - Private self-service profile editor with avatar photo upload.
- **Administration & Moderation Portal (`/admin`)**:
  - Role-protected panel (`admin` role) with overview statistics, catalog moderation (hide/feature), user management, report queue resolution, and dynamic category management.
- **Design System & UI**:
  - Clean academic aesthetic with soft neutral backgrounds, dark charcoal typography, and teal accents.
  - Persistent Dark Mode toggle syncing with `localStorage` and system preferences.
  - Non-blocking toast notification queue.
  - Custom 404 and 500 error pages.

### Planned Features (Roadmap)

- [ ] **GitHub OAuth Integration**: Direct sign-in using GitHub accounts.
- [ ] **Automated GitHub Repo Sync**: Auto-populate repository language stats and star counts via the GitHub API.
- [ ] **PDF Portfolio Export**: One-click generation of student resume-ready project summaries.
- [ ] **Docker Compose Setup**: Single-command containerization for backend, frontend, and MySQL database.

---

## Technology Stack

```
Frontend:
├── Framework: Next.js 14 (Pages Router)
├── Library: React 18
├── Language: TypeScript 5.5
├── Styling: Tailwind CSS 3.4
├── Server State & Caching: TanStack React Query 5.40
├── HTTP Client: Axios 1.7
└── Icons: Lucide React & Custom SVG

Backend:
├── Framework: FastAPI 0.115
├── ASGI Server: Uvicorn
├── ORM: SQLAlchemy 2.0
├── MySQL Driver: PyMySQL 1.1
├── Security & Hashing: Argon2-cffi 23.1
├── Token Authentication: Python-Jose 3.3 (JWT HS256)
├── Upload Handling: Python-Multipart 0.0.34
└── Validation: Pydantic v2

Database:
└── MySQL 8.0+ (Relational storage with connection pooling & automated migrations)
```

---

## Architecture

ProjectHub utilizes a decoupled client-server architecture communicating via typed JSON REST APIs:

```mermaid
flowchart LR
    subgraph Client["Frontend (Next.js 14)"]
        UI["React 18 Components"]
        Cache["React Query Cache"]
        ClientAuth["Auth Context & Token"]
        UI <--> Cache
        UI <--> ClientAuth
    end

    subgraph API["Backend (FastAPI)"]
        Middleware["CORS & Cookie Parser"]
        AuthHandler["JWT & Argon2 Verifier"]
        Routes["REST Endpoints (/auth, /projects, /students, /admin)"]
        Validation["Pydantic v2 Validation"]
        Middleware --> AuthHandler
        AuthHandler --> Routes
        Routes --> Validation
    end

    subgraph Data["Persistence (MySQL)"]
        ORM["SQLAlchemy 2.0 ORM"]
        DB[("MySQL Database")]
        Uploads[("Local Static Disk (/uploads)")]
        Validation --> ORM
        ORM <--> DB
        Routes --> Uploads
    end

    Cache -- "JSON over HTTP" --> Middleware
```

*For an in-depth breakdown of communication lifecycles and security boundaries, see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).*

---

## Project Structure

```
Student Project Showcase/
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── admin.py        # Moderation, user controls, and categories
│   │   │   ├── auth.py         # Registration, login, logout, and token handling
│   │   │   ├── comments.py     # Discussion threads and peer review
│   │   │   ├── projects.py     # Projects catalog, search, likes, and favorites
│   │   │   ├── students.py     # Student profiles, dashboard stats, and user projects
│   │   │   └── upload.py       # Secure local image upload handler
│   │   ├── auth.py             # Argon2 password hashing and JWT dependencies
│   │   ├── database.py         # SQLAlchemy engine, session maker, and pool config
│   │   ├── main.py             # FastAPI app initialization, CORS, and static routes
│   │   ├── migrate.py          # Automated idempotent database migration runner
│   │   ├── models.py           # SQLAlchemy database models
│   │   └── schemas.py          # Pydantic v2 request/response schemas
│   ├── requirements.txt        # Python dependency manifest
│   └── test_api.py             # Automated end-to-end backend test suite
├── docs/
│   ├── ARCHITECTURE.md         # Detailed architectural documentation & sequence flows
│   ├── DATABASE.md             # Complete database schema, tables, and constraints
│   ├── API.md                  # Comprehensive REST API endpoint reference
│   └── SETUP.md                # Step-by-step local development setup guide
├── frontend/
│   ├── components/             # Reusable UI components (Navbar, Footer, ProjectCard, etc.)
│   ├── context/                # React context providers (AuthContext, ThemeContext, ToastContext)
│   ├── pages/
│   │   ├── projects/
│   │   │   ├── index.tsx       # Project discovery and search directory
│   │   │   ├── [id].tsx        # Project detail page
│   │   │   └── [id]/edit.tsx   # Project editing page
│   │   ├── students/
│   │   │   └── [id].tsx        # Public student portfolio page
│   │   ├── _app.tsx            # React Query & Context wrapping
│   │   ├── admin.tsx           # Administration & moderation dashboard
│   │   ├── dashboard.tsx       # Student workspace & metrics dashboard
│   │   ├── favorites.tsx       # Saved projects collection
│   │   ├── index.tsx           # Homepage
│   │   ├── login.tsx           # Student login
│   │   ├── profile.tsx         # Private profile editor
│   │   ├── register.tsx        # Student registration
│   │   ├── submit.tsx          # Project submission form
│   │   ├── 404.tsx             # Custom 404 Not Found page
│   │   └── 500.tsx             # Custom 500 Error page
│   ├── services/
│   │   └── api.ts              # Centralized Axios client & typed API methods
│   ├── styles/
│   │   └── globals.css         # Tailwind utility classes and theme variables
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── package.json            # Node.js dependencies
│   └── tailwind.config.js      # Tailwind theme configuration
├── screenshots/                # Visual documentation checklist and assets
├── uploads/                    # Local directory for user project cover images
├── .env.example                # Safe environment configuration template
└── README.md
```

---

## Database Design

ProjectHub uses an automated, idempotent migration runner (`backend/app/migrate.py`) that applies incremental schema updates without dropping or deleting data.

```mermaid
erDiagram
    users ||--o{ projects : "creates"
    users ||--o{ project_likes : "gives"
    users ||--o{ project_favorites : "saves"
    users ||--o{ project_comments : "writes"
    users ||--o{ project_reports : "submits"

    projects ||--o{ project_likes : "receives"
    projects ||--o{ project_favorites : "bookmarked_by"
    projects ||--o{ project_comments : "contains"
    projects ||--o{ project_reports : "targeted_by"
```

*For detailed column types, constraints, and index definitions, see [`docs/DATABASE.md`](./docs/DATABASE.md).*

---

## API Documentation

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new student account | No |
| `POST` | `/auth/login` | Authenticate user and issue JWT token / cookie | No |
| `POST` | `/auth/logout` | Clear authentication cookie | No |
| `GET` | `/auth/me` | Retrieve authenticated user profile | Yes |
| `GET` | `/projects` | List projects with search, filter, sort, and pagination | No |
| `GET` | `/projects/featured` | Retrieve featured / highlight projects | No |
| `GET` | `/projects/{id}` | Retrieve comprehensive project details | Optional |
| `POST` | `/projects` | Submit a new student project | Yes |
| `PUT` | `/projects/{id}` | Update existing project | Owner / Admin |
| `DELETE`| `/projects/{id}` | Delete project | Owner / Admin |
| `POST` | `/projects/{id}/like` | Like a project | Yes |
| `DELETE`| `/projects/{id}/like` | Unlike a project | Yes |
| `POST` | `/projects/{id}/favorite` | Save project to favorites collection | Yes |
| `DELETE`| `/projects/{id}/favorite` | Remove project from favorites collection | Yes |
| `POST` | `/projects/{id}/report` | Submit report for moderation review | Yes |
| `GET` | `/projects/{id}/comments` | List project discussion comments | No |
| `POST` | `/projects/{id}/comments` | Post a discussion comment | Yes |
| `DELETE`| `/comments/{id}` | Delete comment | Author / Admin |
| `GET` | `/students/{id}` | Retrieve public student profile & projects | No |
| `PUT` | `/students/me/profile` | Update current student's profile | Yes |
| `GET` | `/dashboard/stats` | Retrieve student dashboard statistics | Yes |
| `GET` | `/dashboard/projects` | List all projects owned by student (including drafts) | Yes |
| `GET` | `/favorites` | List saved favorite projects for current user | Yes |
| `GET` | `/categories` | List project disciplines | No |
| `POST` | `/categories` | Create a new discipline | Admin only |
| `DELETE`| `/categories/{id}` | Remove a discipline | Admin only |
| `GET` | `/admin/stats` | Platform-wide administrative metrics | Admin only |
| `GET` | `/admin/projects` | All projects (including drafts and hidden) | Admin only |
| `PATCH`| `/admin/projects/{id}/moderate` | Moderate project (`is_hidden`, `is_featured`) | Admin only |
| `GET` | `/admin/users` | List registered user accounts | Admin only |
| `PATCH`| `/admin/users/{id}/status` | Activate/deactivate user or change role | Admin only |
| `GET` | `/admin/reports` | Moderation queue reports | Admin only |
| `PATCH`| `/admin/reports/{id}` | Update report status (`reviewed`, `dismissed`) | Admin only |
| `POST` | `/upload/image` | Upload cover image or student avatar | Yes |

*For complete request and response payload schemas, see [`docs/API.md`](./docs/API.md).*

---

## Installation & Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18.x or 20.x LTS & npm 9+
- MySQL Server 8.0+ running on `localhost:3306`

### 1. Clone the Repository
```bash
git clone https://github.com/tejaswininyamagoudar26/student-project-showcase.git
cd student-project-showcase
```

### 2. Configure Backend
```powershell
# Create and activate Python virtual environment
python -m venv backend/venv
.\backend\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r backend/requirements.txt

# Copy environment configuration template
cp .env.example .env
```
*Configure your MySQL credentials in `.env` (`DATABASE_URL=mysql+pymysql://root:password@localhost:3306/student_projects`).*

### 3. Run Migrations & Start Backend
```powershell
# Initialize database tables and seed categories
python -m backend.app.migrate

# Start FastAPI development server on port 8000
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 4. Configure & Start Frontend
Open a new terminal window:
```powershell
cd frontend

# Copy frontend environment template
cp .env.local.example .env.local

# Install node dependencies
npm install

# Start Next.js development server on port 3000
npm run dev
```

Open `http://localhost:3000` in your web browser.

*For an extended step-by-step setup guide, see [`docs/SETUP.md`](./docs/SETUP.md).*

---

## Environment Variables

Copy the provided example files to create your environment configurations. **Never commit `.env` or files containing real secrets.**

### Root `.env` (Backend Configuration)
```env
# MySQL Connection String (PyMySQL)
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/student_projects

# JWT Secret & Expiration
JWT_SECRET_KEY=change-this-to-a-secure-random-secret-key-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Initial Admin Email
ADMIN_EMAIL=admin@projecthub.local

# Server & CORS Configuration
PORT=8000
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Testing & Verification

### Backend Automated End-to-End Test Suite
The repository includes an integration test suite validating authentication, project creation, search and filtering, likes, favorites, comments, and profile updates:
```powershell
.\backend\venv\Scripts\python.exe backend/test_api.py
```
*Output: `--- ALL BACKEND TESTS PASSED SUCCESSFULLY! ---`*

### Frontend TypeScript Compilation & Production Build
```bash
cd frontend
npm run build
```
*Compiles all 14 routes cleanly with zero TypeScript errors.*

---

## Security

- **Argon2 Password Hashing**: Passwords are never stored in plaintext and never logged or returned in API responses.
- **Dual-Token Authentication**: Supports standard `Authorization: Bearer <token>` headers as well as `HttpOnly`, `SameSite=Lax` cookies.
- **SQL Injection Defense**: Built entirely on SQLAlchemy ORM parameterized queries.
- **Authorization & Ownership Checks**: Backend dependencies strictly verify resource ownership before permitting project or comment modifications.
- **Safe File Uploads**: Image uploads are validated against an allowed MIME/extension whitelist, capped at 5MB, and stored with unique UUID filenames to prevent path traversal.

---

## Contributing

Contributions, feedback, and suggestions are welcome!

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## License

This project currently does not have an open-source license. All rights are reserved by the author. A formal open-source license may be added in future updates.

---

## Author

**Tejaswini S Nyamagoudar**  
GitHub: [@tejaswininyamagoudar26](https://github.com/tejaswininyamagoudar26)
