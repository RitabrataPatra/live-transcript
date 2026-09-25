import { Language } from '../types';

export const POPULAR_LANGUAGE_CODES = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'hi-IN', 'zh-CN', 'ja-JP', 'pt-BR'];

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en-US', name: 'English (US)', nativeName: 'English (US)', country: 'United States', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English (UK)', country: 'United Kingdom', flag: '🇬🇧' },
  { code: 'en-IN', name: 'English (India)', nativeName: 'English (India)', country: 'India', flag: '🇮🇳' },
  { code: 'en-AU', name: 'English (Australia)', nativeName: 'English (Australia)', country: 'Australia', flag: '🇦🇺' },
  { code: 'en-CA', name: 'English (Canada)', nativeName: 'English (Canada)', country: 'Canada', flag: '🇨🇦' },
  
  { code: 'es-ES', name: 'Spanish (Spain)', nativeName: 'Español (España)', country: 'Spain', flag: '🇪🇸' },
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)', country: 'Mexico', flag: '🇲🇽' },
  { code: 'es-US', name: 'Spanish (US)', nativeName: 'Español (Estados Unidos)', country: 'United States', flag: '🇺🇸' },
  
  { code: 'fr-FR', name: 'French (France)', nativeName: 'Français (France)', country: 'France', flag: '🇫🇷' },
  { code: 'fr-CA', name: 'French (Canada)', nativeName: 'Français (Canada)', country: 'Canada', flag: '🇨🇦' },
  
  { code: 'de-DE', name: 'German', nativeName: 'Deutsch', country: 'Germany', flag: '🇩🇪' },
  
  { code: 'hi-IN', name: 'Hindi', nativeName: 'हिन्दी', country: 'India', flag: '🇮🇳' },
  { code: 'bn-IN', name: 'Bengali (India)', nativeName: 'বাংলা (ভারত)', country: 'India', flag: '🇮🇳' },
  { code: 'bn-BD', name: 'Bengali (Bangladesh)', nativeName: 'বাংলা (বাংলাদেশ)', country: 'Bangladesh', flag: '🇧🇩' },
  { code: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', country: 'India', flag: '🇮🇳' },
  { code: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', country: 'India', flag: '🇮🇳' },
  { code: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', country: 'India', flag: '🇮🇳' },
  { code: 'ur-PK', name: 'Urdu', nativeName: 'اردو', country: 'Pakistan', flag: '🇵🇰' },
  
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', country: 'China', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', country: 'Taiwan', flag: '🇹🇼' },
  { code: 'zh-HK', name: 'Chinese (Cantonese)', nativeName: '粵語', country: 'Hong Kong', flag: '🇭🇰' },
  
  { code: 'ja-JP', name: 'Japanese', nativeName: '日本語', country: 'Japan', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', nativeName: '한국어', country: 'South Korea', flag: '🇰🇷' },
  
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', country: 'Brazil', flag: '🇧🇷' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)', country: 'Portugal', flag: '🇵🇹' },
  
  { code: 'it-IT', name: 'Italian', nativeName: 'Italiano', country: 'Italy', flag: '🇮🇹' },
  { code: 'ru-RU', name: 'Russian', nativeName: 'Русский', country: 'Russia', flag: '🇷🇺' },
  { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', nativeName: 'العربية (السعودية)', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'ar-EG', name: 'Arabic (Egypt)', nativeName: 'العربية (مصر)', country: 'Egypt', flag: '🇪🇬' },
  { code: 'ar-AE', name: 'Arabic (UAE)', nativeName: 'العربية (الإمارات)', country: 'United Arab Emirates', flag: '🇦🇪' },
  
  { code: 'nl-NL', name: 'Dutch', nativeName: 'Nederlands', country: 'Netherlands', flag: '🇳🇱' },
  { code: 'pl-PL', name: 'Polish', nativeName: 'Polski', country: 'Poland', flag: '🇵🇱' },
  { code: 'tr-TR', name: 'Turkish', nativeName: 'Türkçe', country: 'Turkey', flag: '🇹🇷' },
  { code: 'vi-VN', name: 'Vietnamese', nativeName: 'Tiếng Việt', country: 'Vietnam', flag: '🇻🇳' },
  { code: 'th-TH', name: 'Thai', nativeName: 'ไทย', country: 'Thailand', flag: '🇹🇭' },
  { code: 'id-ID', name: 'Indonesian', nativeName: 'Bahasa Indonesia', country: 'Indonesia', flag: '🇮🇩' },
  { code: 'sv-SE', name: 'Swedish', nativeName: 'Svenska', country: 'Sweden', flag: '🇸🇪' },
  { code: 'el-GR', name: 'Greek', nativeName: 'Ελληνικά', country: 'Greece', flag: '🇬🇷' },
  { code: 'uk-UA', name: 'Ukrainian', nativeName: 'Українська', country: 'Ukraine', flag: '🇺🇦' },
  { code: 'cs-CZ', name: 'Czech', nativeName: 'Čeština', country: 'Czech Republic', flag: '🇨🇿' },
  { code: 'da-DK', name: 'Danish', nativeName: 'Dansk', country: 'Denmark', flag: '🇩🇰' },
  { code: 'fi-FI', name: 'Finnish', nativeName: 'Suomi', country: 'Finland', flag: '🇫🇮' },
  { code: 'he-IL', name: 'Hebrew', nativeName: 'עברית', country: 'Israel', flag: '🇮🇱' },
  { code: 'no-NO', name: 'Norwegian', nativeName: 'Norsk', country: 'Norway', flag: '🇳🇴' },
  { code: 'ro-RO', name: 'Romanian', nativeName: 'Română', country: 'Romania', flag: '🇷🇴' },
  { code: 'hu-HU', name: 'Hungarian', nativeName: 'Magyar', country: 'Hungary', flag: '🇭🇺' },
  { code: 'ms-MY', name: 'Malay', nativeName: 'Bahasa Melayu', country: 'Malaysia', flag: '🇲🇾' },
];

export const getLanguageByCode = (code: string): Language => {
  const match = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
  if (match) return match;
  // Fallback prefix match (e.g. 'en' -> 'en-US')
  const prefixMatch = SUPPORTED_LANGUAGES.find((lang) => lang.code.startsWith(code.split('-')[0]));
  return prefixMatch || SUPPORTED_LANGUAGES[0];
};
