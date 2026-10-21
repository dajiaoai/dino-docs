<script setup lang="ts">
import { computed } from 'vue';
import {
  announcementFilterUrl,
  announcementModules,
  announcementTopics,
  filterAnnouncements,
  moduleLabel,
} from '../announcements';
import { useAnnouncements } from './useAnnouncements';
import AnnouncementTags from './AnnouncementTags.vue';

const { announcements, locale, filters } = useAnnouncements();
const visible = computed(() => filterAnnouncements(announcements, locale.value, filters.value));
</script>

<template>
  <div class="announcement-center">
    <nav class="announcement-filters" :aria-label="locale === 'en' ? 'Filter updates by module' : '按模块筛选公告'">
      <a
        :href="announcementFilterUrl(locale, { topic: filters.topic })"
        :class="{ selected: !filters.module }"
        :aria-current="!filters.module ? 'true' : undefined"
      >{{ locale === 'en' ? 'All' : '全部' }}</a>
      <a
        v-for="module in announcementModules"
        :key="module"
        :href="announcementFilterUrl(locale, { module, topic: filters.topic })"
        :class="{ selected: filters.module === module }"
        :aria-current="filters.module === module ? 'true' : undefined"
      >{{ moduleLabel(module, locale) }}</a>
    </nav>

    <div v-if="filters.topic" class="announcement-topic-filter">
      <span>{{ locale === 'en' ? 'Topic:' : '能力主题：' }} {{ announcementTopics[filters.topic][locale] }}</span>
      <a :href="announcementFilterUrl(locale, { module: filters.module })">{{ locale === 'en' ? 'Clear topic' : '清除主题' }}</a>
    </div>
    <p class="announcement-count" role="status" aria-live="polite" aria-atomic="true">
      {{ locale === 'en' ? `${visible.length} updates · Newest first` : `共 ${visible.length} 篇公告 · 按发布时间倒序` }}
    </p>

    <ol v-if="visible.length" class="announcement-list">
      <li v-for="item in visible" :key="item.url" class="announcement-item">
        <article>
          <time :datetime="item.date">{{ item.date }}</time>
          <h2><a :href="item.url">{{ item.title }}</a></h2>
          <AnnouncementTags :announcement="item" :locale="locale" :filters="filters" />
        </article>
      </li>
    </ol>
    <div v-else class="announcement-empty">
      <p>{{ locale === 'en' ? 'No updates match these filters.' : '暂时没有符合条件的公告。' }}</p>
      <a :href="announcementFilterUrl(locale)">{{ locale === 'en' ? 'View all updates' : '查看全部公告' }}</a>
    </div>
  </div>
</template>

<style scoped>
.announcement-center { margin-top: 28px; }
.announcement-filters { display: flex; flex-wrap: wrap; gap: 8px; }
.announcement-filters a {
  padding: 7px 18px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text-2);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: background .2s, color .2s, border-color .2s;
}
.announcement-filters a:hover { color: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); }
.announcement-filters a.selected { color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); border-color: var(--vp-c-brand-1); }
.announcement-topic-filter { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-top: 18px; font-size: 14px; }
.announcement-topic-filter span { color: var(--vp-c-text-2); }
.announcement-count { color: var(--vp-c-text-3); font-size: 13px; }
ol.announcement-list { padding: 0; margin: 0; list-style: none; }
li.announcement-item { margin: 0; padding: 22px 0; border-top: 1px solid var(--vp-c-divider); }
.announcement-item time { color: var(--vp-c-text-2); font-size: 13px; }
.announcement-item h2 { margin: 5px 0 12px; padding: 0; border: 0; font-size: 18px; line-height: 1.6; letter-spacing: normal; }
.announcement-item h2 a { color: var(--vp-c-text-1); text-decoration: none; }
.announcement-item h2 a:hover { color: var(--vp-c-brand-1); }
.announcement-empty { padding: 32px 20px; text-align: center; border: 1px dashed var(--vp-c-divider); border-radius: 10px; }
.announcement-center a:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
@media (max-width: 480px) {
  .announcement-filters { gap: 6px; }
  .announcement-filters a { padding: 6px 12px; }
}
</style>
