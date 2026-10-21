import { computed, nextTick, onMounted, ref } from 'vue';
import { useData } from 'vitepress';
import { data } from '../announcements.data';
import { parseAnnouncementFilters, type AnnouncementLocale } from '../announcements';

const currentSearch = ref('');
let locationReady = false;

export function syncAnnouncementLocation(href: string): void {
  if (!locationReady) return;
  currentSearch.value = new URL(href, 'https://open.dajiaoai.com').search;
}

export function useAnnouncements() {
  const { page } = useData();
  const locale = computed<AnnouncementLocale>(() => page.value.relativePath.startsWith('en/') ? 'en' : 'zh');
  const filters = computed(() => parseAnnouncementFilters(currentSearch.value));
  const current = computed(() => data.find(item =>
    item.url.replace(/\.html$/, '') === `/${page.value.relativePath.replace(/\.md$/, '')}`,
  ));
  const isAnnouncementPage = computed(() => /^(?:en\/)?announcements\//.test(page.value.relativePath));

  // Keep SSR output identical to the initial client render, then apply URL filters.
  onMounted(() => nextTick(() => {
    locationReady = true;
    syncAnnouncementLocation(window.location.href);
  }));

  return { announcements: data, locale, filters, current, isAnnouncementPage };
}
