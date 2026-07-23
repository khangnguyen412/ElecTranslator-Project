from pydantic import BaseModel, Field

class TranslateRequest(BaseModel):
    text: str = Field(description="The text to translate.")
    source_lang: str = Field(default="english", description="The source language code.")
    source_code: str = Field(default="en", description="The source language code.")
    target_lang: str = Field(default="vietnamese", description="The target language code.")
    target_code: str = Field(default="vi", description="The target language code.")

class TranslateResponse(BaseModel):
    source_text: str = Field(default=None, description="Source text.")
    translated_text: str = Field(default=None, description="Translated text.")
