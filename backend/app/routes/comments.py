from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from .. import schemas, models, auth
from ..database import get_db

router = APIRouter()


@router.get("/projects/{project_id}/comments", response_model=List[schemas.ProjectCommentRead])
def get_project_comments(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    comments = db.query(models.ProjectComment).filter(
        models.ProjectComment.project_id == project_id
    ).order_by(desc(models.ProjectComment.created_at)).all()

    result = []
    for c in comments:
        result.append({
            "id": c.id,
            "project_id": c.project_id,
            "user_id": c.user_id,
            "content": c.content,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "user_name": c.user.name if c.user else "Anonymous",
            "user_avatar": c.user.avatar_url if c.user else None,
            "user_role": c.user.role if c.user else "student",
        })
    return result


@router.post("/projects/{project_id}/comments", response_model=schemas.ProjectCommentRead, status_code=status.HTTP_201_CREATED)
def add_project_comment(
    project_id: int,
    comment_in: schemas.ProjectCommentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    if project.is_hidden:
        raise HTTPException(status_code=400, detail="Cannot comment on a hidden project.")

    comment = models.ProjectComment(
        project_id=project_id,
        user_id=current_user.id,
        content=comment_in.content.strip(),
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return {
        "id": comment.id,
        "project_id": comment.project_id,
        "user_id": comment.user_id,
        "content": comment.content,
        "created_at": comment.created_at,
        "updated_at": comment.updated_at,
        "user_name": current_user.name,
        "user_avatar": current_user.avatar_url,
        "user_role": current_user.role,
    }


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    comment = db.query(models.ProjectComment).filter(models.ProjectComment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found.")

    is_owner = comment.user_id == current_user.id
    is_admin = current_user.role == "admin"
    if not (is_owner or is_admin):
        raise HTTPException(status_code=403, detail="You do not have permission to delete this comment.")

    db.delete(comment)
    db.commit()
    return None
