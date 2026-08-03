import type { QuestionBatch } from './data';

const STORAGE_KEY = 'dino-question-bank-custom-batches-v1';

export function loadCustomBatches(): QuestionBatch[] {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomBatches(batches: QuestionBatch[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
  } catch {
    // Local storage may be unavailable in private browsing or full.
  }
}
