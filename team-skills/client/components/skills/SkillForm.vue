<script setup lang="ts">
import { z } from "zod"
import type { Skill } from "~/types"

const props = defineProps<{
  skill?: Skill | null
}>()

const emit = defineEmits(["save", "cancel"])

const skillSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(2, "Category must be at least 2 characters"),
  description: z.string().optional(),
})

const form = ref<Partial<Skill>>({
  name: props.skill?.name || "",
  category: props.skill?.category || "",
  description: props.skill?.description || "",
})

const errors = ref<Record<string, string>>({})

const submitForm = () => {
  errors.value = {}

  const result = skillSchema.safeParse(form.value)

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      errors.value[issue.path[0]] = issue.message
    })
    return
  }

  emit("save", form.value)
}
</script>

<template>
  <form @submit.prevent="submitForm" class="space-y-4">
    <UFormGroup label="Skill Name" required :error="errors.name">
      <UInput v-model="form.name" placeholder="e.g. React, Python" />
    </UFormGroup>

    <UFormGroup label="Category" required :error="errors.category">
      <UInput
        v-model="form.category"
        placeholder="e.g. Frontend, Backend, Soft Skills"
      />
    </UFormGroup>

    <UFormGroup label="Description" :error="errors.description">
      <UTextarea
        v-model="form.description"
        placeholder="Optional description of the skill"
        :rows="3"
      />
    </UFormGroup>

    <div class="flex justify-end gap-3 pt-4">
      <UButton variant="ghost" @click="$emit('cancel')"> Cancel </UButton>

      <UButton type="submit">
        {{ skill ? "Update" : "Create" }}
      </UButton>
    </div>
  </form>
</template>
