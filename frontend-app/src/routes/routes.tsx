/**
 * Routes
 */
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

const LoadingPage = lazy(() => import('@/page/CheckingPage'));
const TranslationPage = lazy(() => import('@/page/TranslationPanel'));
const FallbackPage = lazy(() => import('@/page/FallbackPage'));

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <LoadingPage />,
        index: true,
    },
    {
        path: '/fallback',
        element: <FallbackPage scenario="fallback" />,
    },
    {
        path: '/error',
        element: <FallbackPage scenario="error" />,
    },
    {
        path: '/translate',
        element: <TranslationPage defaultTranslate={false} />,
    }
]