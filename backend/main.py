from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.routers import ApiResponse, process_ocr, process_translate, process_ollama_translate
from app.schema import ErrorResponse, HealthResponse
from app.exceptions import AppException

app = FastAPI(title="ElecTranslator Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """
    Handler for all custom application exceptions.
    """
    error_response = ErrorResponse(success=False, status_code=exc.status_code, error_code=exc.error_code, message=exc.message, detail=exc.detail)
    return JSONResponse(status_code=exc.status_code, content=error_response.model_dump())


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    error_response = ErrorResponse(success=False, status_code=500, error_code="INTERNAL_SERVER_ERROR", message="An unexpected error occurred")
    return JSONResponse(status_code=500, content=error_response.model_dump())


app.include_router(process_ocr, prefix="/api/ocr", tags=["OCR"])
app.include_router(process_translate, prefix="/api/translate", tags=["Translate"])
app.include_router(process_ollama_translate, prefix="/api/ollama", tags=["Ollama"])


@app.get("/api/health")
def health_check() -> ApiResponse:
    return ApiResponse(success=True, message="Health check passed.", data=HealthResponse())
