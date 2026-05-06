import React, { useState, useEffect, useRef } from 'react';
import { Braces, Brackets, Type, Hash, ToggleLeft, X } from 'lucide-react';
import clsx from 'clsx';
import { TYPE_COLORS } from '../config/constants';

// Store last used type in localStorage
const LAST_TYPE_KEY = 'jsonmind_last_node_type';

interface AddNodeModalProps {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  parentType?: 'array' | 'object'; // To know if we need a key
  useMemory?: boolean; // Whether to use localStorage memory
  onConfirm: (key: string, value: any) => void;
  onCancel: () => void;
}

export const AddNodeModal: React.FC<AddNodeModalProps> = ({ type: initialType, parentType, useMemory = true, onConfirm, onCancel }) => {
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<'string' | 'number' | 'boolean' | 'object' | 'array'>(() => {
    // Only use memory if useMemory is true
    if (useMemory) {
      const lastType = localStorage.getItem(LAST_TYPE_KEY);
      return (lastType as any) || initialType;
    }
    return initialType;
  });
  const [key, setKey] = useState('');
  const [value, setValue] = useState(() => type === 'boolean' ? 'true' : '');
  const keyInputRef = useRef<HTMLInputElement>(null);
  const valueInputRef = useRef<HTMLInputElement>(null);

  const isContainer = type === 'object' || type === 'array';
  const needsKey = parentType !== 'array'; // Arrays auto-generate keys (indices)

  // Trigger enter animation on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // Update value when type changes
  useEffect(() => {
    if (type === 'boolean') {
      setValue('true');
    } else if (type === 'object' || type === 'array') {
      setValue('');
    } else {
      setValue('');
    }
  }, [type]);

  useEffect(() => {
    if (needsKey) {
      keyInputRef.current?.focus();
    } else if (!isContainer) {
      valueInputRef.current?.focus();
    }
  }, [needsKey, isContainer]);

  const handleKeyEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isContainer) {
        handleSubmit();
      } else {
        valueInputRef.current?.focus();
      }
    }
  };

  const handleValueEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    let finalValue: any = value;
    if (type === 'number') finalValue = Number(value);
    if (type === 'boolean') finalValue = value === 'true';
    if (type === 'object') finalValue = {};
    if (type === 'array') finalValue = [];

    // Save last used type
    localStorage.setItem(LAST_TYPE_KEY, type);

    onConfirm(key, finalValue);
  };

  const typeButtons = [
    { type: 'string' as const, icon: Type, label: 'String', colorClass: 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100' },
    { type: 'number' as const, icon: Hash, label: 'Number', colorClass: 'bg-sky-50 border-sky-300 text-sky-700 hover:bg-sky-100' },
    { type: 'boolean' as const, icon: ToggleLeft, label: 'Boolean', colorClass: 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100' },
    { type: 'object' as const, icon: Braces, label: 'Object', colorClass: 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100' },
    { type: 'array' as const, icon: Brackets, label: 'Array', colorClass: 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100' },
  ];

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white rounded-xl shadow-2xl p-6 w-[480px] transition-all duration-200 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-800 font-heading">Add New Node</h3>
          <button 
            onClick={onCancel}
            className="p-1.5 hover:bg-slate-100 text-slate-600 rounded transition-smooth"
            aria-label="Close modal"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        
        {/* Type Selector */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">Data Type</label>
          <div className="grid grid-cols-5 gap-2">
            {typeButtons.map(({ type: btnType, icon: Icon, label, colorClass }) => (
              <button
                key={btnType}
                onClick={() => setType(btnType)}
                className={clsx(
                  "flex flex-col items-center gap-1.5 px-2.5 py-2.5 rounded-lg border text-xs font-semibold transition-smooth text-center whitespace-nowrap",
                  type === btnType
                    ? colorClass.replace('hover:', '')
                    : "bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100"
                )}
                title={label}
              >
                <Icon size={16} strokeWidth={2} />
                <span className="text-xs hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Preview / Input Area */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className={clsx("flex items-center rounded-lg shadow-sm px-4 py-3 min-w-[200px]", TYPE_COLORS[type])}>
            {/* Icon for Container */}
            {(type === 'object' || type === 'array') && (
              <div className="mr-2 text-current shrink-0">
                {type === 'array' ? <Brackets size={18} strokeWidth={2} /> : <Braces size={18} strokeWidth={2} />}
              </div>
            )}

            {/* Key Input */}
            {needsKey ? (
              <div className="flex-1 mr-2">
                <input
                  ref={keyInputRef}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  onKeyDown={handleKeyEnter}
                  placeholder="Key name"
                  className="w-full bg-transparent outline-none border-b-2 border-current/30 placeholder-current/50 font-semibold text-sm"
                />
              </div>
            ) : (
              <div className="flex-1 mr-2 text-current/60 italic text-sm">
                [Auto Index]
              </div>
            )}

            {/* Separator */}
            {!isContainer && <div className="mx-2 text-current/30">:</div>}

            {/* Value Input */}
            {!isContainer && (
              <div className="flex-1">
                {type === 'boolean' ? (
                  <select
                    ref={valueInputRef as any}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleValueEnter}
                    className="w-full bg-transparent outline-none border-b-2 border-current/30 font-semibold text-sm"
                  >
                    <option value="" disabled>Select...</option>
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : (
                  <input
                    ref={valueInputRef}
                    type={type === 'number' ? 'number' : 'text'}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleValueEnter}
                    placeholder="Value"
                    className="w-full bg-transparent outline-none border-b-2 border-current/30 placeholder-current/50 font-mono text-sm"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-smooth cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 rounded-lg shadow-md transition-smooth cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
