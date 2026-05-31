/**
 * Routes
 */
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const LoadingPage = lazy(() => import('@/page/LoadingPage.tsx'));
const TranslationPage = lazy(() => import('@/page/TranslationPanel'));

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <LoadingPage />,
        index: true,
    },
    {
        path: '/translate',
        element: <TranslationPage defaultTranslate={false} />,
        // index: true,
    }
]