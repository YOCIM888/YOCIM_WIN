import { reactive } from 'vue'

const notifications = reactive([])
let notifId = 0

export function useNotifications() {
  function add(title, message, type = 'info', duration = 4000) {
    const id = `notif_${notifId++}`
    notifications.push({ id, title, message, type, time: new Date().toLocaleTimeString() })
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }

  function remove(id) {
    const idx = notifications.findIndex(n => n.id === id)
    if (idx > -1) notifications.splice(idx, 1)
  }

  function clear() {
    notifications.splice(0, notifications.length)
  }

  return { notifications, add, remove, clear }
}

// Global notification store
export const notifStore = reactive({
  list: [],
  add(title, message, type = 'info', duration = 4000) {
    const id = `notif_${Date.now()}`
    this.list.push({ id, title, message, type, time: new Date().toLocaleTimeString() })
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration)
    }
    return id
  },
  remove(id) {
    const idx = this.list.findIndex(n => n.id === id)
    if (idx > -1) this.list.splice(idx, 1)
  },
  clear() {
    this.list.splice(0, this.list.length)
  }
})
