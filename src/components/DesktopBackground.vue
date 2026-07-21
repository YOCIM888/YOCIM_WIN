<template>
  <div class="desktop-bg">
    <canvas ref="canvas" class="bg-canvas"></canvas>
    <div class="bg-overlay"></div>
    <div class="scanlines"></div>
    <div class="bg-grid"></div>
    <div class="bg-vignette"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref(null)
let ctx, animId

function draw() {
  if (!ctx) return
  const w = canvas.value.width = window.innerWidth
  const h = canvas.value.height = window.innerHeight

  ctx.clearRect(0, 0, w, h)

  // Draw glowing particles
  const t = Date.now() / 1000
  for (let i = 0; i < 40; i++) {
    const x = (Math.sin(t * 0.3 + i * 1.7) * 0.5 + 0.5) * w
    const y = (Math.cos(t * 0.25 + i * 1.3) * 0.5 + 0.5) * h
    const r = Math.max(0.1, 1 + Math.sin(t + i) * 1.5)
    const alpha = 0.2 + Math.sin(t * 2 + i) * 0.2
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    const hue = (i * 20 + t * 30) % 360
    ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${alpha})`
    ctx.fill()
  }

  // Draw connection lines
  for (let i = 0; i < 40; i++) {
    const x1 = (Math.sin(t * 0.3 + i * 1.7) * 0.5 + 0.5) * w
    const y1 = (Math.cos(t * 0.25 + i * 1.3) * 0.5 + 0.5) * h
    const j = (i + 5) % 40
    const x2 = (Math.sin(t * 0.3 + j * 1.7) * 0.5 + 0.5) * w
    const y2 = (Math.cos(t * 0.25 + j * 1.3) * 0.5 + 0.5) * h
    const dist = Math.hypot(x2 - x1, y2 - y1)
    if (dist < 300) {
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = `rgba(0, 240, 255, ${0.04 * (1 - dist / 300)})`
      ctx.stroke()
    }
  }

  animId = requestAnimationFrame(draw)
}

onMounted(() => {
  ctx = canvas.value.getContext('2d')
  draw()
  window.addEventListener('resize', draw)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('resize', draw)
})
</script>

<style scoped>
.desktop-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}
.bg-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.bg-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(5, 0, 20, 0.6) 70%, rgba(2, 0, 10, 0.9) 100%);
}
.scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.15) 2px,
    rgba(0, 0, 0, 0.15) 4px
  );
  opacity: var(--scanline-opacity, 0.4);
  pointer-events: none;
}
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px);
  background-size: 60px 60px;
  opacity: var(--neon-opacity, 0.8);
  pointer-events: none;
}
.bg-vignette {
  position: absolute;
  inset: 0;
  box-shadow: inset 0 0 150px rgba(0, 240, 255, 0.05), inset 0 0 50px rgba(0, 0, 0, 0.5);
  pointer-events: none;
}
</style>
