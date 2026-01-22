import { useState, useEffect } from 'react';
import { useCADStore } from '../store/cadStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [length, setLength] = useState(2);
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(2);

  const boxes = useCADStore((state) => state.boxes);
  const selectedBoxId = useCADStore((state) => state.selectedBoxId);
  const addBox = useCADStore((state) => state.addBox);
  const updateBox = useCADStore((state) => state.updateBox);
  const selectBox = useCADStore((state) => state.selectBox);

  const selectedBox = boxes.find((box) => box.id === selectedBoxId);

  useEffect(() => {
    if (selectedBox) {
      setLength(selectedBox.length);
      setWidth(selectedBox.width);
      setHeight(selectedBox.height);
    }
  }, [selectedBox]);

  const handleAddBox = () => {
    addBox(length, width, height);
  };

  const handleUpdateBox = () => {
    if (selectedBoxId !== null) {
      updateBox(selectedBoxId, length, width, height);
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="sidebar-close" onClick={onClose}>
        Close Menu
      </button>

      <h2 style={{ marginTop: 0 }}>RustyCAD</h2>
      
      <div style={{ marginBottom: '30px' }}>
        <h3>Box Parameters</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Length: {length.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={length}
            onChange={(e) => setLength(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Width: {width.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={width}
            onChange={(e) => setWidth(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Height: {height.toFixed(2)}
          </label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={height}
            onChange={(e) => setHeight(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <button
          onClick={handleAddBox}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '10px'
          }}
        >
          Add Box
        </button>

        {selectedBoxId !== null && (
          <button
            onClick={handleUpdateBox}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Update Selected Box
          </button>
        )}
      </div>

      <div>
        <h3>Objects</h3>
        {boxes.length === 0 ? (
          <p style={{ color: '#888' }}>No objects yet</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {boxes.map((box) => (
              <li
                key={box.id}
                onClick={() => selectBox(box.id)}
                style={{
                  padding: '10px',
                  marginBottom: '5px',
                  backgroundColor: selectedBoxId === box.id ? '#4CAF50' : '#3a3a3a',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Box #{box.id}
                <div style={{ fontSize: '12px', color: '#aaa', marginTop: '5px' }}>
                  {box.length.toFixed(1)} × {box.width.toFixed(1)} × {box.height.toFixed(1)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
