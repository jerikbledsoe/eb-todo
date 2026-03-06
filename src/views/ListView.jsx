import { useState } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import TaskItem from '../components/TaskItem.jsx';
import SectionCreator from '../components/SectionCreator.jsx';

// Droppable section wrapper for cross-section drag
function DroppableSection({ sectionId, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: sectionId });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[40px] rounded-lg transition-colors ${isOver ? 'bg-blue-500/5 ring-1 ring-blue-500/20' : ''}`}
    >
      {children}
    </div>
  );
}

// Recursive section renderer (supports nesting)
function SectionBlock({
  section, depth = 0,
  allSections, tasks, selectedTaskId,
  onSelectTask, onToggleTask, addTask, addSection, deleteSection, updateSection,
  projectId, getChildSections,
}) {
  const [showAddChild, setShowAddChild] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(section.name);

  const sectionTasks = tasks
    .filter(t => t.sectionId === section.id && !t.completed)
    .sort((a, b) => a.order - b.order);

  const completedTasks = tasks.filter(t => t.sectionId === section.id && t.completed);
  const childSections = getChildSections(section.id);
  const hasChildren = childSections.length > 0;

  const handleRename = () => {
    if (editName.trim() && editName !== section.name) {
      updateSection(section.id, { name: editName.trim() });
    }
    setEditing(false);
  };

  return (
    <div className={depth > 0 ? 'ml-4 border-l border-gray-800 pl-3' : ''}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2 group">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[10px] text-gray-600 hover:text-gray-400 w-4 flex-shrink-0"
          >
            {isCollapsed ? '▶' : '▼'}
          </button>

          {/* Section color dot */}
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: section.color || '#6B7280' }}
          />

          {/* Section icon + name */}
          {editing ? (
            <input
              autoFocus
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditing(false); }}
              className="bg-gray-800 text-white text-sm px-2 py-0.5 rounded border border-gray-600 focus:border-blue-500 outline-none flex-1"
            />
          ) : (
            <h3
              className="text-sm font-semibold text-gray-400 uppercase tracking-wider truncate cursor-pointer hover:text-gray-200"
              onDoubleClick={() => { setEditName(section.name); setEditing(true); }}
            >
              {section.icon && <span className="mr-1">{section.icon}</span>}
              {section.name}
              <span className="ml-2 text-gray-600 font-normal normal-case">{sectionTasks.length}</span>
            </h3>
          )}
        </div>

        {/* Section actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowAddChild(!showAddChild)}
            className="text-gray-600 hover:text-blue-400 text-xs transition-colors px-1"
            title="Add subsection"
          >
            +📁
          </button>
          <button
            onClick={() => addTask(projectId, section.id)}
            className="text-gray-500 hover:text-blue-400 text-sm transition-colors"
          >
            + task
          </button>
          <button
            onClick={() => deleteSection(section.id)}
            className="text-gray-700 hover:text-red-400 text-xs transition-colors px-1"
            title="Delete section"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Subsection creator */}
      {showAddChild && (
        <div className="mb-3 ml-4">
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

      {!isCollapsed && (
        <>
          {/* Tasks in this section (droppable target) */}
          <DroppableSection sectionId={section.id}>
            <SortableContext
              items={sectionTasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {sectionTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isSelected={selectedTaskId === task.id}
                    onSelect={onSelectTask}
                    onToggle={onToggleTask}
                  />
                ))}
              </div>
            </SortableContext>

            {sectionTasks.length === 0 && !hasChildren && (
              <p className="text-xs text-gray-700 py-2 px-3">No tasks</p>
            )}
          </DroppableSection>

          {/* Child sections (nested) */}
          {childSections.map(child => (
            <SectionBlock
              key={child.id}
              section={child}
              depth={depth + 1}
              allSections={allSections}
              tasks={tasks}
              selectedTaskId={selectedTaskId}
              onSelectTask={onSelectTask}
              onToggleTask={onToggleTask}
              addTask={addTask}
              addSection={addSection}
              deleteSection={deleteSection}
              updateSection={updateSection}
              projectId={projectId}
              getChildSections={getChildSections}
            />
          ))}

          {/* Completed in this section */}
          {completedTasks.length > 0 && (
            <CompletedBlock
              tasks={completedTasks}
              selectedTaskId={selectedTaskId}
              onSelectTask={onSelectTask}
              onToggleTask={onToggleTask}
            />
          )}
        </>
      )}
    </div>
  );
}

function CompletedBlock({ tasks, selectedTaskId, onSelectTask, onToggleTask }) {
  const [show, setShow] = useState(false);
  return (
    <div className="mt-1 mb-2">
      <button
        onClick={() => setShow(!show)}
        className="text-[11px] text-gray-600 hover:text-gray-400 transition-colors flex items-center gap-1"
      >
        <span>{show ? '▼' : '▶'}</span>
        {tasks.length} done
      </button>
      {show && (
        <div className="mt-1 space-y-1">
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              isSelected={selectedTaskId === task.id}
              onSelect={onSelectTask}
              onToggle={onToggleTask}
              isDraggable={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ListView({
  project, sections, tasks,
  selectedTaskId, onSelectTask, onToggleTask,
  addTask, addSection, deleteSection, updateSection, getChildSections,
}) {
  const [showNewSection, setShowNewSection] = useState(false);

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  // Unsectioned tasks
  const unsectioned = activeTasks.filter(t => !t.sectionId);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Project Header */}
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">{project.icon}</span>
          <h2 className="text-2xl font-bold text-white">{project.name}</h2>
          <span className="text-xs bg-gray-700/50 text-gray-400 px-2 py-0.5 rounded-full">List</span>
        </div>
        <p className="text-sm text-gray-500">
          {activeTasks.length} task{activeTasks.length !== 1 ? 's' : ''}
          {completedTasks.length > 0 && ` • ${completedTasks.length} completed`}
        </p>
      </div>

      {/* Sections */}
      <div className="px-8 pb-8 space-y-5">
        {sections.map(section => (
          <SectionBlock
            key={section.id}
            section={section}
            depth={0}
            allSections={sections}
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={onSelectTask}
            onToggleTask={onToggleTask}
            addTask={addTask}
            addSection={addSection}
            deleteSection={deleteSection}
            updateSection={updateSection}
            projectId={project.id}
            getChildSections={getChildSections}
          />
        ))}

        {/* Unsectioned Tasks */}
        {unsectioned.length > 0 && (
          <DroppableSection sectionId="__unsorted__">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Unsorted
                <span className="ml-2 text-gray-600 font-normal">{unsectioned.length}</span>
              </h3>
              <div className="space-y-1">
                {unsectioned.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isSelected={selectedTaskId === task.id}
                    onSelect={onSelectTask}
                    onToggle={onToggleTask}
                  />
                ))}
              </div>
            </div>
          </DroppableSection>
        )}

        {/* Add Section */}
        <div className="pt-2">
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
              className="text-sm text-gray-500 hover:text-blue-400 transition-colors"
            >
              + Add section
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
