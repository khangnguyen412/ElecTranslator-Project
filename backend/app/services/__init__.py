from .ocr_service import PaddleOCRService
from .translate_service import TranslationService
from .ollama_service import OllamaService

__all__ = [
    "PaddleOCRService",
    "TranslationService",
    "OllamaService",
]

SERVICE_VERSION = "v.1.0"
