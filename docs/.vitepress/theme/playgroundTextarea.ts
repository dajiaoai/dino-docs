export interface TextareaAction {
  id: string;
  label: string;
  disabled?: boolean;
  upload?: {
    accept: string;
    read?: (file: File) => Promise<string>;
    validate?: (content: string, file: File) => void | Promise<void>;
  };
}

export const templateTextareaActions: TextareaAction[] = [
  {
    id: 'upload', label: '本地上传',
    upload: {
      accept: '.json,application/json',
      validate(content) {
        let value: unknown;
        try { value = JSON.parse(content); }
        catch { throw new Error('母版文件不是有效的 JSON，请检查文件内容。'); }
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
          throw new Error('母版文件内容必须是 JSON 对象。');
        }
      },
    },
  },
  { id: 'clear', label: '清空' },
];
