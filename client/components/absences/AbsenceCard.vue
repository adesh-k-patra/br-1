<script setup lang="ts">
import { format } from "date-fns"

const props = defineProps<{
  absence: any
}>()

const emit = defineEmits(["approve", "reject", "delete"])

const getStatusColor = (status: string) => {
  if (status === "APPROVED") return "green"
  if (status === "REJECTED") return "red"
  return "yellow"
}

const absenceTypes = [
  { label: "Paid Leave", value: "PAID_LEAVE" },
  { label: "Sick Leave", value: "SICK_LEAVE" },
  { label: "Training", value: "TRAINING" },
  { label: "Unpaid Leave", value: "UNPAID_LEAVE" },
  { label: "RTT", value: "RTT" },
  { label: "Other", value: "OTHER" },
]

const getTypeLabel = (type: string) => {
  return absenceTypes.find((t) => t.value === type)?.label ?? type
}
</script>

<template>
  <div class="border rounded-lg p-4 hover:bg-gray-50 transition">
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <span class="font-semibold text-gray-900">{{
            absence.employee?.name
          }}</span>
          <UBadge :color="getStatusColor(absence.status)" variant="soft">
            {{ absence.status }}
          </UBadge>
          <UBadge variant="outline">
            {{ getTypeLabel(absence.type) }}
          </UBadge>
        </div>
        <div class="text-sm text-gray-600">
          {{ format(new Date(absence.startDate), "MMMM d, yyyy") }}
          <span class="mx-2">to</span>
          {{ format(new Date(absence.endDate), "MMMM d, yyyy") }}
        </div>
        <div v-if="absence.comment" class="text-sm text-gray-500 mt-1">
          {{ absence.comment }}
        </div>
      </div>

      <div class="flex gap-2">
        <template v-if="absence.status === 'REQUESTED'">
          <UButton
            icon="i-heroicons-check"
            size="sm"
            color="green"
            @click="emit('approve', absence.id)"
          >
            Approve
          </UButton>
          <UButton
            icon="i-heroicons-x-mark"
            size="sm"
            color="red"
            variant="outline"
            @click="emit('reject', absence.id)"
          >
            Reject
          </UButton>
        </template>
        <UButton
          icon="i-heroicons-trash"
          size="sm"
          variant="ghost"
          color="gray"
          @click="emit('delete', absence.id)"
        />
      </div>
    </div>
  </div>
</template>
