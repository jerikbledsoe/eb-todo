import { useState } from 'react';

const VIEW_ITEMS = [
  { id: 'today', label: 'Today', icon: '☀️' },
  { id: 'upcoming', label: 'Upcoming', icon: '📅' },
];

const VIEW_MODES = [
  { id: 'list', label: 'List', icon: '☰' },
  { id: 'board', label: 'Board', icon: '▦' },
  { id: 'calendar', label: 'Calendar', icon: '📆' },
];

const PROJECT_COLORS = ['#EF4444', '#F97316', '#EAB308', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'];
const PROJECT_ICONS = ['📁', '🏰', '🎯', '⛰️', '📱', '💼', '🚀', '⚡', '🔥', '💡', '🎨', '📊'];

export default function Sidebar({
  projects, activeProject, setActiveProject,
  activeView, setActiveView,
  addProject, deleteProject,
  todayCount, upcomingCount,
}) {
  const [showNewProject, setShowNewProject] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#3B82F6');
  const [newIcon, setNewIcon] = useState('📁');
  const [specialView, setSpecialView] = useState(null); // 'today' | 'upcoming' | null
  const [editingProject, setEditingProject] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const handleAddProject = () => {
    if (!newName.trim()) return;
    addProject(newName.trim(), newColor, newIcon);
    setNewName('');
    setNewColor('#3B82F6');
    setNewIcon('📁');
    setShowNewProject(false);
  };

  const handleSpecialView = (viewId) => {
    setSpecialView(viewId);
    setActiveView(viewId);
  };

  const handleProjectClick = (projectId) => {
    setSpecialView(null);
    setActiveProject(projectId);
    if (activeView === 'today' || activeView === 'upcoming') {
      setActiveView('list');
    }
  };

  return (
    <div className="w-64 bg-gray-900 h-screen flex flex-col border-r border-gray-800 select-none">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-lg font-bold text-white tracking-tight">Builder Tasks</h1>
        <p className="text-xs text-gray-500 mt-0.5">by Erik Bledsoe</p>
      </div>

      {/* Special Views */}
      <div className="px-2 pt-3 pb-1">
        {VIEW_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => handleSpecialView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              specialView === item.id
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.id === 'today' && todayCount > 0 && (
              <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">{todayCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* View Mode Toggle */}
      <div className="px-2 pt-2 pb-1">
        <p className="text-[10px] uppercase tracking-wider text-gray-600 px-3 mb-1">View</p>
        <div className="flex gap-1 px-2">
          {VIEW_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => {
                setActiveView(mode.id);
                setSpecialView(null);
              }}
              className={`flex-1 text-center py-1.5 rounded text-xs transition-colors ${
                activeView === mode.id && !specialView
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
              }`}
              title={mode.label}
            >
              {mode.icon} {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="flex-1 overflow-y-auto px-2 pt-3">
        <div className="flex items-center justify-between px-3 mb-1">
          <p className="text-[10px] uppercase tracking-wider text-gray-600">Projects</p>
          <button
            onClick={() => setShowNewProject(!showNewProject)}
            className="text-gray-500 hover:text-white text-lg leading-none transition-colors"
            title="Add project"
          >
            +
          </button>
        </div>

        {/* New Project Form */}
        {showNewProject && (
          <div className="mx-2 mb-2 p-3 bg-gray-800 rounded-lg">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddProject()}
              placeholder="Project name..."
              className="w-full bg-gray-700 text-white text-sm px-3 py-1.5 rounded border border-gray-600 focus:border-blue-500 focus:outline-none mb-2"
            />
            <div className="flex gap-1 mb-2 flex-wrap">
              {PROJECT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${newColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex gap-1 mb-2 flex-wrap">
              {PROJECT_ICONS.map(ic => (
                <button
                  key={ic}
                  onClick={() => setNewIcon(ic)}
                  className={`w-7 h-7 rounded text-sm flex items-center justify-center transition-all ${newIcon === ic ? 'bg-gray-600 scale-110' : 'hover:bg-gray-700'}`}
                >
                  {ic}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddProject}
                className="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded hover:bg-blue-500 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowNewProject(false)}
                className="flex-1 bg-gray-700 text-gray-300 text-xs py-1.5 rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Project List */}
        {projects.sort((a, b) => a.order - b.order).map(project => (
          <button
            key={project.id}
            onClick={() => handleProjectClick(project.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              if (project.id !== 'inbox') {
                setContextMenu({ id: project.id, x: e.clientX, y: e.clientY });
              }
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              activeProject === project.id && !specialView
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            <span className="text-base">{project.icon}</span>
            <span className="flex-1 text-left truncate">{project.name}</span>
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: project.color }}
            />
          </button>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
          <div
            className="fixed z-50 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[140px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => { deleteProject(contextMenu.id); setContextMenu(null); }}
              className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-gray-700 transition-colors"
            >
              Delete Project
            </button>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-gray-800">
        <p className="text-[10px] text-gray-600 text-center">Local Mode • Supabase sync coming</p>
      </div>
    </div>
  );
}
