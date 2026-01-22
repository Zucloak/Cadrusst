import { useEffect, useRef } from 'react';
import { useCADStore } from '../store/cadStore';
import * as THREE from 'three';

interface BoxMeshProps {
  boxId: number;
  documentId: number;
  wasmModule: any;
}

export function BoxMesh({ boxId, documentId, wasmModule }: BoxMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const selectedBoxId = useCADStore((state) => state.selectedBoxId);
  const isSelected = selectedBoxId === boxId;

  useEffect(() => {
    if (!wasmModule || !meshRef.current) return;

    // Get mesh data from WASM
    const meshData = wasmModule.get_mesh_data(documentId, boxId);
    const indices = wasmModule.get_mesh_indices(documentId, boxId);

    if (meshData.length === 0 || indices.length === 0) return;

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    
    // Extract position and normal data (interleaved: [x, y, z, nx, ny, nz, ...])
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
    geometry.setIndex(Array.from(indices));

    // Dispose old geometry
    if (geometryRef.current) {
      geometryRef.current.dispose();
    }

    geometryRef.current = geometry;
    meshRef.current.geometry = geometry;
  }, [boxId, documentId, wasmModule]);

  useEffect(() => {
    return () => {
      if (geometryRef.current) {
        geometryRef.current.dispose();
      }
    };
  }, []);

  return (
    <mesh ref={meshRef}>
      <meshStandardMaterial 
        color={isSelected ? '#4CAF50' : '#2196F3'} 
        wireframe={false}
      />
    </mesh>
  );
}
