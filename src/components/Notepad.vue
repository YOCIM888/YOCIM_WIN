<template>
  <div class="notepad-app">
    <!-- Menu Bar -->
    <div class="notepad-menu">
      <span class="menu-item">文件</span>
      <span class="menu-item">编辑</span>
      <span class="menu-item">查看</span>
    </div>
    <!-- Editor -->
    <textarea
      v-model="text"
      class="notepad-editor"
      placeholder="在此输入内容..."
      spellcheck="false"
    ></textarea>
    <!-- Status Bar -->
    <div class="notepad-status">
      <span>{{ filename || '未命名' }}</span>
      <span>{{ lines }} 行, {{ chars }} 字符</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  windowId: String,
  filename: { type: String, default: '' },
  content: { type: String, default: '' },
})

const text = ref(props.content || '')

const lines = computed(() => text.value.split('\n').length)
const chars = computed(() => text.value.length)
</script>

<style scoped>
.notepad-app {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.notepad-menu {
  display: flex;
  gap: 2px;
  padding: 4px 8px;
  border-bottom: 1px solid var(--border-glow);
  flex-shrink: 0;
}
.menu-item {
  padding: 4px 10px;
  font-size: 11px;
  color: var(--text-dim);
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s;
}
.menu-item:hover {
  background: rgba(0,240,255,0.1);
  color: var(--text-bright);
}
.notepad-editor {
  flex: 1;
  background: rgba(0,0,0,0.3);
  border: none;
  outline: none;
  resize: none;
  padding: 12px;
  color: var(--text-bright);
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  caret-color: var(--neon-cyan);
}
.notepad-editor::placeholder {
  color: var(--text-dim);
}
.notepad-editor::selection {
  background: var(--neon-cyan);
  color: #000;
}
.notepad-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-top: 1px solid var(--border-glow);
  font-size: 10px;
  color: var(--text-dim);
  flex-shrink: 0;
}
</style>
