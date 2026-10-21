<script setup lang="ts">
import {
  announcementFilterUrl,
  announcementTopics,
  moduleLabel,
  type Announcement,
  type AnnouncementFilters,
  type AnnouncementLocale,
} from '../announcements';

const props = defineProps<{
  announcement: Announcement;
  locale: AnnouncementLocale;
  filters?: Partial<AnnouncementFilters>;
}>();
</script>

<template>
  <div class="announcement-tags" :aria-label="locale === 'en' ? 'Modules and topics' : '涉及模块与能力主题'">
    <a
      v-for="module in announcement.modules"
      :key="module"
      class="announcement-tag announcement-tag--module"
      :href="announcementFilterUrl(locale, { module })"
      :aria-label="locale === 'en' ? `View ${moduleLabel(module, locale)} updates` : `查看${moduleLabel(module, locale)}公告`"
    >{{ moduleLabel(module, locale) }}</a>
    <a
      v-for="topic in announcement.topics"
      :key="topic"
      class="announcement-tag"
      :href="announcementFilterUrl(locale, { module: props.filters?.module, topic })"
      :aria-label="locale === 'en' ? `View ${announcementTopics[topic][locale]} updates` : `查看${announcementTopics[topic][locale]}相关公告`"
    >{{ announcementTopics[topic][locale] }}</a>
  </div>
</template>

<style scoped>
.announcement-tags { display: flex; flex-wrap: wrap; gap: 6px; }
a.announcement-tag {
  display: inline-flex;
  padding: 2px 9px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  font-size: 12px;
  font-weight: 500;
  line-height: 22px;
  text-decoration: none;
  transition: border-color .2s, color .2s;
}
a.announcement-tag--module { color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); border-color: transparent; }
a.announcement-tag:hover { color: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); }
a.announcement-tag:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
</style>
