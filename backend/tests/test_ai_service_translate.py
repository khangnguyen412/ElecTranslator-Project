import pytest
import httpx
from unittest.mock import patch, AsyncMock, MagicMock
from app.schema import AiTranslateRequest, AiTranslateResponse, AiStatusResponse, AiModelResponse, ErrorResponse
from app.services.ai_service import AiService
from app.exceptions import AppException


@pytest.fixture
def sample_request():
    return AiTranslateRequest(
        text="hello",
        source_lang="english",
        target_lang="vietnamese",
        url="http://localhost:11434",
        model="translategemma:12b",
        category="comic",
        tone="casual",
        api_key="",
    )


class TestAiServiceTranslate:
    @pytest.mark.asyncio
    async def test_translate_success(self, sample_request):
        # Create fake response
        mock_response = MagicMock()
        mock_response.status_code = 200  # Add attribute to mock_response
        mock_response.json.return_value = {"choices": [{"message": {"content": "xin chào"}}]}  # Add attribute to mock_response (add to data)

        # Replace the real httpx.AsyncClient.post with an AsyncMock
        # to prevent actual network requests during the test
        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.return_value = mock_response  # when httpx.AsyncClient.post is called, return mock_response
            result = await AiService.translate(sample_request)

        assert result.translated_text == "xin chào"  # Check translated_text is correct
        assert result.source_text == "hello"  # Check source_text is correct

    @pytest.mark.asyncio
    async def test_translate_connection_refused(self, sample_request):
        # Replace the real httpx.AsyncClient.post with an AsyncMock
        # to prevent actual network requests during the test
        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.side_effect = httpx.ConnectTimeout("connect timeout")
            with pytest.raises(AppException) as exc_info:
                await AiService.translate(sample_request)

        assert exc_info.value.status_code == 502  # Check status_code is correct
        assert exc_info.value.error_code == "CONNECTION_REFUSED"  # Check error_code is correct
