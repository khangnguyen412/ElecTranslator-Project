import sys
import importlib.util
import json
import os
import re

def get_requirements_list(req_file_path):
    """Đọc danh sách package từ requirements.txt"""
    packages = []
    if not os.path.exists(req_file_path):
        return packages
    
    with open(req_file_path, 'r') as f:
        for line in f:
            line = line.strip()
            # ignore empty line or comment
            if not line or line.startswith('#'):
                continue
            
            # Remove [...] from package name Example: uvicorn[standard]==0.27.0 -> uvicorn
            package_name = re.split(r'[=<>!~\[]', line)[0].strip()
            if package_name:
                packages.append(package_name)
    return packages

def check_dependencies():
    # Configure requirements_file.txt path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    req_file_path = os.path.join(current_dir, '..', 'requirements.txt')
    
    required_packages = get_requirements_list(req_file_path)
    
    missing = []
    installed = []
    
    for package in required_packages:
        # Normalize package name to import (example: opencv-python -> cv2, python-dotenv -> dotenv)
        import_name = package.replace("-", "_")
        
        # Mapping special cases to import name
        special_mapping = {
            "opencv_python": "cv2",
            "python_dotenv": "dotenv",
            "python_multipart": "multipart",
            "Pillow": "PIL",
            "uvicorn": "uvicorn",
        }
        if import_name in special_mapping:
            import_name = special_mapping[import_name]
            
        try:
            spec = importlib.util.find_spec(import_name)
            if spec is None:
                missing.append(package)
            else:
                installed.append(package)
        except (ModuleNotFoundError, ValueError):
            missing.append(package)
            
    result = {
        "status": "ok" if not missing else "missing",
        "missing": missing, 
        "installed": installed
    }
    
    print(json.dumps(result))
    return len(missing) == 0

if __name__ == "__main__":
    success = check_dependencies()
    sys.exit(0 if success else 1)