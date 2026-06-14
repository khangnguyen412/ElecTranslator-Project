from fastapi import APIRouter

# --- OCR Types ---
from app.schema import OllamaTranslateRequest

# --- OCR Service ---
from app.services import OllamaService

# --- OCR Router ---
from app.routers import ApiResponse

router = APIRouter()


@router.post("/translate")
async def process_ollama_translate(request: OllamaTranslateRequest) -> ApiResponse:
    return ApiResponse(success=True, message="Translation successful", data=await OllamaService.translate(request))


@router.get("/status")
async def process_status() -> ApiResponse:
    result = await OllamaService.check_active()
    return ApiResponse(success=True, message="Status checked", data=result)


@router.get("/model")
async def process_model() -> ApiResponse:
    return ApiResponse(success=True, message="Model checked", data=await OllamaService.check_model())
