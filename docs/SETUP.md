# Local Development & Installation Guide

This guide walks you through setting up and running **ProjectHub (Student Project Showcase)** on your local development machine.

---

## 1. Prerequisites

Ensure the following runtimes and services are installed:
- **Python**: Version 3.11 or higher
- **Node.js**: Version 18.x or 20.x LTS
- **npm**: Version 9.x or higher
- **MySQL Server**: Version 8.0 or compatible instance running locally on default port `3306`

---

## 2. Clone the Repository

```bash
git clone https://github.com/tejaswininyamagoudar26/student-project-showcase.git
cd student-project-showcase
```

---

## 3. Database Setup

1. Start your local MySQL service.
2. Log into the MySQL terminal or client:
   ```bash
   mysql -u root -p
   ```
3. Create the database using `utf8mb4` encoding:
   ```sql
   CREATE DATABASE IF NOT EXISTS student_projects
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

---

## 4. Backend Setup (FastAPI & SQLAlchemy)

### 4.1 Create & Activate Virtual Environment
- **On Windows (PowerShell)**:
  ```powershell
  python -m venv backend/venv
  .\backend\venv\Scripts\Activate.ps1
  ```
- **On macOS / Linux**:
  ```bash
  python3 -m venv backend/venv
  source backend/venv/bin/activate
  ```

### 4.2 Install Python Dependencies
```bash
pip install -r backend/requirements.txt
```

### 4.3 Configure Backend Environment Variables
Copy the root `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```

Edit `.env` to match your local MySQL credentials:
```env
# MySQL Connection String (PyMySQL)
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/student_projects

# JWT Security
JWT_SECRET_KEY=your_secure_random_jwt_secret_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Initial Admin (optional)
ADMIN_EMAIL=admin@projecthub.local

# Server Configuration
PORT=8000
FRONTEND_URL=http://localhost:3000
```

### 4.4 Run Database Migrations
Run the automated migration runner to initialize all tables, columns, indexes, and default categories:
```bash
python -m backend.app.migrate
```

### 4.5 Start the Backend Server
```bash
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base: `http://127.0.0.1:8000`
- Health check: `http://127.0.0.1:8000/health`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`

---

## 5. Frontend Setup (Next.js & Tailwind CSS)

Open a new terminal window and navigate to `frontend/`:

### 5.1 Configure Frontend Environment
```bash
cd frontend
cp .env.local.example .env.local
```
Verify that `frontend/.env.local` points to your running FastAPI backend:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 5.2 Install Node Modules
```bash
npm install
```

### 5.3 Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

---

## 6. Running Verification & Tests

### Backend Automated End-to-End Tests
Ensure your MySQL database and virtual environment are configured, then run:
```powershell
.\backend\venv\Scripts\python.exe backend/test_api.py
```
This test suite verifies:
- Health check availability
- User registration and Argon2 password hashing
- Login and JWT token issuance
- Project creation, retrieval, search, and category filtering
- Like and favorite toggling
- Comment submission and deletion
- Student profile updates and dashboard metrics

### Frontend Type Checking & Production Build
```bash
cd frontend
npm run build
```
Confirms full TypeScript validation, route tree generation, and production bundle optimization across all pages.

---

## 7. Troubleshooting Common Issues

### MySQL Connection Refused (`OperationalError`)
- Ensure your MySQL service is running (`Get-Service MySQL*` on Windows or `sudo systemctl status mysql` on Linux).
- Verify the credentials and port in `DATABASE_URL` within `.env`.

### CORS Network Errors
- Ensure the backend's `FRONTEND_URL` in `.env` matches the origin of your browser client (default `http://localhost:3000`).

### Image Upload Fails
- Verify that the `uploads/` directory exists and has write permissions. FastAPI automatically creates this directory on startup if it does not exist.
