<template>
  <div class="taskmgr-app">
    <div class="tm-header">
      <span class="tm-title neon-text-cyan">📊 任务管理器</span>
    </div>

    <!-- System stats -->
    <div class="tm-stats">
      <div class="stat-card">
        <div class="stat-label">CPU</div>
        <div class="stat-bar"><div class="stat-fill cpu" :style="{ width: cpuPercent + '%' }"></div></div>
        <div class="stat-val">{{ cpuPercent }}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">内存</div>
        <div class="stat-bar"><div class="stat-fill mem" :style="{ width: memPercent + '%' }"></div></div>
        <div class="stat-val">{{ memPercent }}%</div>
      </div>
    </div>

    <!-- Process list -->
    <div class="tm-processes">
      <div class="tm-process-header">
        <span class="ph-name">进程名</span>
        <span class="ph-action">操作</span>
      </div>
      <div v-for="proc in processes" :key="proc.id" class="tm-process-row">
        <span class="pr-icon">{{ proc.icon }}</span>
        <span class="pr-name">{{ proc.name }}</span>
        <button class="pr-kill" @click="killProcess(proc.id)" title="结束任务">✕</button>
      </div>
      <div v-if="processes.length === 0" class="tm-empty">
        没有正在运行的任务
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'

defineProps({ windowId: String })

const wm = inject('wm')
const notif = inject('notif')

const cpuPercent = ref(Math.floor(Math.random() * 30 + 5))
const memPercent = ref(Math.floor(Math.random() * 40 + 20))

// Simulated fluctuating stats
let statsTimer
onMounted(() => {
  statsTimer = setInterval(() => {
    cpuPercent.value = Math.max(2, Math.min(95, cpuPercent.value + Math.floor(Math.random() * 15 - 7)))
    memPercent.value = Math.max(5, Math.min(92, memPercent.value + Math.floor(Math.random() * 10 - 5)))
  }, 2000)
})
onUnmounted(() => clearInterval(statsTimer))

const processes = computed(() =>
  wm.windowList.value.map(w => ({
    id: w.id,
    name: w.title,
    icon: w.icon,
  }))
)

function killProcess(id) {
  wm.closeWindow(id)
  notif.add('任务管理器', '进程已结束', 'info')
}
</script>

<style scoped>
.taskmgr-app {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.tm-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-glow);
}
.tm-title {
  font-family: var(--font-display);
  font-size: 15px;
  letter-spacing: 1px;
}
.tm-stats {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-glow);
}
.stat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-label { font-size: 10px; color: var(--text-dim); }
.stat-bar {
  height: 6px;
  background: var(--bg-panel2);
  border-radius: 3px;
  overflow: hidden;
}
.stat-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}
.stat-fill.cpu { background: linear-gradient(90deg, var(--neon-cyan), var(--neon-blue)); }
.stat-fill.mem { background: linear-gradient(90deg, var(--neon-magenta), var(--neon-purple)); }
.stat-val { font-size: 11px; color: var(--text-bright); font-family: var(--font-mono); }

.tm-processes {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.tm-process-header {
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
  font-size: 10px;
  color: var(--text-dim);
  border-bottom: 1px solid rgba(0,240,255,0.1);
  margin-bottom: 4px;
}
.tm-process-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 4px;
  transition: all 0.15s;
}
.tm-process-row:hover { background: rgba(255,255,255,0.03); }
.pr-icon { font-size: 16px; }
.pr-name { flex: 1; font-size: 12px; color: var(--text-secondary); }
.pr-kill {
  background: none;
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--text-dim);
  cursor: pointer;
  padding: 2px 8px;
  font-size: 12px;
  transition: all 0.15s;
}
.pr-kill:hover {
  background: rgba(255,50,80,0.2);
  border-color: rgba(255,50,80,0.4);
  color: #ff4466;
}
.tm-empty {
  text-align: center;
  padding: 30px;
  color: var(--text-dim);
  font-size: 12px;
}
.ph-action { width: 40px; text-align: center; }
</style>
