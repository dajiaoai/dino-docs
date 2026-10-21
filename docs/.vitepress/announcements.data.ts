import { createContentLoader } from 'vitepress';
import {
  announcementModules,
  announcementTopics,
  sortAnnouncements,
  type Announcement,
} from './announcements';

declare const data: Announcement[];
export { data };

export default createContentLoader(['announcements/*.md', 'en/announcements/*.md'], {
  transform(pages): Announcement[] {
    return sortAnnouncements(pages
      .filter(page => !/\/announcements\/(?:index(?:\.html)?)?$/.test(page.url))
      .map(({ url, frontmatter }) => {
        const { title, date, modules, topics } = frontmatter;
        if (
          typeof title !== 'string' || !title.trim() ||
          typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
          !Number.isFinite(Date.parse(date)) ||
          new Date(date).toISOString().slice(0, 10) !== date ||
          !Array.isArray(modules) || !modules.length ||
          !modules.every(module => announcementModules.includes(module)) ||
          !Array.isArray(topics) || !topics.length ||
          !topics.every(topic => Object.hasOwn(announcementTopics, topic))
        ) {
          throw new Error(`Invalid announcement metadata: ${url}. Expected title, date, modules and topics.`);
        }
        return { title, date, modules, topics, url, locale: url.startsWith('/en/') ? 'en' : 'zh' };
      }));
  },
});
