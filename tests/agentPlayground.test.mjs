import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { File } from 'node:buffer';
import ts from 'typescript';

const source = readFileSync(new URL('../docs/.vitepress/theme/agentPlayground.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
const { buildAgentQueryRequest, toAgentQueryCurl, AGENT_MODELS, buildAgentRequest, toAgentCurl, getAgentPollInterval, isAgentTerminalStatus, resolveArtifactUrl } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const input = (overrides = {}) => ({
  baseUrl: 'https://api.dajiaoai.com/', authorization: 'Bearer test-key',
  model: 'dinogeo-1-pro', content: 'Draw a triangle', template: '', images: [], ...overrides,
});

test('builds multipart Agent request with optional fields omitted', () => {
  const request = buildAgentRequest(input());
  assert.equal(request.url, 'https://api.dajiaoai.com/api/agent/run');
  assert.deepEqual(request.headers, { Authorization: 'Bearer test-key' });
  assert.equal(request.formData.get('model'), 'dinogeo-1-pro');
  assert.equal(request.formData.get('content'), 'Draw a triangle');
  assert.equal(request.formData.get('template'), null);
  assert.equal(request.formData.get('image'), null);
  assert.equal(request.formData.get('images'), null);
  assert.deepEqual(AGENT_MODELS, ['dinogeo-1', 'dinogeo-1-pro']);
});

test('accepts image-only input, appends repeated images and template JSON string', () => {
  const images = [new File(['one'], 'one.png', { type: 'image/png' }), new File(['two'], 'two.jpg', { type: 'image/jpeg' })];
  const request = buildAgentRequest(input({ content: '', template: '{"theme":"blue"}', images }));
  assert.equal(request.formData.get('content'), null);
  assert.equal(request.formData.getAll('images').length, 2);
  assert.equal(request.formData.get('template'), '{"theme":"blue"}');
});

test('single-image input uses the legacy-compatible image field and reaches the server as one image', async () => {
  const image = new File(['reference'], 'one.png', { type: 'image/png' });
  const request = buildAgentRequest(input({ content: '', images: [image] }));
  assert.equal(request.formData.get('images'), null);
  assert.equal(request.formData.get('content'), null);
  const parsed = await new Request(request.url, { method: 'POST', body: request.formData }).formData();
  const images = [parsed.get('image'), ...parsed.getAll('images')].filter(Boolean);
  assert.equal(images.length, 1);
  assert.equal(images[0].name, 'one.png');
  assert.equal(await images[0].text(), 'reference');
  const curl = toAgentCurl(input({ images: [image] }));
  assert.match(curl, /-F 'image=@one\.png'/);
  assert.doesNotMatch(curl, /images=@/);
});

test('multiple-image cURL uses repeated images fields matching the multipart request', () => {
  const images = [new File(['one'], 'one.png'), new File(['two'], 'two.png')];
  const request = buildAgentRequest(input({ images }));
  assert.equal(request.formData.get('image'), null);
  assert.deepEqual(request.formData.getAll('images').map(image => image.name), ['one.png', 'two.png']);
  const curl = toAgentCurl(input({ images }));
  assert.match(curl, /-F 'images=@one\.png'/);
  assert.match(curl, /-F 'images=@two\.png'/);
  assert.doesNotMatch(curl, /-F 'image=@/);
});

test('rejects missing task input, excess images and invalid templates', () => {
  const image = new File(['x'], 'x.png', { type: 'image/png' });
  for (const value of [
    input({ content: '  ' }),
    input({ images: Array.from({ length: 11 }, () => image) }),
    input({ template: '[]' }),
    input({ template: '{broken' }),
    input({ model: 'unknown' }),
  ]) assert.throws(() => buildAgentRequest(value));
});

test('cURL includes multipart fields and safely quotes user values', () => {
  const curl = toAgentCurl(input({ content: "Draw 'A'", images: [new File(['x'], 'ref image.png')] }));
  assert.match(curl, /-F 'content=Draw '"'"'A'"'"''/);
  assert.match(curl, /-F 'image=@ref image\.png'/);
  assert.doesNotMatch(curl, /Content-Type/);
});

test('polling cadence and terminal statuses follow the Agent task contract', () => {
  assert.equal(getAgentPollInterval(0), 2_000);
  assert.equal(getAgentPollInterval(29_999), 2_000);
  assert.equal(getAgentPollInterval(30_000), 5_000);
  assert.equal(isAgentTerminalStatus('finished'), true);
  assert.equal(isAgentTerminalStatus('error'), true);
  assert.equal(isAgentTerminalStatus('running'), false);
});

test('artifact links are restricted to HTTP and HTTPS', () => {
  assert.equal(resolveArtifactUrl('https://cdn.example.com/result.algeo', 'https://api.example.com'), 'https://cdn.example.com/result.algeo');
  assert.equal(resolveArtifactUrl('javascript:alert(1)', 'https://api.example.com'), undefined);
  assert.equal(resolveArtifactUrl('', 'https://api.example.com'), undefined);
});

const queryInput = (overrides = {}) => ({
  baseUrl: 'https://api.example.com/', authorization: 'Bearer test-key',
  page: '', pageSize: '', status: '', taskId: '', ...overrides,
});

test('task list queries omit blank defaults and include pagination and status filters', () => {
  assert.deepEqual(buildAgentQueryRequest(queryInput(), 'tasks'), {
    url: 'https://api.example.com/api/agent/tasks', headers: { Authorization: 'Bearer test-key' },
  });
  const request = buildAgentQueryRequest(queryInput({ page: 2, pageSize: '100', status: 'finished' }), 'tasks');
  assert.equal(request.url, 'https://api.example.com/api/agent/tasks?page=2&pageSize=100&status=finished');
  assert.equal('formData' in request, false);
});

test('task queries reject invalid pagination, status, service URLs and header injection', () => {
  for (const value of [
    { page: '0' }, { page: '-1' }, { page: '1.5' }, { page: '1e2' },
    { pageSize: 101 }, { pageSize: '0' }, { status: 'unknown' },
    { baseUrl: 'javascript:alert(1)' }, { authorization: 'Bearer test\r\nX-Foo: bar' },
  ]) assert.throws(() => buildAgentQueryRequest(queryInput(value), 'tasks'));
});

test('task detail requires an ID and encodes it as one URL path segment', () => {
  for (const taskId of ['', ' ', '.', '..']) {
    assert.throws(() => buildAgentQueryRequest(queryInput({ taskId }), 'detail'));
  }
  const request = buildAgentQueryRequest(queryInput({ taskId: ' task/a?b#c ' }), 'detail');
  assert.equal(request.url, 'https://api.example.com/api/agent/tasks/task%2Fa%3Fb%23c');
  assert.deepEqual(request.headers, { Authorization: 'Bearer test-key' });
});

test('query cURL matches GET URLs and headers without create-task fields', () => {
  for (const variant of ['tasks', 'detail']) {
    const value = queryInput({ taskId: 'task-123', page: '2', status: 'running' });
    const request = buildAgentQueryRequest(value, variant);
    const curl = toAgentQueryCurl(value, variant);
    assert.ok(curl.startsWith(`curl -X GET '${request.url}'`));
    assert.match(curl, /-H 'Authorization: Bearer test-key'/);
    assert.doesNotMatch(curl, /-F |Content-Type|agent\/run/);
  }
});
