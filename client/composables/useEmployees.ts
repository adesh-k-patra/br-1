import { provideApolloClient } from "@vue/apollo-composable"
import { GET_EMPLOYEES } from "~/graphql/queries"
import {
  CREATE_EMPLOYEE,
  UPDATE_EMPLOYEE,
  DELETE_EMPLOYEE,
} from "~/graphql/mutations"

export const useEmployees = () => {
  const toast = useToast()
  const nuxtApp = useNuxtApp()
  const apolloClient = nuxtApp.$apollo.defaultClient

  const { result, loading, error } = provideApolloClient(apolloClient)(() =>
    useQuery(GET_EMPLOYEES)
  )

  const employees = computed(() => result.value?.employees || [])

  const createEmployee = async (input: any) => {
    await apolloClient.mutate({
      mutation: CREATE_EMPLOYEE,
      variables: { input },
      update: (cache: any, { data: { createEmployee: newEmployee } }: any) => {
        const existingData: any = cache.readQuery({ query: GET_EMPLOYEES })
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
  }

  const updateEmployee = async (id: string, input: any) => {
    await apolloClient.mutate({
      mutation: UPDATE_EMPLOYEE,
      variables: { input: { id, ...input } },
      update: (
        cache: any,
        { data: { updateEmployee: updatedEmployee } }: any
      ) => {
        cache.modify({
          id: cache.identify(updatedEmployee),
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
  }

  const deleteEmployee = async (id: string) => {
    await apolloClient.mutate({
      mutation: DELETE_EMPLOYEE,
      variables: { id },
      update: (cache: any) => {
        const existingData: any = cache.readQuery({ query: GET_EMPLOYEES })
        if (existingData) {
          cache.writeQuery({
            query: GET_EMPLOYEES,
            data: {
              employees: existingData.employees.filter(
                (emp: any) => emp.id !== id
              ),
            },
          })
        }
        cache.evict({ id: cache.identify({ __typename: "Employee", id }) })
        cache.gc()
      },
    })
    toast.add({ title: "Employee deleted successfully", color: "green" })
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
