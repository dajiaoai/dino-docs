<script setup lang="ts">
import { nextTick, ref } from 'vue';
import type { TextareaAction } from './playgroundTextarea';

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  id: string;
  label: string;
  modelValue: string;
  actions?: readonly TextareaAction[];
}>(), { actions: () => [] });
const emit = defineEmits<{
  'update:modelValue': [value: string];
  action: [id: string];
}>();
const fileInput = ref<HTMLInputElement>();
const selectedAction = ref<TextareaAction>();
const reading = ref(false);
const error = ref('');

async function runAction(action: TextareaAction) {
  error.value = '';
  if (!action.upload) { emit('action', action.id); return; }
  selectedAction.value = action;
  await nextTick();
  fileInput.value?.click();
}
async function importFile(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  const upload = selectedAction.value?.upload;
  if (!file || !upload) return;
  reading.value = true;
  error.value = '';
  try {
    const content = upload.read
      ? await upload.read(file)
      : (await file.text()).replace(/^\uFEFF/, '');
    await upload.validate?.(content, file);
    emit('update:modelValue', content);
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : '无法读取文件，请重新选择。';
  } finally {
    reading.value = false;
    target.value = '';
  }
}
</script>

<template>
  <div class="playground-textarea">
    <div class="textarea-header">
      <div class="textarea-label"><label :for="id">{{ label }}</label><slot name="meta" /></div>
    </div>
    <div class="textarea-editor">
      <textarea :id="id" v-bind="$attrs" :value="modelValue" :disabled="reading || $attrs.disabled" :aria-describedby="`${id}-help ${id}-status`" @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value); error = ''" />
      <div v-if="actions.length" class="textarea-actions" role="group" :aria-label="`${label} 操作`">
        <button v-for="action in actions" :key="action.id" type="button" :disabled="reading || action.disabled" :aria-label="`${action.label} ${label}`" @click="runAction(action)">{{ action.label }}</button>
      </div>
    </div>
    <input ref="fileInput" class="file-input" type="file" :accept="selectedAction?.upload?.accept" tabindex="-1" aria-hidden="true" @change="importFile" />
    <small :id="`${id}-help`"><slot name="help" /></small>
    <div :id="`${id}-status`">
      <small v-if="reading" role="status">正在读取文件…</small>
      <small v-if="error" class="import-error" role="alert">{{ error }}</small>
    </div>
  </div>
</template>

<style scoped>
.playground-textarea { margin-bottom: 16px; font-weight: 500; }
.textarea-label, .textarea-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
label { margin: 0; color: var(--vp-c-brand-1); font: 600 13px var(--vp-font-family-base); }
.textarea-editor { margin-top: 7px; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg-alt); overflow: hidden; }
.textarea-editor:focus-within { border-color: var(--vp-c-brand-1); }
.textarea-actions { justify-content: flex-start; gap: 6px; padding: 8px 10px; }
.textarea-actions button { padding: 4px 10px; border: 1px solid var(--vp-c-divider); border-radius: 5px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font-size: 12px; font-weight: 500; line-height: 20px; cursor: pointer; transition: border-color .15s, background .15s, color .15s; }
.textarea-actions button:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); }
.textarea-actions button:disabled { opacity: .5; cursor: default; }
textarea { display: block; box-sizing: border-box; width: 100%; margin: 0; padding: 9px 12px; border: 0; border-radius: 0; background: transparent; color: var(--vp-c-text-1); resize: vertical; font: 12px/1.6 var(--vp-font-family-mono); }
.file-input { display: none; }
small { display: block; margin-top: 6px; color: var(--vp-c-text-2); font-size: 12px; font-weight: 400; line-height: 1.6; }
small:empty { display: none; }
.import-error { color: var(--vp-c-danger-1); }
button:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 2px; }
textarea:focus, textarea:focus-visible { outline: none; box-shadow: none; }
</style>
