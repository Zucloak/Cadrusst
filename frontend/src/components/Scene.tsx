import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { BoxMesh } from './BoxMesh';
import { useCADStore } from '../store/cadStore';

export function Scene() {
  const boxes = useCADStore((state) => state.boxes);
  const documentId = useCADStore((state) => state.documentId);
  const wasmModule = useCADStore((state) => state.wasmModule);

  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
      <color attach="background" args={['#1a1a1a']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />
      
      <Grid 
        args={[20, 20]} 
        cellSize={1} 
        cellThickness={0.5} 
        cellColor="#6f6f6f" 
        sectionSize={5} 
        sectionThickness={1} 
        sectionColor="#9d4b4b" 
        fadeDistance={30} 
        fadeStrength={1} 
        followCamera={false} 
        infiniteGrid={true}
      />

      {documentId !== null && wasmModule && boxes.map((box) => (
        <BoxMesh 
          key={box.id} 
          boxId={box.id} 
          documentId={documentId} 
          wasmModule={wasmModule}
        />
      ))}

      <OrbitControls makeDefault />
    </Canvas>
  );
}
