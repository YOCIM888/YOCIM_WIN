<template>
  <div class="settings-app">
    <div class="settings-sidebar">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="settings-tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>
    <div class="settings-content">
      <!-- System -->
      <div v-if="activeTab === 'system'" class="settings-page">
        <h3>系统信息</h3>
        <div class="info-grid">
          <div class="info-item" v-for="info in sysInfo" :key="info.label">
            <span class="info-label">{{ info.label }}</span>
            <span class="info-value">{{ info.value }}</span>
          </div>
        </div>
      </div>

      <!-- Display -->
      <div v-if="activeTab === 'display'" class="settings-page">
        <h3>显示设置</h3>
        <div class="setting-group">
          <label class="setting-row">
            <span>霓虹亮度</span>
            <input type="range" min="30" max="100" v-model.number="display.neonBrightness" />
            <span class="setting-val">{{ display.neonBrightness }}%</span>
          </label>
          <label class="setting-row">
            <span>扫描线强度</span>
            <input type="range" min="0" max="100" v-model.number="display.scanlines" />
            <span class="setting-val">{{ display.scanlines }}%</span>
          </label>
          <label class="setting-row">
            <span>主题色</span>
            <select v-model="display.accent">
              <option value="cyan">赛博青</option>
              <option value="magenta">霓虹紫</option>
              <option value="green">终端绿</option>
              <option value="orange">火焰橙</option>
            </select>
          </label>
        </div>
      </div>

      <!-- Network -->
      <div v-if="activeTab === 'network'" class="settings-page">
        <h3>网络状态</h3>
        <div class="network-status">
          <div class="net-indicator">
            <span class="net-dot online"></span>
            <span>已连接</span>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">SSID</span>
              <span class="info-value">NEON_CITY_NET</span>
            </div>
            <div class="info-item">
              <span class="info-label">IP 地址</span>
              <span class="info-value">192.168.1.{{ Math.floor(Math.random() * 255) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">延迟</span>
              <span class="info-value neon-text-green">3ms</span>
            </div>
            <div class="info-item">
              <span class="info-label">加密</span>
              <span class="info-value neon-text-cyan">AES-256</span>
            </div>
          </div>
        </div>
      </div>

      <!-- About -->
      <div v-if="activeTab === 'about'" class="settings-page">
        <h3>关于</h3>
        <div class="about-section">
          <div class="about-logo">⬡</div>
          <h2 class="neon-text-cyan">YOCIM_STAT_WIN</h2>
          <p>赛博朋克风格 Windows 模拟器</p>
          <p class="version">版本 1.0.0 (NEON Edition)</p>
          <p class="copyright">© 2025 Yocim. All rights reserved.</p>
          <div class="tech-stack">
            <span>Vue 3</span>
            <span>Vite</span>
            <span>Cyberpunk</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { displaySettings } from '../composables/useDisplaySettings.js'

defineProps({ windowId: String })

const activeTab = ref('system')

const tabs = [
  { id: 'system', label: '系统', icon: '🖥️' },
  { id: 'display', label: '显示', icon: '🎨' },
  { id: 'network', label: '网络', icon: '🌐' },
  { id: 'about', label: '关于', icon: 'ℹ️' },
]

const sysInfo = [
  { label: '操作系统', value: 'YOCIM_STAT_WIN Cyber Edition' },
  { label: '内核版本', value: 'NEON-9.0.1-cyber' },
  { label: 'CPU', value: 'CyberCore i9 @ 5.2GHz' },
  { label: 'RAM', value: '32 GB DDR5' },
  { label: 'GPU', value: 'NeonV FX 4090' },
  { label: '运行时间', value: `${Math.floor(Math.random() * 24)}小时 ${Math.floor(Math.random() * 60)}分钟` },
  { label: '终端', value: 'cyber-term v3.0' },
  { label: '桌面环境', value: 'NEON Desktop' },
]

const display = displaySettings
</script>

<style scoped>
.settings-app {
  display: flex;
  height: 100%;
}
.settings-sidebar {
  width: 160px;
  border-right: 1px solid var(--border-glow);
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 2px;
  flex-shrink: 0;
}
.settings-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 12px;
  transition: all 0.15s;
}
.settings-tab:hover {
  background: rgba(0,240,255,0.06);
  color: var(--text-bright);
}
.settings-tab.active {
  background: rgba(0,240,255,0.12);
  border-color: rgba(0,240,255,0.3);
  color: var(--neon-cyan);
  box-shadow: 0 0 8px rgba(0,240,255,0.1);
}
.tab-icon { font-size: 16px; }
.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
.settings-page h3 {
  font-family: var(--font-display);
  font-size: 18px;
  color: var(--neon-cyan);
  text-shadow: 0 0 10px rgba(0,240,255,0.3);
  margin-bottom: 16px;
  letter-spacing: 1px;
}
.info-grid {
  display: grid;
  gap: 4px;
}
.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  border: 1px solid rgba(0,240,255,0.1);
  border-radius: 4px;
}
.info-label { color: var(--text-dim); font-size: 12px; }
.info-value { color: var(--text-bright); font-size: 12px; font-weight: 500; }
.setting-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.setting-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--text-secondary);
}
.setting-row input[type="range"] {
  flex: 1;
  accent-color: var(--neon-cyan);
}
.setting-row select {
  background: var(--bg-panel2);
  border: 1px solid var(--border-glow);
  color: var(--text-primary);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: var(--font-mono);
}
.setting-val { color: var(--neon-cyan); min-width: 40px; }
.network-status { display: flex; flex-direction: column; gap: 12px; }
.net-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--neon-green);
}
.net-dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--neon-green);
  box-shadow: 0 0 8px var(--neon-green);
  animation: neonPulse 2s infinite;
}
.net-dot.online { background: var(--neon-green); box-shadow: 0 0 8px var(--neon-green); }
.about-section {
  text-align: center;
  padding: 20px;
}
.about-logo { font-size: 64px; margin-bottom: 12px; }
.about-section h2 {
  font-family: var(--font-display);
  font-size: 24px;
  letter-spacing: 2px;
  margin-bottom: 8px;
}
.about-section p {
  color: var(--text-secondary);
  margin: 4px 0;
  font-size: 12px;
}
.version { color: var(--neon-cyan) !important; }
.copyright { color: var(--text-dim) !important; font-size: 10px !important; margin-top: 16px !important; }
.tech-stack {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}
.tech-stack span {
  padding: 2px 10px;
  border: 1px solid var(--border-glow);
  border-radius: 12px;
  font-size: 10px;
  color: var(--text-dim);
}
</style>
