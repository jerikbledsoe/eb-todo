// Local data layer — will be swapped for Supabase
// All data persists to localStorage for now

const STORAGE_KEY = 'builder-tasks-data';

const DEFAULT_DATA = {
  projects: [
    { id: 'inbox', name: 'Inbox', color: '#6B7280', icon: '📥', order: 0 },
    { id: 'proj-1', name: 'Rock Castle AI', color: '#3B82F6', icon: '🏰', order: 1 },
    { id: 'proj-2', name: 'Erik Bledsoe Brand', color: '#F97316', icon: '🎯', order: 2 },
    { id: 'proj-3', name: 'Take the Hill', color: '#10B981', icon: '⛰️', order: 3 },
    { id: 'proj-4', name: 'Bledsoe Media', color: '#8B5CF6', icon: '📱', order: 4 },
  ],
  sections: [
    { id: 'sec-todo', projectId: 'inbox', parentSectionId: null, name: 'To Do', color: '#6B7280', icon: '', order: 0 },
    { id: 'sec-doing', projectId: 'inbox', parentSectionId: null, name: 'In Progress', color: '#F97316', icon: '', order: 1 },
    { id: 'sec-done', projectId: 'inbox', parentSectionId: null, name: 'Done', color: '#10B981', icon: '', order: 2 },
  ],
  tasks: [
    {
      id: 'task-demo-1',
      projectId: 'inbox',
      sectionId: 'sec-todo',
      title: 'Welcome to Builder Tasks',
      description: 'This is your personal task manager. Click any task to edit it, drag to reorder, and use the views on the left to switch between List, Board, and Calendar.',
      priority: 'blue',
      completed: false,
      dueDate: null,
      order: 0,
      createdAt: new Date().toISOString(),
    },
  ],
};

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate old sections that don't have parentSectionId/color/icon
      const sections = (parsed.sections || DEFAULT_DATA.sections).map(s => ({
        parentSectionId: null,
        color: '#6B7280',
        icon: '',
        ...s,
      }));
      return {
        projects: parsed.projects || DEFAULT_DATA.projects,
        sections,
        tasks: parsed.tasks || DEFAULT_DATA.tasks,
      };
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

export function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

export function generateId() {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

export function exportData() {
  return JSON.stringify(loadData(), null, 2);
}

export function importData(jsonString) {
  const data = JSON.parse(jsonString);
  saveData(data);
  return data;
}
