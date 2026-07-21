import { reactive } from 'vue'
import { fileSystem } from './useFileSystem.js'

// Global recycle bin — synced with fileSystem
export const recycleBin = reactive({
  items: [], // { id, name, type, icon, originalPath, node, deletedAt }

  add(path) {
    const node = fileSystem.deleteItem(path)
    if (!node) return false
    const name = path.split('/').pop()
    this.items.push({
      id: Date.now(),
      name,
      type: node.type,
      icon: node.type === 'dir' ? '📁' : '📄',
      originalPath: path,
      node, // saved copy for restore
      deletedAt: new Date().toLocaleDateString('zh-CN'),
    })
    return true
  },

  restore(id) {
    const idx = this.items.findIndex(i => i.id === id)
    if (idx === -1) return false
    const item = this.items[idx]
    // recreate in original location
    const parentPath = item.originalPath.split('/').slice(0, -1).join('/') || '/'
    const name = item.originalPath.split('/').pop()
    if (item.type === 'dir') {
      fileSystem.createDir(parentPath, name)
      // restore children if any
      const restored = fileSystem.resolvePath(item.originalPath)
      if (restored && item.node.children) {
        restored.children = item.node.children
      }
    } else {
      fileSystem.createFile(parentPath, name, item.node.content || '')
    }
    this.items.splice(idx, 1)
    return true
  },

  restoreAll() {
    while (this.items.length) {
      this.restore(this.items[0].id)
    }
  },

  empty() {
    this.items.splice(0, this.items.length)
  },
})
