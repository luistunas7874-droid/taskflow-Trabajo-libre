<script setup>
import { ref, computed } from 'vue'
import { now } from '../composables/useTasks'

const props = defineProps({ tasks: { type: Array, required: true } })
const emit = defineEmits(['toggle'])

const weekdays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

function key(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const start = new Date()
const cursor = ref({ year: start.getFullYear(), month: start.getMonth() })
const selected = ref(key(start))

const todayKey = computed(() => key(new Date(now.value)))

const todayLabel = computed(() =>
  new Date(now.value).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
)

const clock = computed(() =>
  new Date(now.value).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
)

const monthLabel = computed(() =>
  new Date(cursor.value.year, cursor.value.month, 1).toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  })
)

// Tareas con fecha límite, agrupadas por día
const byDay = computed(() => {
  const map = {}
  for (const t of props.tasks) {
    if (!t.due) continue
    const k = key(new Date(t.due))
    if (!map[k]) map[k] = []
    map[k].push(t)
  }
  for (const k in map) map[k].sort((a, b) => a.due - b.due)
  return map
})

function dayStatus(items) {
  if (!items.length) return ''
  const pending = items.filter((t) => !t.done)
  if (!pending.length) return 'done'
  if (pending.some((t) => t.urgent || t.due < now.value)) return 'late'
  return 'pending'
}

const cells = computed(() => {
  const { year, month } = cursor.value
  const offset = (new Date(year, month, 1).getDay() + 6) % 7 // semana empieza en lunes
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const list = []
  for (let i = 0; i < offset; i++) list.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const k = key(new Date(year, month, d))
    const items = byDay.value[k] ?? []
    list.push({ day: d, key: k, items, status: dayStatus(items) })
  }
  return list
})

const selectedItems = computed(() => byDay.value[selected.value] ?? [])

const selectedLabel = computed(() => {
  const text = new Date(`${selected.value}T00:00:00`).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return selected.value === todayKey.value ? `Hoy · ${text}` : text
})

function shift(n) {
  const d = new Date(cursor.value.year, cursor.value.month + n, 1)
  cursor.value = { year: d.getFullYear(), month: d.getMonth() }
}

function goToday() {
  const d = new Date()
  cursor.value = { year: d.getFullYear(), month: d.getMonth() }
  selected.value = key(d)
}

function isLate(t) {
  return !t.done && t.due < now.value
}

function hour(ts) {
  return new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <section class="panel calendar">
    <div class="cal-today">
      <div>
        <p class="cal-date">{{ todayLabel }}</p>
        <p class="cal-clock">{{ clock }}</p>
      </div>
      <button class="small" @click="goToday">Hoy</button>
    </div>

    <div class="cal-nav">
      <button class="small ghost" aria-label="Mes anterior" @click="shift(-1)">‹</button>
      <strong class="cal-month">{{ monthLabel }}</strong>
      <button class="small ghost" aria-label="Mes siguiente" @click="shift(1)">›</button>
    </div>

    <div class="cal-grid cal-week">
      <span v-for="d in weekdays" :key="d">{{ d }}</span>
    </div>

    <div class="cal-grid">
      <template v-for="(c, i) in cells" :key="i">
        <span v-if="!c"></span>
        <button
          v-else
          class="cal-day"
          :class="[c.status, { today: c.key === todayKey, selected: c.key === selected }]"
          @click="selected = c.key"
        >
          {{ c.day }}
          <em v-if="c.items.length" class="count">{{ c.items.length }}</em>
        </button>
      </template>
    </div>

    <div class="agenda">
      <p class="agenda-title">📌 {{ selectedLabel }}</p>
      <p v-if="!selectedItems.length" class="empty">Sin recordatorios este día</p>
      <ul v-else>
        <li v-for="t in selectedItems" :key="t.id" :class="{ done: t.done, late: isLate(t) }">
          <input type="checkbox" :checked="t.done" @change="emit('toggle', t.id)" />
          <span class="agenda-time">{{ hour(t.due) }}</span>
          <span class="agenda-text">{{ t.text }}</span>
          <b v-if="t.urgent && !t.done">🚨</b>
        </li>
      </ul>
    </div>
  </section>
</template>