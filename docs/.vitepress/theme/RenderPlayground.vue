<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { DEFAULT_PLAYGROUND_ENVIRONMENT, loadPlaygroundEnvironment, savePlaygroundEnvironment } from './playgroundEnvironment';
import { buildRequest, toCurl, type PlaygroundInput } from './renderPlayground';
import { getRenderPlaygroundConfig, type RenderPlaygroundVariant } from './renderPlaygroundConfig';
import defaultRenderContent from './defaultRenderContent.json';

const defaultContent = JSON.stringify(defaultRenderContent, null, 2);
const hasValue = (value: unknown) => value !== undefined && value !== null && String(value).length > 0;

const props = withDefaults(defineProps<{ variant?: RenderPlaygroundVariant }>(), { variant: 'png-v2' });
const playground = computed(() => getRenderPlaygroundConfig(props.variant));
const supports3D = computed(() => playground.value.modes.includes('3d'));
const view3DFields = computed(() => playground.value.view3D?.fields ?? []);
const viewModeHint = computed(() => supports3D.value
  ? 'view2D 与 view3D 互斥；自动模式不发送这两个字段。'
  : `仅支持 2D ${playground.value.outputLabel}；自动模式省略 ${playground.value.view2D.requestKey}，使用画板保存的视口。`);
