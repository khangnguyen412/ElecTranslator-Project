import sys
import json
import base64
import numpy as np
import cv2
import os
import warnings
from contextlib import redirect_stdout, redirect_stderr
from paddleocr import PaddleOCR

# Terminal logging suppression
os.environ["CPU_NUM"] = "2"
os.environ["OMP_NUM_THREADS"] = "2"
os.environ["MKL_NUM_THREADS"] = "2"
os.environ["OPENBLAS_NUM_THREADS"] = "2"
os.environ["FLAGS_logtostderr"] = "0"
os.environ["GLOG_minloglevel"] = "3"
os.environ["PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK"] = "True"
warnings.filterwarnings("ignore")


class PaddleOCRServer:
    valid_lang = {"ch", "en", "vi", "japan", "korean", "chinese_cht", "latin", "arabic", "ta", "te", "ka", "devanagari"}

    def __init__(self, lang: str):
        # Check lang is valid
        self.paddle_lang = lang if lang in self.valid_lang else "en"

        # Suppress logs during heavy initialization
        devnull = open(os.devnull, "w")
        try:
            with redirect_stdout(devnull), redirect_stderr(devnull):
                self.ocr = PaddleOCR(
                    use_textline_orientation=False,
                    lang=self.paddle_lang,
                    det_db_thresh=0.3,
                    det_db_box_thresh=0.5,
                    det_db_unclip_ratio=0.5,
                    rec_batch_num=6,
                    enable_mkldnn=False,
                )
        except Exception as e:
            devnull.close()
            #fmt: off
            print(json.dumps({"success": False, "error": f"Init failed: {str(e)}"},ensure_ascii=False,),flush=True)
            sys.exit(1)
        finally:
            devnull.close()

    def process_ocr(self):
        while True:
            try:
                line = sys.stdin.readline()
                if not line:
                    break

                input_data = line.strip()
                if not input_data:
                    continue

                # Check if input is a valid image path or base64 string
                img = None
                if os.path.exists(input_data):
                    img = cv2.imread(input_data, cv2.IMREAD_COLOR)
                else:
                    if "," in input_data:
                        input_data = input_data.split(",")[1]
                    img_bytes = base64.b64decode(input_data)
                    nparr = np.frombuffer(img_bytes, np.uint8)
                    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                if img is None:
                    #fmt: off
                    print(json.dumps({"success": False,"error": "Decode failed, not found image or base64 string",},ensure_ascii=False,),flush=True)
                    continue

                # Suppress logs during inference
                devnull = open(os.devnull, "w")
                try:
                    with redirect_stdout(devnull), redirect_stderr(devnull):
                        result = self.ocr.predict(img)
                finally:
                    devnull.close()

                # Parse result from PaddleOCR v3 or v2 format
                texts = []
                if result:
                    for page in result:
                        if page is None:
                            continue

                        # Convert OCRResult object to dict if needed
                        if hasattr(page, "__dict__"):
                            # PaddleOCR v3 OCRResult object
                            page_dict = page.__dict__ if isinstance(page.__dict__, dict) else {}
                        elif isinstance(page, dict):
                            page_dict = page
                        else:
                            page_dict = {}

                        # Try to get rec_texts from dict or object
                        rec_texts = None
                        rec_scores = None

                        if isinstance(page, dict):
                            rec_texts = page.get("rec_texts", [])
                            rec_scores = page.get("rec_scores", [])
                        elif hasattr(page, "rec_texts"):
                            # Access as object attribute
                            rec_texts = getattr(page, "rec_texts", [])
                            rec_scores = getattr(page, "rec_scores", [])

                        # Process texts if found
                        if rec_texts:
                            for i, txt in enumerate(rec_texts):
                                if txt and str(txt).strip():
                                    score = rec_scores[i] if rec_scores and i < len(rec_scores) else 1.0
                                    if score > 0.1:  # Keep low threshold
                                        texts.append(str(txt).strip())

                        # Fallback: PaddleOCR v2 list format
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

                #fmt: off
                print(json.dumps({"success": True, "text": " ".join(texts)}, ensure_ascii=False),flush=True)

            except Exception as e:
                #fmt: off
                print(json.dumps({"success": False, "error": str(e)}, ensure_ascii=False),flush=True)


if __name__ == "__main__":
    # Configure stdout encoding to utf-8 to support Unicode characters
    sys.stdout.reconfigure(encoding="utf-8")

    # Get language argument from command line (e.g., "vi", "en")
    lang = sys.argv[1] if len(sys.argv) > 1 else "ch"
    PaddleOCRServer(lang).process_ocr()
