<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { DEFAULT_PLAYGROUND_ENVIRONMENT, loadPlaygroundEnvironment, savePlaygroundEnvironment } from './playgroundEnvironment';
import {
  AGENT_MODELS,
  AGENT_TASK_STATUSES,
  buildAgentQueryRequest,
  toAgentQueryCurl,
  type AgentQueryInput,
  buildAgentRequest,
  getAgentPollInterval,
  isAgentTerminalStatus,
  MAX_AGENT_IMAGES,
  resolveArtifactUrl,
  toAgentCurl,
  type AgentPlaygroundInput,
} from './agentPlayground';

const props = withDefaults(defineProps<{ variant?: 'create' | 'tasks' | 'detail' }>(), { variant: 'create' });
const isCreate = computed(() => props.variant === 'create');
const queryVariant = computed(() => props.variant === 'detail' || input.taskId.trim() ? 'detail' : 'tasks');
const playground = computed(() => props.variant === 'tasks'
  ? { title: '任务列表', method: 'GET', endpoint: queryVariant.value === 'detail' ? '/api/agent/tasks/:taskId' : '/api/agent/tasks' }
  : props.variant === 'detail'
    ? { title: '任务详情', method: 'GET', endpoint: '/api/agent/tasks/:taskId' }
    : { title: '智能生图', method: 'POST', endpoint: '/api/agent/run' });
const progressTitle = computed(() => isCreate.value
  ? (taskId.value ? '正在轮询任务详情…' : '正在创建任务…')
  : (queryVariant.value === 'tasks' ? '正在查询任务列表…' : '正在查询任务详情…'));
const fieldId = (name: string) => `agent-playground-${props.variant}-${name}`;
const dialog = ref<HTMLDialogElement>();
const trigger = ref<HTMLButtonElement>();
const responseSection = ref<HTMLElement>();
const fullscreen = ref(false);
const tab = ref('form');
const responseTab = ref('body');
const copied = ref(false);
const busy = ref(false);
const error = ref('');
const taskStatus = ref('');
const taskId = ref('');
const artifactUrl = ref('');
const response = ref<{ status: number; statusText: string; body: string; headers: string; elapsed: number }>();
const imagePreviews = ref<{ file: File; url: string }[]>([]);
const input = reactive<AgentPlaygroundInput & AgentQueryInput>({
  ...DEFAULT_PLAYGROUND_ENVIRONMENT,
  model: 'dinogeo-1-pro',
  content: '',
  template: '',
  images: [],
  page: '',
  pageSize: '',
  status: '',
  taskId: '',
});
const cacheMessage = ref('Base URL 和 Authorization 修改后自动保存，供本站 Playground 共用。');
const preview = computed(() => {
  try { return { curl: props.variant === 'create' ? toAgentCurl(input) : toAgentQueryCurl(input, queryVariant.value), error: '' }; }
  catch (cause) { return { curl: '', error: (cause as Error).message }; }
});
let restoringEnvironment = false;
let controller: AbortController | undefined;
let isOpen = false;
watch(() => [input.baseUrl, input.authorization], () => {
  if (restoringEnvironment) return;
  cacheMessage.value = savePlaygroundEnvironment(input)
    ? 'Base URL 和 Authorization 已保存到当前浏览器，供本站 Playground 共用。'
    : '当前浏览器无法保存本地配置，本次仍可正常使用。';
}, { flush: 'sync' });
watch(() => input.images.slice(), (files, previous) => {
  for (const item of imagePreviews.value) URL.revokeObjectURL(item.url);
  imagePreviews.value = files.map(file => ({ file, url: URL.createObjectURL(file) }));
}, { immediate: true });

