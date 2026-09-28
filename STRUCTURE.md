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
│  │  │  ├─ ocr_schema.py
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
│  │  │  ├─ button-BJX9Xykt.js
│  │  │  ├─ check-session-CF9k1ngw.css
│  │  │  ├─ check-session-j3IC67XP.js
│  │  │  ├─ CheckingPage-BJVb8p_N.js
│  │  │  ├─ CheckingPage-CKKcR3aS.css
│  │  │  ├─ ExceptionPage-D88AtueW.js
│  │  │  ├─ ExceptionPage-DZ7g0v-k.css
│  │  │  ├─ index-B5BXDqMa.css
│  │  │  ├─ index-Dtb6ncai.js
│  │  │  ├─ logo-Bt3hN40y.png
│  │  │  ├─ message-DnDMomZ3.js
│  │  │  ├─ Overlay-DE5xVQvQ.js
│  │  │  ├─ row-CosMCbAK.js
│  │  │  ├─ tag-CJ944MC2.js
│  │  │  ├─ TranslatePage-BdYTgAt-.js
│  │  │  └─ typography-VHMC56hC.js
│  │  ├─ favicon.svg
│  │  ├─ icons.svg
│  │  ├─ index.html
│  │  └─ overlay
│  │     ├─ assets
│  │     │  ├─ button-BJX9Xykt.js
│  │     │  ├─ check-session-CF9k1ngw.css
│  │     │  ├─ check-session-j3IC67XP.js
│  │     │  ├─ CheckingPage-BJVb8p_N.js
│  │     │  ├─ CheckingPage-CKKcR3aS.css
│  │     │  ├─ ExceptionPage-D88AtueW.js
│  │     │  ├─ ExceptionPage-DZ7g0v-k.css
│  │     │  ├─ index-B5BXDqMa.css
│  │     │  ├─ index-Dtb6ncai.js
│  │     │  ├─ logo-Bt3hN40y.png
│  │     │  ├─ message-DnDMomZ3.js
│  │     │  ├─ Overlay-DE5xVQvQ.js
│  │     │  ├─ row-CosMCbAK.js
│  │     │  ├─ tag-CJ944MC2.js
│  │     │  ├─ TranslatePage-BdYTgAt-.js
│  │     │  └─ typography-VHMC56hC.js
│  │     ├─ favicon.svg
│  │     ├─ icons.svg
│  │     └─ index.html
│  ├─ dist-electron
│  │  ├─ main.js
│  │  ├─ module
│  │  │  ├─ checking
│  │  │  │  ├─ serviceCheck.js
│  │  │  │  └─ serviceStartup.js
│  │  │  ├─ ocr
│  │  │  │  └─ ocrRead.js
│  │  │  ├─ screenshot
│  │  │  │  └─ screenshot.js
│  │  │  └─ store
│  │  │     └─ store.js
│  │  ├─ preload.js
│  │  ├─ type
│  │  │  └─ store.type.js
│  │  └─ utils
│  │     └─ getResourcePath.js
│  ├─ electron
│  │  ├─ main.ts
│  │  ├─ module
│  │  │  ├─ checking
│  │  │  │  ├─ serviceCheck.ts
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
│  │  │  │  ├─ loading.scss
│  │  │  │  └─ page
│  │  │  │     ├─ checking.scss
│  │  │  │     └─ exception.scss
│  │  │  └─ vite.svg
│  │  ├─ components
│  │  │  ├─ checking
│  │  │  │  ├─ StepBackendApi.tsx
│  │  │  │  ├─ StepPythonEnvironment.tsx
│  │  │  │  └─ StepPythonLibrary.tsx
│  │  │  ├─ Popup.tsx
│  │  │  └─ translation
│  │  │     ├─ AdvancedSettingsModal.tsx
│  │  │     ├─ InputCard.tsx
│  │  │     ├─ OptionsPanel.tsx
│  │  │     └─ ResultCard.tsx
│  │  ├─ config
│  │  │  ├─ app.config.ts
│  │  │  ├─ language.config.ts
│  │  │  └─ translationOptions.config.ts
│  │  ├─ DefaultTemplate.tsx
│  │  ├─ env.d.ts
│  │  ├─ hook
│  │  │  ├─ useBackendCheck.ts
│  │  │  ├─ usePythonCheck.ts
│  │  │  ├─ usePythonLibraryCheck.ts
│  │  │  ├─ useTranslation.ts
│  │  │  └─ useTranslationSettings.ts
│  │  ├─ index.css
│  │  ├─ main.tsx
│  │  ├─ page
│  │  │  ├─ CheckingPage.tsx
│  │  │  ├─ ExceptionPage.tsx
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
│  │     ├─ check-session.ts
│  │     └─ checking-icon.tsx
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  └─ vite.config.ts
├─ README.md
└─ STRUCTURE.md

```