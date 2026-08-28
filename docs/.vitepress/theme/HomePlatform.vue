<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useData } from 'vitepress';

const { frontmatter, lang } = useData();
const isEnglish = lang.value.startsWith('en');

type ScenarioId = 'question-bank' | 'batch-generation' | 'style-transfer';

const activeScenario = ref<ScenarioId>('question-bank');

const scenarios = computed(() => {
  if (isEnglish) {
    return [
      {
        id: 'question-bank' as const,
        number: '01',
        label: 'QUESTION BANK',
        title: 'Make geometry content editable and interactive.',
        description: 'Embed a professional geometry canvas into a question-bank or learning product. Learners can explore figures directly, while authors retain editable source files.',
        tags: ['Embedded SDK', 'Interactive canvas', 'Editable source'],
        input: 'Question content + geometry project',
        output: 'Interactive figure in your product',
      },
      {
        id: 'batch-generation' as const,
        number: '02',
        label: 'BATCH GENERATION',
        title: 'Generate geometry figures at content-production scale.',
        description: 'Use the Dino model to turn question text or reference images into editable geometry projects, then render them into deliverable assets in batches.',
        tags: ['Agent API', 'Batch workflow', 'PNG / SVG / TikZ'],
        input: 'Question text or reference image',
        output: 'Editable project + rendered assets',
      },
      {
        id: 'style-transfer' as const,
        number: '03',
        label: 'STYLE TRANSFER',
        title: 'Turn a draft into your required layout style.',
        description: 'Start from a hand-drawn draft or reference figure, identify its geometric structure, and produce an editable diagram that follows your visual specification.',
        tags: ['Reference image', 'Structured geometry', 'Style specification'],
        input: 'Draft image + layout requirements',
        output: 'Editable, consistently styled diagram',
      },
    ];
  }

  return [
    {
      id: 'question-bank' as const,
      number: '01',
      label: '题库管理',
      title: '让几何图形可编辑、可交互。',
      description: '将专业几何画板嵌入题库或学习产品。学生可以直接探索图形，内容团队仍保有可持续修改的原始工程文件。',
      tags: ['嵌入式 SDK', '交互画板', '可编辑源文件'],
      input: '题目内容 + 几何工程文件',
      output: '产品内的交互式几何图',
    },
    {
      id: 'batch-generation' as const,
      number: '02',
      label: '批量题图生成',
      title: '让几何题图进入规模化生产。',
      description: '借助大角模型，将题干或参考图转为可编辑的几何工程，再批量渲染为可以直接交付的图形素材。',
      tags: ['Agent API', '批量工作流', 'PNG / SVG / TikZ'],
      input: '题干文本或参考图片',
      output: '可编辑工程 + 渲染素材',
    },
    {
      id: 'style-transfer' as const,
      number: '03',
      label: '风格转绘',
      title: '将草稿图转为指定的排版风格。',
      description: '从手绘草稿或参考图出发，识别其中的几何结构，生成符合你的视觉规范、且可继续编辑的专业图形。',
      tags: ['参考图片', '结构化几何', '样式规范'],
      input: '草稿图片 + 排版要求',
      output: '可编辑且风格统一的几何图',
    },
  ];
});

const currentScenario = computed(() =>
  scenarios.value.find((scenario) => scenario.id === activeScenario.value)!,
);

const demoSrc = computed(() =>
  activeScenario.value === 'batch-generation'
    ? '/demos/question-bank/?embed=workspace'
    : '',
);

const demoHeight = ref(640);

function syncDemoHeight(event: MessageEvent) {
  if (
    event.origin !== window.location.origin ||
    event.data?.source !== 'dino-question-bank' ||
    event.data?.type !== 'resize' ||
    typeof event.data.height !== 'number'
  ) {
    return;
  }

  demoHeight.value = Math.max(400, Math.ceil(event.data.height));
}

onMounted(() => window.addEventListener('message', syncDemoHeight));
onBeforeUnmount(() => window.removeEventListener('message', syncDemoHeight));
</script>

