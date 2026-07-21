import requests
import httpx


from app.schema import AiTranslateRequest, AiTranslateResponse, AiStatusResponse, AiModelResponse, ErrorResponse
from app.exceptions import AppException, ServiceConnectionError


class AiService:
    _model: str = ""

    def __init__(self):
        pass

    @staticmethod
    def _detect_provider(request: AiTranslateRequest) -> str:
        """
        Detect the provider based on the request provider name.
        ### Parameters:
        - request: AiTranslateRequest - The request object containing the translation details.
        ### Returns:
        - str: The detected provider name.
        """
        provider = request.provider.lower().strip()
        if provider in ("google", "gemini", "gemma"):
            return "google"
        return provider

    @staticmethod
    def _parse_google_response(data: dict) -> str:
        """
        Parse Google Gemini/Gemma API response (interaction object).
        Find step type='model_output' → content[0].text
        """
        steps = data.get("steps", [])
        for step in steps:
            if step.get("type") == "model_output":
                content = step.get("content", [])
                if content and isinstance(content, list) and len(content) > 0:
                    text = content[0].get("text", "")
                    if text:
                        return text
        raise AppException(status_code=502, error_code="INVALID_RESPONSE", message="No model_output content found in Google API response")

    @classmethod
    def _build_prompt(cls, request: AiTranslateRequest) -> str:
        """
        Build the prompt for the translation.
        ### Parameters:
        - request: AiTranslateRequest - The request object containing the translation details.
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

        criticalHint = f"[`CRITICAL] Output MUST be strictly in ${request.target_lang}.`"
        Rule1 = 'SFX/emotions ONLY → natural English interjections (e.g., "Ah!", "Ouch!"); preserve tone/pacing. Never translate SFX to target language.'
        Rule2 = "If the word is a proper noun, translate it using English, never translate to target language."

        if request.category == "comic":
            ruleHint = f"Rule: {criticalHint} {Rule1} {Rule2}."
        else:
            ruleHint = f"Rule: {criticalHint}."
        return f"You are a professional translator from {request.source_lang} to {request.target_lang}. Text type: {typeHint} ${toneHint}${ruleHint}Output ONLY the translated text. Do not include quotes, notes, explanations, or English sentences."

    @staticmethod
    async def translate(request: AiTranslateRequest) -> AiTranslateResponse | ErrorResponse:
        """
        Translate text using AI model.
        ### Returns
            AiTranslateResponse with translated text or ErrorResponse if failed
        """
        # Detect provider
        provider = AiService._detect_provider(request)

        headers = {"Content-Type": "application/json"}
        if provider == "google":
            headers["x-goog-api-key"] = request.api_key
        else:
            headers["Authorization"] = f"Bearer {request.api_key}"

        prompt = AiService._build_prompt(request)
        if provider == "google":
            payload = {
                "model": request.model or AiService._model,
                "input": f"{prompt}\n\n Content: '{request.text}'",
                "stream": False,
            }
        else:
            payload = {
                "model": request.model or AiService._model,
                "messages": [
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": request.text},
                ],
                "stream": False,
            }

        # Determine endpoint based on provider
        if provider == "google":
            endpoint = f"{request.url.rstrip('/')}"
        else:
            endpoint = f"{request.url.rstrip('/')}/chat/completions"

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(endpoint, json=payload, headers=headers, timeout=30)
                response.raise_for_status()
                data = response.json()

                if provider == "google":
                    full_text = AiService._parse_google_response(data)
                else:
                    full_text = data["choices"][0]["message"]["content"]

            return AiTranslateResponse(source_text=request.text, translated_text=full_text)
        except Exception as e:
            raise AppException(status_code=502, error_code="CONNECTION_REFUSED", message="AI server is not active or connection refused", error=str(e))

    @staticmethod
    async def check_active(base_url: str, api_key: str) -> AiStatusResponse | ErrorResponse:
        """
        Check if the AI server is active.
        ### Returns
            AiStatusResponse with status or ErrorResponse if failed
        """
        try:
            # Use endpoint /api/tags for Ollama, /models for OpenAI-compatible
            check_url = f"{base_url.rstrip('/')}/models" if "api.openai" in base_url else f"{base_url.rstrip('/')}/api/tags"

            headers = {"Content-Type": "application/json"}
            if api_key:
                headers["Authorization"] = f"Bearer {api_key}"

            response = requests.get(check_url, headers=headers, timeout=30)
            if response.status_code == 200:
                return AiStatusResponse(status="success")
            else:
                raise ServiceConnectionError(message="AI server is not active", error=str(response.status_code))
        except Exception as e:
            raise ServiceConnectionError(message="AI server is not active", error=str(e))
