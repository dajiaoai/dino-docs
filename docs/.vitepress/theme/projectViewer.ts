export type ViewerMode = 'presentation' | 'editor';

export function parseViewerMode(value: string | null): ViewerMode {
  return value === 'editor' ? 'editor' : 'presentation';
}

export function validateProjectUrl(value: string): string {
  let url: URL;
  try { url = new URL(value.trim()); }
  catch { throw new Error('请输入完整的 HTTP 或 HTTPS 工程地址。'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('工程地址仅支持不含账号密码的 HTTP 或 HTTPS 链接。');
  }
  return url.href;
}

export function buildViewerUrl(pageUrl: string, projectUrl: string, mode: ViewerMode): string {
  const url = new URL(pageUrl);
  url.pathname = url.pathname.replace(/\/viewer\.html$/, '/viewer');
  if (projectUrl) url.searchParams.set('url', validateProjectUrl(projectUrl));
  else url.searchParams.delete('url');
  url.searchParams.set('mode', mode);
  return url.href;
}

export function parseProject(text: string) {
  let content;
  try { content = JSON.parse(text.replace(/^\uFEFF/, '')); }
  catch { throw new Error('文件不是有效的 JSON，请选择 .algeo 工程文件。'); }
  if (!content || typeof content !== 'object' || !content.metadata
    || !['10', '11'].includes(content.metadata.version)
    || !Array.isArray(content.slides) || !content.slides.length || !Array.isArray(content.messages)) {
    throw new Error('工程格式无效，请使用包含画板的 V10 / V11 .algeo 工程。');
  }
  return content;
}
