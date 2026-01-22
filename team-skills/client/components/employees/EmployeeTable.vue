<script setup lang="ts">
import type { Employee } from "~/types"

defineProps<{
  employees: Employee[]
  columns: { key: string; label: string; sortable?: boolean }[]
}>()

const handleView = (employee: Employee) => {
  navigateTo(`/employee/${employee.id}`)
}
</script>

<template>
  <UTable :columns="columns" :rows="employees" @select="handleView">
    <template #name-data="{ row }">
      <div class="flex items-center gap-3">
        <UAvatar :alt="row.name" size="sm" />
        <span class="font-medium">{{ row.name }}</span>
      </div>
    </template>

    <template #capacity-data="{ row }">
      {{ row.defaultDailyCapacityHours }}h/day
    </template>
  </UTable>
</template>
