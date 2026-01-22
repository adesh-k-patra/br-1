<script setup lang="ts">
import SkillForm from "~/components/skills/SkillForm.vue"
import SkillTable from "~/components/skills/SkillTable.vue"
import type { Employee, Skill } from "~/types"

const { skills, createSkill, updateSkill, deleteSkill } = useSkills()

const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const editingSkill = ref<Skill | null>(null)
const deletingSkill = ref<Skill | null>(null)

const openCreateModal = () => {
  editingSkill.value = null
  isModalOpen.value = true
}

const openEditModal = (skill: Skill) => {
  editingSkill.value = skill
  isModalOpen.value = true
}

const openDeleteModal = (skill: Skill) => {
  deletingSkill.value = skill
  isDeleteModalOpen.value = true
}

const onSave = async (formData: Partial<Skill>) => {
  if (editingSkill.value) {
    await updateSkill(editingSkill.value.id, formData)
  } else {
    await createSkill(formData)
  }
  isModalOpen.value = false
}

const onDelete = async () => {
  if (deletingSkill.value) {
    await deleteSkill(deletingSkill.value.id)
  }
  isDeleteModalOpen.value = false
}

const columns = [
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  { key: "description", label: "Description" },
  { key: "actions", label: "Actions" },
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Skills</h1>
        <p class="text-gray-600 mt-1">Manage all your skills</p>
      </div>
      <UButton icon="i-heroicons-plus" @click="openCreateModal">
        Add Skill
      </UButton>
    </div>

    <UCard>
      <div v-if="skills.length === 0" class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <UIcon name="i-heroicons-users" class="w-16 h-16 mx-auto" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          No skills added yet
        </h3>
        <p class="text-gray-500 mb-4">Get started by adding the first skill</p>
        <UButton @click="openCreateModal">Add Skill</UButton>
      </div>

      <SkillTable
        v-else
        :skills="skills"
        :columns="columns"
        @edit="openEditModal"
        @delete="openDeleteModal"
      />
    </UCard>

    <UModal v-model="isModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            {{ editingSkill ? "Edit Skill" : "Add Skill" }}
          </h3>
        </template>
        <SkillForm
          :skill="editingSkill"
          @save="onSave"
          @cancel="isModalOpen = false"
        />
      </UCard>
    </UModal>

    <UModal v-model="isDeleteModalOpen">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-red-600">Delete Skill</h3>
        </template>
        <p class="text-gray-600">
          Are you sure you want to delete
          <strong>{{ deletingSkill?.name }}</strong
          >?
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
