// Supabase cloud data layer
import { supabase } from '../lib/supabase.js';

export function generateId() {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Load all data for the current user from Supabase
export async function loadData(userId) {
  if (!userId) return getDefaultData();

  try {
    const [projectsRes, sectionsRes, tasksRes] = await Promise.all([
      supabase.from('eb_todo_projects').select('*').eq('user_id', userId).order('order'),
      supabase.from('eb_todo_sections').select('*').eq('user_id', userId).order('order'),
      supabase.from('eb_todo_tasks').select('*').eq('user_id', userId).order('order'),
    ]);

    if (projectsRes.error) throw projectsRes.error;
    if (sectionsRes.error) throw sectionsRes.error;
    if (tasksRes.error) throw tasksRes.error;

    // If user has no data yet, seed with defaults
    if (projectsRes.data.length === 0) {
      const defaults = getDefaultData();
      await seedData(userId, defaults);
      return defaults;
    }

    return {
      projects: projectsRes.data.map(mapFromDb),
      sections: sectionsRes.data.map(mapFromDb),
      tasks: tasksRes.data.map(mapFromDb),
    };
  } catch (e) {
    console.error('Failed to load data from Supabase:', e);
    return getDefaultData();
  }
}

// Save full data snapshot (used after local state changes)
// We do granular upserts per entity type
export async function saveProjects(userId, projects) {
  if (!userId) return;
  const rows = projects.map(p => mapToDb(p, userId));
  const { error } = await supabase.from('eb_todo_projects').upsert(rows, { onConflict: 'id' });
  if (error) console.error('Save projects error:', error);
}

export async function saveSections(userId, sections) {
  if (!userId) return;
  const rows = sections.map(s => mapToDb(s, userId));
  const { error } = await supabase.from('eb_todo_sections').upsert(rows, { onConflict: 'id' });
  if (error) console.error('Save sections error:', error);
}

export async function saveTasks(userId, tasks) {
  if (!userId) return;
  const rows = tasks.map(t => mapToDb(t, userId));
  const { error } = await supabase.from('eb_todo_tasks').upsert(rows, { onConflict: 'id' });
  if (error) console.error('Save tasks error:', error);
}

export async function deleteProjectFromDb(userId, projectId) {
  if (!userId) return;
  await supabase.from('eb_todo_tasks').delete().eq('user_id', userId).eq('project_id', projectId);
  await supabase.from('eb_todo_sections').delete().eq('user_id', userId).eq('project_id', projectId);
  await supabase.from('eb_todo_projects').delete().eq('user_id', userId).eq('id', projectId);
}

export async function deleteSectionsFromDb(userId, sectionIds) {
  if (!userId || sectionIds.length === 0) return;
  await supabase.from('eb_todo_sections').delete().eq('user_id', userId).in('id', sectionIds);
}

export async function deleteTaskFromDb(userId, taskId) {
  if (!userId) return;
  await supabase.from('eb_todo_tasks').delete().eq('user_id', userId).eq('id', taskId);
}

// Map from DB snake_case to app camelCase
function mapFromDb(row) {
  return {
    id: row.id,
    ...(row.project_id !== undefined && { projectId: row.project_id }),
    ...(row.parent_section_id !== undefined && { parentSectionId: row.parent_section_id }),
    ...(row.section_id !== undefined && { sectionId: row.section_id }),
    ...(row.due_date !== undefined && { dueDate: row.due_date }),
    ...(row.created_at !== undefined && { createdAt: row.created_at }),
    name: row.name,
    ...(row.title !== undefined && { title: row.title }),
    ...(row.description !== undefined && { description: row.description }),
    ...(row.color !== undefined && { color: row.color }),
    ...(row.icon !== undefined && { icon: row.icon }),
    ...(row.priority !== undefined && { priority: row.priority }),
    ...(row.completed !== undefined && { completed: row.completed }),
    ...(row.order !== undefined && { order: row.order }),
  };
}

// Map from app camelCase to DB snake_case
function mapToDb(item, userId) {
  const row = { id: item.id, user_id: userId };
  if (item.projectId !== undefined) row.project_id = item.projectId;
  if (item.parentSectionId !== undefined) row.parent_section_id = item.parentSectionId;
  if (item.sectionId !== undefined) row.section_id = item.sectionId;
  if (item.dueDate !== undefined) row.due_date = item.dueDate;
  if (item.createdAt !== undefined) row.created_at = item.createdAt;
  if (item.name !== undefined) row.name = item.name;
  if (item.title !== undefined) row.title = item.title;
  if (item.description !== undefined) row.description = item.description;
  if (item.color !== undefined) row.color = item.color;
  if (item.icon !== undefined) row.icon = item.icon;
  if (item.priority !== undefined) row.priority = item.priority;
  if (item.completed !== undefined) row.completed = item.completed;
  if (item.order !== undefined) row.order = item.order;
  return row;
}

async function seedData(userId, defaults) {
  const projectRows = defaults.projects.map(p => mapToDb(p, userId));
  const sectionRows = defaults.sections.map(s => mapToDb(s, userId));
  const taskRows = defaults.tasks.map(t => mapToDb(t, userId));

  await supabase.from('eb_todo_projects').insert(projectRows);
  await supabase.from('eb_todo_sections').insert(sectionRows);
  await supabase.from('eb_todo_tasks').insert(taskRows);
}

function getDefaultData() {
  return {
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
        title: 'Welcome to EB Todo',
        description: 'Your personal task manager. Click any task to edit it, drag to reorder, and use the views on the left to switch between List, Board, and Calendar.',
        priority: 'blue',
        completed: false,
        dueDate: null,
        order: 0,
        createdAt: new Date().toISOString(),
      },
    ],
  };
}
