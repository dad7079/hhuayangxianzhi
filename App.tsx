import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Link, useParams, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './Layout';
import { Volume, ContentType } from './types';
import { generateAssistantContent } from './geminiService';

// --- MOCK DATA GENERATOR ---
const INITIAL_VOLUMES: Volume[] = Array.from({ length: 44 }, (_, i) => ({
  id: `vol-${i + 1}`,
  title: `卷${['一','二','三','四','五','六','七','八','九','十','十一','十二','十三','十四','十五','十六','十七','十八','十九','二十','二十一','二十二','二十三','二十四','二十五','二十六','二十七','二十八','二十九','三十','三十一','三十二','三十三','三十四','三十五','三十六','三十七','三十八','三十九','四十','四十一','四十二','四十三','四十四'][i]}`,
  original: i === 0 
    ? `<p>华阳县，古蜀国地。秦灭蜀，置蜀郡。汉因之。...</p><p>（此处为示例原文，管理员可登录后编辑完整内容）</p>` 
    : `<p>待录入...</p>`,
  annotation: i === 0 
    ? `<ul><li><strong>古蜀国</strong>: 指四川盆地古代建立的国家。</li><li><strong>蜀郡</strong>: 秦国灭蜀后设立的行政区划。</li></ul>` 
    : ``,
  translation: i === 0 
    ? `<p>华阳县，是古代蜀国的领地。秦国灭掉蜀国后，设置了蜀郡。汉朝沿袭了这一建制...</p>` 
    : ``
}));

// --- COMPONENTS ---

// Basic WYSIWYG Editor for Rich Text
const RichEditor = ({ value, onChange, placeholder }: { value: string, onChange: (val: string) => void, placeholder: string }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync external value changes to editor
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value && !isFocused) {
      editorRef.current.innerHTML = value;
    }
  }, [value, isFocused]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  return (
    <div className="flex flex-col border border-ink/20 bg-white/60 min-h-[400px] shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-ink/10 bg-paper sticky top-0 z-20">
        <ToolButton onClick={() => exec('bold')} label="B" title="加粗" bold />
        <ToolButton onClick={() => exec('italic')} label="I" title="斜体" italic />
        <ToolButton onClick={() => exec('underline')} label="U" title="下划线" underline />
        <div className="w-px h-6 bg-ink/20 mx-1 self-center"></div>
        <ToolButton onClick={() => exec('formatBlock', 'H3')} label="标题" title="标题" />
        <ToolButton onClick={() => exec('formatBlock', 'P')} label="正文" title="正文" />
        <div className="w-px h-6 bg-ink/20 mx-1 self-center"></div>
        <ToolButton onClick={() => exec('insertUnorderedList')} label="• 列表" title="无序列表" />
        <ToolButton onClick={() => exec('insertOrderedList')} label="1. 列表" title="有序列表" />
        <div className="w-px h-6 bg-ink/20 mx-1 self-center"></div>
        <ToolButton onClick={() => {
            const url = prompt("请输入图片地址 (URL):");
            if (url) exec('insertImage', url);
        }} label="📷 图片" title="插入图片" />
        <ToolButton onClick={() => exec('removeFormat')} label="🧹 清除格式" title="清除格式" danger />
      </div>
      
      {/* Editable Area */}
      <div 
        ref={editorRef}
        className="editor-content flex-grow p-6 outline-none prose prose-stone max-w-none overflow-y-auto leading-loose"
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        data-placeholder={placeholder}
      />
    </div>
  );
};

const ToolButton = ({ onClick, label, title, bold, italic, underline, danger }: any) => (
  <button 
    onClick={(e) => { e.preventDefault(); onClick(); }}
    title={title}
    className={`
      px-3 py-1.5 text-sm rounded transition-colors border border-transparent
      ${danger ? 'text-red-800 hover:bg-red-50' : 'text-ink hover:bg-ink/10 hover:border-ink/20'}
      ${bold ? 'font-bold' : ''}
      ${italic ? 'italic' : ''}
      ${underline ? 'underline' : ''}
    `}
  >
    {label}
  </button>
);

