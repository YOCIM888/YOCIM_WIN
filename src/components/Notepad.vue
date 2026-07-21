<template>
  <div class="notepad-app">
    <!-- Menu Bar -->
    <div class="notepad-menu">
      <div class="menu-dropdown" @click.stop="menuOpen = menuOpen === 'file' ? null : 'file'">
        <span class="menu-item">文件</span>
        <div v-if="menuOpen === 'file'" class="dropdown-panel" @click.stop>
          <button @click="newFile">新建</button>
          <button @click="saveFile">保存</button>
          <button @click="openFromFS">打开…</button>
        </div>
      </div>
      <div class="menu-dropdown" @click.stop="menuOpen = menuOpen === 'edit' ? null : 'edit'">
        <span class="menu-item">编辑</span>
        <div v-if="menuOpen === 'edit'" class="dropdown-panel" @click.stop>
          <button @click="undo">撤销</button>
          <button @click="selectAll">全选</button>
        </div>
      </div>
      <span class="menu-item" style="cursor:default;opacity:0.5">查看</span>
    </div>
    <!-- Editor -->
    <textarea
      ref="editorEl"
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
import { ref, computed, inject } from 'vue'
import { fileSystem } from '../composables/useFileSystem.js'

const props = defineProps({
  windowId: String,
  filename: { type: String, default: '' },
  content: { type: String, default: '' },
  filePath: { type: String, default: '' }, // filesystem path if opened from explorer
})

const notif = inject('notif')
const text = ref(props.content || '')
const editorEl = ref(null)
const menuOpen = ref(null)
const undoStack = ref([])

const lines = computed(() => text.value.split('\n').length)
const chars = computed(() => text.value.length)

function pushUndo() {
  undoStack.value.push(text.value)
  if (undoStack.value.length > 50) undoStack.value.shift()
}

function undo() {
  if (undoStack.value.length > 0) {
    text.value = undoStack.value.pop()
  }
  menuOpen.value = null
}

function selectAll() {
  editorEl.value?.select()
  menuOpen.value = null
}

function newFile() {
  text.value = ''
  menuOpen.value = null
}

function saveFile() {
  if (props.filePath) {
    if (fileSystem.writeFile(props.filePath, text.value)) {
      notif.add('记事本', `已保存 "${props.filename || props.filePath}"`, 'success')
    } else {
      notif.add('记事本', '保存失败', 'error')
    }
  } else {
    const name = prompt('保存为文件名:', props.filename || '未命名.txt')
    if (name) {
      if (fileSystem.createFile('/Users/Yocim/Documents', name, text.value)) {
        notif.add('记事本', `已保存到 /Users/Yocim/Documents/${name}`, 'success')
      } else {
        notif.add('记事本', '保存失败（文件已存在？）', 'error')
      }
    }
  }
  menuOpen.value = null
}

function openFromFS() {
  const path = prompt('输入文件路径 (如 /Users/Yocim/Documents/README.txt):')
  if (path) {
    const content = fileSystem.readFile(path)
    if (content !== null) {
      text.value = content
      notif.add('记事本', `已打开 ${path}`, 'success')
    } else {
      notif.add('记事本', `无法打开 ${path}`, 'error')
    }
  }
  menuOpen.value = null
}

// Close dropdown when clicking elsewhere
document.addEventListener('click', () => { menuOpen.value = null })
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
  position: relative;
}
.menu-item {
  padding: 4px 10px;
  font-size: 11px;
  color: var(--text-dim);
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.15s;
  display: block;
}
.menu-item:hover {
  background: rgba(0,240,255,0.1);
  color: var(--text-bright);
}
.menu-dropdown {
  position: relative;
}
.dropdown-panel {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 140px;
  background: var(--bg-panel);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  padding: 4px;
  z-index: 300;
  box-shadow: 0 0 20px rgba(0,240,255,0.2), 0 8px 24px rgba(0,0,0,0.6);
}
.dropdown-panel button {
  display: block;
  width: 100%;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 11px;
  text-align: left;
  transition: all 0.1s;
}
.dropdown-panel button:hover {
  background: rgba(0,240,255,0.12);
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
