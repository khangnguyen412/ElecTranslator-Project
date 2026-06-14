# backend/app/schema/error_schema.py
from pydantic import BaseModel, Field

class ErrorResponse(BaseModel):
    """
    Standard error response structure for the API.
    """
    success: bool = Field(default=False, description="Whether the request was successful.")
    status_code: int = Field(description="HTTP status code.")
    error_code: str = Field(default=None, description="Machine-readable error code for debugging.")
    message: str = Field(description="Human-readable error message.")
    detail: str | None = Field(default=None, description="Detailed error information for debugging.")
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": False,
                "status_code": 404,
                "error_code": "NOT_FOUND",
                "message": "Resource not found",
                "detail": "The requested resource was not found on the server."
            }
        }