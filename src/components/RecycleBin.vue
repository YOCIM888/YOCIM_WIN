<template>
  <div class="recycle-bin">
    <div class="recycle-header">
      <span class="recycle-title">🗑️ 回收站</span>
      <span class="recycle-count">{{ items.length }} 个项目</span>
    </div>
    <div class="recycle-toolbar">
      <button class="rb-btn" @click="restoreAll" :disabled="items.length === 0">♻️ 还原所有</button>
      <button class="rb-btn danger" @click="emptyBin" :disabled="items.length === 0">⚠ 清空回收站</button>
    </div>
    <div class="recycle-content">
      <div v-if="items.length === 0" class="empty-bin">
        <span class="empty-icon">🗑️</span>
        <span>回收站为空</span>
      </div>
      <div
        v-for="item in items"
        :key="item.id"
        class="recycle-item"
      >
        <span class="item-icon">{{ item.icon }}</span>
        <span class="item-name">{{ item.name }}</span>
        <span class="item-date">{{ item.deletedAt }}</span>
        <button class="item-restore" @click="restore(item.id)" title="还原">♻️</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject } from 'vue'

defineProps({ windowId: String })
const notif = inject('notif')

const items = ref([
  { id: 1, name: '旧的日志.txt', icon: '📄', deletedAt: '2025/6/15' },
  { id: 2, name: '临时文件.tmp', icon: '📄', deletedAt: '2025/7/1' },
  { id: 3, name: '截图_001.png', icon: '🖼️', deletedAt: '2025/7/10' },
])

function restore(id) {
  items.value = items.value.filter(i => i.id !== id)
  notif.add('回收站', '项目已还原', 'success')
}

function restoreAll() {
  items.value = []
  notif.add('回收站', '所有项目已还原', 'success')
}

function emptyBin() {
  items.value = []
  notif.add('回收站', '回收站已清空', 'warning')
}
</script>

<style scoped>
.recycle-bin {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.recycle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-glow);
}
.recycle-title {
  font-family: var(--font-display);
  font-size: 14px;
  color: var(--neon-cyan);
}
.recycle-count {
  font-size: 11px;
  color: var(--text-dim);
}
.recycle-toolbar {
  display: flex;
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid var(--border-glow);
}
.rb-btn {
  padding: 6px 14px;
  border: 1px solid var(--border-glow);
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 11px;
  transition: all 0.15s;
}
.rb-btn:hover:not(:disabled) {
  border-color: var(--neon-cyan);
  color: var(--neon-cyan);
}
.rb-btn:disabled { opacity: 0.3; cursor: default; }
.rb-btn.danger:hover:not(:disabled) {
  border-color: #ff4466;
  color: #ff4466;
  box-shadow: 0 0 8px rgba(255,60,80,0.2);
}
.recycle-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.empty-bin {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px;
  color: var(--text-dim);
  font-size: 13px;
}
.empty-icon { font-size: 48px; }
.recycle-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  transition: all 0.15s;
}
.recycle-item:hover {
  background: rgba(255,255,255,0.03);
  border-color: rgba(0,240,255,0.15);
}
.item-icon { font-size: 22px; }
.item-name { flex: 1; font-size: 12px; color: var(--text-secondary); }
.item-date { font-size: 10px; color: var(--text-dim); }
.item-restore {
  background: none;
  border: 1px solid var(--border-glow);
  border-radius: 4px;
  color: var(--text-dim);
  cursor: pointer;
  padding: 4px 8px;
  font-size: 14px;
  transition: all 0.15s;
}
.item-restore:hover {
  border-color: var(--neon-green);
  color: var(--neon-green);
}
</style>
