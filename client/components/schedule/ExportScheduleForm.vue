<script setup lang="ts">
import { z } from "zod"
import { isBefore, parseISO } from "date-fns"

const emit = defineEmits(["export", "cancel"])

const exportSchema = z
  .object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return !isBefore(parseISO(data.endDate), parseISO(data.startDate))
      }
      return true
    },
    {
      message: "End date cannot be before start date",
      path: ["endDate"],
    },
  )

const form = ref({
  startDate: "",
  endDate: "",
})

const errors = ref<Record<string, string>>({})

const submitForm = () => {
  errors.value = {}
  const result = exportSchema.safeParse(form.value)

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      errors.value[issue.path[0]] = issue.message
    })
    return
  }

  emit("export", form.value)
}
</script>

<template>
  <form @submit.prevent="submitForm" class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <UFormGroup label="Start Date" required :error="errors.startDate">
        <UInput v-model="form.startDate" type="date" />
      </UFormGroup>

      <UFormGroup label="End Date" required :error="errors.endDate">
        <UInput v-model="form.endDate" type="date" />
      </UFormGroup>
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <UButton variant="ghost" @click="emit('cancel')">Cancel</UButton>
      <UButton type="submit" color="primary"> Export </UButton>
    </div>
  </form>
</template>
