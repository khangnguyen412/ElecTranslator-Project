/* eslint-disable */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/**
 * Service
 */
import { AITranslate, NormalTranslate } from "@/services/TranslateServices";

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

export const NormalTranslateResponse = createAsyncThunk<TranslateResponse, PromptParams, { rejectValue: ErrorType }>(
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


export const requestAIThunk = createAsyncThunk<TranslateResponse, PromptParams, { rejectValue: ErrorType }>(
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
        builder.addCase(NormalTranslateResponse.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(NormalTranslateResponse.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload;
        })
        builder.addCase(NormalTranslateResponse.rejected, (state, action) => {
            state.loading = false;
            state.error = action?.payload?.error;
        })

        builder.addCase(requestAIThunk.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(requestAIThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.data = action.payload;
        })
        builder.addCase(requestAIThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action?.payload?.error;
        })
    }
})
export default TranslateSlice.reducer;
