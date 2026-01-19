<script setup lang="ts">
import { z } from "zod"

const props = defineProps<{
  employee?: any
}>()

const emit = defineEmits(["save", "cancel"])

const employeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.string().min(2, "Role must be at least 2 characters"),
  defaultDailyCapacityHours: z
    .number()
    .min(0, "Capacity cannot be negative")
    .max(24, "Max capacity is 24 hours"),
})

const form = ref({
  name: props.employee?.name || "",
  email: props.employee?.email || "",
  role: props.employee?.role || "",
  defaultDailyCapacityHours: props.employee?.defaultDailyCapacityHours || 8,
})

const errors = ref<any>({})

const submitForm = () => {
  errors.value = {}
  const result = employeeSchema.safeParse(form.value)

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
    <UFormGroup label="Name" required :error="errors.name">
      <UInput v-model="form.name" placeholder="John Doe" />
    </UFormGroup>

    <UFormGroup label="Email" required :error="errors.email">
      <UInput
        v-model="form.email"
        type="email"
        placeholder="john@company.com"
      />
    </UFormGroup>

    <UFormGroup label="Role" required :error="errors.role">
      <UInput v-model="form.role" placeholder="e.g., Technician, Developer" />
    </UFormGroup>

    <UFormGroup
      label="Daily Capacity (hours)"
      :error="errors.defaultDailyCapacityHours"
    >
      <UInput
        v-model.number="form.defaultDailyCapacityHours"
        type="number"
        min="0"
        max="24"
      />
    </UFormGroup>

    <div class="flex justify-end gap-3 pt-4">
      <UButton variant="ghost" @click="$emit('cancel')">Cancel</UButton>
      <UButton type="submit">
        {{ employee ? "Update" : "Create" }}
      </UButton>
    </div>
  </form>
</template>
