from google import genai
from google.genai import types
from google.genai.errors import ClientError, ServerError
from .base_service import BaseAIService
from app.schema import AiTranslateRequest, AiTranslateResponse
from app.exceptions import AppException


class GoogleService(BaseAIService):
    async def translate(self, request: AiTranslateRequest) -> AiTranslateResponse:
        """
        Translate text using Google AI model.
        """
        # Check request text
        text = (request.text or "").strip()
        if not text:
            raise AppException(400, "INVALID_REQUEST", "Translation text is required")

        # Check request model_name
        model_name = (request.model or "").strip()
        if not model_name:
            raise AppException(400, "INVALID_REQUEST", "Model name is required")

        # Check request api_key
        api_key = (request.api_key or "").strip()

        # Validate API key format
        if not api_key:
            raise AppException(400, "INVALID_API_KEY", "Google API key is required")

        if not api_key.startswith("AIza"):
            raise AppException(400, "INVALID_API_KEY", f"Invalid Google API key format. Key should start with 'AIza'. Got: {api_key[:10]}...")

        # Create client Google
        try:
            # Method 1: Direct API call
            client = genai.Client(api_key=api_key)
        except Exception as e:
            raise AppException(500, "CLIENT_INIT_ERROR", f"Failed to initialize Google client: {str(e)}")

        prompt = self._build_prompt(request)

        try:
            # Use async client to avoid blocking FastAPI event loop
            response = await client.aio.models.generate_content(model=model_name, contents=text, config=types.GenerateContentConfig(system_instruction=prompt, temperature=0.1))

            # Check Prompt-level Block (Input blocked)
            if response.prompt_feedback and response.prompt_feedback.block_reason:
                block_reason = str(response.prompt_feedback.block_reason.name).upper()
                raise AppException(400, block_reason, self._get_blocked_message(block_reason))

            # Check Candidate-level Block & Extract Text
            if not response.candidates:
                raise AppException(502, "INVALID_RESPONSE", "No candidates in Google response")

            candidate = response.candidates[0]

            # Check finish reason (Output blocked for safety, copyright...)
            if candidate.finish_reason and str(candidate.finish_reason.name).upper() in self.BLOCKED_MESSAGES:
                finish_reason = str(candidate.finish_reason.name).upper()
                raise AppException(400, finish_reason, self._get_blocked_message(finish_reason))

            # SDK provides .text property to get the full response text
            full_text = response.text
            if not full_text:
                raise AppException(502, "INVALID_RESPONSE", "Empty response text from Google")
            return AiTranslateResponse(source_text=text, translated_text=full_text.strip())

        except ClientError as e:
            message = str(e.message or e)
            status_code = e.code or 400

            # Check status_code directly or related keywords (auth, credentials, key)
            if status_code == 401 or "invalid authentication credentials" in message.lower() or "api key not valid" in message.lower():
                raise AppException(401, "INVALID_API_KEY", "Google API Key is invalid, expired, missing, or incorrect configuration.")

            if status_code == 404 or "not found" in message.lower():
                raise AppException(404, "MODEL_NOT_FOUND", f"Model '{model_name}' does not exist.")
            raise AppException(status_code, "PROVIDER_ERROR", message)

        except ServerError as e:
            # Handle Google Server errors
            raise AppException(e.code or 502, "PROVIDER_ERROR", str(e.message or e))

        except AppException:
            raise
        except Exception as e:
            raise AppException(500, "UNKNOWN_ERROR", f"Translation failed unexpectedly: {str(e)}")
