/**
 * @description: 阿里云日志服务 - Web版
 *
 * Usage:
 * slsLogger.setUserId(userId);
 * slsLogger.trackPage('/home', { name: 'John' });
 * slsLogger.trackAction('action', 'category', { name: 'John' });
 */

import { SLS_CONFIG } from './slsConfig';
import { getDeviceId } from './deviceFingerprint';

const ServiceURL = `https://${SLS_CONFIG.PROJECT}.${SLS_CONFIG.ENDPOINT}/logstores/${SLS_CONFIG.LOGSTORE}/track`;
const APIVersion = '0.6.0';

let userId = '';
const requestQueue: string[] = [];
let resendStarted = false;

// 页面跳转追踪相关变量
let previousPath = ''; // 记录上一个页面路径
let hasTrackedLeave = false; // 是否已经追踪过页面离开事件

function resolvePvKey(
  explicitPvKey?: string,
  data?: Record<string, any>,
): string {
  const dataPvKey = data?.pvKey;
  return explicitPvKey ?? dataPvKey ?? currentPvKey;
}

export const slsLogger = {
  /**
   * 初始化用户ID，设置后所有日志都会使用该ID
   * @param userId 用户ID
   */
  setUserId(userIdParam: string) {
    userId = userIdParam;
  },

  /**
   * 记录页面访问事件
   * @param path 页面路径
   * @param pvKey 页面访问唯一标识
   * @param data 页面相关数据
   */
  trackPage(path: string, pvKey: string, data: Record<string, any> = {}) {
    sendEventLog({ eventType: 'page_view', path, pvKey, data });
  },

  /**
   * 记录页面离开事件
   * @param path 页面路径
   * @param pvKey 页面访问唯一标识
   * @param data 页面相关数据
   */
  trackLeavePage(path: string, pvKey: string, data: Record<string, any> = {}) {
    sendEventLog({ eventType: 'page_leave', path, pvKey, data });
  },

  /**
   * 记录页面离开事件（同步版本，用于页面卸载时）
   * @param path 页面路径
   * @param pvKey 页面访问唯一标识
   * @param data 页面相关数据
   */
  trackLeavePageSync(
    path: string,
    pvKey: string,
    data: Record<string, any> = {},
  ) {
    sendEventLogSync({ eventType: 'page_leave', path, pvKey, data });
  },

  /**
   * 记录用户行为事件
   * @param action 行为名称
   * @param category 行为类别
   * @param data 行为相关数据
   */
  trackAction(
    action: string,
    category: string,
    data: Record<string, any> = {},
    pvKey?: string,
  ) {
    const resolvedPvKey = resolvePvKey(pvKey, data);
    sendEventLog({
      eventType: 'custom_action',
      action,
      category,
      data: {
        ...data,
        pvKey: resolvedPvKey,
      },
    });
  },

  /**
   * 记录错误事件
   * @param error 错误对象或消息
   */
  trackError(
    error: Error | string,
    context: Record<string, any> = {},
    pvKey?: string,
  ) {
    const resolvedPvKey = resolvePvKey(pvKey, context);
    const errorData =
      typeof error === 'string' ? { message: error } : { ...error };
    sendEventLog({
      eventType: 'exception',
      data: {
        ...errorData,
        ...context,
        pvKey: resolvedPvKey,
      },
    });
  },
};

/**
 * 获取 referrer 信息
 * 优先级：document.referrer > 内部页面跳转
 */
function getReferrer(): string {
  // 优先使用 document.referrer
  if (document.referrer) {
    return document.referrer;
  }

  // 如果是内部页面跳转，使用上一个页面路径
  if (previousPath && previousPath !== window.location.pathname) {
    return `${window.location.origin}${previousPath}`;
  }

  // 否则返回空
  return '';
}

/**
 * 将事件转换为 GA4 格式
 */
