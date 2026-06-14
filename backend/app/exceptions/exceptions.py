from typing import Any


class AppException(Exception):
    """Base class for application exceptions."""
    def __init__(self, status_code: int, error_code: str, message: str, detail: Any = None):
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        self.detail = detail
        super().__init__(message)


class NotFoundError(AppException):
    def __init__(self, message: str, detail: str | None = None):
        super().__init__(status_code=404, error_code="NOT_FOUND", message=message, detail=detail)


class ExceptionError(AppException):
    def __init__(self, message: str, detail: str | None = None):
        super().__init__(status_code=500, error_code="EXCEPTION", message=message, detail=detail)


class ServiceConnectionError(AppException):
    def __init__(self, message: str, detail: str | None = None):
        super().__init__(status_code=503, error_code="CONNECTION_ERROR", message=message, detail=detail)
