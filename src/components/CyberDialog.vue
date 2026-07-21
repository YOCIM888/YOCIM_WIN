<template>
  <Transition name="dialog">
    <div v-if="visible" class="dialog-overlay" @click.self="onCancel">
      <div class="dialog-box">
        <div class="dialog-title">{{ title }}</div>
        <div class="dialog-msg">{{ message }}</div>
        <div class="dialog-btns">
          <button v-if="type === 'confirm'" class="dialog-btn cancel" @click="onCancel">取消</button>
          <button class="dialog-btn ok" @click="onOk">{{ okText }}</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'

const visible = ref(false)
const title = ref('')
const message = ref('')
const type = ref('alert') // 'alert' | 'confirm'
const okText = ref('确定')
let resolvePromise = null

function show(opts) {
  title.value = opts.title || '提示'
  message.value = opts.message || ''
  type.value = opts.type || 'alert'
  okText.value = opts.okText || (type.value === 'confirm' ? '确定' : '知道了')
  visible.value = true
  return new Promise(resolve => { resolvePromise = resolve })
}

function onOk() {
  visible.value = false
  resolvePromise?.(true)
}

function onCancel() {
  visible.value = false
  resolvePromise?.(false)
}

defineExpose({ show })
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 600;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}
.dialog-box {
  background: var(--bg-panel);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  padding: 24px 28px;
  min-width: 320px;
  max-width: 420px;
  box-shadow: 0 0 40px rgba(0,240,255,0.2), 0 16px 48px rgba(0,0,0,0.6);
}
.dialog-title {
  font-family: var(--font-display);
  font-size: 16px;
  color: var(--neon-cyan);
  text-shadow: 0 0 10px rgba(0,240,255,0.3);
  margin-bottom: 12px;
  letter-spacing: 1px;
}
.dialog-msg {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 20px;
}
.dialog-btns {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.dialog-btn {
  padding: 8px 20px;
  border-radius: 6px;
  border: 1px solid var(--border-glow);
  background: transparent;
  font-family: var(--font-mono);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.dialog-btn.cancel {
  color: var(--text-dim);
}
.dialog-btn.cancel:hover {
  border-color: var(--text-secondary);
  color: var(--text-bright);
}
.dialog-btn.ok {
  color: var(--neon-cyan);
  border-color: var(--neon-cyan);
}
.dialog-btn.ok:hover {
  background: rgba(0,240,255,0.15);
  box-shadow: 0 0 12px rgba(0,240,255,0.3);
}

.dialog-enter-active { transition: all 0.2s ease-out; }
.dialog-leave-active { transition: all 0.15s ease-in; }
.dialog-enter-from, .dialog-leave-to { opacity: 0; }
.dialog-enter-from .dialog-box { transform: scale(0.9); }
.dialog-leave-to .dialog-box { transform: scale(0.9); }
</style>
