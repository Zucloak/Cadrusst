import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { useCADStore } from '../store';
import { RustGeometry } from './RustGeometry';

export function Viewport() {
  const boxes = useCADStore((state) => state.boxes);
  const selectObject = useCADStore((state) => state.selectObject);

  return (
    <div className="w-full h-full bg-zinc-900 relative">
      <Canvas camera={{ position: [8, 8, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        <Grid
            args={[20, 20]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#3f3f46"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#52525b"
            fadeDistance={30}
            infiniteGrid
        />

        <group>
            {boxes.map((box) => (
                <RustGeometry key={box.id} id={box.id} />
            ))}
        </group>

        <OrbitControls makeDefault />
        <Environment preset="city" />

        {/* Click background to deselect */}
        <mesh
            visible={false}
            onClick={(e) => { e.stopPropagation(); selectObject(null); }}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.01, 0]}
        >
            <planeGeometry args={[100, 100]} />
        </mesh>
      </Canvas>

      <div className="absolute bottom-4 left-4 text-xs text-zinc-500 pointer-events-none">
        RustyCAD Viewport
      </div>
    </div>
  );
}
