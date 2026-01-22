import { useCADStore } from '../store';
import { Slider } from './ui/Slider';
import { GlassPanel } from './ui/GlassPanel';
import { Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ContextPill() {
  const selectedId = useCADStore((state) => state.selectedId);
  const boxes = useCADStore((state) => state.boxes);
  const updateBox = useCADStore((state) => state.updateBox);
  const deleteObject = useCADStore((state) => state.deleteObject);
  const selectObject = useCADStore((state) => state.selectObject);

  const selectedBox = boxes.find(b => b.id === selectedId);

  return (
    <AnimatePresence>
      {selectedBox && (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4"
        >
            <GlassPanel className="p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        <span className="text-sm font-semibold text-white">Box #{selectedBox.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => deleteObject(selectedBox.id)}
                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => selectObject(null)}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                         <Slider
                            label="L"
                            min="0.1" max="10" step="0.1"
                            value={selectedBox.length}
                            onChange={(e) => updateBox(selectedBox.id, parseFloat(e.target.value), selectedBox.width, selectedBox.height)}
                            className="h-12"
                        />
                    </div>
                    <div className="col-span-1">
                         <Slider
                            label="W"
                            min="0.1" max="10" step="0.1"
                            value={selectedBox.width}
                            onChange={(e) => updateBox(selectedBox.id, selectedBox.length, parseFloat(e.target.value), selectedBox.height)}
                            className="h-12"
                        />
                    </div>
                    <div className="col-span-1">
                         <Slider
                            label="H"
                            min="0.1" max="10" step="0.1"
                            value={selectedBox.height}
                            onChange={(e) => updateBox(selectedBox.id, selectedBox.length, selectedBox.width, parseFloat(e.target.value))}
                            className="h-12"
                        />
                    </div>
                </div>
            </GlassPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
