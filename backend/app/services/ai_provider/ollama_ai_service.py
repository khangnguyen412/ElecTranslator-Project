from httpx import AsyncClient, HTTPStatusError, ConnectError, TimeoutException
from .base_service import BaseAIService
from app.schema import AiTranslateRequest, AiTranslateResponse
from app.exceptions import AppException


class OllamaService(BaseAIService):
    async def translate(self, request: AiTranslateRequest) -> AiTranslateResponse:
        text = (request.text or "").strip()
        if not text:
            raise AppException(400, "INVALID_REQUEST", "Translation text is required")

        base_url = (request.url or "").strip().rstrip("/")
        endpoint = f"{base_url}/api/chat" if not base_url.endswith("/api/chat") else base_url

        headers = {"Content-Type": "application/json"}
        payload = {"model": request.model, "messages": [{"role": "system", "content": self._build_prompt(request)}, {"role": "user", "content": text}], "stream": False}

        try:
            async with AsyncClient(timeout=120) as client:  # Ollama local can be slow
                response = await client.post(endpoint, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()

                message = data.get("message", {})
                full_text = self._get_final_text(message.get("content"))
                if not full_text:
                    raise AppException(502, "INVALID_RESPONSE", "No content in Ollama response")
                return AiTranslateResponse(source_text=text, translated_text=full_text)

        except HTTPStatusError as e:
            raise AppException(e.response.status_code, "PROVIDER_ERROR", str(e))

        except ConnectError:
            raise AppException(502, "CONNECT_ERROR", "Ollama server is not active or connection refused")

        except TimeoutException:
            raise AppException(504, "GATEWAY_TIMEOUT", "Ollama server timed out")

        except Exception as e:
            raise AppException(500, "UNKNOWN_ERROR", str(e))
