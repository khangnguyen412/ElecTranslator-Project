from deep_translator import GoogleTranslator

# --- Translate Types ---
from app.schema import TranslateRequest, TranslateResponse, ErrorResponse

# --- Translate Exceptions ---
from app.exceptions import AppException

# Normalize common language codes to deep_translator-compatible codes
LANGUAGE_CODE_MAP = {
    # Chinese variants
    "zh-Hans": "zh-CN",
    "zh-Hant": "zh-TW",
    "zh": "zh-CN",
    "zho": "zh-CN",
    "chi": "zh-CN",
    # You can extend this as needed
}

def _normalize_lang_code(code: str) -> str:
    """Map incoming language codes to deep_translator-supported codes."""
    return LANGUAGE_CODE_MAP.get(code, code)


class TranslationService:
    """
    Service class for handling text translation using Google Translator.
    """
    translator = None

    def __init__(self):
        pass

    @classmethod
    def _get_translator(cls, source_code: str, target_code: str) -> GoogleTranslator:
        """
        Get or create a translator instance with the specified languages.
        """
        if cls.translator is None or cls.translator.source != source_code or cls.translator.target != target_code:
            cls.translator = GoogleTranslator(source=source_code, target=target_code)
        return cls.translator

    @staticmethod
    async def translate(request: TranslateRequest) -> TranslateResponse | ErrorResponse:
        """
        Translate text from source language to target language.
        ### Args
            request: TranslateRequest containing source text and language codes
        ### Returns
            TranslateResponse with translated text or ErrorResponse if failed
        """
        try:
            src = _normalize_lang_code(request.source_code)
            tgt = _normalize_lang_code(request.target_code)
            translator = TranslationService._get_translator(src, tgt)
            translated_text = translator.translate(request.text)
            return TranslateResponse(source_text=request.text, translated_text=translated_text)
        except Exception as e:
            raise AppException(status_code=502, error_code="CONNECTION_REFUSED", message="AI server is not active or connection refused", error=str(e))