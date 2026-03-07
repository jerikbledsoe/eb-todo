import { useCallback, useEffect } from 'react';
import {
  DndContext,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useAuth } from './lib/AuthContext.jsx';
import useStore from './store/useStore.js';
import LoginPage from './components/LoginPage.jsx';
import Sidebar from './components/Sidebar.jsx';
import TaskDetail from './components/TaskDetail.jsx';
import ListView from './views/ListView.jsx';
import BoardView from './views/BoardView.jsx';
import CalendarView from './views/CalendarView.jsx';
import TodayView from './views/TodayView.jsx';
import UpcomingView from './views/UpcomingView.jsx';

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const store = useStore();
  const {
    loading: dataLoading,
    projects, activeProject, setActiveProject, currentProject,
    sections, projectSections, allProjectSections, getChildSections,
    tasks, projectTasks, allTasks,
    selectedTask, selectedTaskId, setSelectedTaskId,
    activeView, setActiveView,
    addProject, deleteProject, moveProject, getChildProjects, topLevelProjects,
    addSection, updateSection, deleteSection,
    addTask, updateTask, deleteTask, toggleTask, moveTask,
  } = store;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // List view drag handler (cross-section)
  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const taskId = active.id;
    const overId = over.id;

    const targetSection = allProjectSections.find(s => s.id === overId);
    const targetTask = projectTasks.find(t => t.id === overId);

    if (overId === '__unsorted__') {
      moveTask(taskId, null, 0);
    } else if (targetSection) {
      moveTask(taskId, targetSection.id, 0);
    } else if (targetTask) {
      const sectionTasks = projectTasks
        .filter(t => t.sectionId === targetTask.sectionId && !t.completed)
        .sort((a, b) => a.order - b.order);
      const targetIndex = sectionTasks.findIndex(t => t.id === overId);
      moveTask(taskId, targetTask.sectionId, targetIndex);
    }
  }, [allProjectSections, projectTasks, moveTask]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        setSelectedTaskId(null);
      }
      if (e.key === 'n' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        const firstSection = projectSections[0];
        if (firstSection && (activeView === 'list' || activeView === 'board')) {
          addTask(activeProject, firstSection.id);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [projectSections, activeProject, activeView, addTask, setSelectedTaskId]);

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <LoginPage />;
  }

  // Data loading or no project data yet
  if (dataLoading || !currentProject) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-gray-400">Loading your tasks...</div>
      </div>
    );
  }

  // Today badge count
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = allTasks.filter(t => !t.completed && t.dueDate && t.dueDate <= todayStr).length;

  // Shared props for both list and board
  const sharedViewProps = {
    project: currentProject,
    sections: projectSections,
    tasks: projectTasks,
    selectedTaskId,
    onSelectTask: setSelectedTaskId,
    onToggleTask: toggleTask,
    addTask,
    addSection,
    updateSection,
    deleteSection,
    moveTask,
    getChildSections,
  };

  const renderMainView = () => {
    if (activeView === 'today') {
      return (
        <TodayView
          allTasks={allTasks}
          projects={projects}
          selectedTaskId={selectedTaskId}
          onSelectTask={setSelectedTaskId}
          onToggleTask={toggleTask}
        />
      );
    }

    if (activeView === 'upcoming') {
      return (
        <UpcomingView
          allTasks={allTasks}
          projects={projects}
          selectedTaskId={selectedTaskId}
          onSelectTask={setSelectedTaskId}
          onToggleTask={toggleTask}
        />
      );
    }

    if (activeView === 'calendar') {
      return (
        <CalendarView
          allTasks={allTasks}
          selectedTaskId={selectedTaskId}
          onSelectTask={setSelectedTaskId}
          onToggleTask={toggleTask}
          updateTask={updateTask}
        />
      );
    }

    if (activeView === 'board') {
      return <BoardView {...sharedViewProps} />;
    }

    // Default: list view (with DndContext wrapper for cross-section drag)
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <ListView {...sharedViewProps} />
      </DndContext>
    );
  };

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar
        projects={projects}
        activeProject={activeProject}
        setActiveProject={setActiveProject}
        activeView={activeView}
        setActiveView={setActiveView}
        addProject={addProject}
        deleteProject={deleteProject}
        moveProject={moveProject}
        getChildProjects={getChildProjects}
        topLevelProjects={topLevelProjects}
        todayCount={todayCount}
        signOut={signOut}
        user={user}
      />

      <div className="flex flex-1 overflow-hidden">
        {renderMainView()}

        {selectedTask && (
          <TaskDetail
            task={selectedTask}
            projects={projects}
            sections={sections}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onClose={() => setSelectedTaskId(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
