<script setup lang="ts">
import ScheduleCalendar from "~/components/schedule/ScheduleCalender.vue"
import ScheduleDay from "~/components/schedule/ScheduleDay.vue"

const { currentDate, viewMode, teamSchedule, navigate, setAvailability } =
  useSchedule()

const isAvailabilityModalOpen = ref(false)
const selectedEmployee = ref<any>(null)
const availabilityData = ref({
  date: "",
  capacityHours: 8,
  note: "",
})

const openAvailabilityModal = (employee: any, day: any) => {
  selectedEmployee.value = employee
  availabilityData.value = {
    date: day.date,
    capacityHours: day.effectiveCapacityHours,
    note: "",
  }
  isAvailabilityModalOpen.value = true
}

const onSetAvailability = async (formData: any) => {
  await setAvailability({
    employeeId: selectedEmployee.value.employeeId,
    ...formData,
    note: formData.note || null,
  })
  isAvailabilityModalOpen.value = false
}

const goToToday = () => {
  currentDate.value = new Date()
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Team Schedule</h1>
      <p class="text-gray-600 mt-1">Team availability overview</p>
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
  </div>
</template>
