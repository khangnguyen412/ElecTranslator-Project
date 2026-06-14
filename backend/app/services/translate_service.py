from deep_translator import GoogleTranslator

# --- Translate Types ---
from app.schema import TranslateRequest, TranslateResponse, ErrorResponse

# --- Translate Exceptions ---
from app.exceptions import AppException

class TranslationService:
    """
    Service class for handling text translation using Google Translator.
    """

    def __init__(self):
        self.translator = None

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
            translator = TranslationService._get_translator(request.sourceCode, request.targetCode)
            translated_text = translator.translate(request.text)
            return TranslateResponse(success=True, text=translated_text)
        except Exception as e:
            raise AppException(message="Translation failed", detail=str(e))
