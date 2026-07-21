<template>
  <Transition name="notif-panel">
    <div v-if="ui.notifCenterOpen" class="notif-panel" @click.self="ui.closeAll">
      <div class="notif-inner">
        <div class="notif-header">
          <span class="notif-title">通知中心</span>
          <button class="notif-clear" @click="notif.clear()">清除全部</button>
        </div>
        <div class="notif-body">
          <div v-if="notif.list.length === 0" class="notif-empty">
            <span class="empty-icon">🔔</span>
            <span>暂无通知</span>
          </div>
          <div
            v-for="n in notif.list.slice().reverse()"
            :key="n.id"
            class="notif-item"
            :class="n.type"
          >
            <div class="notif-item-header">
              <span class="notif-item-title">{{ n.title }}</span>
              <span class="notif-item-time">{{ n.time }}</span>
            </div>
            <div class="notif-item-msg">{{ n.message }}</div>
            <button class="notif-close" @click="notif.remove(n.id)">✕</button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { inject } from 'vue'
import { uiState } from '../composables/uiState.js'

const notif = inject('notif')
const ui = uiState
</script>

<style scoped>
.notif-panel {
  position: absolute;
  bottom: 48px;
  right: 8px;
  z-index: 101;
}
.notif-inner {
  width: 320px;
  max-height: 400px;
  background: var(--bg-panel);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.2), 0 10px 40px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(20px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-glow);
}
.notif-title {
  font-family: var(--font-display);
  font-size: 14px;
  color: var(--neon-cyan);
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
  letter-spacing: 1px;
}
.notif-clear {
  font-size: 10px;
  background: none;
  border: 1px solid var(--border-glow);
  color: var(--text-dim);
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-family: var(--font-mono);
  transition: all 0.15s;
}
.notif-clear:hover {
  border-color: var(--neon-magenta);
  color: var(--neon-magenta);
}
.notif-body {
  overflow-y: auto;
  padding: 4px;
}
.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px;
  color: var(--text-dim);
  font-size: 12px;
}
.empty-icon { font-size: 32px; }

.notif-item {
  position: relative;
  padding: 10px 12px;
  margin: 2px;
  border: 1px solid transparent;
  border-radius: 6px;
  transition: all 0.15s;
  animation: slideIn 0.2s ease-out;
}
.notif-item:hover { background: rgba(255,255,255,0.03); }
.notif-item.info { border-left: 3px solid var(--neon-cyan); }
.notif-item.success { border-left: 3px solid var(--neon-green); }
.notif-item.warning { border-left: 3px solid var(--neon-yellow); }
.notif-item.error { border-left: 3px solid #ff4466; }
.notif-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.notif-item-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-bright);
}
.notif-item-time {
  font-size: 10px;
  color: var(--text-dim);
}
.notif-item-msg {
  font-size: 11px;
  color: var(--text-secondary);
}
.notif-close {
  position: absolute;
  top: 6px;
  right: 6px;
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 10px;
  opacity: 0;
  transition: opacity 0.15s;
}
.notif-item:hover .notif-close { opacity: 1; }
.notif-close:hover { color: #ff4466; }

.notif-panel-enter-active { transition: all 0.2s ease-out; }
.notif-panel-leave-active { transition: all 0.15s ease-in; }
.notif-panel-enter-from { opacity: 0; transform: translateY(10px) scale(0.95); }
.notif-panel-leave-to { opacity: 0; transform: translateY(10px) scale(0.95); }
</style>
