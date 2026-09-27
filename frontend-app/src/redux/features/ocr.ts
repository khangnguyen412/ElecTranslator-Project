/* eslint-disable */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/**
 * Service
 */
import { ocrService } from "@/services/OCRServices";

/**
 * Type
 */
import type { OCRResponse, OCRRequest } from "@/types/ocr.type";
import type { ErrorType } from "@/types/error.type";

export interface OCRState {
    loading: boolean;
    ocr: OCRResponse;
    error: ErrorType | undefined;
    message?: string;
}

export const requestOCRThunk = createAsyncThunk<OCRResponse, OCRRequest, { rejectValue: ErrorType }>(
    'ocr/requestOCRCheck',
    async (params, { rejectWithValue }) => {
        try {
            const OCRVersion = await ocrService(params);
            return OCRVersion;
        } catch (error: any) {
            const errorData: ErrorType = {
                error_code: error?.error_code || "EXCEPTION",
                message: error?.message || "Python Check Failed",
                error: error?.error || "Python Check Failed",
            };
            return rejectWithValue(errorData);
        }
    }
)

const OCRSlice = createSlice({
    name: 'ocr',
    initialState: {
        loading: false,
        ocr: { success: false, message: '', data: {} },
        error: undefined,
        message: undefined,
    } as OCRState,
    reducers: {},
    extraReducers: (builder) => {
        /**
         * Check Python Status
         */
        builder.addCase(requestOCRThunk.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(requestOCRThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.ocr = action.payload;
        })
        builder.addCase(requestOCRThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || { error_code: '', message: '' };
        })
    }
})
export default OCRSlice.reducer;