const Home = ({ volumes }: { volumes: Volume[] }) => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-calligraphy text-ink/80 mb-2">目录</h2>
        <div className="w-16 h-1 bg-seal mx-auto rounded-full opacity-60"></div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {volumes.map((vol) => (
          <Link 
            key={vol.id} 
            to={`/read/${vol.id}`}
            className="group relative flex flex-col items-center p-4 border border-ink/20 hover:border-seal/50 bg-paper-dark/30 transition-all duration-300 hover:shadow-md hover:-translate-y-1"
          >
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-paper border border-ink/20 rounded-full flex items-center justify-center text-xs text-ink/40 group-hover:text-seal group-hover:border-seal">
              ✧
            </div>
            <span className="text-xl md:text-2xl font-calligraphy writing-vertical-md text-ink group-hover:text-seal mt-2">
              {vol.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

const Reader = ({ volumes }: { volumes: Volume[] }) => {
  const { id } = useParams();
  const volume = volumes.find(v => v.id === id);
  const [tab, setTab] = useState<ContentType>('original');

  if (!volume) return <Navigate to="/" />;

  const tabs: {id: ContentType, label: string}[] = [
    { id: 'original', label: '原文' },
    { id: 'annotation', label: '注释' },
    { id: 'translation', label: '译文' },
  ];

  const currentContent = volume[tab];
  const isEmpty = !currentContent || currentContent === '<p><br></p>' || currentContent.trim() === '';

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-ink/10">
        <h2 className="text-3xl font-calligraphy text-seal">{volume.title}</h2>
        <div className="flex space-x-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1 text-sm md:text-base border transition-all duration-300 ${
                tab === t.id 
                  ? 'bg-ink text-paper border-ink shadow-md' 
                  : 'bg-transparent text-ink/60 border-ink/20 hover:border-ink/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="prose prose-stone prose-lg max-w-none font-serif leading-loose text-justify min-h-[400px]">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-64 text-ink/30 italic">
            <span className="text-4xl mb-4">❖</span>
            <p>暂无{tabs.find(t => t.id === tab)?.label}内容</p>
          </div>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: currentContent }} />
        )}
      </div>

      <div className="mt-12 text-center">
         <Link to="/" className="inline-block px-6 py-2 border-t border-b border-ink/20 text-ink/50 hover:text-seal hover:border-seal transition-colors">
            返回目录
         </Link>
      </div>
    </div>
  );
};

const Login = ({ onLogin }: { onLogin: (status: boolean) => void }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (user === 'llh' && pass === '9090980') {
      onLogin(true);
      navigate('/admin');
    } else {
      setError('用户名或密码错误');
    }
  };

  return (
    <div className="flex justify-center items-center py-20">
      <form onSubmit={handleLogin} className="w-full max-w-sm bg-white/50 p-8 border border-ink/20 shadow-xl backdrop-blur-sm">
        <h3 className="text-2xl font-title text-center mb-6 text-ink">管理员登录</h3>
        <div className="mb-4">
          <label className="block text-ink/70 mb-1">用户名</label>
          <input 
            type="text" 
            value={user}
            onChange={e => setUser(e.target.value)}
            className="w-full bg-paper border-b border-ink/30 p-2 outline-none focus:border-seal transition-colors"
          />
        </div>
        <div className="mb-6">
          <label className="block text-ink/70 mb-1">密码</label>
          <input 
            type="password" 
            value={pass}
            onChange={e => setPass(e.target.value)}
            className="w-full bg-paper border-b border-ink/30 p-2 outline-none focus:border-seal transition-colors"
          />
        </div>
        {error && <p className="text-seal text-sm mb-4">{error}</p>}
        <button type="submit" className="w-full bg-ink text-paper py-2 hover:bg-seal transition-colors duration-300">
          登 录
        </button>
      </form>
    </div>
  );
};

