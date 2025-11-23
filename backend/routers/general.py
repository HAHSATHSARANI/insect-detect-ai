from fastapi import APIRouter
from database import client

router = APIRouter(
    tags=["General"]
)

@router.get("/")
def root():
    return {"message": "Farmer Admin API running", "version": "1.0.0"}


@router.get("/api/health")
def health_check():
    try:
        client.admin.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}
