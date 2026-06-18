from fastapi import APIRouter

# --- OCR Types ---
from app.schema import OCRRequest, OCRServiceRequest, OllamaTranslateRequest

# --- OCR Service ---
from app.services import PaddleOCRService, OllamaService

# --- OCR Router ---
from app.routers import ApiResponse

router = APIRouter()


@router.post("")
async def process_ocr(request: OCRRequest) -> ApiResponse:
    orc_request = OCRServiceRequest(
        base64_text=request.base64_text,
        ocr_lang=request.ocr_lang,
    )
    ocr_result = await PaddleOCRService.get_ocr(orc_request)

    if request.model is None:
        """"""
    else:
        translate_request = OllamaTranslateRequest(
            model=request.model,
            text=ocr_result.text,
            source_lang=request.source_lang,
            source_code=request.source_code,
            target_lang=request.target_lang,
            target_code=request.target_code,
            category=request.category,
            tone=request.tone,
        )
        translate_result = await OllamaService.translate(translate_request)

    return ApiResponse(success=True, message="OCR processed successfully.", data=translate_result)
