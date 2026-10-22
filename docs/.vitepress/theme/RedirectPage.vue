<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useData } from 'vitepress';

const { frontmatter } = useData();

// Head scripts handle direct visits; this also handles VitePress navigation.
onMounted(() => {
  watch(
    () => frontmatter.value.redirect,
    (target) => {
      if (typeof target === 'string') {
        window.location.replace(target + window.location.search + window.location.hash);
      }
    },
    { immediate: true },
  );
});
</script>

<template><span aria-live="polite">{{ frontmatter.title }}</span></template>
