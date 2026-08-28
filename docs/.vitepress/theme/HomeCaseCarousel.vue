<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useData } from 'vitepress';

// 案例配置：替换 image、name、href 即可更新首页轮播内容。
const zhCases = [
  {
    image: 'https://luhuidev.oss-cn-beijing.aliyuncs.com/md/234554d431aa0f7450892d89.jpg',
    name: '在线教育场景',
    href: '/guide/scenarios.html#_1-在线教育与智慧课堂',
  },
  {
    image: 'https://luhuidev.oss-cn-beijing.aliyuncs.com/md/6ff68f93eb3d6a3d0e16382d.png',
    name: '数字化题库与内容平台',
    href: '/guide/scenarios.html#_2-数字化题库与内容平台',
  },
  {
    image: 'https://luhuidev.oss-cn-beijing.aliyuncs.com/md/f864a26517c1d3b1fcadca11.jpg',
    name: 'AI 智能辅导',
    href: '/guide/scenarios.html#_3-ai-智能辅导',
  },
  {
    image: '/enterprise-content-agent.png',
    name: '企业级内容生产 AI Agent',
    href: '/guide/scenarios.html#scenario-enterprise-ai-agent',
  },
];

const enCases = [
  {
    image: 'https://luhuidev.oss-cn-beijing.aliyuncs.com/md/234554d431aa0f7450892d89.jpg',
    name: 'Online Education',
    href: '/en/guide/scenarios.html#scenario-online-education',
  },
  {
    image: 'https://luhuidev.oss-cn-beijing.aliyuncs.com/md/6ff68f93eb3d6a3d0e16382d.png',
    name: 'Digital Question Banks and Content Platforms',
    href: '/en/guide/scenarios.html#scenario-question-bank',
  },
  {
    image: 'https://luhuidev.oss-cn-beijing.aliyuncs.com/md/f864a26517c1d3b1fcadca11.jpg',
    name: 'AI Tutoring',
    href: '/en/guide/scenarios.html#scenario-ai-tutoring',
  },
  {
    image: '/enterprise-content-agent.png',
    name: 'Enterprise Content Production AI Agent',
    href: '/en/guide/scenarios.html#scenario-enterprise-ai-agent',
  },
];

const { lang } = useData();
const isEnglish = computed(() => lang.value.toLowerCase().startsWith('en'));
const cases = computed(() => isEnglish.value ? enCases : zhCases);

const current = ref(0);
const isPaused = ref(false);
let timer: ReturnType<typeof setInterval> | undefined;
let touchStartX = 0;

function goTo(index: number) {
  current.value = (index + cases.value.length) % cases.value.length;
}

function startAutoplay() {
  stopAutoplay();
  timer = setInterval(() => {
    if (!isPaused.value) goTo(current.value + 1);
  }, 5000);
}

function stopAutoplay() {
  if (timer) clearInterval(timer);
}

function handleTouchStart(event: TouchEvent) {
  touchStartX = event.touches[0]?.clientX ?? 0;
}

function handleTouchEnd(event: TouchEvent) {
  const distance = (event.changedTouches[0]?.clientX ?? touchStartX) - touchStartX;
  if (Math.abs(distance) > 50) goTo(current.value + (distance < 0 ? 1 : -1));
}

onMounted(startAutoplay);
onBeforeUnmount(stopAutoplay);
</script>

