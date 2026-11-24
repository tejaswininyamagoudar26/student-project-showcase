from typing import Optional, List
from math import ceil
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, func

from .. import schemas, models, auth
from ..database import get_db

router = APIRouter()


def enrich_project_data(project: models.Project, db: Session, current_user: Optional[models.User] = None) -> dict:
    likes_count = db.query(func.count(models.ProjectLike.id)).filter(models.ProjectLike.project_id == project.id).scalar() or 0
    favorites_count = db.query(func.count(models.ProjectFavorite.id)).filter(models.ProjectFavorite.project_id == project.id).scalar() or 0
    comments_count = db.query(func.count(models.ProjectComment.id)).filter(models.ProjectComment.project_id == project.id).scalar() or 0

    is_liked = False
    is_favorited = False
    if current_user:
        is_liked = db.query(models.ProjectLike).filter(
            models.ProjectLike.project_id == project.id,
            models.ProjectLike.user_id == current_user.id
        ).first() is not None

        is_favorited = db.query(models.ProjectFavorite).filter(
            models.ProjectFavorite.project_id == project.id,
            models.ProjectFavorite.user_id == current_user.id
        ).first() is not None

    owner_name = project.owner.name if project.owner else None
    owner_avatar = project.owner.avatar_url if project.owner else None

    return {
        "id": project.id,
        "title": project.title,
        "short_description": project.short_description or (project.description[:180] + "..." if project.description and len(project.description) > 180 else project.description),
        "description": project.description,
        "problem_statement": project.problem_statement,
        "proposed_solution": project.proposed_solution,
        "category": project.category,
        "technology": project.technology,
        "github_url": project.github_url,
        "demo_url": project.demo_url,
        "image_url": project.image_url,
        "screenshots": project.screenshots,
        "status": project.status,
        "is_featured": project.is_featured,
        "is_hidden": project.is_hidden,
        "user_id": project.user_id,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "likes_count": likes_count,
        "favorites_count": favorites_count,
        "comments_count": comments_count,
        "owner_name": owner_name,
        "owner_avatar": owner_avatar,
        "is_liked": is_liked,
        "is_favorited": is_favorited,
        "owner": project.owner,
    }


@router.get("/projects", response_model=schemas.ProjectListResponse)
def list_projects(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(9, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in title, description, or tech"),
    category: Optional[str] = Query(None, description="Filter by category"),
    technology: Optional[str] = Query(None, description="Filter by technology tag"),
    sort: Optional[str] = Query("newest", description="Sort order: newest, oldest, title, likes"),
    is_featured: Optional[bool] = Query(None, description="Filter featured projects"),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_current_user),
):
    query = db.query(models.Project).filter(
        models.Project.status == "published",
        models.Project.is_hidden == False,
    )

    if category:
        query = query.filter(models.Project.category.ilike(f"%{category.strip()}%"))

    if technology:
        query = query.filter(models.Project.technology.ilike(f"%{technology.strip()}%"))

    if is_featured is not None:
        query = query.filter(models.Project.is_featured == is_featured)

    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                models.Project.title.ilike(search_pattern),
                models.Project.short_description.ilike(search_pattern),
                models.Project.description.ilike(search_pattern),
                models.Project.technology.ilike(search_pattern),
            )
        )

    # Sorting
    if sort == "oldest":
        query = query.order_by(asc(models.Project.created_at))
    elif sort == "title":
        query = query.order_by(asc(models.Project.title))
    elif sort == "likes":
        query = query.outerjoin(models.ProjectLike).group_by(models.Project.id).order_by(desc(func.count(models.ProjectLike.id)))
    else:  # "newest" default
        query = query.order_by(desc(models.Project.created_at))

    total = query.count()
    offset = (page - 1) * page_size
    projects = query.offset(offset).limit(page_size).all()
    total_pages = ceil(total / page_size) if total > 0 else 1

    enriched = [enrich_project_data(p, db, current_user) for p in projects]

    return {
        "projects": enriched,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


@router.get("/projects/featured", response_model=List[schemas.ProjectRead])
def get_featured_projects(
    limit: int = Query(6, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_current_user),
):
    """Retrieve featured projects, falling back to recent published projects."""
    featured = db.query(models.Project).filter(
        models.Project.status == "published",
        models.Project.is_hidden == False,
        models.Project.is_featured == True,
    ).order_by(desc(models.Project.created_at)).limit(limit).all()

    if len(featured) < limit:
        needed = limit - len(featured)
        existing_ids = [p.id for p in featured]
        fallback_query = db.query(models.Project).filter(
            models.Project.status == "published",
            models.Project.is_hidden == False,
        )
        if existing_ids:
            fallback_query = fallback_query.filter(models.Project.id.notin_(existing_ids))
        fallback = fallback_query.order_by(desc(models.Project.created_at)).limit(needed).all()
        featured.extend(fallback)

    return [enrich_project_data(p, db, current_user) for p in featured]


@router.get("/projects/{project_id}", response_model=schemas.ProjectDetail)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_optional_current_user),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    # If hidden or draft, only owner or admin can view
    is_owner = current_user and current_user.id == project.user_id
    is_admin = current_user and current_user.role == "admin"
    if (project.is_hidden or project.status == "draft") and not (is_owner or is_admin):
        raise HTTPException(status_code=404, detail="Project not found or is currently private.")

    return enrich_project_data(project, db, current_user)


