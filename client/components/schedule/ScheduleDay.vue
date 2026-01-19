<script setup lang="ts">
import { z } from "zod"

const props = defineProps<{
  initialData: {
    date: string
    capacityHours: number
    note?: string
  }
}>()

const emit = defineEmits(["save", "cancel"])

const availabilitySchema = z.object({
  date: z.string().min(1, "Date is required"),
  capacityHours: z
    .number()
    .min(0, "Capacity cannot be negative")
    .max(24, "Max capacity is 24 hours"),
  note: z.string().optional(),
})

const form = ref({
  date: props.initialData.date,
  capacityHours: props.initialData.capacityHours,
  note: props.initialData.note || "",
})

const errors = ref<any>({})

const submitForm = () => {
  errors.value = {}
  const result = availabilitySchema.safeParse(form.value)

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      errors.value[issue.path[0]] = issue.message
    })
    return
  }

  emit("save", { ...form.value })
}
</script>

<template>
  <form @submit.prevent="submitForm" class="space-y-4">
    <UFormGroup label="Date" required :error="errors.date">
      <UInput type="date" v-model="form.date" required />
    </UFormGroup>
    <UFormGroup label="Capacity Hours" required :error="errors.capacityHours">
      <UInput
        type="number"
        min="0"
        max="24"
        step="0.5"
        v-model.number="form.capacityHours"
      />
    </UFormGroup>
    <UFormGroup label="Note (optional)" :error="errors.note">
      <UTextarea v-model="form.note" placeholder="Optional note" />
    </UFormGroup>
    <div class="flex justify-end gap-3 pt-4">
      <UButton variant="ghost" @click="emit('cancel')">Cancel</UButton>
      <UButton type="submit">Set Availability</UButton>
    </div>
  </form>
</template>
