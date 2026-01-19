<script setup lang="ts">
import { z } from "zod"
import { isBefore, parseISO } from "date-fns"
import type { Employee, Absence } from "~/types"

const props = defineProps<{
  employees?: Employee[]
  isEmployeeView?: boolean
}>()

const emit = defineEmits(["save", "cancel"])

const absenceSchema = z
  .object({
    employeeId: props.isEmployeeView
      ? z.string().optional()
      : z.string().min(1, "Employee is required"),
    type: z.string().min(1, "Absence type is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    comment: z.string().optional(),
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
    }
  )

const form = ref<Partial<Absence>>({
  employeeId: props.isEmployeeView ? undefined : "",
  type: "PAID_LEAVE",
  startDate: "",
  endDate: "",
  comment: "",
})

const errors = ref<Record<string, string>>({})

const absenceTypes = [
  { label: "Paid Leave", value: "PAID_LEAVE" },
  { label: "Sick Leave", value: "SICK_LEAVE" },
  { label: "Training", value: "TRAINING" },
  { label: "Unpaid Leave", value: "UNPAID_LEAVE" },
  { label: "RTT", value: "RTT" },
  { label: "Other", value: "OTHER" },
]

const submitForm = () => {
  errors.value = {}
  const result = absenceSchema.safeParse(form.value)

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
    <UFormGroup
      v-if="!isEmployeeView"
      label="Employee"
      required
      :error="errors.employeeId"
    >
      <USelectMenu
        v-model="form.employeeId"
        :options="employees?.map((e: Employee) => ({ label: e.name, value: e.id })) || []"
        value-attribute="value"
        option-attribute="label"
        placeholder="Select employee"
      />
    </UFormGroup>

    <UFormGroup label="Absence Type" required :error="errors.type">
      <USelectMenu
        v-model="form.type"
        :options="absenceTypes"
        value-attribute="value"
        option-attribute="label"
      />
    </UFormGroup>

    <div class="grid grid-cols-2 gap-4">
      <UFormGroup label="Start Date" required :error="errors.startDate">
        <UInput v-model="form.startDate" type="date" />
      </UFormGroup>

      <UFormGroup label="End Date" required :error="errors.endDate">
        <UInput v-model="form.endDate" type="date" />
      </UFormGroup>
    </div>

    <UFormGroup label="Comment" :error="errors.comment">
      <UTextarea v-model="form.comment" placeholder="Optional notes..." />
    </UFormGroup>

    <div class="flex justify-end gap-3 pt-4">
      <UButton variant="ghost" @click="emit('cancel')">Cancel</UButton>
      <UButton type="submit">Record Absence</UButton>
    </div>
  </form>
</template>
