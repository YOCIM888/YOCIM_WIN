<template>
  <div class="os-container" @click="onDesktopClick" @contextmenu.prevent="onDesktopContext">
    <!-- Desktop Background -->
    <DesktopBackground />

    <!-- Desktop Logo -->
    <DesktopLogo />

    <!-- Desktop Icons -->
    <div class="desktop-icons" :key="desktopRefreshKey">
      <DesktopIcon
        v-for="icon in allDesktopIcons"
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

    <!-- Cyber Dialog -->
    <CyberDialog ref="cyberDialogRef" />

    <!-- Activity Bubble -->
    <ActivityBubble :visible="uiState.bubbleOpen" @close="uiState.bubbleOpen = false" />
  </div>
</template>

<script setup>
import { ref, provide, watch, computed, onMounted } from 'vue'
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
import ActivityBubble from './components/ActivityBubble.vue'
import DesktopLogo from './components/DesktopLogo.vue'
import CyberDialog from './components/CyberDialog.vue'
import { setDialogRef } from './composables/useDialog.js'
import { showConfirm, showPrompt } from './composables/useDialog.js'

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
const desktopRefreshKey = ref(0)
const cyberDialogRef = ref(null)

// set dialog ref after mount for global access
onMounted(() => { setDialogRef(cyberDialogRef.value) })

// Combine system icons with files from Desktop directory
const allDesktopIcons = computed(() => {
  void desktopRefreshKey.value
  const desktopFiles = fileSystem.getChildren('/Users/Yocim/Desktop')
  const dynamicIcons = desktopFiles.map(f => ({
    id: 'desktop-' + f.key,
    label: f.name,
    icon: f.type === 'dir' ? '📁' : '📄',
    app: f.type === 'dir' ? 'explorer' : 'notepad',
    args: f.type === 'dir'
      ? { path: '/Users/Yocim/Desktop/' + f.key }
      : { filename: f.name, filePath: '/Users/Yocim/Desktop/' + f.key, content: f.content || '' },
  }))
  return [...desktopIcons, ...dynamicIcons]
})

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
    { label: '刷新', icon: '🔄', action: () => { desktopRefreshKey.value++; notifStore.add('桌面', '桌面已刷新', 'info') } },
    { label: '新建文件夹', icon: '📁', action: () => {
      const name = '新建文件夹'
      let finalName = name, i = 1
      const items = fileSystem.getChildren('/Users/Yocim/Desktop')
      const existing = new Set(items.map(it => it.name))
      while (existing.has(finalName)) { finalName = `${name} (${i++})` }
      if (fileSystem.createDir('/Users/Yocim/Desktop', finalName)) {
        notifStore.add('桌面', `已创建文件夹 "${finalName}"`, 'success')
        desktopRefreshKey.value++
      } else {
        notifStore.add('桌面', '创建文件夹失败', 'error')
      }
    }},
    { label: '新建文本文档', icon: '📝', action: () => {
      let finalName = '新建文本文档.txt', i = 1
      const items = fileSystem.getChildren('/Users/Yocim/Desktop')
      const existing = new Set(items.map(it => it.name))
      while (existing.has(finalName)) { finalName = `新建文本文档 (${i++}).txt` }
      if (fileSystem.createFile('/Users/Yocim/Desktop', finalName, '')) {
        notifStore.add('桌面', `已创建文件 "${finalName}"`, 'success')
        desktopRefreshKey.value++
      } else {
        notifStore.add('桌面', '创建文件失败', 'error')
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
  const isDynamic = icon.id && icon.id.startsWith('desktop-')
  const menuItems = [
    { label: `打开 ${icon.label}`, icon: '🖱️', action: () => openApp(icon) },
    { type: 'separator' },
  ]
  if (isDynamic) {
    const fp = icon.args?.filePath || icon.args?.path
    menuItems.push(
      { label: '删除', icon: '🗑️', action: () => {
        if (fp && recycleBin.add(fp)) {
          notifStore.add('桌面', `"${icon.label}" 已移至回收站`, 'warning')
          desktopRefreshKey.value++
        }
      }},
      { label: '重命名', icon: '✏️', action: async () => {
        const newName = await showPrompt('输入新名称:', '重命名', icon.label)
        if (newName && newName !== icon.label && fp && fileSystem.renameItem(fp, newName)) {
          notifStore.add('桌面', `已重命名为 "${newName}"`, 'success')
          desktopRefreshKey.value++
        }
      }},
    )
  }
  menuItems.push(
    { label: '以管理员身份运行', icon: '🛡️', action: () => openApp(icon) },
    { label: isPinned(icon.id) ? '从任务栏取消固定' : '固定到任务栏', icon: '📌', action: () => {
      const pinned = togglePinned({ id: icon.id, label: icon.label, icon: icon.icon, app: icon.app, args: icon.args || {} })
      notifStore.add('任务栏', pinned ? `${icon.label} 已固定` : `${icon.label} 已取消固定`, 'success')
    } },
    { type: 'separator' },
    { label: '属性', icon: '📋', action: () => showPropertyDialog(icon) },
  )
  contextMenu.show(e.clientX, e.clientY, menuItems)
}

function showPropertyDialog(icon) {
  const fp = icon.args?.filePath || icon.args?.path
  let info = `名称: ${icon.label}\n类型: ${icon.id?.startsWith('desktop-') ? (icon.args?.path ? '文件夹' : '文件') : '系统图标'}`
  if (fp) {
    const node = fileSystem.resolvePath(fp)
    if (node) {
      info += `\n路径: ${fp}`
      info += `\n类型: ${node.type === 'dir' ? '文件夹' : '文件'}`
      if (node.type === 'file') {
        info += `\n大小: ${((node.content || '').length)} 字节`
      }
    }
  }
  // Open a notepad-like window with property info
  openWindow('notepad', { title: `${icon.label} 属性`, icon: '📋', props: { filename: icon.label, content: info } })
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
    cyan: '#00f0ff',
    magenta: '#ff00ff',
    green: '#39ff14',
    orange: '#ff6b35',
  }
  const color = accentMap[s.accent] || accentMap.cyan
  // Override primary accent color — affects borders, glows, highlights
  root.style.setProperty('--neon-cyan', color)
  root.style.setProperty('--neon-blue', color)
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
