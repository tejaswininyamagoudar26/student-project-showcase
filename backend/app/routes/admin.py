from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from .. import schemas, models, auth
from ..database import get_db
from .projects import enrich_project_data

router = APIRouter()


class ModerateProjectPayload(BaseModel):
    is_hidden: Optional[bool] = None
    is_featured: Optional[bool] = None


class UserStatusPayload(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[str] = None


class ReportStatusPayload(BaseModel):
    status: str  # "pending", "reviewed", "dismissed"


# ---------------------------------------------------------------------------
# Categories (Public GET, Admin write)
# ---------------------------------------------------------------------------

@router.get("/categories", response_model=List[schemas.CategoryRead])
def list_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).order_by(models.Category.name).all()


@router.post("/categories", response_model=schemas.CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(auth.get_current_admin),
):
    existing = db.query(models.Category).filter(
        (models.Category.name == category_in.name) | (models.Category.slug == category_in.slug)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Category name or slug already exists.")

    category = models.Category(
        name=category_in.name.strip(),
        slug=category_in.slug.strip().lower(),
        description=category_in.description,
        icon=category_in.icon,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(auth.get_current_admin),
):
    cat = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found.")
    db.delete(cat)
    db.commit()
    return None


# ---------------------------------------------------------------------------
# Admin Endpoints
# ---------------------------------------------------------------------------

@router.get("/admin/stats", response_model=schemas.AdminStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(auth.get_current_admin),
):
    total_users = db.query(func.count(models.User.id)).scalar() or 0
    total_projects = db.query(func.count(models.Project.id)).scalar() or 0
    published_projects = db.query(func.count(models.Project.id)).filter(models.Project.status == "published").scalar() or 0
    pending_reports = db.query(func.count(models.ProjectReport.id)).filter(models.ProjectReport.status == "pending").scalar() or 0
    total_categories = db.query(func.count(models.Category.id)).scalar() or 0

    return {
        "total_users": total_users,
        "total_projects": total_projects,
        "published_projects": published_projects,
        "pending_reports": pending_reports,
        "total_categories": total_categories,
    }


@router.get("/admin/projects", response_model=List[schemas.ProjectRead])
def get_all_projects_for_admin(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(auth.get_current_admin),
):
    query = db.query(models.Project)
    if status_filter:
        query = query.filter(models.Project.status == status_filter)
    projects = query.order_by(desc(models.Project.created_at)).all()
    return [enrich_project_data(p, db, admin_user) for p in projects]


@router.patch("/admin/projects/{project_id}/moderate", response_model=schemas.ProjectDetail)
def moderate_project(
    project_id: int,
    payload: ModerateProjectPayload,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(auth.get_current_admin),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    if payload.is_hidden is not None:
        project.is_hidden = payload.is_hidden
    if payload.is_featured is not None:
        project.is_featured = payload.is_featured

    db.commit()
    db.refresh(project)
    return enrich_project_data(project, db, admin_user)


@router.get("/admin/users", response_model=List[schemas.UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(auth.get_current_admin),
):
    return db.query(models.User).order_by(desc(models.User.created_at)).all()


@router.patch("/admin/users/{user_id}/status", response_model=schemas.UserResponse)
def update_user_status(
    user_id: int,
    payload: UserStatusPayload,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(auth.get_current_admin),
):
    target_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    if target_user.id == admin_user.id and payload.is_active is False:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own administrator account.")

    if payload.is_active is not None:
        target_user.is_active = payload.is_active
    if payload.role is not None and payload.role in ["student", "admin"]:
        target_user.role = payload.role

    db.commit()
    db.refresh(target_user)
    return target_user


@router.get("/admin/reports", response_model=List[schemas.ProjectReportRead])
def get_reports(
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(auth.get_current_admin),
):
    reports = db.query(models.ProjectReport).order_by(desc(models.ProjectReport.created_at)).all()
    result = []
    for r in reports:
        result.append({
            "id": r.id,
            "project_id": r.project_id,
            "user_id": r.user_id,
            "reason": r.reason,
            "status": r.status,
            "created_at": r.created_at,
            "project_title": r.project.title if r.project else "Deleted Project",
            "reporter_name": r.user.name if r.user else "Unknown",
        })
    return result


@router.patch("/admin/reports/{report_id}", response_model=schemas.ProjectReportRead)
def update_report_status(
    report_id: int,
    payload: ReportStatusPayload,
    db: Session = Depends(get_db),
    admin_user: models.User = Depends(auth.get_current_admin),
):
    report = db.query(models.ProjectReport).filter(models.ProjectReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    if payload.status in ["pending", "reviewed", "dismissed"]:
        report.status = payload.status

    db.commit()
    db.refresh(report)

    return {
        "id": report.id,
        "project_id": report.project_id,
        "user_id": report.user_id,
        "reason": report.reason,
        "status": report.status,
        "created_at": report.created_at,
        "project_title": report.project.title if report.project else "Deleted Project",
        "reporter_name": report.user.name if report.user else "Unknown",
    }
