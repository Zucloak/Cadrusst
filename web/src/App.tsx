import { useEffect } from 'react';
import { useCADStore } from './store';
import { FeatureTree } from './components/FeatureTree';
import { PropertyEditor } from './components/PropertyEditor';
import { Viewport } from './components/Viewport';
import { Loader2 } from 'lucide-react';
import './App.css'; // Leaving for reset of CSS if any

function App() {
  const init = useCADStore((state) => state.init);
  const wasm = useCADStore((state) => state.wasm);

  useEffect(() => {
    init();
  }, [init]);

  if (!wasm) {
    return (
        <div className="w-full h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-500 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-sm font-medium">Initializing RustyCAD Core...</span>
        </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans overflow-hidden">
        {/* Left: Feature Tree */}
        <FeatureTree />

        {/* Center: Viewport */}
        <main className="flex-1 relative min-w-0">
            <Viewport />
        </main>

        {/* Right: Property Editor */}
        <PropertyEditor />
    </div>
  );
}

export default App;
