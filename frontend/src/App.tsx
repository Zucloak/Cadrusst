import { useEffect } from 'react';
import { Scene } from './components/Scene';
import { Sidebar } from './components/Sidebar';
import { useCADStore } from './store/cadStore';

function App() {
  const setWasmModule = useCADStore((state) => state.setWasmModule);
  const setDocumentId = useCADStore((state) => state.setDocumentId);

  useEffect(() => {
    const loadWasm = async () => {
      try {
        // Import the WASM module using alias
        const wasm = await import('@pkg/rustycad.js');
        
        // Initialize
        wasm.init();
        
        // Create a document
        const docId = wasm.create_document();
        
        // Store in global state
        setWasmModule(wasm);
        setDocumentId(docId);
        
        console.log('WASM module loaded successfully, document ID:', docId);
      } catch (error) {
        console.error('Failed to load WASM module:', error);
      }
    };

    loadWasm();
  }, [setWasmModule, setDocumentId]);

  return (
    <div style={{ display: 'flex', height: '100vh', margin: 0, overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Scene />
      </div>
    </div>
  );
}

export default App;
