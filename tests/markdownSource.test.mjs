import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { parse } from '@vue/compiler-sfc';
import ts from 'typescript';

const source = readFileSync(new URL('../docs/.vitepress/markdownSource.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022 } }).outputText;
const { encodeMarkdownSource, decodeMarkdownSource } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const pageComponent = data => `<script>export const __pageData = JSON.parse(${JSON.stringify(JSON.stringify(data))});</script><template><div>文档</div></template>`;

test('embedded Markdown script tags reproduce the compiler error and encoded source compiles', () => {
  const markdown = '<script setup>\nconst title = "体验";\n</script>\n\n# 导出 PNG\n\n<RenderPlayground />\n';
  assert.ok(parse(pageComponent({ rawMarkdown: markdown })).errors.length > 0);
  const encoded = encodeMarkdownSource(markdown);
  assert.equal(encoded.includes('<'), false);
  assert.deepEqual(parse(pageComponent({ rawMarkdownEncoded: encoded })).errors, []);
  assert.equal(decodeMarkdownSource(encoded), markdown);
});

test('the render document round-trips without changing tables, examples or Unicode', () => {
  const markdown = readFileSync(new URL('../docs/api/render-v2.md', import.meta.url), 'utf8');
  assert.equal(decodeMarkdownSource(encodeMarkdownSource(markdown)), markdown);
  assert.equal(decodeMarkdownSource(undefined), '');
  assert.equal(decodeMarkdownSource('%invalid'), '');
});
