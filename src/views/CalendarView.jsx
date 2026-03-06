import { useState, useMemo } from 'react';

const PRIORITY_COLORS = {
  red: '#EF4444',
  orange: '#F97316',
  blue: '#3B82F6',
  white: '#6B7280',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarView({ allTasks, selectedTaskId, onSelectTask, onToggleTask, updateTask }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [draggedTask, setDraggedTask] = useState(null);

  const todayStr = today.toISOString().split('T')[0];

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days = [];

    // Padding days from previous month
    const prevMonth = new Date(currentYear, currentMonth, 0);
    for (let i = startPad - 1; i >= 0; i--) {
      days.push({
        date: new Date(currentYear, currentMonth - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      days.push({
        date: new Date(currentYear, currentMonth, d),
        isCurrentMonth: true,
      });
    }

    // Pad to fill 6 rows (42 cells)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(currentYear, currentMonth + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentMonth, currentYear]);

  // Map tasks by date
  const tasksByDate = useMemo(() => {
    const map = {};
    allTasks.forEach(task => {
      if (task.dueDate) {
        if (!map[task.dueDate]) map[task.dueDate] = [];
        map[task.dueDate].push(task);
      }
    });
    // Sort each date's tasks by priority
    Object.values(map).forEach(arr => {
      const priorityOrder = { red: 0, orange: 1, blue: 2, white: 3 };
      arr.sort((a, b) => (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3));
    });
    return map;
  }, [allTasks]);

  const goToPrev = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const goToNext = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, dateStr) => {
    e.preventDefault();
    if (draggedTask) {
      updateTask(draggedTask.id, { dueDate: dateStr });
      setDraggedTask(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 bg-gray-800 text-gray-300 text-sm rounded-lg hover:bg-gray-700 transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToPrev}
            className="w-8 h-8 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            ‹
          </button>
          <button
            onClick={goToNext}
            className="w-8 h-8 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
          >
            ›
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 px-8 pb-8 overflow-hidden flex flex-col">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-px mb-1">
          {DAYS.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-px bg-gray-800/30 rounded-lg overflow-hidden">
          {calendarDays.map((day, i) => {
            const dateStr = day.date.toISOString().split('T')[0];
            const dayTasks = tasksByDate[dateStr] || [];
            const isToday = dateStr === todayStr;

            return (
              <div
                key={i}
                className={`bg-gray-900 p-1.5 overflow-hidden flex flex-col ${
                  !day.isCurrentMonth ? 'opacity-30' : ''
                } ${isToday ? 'ring-1 ring-inset ring-blue-500/40' : ''}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, dateStr)}
              >
                <span className={`text-xs mb-1 ${
                  isToday ? 'text-blue-400 font-bold' : 'text-gray-500'
                }`}>
                  {day.date.getDate()}
                </span>
                <div className="flex-1 overflow-y-auto space-y-0.5">
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onClick={() => onSelectTask(task.id)}
                      className={`text-[11px] px-1.5 py-0.5 rounded cursor-pointer truncate hover:opacity-80 ${
                        task.completed ? 'line-through opacity-40' : ''
                      } ${selectedTaskId === task.id ? 'ring-1 ring-white/30' : ''}`}
                      style={{
                        backgroundColor: (PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.white) + '22',
                        color: PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.white,
                        borderLeft: `2px solid ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.white}`,
                      }}
                    >
                      {task.title || 'Untitled'}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[10px] text-gray-600 px-1">+{dayTasks.length - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
