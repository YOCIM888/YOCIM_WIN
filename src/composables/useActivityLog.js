import { reactive } from 'vue'

export const activityLog = reactive({
  items: [], // { id, time, icon, message, type }
  MAX: 200,

  add(icon, message, type = 'info') {
    this.items.push({
      id: Date.now(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      icon,
      message,
      type,
    })
    if (this.items.length > this.MAX) this.items.splice(0, this.items.length - this.MAX)
  },

  clear() {
    this.items.splice(0, this.items.length)
  }
})
