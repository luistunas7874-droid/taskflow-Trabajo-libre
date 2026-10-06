<script setup>
import { ref } from 'vue'

const emit = defineEmits(['add'])
const text = ref('')
const due = ref('')
const urgent = ref(false)

function submit() {
  const value = text.value.trim()
  if (!value) return
  emit('add', value, due.value, urgent.value)
  text.value = ''
  due.value = ''
  urgent.value = false
}
</script>

<template>
  <form class="form" @submit.prevent="submit">
    <div class="fields">
      <input v-model="text" placeholder="¿Qué tienes que hacer?" />
      <label class="due-field">
        <span>⏰ Fecha y hora límite (opcional)</span>
        <input v-model="due" type="datetime-local" />
      </label>
      <label class="urgent-field">
        <input v-model="urgent" type="checkbox" />
        🚨 Marcar como urgente
      </label>
    </div>
    <button type="submit">Agregar</button>
  </form>
</template>