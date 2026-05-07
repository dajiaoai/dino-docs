import { defineConfig } from 'vitepress';
import type { HeadConfig } from 'vitepress';

const HOSTNAME = 'https://open.dajiaoai.com';
const GA_ID = 'G-ZVQ5PXBPGG';

function getCanonicalUrl(page: string): string {
  const path = page
    .replace(/\.md$/, '')
    .replace(/\/index$/, '')
    .replace(/^index$/, '');
  return path ? `${HOSTNAME}/${path}` : `${HOSTNAME}/`;
}

const gaHead: HeadConfig[] = process.argv.includes('build')
  ? [
      [
        'script',
        {
          async: '',
          src: `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`,
        },
      ],
      [
        'script',
        {},
        `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`,
      ],
    ]
  : [];

export default defineConfig({
  head: [
    ...gaHead,
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c8772' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: '大角几何开放平台' }],
    ['meta', { property: 'og:image', content: `${HOSTNAME}/og-image.png` }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ],
  title: '大角几何开放平台',
  titleTemplate: ':title | 大角几何开放平台',
  description:
    '大角几何开放平台：SDK 接入嵌入式几何画板，规划中接口服务、AI 几何能力等',
  base: '/',
  lastUpdated: true,
  sitemap: {
    hostname: HOSTNAME,
  },
  transformHead({ page, pageData, title, description }) {
    const canonical = getCanonicalUrl(page);
    const ogTitle = (pageData.frontmatter?.title as string) || title;
    const ogDesc = (pageData.frontmatter?.description as string) || description;
    const head: HeadConfig[] = [
      ['link', { rel: 'canonical', href: canonical }],
      ['meta', { property: 'og:url', content: canonical }],
      ['meta', { property: 'og:title', content: ogTitle }],
      ['meta', { property: 'og:description', content: ogDesc }],
      ['meta', { name: 'twitter:title', content: ogTitle }],
      ['meta', { name: 'twitter:description', content: ogDesc }],
    ];
    if (page.startsWith('en/')) {
      head.push(['meta', { property: 'og:locale', content: 'en' }]);
    } else {
      head.push(['meta', { property: 'og:locale', content: 'zh_CN' }]);
    }
    return head;
  },
  transformPageData(pageData) {
    const isHome =
      pageData.relativePath === 'index.md' ||
      pageData.relativePath === 'en/index.md';
    if (isHome) {
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: '大角几何',
        url: HOSTNAME,
        description: '几何能力基础设施',
      };
      pageData.frontmatter ??= {};
      pageData.frontmatter.head ??= [];
      pageData.frontmatter.head.push([
        'script',
        { type: 'application/ld+json' },
        JSON.stringify(jsonLd),
      ]);
    }
  },
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '指南', link: '/guide/' },
          { text: 'SDK 接入', link: '/sdk/' },
          { text: '联系我们', link: '/CONTACT' },
          { text: '控制台', link: '/console' },
          { text: '主站', link: 'https://dajiaoai.com' },
        ],
        sidebar: {
          '/guide/': [
            {
              text: '指南',
              items: [
                { text: '平台概览', link: '/guide/' },
                { text: '能力总览', link: '/guide/capabilities' },
                { text: '适用场景', link: '/guide/scenarios' },
              ],
            },
            {
              text: '接入与授权',
              items: [
                { text: '免费使用说明', link: '/guide/FREE_USE' },
                { text: '商业许可说明', link: '/guide/COMMERCIAL_LICENSE' },
              ],
            },
          ],
          '/sdk/': [
            {
              text: 'SDK 文档中心',
              items: [
                { text: '概览', link: '/sdk/' },
                { text: 'REPL', link: '/sdk/repl' },
              ],
            },
            {
              text: 'SDK 2.4.2-beta',
              items: [
                { text: '快速开始', link: '/sdk/2.4.2-beta/getting-started' },
                { text: '演示模式', link: '/sdk/2.4.2-beta/presentation' },
                { text: '编辑模式', link: '/sdk/2.4.2-beta/editor' },
                { text: '示例中心', link: '/sdk/2.4.2-beta/examples' },
                { text: '数据协议', link: '/sdk/2.4.2-beta/protocol' },
              ],
            },
            {
              text: 'SDK 1.2.1',
              items: [
                { text: '快速开始', link: '/sdk/1.2.1/getting-started' },
                { text: 'API 参考', link: '/sdk/1.2.1/api' },
                { text: '协议参考', link: '/sdk/1.2.1/protocol' },
                { text: '示例索引', link: '/sdk/1.2.1/examples' },
              ],
            },
          ],
          '/console': [],
          '/CONTACT': [],
        },
      },
    },
    en: {
      label: 'English',
      lang: 'en',
      link: '/en/',
      title: 'Dino-GSP Open Platform',
      description:
        'Dino-GSP Open Platform: SDK for embedded geometry canvas, planned API services, AI geometry capabilities, and more',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/en/guide/' },
          { text: 'SDK Access', link: '/en/sdk/' },
          { text: 'Console', link: '/en/console' },
          { text: 'Contact', link: '/en/CONTACT' },
          { text: 'Main Site', link: 'https://dajiaoai.com' },
        ],
        sidebar: {
          '/en/guide/': [
            {
              text: 'Guide',
              items: [
                { text: 'Overview', link: '/en/guide/' },
                { text: 'Capabilities', link: '/en/guide/capabilities' },
                { text: 'Scenarios', link: '/en/guide/scenarios' },
              ],
            },
            {
              text: 'Access & Licensing',
              items: [
                { text: 'Free Use', link: '/en/guide/FREE_USE' },
                {
                  text: 'Commercial License',
                  link: '/en/guide/COMMERCIAL_LICENSE',
                },
              ],
            },
          ],
          '/en/sdk/': [
            {
              text: 'SDK Hub',
              items: [
                { text: 'Overview', link: '/en/sdk/' },
                { text: 'REPL', link: '/sdk/repl' },
              ],
            },
            {
              text: 'SDK 2.4.2-beta',
              items: [
                {
                  text: 'Getting Started',
                  link: '/en/sdk/2.4.2-beta/getting-started',
                },
                {
                  text: 'Presentation Mode',
                  link: '/en/sdk/2.4.2-beta/presentation',
                },
                { text: 'Editor Mode', link: '/en/sdk/2.4.2-beta/editor' },
                { text: 'Examples', link: '/en/sdk/2.4.2-beta/examples' },
                {
                  text: 'Protocol & Data Format',
                  link: '/en/sdk/2.4.2-beta/protocol',
                },
                {
                  text: 'Events & Errors',
                  link: '/en/sdk/2.4.2-beta/events-and-errors',
                },
              ],
            },
            {
              text: 'SDK 1.2.1',
              items: [
                {
                  text: 'Getting Started',
                  link: '/en/sdk/1.2.1/getting-started',
                },
                { text: 'API Reference', link: '/en/sdk/1.2.1/api' },
                { text: 'Protocol Reference', link: '/en/sdk/1.2.1/protocol' },
                { text: 'Examples', link: '/en/sdk/1.2.1/examples' },
              ],
            },
          ],
          '/en/console': [],
          '/en/CONTACT': [],
        },
      },
    },
  },
  themeConfig: {
    logo: { src: '/logo.svg', width: 24, height: 24, alt: '大角几何' },
    search: {
      provider: 'local',
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/dajiaoai/' }],
  },
});
