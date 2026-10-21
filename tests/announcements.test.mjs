import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

const toModuleUrl = source => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText).toString('base64')}`;
const modelUrl = toModuleUrl(readFileSync(new URL('../docs/.vitepress/announcements.ts', import.meta.url), 'utf8'));
const {
  announcementFilterUrl, parseAnnouncementFilters, filterAnnouncements, relatedAnnouncements,
} = await import(modelUrl);
const loaderSource = readFileSync(new URL('../docs/.vitepress/announcements.data.ts', import.meta.url), 'utf8')
  .replace('export { data };', '')
  .replace("import { createContentLoader } from 'vitepress';", 'const createContentLoader = (_patterns, options) => options;')
  .replace("'./announcements'", JSON.stringify(modelUrl));
const { default: loader } = await import(toModuleUrl(loaderSource));

const pages = ['', 'en/'].flatMap(prefix => {
  const folder = new URL(`../docs/${prefix}announcements/`, import.meta.url);
  return readdirSync(folder).filter(file => file !== 'index.md' && file.endsWith('.md')).map(file => {
    const source = readFileSync(new URL(file, folder), 'utf8');
    const frontmatter = source.split(/^---\s*$/m)[1];
    const value = key => frontmatter.match(new RegExp(`^${key}: (.+)$`, 'm'))?.[1].trim();
    return {
      url: `/${prefix}announcements/${file.replace(/\.md$/, '')}`,
      frontmatter: {
        title: value('title'), date: JSON.parse(value('date')),
        modules: value('modules').slice(1, -1).split(',').map(s => s.trim()),
        topics: value('topics').slice(1, -1).split(',').map(s => s.trim()),
      },
    };
  });
});
const announcements = loader.transform(pages);

test('every existing article keeps its URL, has valid metadata, and sorts by publication date', () => {
  assert.equal(announcements.length, pages.length);
  assert.equal(new Set(announcements.map(item => item.url)).size, pages.length);
  const all = filterAnnouncements(announcements, 'zh');
  assert.match(all[0].url, /2026-10-21-sdk-2-15-0/);
  const pricingIndex = all.findIndex(item => item.url.includes('2026-09-01-api-pricing-reduction'));
  assert.equal(all[pricingIndex].date, '2026-08-27');
  assert.match(all[pricingIndex - 1].url, /2026-09-02/);
  assert.match(all[pricingIndex + 1].url, /2026-08-25/);
  for (const page of pages) assert.ok(announcements.some(item => item.url === page.url));
});

test('a multi-module announcement appears once in every matching module', () => {
  for (const module of ['sdk', 'api', 'mcp']) {
    const matches = filterAnnouncements(announcements, 'zh', { module });
    assert.equal(matches.filter(item => item.url.includes('transparent-image-export')).length, 1);
    assert.ok(matches.every(item => item.modules.includes(module)));
  }
  const consoleUpdates = filterAnnouncements(announcements, 'zh', { module: 'console' });
  assert.ok(consoleUpdates.some(item => item.url.includes('console-recharge')));
  assert.ok(!consoleUpdates.some(item => item.url.includes('transparent-image-export')));
});

test('module and topic combine, empty results are allowed, and locales stay separate', () => {
  const exports = filterAnnouncements(announcements, 'zh', { module: 'api', topic: 'export' });
  assert.ok(exports.length > 0);
  assert.ok(exports.every(item => item.modules.includes('api') && item.topics.includes('export')));
  assert.deepEqual(filterAnnouncements(announcements, 'zh', { module: 'console', topic: 'export' }), []);
  assert.ok(filterAnnouncements(announcements, 'en').every(item => item.url.startsWith('/en/')));
  for (const en of announcements.filter(item => item.locale === 'en')) {
    const zh = announcements.find(item => item.url === en.url.replace('/en/', '/'));
    assert.equal(en.date, zh.date);
    assert.deepEqual(en.modules, zh.modules);
    assert.deepEqual(en.topics, zh.topics);
  }
});

test('shareable filter URLs round-trip and unknown parameters fall back to all', () => {
  for (const locale of ['zh', 'en']) {
    const url = announcementFilterUrl(locale, { module: 'sdk', topic: 'export' });
    assert.ok(url.startsWith(locale === 'en' ? '/en/announcements/' : '/announcements/'));
    assert.deepEqual(parseAnnouncementFilters(new URL(url, 'https://example.com').search), { module: 'sdk', topic: 'export' });
  }
  assert.equal(announcementFilterUrl('zh'), '/announcements/');
  for (const search of ['', '?module=unknown&topic=unknown', '?module=SDK&topic=__proto__']) {
    assert.deepEqual(parseAnnouncementFilters(search), { module: '', topic: '' });
  }
});

test('related announcements prefer shared topics, exclude self and other locales, and break ties by recency', () => {
  const current = { title: 'Current', url: '/current', locale: 'zh', date: '2026-10-21', modules: ['sdk'], topics: ['export'] };
  const sample = [
    current,
    { ...current, url: '/module-only', topics: ['ai'], date: '2026-10-20' },
    { ...current, url: '/topic-older', modules: ['api'], date: '2026-08-01' },
    { ...current, url: '/topic-newer', modules: ['api'], date: '2026-09-01' },
    { ...current, url: '/english', locale: 'en' },
    { ...current, url: '/unrelated', modules: ['console'], topics: ['billing'] },
  ];
  assert.deepEqual(relatedAnnouncements(current, sample).map(item => item.url), ['/topic-newer', '/topic-older', '/module-only']);
});

test('invalid announcement metadata fails the build instead of silently hiding an article', () => {
  const page = pages[0];
  for (const patch of [
    { date: '2026-02-31' }, { date: '2026-13-01' }, { date: undefined },
    { modules: ['unknown'] }, { modules: [] }, { topics: ['unknown'] }, { title: '' },
  ]) {
    assert.throws(() => loader.transform([{ ...page, frontmatter: { ...page.frontmatter, ...patch } }]));
  }
  assert.deepEqual(loader.transform([{ url: '/announcements/', frontmatter: {} }, { url: '/en/announcements/', frontmatter: {} }]), []);
});
