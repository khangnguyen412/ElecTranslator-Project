/* eslint-disable */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/**
 * Service
 */
import { GetSettingService, SaveSettingService, GetHistoryService, AddHistoryService, ClearHistoryService } from "@/services/StoreServices";

/**
 * Type
 */
import type { Setting, History } from "@/types/store.type";
import type { ErrorType } from "@/types/error.type";

export type StoreState = {
    status: boolean;
    setting: Setting;
    history: History[];
    loading: boolean;
    error?: ErrorType['error'] | null;
}

export const getSettingThunk = createAsyncThunk<Setting, void, { rejectValue: ErrorType }>(
    'store/getSetting',
    async (_, { rejectWithValue }) => {
        try {
            const response = await GetSettingService();
            return response;
        } catch (error: any) {
            const errorData: ErrorType = error?.data || { error: "Get Setting Failed" };
            return rejectWithValue(errorData);
        }
    }
)

export const saveSettingThunk = createAsyncThunk<boolean, Setting, { rejectValue: ErrorType }>(
    'store/saveSetting',
    async (data, { rejectWithValue }) => {
        try {
            const response = await SaveSettingService(data);
            return response;
        } catch (error: any) {
            const errorData: ErrorType = error?.data || { error: "Save Setting Failed" };
            return rejectWithValue(errorData);
        }
    }
)

export const getHistoryThunk = createAsyncThunk<History[], void, { rejectValue: ErrorType }>(
    'store/getHistory',
    async (_, { rejectWithValue }) => {
        try {
            const response = await GetHistoryService();
            return response;
        } catch (error: any) {
            const errorData: ErrorType = error?.data || { error: "Get History Failed" };
            return rejectWithValue(errorData);
        }
    }
)

export const addHistoryThunk = createAsyncThunk<boolean, History, { rejectValue: ErrorType }>(
    'store/addHistory',
    async (data, { rejectWithValue }) => {
        try {
            const response = await AddHistoryService(data.source_text, data.target_text);
            return response;
        } catch (error: any) {
            const errorData: ErrorType = error?.data || { error: "Add History Failed" };
            return rejectWithValue(errorData);
        }
    }
)

export const clearHistoryThunk = createAsyncThunk<boolean, void, { rejectValue: ErrorType }>(
    'store/clearHistory',
    async (_, { rejectWithValue }) => {
        try {
            const response = await ClearHistoryService();
            return response;
        } catch (error: any) {
            const errorData: ErrorType = error?.data || { error: "Clear History Failed" };
            return rejectWithValue(errorData);
        }
    }
)

const StoreSlice = createSlice({
    name: 'store',
    initialState: {
        status: false,
        setting: {},
        history: [] as History[],
        loading: false,
        error: null,
    } as StoreState,
    reducers: {},
    extraReducers: (builder) => {
        /**
         * Get Setting
         */
        builder.addCase(getSettingThunk.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getSettingThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.setting = action.payload;
        })
        builder.addCase(getSettingThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action?.payload?.error;
        })

        /**
         * Save Setting
         */
        builder.addCase(saveSettingThunk.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(saveSettingThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.status = action.payload;
        })
        builder.addCase(saveSettingThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action?.payload?.error;
        })

        /**
         * Get History
         */ 
        builder.addCase(getHistoryThunk.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(getHistoryThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.history = action.payload;
        })
        builder.addCase(getHistoryThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action?.payload?.error;
        })

        /** 
         * Add History
         */
        builder.addCase(addHistoryThunk.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(addHistoryThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.status = action.payload;
        })
        builder.addCase(addHistoryThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action?.payload?.error;
        })

        /**
         * Clear History
         */
        builder.addCase(clearHistoryThunk.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(clearHistoryThunk.fulfilled, (state, action) => {
            state.loading = false;
            state.status = action.payload;
        })
        builder.addCase(clearHistoryThunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action?.payload?.error;
        })

    }
})
export default StoreSlice.reducer;
