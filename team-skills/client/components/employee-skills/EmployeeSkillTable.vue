<script setup lang="ts">
import type { EmployeeSkill } from "~/types"

defineProps<{
  employeeSkills: EmployeeSkill[]
  columns: { key: string; label: string; sortable?: boolean }[]
}>()

defineEmits(["edit", "delete"])

const getLevelBadgeColor = (level: number) => {
  if (level >= 4) return "purple"
  if (level >= 3) return "blue"
  if (level >= 2) return "green"
  return "gray"
}
</script>

<template>
  <UTable
    :rows="employeeSkills"
    :columns="columns"
    :ui="{
      th: { base: 'w-1/5' },
      td: { base: 'align-top' },
    }"
  >
    <template #name-data="{ row }">
      {{ row.skill?.name || "" }}
    </template>

    <template #level-data="{ row }">
      <UBadge :color="getLevelBadgeColor(row.level)" variant="solid" size="md">
        Level {{ row.level }}
      </UBadge>
    </template>

    <template #category-data="{ row }">
      {{ row.skill?.category || "" }}
    </template>

    <template #description-data="{ row }">
      {{ row.skill?.description || "" }}
    </template>

    <template #actions-data="{ row }">
      <div class="flex gap-2">
        <UButton
          icon="i-heroicons-pencil"
          size="sm"
          variant="ghost"
          @click="$emit('edit', row)"
        />
        <UButton
          icon="i-heroicons-trash"
          size="sm"
          variant="ghost"
          color="red"
          @click="$emit('delete', row)"
        />
      </div>
    </template>
  </UTable>
</template>
