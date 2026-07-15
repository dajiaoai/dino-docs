/**
 * 设备指纹相关的 TypeScript 类型定义
 */

export interface DeviceInfo {
  /** 用户代理字符串 */
  userAgent: string;
  /** 浏览器语言 */
  language: string;
  /** 屏幕分辨率 */
  screenResolution: string;
  /** 视口大小 */
  viewportSize: string;
  /** 时区 */
  timezone: string;
  /** 设备唯一标识 */
  deviceId: string;
}

export interface DeviceFingerprint {
  /** 指纹哈希值 */
  hash: string;
  /** 生成时间戳 */
  timestamp: number;
  /** 随机后缀 */
  random: string;
  /** 完整的设备ID */
  fullId: string;
}

export interface LogEventData {
  /** 事件时间戳 */
  timestamp: number;
  /** 当前页面URL */
  url: string;
  /** 来源页面 */
  referrer: string;
  /** 设备信息 */
  deviceInfo: {
    userAgent: string;
    language: string;
    screenResolution: string;
    viewportSize: string;
    timezone: string;
  };
  /** 自定义数据 */
  [key: string]: any;
}

export interface LogParams {
  /** 事件类型 */
  eventType: 'page' | 'action' | 'error' | 'leavePage';
  /** API版本 */
  APIVersion: string;
  /** 用户ID */
  userid: string;
  /** 设备ID */
  deviceid: string;
  /** 页面路径（页面事件使用） */
  path?: string;
  /** 行为名称（行为事件使用） */
  action?: string;
  /** 行为类别（行为事件使用） */
  category?: string;
  /** 页面访问唯一标识 */
  pvKey?: string;
  /** 事件数据（JSON字符串） */
  data: string;
}

export interface SLSLogger {
  /** 设置用户ID */
  setUserId(userId: string): void;
  /** 获取设备ID */
  getDeviceId(): string;
  /** 获取设备信息 */
  getDeviceInfo(): DeviceInfo;
  /** 记录页面访问 */
  trackPage(path: string, pvKey: string, data?: Record<string, any>): void;
  /** 记录页面离开 */
  trackLeavePage(path: string, pvKey: string, data?: Record<string, any>): void;
  /** 记录用户行为 */
  trackAction(
    action: string,
    category: string,
    data?: Record<string, any>,
    pvKey?: string,
  ): void;
  /** 记录错误 */
  trackError(
    error: Error | string,
    context?: Record<string, any>,
    pvKey?: string,
  ): void;
}

export interface FingerprintComponents {
  /** 用户代理 */
  userAgent: string;
  /** 语言 */
  language: string;
  /** 屏幕分辨率 */
  screenResolution: string;
  /** 颜色深度 */
  colorDepth: string;
  /** 时区 */
  timezone: string;
  /** 平台 */
  platform: string;
  /** CPU核心数 */
  hardwareConcurrency: string;
  /** 设备内存（如果支持） */
  deviceMemory?: string;
  /** 触摸支持 */
  touchSupport: string;
  /** Canvas指纹 */
  canvasFingerprint: string;
  /** WebGL厂商 */
  webglVendor?: string;
  /** WebGL渲染器 */
  webglRenderer?: string;
  /** 字体指纹 */
  fontFingerprint: string;
}

/** 扩展的Navigator接口，包含可能的设备内存属性 */
export interface ExtendedNavigator extends Navigator {
  deviceMemory?: number;
}

/** 扩展的Window接口，用于类型检查 */
export interface ExtendedWindow extends Window {
  navigator: ExtendedNavigator;
}
