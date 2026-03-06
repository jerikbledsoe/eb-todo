import { SimpleTaskItem } from '../components/TaskItem.jsx';

const PRIORITY_ORDER = { red: 0, orange: 1, blue: 2, white: 3 };

export default function TodayView({ allTasks, projects, selectedTaskId, onSelectTask, onToggleTask }) {
  const today = new Date().toISOString().split('T')[0];

  const overdueTasks = allTasks
    .filter(t => !t.completed && t.dueDate && t.dueDate < today)
    .sort((a, b) => (PRIORITY_ORDER[a.priority] || 3) - (PRIORITY_ORDER[b.priority] || 3));

  const todayTasks = allTasks
    .filter(t => !t.completed && t.dueDate === today)
    .sort((a, b) => (PRIORITY_ORDER[a.priority] || 3) - (PRIORITY_ORDER[b.priority] || 3));

  const completedToday = allTasks
    .filter(t => t.completed && t.dueDate === today);

  const getProjectName = (projectId) => {
    const p = projects.find(pr => pr.id === projectId);
    return p ? `${p.icon} ${p.name}` : '';
  };

  const totalCount = overdueTasks.length + todayTasks.length;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-8 pt-8 pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <span>☀️</span> Today
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          {totalCount > 0 && ` • ${totalCount} task${totalCount !== 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="px-8 pb-8 space-y-6">
        {/* Overdue */}
        {overdueTasks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">
              Overdue
              <span className="ml-2 text-red-500/60 font-normal">{overdueTasks.length}</span>
            </h3>
            <div className="space-y-1">
              {overdueTasks.map(task => (
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
        )}

        {/* Today's Tasks */}
        {todayTasks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Due Today
              <span className="ml-2 text-gray-600 font-normal">{todayTasks.length}</span>
            </h3>
            <div className="space-y-1">
              {todayTasks.map(task => (
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
        )}

        {/* Empty State */}
        {totalCount === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🎉</p>
            <p className="text-gray-400 text-lg">All clear for today</p>
            <p className="text-gray-600 text-sm mt-1">Enjoy the rest of your day, or add some tasks.</p>
          </div>
        )}

        {/* Completed Today */}
        {completedToday.length > 0 && (
          <div className="pt-4 border-t border-gray-800">
            <h3 className="text-sm text-gray-600 mb-2">{completedToday.length} completed today</h3>
            <div className="space-y-1">
              {completedToday.map(task => (
                <SimpleTaskItem
                  key={task.id}
                  task={task}
                  isSelected={selectedTaskId === task.id}
                  onSelect={onSelectTask}
                  onToggle={onToggleTask}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
