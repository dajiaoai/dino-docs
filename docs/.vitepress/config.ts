import { defineConfig } from 'vitepress';
import type { HeadConfig } from 'vitepress';
import { createSdkSidebar } from './sdkVersions';

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
          {
            text: '接入',
            items: [
              { text: 'SDK 接入', link: '/sdk/' },
              { text: 'API 接入', link: '/api/' },
              { text: 'AI 接入', link: '/ai/' },
            ],
          },
          { text: '公告', link: '/announcements/' },
          { text: '联系我们', link: '/CONTACT' },
          {
            text: '控制台',
            link: 'https://open.dajiaoai.com/console/dashboard',
          },
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
          '/ai/': [
            {
              text: 'AI 接入',
              items: [
                { text: '概览', link: '/ai/' },
                { text: 'MCP 接入', link: '/ai/mcp' },
                { text: 'MCP 计费说明', link: '/ai/mcp-billing' },
              ],
            },
          ],
          '/api/': [
            {
              text: '开始接入',
              items: [
                { text: '概览', link: '/api/' },
                { text: '鉴权说明', link: '/api/auth' },
                { text: 'API 计费说明', link: '/api/pricing' },
              ],
            },
            {
              text: '接口参考',
              items: [
                { text: '智能生图服务', link: '/api/agent' },
                { text: '渲染服务', link: '/api/render' },
                { text: '模型说明', link: '/api/models' },
              ],
            },
          ],
          '/sdk/': createSdkSidebar(''),
          '/announcements/': [
            {
              text: '公告中心',
              items: [{ text: '全部公告', link: '/announcements/' }],
            },
            {
              text: '2026 年',
              items: [
                {
                  text: '渲染接口参数与智能生图母版能力更新',
                  link: '/announcements/2026-06-29-render-agent-template-update',
                },
                {
                  text: '内嵌编辑器 AI 绘图能力上线',
                  link: '/announcements/2026-06-29-sdk-2-8-0-ai-drawing',
                },
              ],
            },
          ],
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
          {
            text: 'Access',
            items: [
              { text: 'SDK Access', link: '/en/sdk/' },
              { text: 'API Access', link: '/en/api/' },
              { text: 'AI Access', link: '/en/ai/' },
            ],
          },
          { text: 'Updates', link: '/en/announcements/' },
          {
            text: 'Console',
            link: 'https://open.dajiaoai.com/console/dashboard',
          },
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
          '/en/ai/': [
            {
              text: 'AI Access',
              items: [
                { text: 'Overview', link: '/en/ai/' },
                { text: 'MCP Integration', link: '/en/ai/mcp' },
                { text: 'MCP Billing', link: '/en/ai/mcp-billing' },
              ],
            },
          ],
          '/en/api/': [
            {
              text: 'Getting Started',
              items: [
                { text: 'Overview', link: '/en/api/' },
                { text: 'Authentication', link: '/en/api/auth' },
                { text: 'API Billing', link: '/en/api/pricing' },
              ],
            },
            {
              text: 'API Reference',
              items: [
                {
                  text: 'Intelligent Image Generation',
                  link: '/en/api/agent',
                },
                { text: 'Render API', link: '/en/api/render' },
                { text: 'Models', link: '/en/api/models' },
              ],
            },
          ],
          '/en/sdk/': createSdkSidebar('en/'),
          '/en/announcements/': [
            {
              text: 'Updates',
              items: [{ text: 'All Updates', link: '/en/announcements/' }],
            },
            {
              text: '2026',
              items: [
                {
                  text: 'Render API Parameters and Agent Template Support Updated',
                  link: '/en/announcements/2026-06-29-render-agent-template-update',
                },
                {
                  text: 'Embedded Editor AI Drawing Launch',
                  link: '/en/announcements/2026-06-29-sdk-2-8-0-ai-drawing',
                },
              ],
            },
          ],
          '/en/CONTACT': [],
        },
      },
    },
  },
  themeConfig: {
    logo: { src: '/logo.svg', width: 24, height: 24, alt: '大角几何' },
    outline: { level: [2, 3] },
    search: {
      provider: 'local',
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/dajiaoai/' }],
  },
});
