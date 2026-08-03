import { demoConfig } from "./config";

export type ApiSettings = {
  baseUrl: string;
  apiKey: string;
  model: string;
};

const STORAGE_KEY = "dino-question-bank-api-settings-v1";

export const defaultApiSettings: ApiSettings = {
  baseUrl: demoConfig.apiBaseUrl,
  apiKey: "",
  model: demoConfig.apiModel,
};

export function loadApiSettings(): ApiSettings {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultApiSettings;
    const parsed = JSON.parse(stored) as Partial<ApiSettings>;
    return {
      baseUrl: parsed.baseUrl?.trim() || defaultApiSettings.baseUrl,
      apiKey: parsed.apiKey ?? "",
      model: parsed.model?.trim() || defaultApiSettings.model,
    };
  } catch {
    return defaultApiSettings;
  }
}

export function saveApiSettings(settings: ApiSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Local storage may be unavailable in private browsing or full.
  }
}
