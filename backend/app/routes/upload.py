import os
import uuid
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status

from .. import auth, models

router = APIRouter()

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

# Define uploads directory relative to backend or root
uploads_dir = Path(__file__).resolve().parents[2] / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)


@router.post("/upload/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_user),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB.",
        )

    # Secure random filename
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = uploads_dir / unique_filename

    with open(file_path, "wb") as f:
        f.write(content)

    return {
        "url": f"/uploads/{unique_filename}",
        "filename": unique_filename,
    }
