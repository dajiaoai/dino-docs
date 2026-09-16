<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { DEFAULT_PLAYGROUND_ENVIRONMENT, loadPlaygroundEnvironment, savePlaygroundEnvironment } from './playgroundEnvironment';
import { buildRequest, fields2D, fields3D, toCurl, type PlaygroundInput } from './renderPlayground';
import defaultRenderContent from './defaultRenderContent.json';

const defaultContent = JSON.stringify(defaultRenderContent, null, 2);
const hasValue = (value: unknown) => value !== undefined && value !== null && String(value).length > 0;

const props = defineProps<{ legacy?: boolean }>();
const endpoint = computed(() => props.legacy ? '/api/render' : '/api/render/v2');
const viewFields = computed(() => props.legacy ? fields2D.slice(0, 4) : fields2D);
const dialog = ref<HTMLDialogElement>();
const fullscreen = ref(false);
const trigger = ref<HTMLButtonElement>();
const responseSection = ref<HTMLElement>();
const tab = ref('form');
const responseTab = ref('body');
const imageUrl = ref('');
const imageSize = ref('');
const imageFailed = ref(false);
const copied = ref(false);
const busy = ref(false);
const error = ref('');
const response = ref<{ status: number; statusText: string; body: string; headers: string; elapsed: number }>();
const input = reactive<PlaygroundInput>({
  ...DEFAULT_PLAYGROUND_ENVIRONMENT, requestId: '',
  content: defaultContent, template: '', slideIndex: '', mode: 'auto',
  view2D: { left: '-10', right: '10', bottom: '-10', top: '10', scale: '', pixelRatio: '' },
  view3D: {}, offset: '', projection: '',
});
const cacheMessage = ref('Base URL 和 Authorization 修改后自动保存，供本站 Playground 共用。');
let restoringEnvironment = false;
function restoreEnvironment(environment: { baseUrl: string; authorization: string }) {
  restoringEnvironment = true;
  Object.assign(input, environment);
  restoringEnvironment = false;
}
watch(() => [input.baseUrl, input.authorization], () => {
  if (restoringEnvironment) return;
  cacheMessage.value = savePlaygroundEnvironment(input)
    ? 'Base URL 和 Authorization 已保存到当前浏览器，供本站 Playground 共用。'
    : '当前浏览器无法保存本地配置，本次仍可正常使用。';
}, { flush: 'sync' });
const preview = computed(() => {
  try { const request = buildRequest({ ...input, legacy: props.legacy }); return { request, curl: toCurl(request), error: '' }; }
  catch (e) { return { request: undefined, curl: '', error: (e as Error).message }; }
});
let controller: AbortController | undefined;
let isOpen = false;
function open() {
  if (isOpen) return;
  restoreEnvironment(loadPlaygroundEnvironment());
  isOpen = true;
  dialog.value?.show();
}
function closed() {
  if (!isOpen) return;
  isOpen = false;
  fullscreen.value = false;
  controller?.abort();
  nextTick(() => trigger.value?.focus());
}
function close() { dialog.value?.close(); }
async function importContent(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  try { input.content = await file.text(); error.value = ''; }
  catch { error.value = '无法读取文件，请重新选择或粘贴项目 JSON。'; }
  target.value = '';
}
async function copyCurl() {
  try { await navigator.clipboard.writeText(preview.value.curl); copied.value = true; }
  catch { error.value = '复制失败，请手动选择并复制 cURL。'; }
}
async function send() {
  if (busy.value) return;
  error.value = '';
  response.value = undefined;
  responseTab.value = 'body';
  imageUrl.value = '';
  imageSize.value = '';
  imageFailed.value = false;
  nextTick(() => responseSection.value?.scrollIntoView({ block: 'start' }));
  const request = preview.value.request;
  if (!request) { error.value = preview.value.error; return; }
  if (!/^Bearer\s+\S+$/i.test(input.authorization.trim())) { error.value = 'Authorization 请填写 Bearer <API_KEY>。'; return; }
  busy.value = true;
  controller = new AbortController();
  const started = performance.now();
  let timedOut = false;
  const timeout = window.setTimeout(() => { timedOut = true; controller?.abort(); }, 120000);
  try {
    const result = await fetch(request.url, { method: 'POST', headers: request.headers, body: request.body, signal: controller.signal, credentials: 'omit', redirect: 'error' });
    response.value = { status: result.status, statusText: result.statusText, body: '', headers: Array.from(result.headers, ([k, v]) => `${k}: ${v}`).join('\n'), elapsed: Math.round(performance.now() - started) };
    const raw = await result.text();
    try {
      const data = JSON.parse(raw);
      response.value.body = JSON.stringify(data, null, 2);
      const url = data?.data?.url ?? data?.url;
      if (result.ok && data?.success !== false && typeof url === 'string') {
        try {
          const parsedUrl = new URL(url);
          if (['http:', 'https:'].includes(parsedUrl.protocol)) {
            imageUrl.value = parsedUrl.href;
            const width = data?.data?.width ?? data?.width;
            const height = data?.data?.height ?? data?.height;
            if (typeof width === 'number' && Number.isFinite(width) && width > 0
              && typeof height === 'number' && Number.isFinite(height) && height > 0) {
              imageSize.value = `${width} × ${height} px`;
            }
            responseTab.value = 'image';
          }
        } catch { /* Keep the response body visible if the image URL is invalid. */ }
      }
    }
    catch { response.value.body = raw || '（空响应正文）'; }
    response.value.elapsed = Math.round(performance.now() - started);
  } catch {
    error.value = timedOut ? '请求超过 120 秒，已停止等待。' : controller.signal.aborted ? '已取消请求。' : '无法读取响应。请检查环境地址、网络连接及服务的 CORS 配置，也可复制 cURL 在终端调用。';
  } finally { clearTimeout(timeout); busy.value = false; controller = undefined; }
}
onBeforeUnmount(() => { controller?.abort(); });
</script>

