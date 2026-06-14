from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str = Field(default="success", description="Status of the backend.")
