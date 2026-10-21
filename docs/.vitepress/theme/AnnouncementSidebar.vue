<script setup lang="ts">
import { computed } from 'vue';
import { announcementFilterUrl, announcementModules, filterAnnouncements, moduleLabel } from '../announcements';
import { useAnnouncements } from './useAnnouncements';

const { announcements, locale, filters, isAnnouncementPage, current } = useAnnouncements();
const recent = computed(() => filterAnnouncements(announcements, locale.value).slice(0, 5));
</script>

<template>
  <div v-if="isAnnouncementPage" class="announcement-sidebar">
    <section :aria-label="locale === 'en' ? 'Modules' : '模块分类'">
      <h2>{{ locale === 'en' ? 'Modules' : '模块分类' }}</h2>
      <a
        :href="announcementFilterUrl(locale)"
        :class="{ active: !current && !filters.module && !filters.topic }"
        :aria-current="!current && !filters.module && !filters.topic ? 'page' : undefined"
      >{{ locale === 'en' ? 'All Updates' : '全部公告' }}</a>
      <a
        v-for="module in announcementModules"
        :key="module"
        :href="announcementFilterUrl(locale, { module })"
        :class="{ active: !current && filters.module === module }"
        :aria-current="!current && filters.module === module ? 'true' : undefined"
      >{{ moduleLabel(module, locale) }}</a>
    </section>
    <section :aria-label="locale === 'en' ? 'Recent updates' : '近期公告'">
      <h2>{{ locale === 'en' ? 'Recent Updates' : '近期公告' }}</h2>
      <a
        v-for="item in recent"
        :key="item.url"
        :href="item.url"
        :class="{ active: current?.url === item.url }"
        :aria-current="current?.url === item.url ? 'page' : undefined"
      >{{ item.title }}</a>
    </section>
  </div>
</template>

<style scoped>
.announcement-sidebar section { padding: 24px 0; border-top: 1px solid var(--vp-c-divider); }
.announcement-sidebar h2 { margin-bottom: 8px; color: var(--vp-c-text-1); font-size: 14px; font-weight: 700; line-height: 24px; }
.announcement-sidebar a { display: block; padding: 5px 0; color: var(--vp-c-text-2); font-size: 14px; line-height: 24px; transition: color .2s; }
.announcement-sidebar a:hover, .announcement-sidebar a.active { color: var(--vp-c-brand-1); }
.announcement-sidebar a:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
</style>

<style>
/* Keep the sidebar readable when the site's wider layout is used at 1440px. */
.Layout:has(.announcement-sidebar) { --vp-layout-max-width: 1440px; }
</style>
