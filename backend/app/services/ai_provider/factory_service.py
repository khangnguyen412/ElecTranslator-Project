from .base_service import BaseAIService
from .openai_ai_service import OpenAIService
from .anthropic_ai_service import AnthropicService
from .google_ai_service import GoogleService
from .ninerouter_ai_service import NineRouterService

class AIServiceFactory:
    @staticmethod
    def get_service(provider: str) -> BaseAIService:
        provider = (provider or "").lower().strip()
        
        # Group 1: OpenAI Compatible
        if provider in ["openai", "deepseek", "qwen", "nvidia", "openrouter"]:
            return OpenAIService()
            
        # Group 2: Anthropic
        elif provider in ["anthropic", "claude"]:
            return AnthropicService()
            
        # Group 3: Google Native
        elif provider in ["google", "gemini", "gemma"]:
            return GoogleService()
            
        # Group 4: Ollama Local
        # elif provider in ["ollama", "local"]:
        #     return OllamaService()

        elif provider in ["9router", "9route"]:
            return NineRouterService()
            
        # Fallback: OpenAI Compatible
        return OpenAIService()