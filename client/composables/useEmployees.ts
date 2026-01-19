import { provideApolloClient } from "@vue/apollo-composable"
import { GET_EMPLOYEES } from "~/graphql/queries"
import {
  CREATE_EMPLOYEE,
  UPDATE_EMPLOYEE,
  DELETE_EMPLOYEE,
} from "~/graphql/mutations"
import type { Employee } from "~/types"

export const useEmployees = () => {
  const toast = useToast()
  const nuxtApp = useNuxtApp()
  const { handleError } = useErrorHandler()
  const apolloClient = nuxtApp.$apollo.defaultClient

  const { result, loading, error } = provideApolloClient(apolloClient)(() =>
    useQuery<{ employees: Employee[] }>(GET_EMPLOYEES)
  )

  const employees = computed(() => result.value?.employees || [])

  const createEmployee = async (input: Partial<Employee>) => {
    try {
      await apolloClient.mutate<{ createEmployee: Employee }>({
        mutation: CREATE_EMPLOYEE,
        variables: { input },
        update: (cache, { data }) => {
          if (!data?.createEmployee) return
          const newEmployee = data.createEmployee
          const existingData = cache.readQuery<{ employees: Employee[] }>({
            query: GET_EMPLOYEES,
          })
          if (existingData) {
            cache.writeQuery({
              query: GET_EMPLOYEES,
              data: {
                employees: [...existingData.employees, newEmployee],
              },
            })
          }
        },
      })
      toast.add({ title: "Employee created successfully", color: "green" })
    } catch (e) {
      handleError(e)
    }
  }

  const updateEmployee = async (id: string, input: Partial<Employee>) => {
    try {
      await apolloClient.mutate<{ updateEmployee: Employee }>({
        mutation: UPDATE_EMPLOYEE,
        variables: { input: { id, ...input } },
        update: (cache, { data }) => {
          if (!data?.updateEmployee) return
          const updatedEmployee = data.updateEmployee
          cache.modify({
            id: cache.identify(updatedEmployee as any),
            fields: {
              name: () => updatedEmployee.name,
              email: () => updatedEmployee.email,
              role: () => updatedEmployee.role,
              defaultDailyCapacityHours: () =>
                updatedEmployee.defaultDailyCapacityHours,
            },
          })
        },
      })
      toast.add({ title: "Employee updated successfully", color: "green" })
    } catch (e) {
      handleError(e)
    }
  }

  const deleteEmployee = async (id: string) => {
    try {
      await apolloClient.mutate({
        mutation: DELETE_EMPLOYEE,
        variables: { id },
        update: (cache) => {
          const existingData = cache.readQuery<{ employees: Employee[] }>({
            query: GET_EMPLOYEES,
          })
          if (existingData) {
            cache.writeQuery({
              query: GET_EMPLOYEES,
              data: {
                employees: existingData.employees.filter(
                  (emp: Employee) => emp.id !== id
                ),
              },
            })
          }
          cache.evict({ id: cache.identify({ __typename: "Employee", id }) })
          cache.gc()
        },
      })
      toast.add({ title: "Employee deleted successfully", color: "green" })
    } catch (e) {
      handleError(e)
    }
  }

  return {
    employees,
    loading,
    error,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  }
}
