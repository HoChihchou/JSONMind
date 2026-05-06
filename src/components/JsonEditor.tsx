import React, { useRef, useEffect } from 'react';
import Editor, { OnMount, useMonaco } from '@monaco-editor/react';
import { useJsonStore } from '../store/useJsonStore';
import { Braces, AlertCircle, Check } from 'lucide-react';
import { findPathRange } from '../utils/jsonParser';

export const JsonEditor: React.FC = () => {
  const { jsonText, setJsonText, isValid, error, hoveredPath, selectedPath } = useJsonStore();
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);
  const monaco = useMonaco();
  const isEmpty = jsonText.trim() === '';

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (!editorRef.current || !monaco || !isValid) return;

    const model = editorRef.current.getModel();
    if (!model) return;

    // Prioritize selectedPath over hoveredPath
    const activePath = selectedPath || hoveredPath;

    if (activePath) {
      try {
        const range = findPathRange(jsonText, activePath);
        if (range) {
          const startPos = model.getPositionAt(range.start);
          const endPos = model.getPositionAt(range.end);
          
          const newDecorations = [
            {
              range: new monaco.Range(startPos.lineNumber, startPos.column, endPos.lineNumber, endPos.column),
              options: {
                isWholeLine: false,
                className: 'bg-amber-100 border border-amber-300 rounded',
                inlineClassName: 'bg-amber-100',
              },
            },
          ];
          
          decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, newDecorations);
          editorRef.current.revealRangeInCenter(newDecorations[0].range);
        } else {
          decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
        }
      } catch (e) {
        console.error("Failed to highlight path", e);
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
      }
    } else {
      decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
    }
  }, [hoveredPath, jsonText, isValid, monaco]);

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run();
    }
  };

  return (
    <div className="flex flex-col h-full border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Braces size={18} className="text-slate-600" strokeWidth={2.5} />
          <span className="font-semibold text-slate-700 font-heading">JSON Input</span>
          {isValid && (
            <span className="flex items-center text-xs text-emerald-600 gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Check size={12} strokeWidth={3} />
              Valid
            </span>
          )}
          {!isValid && !isEmpty && (
            <span className="flex items-center text-xs text-red-600 gap-1 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              <AlertCircle size={12} strokeWidth={2.5} />
              Invalid JSON
            </span>
          )}
          {isEmpty && (
            <span className="flex items-center text-xs text-amber-600 gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              <Braces size={12} strokeWidth={2} />
              Please enter JSON
            </span>
          )}
        </div>
        <button
          onClick={handleFormat}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white hover:bg-slate-100 hover:text-slate-800 border border-slate-200 rounded-lg shadow-sm hover:shadow transition-smooth"
          title="Format JSON"
          aria-label="Format JSON"
        >
          <Braces size={16} strokeWidth={2} />
          Format
        </button>
      </div>
      
      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={jsonText}
          onChange={(value) => setJsonText(value || '')}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineHeight: 1.6,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            cursorStyle: 'line',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
          }}
          theme="light"
        />
      </div>
      
      {!isValid && !isEmpty && error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-xs text-red-700 truncate font-mono">
          Error: {error}
        </div>
      )}
    </div>
  );
};
