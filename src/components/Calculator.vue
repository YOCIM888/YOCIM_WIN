<template>
  <div class="calc-app">
    <div class="calc-display">
      <div class="calc-expr">{{ expression || '&nbsp;' }}</div>
      <div class="calc-result neon-text-cyan">{{ result }}</div>
    </div>
    <div class="calc-grid">
      <button v-for="btn in buttons" :key="btn" class="calc-btn"
        :class="btn === '=' ? 'eq' : ''"
        @click="press(btn)">{{ btn }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({ windowId: String })

const expression = ref('')
const result = ref('0')

const buttons = [
  'C','⌫','%','÷',
  '7','8','9','×',
  '4','5','6','-',
  '1','2','3','+',
  '0','.','=',
]

function press(btn) {
  if (btn === 'C') { expression.value = ''; result.value = '0'; return }
  if (btn === '⌫') { expression.value = expression.value.slice(0, -1); evaluate(); return }
  if (btn === '=') { evaluate(); expression.value = result.value; return }
  expression.value += btn
  evaluate()
}

function evaluate() {
  try {
    let expr = expression.value
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/%/g, '/100')
    if (!expr) { result.value = '0'; return }
    // safe eval: only allow digits, operators, dots
    if (/^[\d+\-*/.() ]+$/.test(expr)) {
      const val = Function('"use strict"; return (' + expr + ')')()
      if (isFinite(val)) {
        result.value = String(Math.round(val * 1e10) / 1e10)
      } else {
        result.value = '错误'
      }
    }
  } catch {
    // don't update result on partial input
  }
}
</script>

<style scoped>
.calc-app {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
  gap: 12px;
}
.calc-display {
  background: rgba(0,0,0,0.4);
  border: 1px solid var(--border-glow);
  border-radius: 8px;
  padding: 12px 16px;
  text-align: right;
  min-height: 72px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.calc-expr {
  font-size: 16px;
  color: var(--text-dim);
  min-height: 24px;
  word-break: break-all;
}
.calc-result {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 1px;
}
.calc-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  flex: 1;
}
.calc-btn {
  font-family: var(--font-display);
  font-size: 18px;
  border: 1px solid var(--border-glow);
  border-radius: 8px;
  background: rgba(0,240,255,0.04);
  color: var(--text-bright);
  cursor: pointer;
  transition: all 0.12s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.calc-btn:hover { background: rgba(0,240,255,0.15); border-color: var(--neon-cyan); }
.calc-btn:active { background: rgba(0,240,255,0.25); transform: scale(0.96); }
.calc-btn.eq { background: rgba(0,240,255,0.15); color: var(--neon-cyan); grid-column: span 1; }
</style>
