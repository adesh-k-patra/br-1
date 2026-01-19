<script setup lang="ts">
import AbsenceCard from "~/components/absences/AbsenceCard.vue"
import AbsenceForm from "~/components/absences/AbsenceForm.vue"
import type { Absence } from "~/types"

const { absences, employees, recordAbsence, updateStatus, deleteAbsence } =
  useAbsences()

const isCreateModalOpen = ref(false)
const selectedStatus = ref("all")

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Pending", value: "REQUESTED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
]

const filteredAbsences = computed(() => {
  if (selectedStatus.value === "all") return absences.value
  return absences.value.filter(
    (a: Absence) => a.status === selectedStatus.value
  )
})

const onSave = async (formData: Partial<Absence>) => {
  await recordAbsence(formData)
  isCreateModalOpen.value = false
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Absences</h1>
        <p class="text-gray-600 mt-1">
          Manage team absences and leave requests
        </p>
      </div>
      <UButton icon="i-heroicons-plus" @click="isCreateModalOpen = true">
        Record Absence
      </UButton>
    </div>

    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="font-semibold">Absence Records</h2>
          <USelectMenu
            v-model="selectedStatus"
            :options="statusFilters"
            value-attribute="value"
            option-attribute="label"
            class="w-40"
          />
        </div>
      </template>

      <div
        v-if="filteredAbsences.length === 0"
        class="text-center py-12 text-gray-500"
      >
        No absences found
      </div>

      <div v-else class="space-y-4">
        <AbsenceCard
          v-for="absence in filteredAbsences"
          :key="absence.id"
          :absence="absence"
          show-employee
          show-approval-actions
          @approve="(id) => updateStatus(id, 'APPROVED')"
          @reject="(id) => updateStatus(id, 'REJECTED')"
          @delete="deleteAbsence"
        />
      </div>
    </UCard>

    <UModal v-model="isCreateModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Record Absence</h3>
        </template>
        <AbsenceForm
          :employees="employees"
          @save="onSave"
          @cancel="isCreateModalOpen = false"
        />
      </UCard>
    </UModal>
  </div>
</template>
