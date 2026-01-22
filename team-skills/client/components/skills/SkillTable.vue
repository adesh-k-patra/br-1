<script setup lang="ts">
import type { Skill } from "~/types"

defineProps<{
  skills: Skill[]
  columns: { key: string; label: string; sortable?: boolean }[]
}>()

defineEmits(["edit", "delete"])
</script>

<template>
  <UTable :columns="columns" :rows="skills">
    <template #name-data="{ row }">
      <div class="flex items-center gap-3">
        <UAvatar :alt="row.name" size="sm" />
        <span class="font-medium">{{ row.name }}</span>
      </div>
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
