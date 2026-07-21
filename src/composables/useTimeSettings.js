import { reactive } from 'vue'

const saved = (() => {
  try { return JSON.parse(localStorage.getItem('yocim_time') || 'null') }
  catch { return null }
})()

export const timeSettings = reactive({
  timezone: saved?.timezone ?? 8, // UTC+8
  autoSync: saved?.autoSync ?? true,
  customOffset: saved?.customOffset ?? 0, // ms offset when autoSync is off
})

// persist
import { watch } from 'vue'
watch(() => ({ ...timeSettings }), (v) => {
  localStorage.setItem('yocim_time', JSON.stringify(v))
}, { deep: true })
