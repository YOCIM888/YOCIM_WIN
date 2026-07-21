import { ref } from 'vue'

const clipboard = ref('')

export function useClipboard() {
  function copy(text) {
    clipboard.value = text
    // Also copy to system clipboard if available
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {})
    }
  }

  function paste() {
    return clipboard.value
  }

  return { clipboard, copy, paste }
}
