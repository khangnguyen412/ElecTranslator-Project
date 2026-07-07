"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_store_1 = __importDefault(require("electron-store"));
const store = new electron_store_1.default({
    defaults: {
        data: {
            setting: {
                provider: [
                    {
                        id: 'OpenAI',
                        name: 'OpenAI',
                        type: 'cloud',
                        api_key: '',
                        base_url: '',
                    },
                    {
                        id: 'Claude',
                        name: 'Claude',
                        type: 'cloud',
                        api_key: '',
                        base_url: '',
                    },
                    {
                        id: 'Qwen',
                        name: 'Qwen',
                        type: 'cloud',
                        api_key: '',
                        base_url: '',
                    },
                    {
                        id: 'Deepseek',
                        name: 'Deepseek',
                        type: 'cloud',
                        api_key: '',
                        base_url: '',
                    },
                    {
                        id: 'Google',
                        name: 'Google',
                        type: 'cloud',
                        api_key: '',
                        base_url: '',
                    },
                    {
                        id: 'Nvidia',
                        name: 'Nvidia',
                        type: 'cloud',
                        api_key: '',
                        base_url: '',
                    },
                    {
                        id: 'OpenRouter',
                        name: 'OpenRouter',
                        type: 'cloud',
                        api_key: '',
                        base_url: '',
                    },
                    {
                        id: '9route',
                        name: '9route',
                        type: 'local',
                        api_key: '',
                        base_url: '',
                        model: []
                    },
                    {
                        id: 'Ollama',
                        name: 'Ollama',
                        type: 'local',
                        api_key: '',
                        base_url: '',
                        model: [
                            'translategemma:12b'
                        ],
                    },
                ],
                default_provider_id: 'Nvidia',
                default_ocr_language: 'chinese_simplified',
                default_source_language: 'chinese_simplified',
                default_target_language: 'vietnamese',
            },
            history: [],
        },
    },
});
exports.default = store;
