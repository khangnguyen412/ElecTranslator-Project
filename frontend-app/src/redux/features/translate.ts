/* eslint-disable */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/**
 * Service
 */
import { AITranslate, NormalTranslate } from "@/services/TranslateServices";

/**
 * Type
 */
import type { TranslateParams, TranslateResponse } from "@/types/translate.type";
import type { ErrorType } from "@/types/error.type";

export type TranslateState = {
    data: { translated_text: string };
    loading: boolean;
    error?: ErrorType['error'] | null;
}

export const NormalTranslateThunk = createAsyncThunk<TranslateResponse, TranslateParams, { rejectValue: ErrorType }>(
    'translate/requestNormal',
    async (data, { rejectWithValue }) => {
        try {
            const response = await NormalTranslate(data);
            return response.data;
        } catch (error: any) {
            const errorData: ErrorType = error?.data || { error: "Translate Failed" };
            return rejectWithValue(errorData);
        }
    }
)


export const AITranslateThunk = createAsyncThunk<TranslateResponse, TranslateParams, { rejectValue: ErrorType }>(
    'translate/requestAI',
    async (data, { rejectWithValue }) => {
        try {
            const response = await AITranslate(data);
            return response.data;
        } catch (error: any) {
            const errorData: ErrorType = error?.data || { error: "Translate Failed" };
            return rejectWithValue(errorData);
        }
    }
)

const TranslateSlice = createSlice({
    name: 'translate',
    initialState: {
        data: { translated_text: '' },
        loading: false,
        error: null,
    } as TranslateState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(NormalTranslateThunk.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(NormalTranslateThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload;
        })
        builder.addCase(NormalTranslateThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action?.payload?.error;
        })

        builder.addCase(AITranslateThunk.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(AITranslateThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload;
        })
        builder.addCase(AITranslateThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action?.payload?.error;
        })
    }
})
export default TranslateSlice.reducer;
