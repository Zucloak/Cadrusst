import { create } from 'zustand';
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

      // Call the Rust-side init function (panic hook, etc)
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
      set((state) => ({
        boxes: state.boxes.map((b) =>
          b.id === id ? { ...b, length: l, width: w, height: h } : b
        ),
      }));
    }
  },

  selectObject: (id) => set({ selectedId: id }),
}));
