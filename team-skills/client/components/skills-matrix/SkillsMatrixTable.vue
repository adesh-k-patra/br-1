<script setup lang="ts">
import { useVirtualList } from "@vueuse/core"
import type { CriticalSkill, SkillsMatrix } from "~/types"

const props = defineProps<{
  skillsMatrix: SkillsMatrix
}>()

const criticalSkillMap = computed(() => {
  const map: Record<string, CriticalSkill> = {}
  for (const cs of props.skillsMatrix.criticalSkills) {
    map[cs.skillId] = cs
  }
  return map
})

const isCriticalSkill = (skillId: string) =>
  !!criticalSkillMap.value[skillId]?.isCritical

const FIXED_COL_WIDTH = 200
const SKILL_COL_WIDTH = 100
const ROW_HEIGHT = 56

const levelStyles: Record<number, string> = {
  1: "bg-gray-100 text-gray-700 border-gray-200",
  2: "bg-green-100 text-green-700 border-green-200",
  3: "bg-blue-100 text-blue-700 border-blue-200 font-bold",
  4: "bg-purple-100 text-purple-700 border-purple-200 font-bold",
}

const getLevelClass = (level?: number) =>
  level ? levelStyles[level] : "bg-gray-50 text-gray-300"

const skillMatrixMap = computed(() => {
  const map: Record<string, Record<string, number>> = {}

  for (const emp of props.skillsMatrix.employees) {
    map[emp.id] = {}
    for (const s of emp.skills) {
      if (typeof s.level === "number") {
        map[emp.id][s.skillId] = s.level
      }
    }
  }

  return map
})

const shouldUseVirtualScrolling = computed(
  () => props.skillsMatrix.employees.length > 50,
)

const {
  list: virtualList,
  containerProps,
  wrapperProps,
} = useVirtualList(
  computed(() => props.skillsMatrix.employees),
  {
    itemHeight: ROW_HEIGHT,
    overscan: 5,
  },
)

const totalWidth = computed(() => {
  return FIXED_COL_WIDTH + props.skillsMatrix.skills.length * SKILL_COL_WIDTH
})
</script>

