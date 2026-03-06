import { useState } from 'react';

const SECTION_COLORS = ['#6B7280', '#EF4444', '#F97316', '#EAB308', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
const SECTION_ICONS = ['', '📋', '🔥', '⚡', '🎯', '🚀', '💡', '📦', '🔧', '📌', '🏷️', '⭐'];

export default function SectionCreator({ onAdd, onCancel, parentSectionId = null, compact = false }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6B7280');
  const [icon, setIcon] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name.trim(), parentSectionId, color, icon);
    setName('');
    setColor('#6B7280');
    setIcon('');
    setShowOptions(false);
  };

  return (
    <div className={`${compact ? 'p-2' : 'p-3'} bg-gray-800/80 rounded-lg`}>
      <div className="flex gap-2">
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleAdd();
            if (e.key === 'Escape') onCancel();
          }}
          placeholder={parentSectionId ? 'Subsection name...' : 'Section name...'}
          className="flex-1 bg-gray-700 text-white text-sm px-3 py-1.5 rounded border border-gray-600 focus:border-blue-500 outline-none"
        />
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="px-2 py-1.5 bg-gray-700 text-gray-400 text-sm rounded hover:bg-gray-600 transition-colors"
          title="Customize"
        >
          🎨
        </button>
      </div>

      {showOptions && (
        <div className="mt-2 space-y-2">
          {/* Color picker */}
          <div>
            <p className="text-[10px] text-gray-500 mb-1">Color</p>
            <div className="flex gap-1.5">
              {SECTION_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent hover:border-gray-500'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          {/* Icon picker */}
          <div>
            <p className="text-[10px] text-gray-500 mb-1">Icon</p>
            <div className="flex gap-1 flex-wrap">
              {SECTION_ICONS.map((ic, i) => (
                <button
                  key={i}
                  onClick={() => setIcon(ic)}
                  className={`w-7 h-7 rounded text-sm flex items-center justify-center transition-all ${icon === ic ? 'bg-gray-600 ring-1 ring-blue-500' : 'hover:bg-gray-700'}`}
                >
                  {ic || '—'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <button
          onClick={handleAdd}
          className="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded hover:bg-blue-500 transition-colors"
        >
          Add
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-700 text-gray-300 text-xs py-1.5 rounded hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
