from .api_response import ApiResponse, T
from .ocr import router as process_ocr
from .translate import router as process_translate
from .ai import router as process_ai_translate

__all__ = [
    "ApiResponse",
    "process_ocr",
    "process_translate",
    "process_ai_translate",
]

ROUTER_VERSION = "v.1.0"
