import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import './style.css';
import HeroIllustration from './HeroIllustration.vue';
import HeroInfo from './HeroInfo.vue';
import CopyDocButton from './CopyDocButton.vue';

const GA_ID = 'G-ZVQ5PXBPGG';

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'home-hero-info': () => h(HeroInfo),
      'home-hero-image': () => h(HeroIllustration),
      'aside-outline-before': () => h(CopyDocButton),
    }),
  enhanceApp({ router }) {
    if (typeof window === 'undefined') return;
    router.onAfterRouteChange = (to) => {
      const gtag = (
        window as unknown as { gtag?: (...args: unknown[]) => void }
      ).gtag;
      if (typeof gtag === 'function') {
        gtag('event', 'page_view', {
          page_path: to,
          page_title: document.title,
        });
      }
    };
  },
};
