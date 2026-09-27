import { configureStore } from '@reduxjs/toolkit';

import TranslateSlice from '@/redux/features/translate';
import CheckSlice from '@/redux/features/check';
import OCRSlice from '@/redux/features/ocr';
import StoreSlice from '@/redux/features/store'


export const store = configureStore({
    reducer: {
        translate: TranslateSlice,
        check: CheckSlice,
        ocr: OCRSlice,
        store: StoreSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;