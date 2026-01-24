<script setup lang="ts">
import ExportScheduleForm from "~/components/schedule/ExportScheduleForm.vue"
import ScheduleCalendar from "~/components/schedule/ScheduleCalender.vue"
import ScheduleDay from "~/components/schedule/ScheduleDay.vue"
import type { Employee, Availability } from "~/types"

const { currentDate, viewMode, teamSchedule, navigate, setAvailability } =
  useSchedule()

const { exportScheduleCSV, exportLoading } = useScheduleExport()

const isAvailabilityModalOpen = ref(false)
const isExportModalOpen = ref(false)

const selectedEmployee = ref<{
  employeeId: string
  employeeName?: string
  employeeRole?: string
} | null>(null)
const availabilityData = ref({
  date: "",
  capacityHours: 8,
  note: "",
})

const openAvailabilityModal = (
  employee: {
    employeeId: string
    employeeName?: string
    employeeRole?: string
  },
  day: { date: string; effectiveCapacityHours: number },
) => {
  selectedEmployee.value = employee
  availabilityData.value = {
    date: day.date,
    capacityHours: day.effectiveCapacityHours,
    note: "",
  }
  isAvailabilityModalOpen.value = true
}

const onSetAvailability = async (formData: Partial<Availability>) => {
  if (selectedEmployee.value) {
    await setAvailability({
      employeeId: selectedEmployee.value.employeeId,
      ...formData,
      note: formData.note || undefined,
    })
  }
  isAvailabilityModalOpen.value = false
}

const handleExportCSV = async (formData: {
  startDate: string
  endDate: string
}) => {
  await exportScheduleCSV(formData.startDate, formData.endDate)
  isExportModalOpen.value = false
}

const goToToday = () => {
  currentDate.value = new Date()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Team Schedule</h1>
        <p class="text-gray-600 mt-1">Team availability overview</p>
      </div>

      <UButton
        size="sm"
        color="primary"
        :loading="exportLoading"
        :disabled="!teamSchedule || teamSchedule.length === 0"
        @click="isExportModalOpen = true"
      >
        <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
        Export CSV
      </UButton>
    </div>

    <ScheduleCalendar
      v-model:view-mode="viewMode"
      :current-date="currentDate"
      :team-schedule="teamSchedule"
      @navigate="navigate"
      @today="goToToday"
      @open-availability="openAvailabilityModal"
    />

    <UModal v-model="isAvailabilityModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Set Availability</h3>
          <p class="text-sm text-gray-500">
            {{ selectedEmployee?.employeeName }} ({{
              selectedEmployee?.employeeRole
            }})
          </p>
        </template>

        <ScheduleDay
          :initial-data="availabilityData"
          @save="onSetAvailability"
          @cancel="isAvailabilityModalOpen = false"
        />
      </UCard>
    </UModal>

    <UModal v-model="isExportModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Export Team Schedule</h3>
          <p class="text-sm text-gray-500">
            Select the period to export for payroll and team load analysis
          </p>
        </template>

        <ExportScheduleForm
          @export="handleExportCSV"
          @cancel="isExportModalOpen = false"
        />
      </UCard>
    </UModal>
  </div>
</template>
