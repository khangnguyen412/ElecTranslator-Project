from openai import AsyncOpenAI, APIError, APIConnectionError, APITimeoutError
from .base_service import BaseAIService
from app.schema import AiTranslateRequest, AiTranslateResponse
from app.exceptions import AppException


class OpenAIService(BaseAIService):
    async def translate(self, request: AiTranslateRequest) -> AiTranslateResponse:
        text = (request.text or "").strip()
        if not text:
            raise AppException(400, "INVALID_REQUEST", "Translation text is required")

        base_url = (request.url or "").strip().rstrip("/")
        if not base_url:
            raise AppException(400, "INVALID_REQUEST", "AI provider URL is required")

        # Create client OpenAI
        client = AsyncOpenAI(api_key=request.api_key or "dummy", base_url=base_url, timeout=60.0)

        prompt = self._build_prompt(request)

        try:
            response = await client.chat.completions.create(model=request.model, messages=[{"role": "system", "content": prompt}, {"role": "user", "content": text}], temperature=0.1)

            if not response.choices:
                raise AppException(502, "INVALID_RESPONSE", "No choices in response")

            message = response.choices[0].message
            if getattr(message, "refusal", None):
                raise AppException(400, "CONTENT_BLOCKED", message.refusal)

            full_text = self._get_final_text(message.content)
            if not full_text:
                raise AppException(502, "INVALID_RESPONSE", "No content in response")
            return AiTranslateResponse(source_text=text, translated_text=full_text)

        except APIConnectionError as e:
            raise AppException(502, "CONNECT_ERROR", "AI server connection refused", str(e))

        except APITimeoutError as e:
            raise AppException(504, "GATEWAY_TIMEOUT", "AI server request timed out", str(e))

        except APIError as e:
            code = e.code or "PROVIDER_ERROR"
            message = e.message or str(e)
            status = e.status_code or 502
            if "content_filter" in message.lower() or code == "content_filter":
                raise AppException(400, "CONTENT_FILTER", self._get_blocked_message("CONTENT_FILTER"))
            if status == 429:
                raise AppException(429, "RATE_LIMIT_EXCEEDED", "AI provider rate limit exceeded or insufficient balance", message)
            raise AppException(status, code, message)

        except Exception as e:
            raise AppException(500, "UNKNOWN_ERROR", "Translation failed unexpectedly", str(e))
