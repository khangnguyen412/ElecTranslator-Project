from fastapi import APIRouter

# --- OCR Types ---
from app.schema import OCRRequest, OCRResponse, ErrorResponse

# --- OCR Service ---
from app.services import PaddleOCRService

# --- OCR Router ---
from app.routers import ApiResponse

router = APIRouter()


@router.post("/")
async def process_ocr(request: OCRRequest) -> ApiResponse:
    return ApiResponse(success=True, message="OCR processed successfully.", data=await PaddleOCRService.get_ocr(request))
