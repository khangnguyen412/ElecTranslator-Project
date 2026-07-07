import os
import base64
import warnings
import numpy as np
import cv2
from typing import List, Dict, Any, Optional
from contextlib import redirect_stdout, redirect_stderr
from paddleocr import PaddleOCR

# --- Types ---
from app.schema import OCRServiceRequest, OCRResponse, ErrorResponse

# --- Exceptions ---
from app.exceptions import AppException, ServiceConnectionError

# --- Service ---

# --- Configuration & Environment Setup ---
os.environ["CPU_NUM"] = "2"
os.environ["OMP_NUM_THREADS"] = "2"
os.environ["MKL_NUM_THREADS"] = "2"
os.environ["OPENBLAS_NUM_THREADS"] = "2"
os.environ["FLAGS_logtostderr"] = "0"
os.environ["GLOG_minloglevel"] = "3"
os.environ["PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK"] = "True"
warnings.filterwarnings("ignore")

VALID_LANGS = {"ch", "en", "vi", "japan", "korean", "chinese_cht", "latin", "arabic", "ta", "te", "ka", "devanagari"}


class PaddleOCRService:
    """
    Class wrapper for PaddleOCR engine with caching support.
    """

    _ocr_engine: Optional[PaddleOCR] = None
    _current_lang: str = ""

    def __init__(self):
        pass

    @classmethod
    def _decode_image(cls, image_input: str) -> Optional[np.ndarray]:
        """
        Helper function to decode image from base64 or file path.
        ### Returns: Optional[np.ndarray] - Decoded image array or None if failed (numpy array).
        """
        img = None
        try:
            if os.path.exists(image_input):
                img = cv2.imread(image_input, cv2.IMREAD_COLOR)
            else:
                # Handle base64 string
                if "," in image_input:
                    image_input = image_input.split(",")[1]
                img_bytes = base64.b64decode(image_input)
                nparr = np.frombuffer(img_bytes, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        except Exception as e:
            return None
        return img

    @classmethod
    def _parse_result(cls, result: Any) -> List[str]:
        """
        Helper function to parse PaddleOCR result into text list.
        ### Returns: List[str] - List of extracted text strings.
        """
        texts = []
        if not result:
            return texts

        for page in result:
            if page is None:
                continue

            rec_texts = []
            rec_scores = []

            # Handle different result formats (Dict vs Object vs List)
            if isinstance(page, dict):
                rec_texts = page.get("rec_texts", [])
                rec_scores = page.get("rec_scores", [])
            elif hasattr(page, "rec_texts"):
                rec_texts = getattr(page, "rec_texts", [])
                rec_scores = getattr(page, "rec_scores", [])
            elif isinstance(page, (list, tuple)):
                for line_res in page:
                    if line_res and len(line_res) >= 2:
                        try:
                            text_info = line_res[1]
                            if isinstance(text_info, (list, tuple)) and len(text_info) >= 2:
                                txt = text_info[0]
                                if txt and str(txt).strip():
                                    texts.append(str(txt).strip())
                        except (IndexError, TypeError):
                            continue
                continue

            # Process extracted texts from dict/object format
            if rec_texts:
                for i, txt in enumerate(rec_texts):
                    if txt and str(txt).strip():
                        score = rec_scores[i] if rec_scores and i < len(rec_scores) else 1.0
                        if score > 0.1:
                            texts.append(str(txt).strip())
        return texts

    @classmethod
    def _get_engine(cls, lang: str = "en") -> PaddleOCR:
        """
        Lazy initialization of PaddleOCR engine.
        ### Returns: PaddleOCR - the cached instance if language matches, otherwise re-initializes.
        """
        paddle_lang = lang if lang in VALID_LANGS else "en"

        # Return cached engine if already initialized with the same language
        if cls._ocr_engine is not None and cls._current_lang == paddle_lang:
            return cls._ocr_engine

        # Suppress heavy initialization logs
        devnull = open(os.devnull, "w")
        try:
            with redirect_stdout(devnull), redirect_stderr(devnull):
                cls._ocr_engine = PaddleOCR(
                    use_textline_orientation=False,
                    lang=paddle_lang,
                    det_db_thresh=0.3,
                    det_db_box_thresh=0.5,
                    det_db_unclip_ratio=0.5,
                    rec_batch_num=6,
                    enable_mkldnn=False,
                )
            cls._current_lang = paddle_lang
        except Exception as e:
            devnull.close()
            raise RuntimeError(f"Failed to initialize PaddleOCR: {str(e)}")
        finally:
            devnull.close()
        return cls._ocr_engine

    @staticmethod
    async def get_ocr(request: OCRServiceRequest) -> OCRResponse | ErrorResponse:
        """
        Main async service function to perform OCR.
        ### Args:
            - request: OCRRequest containing image_input and lang.
        ### Returns: 
            - a dictionary with 'success', 'text', and optional 'error'.
        """
        try:
            # Get or Initialize Engine
            engine = PaddleOCRService._get_engine(request.ocr_lang)

            # Decode Image
            img = PaddleOCRService._decode_image(request.base64_text)
            if img is None:
                return {"success": False, "error": "Failed to decode image or image not found"}

            # Perform Inference (Suppressing logs during inference)
            result = engine.predict(img)

            # Parse Results
            texts = PaddleOCRService._parse_result(result)
            return OCRResponse(text=" ".join(texts))

        except Exception as e:
            raise AppException(status_code=500, error_code="EXCEPTION", message="OCR failed", error=str(e))
