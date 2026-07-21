<template>
  <div class="file-explorer">
    <!-- Toolbar -->
    <div class="explorer-toolbar">
      <button class="tool-btn" @click="goUp" :disabled="currentPath === '/'">⬆</button>
      <button class="tool-btn" @click="goBack" :disabled="!canGoBack">◀</button>
      <button class="tool-btn" @click="goForward" :disabled="!canGoFwd">▶</button>
      <div class="path-bar">
        <span
          v-for="(part, i) in pathParts"
          :key="i"
          class="path-part"
          @click="navigateToPath(i)"
        >
          <span v-if="i > 0" class="path-sep">▸</span>
          <span class="path-segment">{{ part }}</span>
        </span>
      </div>
      <div class="toolbar-spacer"></div>
      <button class="tool-btn sort-btn" @click="sortBy = sortBy === 'name' ? 'type' : 'name'" :title="sortBy === 'name' ? '按名称排序' : '按类型排序'">
        {{ sortBy === 'name' ? '🔤' : '📂' }}
      </button>
      <span class="item-count">{{ items.length }} 个项目</span>
    </div>

    <!-- Content -->
    <div class="explorer-content" @contextmenu.prevent="onContext">
      <div v-if="currentPath !== '/'" class="explorer-item" @dblclick="goUp">
        <span class="item-icon">📂</span>
        <span class="item-name">..</span>
      </div>
      <div
        v-for="item in items"
        :key="item.key"
        class="explorer-item"
        :class="{ selected: selectedItem === item.key }"
        @click="selectItem(item)"
        @dblclick="openItem(item)"
        @contextmenu.prevent.stop="onItemContext($event, item)"
      >
        <span class="item-icon">{{ item.type === 'dir' ? '📁' : getFileIcon(item.name) }}</span>
        <input
          v-if="renamingItem === item.key"
          class="rename-input"
          v-model="renameValue"
          @keydown.enter="commitRename(item)"
          @keydown.escape="renamingItem = null"
          @blur="commitRename(item)"
          ref="renameInputEl"
          @click.stop
        />
        <span v-else class="item-name">{{ item.name }}</span>
        <span v-if="item.type === 'file'" class="item-size">{{ item.size }}</span>
      </div>
      <div v-if="items.length === 0 && currentPath !== '/'" class="empty-dir">
        此文件夹为空
      </div>
    </div>

    <!-- Status Bar -->
    <div class="explorer-status">
      <span>{{ currentPath }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, nextTick } from 'vue'
import { fileSystem } from '../composables/useFileSystem.js'
import { recycleBin } from '../composables/useRecycleBin.js'
import { contextMenu } from '../composables/useContextMenu.js'

const props = defineProps({
  windowId: String,
  path: { type: String, default: '/' }
})

const wm = inject('wm')
const notif = inject('notif')

const currentPath = ref(props.path || '/')
const selectedItem = ref(null)
const history = ref([currentPath.value])
const historyIdx = ref(0)
const refreshCounter = ref(0)
const sortBy = ref('name') // 'name' | 'type'
const renamingItem = ref(null)
const renameValue = ref('')
const renameInputEl = ref(null)

