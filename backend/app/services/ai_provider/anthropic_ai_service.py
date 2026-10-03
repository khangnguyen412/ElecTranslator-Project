from anthropic import AsyncAnthropic, APIStatusError, APIConnectionError, APITimeoutError
from .base_service import BaseAIService
from app.schema import AiTranslateRequest, AiTranslateResponse
from app.exceptions import AppException


class AnthropicService(BaseAIService):
    """
    Anthropic (Claude) translation service using official SDK.

    Handles all stop_reason values according to Claude's official documentation:
    - end_turn: Success
    - max_tokens: Response truncated
    - stop_sequence: Custom stop sequence hit
    - tool_use: Not used for translation
    - pause_turn: Not used for translation
    - refusal: Content blocked (CRITICAL - must throw exception)
    - model_context_window_exceeded: Context window limit reached
    """

    async def translate(self, request: AiTranslateRequest) -> AiTranslateResponse:
        """
        Translate text using Anthropic (Claude, ...) model.
        """
        # Check request text
        text = (request.text or "").strip()
        if not text:
            raise AppException(400, "INVALID_REQUEST", "Translation text is required")

        # Check request base_url
        base_url = (request.url or "").strip().rstrip("/")

        # Create client with base_url if provided
        client = AsyncAnthropic(api_key=request.api_key, base_url=base_url if base_url else None, timeout=60.0)

        # Build prompt
        prompt = self._build_prompt(request)

        try:
            # System prompt is outside messages in Anthropic's API
            response = await client.messages.create(model=request.model, max_tokens=4096, system=prompt, messages=[{"role": "user", "content": text}])

            # Check stop_reason
            stop_reason = response.stop_reason

            # Handle refusal (content blocked)
            if stop_reason == "refusal":
                # stop_details contains the policy category that triggered refusal
                stop_details = getattr(response, "stop_details", None)
                refusal_message = "Content blocked by Claude safety classifier"

                if stop_details:
                    # Extract refusal reason from stop_details
                    if hasattr(stop_details, "reason"):
                        refusal_message = f"Content blocked: {stop_details.reason}"
                    elif isinstance(stop_details, dict):
                        refusal_message = f"Content blocked: {stop_details.get('reason', 'unknown')}"
                    else:
                        refusal_message = f"Content blocked: {str(stop_details)}"
                raise AppException(status_code=400, error_code="CONTENT_BLOCKED", message=refusal_message, error=str(stop_details) if stop_details else None)

            # Handle empty response with end_turn
            if stop_reason == "end_turn" and not response.content:
                raise AppException(status_code=502, error_code="EMPTY_RESPONSE", message="Claude returned an empty response. This may occur due to message structure issues.")

            # Extract text from response.content
            # response.content is a list of blocks, we only want text blocks
            full_text = ""
            text_blocks = []

            for block in response.content:
                if block.type == "text":
                    text_blocks.append(block.text)

            full_text = "\n".join(text_blocks).strip()

            # Handle truncation cases
            truncation_notice = ""

            if stop_reason == "max_tokens":
                truncation_notice = "\n\n[Response truncated due to max_tokens limit]"
            elif stop_reason == "model_context_window_exceeded":
                truncation_notice = "\n\n[Response truncated due to context window limit]"

            # Validate response content
            if not full_text:
                # Check if response only contains non-text blocks (e.g., tool_use)
                block_types = [block.type for block in response.content]
                if "tool_use" in block_types:
                    raise AppException(status_code=502, error_code="INVALID_RESPONSE", message="Claude returned tool_use blocks instead of text. This is unexpected for translation.")
                raise AppException(status_code=502, error_code="INVALID_RESPONSE", message=f"No text content in Claude response. Block types: {block_types}")

            # Append truncation notice if needed
            if truncation_notice:
                full_text += truncation_notice
            return AiTranslateResponse(source_text=text, translated_text=full_text)

        except APIConnectionError as e:
            raise AppException(status_code=502, error_code="CONNECT_ERROR", message="Connection to Anthropic API refused. Check your network and API URL.", error=str(e))

        except APITimeoutError as e:
            raise AppException(status_code=504, error_code="GATEWAY_TIMEOUT", message="Anthropic API request timed out (60s)", error=str(e))

        except APIStatusError as e:
            # HTTP 4xx/5xx errors (distinct from stop_reason)
            status = e.status_code or 502
            code = "PROVIDER_ERROR"
            message = str(e.message or e)

            # Specific error handling
            if status == 401:
                code = "INVALID_API_KEY"
                message = "Anthropic API key is invalid or expired. Get a key at https://console.anthropic.com/"
            elif status == 403:
                code = "PERMISSION_DENIED"
                message = "API key does not have permission to use this model"
            elif status == 404:
                code = "MODEL_NOT_FOUND"
                message = f"Model '{request.model}' does not exist. Check available models at https://docs.anthropic.com/en/docs/about-claude/models"
            elif status == 429:
                code = "RATE_LIMIT_EXCEEDED"
                message = "Anthropic API rate limit exceeded. Please wait and retry."
            elif status == 529:
                code = "SERVICE_OVERLOADED"
                message = "Anthropic service is currently overloaded. Please try again later."
            raise AppException(status_code=status, error_code=code, message=message, error=str(e))

        except AppException:
            raise

        except Exception as e:
            raise AppException(status_code=500, error_code="UNKNOWN_ERROR", message=f"Translation failed unexpectedly: {str(e)}", error=str(e))
