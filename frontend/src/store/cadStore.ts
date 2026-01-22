import { create } from 'zustand';

interface BoxObject {
  id: number;
  length: number;
  width: number;
  height: number;
}

interface CADStore {
  documentId: number | null;
  boxes: BoxObject[];
  selectedBoxId: number | null;
  wasmModule: any;
  setWasmModule: (module: any) => void;
  setDocumentId: (id: number) => void;
  addBox: (length: number, width: number, height: number) => void;
  updateBox: (id: number, length: number, width: number, height: number) => void;
  selectBox: (id: number | null) => void;
}

export const useCADStore = create<CADStore>((set, get) => ({
  documentId: null,
  boxes: [],
  selectedBoxId: null,
  wasmModule: null,
  
  setWasmModule: (module) => set({ wasmModule: module }),
  
  setDocumentId: (id) => set({ documentId: id }),
  
  addBox: (length, width, height) => {
    const { wasmModule, documentId } = get();
    if (!wasmModule || documentId === null) return;
    
    const boxId = wasmModule.add_box(documentId, length, width, height);
    const newBox: BoxObject = { id: boxId, length, width, height };
    
    set((state) => ({
      boxes: [...state.boxes, newBox],
      selectedBoxId: boxId,
    }));
  },
  
  updateBox: (id, length, width, height) => {
    const { wasmModule, documentId } = get();
    if (!wasmModule || documentId === null) return;
    
    wasmModule.update_box(documentId, id, length, width, height);
    
    set((state) => ({
      boxes: state.boxes.map((box) =>
        box.id === id ? { ...box, length, width, height } : box
      ),
    }));
  },
  
  selectBox: (id) => set({ selectedBoxId: id }),
}));
