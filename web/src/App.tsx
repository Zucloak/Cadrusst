import { useEffect } from 'react';
import { useCADStore } from './store';
import { Viewport } from './components/Viewport';
import { MobileDrawer } from './components/MobileDrawer';
import { ContextPill } from './components/ContextPill';
import { Loader2, Plus, Box } from 'lucide-react';
import { GlassPanel } from './components/ui/GlassPanel';
import { useMediaQuery } from './hooks/useMediaQuery';
import './App.css'; // Global styles

function App() {
  const init = useCADStore((state) => state.init);
  const wasm = useCADStore((state) => state.wasm);
  const addBox = useCADStore((state) => state.addBox);

  // Custom hook for responsive check (or just use CSS media queries where possible, but here we render different components)
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    init();
  }, [init]);

  if (!wasm) {
    return (
        <div className="w-full h-screen bg-[#09090b] flex flex-col items-center justify-center text-zinc-500 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-sm font-medium tracking-wide">INITIALIZING CORE...</span>
        </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-[#09090b] overflow-hidden select-none">
        {/* 3D Viewport (Full Screen) */}
        <div className="absolute inset-0 z-0">
            <Viewport />
        </div>

        {/* UI Overlay Layer */}
        <div className="absolute inset-0 z-10 pointer-events-none">

            {/* Header / Brand */}
            <div className="absolute top-4 left-4 pointer-events-auto">
                <GlassPanel className="px-4 py-2 flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                    <span className="font-bold text-sm text-white tracking-wider">RUSTYCAD</span>
                </GlassPanel>
            </div>

            {/* Floating Palette (Feature Tree) - Desktop Only for now */}
            {isDesktop && (
                <div className="absolute top-20 left-4 pointer-events-auto">
                   <GlassPanel className="w-64 max-h-[calc(100vh-160px)] flex flex-col p-2 gap-1">
                      <div className="px-3 py-2 text-xs font-medium text-zinc-500 uppercase tracking-widest">Objects</div>
                      <FeatureList />
                   </GlassPanel>
                </div>
            )}

            {/* Context Aware UI */}
            <div className="pointer-events-auto">
                {isDesktop ? <ContextPill /> : <MobileDrawer />}
            </div>

            {/* Primary Action Button (Floating FAB) */}
            <div className="absolute bottom-8 right-8 pointer-events-auto">
                <button
                    onClick={() => addBox(2, 2, 2)}
                    className="group relative flex items-center justify-center w-14 h-14 bg-blue-600 rounded-full shadow-lg shadow-blue-900/20 hover:scale-110 active:scale-95 transition-all duration-200"
                >
                    <Plus className="w-6 h-6 text-white" />
                    {/* Tooltip */}
                    <span className="absolute right-full mr-4 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Add Box
                    </span>
                </button>
            </div>
        </div>
    </div>
  );
}

function FeatureList() {
    const boxes = useCADStore((state) => state.boxes);
    const selectedId = useCADStore((state) => state.selectedId);
    const selectObject = useCADStore((state) => state.selectObject);

    if (boxes.length === 0) {
        return <div className="p-4 text-center text-zinc-600 text-xs italic">Scene is empty</div>;
    }

    return (
        <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar">
            {boxes.map((box) => (
                <button
                    key={box.id}
                    onClick={() => selectObject(box.id)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedId === box.id
                            ? "bg-blue-600/20 text-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.1)]"
                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                >
                    <Box className="w-4 h-4 opacity-70" />
                    <span>Box #{box.id}</span>
                </button>
            ))}
        </div>
    );
}

export default App;
