import React, { useEffect, useCallback, useState, useRef } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  useNodesState, 
  useEdgesState,
  NodeTypes,
  Panel,
  useReactFlow,
  Node,
  BackgroundVariant
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useJsonStore } from '../store/useJsonStore';
import { jsonToGraph } from '../utils/graphUtils';
import { SplitNode } from './nodes/SplitNode';
import { ContainerNode } from './nodes/ContainerNode';
import { ContextMenu } from './ContextMenu';
import { AddNodeModal } from './AddNodeModal';
import { HelpModal } from './HelpModal';
import { Image as ImageIcon, Maximize2, Minimize2, Copy, HelpCircle, Github, Settings, Grid3X3, Check } from 'lucide-react';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';

const nodeTypes: NodeTypes = {
  split: SplitNode,
  container: ContainerNode,
};

export const MindMap: React.FC<{ isFullscreen: boolean; setIsFullscreen: (val: boolean) => void }> = ({ isFullscreen, setIsFullscreen }) => {
  const { jsonObject, addNode, deleteNode, updateNodeValue, setHoveredPath, hoveredPath, selectedPath, setSelectedPath, showGrid, toggleGrid } = useJsonStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { getViewport } = useReactFlow();
  
  const [menu, setMenu] = useState<{ x: number; y: number; targetType: 'canvas' | 'node'; targetNode?: Node } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [modal, setModal] = useState<{ type: 'string' | 'number' | 'boolean' | 'object' | 'array'; parentType?: 'array' | 'object'; targetPath: string[]; useMemory?: boolean } | null>(null);
  const settingsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input field
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          useJsonStore.temporal.getState().redo();
        } else {
          useJsonStore.temporal.getState().undo();
        }
        return;
      }

      // Delete selected node
      if (selectedPath && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        deleteNode(selectedPath);
        setSelectedPath(null);
        return;
      }

      // Add child to selected node (Tab)
      if (selectedPath && e.key === 'Tab') {
        e.preventDefault();
        const selectedNode = nodes.find(n => n.data?.path?.join('.') === selectedPath.join('.'));
        // Only allow adding children to container nodes (object/array)
        if (selectedNode && selectedNode.type === 'container') {
          const lastType = localStorage.getItem('jsonmind_last_node_type') as 'string' | 'number' | 'boolean' | 'object' | 'array' || 'string';
          setModal({
            type: lastType,
            parentType: selectedNode.data.isArray ? 'array' : 'object',
            targetPath: selectedPath,
            useMemory: true // Tab shortcut should use memory
          });
        }
        return;
      }

      // Toggle fullscreen (F11 or F)
      if (e.key === 'F11' || (e.key === 'f' && !e.ctrlKey && !e.metaKey)) {
        e.preventDefault();
        setIsFullscreen(!isFullscreen);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPath, nodes, deleteNode, setSelectedPath, setIsFullscreen, isFullscreen]);

  const handleSettingsEnter = useCallback(() => {
    if (settingsTimerRef.current) {
      clearTimeout(settingsTimerRef.current);
      settingsTimerRef.current = null;
    }
    setShowSettings(true);
  }, []);

  const handleSettingsLeave = useCallback(() => {
    settingsTimerRef.current = setTimeout(() => {
      setShowSettings(false);
    }, 150); // Small delay so user can move from button to menu
  }, []);

  const handleSettingsItemClick = useCallback((action: () => void) => {
    action();
    setShowSettings(false);
  }, []);

  const onAddChildFromNode = useCallback((_: React.MouseEvent, nodeData: any, rect: DOMRect) => {
    setMenu({
      x: rect.left,
      y: rect.bottom + 5, // Position below the button
      targetType: 'node',
      targetNode: { data: nodeData } as Node // Mock node for context menu
    });
  }, []);

  useEffect(() => {
    if (jsonObject) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = jsonToGraph(jsonObject, onAddChildFromNode);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }
  }, [jsonObject, setNodes, setEdges, onAddChildFromNode]);

  const onExportImage = useCallback(() => {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (viewport) {
      toPng(viewport, {
        backgroundColor: '#f9fafb',
        width: viewport.scrollWidth,
        height: viewport.scrollHeight,
        style: {
          width: '100%',
          height: '100%',
          transform: `translate(${getViewport().x}px, ${getViewport().y}px) scale(${getViewport().zoom})`
        }
      })
        .then((dataUrl) => {
          saveAs(dataUrl, 'mindmap.png');
        });
    }
  }, [getViewport]);

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      setMenu({
        x: event.clientX,
        y: event.clientY,
        targetType: 'canvas',
      });
    },
    [setMenu]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setMenu({
        x: event.clientX,
        y: event.clientY,
        targetType: 'node',
        targetNode: node,
      });
    },
    [setMenu]
  );

  const onNodeMouseEnter = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.data?.path) {
      setHoveredPath(node.data.path);
    }
  }, [setHoveredPath]);

  const onNodeMouseLeave = useCallback(() => {
    setHoveredPath(null);
  }, [setHoveredPath]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.data?.path) {
      setSelectedPath(node.data.path);
      setHoveredPath(node.data.path);
    }
  }, [setSelectedPath, setHoveredPath]);

  const onPaneClick = useCallback(() => {
    setMenu(null);
    setShowSettings(false);
    setSelectedPath(null);
    setHoveredPath(null);
  }, [setMenu, setSelectedPath, setHoveredPath]);

  const handleAddNodeSelect = (type: 'string' | 'number' | 'boolean' | 'object' | 'array') => {
    if (menu?.targetType === 'node' && menu.targetNode) {
      const { path, isArray } = menu.targetNode.data;
      setModal({
        type,
        parentType: isArray ? 'array' : 'object',
        targetPath: path,
        useMemory: false // Right-click menu already selected type, don't use memory
      });
    } else if (menu?.targetType === 'canvas') {
      setModal({
        type,
        parentType: 'object', // Root is object
        targetPath: ['root'],
        useMemory: false // Right-click menu already selected type, don't use memory
      });
    }
    setMenu(null);
  };

  const handleModalConfirm = (key: string, value: any) => {
    if (modal) {
      addNode(modal.targetPath, key, value);
      setModal(null);
    }
  };

  const handleDeleteNode = () => {
    if (menu?.targetNode) {
      deleteNode(menu.targetNode.data.path);
    }
    setMenu(null);
  };

  const handleSetNull = () => {
    if (menu?.targetNode) {
      updateNodeValue(menu.targetNode.data.path, null);
    }
    setMenu(null);
  };

  const formatJsonPath = (path: string[]): string => {
    const actualPath = path.slice(1); // Remove 'root'
    if (actualPath.length === 0) return '$';
    return actualPath.reduce((acc, segment) => {
      if (/^[0-9]+$/.test(segment)) {
        return `${acc}[${segment}]`;
      }
      if (/[^a-zA-Z0-9_]/.test(segment)) {
        return `${acc}["${segment}"]`;
      }
      return `${acc}.${segment}`;
    }, '$');
  };

  const handleCopyPath = () => {
    if (menu?.targetNode) {
      const pathString = formatJsonPath(menu.targetNode.data.path);
      navigator.clipboard.writeText(pathString);
    }
    setMenu(null);
  };

  const handleCopySelectedPath = () => {
    if (selectedPath) {
      const pathString = formatJsonPath(selectedPath);
      navigator.clipboard.writeText(pathString);
    }
  };

  return (
    <div className="h-full w-full bg-slate-50 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable={false}
        panOnScroll={true}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        onPaneContextMenu={onPaneContextMenu}
        onNodeContextMenu={onNodeContextMenu}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        defaultEdgeOptions={{
          type: 'default', // Bezier
          style: { stroke: '#cbd5e1', strokeWidth: 2.5 },
        }}
      >
        <Background 
          color="#cbd5e1" 
          gap={32}
          size={1.5}
          variant={BackgroundVariant.Dots}
          style={{ opacity: showGrid ? 1 : 0, transition: 'opacity 0.2s ease' }}
        />
        <Controls />
        <Panel position="top-right" className="flex gap-2">
          <div 
            className="relative"
            onMouseEnter={handleSettingsEnter}
            onMouseLeave={handleSettingsLeave}
          >
            <button 
              className={`flex items-center h-full gap-2 px-3 py-2 border rounded-lg shadow-md hover:shadow-lg text-sm font-medium transition-smooth cursor-pointer ${
                showSettings
                  ? 'bg-primary-50 text-primary-700 border-primary-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
              title="Settings"
              aria-label="Settings"
            >
              <Settings size={18} strokeWidth={2} />
            </button>
            {showSettings && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50">
                <button
                  onClick={() => handleSettingsItemClick(toggleGrid)}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Grid3X3 size={14} />
                    Show Grid
                  </span>
                  {showGrid && <Check size={14} className="text-primary-600" />}
                </button>
              </div>
            )}
          </div>
          <a
            href="https://github.com/cassius0924/jsonmind"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-md hover:shadow-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-smooth cursor-pointer"
            title="GitHub Repository"
            aria-label="View GitHub Repository"
          >
            <Github size={18} strokeWidth={2} />
          </a>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-md hover:shadow-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-smooth cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen (F11)' : 'Fullscreen (F11)'}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={18} strokeWidth={2} /> : <Maximize2 size={18} strokeWidth={2} />}
          </button>
          <button 
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-md hover:shadow-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-smooth cursor-pointer"
            title="Help & Usage Guide"
            aria-label="Open help"
          >
            <HelpCircle size={18} strokeWidth={2} />
          </button>
          <button 
            onClick={onExportImage}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-md hover:shadow-lg hover:bg-slate-50 text-sm font-medium text-slate-700 transition-smooth cursor-pointer"
            title="Export visualization as PNG"
            aria-label="Export as image"
          >
            <ImageIcon size={18} strokeWidth={2} />
            Export
          </button>
        </Panel>
        {(selectedPath || hoveredPath) && (
          <Panel position="bottom-center" className="bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-lg border border-slate-200 text-xs font-mono text-slate-600 mb-4">
            {selectedPath ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                <span className="font-semibold text-primary-600">Selected:</span>
                {formatJsonPath(selectedPath)}
                <button
                  onClick={handleCopySelectedPath}
                  className="ml-2 p-1 hover:bg-primary-100 rounded transition-smooth cursor-pointer"
                  title="Copy JSON Path"
                  aria-label="Copy path"
                >
                  <Copy size={14} className="text-primary-600" strokeWidth={2} />
                </button>
              </span>
            ) : (
              formatJsonPath(hoveredPath!)
            )}
          </Panel>
        )}
        {menu && (
          <ContextMenu
            x={menu.x}
            y={menu.y}
            targetType={menu.targetType}
            nodeType={menu.targetNode?.data?.type || (menu.targetNode?.data?.isArray ? 'array' : 'object')}
            onClose={() => setMenu(null)}
            onAddNode={handleAddNodeSelect}
            onDelete={handleDeleteNode}
            onSetNull={handleSetNull}
            onCopyPath={handleCopyPath}
          />
        )}
        {showHelp && (
          <HelpModal onClose={() => setShowHelp(false)} />
        )}
        {modal && (
          <AddNodeModal
            type={modal.type}
            parentType={modal.parentType}
            useMemory={modal.useMemory}
            onConfirm={handleModalConfirm}
            onCancel={() => setModal(null)}
          />
        )}
      </ReactFlow>
    </div>
  );
};
