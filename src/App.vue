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
  </div>
</template>

<script setup>
import { provide } from 'vue'
import { useWindowManager } from './composables/useWindowManager.js'
import { notifStore } from './composables/useNotifications.js'
import { contextMenu } from './composables/useContextMenu.js'
import { uiState } from './composables/uiState.js'
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

const appComponents = {
  explorer: FileExplorer,
  terminal: Terminal,
  settings: Settings,
  notepad: Notepad,
  recycle: RecycleBin,
}

function getAppComponent(app) {
  return appComponents[app] || FileExplorer
}

function openApp(icon) {
  openWindow(icon.app, {
    title: icon.label,
    icon: icon.icon,
    props: icon.args || {},
  })
}

function onDesktopClick() {
  uiState.closeAll()
}

function onDesktopContext(e) {
  contextMenu.show(e.clientX, e.clientY, [
    { label: '刷新', icon: '🔄', action: () => notifStore.add('桌面', '桌面已刷新', 'info') },
    { label: '新建文件夹', icon: '📁', action: () => notifStore.add('桌面', '新建文件夹功能', 'info') },
    { label: '新建文本文档', icon: '📝', action: () => notifStore.add('桌面', '新建文本文档功能', 'info') },
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
    { label: '固定到任务栏', icon: '📌', action: () => notifStore.add('桌面', `${icon.label} 已固定到任务栏`, 'success') },
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
setupKeyboardShortcuts(wmProvided)
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
