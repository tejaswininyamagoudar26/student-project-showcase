from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    UniqueConstraint,
    Index,
)
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="student", nullable=False)  # "student", "admin"
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    college = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    skills = Column(String(500), nullable=True)  # Comma-separated tags
    github_url = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")
    favorites = relationship("ProjectFavorite", back_populates="user", cascade="all, delete-orphan")
    likes = relationship("ProjectLike", back_populates="user", cascade="all, delete-orphan")
    comments = relationship("ProjectComment", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email}>"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    short_description = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    problem_statement = Column(Text, nullable=True)
    proposed_solution = Column(Text, nullable=True)
    category = Column(String(100), nullable=True, index=True)
    technology = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)
    demo_url = Column(String(255), nullable=True)
    image_url = Column(String(500), nullable=True)
    screenshots = Column(Text, nullable=True)  # JSON-encoded array of screenshot URLs
    status = Column(String(50), default="published", nullable=False, index=True)  # "draft", "published"
    is_featured = Column(Boolean, default=False, nullable=False, index=True)
    is_hidden = Column(Boolean, default=False, nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    owner = relationship("User", back_populates="projects")
    favorites = relationship("ProjectFavorite", back_populates="project", cascade="all, delete-orphan")
    likes = relationship("ProjectLike", back_populates="project", cascade="all, delete-orphan")
    comments = relationship("ProjectComment", back_populates="project", cascade="all, delete-orphan", order_by="ProjectComment.created_at.desc()")
    reports = relationship("ProjectReport", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Project id={self.id} title={self.title}>"


class ProjectFavorite(Base):
    __tablename__ = "project_favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="favorites")
    project = relationship("Project", back_populates="favorites")

    __table_args__ = (
        UniqueConstraint("user_id", "project_id", name="uq_user_project_favorite"),
    )


class ProjectLike(Base):
    __tablename__ = "project_likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="likes")
    project = relationship("Project", back_populates="likes")

    __table_args__ = (
        UniqueConstraint("user_id", "project_id", name="uq_user_project_like"),
    )


class ProjectComment(Base):
    __tablename__ = "project_comments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="comments")
    project = relationship("Project", back_populates="comments")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    icon = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ProjectReport(Base):
    __tablename__ = "project_reports"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reason = Column(Text, nullable=False)
    status = Column(String(50), default="pending", nullable=False)  # "pending", "reviewed", "dismissed"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    project = relationship("Project", back_populates="reports")
    user = relationship("User")


class ProjectIdea(Base):
    __tablename__ = "project_ideas"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100))
    submitted_by = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<ProjectIdea id={self.id} title={self.title}>"
