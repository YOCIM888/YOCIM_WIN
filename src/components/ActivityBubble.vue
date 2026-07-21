<template>
  <Transition name="bubble">
    <div v-if="visible" class="activity-bubble" @click.stop>
      <div class="bubble-header">
        <span class="bubble-title">操作记录</span>
        <div class="bubble-actions">
          <button class="bubble-clear" @click="log.clear()">清空</button>
          <button class="bubble-close" @click="$emit('close')">✕</button>
        </div>
      </div>
      <div class="bubble-body">
        <div v-if="log.items.length === 0" class="bubble-empty">暂无操作记录</div>
        <div v-for="item in log.items.slice().reverse()" :key="item.id" class="bubble-item" :class="item.type">
          <span class="bubble-time">{{ item.time }}</span>
          <span class="bubble-icon">{{ item.icon }}</span>
          <span class="bubble-msg">{{ item.message }}</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { activityLog } from '../composables/useActivityLog.js'

defineProps({ visible: Boolean })
defineEmits(['close'])
const log = activityLog
</script>

<style scoped>
.activity-bubble {
  position: absolute;
  bottom: 52px;
  right: 8px;
  width: 360px;
  max-height: 400px;
  background: var(--bg-panel);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  box-shadow: 0 0 30px rgba(0,240,255,0.2), 0 10px 40px rgba(0,0,0,0.6);
  z-index: 102;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.bubble-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-glow);
  flex-shrink: 0;
}
.bubble-title {
  font-family: var(--font-display);
  font-size: 13px;
  color: var(--neon-cyan);
  letter-spacing: 1px;
}
.bubble-actions { display: flex; gap: 6px; }
.bubble-clear, .bubble-close {
  background: none;
  border: 1px solid var(--border-glow);
  border-radius: 4px;
  color: var(--text-dim);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 2px 8px;
}
.bubble-clear:hover { border-color: var(--neon-yellow); color: var(--neon-yellow); }
.bubble-close:hover { border-color: #ff4466; color: #ff4466; }

.bubble-body { overflow-y: auto; padding: 4px; flex: 1; }
.bubble-empty { text-align: center; padding: 24px; color: var(--text-dim); font-size: 12px; }
.bubble-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 4px;
  font-size: 11px;
}
.bubble-item:hover { background: rgba(255,255,255,0.03); }
.bubble-time { color: var(--text-dim); font-size: 10px; min-width: 50px; flex-shrink: 0; }
.bubble-icon { font-size: 14px; flex-shrink: 0; }
.bubble-msg { color: var(--text-secondary); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.bubble-enter-active { transition: all 0.2s ease-out; }
.bubble-leave-active { transition: all 0.15s ease-in; }
.bubble-enter-from { opacity: 0; transform: translateY(8px); }
.bubble-leave-to { opacity: 0; transform: translateY(8px); }
</style>
