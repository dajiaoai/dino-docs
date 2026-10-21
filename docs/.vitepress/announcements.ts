export const announcementModules = ['sdk', 'api', 'mcp', 'console'] as const;
export type AnnouncementModule = (typeof announcementModules)[number];
export type AnnouncementLocale = 'zh' | 'en';

export const announcementTopics = {
  editing: { zh: '画板编辑', en: 'Canvas Editing' },
  export: { zh: '图片导出', en: 'Image Export' },
  ai: { zh: 'AI 绘图', en: 'AI Drawing' },
  'fonts-assets': { zh: '字体与素材', en: 'Fonts & Assets' },
  templates: { zh: '风格母版', en: 'Style Templates' },
  billing: { zh: '账户与计费', en: 'Account & Billing' },
} as const;
export type AnnouncementTopic = keyof typeof announcementTopics;

export interface Announcement {
  title: string;
  url: string;
  date: string;
  modules: AnnouncementModule[];
  topics: AnnouncementTopic[];
  locale: AnnouncementLocale;
}

export interface AnnouncementFilters {
  module: AnnouncementModule | '';
  topic: AnnouncementTopic | '';
}

export function moduleLabel(module: AnnouncementModule, locale: AnnouncementLocale): string {
  return module === 'console' ? (locale === 'en' ? 'Console' : '控制台') : module.toUpperCase();
}

export function announcementCenter(locale: AnnouncementLocale): string {
  return locale === 'en' ? '/en/announcements/' : '/announcements/';
}

export function parseAnnouncementFilters(search: string): AnnouncementFilters {
  const params = new URLSearchParams(search);
  const module = params.get('module') ?? '';
  const topic = params.get('topic') ?? '';
  return {
    module: announcementModules.includes(module as AnnouncementModule) ? module as AnnouncementModule : '',
    topic: Object.hasOwn(announcementTopics, topic) ? topic as AnnouncementTopic : '',
  };
}

export function announcementFilterUrl(
  locale: AnnouncementLocale,
  filters: Partial<AnnouncementFilters> = {},
): string {
  const params = new URLSearchParams();
  if (filters.module) params.set('module', filters.module);
  if (filters.topic) params.set('topic', filters.topic);
  const search = params.toString();
  return announcementCenter(locale) + (search ? `?${search}` : '');
}

export function sortAnnouncements(announcements: Announcement[]): Announcement[] {
  return [...announcements].sort((a, b) => b.date.localeCompare(a.date) || a.url.localeCompare(b.url));
}

export function filterAnnouncements(
  announcements: Announcement[],
  locale: AnnouncementLocale,
  filters: Partial<AnnouncementFilters> = {},
): Announcement[] {
  return sortAnnouncements(announcements.filter(item =>
    item.locale === locale &&
    (!filters.module || item.modules.includes(filters.module)) &&
    (!filters.topic || item.topics.includes(filters.topic)),
  ));
}

export function relatedAnnouncements(current: Announcement, announcements: Announcement[], limit = 3): Announcement[] {
  const score = (item: Announcement) =>
    item.topics.filter(topic => current.topics.includes(topic)).length * 10 +
    item.modules.filter(module => current.modules.includes(module)).length;
  return sortAnnouncements(announcements)
    .filter(item => item.locale === current.locale && item.url !== current.url && score(item) > 0)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit);
}
