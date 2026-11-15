from fastapi.concurrency import run_in_threadpool
from deep_translator import MyMemoryTranslator

# --- Translate Types ---
from app.schema import TranslateRequest, TranslateResponse, ErrorResponse

# --- Translate Exceptions ---
from app.exceptions import AppException

# Normalize common language codes to deep_translator-compatible codes
_LANG_TO_LOCALE = {
    "en": "en-GB",
    "vi": "vi-VN",
    "zh": "zh-CN",
    "zho": "zh-CN",
    "chi": "zh-CN",
    "zh-hans": "zh-CN",
    "zh-hant": "zh-TW",
    "ja": "ja-JP",
    "ko": "ko-KR",
    "th": "th-TH",
    "fr": "fr-FR",
    "de": "de-DE",
    "es": "es-ES",
    "it": "it-IT",
    "pt": "pt-PT",
    "ru": "ru-RU",
    "id": "id-ID",
    "hi": "hi-IN",
    "ar": "ar-SA",
}


class TranslationService:
    """
    Service class for handling text translation using deep_translator's MyMemoryTranslator.
    """

    translator: MyMemoryTranslator | None = None

    @staticmethod
    def _normalize_lang_code(code: str) -> str:
        """Map incoming language codes to deep_translator-supported codes."""
        return _LANG_TO_LOCALE.get(code.lower(), code)

    @classmethod
    def _get_translator(cls, source_code: str, target_code: str) -> MyMemoryTranslator:
        """
        Get or create a translator instance with the specified languages.
        """
        if cls.translator is None or cls.translator.source != source_code or cls.translator.target != target_code:
            cls.translator = MyMemoryTranslator(source=source_code, target=target_code)
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
            src = TranslationService._normalize_lang_code(request.source_code)
            tgt = TranslationService._normalize_lang_code(request.target_code)
            translator = TranslationService._get_translator(src, tgt)
            translated_text = await run_in_threadpool(translator.translate, request.text)
            return TranslateResponse(source_text=request.text, translated_text=translated_text)
        except Exception as e:
            raise AppException(status_code=502, error_code="CONNECTION_REFUSED", message="AI server is not active or connection refused", error=str(e))