from pydantic import BaseModel, Field
from typing import Generic, TypeVar

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    success: bool = Field(default=True, description="Whether the operation was successful.")
    message: str = Field(default="Success", description="A message describing the result of the operation.")
    data: T = Field(default=None, description="The data returned by the operation.")
