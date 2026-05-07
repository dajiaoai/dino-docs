<template>
  <h1 class="hero-name">
    <span class="hero-name-clip">{{ nameText }}</span>
    <span class="hero-name-text"> {{ textText }}</span>
  </h1>
  <p class="hero-tagline">
    {{ displayed }}<span class="tw-cursor" :class="{ blink: done }">|</span>
  </p>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useData } from 'vitepress';

const { lang } = useData();
const isEn = lang.value.startsWith('en');

const nameText = isEn ? 'Dino-GSP' : '大角几何';
const textText = isEn ? 'Open Platform' : '开放平台';
const fullTagline = isEn
  ? 'Embed geometry drawing and understanding into your product — componentized, API-ready, and Agent-powered.'
  : '将几何绘图与理解能力嵌入你的产品，组件化、API 化、Agent 化。';

// SSR: pre-render full text so bots and initial paint see content.
// After hydration, reset and replay typewriter.
const displayed = ref(fullTagline);
const done = ref(true);

onMounted(() => {
  displayed.value = '';
  done.value = false;
  const chars = [...fullTagline];
  let i = 0;
  const delay = setTimeout(() => {
    const timer = setInterval(() => {
      displayed.value += chars[i];
      i++;
      if (i >= chars.length) {
        clearInterval(timer);
        done.value = true;
        document.body.classList.add('hero-ready');
      }
    }, 55);
  }, 500);

  // cleanup on unmount
  return () => clearTimeout(delay);
});
</script>

<style>
/* Non-scoped: mirrors VitePress VPHomeHero structure */

.hero-name {
  max-width: 392px;
  letter-spacing: -0.4px;
  line-height: 1.1;
  font-size: 48px;
  font-weight: 700;
  white-space: pre-wrap;
  animation: hero-name-in 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.05s both;
}

@media (min-width: 640px) {
  .hero-name {
    max-width: 576px;
    font-size: 60px;
  }
}

@media (min-width: 960px) {
  .hero-name {
    max-width: 768px;
    font-size: 72px;
  }
}

.hero-name-clip {
  background: linear-gradient(120deg, #a668b8 15%, #01b88b 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-name-text {
  color: var(--vp-c-text-1);
}

.hero-tagline {
  padding-top: 12px;
  max-width: 392px;
  line-height: 1.6;
  font-size: 18px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  animation: hero-tagline-in 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
  min-height: 2.4em; /* reserve space while typewriter plays */
}

@media (min-width: 640px) {
  .hero-tagline {
    max-width: 576px;
    font-size: 20px;
  }
}

@media (min-width: 960px) {
  .hero-tagline {
    max-width: 576px;
    font-size: 20px;
  }
}

@keyframes hero-name-in {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes hero-tagline-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.tw-cursor {
  display: inline-block;
  margin-left: 1px;
  font-weight: 300;
  color: var(--vp-c-brand-1);
}

.tw-cursor.blink {
  animation: tw-blink 1s step-end infinite;
}

@keyframes tw-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
