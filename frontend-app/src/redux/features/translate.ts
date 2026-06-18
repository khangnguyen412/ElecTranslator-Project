/* eslint-disable */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/**
 * Service
 */
import { OllamaTranslate } from "@/services/TranslateServices";

/**
 * Type
 */
import type { PromptParams } from "@/types/translate.type";
import type { ErrorType } from "@/types/error.type";

export type TranslateState = {
    data: { translated_text: string };
    loading: boolean;
    error?: ErrorType['error'] | null;
}

export type TranslateResponse = {
    translated_text: string
}

export const requestOllamaThunk = createAsyncThunk<TranslateResponse, PromptParams, { rejectValue: ErrorType }>(
    'translate/requestAI',
    async (data, { rejectWithValue }) => {
        try {
            const response = await OllamaTranslate(data);
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
        builder.addCase(requestOllamaThunk.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(requestOllamaThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload;
        })
        builder.addCase(requestOllamaThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action?.payload?.error;
        })
    }
})
export default TranslateSlice.reducer;
