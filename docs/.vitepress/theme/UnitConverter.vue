<script setup lang="ts">
import { computed, ref } from 'vue';
import { useData } from 'vitepress';

const { lang } = useData();
const px = ref(16);
const rounded = (value: number) => Math.round(value * 1000) / 1000;
const pt = computed({
  get: () => rounded(px.value * 0.75),
  set: (value: number) => {
    if (Number.isFinite(value)) px.value = rounded((value * 4) / 3);
  },
});
const isChinese = computed(() => lang.value.startsWith('zh'));
</script>

<template>
  <div class="unit-calculator">
    <label>
      <span>{{ isChinese ? '大角几何参数（px）' : 'Dino-GSP parameter (px)' }}</span>
      <input v-model.number="px" type="number" min="0" step="0.001" />
    </label>
    <span class="equals">=</span>
    <label>
      <span>{{ isChinese ? '排版印刷尺寸（pt）' : 'Typesetting or print size (pt)' }}</span>
      <input v-model.number="pt" type="number" min="0" step="0.001" />
    </label>
  </div>
</template>

<style scoped>
.unit-calculator {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin: 16px 0;
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
}
.unit-calculator label {
  flex: 1;
}
.unit-calculator label span {
  display: block;
  margin-bottom: 8px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}
.unit-calculator input {
  box-sizing: border-box;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  font: inherit;
}
.unit-calculator input:focus {
  border-color: var(--vp-c-brand-1);
  outline: 2px solid color-mix(in srgb, var(--vp-c-brand-1) 20%, transparent);
}
.equals {
  padding-bottom: 10px;
  font-weight: 600;
}
@media (max-width: 640px) {
  .unit-calculator {
    align-items: stretch;
    flex-direction: column;
  }
  .equals {
    padding: 0;
    text-align: center;
  }
}
</style>
