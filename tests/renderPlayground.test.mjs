import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import ts from 'typescript';

const compilerOptions = { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 };
const configSource = readFileSync(new URL('../docs/.vitepress/theme/renderPlaygroundConfig.ts', import.meta.url), 'utf8');
const configJs = ts.transpileModule(configSource, { compilerOptions }).outputText;
const configUrl = `data:text/javascript;base64,${Buffer.from(configJs).toString('base64')}`;
const source = readFileSync(new URL('../docs/.vitepress/theme/renderPlayground.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions }).outputText
  .replace(/from ['"]\.\/renderPlaygroundConfig['"];/, `from '${configUrl}';`);
const { buildRequest, toCurl } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const config = (overrides = {}) => ({
  baseUrl: 'https://api.dajiaoai.com/', authorization: 'Bearer test-key', requestId: '',
  content: '{"slides":[]}', template: '', slideIndex: '', mode: 'auto',
  view2D: { left: '-10', right: '10', bottom: '-10', top: '10' },
  view3D: {}, offset: '', projection: '', ...overrides,
});

test('automatic camera omits optional values and uses the documented endpoint and headers', () => {
  const request = buildRequest(config());
  assert.equal(request.url, 'https://api.dajiaoai.com/api/render/v2');
  assert.deepEqual(JSON.parse(request.body), { content: { slides: [] } });
  assert.deepEqual(request.headers, { 'Content-Type': 'application/json', Authorization: 'Bearer test-key' });
});
test('transparent is a top-level option for v2 PNG, legacy PNG, and SVG requests', () => {
  assert.deepEqual(JSON.parse(buildRequest(config({ transparent: true })).body), {
    content: { slides: [] }, transparent: true,
  });
  assert.deepEqual(JSON.parse(buildRequest(config({ variant: 'png-legacy', transparent: true })).body), {
    content: { slides: [] }, transparent: true,
  });
  assert.deepEqual(JSON.parse(buildRequest(config({ variant: 'svg', transparent: true })).body), {
    content: { slides: [] }, transparent: true,
  });
});
test('2D and 3D modes include only the selected view, preserving zero and optional values', () => {
  const two = JSON.parse(buildRequest(config({ mode: '2d', slideIndex: '2', template: '{}', view3D: { width: '720' } })).body);
  assert.deepEqual(two.view2D, { left: -10, right: 10, bottom: -10, top: 10 });
  assert.equal(two.view3D, undefined);
  assert.equal(two.slideIndex, 2);
  assert.deepEqual(two.template, {});
  const three = JSON.parse(buildRequest(config({ mode: '3d', offset: '[0,1,2]', projection: 'oblique', view3D: { yawDeg: '0', obliqueScaleRatio: '0', width: '1280', height: '720', pixelRatio: '2' } })).body);
  assert.equal(three.view2D, undefined);
  assert.deepEqual(three.view3D, { yawDeg: 0, obliqueScaleRatio: 0, width: 1280, height: 720, pixelRatio: 2, offset: [0, 1, 2], projection: 'oblique' });
  assert.deepEqual(JSON.parse(buildRequest(config({ mode: '3d' })).body).view3D, {});
});
test('invalid JSON, bounds, dimensions and nonfinite values are rejected', () => {
  for (const overrides of [
    { content: '' }, { content: '[]' }, { content: 'null' }, { template: '[]' },
    { slideIndex: '0' }, { slideIndex: '1.5' },
    { mode: '2d', view2D: { left: '10', right: '-10', bottom: '0', top: '1' } },
    { mode: '2d', view2D: { left: '0' } },
    { mode: '3d', view3D: { scale: 'Infinity' } },
    { mode: '3d', view3D: { pixelRatio: '0' } },
    { mode: '3d', view3D: { width: '1.5' } },
    { mode: '3d', view3D: { obliqueScaleRatio: '-1' } },
    { mode: '3d', offset: '[0, 1]' }, { mode: '3d', offset: '[0,1,"2"]' },
    { baseUrl: 'javascript:alert(1)' }, { baseUrl: 'https://user:pass@example.com' },
    { requestId: 'first\r\nInjected: value' },
  ]) assert.throws(() => buildRequest(config(overrides)), undefined, JSON.stringify(overrides));
});
test('cURL shell quoting round-trips request headers and body without evaluating user content', () => {
  const request = buildRequest(config({ requestId: "demo'$(echo unsafe)", content: JSON.stringify({ text: "a'b\n`whoami` $HOME" }) }));
  // Replace curl with an argument recorder: no network request is made.
  const script = `curl() { printf '%s\\0' "$@"; }\n${toCurl(request)}`;
  const result = spawnSync('bash', ['-s'], { input: script, encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.deepEqual(result.stdout.split('\0').slice(0, -1), [
    '-X', 'POST', request.url,
    ...Object.entries(request.headers).flatMap(([key, value]) => ['-H', `${key}: ${value}`]),
    '--data-binary', request.body,
  ]);
});

test('numeric inputs produced by Vue preserve zero and accept edited dimensions', () => {
  const body = JSON.parse(buildRequest(config({ slideIndex: 2, mode: '3d', view3D: { width: 1280, yawDeg: 0, obliqueScaleRatio: 0 } })).body);
  assert.equal(body.slideIndex, 2);
  assert.deepEqual(body.view3D, { yawDeg: 0, obliqueScaleRatio: 0, width: 1280 });
  assert.throws(() => buildRequest(config({ mode: '3d', view3D: { width: 0 } })));
});

test('legacy requests use /api/render with viewBound and top-level output options', () => {
  const request = buildRequest(config({ variant: 'png-legacy', mode: '2d', slideIndex: 2, template: '{}', view2D: { left: 0, right: 10, bottom: -10, top: 10, scale: 50, pixelRatio: 2 } }));
  assert.equal(request.url, 'https://api.dajiaoai.com/api/render');
  assert.deepEqual(JSON.parse(request.body), {
    content: { slides: [] }, slideIndex: 2, template: {},
    viewBound: { left: 0, right: 10, bottom: -10, top: 10 }, scale: 50, pixelRatio: 2,
  });
  assert.equal(request.headers.Authorization, 'Bearer test-key');
});

test('legacy saved camera allows independent scale and pixelRatio overrides', () => {
  assert.deepEqual(JSON.parse(buildRequest(config({ variant: 'png-legacy' })).body), { content: { slides: [] } });
  for (const key of ['scale', 'pixelRatio']) {
    assert.deepEqual(JSON.parse(buildRequest(config({ variant: 'png-legacy', view2D: { [key]: '2' } })).body), { content: { slides: [] }, [key]: 2 });
    for (const value of [0, -1, 'Infinity', 'abc']) {
      assert.throws(() => buildRequest(config({ variant: 'png-legacy', view2D: { [key]: value } })));
    }
  }
});

test('SVG requests use /api/render-svg with top-level viewBound and scale but no pixelRatio', () => {
  const request = buildRequest(config({
    variant: 'svg', mode: '2d', slideIndex: 2, template: '{}',
    view2D: { left: 0, right: 10, bottom: -10, top: 10, scale: 50, pixelRatio: 2 },
  }));
  assert.equal(request.url, 'https://api.dajiaoai.com/api/render-svg');
  assert.deepEqual(JSON.parse(request.body), {
    content: { slides: [] }, slideIndex: 2, template: {},
    viewBound: { left: 0, right: 10, bottom: -10, top: 10 }, scale: 50,
  });
  assert.throws(() => buildRequest(config({ variant: 'svg', mode: '3d' })));
});

test('legacy rejects 3D and incomplete or inverted explicit bounds', () => {
  for (const overrides of [
    { mode: '3d' }, { mode: '2d', view2D: {} },
    { mode: '2d', view2D: { left: 10, right: 0, bottom: -10, top: 10 } },
  ]) assert.throws(() => buildRequest(config({ variant: 'png-legacy', ...overrides })));
});

test('v2 accepts omitted bounds but rejects partially supplied bounds', () => {
  for (const view2D of [{}, { scale: '50' }, { pixelRatio: '2' }]) {
    const body = JSON.parse(buildRequest(config({ mode: '2d', view2D })).body);
    assert.deepEqual(body.view2D, Object.fromEntries(Object.entries(view2D).map(([k, v]) => [k, Number(v)])));
  }
  for (const view2D of [{ left: 0 }, { left: 0, right: 1, bottom: 0 }]) {
    assert.throws(() => buildRequest(config({ mode: '2d', view2D })));
  }
});

test('v2 top-level pixelRatio works in every mode and preserves nested overrides', () => {
  for (const mode of ['auto', '2d', '3d']) {
    const body = JSON.parse(buildRequest(config({ mode, pixelRatio: '2', view2D: { pixelRatio: 3 }, view3D: { pixelRatio: 4 } })).body);
    assert.equal(body.pixelRatio, 2);
    if (mode === '2d') assert.equal(body.view2D.pixelRatio, 3);
    if (mode === '3d') assert.equal(body.view3D.pixelRatio, 4);
    if (mode === 'auto') assert.equal(body.view2D ?? body.view3D, undefined);
  }
  for (const pixelRatio of [0, -1, 'Infinity', 'abc']) assert.throws(() => buildRequest(config({ pixelRatio })));
});

test('v2 serializes degree angles and crop without changing framing or units', () => {
  const body = JSON.parse(buildRequest(config({ mode: '3d', pixelRatio: 2,
    view3D: { yawDeg: 45, pitchDeg: 0, obliqueAngleDeg: -45, width: 1280, height: 720 },
    crop: { left: '0', top: '10', right: '1000', bottom: '700' },
  })).body);
  assert.deepEqual(body.view3D, { yawDeg: 45, pitchDeg: 0, obliqueAngleDeg: -45, width: 1280, height: 720,
    crop: { left: 0, top: 10, right: 1000, bottom: 700 } });
  for (const crop of [
    { left: 0 }, { left: -1, top: 0, right: 10, bottom: 10 },
    { left: 10, top: 0, right: 10, bottom: 10 }, { left: 0, top: 10, right: 10, bottom: 5 },
    { left: 0, top: 0, right: 1281, bottom: 720 }, { left: 0, top: 0, right: 1280, bottom: 721 },
    { left: 0, top: 0, right: 'Infinity', bottom: 10 },
  ]) assert.throws(() => buildRequest(config({ mode: '3d', view3D: { width: 1280, height: 720 }, crop })));
  assert.equal(JSON.parse(buildRequest(config({ mode: '3d', crop: {} })).body).view3D.crop, undefined);
  assert.equal(JSON.parse(buildRequest(config({ mode: '2d', crop: { left: 0 } })).body).view3D, undefined);
});
