import { computed, onUnmounted, ref } from 'vue'

const STORAGE_KEY = 'taskflow_tasks'
const DAY_IN_MS = 24 * 60 * 60 * 1000

export const now = ref(Date.now())
let clockTimer

export function formatDuration(milliseconds) {
  const minutes = Math.max(1, Math.floor(Math.abs(milliseconds) / 60000))
  const days = Math.floor(minutes / 1440)
  const hours = Math.floor((minutes % 1440) / 60)
  const remainingMinutes = minutes % 60

  if (days) return `${days} d ${hours} h`
  if (hours) return `${hours} h ${remainingMinutes} min`
  return `${remainingMinutes} min`
}

export function useTasks() {
  if (!clockTimer) {
    clockTimer = setInterval(() => {
      now.value = Date.now()
    }, 1000)
  }

  onUnmounted(() => {
    clearInterval(clockTimer)
    clockTimer = undefined
  })

  const tasks = ref(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'))

  const filter = ref('all')

  const filteredTasks = computed(() => {
    if (filter.value === 'done') {
      return tasks.value.filter((task) => task.done)
    }

    if (filter.value === 'pending') {
      return tasks.value.filter((task) => !task.done)
    }

    return tasks.value
  })

  const stats = computed(() => {
    const total = tasks.value.length
    const done = tasks.value.filter((task) => task.done).length

    return {
      total,
      done,
      pending: total - done,
    }
  })

  const urgentTasks = computed(() => {
    return tasks.value.flatMap((task) => {
      if (task.done) return []

      const remaining = task.due ? Number(task.due) - now.value : Infinity
      if (!task.urgent && remaining > DAY_IN_MS) return []

      if (remaining <= 0) {
        return [{ task, level: 'late', label: `Vencida hace ${formatDuration(remaining)}` }]
      }

      if (task.urgent) {
        return [{ task, level: 'flag', label: 'Marcada como urgente' }]
      }

      return [{ task, level: 'soon', label: `Vence en ${formatDuration(remaining)}` }]
    })
  })

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.value))
  }

  function addTask(text, due, urgent) {
    const dueTimestamp = due ? new Date(due).getTime() : null

    tasks.value.push({
      id: Date.now(),
      text,
      due: dueTimestamp,
      urgent,
      done: false,
    })

    saveTasks()
  }

  function toggleTask(id) {
    const task = tasks.value.find((task) => task.id === id)

    if (task) {
      task.done = !task.done
      saveTasks()
    }
  }

  function toggleUrgent(id) {
    const task = tasks.value.find((task) => task.id === id)

    if (task) {
      task.urgent = !task.urgent
      saveTasks()
    }
  }

  function removeTask(id) {
    tasks.value = tasks.value.filter((task) => task.id !== id)
    saveTasks()
  }

  function clearCompleted() {
    tasks.value = tasks.value.filter((task) => !task.done)
    saveTasks()
  }

  return {
    tasks,
    filter,
    filteredTasks,
    stats,
    urgentTasks,
    addTask,
    toggleTask,
    toggleUrgent,
    removeTask,
    clearCompleted,
  }
}