import { configureStore } from '@reduxjs/toolkit';

import TranslateSlice from '@/redux/features/translate';
import CheckSlice from '@/redux/features/check';
import StartSlice from '@/redux/features/start';


export const store = configureStore({
    reducer: {
        translate: TranslateSlice,
        check: CheckSlice,
        start: StartSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;