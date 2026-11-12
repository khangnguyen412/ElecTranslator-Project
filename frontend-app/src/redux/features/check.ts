/* eslint-disable */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/**
 * Service
 */
import { backendCheck } from "@/services/CheckServices";

/**
 * Type
 */
import type { startBackend } from "@/types/check.type";
import type { ErrorType } from "@/types/error.type";

export interface CheckState {
    loading: boolean;
    startBackend: startBackend;
    error: ErrorType | undefined;
    message?: string;
}


export const requestStartBackendThunk = createAsyncThunk<{ startBackendStatus: startBackend }, null, { rejectValue: ErrorType }>(
    'healthCheck/requestStartBackend',
    async (_, { rejectWithValue }) => {
        try {
            const response = await backendCheck();
            return { startBackendStatus: { status: response.data.status, message: response.data.message || '' } };
        } catch (error: any) {
            const errorData: ErrorType = {
                error_code: error?.error_code || "EXCEPTION",
                message: error?.message || "Start Backend Failed",
                error: error?.error || "Start Backend Failed"
            };
            return rejectWithValue(errorData);
        }
    }
)

const CheckSlice = createSlice({
    name: 'check',
    initialState: {
        loading: false,
        pythonStatus: { status: 'idle', version: '', message: '' },
        startBackend: { status: 'idle', message: '' },
        error: undefined,
        message: undefined,
    } as CheckState,
    reducers: {},
    extraReducers: (builder) => {
        /**
         * Check Backend Status
         */
        builder.addCase(requestStartBackendThunk.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(requestStartBackendThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.startBackend = action.payload.startBackendStatus;
        })
        builder.addCase(requestStartBackendThunk.rejected, (state, action) => {
            state.loading = false;
            state.startBackend = { status: 'error', message: 'Start Backend Failed' };
            state.error = action.payload || undefined;
        })
    }
})
export default CheckSlice.reducer;
