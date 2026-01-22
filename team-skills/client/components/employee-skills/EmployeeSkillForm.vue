<script setup lang="ts">
import { z } from "zod"
import type { Skill, EmployeeSkill } from "~/types"

const props = defineProps<{
  skills?: Skill[]
  employeeSkill?: EmployeeSkill | null
}>()

const emit = defineEmits(["save", "cancel"])

const isEditMode = computed(() => !!props.employeeSkill)

const levels = [
  { label: "1 - Beginner", value: 1 },
  { label: "2 - Intermediate", value: 2 },
  { label: "3 - Advanced", value: 3 },
  { label: "4 - Expert", value: 4 },
]

const employeeSkillSchema = z.object({
  skillId: z.string().min(1, "Skill is required"),
  level: z.number().min(1).max(4),
})

const form = ref<Partial<EmployeeSkill>>({
  skillId: props.employeeSkill?.skillId || "",
  level: props.employeeSkill?.level,
})

const errors = ref<Record<string, string>>({})

const submitForm = () => {
  errors.value = {}

  const result = employeeSkillSchema.safeParse(form.value)

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      errors.value[issue.path[0]] = issue.message
    })
    return
  }

  emit("save", {
    ...props.employeeSkill,
    ...form.value,
  })
}
</script>

<template>
  <form @submit.prevent="submitForm" class="space-y-4">
    <UFormGroup label="Skill" required :error="errors.skillId">
      <USelectMenu
        v-model="form.skillId"
        :options="
          skills?.map((s: Skill) => ({
            label: s.name,
            value: s.id,
          })) || []
        "
        value-attribute="value"
        option-attribute="label"
        placeholder="Select skill"
        :disabled="isEditMode"
      />
    </UFormGroup>

    <UFormGroup label="Level" required :error="errors.level">
      <USelectMenu
        v-model="form.level"
        :options="levels"
        value-attribute="value"
        option-attribute="label"
        placeholder="Select level"
      />
    </UFormGroup>

    <div class="flex justify-end gap-3 pt-4">
      <UButton variant="ghost" @click="emit('cancel')"> Cancel </UButton>
      <UButton type="submit">
        {{ isEditMode ? "Update Level" : "Assign Skill" }}
      </UButton>
    </div>
  </form>
</template>
