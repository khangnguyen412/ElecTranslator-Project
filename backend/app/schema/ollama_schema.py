from pydantic import BaseModel, Field


class OllamaTranslateRequest(BaseModel):
    model: str = Field(default="translategemma:12b", description="The model to use.")
    text: str = Field(default=None, description="Text to translate.")
    source_lang: str = Field(default="english", description="The source language code.")
    source_code: str = Field(default="en", description="The source language code.")
    target_lang: str = Field(default="vietnamese", description="The target language code.")
    target_code: str = Field(default="vi", description="The target language code.")
    category: str = Field(default="default", description="The category of translation.")
    tone: str = Field(default="default", description="The tone of translation.")


class OllamaTranslateResponse(BaseModel):
    source_text: str = Field(default=None, description="Source text.")
    translated_text: str = Field(default=None, description="Translated text.")


class OllamaStatusResponse(BaseModel):
    status: str = Field(default=None, description="The status of the server.")


class OllamaModelResponse(BaseModel):
    model: list = Field(default={"name": str, "model": str}, description="The list of models.")
