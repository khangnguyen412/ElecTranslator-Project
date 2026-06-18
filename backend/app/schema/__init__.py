from .orc_schema import OCRRequest, OCRServiceRequest, OCRResponse
from .translate_schema import TranslateRequest, TranslateResponse
from .ollama_schema import OllamaTranslateRequest, OllamaTranslateResponse, OllamaModelResponse, OllamaStatusResponse
from .error_schema import ErrorResponse
from .health_schema import HealthResponse

__all__ = [ 
    "OCRRequest",
    "OCRServiceRequest",
    "OCRResponse",
    "TranslateRequest",
    "TranslateResponse",
    "OllamaTranslateRequest",
    "OllamaTranslateResponse",
    "OllamaStatusResponse",
    "OllamaModelResponse",
    "ErrorResponse",
    "HealthResponse",
]

SCHEMA_VERSION = "v.1.0"
