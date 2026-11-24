from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from .. import schemas, models, auth
from ..database import get_db
from .projects import enrich_project_data

router = APIRouter()


@router.get("/students/{user_id}", response_model=schemas.UserPublicResponse)
def get_student_profile(user_id: int, db: Session = Depends(get_db)):
    student = db.query(models.User).filter(models.User.id == user_id, models.User.is_active == True).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found.")
    return student


@router.get("/students/{user_id}/projects", response_model=List[schemas.ProjectRead])
def get_student_projects(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_optional_current_user),
):
    student = db.query(models.User).filter(models.User.id == user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found.")

    query = db.query(models.Project).filter(
        models.Project.user_id == user_id,
        models.Project.status == "published",
        models.Project.is_hidden == False,
    ).order_by(desc(models.Project.created_at))

    projects = query.all()
    return [enrich_project_data(p, db, current_user) for p in projects]


@router.get("/students/me/profile", response_model=schemas.UserResponse)
def get_my_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


@router.put("/students/me/profile", response_model=schemas.UserResponse)
def update_my_profile(
    profile_in: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    update_data = profile_in.model_dump(exclude_unset=True) if hasattr(profile_in, "model_dump") else profile_in.dict(exclude_unset=True)

    for field, val in update_data.items():
        if field in ["github_url", "linkedin_url"] and val:
            val = str(val).strip()
        setattr(current_user, field, val)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    total = db.query(func.count(models.Project.id)).filter(models.Project.user_id == current_user.id).scalar() or 0
    published = db.query(func.count(models.Project.id)).filter(
        models.Project.user_id == current_user.id,
        models.Project.status == "published",
    ).scalar() or 0
    drafts = db.query(func.count(models.Project.id)).filter(
        models.Project.user_id == current_user.id,
        models.Project.status == "draft",
    ).scalar() or 0

    # Total likes received on user's projects
    user_project_ids = [p.id for p in db.query(models.Project.id).filter(models.Project.user_id == current_user.id).all()]
    total_likes = 0
    if user_project_ids:
        total_likes = db.query(func.count(models.ProjectLike.id)).filter(
            models.ProjectLike.project_id.in_(user_project_ids)
        ).scalar() or 0

    total_favorites = db.query(func.count(models.ProjectFavorite.id)).filter(
        models.ProjectFavorite.user_id == current_user.id
    ).scalar() or 0

    return {
        "total_projects": total,
        "published_projects": published,
        "draft_projects": drafts,
        "total_likes": total_likes,
        "total_favorites": total_favorites,
    }


@router.get("/dashboard/projects", response_model=List[schemas.ProjectRead])
def get_dashboard_projects(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    projects = db.query(models.Project).filter(
        models.Project.user_id == current_user.id
    ).order_by(desc(models.Project.updated_at)).all()

    return [enrich_project_data(p, db, current_user) for p in projects]


@router.get("/favorites", response_model=List[schemas.ProjectRead])
def get_user_favorites(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    favorites = db.query(models.ProjectFavorite).filter(
        models.ProjectFavorite.user_id == current_user.id
    ).order_by(desc(models.ProjectFavorite.created_at)).all()

    project_list = []
    for fav in favorites:
        if fav.project and not fav.project.is_hidden:
            project_list.append(enrich_project_data(fav.project, db, current_user))

    return project_list
