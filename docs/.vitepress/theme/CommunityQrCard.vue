<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const QR_CODE_URL =
  'https://dl.easeplay.vip/algeo/685b4c2009d5753784ebe7df/3adfd830-ef1af4b4-f714-447f-8010-ee698f6104c3.jpg';

const isVisible = ref(false);
const isExpanded = ref(true);
let showTimer: ReturnType<typeof setTimeout> | undefined;

onMounted(() => {
  showTimer = setTimeout(() => {
    isVisible.value = true;
  }, 900);
});

onBeforeUnmount(() => {
  if (showTimer) clearTimeout(showTimer);
});
</script>

<template>
  <Transition name="community-widget">
    <aside v-if="isVisible" class="community-widget" aria-label="Open-Dino 用户群">
      <Transition name="community-card" mode="out-in">
        <section v-if="isExpanded" key="card" class="community-card">
          <button
            class="community-card__close"
            type="button"
            aria-label="收起加群二维码"
            @click="isExpanded = false"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="m5.5 5.5 9 9m0-9-9 9" />
            </svg>
          </button>

          <div class="community-card__heading">
            <span class="community-card__eyebrow">OPEN-DINO 用户群</span>
            <strong>扫码加群，持续领点数</strong>
          </div>

          <div class="community-card__body">
            <img
              class="community-card__qr"
              :src="QR_CODE_URL"
              alt="Open-Dino 用户群二维码"
              width="132"
              height="132"
            />
            <ul class="community-card__benefits">
              <li><span aria-hidden="true">✦</span> 每月领取点数</li>
              <li><span aria-hidden="true">✦</span> 最新能力同步</li>
            </ul>
          </div>

          <p class="community-card__hint">微信扫码加入交流社群</p>
        </section>

        <button
          v-else
          key="pill"
          class="community-pill"
          type="button"
          aria-label="展开加群二维码"
          @click="isExpanded = true"
        >
          <span class="community-pill__icon" aria-hidden="true">群</span>
          <span>加群领点数</span>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="m7.5 4.5 5 5.5-5 5.5" />
          </svg>
        </button>
      </Transition>
    </aside>
  </Transition>
</template>

<style scoped>
.community-widget {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 30;
  color: var(--vp-c-text-1);
}

.community-card {
  position: relative;
  width: 236px;
  padding: 18px;
  overflow: hidden;
  border: 1px solid rgba(1, 184, 139, 0.24);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 18px 50px rgba(30, 55, 49, 0.16),
    0 4px 14px rgba(1, 184, 139, 0.1);
  backdrop-filter: blur(18px) saturate(1.25);
  -webkit-backdrop-filter: blur(18px) saturate(1.25);
}

.community-card::before {
  position: absolute;
  inset: -70px -80px auto auto;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(1, 184, 139, 0.12);
  content: '';
  pointer-events: none;
}

.community-card__close {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1;
  display: grid;
  width: 28px;
  height: 28px;
  padding: 0;
  place-items: center;
  border: 0;
  border-radius: 50%;
  color: var(--vp-c-text-2);
  background: transparent;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.community-card__close:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-default-soft);
}

.community-card__close svg {
  width: 16px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.7;
}

.community-card__heading {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-right: 24px;
}

.community-card__heading strong {
  font-size: 17px;
  line-height: 1.45;
  letter-spacing: -0.01em;
}

.community-card__eyebrow {
  color: var(--vp-c-brand-1);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.community-card__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 14px;
}

.community-card__qr {
  display: block;
  width: 144px;
  height: 144px;
  padding: 6px;
  border: 1px solid rgba(1, 184, 139, 0.16);
  border-radius: 12px;
  background: #fff;
  object-fit: contain;
}

.community-card__benefits {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin: 13px 0 0;
  padding: 0;
  color: var(--vp-c-text-1);
  font-size: 12px;
  font-weight: 600;
  list-style: none;
  white-space: nowrap;
}

.community-card__benefits span {
  color: var(--vp-c-brand-1);
}

.community-card__hint {
  margin: 10px 0 0;
  color: var(--vp-c-text-3);
  font-size: 11px;
  line-height: 1.5;
  text-align: center;
}

.community-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 46px;
  padding: 7px 12px 7px 8px;
  border: 1px solid rgba(1, 184, 139, 0.25);
  border-radius: 999px;
  color: var(--vp-c-text-1);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 10px 30px rgba(30, 55, 49, 0.14);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.community-pill__icon {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: var(--vp-c-brand-1);
  font-size: 13px;
}

.community-pill svg {
  width: 15px;
  fill: none;
  stroke: var(--vp-c-text-3);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.community-pill:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 12px 34px rgba(1, 184, 139, 0.2);
}

html.dark .community-card,
html.dark .community-pill {
  border-color: rgba(93, 221, 179, 0.2);
  background: rgba(27, 28, 30, 0.92);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.34);
}

.community-widget-enter-active {
  animation: community-widget-in 0.7s 0.05s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.community-widget-leave-active {
  transition: opacity 0.2s ease;
}

.community-widget-leave-to {
  opacity: 0;
}

.community-card-enter-active,
.community-card-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.community-card-enter-from,
.community-card-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}

@keyframes community-widget-in {
  from {
    opacity: 0;
    transform: translate3d(24px, 20px, 0) scale(0.94);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@media (max-width: 1279px) {
  .community-widget {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .community-widget-enter-active {
    animation: none;
  }

  .community-card-enter-active,
  .community-card-leave-active {
    transition: opacity 0.01ms;
  }
}
</style>
