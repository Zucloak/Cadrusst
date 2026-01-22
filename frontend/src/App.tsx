import { useEffect, useState } from 'react';
import { Scene } from './components/Scene';
import { Sidebar } from './components/Sidebar';
import { useCADStore } from './store/cadStore';
import './App.css';

function App() {
  const setWasmModule = useCADStore((state) => state.setWasmModule);
  const setDocumentId = useCADStore((state) => state.setDocumentId);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loadWasm = async () => {
      try {
        // Import the WASM module using alias
        const wasmModule = await import('@pkg/rustycad.js');
        
        // Initialize the WASM module (calls default export which loads the .wasm file)
        await wasmModule.default();
        
        // Call our init function
        wasmModule.init();
        
        // Create a document
        const docId = wasmModule.create_document();
        
        // Store in global state
        setWasmModule(wasmModule);
        setDocumentId(docId);
        
        console.log('WASM module loaded successfully, document ID:', docId);
      } catch (error) {
        console.error('Failed to load WASM module:', error);
      }
    };

    loadWasm();
  }, [setWasmModule, setDocumentId]);

  return (
    <div className="app-container">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="scene-container">
        <Scene />
        <button
          className="mobile-toggle"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open Menu"
        >
          ☰
        </button>
      </div>
    </div>
  );
}

export default App;
