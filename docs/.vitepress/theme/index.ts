import DefaultTheme from 'vitepress/theme'
import './style.css'

const GA_ID = 'G-ZVQ5PXBPGG'

export default {
  extends: DefaultTheme,
  enhanceApp({ router }) {
    if (typeof window === 'undefined') return
    router.onAfterRouteChange = (to) => {
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
      if (typeof gtag === 'function') {
        gtag('event', 'page_view', { page_path: to, page_title: document.title })
      }
    }
  },
}