const items = computed(() => {
  void refreshCounter.value
  const list = fileSystem.getChildren(currentPath.value)
  const sorted = [...list].sort((a, b) => {
    // dirs always come first
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  if (sortBy.value === 'type') {
    return sorted
  }
  // sort by name: just use localeCompare (dirs still first from base sort)
  return sorted
})

const pathParts = computed(() => {
  if (currentPath.value === '/') return ['根目录']
  return currentPath.value.replace(/^\//, '').split('/').filter(Boolean)
})

const canGoBack = computed(() => historyIdx.value > 0)
const canGoFwd = computed(() => historyIdx.value < history.value.length - 1)

function navigateTo(newPath) {
  if (newPath === currentPath.value) return
  currentPath.value = newPath
  selectedItem.value = null
  // update history
  historyIdx.value++
  history.value = history.value.slice(0, historyIdx.value)
  history.value.push(newPath)
}

function navigateToPath(idx) {
  const parts = currentPath.value.replace(/^\//, '').split('/').filter(Boolean)
  const newPath = '/' + parts.slice(0, idx + 1).join('/')
  navigateTo(newPath)
}

function goUp() {
  const parent = fileSystem.getParentPath(currentPath.value)
  navigateTo(parent)
}

function goBack() {
  if (canGoBack.value) {
    historyIdx.value--
    currentPath.value = history.value[historyIdx.value]
  }
}

function goForward() {
  if (canGoFwd.value) {
    historyIdx.value++
    currentPath.value = history.value[historyIdx.value]
  }
}

function openItem(item) {
  if (item.type === 'dir') {
    navigateTo(currentPath.value === '/' ? `/${item.key}` : `${currentPath.value}/${item.key}`)
  } else {
    const fp = currentPath.value === '/' ? `/${item.key}` : `${currentPath.value}/${item.key}`
    const content = fileSystem.readFile(fp)
    wm.openWindow('notepad', {
      title: item.name,
      icon: '📝',
      props: { filename: item.name, content, filePath: fp }
    })
  }
}

function selectItem(item) {
  if (selectedItem.value === item.key) {
    // second click → rename
    renamingItem.value = item.key
    renameValue.value = item.name
    nextTick(() => renameInputEl.value?.focus?.())
  } else {
    selectedItem.value = item.key
    renamingItem.value = null
  }
}

function commitRename(item) {
  if (!renamingItem.value) return
  const newName = renameValue.value.trim()
  if (newName && newName !== item.name) {
    const src = currentPath.value === '/' ? `/${item.key}` : `${currentPath.value}/${item.key}`
    if (fileSystem.renameItem(src, newName)) {
      notif.add('重命名', `已重命名为 "${newName}"`, 'success')
    } else {
      notif.add('重命名', '重命名失败', 'error')
    }
  }
  renamingItem.value = null
}

function getFileIcon(name) {
  const ext = name.split('.').pop()
  const map = {
    txt: '📄', log: '📋', ini: '⚙️', sys: '🔧', dll: '🔌', dat: '💾',
    exe: '⚡', png: '🖼️', jpg: '🖼️', mp3: '🎵', enc: '🔒'
  }
  return map[ext] || '📄'
}

function fullPath(itemKey) {
  return currentPath.value === '/' ? `/${itemKey}` : `${currentPath.value}/${itemKey}`
}

function onContext(e) {
  contextMenu.show(e.clientX, e.clientY, [
    { label: '刷新', icon: '🔄', action: () => { refreshCounter.value++; selectedItem.value = null } },
    { label: '新建文件夹', icon: '📁', action: () => {
      let name = '新建文件夹'; let finalName = name; let i = 1
      const existing = new Set(items.value.map(it => it.name))
      while (existing.has(finalName)) { finalName = `${name} (${i++})` }
      if (fileSystem.createDir(currentPath.value, finalName)) {
        notif.add('资源管理器', `已创建文件夹 "${finalName}"`, 'success')
      }
    }},
    { label: '新建文本文档', icon: '📝', action: () => {
      let finalName = '新建文本文档.txt'; let i = 1
      const existing = new Set(items.value.map(it => it.name))
      while (existing.has(finalName)) { finalName = `新建文本文档 (${i++}).txt` }
      if (fileSystem.createFile(currentPath.value, finalName, '')) {
        notif.add('资源管理器', `已创建文件 "${finalName}"`, 'success')
      }
    }},
    { type: 'separator' },
    { label: '在终端中打开', icon: '⬛', action: () => wm.openWindow('terminal', { title: '终端 - ' + (currentPath.value === '/' ? '/' : currentPath.value.split('/').pop()), icon: '⬛', props: { cwd: currentPath.value } }) },
    { label: '属性', icon: '📋', action: () => notif.add('属性', `路径: ${currentPath.value}`, 'info') },
  ])
}

function onItemContext(e, item) {
  contextMenu.show(e.clientX, e.clientY, [
    { label: `打开 ${item.name}`, icon: '🖱️', action: () => openItem(item) },
    { type: 'separator' },
    { label: '复制', icon: '📋', action: () => {
      const src = fullPath(item.key)
      if (fileSystem.copyItem(src, currentPath.value)) {
        notif.add('复制', `"${item.name}" 已复制`, 'success')
      }
    }},
    { label: '删除', icon: '🗑️', action: () => {
      const src = fullPath(item.key)
      if (recycleBin.add(src)) {
        notif.add('删除', `"${item.name}" 已移至回收站`, 'warning')
      }
    }},
    { label: '重命名', icon: '✏️', action: () => {
      const newName = prompt('重命名:', item.name)
      if (newName && newName !== item.name) {
        const src = fullPath(item.key)
        if (fileSystem.renameItem(src, newName)) {
          notif.add('重命名', `已重命名为 "${newName}"`, 'success')
          selectedItem.value = null
        } else {
          notif.add('重命名', '重命名失败（名称重复或无效）', 'error')
        }
      }
    }},
    { type: 'separator' },
    { label: '属性', icon: '📋', action: () => notif.add('属性', `${item.name} - 类型: ${item.type === 'dir' ? '文件夹' : '文件'}`, 'info') },
  ])
}
</script>

<style scoped>
.file-explorer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-window);
}
.explorer-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--border-glow);
  flex-shrink: 0;
  flex-wrap: wrap;
}
.tool-btn {
  width: 28px; height: 28px;
  border: 1px solid var(--border-glow);
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.tool-btn:hover:not(:disabled) {
  background: rgba(0, 240, 255, 0.1);
  border-color: var(--border-strong);
  color: var(--neon-cyan);
}
.tool-btn:disabled { opacity: 0.3; cursor: default; }
.path-bar {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
  min-width: 0;
  overflow-x: auto;
  padding: 2px 8px;
  font-size: 11px;
}
.path-part { display: flex; align-items: center; gap: 2px; white-space: nowrap; }
.path-sep { color: var(--text-dim); font-size: 10px; }
.path-segment {
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 3px;
  color: var(--text-secondary);
  transition: all 0.15s;
}
.path-segment:hover { background: rgba(0,240,255,0.1); color: var(--neon-cyan); }
.toolbar-spacer { flex: 1; }
.item-count { font-size: 10px; color: var(--text-dim); white-space: nowrap; }

.explorer-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 4px;
}
.explorer-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px;
  width: 80px;
  border: 1px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.explorer-item:hover {
  background: rgba(0, 240, 255, 0.07);
  border-color: rgba(0, 240, 255, 0.2);
}
.explorer-item.selected {
  background: rgba(0, 240, 255, 0.15);
  border-color: rgba(0, 240, 255, 0.4);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.15);
}
.item-icon { font-size: 32px; }
.item-name {
  font-size: 10px;
  color: var(--text-secondary);
  text-align: center;
  word-break: break-all;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.rename-input {
  width: 100%;
  background: rgba(0,0,0,0.5);
  border: 1px solid var(--neon-cyan);
  border-radius: 3px;
  padding: 2px 4px;
  color: var(--text-bright);
  font-family: var(--font-mono);
  font-size: 10px;
  text-align: center;
  outline: none;
  box-shadow: 0 0 6px rgba(0,240,255,0.3);
}
.item-size {
  font-size: 9px;
  color: var(--text-dim);
}
.empty-dir {
  width: 100%;
  text-align: center;
  padding: 40px;
  color: var(--text-dim);
  font-size: 13px;
}
.explorer-status {
  height: 24px;
  border-top: 1px solid var(--border-glow);
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: 10px;
  color: var(--text-dim);
  flex-shrink: 0;
}
</style>
