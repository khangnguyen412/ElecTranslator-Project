import requests
import httpx


from app.schema import OllamaTranslateRequest, OllamaTranslateResponse, OllamaStatusResponse, OllamaModelResponse, ErrorResponse
from app.exceptions import AppException, ServiceConnectionError


class OllamaService:

    _model: str = ""
    _base_url: str = "http://localhost:11434"

    def __init__(self):
        pass

    @classmethod
    def _build_prompt(cls, request: OllamaTranslateRequest) -> str:
        """
        Build the prompt for the translation.
        ### Parameters:
        - request: OllamaTranslateRequest - The request object containing the translation details.
        ### Returns:
        - str: The prompt string.
        """

        match request.category:
            case "comic":
                typeHint = "Concise; fit speech bubbles."
            case "novel":
                typeHint = "Preserve pacing/imagery; no literal translation."
            case "email":
                typeHint = "Standard greeting/sign-off; clear body."
            case "subtitles":
                typeHint = "Preserve pacing/imagery; no literal translation."
            case "technical":
                typeHint = "Strict industry terminology & accuracy."
            case _:
                typeHint = "default"

        match request.tone:
            case "casual":
                toneHint = "Casual, natural; minimal honorifics."
            case "action_adventure":
                toneHint = "High-energy, fast-paced; focus on action/suspense."
            case "formal":
                toneHint = "Formal grammar; suitable for authority/aristocracy."
            case "dramatic":
                toneHint = "Tense, emotional; short, punchy sentences."
            case "comedic":
                toneHint = "Humorous, witty; preserve wordplay."
            case "romantic":
                toneHint = "Gentle, affectionate; subtle, non-vulgar."
            case "fantasy_isekai":
                toneHint = "Magical, adventurous; world-building terms."
            case "scifi_mecha":
                toneHint = "Futuristic, technical jargon; sci-fi/mecha context."
            case _:
                toneHint = "Accurate nuance; natural story flow."

        criticalHint = f"[`CRITICAL] Output MUST be strictly in ${request.targetLang}.`"
        Rule1 = 'SFX/emotions ONLY → natural English interjections (e.g., "Ah!", "Ouch!"); preserve tone/pacing. Never translate SFX to target language.'
        Rule2 = "If the word is a proper noun, translate it using English, never translate to target language."

        if request.category == "comic":
            ruleHint = f"Rule: {criticalHint} {Rule1} {Rule2}."
        else:
            ruleHint = f"Rule: {criticalHint}."
        return f"You are a professional translator from {request.sourceLang} to {request.targetLang}. Text type: {typeHint} ${toneHint}${ruleHint}Output ONLY the translated text. Do not include quotes, notes, explanations, or English sentences."

    @staticmethod
    async def translate(request: OllamaTranslateRequest) -> OllamaTranslateResponse | ErrorResponse:
        """
        Translate text using Ollama model.
        ### Returns
            OllamaTranslateResponse with translated text or ErrorResponse if failed
        """
        prompt = OllamaService._build_prompt(request)
        payload = {"model": request.model or OllamaService._model, "messages": [{"role": "system", "content": prompt}, {"role": "user", "content": request.text}], "stream": False}

        try:
            response = requests.post(f"{OllamaService._base_url}/api/chat", json=payload, timeout=30)
            full_text = response.json()["message"]["content"]
            return OllamaTranslateResponse(text=full_text)
        except Exception as e:
            raise AppException(error_code=400, status_code="BAD_REQUEST", message="Ollama server is not active", detail=str(e))

    @staticmethod
    async def check_active() -> OllamaStatusResponse | ErrorResponse:
        """
        Check if the ollama server is active.
        ### Returns
            OllamaStatusResponse with status or ErrorResponse if failed
        """
        try:
            response = requests.get(f"{OllamaService._base_url}")
            if response.status_code == 200:
                return OllamaStatusResponse(status="success")
            else:
                raise ServiceConnectionError(message="Ollama server is not active", detail=str(response.status_code))
        except Exception as e:
            raise ServiceConnectionError(message="Ollama server is not active", detail=str(e))

    @staticmethod
    async def check_model() -> OllamaModelResponse | ErrorResponse:
        """
        Check if the model exists.
        ### Returns
            OllamaModelResponse with model list or ErrorResponse if failed
        """
        try:
            response = requests.get(f"{OllamaService._base_url}/api/tags")
            response.raise_for_status()
            result = response.json()
            return OllamaModelResponse(model=result["models"])
        except Exception as e:
            raise ServiceConnectionError(message="Ollama server is not active")
