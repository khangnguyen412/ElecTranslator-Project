/* eslint-disable */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/**
 * Service
 */
import { checkHealth } from "@/services/HealthCheckServices";

/**
 * Type
 */
import type { HealthCheckPayload } from "@/types/heathCheck.type";
import type { ErrorType } from "@/types/error.type";

export interface OllamaState {
    loading: boolean;
    status: HealthCheckPayload['model'];
    error: ErrorType | null;
    message: string;
}

export const requestHealthCheckThunk = createAsyncThunk<{ data: any }, null, { rejectValue: ErrorType }>(
    'healthCheck/requestHealthCheck',
    async (_, { rejectWithValue }) => {
        try {
            const response = await checkHealth();
            return { data: response };
        } catch (error: any) {
            const errorData: ErrorType = error?.data || { errors: "Health Check Failed" };
            return rejectWithValue(errorData);
        }
    }
)

const HealthCheckSlice = createSlice({
    name: 'healthCheck',
    initialState: {
        loading: false,
        status: [],
        error: null,
        message: '',
    } as OllamaState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(requestHealthCheckThunk.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(requestHealthCheckThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.status = action.payload.data;
        })
        builder.addCase(requestHealthCheckThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || null;
        })
    }
})
export default HealthCheckSlice.reducer;
