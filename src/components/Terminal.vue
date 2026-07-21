<template>
  <div class="terminal" @click="focusInput">
    <!-- Output -->
    <div class="term-output" ref="outputEl">
      <div class="term-banner">
        <div class="banner-line neon-text-cyan">╔══════════════════════════════════════╗</div>
        <div class="banner-line neon-text-cyan">║   YOCIM_STAT_WIN  CYBER TERMINAL   ║</div>
        <div class="banner-line neon-text-cyan">║       版本 9.0  |  神经接口就绪     ║</div>
        <div class="banner-line neon-text-cyan">╚══════════════════════════════════════╝</div>
      </div>
      <div v-for="(line, i) in history" :key="i" class="term-line">
        <span v-if="line.type === 'input'" class="term-prompt">
          <span class="prompt-user neon-text-green">yocim@cyber</span>:<span class="prompt-path neon-text-cyan">~</span>$
        </span>
        <span :class="['term-text', line.type === 'error' ? 'term-error' : '', line.type === 'success' ? 'neon-text-green' : '']">
          {{ line.text }}
        </span>
      </div>
      <div class="term-input-line">
        <span class="term-prompt">
          <span class="prompt-user neon-text-green">yocim@cyber</span>:<span class="prompt-path neon-text-cyan">{{ cwdDisplay }}</span>$
        </span>
        <input
          ref="inputEl"
          v-model="input"
          class="term-input"
          @keydown.enter="execute"
          @keydown.arrowUp.prevent="historyUp"
          @keydown.arrowDown.prevent="historyDown"
          spellcheck="false"
          autofocus
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { fileSystem } from '../composables/useFileSystem.js'

const props = defineProps({
  windowId: String,
})

const history = ref([])
const input = ref('')
const inputEl = ref(null)
const outputEl = ref(null)
const cmdHistory = ref([])
const cmdIdx = ref(-1)
const cwdFS = ref('/Users/Yocim') // real filesystem path
const HOME = '/Users/Yocim'

// display path: replace HOME with ~
function displayPath(p) {
  if (p === HOME) return '~'
  if (p.startsWith(HOME + '/')) return '~' + p.slice(HOME.length)
  return p
}

// resolve terminal path to filesystem path (with .. normalization)
function toFSPath(p) {
  if (!p || p === '~') return HOME
  if (p.startsWith('~/')) p = HOME + p.slice(1)
  else if (!p.startsWith('/')) p = cwdFS.value === '/' ? '/' + p : cwdFS.value + '/' + p
  // normalize .. segments
  const parts = p.split('/').filter(Boolean)
  const resolved = []
  for (const part of parts) {
    if (part === '..') resolved.pop()
    else if (part !== '.') resolved.push(part)
  }
  return '/' + resolved.join('/')
}

const cwdDisplay = computed(() => displayPath(cwdFS.value))

