import { create } from 'zustand';
// Use ignore because the file might not exist until build time
// @ts-ignore
import * as wasmBindings from '@core/rustycad';

interface BoxObject {
  id: number;
  length: number;
  width: number;
  height: number;
}

interface CADStore {
  wasm: typeof wasmBindings | null;
  documentId: number | null;
  selectedId: number | null;
  boxes: BoxObject[];

  init: () => Promise<void>;
  addBox: (l: number, w: number, h: number) => void;
  updateBox: (id: number, l: number, w: number, h: number) => void;
  selectObject: (id: number | null) => void;
  deleteObject: (id: number) => void;
}

export const useCADStore = create<CADStore>((set, get) => ({
  wasm: null,
  documentId: null,
  selectedId: null,
  boxes: [],

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
      boxes: [...state.boxes, { id, length: l, width: w, height: h }],
      selectedId: id,
    }));
  },

  updateBox: (id, l, w, h) => {
    const { wasm, documentId } = get();
    if (!wasm || documentId === null) return;

    const success = wasm.update_box(documentId, id, l, w, h);
    if (success) {
      // Optimistic update for UI performance (60fps target)
      set((state) => ({
        boxes: state.boxes.map((b) =>
          b.id === id ? { ...b, length: l, width: w, height: h } : b
        ),
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
        boxes: state.boxes.filter((b) => b.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId,
      }));
    }
  }
}));
