<script setup lang="ts">
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  parseISO,
} from "date-fns"
import { GET_TEAM_SCHEDULE } from "~/graphql/queries"

const currentDate = ref(new Date())
const viewMode = ref<"week" | "month">("week")

// Reactive date range for query
const dateRange = computed(() => {
  if (viewMode.value === "week") {
    const start = new Date(currentDate.value)
    const end = new Date(currentDate.value)
    end.setDate(start.getDate() + 6)

    return {
      start: start.toISOString(),
      end: end.toISOString(),
    }
  }

  return {
    start: startOfMonth(currentDate.value).toISOString(),
    end: endOfMonth(currentDate.value).toISOString(),
  }
})

// Reactive Variables
const variables = computed(() => ({
  startDate: dateRange.value.start,
  endDate: dateRange.value.end,
}))

const { data: scheduleData } = await useAsyncQuery(GET_TEAM_SCHEDULE, variables)

const teamSchedule = computed(() => scheduleData.value?.teamSchedule ?? [])
const days = computed(() => teamSchedule.value.map((d) => parseISO(d.date)))

// Transform to Employee rows
const employeeRows = computed(() => {
  const map = new Map<string, any>()

  teamSchedule.value.forEach((day) => {
    day.employees.forEach((es) => {
      const id = es.employee.id

      if (!map.has(id)) {
        map.set(id, {
          employeeId: id,
          employeeName: es.employee.name,
          employeeRole: es.employee.role,
          days: [],
        })
      }

      map.get(id).days.push({
        date: day.date,
        isAbsent: es.isAbsent,
        effectiveCapacityHours: es.effectiveCapacityHours,
      })
    })
  })

  return Array.from(map.values())
})

// Navigation
const navigate = (direction: "prev" | "next") => {
  if (viewMode.value === "week") {
    currentDate.value =
      direction === "next"
        ? addWeeks(currentDate.value, 1)
        : subWeeks(currentDate.value, 1)
  } else {
    currentDate.value =
      direction === "next"
        ? addMonths(currentDate.value, 1)
        : subMonths(currentDate.value, 1)
  }
}

const goToToday = () => {
  currentDate.value = new Date()
}

const getDayClass = (isAbsent: boolean) =>
  isAbsent ? "bg-red-500" : "bg-brick-green/20"
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Team Schedule</h1>
      <p class="text-gray-600 mt-1">Team availability overview</p>
    </div>

    <UCard>
      <template #header>
        <div class="flex justify-between items-center gap-4">
          <div class="flex items-center gap-2">
            <UButton
              icon="i-heroicons-chevron-left"
              variant="ghost"
              @click="navigate('prev')"
            />
            <UButton variant="outline" @click="goToToday">Today</UButton>
            <UButton
              icon="i-heroicons-chevron-right"
              variant="ghost"
              @click="navigate('next')"
            />

            <span class="font-semibold ml-3">
              {{
                viewMode === "week"
                  ? `Week of ${format(currentDate, "MMM d, yyyy")}`
                  : format(currentDate, "MMMM yyyy")
              }}
            </span>
          </div>

          <UButtonGroup>
            <UButton
              :variant="viewMode === 'week' ? 'solid' : 'outline'"
              @click="viewMode = 'week'"
            >
              Week
            </UButton>
            <UButton
              :variant="viewMode === 'month' ? 'solid' : 'outline'"
              @click="viewMode = 'month'"
            >
              Month
            </UButton>
          </UButtonGroup>
        </div>
      </template>

      <div
        v-if="employeeRows.length === 0"
        class="text-center py-12 text-gray-500"
      >
        No schedule data available.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-max">
          <thead>
            <tr class="border-b">
              <th class="sticky left-0 bg-white p-2 text-left">Employee</th>
              <th
                v-for="date in days"
                :key="date.toISOString()"
                class="p-2 text-center text-sm"
              >
                <div>{{ format(date, "EEE") }}</div>
                <div>{{ format(date, "d") }}</div>
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="emp in employeeRows"
              :key="emp.employeeId"
              class="border-b"
            >
              <td class="sticky left-0 bg-white p-2">
                <div class="font-medium">{{ emp.employeeName }}</div>
                <div class="text-sm text-gray-500">{{ emp.employeeRole }}</div>
              </td>

              <td v-for="day in emp.days" :key="day.date" class="p-1">
                <div
                  class="h-8 rounded flex items-center justify-center text-sm font-medium"
                  :class="getDayClass(day.isAbsent)"
                >
                  <span v-if="!day.isAbsent">
                    {{ day.effectiveCapacityHours }}h
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <template #footer>
        <div class="flex gap-6 text-sm">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-brick-green/20 rounded"></div>
            <span>Available</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-red-500 rounded"></div>
            <span>Absent</span>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>
