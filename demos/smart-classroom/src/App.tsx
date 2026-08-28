import { ChangeEvent, type MutableRefObject, useEffect, useRef, useState } from 'react';
import {
  Bell, BookOpen, ChevronDown, CircleHelp, ClipboardList, FileText,
  GraduationCap, ImageUp, LayoutDashboard, LoaderCircle, MonitorPlay, Save, Settings, Upload, Users,
} from 'lucide-react';
import { SmartBoard, type SmartBoardHandle } from './SmartBoard';

const question = {
  sid: 'M0MSGJA4',
  content: '如图，矩形 ABCD 内接于圆 O，E 是弧 AD 上一点，连接 EB、EC，分别交 AD 于点 F、G。若 AF=1，EG=FG=3，则圆 O 的直径为____。',
  answer: '2√14',
  categories: ['九年级', '相似三角形', '圆的基本性质', '勾股定理'],
  image: 'https://dl.easeplay.vip/algeo/68550f5b84833f05f53dbe10/a0943621-image.png',
};

type Tab = 'admin' | 'student';
const navigation = [
  { icon: LayoutDashboard, label: '首页' }, { icon: ClipboardList, label: '题库管理' },
  { icon: FileText, label: '试卷管理' }, { icon: Users, label: '班级管理' },
  { icon: GraduationCap, label: '学情分析' }, { icon: Settings, label: '设置中心' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('admin');
  const [saved, setSaved] = useState(false);
  const [answer, setAnswer] = useState('');
  const [questionImage, setQuestionImage] = useState(question.image);
  const generatedUrl = useRef<string | null>(null);
  useEffect(() => () => { if (generatedUrl.current) URL.revokeObjectURL(generatedUrl.current); }, []);

  const save = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="page-shell">
      <header className="topbar">
        <a href="/" className="brand"><span className="brand-logo"><BookOpen size={23} /></span><strong>在线教育平台</strong></a>
        <div className="mode-tabs" role="tablist" aria-label="示例视图切换">
          <button className={tab === 'admin' ? 'active' : ''} onClick={() => setTab('admin')}><LayoutDashboard size={15} /> 后台管理系统</button>
          <button className={tab === 'student' ? 'active' : ''} onClick={() => setTab('student')}><MonitorPlay size={15} /> 前台学生展示</button>
        </div>
        <div className="account"><Bell size={19} /><span className="avatar">林</span><span>林老师</span><ChevronDown size={14} /></div>
      </header>
      {tab === 'admin' ? <AdminView saved={saved} onSave={save} image={questionImage} setImage={setQuestionImage} generatedUrl={generatedUrl} /> : <StudentView answer={answer} setAnswer={setAnswer} />}
    </div>
  );
}

function AdminView({ saved, onSave, image, setImage, generatedUrl }: { saved: boolean; onSave: () => void; image: string; setImage: (value: string) => void; generatedUrl: MutableRefObject<string | null> }) {
  const boardRef = useRef<SmartBoardHandle>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [imageNotice, setImageNotice] = useState('');
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
  return <div className="admin-layout">
    <aside className="sidebar">
      <div className="school"><span>青藤中学</span><small>智慧课堂 · 教师端</small></div>
      {navigation.map(({ icon: Icon, label }) => {
        return <button className={label === '题库管理' ? 'active' : ''} key={label}><Icon size={18} />{label}</button>;
      })}
      <div className="side-bottom"><CircleHelp size={16} /> 使用帮助</div>
    </aside>
    <main className="admin-main">
      <div className="breadcrumb">题库管理 <span>/</span> 题目编辑 <span>/</span> {question.sid}</div>
      <div className="page-heading"><div><h1>编辑题目</h1><p>创建可互动的几何题，让每一次拖动都成为思考。</p></div><div className="heading-status"><span className="dot" /> 自动保存已开启</div></div>
      <div className="editor-layout">
        <section className="question-form">
          <div className="section-title"><span>01</span><h2>题目信息</h2></div>
          <div className="form-grid"><label>题目类型<select defaultValue="geometry"><option value="geometry">几何综合题</option></select></label><label>难度<select defaultValue="medium"><option value="medium">中等</option></select></label></div>
          <label>题目标题<input defaultValue="圆与矩形综合题" /></label>
          <label>题目编号<input defaultValue={question.sid} /></label>
          <label>知识标签<div className="tags">{question.categories.map(item => <span key={item}>{item}</span>)}<button>+ 添加</button></div></label>
          <div className="content-label"><span>题目内容</span><small>支持 LaTex 公式</small></div>
          <div className="rich-editor"><div className="formatting"><b>B</b><i>I</i><span>☰</span><span>≡</span><span>∑</span><span>图片</span></div><p>{question.content}</p></div>
          <div className="image-field"><div className="content-label"><span>题目配图</span><small>建议使用清晰的几何图</small></div><div className="image-manager"><a className="image-preview-link" href={image} target="_blank" rel="noreferrer" title="在新标签页查看大图"><img src={image} alt="题目配图预览" /><span>查看大图</span></a><div className="image-actions"><strong>题目配图</strong><span>支持 PNG、JPG、SVG · 点击预览可查看大图</span><div><button type="button" onClick={() => fileRef.current?.click()}><Upload size={13} />本地上传</button><button type="button" className="generate" disabled={exporting} onClick={() => void generateFromBoard()}>{exporting ? <LoaderCircle className="spin" size={13} /> : <ImageUp size={13} />}{exporting ? '生成中' : '从画板生成'}</button></div></div><input ref={fileRef} className="file-input" type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={uploadImage} /></div>{imageNotice && <small className="image-notice">{imageNotice}</small>}</div>
          <label>参考答案<input defaultValue={question.answer} /></label>
        </section>
        <section className="board-section">
          <div className="board-heading"><div><span className="section-number">02</span><h2>动态几何画板</h2><p>使用 algeo-sdk 编辑模式，可直接构造、拖动和标注。</p></div><span className="sdk-badge">ALGO SDK · EDITOR</span></div>
          <div className="editor-board"><SmartBoard ref={boardRef} mode="editor" /></div>
          <div className="board-note"><span className="dot" /> 画板内容会随题目一起保存 <button>在新窗口打开</button></div>
        </section>
      </div>
      <div className="actionbar"><button className="cancel">取消</button><button className="save" onClick={onSave}><Save size={16} />{saved ? '已保存' : '保存题目'}</button></div>
    </main>
  </div>;
}

function StudentView({ answer, setAnswer }: { answer: string; setAnswer: (value: string) => void }) {
  return <main className="student-stage">
    <div className="student-label"><GraduationCap size={18} /> 学生端互动预览</div>
    <div className="ipad">
      <div className="ipad-camera" />
      <div className="tablet-screen">
        <header className="student-header"><span>‹</span><strong>圆与矩形综合题</strong><button><FileText size={16} /> 草稿纸</button></header>
        <div className="student-content"><div className="student-board"><SmartBoard mode="presentation" /></div><section className="question-card"><div className="question-tabs"><strong>题目</strong><span>提示</span><span>解析</span></div><p>{question.content}</p><div className="answer-row"><span>我的答案</span><input value={answer} onChange={event => setAnswer(event.target.value)} placeholder="请输入答案" /><button onClick={() => setAnswer(question.answer)}>提交</button></div>{answer === question.answer && <div className="correct">回答正确！圆 O 的直径为 2√14</div>}</section></div>
      </div>
    </div>
    <p className="student-caption">演示模式 · 学生可拖动画板中的点，观察图形关系与不变量</p>
  </main>;
}
