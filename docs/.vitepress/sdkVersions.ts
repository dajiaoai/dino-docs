import type { DefaultTheme } from 'vitepress';

export const sdkVersionConfig = {
  latestV2: '2',
  legacyV1: '1.2.1',
} as const;

type LocalePrefix = '' | 'en/';

function localizePath(localePrefix: LocalePrefix, path: string): string {
  return `/${localePrefix}${path}`;
}

function getStableV2Path(localePrefix: LocalePrefix, page: string): string {
  return localizePath(localePrefix, `sdk/${sdkVersionConfig.latestV2}/${page}`);
}

function getLegacyV1Path(localePrefix: LocalePrefix, page: string): string {
  return localizePath(localePrefix, `sdk/${sdkVersionConfig.legacyV1}/${page}`);
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
        },
        {
          text: isEnglish ? 'AI Chat in Editor' : '编辑器 AI 对话',
          link: getStableV2Path(localePrefix, 'ai-chat'),
        },
        {
          text: isEnglish ? 'Examples' : '示例中心',
          link: getStableV2Path(localePrefix, 'examples'),
        },
        {
          text: isEnglish ? 'Protocol & Data Format' : '数据协议',
          link: getStableV2Path(localePrefix, 'protocol'),
        },
      ],
    },
    {
      text: `SDK ${sdkVersionConfig.legacyV1}`,
      items: [
        {
          text: isEnglish ? 'Getting Started' : '快速开始',
          link: getLegacyV1Path(localePrefix, 'getting-started'),
        },
        {
          text: isEnglish ? 'API Reference' : 'API 参考',
          link: getLegacyV1Path(localePrefix, 'api'),
        },
        {
          text: isEnglish ? 'Protocol Reference' : '协议参考',
          link: getLegacyV1Path(localePrefix, 'protocol'),
        },
        {
          text: isEnglish ? 'Examples' : '示例索引',
          link: getLegacyV1Path(localePrefix, 'examples'),
        },
      ],
    },
  ];
}
