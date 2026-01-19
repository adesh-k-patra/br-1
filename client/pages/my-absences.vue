<script setup lang="ts">
import AbsenceCard from "~/components/absences/AbsenceCard.vue"
import AbsenceForm from "~/components/absences/AbsenceForm.vue"
import type { Absence } from "~/types"

const { myAbsences, requestAbsence, deleteAbsence } = useAbsences()

const isModalOpen = ref(false)
const selectedStatus = ref("all")

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Pending", value: "REQUESTED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
]

const filteredAbsences = computed(() => {
  if (selectedStatus.value === "all") return myAbsences.value
  return myAbsences.value.filter(
    (a: Absence) => a.status === selectedStatus.value
  )
})

const onSave = async (formData: Partial<Absence>) => {
  await requestAbsence(formData)
  isModalOpen.value = false
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">My Absences</h1>
        <p class="text-gray-600 mt-1">Manage your leave requests</p>
      </div>
      <UButton icon="i-heroicons-plus" @click="isModalOpen = true">
        Request Absence
      </UButton>
    </div>

    <UCard>
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="font-semibold">My Absence Requests</h2>
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
        You don't have any absences yet.
      </div>

      <div v-else class="space-y-4">
        <AbsenceCard
          v-for="absence in filteredAbsences"
          :key="absence.id"
          :absence="absence"
          :show-employee="false"
          :show-approval-actions="false"
          @delete="deleteAbsence"
        />
      </div>
    </UCard>

    <UModal v-model="isModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Request Absence</h3>
        </template>
        <AbsenceForm
          is-employee-view
          @save="onSave"
          @cancel="isModalOpen = false"
        />
      </UCard>
    </UModal>
  </div>
</template>
