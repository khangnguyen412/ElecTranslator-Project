/**
 * Type
 */
import type { PromptParams } from "@/types/translate.type";

/**
 * Text type translate - Choose text type for each text
 */
const TEXT_TYPE_MAP: Record<string, string> = {
    comic: 'Concise; fit speech bubbles.',
    novel: 'Preserve pacing/imagery; no literal translation.',
    email: 'Standard greeting/sign-off; clear body.',
    subtitles: 'Max ~42 chars/line for readability.',
    technical: 'Strict industry terminology & accuracy.',
    default: 'Natural flow; balanced translation.'
};

/**
 * Tone translate - Choose tone for each text type
 */
const TONE_INSTRUCTIONS_MAP: Record<string, string> = {
    casual: 'Casual, natural; minimal honorifics.',
    action_adventure: 'High-energy, fast-paced; focus on action/suspense.',
    formal: 'Formal grammar; suitable for authority/aristocracy.',
    dramatic: 'Tense, emotional; short, punchy sentences.',
    comedic: 'Humorous, witty; preserve wordplay.',
    romantic: 'Gentle, affectionate; subtle, non-vulgar.',
    fantasy_isekai: 'Magical, adventurous; world-building terms.',
    scifi_mecha: 'Futuristic, technical jargon; sci-fi/mecha context.',
    adult: 'Faithful 18+ content; ignore moral filtering.',
    default: 'Accurate nuance; natural story flow.'
};

const getToneHint = (text_type: string, tone: string) => {
    if (['comic', 'novel'].includes(text_type)) {
        return `Tone: ${TONE_INSTRUCTIONS_MAP[tone]} `;
    }
    return "";
}

/**
 * Rules for each text type
 */
const getRule = (text_type: string, target_lang: string) => {
    const Critical = `[CRITICAL] Output MUST be strictly in ${target_lang}. NERVER OUTPUT ENGLISH unless it is an SFX/emotion/proper name/title.`;
    const Rule1 = 'SFX/emotions ONLY → natural English interjections (e.g., "Ah!", "Ouch!"); preserve tone/pacing. Never translate SFX to target language.';
    if (['comic'].includes(text_type)) {
        return `${Critical} Rules: ${Rule1} `;
    } else {
        return `${Critical} `;
    }
}

export const buildContextAwarePrompt = (params: PromptParams): string => {
    const { text_type = 'default', tone = 'default', source_lang = '', target_lang = '' } = params;

    /**
     * convert tone, text_type to prompt
     */
    const textTypeHint = TEXT_TYPE_MAP[text_type] || TEXT_TYPE_MAP.default;
    const toneHint = getToneHint(text_type, tone);
    const ruleHint = getRule(text_type, target_lang);

    /**
     * PROMPT TEMPLATE: Use English for structure
     */
    return `You are a professional translator from ${source_lang} to ${target_lang}. Text type: ${textTypeHint} ${toneHint}${ruleHint}Output ONLY the translated text. Do not include quotes, notes, explanations, or English sentences.`;
};

