import { reactive } from 'vue'

// Simulated file system
function createFS() {
  const fs = reactive({
    '/': {
      type: 'dir',
      name: '根目录',
      children: {
        'Windows': {
          type: 'dir',
          name: 'Windows',
          children: {
            'System32': {
              type: 'dir',
              name: 'System32',
              children: {
                'kernel.dll': { type: 'file', name: 'kernel.dll', size: '2.4 MB', content: 'KERNEL_CORE_V3.7' },
                'drivers.dat': { type: 'file', name: 'drivers.dat', size: '856 KB', content: 'DRIVER_PACK_v2' },
                'config.sys': { type: 'file', name: 'config.sys', size: '12 KB', content: '# SYSTEM CONFIG\nCYBER_MODE=ENABLED\nNEON_LEVEL=MAX' },
              }
            },
            'Logs': {
              type: 'dir',
              name: 'Logs',
              children: {
                'system.log': { type: 'file', name: 'system.log', size: '128 KB', content: '[BOOT] System initialized\n[OK] Neural interface online\n[OK] Cyber-core v9.0 loaded' },
                'error.log': { type: 'file', name: 'error.log', size: '4 KB', content: 'No errors detected. System nominal.' },
              }
            },
            'explorer.exe': { type: 'file', name: 'explorer.exe', size: '4.2 MB', content: 'EXPLORER_SHELL_CYBER' },
          }
        },
        'Users': {
          type: 'dir',
          name: 'Users',
          children: {
            'Yocim': {
              type: 'dir',
              name: 'Yocim',
              children: {
                'Desktop': { type: 'dir', name: 'Desktop', children: {} },
                'Documents': {
                  type: 'dir',
                  name: 'Documents',
                  children: {
                    'README.txt': { type: 'file', name: 'README.txt', size: '2 KB', content: '欢迎使用 YOCIM_STAT_WIN\n赛博朋克风格操作系统模拟器\n版本 1.0.0' },
                    'project_notes.txt': { type: 'file', name: 'project_notes.txt', size: '8 KB', content: '> 项目代号: NEON_CITY\n> 状态: 活跃\n> 加密等级: 最高\n> 网络: 已连接' },
                    'secret.enc': { type: 'file', name: 'secret.enc', size: '64 KB', content: '**** ENCRYPTED DATA ****\nACCESS LEVEL: OMEGA' },
                  }
                },
                'Downloads': { type: 'dir', name: 'Downloads', children: {} },
                'Pictures': {
                  type: 'dir',
                  name: 'Pictures',
                  children: {
                    'neon_city.png': { type: 'file', name: 'neon_city.png', size: '3.8 MB', content: '[BINARY IMAGE DATA]' },
                    'cyber_samurai.jpg': { type: 'file', name: 'cyber_samurai.jpg', size: '1.2 MB', content: '[BINARY IMAGE DATA]' },
                  }
                },
                'Music': {
                  type: 'dir',
                  name: 'Music',
                  children: {
                    'synthwave_01.mp3': { type: 'file', name: 'synthwave_01.mp3', size: '8.4 MB', content: '[AUDIO DATA]' },
                    'dark_techno.mp3': { type: 'file', name: 'dark_techno.mp3', size: '11.2 MB', content: '[AUDIO DATA]' },
                  }
                },
              }
            }
          }
        },
        'Program Files': {
          type: 'dir',
          name: 'Program Files',
          children: {
            'Terminal': { type: 'dir', name: 'Terminal', children: {} },
            'Notepad': { type: 'dir', name: 'Notepad', children: {} },
          }
        },
        'cyber_core.sys': { type: 'file', name: 'cyber_core.sys', size: '128 MB', content: 'CYBER_CORE_ACTIVE' },
        'boot.ini': { type: 'file', name: 'boot.ini', size: '1 KB', content: '[BOOT]\nTIMEOUT=0\nDEFAULT=CYBER_OS' },
      }
    }
  })

  function resolvePath(path) {
    if (path === '/') return fs['/']
    const parts = path.replace(/^\//, '').split('/')
    let current = fs['/']
    for (const part of parts) {
      if (!part) continue
      if (current.type !== 'dir' || !current.children || !current.children[part]) return null
      current = current.children[part]
    }
    return current
  }

  function getChildren(path) {
    const node = resolvePath(path)
    if (!node || node.type !== 'dir') return []
    return Object.entries(node.children || {}).map(([key, val]) => ({
      key,
      ...val
    }))
  }

  function getParentPath(path) {
    if (path === '/') return '/'
    const parts = path.replace(/\/$/, '').split('/')
    parts.pop()
    return parts.join('/') || '/'
  }

  function readFile(path) {
    const node = resolvePath(path)
    if (!node || node.type !== 'file') return null
    return node.content || ''
  }

  return { fs, resolvePath, getChildren, getParentPath, readFile }
}

export const fileSystem = createFS()
