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
    <!-- Find Bar -->
    <div v-if="findVisible" class="find-bar">
      <input v-model="findQuery" class="find-input" placeholder="查找…" @keydown.enter="doFind" @keydown.escape="findVisible = false" ref="findInputEl" />
      <input v-model="replaceQuery" class="find-input" placeholder="替换为…" />
      <button class="find-btn" @click="doFind">查找</button>
      <button class="find-btn" @click="doReplace">替换</button>
      <button class="find-btn" @click="doReplaceAll">全部替换</button>
      <span class="find-count">{{ findResults.length ? `${findIdx + 1}/${findResults.length}` : '0/0' }}</span>
      <button class="find-close" @click="findVisible = false">✕</button>
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
import { ref, computed, inject, watch, onUnmounted, nextTick } from 'vue'
import { fileSystem } from '../composables/useFileSystem.js'

const props = defineProps({
  windowId: String,
  filename: { type: String, default: '' },
  content: { type: String, default: '' },
  filePath: { type: String, default: '' },
})

const notif = inject('notif')
const text = ref(props.content || '')
const currentFilePath = ref(props.filePath || '') // mutable local path
const editorEl = ref(null)
const menuOpen = ref(null)
const undoStack = ref([])
const findVisible = ref(false)
const findQuery = ref('')
const replaceQuery = ref('')
const findInputEl = ref(null)
const findResults = ref([])
const findIdx = ref(-1)

const lines = computed(() => text.value.split('\n').length)
const chars = computed(() => text.value.length)

// push undo on each text change
let isUndoing = false
watch(text, (newVal, oldVal) => {
  if (isUndoing) return
  if (oldVal !== undefined && newVal !== oldVal) {
    undoStack.value.push(oldVal)
    if (undoStack.value.length > 50) undoStack.value.shift()
  }
})

function undo() {
  if (undoStack.value.length > 0) {
    isUndoing = true
    text.value = undoStack.value.pop()
    nextTick(() => { isUndoing = false })
  }
  menuOpen.value = null
}

function selectAll() {
  editorEl.value?.select()
  menuOpen.value = null
}

function newFile() {
  text.value = ''
  currentFilePath.value = ''
  undoStack.value = []
  menuOpen.value = null
}

function saveFile() {
  if (currentFilePath.value) {
    if (fileSystem.writeFile(currentFilePath.value, text.value)) {
      notif.add('记事本', `已保存 "${props.filename || currentFilePath.value}"`, 'success')
    } else {
      notif.add('记事本', '保存失败', 'error')
    }
  } else {
    const name = prompt('保存为文件名:', props.filename || '未命名.txt')
    if (name) {
      const newPath = '/Users/Yocim/Documents/' + name
      if (fileSystem.createFile('/Users/Yocim/Documents', name, text.value)) {
        currentFilePath.value = newPath
        notif.add('记事本', `已保存到 ${newPath}`, 'success')
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
      currentFilePath.value = path
      undoStack.value = []
      notif.add('记事本', `已打开 ${path}`, 'success')
    } else {
      notif.add('记事本', `无法打开 ${path}`, 'error')
    }
  }
  menuOpen.value = null
}

// Close dropdown when clicking elsewhere (with cleanup)
const closeMenu = () => { menuOpen.value = null }
document.addEventListener('click', closeMenu)
onUnmounted(() => document.removeEventListener('click', closeMenu))

// Keyboard shortcuts — only fire when this notepad is in a focused window
function onKeydown(e) {
  // Check if this editor is in the active document
  if (document.activeElement !== editorEl.value) return
  if (e.ctrlKey && e.key === 's') { e.preventDefault(); saveFile(); return }
  if (e.ctrlKey && e.key === 'n') { e.preventDefault(); newFile(); return }
  if (e.ctrlKey && e.key === 'o') { e.preventDefault(); openFromFS(); return }
  if (e.ctrlKey && e.key === 'c') {
    if (window.getSelection) {
      const sel = window.getSelection().toString()
      if (sel) navigator.clipboard?.writeText(sel).catch(() => {})
    }
    return
  }
  if (e.ctrlKey && e.key === 'v') {
    e.preventDefault()
    navigator.clipboard?.readText().then(t => {
      if (t) {
        const el = editorEl.value
        if (el) {
          const start = el.selectionStart
          const end = el.selectionEnd
          text.value = text.value.slice(0, start) + t + text.value.slice(end)
          nextTick(() => el.setSelectionRange(start + t.length, start + t.length))
        }
      }
    }).catch(() => {})
    return
  }
  if ((e.ctrlKey && e.key === 'f') || (e.ctrlKey && e.key === 'h')) {
    e.preventDefault()
    findVisible.value = !findVisible.value
    if (findVisible.value) { findQuery.value = ''; replaceQuery.value = ''; findResults.value = []; nextTick(() => findInputEl.value?.focus()) }
    return
  }
}
document.addEventListener('keydown', onKeydown)
onUnmounted(() => document.removeEventListener('keydown', onKeydown))

function doFind() {
  if (!findQuery.value) { findResults.value = []; findIdx.value = -1; return }
  const escaped = findQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(escaped, 'gi')
  let match
  const results = []
  while ((match = re.exec(text.value)) !== null) {
    results.push(match.index)
  }
  findResults.value = results
  findIdx.value = results.length ? 0 : -1
  if (results.length) highlightResult(results[0])
}

function doReplace() {
  if (!findQuery.value || findResults.value.length === 0) return
  const idx = findResults.value[findIdx.value]
  if (idx === undefined) return
  const before = text.value.slice(0, idx)
  const after = text.value.slice(idx + findQuery.value.length)
  text.value = before + replaceQuery.value + after
  doFind()
}

function doReplaceAll() {
  if (!findQuery.value) return
  const escaped = findQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  text.value = text.value.replace(new RegExp(escaped, 'gi'), replaceQuery.value)
  findResults.value = []
  findIdx.value = -1
}

function highlightResult(pos) {
  editorEl.value?.focus()
  editorEl.value?.setSelectionRange(pos, pos + findQuery.value.length)
}
</script>

<style scoped>
.notepad-app {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.find-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--border-glow);
  flex-shrink: 0;
  flex-wrap: wrap;
}
.find-input {
  width: 120px;
  background: rgba(0,0,0,0.3);
  border: 1px solid var(--border-glow);
  border-radius: 3px;
  padding: 3px 8px;
  color: var(--text-bright);
  font-family: var(--font-mono);
  font-size: 11px;
  outline: none;
}
.find-input:focus { border-color: var(--neon-cyan); }
.find-btn {
  padding: 3px 8px;
  border: 1px solid var(--border-glow);
  border-radius: 3px;
  background: transparent;
  color: var(--text-dim);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 10px;
  transition: all 0.15s;
}
.find-btn:hover { border-color: var(--neon-cyan); color: var(--neon-cyan); }
.find-count {
  font-size: 10px;
  color: var(--text-dim);
  min-width: 30px;
}
.find-close {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 14px;
  padding: 0 4px;
}
.find-close:hover { color: #ff4466; }

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
