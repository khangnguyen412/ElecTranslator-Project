from pydantic import BaseModel, Field

class OCRRequest(BaseModel):
    image: str = Field(default=None, description="Base64 string or file path of the image.")
    lang: str = Field(default="en", description="Language code for OCR.")


class OCRResponse(BaseModel):
    text: str = Field(default=None, description="Extracted text from the image.")