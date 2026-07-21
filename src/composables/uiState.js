import { reactive } from 'vue'

export const uiState = reactive({
  startMenuOpen: false,
  notifCenterOpen: false,
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
  }
})
