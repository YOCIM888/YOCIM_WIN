import { reactive, watch } from 'vue'

const saved = (() => {
  try { return JSON.parse(localStorage.getItem('yocim_display') || 'null') }
  catch { return null }
})()

export const displaySettings = reactive({
  neonBrightness: saved?.neonBrightness ?? 80,
  scanlines: saved?.scanlines ?? 40,
  accent: saved?.accent ?? 'cyan',
  wallpaper: saved?.wallpaper ?? 'particles',
})

watch(() => ({ ...displaySettings }), (v) => {
  localStorage.setItem('yocim_display', JSON.stringify(v))
}, { deep: true })
