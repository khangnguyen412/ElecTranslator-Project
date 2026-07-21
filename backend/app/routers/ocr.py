from fastapi import APIRouter

# --- OCR Types ---
from app.schema import OCRRequest, OCRServiceRequest, AiTranslateRequest, OCRResponse

# --- OCR Service ---
from app.services import PaddleOCRService, AiService

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

    if request.mode == "Normal":
        translate_result = OCRResponse(text=ocr_result.text if hasattr(ocr_result, 'text') else "")
    else:
        translate_request = AiTranslateRequest(
            provider=request.provider,
            model=request.model,
            url=request.url,
            api_key=request.api_key,
            text=ocr_result.text,
            source_lang=request.source_lang,
            source_code=request.source_code,
            target_lang=request.target_lang,
            target_code=request.target_code,
            category=request.category,
            tone=request.tone,
        )
        translate_result = await AiService.translate(translate_request)

    return ApiResponse(success=True, message="OCR processed successfully.", data=translate_result)
