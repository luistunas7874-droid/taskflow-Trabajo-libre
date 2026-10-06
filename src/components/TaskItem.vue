<script setup>
import { computed } from 'vue'
import { now, formatDuration } from '../composables/useTasks'

const props = defineProps({ task: { type: Object, required: true } })
defineEmits(['toggle', 'remove', 'urgent'])

const dueLabel = computed(() =>
  props.task.due
    ? new Date(props.task.due).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
    : ''
)

const timeInfo = computed(() => {
  if (!props.task.due || props.task.done) return null
  const diff = props.task.due - now.value
  if (diff <= 0) return { text: `🔥 Vencida hace ${formatDuration(diff)}`, level: 'late' }
  if (diff < 3600000) return { text: `⏳ Quedan ${formatDuration(diff)}`, level: 'soon' }
  return { text: `⏳ Quedan ${formatDuration(diff)}`, level: 'ok' }
})
</script>

<template>
  <li class="item" :class="{ done: task.done, urgent: task.urgent && !task.done }">
    <div class="info">
      <label>
        <input type="checkbox" :checked="task.done" @change="$emit('toggle', task.id)" />
        <span>{{ task.text }}</span>
      </label>
      <div v-if="task.due || (task.urgent && !task.done)" class="time">
        <small v-if="task.urgent && !task.done" class="badge late">🚨 Urgente</small>
        <small v-if="task.due" class="due-date">📅 {{ dueLabel }}</small>
        <small v-if="timeInfo" class="badge" :class="timeInfo.level">{{ timeInfo.text }}</small>
      </div>
    </div>
    <div class="item-actions">
      <button
        class="flag"
        :class="{ on: task.urgent }"
        title="Marcar como urgente"
        aria-label="Marcar como urgente"
        @click="$emit('urgent', task.id)"
      >
        🚨
      </button>
      <button class="remove" aria-label="Eliminar" @click="$emit('remove', task.id)">✕</button>
    </div>
  </li>
</template>