/**
 * Type
 */
import type { SelectOption } from '@/types/common.type';

/** Options for Source Language — Normal mode (Auto) */
export const SOURCE_LANG_OPTIONS: SelectOption[] = [
    { value: 'auto', label: 'Auto' },
    { value: 'chinese_simplified', label: 'Chinese (Simplified)' },
    { value: 'chinese_traditional', label: 'Chinese (Traditional)' },
    { value: 'english', label: 'English' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'vietnamese', label: 'Vietnamese' },
    { value: 'korean', label: 'Korean' },
]

/** Options for Source Language — AI mode */
export const SOURCE_LANG_OPTIONS_AI: SelectOption[] = SOURCE_LANG_OPTIONS.filter(item => item.value !== 'auto')

/** Options for Target Language */
export const TARGET_LANG_OPTIONS: SelectOption[] = [
    { value: 'chinese_simplified', label: 'Chinese (Simplified)' },
    { value: 'chinese_traditional', label: 'Chinese (Traditional)' },
    { value: 'english', label: 'English' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'vietnamese', label: 'Vietnamese' },
    { value: 'korean', label: 'Korean' },
]

/** Options for Translation Mode */
export const MODE_OPTIONS: SelectOption[] = [
    { value: 'Normal', label: 'Normal' },
    { value: 'AI', label: 'AI' },
];

/** Options for Category Mode */
export const CATEGORY_OPTIONS: SelectOption[] = [
    { value: 'comic', label: 'Comic' },
    { value: 'novel', label: 'Novel' },
    { value: 'email', label: 'Email' },
    { value: 'subtitles', label: 'Subtitles' },
    { value: 'technical', label: 'Technical' },
    { value: 'default', label: 'Default' },
]

/** Options for Tone Mode */
export const TONE_OPTIONS: SelectOption[] = [
    { value: 'casual', label: 'Casual' },
    { value: 'action_adventure', label: 'Action / Adventure' },
    { value: 'formal', label: 'Formal' },
    { value: 'dramatic', label: 'Dramatic' },
    { value: 'comedic', label: 'Comedic' },
    { value: 'romantic', label: 'Romantic' },
    { value: 'fantasy_isekai', label: 'Fantasy / Isekai' },
    { value: 'scifi_mecha', label: 'Sci-Fi / Mecha' },
    { value: 'adult', label: 'Adult' },
]