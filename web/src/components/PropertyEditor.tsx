import { useCADStore } from '../store';
import { Settings2 } from 'lucide-react';

export function PropertyEditor() {
  const selectedId = useCADStore((state) => state.selectedId);
  const boxes = useCADStore((state) => state.boxes);
  const updateBox = useCADStore((state) => state.updateBox);

  const selectedBox = boxes.find(b => b.id === selectedId);

  if (!selectedBox) {
    return (
      <div className="h-full bg-zinc-900 border-l border-zinc-800 w-64 shrink-0 flex flex-col items-center justify-center text-zinc-600">
        <Settings2 className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-xs">No selection</span>
      </div>
    );
  }

  const handleChange = (key: 'length' | 'width' | 'height', value: string) => {
    const val = parseFloat(value);
    if (isNaN(val)) return;

    updateBox(
        selectedBox.id,
        key === 'length' ? val : selectedBox.length,
        key === 'width' ? val : selectedBox.width,
        key === 'height' ? val : selectedBox.height
    );
  };

  return (
    <div className="h-full bg-zinc-900 border-l border-zinc-800 w-64 shrink-0 flex flex-col">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-200">Properties</h2>
        <div className="text-xs text-zinc-500 mt-1 font-mono">ID: {selectedBox.id}</div>
      </div>

      <div className="p-4 flex flex-col gap-6">
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-400 block uppercase tracking-wider">Dimensions</label>

          <div className="space-y-3">
            <div>
                <div className="flex justify-between mb-1">
                    <label className="text-xs text-zinc-400">Length</label>
                    <span className="text-xs text-zinc-500 font-mono">{selectedBox.length.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                    <input
                        type="range"
                        min="0.1" max="10" step="0.1"
                        value={selectedBox.length}
                        onChange={(e) => handleChange('length', e.target.value)}
                        className="flex-1"
                    />
                </div>
            </div>

            <div>
                <div className="flex justify-between mb-1">
                    <label className="text-xs text-zinc-400">Width</label>
                    <span className="text-xs text-zinc-500 font-mono">{selectedBox.width.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                    <input
                        type="range"
                        min="0.1" max="10" step="0.1"
                        value={selectedBox.width}
                        onChange={(e) => handleChange('width', e.target.value)}
                        className="flex-1"
                    />
                </div>
            </div>

            <div>
                <div className="flex justify-between mb-1">
                    <label className="text-xs text-zinc-400">Height</label>
                    <span className="text-xs text-zinc-500 font-mono">{selectedBox.height.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                    <input
                        type="range"
                        min="0.1" max="10" step="0.1"
                        value={selectedBox.height}
                        onChange={(e) => handleChange('height', e.target.value)}
                        className="flex-1"
                    />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
