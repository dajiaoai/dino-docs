import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../docs/.vitepress/theme/projectViewer.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { parseViewerMode, validateProjectUrl, buildViewerUrl, parseProject } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);

test('viewer links round-trip signed cloud URLs and choose the initial mode', () => {
  const artifact = 'https://cdn.example.com/工程.algeo?token=a+b/c==&expires=123#file';
  const link = new URL(buildViewerUrl('https://open.dajiaoai.com/viewer?other=1', artifact, 'editor'));
  assert.equal(link.pathname, '/viewer');
  assert.equal(link.searchParams.get('url'), new URL(artifact).href);
  assert.equal(link.searchParams.get('other'), '1');
  assert.equal(parseViewerMode(link.searchParams.get('mode')), 'editor');
  for (const mode of [null, '', 'presentation', 'unknown']) assert.equal(parseViewerMode(mode), 'presentation');
});

test('local import removes the previous cloud URL without losing the mode', () => {
  const link = new URL(buildViewerUrl('https://open.dajiaoai.com/viewer?url=old&mode=editor', '', 'editor'));
  assert.equal(link.searchParams.has('url'), false);
  assert.equal(link.searchParams.get('mode'), 'editor');
});

test('cloud loading rejects executable, relative and credential-bearing URLs', () => {
  for (const value of ['javascript:alert(1)', 'data:application/json,{}', '/project.algeo', 'file:///tmp/a', 'https://user:password@example.com/a']) {
    assert.throws(() => validateProjectUrl(value));
  }
  assert.equal(validateProjectUrl(' https://example.com/project.algeo '), 'https://example.com/project.algeo');
});

test('local and remote imports accept V10/V11 JSON with BOM and reject non-project responses', () => {
  for (const version of ['10', '11']) {
    const project = { metadata: { version }, slides: [{}], messages: [] };
    assert.deepEqual(parseProject('\uFEFF' + JSON.stringify(project)), project);
  }
  for (const text of ['<html>Access denied</html>', 'null', '{}', '[]', '{"metadata":{"version":"11"},"slides":[],"messages":[]}']) {
    assert.throws(() => parseProject(text));
  }
});

test('legacy viewer links normalize to the clean URL and retain query parameters', () => {
  const link = new URL(buildViewerUrl('https://open.dajiaoai.com/viewer.html?other=1', 'https://cdn.example.com/project.algeo?token=a%2Bb', 'editor'));
  assert.equal(link.pathname, '/viewer');
  assert.equal(link.searchParams.get('other'), '1');
  assert.equal(link.searchParams.get('url'), 'https://cdn.example.com/project.algeo?token=a%2Bb');
  assert.equal(link.searchParams.get('mode'), 'editor');
});
