/**
 * Routes
 */
import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";

const LoadingPage = lazy(() => import('@/page/CheckingPage'));
const TranslationPage = lazy(() => import('@/page/TranslatePage'));
const OverlayTranslationPage = lazy(() => import('@/page/Overlay'));
const MainLayout = lazy(() => import('@/page/layout/MainLayout'));

export const routes: RouteObject[] = [
    {
        path: '/',
        element: (
            <Suspense>
                <MainLayout>
                    <LoadingPage />
                </MainLayout>
            </Suspense>
        ),
    },
    {
        path: '/translate',
        element: (
            <Suspense>
                <MainLayout>
                    <TranslationPage />
                </MainLayout>
            </Suspense>
        ),
    },
    {
        path: '/overlay',
        element: (
            <Suspense>
                <OverlayTranslationPage />
            </Suspense>
        ),
    },
]