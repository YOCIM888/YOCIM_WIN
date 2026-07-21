<template>
  <Transition name="win">
    <div
      v-if="!window.minimized"
      class="window-frame"
      :class="{ focused, maximized: window.maximized }"
      :style="windowStyle"
      @mousedown="focusWindow(window.id)"
    >
    <!-- Title Bar -->
    <div class="titlebar" @mousedown="startDrag" @dblclick="wm.maximizeWindow(window.id)" @contextmenu.prevent.stop="onTitlebarContext">
      <div class="titlebar-left">
        <span class="titlebar-icon">{{ window.icon }}</span>
        <span class="titlebar-title">{{ window.title }}</span>
      </div>
      <div class="titlebar-controls">
        <button class="ctrl-btn ctrl-min" @click.stop="wm.minimizeWindow(window.id)" title="最小化">─</button>
        <button class="ctrl-btn ctrl-max" @click.stop="wm.maximizeWindow(window.id)" :title="window.maximized ? '还原' : '最大化'">
          {{ window.maximized ? '❐' : '□' }}
        </button>
        <button class="ctrl-btn ctrl-close" @click.stop="wm.closeWindow(window.id)" title="关闭">✕</button>
      </div>
    </div>

    <!-- Body -->
    <div class="window-body">
      <slot />
    </div>

    <!-- Resize Handles -->
    <template v-if="!window.maximized && window.resizable">
      <div class="resize-handle n" @mousedown.stop="startResize($event, 'n')"></div>
      <div class="resize-handle s" @mousedown.stop="startResize($event, 's')"></div>
      <div class="resize-handle e" @mousedown.stop="startResize($event, 'e')"></div>
      <div class="resize-handle w" @mousedown.stop="startResize($event, 'w')"></div>
      <div class="resize-handle ne" @mousedown.stop="startResize($event, 'ne')"></div>
      <div class="resize-handle nw" @mousedown.stop="startResize($event, 'nw')"></div>
      <div class="resize-handle se" @mousedown.stop="startResize($event, 'se')"></div>
      <div class="resize-handle sw" @mousedown.stop="startResize($event, 'sw')"></div>
    </template>
  </div>
  </Transition>
</template>

<script setup>
import { computed, inject } from 'vue'
import { contextMenu } from '../composables/useContextMenu.js'

const props = defineProps({
  window: Object,
  focused: Boolean,
})

const wm = inject('wm')

function onTitlebarContext(e) {
  const win = props.window
  contextMenu.show(e.clientX, e.clientY, [
    { label: '还原', icon: '🪟', action: () => wm.maximizeWindow(win.id), disabled: !win.maximized },
    { label: '移动', icon: '↕', action: () => {}, disabled: true },
    { label: '最小化', icon: '─', action: () => wm.minimizeWindow(win.id), disabled: win.minimized },
    { label: '最大化', icon: '□', action: () => wm.maximizeWindow(win.id), disabled: win.maximized },
    { type: 'separator' },
    { label: '关闭', icon: '✕', action: () => wm.closeWindow(win.id) },
  ])
}

const windowStyle = computed(() => ({
  left: `${props.window.x}px`,
  top: `${props.window.y}px`,
  width: `${props.window.width}px`,
  height: `${props.window.height}px`,
  zIndex: props.window.zIndex,
}))

let dragging = false
let resizing = false
let resizeEdge = ''
let startX, startY