<template>
  <div class="render-playground" data-no-track>
    <button ref="trigger" class="playground-trigger" type="button" aria-haspopup="dialog" @click="open">
      <span class="trigger-icon" aria-hidden="true">
        <svg viewBox="0 0 20 20" width="18" height="18" fill="none"><path d="m7 4.5 8 5.5-8 5.5V4.5Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg>
      </span>
      <span>体验</span>
      <svg class="trigger-arrow" aria-hidden="true" viewBox="0 0 20 20" width="18" height="18" fill="none"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </button>
    <dialog ref="dialog" class="playground" :class="{ 'is-fullscreen': fullscreen }" aria-modal="false" aria-labelledby="playground-title" @close="closed" @keydown.esc.stop="fullscreen ? fullscreen = false : close()">
      <div class="panel">
        <header class="panel-header">
          <div><span class="eyebrow">API PLAYGROUND</span><h2 id="playground-title">{{ legacy ? '旧版 PNG 接口' : '导出 PNG' }}</h2><p><b>POST</b> {{ endpoint }}</p></div>
          <div class="panel-actions">
            <button class="fullscreen-toggle" type="button" :aria-label="fullscreen ? '退出全屏' : '全屏'" :title="fullscreen ? '退出全屏' : '全屏'" :aria-pressed="fullscreen" @click="fullscreen = !fullscreen">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path v-if="fullscreen" d="M4 9h5V4m6 0v5h5M4 15h5v5m6 0v-5h5" />
                <path v-else d="M9 4H4v5m11-5h5v5M4 15v5h5m6 0h5v-5" />
              </svg>
            </button>
            <button class="close" type="button" aria-label="关闭 Playground" autofocus @click="close">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
          </div>
        </header>
        <div class="tabs" aria-label="请求视图">
          <button type="button" :aria-pressed="tab === 'form'" @click="tab = 'form'">请求配置</button>
          <button type="button" :aria-pressed="tab === 'curl'" @click="tab = 'curl'; copied = false">cURL</button>
        </div>
        <div class="panel-content">
          <div v-show="tab === 'form'">
            <fieldset><legend>环境配置</legend>
              <p class="hint" role="status">{{ cacheMessage }}</p>
              <label><span class="field-name">Base URL</span><button v-if="hasValue(input.baseUrl)" class="field-reset" type="button" aria-label="重置 baseUrl" @click.prevent="input.baseUrl = DEFAULT_PLAYGROUND_ENVIRONMENT.baseUrl">重置</button><input v-model="input.baseUrl" type="url" spellcheck="false" /><small>服务地址，请求路径固定为 {{ endpoint }}。</small></label>
            </fieldset>
            <fieldset><legend>请求头配置</legend>
              <label><span class="field-name">Authorization</span> <em class="required">必填</em><button v-if="hasValue(input.authorization)" class="field-reset" type="button" aria-label="重置 authorization" @click.prevent="input.authorization = ''">重置</button><input v-model="input.authorization" type="password" placeholder="Bearer djo_xxx" autocomplete="off" spellcheck="false" /><small>Bearer API Key，格式为 Bearer &lt;API_KEY&gt;。<a href="/api/auth.html" target="_blank" rel="noopener noreferrer">如何鉴权？</a></small></label>
              <label>Content-Type<input value="application/json" readonly /><small>接口固定接收 application/json。</small></label>
              <label><span class="field-name">x-request-id</span> <em>可选</em><button v-if="hasValue(input.requestId)" class="field-reset" type="button" aria-label="重置 requestId" @click.prevent="input.requestId = ''">重置</button><input v-model="input.requestId" placeholder="留空自动生成 UUID" /><small>业务请求标识，省略时由服务生成。</small></label>
            </fieldset>
            <fieldset><legend>请求体配置</legend>
              <label><span class="field-name">content</span> <em><span class="required">必填</span> · FileContentLatest</em><span class="content-actions"><button class="field-reset" type="button" title="恢复默认项目 content" @click.prevent="input.content = defaultContent">重置</button><button v-if="hasValue(input.content)" class="field-reset" type="button" aria-label="清空 content" @click.prevent="input.content = ''">清空</button></span><small>完整项目内容，对应文档中的 content。粘贴 JSON 或导入 .algeo 文件。</small><textarea v-model="input.content" rows="8" placeholder="粘贴完整项目 JSON" spellcheck="false" /></label>
              <label class="file-label">导入项目<input type="file" accept=".algeo,.json,application/json" @change="importContent" /></label>
              <label><span class="field-name">slideIndex</span> <em>可选 · number</em><button v-if="hasValue(input.slideIndex)" class="field-reset" type="button" aria-label="重置 slideIndex" @click.prevent="input.slideIndex = ''">重置</button><input v-model="input.slideIndex" type="number" min="1" step="1" placeholder="1" /><small>从 1 开始的画板序号，留空使用默认值 1。</small></label>
              <label><span class="field-name">template</span> <em>可选 · object</em><button v-if="hasValue(input.template)" class="field-reset" type="button" aria-label="重置 template" @click.prevent="input.template = ''">重置</button><textarea v-model="input.template" rows="3" placeholder="留空沿用目标画板样式" spellcheck="false" /><small>渲染母版 JSON 对象，可从大角几何母版页面下载。</small></label>
              <label><span class="field-name">视图模式</span><button v-if="input.mode !== 'auto'" class="field-reset" type="button" aria-label="重置视图模式" @click.prevent="input.mode = 'auto'">重置</button><select v-model="input.mode"><option value="auto">自动 · 使用画板保存的相机</option><option value="2d">{{ legacy ? 'viewBound' : 'view2D' }} · 指定 2D 视口</option><option v-if="!legacy" value="3d">view3D · 指定 3D 相机</option></select><small>{{ legacy ? '仅支持 2D PNG；自动模式省略 viewBound，使用画板保存的视口。' : 'view2D 与 view3D 互斥；自动模式不发送这两个字段。' }}</small></label>
              <div v-if="input.mode === '2d'" class="fields">
                <label v-for="field in viewFields" :key="field.key"><span class="field-name">{{ legacy ? 'viewBound' : 'view2D' }}.{{ field.key }}</span><button v-if="hasValue(input.view2D[field.key])" class="field-reset" type="button" :aria-label="'重置 ' + field.key" @click.prevent="input.view2D[field.key] = ''">重置</button><input v-model="input.view2D[field.key]" type="number" step="any" :placeholder="field.placeholder" /><small>{{ field.help }}</small></label>
              </div>
              <div v-if="legacy" class="fields">
                <label v-for="field in fields2D.slice(4)" :key="field.key"><span class="field-name">{{ field.key }}</span> <em>可选 · number</em><button v-if="hasValue(input.view2D[field.key])" class="field-reset" type="button" :aria-label="'重置 ' + field.key" @click.prevent="input.view2D[field.key] = ''">重置</button><input v-model="input.view2D[field.key]" type="number" step="any" :placeholder="field.placeholder" /><small>{{ field.help }}</small></label>
              </div>
              <template v-if="!legacy && input.mode === '3d'">
                <p class="hint">强制 3D 渲染。目标画板需为 3D 画板；所有相机属性均可选。</p>
                <label><span class="field-name">view3D.offset</span><button v-if="hasValue(input.offset)" class="field-reset" type="button" aria-label="重置 offset" @click.prevent="input.offset = ''">重置</button><input v-model="input.offset" placeholder="[0, 0, 0]" /><small>相机中心，[x, y, z] 数组；留空沿用画板。</small></label>
                <label><span class="field-name">view3D.projection</span><button v-if="hasValue(input.projection)" class="field-reset" type="button" aria-label="重置 projection" @click.prevent="input.projection = ''">重置</button><select v-model="input.projection"><option value="">沿用画板</option><option value="orthographic">orthographic · 正交投影</option><option value="perspective">perspective · 透视投影</option><option value="oblique">oblique · 斜投影</option></select><small>投影模式，留空沿用目标画板保存值。</small></label>
                <div class="fields"><label v-for="field in fields3D" :key="field.key"><span class="field-name">view3D.{{ field.key }}</span><button v-if="hasValue(input.view3D[field.key])" class="field-reset" type="button" :aria-label="'重置 ' + field.key" @click.prevent="input.view3D[field.key] = ''">重置</button><input v-model="input.view3D[field.key]" type="number" step="any" :placeholder="field.placeholder" /><small>{{ field.help }}</small></label></div>
              </template>
            </fieldset>
          </div>
          <section v-if="tab === 'curl'" class="curl-view" aria-label="cURL 请求">
            <div class="section-heading"><h3>cURL</h3><button type="button" :disabled="!preview.curl" @click="copyCurl">{{ copied ? '已复制' : '复制' }}</button></div>
            <p class="hint">与当前配置一致，包含填写的 Authorization。</p>
            <p v-if="preview.error" class="hint">{{ preview.error }} 请在请求配置中补全。</p>
            <pre v-else><code>{{ preview.curl }}</code></pre>
          </section>
          <section ref="responseSection" class="response" aria-label="请求响应" :aria-busy="busy">
            <div class="section-heading"><h3>响应</h3><span v-if="response" class="status" :class="{ failed: response.status >= 400 }">HTTP {{ response.status }} {{ response.statusText }} · {{ response.elapsed }} ms</span></div>
            <p v-if="error" class="error" role="alert">{{ error }}</p>
            <p v-if="busy" class="hint" role="status">正在等待响应…</p>
            <template v-if="response">
              <div class="tabs"><button v-if="imageUrl" type="button" :aria-pressed="responseTab === 'image'" @click="responseTab = 'image'">图片</button><button type="button" :aria-pressed="responseTab === 'body'" @click="responseTab = 'body'">响应正文</button><button type="button" :aria-pressed="responseTab === 'headers'" @click="responseTab = 'headers'">响应头</button></div>
              <div v-if="responseTab === 'image' && imageUrl" class="response-image">
                <div v-if="!imageFailed" class="image-frame">
                  <img :src="imageUrl" alt="PNG 渲染结果" referrerpolicy="no-referrer" @error="imageFailed = true" />
                  <span v-if="imageSize" class="image-size">{{ imageSize }}</span>
                </div>
                <p v-else class="hint" role="status">图片加载失败，请切换到响应正文查看返回地址。</p>
              </div>
              <pre v-else><code>{{ responseTab === 'body' ? response.body : response.headers || '（无可读取的响应头）' }}</code></pre>
            </template>
            <p v-else-if="!busy && !error" class="empty">发送请求后，在这里查看 HTTP 状态码和响应内容。</p>
          </section>
        </div>
        <footer><span>POST {{ endpoint }}</span><button v-if="busy" type="button" @click="controller?.abort()">取消</button><button class="launch" type="button" :disabled="busy" @click="send">{{ busy ? '发送中…' : '发送请求' }}</button></footer>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.launch { padding: 9px 20px; border-radius: 8px; background: var(--vp-c-brand-1); color: var(--vp-c-white); font-weight: 600; cursor: pointer; }
