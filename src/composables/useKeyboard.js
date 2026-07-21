import { uiState } from './uiState.js'
import { contextMenu } from './useContextMenu.js'

export function setupKeyboardShortcuts(wm) {
  document.addEventListener('keydown', (e) => {
    // Escape: close context menu, close start menu, close notif center
    if (e.key === 'Escape') {
      if (contextMenu.visible) { contextMenu.close(); return }
      if (uiState.startMenuOpen || uiState.notifCenterOpen) { uiState.closeAll(); return }
    }

    // Meta/Win key: toggle start menu
    if (e.key === 'Meta' || (e.altKey && e.code === 'Space')) {
      e.preventDefault()
      uiState.toggleStart()
      return
    }

    // Alt+F4: close focused window
    if (e.altKey && e.key === 'F4') {
      e.preventDefault()
      if (wm.focusId.value) {
        wm.closeWindow(wm.focusId.value)
      }
      return
    }

    // Alt+Tab: cycle through windows
    if (e.altKey && e.key === 'Tab') {
      e.preventDefault()
      const list = wm.windowList.value
      if (list.length === 0) return
      const current = wm.focusId.value
      const idx = list.findIndex(w => w.id === current)
      const next = list[(idx + 1) % list.length]
      if (next.minimized) wm.restoreWindow(next.id)
      wm.focusWindow(next.id)
      return
    }
  })
}