@router.post("/projects", response_model=schemas.ProjectDetail, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    # Set short description if not provided
    short_desc = project_in.short_description
    if not short_desc and project_in.description:
        short_desc = project_in.description[:180]

    db_project = models.Project(
        title=project_in.title.strip(),
        short_description=short_desc,
        description=project_in.description,
        problem_statement=project_in.problem_statement,
        proposed_solution=project_in.proposed_solution,
        category=project_in.category,
        technology=project_in.technology,
        github_url=str(project_in.github_url).strip() if project_in.github_url else None,
        demo_url=str(project_in.demo_url).strip() if project_in.demo_url else None,
        image_url=project_in.image_url,
        screenshots=project_in.screenshots,
        status=project_in.status if project_in.status in ["draft", "published"] else "published",
        user_id=current_user.id,
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    return enrich_project_data(db_project, db, current_user)


@router.put("/projects/{project_id}", response_model=schemas.ProjectDetail)
def update_project(
    project_id: int,
    project_in: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found.")

    is_owner = db_project.user_id == current_user.id
    is_admin = current_user.role == "admin"
    if not (is_owner or is_admin):
        raise HTTPException(status_code=403, detail="You do not have permission to modify this project.")

    update_data = project_in.model_dump(exclude_unset=True) if hasattr(project_in, "model_dump") else project_in.dict(exclude_unset=True)
    
    # Non-admins cannot alter is_featured directly
    if not is_admin and "is_featured" in update_data:
        del update_data["is_featured"]

    for key, value in update_data.items():
        setattr(db_project, key, value)

    db.commit()
    db.refresh(db_project)
    return enrich_project_data(db_project, db, current_user)


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found.")

    is_owner = db_project.user_id == current_user.id
    is_admin = current_user.role == "admin"
    if not (is_owner or is_admin):
        raise HTTPException(status_code=403, detail="You do not have permission to delete this project.")

    db.delete(db_project)
    db.commit()
    return None


# ---------------------------------------------------------------------------
# Project Likes & Favorites
# ---------------------------------------------------------------------------

@router.post("/projects/{project_id}/like", response_model=schemas.LikeStatusResponse)
def like_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    existing_like = db.query(models.ProjectLike).filter(
        models.ProjectLike.project_id == project_id,
        models.ProjectLike.user_id == current_user.id
    ).first()

    if not existing_like:
        new_like = models.ProjectLike(project_id=project_id, user_id=current_user.id)
        db.add(new_like)
        db.commit()

    likes_count = db.query(func.count(models.ProjectLike.id)).filter(models.ProjectLike.project_id == project_id).scalar() or 0
    return {"project_id": project_id, "is_liked": True, "likes_count": likes_count}


@router.delete("/projects/{project_id}/like", response_model=schemas.LikeStatusResponse)
def unlike_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    existing_like = db.query(models.ProjectLike).filter(
        models.ProjectLike.project_id == project_id,
        models.ProjectLike.user_id == current_user.id
    ).first()

    if existing_like:
        db.delete(existing_like)
        db.commit()

    likes_count = db.query(func.count(models.ProjectLike.id)).filter(models.ProjectLike.project_id == project_id).scalar() or 0
    return {"project_id": project_id, "is_liked": False, "likes_count": likes_count}


@router.post("/projects/{project_id}/favorite", response_model=schemas.FavoriteStatusResponse)
def favorite_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    existing_fav = db.query(models.ProjectFavorite).filter(
        models.ProjectFavorite.project_id == project_id,
        models.ProjectFavorite.user_id == current_user.id
    ).first()

    if not existing_fav:
        new_fav = models.ProjectFavorite(project_id=project_id, user_id=current_user.id)
        db.add(new_fav)
        db.commit()

    favorites_count = db.query(func.count(models.ProjectFavorite.id)).filter(models.ProjectFavorite.project_id == project_id).scalar() or 0
    return {"project_id": project_id, "is_favorited": True, "favorites_count": favorites_count}


@router.delete("/projects/{project_id}/favorite", response_model=schemas.FavoriteStatusResponse)
def unfavorite_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    existing_fav = db.query(models.ProjectFavorite).filter(
        models.ProjectFavorite.project_id == project_id,
        models.ProjectFavorite.user_id == current_user.id
    ).first()

    if existing_fav:
        db.delete(existing_fav)
        db.commit()

    favorites_count = db.query(func.count(models.ProjectFavorite.id)).filter(models.ProjectFavorite.project_id == project_id).scalar() or 0
    return {"project_id": project_id, "is_favorited": False, "favorites_count": favorites_count}


@router.post("/projects/{project_id}/report", response_model=schemas.ProjectReportRead, status_code=status.HTTP_201_CREATED)
def report_project(
    project_id: int,
    report_in: schemas.ProjectReportCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    report = models.ProjectReport(
        project_id=project_id,
        user_id=current_user.id,
        reason=report_in.reason.strip(),
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "id": report.id,
        "project_id": report.project_id,
        "user_id": report.user_id,
        "reason": report.reason,
        "status": report.status,
        "created_at": report.created_at,
        "project_title": project.title,
        "reporter_name": current_user.name,
    }
