from httpx import AsyncClient, HTTPStatusError, ConnectError, TimeoutException
from .base_service import BaseAIService
from app.schema import AiTranslateRequest, AiTranslateResponse
from app.exceptions import AppException


class NineRouterService(BaseAIService):
    """
    9Router translation service using direct REST API calls (OpenAI Compatible format).

    This service uses httpx instead of the OpenAI SDK for:
    - Better control over request/response handling
    - Custom header support for 9Router-specific features
    - Reduced dependency on external SDK

    API Format: OpenAI Compatible
    - Endpoint: {base_url}/chat/completions
    - Auth: Bearer token in Authorization header
    - Payload: messages array with system/user roles
    """

    async def translate(self, request: AiTranslateRequest) -> AiTranslateResponse:
        '''
        Translate text using 9Router.
        '''
        # Check request text
        text = (request.text or "").strip()
        if not text:
            raise AppException(status_code=400, error_code="INVALID_REQUEST", message="Translation text is required")

        # Check request base_url
        base_url = (request.url or "").strip().rstrip("/")
        if not base_url:
            raise AppException(status_code=400, error_code="INVALID_REQUEST", message="9Router provider URL is required")

        # Build endpoint
        if base_url.endswith("/chat/completions"):
            endpoint = base_url
        else:
            endpoint = f"{base_url}/chat/completions"
        
        # Check request model
        model = (request.model or "").strip()
        if not model:
            raise AppException(status_code=400, error_code="INVALID_REQUEST", message="Model name is required for 9Router")

        # Headers
        headers = {"Content-Type": "application/json", "Authorization": f"Bearer {request.api_key}"}

        # Build prompt
        prompt = self._build_prompt(request)

        # Payload (OpenAI Compatible format)
        payload = {"model": model, "messages": [{"role": "system", "content": prompt}, {"role": "user", "content": text}], "stream": False, "temperature": 0.1}

        try:
            async with AsyncClient(timeout=60) as client:
                response = await client.post(endpoint, json=payload, headers=headers)
                response.raise_for_status()

                # Parse JSON response
                try:
                    data = response.json()
                except Exception:
                    raise AppException(status_code=502, error_code="INVALID_RESPONSE", message="9Router returned non-JSON response", error=getattr(response, "text", "")[:1000])

                if not isinstance(data, dict):
                    raise AppException(status_code=502, error_code="INVALID_RESPONSE", message="9Router returned invalid JSON structure")

                # Check for content blocking
                self._check_blocked(data)

                # Extract response following OpenAI Compatible format
                choices = data.get("choices")

                if not choices or not isinstance(choices, list):
                    raise AppException(status_code=502, error_code="INVALID_RESPONSE", message="No choices in 9Router response")

                choice = choices[0]
                if not isinstance(choice, dict):
                    raise AppException(status_code=502, error_code="INVALID_RESPONSE", message="Invalid choice object in 9Router response")

                # Check finish_reason for blocking
                finish_reason = str(choice.get("finish_reason") or "").upper()
                if finish_reason in self.BLOCKED_MESSAGES:
                    raise AppException(status_code=400, error_code=finish_reason, message=self._get_blocked_message(finish_reason))

                # Extract message content
                message = choice.get("message") or {}
                if not isinstance(message, dict):
                    raise AppException(status_code=502, error_code="INVALID_RESPONSE", message="Invalid message object in 9Router response")

                # Check for refusal
                refusal = message.get("refusal")
                if refusal:
                    raise AppException(status_code=400, error_code="CONTENT_BLOCKED", message=str(refusal))

                # Extract text content
                content = message.get("content")
                full_text = self._get_final_text(content)

                if not full_text:
                    raise AppException(status_code=502, error_code="INVALID_RESPONSE", message="No content in 9Router response")

                return AiTranslateResponse(source_text=text, translated_text=full_text)

        except HTTPStatusError as e:
            resp = e.response
            status_code = resp.status_code if resp is not None else 502
            code = "PROVIDER_ERROR"
            message = str(e)

            try:
                err_data = resp.json()
            except Exception:
                err_data = {}
                raw_text = getattr(resp, "text", "") or ""
                if raw_text:
                    message = raw_text[:1000]

            if isinstance(err_data, dict):
                # Check for content blocking in error response
                self._check_blocked(err_data)

                # Extract error details
                inner_error = err_data.get("error", {})
                if isinstance(inner_error, dict):
                    code = str(inner_error.get("code") or code)
                    message = str(inner_error.get("message") or message)
                else:
                    message = str(err_data.get("message") or err_data.get("detail") or err_data or message)

            # Specific error handling
            if status_code == 401:
                code = "INVALID_API_KEY"
                message = "9Router API key is invalid or expired"
            elif status_code == 403:
                code = "PERMISSION_DENIED"
                message = "API key does not have permission to use this model"
            elif status_code == 404:
                code = "MODEL_NOT_FOUND"
                message = f"Model '{model}' does not exist on 9Router"
            elif status_code == 429:
                code = "RATE_LIMIT_EXCEEDED"
                message = "9Router API rate limit exceeded. Please wait and retry."
            raise AppException(status_code=status_code, error_code=code, message=message)

        except ConnectError as e:
            raise AppException(status_code=502, error_code="CONNECT_ERROR", message="9Router server connection refused", error=str(e))

        except TimeoutException as e:
            raise AppException(status_code=504, error_code="GATEWAY_TIMEOUT", message="9Router server request timed out (60s)", error=str(e))

        except AppException:
            raise

        except Exception as e:
            raise AppException(status_code=500, error_code="UNKNOWN_ERROR", message=f"Translation failed unexpectedly: {str(e)}", error=str(e))
