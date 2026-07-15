/**
 * @description: 设备指纹生成器 - Web & H5 设备唯一标识
 * 
 * 基于浏览器特征生成设备指纹，用于设备识别和追踪
 * 
 * Usage:
 * import { getDeviceId, generateDeviceFingerprint } from './deviceFingerprint';
 * 
 * const deviceId = getDeviceId(); // 获取或生成设备ID
 * const fingerprint = generateDeviceFingerprint(); // 生成设备指纹
 */

import type { ExtendedNavigator } from './types';

const STORAGE_KEY = '__dino_device_id__';

let cachedDeviceId = '';

/**
 * 生成设备指纹 - 基于多个浏览器特征
 * @returns 设备指纹哈希值
 */
export function generateDeviceFingerprint(): string {
  const components: string[] = [];
  
  try {
    // 用户代理
    components.push(navigator.userAgent || '');
    
    // 语言设置
    components.push(navigator.language || '');
    
    // 屏幕分辨率
    components.push(`${screen.width}x${screen.height}`);
    
    // 颜色深度
    components.push(screen.colorDepth.toString());
    
    // 时区
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone || '');
    
    // 平台信息
    components.push(navigator.platform || '');
    
    // CPU 核心数
    components.push((navigator.hardwareConcurrency || 0).toString());
    
    // 设备内存 (如果支持)
    const extendedNavigator = navigator as ExtendedNavigator;
    if ('deviceMemory' in extendedNavigator && extendedNavigator.deviceMemory) {
      components.push(extendedNavigator.deviceMemory.toString());
    }
    
    // 触摸支持
    components.push(('ontouchstart' in window).toString());
    
    // Canvas指纹
    components.push(getCanvasFingerprint());
    
    // WebGL指纹
    components.push(getWebGLFingerprint());
    
    // 字体检测
    components.push(getFontFingerprint());
    
  } catch (e) {
    console.warn('[DeviceFingerprint] Error generating fingerprint:', e);
  }
  
  // 生成哈希
  const fingerprint = components.join('|');
  return simpleHash(fingerprint);
}

/**
 * 获取Canvas指纹
 * @returns Canvas指纹字符串
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.width = 200;
      canvas.height = 50;
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint test 🔒', 2, 2);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Device fingerprint test 🔒', 4, 4);
      return canvas.toDataURL().slice(-50); // 取最后50个字符
    }
  } catch (e) {
    console.warn('[DeviceFingerprint] Canvas fingerprint error:', e);
  }
  return 'canvas_error';
}

/**
 * 获取WebGL指纹
 * @returns WebGL指纹字符串
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && 'getExtension' in gl && 'getParameter' in gl) {
      const webglContext = gl as WebGLRenderingContext;
      const debugInfo = webglContext.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const vendor = webglContext.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
        const renderer = webglContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
        return `${vendor}|${renderer}`;
      }
    }
  } catch (e) {
    console.warn('[DeviceFingerprint] WebGL fingerprint error:', e);
  }
  return 'webgl_error';
}

/**
 * 获取字体指纹 (简化版)
 * @returns 字体指纹字符串
 */
function getFontFingerprint(): string {
  try {
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testFonts = ['Arial', 'Helvetica', 'Times', 'Courier', 'Verdana', 'Georgia'];
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (context) {
      const fontSignature: string[] = [];
      
      // 获取基础字体宽度
      const baseWidths: { [key: string]: number } = {};
      baseFonts.forEach(baseFont => {
        context.font = testSize + ' ' + baseFont;
        baseWidths[baseFont] = context.measureText(testString).width;
      });
      
      // 检测特定字体
      testFonts.forEach(font => {
        baseFonts.forEach(baseFont => {
          context.font = testSize + ' ' + font + ', ' + baseFont;
          const width = context.measureText(testString).width;
          if (width !== baseWidths[baseFont]) {
            fontSignature.push(font);
            return;
          }
        });
      });
      
      return fontSignature.join(',');
    }
  } catch (e) {
    console.warn('[DeviceFingerprint] Font fingerprint error:', e);
  }
  return 'font_error';
}

/**
 * 简单哈希函数
 * @param str 输入字符串
 * @returns 哈希值(16进制字符串)
 */
function simpleHash(str: string): string {
  let hash = 0;
  if (str.length === 0) return hash.toString();
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  // 转换为16进制并确保是正数
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * 获取或生成设备ID
 * @returns 设备唯一标识
 */
export function getDeviceId(): string {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }
  
  // 尝试从localStorage获取
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      cachedDeviceId = stored;
      return cachedDeviceId;
    }
  } catch (e) {
    console.warn('[DeviceFingerprint] LocalStorage not available');
  }
  
  // 生成新的设备ID
  const fingerprint = generateDeviceFingerprint();
  cachedDeviceId = `${fingerprint}`;
  
  // 尝试保存到localStorage
  try {
    localStorage.setItem(STORAGE_KEY, cachedDeviceId);
  } catch (e) {
    console.warn('[DeviceFingerprint] Failed to save device ID to localStorage');
  }
  
  return cachedDeviceId;
}

/**
 * 清除缓存的设备ID (用于测试或重置)
 */
export function clearDeviceId(): void {
  cachedDeviceId = '';
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[DeviceFingerprint] Failed to clear device ID from localStorage');
  }
}

/**
 * 获取设备指纹详细信息 (用于调试)
 * @returns 设备指纹详细信息对象
 */
export function getDeviceFingerprintDetails(): {
  deviceId: string;
  fingerprint: string;
  userAgent: string;
  language: string;
  screenResolution: string;
  colorDepth: number;
  timezone: string;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory?: number;
  touchSupport: boolean;
  canvasFingerprint: string;
  webglFingerprint: string;
  fontFingerprint: string;
} {
  const extendedNavigator = navigator as ExtendedNavigator;
  
  return {
    deviceId: getDeviceId(),
    fingerprint: generateDeviceFingerprint(),
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: extendedNavigator.deviceMemory,
    touchSupport: 'ontouchstart' in window,
    canvasFingerprint: getCanvasFingerprint(),
    webglFingerprint: getWebGLFingerprint(),
    fontFingerprint: getFontFingerprint(),
  };
}
