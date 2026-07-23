from fastapi import APIRouter

# --- Translate Types ---
from app.schema import TranslateRequest

# --- Translate Service ---
from app.services import TranslationService

# --- OCR Router ---
from app.routers import ApiResponse

router = APIRouter()


@router.post("/")
async def process_translate(request: TranslateRequest) -> ApiResponse:
    return ApiResponse(success=True, message="Translation successful", data=await TranslationService.translate(request))
