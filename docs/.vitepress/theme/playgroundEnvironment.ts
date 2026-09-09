export const PLAYGROUND_ENVIRONMENT_KEY = 'dajiao:playground:environment:v1';
export const DEFAULT_PLAYGROUND_ENVIRONMENT = Object.freeze({
  baseUrl: 'https://api.dajiaoai.com',
  authorization: '',
});
export type PlaygroundEnvironment = { baseUrl: string; authorization: string };
type EnvironmentStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function browserStorage(): EnvironmentStorage | undefined {
  try { return typeof window === 'undefined' ? undefined : window.localStorage; }
  catch { return undefined; }
}

// Shared across endpoint pages. Only these two environment fields are persisted.
export function loadPlaygroundEnvironment(storage = browserStorage()): PlaygroundEnvironment {
  const defaults = { ...DEFAULT_PLAYGROUND_ENVIRONMENT };
  try {
    const saved = JSON.parse(storage?.getItem(PLAYGROUND_ENVIRONMENT_KEY) || 'null');
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return defaults;
    return {
      baseUrl: typeof saved.baseUrl === 'string' ? saved.baseUrl : defaults.baseUrl,
      authorization: typeof saved.authorization === 'string' ? saved.authorization : defaults.authorization,
    };
  } catch { return defaults; }
}

export function savePlaygroundEnvironment(environment: PlaygroundEnvironment, storage = browserStorage()): boolean {
  try {
    if (!storage) return false;
    storage.setItem(PLAYGROUND_ENVIRONMENT_KEY, JSON.stringify({
      baseUrl: environment.baseUrl,
      authorization: environment.authorization,
    }));
    return true;
  } catch { return false; }
}

export function resetPlaygroundEnvironment(storage = browserStorage()): boolean {
  try {
    if (!storage) return false;
    storage.removeItem(PLAYGROUND_ENVIRONMENT_KEY);
    return true;
  } catch { return false; }
}
