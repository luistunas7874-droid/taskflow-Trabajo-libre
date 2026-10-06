<script setup>
import { ref, computed, watch } from 'vue'
import TaskForm from './components/TaskForm.vue'
import TaskItem from './components/TaskItem.vue'
import TaskFilters from './components/TaskFilters.vue'
import TaskCalendar from './components/TaskCalendar.vue'
import { useTasks } from './composables/useTasks'

const {
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
} = useTasks()

/* ---------- Tema oscuro / claro ---------- */
const theme = ref(localStorage.getItem('taskflow-theme') ?? 'dark')

watch(
  theme,
  (value) => {
    document.documentElement.dataset.theme = value
    localStorage.setItem('taskflow-theme', value)
  },
  { immediate: true }
)

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

/* ---------- Progreso ---------- */
const progress = computed(() =>
  stats.value.total ? Math.round((stats.value.done / stats.value.total) * 100) : 0
)

/* ---------- Vista lista / carrusel ---------- */
const view = ref('list')
const index = ref(0)

function handleAdd(text, due, urgent) {
  addTask(text, due, urgent)
  index.value = 0
}

function prev() {
  if (index.value > 0) index.value--
}

function next() {
  if (index.value < filteredTasks.value.length - 1) index.value++
}

watch(
  () => filteredTasks.value.length,
  (len) => {
    if (index.value > len - 1) index.value = Math.max(len - 1, 0)
  }
)

watch(filter, () => {
  index.value = 0
})

/* ---------- Recordatorios urgentes ---------- */
const canNotify = typeof Notification !== 'undefined'
const notifyEnabled = ref(canNotify && Notification.permission === 'granted')

async function enableNotifications() {
  const result = await Notification.requestPermission()
  notifyEnabled.value = result === 'granted'
}

const notified = new Set()

watch(urgentTasks, (list) => {
  if (!notifyEnabled.value) return
  for (const { task, level, label } of list) {
    const key = `${task.id}-${level}`
    if (notified.has(key)) continue
    notified.add(key)
    new Notification(`🚨 ${task.text}`, { body: label })
  }
})

watch(
  () => urgentTasks.value.length,
  (n) => {
    document.title = n ? `(${n}) 🚨 TaskFlow` : 'TaskFlow'
  },
  { immediate: true }
)

/* ---------- Fondo de pantalla ---------- */
const wallpapers = [
  { id: 'animated', name: 'Animado', preview: 'linear-gradient(120deg, #0b1020, #1a1040, #0f2a4a)' },
  { id: 'aurora', name: 'Aurora', preview: 'linear-gradient(135deg, #22d3a5, #8b5cf6, #0ea5e9)' },
  { id: 'sunset', name: 'Atardecer', preview: 'linear-gradient(160deg, #1e1b4b, #be185d, #f97316)' },
  { id: 'ocean', name: 'Océano', preview: 'linear-gradient(180deg, #0c4a6e, #0e7490, #164e63)' },
  { id: 'forest', name: 'Bosque', preview: 'linear-gradient(160deg, #052e16, #166534, #365314)' },
  { id: 'galaxy', name: 'Galaxia', preview: 'linear-gradient(135deg, #030712, #4c1d95, #be185d)' },
  { id: 'neon', name: 'Neón', preview: 'linear-gradient(135deg, #0b0221, #7e22ce, #0b0221)' },
]

const wallpaper = ref(localStorage.getItem('taskflow-wallpaper') ?? 'animated')
const customImage = ref(localStorage.getItem('taskflow-wallpaper-image') ?? '')
const wallError = ref('')
let wallTimer

const customStyle = computed(() => ({
  backgroundImage: `url("${customImage.value}")`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}))

watch(
  [wallpaper, customImage],
  ([w, img]) => {
    const root = document.documentElement
    const effective = w === 'custom' && !img ? 'animated' : w
    root.dataset.wallpaper = effective
    if (effective === 'custom') root.style.setProperty('--wall', `url("${img}")`)
    else root.style.removeProperty('--wall')
    localStorage.setItem('taskflow-wallpaper', w)
  },
  { immediate: true }
)

function showWallError(message) {
  wallError.value = message
  clearTimeout(wallTimer)
  wallTimer = setTimeout(() => (wallError.value = ''), 4000)
}

