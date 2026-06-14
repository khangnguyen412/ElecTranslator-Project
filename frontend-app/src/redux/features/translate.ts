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
    data: { text: string };
    loading: boolean;
    error?: ErrorType['errors'] | null;
}

export const requestOllamaThunk = createAsyncThunk<{ data: { text: string } }, { promptParams: PromptParams }, { rejectValue: ErrorType }>(
    'translate/requestAI',
    async (data, { rejectWithValue }) => {
        try {
            const response = await OllamaTranslate(data.promptParams);
            return response;
        } catch (error: any) {
            const errorData: ErrorType = error?.data || { errors: "Translate Failed" };
            return rejectWithValue(errorData);
        }
    }
)

const TranslateSlice = createSlice({
    name: 'translate',
    initialState: {
        data: { text: '' },
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
            state.data = action.payload.data;
        })
        builder.addCase(requestOllamaThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action?.payload?.errors;
        })
    }
})
export default TranslateSlice.reducer;
