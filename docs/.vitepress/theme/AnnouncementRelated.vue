<script setup lang="ts">
import { computed } from 'vue';
import { announcementCenter, relatedAnnouncements } from '../announcements';
import { useAnnouncements } from './useAnnouncements';
import AnnouncementTags from './AnnouncementTags.vue';

const { announcements, current, locale } = useAnnouncements();
const related = computed(() => current.value ? relatedAnnouncements(current.value, announcements) : []);
</script>

<template>
  <section v-if="current && related.length" class="announcement-related" aria-labelledby="announcement-related-title">
    <div class="announcement-related-heading">
      <h2 id="announcement-related-title">{{ locale === 'en' ? 'Past Updates' : '历史公告' }}</h2>
      <a :href="announcementCenter(locale)">{{ locale === 'en' ? 'All updates →' : '全部公告 →' }}</a>
    </div>
    <ul>
      <li v-for="item in related" :key="item.url">
        <time :datetime="item.date">{{ item.date }}</time>
        <a class="announcement-related-title" :href="item.url">{{ item.title }}</a>
        <AnnouncementTags :announcement="item" :locale="locale" />
      </li>
    </ul>
  </section>
</template>

<style scoped>
.announcement-related { margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--vp-c-divider); }
.announcement-related-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.announcement-related-heading h2 { font-size: 18px; font-weight: 600; }
.announcement-related-heading a { color: var(--vp-c-brand-1); font-size: 14px; }
.announcement-related ul { list-style: none; padding: 0; margin: 16px 0 0; }
.announcement-related li { padding: 16px 0; }
.announcement-related time { color: var(--vp-c-text-2); font-size: 12px; }
.announcement-related-title { display: block; margin: 4px 0 10px; font-size: 15px; font-weight: 600; line-height: 1.6; }
.announcement-related-title:hover { color: var(--vp-c-brand-1); }
.announcement-related a:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
</style>
