import React from 'react';
import { Type, Hash, ToggleLeft, Braces, Brackets, Copy, Ban, Trash2 } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAddNode: (type: 'string' | 'number' | 'boolean' | 'object' | 'array') => void;
  onDelete?: () => void;
  onSetNull?: () => void;
  onCopyPath?: () => void;
  targetType: 'canvas' | 'node';
  nodeType?: string;
  isRoot?: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onAddNode, onDelete, onSetNull, onCopyPath, targetType, nodeType, isRoot }) => {
  const canAddChild = targetType === 'canvas' || nodeType === 'object' || nodeType === 'array';

  return (
    <div 
      className="fixed z-50 bg-white border border-slate-200 rounded-lg shadow-xl py-1 w-auto"
      style={{ top: y, left: x }}
      onMouseLeave={onClose}
    >
      {canAddChild && (
        <>
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Add {targetType === 'canvas' ? 'to Root' : 'Child'}
          </div>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 flex items-center gap-2 whitespace-nowrap transition-smooth cursor-pointer"
            onClick={() => onAddNode('string')}
            title="Add string value"
          >
            <Type size={16} className="text-emerald-600" strokeWidth={2} /> String
          </button>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-sky-50 flex items-center gap-2 whitespace-nowrap transition-smooth cursor-pointer"
            onClick={() => onAddNode('number')}
            title="Add numeric value"
          >
            <Hash size={16} className="text-sky-600" strokeWidth={2} /> Number
          </button>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-amber-50 flex items-center gap-2 whitespace-nowrap transition-smooth cursor-pointer"
            onClick={() => onAddNode('boolean')}
            title="Add boolean value (true/false)"
          >
            <ToggleLeft size={16} className="text-amber-600" strokeWidth={2} /> Boolean
          </button>
          <div className="border-t border-slate-100 my-1"></div>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2 whitespace-nowrap transition-smooth cursor-pointer"
            onClick={() => onAddNode('object')}
            title="Add object container"
          >
            <Braces size={16} className="text-slate-600" strokeWidth={2} /> Object
          </button>
          <button 
            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2 whitespace-nowrap transition-smooth cursor-pointer"
            onClick={() => onAddNode('array')}
            title="Add array container"
          >
            <Brackets size={16} className="text-slate-600" strokeWidth={2} /> Array
          </button>
        </>
      )}
      
      {targetType === 'node' && (
        <>
          <div className="border-t border-slate-100 my-1"></div>
          {onCopyPath && (
            <button 
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2 whitespace-nowrap transition-smooth cursor-pointer"
              onClick={onCopyPath}
              title="Copy JSON path to clipboard"
            >
              <Copy size={16} className="text-slate-500" strokeWidth={2} /> Copy Path
            </button>
          )}
          {onSetNull && (
            <button 
              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2 whitespace-nowrap transition-smooth cursor-pointer"
              onClick={onSetNull}
              title="Change value to null"
            >
              <Ban size={16} className="text-slate-500" strokeWidth={2} /> Set to Null
            </button>
          )}
          {onDelete && !isRoot && (
            <button 
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 whitespace-nowrap transition-smooth cursor-pointer"
              onClick={onDelete}
              title="Delete this node (Press Delete)"
            >
              <Trash2 size={16} strokeWidth={2} /> Delete Node
            </button>
          )}
        </>
      )}
    </div>
  );
};
