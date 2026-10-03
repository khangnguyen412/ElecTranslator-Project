# --- Translate Types ---
from app.schema import AiTranslateRequest, AiTranslateResponse

# --- Provider Factory ---
from app.services.ai_provider import AIServiceFactory

class AiService:
    """
    Wrapper class to maintain backward compatibility with existing routers.
    Delegates actual translation logic to specific AI services via Factory Pattern.
    """
    
    @staticmethod
    async def translate(request: AiTranslateRequest) -> AiTranslateResponse:
        # Get provider from request
        provider = request.provider or "openai"
        
        # Factory automatically selects the correct service (OpenAI, Anthropic, Google, Ollama...)
        service = AIServiceFactory.get_service(provider)
        
        # Execute translate
        return await service.translate(request)