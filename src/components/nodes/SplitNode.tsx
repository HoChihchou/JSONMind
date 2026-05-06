import { memo, useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import clsx from 'clsx';
import { useJsonStore } from '../../store/useJsonStore';
import { Trash2, Type, Hash, ToggleLeft, Ban } from 'lucide-react';
import { TYPE_COLORS, NODE_STYLES } from '../../config/constants';

export const SplitNode = memo(({ data }: NodeProps) => {
  const { label, value, type, path } = data;
  const { updateNodeValue, renameNodeKey, deleteNode, selectedPath } = useJsonStore();
  const isSelected = selectedPath?.join('.') === path?.join('.');
  const isRoot = path?.length === 1 && path[0] === 'root';
  
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [localKey, setLocalKey] = useState(label);
  const [localValue, setLocalValue] = useState(String(value));
  const [showActions, setShowActions] = useState(false);
  const [keyEditWidth, setKeyEditWidth] = useState<number | null>(null);
  const [valueEditWidth, setValueEditWidth] = useState<number | null>(null);

  const keyInputRef = useRef<HTMLTextAreaElement>(null);
  const valueInputRef = useRef<HTMLTextAreaElement>(null);
  const keyDisplayRef = useRef<HTMLDivElement>(null);
  const valueDisplayRef = useRef<HTMLDivElement>(null);

  const valueColorClass = TYPE_COLORS[type as keyof typeof TYPE_COLORS] || TYPE_COLORS.object;

  useEffect(() => {
    setLocalKey(label);
  }, [label]);

  useEffect(() => {
    setLocalValue(String(value));
  }, [value]);

  const startEditingKey = useCallback(() => {
    if (keyDisplayRef.current) {
      setKeyEditWidth(keyDisplayRef.current.offsetWidth);
    }
    setIsEditingKey(true);
  }, []);

  const startEditingValue = useCallback(() => {
    if (type === 'boolean') return;
    if (valueDisplayRef.current) {
      setValueEditWidth(valueDisplayRef.current.offsetWidth);
    }
    setIsEditingValue(true);
  }, [type]);

  useLayoutEffect(() => {
    if (isEditingKey && keyInputRef.current) {
      keyInputRef.current.focus();
      keyInputRef.current.select();
      keyInputRef.current.style.height = 'auto';
      keyInputRef.current.style.height = Math.max(keyInputRef.current.scrollHeight, 20) + 'px';
    }
  }, [isEditingKey]);

  useLayoutEffect(() => {
    if (isEditingKey && keyInputRef.current) {
      keyInputRef.current.style.height = 'auto';
      keyInputRef.current.style.height = Math.max(keyInputRef.current.scrollHeight, 20) + 'px';
    }
  }, [localKey, isEditingKey]);

  useLayoutEffect(() => {
    if (isEditingValue && valueInputRef.current) {
      valueInputRef.current.focus();
      valueInputRef.current.select();
      valueInputRef.current.style.height = 'auto';
      valueInputRef.current.style.height = Math.max(valueInputRef.current.scrollHeight, 20) + 'px';
    }
  }, [isEditingValue]);

  useLayoutEffect(() => {
    if (isEditingValue && valueInputRef.current) {
      valueInputRef.current.style.height = 'auto';
      valueInputRef.current.style.height = Math.max(valueInputRef.current.scrollHeight, 20) + 'px';
    }
  }, [localValue, isEditingValue]);

  const handleKeySubmit = () => {
    setIsEditingKey(false);
    setKeyEditWidth(null);
    if (localKey !== label && localKey.trim()) {
      renameNodeKey(path, localKey);
    } else {
      setLocalKey(label);
    }
  };

  const handleValueSubmit = () => {
    setIsEditingValue(false);
    setValueEditWidth(null);
    let newValue: any = localValue;
    
    // Simple type inference
    if (type === 'number') {
      newValue = Number(localValue);
      if (isNaN(newValue)) {
        newValue = value;
        setLocalValue(String(value));
      }
    } else if (type === 'boolean') {
      newValue = localValue === 'true';
    } else if (type === 'null') {
      // Allow converting null to other types
      if (localValue === 'null' || localValue === '') {
        newValue = null;
      } else if (localValue === 'true' || localValue === 'false') {
        newValue = localValue === 'true';
      } else if (!isNaN(Number(localValue))) {
        newValue = Number(localValue);
      } else {
        // String value
        newValue = localValue;
      }
    }

    if (newValue !== value) {
      updateNodeValue(path, newValue);
    }
  };

  const handleBooleanToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateNodeValue(path, e.target.checked);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(path);
  };

  const renderTypeIcon = () => {
    switch (type) {
      case 'string': return <Type size={14} className="text-emerald-600" strokeWidth={2} />;
      case 'number': return <Hash size={14} className="text-sky-600" strokeWidth={2} />;
      case 'boolean': return <ToggleLeft size={14} className="text-amber-600" strokeWidth={2} />;
      case 'null': return <Ban size={14} className="text-slate-500" strokeWidth={2} />;
      default: return null;
    }
  };

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Action Buttons */}
      {showActions && !isRoot && (
        <div className="absolute -top-8 right-0 flex gap-1 bg-white border border-slate-200 rounded-md shadow-md p-1.5 z-10 backdrop-blur-sm">
          <button 
            onClick={handleDelete}
            className="p-1.5 hover:bg-red-100 text-red-600 rounded transition-smooth cursor-pointer"
            title="Delete Node (Press Delete)"
            aria-label="Delete node"
          >
            <Trash2 size={14} strokeWidth={2.5} />
          </button>
        </div>
      )}

      <div className={clsx(
        "flex items-stretch border rounded-lg shadow-sm bg-white overflow-hidden text-sm transition-shadow duration-200 ease-out cursor-pointer",
        NODE_STYLES.maxWidthSplit,
        isRoot && NODE_STYLES.root,
        isSelected 
          ? "border-primary-600 border-2 shadow-lg ring-2 ring-primary-100" 
          : "border-slate-200 hover:shadow-md"
      )}>
        <Handle type="target" position={Position.Left} className="!bg-slate-400" />
        
        {/* Key Section */}
        <div 
          ref={keyDisplayRef}
          className={clsx("px-3 py-2 bg-slate-50 border-r border-slate-200 font-semibold text-slate-700 flex items-center cursor-text nodrag nopan break-words whitespace-normal transition-all duration-150", NODE_STYLES.minWidthKey)}
          style={keyEditWidth ? { minWidth: keyEditWidth, width: keyEditWidth } : undefined}
          onDoubleClick={(e) => { 
            e.stopPropagation(); 
            startEditingKey(); 
          }}
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
                  setKeyEditWidth(null);
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
        
        {/* Value Section */}
        <div 
          ref={valueDisplayRef}
          className={clsx("px-3 py-2 flex-1 font-mono text-sm flex items-center gap-2 cursor-text nodrag nopan break-words whitespace-normal transition-all duration-150", NODE_STYLES.minWidthValue, valueColorClass)}
          style={valueEditWidth ? { minWidth: valueEditWidth, width: valueEditWidth } : undefined}
          onDoubleClick={(e) => {
            e.stopPropagation();
            startEditingValue();
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Type Icon */}
          <div className="shrink-0 select-none flex items-center justify-center" title={type}>
             {renderTypeIcon()}
          </div>

          {isEditingValue ? (
            <textarea
              ref={valueInputRef}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onBlur={handleValueSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleValueSubmit();
                }
                if (e.key === 'Escape') {
                  setLocalValue(String(value));
                  setIsEditingValue(false);
                  setValueEditWidth(null);
                }
              }}
              className="w-full bg-transparent outline-none border-b-2 border-primary-500 nodrag nopan resize-none overflow-hidden font-mono"
              rows={1}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder={type === 'null' ? 'Enter value (auto-detect type)' : ''}
            />
          ) : (
            type === 'boolean' ? (
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        checked={value} 
                        onChange={handleBooleanToggle}
                        className="nodrag nopan cursor-pointer w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                        onMouseDown={(e) => e.stopPropagation()}
                    />
                    <span className="font-semibold">{String(value)}</span>
                </div>
            ) : type === 'null' ? (
                <span className="break-all italic text-slate-400">{String(value)}</span>
            ) : (
                <span className="break-all">{String(value)}</span>
            )
          )}
        </div>

        <Handle type="source" position={Position.Right} className="!bg-slate-400" />
      </div>
    </div>
  );
});
 