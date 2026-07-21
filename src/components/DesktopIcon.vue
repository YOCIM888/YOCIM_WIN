<template>
  <div
    class="desktop-icon"
    :class="{ selected }"
    @click="selected = !selected"
    @dblclick="$emit('dblclick')"
  >
    <div class="icon-image">{{ icon.icon }}</div>
    <div class="icon-label">{{ icon.label }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  icon: Object
})
defineEmits(['dblclick'])

const selected = ref(false)
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
  transition: all 0.15s;
  border: 1px solid transparent;
}
.desktop-icon:hover {
  background: rgba(0, 240, 255, 0.08);
  border-color: rgba(0, 240, 255, 0.2);
}
.desktop-icon.selected {
  background: rgba(0, 240, 255, 0.15);
  border-color: rgba(0, 240, 255, 0.4);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
}
.icon-image {
  font-size: 36px;
  filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.4));
  transition: filter 0.2s;
}
.desktop-icon:hover .icon-image {
  filter: drop-shadow(0 0 15px rgba(0, 240, 255, 0.7));
}
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
