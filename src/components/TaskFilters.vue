<script setup>
const filter = defineModel()
const options = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'done', label: 'Completadas' },
]
</script>

<template>
  <div class="filters">
    <button
      v-for="o in options"
      :key="o.value"
      :class="{ active: filter === o.value }"
      @click="filter = o.value"
    >
      {{ o.label }}
    </button>
  </div>
</template>