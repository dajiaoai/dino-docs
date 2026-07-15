import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import './style.css';
import HeroIllustration from './HeroIllustration.vue';
import HeroInfo from './HeroInfo.vue';
import CopyDocButton from './CopyDocButton.vue';
import {
  enableAutoPageTracking,
  enableAutoErrorTracking,
  enableAutoClickTracking,
} from './sls/slsLogger';

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'home-hero-info': () => h(HeroInfo),
      'home-hero-image': () => h(HeroIllustration),
      'aside-outline-before': () => h(CopyDocButton),
    }),
  enhanceApp() {
    if (typeof window === 'undefined') return;

    // 自动上报：页面访问/离开、全局错误、点击事件；生产构建才会真正发送。
    // Google Analytics 4 的数据采集由 slsLogger 统一驱动。
    enableAutoPageTracking();
    enableAutoErrorTracking();
    enableAutoClickTracking();

    // 若站点后续能拿到登录态用户 ID，可在此调用：
    // slsLogger.setUserId(/* userId */ '');
  },
};
