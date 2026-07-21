<template>
  <Transition name="lockscreen">
    <div v-if="visible" class="lockscreen" @click="unlock">
      <div class="lock-time">{{ time }}</div>
      <div class="lock-date">{{ date }}</div>
      <div class="lock-hint neon-text-cyan">点击屏幕解锁</div>
      <div class="lock-user">
        <div class="lock-avatar">⬡</div>
        <div class="lock-name">YOCIM</div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const visible = ref(true)
const time = ref('')
const date = ref('')
let timer

function updateClock() {
  const now = new Date()
  time.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  date.value = now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })
}

function unlock() {
  visible.value = false
}

onMounted(() => {
  updateClock()
  timer = setInterval(updateClock, 1000)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.lockscreen {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: radial-gradient(ellipse at 50% 40%, rgba(0,20,40,0.95), #000);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  backdrop-filter: blur(10px);
}
.lock-time {
  font-family: var(--font-display);
  font-size: 72px;
  font-weight: 900;
  color: var(--neon-cyan);
  text-shadow: 0 0 30px rgba(0,240,255,0.5), 0 0 80px rgba(0,240,255,0.2);
  letter-spacing: 4px;
}
.lock-date {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--text-secondary);
  letter-spacing: 2px;
  margin-bottom: 40px;
}
.lock-hint {
  font-family: var(--font-mono);
  font-size: 14px;
  letter-spacing: 2px;
  animation: neonPulse 2s infinite;
  margin-bottom: 80px;
}
.lock-user {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.lock-avatar {
  width: 80px; height: 80px;
  border-radius: 50%;
  background: rgba(0,240,255,0.1);
  border: 2px solid var(--neon-cyan);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  box-shadow: 0 0 30px rgba(0,240,255,0.3);
}
.lock-name {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--text-bright);
  letter-spacing: 2px;
}
.lockscreen-enter-active { transition: opacity 0.3s; }
.lockscreen-leave-active { transition: opacity 0.4s; pointer-events: none; }
.lockscreen-leave-to { opacity: 0; }
</style>
