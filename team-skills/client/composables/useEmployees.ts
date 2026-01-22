import { provideApolloClient } from "@vue/apollo-composable"
import { GET_EMPLOYEES } from "~/graphql/queries"
import type { Employee } from "~/types"

export const useEmployees = () => {
  const toast = useToast()
  const nuxtApp = useNuxtApp()

  const apolloClient = nuxtApp.$apollo.defaultClient

  const { result: employeesResult } = provideApolloClient(apolloClient)(() =>
    useQuery<{ employees: Employee[] }>(GET_EMPLOYEES),
  )

  const employees = computed(() => employeesResult.value?.employees || [])

  const getEmployeeById = (id: string) => {
    return employees.value.find((e) => e.id === id)
  }

  return {
    employees,
    getEmployeeById,
  }
}
