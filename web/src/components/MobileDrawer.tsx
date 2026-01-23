import { Drawer } from 'vaul';
import { useCADStore } from '../store';
import { Slider } from './ui/Slider';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function MobileDrawer() {
  const selectedId = useCADStore((state) => state.selectedId);
  const boxes = useCADStore((state) => state.boxes);
  const updateBox = useCADStore((state) => state.updateBox);
  const deleteObject = useCADStore((state) => state.deleteObject);
  const selectObject = useCADStore((state) => state.selectObject);

  const [open, setOpen] = useState(false);

  // Sync open state with selection
  useEffect(() => {
    setOpen(selectedId !== null);
  }, [selectedId]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Delay clearing selection to allow animation to finish
      setTimeout(() => selectObject(null), 300);
    }
  };

  const selectedBox = boxes.find(b => b.id === selectedId);

  if (!selectedBox) return null;

  return (
    <Drawer.Root open={open} onOpenChange={handleOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-zinc-900 flex flex-col rounded-t-[10px] h-[45%] mt-24 fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800">
          <div className="p-4 bg-zinc-900 rounded-t-[10px] flex-1">
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-zinc-700 mb-8" />

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Edit Box #{selectedBox.id}</h2>
              <button
                onClick={() => deleteObject(selectedBox.id)}
                className="p-2 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
                <Slider
                    label="Length"
                    min="0.1" max="10" step="0.1"
                    value={selectedBox.length}
                    valueDisplay={selectedBox.length.toFixed(2)}
                    onChange={(e) => updateBox(selectedBox.id, parseFloat(e.target.value), selectedBox.width, selectedBox.height)}
                />
                <Slider
                    label="Width"
                    min="0.1" max="10" step="0.1"
                    value={selectedBox.width}
                    valueDisplay={selectedBox.width.toFixed(2)}
                    onChange={(e) => updateBox(selectedBox.id, selectedBox.length, parseFloat(e.target.value), selectedBox.height)}
                />
                <Slider
                    label="Height"
                    min="0.1" max="10" step="0.1"
                    value={selectedBox.height}
                    valueDisplay={selectedBox.height.toFixed(2)}
                    onChange={(e) => updateBox(selectedBox.id, selectedBox.length, selectedBox.width, parseFloat(e.target.value))}
                />
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
