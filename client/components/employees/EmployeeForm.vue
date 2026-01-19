<script setup lang="ts">
const props = defineProps<{
  employee?: any
}>()

const emit = defineEmits(["save", "cancel"])

const form = ref({
  name: props.employee?.name || "",
  email: props.employee?.email || "",
  role: props.employee?.role || "",
  defaultDailyCapacityHours: props.employee?.defaultDailyCapacityHours || 8,
})

const submitForm = () => {
  emit("save", form.value)
}
</script>

<template>
  <form @submit.prevent="submitForm" class="space-y-4">
    <UFormGroup label="Name" required>
      <UInput v-model="form.name" placeholder="John Doe" />
    </UFormGroup>

    <UFormGroup label="Email" required>
      <UInput
        v-model="form.email"
        type="email"
        placeholder="john@company.com"
      />
    </UFormGroup>

    <UFormGroup label="Role" required>
      <UInput v-model="form.role" placeholder="e.g., Technician, Developer" />
    </UFormGroup>

    <UFormGroup label="Daily Capacity (hours)">
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
