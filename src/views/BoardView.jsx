import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import SectionCreator from '../components/SectionCreator.jsx';

const PRIORITY_COLORS = {
  red: '#EF4444',
  orange: '#F97316',
  blue: '#3B82F6',
  white: '#6B7280',
};

// Kanban Card (draggable)
function KanbanCard({ task, isSelected, onSelect, onToggle }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.white;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    borderLeftColor: priorityColor,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={() => onSelect(task.id)}
      className={`bg-gray-800 rounded-lg p-3 cursor-pointer border-l-4 hover:bg-gray-750 transition-colors ${
        isSelected ? 'ring-1 ring-blue-500/50' : ''
      } ${task.completed ? 'opacity-40' : ''}`}
      style={style}
    >
      <div className="flex items-start gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(task.id); }}
          className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center"
          style={{
            borderColor: priorityColor,
            backgroundColor: task.completed ? priorityColor : 'transparent',
          }}
        >
          {task.completed && (
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
            {task.title || 'Untitled'}
          </p>
          {task.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          )}
          {task.dueDate && (
            <p className="text-[11px] text-gray-500 mt-1.5">{
              new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            }</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Droppable Kanban Column
function KanbanColumn({
  section, tasks, childSections, allTasks,
  selectedTaskId, onSelectTask, onToggleTask,
  addTask, addSection, deleteSection, projectId, getChildSections,
}) {
  const { setNodeRef, isOver } = useDroppable({ id: section.id });
  const [showAddChild, setShowAddChild] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const completedTasks = allTasks.filter(t => t.sectionId === section.id && t.completed);

  return (
    <div
      className={`flex-shrink-0 w-72 flex flex-col bg-gray-900/50 rounded-xl max-h-full ${
        isOver ? 'ring-2 ring-blue-500/30' : ''
      }`}
    >
      {/* Column Header */}
      <div className="px-3 py-3 flex items-center justify-between group">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: section.color || '#6B7280' }}
          />
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider truncate">
            {section.icon && <span className="mr-1">{section.icon}</span>}
            {section.name}
            <span className="ml-2 text-gray-600 font-normal">{tasks.length}</span>
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAddChild(!showAddChild)}
            className="text-gray-700 hover:text-blue-400 text-xs transition-colors opacity-0 group-hover:opacity-100"
            title="Add subsection"
          >
            +📁
          </button>
          <button
            onClick={() => addTask(projectId, section.id)}
            className="text-gray-600 hover:text-blue-400 text-lg transition-colors"
          >
            +
          </button>
          <button
            onClick={() => deleteSection(section.id)}
            className="text-gray-700 hover:text-red-400 text-xs transition-colors opacity-0 group-hover:opacity-100"
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Subsection creator */}
      {showAddChild && (
        <div className="px-2 mb-2">
          <SectionCreator
            compact
            parentSectionId={section.id}
            onAdd={(name, parentId, color, icon) => {
              addSection(projectId, name, parentId, color, icon);
              setShowAddChild(false);
            }}
            onCancel={() => setShowAddChild(false)}
          />
        </div>
      )}

      {/* Cards */}
      <div
        ref={setNodeRef}
        className="flex-1 px-2 pb-2 space-y-2 min-h-[60px] overflow-y-auto"
      >
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <KanbanCard
              key={task.id}
              task={task}
              isSelected={selectedTaskId === task.id}
              onSelect={onSelectTask}
              onToggle={onToggleTask}
            />
          ))}
        </SortableContext>

        {/* Nested child sections as sub-columns within the column */}
        {childSections.map(child => {
          const childTasks = allTasks.filter(t => t.sectionId === child.id && !t.completed).sort((a, b) => a.order - b.order);
          return (
            <NestedColumnSection
              key={child.id}
              section={child}
              tasks={childTasks}
              selectedTaskId={selectedTaskId}
              onSelectTask={onSelectTask}
              onToggleTask={onToggleTask}
              addTask={addTask}
              deleteSection={deleteSection}
              projectId={projectId}
            />
          );
        })}

        {/* Completed toggle */}
        {completedTasks.length > 0 && (
          <div className="pt-1">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors"
            >
              {showCompleted ? '▼' : '▶'} {completedTasks.length} done
            </button>
            {showCompleted && completedTasks.map(task => (
              <KanbanCard
                key={task.id}
                task={task}
                isSelected={selectedTaskId === task.id}
                onSelect={onSelectTask}
                onToggle={onToggleTask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Nested subsection displayed within a kanban column
function NestedColumnSection({ section, tasks, selectedTaskId, onSelectTask, onToggleTask, addTask, deleteSection, projectId }) {
  const { setNodeRef, isOver } = useDroppable({ id: section.id });

  return (
    <div className={`border border-gray-700/50 rounded-lg p-2 ${isOver ? 'ring-1 ring-blue-500/20' : ''}`}>
      <div className="flex items-center justify-between mb-1.5 group">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: section.color || '#6B7280' }} />
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
            {section.icon && <span className="mr-0.5">{section.icon}</span>}
            {section.name}
          </span>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => addTask(projectId, section.id)} className="text-gray-600 hover:text-blue-400 text-xs">+</button>
          <button onClick={() => deleteSection(section.id)} className="text-gray-700 hover:text-red-400 text-[10px]">✕</button>
        </div>
      </div>
      <div ref={setNodeRef} className="space-y-1.5 min-h-[24px]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <KanbanCard
              key={task.id}
              task={task}
              isSelected={selectedTaskId === task.id}
              onSelect={onSelectTask}
              onToggle={onToggleTask}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

export default function BoardView({
  project, sections, tasks,
  selectedTaskId, onSelectTask, onToggleTask,
  addTask, addSection, deleteSection, moveTask, getChildSections,
}) {
  const [activeId, setActiveId] = useState(null);
  const [showNewSection, setShowNewSection] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const allProjectTasks = tasks;
  const activeTasks = tasks.filter(t => !t.completed);

  // Unsectioned tasks
  const unsectioned = activeTasks.filter(t => !t.sectionId);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const taskId = active.id;
    const overId = over.id;

    // Find all sections (including nested)
    const allSections = [];
    const collectSections = (secs) => {
      secs.forEach(s => {
        allSections.push(s);
        const children = getChildSections(s.id);
        collectSections(children);
      });
    };
    collectSections(sections);

    const targetSection = allSections.find(s => s.id === overId);
    const targetTask = activeTasks.find(t => t.id === overId);

    if (overId === '__unsorted__') {
      moveTask(taskId, null, 0);
    } else if (targetSection) {
      moveTask(taskId, targetSection.id, 0);
    } else if (targetTask) {
      const sectionTasks = activeTasks
        .filter(t => t.sectionId === targetTask.sectionId)
        .sort((a, b) => a.order - b.order);
      const targetIndex = sectionTasks.findIndex(t => t.id === overId);
      moveTask(taskId, targetTask.sectionId, targetIndex);
    }
  };

  const activeTask = activeTasks.find(t => t.id === activeId);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">{project.icon}</span>
          <h2 className="text-2xl font-bold text-white">{project.name}</h2>
          <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full">Board</span>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto px-8 pb-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full items-start">
            {/* Main columns */}
            {sections.map(section => {
              const sectionTasks = activeTasks
                .filter(t => t.sectionId === section.id)
                .sort((a, b) => a.order - b.order);
              const childSections = getChildSections(section.id);

              return (
                <KanbanColumn
                  key={section.id}
                  section={section}
                  tasks={sectionTasks}
                  childSections={childSections}
                  allTasks={allProjectTasks}
                  selectedTaskId={selectedTaskId}
                  onSelectTask={onSelectTask}
                  onToggleTask={onToggleTask}
                  addTask={addTask}
                  addSection={addSection}
                  deleteSection={deleteSection}
                  projectId={project.id}
                  getChildSections={getChildSections}
                />
              );
            })}

            {/* Unsorted column */}
            {unsectioned.length > 0 && (
              <UnsortedColumn
                tasks={unsectioned}
                selectedTaskId={selectedTaskId}
                onSelectTask={onSelectTask}
                onToggleTask={onToggleTask}
              />
            )}

            {/* Add column button */}
            <div className="flex-shrink-0 w-72">
              {showNewSection ? (
                <SectionCreator
                  onAdd={(name, parentId, color, icon) => {
                    addSection(project.id, name, parentId, color, icon);
                    setShowNewSection(false);
                  }}
                  onCancel={() => setShowNewSection(false)}
                />
              ) : (
                <button
                  onClick={() => setShowNewSection(true)}
                  className="w-full py-8 rounded-xl border-2 border-dashed border-gray-800 text-gray-600 hover:border-blue-500/30 hover:text-blue-400 transition-colors text-sm"
                >
                  + Add Column
                </button>
              )}
            </div>
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="drag-overlay bg-gray-800 rounded-lg p-3 border-l-4 w-72"
                style={{ borderLeftColor: PRIORITY_COLORS[activeTask.priority] || PRIORITY_COLORS.white }}>
                <p className="text-sm text-gray-200">{activeTask.title || 'Untitled'}</p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

// Unsorted tasks column for the board
function UnsortedColumn({ tasks, selectedTaskId, onSelectTask, onToggleTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: '__unsorted__' });

  return (
    <div className={`flex-shrink-0 w-72 flex flex-col bg-gray-900/30 rounded-xl ${isOver ? 'ring-2 ring-yellow-500/30' : ''}`}>
      <div className="px-3 py-3">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Unsorted
          <span className="ml-2 text-gray-600 font-normal">{tasks.length}</span>
        </h3>
      </div>
      <div ref={setNodeRef} className="flex-1 px-2 pb-2 space-y-2 min-h-[60px]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <KanbanCard
              key={task.id}
              task={task}
              isSelected={selectedTaskId === task.id}
              onSelect={onSelectTask}
              onToggle={onToggleTask}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