<template>
  <div class="overflow-x-auto border rounded-lg shadow-sm bg-white">
    <div class="overflow-x-auto" :style="{ maxWidth: '100%' }">
      <table
        class="text-sm text-left border-collapse"
        :style="{
          width: `${totalWidth}px`,
          tableLayout: 'fixed',
        }"
      >
        <thead class="bg-gray-50">
          <tr>
            <th
              class="pl-8 border-b font-semibold text-gray-900 sticky left-0 bg-gray-50 z-20"
              :style="{
                width: `${FIXED_COL_WIDTH}px`,
                minWidth: `${FIXED_COL_WIDTH}px`,
              }"
            >
              Employee
            </th>
            <th
              v-for="skill in skillsMatrix.skills"
              :key="skill.id"
              class="p-3 border-b font-semibold text-gray-900 text-center"
              :style="{
                width: `${SKILL_COL_WIDTH}px`,
                minWidth: `${SKILL_COL_WIDTH}px`,
              }"
            >
              <UPopover :popper="{ placement: 'bottom' }">
                <UButton
                  label="Open"
                  color="gray"
                  variant="ghost"
                  :padded="false"
                  class="w-full flex items-center gap-1 justify-center truncate"
                >
                  <span class="truncate" :title="skill.name">
                    {{ skill.name }}
                  </span>

                  <span
                    v-if="isCriticalSkill(skill.id)"
                    class="text-orange-500"
                    title="Critical skill"
                  >
                    ⚠️
                  </span>
                </UButton>

                <!-- Popover content -->
                <template #panel>
                  <div class="p-3 text-left space-y-1 max-w-[220px]">
                    <div class="text-xs text-gray-900">
                      Category: {{ skill.category }}
                    </div>

                    <div class="text-xs text-gray-900">
                      Employees:
                      {{ criticalSkillMap[skill.id]?.holderCount ?? 0 }}
                    </div>

                    <div class="text-xs text-gray-900">
                      Experts:
                      {{ criticalSkillMap[skill.id]?.expertCount ?? 0 }}
                    </div>

                    <div
                      v-if="criticalSkillMap[skill.id]?.isCritical"
                      class="text-sm font-medium text-orange-600 pt-1"
                    >
                      ⚠️ Marked as critical
                    </div>
                  </div>
                </template>
              </UPopover>
            </th>
          </tr>
        </thead>

        <!-- Regular rendering for small datasets -->
        <tbody v-if="!shouldUseVirtualScrolling">
          <tr
            v-for="employee in skillsMatrix.employees"
            :key="employee.id"
            class="hover:bg-gray-50 transition-colors"
            :style="{ height: `${ROW_HEIGHT}px` }"
          >
            <td
              class="p-3 border-b sticky left-0 bg-white z-10"
              :style="{
                width: `${FIXED_COL_WIDTH}px`,
                minWidth: `${FIXED_COL_WIDTH}px`,
              }"
            >
              <div class="flex items-center gap-2">
                <UAvatar :alt="employee.name" size="sm" />
                <div class="min-w-0 flex-1">
                  <div class="font-medium text-gray-900 truncate">
                    {{ employee.name }}
                  </div>
                  <div class="text-xs text-gray-500 truncate">
                    {{ employee.role }}
                  </div>
                </div>
              </div>
            </td>
            <td
              v-for="skill in skillsMatrix.skills"
              :key="skill.id"
              class="p-1 border-b text-center"
              :style="{
                width: `${SKILL_COL_WIDTH}px`,
                minWidth: `${SKILL_COL_WIDTH}px`,
              }"
            >
              <div
                :class="[
                  'h-10 flex items-center justify-center rounded border transition-all',
                  getLevelClass(skillMatrixMap[employee.id]?.[skill.id]),
                ]"
              >
                {{ skillMatrixMap[employee.id]?.[skill.id] ?? "-" }}
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Virtual scrolling for large datasets -->
        <tbody
          v-else
          v-bind="containerProps"
          :style="{ maxHeight: '600px', overflow: 'auto' }"
        >
          <tr :style="{ height: `${wrapperProps.style.height}` }">
            <td colspan="100%">
              <div v-bind="wrapperProps">
                <table
                  class="text-sm text-left border-collapse"
                  :style="{
                    width: `${totalWidth}px`,
                    tableLayout: 'fixed',
                  }"
                >
                  <tbody>
                    <tr
                      v-for="{ data: employee, index } in virtualList"
                      :key="employee.id"
                      class="hover:bg-gray-50 transition-colors"
                      :style="{ height: `${ROW_HEIGHT}px` }"
                    >
                      <td
                        class="p-3 border-b sticky left-0 bg-white z-10"
                        :style="{
                          width: `${FIXED_COL_WIDTH}px`,
                          minWidth: `${FIXED_COL_WIDTH}px`,
                        }"
                      >
                        <div class="flex items-center gap-2">
                          <UAvatar :alt="employee.name" size="xs" />
                          <div class="min-w-0 flex-1">
                            <div class="font-medium text-gray-900 truncate">
                              {{ employee.name }}
                            </div>
                            <div class="text-xs text-gray-500 truncate">
                              {{ employee.role }}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td
                        v-for="skill in skillsMatrix.skills"
                        :key="skill.id"
                        class="p-1 border-b text-center"
                        :style="{
                          width: `${SKILL_COL_WIDTH}px`,
                          minWidth: `${SKILL_COL_WIDTH}px`,
                        }"
                      >
                        <div
                          :class="[
                            'h-10 flex items-center justify-center rounded border transition-all',
                            getLevelClass(
                              skillMatrixMap[employee.id]?.[skill.id],
                            ),
                          ]"
                        >
                          {{ skillMatrixMap[employee.id]?.[skill.id] ?? "-" }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
