<script setup lang="ts">
import { useAnnouncements } from './useAnnouncements';
import AnnouncementTags from './AnnouncementTags.vue';

const { current, locale } = useAnnouncements();
</script>

<template>
  <div v-if="current" class="announcement-article-tags">
    <AnnouncementTags :announcement="current" :locale="locale" />
  </div>
</template>

<style scoped>
.announcement-article-tags { margin-bottom: 20px; }
</style>
