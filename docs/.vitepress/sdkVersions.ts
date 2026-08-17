import type { DefaultTheme } from 'vitepress';

export const sdkVersionConfig = {
  latestV2: '2',
} as const;

type LocalePrefix = '' | 'en/';

function localizePath(localePrefix: LocalePrefix, path: string): string {
  return `/${localePrefix}${path}`;
}

function getStableV2Path(localePrefix: LocalePrefix, page: string): string {
  return localizePath(localePrefix, `sdk/${sdkVersionConfig.latestV2}/${page}`);
}

export function createSdkSidebar(
  localePrefix: LocalePrefix,
): DefaultTheme.SidebarItem[] {
  const isEnglish = localePrefix === 'en/';

  return [
    {
      text: isEnglish ? 'SDK Hub' : 'SDK 文档中心',
      items: [
        {
          text: isEnglish ? 'Overview' : '概览',
          link: localizePath(localePrefix, 'sdk/'),
        },
        {
          text: 'REPL',
          link: localizePath(localePrefix, 'sdk/repl'),
        },
      ],
    },
    {
      text: isEnglish ? 'Latest SDK 2.x' : '最新 SDK 2.x',
      items: [
        {
          text: isEnglish ? 'Getting Started' : '快速开始',
          link: getStableV2Path(localePrefix, 'getting-started'),
        },
        {
          text: isEnglish ? 'Presentation Mode' : '演示模式',
          link: getStableV2Path(localePrefix, 'presentation'),
        },
        {
          text: isEnglish ? 'Editor Mode' : '编辑模式',
          link: getStableV2Path(localePrefix, 'editor'),
          items: [
            {
              text: isEnglish
                ? 'Export Images in Editor Mode'
                : '编辑模式导出图片',
              link: getStableV2Path(localePrefix, 'export-image'),
            },
            {
              text: isEnglish
                ? 'Insert Images from a Material Library'
                : '画板插入图片素材',
              link: getStableV2Path(localePrefix, 'image-material-library'),
            },
            {
              text: isEnglish ? 'AI Chat in Editor' : '编辑器 AI 对话',
              link: getStableV2Path(localePrefix, 'ai-chat'),
            },
          ],
        },
        {
          text: isEnglish ? 'Examples' : '示例中心',
          link: 'https://dajiaoai.github.io/algeo-sdk/',
        },
        {
          text: isEnglish ? 'Protocol & Data Format' : '数据协议',
          link: getStableV2Path(localePrefix, 'protocol'),
        },
      ],
    },
    {
      text: isEnglish ? 'Access & Licensing' : '接入与授权',
      items: [
        {
          text: isEnglish ? 'Free Use' : '免费使用说明',
          link: localizePath(localePrefix, 'sdk/FREE_USE'),
        },
        {
          text: isEnglish ? 'Commercial License' : '商业许可说明',
          link: localizePath(localePrefix, 'sdk/COMMERCIAL_LICENSE'),
        },
      ],
    },
  ];
}
