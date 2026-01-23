import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useCADStore } from '../store';

interface RustGeometryProps {
  id: number;
}

export function RustGeometry({ id }: RustGeometryProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const wasm = useCADStore((state) => state.wasm);
  const documentId = useCADStore((state) => state.documentId);
  const selectedId = useCADStore((state) => state.selectedId);
  const isSelected = id === selectedId;

  // We subscribe to the object data to trigger re-renders when dimensions change
  const objectData = useCADStore((state) => state.objects.find((b) => b.id === id));

  useEffect(() => {
    if (!wasm || documentId === null || !meshRef.current) return;

    // Call WASM to get mesh data
    const meshData = wasm.get_mesh_data(documentId, id);
    const indices = wasm.get_mesh_indices(documentId, id);

    if (meshData.length === 0) return;

    const geometry = new THREE.BufferGeometry();

    const vertexCount = meshData.length / 6;
    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);

    for (let i = 0; i < vertexCount; i++) {
      positions[i * 3] = meshData[i * 6];
      positions[i * 3 + 1] = meshData[i * 6 + 1];
      positions[i * 3 + 2] = meshData[i * 6 + 2];

      normals[i * 3] = meshData[i * 6 + 3];
      normals[i * 3 + 1] = meshData[i * 6 + 4];
      normals[i * 3 + 2] = meshData[i * 6 + 5];
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

    if (indices.length > 0) {
      geometry.setIndex(Array.from(indices));
    }

    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    if (meshRef.current.geometry) {
      meshRef.current.geometry.dispose();
    }

    meshRef.current.geometry = geometry;

  }, [id, documentId, wasm, objectData]);

  // Re-implementation using standard r3f events + simplified custom logic for LongPress/DoubleTap
  const longPressTimer = useRef<number | null>(null);
  const clickCount = useRef(0);
  const clickTimer = useRef<number | null>(null);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    longPressTimer.current = window.setTimeout(() => {
        // Long press triggered
        console.log("Long press detected");
        if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(50);
        useCADStore.getState().deleteObject(id);
        longPressTimer.current = null;
    }, 600);
  };

  const handlePointerUp = (e: any) => {
    e.stopPropagation();
    if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;

        // It was a click (short press)
        clickCount.current++;
        if (clickCount.current === 1) {
            clickTimer.current = window.setTimeout(() => {
                // Single click confirmed
                useCADStore.getState().selectObject(id);
                clickCount.current = 0;
            }, 250);
        } else if (clickCount.current === 2) {
            // Double click
            if (clickTimer.current) clearTimeout(clickTimer.current);
            console.log("Double click detected");
            // Focus logic here (just select for now)
            useCADStore.getState().selectObject(id);
            clickCount.current = 0;
        }
    }
  };

  return (
    <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerOut={() => {
            if (longPressTimer.current) clearTimeout(longPressTimer.current);
        }}
    >
      <meshStandardMaterial
        color={isSelected ? "#3b82f6" : "#71717a"}
        metalness={0.4}
        roughness={0.5}
      />
    </mesh>
  );
}
