from fastapi import APIRouter

# --- OCR Types ---
from app.schema import OCRRequest

# --- OCR Service ---
from app.services import PaddleOCRService

# --- OCR Router ---
from app.routers import ApiResponse

router = APIRouter()


@router.post("")
async def process_ocr(request: OCRRequest) -> ApiResponse:
    ocr_result = await PaddleOCRService.get_ocr(request)
    return ApiResponse(success=True, message="OCR processed successfully.", data=ocr_result)
