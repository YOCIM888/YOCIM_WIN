<template>
  <Transition name="start">
    <div v-if="ui.startMenuOpen" class="start-menu" @click.self="ui.closeAll">
      <div class="start-panel">
        <!-- Header -->
        <div class="start-header">
          <div class="start-avatar">⬡</div>
          <div class="start-user">
            <div class="start-username">YOCIM</div>
            <div class="start-status">ONLINE</div>
          </div>
        </div>

        <!-- Pinned Apps -->
        <div class="start-section">
          <div class="section-title">已固定</div>
          <div class="start-grid">
            <button
              v-for="app in pinnedApps"
              :key="app.id"
              class="start-app-btn"
              @click="launchApp(app); ui.closeAll()"
            >
              <span class="app-icon">{{ app.icon }}</span>
              <span class="app-label">{{ app.label }}</span>
            </button>
          </div>
        </div>

        <!-- All Apps -->
        <div class="start-section">
          <div class="section-title">所有应用</div>
          <div class="start-list">
            <button
              v-for="app in allApps"
              :key="app.id"
              class="start-list-item"
              @click="launchApp(app); ui.closeAll()"
            >
              <span class="app-icon-sm">{{ app.icon }}</span>
              <span>{{ app.label }}</span>
            </button>
          </div>
        </div>

        <!-- Power -->
        <div class="start-footer">
          <button class="power-btn" @click="ui.closeAll()">
            <span>⏻</span> 关闭菜单
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { inject } from 'vue'
import { uiState } from '../composables/uiState.js'

const wm = inject('wm')
const ui = uiState

const pinnedApps = [
  { id: 'explorer', label: '文件资源管理器', icon: '📁', app: 'explorer', args: { path: '/' } },
  { id: 'terminal', label: '终端', icon: '⬛', app: 'terminal', args: {} },
  { id: 'settings', label: '设置', icon: '⚙️', app: 'settings', args: {} },
  { id: 'notepad', label: '记事本', icon: '📝', app: 'notepad', args: {} },
  { id: 'recycle', label: '回收站', icon: '🗑️', app: 'recycle', args: {} },
  { id: 'computer', label: '这台电脑', icon: '🖥️', app: 'explorer', args: { path: '/' } },
]

const allApps = [
  { id: 'taskmgr', label: '任务管理器', icon: '📊', app: 'settings', args: {} },
  { id: 'cmd', label: '命令提示符', icon: '▷', app: 'terminal', args: {} },
  { id: 'paint', label: '画图', icon: '🎨', app: 'notepad', args: {} },
  { id: 'calc', label: '计算器', icon: '🔢', app: 'notepad', args: {} },
  { id: 'network', label: '网络中心', icon: '🌐', app: 'settings', args: {} },
]

function launchApp(app) {
  wm.openWindow(app.app, {
    title: app.label,
    icon: app.icon,
    props: app.args || {},
  })
}
</script>

<style scoped>
.start-menu {
  position: absolute;
  bottom: 48px;
  left: 0;
  z-index: 99;
}
.start-panel {
  width: 320px;
  max-height: 560px;
  background: var(--bg-panel);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  margin: 0 0 8px 8px;
  box-shadow: 0 0 30px rgba(0, 240, 255, 0.2), 0 10px 40px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(20px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.start-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(179, 71, 234, 0.1));
  border-bottom: 1px solid var(--border-glow);
}
.start-avatar {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: rgba(0, 240, 255, 0.15);
  border: 2px solid var(--neon-cyan);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.3);
}
.start-username {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--neon-cyan);
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
}
.start-status {
  font-size: 10px;
  color: var(--neon-green);
  text-shadow: 0 0 6px rgba(57, 255, 20, 0.4);
}

.start-section {
  padding: 8px 0;
}
.section-title {
  font-size: 10px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 2px;
  padding: 4px 16px;
  font-weight: 600;
}
.start-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  padding: 0 8px;
}
.start-app-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 4px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  font-family: var(--font-mono);
  font-size: 10px;
}
.start-app-btn:hover {
  background: rgba(0, 240, 255, 0.1);
  border-color: rgba(0, 240, 255, 0.3);
  color: var(--neon-cyan);
}
.app-icon { font-size: 28px; }
.app-label { text-align: center; }

.start-list {
  display: flex;
  flex-direction: column;
  padding: 0 8px;
}
.start-list-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 12px;
  transition: all 0.15s;
}
.start-list-item:hover {
  background: rgba(0, 240, 255, 0.08);
  color: var(--text-bright);
}
.app-icon-sm { font-size: 18px; }

.start-footer {
  border-top: 1px solid var(--border-glow);
  padding: 8px;
}
.power-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid var(--border-glow);
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 12px;
  letter-spacing: 1px;
  transition: all 0.2s;
}
.power-btn:hover {
  background: rgba(255, 50, 80, 0.15);
  border-color: rgba(255, 50, 80, 0.4);
  color: #ff4466;
  box-shadow: 0 0 15px rgba(255, 50, 80, 0.2);
}

/* Transition */
.start-enter-active { transition: all 0.2s ease-out; }
.start-leave-active { transition: all 0.15s ease-in; }
.start-enter-from { opacity: 0; transform: translateY(10px) scale(0.95); }
.start-leave-to { opacity: 0; transform: translateY(10px) scale(0.95); }
</style>
