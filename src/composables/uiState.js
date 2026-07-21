import { reactive } from 'vue'

export const uiState = reactive({
  startMenuOpen: false,
  notifCenterOpen: false,
  recentApps: [], // { id, label, icon, app, args }
  toggleStart() {
    this.startMenuOpen = !this.startMenuOpen
    if (this.startMenuOpen) this.notifCenterOpen = false
  },
  toggleNotif() {
    this.notifCenterOpen = !this.notifCenterOpen
    if (this.notifCenterOpen) this.startMenuOpen = false
  },
  closeAll() {
    this.startMenuOpen = false
    this.notifCenterOpen = false
  },
  addRecent(app) {
    this.recentApps = this.recentApps.filter(a => a.id !== app.id)
    this.recentApps.unshift({ ...app })
    if (this.recentApps.length > 8) this.recentApps.pop()
  }
})