function restoreEnvironment(environment: { baseUrl: string; authorization: string }) {
  restoringEnvironment = true;
  Object.assign(input, environment);
  restoringEnvironment = false;
}
function open() {
  if (isOpen) return;
  restoreEnvironment(loadPlaygroundEnvironment());
  isOpen = true;
  dialog.value?.show();
}
function close() { dialog.value?.close(); }
function closed() {
  if (!isOpen) return;
  isOpen = false;
  fullscreen.value = false;
  controller?.abort();
  nextTick(() => trigger.value?.focus());
}
function selectImages(event: Event) {
  const target = event.target as HTMLInputElement;
  const selected = Array.from(target.files ?? []);
  if (input.images.length + selected.length > MAX_AGENT_IMAGES) {
    error.value = `最多上传 ${MAX_AGENT_IMAGES} 张图片；当前已选择 ${input.images.length} 张。`;
  } else {
    input.images.push(...selected);
    error.value = '';
  }
  target.value = '';
}
function removeImage(index: number) {
  input.images.splice(index, 1);
}
async function copyCurl() {
  try { await navigator.clipboard.writeText(preview.value.curl); copied.value = true; }
  catch { error.value = '复制失败，请手动选择并复制 cURL。'; }
}
function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}
async function readResponse(result: Response, started: number) {
  const raw = await result.text();
  let data: any;
  try {
    data = JSON.parse(raw);
    response.value = {
      status: result.status,
      statusText: result.statusText,
      body: JSON.stringify(data, null, 2),
      headers: Array.from(result.headers, ([key, value]) => `${key}: ${value}`).join('\n'),
      elapsed: Math.round(performance.now() - started),
    };
  } catch {
    data = undefined;
    response.value = {
      status: result.status,
      statusText: result.statusText,
      body: raw || '（空响应正文）',
      headers: Array.from(result.headers, ([key, value]) => `${key}: ${value}`).join('\n'),
      elapsed: Math.round(performance.now() - started),
    };
  }
  return data;
}
async function send() {
  if (busy.value) return;
  error.value = '';
  response.value = undefined;
  taskStatus.value = '';
  taskId.value = '';
  artifactUrl.value = '';
  responseTab.value = 'body';
  nextTick(() => responseSection.value?.scrollIntoView({ block: 'start' }));
  if (props.variant !== 'create') {
    await sendQuery(queryVariant.value);
    return;
  }
  let request: ReturnType<typeof buildAgentRequest>;
  try {
    request = buildAgentRequest(input);
  } catch (cause) {
    error.value = (cause as Error).message;
    return;
  }
  if (!/^Bearer\s+\S+$/i.test(input.authorization.trim())) {
    error.value = 'Authorization 请填写 Bearer <API_KEY>。';
    return;
  }

  busy.value = true;
  controller = new AbortController();
  const signal = controller.signal;
  const started = performance.now();
  let timedOut = false;
  const timeout = window.setTimeout(() => { timedOut = true; controller?.abort(); }, 10 * 60 * 1000);
  try {
    const createdResponse = await fetch(request.url, {
      method: 'POST', headers: request.headers, body: request.formData,
      signal, credentials: 'omit', redirect: 'error',
    });
    const created = await readResponse(createdResponse, started);
    if (!createdResponse.ok) throw new Error(`创建任务失败（HTTP ${createdResponse.status}）。`);
    if (created?.success === false || typeof created?.taskId !== 'string' || !created.taskId) {
      throw new Error('创建任务响应缺少有效的 taskId。');
    }
    taskId.value = created.taskId;
    taskStatus.value = created.status || 'created';
    const pollingStarted = performance.now();
    const baseUrl = new URL(input.baseUrl.trim()).href.replace(/\/$/, '');

    while (!signal.aborted) {
      const elapsed = performance.now() - pollingStarted;
      if (elapsed >= 10 * 60 * 1000) {
        throw new Error('任务查询超过 10 分钟，已停止轮询。');
      }
      await wait(Math.min(getAgentPollInterval(elapsed), 10 * 60 * 1000 - elapsed), signal);
      const detailResponse = await fetch(`${baseUrl}/api/agent/tasks/${encodeURIComponent(created.taskId)}`, {
        headers: request.headers, signal, credentials: 'omit', redirect: 'error',
      });
      const detail = await readResponse(detailResponse, started);
      if (!detailResponse.ok) throw new Error(`查询任务失败（HTTP ${detailResponse.status}）。`);
      if (!detail?.task || typeof detail.task.status !== 'string') {
        throw new Error('任务详情响应缺少有效的 task.status。');
      }
      const task = detail.task;
      taskStatus.value = task.status;
      if (!isAgentTerminalStatus(task.status)) continue;
      if (task.status === 'finished') {
        artifactUrl.value = resolveArtifactUrl(task.artifactUrl, baseUrl) ?? '';
        if (!artifactUrl.value) error.value = '任务已完成，但未返回有效的 HTTP(S) artifactUrl。';
      } else {
        error.value = task.error || task.message || '生图任务执行失败。';
      }
      break;
    }
  } catch (cause) {
    if (timedOut) error.value = '任务查询超过 10 分钟，已停止等待。';
    else if (signal.aborted) error.value = '已取消请求。';
    else error.value = cause instanceof Error
      ? `${cause.message} 请检查服务地址、网络连接及 CORS 配置，也可复制 cURL 在终端调用。`
      : '无法读取响应。请检查服务地址、网络连接及 CORS 配置。';
  } finally {
    window.clearTimeout(timeout);
    busy.value = false;
    controller = undefined;
  }
}
async function sendQuery(variant: 'tasks' | 'detail') {
  let request: ReturnType<typeof buildAgentQueryRequest>;
  try {
    request = buildAgentQueryRequest(input, variant);
    if (!/^Bearer\s+\S+$/i.test(input.authorization.trim())) {
      throw new Error('Authorization 请填写 Bearer <API_KEY>。');
    }
  } catch (cause) {
    error.value = (cause as Error).message;
    return;
  }

  busy.value = true;
  controller = new AbortController();
  const signal = controller.signal;
  const started = performance.now();
  let timedOut = false;
  const timeout = window.setTimeout(() => { timedOut = true; controller?.abort(); }, 60_000);
  try {
    const result = await fetch(request.url, {
      method: 'GET', headers: request.headers, signal, credentials: 'omit', redirect: 'error',
    });
    const data = await readResponse(result, started);
    if (!result.ok || data?.success === false) {
      error.value = `查询失败（HTTP ${result.status}）。请查看响应正文。`;
      return;
    }
    if (variant === 'detail') {
      if (!data?.task || typeof data.task.status !== 'string') {
        error.value = '任务详情响应缺少有效的 task.status。';
        return;
      }
      taskId.value = data.task.taskId || input.taskId.trim();
      taskStatus.value = data.task.status;
      if (data.task.status === 'finished') {
        artifactUrl.value = resolveArtifactUrl(data.task.artifactUrl, input.baseUrl.trim()) ?? '';
      }
    }
  } catch (cause) {
    error.value = timedOut ? '查询超过 60 秒，已停止等待。'
      : signal.aborted ? '已取消请求。'
      : '查询失败，请检查服务地址、网络连接及 CORS 配置，也可复制 cURL 在终端调用。';
  } finally {
    window.clearTimeout(timeout);
    busy.value = false;
    controller = undefined;
  }
}
onBeforeUnmount(() => {
  controller?.abort();
  for (const item of imagePreviews.value) URL.revokeObjectURL(item.url);
});
</script>