<template>
  <div v-if="frontmatter.layout === 'home'" class="home-platform">
    <section class="home-demo" aria-labelledby="home-demo-title">
      <div class="home-demo__intro">
        <h2 id="home-demo-title">{{ isEnglish ? 'Try it yourself.' : '亲自试试。' }}</h2>
        <p>
          {{
            isEnglish
              ? 'Choose a common geometry workflow. The interactive example will be available in this workspace.'
              : '选择一个常见的几何业务场景，交互示例将在下方工作台中呈现。'
          }}
        </p>
      </div>

      <div class="home-demo__tabs" role="tablist" :aria-label="isEnglish ? 'Scenario examples' : '场景案例'">
        <button
          v-for="scenario in scenarios"
          :key="scenario.id"
          class="home-demo__tab"
          :class="{ 'is-active': activeScenario === scenario.id }"
          type="button"
          role="tab"
          :aria-selected="activeScenario === scenario.id"
          @click="activeScenario = scenario.id"
        >
          <span>{{ scenario.number }}</span>{{ scenario.label }}
        </button>
      </div>

      <div class="home-demo__workspace">
        <div class="home-demo__case">
          <p>{{ currentScenario.label }}</p>
          <h3>{{ currentScenario.title }}</h3>
          <div class="home-demo__tags">
            <span v-for="tag in currentScenario.tags" :key="tag">{{ tag }}</span>
          </div>
          <p class="home-demo__description">{{ currentScenario.description }}</p>
          <a
            v-if="demoSrc"
            class="home-demo__full-link"
            href="/demos/question-bank/"
            target="_blank"
            rel="noreferrer"
          >
            {{ isEnglish ? 'View the full example' : '查看完整案例' }} <span aria-hidden="true">↗</span>
          </a>
          <div class="home-demo__flow">
            <div>
              <span>{{ isEnglish ? 'INPUT' : '输入' }}</span>
              <strong>{{ currentScenario.input }}</strong>
            </div>
            <i aria-hidden="true">→</i>
            <div>
              <span>{{ isEnglish ? 'OUTPUT' : '输出' }}</span>
              <strong>{{ currentScenario.output }}</strong>
            </div>
          </div>
        </div>

        <div
          class="home-demo__frame-wrap"
          :class="{ 'has-demo': Boolean(demoSrc) }"
          :style="demoSrc ? { height: `${demoHeight}px` } : undefined"
        >
          <!-- Replace src with the deployed scenario demo URL when it is available. -->
          <iframe
            v-if="demoSrc"
            class="home-demo__frame"
            :title="`${currentScenario.label} Demo`"
            :src="demoSrc"
            loading="lazy"
          />
          <div v-if="!demoSrc" class="home-demo__placeholder" aria-hidden="true">
            <span class="home-demo__badge">DEMO AREA</span>
            <span>{{ isEnglish ? 'Interactive demo placeholder' : '交互式 Demo 占位区' }}</span>
          </div>
        </div>
      </div>
    </section>

    <footer class="home-footer">
      <div class="home-footer__inner">
        <div class="home-footer__brand">
          <a class="home-footer__logo" href="/" target="_blank" rel="noreferrer" aria-label="大角几何开放平台首页">
            <img src="/logo.svg" alt="" width="28" height="28" />
            <span>{{ isEnglish ? 'Dino-GSP Open Platform' : '大角几何开放平台' }}</span>
          </a>
          <p>{{ isEnglish ? 'Professional dynamic geometry for your product.' : '将专业动态几何能力接入你的产品。' }}</p>
        </div>

        <div class="home-footer__links">
          <div>
            <p>{{ isEnglish ? 'PRODUCT' : '产品能力' }}</p>
            <a :href="isEnglish ? '/en/sdk/' : '/sdk/'" target="_blank" rel="noreferrer">SDK</a>
            <a :href="isEnglish ? '/en/api/' : '/api/'" target="_blank" rel="noreferrer">HTTP API</a>
            <a :href="isEnglish ? '/en/ai/' : '/ai/'" target="_blank" rel="noreferrer">MCP / AI</a>
          </div>
          <div>
            <p>{{ isEnglish ? 'RESOURCES' : '开发资源' }}</p>
            <a :href="isEnglish ? '/en/guide/capabilities' : '/guide/capabilities'" target="_blank" rel="noreferrer">{{ isEnglish ? 'Capabilities' : '能力总览' }}</a>
            <a :href="isEnglish ? '/en/announcements/' : '/announcements/'" target="_blank" rel="noreferrer">{{ isEnglish ? 'Updates' : '更新公告' }}</a>
            <a href="https://github.com/dajiaoai/" target="_blank" rel="noreferrer">GitHub</a>
          </div>
          <div>
            <p>{{ isEnglish ? 'SUPPORT' : '支持与合作' }}</p>
            <a :href="isEnglish ? '/en/CONTACT' : '/CONTACT'" target="_blank" rel="noreferrer">{{ isEnglish ? 'Contact us' : '联系我们' }}</a>
          </div>
        </div>
      </div>
      <div class="home-footer__bottom">
        <span>© {{ new Date().getFullYear() }} {{ isEnglish ? 'Dino-GSP' : '大角几何' }}</span>
        <span class="home-footer__registrations">
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">浙ICP备2023047252号-4</a>
          <a
            href="https://beian.mps.gov.cn/#/query/webSearch?code=33010502012478"
            target="_blank"
            rel="noreferrer"
          >浙公网安备33010502012478号</a>
        </span>
        <a href="https://dajiaoai.com" target="_blank" rel="noreferrer">{{ isEnglish ? 'Main Site' : '访问主站' }}</a>
      </div>
    </footer>
  </div>
</template>
