import { useMemo } from 'react';
import { SimpleTaskItem } from '../components/TaskItem.jsx';

export default function UpcomingView({ allTasks, projects, selectedTaskId, onSelectTask, onToggleTask }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const groupedTasks = useMemo(() => {
    const upcoming = allTasks
      .filter(t => !t.completed && t.dueDate)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const groups = {};
    upcoming.forEach(task => {
      const date = new Date(task.dueDate + 'T00:00:00');
      let label;
      const diffDays = Math.floor((date - today) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) label = 'Overdue';
      else if (diffDays === 0) label = 'Today';
      else if (diffDays === 1) label = 'Tomorrow';
      else if (diffDays < 7) label = date.toLocaleDateString('en-US', { weekday: 'long' });
      else label = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

      if (!groups[label]) groups[label] = { label, tasks: [], isOverdue: diffDays < 0 };
      groups[label].tasks.push(task);
    });

    return Object.values(groups);
  }, [allTasks]);

  const noDueDateTasks = allTasks.filter(t => !t.completed && !t.dueDate);

  const getProjectName = (projectId) => {
    const p = projects.find(pr => pr.id === projectId);
    return p ? `${p.icon} ${p.name}` : '';
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-8 pt-8 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span>📅</span> Upcoming
        </h2>
        <p className="text-sm text-gray-500 mt-1">All scheduled tasks</p>
      </div>

      <div className="px-8 pb-8 space-y-6">
        {groupedTasks.map(group => (
          <div key={group.label}>
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-2 ${
              group.isOverdue ? 'text-red-400' : 'text-gray-400'
            }`}>
              {group.label}
              <span className="ml-2 text-gray-600 font-normal">{group.tasks.length}</span>
            </h3>
            <div className="space-y-1">
              {group.tasks.map(task => (
                <div key={task.id}>
                  <SimpleTaskItem
                    task={task}
                    isSelected={selectedTaskId === task.id}
                    onSelect={onSelectTask}
                    onToggle={onToggleTask}
                  />
                  <p className="text-[10px] text-gray-600 pl-10 -mt-0.5">{getProjectName(task.projectId)}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {groupedTasks.length === 0 && noDueDateTasks.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-gray-400 text-lg">Nothing scheduled</p>
            <p className="text-gray-600 text-sm mt-1">Add due dates to your tasks to see them here.</p>
          </div>
        )}

        {noDueDateTasks.length > 0 && (
          <div className="pt-4 border-t border-gray-800">
            <h3 className="text-sm text-gray-600 mb-2">{noDueDateTasks.length} without a date</h3>
          </div>
        )}
      </div>
    </div>
  );
}
