/* eslint-disable */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/**
 * Service
 */
import { healthCheck } from "@/services/HealthCheckServices";

/**
 * Type
 */
import type { pythonStatus, pythonLibStatus, ollamaStatus } from "@/types/heathCheck.type";
import type { ErrorType } from "@/types/error.type";

export interface OllamaState {
    loading: boolean;
    ollamaStatus: ollamaStatus;
    pythonStatus: pythonStatus;
    pythonLibraryStatus: pythonLibStatus;
    error: ErrorType | null;
    message?: string;
}

export const requestOllamaCheckThunk = createAsyncThunk<{ ollamaStatus: ollamaStatus }, null, { rejectValue: ErrorType }>(
    'healthCheck/requestOllamaCheck',
    async (_, { rejectWithValue }) => {
        try {
            const response = await healthCheck();
            return { ollamaStatus: response?.models?.length ? { status: 'success', models: response.models } : { status: 'error' } };
        } catch (error: any) {
            const errorData: ErrorType = error?.data || { errors: "Health Check Failed" };
            return rejectWithValue(errorData);
        }
    }
)

export const requestPythonCheckThunk = createAsyncThunk<{ pythonStatus: pythonStatus }, null, { rejectValue: ErrorType }>(
    'healthCheck/requestPythonCheck',
    async (_, { rejectWithValue }) => {
        try {
            const PythonVersion = await window.electronAPI.checkPythonVersion();
            return { pythonStatus: PythonVersion };
        } catch (error: any) {
            const errorData: ErrorType = error || { errors: "Python Check Failed" };
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
            const errorData: ErrorType = error || { errors: "Python Check Failed" };
            return rejectWithValue(errorData);
        }
    }
)

const HealthCheckSlice = createSlice({
    name: 'healthCheck',
    initialState: {
        loading: false,
        ollamaStatus: { status: 'idle', message: '', models: [] },
        pythonStatus: { status: 'idle', version: '', message: '' },
        pythonLibraryStatus: { status: 'idle', installed: [], missing: [], },
        error: null,
        message: undefined,
    } as OllamaState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(requestOllamaCheckThunk.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(requestOllamaCheckThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.ollamaStatus = action.payload.ollamaStatus;
        })
        builder.addCase(requestOllamaCheckThunk.rejected, (state, action) => {
            state.loading = false;
            state.ollamaStatus = { status: 'error', message: action.payload?.errors as string };
        })
        builder.addCase(requestPythonCheckThunk.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(requestPythonCheckThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.pythonStatus = action.payload.pythonStatus || { status: 'idle', version: '', message: '' };
        })
        builder.addCase(requestPythonCheckThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || null;
        })
        builder.addCase(requestPythonLibraryCheckThunk.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(requestPythonLibraryCheckThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.pythonLibraryStatus = action.payload.pythonLibraryStatus || { status: 'idle', installed: [], missing: [], };
        })
        builder.addCase(requestPythonLibraryCheckThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || null;
        })
    }
})
export default HealthCheckSlice.reducer;
