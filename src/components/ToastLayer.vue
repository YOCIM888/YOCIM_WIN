<template>
  <TransitionGroup name="toast" tag="div" class="toast-container">
    <div
      v-for="t in visibleToasts"
      :key="t.id"
      class="toast"
      :class="t.type"
      @click="notif.remove(t.id)"
    >
      <span class="toast-icon">{{ toastIcon(t.type) }}</span>
      <div class="toast-body">
        <div class="toast-title">{{ t.title }}</div>
        <div class="toast-msg">{{ t.message }}</div>
      </div>
    </div>
  </TransitionGroup>
</template>

<script setup>
import { ref, inject, watch, onUnmounted } from 'vue'

const notif = inject('notif')
const visibleToasts = ref([])
const toastTimers = {}

function toastIcon(type) {
  return { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' }[type] || 'ℹ️'
}

watch(() => notif.list.length, () => {
  const latest = notif.list[notif.list.length - 1]
  if (!latest || visibleToasts.value.find(t => t.id === latest.id)) return
  visibleToasts.value.push({ ...latest })
  const timer = setTimeout(() => {
    visibleToasts.value = visibleToasts.value.filter(t => t.id !== latest.id)
    delete toastTimers[latest.id]
  }, 3500)
  toastTimers[latest.id] = timer
})

onUnmounted(() => {
  Object.values(toastTimers).forEach(clearTimeout)
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 60px;
  right: 16px;
  z-index: 250;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}
.toast {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 260px;
  max-width: 360px;
  padding: 10px 14px;
  background: var(--bg-panel);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0,240,255,0.2), 0 8px 24px rgba(0,0,0,0.5);
  cursor: pointer;
  pointer-events: auto;
}
.toast.info { border-left: 3px solid var(--neon-cyan); }
.toast.success { border-left: 3px solid var(--neon-green); }
.toast.warning { border-left: 3px solid var(--neon-yellow); }
.toast.error { border-left: 3px solid #ff4466; }
.toast-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
.toast-body { flex: 1; min-width: 0; }
.toast-title { font-size: 12px; font-weight: 600; color: var(--text-bright); margin-bottom: 2px; }
.toast-msg { font-size: 11px; color: var(--text-secondary); }

.toast-enter-active { transition: all 0.3s ease-out; }
.toast-leave-active { transition: all 0.2s ease-in; }
.toast-enter-from { opacity: 0; transform: translateX(40px); }
.toast-leave-to { opacity: 0; transform: translateX(40px); }
</style>
