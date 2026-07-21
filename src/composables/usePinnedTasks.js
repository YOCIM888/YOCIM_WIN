import { reactive } from 'vue'

// Pinned taskbar items persist across sessions (localStorage)
const saved = (() => {
  try { return JSON.parse(localStorage.getItem('yocim_pinned_tasks') || '[]') }
  catch { return [] }
})()

export const pinnedTasks = reactive(saved.length ? saved : [
  { id: 'explorer', label: '文件资源管理器', icon: '📁', app: 'explorer', args: { path: '/' } },
  { id: 'terminal', label: '终端', icon: '⬛', app: 'terminal', args: {} },
])

function savePinned() {
  localStorage.setItem('yocim_pinned_tasks', JSON.stringify(
    pinnedTasks.map(t => ({ id: t.id, label: t.label, icon: t.icon, app: t.app, args: t.args }))
  ))
}

export function togglePinned(app) {
  const idx = pinnedTasks.findIndex(t => t.id === app.id)
  if (idx > -1) {
    pinnedTasks.splice(idx, 1)
    savePinned()
    return false // unpinned
  } else {
    pinnedTasks.push({ ...app })
    savePinned()
    return true // pinned
  }
}

export function isPinned(id) {
  return pinnedTasks.some(t => t.id === id)
}
