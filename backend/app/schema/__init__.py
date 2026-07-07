from .orc_schema import OCRRequest, OCRServiceRequest, OCRResponse
from .translate_schema import TranslateRequest, TranslateResponse
from .ai_schema import AiTranslateRequest, AiTranslateResponse, AiModelResponse, AiStatusResponse
from .error_schema import ErrorResponse
from .health_schema import HealthResponse

__all__ = [ 
    "OCRRequest",
    "OCRServiceRequest",
    "OCRResponse",
    "TranslateRequest",
    "TranslateResponse",
    "AiTranslateRequest",
    "AiTranslateResponse",
    "AiStatusResponse",
    "AiModelResponse",
    "ErrorResponse",
    "HealthResponse",
]

SCHEMA_VERSION = "v.1.0"
