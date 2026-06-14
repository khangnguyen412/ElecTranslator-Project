from fastapi import APIRouter

# --- Translate Types ---
from app.schema import TranslateRequest, TranslateResponse

# --- Translate Service ---
from app.services import TranslationService

router = APIRouter()

@router.post("/")
async def process_translate(request: TranslateRequest) -> TranslateResponse:
    return await TranslationService.translate(request)
