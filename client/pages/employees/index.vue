<script setup lang="ts">
import { GET_EMPLOYEES } from "~/graphql/queries"
import {
  CREATE_EMPLOYEE,
  UPDATE_EMPLOYEE,
  DELETE_EMPLOYEE,
} from "~/graphql/mutations"

const toast = useToast()
const nuxtApp = useNuxtApp()
const apolloClient = nuxtApp.$apollo.defaultClient

const { data, refresh } = await useAsyncQuery(
  GET_EMPLOYEES,
  {},
  { fetchPolicy: "network-only" }
)

const employees = computed(() => data.value?.employees || [])

// Modal and UI State
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const editingEmployee = ref<any>(null)
const deletingEmployee = ref<any>(null)

const form = ref({
  name: "",
  email: "",
  role: "",
  defaultDailyCapacityHours: 8,
})

const resetForm = () => {
  form.value = {
    name: "",
    email: "",
    role: "",
    defaultDailyCapacityHours: 8,
  }
  editingEmployee.value = null
}

// Modal Handlers
const openCreateModal = () => {
  resetForm()
  isModalOpen.value = true
}

const openEditModal = (employee: any) => {
  editingEmployee.value = employee
  form.value = {
    name: employee.name,
    email: employee.email,
    role: employee.role,
    defaultDailyCapacityHours: employee.defaultDailyCapacityHours,
  }
  isModalOpen.value = true
}

const openDeleteModal = (employee: any) => {
  deletingEmployee.value = employee
  isDeleteModalOpen.value = true
}

// Create/Update/Delete Employee
const saveEmployee = async () => {
  try {
    if (editingEmployee.value) {
      await apolloClient.mutate({
        mutation: UPDATE_EMPLOYEE,
        variables: {
          input: {
            id: editingEmployee.value.id,
            ...form.value,
          },
        },
        refetchQueries: [{ query: GET_EMPLOYEES }],
        awaitRefetchQueries: true,
      })
      toast.add({ title: "Employee updated successfully", color: "green" })
    } else {
      await apolloClient.mutate({
        mutation: CREATE_EMPLOYEE,
        variables: {
          input: form.value,
        },
        refetchQueries: [{ query: GET_EMPLOYEES }],
        awaitRefetchQueries: true,
      })
      toast.add({ title: "Employee created successfully", color: "green" })
    }
    isModalOpen.value = false
    resetForm()
    await refresh()
  } catch (error: any) {
    toast.add({ title: "Error", description: error.message, color: "red" })
  }
}

const deleteEmployee = async () => {
  try {
    await apolloClient.mutate({
      mutation: DELETE_EMPLOYEE,
      variables: {
        id: deletingEmployee.value.id,
      },
      refetchQueries: [{ query: GET_EMPLOYEES }],
      awaitRefetchQueries: true,
    })
    toast.add({ title: "Employee deleted successfully", color: "green" })
    isDeleteModalOpen.value = false
    deletingEmployee.value = null
    await refresh()
  } catch (error: any) {
    toast.add({ title: "Error", description: error.message, color: "red" })
  }
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

      <UTable v-else :columns="columns" :rows="employees">
        <template #name-data="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar :alt="row.name" size="sm" />
            <span class="font-medium">{{ row.name }}</span>
          </div>
        </template>

        <template #capacity-data="{ row }">
          {{ row.defaultDailyCapacityHours }}h/day
        </template>

        <template #actions-data="{ row }">
          <div class="flex gap-2">
            <UButton
              icon="i-heroicons-pencil"
              size="sm"
              variant="ghost"
              @click="openEditModal(row)"
            />
            <UButton
              icon="i-heroicons-trash"
              size="sm"
              variant="ghost"
              color="red"
              @click="openDeleteModal(row)"
            />
          </div>
        </template>
      </UTable>
    </UCard>

    <UModal v-model="isModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingEmployee ? "Edit Employee" : "Add Employee" }}
          </h3>
        </template>

        <form @submit.prevent="saveEmployee" class="space-y-4">
          <UFormGroup label="Name" required>
            <UInput v-model="form.name" placeholder="John Doe" />
          </UFormGroup>

          <UFormGroup label="Email" required>
            <UInput
              v-model="form.email"
              type="email"
              placeholder="john@company.com"
            />
          </UFormGroup>

          <UFormGroup label="Role" required>
            <UInput
              v-model="form.role"
              placeholder="e.g., Technician, Developer"
            />
          </UFormGroup>

          <UFormGroup label="Daily Capacity (hours)">
            <UInput
              v-model.number="form.defaultDailyCapacityHours"
              type="number"
              min="0"
              max="24"
            />
          </UFormGroup>

          <div class="flex justify-end gap-3 pt-4">
            <UButton variant="ghost" @click="isModalOpen = false"
              >Cancel</UButton
            >
            <UButton type="submit">
              {{ editingEmployee ? "Update" : "Create" }}
            </UButton>
          </div>
        </form>
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
            <UButton color="red" @click="deleteEmployee">Delete</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