function onImage(event) {
  const file = event.target.files[0]
  event.target.value = ''
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    showWallError('La imagen pesa más de 2 MB. Elige una más ligera.')
    return
  }
  const reader = new FileReader()
  reader.onload = () => {
    try {
      localStorage.setItem('taskflow-wallpaper-image', reader.result)
      customImage.value = reader.result
      wallpaper.value = 'custom'
    } catch {
      showWallError('No se pudo guardar la imagen (es muy pesada para el navegador).')
    }
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <div class="shell">
    <!-- Barra superior -->
    <header class="topbar">
      <div class="brand">
        <h1>TaskFlow</h1>
        <p class="subtitle">Organiza tu día, un paso a la vez ✨</p>
      </div>

      <div class="top-actions">
        <div class="wall-dots" role="group" aria-label="Fondo de pantalla">
          <small>Fondo</small>
          <button
            v-for="w in wallpapers"
            :key="w.id"
            class="dot-btn"
            :class="{ active: wallpaper === w.id }"
            :style="{ background: w.preview }"
            :title="w.name"
            :aria-label="'Fondo ' + w.name"
            @click="wallpaper = w.id"
          ></button>
          <button
            v-if="customImage"
            class="dot-btn"
            :class="{ active: wallpaper === 'custom' }"
            :style="customStyle"
            title="Mi imagen"
            aria-label="Mi imagen"
            @click="wallpaper = 'custom'"
          ></button>
          <label class="dot-btn add" title="Subir mi imagen">
            +
            <input type="file" accept="image/*" hidden @change="onImage" />
          </label>
        </div>

        <button
          v-if="canNotify && !notifyEnabled"
          class="theme"
          title="Activar avisos del navegador"
          aria-label="Activar avisos"
          @click="enableNotifications"
        >
          🔔
        </button>
        <button class="theme" aria-label="Cambiar tema" @click="toggleTheme">
          {{ theme === 'dark' ? '☀️' : '🌙' }}
        </button>
      </div>
    </header>

    <p v-if="wallError" class="toast">{{ wallError }}</p>

    <main class="layout">
      <!-- Resumen + nueva tarea -->
      <section class="panel hero">
        <div class="hero-stats">
          <div class="stats-grid">
            <div class="stat total"><strong>{{ stats.total }}</strong><span>Total</span></div>
            <div class="stat pending"><strong>{{ stats.pending }}</strong><span>Pendientes</span></div>
            <div class="stat done"><strong>{{ stats.done }}</strong><span>Completadas</span></div>
          </div>
          <div class="progress-wrap">
            <div class="progress"><div :style="{ width: progress + '%' }"></div></div>
            <span class="percent">{{ progress }}%</span>
          </div>
        </div>

        <div class="hero-form">
          <h2 class="panel-title">➕ Nueva tarea</h2>
          <TaskForm @add="handleAdd" />
        </div>
      </section>

      <!-- Recordatorios urgentes -->
      <section v-if="urgentTasks.length" class="alerts">
        <strong class="alerts-head">🚨 Urgentes ({{ urgentTasks.length }})</strong>
        <div class="chips">
          <div v-for="a in urgentTasks" :key="a.task.id" class="chip" :class="a.level">
            <span class="alert-text">{{ a.task.text }}</span>
            <small>{{ a.label }}</small>
            <button class="small" title="Marcar como hecha" @click="toggleTask(a.task.id)">✔</button>
          </div>
        </div>
      </section>

      <!-- Tareas + calendario -->
      <div class="workspace">
        <section class="panel tasks-panel">
          <div class="toolbar">
            <div class="toolbar-left">
              <h2 class="panel-title">📋 Mis tareas</h2>
              <TaskFilters v-model="filter" />
            </div>
            <div class="filters">
              <button :class="{ active: view === 'list' }" @click="view = 'list'">☰ Lista</button>
              <button :class="{ active: view === 'carousel' }" @click="view = 'carousel'">🎠 Carrusel</button>
            </div>
          </div>

          <div class="tasks-body">
            <!-- Vista carrusel -->
            <div v-if="view === 'carousel' && filteredTasks.length" class="carousel-wrap">
              <div class="carousel">
                <button class="nav prev" :disabled="index === 0" aria-label="Anterior" @click="prev">‹</button>
                <div class="viewport">
                  <ul class="track" :style="{ '--i': index }">
                    <TaskItem
                      v-for="(task, i) in filteredTasks"
                      :key="task.id"
                      :task="task"
                      class="slide"
                      :class="{ active: i === index }"
                      @toggle="toggleTask"
                      @remove="removeTask"
                      @urgent="toggleUrgent"
                    />
                  </ul>
                </div>
                <button
                  class="nav next"
                  :disabled="index >= filteredTasks.length - 1"
                  aria-label="Siguiente"
                  @click="next"
                >
                  ›
                </button>
              </div>

              <div v-if="filteredTasks.length > 1" class="dots">
                <button
                  v-for="(task, i) in filteredTasks"
                  :key="task.id"
                  :class="{ active: i === index }"
                  :aria-label="'Ir a la tarea ' + (i + 1)"
                  @click="index = i"
                ></button>
              </div>
            </div>

            <!-- Vista lista -->
            <TransitionGroup v-else-if="view === 'list'" name="task" tag="ul" class="list">
              <TaskItem
                v-for="task in filteredTasks"
                :key="task.id"
                :task="task"
                @toggle="toggleTask"
                @remove="removeTask"
                @urgent="toggleUrgent"
              />
            </TransitionGroup>

            <p v-if="!filteredTasks.length" class="empty">No hay tareas aquí 🎉</p>
          </div>

          <button v-if="stats.done" class="clear" @click="clearCompleted">🗑️ Borrar completadas</button>
        </section>

        <TaskCalendar :tasks="tasks" @toggle="toggleTask" />
      </div>
    </main>
  </div>
</template>