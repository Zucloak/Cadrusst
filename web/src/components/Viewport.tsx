import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, TransformControls } from '@react-three/drei';
import { useCADStore } from '../store';
import { RustGeometry } from './RustGeometry';
import { useRef } from 'react';
import * as THREE from 'three';

function ObjectWrapper({ obj, isSelected }: { obj: any, isSelected: boolean }) {
    const updatePlacement = useCADStore((state) => state.updatePlacement);
    const groupRef = useRef<THREE.Group>(null);

    const handleMouseUp = () => {
        if (groupRef.current) {
            const { position, quaternion } = groupRef.current;
            updatePlacement(obj.id, [position.x, position.y, position.z], [quaternion.x, quaternion.y, quaternion.z, quaternion.w]);
        }
    };

    const content = (
        <group
            ref={groupRef}
            position={obj.position || [0,0,0]}
            quaternion={obj.rotation || [0,0,0,1]}
        >
            <RustGeometry id={obj.id} />
        </group>
    );

    if (isSelected) {
        return (
            <TransformControls
                mode="translate"
                onMouseUp={handleMouseUp}
            >
                {content}
            </TransformControls>
        );
    }

    return content;
}

export function Viewport() {
  const objects = useCADStore((state) => state.objects);
  const selectObject = useCADStore((state) => state.selectObject);
  const selectedId = useCADStore((state) => state.selectedId);

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
            {objects.map((obj) => (
                <ObjectWrapper key={obj.id} obj={obj} isSelected={selectedId === obj.id} />
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
