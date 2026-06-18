import { configureStore } from '@reduxjs/toolkit';

import TranslateSlice from '@/redux/features/translate';
import CheckSlice from '@/redux/features/check';
import ORCSlice from '@/redux/features/orc';


export const store = configureStore({
    reducer: {
        translate: TranslateSlice,
        check: CheckSlice,
        orc: ORCSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;