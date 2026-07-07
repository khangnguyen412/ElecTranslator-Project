# ElecTranslator
This project for ElecTranslator:
- Description: This project aims to build a lightweight desktop application that captures real-time on-screen manga/comic text and translates it into Vietnamese. The entire translation pipeline runs completely offline, ensuring data privacy and zero API costs by utilizing a local Large Language Model (LLM).
- Constraints: Uses Electron + React (use pnpm), scalable backend, local and loud AI translation engine.

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
uvicorn main:app --reload --port 8000
```

## Technology in project:
- Language: HTML, CSS, TypeScript, Python (3.11)
- Framework: React, Electron
- OCR: PaddleOCR
- Engine Translation: Local and loud AI translation engine
