import { create } from 'zustand';
// Use ignore because the file might not exist until build time
// @ts-ignore
import * as wasmBindings from '@core/rustycad';

export type ShapeType = 'Box' | 'Cylinder' | 'Sphere';

export interface BaseObject {
  id: number;
  type: ShapeType;
  position: [number, number, number];
  rotation: [number, number, number, number];
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
  updatePlacement: (id: number, position: [number, number, number], rotation: [number, number, number, number]) => void;
  updateShapeParams: (id: number, params: Record<string, number>) => void;

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
      objects: [...state.objects, {
        id, type: 'Box', length: l, width: w, height: h,
        position: [0, 0, 0], rotation: [0, 0, 0, 1]
      }],
      selectedId: id,
    }));
  },

  addCylinder: (r, h) => {
    const { wasm, documentId } = get();
    if (!wasm || documentId === null) return;

    const id = wasm.add_cylinder(documentId, r, h);
    set((state) => ({
      objects: [...state.objects, {
        id, type: 'Cylinder', radius: r, height: h,
        position: [0, 0, 0], rotation: [0, 0, 0, 1]
      }],
      selectedId: id,
    }));
  },

  addSphere: (r) => {
    const { wasm, documentId } = get();
    if (!wasm || documentId === null) return;

    const id = wasm.add_sphere(documentId, r);
    set((state) => ({
      objects: [...state.objects, {
        id, type: 'Sphere', radius: r,
        position: [0, 0, 0], rotation: [0, 0, 0, 1]
      }],
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

  updatePlacement: (id, position, rotation) => {
    const { wasm, documentId } = get();
    if (!wasm || documentId === null) return;

    // Call WASM update placement
    wasm.update_placement(
        documentId,
        id,
        position[0], position[1], position[2],
        rotation[0], rotation[1], rotation[2], rotation[3]
    );

    set((state) => ({
      objects: state.objects.map((obj) =>
        obj.id === id ? { ...obj, position, rotation } : obj
      ),
    }));
  },

  updateShapeParams: (id, params) => {
    const obj = get().objects.find((o) => o.id === id);
    if (!obj) return;

    // Dispatch to updateShape based on type
    if (obj.type === 'Box') {
        const l = 'length' in params ? params.length : (obj as BoxObject).length;
        const w = 'width' in params ? params.width : (obj as BoxObject).width;
        const h = 'height' in params ? params.height : (obj as BoxObject).height;
        get().updateShape(id, l, w, h);
    } else if (obj.type === 'Cylinder') {
        const r = 'radius' in params ? params.radius : (obj as CylinderObject).radius;
        const h = 'height' in params ? params.height : (obj as CylinderObject).height;
        get().updateShape(id, r, h);
    } else if (obj.type === 'Sphere') {
        const r = 'radius' in params ? params.radius : (obj as SphereObject).radius;
        get().updateShape(id, r);
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
