from pydantic import BaseModel, Field

class OCRRequest(BaseModel):
    base64_text: str = Field(default=None, description="Base64 string or file path of the image.")
    ocr_lang: str = Field(default="en", description="Language code for OCR.")

class OCRResponse(BaseModel):
    source_text: str = Field(default=None, description="Extracted text from the image.")