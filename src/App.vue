<template>
  <div class="os-container" @click="onDesktopClick" @contextmenu.prevent="onDesktopContext">
    <!-- Desktop Background -->
    <DesktopBackground />

    <!-- Desktop Icons -->
    <div class="desktop-icons">
      <DesktopIcon
        v-for="icon in desktopIcons"
        :key="icon.id"
        :icon="icon"
        :badge="icon.id === 'recycle' ? recycleBin.items.length : 0"
        @dblclick="openApp(icon)"
        @contextmenu.prevent.stop="onIconContext($event, icon)"
      />
    </div>

    <!-- Windows -->
    <WindowFrame
      v-for="win in windowList"
      :key="win.id"
      :window="win"
      :focused="focusId === win.id"
    >
      <component
        :is="getAppComponent(win.app)"
        :window-id="win.id"
        v-bind="win.props"
        @close="closeWindow(win.id)"
      />
    </WindowFrame>

    <!-- Taskbar -->
    <Taskbar />

    <!-- Start Menu -->
    <StartMenu />

    <!-- Context Menu -->
    <ContextMenu />

    <!-- Notification Center -->
    <NotificationCenter />

    <!-- Toast Layer -->
    <ToastLayer />

    <!-- Lock Screen -->
    <LockScreen />
  </div>
</template>

<script setup>
import { provide, watch } from 'vue'
import { useWindowManager } from './composables/useWindowManager.js'
import { notifStore } from './composables/useNotifications.js'
import { contextMenu } from './composables/useContextMenu.js'
import { uiState } from './composables/uiState.js'
import { displaySettings } from './composables/useDisplaySettings.js'
import { fileSystem } from './composables/useFileSystem.js'
import { recycleBin } from './composables/useRecycleBin.js'
import { togglePinned, isPinned } from './composables/usePinnedTasks.js'
import { setupKeyboardShortcuts } from './composables/useKeyboard.js'
import DesktopBackground from './components/DesktopBackground.vue'
import DesktopIcon from './components/DesktopIcon.vue'
import WindowFrame from './components/WindowFrame.vue'
import Taskbar from './components/Taskbar.vue'
import StartMenu from './components/StartMenu.vue'
import ContextMenu from './components/ContextMenu.vue'
import NotificationCenter from './components/NotificationCenter.vue'
import FileExplorer from './components/FileExplorer.vue'
import Terminal from './components/Terminal.vue'
import Settings from './components/Settings.vue'
import Notepad from './components/Notepad.vue'
import RecycleBin from './components/RecycleBin.vue'
import PlaceholderApp from './components/PlaceholderApp.vue'
import TaskManager from './components/TaskManager.vue'
import ToastLayer from './components/ToastLayer.vue'
import LockScreen from './components/LockScreen.vue'
import Calculator from './components/Calculator.vue'

const {
  windows,
  windowOrder,
  focusId,
  windowList,
  minimizedWindows,
  desktopIcons,
  openWindow,
  closeWindow,
  focusWindow,
  minimizeWindow,
  restoreWindow,
  toggleMinimize,
  maximizeWindow,
  moveWindow,
  resizeWindow,
  getWindow,
} = useWindowManager()

const deselectKey = ref(0)

const appComponents = {
  explorer: FileExplorer,
  terminal: Terminal,
  settings: Settings,
  notepad: Notepad,
  recycle: RecycleBin,
  placeholder: PlaceholderApp,
  taskmgr: TaskManager,
  calc: Calculator,
}

function getAppComponent(app) {
  return appComponents[app] || FileExplorer
}

function openApp(icon) {
  uiState.addRecent({ id: icon.id, label: icon.label, icon: icon.icon, app: icon.app, args: icon.args || {} })
  openWindow(icon.app, {
    title: icon.label,
    icon: icon.icon,
    props: icon.args || {},
  })
}

function onDesktopClick() {
  uiState.closeAll()
  deselectKey.value++
}

