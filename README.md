# ElecTranslator
This project for ElecTranslator:

- Description: This project aims to build a lightweight desktop application that runs 100% locally on the user's machine to capture on-screen manga/comic text and translate it into Vietnamese. To balance data privacy and translation quality, the translation engine supports a hybrid architecture, allowing users to seamlessly switch between a local Large Language Model (LLM) for offline use and third-party cloud AI APIs.
- Constraints: Uses Electron + React (use pnpm), backend (FastAPI), hybrid AI translation engine (Local LLM & Third-party Cloud APIs).

## How to start and testing project
- Install dependencies python:
```
pip install -r requirements.txt
```
- Create ./frontend-app/dist 
- Run frontend:
```
cd ./frontend-app/
pnpm install
pnpm dev
```
- Run backend:
```
cd ./backend/
uvicorn main:app --reload --port 4120
```

## Technology in project:
- Language: HTML, CSS, TypeScript, Python (3.11)
- Framework: React, Electron
- OCR: PaddleOCR
- Engine Translation: Local and loud AI translation engine
