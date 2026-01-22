<script setup lang="ts">
import EmployeeSkillForm from "~/components/employee-skills/EmployeeSkillForm.vue"
import EmployeeSkillTable from "~/components/employee-skills/EmployeeSkillTable.vue"
import type { EmployeeSkill } from "~/types"

const route = useRoute()
const employeeId = route.params.id as string

const { getEmployeeById } = useEmployees()
const employee = getEmployeeById(employeeId)
const { skills } = useSkills()
const { employeeSkills, assignSkill, updateEmployeeSkill, unassignSkill } =
  useEmployeeSkills(employeeId)

const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const editingEmployeeSkill = ref<EmployeeSkill | null>(null)
const deletingEmployeeSkill = ref<EmployeeSkill | null>(null)

const openAssignModal = () => {
  editingEmployeeSkill.value = null
  isModalOpen.value = true
}

const openEditModal = (employeeSkill: EmployeeSkill) => {
  editingEmployeeSkill.value = employeeSkill
  isModalOpen.value = true
}

const openDeleteModal = (employeeSkill: EmployeeSkill) => {
  deletingEmployeeSkill.value = employeeSkill
  isDeleteModalOpen.value = true
}

const onSave = async (formData: Partial<EmployeeSkill>) => {
  if (editingEmployeeSkill.value) {
    await updateEmployeeSkill(
      editingEmployeeSkill.value.id,
      formData.level as number,
    )
  } else {
    await assignSkill(formData.skillId as string, formData.level as number)
  }
  isModalOpen.value = false
}

const onDelete = async () => {
  if (deletingEmployeeSkill.value) {
    await unassignSkill(deletingEmployeeSkill.value.id)
  }
  isDeleteModalOpen.value = false
}

const columns = [
  { key: "name", label: "Name" },
  { key: "level", label: "Level" },
  { key: "category", label: "Category" },
  { key: "description", label: "Description" },
  { key: "actions", label: "Actions" },
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Employee Skills</h1>
        <p class="text-gray-600 mt-1">
          Manage all the skills of {{ employee?.name || "employee" }}
        </p>
      </div>
      <UButton icon="i-heroicons-plus" @click="openAssignModal">
        Assign Skill
      </UButton>
    </div>

    <UCard>
      <div v-if="employeeSkills.length === 0" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <UIcon name="i-heroicons-users" class="w-16 h-16 mx-auto" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          No skills assigned yet
        </h3>
        <p class="text-gray-500 mb-4">
          Get started by assign skill to {{ employee?.name || "employee" }}
        </p>
        <UButton @click="openAssignModal">Assign Skill</UButton>
      </div>

      <EmployeeSkillTable
        v-else
        :employee-skills="employeeSkills"
        :columns="columns"
        @edit="openEditModal"
        @delete="openDeleteModal"
      />
    </UCard>

    <UModal v-model="isModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{
              editingEmployeeSkill ? "Update Employee Skill" : "Assign Skill"
            }}
          </h3>
        </template>
        <EmployeeSkillForm
          :skills="skills"
          :employeeSkill="editingEmployeeSkill"
          @save="onSave"
          @cancel="isModalOpen = false"
        />
      </UCard>
    </UModal>

    <UModal v-model="isDeleteModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-red-600">Remove Skill</h3>
        </template>
        <p class="text-gray-600">
          Are you sure you want to remove
          <strong>{{ deletingEmployeeSkill?.skill?.name }}</strong
          >?
        </p>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton variant="ghost" @click="isDeleteModalOpen = false"
              >Cancel</UButton
            >
            <UButton color="red" @click="onDelete">Remove</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
