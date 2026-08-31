import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  createEditor,
  type EmbeddedEditor,
  type FileContentLatest,
} from '@dajiaoai/algeo-sdk';
import { LoaderCircle } from 'lucide-react';
import { demoConfig } from './config';

type SdkEditorProps = {
  project: FileContentLatest;
  onSave: (
    project: FileContentLatest,
    image: Blob,
  ) => void | Promise<void>;
};

export type SdkEditorHandle = {
  save: () => Promise<void>;
};

export const SdkEditor = forwardRef<SdkEditorHandle, SdkEditorProps>(
  function SdkEditor({ project, onSave }, ref) {
    const hostRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<EmbeddedEditor | null>(null);
    const onSaveRef = useRef(onSave);
    const [state, setState] = useState<'loading' | 'ready'>('loading');

    useImperativeHandle(
      ref,
      () => ({
        async save() {
          const editor = editorRef.current;
          if (!editor) throw new Error('SDK 编辑画板尚未就绪');
          const content = await editor.document.getContent();
          await exportAndSave(editor, content, onSaveRef.current);
        },
      }),
      [],
    );

    useEffect(() => {
      onSaveRef.current = onSave;
    }, [onSave]);

    useEffect(() => {
      let disposed = false;
      let unsubscribeSave: (() => void) | undefined;

      async function mountEditor() {
        if (!hostRef.current) return;
        setState('loading');
        const editor = await createEditor(hostRef.current, {
          auth: { appId: demoConfig.sdkAppId },
          initialContent: project,
          ui: {
            navbar: false,
            slidePanel: true,
            toolboxPanel: true,
            algebraPanel: true,
            docPanel: false,
            helpEntry: false,
            aiChatPanel: false,
          },
        });
        unsubscribeSave = editor.on('save', async (event) => {
          if (event.stage !== 'request') return;

          try {
            await exportAndSave(editor, event.content, onSaveRef.current);
            return { status: 'success' };
          } catch (error) {
            console.error('大角 SDK 保存或图片导出失败', error);
            return {
              status: 'error',
              message: '保存或图片导出失败，请重试',
            };
          }
        });
        if (disposed) {
          unsubscribeSave();
          await editor.destroy();
          return;
        }
        editorRef.current = editor;
        setState('ready');
      }

      void mountEditor();
      return () => {
        disposed = true;
        unsubscribeSave?.();
        const editor = editorRef.current;
        editorRef.current = null;
        if (editor) void editor.destroy();
      };
    }, [project]);

    return (
      <div className="sdk-editor-shell">
        <div ref={hostRef} className="sdk-editor-host" />
        {state === 'loading' && (
          <div className="sdk-editor-state">
            <LoaderCircle className="spin" size={20} />
            正在加载大角 SDK 编辑画板
          </div>
        )}
      </div>
    );
  },
);

async function exportAndSave(
  editor: EmbeddedEditor,
  project: FileContentLatest,
  onSave: SdkEditorProps['onSave'],
) {
  const [image] = await editor.slides.exportImage({
    mode: 'contain',
    slideIndices: [1],
    format: 'png',
    pixelRatio: 1,
    padding: {
      horizontal: 24,
      vertical: 16,
    },
  });
  if (!image) throw new Error('第一张画板图片导出失败');
  await onSave(project, image.blob);
}