const AdminDashboard = ({ volumes, onUpdate }: { volumes: Volume[], onUpdate: (v: Volume) => void }) => {
  const [selectedId, setSelectedId] = useState(volumes[0].id);
  const [editTab, setEditTab] = useState<ContentType>('original');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const activeVol = volumes.find(v => v.id === selectedId);

  useEffect(() => {
    if (activeVol) setContent(activeVol[editTab]);
  }, [activeVol, editTab]);

  const handleSave = () => {
    if (!activeVol) return;
    setIsSaving(true);
    const updated = { ...activeVol, [editTab]: content };
    onUpdate(updated);
    setTimeout(() => setIsSaving(false), 500); // Fake delay for UX
  };

  const handleAiAssist = async () => {
    if (!activeVol || !activeVol.original) {
        alert("请先确保“原文”内容不为空");
        return;
    }
    if (editTab === 'original') {
        alert("AI助手只能用于生成注释或译文");
        return;
    }

    if (!window.confirm("确定要使用 Gemini AI 自动生成内容吗？这将覆盖当前编辑框的内容。")) return;

    setIsAiLoading(true);
    try {
        const generated = await generateAssistantContent(activeVol.original, editTab);
        setContent(generated);
    } catch (e: any) {
        alert(e.message);
    } finally {
        setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      {/* Sidebar List */}
      <div className="w-full md:w-1/4 border-r border-ink/10 pr-4 h-[600px] overflow-y-auto">
        <h3 className="font-bold text-lg mb-4 text-seal">卷目列表</h3>
        <ul>
          {volumes.map(v => (
            <li 
              key={v.id}
              onClick={() => setSelectedId(v.id)}
              className={`cursor-pointer p-2 mb-1 rounded ${selectedId === v.id ? 'bg-ink text-paper' : 'hover:bg-black/5'}`}
            >
              {v.title}
            </li>
          ))}
        </ul>
      </div>

      {/* Editor Area */}
      <div className="w-full md:w-3/4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-calligraphy">{activeVol?.title} - 编辑</h2>
            <div className="flex gap-2">
                 {editTab !== 'original' && (
                    <button 
                        onClick={handleAiAssist}
                        disabled={isAiLoading}
                        className={`px-3 py-1 bg-purple-700 text-white text-sm rounded hover:opacity-90 flex items-center gap-1 ${isAiLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isAiLoading ? '生成中...' : '✨ AI 生成'}
                    </button>
                 )}
                <button 
                  onClick={handleSave}
                  className="px-4 py-1 bg-seal text-white rounded hover:bg-red-800 transition-colors shadow-sm"
                >
                  {isSaving ? '保存中...' : '保存修改'}
                </button>
            </div>
        </div>

        <div className="flex border-b border-ink/20 mb-4">
          {(['original', 'annotation', 'translation'] as ContentType[]).map(t => (
            <button
              key={t}
              onClick={() => setEditTab(t)}
              className={`mr-4 pb-2 px-2 ${editTab === t ? 'border-b-2 border-seal text-seal font-bold' : 'text-ink/60'}`}
            >
              {t === 'original' ? '原文' : t === 'annotation' ? '注释' : '译文'}
            </button>
          ))}
        </div>

        <p className="text-xs text-ink/40 mb-2">可直接粘贴 Word 文档内容（带格式）</p>
        
        {/* Rich Text Editor Replacement */}
        <RichEditor
            key={`${selectedId}-${editTab}`} // Force re-render on tab switch to prevent stale content
            value={content}
            onChange={setContent}
            placeholder={`在此输入或粘贴${editTab === 'original' ? '原文' : editTab === 'annotation' ? '注释' : '译文'}...`}
        />
      </div>
    </div>
  );
};

// --- MAIN APP ---

const App = () => {
  // Initialize state from local storage or mock data
  const [volumes, setVolumes] = useState<Volume[]>(() => {
    const saved = localStorage.getItem('huayang_volumes');
    return saved ? JSON.parse(saved) : INITIAL_VOLUMES;
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('admin_logged_in') === 'true';
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('huayang_volumes', JSON.stringify(volumes));
  }, [volumes]);

  const handleUpdateVolume = (updatedVol: Volume) => {
    setVolumes(prev => prev.map(v => v.id === updatedVol.id ? updatedVol : v));
  };

  const handleLogin = (status: boolean) => {
    setIsAdmin(status);
    sessionStorage.setItem('admin_logged_in', status.toString());
  };

  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('admin_logged_in');
    // Navigation is now handled in Layout component
  };

  return (
    <HashRouter>
      <Layout isAdmin={isAdmin} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Home volumes={volumes} />} />
          <Route path="/read/:id" element={<Reader volumes={volumes} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route 
            path="/admin" 
            element={
              isAdmin ? (
                <AdminDashboard volumes={volumes} onUpdate={handleUpdateVolume} />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;