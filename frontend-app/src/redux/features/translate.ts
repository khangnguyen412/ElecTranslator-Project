/* eslint-disable */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

/**
 * Config
 */
import AppConfig from "@/config/app.config";

/**
 * Service
 */
import { AITranslate } from "@/services/TranslateServices";
import { buildContextAwarePrompt } from "@/services/PromptService";

/**
 * Type
 */
import type { Prompt, PromptParams } from "@/types/translate.type";
import type { ErrorType } from "@/types/error.type";

export type TranslateState = {
    data: Prompt;
    loading: boolean;
    error?: ErrorType['errors'] | null;
}

export const requestOllamaThunk = createAsyncThunk<{ data: Prompt }, { promptParams: PromptParams }, { rejectValue: ErrorType }>(
    'translate/requestOllama',
    async (data, { rejectWithValue }) => {
        try {
            const promptParams = {
                text_type: data.promptParams.text_type || 'default',
                tone: data.promptParams.tone || 'default',
                source_lang: data.promptParams.source_lang || 'en',
                source_code: data.promptParams.source_code || 'en',
                target_lang: data.promptParams.target_lang || 'vi',
                target_code: data.promptParams.target_code || 'vi',
                source_text: data.promptParams.source_text || '',
            };
            const Payload = {
                model: AppConfig.DefaultModel,
                messages: [
                    {
                        role: 'system',
                        content: buildContextAwarePrompt(promptParams),
                    },
                    {
                        role: 'user',
                        content: promptParams.source_text,
                    },
                ],
                options: {
                    temperature: 0.2,
                    top_p: 0.9,
                    repeat_penalty: 1.1,
                },
                stream: false,
            }
            const response = await AITranslate(Payload);
            return { data: response };
        } catch (error: any) {
            const errorData: ErrorType = error?.data || { errors: "Translate Failed" };
            return rejectWithValue(errorData);
        }
    }
)

const TranslateSlice = createSlice({
    name: 'translate',
    initialState: {
        data: {} as Prompt,
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
