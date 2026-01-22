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

  // We subscribe to the box data to trigger re-renders when dimensions change
  const boxData = useCADStore((state) => state.boxes.find((b) => b.id === id));

  useEffect(() => {
    if (!wasm || documentId === null || !meshRef.current) return;

    // Call WASM to get mesh data
    // Note: In a real app, we might want to memoize this or use a more efficient data transfer
    const meshData = wasm.get_mesh_data(documentId, id);
    const indices = wasm.get_mesh_indices(documentId, id);

    if (meshData.length === 0) return;

    const geometry = new THREE.BufferGeometry();

    // Mesh data is interleaved: [x, y, z, nx, ny, nz, ...]
    // We need to de-interleave it for Three.js
    const vertexCount = meshData.length / 6;
    const positions = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);

    for (let i = 0; i < vertexCount; i++) {
      // Position
      positions[i * 3] = meshData[i * 6];
      positions[i * 3 + 1] = meshData[i * 6 + 1];
      positions[i * 3 + 2] = meshData[i * 6 + 2];

      // Normal
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

    // Dispose old geometry
    if (meshRef.current.geometry) {
      meshRef.current.geometry.dispose();
    }

    meshRef.current.geometry = geometry;

  }, [id, documentId, wasm, boxData]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    useCADStore.getState().selectObject(id);
  };

  return (
    <mesh ref={meshRef} onClick={handleClick}>
      <meshStandardMaterial
        color={isSelected ? "#3b82f6" : "#71717a"}
        metalness={0.4}
        roughness={0.5}
      />
    </mesh>
  );
}
