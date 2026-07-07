import { configureStore } from '@reduxjs/toolkit';

import TranslateSlice from '@/redux/features/translate';
import CheckSlice from '@/redux/features/check';
import ORCSlice from '@/redux/features/orc';
import StoreSlice from '@/redux/features/store'


export const store = configureStore({
    reducer: {
        translate: TranslateSlice,
        check: CheckSlice,
        orc: ORCSlice,
        store: StoreSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;