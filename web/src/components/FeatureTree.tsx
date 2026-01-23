import { useCADStore } from '../store';
import { Box, Layers } from 'lucide-react';
import clsx from 'clsx';

export function FeatureTree() {
  const boxes = useCADStore((state) => state.boxes);
  const selectedId = useCADStore((state) => state.selectedId);
  const selectObject = useCADStore((state) => state.selectObject);
  const addBox = useCADStore((state) => state.addBox);

  return (
    <div className="h-full bg-zinc-900 border-r border-zinc-800 flex flex-col w-64 shrink-0">
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
        <Layers className="w-4 h-4 text-zinc-400" />
        <span className="font-semibold text-sm text-zinc-200">Feature Tree</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {boxes.length === 0 ? (
           <div className="text-zinc-600 text-xs p-4 text-center border border-dashed border-zinc-800 rounded">
             No objects in scene
           </div>
        ) : (
          <div className="flex flex-col gap-1">
            {boxes.map((box) => (
              <button
                key={box.id}
                onClick={() => selectObject(box.id)}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors w-full text-left",
                  selectedId === box.id
                    ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                )}
              >
                <Box className="w-3 h-3 shrink-0" />
                <span className="truncate">Box #{box.id}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-800">
        <button
            onClick={() => addBox(2, 2, 2)}
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded transition-colors flex items-center justify-center gap-2"
        >
            <Box className="w-3 h-3" />
            Create Box
        </button>
      </div>
    </div>
  );
}
