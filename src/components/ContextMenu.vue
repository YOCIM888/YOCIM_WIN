<template>
  <Transition name="ctx">
    <div
      v-if="ctx.visible"
      class="context-menu"
      :style="{ left: ctx.x + 'px', top: ctx.y + 'px' }"
      @click.stop
    >
      <template v-for="(item, i) in ctx.items" :key="i">
        <div v-if="item.type === 'separator'" class="ctx-separator"></div>
        <button
          v-else
          class="ctx-item"
          :class="{ disabled: item.disabled }"
          @click="onClick(item)"
        >
          <span class="ctx-icon">{{ item.icon || '•' }}</span>
          <span class="ctx-label">{{ item.label }}</span>
          <span v-if="item.shortcut" class="ctx-shortcut">{{ item.shortcut }}</span>
        </button>
      </template>
    </div>
  </Transition>
</template>

<script setup>
import { contextMenu } from '../composables/useContextMenu.js'

const ctx = contextMenu

function onClick(item) {
  if (item.disabled) return
  item.action?.()
  ctx.close()
}
</script>

<style scoped>
.context-menu {
  position: fixed;
  min-width: 200px;
  background: var(--bg-panel);
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  padding: 4px;
  z-index: 200;
  box-shadow: 0 0 25px rgba(0, 240, 255, 0.2), 0 8px 30px rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(20px);
}
.ctx-separator {
  height: 1px;
  background: var(--border-glow);
  margin: 4px 8px;
}
.ctx-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 7px 12px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 12px;
  transition: all 0.1s;
}
.ctx-item:hover {
  background: rgba(0, 240, 255, 0.12);
  color: var(--text-bright);
}
.ctx-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.ctx-icon { font-size: 15px; flex-shrink: 0; width: 20px; text-align: center; }
.ctx-label { flex: 1; text-align: left; }
.ctx-shortcut { font-size: 10px; color: var(--text-dim); }

.ctx-enter-active { transition: all 0.12s ease-out; }
.ctx-leave-active { transition: all 0.1s ease-in; }
.ctx-enter-from { opacity: 0; transform: scale(0.95); }
.ctx-leave-to { opacity: 0; transform: scale(0.95); }
</style>
