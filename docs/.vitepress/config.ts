import path from 'node:path';
import { defineConfig } from 'vitepress';
import type { HeadConfig } from 'vitepress';
import type { Plugin } from 'vite';
import { createSdkSidebar } from './sdkVersions';
import { encodeMarkdownSource } from './markdownSource';

const HOSTNAME = 'https://open.dajiaoai.com';
const GA_ID = 'G-ZVQ5PXBPGG';

/**
 * Capture the raw markdown source of every page at transform time so the
 * "Copy Doc" button can copy real markdown instead of rendered text.
 * The map is populated by the Vite plugin below (which runs before VitePress
 * turns .md into a Vue component) and then attached to pageData via
 * transformPageData, making it available to the client through useData().
 */
const rawMarkdownMap = new Map<string, string>();
const docsRoot = path.resolve(__dirname, '..');

const slash = (p: string): string => p.replace(/\\/g, '/');

function rawMarkdownPlugin(): Plugin {
  return {
    name: 'vitepress-raw-markdown',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.md')) return null;
      const cleanId = id.split('?')[0];
      const relativePath = slash(path.relative(docsRoot, cleanId));
      if (relativePath.startsWith('..')) return null;
      rawMarkdownMap.set(relativePath, code);
      return null;
    },
  };
}

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
  cleanUrls: true,
  vite: {
    plugins: [rawMarkdownPlugin()],
    server: {
      proxy: {
        // `npm run dev` runs each demo on a loopback-only Vite server. Keep
        // the browser on the VitePress origin while retaining demo HMR.
        '/demos/question-bank': {
          target: 'http://127.0.0.1:5174',
          changeOrigin: true,
          ws: true,
        },
        '/demos/smart-classroom': {
          target: 'http://127.0.0.1:5175',
          changeOrigin: true,
          ws: true,
        },
      },
    },
  },
  lastUpdated: true,
  sitemap: {
    hostname: HOSTNAME,
    transformItems: (items) => items.filter((item) =>
      !/^(en\/)?reference\/(master-template|consistent-image-export)(\.html)?$/.test(item.url)
    ),
  },
  transformHead({ page, pageData, title, description }) {
    const redirect = pageData.frontmatter?.redirect as string | undefined;
    const canonical = redirect ? `${HOSTNAME}${redirect}` : getCanonicalUrl(page);
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
    if (redirect) {
      head.push(
        ['meta', { name: 'robots', content: 'noindex' }],
        ['script', {}, `window.location.replace(${JSON.stringify(redirect)} + window.location.search + window.location.hash);`],
      );
    }
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

    // Encode the captured markdown so embedded script tags remain inert.
    // The Copy Doc button decodes it to copy
    // real markdown instead of the rendered (plain text) DOM content.
    const rawMarkdown = rawMarkdownMap.get(pageData.relativePath) ?? '';
    return { rawMarkdownEncoded: encodeMarkdownSource(rawMarkdown) } as unknown as Partial<typeof pageData>;
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
              { text: '通用规范', link: '/reference/' },
              { text: '教程', link: '/tutorials/' },
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
              text: '开始接入',
              items: [
                {
                  text: 'SDK 内嵌画板',
                  link: `${HOSTNAME}/sdk/`,
                },
                { text: 'AI / MCP', link: `${HOSTNAME}/ai/` },
                { text: 'HTTP API', link: `${HOSTNAME}/api/` },
              ],
            },
            {
              text: '费用与支持',
              items: [
                {
                  text: '授权与计费',
                  link: '/guide/license-and-pricing',
                },
                {
                  text: '如何充值',
                  link: '/guide/recharge',
                },
                { text: '联系我们', link: `${HOSTNAME}/CONTACT.html` },
              ],
            },
          ],
          '/ai/': [
            {
              text: 'AI 接入',
              items: [
                { text: '概览', link: '/ai/' },
              ],
            },
            {
              text: 'MCP',
              items: [
                { text: 'MCP 接入', link: '/ai/mcp/' },
                { text: '在 MCP 中使用母版', link: '/ai/mcp/master-template' },
                { text: 'MCP 计费说明', link: '/ai/mcp/billing' },
              ],
            },
            {
              text: 'Agent Skill',
              items: [
                { text: '安装大角几何 Skill', link: '/ai/skill/' },
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
                {
                  text: '智能生图服务',
                  collapsed: false,
                  items: [
                    { text: '概览', link: '/api/agent' },
                    { text: '创建任务', link: '/api/agent-create' },
                    { text: '任务列表', link: '/api/agent-tasks' },
                    { text: '任务详情', link: '/api/agent-detail' },
                  ],
                },
                {
                  text: '渲染服务',
                  collapsed: false,
                  items: [
                    { text: '概览', link: '/api/render' },
                    { text: '导出 PNG', link: '/api/render-v2' },
                    { text: '导出 SVG', link: '/api/render-svg' },
                    { text: '导出 TikZ', link: '/api/render-tikz' },
                    { text: '旧版 PNG 与迁移', link: '/api/api-render' },
                  ],
                },
                { text: '模型说明', link: '/api/models' },
              ],
            },
          ],
          '/sdk/': createSdkSidebar(''),
          '/reference/': [
            {
              text: '参考',
              items: [{ text: '概览', link: '/reference/' }],
            },
            {
              text: '通用规范',
              items: [
                {
                  text: '大角工程文件数据协议',
                  link: '/reference/algeo-file-protocol',
                },
                { text: '尺寸单位与换算', link: '/reference/units' },
                { text: '字体支持', link: '/reference/fonts' },
              ],
            },
          ],
          '/tutorials/': [
            {
              text: '教程',
              items: [
                { text: '概览', link: '/tutorials/' },
                {
                  text: '如何使用风格母版',
                  link: '/tutorials/master-template',
                },
                {
                  text: '多环节图片导出尺寸一致性',
                  link: '/tutorials/consistent-image-export',
                },
              ],
            },
          ],
          '/announcements/': [
            {
              text: '公告中心',
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
              { text: 'Common Standards', link: '/en/reference/' },
              { text: 'Tutorials', link: '/en/tutorials/' },
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
              text: 'Get Started',
              items: [
                {
                  text: 'Embedded SDK',
                  link: `${HOSTNAME}/en/sdk/`,
                },
                { text: 'AI / MCP', link: `${HOSTNAME}/en/ai/` },
                { text: 'HTTP API', link: `${HOSTNAME}/en/api/` },
              ],
            },
            {
              text: 'Pricing & Support',
              items: [
                {
                  text: 'Licensing & Pricing',
                  link: '/en/guide/license-and-pricing',
                },
                {
                  text: 'How to Recharge',
                  link: '/en/guide/recharge',
                },
                {
                  text: 'Contact Us',
                  link: `${HOSTNAME}/en/CONTACT.html`,
                },
              ],
            },
          ],
          '/en/ai/': [
            {
              text: 'AI Access',
              items: [
                { text: 'Overview', link: '/en/ai/' },
              ],
            },
            {
              text: 'MCP',
              items: [
                { text: 'MCP Integration', link: '/en/ai/mcp/' },
                {
                  text: 'Use Master Templates with MCP',
                  link: '/en/ai/mcp/master-template',
                },
                { text: 'MCP Billing', link: '/en/ai/mcp/billing' },
              ],
            },
            {
              text: 'Agent Skill',
              items: [
                {
                  text: 'Install the Dino-GSP Skill',
                  link: '/en/ai/skill/',
                },
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
                  collapsed: false,
                  items: [
                    { text: 'Overview', link: '/en/api/agent' },
                    { text: 'Create a Task', link: '/en/api/agent-create' },
                    { text: 'Task List', link: '/en/api/agent-tasks' },
                    { text: 'Task Detail', link: '/en/api/agent-detail' },
                  ],
                },
                {
                  text: 'Render API',
                  collapsed: false,
                  items: [
                    { text: 'Overview', link: '/en/api/render' },
                    { text: 'Export PNG', link: '/en/api/render-v2' },
                    { text: 'Export SVG', link: '/en/api/render-svg' },
                    { text: 'Export TikZ', link: '/en/api/render-tikz' },
                    { text: 'Legacy PNG & Migration', link: '/en/api/api-render' },
                  ],
                },
                { text: 'Models', link: '/en/api/models' },
              ],
            },
          ],
          '/en/sdk/': createSdkSidebar('en/'),
          '/en/reference/': [
            {
              text: 'Reference',
              items: [{ text: 'Overview', link: '/en/reference/' }],
            },
            {
              text: 'Common Standards',
              items: [
                {
                  text: 'Project File Protocol',
                  link: '/en/reference/algeo-file-protocol',
                },
                {
                  text: 'Size Units and Conversion',
                  link: '/en/reference/units',
                },
                { text: 'Font Support', link: '/en/reference/fonts' },
              ],
            },
          ],
          '/en/tutorials/': [
            {
              text: 'Tutorials',
              items: [
                { text: 'Overview', link: '/en/tutorials/' },
                {
                  text: 'How to Use Style Master Templates',
                  link: '/en/tutorials/master-template',
                },
                {
                  text: 'Consistent Image Export Across Workflows',
                  link: '/en/tutorials/consistent-image-export',
                },
              ],
            },
          ],
          '/en/announcements/': [
            {
              text: 'Updates',
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
