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

export interface StartState {
    loading: boolean;
    startBackend: startBackend;
    error: ErrorType | null;
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

const StartSlice = createSlice({
    name: 'start',
    initialState: {
        loading: false,
        startBackend: { status: 'idle', message: '' },
        error: null,
        message: undefined,
    } as StartState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(requestStartBackendThunk.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(requestStartBackendThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.startBackend = action.payload.startBackendStatus;
        })
        builder.addCase(requestStartBackendThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || null;
        })
    }
})
export default StartSlice.reducer;
