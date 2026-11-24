from pydantic import BaseModel, EmailStr, Field, HttpUrl
from datetime import datetime
from typing import Optional, List


# ---------------------------------------------------------------------------
# User Schemas
# ---------------------------------------------------------------------------

class RegisterUser(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    role: Optional[str] = "student"


class LoginUser(BaseModel):
    email: EmailStr
    password: str


class UserPublicResponse(BaseModel):
    id: int
    name: str
    role: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    graduation_year: Optional[int] = None
    skills: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserResponse(UserPublicResponse):
    email: EmailStr
    is_active: bool
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    graduation_year: Optional[int] = None
    skills: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[UserResponse] = None


# ---------------------------------------------------------------------------
# Category Schemas
# ---------------------------------------------------------------------------

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    icon: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryRead(CategoryBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Project Schemas
# ---------------------------------------------------------------------------

class ProjectBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    short_description: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    problem_statement: Optional[str] = None
    proposed_solution: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    technology: Optional[str] = Field(None, max_length=255)
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    image_url: Optional[str] = None
    screenshots: Optional[str] = None
    status: Optional[str] = "published"  # "draft" | "published"


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    short_description: Optional[str] = Field(None, max_length=500)
    description: Optional[str] = None
    problem_statement: Optional[str] = None
    proposed_solution: Optional[str] = None
    category: Optional[str] = None
    technology: Optional[str] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    image_url: Optional[str] = None
    screenshots: Optional[str] = None
    status: Optional[str] = None
    is_featured: Optional[bool] = None


class ProjectRead(ProjectBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    is_featured: bool = False
    is_hidden: bool = False
    likes_count: int = 0
    favorites_count: int = 0
    comments_count: int = 0
    owner_name: Optional[str] = None
    owner_avatar: Optional[str] = None

    model_config = {"from_attributes": True}


class ProjectDetail(ProjectRead):
    owner: Optional[UserPublicResponse] = None
    is_liked: bool = False
    is_favorited: bool = False


class ProjectListResponse(BaseModel):
    projects: List[ProjectRead]
    total: int
    page: int
    page_size: int
    total_pages: int


# ---------------------------------------------------------------------------
# Comment Schemas
# ---------------------------------------------------------------------------

class ProjectCommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


class ProjectCommentRead(BaseModel):
    id: int
    project_id: int
    user_id: int
    content: str
    created_at: datetime
    updated_at: datetime
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None
    user_role: Optional[str] = "student"

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Favorite & Like Schemas
# ---------------------------------------------------------------------------

class ProjectFavoriteRead(BaseModel):
    id: int
    project_id: int
    user_id: int
    created_at: datetime
    project: Optional[ProjectRead] = None

    model_config = {"from_attributes": True}


class LikeStatusResponse(BaseModel):
    project_id: int
    is_liked: bool
    likes_count: int


class FavoriteStatusResponse(BaseModel):
    project_id: int
    is_favorited: bool
    favorites_count: int


# ---------------------------------------------------------------------------
# Moderation / Report Schemas
# ---------------------------------------------------------------------------

class ProjectReportCreate(BaseModel):
    reason: str = Field(..., min_length=5, max_length=1000)


class ProjectReportRead(BaseModel):
    id: int
    project_id: int
    user_id: int
    reason: str
    status: str
    created_at: datetime
    project_title: Optional[str] = None
    reporter_name: Optional[str] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Dashboard Stats
# ---------------------------------------------------------------------------

class DashboardStats(BaseModel):
    total_projects: int
    published_projects: int
    draft_projects: int
    total_likes: int
    total_favorites: int


class AdminStats(BaseModel):
    total_users: int
    total_projects: int
    published_projects: int
    pending_reports: int
    total_categories: int
