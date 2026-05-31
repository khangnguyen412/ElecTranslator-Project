import json
import sys
from deep_translator import GoogleTranslator


class Translator:
    def __init__(self, source_lang: str, target_lang: str):
        try:
            self.translator = GoogleTranslator(source=source_lang, target=target_lang)
        except Exception as e:
            print(json.dumps({"error": f"Translator init failed: {e}"}))
            sys.exit(1)

    def translate(self, text: str):
        try:
            # start translate
            result = self.translator.translate(text)

            # translate result
            print(json.dumps(result))

        except Exception as e:
            print(json.dumps({"error": f"Translate failed: {e}"}))


if __name__ == "__main__":
    text = sys.argv[1]
    Translator("en", "vi").translate(text)
