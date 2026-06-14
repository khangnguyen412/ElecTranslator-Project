from pydantic import BaseModel, Field


class OllamaTranslateRequest(BaseModel):
    model: str = Field(default="translategemma:12b", description="The model to use.")
    text: str = Field(default=None, description="Text to translate.")
    sourceLang: str = Field(default="english", description="The source language code.")
    sourceCode: str = Field(default="en", description="The source language code.")
    targetLang: str = Field(default="vietnamese", description="The target language code.")
    targetCode: str = Field(default="vi", description="The target language code.")
    category: str = Field(default="default", description="The category of translation.")
    tone: str = Field(default="default", description="The tone of translation.")


class OllamaTranslateResponse(BaseModel):
    text: str = Field(default=None, description="Translated text.")


class OllamaStatusResponse(BaseModel):
    status: str = Field(default=None, description="The status of the server.")


class OllamaModelResponse(BaseModel):
    model: list = Field(default={"name": str, "model": str}, description="The list of models.")
