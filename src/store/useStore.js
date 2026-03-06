import { useState, useCallback, useEffect } from 'react';
import { loadData, saveData, generateId } from './data.js';

export default function useStore() {
  const [data, setData] = useState(() => loadData());
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [activeProject, setActiveProject] = useState('inbox');
  const [activeView, setActiveView] = useState('list'); // list | board | calendar

  // Persist on every change
  useEffect(() => {
    saveData(data);
  }, [data]);

  // --- PROJECTS ---
  const addProject = useCallback((name, color = '#6B7280', icon = '📁') => {
    const id = generateId();
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, { id, name, color, icon, order: prev.projects.length }],
      sections: [
        ...prev.sections,
        { id: generateId(), projectId: id, parentSectionId: null, name: 'To Do', color: '#6B7280', icon: '', order: 0 },
        { id: generateId(), projectId: id, parentSectionId: null, name: 'In Progress', color: '#F97316', icon: '', order: 1 },
        { id: generateId(), projectId: id, parentSectionId: null, name: 'Done', color: '#10B981', icon: '', order: 2 },
      ],
    }));
    return id;
  }, []);

  const updateProject = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...updates } : p),
    }));
  }, []);

  const deleteProject = useCallback((id) => {
    if (id === 'inbox') return;
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
      sections: prev.sections.filter(s => s.projectId !== id),
      tasks: prev.tasks.filter(t => t.projectId !== id),
    }));
    if (activeProject === id) setActiveProject('inbox');
  }, [activeProject]);

  // --- SECTIONS (support nesting, emoji, color) ---
  const addSection = useCallback((projectId, name, parentSectionId = null, color = '#6B7280', icon = '') => {
    const id = generateId();
    setData(prev => {
      const siblings = prev.sections.filter(
        s => s.projectId === projectId && s.parentSectionId === parentSectionId
      );
      return {
        ...prev,
        sections: [...prev.sections, {
          id, projectId, parentSectionId, name, color, icon,
          order: siblings.length,
        }],
      };
    });
    return id;
  }, []);

  const updateSection = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === id ? { ...s, ...updates } : s),
    }));
  }, []);

  const deleteSection = useCallback((id) => {
    setData(prev => {
      // Also delete all child sections recursively
      const toDelete = new Set();
      const findChildren = (parentId) => {
        toDelete.add(parentId);
        prev.sections.filter(s => s.parentSectionId === parentId).forEach(child => {
          findChildren(child.id);
        });
      };
      findChildren(id);

      return {
        ...prev,
        sections: prev.sections.filter(s => !toDelete.has(s.id)),
        tasks: prev.tasks.map(t => toDelete.has(t.sectionId) ? { ...t, sectionId: null } : t),
      };
    });
  }, []);

  // --- TASKS ---
  const addTask = useCallback((projectId, sectionId, title = '', priority = 'white') => {
    const id = generateId();
    setData(prev => {
      const tasksInSection = prev.tasks.filter(t => t.sectionId === sectionId);
      return {
        ...prev,
        tasks: [...prev.tasks, {
          id,
          projectId: projectId || activeProject,
          sectionId,
          title,
          description: '',
          priority,
          completed: false,
          dueDate: null,
          order: tasksInSection.length,
          createdAt: new Date().toISOString(),
        }],
      };
    });
    setSelectedTaskId(id);
    return id;
  }, [activeProject]);

  const updateTask = useCallback((id, updates) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
    }));
  }, []);

  const deleteTask = useCallback((id) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }));
    if (selectedTaskId === id) setSelectedTaskId(null);
  }, [selectedTaskId]);

  const toggleTask = useCallback((id) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t),
    }));
  }, []);

  const moveTask = useCallback((taskId, newSectionId, newOrder) => {
    setData(prev => {
      const task = prev.tasks.find(t => t.id === taskId);
      if (!task) return prev;

      const otherTasks = prev.tasks.filter(t => t.id !== taskId);
      const targetSectionTasks = otherTasks
        .filter(t => t.sectionId === newSectionId)
        .sort((a, b) => a.order - b.order);

      targetSectionTasks.splice(newOrder, 0, { ...task, sectionId: newSectionId });
      const reindexed = targetSectionTasks.map((t, i) => ({ ...t, order: i }));

      const remaining = otherTasks.filter(t => t.sectionId !== newSectionId);
      return { ...prev, tasks: [...remaining, ...reindexed] };
    });
  }, []);

  // --- COMPUTED ---
  const currentProject = data.projects.find(p => p.id === activeProject) || data.projects[0];

  // Top-level sections for this project (parentSectionId === null)
  const projectSections = data.sections
    .filter(s => s.projectId === activeProject && s.parentSectionId === null)
    .sort((a, b) => a.order - b.order);

  // All sections for this project (including nested)
  const allProjectSections = data.sections
    .filter(s => s.projectId === activeProject)
    .sort((a, b) => a.order - b.order);

  // Get child sections of a given parent
  const getChildSections = useCallback((parentSectionId) => {
    return data.sections
      .filter(s => s.parentSectionId === parentSectionId)
      .sort((a, b) => a.order - b.order);
  }, [data.sections]);

  const projectTasks = data.tasks
    .filter(t => t.projectId === activeProject)
    .sort((a, b) => a.order - b.order);
  const selectedTask = data.tasks.find(t => t.id === selectedTaskId) || null;
  const allTasks = data.tasks;

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = data.tasks
    .filter(t => !t.completed && t.dueDate && t.dueDate <= today)
    .sort((a, b) => {
      const priorityOrder = { red: 0, orange: 1, blue: 2, white: 3 };
      return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
    });

  return {
    data,
    setData,
    projects: data.projects,
    activeProject,
    setActiveProject,
    currentProject,
    addProject,
    updateProject,
    deleteProject,
    sections: data.sections,
    projectSections,
    allProjectSections,
    getChildSections,
    addSection,
    updateSection,
    deleteSection,
    tasks: data.tasks,
    projectTasks,
    allTasks,
    todayTasks,
    selectedTask,
    selectedTaskId,
    setSelectedTaskId,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    moveTask,
    activeView,
    setActiveView,
  };
}