function convertToGA4Event(event: {
  eventType: 'page_view' | 'custom_action' | 'page_leave' | 'exception';
  path?: string;
  action?: string;
  category?: string;
  pvKey?: string;
  data: Record<string, any>;
}) {
  const baseParams = {
    user_id: userId,
    device_id: getDeviceId(),
    page_location: window.location.href,
    page_referrer: getReferrer(),
    timestamp: new Date().getTime(),
    ...event.data,
  };

  switch (event.eventType) {
    case 'page_view':
      return {
        event_name: 'page_view',
        parameters: {
          ...baseParams,
          page_title: document.title,
          page_location: window.location.href,
          page_path: event.path || window.location.pathname,
          pv_key: event.pvKey,
        },
      };

    case 'page_leave':
      return {
        event_name: 'page_leave',
        parameters: {
          ...baseParams,
          page_path: event.path || window.location.pathname,
          pv_key: event.pvKey,
        },
      };

    case 'custom_action':
      return {
        event_name: 'custom_action',
        parameters: {
          ...baseParams,
          action_name: event.action,
          action_category: event.category,
        },
      };

    case 'exception':
      return {
        event_name: 'exception',
        parameters: {
          ...baseParams,
          description: event.data?.message || 'Unknown error',
          fatal: false,
        },
      };

    default:
      return {
        event_name: 'custom_event',
        parameters: baseParams,
      };
  }
}

/**
 * 发送事件到 Google Analytics 4
 */
function sendToGA4(event: {
  eventType: 'page_view' | 'custom_action' | 'page_leave' | 'exception';
  path?: string;
  action?: string;
  category?: string;
  pvKey?: string;
  data: Record<string, any>;
}) {
  // 检查 gtag 是否可用
  if (
    typeof window !== 'undefined' &&
    typeof (window as any).gtag === 'function'
  ) {
    const ga4Event = convertToGA4Event(event);
    (window as any).gtag('event', ga4Event.event_name, ga4Event.parameters);
  } else {
    console.warn('[SLSLogger] gtag is not available, GA4 event not sent');
  }
}

/**
 * 构建日志参数
 */
function buildLogParams(event: {
  eventType: 'page_view' | 'custom_action' | 'page_leave' | 'exception';
  path?: string;
  action?: string;
  category?: string;
  pvKey?: string;
  data: Record<string, any>;
}): { logParams: Record<string, string>; logRequestURL: string } {
  const deviceid = getDeviceId();
  const referrer = getReferrer();
  const dataWithPvKey = {
    ...event.data,
    pvKey: event.data?.pvKey ?? event.pvKey,
  };
  const logParams: Record<string, string> = {
    ...event,
    APIVersion,
    userid: userId,
    deviceid,
    data: JSON.stringify({
      ...dataWithPvKey,
      timestamp: new Date().getTime(),
      url: window.location.href,
      referrer: referrer,
    }),
  };

  const logRequestURL = `${ServiceURL}?${new URLSearchParams(logParams)}`;

  return { logParams, logRequestURL };
}

async function sendEventLog(event: {
  eventType: 'page_view' | 'custom_action' | 'page_leave' | 'exception';
  path?: string;
  action?: string;
  category?: string;
  pvKey?: string;
  data: Record<string, any>;
}) {
  const { logParams, logRequestURL } = buildLogParams(event);

  if (process.env.NODE_ENV != 'production') {
    console.log(`[SLSLogger] Log ignored (${process.env.NODE_ENV} mode).`, logParams);
    return;
  }

  // 上报到阿里云 SLS
  try {
    await fetch(logRequestURL, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
    });
  } catch (error) {
    requestQueue.push(logRequestURL);
    resendFailedLogs();
  }

  // 同时上报到 Google Analytics 4
  try {
    sendToGA4(event);
  } catch (error) {
    console.warn('[SLSLogger] Failed to send to GA4:', error);
  }
}

