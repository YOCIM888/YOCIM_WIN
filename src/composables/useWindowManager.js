import { reactive, ref, computed } from 'vue'

let nextId = 1
const genId = () => `win_${nextId++}`

const windows = reactive({})
const windowOrder = reactive([]) // z-index order, last = top
const focusId = ref(null)
const desktopIcons = reactive([
  { id: 'computer', label: '这台电脑', icon: '🖥️', app: 'explorer', args: { path: '/' } },
  { id: 'recycle', label: '回收站', icon: '🗑️', app: 'recycle', args: {} },
  { id: 'terminal', label: '终端', icon: '⬛', app: 'terminal', args: {} },
  { id: 'settings', label: '设置', icon: '⚙️', app: 'settings', args: {} },
  { id: 'files', label: '文档', icon: '📁', app: 'explorer', args: { path: '/Documents' } },
  { id: 'notepad', label: '记事本', icon: '📝', app: 'notepad', args: {} },
])

export function useWindowManager() {
  function openWindow(app, { title = app, icon = '🖥️', width = 800, height = 550, x, y, minWidth = 300, minHeight = 200, resizable = true, component = null, props = {} } = {}) {
    const id = genId()
    const maxW = window.innerWidth
    const maxH = window.innerHeight - 48
    const w = Math.min(width, maxW)
    const h = Math.min(height, maxH)
    const defaultX = x ?? (80 + Math.random() * 120)
    const defaultY = y ?? (40 + Math.random() * 80)

    windows[id] = reactive({
      id,
      app,
      title,
      icon,
      x: Math.min(defaultX, maxW - w),
      y: Math.min(defaultY, maxH - h),
      width: w,
      height: h,
      minWidth,
      minHeight,
      resizable,
      component: component || app,
      props: { ...props },
      minimized: false,
      maximized: false,
      zIndex: 10,
      prevBounds: null,
    })
    windowOrder.push(id)
    focusWindow(id)
    return id
  }

  function closeWindow(id) {
    if (!windows[id]) return
    delete windows[id]
    const idx = windowOrder.indexOf(id)
    if (idx > -1) windowOrder.splice(idx, 1)
    if (focusId.value === id) {
      focusId.value = windowOrder.length > 0 ? windowOrder[windowOrder.length - 1] : null
    }
  }

  function focusWindow(id) {
    if (!windows[id] || focusId.value === id) return
    const idx = windowOrder.indexOf(id)
    if (idx > -1) windowOrder.splice(idx, 1)
    windowOrder.push(id)
    focusId.value = id
    // update z-indices
    windowOrder.forEach((wid, i) => {
      if (windows[wid]) windows[wid].zIndex = i + 10
    })
  }

  function minimizeWindow(id) {
    if (!windows[id]) return
    windows[id].minimized = true
    if (focusId.value === id) {
      focusId.value = null
    }
  }

  function restoreWindow(id) {
    if (!windows[id]) return
    windows[id].minimized = false
    focusWindow(id)
  }

  function toggleMinimize(id) {
    if (!windows[id]) return
    if (windows[id].minimized) restoreWindow(id)
    else minimizeWindow(id)
  }

  function maximizeWindow(id) {
    const win = windows[id]
    if (!win) return
    if (win.maximized) {
      // restore
      if (win.prevBounds) {
        Object.assign(win, win.prevBounds)
        win.prevBounds = null
      }
      win.maximized = false
    } else {
      win.prevBounds = { x: win.x, y: win.y, width: win.width, height: win.height }
      win.x = 0
      win.y = 0
      win.width = window.innerWidth
      win.height = window.innerHeight - 48
      win.maximized = true
    }
  }

  function moveWindow(id, dx, dy) {
    const win = windows[id]
    if (!win || win.maximized) return
    win.x = Math.max(-win.width + 100, Math.min(window.innerWidth - 100, win.x + dx))
    win.y = Math.max(-30, Math.min(window.innerHeight - 60, win.y + dy))
  }

  function resizeWindow(id, edge, dx, dy) {
    const win = windows[id]
    if (!win || win.maximized || !win.resizable) return
    if (edge.includes('e')) win.width = Math.max(win.minWidth, win.width + dx)
    if (edge.includes('s')) win.height = Math.max(win.minHeight, win.height + dy)
    if (edge.includes('w')) {
      const newW = Math.max(win.minWidth, win.width - dx)
      win.x += win.width - newW
      win.width = newW
    }
    if (edge.includes('n')) {
      const newH = Math.max(win.minHeight, win.height - dy)
      win.y += win.height - newH
      win.height = newH
    }
  }

  function getWindow(id) { return windows[id] }
  const windowList = computed(() => Object.values(windows))
  const focusedId = computed(() => focusId.value)
  const minimizedWindows = computed(() => Object.values(windows).filter(w => w.minimized))

  return {
    windows,
    windowOrder,
    focusId: focusedId,
    windowList,
    minimizedWindows,
    desktopIcons,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    restoreWindow,
    toggleMinimize,
    maximizeWindow,
    moveWindow,
    resizeWindow,
    getWindow,
  }
}
