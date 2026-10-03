from abc import ABC, abstractmethod
from typing import Any

# --- AI Types ---
from app.schema import AiTranslateRequest, AiTranslateResponse

# --- AI Exceptions ---
from app.exceptions import AppException


class BaseAIService(ABC):
    BLOCKED_MESSAGES = {
        "BLOCK_REASON_UNSPECIFIED": "Content blocked for an unspecified reason.",
        "SAFETY": "Content blocked due to safety filter violation (SAFETY).",
        "OTHER": "Content blocked for another unknown reason (OTHER).",
        "BLOCKLIST": "Content contains prohibited keywords from the blocklist (BLOCKLIST).",
        "PROHIBITED_CONTENT": "Content blocked due to usage policy violation (PROHIBITED_CONTENT).",
        "IMAGE_SAFETY": "Input image blocked due to safety policy violation (IMAGE_SAFETY).",
        "IMAGE_PROHIBITED_CONTENT": "Generated image blocked due to policy violation.",
        "IMAGE_OTHER": "Generated image blocked for another reason.",
        "IMAGE_RECITATION": "Generated image blocked due to copyright violation.",
        "NO_IMAGE": "Unable to generate the requested image.",
        "RECITATION": "Generated content blocked due to copyright violation.",
        "SPII": "Content blocked because it contains sensitive personally identifiable information.",
        "LANGUAGE": "The language of the content is not supported.",
        "MALFORMED_FUNCTION_CALL": "Model function or tool call error.",
        "CONTENT_FILTER": "Content blocked by the content filter.",
        "CONTENT_POLICY_VIOLATION": "Content violates the content policy.",
    }

    _SPECIFIC_MESSAGE_BLOCK_REASONS = [
        "PROHIBITED_CONTENT",
        "CONTENT_POLICY_VIOLATION",
        "CONTENT_FILTER",
        "SAFETY",
        "IMAGE_SAFETY",
        "BLOCKLIST",
    ]

    @abstractmethod
    async def translate(self, request: AiTranslateRequest) -> AiTranslateResponse:
        pass

    def _build_prompt(self, request: AiTranslateRequest) -> str:
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

        criticalHint = f"[`CRITICAL] Output MUST be strictly in {request.target_lang}.`"
        Rule1 = 'SFX/emotions ONLY → natural English interjections (e.g., "Ah!", "Ouch!"); preserve tone/pacing. Never translate SFX to target language.'
        Rule2 = "If the word is a proper noun, translate it using English, never translate to target language."

        ruleHint = f"Rule: {criticalHint} {Rule1} {Rule2}." if request.category == "comic" else f"Rule: {criticalHint}."
        return f"You are a professional translator from {request.source_lang} to {request.target_lang}. Text type: {typeHint} Tone: {toneHint} {ruleHint} Output ONLY the translated text. Do not include quotes, notes, explanations, or English sentences."

    def _get_block_reason(self, data: dict) -> str | None:
        """
        Get the block reason from the provider's response data.

        ### Returns:
            The block reason as a string, or None if not found.
        """
        if not isinstance(data, dict):
            return None

        # Check prompt feedback from other providers
        prompt_feedback = data.get("promptFeedback")
        if isinstance(prompt_feedback, dict):
            block_reason = prompt_feedback.get("blockReason")
            if block_reason:
                return str(block_reason).upper()

        # Check candidates from Google AI
        candidates = data.get("candidates")
        if isinstance(candidates, list) and candidates:
            finish_reason = str((candidates[0] or {}).get("finishReason") or "").upper()
            if finish_reason in self.BLOCKED_MESSAGES:
                return finish_reason

        # Check choices from OpenAI
        choices = data.get("choices")
        if isinstance(choices, list) and choices:
            finish_reason = str((choices[0] or {}).get("finish_reason") or (choices[0] or {}).get("finishReason") or "").upper()
            if finish_reason in self.BLOCKED_MESSAGES:
                return finish_reason
            if finish_reason in {"BLOCKED", "FILTERED"}:
                return "CONTENT_FILTER"

        for key in ("message", "detail"):
            value = data.get(key)
            if isinstance(value, str):
                upper_value = value.upper()
                for reason in self._SPECIFIC_MESSAGE_BLOCK_REASONS:
                    if reason in upper_value:
                        return reason

        error = data.get("error")

        if isinstance(error, dict):
            code = str(error.get("code") or "").upper()
            message = str(error.get("message") or "").upper()
            for reason in self.BLOCKED_MESSAGES.keys():
                if reason in code:
                    return reason
            for reason in self._SPECIFIC_MESSAGE_BLOCK_REASONS:
                if reason in message:
                    return reason
        return None

    def _get_blocked_message(self, block_reason: str) -> str:
        return self.BLOCKED_MESSAGES.get(str(block_reason).upper(), f"Content blocked by provider safety filter: {block_reason}")

    def _check_blocked(self, data: dict) -> None:
        """
        Check if the response content is blocked by the provider's safety filter.

        ### Raises:
            AppException: If the content is blocked.
        """
        block_reason = self._get_block_reason(data)
        if not block_reason:
            return
        error_code = block_reason if block_reason in self.BLOCKED_MESSAGES else "CONTENT_BLOCKED"
        raise AppException(status_code=400, error_code=error_code, message=self._get_blocked_message(block_reason))

    def _get_final_text(self, content: Any) -> str:
        """
        Extract the final translated text from the provider's response content.

        ### Returns:
            The final translated text.
        """
        if content is None:
            return ""
        if isinstance(content, str):
            return content.strip()
        if isinstance(content, list):
            texts = []
            for part in content:
                if isinstance(part, str):
                    texts.append(part)
                elif isinstance(part, dict):
                    text = part.get("text") or part.get("output_text") or ""
                    if text:
                        texts.append(str(text))
            return "\n".join(texts).strip()
        if isinstance(content, dict):
            return str(content.get("text") or "").strip()
        return str(content).strip()
