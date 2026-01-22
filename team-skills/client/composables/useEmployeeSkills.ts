import { provideApolloClient, useQuery } from "@vue/apollo-composable"
import { GET_EMPLOYEE_SKILLS } from "~/graphql/queries"
import {
  ASSIGN_SKILL,
  UNASSIGN_SKILL,
  UPDATE_EMPLOYEE_SKILL,
} from "~/graphql/mutations"
import type { EmployeeSkill } from "~/types"

export const useEmployeeSkills = (employeeId?: string) => {
  const toast = useToast()
  const nuxtApp = useNuxtApp()
  const { handleError } = useErrorHandler()
  const apolloClient = nuxtApp.$apollo.defaultClient

  const { result: employeeSkillsResult } = provideApolloClient(apolloClient)(
    () =>
      useQuery<{ employeeSkills: EmployeeSkill[] }>(
        GET_EMPLOYEE_SKILLS,
        {
          employeeId: employeeId || "",
        },
        {
          enabled: !!employeeId,
        },
      ),
  )

  const employeeSkills = computed(
    () => employeeSkillsResult.value?.employeeSkills || [],
  )

  const assignSkill = async (skillId: string, level: number) => {
    if (!employeeId) return

    try {
      await apolloClient.mutate<{ assignSkill: EmployeeSkill }>({
        mutation: ASSIGN_SKILL,
        variables: {
          input: { employeeId, skillId, level },
        },
        update: (cache, { data }) => {
          if (!data?.assignSkill) return

          const newEmployeeSkill = data.assignSkill

          const existing = cache.readQuery<{ employeeSkills: EmployeeSkill[] }>(
            {
              query: GET_EMPLOYEE_SKILLS,
              variables: { employeeId },
            },
          )

          if (existing) {
            cache.writeQuery({
              query: GET_EMPLOYEE_SKILLS,
              variables: { employeeId },
              data: {
                employeeSkills: [...existing.employeeSkills, newEmployeeSkill],
              },
            })
          }
        },
      })

      toast.add({ title: "Skill assigned successfully", color: "green" })
    } catch (e) {
      handleError(e)
    }
  }

  const updateEmployeeSkill = async (id: string, level: number) => {
    try {
      await apolloClient.mutate<{ updateEmployeeSkill: EmployeeSkill }>({
        mutation: UPDATE_EMPLOYEE_SKILL,
        variables: {
          input: { id, level },
        },
        update: (cache, { data }) => {
          if (!data?.updateEmployeeSkill) return

          cache.modify({
            id: cache.identify(data.updateEmployeeSkill as any),
            fields: {
              level: () => data.updateEmployeeSkill.level,
            },
          })
        },
      })

      toast.add({
        title: "Employee Skill updated successfully",
        color: "green",
      })
    } catch (e) {
      handleError(e)
    }
  }

  const unassignSkill = async (id: string) => {
    if (!employeeId) return

    try {
      await apolloClient.mutate({
        mutation: UNASSIGN_SKILL,
        variables: { id },
        update: (cache) => {
          const existing = cache.readQuery<{ employeeSkills: EmployeeSkill[] }>(
            {
              query: GET_EMPLOYEE_SKILLS,
              variables: { employeeId },
            },
          )

          if (existing) {
            cache.writeQuery({
              query: GET_EMPLOYEE_SKILLS,
              variables: { employeeId },
              data: {
                employeeSkills: existing.employeeSkills.filter(
                  (es) => es.id !== id,
                ),
              },
            })
          }

          cache.evict({
            id: cache.identify({ __typename: "EmployeeSkill", id }),
          })

          cache.gc()
        },
      })

      toast.add({ title: "Skill assignment removed", color: "green" })
    } catch (e) {
      handleError(e)
    }
  }

  return {
    employeeSkills,
    assignSkill,
    updateEmployeeSkill,
    unassignSkill,
  }
}
