<script setup lang="ts">
const props = defineProps<{
  employees: any[]
}>()

const emit = defineEmits(["save", "cancel"])

const form = ref({
  employeeId: "",
  type: "PAID_LEAVE",
  startDate: "",
  endDate: "",
  comment: "",
})

const absenceTypes = [
  { label: "Paid Leave", value: "PAID_LEAVE" },
  { label: "Sick Leave", value: "SICK_LEAVE" },
  { label: "Training", value: "TRAINING" },
  { label: "Unpaid Leave", value: "UNPAID_LEAVE" },
  { label: "RTT", value: "RTT" },
  { label: "Other", value: "OTHER" },
]

const submitForm = () => {
  emit("save", form.value)
}
</script>

<template>
  <form @submit.prevent="submitForm" class="space-y-4">
    <UFormGroup label="Employee" required>
      <USelectMenu
        v-model="form.employeeId"
        :options="employees.map((e: any) => ({ label: e.name, value: e.id }))"
        value-attribute="value"
        option-attribute="label"
        placeholder="Select employee"
      />
    </UFormGroup>

    <UFormGroup label="Absence Type" required>
      <USelectMenu
        v-model="form.type"
        :options="absenceTypes"
        value-attribute="value"
        option-attribute="label"
      />
    </UFormGroup>

    <div class="grid grid-cols-2 gap-4">
      <UFormGroup label="Start Date" required>
        <UInput v-model="form.startDate" type="date" />
      </UFormGroup>

      <UFormGroup label="End Date" required>
        <UInput v-model="form.endDate" type="date" />
      </UFormGroup>
    </div>

    <UFormGroup label="Comment">
      <UTextarea v-model="form.comment" placeholder="Optional notes..." />
    </UFormGroup>

    <div class="flex justify-end gap-3 pt-4">
      <UButton variant="ghost" @click="emit('cancel')">Cancel</UButton>
      <UButton type="submit">Record Absence</UButton>
    </div>
  </form>
</template>