const commands = {
  help() {
    return [
      '可用命令:',
      '  help        - 显示此帮助',
      '  clear       - 清屏',
      '  echo <msg>  - 打印消息',
      '  date        - 显示日期时间',
      '  whoami      - 显示当前用户',
      '  ls / dir    - 列出文件',
      '  pwd         - 当前目录',
      '  cd <dir>    - 切换目录',
      '  cat <file>  - 查看文件',
      '  sysinfo     - 系统信息',
      '  neofetch    - 系统信息(炫酷)',
      '  ping <host> - 测试连接',
      '  matrix      - 彩蛋',
      '  hack        - 模拟黑客攻击',
    ].join('\n')
  },
  clear() {
    history.value = []
    return ''
  },
  echo(args) {
    return args || ''
  },
  date() {
    return new Date().toString()
  },
  whoami() {
    return 'yocim'
  },
  pwd() {
    return displayPath(cwdFS.value)
  },
  ls() {
    const items = fileSystem.getChildren(cwdFS.value)
    if (items.length === 0) return '(空)'
    const lines = []
    for (const item of items) {
      lines.push(item.type === 'dir' ? `${item.name}/` : item.name)
    }
    return lines.join('  ')
  },
  dir() { return this.ls() },
  cd(dir) {
    if (!dir || dir === '~') { cwdFS.value = HOME; return '' }
    const target = toFSPath(dir)
    const node = fileSystem.resolvePath(target)
    if (!node || node.type !== 'dir') return `cd: ${dir}: 没有那个目录`
    cwdFS.value = target
    return ''
  },
  cat(file) {
    if (!file) return '用法: cat <文件>'
    const target = toFSPath(file)
    const content = fileSystem.readFile(target)
    if (content === null) return `cat: ${file}: 没有那个文件`
    return content
  },
  sysinfo() {
    return [
      'SYSTEM INFORMATION',
      '──────────────────',
      `OS:       YOCIM_STAT_WIN Cyber Edition`,
      `Kernel:   NEON-9.0.1-cyber`,
      `CPU:      CyberCore i9 @ 5.2GHz`,
      `RAM:      32GB DDR5`,
      `GPU:      NeonV FX 4090`,
      `Network:  已连接 | 延迟: 3ms`,
      `Uptime:   ${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
    ].join('\n')
  },
  neofetch() {
    return [
      '      ⬡⬡⬡⬡⬡⬡⬡      yocim@CYBER-OS',
      '    ⬡⬡⬡⬡⬡⬡⬡⬡⬡    ─────────────',
      '   ⬡⬡⬡⬡⬡⬡⬡⬡⬡⬡   OS: YOCIM_STAT_WIN',
      '  ⬡⬡⬡⬡⬡⬡⬡⬡⬡⬡⬡  Kernel: NEON-9.0.1',
      ' ⬡⬡⬡⬡⬡⬡⬡⬡⬡⬡⬡⬡  CPU: CyberCore i9',
      ' ⬡⬡⬡⬡⬡⬡⬡⬡⬡⬡⬡⬡  RAM: 32GB',
      ' ⬡⬡⬡⬡⬡⬡⬡⬡⬡⬡⬡⬡  Theme: CyberPunk',
      '  ⬡⬡⬡⬡⬡⬡⬡⬡⬡⬡⬡  Shell: cyber-term',
      '   ⬡⬡⬡⬡⬡⬡⬡⬡⬡   Uptime: 4h 20m',
      '    ⬡⬡⬡⬡⬡⬡⬡⬡    ',
      '      ⬡⬡⬡⬡⬡      ',
    ].join('\n')
  },
  ping(host) {
    if (!host) return '用法: ping <host>'
    return [
      `PING ${host} (192.168.1.${Math.floor(Math.random() * 255)}) 56 bytes of data.`,
      `64 bytes from 192.168.1.1: icmp_seq=1 ttl=64 time=${(Math.random() * 5).toFixed(1)}ms`,
      `64 bytes from 192.168.1.1: icmp_seq=2 ttl=64 time=${(Math.random() * 3).toFixed(1)}ms`,
      `64 bytes from 192.168.1.1: icmp_seq=3 ttl=64 time=${(Math.random() * 2).toFixed(1)}ms`,
      `--- ${host} ping statistics ---`,
      `3 packets transmitted, 3 received, 0% packet loss`,
    ].join('\n')
  },
  matrix() {
    const chars = '01アイウエオカキクケコ'
    let out = ''
    for (let i = 0; i < 15; i++) {
      let line = ''
      for (let j = 0; j < 50; j++) {
        line += chars[Math.floor(Math.random() * chars.length)]
      }
      out += line + '\n'
    }
    return out
  },
  hack() {
    return [
      '>>> 正在初始化连接...',
      '>>> 绕过防火墙... [OK]',
      '>>> 破解密码... [OK]',
      '>>> 访问主机: 192.168.0.' + Math.floor(Math.random() * 255),
      '>>> 下载数据... [██████████] 100%',
      '>>> 清除日志... [OK]',
      '>>> 已断开连接.',
      '',
      '⚠ 这只是一个模拟 (笑)',
    ].join('\n')
  }
}

function execute() {
  const cmd = input.value.trim()
  if (!cmd) return

  history.value.push({ type: 'input', text: cmd })
  cmdHistory.value.push(cmd)
  cmdIdx.value = -1

  const [name, ...args] = cmd.split(/\s+/)
  const argStr = args.join(' ')

  if (commands[name]) {
    const result = commands[name](argStr)
    if (result) {
      result.split('\n').forEach(line => {
        history.value.push({ type: 'output', text: line })
      })
    }
  } else {
    history.value.push({ type: 'error', text: `命令未找到: ${name}。输入 'help' 查看可用命令。` })
  }

  input.value = ''
  scrollBottom()
}

function historyUp() {
  if (cmdHistory.value.length === 0) return
  if (cmdIdx.value === -1) cmdIdx.value = cmdHistory.value.length - 1
  else if (cmdIdx.value > 0) cmdIdx.value--
  input.value = cmdHistory.value[cmdIdx.value] || ''
  nextTick(() => inputEl.value?.focus())
}

function historyDown() {
  if (cmdIdx.value === -1) return
  if (cmdIdx.value < cmdHistory.value.length - 1) cmdIdx.value++
  else { cmdIdx.value = -1; input.value = ''; return }
  input.value = cmdHistory.value[cmdIdx.value] || ''
  nextTick(() => inputEl.value?.focus())
}

function focusInput() {
  inputEl.value?.focus()
}

function scrollBottom() {
  nextTick(() => {
    if (outputEl.value) {
      outputEl.value.scrollTop = outputEl.value.scrollHeight
    }
  })
}

onMounted(() => {
  inputEl.value?.focus()
})
</script>

<style scoped>
.terminal {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  font-family: var(--font-mono);
  font-size: 13px;
  cursor: text;
}
.term-output {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}
.term-banner {
  margin-bottom: 8px;
}
.banner-line {
  font-size: 12px;
  line-height: 1.3;
}
.term-line {
  line-height: 1.5;
}
.term-prompt {
  color: var(--text-bright);
}
.term-text {
  color: var(--text-secondary);
}
.term-error {
  color: #ff4466;
}
.term-input-line {
  display: flex;
  align-items: center;
  padding: 4px 12px 12px;
  gap: 4px;
}
.term-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-bright);
  font-family: var(--font-mono);
  font-size: 13px;
  caret-color: var(--neon-cyan);
}
.term-input::selection {
  background: var(--neon-cyan);
  color: #000;
}
</style>
