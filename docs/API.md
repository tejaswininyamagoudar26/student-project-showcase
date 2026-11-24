# ProjectHub REST API Reference

The ProjectHub backend exposes a RESTful API built with FastAPI. All endpoints accept and return JSON payloads unless specified otherwise. Interactive OpenAPI (Swagger) documentation is accessible at `http://127.0.0.1:8000/docs` when running locally.

---

## 1. Authentication & Common Headers

### Bearer Token
Include your JWT token in the `Authorization` header for protected endpoints:
```http
Authorization: Bearer <your-jwt-token>
```

### HttpOnly Cookie Support
The API also supports cookie-based sessions. Upon successful login or registration, the backend sets an `access_token` cookie that browsers automatically transmit on subsequent requests when `withCredentials: true` is configured.

### Error Format
All errors adhere to standard HTTP status codes and return a consistent JSON error schema:
```json
{
  "detail": "Error explanation or validation failure message"
}
```

---

## 2. Authentication Endpoints (`/auth`)

### Register User
- **Method / Path**: `POST /auth/register`
- **Auth**: None
- **Request Body**:
  ```json
  {
    "name": "Alex Smith",
    "email": "alex@university.edu",
    "password": "SecurePassword123"
  }
  ```
- **Response**: `201 Created`
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "name": "Alex Smith",
      "email": "alex@university.edu",
      "role": "student",
      "created_at": "2026-11-24T12:00:00Z"
    }
  }
  ```

### Login User
- **Method / Path**: `POST /auth/login`
- **Auth**: None
- **Request Body**:
  ```json
  {
    "email": "alex@university.edu",
    "password": "SecurePassword123"
  }
  ```
- **Response**: `200 OK` (Returns JWT token and user entity, sets `access_token` cookie)

### Logout User
- **Method / Path**: `POST /auth/logout`
- **Auth**: None
- **Response**: `200 OK` (Clears the `access_token` cookie)

### Current User Profile
- **Method / Path**: `GET /auth/me`
- **Auth**: Required (`Bearer` or cookie)
- **Response**: `200 OK` (Returns full authenticated `UserResponse`)

---

## 3. Project Endpoints (`/projects`)

### List Projects
- **Method / Path**: `GET /projects`
- **Auth**: Optional (enriches `is_liked` and `is_favorited` if token provided)
- **Query Parameters**:
  - `page` (`int`, default: 1): Page number.
  - `page_size` (`int`, default: 9, max: 100): Results per page.
  - `search` (`string`, optional): Case-insensitive match on title, description, or technology.
  - `category` (`string`, optional): Filter by discipline name.
  - `technology` (`string`, optional): Filter by tech stack tag.
  - `sort` (`string`, default: `'newest'`): Options: `'newest'`, `'oldest'`, `'title'`, `'likes'`.
  - `is_featured` (`boolean`, optional): Filter featured projects.
- **Response**: `200 OK`
  ```json
  {
    "projects": [
      {
        "id": 1,
        "title": "Autonomous Drone Navigator",
        "short_description": "Vision-based SLAM obstacle avoidance system.",
        "category": "IoT & Embedded Systems",
        "technology": "Python, OpenCV, ROS, C++",
        "github_url": "https://github.com/example/drone-nav",
        "demo_url": "https://drone-demo.example.com",
        "image_url": "/uploads/example.png",
        "status": "published",
        "is_featured": true,
        "is_hidden": false,
        "likes_count": 12,
        "favorites_count": 5,
        "comments_count": 3,
        "owner_name": "Alex Smith",
        "owner_avatar": null,
        "is_liked": false,
        "is_favorited": false
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 9,
    "total_pages": 1
  }
  ```

### Featured Projects
- **Method / Path**: `GET /projects/featured`
- **Auth**: Optional
- **Query Parameters**: `limit` (`int`, default: 6)
- **Response**: `200 OK` (Array of highlighted `ProjectRead` objects)

### Get Project Details
- **Method / Path**: `GET /projects/{project_id}`
- **Auth**: Optional (Owners and Admins can view draft or hidden projects; anonymous visitors receive 404 for private projects)
- **Response**: `200 OK` (Full `ProjectDetail` object including `problem_statement`, `proposed_solution`, `description`, and owner public info)

### Create Project
- **Method / Path**: `POST /projects`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "title": "Quantum Circuit Simulator",
    "short_description": "Interactive browser-based quantum computing visualizer.",
    "description": "Full architectural documentation of the simulator...",
    "problem_statement": "Students lack intuitive visual tooling for quantum states.",
    "proposed_solution": "WebAssembly-accelerated state vector simulation.",
    "category": "Web Development",
    "technology": "Next.js, TypeScript, Rust, WebAssembly",
    "github_url": "https://github.com/example/quantum-sim",
    "demo_url": "https://quantum.example.com",
    "image_url": "/uploads/uuid.png",
    "status": "published"
  }
  ```
- **Response**: `201 Created`

### Update Project
- **Method / Path**: `PUT /projects/{project_id}`
- **Auth**: Required (Owner or Admin only)
- **Request Body**: Partial project update fields
- **Response**: `200 OK`

### Delete Project
- **Method / Path**: `DELETE /projects/{project_id}`
- **Auth**: Required (Owner or Admin only)
- **Response**: `204 No Content`

### Project Likes & Favorites
- `POST /projects/{project_id}/like` &rarr; Returns `{ "project_id": 1, "is_liked": true, "likes_count": 13 }`
- `DELETE /projects/{project_id}/like` &rarr; Returns `{ "project_id": 1, "is_liked": false, "likes_count": 12 }`
- `POST /projects/{project_id}/favorite` &rarr; Returns `{ "project_id": 1, "is_favorited": true, "favorites_count": 6 }`
- `DELETE /projects/{project_id}/favorite` &rarr; Returns `{ "project_id": 1, "is_favorited": false, "favorites_count": 5 }`

### Report Project
- **Method / Path**: `POST /projects/{project_id}/report`
- **Auth**: Required
- **Request Body**: `{ "reason": "Violates academic code of conduct" }`
- **Response**: `201 Created`

---

## 4. Discussion Comments (`/projects/{id}/comments` & `/comments`)

### List Comments
- **Method / Path**: `GET /projects/{project_id}/comments`
- **Auth**: None
- **Response**: `200 OK` (Array of comments ordered newest first)

### Add Comment
- **Method / Path**: `POST /projects/{project_id}/comments`
- **Auth**: Required
- **Request Body**: `{ "content": "Great use of state vector simulation!" }`
- **Response**: `201 Created`

### Delete Comment
- **Method / Path**: `DELETE /comments/{comment_id}`
- **Auth**: Required (Comment Author or Admin only)
- **Response**: `204 No Content`

---

## 5. Student Portfolio & Dashboard (`/students` & `/dashboard`)

### Public Profile
- **Method / Path**: `GET /students/{user_id}`
- **Auth**: None
- **Response**: `200 OK` (Returns public user profile without sensitive fields)

### Student Published Projects
- **Method / Path**: `GET /students/{user_id}/projects`
- **Auth**: Optional
- **Response**: `200 OK` (Array of published projects created by the student)

### Update My Profile
- **Method / Path**: `PUT /students/me/profile`
- **Auth**: Required
- **Request Body**:
  ```json
  {
    "bio": "Graduate researcher focusing on distributed consensus algorithms.",
    "college": "Stanford University",
    "department": "Computer Science",
    "graduation_year": 2026,
    "skills": "Go, Raft, Distributed Systems, Kubernetes",
    "github_url": "https://github.com/username",
    "linkedin_url": "https://linkedin.com/in/username"
  }
  ```
- **Response**: `200 OK`

### Student Dashboard Metrics
- **Method / Path**: `GET /dashboard/stats`
- **Auth**: Required
- **Response**: `200 OK`
  ```json
  {
    "total_projects": 3,
    "published_projects": 2,
    "draft_projects": 1,
    "total_likes": 18,
    "total_favorites": 7
  }
  ```

### Student Workspace Projects
- **Method / Path**: `GET /dashboard/projects`
- **Auth**: Required
- **Response**: `200 OK` (All projects owned by the user, including unpublished drafts)

### Saved Favorites Collection
- **Method / Path**: `GET /favorites`
- **Auth**: Required
- **Response**: `200 OK` (Array of bookmarked projects)

---

## 6. Administration & Moderation (`/admin` & `/categories`)

### Platform Statistics
- **Method / Path**: `GET /admin/stats`
- **Auth**: Required (`admin` role)
- **Response**: `200 OK` (`total_users`, `total_projects`, `published_projects`, `pending_reports`, `total_categories`)

### Manage Projects Catalog
- **Method / Path**: `GET /admin/projects`
- **Auth**: Required (`admin` role)
- **Response**: `200 OK` (All projects, including hidden and draft records)

### Moderate Project
- **Method / Path**: `PATCH /admin/projects/{project_id}/moderate`
- **Auth**: Required (`admin` role)
- **Request Body**: `{ "is_hidden": true, "is_featured": false }`
- **Response**: `200 OK`

### User Account Controls
- **Method / Path**: `GET /admin/users` (List all users)
- **Method / Path**: `PATCH /admin/users/{user_id}/status` (Activate/deactivate or promote roles)
- **Auth**: Required (`admin` role)

### Moderation Queue
- **Method / Path**: `GET /admin/reports` (List all submitted reports)
- **Method / Path**: `PATCH /admin/reports/{report_id}` (Update status to `'reviewed'` or `'dismissed'`)
- **Auth**: Required (`admin` role)

### Categories
- `GET /categories`: Public list of disciplines.
- `POST /categories`: Admin create new category.
- `DELETE /categories/{category_id}`: Admin delete category.

---

## 7. File Upload Endpoint (`/upload`)

### Upload Image
- **Method / Path**: `POST /upload/image`
- **Auth**: Required
- **Content-Type**: `multipart/form-data`
- **Body**: Form field `file` containing image binary (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, &le; 5MB)
- **Response**: `200 OK`
  ```json
  {
    "url": "/uploads/a1b2c3d4e5f6.webp",
    "filename": "a1b2c3d4e5f6.webp"
  }
  ```
