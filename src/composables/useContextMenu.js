import { reactive } from 'vue'

export const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  items: [],
  close() {
    this.visible = false
    this.items = []
  },
  show(x, y, items) {
    // Adjust position so menu stays within viewport
    this.x = Math.min(x, window.innerWidth - 220)
    this.y = Math.min(y, window.innerHeight - 200)
    this.items = items
    this.visible = true
  }
})

// Close context menu on click or scroll
function handleOutsideClick(e) {
  if (contextMenu.visible && !e.target.closest('.context-menu')) {
    contextMenu.close()
  }
}

document.addEventListener('mousedown', handleOutsideClick)
document.addEventListener('wheel', () => {
  if (contextMenu.visible) contextMenu.close()
})

// Close when pressing Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && contextMenu.visible) {
    contextMenu.close()
  }
})
