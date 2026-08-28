import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  createEditor,
  createPresentation,
  type EmbeddedEditor,
  type EmbeddedPresentation,
} from '@dajiaoai/algeo-sdk';
import { LoaderCircle, TriangleAlert } from 'lucide-react';

const appId = 'HLVENKRV';

const construction = [
  'def A := Point(-4, 0)', 'def B := Point(4, 0)', 'def C := Point(-2, 3)',
  'def D := Point(2, 3)', 'def E := Point(-3, 1.5)', 'def F := Point(-1, 0)',
  'def G := Point(1, 0)', 'def O := Point(0, 0)', 'def circleO := Circle(O, 4)',
  'def AB := Segment(A, B)', 'def AD := Segment(A, D)', 'def DC := Segment(D, C)',
  'def CB := Segment(C, B)', 'def EB := Segment(E, B)', 'def EC := Segment(E, C)',
  'label A := "A"', 'label B := "B"', 'label C := "C"', 'label D := "D"',
  'label E := "E"', 'label F := "F"', 'label G := "G"', 'label O := "O"',
];

type BoardProps = { mode: 'editor' | 'presentation' };
export type SmartBoardHandle = { exportCover: () => Promise<Blob> };

export const SmartBoard = forwardRef<SmartBoardHandle, BoardProps>(function SmartBoard({ mode }, ref) {
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
          const editor = await createEditor(hostRef.current, {
            auth: { appId },
            ui: {
              navbar: false,
              slidePanel: false,
              toolboxPanel: true,
              algebraPanel: false,
              docPanel: false,
              helpEntry: false,
              aiChatPanel: false,
            },
          });
          editorRef.current = editor;
          instance = editor;
        } else {
          const presentation = await createPresentation(hostRef.current, {
            auth: { appId },
            ui: { logo: false, slidePanel: false, pencilToolbar: true, zoomControl: true },
          });
          for (const command of construction) await presentation.repl(command);
          instance = presentation;
        }
        if (!alive) {
          await instance.destroy();
          return;
        }
        setStatus('ready');
      } catch (error) {
        console.error('大角 SDK 初始化失败', error);
        if (alive) setStatus('error');
      }
    }
    void mount();
    return () => {
      alive = false;
      if (instance) void instance.destroy();
      editorRef.current = null;
    };
  }, [mode]);

  useImperativeHandle(ref, () => ({
    async exportCover() {
      const editor = editorRef.current;
      if (!editor) throw new Error('编辑画板尚未加载完成');
      const [image] = await editor.slides.exportImage({
        mode: 'contain',
        slideIndices: [1],
        format: 'png',
        pixelRatio: 1,
        padding: { horizontal: 24, vertical: 16 },
      });
      if (!image) throw new Error('未能导出当前画板');
      return image.blob;
    },
  }), []);

  return (
    <div className="sdk-board">
      <div className="sdk-host" ref={hostRef} />
      {status !== 'ready' && (
        <div className={`sdk-state ${status === 'error' ? 'is-error' : ''}`}>
          {status === 'error' ? <TriangleAlert size={18} /> : <LoaderCircle className="spin" size={18} />}
          {status === 'error' ? 'SDK 加载失败，请检查网络或 App ID' : '正在加载大角几何画板…'}
        </div>
      )}
    </div>
  );
});