.playground-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  margin: 20px 0 16px;
  padding: 6px 12px 6px 8px;
  border: 1px solid rgb(255 255 255 / 18%);
  border-radius: 8px;
  background: linear-gradient(135deg, #008c6c, #006c58);
  color: #fff;
  box-shadow: 0 3px 8px rgb(0 108 88 / 16%), inset 0 1px 0 rgb(255 255 255 / 12%);
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
}
.trigger-icon { display: grid; place-items: center; width: 22px; height: 22px; border: 1px solid rgb(255 255 255 / 18%); border-radius: 6px; background: rgb(255 255 255 / 12%); }
.trigger-icon svg, .trigger-arrow { width: 16px; height: 16px; }
.trigger-arrow { margin-left: 4px; opacity: .75; transition: transform .18s ease, opacity .18s ease; }
@media (hover: hover) {
  .playground-trigger:hover { transform: translateY(-1px); filter: brightness(1.08); box-shadow: 0 6px 16px rgb(0 108 88 / 24%), inset 0 1px 0 rgb(255 255 255 / 16%); }
  .playground-trigger:hover .trigger-arrow { transform: translateX(2px); opacity: 1; }
}
.playground-trigger:active { transform: translateY(0); filter: brightness(.96); box-shadow: 0 1px 4px rgb(0 108 88 / 16%); }
.playground { position: fixed; inset: 0 0 0 auto; width: min(680px, 100vw); max-width: 100vw; height: 100dvh; max-height: 100dvh; margin: 0; padding: 0; border: 0; border-left: 1px solid var(--vp-c-divider); background: var(--vp-c-bg); color: var(--vp-c-text-1); box-shadow: -12px 0 48px #0002; font-size: 14px; line-height: 1.6; }
.playground { z-index: 100; }
.playground.is-fullscreen { width: 100vw; border-left: 0; }
.playground[open] { animation: slide-in .2s ease-out; }
.panel { display: flex; flex-direction: column; height: 100%; }
.panel-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px 28px 16px; }
.eyebrow { color: var(--vp-c-text-3); font-size: 11px; font-weight: 600; letter-spacing: .12em; }
.playground h2 { margin: 4px 0 8px; padding: 0; border: 0; font-size: 24px; }
.playground h3 { margin: 0; font-size: 16px; }
.panel-header p { margin: 0; font-family: var(--vp-font-family-mono); }
.panel-header b { color: var(--vp-c-brand-1); margin-right: 8px; }
.close, .fullscreen-toggle { display: grid; place-items: center; width: 40px; height: 40px; padding: 0; line-height: 1; border-radius: 50%; cursor: pointer; }
.panel-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.panel-actions svg { display: block; }
.panel-actions button { color: var(--vp-c-text-2); transition: background-color .15s ease; }
.panel-actions button:hover { background: rgba(128, 128, 128, .12); }
@media (prefers-reduced-motion: reduce) { .panel-actions button { transition: none; } }
.tabs { display: flex; gap: 20px; padding: 0 28px; border-bottom: 1px solid var(--vp-c-divider); }
.tabs button { padding: 10px 0; border-bottom: 2px solid transparent; color: var(--vp-c-text-2); cursor: pointer; }
.tabs button[aria-pressed="true"] { color: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); }
.panel-content { flex: 1; overflow-y: auto; overscroll-behavior: contain; padding: 24px 28px; }
fieldset { min-width: 0; margin: 0 0 24px; padding: 0; border: 0; }
legend { width: 100%; font-size: 16px; font-weight: 600; margin-bottom: 16px; border-bottom: 1px solid var(--vp-c-divider); padding-bottom: 10px; }
.field-name { color: #2563eb; }
.field-reset { float: right; padding: 0 4px; color: var(--vp-c-text-2); font-size: 12px; font-weight: 400; cursor: pointer; border-radius: 4px; }
.field-reset:hover { color: var(--vp-c-brand-1); background: var(--vp-c-bg-soft); }
.content-actions { float: right; display: inline-flex; gap: 8px; }
.content-actions .field-reset { float: none; }
:global(.dark) .field-name { color: #60a5fa; }
label { display: block; font-weight: 500; margin-bottom: 16px; }
em { margin-left: 6px; font-style: normal; font-size: 12px; font-weight: 400; color: var(--vp-c-text-3); }
small, .hint { display: block; color: var(--vp-c-text-2); font-size: 12px; font-weight: 400; line-height: 1.7; margin: 6px 0; }
input, textarea, select { display: block; box-sizing: border-box; width: 100%; margin-top: 7px; padding: 9px 12px; border: 1px solid var(--vp-c-divider); border-radius: 6px; background: var(--vp-c-bg-alt); color: var(--vp-c-text-1); font: inherit; }
textarea { resize: vertical; font-family: var(--vp-font-family-mono); font-size: 12px; }
input[readonly] { color: var(--vp-c-text-3); }
.fields { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
.fields label { min-width: 0; }
pre { margin: 12px 0; padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg-soft); overflow: auto; max-height: 460px; font-size: 12px; line-height: 1.7; }
pre code { padding: 0; color: inherit; background: transparent; white-space: pre; }
.section-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.section-heading button { color: var(--vp-c-brand-1); cursor: pointer; }
.response { margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--vp-c-divider); }
.response-image { text-align: center; margin-top: 12px; padding: 16px; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg-soft); }
.image-frame { position: relative; display: inline-block; max-width: 100%; vertical-align: top; }
.image-size { position: absolute; left: 8px; bottom: 8px; padding: 3px 7px; border-radius: 4px; background: rgb(0 0 0 / 65%); color: #fff; font-size: 12px; line-height: 1.5; white-space: nowrap; pointer-events: none; }
.response-image img { display: block; max-width: 100%; max-height: 460px; width: auto; height: auto; margin: 0 auto; object-fit: contain; }
.response .tabs { padding: 0; margin-top: 12px; }
.status { font-family: var(--vp-font-family-mono); font-size: 12px; color: var(--vp-c-brand-1); }
.required, .failed, .error { color: var(--vp-c-danger-1); }
.error { padding: 12px; background: var(--vp-c-danger-soft); border-radius: 6px; }
.empty { padding: 24px 12px; text-align: center; color: var(--vp-c-text-3); background: var(--vp-c-bg-soft); border-radius: 8px; }
footer { display: flex; align-items: center; gap: 16px; padding: 16px 28px; border-top: 1px solid var(--vp-c-divider); }
footer span { flex: 1; font-size: 12px; color: var(--vp-c-text-2); }
button:disabled { opacity: .5; cursor: not-allowed; }
button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
@keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
@media (prefers-reduced-motion: reduce) { .playground[open] { animation: none; } .playground-trigger, .trigger-arrow { transition: none; transform: none !important; } }
@media (max-width: 480px) { .panel-header, .panel-content { padding: 20px; } .tabs { padding: 0 20px; } .fields { grid-template-columns: 1fr; } footer { padding: 12px 20px; } }
</style>
