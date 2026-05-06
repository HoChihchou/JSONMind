import { create } from 'zustand';
import { temporal } from 'zundo';

interface JsonState {
  jsonText: string;
  jsonObject: any;
  isValid: boolean;
  error: string | null;
  hoveredPath: string[] | null;
  selectedPath: string[] | null;
  showGrid: boolean;
  setJsonText: (text: string) => void;
  setJsonObject: (obj: any) => void;
  updateNodeValue: (path: string[], newValue: any) => void;
  renameNodeKey: (path: string[], newKey: string) => void;
  deleteNode: (path: string[]) => void;
  addNode: (path: string[], key: string, value: any) => void;
  setHoveredPath: (path: string[] | null) => void;
  setSelectedPath: (path: string[] | null) => void;
  toggleGrid: () => void;
}

const DEFAULT_JSON = {
  "project": "JSONMind",
  "version": "1.0.0",
  "features": [
    "Real-time Visualization",
    "Two-way Binding",
    "Export to Image"
  ],
  "author": {
    "name": "AI Assistant",
    "role": "Developer"
  }
};

// Helper to deep clone and update
const cloneValue = (val: any): any => {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) return [...val];
  if (typeof val === 'object') return { ...val };
  return val;
};

const updateJson = (json: any, path: string[], updateFn: (target: any, key: string | number) => void) => {
  const newJson = cloneValue(json);
  if (newJson === null || newJson === undefined) return newJson;
  
  let current = newJson;
  
  // Navigate to parent
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    const nextVal = current[key];
    // Clone the next level, handling null properly
    current[key] = cloneValue(nextVal);
    // If the value is null or primitive, we can't navigate further
    if (current[key] === null || typeof current[key] !== 'object') {
      return newJson;
    }
    current = current[key];
  }

  const lastKey = path[path.length - 1];
  updateFn(current, lastKey);
  
  return newJson;
};

export const useJsonStore = create<JsonState>()(
  temporal(
    (set, get) => ({
      jsonText: JSON.stringify(DEFAULT_JSON, null, 2),
      jsonObject: DEFAULT_JSON,
      isValid: true,
      error: null,
      hoveredPath: null,
      selectedPath: null,
      showGrid: true,
      setJsonText: (text: string) => {
        try {
          const parsed = JSON.parse(text);
          set({ jsonText: text, jsonObject: parsed, isValid: true, error: null });
        } catch (e: any) {
          set({ jsonText: text, isValid: false, error: e.message });
        }
      },
      setJsonObject: (obj: any) => {
        set({ 
          jsonObject: obj, 
          jsonText: JSON.stringify(obj, null, 2), 
          isValid: true, 
          error: null 
        });
      },
      setHoveredPath: (path) => set({ hoveredPath: path }),
      setSelectedPath: (path) => set({ selectedPath: path }),
      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
      updateNodeValue: (path: string[], newValue: any) => {
        const { jsonObject } = get();
        // Path includes 'root', remove it
        const actualPath = path.slice(1);
        
        if (actualPath.length === 0) return; // Cannot update root value directly this way

        const newJson = updateJson(jsonObject, actualPath, (parent, key) => {
          parent[key] = newValue;
        });

        get().setJsonObject(newJson);
      },
      renameNodeKey: (path: string[], newKey: string) => {
        const { jsonObject } = get();
        const actualPath = path.slice(1);
        if (actualPath.length === 0) return;

        const newJson = updateJson(jsonObject, actualPath, (parent, key) => {
          if (Array.isArray(parent)) return; // Cannot rename array index
          
          const value = parent[key];
          delete parent[key];
          parent[newKey] = value;
        });

        get().setJsonObject(newJson);
      },
      deleteNode: (path: string[]) => {
        const { jsonObject } = get();
        const actualPath = path.slice(1);
        if (actualPath.length === 0) return;

        const newJson = updateJson(jsonObject, actualPath, (parent, key) => {
          if (Array.isArray(parent)) {
            parent.splice(Number(key), 1);
          } else {
            delete parent[key];
          }
        });

        get().setJsonObject(newJson);
      },
      addNode: (path: string[], key: string, value: any) => {
        const { jsonObject } = get();
        const actualPath = path.slice(1);
        
        // If adding to root
        if (actualPath.length === 0) {
            // Only if root is object/array
            const newJson = Array.isArray(jsonObject) ? [...jsonObject, value] : { ...jsonObject, [key]: value };
            get().setJsonObject(newJson);
            return;
        }

        // We need to navigate to the node itself, not its parent, because we are adding a child TO it.
        // But updateJson navigates to parent of the last key.
        // So we treat the node we are adding TO as the target.
        
        // Let's write a specific traversal for adding
        const newJson = Array.isArray(jsonObject) ? [...jsonObject] : { ...jsonObject };
        let current = newJson;
        
        for (let i = 0; i < actualPath.length; i++) {
            const k = actualPath[i];
            // @ts-ignore
            current[k] = Array.isArray(current[k]) ? [...current[k]] : { ...current[k] };
            // @ts-ignore
            current = current[k];
        }
        
        if (Array.isArray(current)) {
            current.push(value);
        } else {
            // @ts-ignore
            current[key] = value;
        }

        get().setJsonObject(newJson);
      }
    }),
    {
      partialize: (state) => ({ jsonText: state.jsonText, jsonObject: state.jsonObject }),
      limit: 50,
    }
  )
);
