import { h } from 'vue';
import { useData } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import './style.css';
import HeroIllustration from './HeroIllustration.vue';
import HeroInfo from './HeroInfo.vue';
import CopyDocButton from './CopyDocButton.vue';
import UnitConverter from './UnitConverter.vue';
import RenderPlayground from './RenderPlayground.vue';
import AgentPlayground from './AgentPlayground.vue';
import ProjectViewer from './ProjectViewer.vue';
import CommunityQrCard from './CommunityQrCard.vue';
import HomePlatform from './HomePlatform.vue';
import AnnouncementList from './AnnouncementList.vue';
import AnnouncementArticleTags from './AnnouncementArticleTags.vue';
import AnnouncementRelated from './AnnouncementRelated.vue';
import AnnouncementSidebar from './AnnouncementSidebar.vue';
import { syncAnnouncementLocation } from './useAnnouncements';
import {
  enableAutoPageTracking,
  enableAutoErrorTracking,
  enableAutoClickTracking,
} from './sls/slsLogger';

export default {
  extends: DefaultTheme,
  Layout: () => {
    const { frontmatter } = useData();
    return h(DefaultTheme.Layout, null, {
      'home-hero-info': () => h(HeroInfo),
      'home-hero-image': () => h(HeroIllustration),
      'aside-outline-before': () => h(CopyDocButton),
      'doc-before': () => h(AnnouncementArticleTags),
      'doc-footer-before': () => h(AnnouncementRelated),
      'sidebar-nav-after': () => h(AnnouncementSidebar),
      'layout-bottom': () => frontmatter.value.communityWidget === false ? null : h(CommunityQrCard),
      'home-features-after': () => h(HomePlatform),
    });
  },
  enhanceApp({ app, router }) {
    app.component('UnitConverter', UnitConverter);
    app.component('RenderPlayground', RenderPlayground);
    app.component('AgentPlayground', AgentPlayground);
    app.component('ProjectViewer', ProjectViewer);
    app.component('AnnouncementList', AnnouncementList);

    if (typeof window === 'undefined') return;

    const previousAfterRouteChange = router.onAfterRouteChange;
    router.onAfterRouteChange = async (href) => {
      syncAnnouncementLocation(href);
      await previousAfterRouteChange?.(href);
    };

    // 自动上报：页面访问/离开、全局错误、点击事件；生产构建才会真正发送。
    // Google Analytics 4 的数据采集由 slsLogger 统一驱动。
    enableAutoPageTracking();
    enableAutoErrorTracking();
    enableAutoClickTracking();

    // 若站点后续能拿到登录态用户 ID，可在此调用：
    // slsLogger.setUserId(/* userId */ '');
  },
};
