import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';
const source = readFileSync(new URL('../docs/.vitepress/theme/playgroundEnvironment.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022 } }).outputText;
const { PLAYGROUND_ENVIRONMENT_KEY: key, DEFAULT_PLAYGROUND_ENVIRONMENT: defaults, loadPlaygroundEnvironment: load, savePlaygroundEnvironment: save, resetPlaygroundEnvironment: reset } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const memoryStorage = () => {
  const data = new Map();
  return { getItem: k => data.get(k) ?? null, setItem: (k, v) => data.set(k, v), removeItem: k => data.delete(k) };
};
test('shared cache restores only environment fields across playgrounds', () => {
  const storage = memoryStorage();
  assert.deepEqual(load(storage), defaults);
  const environment = { baseUrl: 'https://example.com', authorization: 'Bearer saved-key' };
  assert.equal(save({ ...environment, content: 'private project', requestId: 'id' }, storage), true);
  assert.deepEqual(load(storage), environment);
  assert.deepEqual(JSON.parse(storage.getItem(key)), environment);
  assert.equal(save({ baseUrl: '', authorization: '' }, storage), true);
  assert.deepEqual(load(storage), { baseUrl: '', authorization: '' });
});
test('reset clears the shared cache and restores defaults without clearing unrelated data', () => {
  const storage = memoryStorage();
  storage.setItem('other', 'keep');
  save({ baseUrl: 'https://example.com', authorization: 'Bearer saved-key' }, storage);
  assert.equal(reset(storage), true);
  assert.equal(storage.getItem(key), null);
  assert.deepEqual(load(storage), defaults);
  assert.equal(storage.getItem('other'), 'keep');
});
test('malformed or unavailable storage falls back safely, including SSR', () => {
  const storage = memoryStorage();
  for (const value of ['broken JSON', 'null', '[]', '{"baseUrl":42,"authorization":false}']) {
    storage.setItem(key, value);
    assert.deepEqual(load(storage), defaults);
  }
  const blocked = { getItem() { throw Error(); }, setItem() { throw Error(); }, removeItem() { throw Error(); } };
  assert.deepEqual(load(blocked), defaults);
  assert.equal(save(defaults, blocked), false);
  assert.equal(reset(blocked), false);
  assert.deepEqual(load(), defaults);
});
