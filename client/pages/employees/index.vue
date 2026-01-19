<script setup lang="ts">
import EmployeeForm from "~/components/employees/EmployeeForm.vue"
import EmployeeTable from "~/components/employees/EmployeeTable.vue"

const { employees, createEmployee, updateEmployee, deleteEmployee } =
  await useEmployees()

const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const editingEmployee = ref<any>(null)
const deletingEmployee = ref<any>(null)

const openCreateModal = () => {
  editingEmployee.value = null
  isModalOpen.value = true
}

const openEditModal = (employee: any) => {
  editingEmployee.value = employee
  isModalOpen.value = true
}

const openDeleteModal = (employee: any) => {
  deletingEmployee.value = employee
  isDeleteModalOpen.value = true
}

const onSave = async (formData: any) => {
  if (editingEmployee.value) {
    await updateEmployee(editingEmployee.value.id, formData)
  } else {
    await createEmployee(formData)
  }
  isModalOpen.value = false
}

const onDelete = async () => {
  if (deletingEmployee.value) {
    await deleteEmployee(deletingEmployee.value.id)
  }
  isDeleteModalOpen.value = false
}

const columns = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "capacity", label: "Daily Capacity" },
  { key: "actions", label: "Actions" },
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Employees</h1>
        <p class="text-gray-600 mt-1">Manage your team members</p>
      </div>
      <UButton icon="i-heroicons-plus" @click="openCreateModal">
        Add Employee
      </UButton>
    </div>

    <UCard>
      <div v-if="employees.length === 0" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <UIcon name="i-heroicons-users" class="w-16 h-16 mx-auto" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No employees yet</h3>
        <p class="text-gray-500 mb-4">
          Get started by adding your first team member
        </p>
        <UButton @click="openCreateModal">Add Employee</UButton>
      </div>

      <EmployeeTable
        v-else
        :employees="employees"
        :columns="columns"
        @edit="openEditModal"
        @delete="openDeleteModal"
      />
    </UCard>

    <UModal v-model="isModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingEmployee ? "Edit Employee" : "Add Employee" }}
          </h3>
        </template>
        <EmployeeForm
          :employee="editingEmployee"
          @save="onSave"
          @cancel="isModalOpen = false"
        />
      </UCard>
    </UModal>

    <UModal v-model="isDeleteModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-red-600">Delete Employee</h3>
        </template>
        <p class="text-gray-600">
          Are you sure you want to delete
          <strong>{{ deletingEmployee?.name }}</strong
          >? This will also delete all their absences and availability records.
        </p>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton variant="ghost" @click="isDeleteModalOpen = false"
              >Cancel</UButton
            >
            <UButton color="red" @click="onDelete">Delete</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
