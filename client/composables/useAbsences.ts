import { GET_ABSENCES, GET_EMPLOYEES } from "~/graphql/queries"
import {
  RECORD_ABSENCE,
  UPDATE_ABSENCE_STATUS,
  DELETE_ABSENCE,
  REQUEST_ABSENCE,
} from "~/graphql/mutations"

export const useAbsences = () => {
  const { user } = useAuth()
  const toast = useToast()
  const nuxtApp = useNuxtApp()
  const apolloClient = nuxtApp.$apollo.defaultClient

  const { data: absencesData, refresh: refreshAbsences } =
    useAsyncQuery(GET_ABSENCES)
  const { data: employeesData } = useAsyncQuery(GET_EMPLOYEES)

  const absences = computed(() => (absencesData.value as any)?.absences || [])
  const employees = computed(
    () => (employeesData.value as any)?.employees || []
  )

  const { data: myAbsencesData, refresh: refreshMyAbsences } = useAsyncQuery(
    GET_ABSENCES,
    {
      employeeId: user.value?.employeeId,
    }
  )

  const myAbsences = computed(
    () => (myAbsencesData.value as any)?.absences || []
  )

  const recordAbsence = async (input: any) => {
    try {
      await apolloClient.mutate({
        mutation: RECORD_ABSENCE,
        variables: { input },
        refetchQueries: [{ query: GET_ABSENCES }],
        awaitRefetchQueries: true,
      })
      toast.add({ title: "Absence recorded successfully", color: "green" })
      await refreshAbsences()
    } catch (error: any) {
      toast.add({ title: "Error", description: error.message, color: "red" })
      throw error
    }
  }

  const requestAbsence = async (input: any) => {
    try {
      await apolloClient.mutate({
        mutation: REQUEST_ABSENCE,
        variables: { input },
        refetchQueries: [{ query: GET_ABSENCES }],
        awaitRefetchQueries: true,
      })
      toast.add({ title: "Absence requested successfully", color: "green" })
      await refreshAbsences()
    } catch (error: any) {
      toast.add({ title: "Error", description: error.message, color: "red" })
      throw error
    }
  }

  const updateStatus = async (absenceId: string, status: string) => {
    try {
      await apolloClient.mutate({
        mutation: UPDATE_ABSENCE_STATUS,
        variables: {
          input: { absenceId, status },
        },
        refetchQueries: [{ query: GET_ABSENCES }],
        awaitRefetchQueries: true,
      })
      toast.add({
        title: `Absence ${status.toLowerCase()}`,
        color: status === "APPROVED" ? "green" : "yellow",
      })
      await refreshAbsences()
    } catch (error: any) {
      toast.add({ title: "Error", description: error.message, color: "red" })
      throw error
    }
  }

  const deleteAbsence = async (id: string) => {
    try {
      await apolloClient.mutate({
        mutation: DELETE_ABSENCE,
        variables: { id },
        refetchQueries: [{ query: GET_ABSENCES }],
        awaitRefetchQueries: true,
      })
      toast.add({ title: "Absence deleted", color: "green" })
      await refreshAbsences()
      await refreshMyAbsences()
    } catch (error: any) {
      toast.add({ title: "Error", description: error.message, color: "red" })
      throw error
    }
  }

  return {
    absences,
    myAbsences,
    employees,
    refreshAbsences,
    recordAbsence,
    requestAbsence,
    updateStatus,
    deleteAbsence,
  }
}
