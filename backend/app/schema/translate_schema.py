from pydantic import BaseModel, Field

class TranslateRequest(BaseModel):
    text: str = Field(description="The text to translate.")
    sourceLang: str = Field(default="english", description="The source language code.")
    sourceCode: str = Field(default="en", description="The source language code.")
    targetLang: str = Field(default="vietnamese", description="The target language code.")
    targetCode: str = Field(default="vi", description="The target language code.")

class TranslateResponse(BaseModel):
    success: bool = Field(description="Whether the translation was successful.")
    text: str = Field(default=None, description="The translated text.")
