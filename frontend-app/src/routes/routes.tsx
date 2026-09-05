/**
 * Routes
 */
import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";

const LoadingPage = lazy(() => import('@/page/CheckingPage'));
const TranslationPage = lazy(() => import('@/page/TranslatePage'));
const ExceptionPage = lazy(() => import('@/page/ExceptionPage'));

export const routes: RouteObject[] = [
    {
        // path: '/',
        element: (
            <Suspense>
                <LoadingPage />
            </Suspense>
        ),
    },
    {
        path: '/fallback',
        element: (
            <Suspense>
                <ExceptionPage scenario="fallback" />
            </Suspense>
        ),
    },
    {
        path: '/error',
        element: (
            <Suspense>
                <ExceptionPage scenario="error" />
            </Suspense>
        ),
    },
    {
        // path: '/translate',
        path: '/',
        element: (
            <Suspense>
                <TranslationPage />
            </Suspense>
        ),
    }
]