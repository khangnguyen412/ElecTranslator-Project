# python/check_libs.py
import sys
import json
import importlib.util

# Mapping package pip name → module Python name
PACKAGE_MAP = {
    "opencv-python": "cv2",
    "opencv-python-headless": "cv2",
    "opencv-contrib-python": "cv2",
    "pillow": "PIL",
    "scikit-learn": "sklearn",
    "beautifulsoup4": "bs4",
    "pyyaml": "yaml",
    "python-dateutil": "dateutil",
}

class LibraryChecker:
    def __init__(self):
        pass

    def check_library(self ,libraries: list[str] = None):
        if len(libraries or []) == 0:
            print(json.dumps({"error": "No libraries provided"}))
            sys.exit(1)

        libs = libraries
        result = {}
        
        for pkg in libs:
            # get module name from mapping or default to package name with hyphen replaced by underscore if not found in mapping
            module_name = PACKAGE_MAP.get(pkg, pkg.replace("-", "_"))
            spec = importlib.util.find_spec(module_name)
            result[pkg] = spec is not None

        # print JSON to stdout
        print(json.dumps(result))

if __name__ == "__main__":
    library = sys.argv[1:] 
    LibraryChecker().check_library(library)
