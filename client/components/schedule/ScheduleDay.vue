<script setup lang="ts">
const props = defineProps<{
  initialData: {
    date: string
    capacityHours: number
    note?: string
  }
}>()

const emit = defineEmits(["save", "cancel"])

const form = ref({
  date: props.initialData.date,
  capacityHours: props.initialData.capacityHours,
  note: props.initialData.note || "",
})

const submitForm = () => {
  emit("save", { ...form.value })
}
</script>

<template>
  <form @submit.prevent="submitForm" class="space-y-4">
    <UFormGroup label="Date" required>
      <UInput type="date" v-model="form.date" required />
    </UFormGroup>
    <UFormGroup label="Capacity Hours" required>
      <UInput
        type="number"
        min="0"
        max="24"
        step="0.5"
        v-model.number="form.capacityHours"
      />
    </UFormGroup>
    <UFormGroup label="Note (optional)">
      <UTextarea v-model="form.note" placeholder="Optional note" />
    </UFormGroup>
    <div class="flex justify-end gap-3 pt-4">
      <UButton variant="ghost" @click="emit('cancel')">Cancel</UButton>
      <UButton type="submit">Set Availability</UButton>
    </div>
  </form>
</template>