function onDesktopContext(e) {
  contextMenu.show(e.clientX, e.clientY, [
    { label: '刷新', icon: '🔄', action: () => notifStore.add('桌面', '桌面已刷新', 'info') },
    { label: '新建文件夹', icon: '📁', action: () => {
      const name = '新建文件夹'
      let finalName = name
      let i = 1
      const items = fileSystem.getChildren('/Users/Yocim/Desktop')
      const existing = new Set(items.map(it => it.name))
      while (existing.has(finalName)) { finalName = `${name} (${i++})` }
      if (fileSystem.createDir('/Users/Yocim/Desktop', finalName)) {
        notifStore.add('桌面', `已创建文件夹 "${finalName}"`, 'success')
      }
    }},
    { label: '新建文本文档', icon: '📝', action: () => {
      let finalName = '新建文本文档.txt'
      let i = 1
      const items = fileSystem.getChildren('/Users/Yocim/Desktop')
      const existing = new Set(items.map(it => it.name))
      while (existing.has(finalName)) { finalName = `新建文本文档 (${i++}).txt` }
      if (fileSystem.createFile('/Users/Yocim/Desktop', finalName, '')) {
        notifStore.add('桌面', `已创建文件 "${finalName}"`, 'success')
      }
    }},
    { type: 'separator' },
    { label: '显示设置', icon: '⚙️', action: () => openWindow('settings', { title: '设置', icon: '⚙️' }) },
    { label: '个性化', icon: '🎨', action: () => notifStore.add('桌面', '个性化设置', 'info') },
    { type: 'separator' },
    { label: '打开终端', icon: '⬛', action: () => openWindow('terminal', { title: '终端', icon: '⬛' }) },
  ])
}

function onIconContext(e, icon) {
  contextMenu.show(e.clientX, e.clientY, [
    { label: `打开 ${icon.label}`, icon: '🖱️', action: () => openApp(icon) },
    { type: 'separator' },
    { label: '以管理员身份运行', icon: '🛡️', action: () => openApp(icon) },
    { label: isPinned(icon.id) ? '从任务栏取消固定' : '固定到任务栏', icon: '📌', action: () => {
      const pinned = togglePinned({ id: icon.id, label: icon.label, icon: icon.icon, app: icon.app, args: icon.args || {} })
      notifStore.add('任务栏', pinned ? `${icon.label} 已固定` : `${icon.label} 已取消固定`, 'success')
    } },
    { type: 'separator' },
    { label: '属性', icon: '📋', action: () => notifStore.add('属性', `${icon.label} 属性`, 'info') },
  ])
}

// Provide window manager globally
const wmProvided = {
  windows, windowOrder, focusId, windowList, minimizedWindows, desktopIcons,
  openWindow, closeWindow, focusWindow, minimizeWindow, restoreWindow,
  toggleMinimize, maximizeWindow, moveWindow, resizeWindow, getWindow,
}
provide('wm', wmProvided)
provide('notif', notifStore)
provide('deselectKey', deselectKey)
setupKeyboardShortcuts(wmProvided)

// Sync display settings to CSS custom properties
function applyDisplaySettings(s) {
  const root = document.documentElement
  root.style.setProperty('--neon-opacity', (s.neonBrightness / 100).toFixed(2))
  root.style.setProperty('--scanline-opacity', (s.scanlines / 100).toFixed(2))
  const accentMap = {
    cyan: { r: 0, g: 240, b: 255 },
    magenta: { r: 255, g: 0, b: 255 },
    green: { r: 57, g: 255, b: 20 },
    orange: { r: 255, g: 107, b: 53 },
  }
  const c = accentMap[s.accent] || accentMap.cyan
  root.style.setProperty('--neon-r', c.r)
  root.style.setProperty('--neon-g', c.g)
  root.style.setProperty('--neon-b', c.b)
}
applyDisplaySettings(displaySettings)
watch(() => ({ ...displaySettings }), applyDisplaySettings, { deep: true })
</script>

<style scoped>
.os-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.desktop-icons {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 2;
}
</style>
