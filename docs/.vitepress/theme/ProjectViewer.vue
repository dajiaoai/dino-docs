<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { EmbeddedEditor, EmbeddedPresentation, FileContentLatest } from '@dajiaoai/algeo-sdk';
import { buildViewerUrl, parseProject, parseViewerMode, validateProjectUrl, type ViewerMode } from './projectViewer';

const host = ref<HTMLDivElement>();
const mode = ref<ViewerMode>('presentation');
const inputUrl = ref('');
const sourceUrl = ref('');
const filename = ref('');
const busy = ref(false);
const ready = ref(false);
const error = ref('');
const notice = ref('');
const slideCount = ref(0);
let content: FileContentLatest | undefined;
let instance: EmbeddedEditor | EmbeddedPresentation | undefined;
let disposed = false;
let controller: AbortController | undefined;

function syncUrl() {
  window.history.replaceState(window.history.state, '', buildViewerUrl(window.location.href, sourceUrl.value, mode.value));
  notice.value = '';
}
async function snapshot() {
  if (instance && 'document' in instance) content = await instance.document.getContent();
}
async function mountBoard(nextMode: ViewerMode) {
  if (!host.value || !content) return;
  ready.value = false;
  const sdk = await import('@dajiaoai/algeo-sdk');
  if (disposed) return;
  await instance?.destroy();
  instance = undefined;
  if (disposed) return;
  // Reuse the public application configured for the open-platform demos.
  const auth = { appId: 'HLVENKRV' };
  if (nextMode === 'editor') {
    const editor = new sdk.EmbeddedEditor(host.value);
    instance = editor;
    await editor.initialize({
      auth, initialContent: content,
      ui: { navbar: false, helpEntry: false, aiChatPanel: false },
    });
    editor.on('contentChange', event => {
      if (!event.content) return;
      content = event.content;
      slideCount.value = event.content.slides.length;
    });
  } else {
    const presentation = new sdk.EmbeddedPresentation(host.value);
    instance = presentation;
    await presentation.initialize({ auth });
    if (disposed) { await presentation.destroy(); instance = undefined; return; }
    await presentation.loadFile(content);
  }
  if (disposed) { await instance.destroy(); instance = undefined; return; }
  mode.value = nextMode;
  slideCount.value = content.slides.length;
  ready.value = true;
}
async function run(action: () => Promise<void>) {
  if (busy.value || disposed) return;
  busy.value = true;
  error.value = '';
  notice.value = '';
  try { await action(); }
  catch (cause) { if (!disposed) error.value = cause instanceof Error ? cause.message : '打开失败，请重试。'; }
  finally { busy.value = false; }
}
async function openRemote() {
  await run(async () => {
    const url = validateProjectUrl(inputUrl.value);
    controller = new AbortController();
    const timeout = window.setTimeout(() => controller?.abort(), 60_000);
    let parsed: FileContentLatest;
    try {
      const response = await fetch(url, { signal: controller.signal, credentials: 'omit' });
      if (!response.ok) throw new Error(`获取工程失败（HTTP ${response.status}）。`);
      parsed = parseProject(await response.text());
    } catch (cause) {
      if (cause instanceof TypeError) throw new Error('无法获取工程，请检查地址及文件服务的 CORS 配置，或下载后本地导入。');
      if (controller.signal.aborted) throw new Error('获取工程超时，请重试或下载后本地导入。');
      throw cause;
    } finally { window.clearTimeout(timeout); controller = undefined; }
    if (disposed) return;
    content = parsed;
    sourceUrl.value = url;
    inputUrl.value = url;
    try { filename.value = decodeURIComponent(new URL(url).pathname.split('/').pop() || '云端工程.algeo'); }
    catch { filename.value = '云端工程.algeo'; }
    syncUrl();
    await mountBoard(mode.value);
  });
}
async function importFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  await run(async () => {
    const parsed = parseProject(await file.text());
    if (disposed) return;
    content = parsed;
    filename.value = file.name;
    sourceUrl.value = '';
    inputUrl.value = '';
    syncUrl();
    await mountBoard(mode.value);
  });
}
async function switchMode(nextMode: ViewerMode) {
  if (nextMode === mode.value) return;
  await run(async () => {
    await snapshot();
    await mountBoard(nextMode);
    mode.value = nextMode;
    syncUrl();
  });
}
async function download() {
  await run(async () => {
    await snapshot();
    if (!content) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(content)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename.value.replace(/(?:\.algeo)?$/i, '.algeo');
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}
async function copyLink() {
  try { await navigator.clipboard.writeText(buildViewerUrl(window.location.href, sourceUrl.value, mode.value)); notice.value = '链接已复制，打开时会加载云端原始工程。'; }
  catch { error.value = '复制失败，请从浏览器地址栏复制链接。'; }
}
async function restoreUrl() {
  if (busy.value) return;
  const params = new URLSearchParams(window.location.search);
  const nextMode = parseViewerMode(params.get('mode'));
  const url = params.get('url') || '';
  if (url && url !== sourceUrl.value) {
    mode.value = nextMode;
    inputUrl.value = url;
    await openRemote();
  } else await switchMode(nextMode);
}
onMounted(() => { void restoreUrl(); window.addEventListener('popstate', restoreUrl); });
onBeforeUnmount(() => {
  disposed = true;
  controller?.abort();
  window.removeEventListener('popstate', restoreUrl);
  void instance?.destroy();
});
</script>

<template>
  <main class="project-viewer" data-no-track>
    <aside class="console" aria-label="工程操作台">
      <a class="brand" href="/">大角几何 <span>开放平台 ↗</span></a>
      <section>
        <h2>打开工程</h2>
        <form @submit.prevent="openRemote">
          <label for="project-url">云端工程地址</label>
          <input id="project-url" v-model="inputUrl" type="url" placeholder="https://…/project.algeo" required :disabled="busy" spellcheck="false" />
          <button class="primary" :disabled="busy" type="submit">{{ busy ? '正在处理…' : '打开云端工程' }} <span aria-hidden="true">→</span></button>
        </form>
        <div class="divider"><span>或从本地打开</span></div>
        <label class="import" :class="{ disabled: busy }">＋ 导入 .algeo / .json 工程<input type="file" accept=".algeo,.json,application/json" :disabled="busy" @change="importFile" /></label>
        <p class="hint">本地文件在浏览器中读取，并交由内嵌画板打开。</p>
      </section>
      <section>
        <h2>画板模式</h2>
        <div class="mode-switch" aria-label="画板模式"><button type="button" :aria-pressed="mode === 'presentation'" :disabled="busy" @click="switchMode('presentation')">▷ 演示模式</button><button type="button" :aria-pressed="mode === 'editor'" :disabled="busy" @click="switchMode('editor')">✎ 编辑模式</button></div>
      </section>
      <section v-if="filename" class="file-info">
        <h2>当前工程</h2><strong>{{ filename }}</strong><p>{{ sourceUrl ? '云端工程' : '本地工程' }}<template v-if="ready"> · {{ slideCount }} 个画板</template></p>
        <div class="file-actions"><button :disabled="busy || !ready" @click="download">下载工程 ↓</button><button v-if="sourceUrl" :disabled="busy || !ready" @click="copyLink">复制打开链接 ↗</button></div>
        <p class="hint">修改后请下载保存；链接始终打开云端原始文件。</p>
      </section>
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <button v-if="error && filename && !ready" :disabled="busy" @click="run(() => mountBoard(mode))">重新加载画板</button>
      <p v-if="notice" class="notice" role="status">{{ notice }}</p>
      <footer><a href="/guide/">开放平台使用文档 <span>↗</span></a><nav aria-label="接入文档"><a href="/api/">HTTP API</a><a href="/ai/mcp/">MCP 接入</a><a href="/sdk/2/getting-started">SDK 接入</a></nav></footer>
    </aside>
    <section class="board" aria-label="几何画板" :aria-busy="busy">
      <div class="board-bar"><span><i :class="{ ready }" />{{ ready ? '画板已就绪' : busy ? '正在打开工程' : '等待打开工程' }}</span><span>{{ mode === 'editor' ? '编辑模式' : '演示模式' }}</span></div>
      <div ref="host" class="board-host" />
      <div v-if="!ready" class="board-placeholder" role="status"><div class="geometry" aria-hidden="true">△<span>○</span></div><h2>{{ busy ? '正在准备你的画板…' : error && filename ? '画板未能打开' : '让几何跃然眼前' }}</h2><p>{{ error && filename ? '请检查网络连接后重新加载画板。' : '粘贴云端工程地址，或导入本地 .algeo / .json 工程' }}</p><span class="placeholder-tag">2D / 3D · 多画板 · 动态交互</span></div>
    </section>
  </main>
</template>

<style scoped>
.project-viewer { display: grid; grid-template-columns: 340px minmax(0, 1fr); height: 100dvh; min-height: 600px; background: var(--vp-c-bg); color: var(--vp-c-text-1); }
.console { overflow-y: auto; padding: 28px 26px; border-right: 1px solid var(--vp-c-divider); display: flex; flex-direction: column; gap: 26px; }
a { text-decoration: none; }
.brand { display: flex; justify-content: space-between; align-items: center; font-size: 17px; font-weight: 700; }
.brand span { font-size: 12px; font-weight: 400; color: var(--vp-c-text-2); }
h2 { margin: 0 0 14px; font-size: 13px; font-weight: 650; }
label { display: block; margin-bottom: 8px; font-size: 12px; color: var(--vp-c-text-2); }
input[type=url] { width: 100%; padding: 10px 12px; border: 1px solid var(--vp-c-divider); border-radius: 7px; background: var(--vp-c-bg-soft); font-size: 12px; }
button { cursor: pointer; font-size: 12px; }
button:disabled, .disabled { opacity: .5; cursor: wait; }
:where(button, a, input):focus-visible, .import:focus-within { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.primary { display: flex; width: 100%; justify-content: space-between; padding: 10px 14px; margin-top: 10px; background: var(--vp-c-brand-1); color: #fff; font-weight: 600; border-radius: 7px; }
.divider { display: flex; align-items: center; gap: 10px; margin: 17px 0; font-size: 10px; color: var(--vp-c-text-3); }
.divider::before, .divider::after { content: ''; flex: 1; border-top: 1px solid var(--vp-c-divider); }
.import { position: relative; overflow: hidden; padding: 12px; border: 1px dashed var(--vp-c-divider); border-radius: 7px; text-align: center; cursor: pointer; color: var(--vp-c-text-1); }
.import input { position: absolute; inset: 0; opacity: 0; width: 100%; cursor: pointer; }
.hint { margin: 9px 0 0; color: var(--vp-c-text-3); font-size: 11px; line-height: 1.8; }
.mode-switch { display: flex; gap: 4px; padding: 4px; border-radius: 8px; background: var(--vp-c-bg-soft); }
.mode-switch button { flex: 1; padding: 8px 0; color: var(--vp-c-text-2); border: 1px solid transparent; border-radius: 5px; }
.mode-switch button[aria-pressed=true] { background: var(--vp-c-bg); color: var(--vp-c-brand-1); border-color: var(--vp-c-divider); box-shadow: 0 1px 3px #00000008; }
.file-info strong { display: block; font-size: 12px; overflow-wrap: anywhere; }
.file-info > p { font-size: 11px; color: var(--vp-c-text-3); }
.file-actions { display: flex; gap: 18px; margin-top: 12px; color: var(--vp-c-brand-1); }
.error, .notice { padding: 10px; border-radius: 6px; font-size: 12px; overflow-wrap: anywhere; background: var(--vp-c-bg-soft); }
.error { color: var(--vp-c-danger-1); }
.notice { color: var(--vp-c-brand-1); }
footer { margin-top: auto; padding-top: 20px; border-top: 1px solid var(--vp-c-divider); }
footer > a { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; }
footer nav { display: flex; gap: 22px; margin-top: 12px; font-size: 10px; color: var(--vp-c-text-3); }
.board { display: flex; flex-direction: column; position: relative; min-width: 0; background: var(--vp-c-bg-soft); }
.board-bar { height: 48px; display: flex; align-items: center; justify-content: space-between; padding: 0 22px; border-bottom: 1px solid var(--vp-c-divider); background: var(--vp-c-bg); font-size: 11px; color: var(--vp-c-text-3); }
.board-bar i { display: inline-block; width: 6px; height: 6px; margin-right: 8px; background: var(--vp-c-text-3); border-radius: 50%; }
.board-bar i.ready { background: var(--vp-c-brand-1); }
.board-host { flex: 1; min-height: 0; }
.board-placeholder { position: absolute; inset: 49px 0 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 24px; background-color: var(--vp-c-bg-soft); background-image: radial-gradient(var(--vp-c-divider) 1px, transparent 1px); background-size: 24px 24px; }
.geometry { position: relative; font-size: 100px; line-height: 1; font-weight: 200; color: var(--vp-c-brand-1); margin-bottom: 36px; }
.geometry span { position: absolute; font-size: 68px; left: 44px; top: 30px; opacity: .4; }
.board-placeholder h2 { font-size: 23px; font-weight: 500; margin-bottom: 12px; }
.board-placeholder p { color: var(--vp-c-text-3); font-size: 13px; }
.placeholder-tag { font-size: 10px; color: var(--vp-c-text-3); margin-top: 28px; letter-spacing: .1em; }
@media (max-width: 760px) { .project-viewer { grid-template-columns: 1fr; height: auto; min-height: 100dvh; } .console { overflow: visible; padding: 22px; gap: 22px; border-right: 0; } .board { height: 75dvh; min-height: 480px; } }
</style>
