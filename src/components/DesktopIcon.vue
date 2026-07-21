<template>
  <div
    class="desktop-icon"
    :class="{ selected, dragging }"
    :style="dragStyle"
    @mousedown="startDrag"
    @dblclick="$emit('dblclick')"
  >
    <div class="icon-image">{{ icon.icon }}<span v-if="badge" class="icon-badge">{{ badge }}</span></div>
    <div class="icon-label">{{ icon.label }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  icon: Object,
  badge: { type: Number, default: 0 },
})
defineEmits(['dblclick'])

const selected = ref(false)
const dragging = ref(false)
const offsetX = ref(0)
const offsetY = ref(0)
let startX = 0, startY = 0

const dragStyle = ref({})

function startDrag(e) {
  if (e.button !== 0) return
  startX = e.clientX
  startY = e.clientY
  const onMove = (ev) => {
    const dx = ev.clientX - startX
    const dy = ev.clientY - startY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragging.value = true
      selected.value = true
    }
    if (dragging.value) {
      offsetX.value = dx
      offsetY.value = dy
      dragStyle.value = { transform: `translate(${dx}px, ${dy}px)`, zIndex: 10 }
    }
  }
  const onUp = () => {
    if (dragging.value) {
      dragStyle.value = { transform: `translate(${offsetX.value}px, ${offsetY.value}px)` }
    }
    dragging.value = false
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}
</script>

<style scoped>
.desktop-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  min-width: 72px;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
  border: 1px solid transparent;
}
.desktop-icon.dragging {
  opacity: 0.85;
  transition: none;
}
.desktop-icon:hover { background: rgba(0, 240, 255, 0.08); border-color: rgba(0, 240, 255, 0.2); }
.desktop-icon.selected { background: rgba(0, 240, 255, 0.15); border-color: rgba(0, 240, 255, 0.4); box-shadow: 0 0 10px rgba(0, 240, 255, 0.2); }
.icon-image {
  font-size: 36px;
  position: relative;
  filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.4));
  transition: filter 0.2s;
}
.icon-badge {
  position: absolute;
  top: -4px; right: -8px;
  min-width: 16px; height: 16px;
  background: var(--neon-magenta);
  color: #fff;
  font-size: 10px; font-weight: 700;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  padding: 0 4px;
  box-shadow: 0 0 8px rgba(255,0,255,0.5);
}
.desktop-icon:hover .icon-image { filter: drop-shadow(0 0 15px rgba(0, 240, 255, 0.7)); }
.icon-label {
  font-size: 11px;
  color: var(--text-primary);
  text-align: center;
  word-break: break-word;
  text-shadow: 0 0 6px rgba(0, 240, 255, 0.3);
  line-height: 1.2;
  max-width: 72px;
}
</style>
