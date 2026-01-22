<script setup lang="ts">
import EmployeeTable from "~/components/employees/EmployeeTable.vue"
import type { Employee } from "~/types"

const { employees } = useEmployees()

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "capacity", label: "Daily Capacity" },
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Employees</h1>
        <p class="text-gray-600 mt-1">Select to employee to assign skills</p>
      </div>
    </div>

    <UCard>
      <div v-if="employees.length === 0" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <UIcon name="i-heroicons-users" class="w-16 h-16 mx-auto" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No employees yet</h3>
      </div>

      <EmployeeTable v-else :employees="employees" :columns="columns" />
    </UCard>
  </div>
</template>
