import { ChangeEvent, type MutableRefObject, useEffect, useRef, useState } from 'react';
import {
  Bell, BookOpen, ChevronDown, CircleHelp, ClipboardList, FileText,
  GraduationCap, ImageUp, LayoutDashboard, LoaderCircle, MonitorPlay, Settings, Upload, Users, X,
} from 'lucide-react';
import { SmartBoard, type BoardContent, type SmartBoardHandle } from './SmartBoard';

const question = {
  sid: 'M0MSGJA4',
  content: '如图，矩形 ABCD 内接于圆 O，E 是弧 AD 上一点，连接 EB、EC，分别交 AD 于点 F、G。若 AF=1，EG=FG=3，则圆 O 的直径为____。',
  answer: '2√14',
  categories: ['九年级', '相似三角形', '圆的基本性质', '勾股定理'],
};

type Tab = 'admin' | 'student';
type QuestionForm = { type: string; difficulty: string; tags: string[]; content: string; answer: string };
const navigation = [
  { icon: LayoutDashboard, label: '首页' }, { icon: ClipboardList, label: '题库管理' },
  { icon: FileText, label: '试卷管理' }, { icon: Users, label: '班级管理' },
  { icon: GraduationCap, label: '学情分析' }, { icon: Settings, label: '设置中心' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('admin');
  const [answer, setAnswer] = useState('');
  const [questionImage, setQuestionImage] = useState<string | null>(null);
  const [boardContent, setBoardContent] = useState<BoardContent | null>(null);
  const [form, setForm] = useState<QuestionForm>({ type: 'geometry', difficulty: 'medium', tags: question.categories, content: question.content, answer: question.answer });
  const generatedUrl = useRef<string | null>(null);
  useEffect(() => () => { if (generatedUrl.current) URL.revokeObjectURL(generatedUrl.current); }, []);

  return <div className="page-shell">
    <header className="topbar">
      <a href="/" className="brand"><span className="brand-logo"><BookOpen size={23} /></span><strong>在线教育平台</strong></a>
      <div className="mode-tabs" role="tablist" aria-label="示例视图切换">
        <button className={tab === 'admin' ? 'active' : ''} onClick={() => setTab('admin')}><LayoutDashboard size={15} /> 后台管理系统</button>
        <button className={tab === 'student' ? 'active' : ''} onClick={() => setTab('student')}><MonitorPlay size={15} /> 前台学生展示</button>
      </div>
      <div className="account"><Bell size={19} /><span className="avatar">林</span><span>林老师</span><ChevronDown size={14} /></div>
    </header>
    {tab === 'admin'
      ? <AdminView image={questionImage} setImage={setQuestionImage} generatedUrl={generatedUrl} form={form} setForm={setForm} onContentChange={setBoardContent} />
      : <StudentView answer={answer} setAnswer={setAnswer} form={form} boardContent={boardContent} />}
  </div>;
}

function AdminView({ image, setImage, generatedUrl, form, setForm, onContentChange }: { image: string | null; setImage: (value: string | null) => void; generatedUrl: MutableRefObject<string | null>; form: QuestionForm; setForm: (value: QuestionForm) => void; onContentChange: (content: BoardContent) => void }) {
  const boardRef = useRef<SmartBoardHandle>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [imageNotice, setImageNotice] = useState('');
  const [newTag, setNewTag] = useState('');
  const updateForm = (patch: Partial<QuestionForm>) => setForm({ ...form, ...patch });
  const updateImage = (nextImage: string) => {
    if (generatedUrl.current) URL.revokeObjectURL(generatedUrl.current);
    generatedUrl.current = nextImage.startsWith('blob:') ? nextImage : null;
    setImage(nextImage);
  };
  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setImageNotice('请选择 PNG、JPG 或 SVG 图片。'); return; }
    updateImage(URL.createObjectURL(file));
    setImageNotice(`已选择本地图片：${file.name}`);
    event.target.value = '';
  };
  const generateFromBoard = async () => {
    setExporting(true); setImageNotice('');
    try { updateImage(URL.createObjectURL(await boardRef.current!.exportCover())); setImageNotice('已从当前画板生成题目配图。'); }
    catch (error) { setImageNotice(error instanceof Error ? error.message : '画板导出失败，请重试。'); }
    finally { setExporting(false); }
  };
  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !form.tags.includes(tag)) updateForm({ tags: [...form.tags, tag] });
    setNewTag('');
  };
  return <div className="admin-layout">
    <aside className="sidebar">
      <div className="school"><span>青藤中学</span><small>智慧课堂 · 教师端</small></div>
      {navigation.map(({ icon: Icon, label }) => <button className={label === '题库管理' ? 'active' : ''} key={label}><Icon size={18} />{label}</button>)}
      <div className="side-bottom"><CircleHelp size={16} /> 使用帮助</div>
    </aside>
    <main className="admin-main">
      <div className="breadcrumb">题库管理 <span>/</span> 题目编辑 <span>/</span> {question.sid}</div>
      <div className="page-heading"><div><h1>编辑题目</h1></div></div>
      <div className="editor-layout">
        <section className="question-form">
          <div className="section-title"><span>01</span><h2>题目信息</h2></div>
          <div className="form-grid">
            <label>题目类型<select value={form.type} onChange={event => updateForm({ type: event.target.value })}><option value="geometry">几何综合题</option><option value="proof">几何证明题</option><option value="choice">单项选择题</option><option value="fill">填空题</option></select></label>
            <label>难度<select value={form.difficulty} onChange={event => updateForm({ difficulty: event.target.value })}><option value="easy">简单</option><option value="medium">中等</option><option value="hard">困难</option></select></label>
          </div>
          <div className="readonly-field"><span>题目编号</span><strong>{question.sid}</strong><small>题目编号创建后不可修改</small></div>
          <label>知识标签<div className="tags">{form.tags.map(item => <span key={item}>{item}<button type="button" aria-label={`删除标签 ${item}`} onClick={() => updateForm({ tags: form.tags.filter(tag => tag !== item) })}><X size={11} /></button></span>)}</div><div className="tag-adder"><input value={newTag} onChange={event => setNewTag(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addTag(); } }} placeholder="输入标签后添加" /><button type="button" onClick={addTag}>+ 添加</button></div></label>
          <div className="content-label"><span>题目内容</span><small>支持 LaTex 公式</small></div>
          <div className="rich-editor"><div className="formatting"><button type="button" onClick={() => updateForm({ content: `**${form.content}**` })}><b>B</b></button><button type="button" onClick={() => updateForm({ content: `${form.content}\n\n$\\sqrt{14}$` })}>∑</button><span>编辑内容会同步到学生端</span></div><textarea value={form.content} onChange={event => updateForm({ content: event.target.value })} aria-label="题目内容" /></div>
          <div className="image-field"><div className="content-label"><span>题目配图</span><small>建议使用清晰的几何图</small></div><div className="image-manager">{image ? <a className="image-preview-link" href={image} target="_blank" rel="noreferrer" title="在新标签页查看大图"><img src={image} alt="题目配图预览" /><span>查看大图</span></a> : <div className="image-empty"><ImageUp size={19} /><span>暂未添加配图</span></div>}<div className="image-actions"><strong>{image ? '题目配图' : '添加题目配图'}</strong><span>支持 PNG、JPG、SVG</span><div><button type="button" onClick={() => fileRef.current?.click()}><Upload size={13} />本地上传</button><button type="button" className="generate" disabled={exporting} onClick={() => void generateFromBoard()}>{exporting ? <LoaderCircle className="spin" size={13} /> : <ImageUp size={13} />}{exporting ? '生成中' : '从画板生成'}</button>{image && <button type="button" className="remove-image" onClick={() => { setImage(null); setImageNotice('已移除题目配图。'); }}>移除</button>}</div></div><input ref={fileRef} className="file-input" type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={uploadImage} /></div>{imageNotice && <small className="image-notice">{imageNotice}</small>}</div>
          <label>参考答案<input value={form.answer} onChange={event => updateForm({ answer: event.target.value })} /></label>
        </section>
        <section className="board-section">
          <div className="board-heading"><div><span className="section-number">02</span><h2>动态几何画板</h2></div><span className="sdk-badge">ALGO SDK · EDITOR</span></div>
          <div className="editor-board"><SmartBoard ref={boardRef} mode="editor" onContentChange={onContentChange} /></div>
          <div className="board-note"><span className="dot" /> 画板内容会随题目一起保存</div>
        </section>
      </div>
    </main>
  </div>;
}

function StudentView({ answer, setAnswer, form, boardContent }: { answer: string; setAnswer: (value: string) => void; form: QuestionForm; boardContent: BoardContent | null }) {
  return <main className="student-stage">
    <div className="student-label"><GraduationCap size={18} /> 学生端互动预览</div>
    <div className="ipad"><div className="ipad-camera" /><div className="tablet-screen">
      <header className="student-header"><span>‹</span><strong>{form.type === 'geometry' ? '几何综合题' : '互动练习'}</strong><button><FileText size={16} /> 草稿纸</button></header>
      <div className="student-content"><div className="student-board"><SmartBoard mode="presentation" content={boardContent} /></div><section className="question-card"><div className="question-tabs"><strong>题目</strong></div><p>{form.content}</p><div className="answer-row"><span>我的答案</span><input value={answer} onChange={event => setAnswer(event.target.value)} placeholder="请输入答案" /><button onClick={() => setAnswer(form.answer)}>提交</button></div>{answer === form.answer && <div className="correct">回答正确！参考答案：{form.answer}</div>}</section></div>
    </div></div>
    <p className="student-caption">演示模式 · 当前画板使用教师最近一次编辑后的内容</p>
  </main>;
}
