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
          { text: '首页', link: '/' },
          { text: 'SDK 接入', link: '/guide/getting-started' },
          { text: '联系我们', link: '/CONTACT' },
        ],
        sidebar: [
          {
            text: 'SDK 接入',
            items: [
              { text: '快速开始', link: '/guide/getting-started' },
              { text: 'SDK API', link: '/api/sdk' },
              { text: 'REPL 能力', link: '/guide/repl' },
              { text: '协议说明', link: '/api/protocol' },
            ],
          },
          {
            text: '平台规范',
            items: [{ text: '商业许可说明', link: '/COMMERCIAL_LICENSE' }],
          },
        ],
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
          { text: 'Home', link: '/en/' },
          { text: 'SDK', link: '/en/guide/getting-started' },
          { text: 'Contact', link: '/en/CONTACT' },
        ],
        sidebar: [
          {
            text: 'SDK',
            items: [
              { text: 'Getting Started', link: '/en/guide/getting-started' },
              { text: 'SDK API', link: '/en/api/sdk' },
              { text: 'REPL Capabilities', link: '/en/guide/repl' },
              { text: 'Protocol', link: '/en/api/protocol' },
            ],
          },
          {
            text: 'Platform Specs',
            items: [
              { text: 'Commercial License', link: '/en/COMMERCIAL_LICENSE' },
            ],
          },
        ],
      },
    },
  },
  themeConfig: {
    search: {
      provider: 'local',
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/dajiaoai/' }],
  },
});