/**
 * 同步发送日志（用于页面卸载等紧急情况）
 * 使用 navigator.sendBeacon 或 fetch keepalive 确保数据能发送成功
 */
function sendEventLogSync(event: {
  eventType: 'page_view' | 'custom_action' | 'page_leave' | 'exception';
  path?: string;
  action?: string;
  category?: string;
  pvKey?: string;
  data: Record<string, any>;
}) {
  const { logParams, logRequestURL } = buildLogParams(event);

  // 开发环境下只打印日志，不发送
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SLSLogger] Sync log ignored (development mode).`, logParams);
    return;
  }

  // 上报到阿里云 SLS
  try {
    // 优先使用 sendBeacon，它专门设计用于页面卸载时发送数据
    if (navigator.sendBeacon) {
      const success = navigator.sendBeacon(logRequestURL);
      if (!success) {
        // 如果 sendBeacon 失败，尝试使用 fetch 的 keepalive 选项
        fetch(logRequestURL, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          keepalive: true,
        }).catch(() => {
          // 静默处理错误，避免在页面卸载时出现异常
        });
      }
    } else {
      // 如果不支持 sendBeacon，使用 fetch 的 keepalive 选项
      fetch(logRequestURL, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        keepalive: true,
      }).catch(() => {
        // 静默处理错误，避免在页面卸载时出现异常
      });
    }
  } catch (error) {
    // 静默处理错误，避免在页面卸载时出现异常
  }

  // 同时上报到 Google Analytics 4
  try {
    sendToGA4(event);
  } catch (error) {
    console.warn('[SLSLogger] Failed to send sync event to GA4:', error);
  }
}

function pruneResendQueue() {
  const MAX_SIZE = 100;
  const count = requestQueue.length;
  const overflow = Math.max(0, count - MAX_SIZE);

  if (overflow > 0) {
    console.log(`[SLSLogger] Discarded ${overflow} logs.`);
    requestQueue.splice(0, overflow);
  }
  return overflow;
}

async function resendFailedLogs() {
  if (resendStarted) {
    return;
  }
  console.log(`[SLSLogger] Resending ${requestQueue.length} failed log(s).`);
  resendStarted = true;
  let failures = 0;

  for (let i = 0, n = 1; i < requestQueue.length; i++, n++) {
    // 中途可能有新加入的，每次先剪裁队列
    i = Math.max(0, i - pruneResendQueue());
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);

      await fetch(requestQueue[i], {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      // 重发成功，从队列中移除
      requestQueue.splice(i--, 1);
    } catch {
      failures++;
    }
  }

  if (failures > 0) {
    console.warn(`[SLSLogger] Some logs were not sent (${failures} failed).`);
  }
  resendStarted = false;
}

// 自动追踪页面访问
let currentPath = '';
let currentPvKey = '';

export function generatePvKey(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function enableAutoPageTracking() {
  // 监听路由变化
  const trackPageChange = () => {
    const newPath = window.location.pathname + window.location.search;
    if (newPath !== currentPath) {
      // 如果有当前页面，先记录离开事件
      if (currentPath && currentPvKey && !hasTrackedLeave) {
        slsLogger.trackLeavePage(currentPath, currentPvKey);
        // 更新上一个页面路径，用于 referrer 追踪
        previousPath = currentPath;
      }

      currentPath = newPath;
      currentPvKey = generatePvKey();
      hasTrackedLeave = false; // 重置离开追踪状态
      slsLogger.trackPage(newPath, currentPvKey, {
        ua: navigator.userAgent,
        uaData: (navigator as any).userAgentData,
      });
    }
  };

  // 监听popstate事件（浏览器前进后退）
  window.addEventListener('popstate', trackPageChange);

  // 监听pushState和replaceState（需要重写这些方法）
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    originalPushState.apply(history, args);
    setTimeout(trackPageChange, 0);
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(history, args);
    setTimeout(trackPageChange, 0);
  };

  // 初始页面追踪
  trackPageChange();

  // 监听页面卸载事件
  const handlePageUnload = (reason: string) => {
    if (currentPath && currentPvKey && !hasTrackedLeave) {
      hasTrackedLeave = true; // 标记已经追踪过离开事件
      slsLogger.trackLeavePageSync(currentPath, currentPvKey, {
        reason,
      });
    }
  };

  // beforeunload - 页面即将卸载时触发
  window.addEventListener('beforeunload', () =>
    handlePageUnload('page_unload'),
  );
}

// 自动追踪错误
export function enableAutoErrorTracking() {
  // 捕获未处理的Promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    slsLogger.trackError(event.reason, { type: 'unhandledrejection' });
  });

  // 捕获全局错误
  window.addEventListener('error', (event) => {
    slsLogger.trackError(event.error || event.message, {
      type: 'error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
}

/**
 * 获取元素的文本内容
 * @param element DOM元素
 * @returns 元素的文本内容
 */
function getElementText(element: Element): string {
  // 优先获取元素的直接文本内容
  let text = '';

  // 如果是input元素，获取其value或placeholder
  if (element instanceof HTMLInputElement) {
    text = element.value || element.placeholder || '';
  }
  // 如果是button元素，获取其文本内容
  else if (element instanceof HTMLButtonElement) {
    text = element.textContent || (element as HTMLElement).innerText || '';
  }
  // 如果是img元素，获取其alt属性
  else if (element instanceof HTMLImageElement) {
    text = element.alt || element.title || '';
  }
  // 如果是a元素，获取其文本内容或title
  else if (element instanceof HTMLAnchorElement) {
    text =
      element.textContent ||
      (element as HTMLElement).innerText ||
      element.title ||
      '';
  }
  // 其他元素获取文本内容
  else {
    text = element.textContent || (element as HTMLElement).innerText || '';
  }

  // 清理文本内容，去除多余空白字符
  text = text.trim().replace(/\s+/g, ' ');

  // 如果文本过长，截取前100个字符
  if (text.length > 100) {
    text = text.substring(0, 100) + '...';
  }

  return text;
}

/**
 * 获取元素的选择器路径
 * @param element DOM元素
 * @returns 元素的CSS选择器路径
 */
function getElementSelector(element: Element): string {
  const path: string[] = [];
  let current = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    // 添加ID
    if (current.id) {
      selector += `#${current.id}`;
    }

    // 添加类名（只取前2个）
    if (current.className && typeof current.className === 'string') {
      const classes = current.className
        .split(' ')
        .filter((c) => c.trim())
        .slice(0, 2);
      if (classes.length > 0) {
        selector += '.' + classes.join('.');
      }
    }

    path.unshift(selector);
    current = current.parentElement as Element;

    // 限制路径深度，避免过长
    if (path.length >= 5) break;
  }

  return path.join(' > ');
}

/**
 * 自动采集点击事件
 * 当用户点击页面上的任何元素时，自动记录点击信息
 */
export function enableAutoClickTracking() {
  document.addEventListener(
    'click',
    (event) => {
      try {
        const target = event.target as Element;
        if (!target) return;

        const elementText = getElementText(target);
        const elementSelector = getElementSelector(target);

        const currentPage = window.location.pathname + window.location.search;
        const pageTitle = document.title;

        const clickData = {
          elementText,
          elementSelector,
          elementTag: target.tagName.toLowerCase(),
          elementId: target.id || '',
          elementClass: target.className || '',
          page: currentPage,
          pageTitle,
          clickX: event.clientX,
          clickY: event.clientY,
          timestamp: new Date().toISOString(),
        };

        slsLogger.trackAction('click', '自动采集', clickData);
      } catch (error) {
        console.warn('[SLSLogger] 自动点击采集出错:', error);
      }
    },
    true,
  );

  console.log('[SLSLogger] 自动点击事件采集已启用');
}

export default slsLogger;
