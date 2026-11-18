<script setup lang="ts">
withDefaults(defineProps<{ href: string; label?: string }>(), { label: '体验' });
</script>

<template>
  <a class="playground-trigger demo-button" :href="href" target="_blank" rel="noopener noreferrer">
    <span class="trigger-icon" aria-hidden="true"><svg viewBox="0 0 20 20" width="18" height="18" fill="none"><path d="m7 4.5 8 5.5-8 5.5V4.5Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg></span>
    <span>{{ label }}</span>
    <svg class="trigger-arrow" aria-hidden="true" viewBox="0 0 20 20" width="18" height="18" fill="none"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
  </a>
</template>

<style scoped src="./playground.css"></style>
<style scoped>
.vp-doc a.demo-button { color: #fff; text-decoration: none; font-weight: 600; }
.demo-button:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
</style>
