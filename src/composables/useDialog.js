import { ref } from 'vue'

const dialogRef = ref(null)

export function setDialogRef(ref) { dialogRef.value = ref }

export async function showAlert(message, title = '提示') {
  if (dialogRef.value) return dialogRef.value.show({ title, message, type: 'alert' })
  return window.alert(message)
}

export async function showConfirm(message, title = '确认') {
  if (dialogRef.value) return dialogRef.value.show({ title, message, type: 'confirm', okText: '确定' })
  return window.confirm(message)
}
