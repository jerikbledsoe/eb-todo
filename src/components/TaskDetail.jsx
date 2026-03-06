import { useState, useEffect, useRef } from 'react';

const PRIORITIES = [
  { id: 'red', label: 'Urgent', color: '#EF4444' },
  { id: 'orange', label: 'High', color: '#F97316' },
  { id: 'blue', label: 'Normal', color: '#3B82F6' },
  { id: 'white', label: 'Low', color: '#6B7280' },
];

export default function TaskDetail({ task, projects, sections, onUpdate, onDelete, onClose }) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const titleRef = useRef(null);

  useEffect(() => {
    setTitle(task?.title || '');
    setDescription(task?.description || '');
    if (task && !task.title && titleRef.current) {
      titleRef.current.focus();
    }
  }, [task?.id]);

  if (!task) {
    return (
      <div className="w-96 bg-gray-850 border-l border-gray-800 h-screen flex items-center justify-center">
        <p className="text-gray-600 text-sm">Select a task to view details</p>
      </div>
    );
  }

  const handleTitleBlur = () => {
    if (title !== task.title) onUpdate(task.id, { title });
  };

  const handleDescBlur = () => {
    if (description !== task.description) onUpdate(task.id, { description });
  };

  const project = projects.find(p => p.id === task.projectId);
  const taskSections = sections.filter(s => s.projectId === task.projectId);

  return (
    <div className="w-96 bg-gray-900/80 border-l border-gray-800 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="text-base">{project?.icon || '📁'}</span>
          <span className="text-xs text-gray-500">{project?.name || 'Inbox'}</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors text-lg"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <input
          ref={titleRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          onKeyDown={e => e.key === 'Enter' && e.target.blur()}
          placeholder="Task name..."
          className="w-full bg-transparent text-white text-lg font-medium border-none outline-none placeholder-gray-600"
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          onBlur={handleDescBlur}
          placeholder="Add a description..."
          rows={4}
          className="w-full bg-gray-800/50 text-gray-300 text-sm p-3 rounded-lg border border-gray-700 focus:border-blue-500 outline-none resize-none placeholder-gray-600"
        />

        {/* Priority */}
        <div>
          <label className="text-[11px] uppercase tracking-wider text-gray-500 mb-2 block">Priority</label>
          <div className="flex gap-2">
            {PRIORITIES.map(p => (
              <button
                key={p.id}
                onClick={() => onUpdate(task.id, { priority: p.id })}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                  task.priority === p.id
                    ? 'ring-2 scale-105'
                    : 'hover:bg-gray-800'
                }`}
                style={{
                  backgroundColor: task.priority === p.id ? p.color + '22' : 'transparent',
                  color: task.priority === p.id ? p.color : '#9CA3AF',
                  ringColor: p.color,
                  '--tw-ring-color': p.color,
                }}
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full mr-1"
                  style={{ backgroundColor: p.color }}
                />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="text-[11px] uppercase tracking-wider text-gray-500 mb-2 block">Due Date</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={task.dueDate || ''}
              onChange={e => onUpdate(task.id, { dueDate: e.target.value || null })}
              className="flex-1 bg-gray-800 text-gray-300 text-sm px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
            />
            {task.dueDate && (
              <button
                onClick={() => onUpdate(task.id, { dueDate: null })}
                className="px-3 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 text-sm transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          {/* Quick date buttons */}
          <div className="flex gap-2 mt-2">
            {[
              { label: 'Today', getValue: () => new Date().toISOString().split('T')[0] },
              { label: 'Tomorrow', getValue: () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; }},
              { label: 'Next Week', getValue: () => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0]; }},
            ].map(btn => (
              <button
                key={btn.label}
                onClick={() => onUpdate(task.id, { dueDate: btn.getValue() })}
                className="px-2.5 py-1 bg-gray-800 text-gray-400 text-xs rounded hover:bg-gray-700 hover:text-gray-200 transition-colors"
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Section / Column */}
        <div>
          <label className="text-[11px] uppercase tracking-wider text-gray-500 mb-2 block">Section</label>
          <select
            value={task.sectionId || ''}
            onChange={e => onUpdate(task.id, { sectionId: e.target.value || null })}
            className="w-full bg-gray-800 text-gray-300 text-sm px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
          >
            <option value="">No section</option>
            {taskSections.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Project */}
        <div>
          <label className="text-[11px] uppercase tracking-wider text-gray-500 mb-2 block">Project</label>
          <select
            value={task.projectId}
            onChange={e => {
              const newProjectId = e.target.value;
              const newProjectSections = sections.filter(s => s.projectId === newProjectId);
              onUpdate(task.id, {
                projectId: newProjectId,
                sectionId: newProjectSections[0]?.id || null,
              });
            }}
            className="w-full bg-gray-800 text-gray-300 text-sm px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
            ))}
          </select>
        </div>

        {/* Meta */}
        <div className="pt-2 border-t border-gray-800">
          <p className="text-[11px] text-gray-600">
            Created {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => { onDelete(task.id); onClose(); }}
          className="w-full py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          Delete Task
        </button>
      </div>
    </div>
  );
}
