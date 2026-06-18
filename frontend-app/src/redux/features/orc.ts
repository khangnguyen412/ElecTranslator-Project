/* eslint-disable */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/**
 * Service
 */
import { orcService } from "@/services/ORCServices";

/**
 * Type
 */
import type { OCRResponse, OCRRequest } from "@/types/ocr.type";
import type { ErrorType } from "@/types/error.type";

export interface ORCState {
    loading: boolean;
    orc: OCRResponse;
    error: ErrorType | undefined;
    message?: string;
}

export const requestORCThunk = createAsyncThunk<OCRResponse, OCRRequest, { rejectValue: ErrorType }>(
    'orc/requestORCCheck',
    async (params, { rejectWithValue }) => {
        try {
            const ORCVersion = await orcService(params);
            return ORCVersion;
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

const ORCSlice = createSlice({
    name: 'orc',
    initialState: {
        loading: false,
        orc: { success: false, message: '', data: {} },
        error: undefined,
        message: undefined,
    } as ORCState,
    reducers: {},
    extraReducers: (builder) => {
        /**
         * Check Python Status
         */
        builder.addCase(requestORCThunk.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(requestORCThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.orc = action.payload;
        })
        builder.addCase(requestORCThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || { error_code: '', message: '' };
        })
    }
})
export default ORCSlice.reducer;
