<script setup lang="ts">
import { format } from "date-fns"
import { GET_ABSENCES, GET_EMPLOYEES } from "~/graphql/queries"
import {
  RECORD_ABSENCE,
  UPDATE_ABSENCE_STATUS,
  DELETE_ABSENCE,
} from "~/graphql/mutations"

const toast = useToast()

const nuxtApp = useNuxtApp()
const apolloClient = nuxtApp.$apollo.defaultClient

// Initial data fetch
const { data: absencesData, refresh: refreshAbsences } = await useAsyncQuery(
  GET_ABSENCES
)
const { data: employeesData } = await useAsyncQuery(GET_EMPLOYEES)

const absences = computed(() => absencesData.value?.absences || [])
const employees = computed(() => employeesData.value?.employees || [])

// UI and Form state
const isCreateModalOpen = ref(false)
const selectedStatus = ref("all")
const form = ref({
  employeeId: "",
  type: "PAID_LEAVE",
  startDate: "",
  endDate: "",
  comment: "",
})

const absenceTypes = [
  { label: "Paid Leave", value: "PAID_LEAVE" },
  { label: "Sick Leave", value: "SICK_LEAVE" },
  { label: "Training", value: "TRAINING" },
  { label: "Unpaid Leave", value: "UNPAID_LEAVE" },
  { label: "RTT", value: "RTT" },
  { label: "Other", value: "OTHER" },
]

const absenceStatuses = [
  { label: "Requested", value: "REQUESTED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
]

const statusFilters = [
  { label: "All", value: "all" },
  { label: "Pending", value: "REQUESTED" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
]

// Filtering
const filteredAbsences = computed(() => {
  if (selectedStatus.value === "all") return absences.value
  return absences.value.filter((a) => a.status === selectedStatus.value)
})

const resetForm = () => {
  form.value = {
    employeeId: "",
    type: "PAID_LEAVE",
    startDate: "",
    endDate: "",
    comment: "",
  }
}

// Create absence
const createAbsence = async () => {
  try {
    await apolloClient.mutate({
      mutation: RECORD_ABSENCE,
      variables: { input: form.value },
    })

    toast.add({ title: "Absence recorded successfully", color: "green" })
    isCreateModalOpen.value = false
    resetForm()
    await refreshAbsences({ force: true })
  } catch (error: any) {
    toast.add({ title: "Error", description: error.message, color: "red" })
  }
}

// Update absence status
const approveAbsence = async (absenceId: string) => {
  try {
    await apolloClient.mutate({
      mutation: UPDATE_ABSENCE_STATUS,
      variables: {
        input: { absenceId, status: "APPROVED" },
      },
    })

    toast.add({ title: "Absence approved", color: "green" })
    await refreshAbsences({ force: true })
  } catch (error: any) {
    toast.add({ title: "Error", description: error.message, color: "red" })
  }
}

const rejectAbsence = async (absenceId: string) => {
  try {
    await apolloClient.mutate({
      mutation: UPDATE_ABSENCE_STATUS,
      variables: {
        input: { absenceId, status: "REJECTED" },
      },
    })

    toast.add({ title: "Absence rejected", color: "yellow" })
    await refreshAbsences({ force: true })
  } catch (error: any) {
    toast.add({ title: "Error", description: error.message, color: "red" })
  }
}

// Delete absence
const deleteAbsence = async (id: string) => {
  try {
    await apolloClient.mutate({
      mutation: DELETE_ABSENCE,
      variables: { id },
    })

    toast.add({ title: "Absence deleted", color: "green" })
    await refreshAbsences({ force: true })
  } catch (error: any) {
    toast.add({ title: "Error", description: error.message, color: "red" })
  }
}

// UI helpers
const getStatusColor = (status: string) => {
  if (status === "APPROVED") return "green"
  if (status === "REJECTED") return "red"
  return "yellow"
}

const getTypeLabel = (type: string) => {
  return absenceTypes.find((t) => t.value === type)?.label ?? type
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
        <div
          v-for="absence in filteredAbsences"
          :key="absence.id"
          class="border rounded-lg p-4 hover:bg-gray-50 transition"
        >
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
                  @click="approveAbsence(absence.id)"
                >
                  Approve
                </UButton>
                <UButton
                  icon="i-heroicons-x-mark"
                  size="sm"
                  color="red"
                  variant="outline"
                  @click="rejectAbsence(absence.id)"
                >
                  Reject
                </UButton>
              </template>
              <UButton
                icon="i-heroicons-trash"
                size="sm"
                variant="ghost"
                color="gray"
                @click="deleteAbsence(absence.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <UModal v-model="isCreateModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Record Absence</h3>
        </template>

        <form @submit.prevent="createAbsence" class="space-y-4">
          <UFormGroup label="Employee" required>
            <USelectMenu
              v-model="form.employeeId"
              :options="employees.map((e: any) => ({ label: e.name, value: e.id }))"
              value-attribute="value"
              option-attribute="label"
              placeholder="Select employee"
            />
          </UFormGroup>

          <UFormGroup label="Absence Type" required>
            <USelectMenu
              v-model="form.type"
              :options="absenceTypes"
              value-attribute="value"
              option-attribute="label"
            />
          </UFormGroup>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Start Date" required>
              <UInput v-model="form.startDate" type="date" />
            </UFormGroup>

            <UFormGroup label="End Date" required>
              <UInput v-model="form.endDate" type="date" />
            </UFormGroup>
          </div>

          <UFormGroup label="Comment">
            <UTextarea v-model="form.comment" placeholder="Optional notes..." />
          </UFormGroup>

          <div class="flex justify-end gap-3 pt-4">
            <UButton variant="ghost" @click="isCreateModalOpen = false"
              >Cancel</UButton
            >
            <UButton type="submit">Record Absence</UButton>
          </div>
        </form>
      </UCard>
    </UModal>
  </div>
</template>
