import { useCADStore } from '../store';
import { Settings2 } from 'lucide-react';

export function PropertyEditor() {
  const selectedId = useCADStore((state) => state.selectedId);
  const objects = useCADStore((state) => state.objects);
  const updateShape = useCADStore((state) => state.updateShape);

  const selectedObject = objects.find(o => o.id === selectedId);

  if (!selectedObject) {
    return (
      <div className="h-full bg-zinc-900 border-l border-zinc-800 w-64 shrink-0 flex flex-col items-center justify-center text-zinc-600">
        <Settings2 className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-xs">No selection</span>
      </div>
    );
  }

  const handleUpdate = (prop: string, value: string) => {
    const val = parseFloat(value);
    if (isNaN(val)) return;

    if (selectedObject.type === 'Box') {
        const length = prop === 'length' ? val : selectedObject.length;
        const width = prop === 'width' ? val : selectedObject.width;
        const height = prop === 'height' ? val : selectedObject.height;
        updateShape(selectedObject.id, length, width, height);
    } else if (selectedObject.type === 'Cylinder') {
        const radius = prop === 'radius' ? val : selectedObject.radius;
        const height = prop === 'height' ? val : selectedObject.height;
        updateShape(selectedObject.id, radius, height);
    } else if (selectedObject.type === 'Sphere') {
        const radius = prop === 'radius' ? val : selectedObject.radius;
        updateShape(selectedObject.id, radius);
    }
  };

  return (
    <div className="h-full bg-zinc-900 border-l border-zinc-800 w-64 shrink-0 flex flex-col">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-200">Properties</h2>
        <div className="text-xs text-zinc-500 mt-1 font-mono">ID: {selectedObject.id} ({selectedObject.type})</div>
      </div>

      <div className="p-4 flex flex-col gap-6">
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-400 block uppercase tracking-wider">Dimensions</label>

          <div className="space-y-3">
            {selectedObject.type === 'Box' && (
                <>
                    <PropertyInput label="Length" value={selectedObject.length} onChange={(v) => handleUpdate('length', v)} />
                    <PropertyInput label="Width" value={selectedObject.width} onChange={(v) => handleUpdate('width', v)} />
                    <PropertyInput label="Height" value={selectedObject.height} onChange={(v) => handleUpdate('height', v)} />
                </>
            )}
            {selectedObject.type === 'Cylinder' && (
                <>
                    <PropertyInput label="Radius" value={selectedObject.radius} onChange={(v) => handleUpdate('radius', v)} />
                    <PropertyInput label="Height" value={selectedObject.height} onChange={(v) => handleUpdate('height', v)} />
                </>
            )}
            {selectedObject.type === 'Sphere' && (
                <>
                    <PropertyInput label="Radius" value={selectedObject.radius} onChange={(v) => handleUpdate('radius', v)} />
                </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertyInput({ label, value, onChange }: { label: string, value: number, onChange: (val: string) => void }) {
    return (
        <div>
            <div className="flex justify-between mb-1">
                <label className="text-xs text-zinc-400">{label}</label>
                <span className="text-xs text-zinc-500 font-mono">{value.toFixed(2)}</span>
            </div>
            <div className="flex gap-2">
                <input
                    type="range"
                    min="0.1" max="10" step="0.1"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1"
                />
            </div>
        </div>
    );
}