const fieldId = (name: string) => `render-${props.variant}-${name}`;
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
  content: defaultContent, template: '', slideIndex: '', transparent: false, mode: 'auto',
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
  try { const request = buildRequest({ ...input, variant: props.variant }); return { request, curl: toCurl(request), error: '' }; }
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
          <div><span class="eyebrow">API PLAYGROUND</span><h2 id="playground-title">{{ playground.title }}</h2><p><b>POST</b> {{ playground.endpoint }}</p></div>
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
              <div class="field-control"><label class="field-name" :for="fieldId('baseUrl')">Base URL</label><button v-if="hasValue(input.baseUrl)" class="field-reset" type="button" aria-label="重置 baseUrl" @click.prevent="input.baseUrl = DEFAULT_PLAYGROUND_ENVIRONMENT.baseUrl">重置</button><input :id="fieldId('baseUrl')" v-model="input.baseUrl" type="url" spellcheck="false" /><small>服务地址，请求路径固定为 {{ playground.endpoint }}。</small></div>
            </fieldset>
            <fieldset><legend>请求头配置</legend>
              <div class="field-control"><label class="field-name" :for="fieldId('authorization')">Authorization</label> <em class="required">必填</em><button v-if="hasValue(input.authorization)" class="field-reset" type="button" aria-label="重置 authorization" @click.prevent="input.authorization = ''">重置</button><input :id="fieldId('authorization')" v-model="input.authorization" type="password" placeholder="Bearer djo_xxx" autocomplete="off" spellcheck="false" /><small>Bearer API Key，格式为 Bearer &lt;API_KEY&gt;。<a href="/api/auth.html" target="_blank" rel="noopener noreferrer">如何鉴权？</a></small></div>
              <label>Content-Type<input value="application/json" readonly /><small>接口固定接收 application/json。</small></label>
              <div class="field-control"><label class="field-name" :for="fieldId('requestId')">x-request-id</label> <em>可选</em><button v-if="hasValue(input.requestId)" class="field-reset" type="button" aria-label="重置 requestId" @click.prevent="input.requestId = ''">重置</button><input :id="fieldId('requestId')" v-model="input.requestId" placeholder="留空自动生成 UUID" /><small>业务请求标识，省略时由服务生成。</small></div>
            </fieldset>
            <fieldset><legend>请求体配置</legend>
              <div class="field-control"><label class="field-name" :for="fieldId('content')">content</label> <em><span class="required">必填</span> · FileContentLatest</em><span class="content-actions"><button class="field-reset" type="button" title="恢复默认项目 content" @click.prevent="input.content = defaultContent">重置</button><button v-if="hasValue(input.content)" class="field-reset" type="button" aria-label="清空 content" @click.prevent="input.content = ''">清空</button></span><small>完整项目内容，对应文档中的 content。粘贴 JSON 或导入 .algeo 文件。</small><textarea :id="fieldId('content')" v-model="input.content" rows="8" placeholder="粘贴完整项目 JSON" spellcheck="false" /></div>
              <label class="file-label">导入项目<input type="file" accept=".algeo,.json,application/json" @change="importContent" /></label>
              <div class="field-control"><label class="field-name" :for="fieldId('slideIndex')">slideIndex</label> <em>可选 · number</em><button v-if="hasValue(input.slideIndex)" class="field-reset" type="button" aria-label="重置 slideIndex" @click.prevent="input.slideIndex = ''">重置</button><input :id="fieldId('slideIndex')" v-model="input.slideIndex" type="number" min="1" step="1" placeholder="1" /><small>从 1 开始的画板序号，留空使用默认值 1。</small></div>
              <div class="field-control"><label class="field-name" :for="fieldId('template')">template</label> <em>可选 · object</em><button v-if="hasValue(input.template)" class="field-reset" type="button" aria-label="重置 template" @click.prevent="input.template = ''">重置</button><textarea :id="fieldId('template')" v-model="input.template" rows="3" placeholder="留空沿用目标画板样式" spellcheck="false" /><small>渲染母版 JSON 对象，可从大角几何母版页面下载。</small></div>
              <label class="checkbox-field"><input v-model="input.transparent" type="checkbox" /><span><span class="field-name">transparent</span> <em>可选 · boolean</em><small>是否跳过背景色填充。</small></span></label>
              <div class="field-control"><label class="field-name" :for="fieldId('mode')">视图模式</label><button v-if="input.mode !== 'auto'" class="field-reset" type="button" aria-label="重置视图模式" @click.prevent="input.mode = 'auto'">重置</button><select :id="fieldId('mode')" v-model="input.mode"><option value="auto">自动 · 使用画板保存的相机</option><option value="2d">{{ playground.view2D.requestKey }} · 指定 2D 视口</option><option v-if="supports3D" value="3d">view3D · 指定 3D 相机</option></select><small>{{ viewModeHint }}</small></div>
              <div v-if="input.mode === '2d'" class="fields">
                <div class="field-control" v-for="field in playground.view2D.fields" :key="field.key"><label class="field-name" :for="fieldId('view2D.' + field.key)">{{ playground.view2D.requestKey }}.{{ field.key }}</label><button v-if="hasValue(input.view2D[field.key])" class="field-reset" type="button" :aria-label="'重置 ' + field.key" @click.prevent="input.view2D[field.key] = ''">重置</button><input :id="fieldId('view2D.' + field.key)" v-model="input.view2D[field.key]" type="number" step="any" :placeholder="field.placeholder" /><small>{{ field.help }}</small></div>
              </div>
              <div v-if="playground.view2D.topLevelFields.length" class="fields">
                <div class="field-control" v-for="field in playground.view2D.topLevelFields" :key="field.key"><label class="field-name" :for="fieldId('view2D.' + field.key)">{{ field.key }}</label> <em>可选 · number</em><button v-if="hasValue(input.view2D[field.key])" class="field-reset" type="button" :aria-label="'重置 ' + field.key" @click.prevent="input.view2D[field.key] = ''">重置</button><input :id="fieldId('view2D.' + field.key)" v-model="input.view2D[field.key]" type="number" step="any" :placeholder="field.placeholder" /><small>{{ field.help }}</small></div>
              </div>
              <template v-if="playground.view3D && input.mode === '3d'">
                <p class="hint">强制 3D 渲染。目标画板需为 3D 画板；所有相机属性均可选。</p>
                <div class="field-control"><label class="field-name" :for="fieldId('offset')">view3D.offset</label><button v-if="hasValue(input.offset)" class="field-reset" type="button" aria-label="重置 offset" @click.prevent="input.offset = ''">重置</button><input :id="fieldId('offset')" v-model="input.offset" placeholder="[0, 0, 0]" /><small>相机中心，[x, y, z] 数组；留空沿用画板。</small></div>
                <div class="field-control"><label class="field-name" :for="fieldId('projection')">view3D.projection</label><button v-if="hasValue(input.projection)" class="field-reset" type="button" aria-label="重置 projection" @click.prevent="input.projection = ''">重置</button><select :id="fieldId('projection')" v-model="input.projection"><option value="">沿用画板</option><option value="orthographic">orthographic · 正交投影</option><option value="perspective">perspective · 透视投影</option><option value="oblique">oblique · 斜投影</option></select><small>投影模式，留空沿用目标画板保存值。</small></div>
                <div class="fields"><div class="field-control" v-for="field in view3DFields" :key="field.key"><label class="field-name" :for="fieldId('view3D.' + field.key)">view3D.{{ field.key }}</label><button v-if="hasValue(input.view3D[field.key])" class="field-reset" type="button" :aria-label="'重置 ' + field.key" @click.prevent="input.view3D[field.key] = ''">重置</button><input :id="fieldId('view3D.' + field.key)" v-model="input.view3D[field.key]" type="number" step="any" :placeholder="field.placeholder" /><small>{{ field.help }}</small></div></div>
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
                  <img :src="imageUrl" :alt="`${playground.outputLabel} 渲染结果`" referrerpolicy="no-referrer" @error="imageFailed = true" />
                  <span v-if="imageSize" class="image-size">{{ imageSize }}</span>
                </div>
                <p v-else class="hint" role="status">图片加载失败，请切换到响应正文查看返回地址。</p>
              </div>
              <pre v-else><code>{{ responseTab === 'body' ? response.body : response.headers || '（无可读取的响应头）' }}</code></pre>
            </template>
            <p v-else-if="!busy && !error" class="empty">发送请求后，在这里查看 HTTP 状态码和响应内容。</p>
          </section>
        </div>
        <footer><span>POST {{ playground.endpoint }}</span><button v-if="busy" type="button" @click="controller?.abort()">取消</button><button class="launch" type="button" :disabled="busy" @click="send">{{ busy ? '发送中…' : '发送请求' }}</button></footer>
      </div>
    </dialog>
  </div>
</template>

<style scoped src="./playground.css"></style>
