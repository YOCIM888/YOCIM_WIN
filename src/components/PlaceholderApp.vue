<template>
  <div class="placeholder-app">
    <div class="ph-icon">{{ icon }}</div>
    <h2 class="ph-title neon-text-cyan">{{ title }}</h2>
    <p class="ph-desc">{{ description }}</p>
    <div class="ph-status">
      <span class="ph-dot"></span>
      <span>功能开发中…</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  windowId: String,
  title: { type: String, default: '应用' },
  icon: { type: String, default: '🔧' },
  description: { type: String, default: '此应用正在开发中，敬请期待。' },
})
</script>

<style scoped>
.placeholder-app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  padding: 40px;
  text-align: center;
}
.ph-icon { font-size: 64px; filter: drop-shadow(0 0 20px rgba(0,240,255,0.4)); }
.ph-title {
  font-family: var(--font-display);
  font-size: 20px;
  letter-spacing: 2px;
}
.ph-desc { color: var(--text-dim); font-size: 12px; }
.ph-status {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--neon-yellow);
  font-size: 11px;
  margin-top: 8px;
}
.ph-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--neon-yellow);
  box-shadow: 0 0 8px var(--neon-yellow);
  animation: neonPulse 1.5s infinite;
}
</style>
