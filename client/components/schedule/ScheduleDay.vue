<script setup lang="ts">
import { format, parseISO } from "date-fns"
import type { TeamScheduleDay, TeamScheduleEmployee } from "~/types"

interface EmployeeRowDay {
  date: string
  isAbsent: boolean
  effectiveCapacityHours: number
}

interface EmployeeRow {
  employeeId: string
  employeeName?: string
  employeeRole?: string
  days: EmployeeRowDay[]
}

const props = defineProps<{
  currentDate: Date
  viewMode: "week" | "month"
  teamSchedule: TeamScheduleDay[]
}>()

const emit = defineEmits([
  "navigate",
  "today",
  "open-availability",
  "update:viewMode",
])

const days = computed(() => props.teamSchedule.map((d) => parseISO(d.date)))

const employeeRows = computed<EmployeeRow[]>(() => {
  const map = new Map<string, EmployeeRow>()
  props.teamSchedule.forEach((day) => {
    day.employees.forEach((es: TeamScheduleEmployee) => {
      const id = es.employee.id!
      if (!map.has(id)) {
        map.set(id, {
          employeeId: id,
          employeeName: es.employee.name,
          employeeRole: es.employee.role,
          days: [],
        })
      }
      map.get(id)!.days.push({
        date: day.date,
        isAbsent: es.isAbsent,
        effectiveCapacityHours: es.effectiveCapacityHours,
      })
    })
  })
  return Array.from(map.values())
})

const getDayClass = (isAbsent: boolean) =>
  isAbsent ? "bg-red-500" : "bg-brick-green/20"
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex justify-between items-center gap-4">
        <div class="flex items-center gap-2">
          <UButton
            icon="i-heroicons-chevron-left"
            variant="ghost"
            @click="emit('navigate', 'prev')"
          />
          <UButton variant="outline" @click="emit('today')">Today</UButton>
          <UButton
            icon="i-heroicons-chevron-right"
            variant="ghost"
            @click="emit('navigate', 'next')"
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
            @click="emit('update:viewMode', 'week')"
          >
            Week
          </UButton>
          <UButton
            :variant="viewMode === 'month' ? 'solid' : 'outline'"
            @click="emit('update:viewMode', 'month')"
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
          <tr v-for="emp in employeeRows" :key="emp.employeeId">
            <td class="sticky left-0 bg-white p-2">
              <div class="font-medium">{{ emp.employeeName }}</div>
              <div class="text-sm text-gray-500">{{ emp.employeeRole }}</div>
            </td>
            <td
              v-for="day in emp.days"
              :key="day.date"
              class="p-1 cursor-pointer"
              @click="emit('open-availability', emp, day)"
            >
              <div
                class="h-8 rounded flex items-center justify-center text-sm font-medium transition hover:ring-2 hover:ring-brick-green/40"
                :class="getDayClass(day.isAbsent)"
              >
                <span v-if="!day.isAbsent"
                  >{{ day.effectiveCapacityHours }}h</span
                >
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
</template>
