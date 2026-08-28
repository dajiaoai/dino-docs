import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { createEditor, createPresentation, type EmbeddedEditor, type EmbeddedPresentation } from '@dajiaoai/algeo-sdk';
import { LoaderCircle, TriangleAlert } from 'lucide-react';

const appId = 'HLVENKRV';
const shareId = 'ZJ0DQ999';
export type BoardContent = Parameters<EmbeddedPresentation['loadFile']>[0];
type BoardProps = { mode: 'editor' | 'presentation'; content?: BoardContent | null; onContentChange?: (content: BoardContent) => void };
export type SmartBoardHandle = { exportCover: () => Promise<Blob> };

export const SmartBoard = forwardRef<SmartBoardHandle, BoardProps>(function SmartBoard({ mode, content, onContentChange }, ref) {
  const hostRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EmbeddedEditor | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let alive = true;
    let instance: EmbeddedEditor | EmbeddedPresentation | null = null;
    async function mount() {
      if (!hostRef.current) return;
      setStatus('loading');
      try {
        if (mode === 'editor') {
          const editor = await createEditor(hostRef.current, { auth: { appId }, shareId, ui: { navbar: false, slidePanel: false, toolboxPanel: true, docPanel: false, helpEntry: false, aiChatPanel: false } });
          editor.on('contentChange', event => onContentChange?.(event.content as BoardContent));
          editorRef.current = editor;
          instance = editor;
        } else {
          const presentation = await createPresentation(hostRef.current, { auth: { appId }, shareId, ui: { logo: false, slidePanel: false, pencilToolbar: true, zoomControl: false } });
          if (content) await presentation.loadFile(content);
          instance = presentation;
        }
        if (!alive) { await instance.destroy(); return; }
        setStatus('ready');
      } catch (error) {
        console.error('大角 SDK 初始化失败', error);
        if (alive) setStatus('error');
      }
    }
    void mount();
    return () => { alive = false; if (instance) void instance.destroy(); editorRef.current = null; };
  }, [mode, content, onContentChange]);

  useImperativeHandle(ref, () => ({
    async exportCover() {
      const editor = editorRef.current;
      if (!editor) throw new Error('编辑画板尚未加载完成');
      const [image] = await editor.slides.exportImage({ mode: 'contain', slideIndices: [1], format: 'png', pixelRatio: 1, padding: { horizontal: 24, vertical: 16 } });
      if (!image) throw new Error('未能导出当前画板');
      return image.blob;
    },
  }), []);

  return <div className="sdk-board"><div className="sdk-host" ref={hostRef} />{status !== 'ready' && <div className={`sdk-state ${status === 'error' ? 'is-error' : ''}`}>{status === 'error' ? <TriangleAlert size={18} /> : <LoaderCircle className="spin" size={18} />}{status === 'error' ? 'SDK 加载失败，请检查网络或 App ID' : '正在加载大角几何画板…'}</div>}</div>;
});
