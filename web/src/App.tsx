import { useEffect, useState } from 'react';
import { useCADStore } from './store';
import { Viewport } from './components/Viewport';
import { MobileDrawer } from './components/MobileDrawer';
import { ContextPill } from './components/ContextPill';
import { Loader2, Plus, Box, Cylinder, Circle, X } from 'lucide-react';
import { GlassPanel } from './components/ui/GlassPanel';
import { useMediaQuery } from './hooks/useMediaQuery';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';

function App() {
  const init = useCADStore((state) => state.init);
  const wasm = useCADStore((state) => state.wasm);
  const addBox = useCADStore((state) => state.addBox);
  const addCylinder = useCADStore((state) => state.addCylinder);
  const addSphere = useCADStore((state) => state.addSphere);

  const [menuOpen, setMenuOpen] = useState(false);

  // Custom hook for responsive check
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

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleAddBox = () => {
    addBox(2, 2, 2);
    setMenuOpen(false);
  };

  const handleAddCylinder = () => {
    addCylinder(1, 2);
    setMenuOpen(false);
  };

  const handleAddSphere = () => {
    addSphere(1.5);
    setMenuOpen(false);
  };

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

            {/* Primary Action Button (Floating FAB) & Speed Dial */}
            <div className="absolute bottom-8 right-8 pointer-events-auto flex flex-col items-end gap-4">
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.8 }}
                            className="flex flex-col gap-3 items-end"
                        >
                            <div className="flex items-center gap-2">
                                <span className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">Sphere</span>
                                <button onClick={handleAddSphere} className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 shadow-lg text-white">
                                    <Circle className="w-5 h-5" />
                                </button>
                            </div>
                             <div className="flex items-center gap-2">
                                <span className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">Cylinder</span>
                                <button onClick={handleAddCylinder} className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 shadow-lg text-white">
                                    <Cylinder className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">Box</span>
                                <button onClick={handleAddBox} className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center hover:bg-zinc-700 shadow-lg text-white">
                                    <Box className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={toggleMenu}
                    className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 ${
                        menuOpen ? 'bg-zinc-700 rotate-45' : 'bg-blue-600 shadow-blue-900/20 hover:scale-110 active:scale-95'
                    }`}
                >
                    <Plus className="w-6 h-6 text-white" />
                </button>
            </div>
        </div>
    </div>
  );
}

function FeatureList() {
    const objects = useCADStore((state) => state.objects);
    const selectedId = useCADStore((state) => state.selectedId);
    const selectObject = useCADStore((state) => state.selectObject);

    if (objects.length === 0) {
        return <div className="p-4 text-center text-zinc-600 text-xs italic">Scene is empty</div>;
    }

    return (
        <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar">
            {objects.map((obj) => (
                <button
                    key={obj.id}
                    onClick={() => selectObject(obj.id)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedId === obj.id
                            ? "bg-blue-600/20 text-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.1)]"
                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                >
                    {obj.type === 'Box' && <Box className="w-4 h-4 opacity-70" />}
                    {obj.type === 'Cylinder' && <Cylinder className="w-4 h-4 opacity-70" />}
                    {obj.type === 'Sphere' && <Circle className="w-4 h-4 opacity-70" />}
                    <span>{obj.type} #{obj.id}</span>
                </button>
            ))}
        </div>
    );
}

export default App;
