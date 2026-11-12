# Project structure 

```
ElecTranslator
├─ backend
│  ├─ .env
│  ├─ .pytest_cache
│  │  ├─ CACHEDIR.TAG
│  │  ├─ README.md
│  │  └─ v
│  │     └─ cache
│  │        ├─ lastfailed
│  │        └─ nodeids
│  ├─ app
│  │  ├─ config.py
│  │  ├─ exceptions
│  │  │  ├─ exceptions.py
│  │  │  └─ __init__.py
│  │  ├─ routers
│  │  │  ├─ ai.py
│  │  │  ├─ api_response.py
│  │  │  ├─ ocr.py
│  │  │  ├─ translate.py
│  │  │  └─ __init__.py
│  │  ├─ schema
│  │  │  ├─ ai_schema.py
│  │  │  ├─ error_schema.py
│  │  │  ├─ health_schema.py
│  │  │  ├─ ocr_schema.py
│  │  │  ├─ translate_schema.py
│  │  │  └─ __init__.py
│  │  └─ services
│  │     ├─ ai_provider
│  │     │  ├─ anthropic_ai_service.py
│  │     │  ├─ base_service.py
│  │     │  ├─ factory_service.py
│  │     │  ├─ google_ai_service.py
│  │     │  ├─ ninerouter_ai_service.py
│  │     │  ├─ ollama_ai_service.py
│  │     │  ├─ openai_ai_service.py
│  │     │  └─ __init__.py
│  │     ├─ ai_service.py
│  │     ├─ ocr_service.py
│  │     ├─ translate_service.py
│  │     └─ __init__.py
│  ├─ main.py
│  ├─ requirements.txt
│  ├─ tests
│  │  ├─ conftest.py
│  │  ├─ test_ai_service_translate.py
│  │  └─ __init__.py
│  └─ utils
│     └─ check_dependencies.py
├─ frontend-app
│  ├─ .env
│  ├─ assets
│  │  ├─ logo.ico
│  │  └─ logo.png
│  ├─ electron
│  │  ├─ config.ts
│  │  ├─ main.ts
│  │  ├─ module
│  │  │  ├─ checking
│  │  │  │  └─ serviceStartup.ts
│  │  │  ├─ ocr
│  │  │  │  └─ ocrRead.ts
│  │  │  ├─ screenshot
│  │  │  │  ├─ screenshot.ts
│  │  │  │  └─ selectionOverlay.html
│  │  │  └─ store
│  │  │     └─ store.ts
│  │  ├─ preload.ts
│  │  ├─ README.md
│  │  ├─ tsconfig.json
│  │  ├─ type
│  │  │  └─ store.type.ts
│  │  └─ utils
│  │     └─ getResourcePath.ts
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package.json
│  ├─ pnpm-lock.yaml
│  ├─ pnpm-workspace.yaml
│  ├─ public
│  │  ├─ favicon.svg
│  │  └─ icons.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ api
│  │  │  └─ axios.ts
│  │  ├─ App.css
│  │  ├─ App.tsx
│  │  ├─ assets
│  │  │  ├─ hero.png
│  │  │  ├─ logo.png
│  │  │  ├─ react.svg
│  │  │  ├─ scss
│  │  │  │  ├─ background.scss
│  │  │  │  ├─ layout
│  │  │  │  │  └─ main.scss
│  │  │  │  └─ page
│  │  │  │     ├─ checking.scss
│  │  │  │     └─ stranslate.scss
│  │  │  └─ vite.svg
│  │  ├─ components
│  │  │  ├─ Popup.tsx
│  │  │  └─ translation
│  │  │     ├─ AdvancedSettingsModal.tsx
│  │  │     ├─ InputCard.tsx
│  │  │     ├─ OptionsPanel.tsx
│  │  │     └─ ResultCard.tsx
│  │  ├─ config
│  │  │  ├─ app.config.ts
│  │  │  ├─ language.config.ts
│  │  │  ├─ theme.config.ts
│  │  │  └─ translationOptions.config.ts
│  │  ├─ DefaultTemplate.tsx
│  │  ├─ env.d.ts
│  │  ├─ hook
│  │  │  ├─ useBackendCheck.ts
│  │  │  ├─ useTranslation.ts
│  │  │  └─ useTranslationSettings.ts
│  │  ├─ index.css
│  │  ├─ main.tsx
│  │  ├─ page
│  │  │  ├─ CheckingPage.tsx
│  │  │  ├─ layout
│  │  │  │  └─ MainLayout.tsx
│  │  │  ├─ Overlay.tsx
│  │  │  └─ TranslatePage.tsx
│  │  ├─ redux
│  │  │  ├─ features
│  │  │  │  ├─ check.ts
│  │  │  │  ├─ ocr.ts
│  │  │  │  ├─ store.ts
│  │  │  │  └─ translate.ts
│  │  │  ├─ store.ts
│  │  │  └─ types.ts
│  │  ├─ routes
│  │  │  └─ routes.tsx
│  │  ├─ services
│  │  │  ├─ CheckServices.ts
│  │  │  ├─ OCRServices.ts
│  │  │  ├─ StoreServices.ts
│  │  │  └─ TranslateServices.ts
│  │  ├─ types
│  │  │  ├─ check.type.ts
│  │  │  ├─ common.type.ts
│  │  │  ├─ error.type.ts
│  │  │  ├─ ocr.type.ts
│  │  │  ├─ store.type.ts
│  │  │  └─ translate.type.ts
│  │  └─ utils
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  └─ vite.config.ts
├─ README.md
└─ STRUCTURE.md

```