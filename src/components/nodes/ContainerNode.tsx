import { memo, useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Braces, Brackets, Plus, Trash2 } from 'lucide-react';
import { useJsonStore } from '../../store/useJsonStore';
import { TYPE_COLORS, NODE_STYLES } from '../../config/constants';

import clsx from 'clsx';

export const ContainerNode = memo(({ data }: NodeProps) => {
  const { label, isArray, path, onAddChild } = data;
  const { renameNodeKey, deleteNode, selectedPath } = useJsonStore();
  const isSelected = selectedPath?.join('.') === path?.join('.');
  const isRoot = path?.length === 1 && path[0] === 'root';

  const [isEditingKey, setIsEditingKey] = useState(false);
  const [localKey, setLocalKey] = useState(label);
  const [showActions, setShowActions] = useState(false);
  const [editWidth, setEditWidth] = useState<number | null>(null);
  const keyInputRef = useRef<HTMLTextAreaElement>(null);
  const keyDisplayRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const containerClass = isArray 
    ? TYPE_COLORS.array
    : TYPE_COLORS.object;

  useEffect(() => {
    setLocalKey(label);
  }, [label]);

  const startEditingKey = useCallback(() => {
    // Lock the current width before entering edit mode
    if (keyDisplayRef.current) {
      setEditWidth(keyDisplayRef.current.offsetWidth);
    }
    setIsEditingKey(true);
  }, []);

  useLayoutEffect(() => {
    if (isEditingKey && keyInputRef.current) {
      keyInputRef.current.focus();
      keyInputRef.current.select();
      // Adjust height to fit content
      keyInputRef.current.style.height = 'auto';
      keyInputRef.current.style.height = Math.max(keyInputRef.current.scrollHeight, 20) + 'px';
    }
  }, [isEditingKey]);

  // Adjust textarea height on content change
  useLayoutEffect(() => {
    if (isEditingKey && keyInputRef.current) {
      keyInputRef.current.style.height = 'auto';
      keyInputRef.current.style.height = Math.max(keyInputRef.current.scrollHeight, 20) + 'px';
    }
  }, [localKey, isEditingKey]);

  const handleKeySubmit = () => {
    setIsEditingKey(false);
    setEditWidth(null);
    if (localKey !== label && localKey.trim()) {
      renameNodeKey(path, localKey);
    } else {
      setLocalKey(label); // Reset if empty
    }
  };

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddChild && addButtonRef.current) {
        const rect = addButtonRef.current.getBoundingClientRect();
        onAddChild(e, { path, isArray }, rect);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(path);
  };

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Action Buttons */}
      {showActions && (
        <div className="absolute -top-8 right-0 flex gap-1 bg-white border border-slate-200 rounded-md shadow-md p-1.5 z-10 backdrop-blur-sm">
          <button 
            ref={addButtonRef}
            onClick={handleAddChild}
            className="p-1.5 hover:bg-primary-100 text-primary-600 rounded transition-smooth cursor-pointer"
            title="Add Child (Double-click node or press Tab)"
            aria-label="Add child node"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
          {!isRoot && (
            <button 
              onClick={handleDelete}
              className="p-1.5 hover:bg-red-100 text-red-600 rounded transition-smooth cursor-pointer"
              title="Delete Node (Press Delete)"
              aria-label="Delete node"
            >
              <Trash2 size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>
      )}

      <div className={clsx(
        "flex items-center rounded-lg shadow-sm px-3 py-2 text-sm transition-shadow duration-200 ease-out cursor-pointer",
        NODE_STYLES.maxWidthContainer,
        containerClass,
        isRoot && NODE_STYLES.root,
        isSelected 
          ? "border-2 border-primary-600 shadow-lg ring-2 ring-primary-100" 
          : "border hover:shadow-md"
      )}>
        <Handle type="target" position={Position.Left} className="!bg-slate-400" />
        
        <div className="mr-2 text-slate-600 shrink-0">
          {isArray ? <Brackets size={16} strokeWidth={2} /> : <Braces size={16} strokeWidth={2} />}
        </div>
        
        <div 
          ref={keyDisplayRef}
          className={clsx("font-semibold text-slate-700 cursor-text nodrag nopan break-words whitespace-normal transition-all duration-150", NODE_STYLES.minWidthKey)}
          style={editWidth ? { minWidth: editWidth, width: editWidth } : undefined}
          onDoubleClick={(e) => { e.stopPropagation(); startEditingKey(); }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {isEditingKey ? (
            <textarea
              ref={keyInputRef}
              value={localKey}
              onChange={(e) => setLocalKey(e.target.value)}
              onBlur={handleKeySubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleKeySubmit();
                }
                if (e.key === 'Escape') {
                  setLocalKey(label);
                  setIsEditingKey(false);
                  setEditWidth(null);
                }
              }}
              className="w-full bg-transparent outline-none border-b-2 border-primary-500 nodrag nopan resize-none overflow-hidden font-semibold"
              rows={1}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            label
          )}
        </div>

        <Handle type="source" position={Position.Right} className="!bg-slate-400" />
      </div>
    </div>
  );
});