<template>
  <div class="agent-playground" data-no-track>
    <button ref="trigger" class="playground-trigger" type="button" aria-haspopup="dialog" @click="open">
      <span class="trigger-icon" aria-hidden="true"><svg viewBox="0 0 20 20" width="18" height="18" fill="none"><path d="m7 4.5 8 5.5-8 5.5V4.5Z" fill="currentColor" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg></span>
      <span>体验</span>
      <svg class="trigger-arrow" aria-hidden="true" viewBox="0 0 20 20" width="18" height="18" fill="none"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
    </button>
    <dialog ref="dialog" class="playground" :class="{ 'is-fullscreen': fullscreen }" aria-modal="false" :aria-labelledby="fieldId('title')" @close="closed" @keydown.esc.stop="fullscreen ? fullscreen = false : close()">
      <div class="panel">
        <header class="panel-header">
          <div><span class="eyebrow">API PLAYGROUND</span><h2 :id="fieldId('title')">{{ playground.title }}</h2><p><b>{{ playground.method }}</b> {{ playground.endpoint }}</p></div>
          <div class="panel-actions">
            <button class="fullscreen-toggle" type="button" :aria-label="fullscreen ? '退出全屏' : '全屏'" :title="fullscreen ? '退出全屏' : '全屏'" :aria-pressed="fullscreen" @click="fullscreen = !fullscreen">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path v-if="fullscreen" d="M4 9h5V4m6 0v5h5M4 15h5v5m6 0v-5h5" /><path v-else d="M9 4H4v5m11-5h5v5M4 15v5h5m6 0h5v-5" /></svg>
            </button>
            <button class="close" type="button" aria-label="关闭 Playground" autofocus @click="close"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button>
          </div>
        </header>
        <div class="tabs" aria-label="请求视图"><button type="button" :aria-pressed="tab === 'form'" @click="tab = 'form'">请求配置</button><button type="button" :aria-pressed="tab === 'curl'" @click="tab = 'curl'; copied = false">cURL</button></div>
        <div class="panel-content">
          <div v-show="tab === 'form'">
            <fieldset><legend>环境配置</legend><p class="hint" role="status">{{ cacheMessage }}</p>
              <div class="field-control"><label class="field-name" :for="fieldId('baseUrl')">Base URL</label><button v-if="input.baseUrl" class="field-reset" type="button" @click="input.baseUrl = DEFAULT_PLAYGROUND_ENVIRONMENT.baseUrl">重置</button><input :id="fieldId('baseUrl')" v-model="input.baseUrl" type="url" spellcheck="false" /><small>API 服务根地址；不要填写接口路径，请求路径为 {{ playground.endpoint }}。</small></div>
            </fieldset>
            <fieldset><legend>请求头配置</legend>
              <div class="field-control"><label class="field-name" :for="fieldId('authorization')">Authorization</label> <em class="required">必填</em><button v-if="input.authorization" class="field-reset" type="button" @click="input.authorization = ''">清空</button><input :id="fieldId('authorization')" v-model="input.authorization" type="password" placeholder="Bearer djo_xxx" autocomplete="off" spellcheck="false" /><small>用于鉴权和限定任务查询范围的 API Key，格式为 Bearer &lt;API_KEY&gt;；仅保存在当前浏览器。<a href="/api/auth.html" target="_blank" rel="noopener noreferrer">如何鉴权？</a></small></div>
              <label v-if="isCreate">Content-Type<input value="multipart/form-data" readonly /><small>浏览器根据表单自动设置 Content-Type 和 boundary，无需手动填写。</small></label>
            </fieldset>
            <fieldset v-if="isCreate"><legend>请求体配置</legend>
              <div class="field-control"><label class="field-name" :for="fieldId('model')">model</label> <em><span class="required">必填</span> · string</em><select :id="fieldId('model')" v-model="input.model"><option v-for="model in AGENT_MODELS" :key="model" :value="model">{{ model }}</option></select><small>选择用于理解任务并生成几何工程的模型；标准版侧重成本与吞吐，专业版适合复杂题和图片还原。费用按模型区分，详见<a href="/api/pricing.html" target="_blank" rel="noopener noreferrer">API 计费说明</a>。</small></div>
              <div class="field-control"><label class="field-name" :for="fieldId('content')">content</label><em>可选 · string</em><button v-if="input.content" class="field-reset" type="button" @click="input.content = ''">清空</button><textarea :id="fieldId('content')" v-model="input.content" rows="5" placeholder="描述需要绘制的几何图形" /><small>要执行的绘图任务描述，可说明图形关系、标注或交互要求；可与参考图片同时提供。若只上传图片，可留空并由服务补默认提示。</small></div>
              <div class="field-control"><label class="field-name" for="agent-images">images</label><em>可选 · 最多 {{ MAX_AGENT_IMAGES }} 张</em><input id="agent-images" type="file" accept="image/*" multiple @change="selectImages" /><small>作为绘图参考的图片，最多 {{ MAX_AGENT_IMAGES }} 张；可单独上传图片；content 与图片至少提供一项。图片不会保存到浏览器。</small></div>
              <ul v-if="imagePreviews.length" class="image-list"><li v-for="(image, index) in imagePreviews" :key="image.url"><img :src="image.url" :alt="image.file.name" /><span>{{ image.file.name }} · {{ Math.ceil(image.file.size / 1024) }} KB</span><button type="button" :aria-label="`移除 ${image.file.name}`" @click="removeImage(index)">移除</button></li></ul>
              <div class="field-control"><label class="field-name" :for="fieldId('template')">template</label><em>可选 · JSON object</em><button v-if="input.template" class="field-reset" type="button" @click="input.template = ''">清空</button><textarea :id="fieldId('template')" v-model="input.template" rows="4" placeholder="粘贴母版 JSON 字符串" spellcheck="false" /><small>控制生成结果的视觉风格；填写母版 JSON 对象，作为字符串随表单提交。可从<a href="https://dajiaoai.com/master-templates" target="_blank" rel="noopener noreferrer">大角几何母版</a>下载。</small></div>
            </fieldset>
            <fieldset v-else-if="variant === 'tasks'"><legend>查询参数</legend>
              <div class="field-control"><label class="field-name" :for="fieldId('taskId')">taskId</label><em>可选 · string</em><button v-if="input.taskId" class="field-reset" type="button" @click="input.taskId = ''">清空</button><input :id="fieldId('taskId')" v-model="input.taskId" placeholder="填写 taskId 查询指定任务，留空查询列表" spellcheck="false" /><small>填写后调用任务详情接口；留空则使用下方分页和状态筛选。</small></div>
              <template v-if="queryVariant === 'tasks'">
              <div class="field-control"><label class="field-name" :for="fieldId('page')">page</label><em>可选 · number</em><button v-if="input.page" class="field-reset" type="button" @click="input.page = ''">重置</button><input :id="fieldId('page')" v-model="input.page" type="number" min="1" step="1" placeholder="1" /><small>页码，从 1 开始；留空使用默认值 1。</small></div>
              <div class="field-control"><label class="field-name" :for="fieldId('pageSize')">pageSize</label><em>可选 · number</em><button v-if="input.pageSize" class="field-reset" type="button" @click="input.pageSize = ''">重置</button><input :id="fieldId('pageSize')" v-model="input.pageSize" type="number" min="1" max="100" step="1" placeholder="20" /><small>每页条数，最多 100；留空使用默认值 20。</small></div>
              <div class="field-control"><label class="field-name" :for="fieldId('status')">status</label><em>可选 · string</em><select :id="fieldId('status')" v-model="input.status"><option value="">全部状态</option><option v-for="status in AGENT_TASK_STATUSES" :key="status" :value="status">{{ status }}</option></select><small>按任务状态筛选，留空查询全部状态。</small></div>
              </template>
            </fieldset>
            <fieldset v-else><legend>路径参数</legend>
              <div class="field-control"><label class="field-name" :for="fieldId('taskId')">taskId</label><em class="required">必填 · string</em><button v-if="input.taskId" class="field-reset" type="button" @click="input.taskId = ''">清空</button><input :id="fieldId('taskId')" v-model="input.taskId" placeholder="填写创建任务或任务列表返回的 taskId" spellcheck="false" /><small>查询当前 API Key 作用域内的任务；每次点击查询获取一次最新状态。</small></div>
            </fieldset>
          </div>
          <section v-if="tab === 'curl'" class="curl-view" aria-label="cURL 请求"><div class="section-heading"><h3>cURL</h3><button type="button" :disabled="!preview.curl" @click="copyCurl">{{ copied ? '已复制' : '复制' }}</button></div><p v-if="isCreate" class="hint">图片参数以本机文件名呈现；按需替换为实际文件路径。</p><p v-if="preview.error" class="hint">{{ preview.error }} 请在请求配置中补全。</p><pre v-else><code>{{ preview.curl }}</code></pre></section>
          <section ref="responseSection" class="response" aria-label="任务响应" :aria-busy="busy">
            <div class="section-heading"><h3>{{ variant === 'tasks' ? '查询响应' : '任务状态' }}</h3><span v-if="response" class="status" :class="{ failed: response.status >= 400 }">HTTP {{ response.status }} {{ response.statusText }} · {{ response.elapsed }} ms</span></div>
            <p v-if="taskStatus" class="task-status" :class="{ failed: taskStatus === 'error' }">状态：{{ taskStatus }}<span v-if="taskId"> · taskId：{{ taskId }}</span></p>
            <small v-if="taskStatus">created 表示等待执行，running 表示正在生成，finished 表示已完成，error 表示失败。</small>
            <div v-if="busy" class="progress-callout" role="status">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
              <div><strong>{{ progressTitle }}</strong><span>{{ isCreate ? (taskId ? '正在自动查询生成进度，任务完成后会在此显示结果。' : '正在提交绘图任务，请稍候。') : '正在获取最新任务数据，请稍候。' }}</span></div>
            </div>
            <p v-if="artifactUrl" class="artifact"><a :href="artifactUrl" target="_blank" rel="noopener noreferrer">打开生成的 .algeo 工程</a></p>
            <p v-if="error" class="error" role="alert">{{ error }}</p>
            <template v-if="response"><div class="tabs"><button type="button" :aria-pressed="responseTab === 'body'" @click="responseTab = 'body'">响应正文</button><button type="button" :aria-pressed="responseTab === 'headers'" @click="responseTab = 'headers'">响应头</button></div><pre><code>{{ responseTab === 'body' ? response.body : response.headers || '（无可读取的响应头）' }}</code></pre></template>
            <p v-else-if="!busy && !error" class="empty">{{ isCreate ? '提交任务后，在这里查看创建响应、轮询状态和最终结果。' : '发送查询后，在这里查看 HTTP 状态码和响应内容。' }}</p>
          </section>
        </div>
        <footer><span>{{ playground.method }} {{ playground.endpoint }}<template v-if="isCreate"> · GET /api/agent/tasks/:taskId</template></span><button v-if="busy" type="button" @click="controller?.abort()">取消</button><button class="launch" type="button" :disabled="busy" @click="send">{{ busy ? (isCreate ? '任务进行中…' : '查询中…') : (isCreate ? '创建并等待任务' : '查询任务') }}</button></footer>
      </div>
    </dialog>
  </div>
