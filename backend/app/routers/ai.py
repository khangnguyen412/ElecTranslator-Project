from fastapi import APIRouter

# --- OCR Types ---
from app.schema import AiTranslateRequest

# --- OCR Service ---
from app.services import AiService

# --- OCR Router ---
from app.routers import ApiResponse

router = APIRouter()


@router.post("/translate")
async def process_ai_translate(request: AiTranslateRequest) -> ApiResponse:
    return ApiResponse(success=True, message="Translation successful", data=await AiService.translate(request))


@router.get("/status")
async def process_status(base_url: str = "http://localhost:11434", api_key: str = "") -> ApiResponse:
    result = await AiService.check_active(base_url, api_key)
    return ApiResponse(success=True, message="Status checked", data=result)
