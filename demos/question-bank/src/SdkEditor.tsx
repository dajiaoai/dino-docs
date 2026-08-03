import { useEffect, useRef, useState } from 'react';
import {
  createEditor,
  type EmbeddedEditor,
  type FileContentLatest,
} from '@dajiaoai/algeo-sdk';
import { LoaderCircle, TriangleAlert } from 'lucide-react';
import { demoConfig } from './config';

type SdkEditorProps = {
  project: FileContentLatest;
};

export function SdkEditor({ project }: SdkEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<EmbeddedEditor | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let disposed = false;

    async function mountEditor() {
      if (!hostRef.current) return;
      setState('loading');
      try {
        const editor = await createEditor(hostRef.current, {
          auth: { appId: demoConfig.sdkAppId },
          initialContent: project,
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
        if (disposed) {
          await editor.destroy();
          return;
        }
        editorRef.current = editor;
        setState('ready');
      } catch (error) {
        console.error('大角 SDK 初始化失败', error);
        if (!disposed) setState('error');
      }
    }

    void mountEditor();
    return () => {
      disposed = true;
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
          正在通过大角 SDK 加载 project.json
        </div>
      )}
      {state === 'error' && (
        <div className="sdk-editor-state is-error">
          <TriangleAlert size={20} />
          SDK 加载失败，请检查网络和 Demo App ID 配置
        </div>
      )}
    </div>
  );
}