</template>

<style scoped src="./playground.css"></style>

<style scoped>
.image-list { display: grid; gap: 8px; margin: 0 0 16px; padding: 0; list-style: none; }
.image-list li { display: grid; grid-template-columns: 48px minmax(0, 1fr) auto; align-items: center; gap: 10px; min-width: 0; }
.image-list img { width: 48px; height: 48px; border: 1px solid var(--vp-c-divider); border-radius: 4px; object-fit: cover; }
.image-list span { overflow: hidden; color: var(--vp-c-text-2); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.image-list button { color: var(--vp-c-brand-1); cursor: pointer; }
.task-status { padding: 10px 12px; border-left: 3px solid var(--vp-c-brand-1); background: var(--vp-c-bg-soft); font-family: var(--vp-font-family-mono); overflow-wrap: anywhere; }
.progress-callout { display: flex; align-items: flex-start; gap: 10px; margin: 12px 0; padding: 14px 16px; border: 1px solid #2563eb40; border-left: 3px solid #2563eb; border-radius: 8px; background: #2563eb0d; color: #2563eb; }
.progress-callout svg { flex-shrink: 0; margin-top: 2px; }
.progress-callout strong { display: block; font-size: 14px; font-weight: 600; line-height: 1.7; }
.progress-callout span { display: block; margin-top: 2px; font-size: 12px; line-height: 1.7; }
:global(.dark) .progress-callout { border-color: #60a5fa40; border-left-color: #60a5fa; background: #60a5fa14; color: #93c5fd; }
.artifact { padding: 12px; border: 1px solid var(--vp-c-divider); border-radius: 6px; }
.launch { flex-shrink: 0; }
footer span { min-width: 0; overflow-wrap: anywhere; }
input[type="file"]::file-selector-button { margin-right: 12px; padding: 4px 10px; border: 1px solid var(--vp-c-divider); border-radius: 4px; background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); cursor: pointer; }
</style>
