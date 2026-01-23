import { create } from 'zustand';
// Use ignore because the file might not exist until build time
// @ts-ignore
import * as wasmBindings from '@core/rustycad';

export type ShapeType = 'Box' | 'Cylinder' | 'Sphere';

export interface BaseObject {
  id: number;
  type: ShapeType;
}

export interface BoxObject extends BaseObject {
  type: 'Box';
  length: number;
  width: number;
  height: number;
}

export interface CylinderObject extends BaseObject {
  type: 'Cylinder';
  radius: number;
  height: number;
}

export interface SphereObject extends BaseObject {
  type: 'Sphere';
  radius: number;
}

export type CADObject = BoxObject | CylinderObject | SphereObject;

interface CADStore {
  wasm: typeof wasmBindings | null;
  documentId: number | null;
  selectedId: number | null;
  objects: CADObject[];

  init: () => Promise<void>;

  addBox: (l: number, w: number, h: number) => void;
  addCylinder: (r: number, h: number) => void;
  addSphere: (r: number) => void;

  updateShape: (id: number, p1: number, p2?: number, p3?: number) => void;

  selectObject: (id: number | null) => void;
  deleteObject: (id: number) => void;
}

export const useCADStore = create<CADStore>((set, get) => ({
  wasm: null,
  documentId: null,
  selectedId: null,
  objects: [],

  init: async () => {
    try {
      // Initialize the WASM module
      // @ts-ignore - Default export is the init function
      await wasmBindings.default();

      // Call the Rust-side init function
      wasmBindings.init();

      // Create a new document
      const docId = wasmBindings.create_document();

      set({
        wasm: wasmBindings,
        documentId: docId
      });
      console.log("RustyCAD Core Initialized. Document ID:", docId);
    } catch (err) {
      console.error("Failed to initialize RustyCAD Core:", err);
    }
  },

  addBox: (l, w, h) => {
    const { wasm, documentId } = get();
    if (!wasm || documentId === null) return;

    const id = wasm.add_box(documentId, l, w, h);
    set((state) => ({
      objects: [...state.objects, { id, type: 'Box', length: l, width: w, height: h }],
      selectedId: id,
    }));
  },

  addCylinder: (r, h) => {
    const { wasm, documentId } = get();
    if (!wasm || documentId === null) return;

    const id = wasm.add_cylinder(documentId, r, h);
    set((state) => ({
      objects: [...state.objects, { id, type: 'Cylinder', radius: r, height: h }],
      selectedId: id,
    }));
  },

  addSphere: (r) => {
    const { wasm, documentId } = get();
    if (!wasm || documentId === null) return;

    const id = wasm.add_sphere(documentId, r);
    set((state) => ({
      objects: [...state.objects, { id, type: 'Sphere', radius: r }],
      selectedId: id,
    }));
  },

  updateShape: (id, p1, p2 = 0, p3 = 0) => {
    const { wasm, documentId } = get();
    if (!wasm || documentId === null) return;

    // Call generic update function
    const success = wasm.update_shape_params(documentId, id, p1, p2, p3);

    if (success) {
      set((state) => ({
        objects: state.objects.map((obj) => {
          if (obj.id !== id) return obj;

          if (obj.type === 'Box') {
            return { ...obj, length: p1, width: p2, height: p3 };
          } else if (obj.type === 'Cylinder') {
            return { ...obj, radius: p1, height: p2 };
          } else if (obj.type === 'Sphere') {
            return { ...obj, radius: p1 };
          }
          return obj;
        }),
      }));
    }
  },

  selectObject: (id) => set({ selectedId: id }),

  deleteObject: (id) => {
    const { wasm, documentId } = get();
    if (!wasm || documentId === null) return;

    const success = wasm.delete_object(documentId, id);
    if (success) {
      set((state) => ({
        objects: state.objects.filter((obj) => obj.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId,
      }));
    }
  }
}));
