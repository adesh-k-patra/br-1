<script setup lang="ts">
import SkillsMatrixTable from "~/components/skills-matrix/SkillsMatrixTable.vue"
import { ComparisonOperator } from "~/types"

const { skillsMatrix, filters, resetFilters, exportCSV, exportLoading } =
  useSkillsMatrix()
const { skills } = useSkills()
const { handleError } = useErrorHandler()

const categories = computed(() => [
  ...new Set(skills.value.map((s) => s.category)),
])

const levelOptions = [
  {
    label: "Level ≥ 1",
    op: ComparisonOperator.GREATER_THAN_OR_EQUAL,
    value: 1,
  },
  {
    label: "Level ≥ 2",
    op: ComparisonOperator.GREATER_THAN_OR_EQUAL,
    value: 2,
  },
  {
    label: "Level ≥ 3",
    op: ComparisonOperator.GREATER_THAN_OR_EQUAL,
    value: 3,
  },
  {
    label: "Level ≥ 4",
    op: ComparisonOperator.GREATER_THAN_OR_EQUAL,
    value: 4,
  },
  { label: "Level = 1", op: ComparisonOperator.EQUAL, value: 1 },
  { label: "Level = 2", op: ComparisonOperator.EQUAL, value: 2 },
  { label: "Level = 3", op: ComparisonOperator.EQUAL, value: 3 },
  { label: "Level = 4", op: ComparisonOperator.EQUAL, value: 4 },
  { label: "Level ≤ 1", op: ComparisonOperator.LESS_THAN_OR_EQUAL, value: 1 },
  { label: "Level ≤ 2", op: ComparisonOperator.LESS_THAN_OR_EQUAL, value: 2 },
  { label: "Level ≤ 3", op: ComparisonOperator.LESS_THAN_OR_EQUAL, value: 3 },
  { label: "Level ≤ 4", op: ComparisonOperator.LESS_THAN_OR_EQUAL, value: 4 },
]

const selectedLevel = computed({
  get: () => {
    if (!filters.value.level) return null
    return levelOptions.find(
      (opt) =>
        opt.op === filters.value.level?.op &&
        opt.value === filters.value.level?.value,
    )
  },
  set: (option) => {
    if (option) {
      filters.value.level = { op: option.op, value: option.value }
    } else {
      filters.value.level = undefined
    }
  },
})

const hasActiveFilters = computed(
  () =>
    filters.value.category !== undefined || filters.value.level !== undefined,
)

const handleExportCSV = async () => {
  try {
    await exportCSV()
  } catch (e) {
    handleError(e)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Skills Matrix</h1>
        <p class="text-gray-600 mt-1">
          Visualize team capabilities and identify gaps
        </p>
      </div>

      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:flex-nowrap">
        <!-- Category Filter -->
        <USelectMenu
          v-model="filters.category"
          :options="categories"
          placeholder="Filter by Skill Category"
          :clearable="true"
          class="w-full sm:w-48"
        />

        <!-- Level Filter -->
        <USelectMenu
          v-model="selectedLevel"
          :options="levelOptions"
          option-attribute="label"
          placeholder="Filter by Level"
          clearable
          class="w-full sm:w-44"
        />

        <!-- Action Buttons -->
        <div class="flex gap-2">
          <UButton
            size="sm"
            variant="outline"
            :disabled="!hasActiveFilters"
            color="gray"
            class="flex-1 sm:flex-none"
            @click="resetFilters"
          >
            Reset Filters
          </UButton>

          <UButton
            size="sm"
            color="primary"
            :loading="exportLoading"
            :disabled="!skillsMatrix"
            class="flex-1 sm:flex-none"
            @click="handleExportCSV"
          >
            <UIcon name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
            Export CSV
          </UButton>
        </div>
      </div>
    </div>

    <div v-if="!skillsMatrix && !skillsMatrix" class="py-24 text-center">
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin mx-auto text-gray-400"
      />
      <p class="mt-2 text-gray-500">Loading matrix...</p>
    </div>

    <div v-else-if="skillsMatrix" class="space-y-8">
      <!-- Matrix Table -->
      <SkillsMatrixTable :skillsMatrix="skillsMatrix" />
    </div>
  </div>
</template>
