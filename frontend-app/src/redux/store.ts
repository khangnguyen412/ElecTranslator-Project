import { configureStore } from '@reduxjs/toolkit';

import TranslateSlice from '@/redux/features/translate';
import HealthCheckSlice from '@/redux/features/healthCheck';


export const store = configureStore({
    reducer: {
        translate: TranslateSlice,
        healthCheck: HealthCheckSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;