import { GET_EMPLOYEES } from "~/graphql/queries"
import {
  CREATE_EMPLOYEE,
  UPDATE_EMPLOYEE,
  DELETE_EMPLOYEE,
} from "~/graphql/mutations"

export const useEmployees = async () => {
  const toast = useToast()
  const nuxtApp = useNuxtApp()
  const apolloClient = nuxtApp.$apollo.defaultClient

  const { data, refresh } = await useAsyncQuery(GET_EMPLOYEES, {}, {
    fetchPolicy: "network-only",
  } as any)

  const employees = computed(() => (data.value as any)?.employees || [])

  const createEmployee = async (input: any) => {
    try {
      await apolloClient.mutate({
        mutation: CREATE_EMPLOYEE,
        variables: { input },
        refetchQueries: [{ query: GET_EMPLOYEES }],
        awaitRefetchQueries: true,
      })
      toast.add({ title: "Employee created successfully", color: "green" })
      await refresh()
    } catch (error: any) {
      toast.add({ title: "Error", description: error.message, color: "red" })
      throw error
    }
  }

  const updateEmployee = async (id: string, input: any) => {
    try {
      await apolloClient.mutate({
        mutation: UPDATE_EMPLOYEE,
        variables: {
          input: { id, ...input },
        },
        refetchQueries: [{ query: GET_EMPLOYEES }],
        awaitRefetchQueries: true,
      })
      toast.add({ title: "Employee updated successfully", color: "green" })
      await refresh()
    } catch (error: any) {
      toast.add({ title: "Error", description: error.message, color: "red" })
      throw error
    }
  }

  const deleteEmployee = async (id: string) => {
    try {
      await apolloClient.mutate({
        mutation: DELETE_EMPLOYEE,
        variables: { id },
        refetchQueries: [{ query: GET_EMPLOYEES }],
        awaitRefetchQueries: true,
      })
      toast.add({ title: "Employee deleted successfully", color: "green" })
      await refresh()
    } catch (error: any) {
      toast.add({ title: "Error", description: error.message, color: "red" })
      throw error
    }
  }

  return {
    employees,
    refresh,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  }
}
