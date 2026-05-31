# ElecTranslator
This project for ElecTranslator:
- Description: This project aims to build a lightweight desktop application that captures real-time on-screen manga/comic text and translates it into Vietnamese. The entire translation pipeline runs completely offline, ensuring data privacy and zero API costs by utilizing a local Large Language Model (LLM).
- Constraints: Uses Electron + React (use pnpm), scalable backend, local translation engine (Ollama with gemma3).

## How to start and testing project
- Install dependencies python:
```
pip install -r requirements.txt
```
- Create ./frontend-app/dist and run project:
```
cd ./frontend-app/
pnpm install
pnpm dev
```

## Technology in project:
- Language: HTML, CSS, TypeScript, Python (3.11)
- Framework: React, Electron
- OCR: EasyOCR
- Engine Translation: Ollama + Gemma3

## Project structure 
```
electranslator-project/
├── README.md
└── frontend-app/
    ├── README.md
    ├── electron-builder.json
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── pnpm-workspace.yaml
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── dist-electron/
    │   ├── main.js
    │   ├── preload.js
    │   └── module/
    │       ├── orc/
    │       │   └── ocr-read.js
    │       └── screenshot/
    │           └── screenshot.js
    ├── electron/
    │   ├── README.md
    │   ├── main.ts
    │   ├── preload.ts
    │   ├── tsconfig.json
    │   └── module/
    │       ├── orc/
    │       │   └── ocr-read.ts
    │       └── screenshot/
    │           ├── screenshot.ts
    │           └── selection-overlay.html
    ├── python/
    │   ├── requirements.txt
    │   └── module/
    │       ├── paddleORC.py
    │       └── translate.py
    └── src/
        ├── App.css
        ├── App.tsx
        ├── DefaultTemplate.tsx
        ├── env.d.ts
        ├── index.css
        ├── main.tsx
        ├── api/
        │   └── axios.ts
        ├── assets/
        │   └── scss/
        │       └── loading.scss
        ├── components/
        │   └── Popup.tsx
        ├── config/
        │   ├── app.config.ts
        │   └── language.config.ts
        ├── page/
        │   ├── LoadingPage.tsx
        │   ├── TranslationPanel.tsx
        │   └── layout/
        │       └── MainLayout.tsx
        ├── redux/
        │   ├── store.ts
        │   ├── types.ts
        │   └── features/
        │       ├── healthCheck.ts
        │       └── translate.ts
        ├── routes/
        │   └── routes.tsx
        ├── services/
        │   ├── HealthCheckServices.ts
        │   ├── PromptService.ts
        │   └── TranslateServices.ts
        └── types/
            ├── common.type.ts
            ├── error.type.ts
            ├── heathCheck.type.ts
            └── translate.type.ts
```