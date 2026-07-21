import { uiState } from './uiState.js'
import { contextMenu } from './useContextMenu.js'

export function setupKeyboardShortcuts(wm) {
  document.addEventListener('keydown', (e) => {
    // Escape: close context menu, close start menu, close notif center
    if (e.key === 'Escape') {
      if (contextMenu.visible) {
        contextMenu.close()
        return
      }
      if (uiState.startMenuOpen || uiState.notifCenterOpen) {
        uiState.closeAll()
        return
      }
    }

    // Alt+Space or Meta key: toggle start menu
    if (e.key === 'Meta' || (e.altKey && e.code === 'Space')) {
      e.preventDefault()
      uiState.toggleStart()
    }
  })
}
