import { defineConfig } from 'vitepress'

export default defineConfig({
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],
  title: '大角几何开放平台',
  description: '大角几何开放平台：SDK 接入嵌入式几何画板，规划中接口服务、AI 几何能力等',
  base: '/',
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '首页', link: '/' },
          { text: 'SDK 接入', link: '/guide/getting-started' },
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
        ],
      },
    },
    en: {
      label: 'English',
      lang: 'en',
      link: '/en/',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'SDK', link: '/en/guide/getting-started' },
        ],
        sidebar: [
          {
            text: 'Guide',
            items: [
              { text: 'Getting Started', link: '/en/guide/getting-started' },
              { text: 'SDK API', link: '/en/api/sdk' },
              { text: 'REPL Capabilities', link: '/en/guide/repl' },
              { text: 'Protocol', link: '/en/api/protocol' },
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
    socialLinks: [
      { icon: 'github', link: 'https://github.com/dajiaoai/' },
    ],
  },
})
