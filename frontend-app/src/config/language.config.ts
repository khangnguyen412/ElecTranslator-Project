export interface LanguageConfig {
    lang: string | undefined;
    langName: string | undefined;
    langCode: string | undefined;
    ocrCode: string | undefined;
}

export const LANG_MAP: LanguageConfig[] = [
    { lang: 'chinese_simplified', langName: 'Chinese (Simplified)', langCode: 'zh-Hans', ocrCode: 'ch' },
    { lang: 'chinese_traditional', langName: 'Chinese (Traditional)', langCode: 'zh-Hant', ocrCode: 'chinese_cht' },
    { lang: 'english', langName: 'English', langCode: 'en', ocrCode: 'en' },
    { lang: 'japanese', langName: 'Japanese', langCode: 'ja', ocrCode: 'japan' },
    { lang: 'korean', langName: 'Korean', langCode: 'ko', ocrCode: 'korean' },
    { lang: 'vietnamese', langName: 'Vietnamese', langCode: 'vi', ocrCode: 'vi' },
]

/**
 * Get language config by OCR code
 * @param ocrCode - OCR code
 * @returns Language config
 * */
export const getLanguageByOcrCode = (ocrCode: string): LanguageConfig | undefined => LANG_MAP.find((item) => item.ocrCode === ocrCode);

/**
 * Get OCR code by language
 * @param lang - Language
 * @returns Language config
 * */
export const getOcrCodeByLang = (lang: string): LanguageConfig | undefined => LANG_MAP.find(item => item.lang?.toLowerCase?.() === lang.toLowerCase());

/**
 * Get language config by language code
 * @param langCode - Language code
 * @returns Language config
 * */
export const getLanguageByLangCode = (langCode: string): LanguageConfig | undefined => LANG_MAP.find((item) => item.langCode === langCode);

/**
 * Get language code by language
 * @param lang - Language
 * @returns Language code
 * */
export const getLangCodeByLang = (lang: string): LanguageConfig | undefined => LANG_MAP.find(item => item.lang?.toLowerCase?.() === lang.toLowerCase());

/**
 * Get language name by language
 * @param lang - Language
 * @returns Language name
 */
export const getLangNameByLang = (lang: string): LanguageConfig | undefined => LANG_MAP.find(item => item.lang?.toLowerCase?.() === lang.toLowerCase());


/**
 * Get language pair key
 */
export const getAllLanguages = (): LanguageConfig[] => LANG_MAP;
