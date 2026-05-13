<script setup lang="ts">
import { useData } from 'vitepress';
import { computed, onBeforeUnmount, ref } from 'vue';

type CopyState = 'idle' | 'copying' | 'success' | 'error';

const state = ref<CopyState>('idle');
const toastText = ref('');
const toastVisible = ref(false);
const { lang, page } = useData();

const isEnglish = computed(() => lang.value.toLowerCase().startsWith('en'));
const i18nText = computed(() => {
  if (isEnglish.value) {
    return {
      idle: 'Copy Doc',
      copying: 'Copying...',
      success: 'Copied',
      error: 'Copy Failed',
      title: 'Copy current document in Markdown format',
      copyAria: 'Copy document',
      copiedAria: 'Copy succeeded',
      missing: 'No content to copy',
      failed: 'Copy failed, try again',
    };
  }

  return {
    idle: '复制文档',
    copying: '复制中...',
    success: '复制成功',
    error: '复制失败',
    title: '复制当前文档的 Markdown 格式内容',
    copyAria: '复制文档',
    copiedAria: '复制成功',
    missing: '未找到可复制内容',
    failed: '复制失败，请重试',
  };
});

let resetTimer: number | undefined;
let toastTimer: number | undefined;

function clearResetTimer() {
  if (resetTimer !== undefined) {
    window.clearTimeout(resetTimer);
    resetTimer = undefined;
  }
}

function clearToastTimer() {
  if (toastTimer !== undefined) {
    window.clearTimeout(toastTimer);
    toastTimer = undefined;
  }
}

function scheduleReset(delay = 1800) {
  clearResetTimer();
  resetTimer = window.setTimeout(() => {
    state.value = 'idle';
    resetTimer = undefined;
  }, delay);
}

function showToast(text: string, delay = 1800) {
  clearToastTimer();
  toastText.value = text;
  toastVisible.value = true;

  toastTimer = window.setTimeout(() => {
    toastVisible.value = false;
    toastTimer = undefined;
  }, delay);
}

function withLeadingSlash(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

function normalizePathname(pathname: string): string {
  if (pathname.endsWith('/')) {
    return `${pathname}index.md`;
  }
  if (pathname.endsWith('.html')) {
    return `${pathname.slice(0, -5)}.md`;
  }
  if (pathname.endsWith('.md')) {
    return pathname;
  }
  return `${pathname}.md`;
}

function getMarkdownCandidates(): string[] {
  const candidates: string[] = [];
  const relativePath = page.value.relativePath || '';

  if (relativePath) {
    candidates.push(withLeadingSlash(relativePath));
  }

  const pathname = window.location.pathname;
  candidates.push(normalizePathname(pathname));

  if (pathname.endsWith('/')) {
    candidates.push(`${pathname}.md`);
  }

  return [...new Set(candidates)];
}

async function getMarkdownSource(): Promise<string> {
  const candidates = getMarkdownCandidates();

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, {
        headers: { Accept: 'text/markdown,text/plain;q=0.9,*/*;q=0.8' },
      });
      if (!response.ok) continue;

      const contentType = response.headers.get('content-type') || '';
      const text = (await response.text()).trim();
      if (!text) continue;

      const looksLikeHtml = /^<!doctype html>|^<html[\s>]/i.test(text);
      if (looksLikeHtml) continue;

      if (
        contentType.includes('text/markdown') ||
        /(^|\n)#{1,6}\s+/.test(text)
      ) {
        return text;
      }
    } catch {
      // Ignore fetch errors and continue fallback chain.
    }
  }

  return '';
}

function getDocText(): string {
  const doc = document.querySelector('.VPDoc .vp-doc') as HTMLElement | null;
  return doc?.innerText?.trim() ?? '';
}

async function copyDoc() {
  if (state.value === 'copying') return;

  const markdown = await getMarkdownSource();
  const text = markdown || getDocText();

  if (!text) {
    state.value = 'error';
    showToast(i18nText.value.missing);
    scheduleReset();
    return;
  }

  state.value = 'copying';

  try {
    await navigator.clipboard.writeText(text);
    state.value = 'success';
    scheduleReset();
  } catch {
    state.value = 'error';
    showToast(i18nText.value.failed);
    scheduleReset();
  }
}

onBeforeUnmount(() => {
  clearResetTimer();
  clearToastTimer();
});
</script>

<template>
  <div class="doc-copy-action" aria-live="polite">
    <button
      class="doc-copy-btn"
      :class="`is-${state}`"
      type="button"
      @click="copyDoc"
      :disabled="state === 'copying'"
      :title="i18nText.title"
      :aria-label="
        state === 'success' ? i18nText.copiedAria : i18nText.copyAria
      "
    >
      <span class="doc-copy-btn__icon" aria-hidden="true">
        <svg
          v-if="state === 'success'"
          viewBox="0 0 16 16"
          width="16"
          height="16"
          fill="none"
        >
          <path
            d="M3.5 8.4l2.7 2.7L12.6 4.7"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg
          v-else-if="state === 'error'"
          viewBox="0 0 16 16"
          width="16"
          height="16"
          fill="none"
        >
          <path
            d="M8 4.2v4.2"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
          <circle cx="8" cy="11.8" r="1" fill="currentColor" />
          <circle
            cx="8"
            cy="8"
            r="6"
            stroke="currentColor"
            stroke-width="1.4"
          />
        </svg>
        <svg v-else viewBox="0 0 16 16" width="16" height="16" fill="none">
          <rect
            x="5.1"
            y="3.2"
            width="7"
            height="9"
            rx="1.2"
            stroke="currentColor"
            stroke-width="1.4"
          />
          <path
            d="M3.9 10.8H3.2A1.2 1.2 0 0 1 2 9.6V3.2A1.2 1.2 0 0 1 3.2 2h5.2"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
          />
        </svg>
      </span>
      <span class="doc-copy-btn__text">
        {{
          state === 'copying'
            ? i18nText.copying
            : state === 'success'
              ? i18nText.success
              : state === 'error'
                ? i18nText.error
                : i18nText.idle
        }}
      </span>
    </button>

    <Transition name="doc-copy-toast-fade">
      <span v-if="toastVisible" class="doc-copy-toast" role="status">
        {{ toastText }}
      </span>
    </Transition>
  </div>
</template>
