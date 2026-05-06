// src/components/HelpModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Keyboard, 
  MousePointer2, 
  Share2, 
  Type, 
  Hash, 
  ToggleLeft, 
  Braces, 
  Brackets,
  Maximize2,
  Grid3X3
} from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const [visible, setVisible] = useState(false);

  // Trigger enter animation on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`} 
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl p-0 w-[640px] max-h-[85vh] overflow-hidden flex flex-col transition-all duration-200 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 font-heading tracking-tight">帮助与使用指南</h3>
            <p className="text-sm text-slate-500 mt-1">关于 JSONMind 的所有使用说明</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200/50 text-slate-500 hover:text-slate-700 rounded-lg transition-smooth"
            aria-label="关闭帮助"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-8 custom-scrollbar">
          
          {/* Shortcuts Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                <Keyboard size={18} />
              </div>
              <h4 className="text-base font-semibold text-slate-800">快捷键</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <ShortcutItem keys={['Tab']} description="为选中容器节点添加子节点" />
              <ShortcutItem keys={['Delete', '/', 'Backspace']} description="删除选中的节点" />
              <ShortcutItem keys={['Ctrl/Cmd', 'Z']} description="撤销" />
              <ShortcutItem keys={['Ctrl/Cmd', 'Shift', 'Z']} description="重做" />
              <ShortcutItem keys={['Ctrl/Cmd', 'M']} description="切换全屏" />
              <ShortcutItem keys={['Esc']} description="关闭弹窗 / 帮助面板" />
            </div>
            <div className="mt-3 space-y-1.5">
              <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 italic">
                快捷键仅在画布聚焦且无弹窗时生效（在输入框中编辑文本时无效）。
              </p>
              <p className="text-xs text-slate-400 bg-slate-50 p-2 rounded border border-slate-100">
                Root 根节点不可删除，其样式带有左侧蓝色强调线以作区分。
              </p>
            </div>
          </section>

          {/* Mouse Actions Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
                <MousePointer2 size={18} />
              </div>
              <h4 className="text-base font-semibold text-slate-800">鼠标操作</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="mt-0.5 min-w-[20px] text-slate-400">单击</div>
                <div>
                  <div className="font-medium text-slate-700 text-sm">选中节点</div>
                  <div className="text-xs text-slate-500">单击任意节点可选中它，底部会显示其 JSON 路径，支持一键复制。</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="mt-0.5 min-w-[20px] text-slate-400">双击</div>
                <div>
                  <div className="font-medium text-slate-700 text-sm">编辑键名或值</div>
                  <div className="text-xs text-slate-500">双击节点上的 Key 区域可重命名键名；双击 Value 区域可编辑值。按 Enter 确认，按 Esc 取消。</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="mt-0.5 min-w-[20px] text-slate-400">右键</div>
                <div>
                  <div className="font-medium text-slate-700 text-sm">右键菜单</div>
                  <div className="text-xs text-slate-500">右键点击任意节点可进行编辑、删除或修改类型。在画布空白处右键可添加根级节点。</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="mt-0.5 min-w-[20px] w-5 h-5 flex items-center justify-center bg-slate-200 rounded-full text-[10px] text-slate-600 font-bold">+</div>
                <div>
                  <div className="font-medium text-slate-700 text-sm">添加节点按钮</div>
                  <div className="text-xs text-slate-500">悬停在 Object/Array 节点上会显示加号 (+) 按钮，点击可快速添加子节点。</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="mt-0.5 min-w-[20px] text-slate-400">滚轮</div>
                <div>
                  <div className="font-medium text-slate-700 text-sm">平移画布</div>
                  <div className="text-xs text-slate-500">滚动鼠标滚轮可上下平移画布；按住 Shift + 滚轮可左右平移。使用左下角控件可缩放。</div>
                </div>
              </div>
            </div>
          </section>

          {/* Toolbar Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                <Grid3X3 size={18} />
              </div>
              <h4 className="text-base font-semibold text-slate-800">工具栏</h4>
            </div>
            
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                <SettingsIcon />
                <span><strong>设置</strong> — 悬停显示网格开关，可切换背景点阵的显示与隐藏。</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                <Maximize2 size={16} className="text-slate-500 shrink-0" />
                <span><strong>全屏</strong> — 切换全屏模式，隐藏左侧编辑器，快捷键 Ctrl+M。</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-base shrink-0">📷</span>
                <span><strong>Export</strong> — 将当前思维导图导出为 PNG 图片。</span>
              </div>
            </div>
          </section>

          {/* Legend Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                <Share2 size={18} />
              </div>
              <h4 className="text-base font-semibold text-slate-800">节点类型图例</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LegendItem icon={Braces} label="对象 (Object)" color="border-slate-300 bg-slate-50 text-slate-600" />
              <LegendItem icon={Brackets} label="数组 (Array)" color="border-slate-300 bg-slate-50 text-slate-600" />
              <LegendItem icon={Type} label="字符串 (String)" color="border-emerald-200 bg-emerald-50 text-emerald-700" />
              <LegendItem icon={Hash} label="数字 (Number)" color="border-sky-200 bg-sky-50 text-sky-700" />
              <LegendItem icon={ToggleLeft} label="布尔值 (Boolean)" color="border-amber-200 bg-amber-50 text-amber-700" />
              <LegendItem icon={() => <span className="text-sm font-bold">R</span>} label="根节点 (Root)" color="border-l-4 border-l-primary-500 bg-primary-50/30 border-slate-200 text-primary-700" />
            </div>
          </section>

        </div>
        
      </div>
    </div>
  );
};

// Inline Settings icon for toolbar section
const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 shrink-0">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const ShortcutItem: React.FC<{ keys: string[]; description: string }> = ({ keys, description }) => (
  <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-100 shadow-sm">
    <span className="text-xs font-medium text-slate-600">{description}</span>
    <div className="flex gap-1 flex-shrink-0">
      {keys.map((k, i) => (
        <span key={i} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-500 font-mono shadow-[0_1px_0_theme(colors.slate.300)]">
          {k}
        </span>
      ))}
    </div>
  </div>
);

const LegendItem: React.FC<{ icon: any; label: string; color: string }> = ({ icon: Icon, label, color }) => (
  <div className={`flex items-center gap-3 p-2.5 rounded-lg border ${color}`}>
    <Icon size={16} strokeWidth={2} />
    <span className="text-sm font-semibold">{label}</span>
  </div>
);
