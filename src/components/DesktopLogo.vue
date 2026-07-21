<template>
  <div class="desktop-logo">
    <div class="logo-text">YOCIM<span class="logo-accent">OS</span></div>
    <div class="logo-sub">CYBER EDITION</div>
  </div>
</template>

<style scoped>
.desktop-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  z-index: 1;
  opacity: 0.35;
}
.logo-text {
  font-family: var(--font-display);
  font-size: 64px;
  font-weight: 900;
  letter-spacing: 6px;
  color: var(--neon-cyan);
  text-shadow: 0 0 40px rgba(0, 240, 255, 0.4), 0 0 80px rgba(0, 240, 255, 0.15);
}
.logo-accent {
  color: var(--neon-magenta);
  text-shadow: 0 0 40px rgba(255, 0, 255, 0.4);
}
.logo-sub {
  font-family: var(--font-display);
  font-size: 14px;
  letter-spacing: 8px;
  color: var(--text-dim);
  margin-top: 4px;
}
</style>
