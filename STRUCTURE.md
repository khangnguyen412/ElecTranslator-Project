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
│  │  │  ├─ orc_schema.py
│  │  │  ├─ translate_schema.py
│  │  │  └─ __init__.py
│  │  └─ services
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
│  ├─ dist
│  │  ├─ assets
│  │  │  ├─ index-B5BXDqMa.css
│  │  │  ├─ index-Dt9GMaEd.js
│  │  │  └─ logo-Bt3hN40y.png
│  │  ├─ favicon.svg
│  │  ├─ icons.svg
│  │  └─ index.html
│  ├─ dist-electron
│  │  ├─ main.js
│  │  ├─ module
│  │  │  ├─ checking
│  │  │  │  ├─ serviceCheck.js
│  │  │  │  └─ serviceStartup.js
│  │  │  ├─ orc
│  │  │  │  └─ ocrRead.js
│  │  │  ├─ screenshot
│  │  │  │  └─ screenshot.js
│  │  │  └─ store
│  │  │     └─ store.js
│  │  ├─ preload.js
│  │  ├─ type
│  │  │  └─ store.type.js
│  │  └─ utils
│  │     ├─ getResourcePath.js
│  │     └─ parseRequirement.js
│  ├─ electron
│  │  ├─ main.ts
│  │  ├─ module
│  │  │  ├─ checking
│  │  │  │  ├─ serviceCheck.ts
│  │  │  │  └─ serviceStartup.ts
│  │  │  ├─ orc
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
│  ├─ electron-builder.json
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
│  │  │  ├─ react.svg
│  │  │  ├─ scss
│  │  │  │  └─ loading.scss
│  │  │  └─ vite.svg
│  │  ├─ components
│  │  │  └─ Popup.tsx
│  │  ├─ config
│  │  │  ├─ app.config.ts
│  │  │  └─ language.config.ts
│  │  ├─ DefaultTemplate.tsx
│  │  ├─ env.d.ts
│  │  ├─ index.css
│  │  ├─ main.tsx
│  │  ├─ page
│  │  │  ├─ CheckingPage.tsx
│  │  │  ├─ ExceptionPage.tsx
│  │  │  ├─ layout
│  │  │  │  └─ MainLayout.tsx
│  │  │  └─ TranslationPanel.tsx
│  │  ├─ redux
│  │  │  ├─ features
│  │  │  │  ├─ check.ts
│  │  │  │  ├─ orc.ts
│  │  │  │  ├─ store.ts
│  │  │  │  └─ translate.ts
│  │  │  ├─ store.ts
│  │  │  └─ types.ts
│  │  ├─ routes
│  │  │  └─ routes.tsx
│  │  ├─ services
│  │  │  ├─ CheckServices.ts
│  │  │  ├─ ORCServices.ts
│  │  │  ├─ StoreServices.ts
│  │  │  └─ TranslateServices.ts
│  │  └─ types
│  │     ├─ check.type.ts
│  │     ├─ common.type.ts
│  │     ├─ error.type.ts
│  │     ├─ ocr.type.ts
│  │     ├─ store.type.ts
│  │     └─ translate.type.ts
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  └─ vite.config.ts
├─ README.md
└─ STRUCTURE.md

```