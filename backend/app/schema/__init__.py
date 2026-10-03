from .ocr_schema import OCRRequest, OCRResponse
from .translate_schema import TranslateRequest, TranslateResponse
from .ai_schema import AiTranslateRequest, AiTranslateResponse
from .error_schema import ErrorResponse
from .health_schema import HealthResponse

__all__ = [ 
    "OCRRequest",
    "OCRResponse",
    "TranslateRequest",
    "TranslateResponse",
    "AiTranslateRequest",
    "AiTranslateResponse",
    "ErrorResponse",
    "HealthResponse",
]

SCHEMA_VERSION = "v.1.0"