function startDrag(e) {
  if (e.target.closest('.ctrl-btn')) return
  if (props.window.maximized) return
  dragging = true
  startX = e.clientX
  startY = e.clientY

  const onMove = (ev) => {
    if (!dragging) return
    wm.moveWindow(props.window.id, ev.clientX - startX, ev.clientY - startY)
    startX = ev.clientX
    startY = ev.clientY
  }
  const onUp = () => {
    dragging = false
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
    // Aero Snap
    const win = props.window
    if (!win || win.maximized) return
    const threshold = 30
    const sw = window.innerWidth
    const sh = window.innerHeight - 48
    // Top edge → maximize
    if (win.y < threshold) {
      wm.maximizeWindow(win.id)
      return
    }
    // Left edge → left half
    if (win.x < threshold) {
      win.x = 0; win.y = 0; win.width = sw / 2; win.height = sh
      return
    }
    // Right edge → right half
    if (win.x + win.width > sw - threshold) {
      win.x = sw / 2; win.y = 0; win.width = sw / 2; win.height = sh
      return
    }
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

function startResize(e, edge) {
  resizing = true
  resizeEdge = edge
  startX = e.clientX
  startY = e.clientY

  const onMove = (ev) => {
    if (!resizing) return
    wm.resizeWindow(props.window.id, resizeEdge, ev.clientX - startX, ev.clientY - startY)
    startX = ev.clientX
    startY = ev.clientY
  }
  const onUp = () => {
    resizing = false
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

function focusWindow(id) {
  wm.focusWindow(id)
}
</script>

<style scoped>
.window-frame {
  position: absolute;
  background: var(--bg-window);
  border: 1px solid var(--border-glow);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.15), 0 8px 32px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  animation: windowOpen 0.2s ease-out;
}
.window-frame::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(0, 240, 255, 0.008) 3px,
    rgba(0, 240, 255, 0.008) 6px
  );
  pointer-events: none;
  z-index: 1000;
  border-radius: inherit;
}
.window-frame.focused {
  border-color: var(--border-strong);
  box-shadow: 0 0 25px rgba(0, 240, 255, 0.25), 0 0 60px rgba(0, 240, 255, 0.08), 0 8px 32px rgba(0, 0, 0, 0.6);
}
.window-frame.focused::before {
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(0, 240, 255, 0.015) 3px,
    rgba(0, 240, 255, 0.015) 6px
  );
}
.window-frame.maximized {
  border-radius: 0;
  border-color: var(--border-glow);
}
@keyframes windowOpen {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
/* Minimize/close transitions */
.win-enter-active { animation: windowOpen 0.2s ease-out; }
.win-leave-active { animation: windowClose 0.18s ease-in; }
@keyframes windowClose {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0.9); opacity: 0; }
}

.titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  background: var(--bg-titlebar);
  border-bottom: 1px solid var(--border-glow);
  padding: 0 8px;
  cursor: default;
  flex-shrink: 0;
}
.titlebar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.titlebar-icon {
  font-size: 16px;
}
.titlebar-title {
  font-size: 12px;
  font-family: var(--font-display);
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 1px;
}
.titlebar-controls {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}
.ctrl-btn {
  width: 30px;
  height: 24px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.15s;
  font-family: var(--font-mono);
}
.ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-bright);
}
.ctrl-close:hover {
  background: rgba(255, 50, 80, 0.4);
  color: #ff4466;
  border-color: rgba(255, 50, 80, 0.6);
  box-shadow: 0 0 10px rgba(255, 50, 80, 0.4);
}

.window-body {
  flex: 1;
  overflow: auto;
  position: relative;
}

/* Resize handles */
.resize-handle {
  position: absolute;
  z-index: 10;
}
.resize-handle.n, .resize-handle.s {
  left: 8px;
  right: 8px;
  height: 6px;
  cursor: ns-resize;
}
.resize-handle.n { top: 0; }
.resize-handle.s { bottom: 0; }
.resize-handle.e, .resize-handle.w {
  top: 8px;
  bottom: 8px;
  width: 6px;
  cursor: ew-resize;
}
.resize-handle.e { right: 0; }
.resize-handle.w { left: 0; }
.resize-handle.ne, .resize-handle.nw, .resize-handle.se, .resize-handle.sw {
  width: 12px;
  height: 12px;
}
.resize-handle.ne { top: 0; right: 0; cursor: nesw-resize; }
.resize-handle.nw { top: 0; left: 0; cursor: nwse-resize; }
.resize-handle.se { bottom: 0; right: 0; cursor: nwse-resize; }
.resize-handle.sw { bottom: 0; left: 0; cursor: nesw-resize; }
</style>
