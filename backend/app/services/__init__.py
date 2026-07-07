from .ocr_service import PaddleOCRService
from .translate_service import TranslationService
from .ai_service import AiService

__all__ = [
    "PaddleOCRService",
    "TranslationService",
    "AiService",
]

SERVICE_VERSION = "v.1.0"
