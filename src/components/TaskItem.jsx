import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const PRIORITY_COLORS = {
  red: { border: '#EF4444', bg: 'rgba(239,68,68,0.1)', ring: '#EF4444' },
  orange: { border: '#F97316', bg: 'rgba(249,115,22,0.1)', ring: '#F97316' },
  blue: { border: '#3B82F6', bg: 'rgba(59,130,246,0.1)', ring: '#3B82F6' },
  white: { border: '#6B7280', bg: 'transparent', ring: '#6B7280' },
};

export default function TaskItem({ task, isSelected, onSelect, onToggle, isDraggable = true }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !isDraggable,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    borderLeftColor: PRIORITY_COLORS[task.priority]?.border || PRIORITY_COLORS.white.border,
  };

  const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.white;

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) return 'Today';
    if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';
    if (date < today) return 'Overdue';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const dateLabel = formatDate(task.dueDate);
  const isOverdue = dateLabel === 'Overdue';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`task-item border-l-4 rounded-lg px-3 py-2.5 cursor-pointer flex items-start gap-3 group ${
        isSelected ? 'bg-gray-700/60 ring-1 ring-blue-500/40' : ''
      } ${task.completed ? 'opacity-50' : ''}`}
      onClick={() => onSelect(task.id)}
    >
      {/* Drag Handle */}
      {isDraggable && (
        <div
          {...listeners}
          className="mt-0.5 cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={e => e.stopPropagation()}
        >
          ⠿
        </div>
      )}

      {/* Checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
        className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110"
        style={{
          borderColor: priorityColor.ring,
          backgroundColor: task.completed ? priorityColor.ring : 'transparent',
        }}
      >
        {task.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-tight ${task.completed ? 'line-through text-gray-500' : 'text-gray-100'}`}>
          {task.title || 'Untitled task'}
        </p>
        {task.description && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          {dateLabel && (
            <span className={`text-[11px] ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
              {dateLabel}
            </span>
          )}
        </div>
      </div>

      {/* Priority dot */}
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
        style={{ backgroundColor: priorityColor.border }}
        title={`Priority: ${task.priority}`}
      />
    </div>
  );
}

// Non-draggable version for calendar/today views
export function SimpleTaskItem({ task, isSelected, onSelect, onToggle }) {
  const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.white;

  return (
    <div
      className={`task-item border-l-4 rounded-lg px-3 py-2.5 cursor-pointer flex items-start gap-3 ${
        isSelected ? 'bg-gray-700/60 ring-1 ring-blue-500/40' : ''
      } ${task.completed ? 'opacity-50' : ''}`}
      style={{ borderLeftColor: priorityColor.border }}
      onClick={() => onSelect(task.id)}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
        className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110"
        style={{
          borderColor: priorityColor.ring,
          backgroundColor: task.completed ? priorityColor.ring : 'transparent',
        }}
      >
        {task.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-100'}`}>
          {task.title || 'Untitled task'}
        </p>
        {task.description && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</p>
        )}
      </div>
      <div
        className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
        style={{ backgroundColor: priorityColor.border }}
      />
    </div>
  );
}
