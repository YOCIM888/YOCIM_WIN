<template>
  <div class="taskbar">
    <div class="taskbar-left">
      <button class="start-btn" @click="ui.toggleStart" :class="{ active: ui.startMenuOpen }">
        <span class="start-icon">⬡</span>
        <span class="start-text">开始</span>
      </button>
      <div class="taskbar-divider"></div>
      <!-- Pinned tasks -->
      <button
        v-for="pin in pinnedTasks"
        :key="'pin-' + pin.id"
        class="taskbar-item"
        :class="{ active: windowList.some(w => w.app === pin.app && !w.minimized) }"
        @click="onPinnedClick(pin)"
        :title="pin.label"
      >
        <span class="taskbar-item-icon">{{ pin.icon }}</span>
      </button>
      <div v-if="pinnedTasks.length && windowList.length" class="taskbar-divider"></div>
      <button
        v-for="win in windowList"
        :key="win.id"
        class="taskbar-item"
        :class="{ active: focusId === win.id && !win.minimized }"
        @click="onTaskClick(win)"
      >
        <span class="taskbar-item-icon">{{ win.icon }}</span>
        <span class="taskbar-item-title">{{ win.title }}</span>
      </button>
    </div>
    <div class="taskbar-right">
      <div class="taskbar-divider"></div>
      <button class="tray-btn" @click="ui.toggleNotif" :class="{ active: ui.notifCenterOpen }" title="通知中心">
        <span class="tray-icon">💬</span>
        <span v-if="notif.list.length" class="tray-badge">{{ notif.list.length }}</span>
      </button>
      <div class="tray-clock" @click="ui.toggleNotif">
        <span class="clock-time">{{ time }}</span>
        <span class="clock-date">{{ date }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onUnmounted, computed } from 'vue'
import { uiState } from '../composables/uiState.js'
import { pinnedTasks } from '../composables/usePinnedTasks.js'

const wm = inject('wm')
const notif = inject('notif')
const ui = uiState

// Unwrap nested refs from plain object
const windowList = computed(() => wm.windowList.value ?? [])
const focusId = computed(() => wm.focusId.value)

const time = ref('')
const date = ref('')
let clockInterval

function updateClock() {
  const now = new Date()
  time.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  date.value = now.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', weekday: 'short' })
}

onMounted(() => {
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
})
onUnmounted(() => clearInterval(clockInterval))

function onTaskClick(win) {
  if (win.minimized) {
    wm.restoreWindow(win.id)
  } else if (focusId.value === win.id) {
    wm.minimizeWindow(win.id)
  } else {
    wm.focusWindow(win.id)
  }
}
function onPinnedClick(pin) {
  // find existing window of this app
  const existing = windowList.value.find(w => w.app === pin.app)
  if (existing) {
    if (existing.minimized) wm.restoreWindow(existing.id)
    else if (focusId.value === existing.id) wm.minimizeWindow(existing.id)
    else wm.focusWindow(existing.id)
  } else {
    wm.openWindow(pin.app, { title: pin.label, icon: pin.icon, props: pin.args || {} })
  }
}
</script>

<style scoped>
.taskbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 48px;
  background: var(--bg-panel);
  border-top: 1px solid var(--border-glow);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  z-index: 100;
  backdrop-filter: blur(20px);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
}

.taskbar-left, .taskbar-right {
  display: flex;
  align-items: center;
  gap: 2px;
  height: 100%;
}

.start-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  height: 36px;
  border: 1px solid var(--border-glow);
  border-radius: 6px;
  background: rgba(0, 240, 255, 0.05);
  color: var(--neon-cyan);
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font-display);
  font-size: 13px;
  letter-spacing: 1px;
}
.start-btn:hover, .start-btn.active {
  background: rgba(0, 240, 255, 0.15);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
  border-color: var(--border-strong);
}
.start-icon { font-size: 20px; }
.start-text { font-weight: 600; }

.taskbar-divider {
  width: 1px;
  height: 24px;
  background: var(--border-glow);
  margin: 0 4px;
}

.taskbar-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  height: 36px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  font-family: var(--font-mono);
  font-size: 11px;
  max-width: 160px;
}
.taskbar-item:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-bright);
}
.taskbar-item.active {
  background: rgba(0, 240, 255, 0.1);
  border-color: rgba(0, 240, 255, 0.3);
  color: var(--neon-cyan);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.15);
}
.taskbar-item-icon { font-size: 16px; flex-shrink: 0; }
.taskbar-item-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.tray-btn {
  position: relative;
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  font-size: 16px;
}
.tray-btn:hover, .tray-btn.active {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(0, 240, 255, 0.3);
}
.tray-badge {
  position: absolute;
  top: 2px; right: 2px;
  font-size: 8px;
  background: var(--neon-magenta);
  color: #fff;
  border-radius: 50%;
  width: 14px; height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tray-clock {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s;
  border: 1px solid transparent;
}
.tray-clock:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(0, 240, 255, 0.2);
}
.clock-time { font-size: 12px; color: var(--text-primary); font-weight: 500; }
.clock-date { font-size: 10px; color: var(--text-dim); }
</style>