<template>
  <section class="case-carousel-section" :aria-label="isEnglish ? 'Use cases' : '应用案例'">
    <div
      class="case-carousel"
      tabindex="0"
      @mouseenter="isPaused = true"
      @mouseleave="isPaused = false"
      @focusin="isPaused = true"
      @focusout="isPaused = false"
      @keydown.left.prevent="goTo(current - 1)"
      @keydown.right.prevent="goTo(current + 1)"
      @touchstart.passive="handleTouchStart"
      @touchend.passive="handleTouchEnd"
    >
      <div class="case-carousel__track" :style="{ transform: `translateX(-${current * 100}%)` }">
        <a
          v-for="item in cases"
          :key="item.name"
          class="case-carousel__slide"
          :href="item.href"
          :aria-label="isEnglish ? `View use case: ${item.name}` : `查看案例：${item.name}`"
        >
          <img class="case-carousel__backdrop" :src="item.image" alt="" aria-hidden="true" loading="lazy" />
          <img class="case-carousel__image" :src="item.image" :alt="item.name" loading="lazy" />
          <span class="case-carousel__name">
            {{ item.name }}
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M7 5h8v8M15 5 5 15" />
            </svg>
          </span>
        </a>
      </div>

      <button class="case-carousel__arrow is-prev" type="button" :aria-label="isEnglish ? 'Previous use case' : '上一个案例'" @click="goTo(current - 1)">
        <span aria-hidden="true">&#8249;</span>
      </button>
      <button class="case-carousel__arrow is-next" type="button" :aria-label="isEnglish ? 'Next use case' : '下一个案例'" @click="goTo(current + 1)">
        <span aria-hidden="true">&#8250;</span>
      </button>

      <div class="case-carousel__dots" :aria-label="isEnglish ? 'Select use case' : '选择案例'">
        <button
          v-for="(item, index) in cases"
          :key="item.name"
          type="button"
          :class="{ 'is-active': current === index }"
          :aria-label="isEnglish ? `Show ${item.name}` : `切换到${item.name}`"
          :aria-current="current === index ? 'true' : undefined"
          @click="goTo(index)"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.case-carousel-section {
  width: 100%;
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px 64px;
}

.case-carousel {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 3;
  border: 1px solid rgba(1, 184, 139, 0.2);
  border-radius: 24px;
  background: var(--vp-c-bg-soft);
  box-shadow: 0 20px 60px rgba(19, 63, 52, 0.13);
  outline: none;
}

.case-carousel:focus-visible {
  box-shadow: 0 0 0 3px var(--vp-c-brand-soft), 0 20px 60px rgba(19, 63, 52, 0.13);
}

.case-carousel__track {
  display: flex;
  height: 100%;
  transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
}

.case-carousel__slide {
  position: relative;
  flex: 0 0 100%;
  height: 100%;
  color: white;
  overflow: hidden;
}

.case-carousel__slide img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.case-carousel__backdrop {
  object-fit: cover;
  filter: blur(28px) saturate(1.08);
  transform: scale(1.1);
  opacity: 0.72;
}

.case-carousel__image {
  z-index: 1;
  object-fit: contain;
  transition: transform 0.8s ease;
}

.case-carousel__slide:hover .case-carousel__image { transform: scale(1.025); }

.case-carousel__name {
  position: absolute;
  z-index: 2;
  top: 24px;
  right: 24px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.38);
  border-radius: 999px;
  background: rgba(10, 35, 29, 0.64);
  backdrop-filter: blur(12px);
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
}

.case-carousel__name svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.case-carousel__arrow {
  position: absolute;
  z-index: 2;
  top: 50%;
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 50%;
  background: rgba(9, 31, 26, 0.52);
  color: white;
  cursor: pointer;
  transform: translateY(-50%);
  backdrop-filter: blur(10px);
  transition: background 0.2s ease, transform 0.2s ease;
}

.case-carousel__arrow:hover { background: rgba(1, 184, 139, 0.9); transform: translateY(-50%) scale(1.06); }
.case-carousel__arrow span { font-size: 32px; line-height: 1; transform: translateY(-2px); }
.case-carousel__arrow.is-prev { left: 20px; }
.case-carousel__arrow.is-next { right: 20px; }

.case-carousel__dots {
  position: absolute;
  z-index: 2;
  bottom: 20px;
  left: 50%;
  display: flex;
  gap: 8px;
  padding: 7px 9px;
  border-radius: 999px;
  background: rgba(9, 31, 26, 0.45);
  transform: translateX(-50%);
  backdrop-filter: blur(8px);
}

.case-carousel__dots button {
  width: 8px;
  height: 8px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: width 0.25s ease, background 0.25s ease;
}

.case-carousel__dots button.is-active { width: 24px; background: white; }

@media (max-width: 640px) {
  .case-carousel-section { padding: 0 16px 40px; }
  .case-carousel { border-radius: 16px; }
  .case-carousel__name { top: 14px; right: 14px; font-size: 14px; }
  .case-carousel__arrow { width: 38px; height: 38px; }
  .case-carousel__arrow.is-prev { left: 12px; }
  .case-carousel__arrow.is-next { right: 12px; }
  .case-carousel__dots { bottom: 14px; }
}

@media (prefers-reduced-motion: reduce) {
  .case-carousel__track, .case-carousel__slide img { transition: none; }
}
</style>
