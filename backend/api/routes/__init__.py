from fastapi import APIRouter
from api.routes import auth, opportunities, profiles, tracker, admin, password

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(opportunities.router, prefix="/opportunities", tags=["opportunities"])
api_router.include_router(profiles.router, prefix="/profiles", tags=["profiles"])
api_router.include_router(tracker.router, prefix="/tracker", tags=["tracker"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(password.router, prefix="/auth", tags=["password"])
