from pydantic import BaseModel, Field

class OCRRequest(BaseModel):
    base64_text: str = Field(default=None, description="Base64 string or file path of the image.")
    ocr_lang: str = Field(default="en", description="Language code for OCR.")
    model: str = Field(default="translategemma:12b", description="OCR model to use.")
    source_lang: str = Field(default="english", description="Language code for source text.")
    source_code: str = Field(default="en", description="Language code for source text.")
    target_lang: str = Field(default="vietnamese", description="Language code for target text.")
    target_code: str = Field(default="vi", description="Language code for target text.")    
    category: str = Field(default="default", description="The category of translation.")
    tone: str = Field(default="default", description="The tone of translation.")

class OCRServiceRequest(BaseModel):
    base64_text: str = Field(default=None, description="Base64 string or file path of the image.")
    ocr_lang: str = Field(default="en", description="Language code for OCR.")


class OCRResponse(BaseModel):
    text: str = Field(default=None, description="Extracted text from the image.")