/* eslint-disable */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/**
 * Service
 */
import { ollamaCheck } from "@/services/CheckServices";

/**
 * Type
 */
import type { pythonStatus, pythonLibStatus, ollamaStatus } from "@/types/check.type";
import type { ErrorType } from "@/types/error.type";

export interface CheckState {
    loading: boolean;
    ollamaStatus: ollamaStatus;
    pythonStatus: pythonStatus;
    pythonLibraryStatus: pythonLibStatus;
    error: ErrorType | undefined;
    message?: string;
}

export const requestPythonCheckThunk = createAsyncThunk<{ pythonStatus: pythonStatus }, null, { rejectValue: ErrorType }>(
    'healthCheck/requestPythonCheck',
    async (_, { rejectWithValue }) => {
        try {
            const PythonVersion = await window.electronAPI.checkPythonVersion();
            return { pythonStatus: PythonVersion };
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

export const requestPythonLibraryCheckThunk = createAsyncThunk<{ pythonLibraryStatus: pythonLibStatus }, null, { rejectValue: ErrorType }>(
    'healthCheck/requestPythonLibraryCheck',
    async (_, { rejectWithValue }) => {
        try {
            const PythonLibrary = await window.electronAPI.checkPythonLibraryRequirements();
            return { pythonLibraryStatus: PythonLibrary };
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

export const requestOllamaCheckThunk = createAsyncThunk<{ ollamaStatus: ollamaStatus }, null, { rejectValue: ErrorType }>(
    'healthCheck/requestOllamaCheck',
    async (_, { rejectWithValue }) => {
        try {
            const OllamaStatus = await ollamaCheck();
            return { ollamaStatus: OllamaStatus.data };
        } catch (error: any) {
            const errorData: ErrorType = {
                error_code: error?.error_code || "EXCEPTION",
                message: error?.message || "Health Check Failed",
                error: error?.error || "Health Check Failed",
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
        pythonLibraryStatus: { status: 'idle', installed: [], missing: [], },
        ollamaStatus: { status: 'idle', message: '', models: [] },
        error: undefined,
        message: undefined,
    } as CheckState,
    reducers: {},
    extraReducers: (builder) => {
        /**
         * Check Python Status
         */
        builder.addCase(requestPythonCheckThunk.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(requestPythonCheckThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.pythonStatus = action.payload.pythonStatus;
        })
        builder.addCase(requestPythonCheckThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || { error_code: '', message: '', error: '' };
        })

        /**
         * Check Python Library Status
         */
        builder.addCase(requestPythonLibraryCheckThunk.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(requestPythonLibraryCheckThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.pythonLibraryStatus = action.payload.pythonLibraryStatus;
        })
        builder.addCase(requestPythonLibraryCheckThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || undefined;
        })

        /**
         * Check Ollama Status
         */
        builder.addCase(requestOllamaCheckThunk.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(requestOllamaCheckThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.ollamaStatus = action.payload.ollamaStatus;
        })
        builder.addCase(requestOllamaCheckThunk.rejected, (state, action) => {
            state.loading = false;
            state.ollamaStatus = { status: 'error' };
            state.error = action.payload || undefined;
        })
    }
})
export default CheckSlice.reducer;
