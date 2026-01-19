import { provideApolloClient } from "@vue/apollo-composable"
import { GET_ABSENCES, GET_EMPLOYEES } from "~/graphql/queries"
import {
  RECORD_ABSENCE,
  UPDATE_ABSENCE_STATUS,
  DELETE_ABSENCE,
  REQUEST_ABSENCE,
} from "~/graphql/mutations"
import type { Absence, Employee } from "~/types"

export const useAbsences = () => {
  const { user } = useAuth()
  const toast = useToast()
  const nuxtApp = useNuxtApp()
  const { handleError } = useErrorHandler()
  const apolloClient = nuxtApp.$apollo.defaultClient

  const { result: absencesResult } = provideApolloClient(apolloClient)(() =>
    useQuery<{ absences: Absence[] }>(GET_ABSENCES)
  )
  const { result: employeesResult } = provideApolloClient(apolloClient)(() =>
    useQuery<{ employees: Employee[] }>(GET_EMPLOYEES)
  )
  const { result: myAbsencesResult } = provideApolloClient(apolloClient)(() =>
    useQuery<{ absences: Absence[] }>(GET_ABSENCES, {
      employeeId: user.value?.employeeId,
    })
  )

  const absences = computed(() => absencesResult.value?.absences || [])
  const employees = computed(() => employeesResult.value?.employees || [])
  const myAbsences = computed(() => myAbsencesResult.value?.absences || [])

  const recordAbsence = async (input: Partial<Absence>) => {
    try {
      await apolloClient.mutate<{ recordAbsence: Absence }>({
        mutation: RECORD_ABSENCE,
        variables: { input },
        update: (cache, { data }) => {
          if (!data?.recordAbsence) return
          const newAbsence = data.recordAbsence
          const existingData = cache.readQuery<{ absences: Absence[] }>({
            query: GET_ABSENCES,
          })
          if (existingData) {
            cache.writeQuery({
              query: GET_ABSENCES,
              data: {
                absences: [...existingData.absences, newAbsence],
              },
            })
          }
        },
      })
      toast.add({ title: "Absence recorded successfully", color: "green" })
    } catch (e) {
      handleError(e)
    }
  }

  const requestAbsence = async (input: Partial<Absence>) => {
    try {
      await apolloClient.mutate<{ requestAbsence: Absence }>({
        mutation: REQUEST_ABSENCE,
        variables: { input },
        update: (cache, { data }) => {
          if (!data?.requestAbsence) return
          const newAbsence = data.requestAbsence
          // Update both queries
          const existingData = cache.readQuery<{ absences: Absence[] }>({
            query: GET_ABSENCES,
          })
          if (existingData) {
            cache.writeQuery({
              query: GET_ABSENCES,
              data: {
                absences: [...existingData.absences, newAbsence],
              },
            })
          }

          const myData = cache.readQuery<{ absences: Absence[] }>({
            query: GET_ABSENCES,
            variables: { employeeId: user.value?.employeeId },
          })
          if (myData) {
            cache.writeQuery({
              query: GET_ABSENCES,
              variables: { employeeId: user.value?.employeeId },
              data: {
                absences: [...myData.absences, newAbsence],
              },
            })
          }
        },
      })
      toast.add({ title: "Absence requested successfully", color: "green" })
    } catch (e) {
      handleError(e)
    }
  }

  const updateStatus = async (absenceId: string, status: string) => {
    try {
      await apolloClient.mutate<{ updateAbsenceStatus: Absence }>({
        mutation: UPDATE_ABSENCE_STATUS,
        variables: { input: { absenceId, status } },
        update: (cache, { data }) => {
          if (!data?.updateAbsenceStatus) return
          const updatedAbsence = data.updateAbsenceStatus
          cache.modify({
            id: cache.identify(updatedAbsence as any),
            fields: {
              status: () => updatedAbsence.status,
            },
          })
        },
      })
      toast.add({
        title: `Absence ${status.toLowerCase()}`,
        color: status === "APPROVED" ? "green" : "yellow",
      })
    } catch (e) {
      handleError(e)
    }
  }

  const deleteAbsence = async (id: string) => {
    try {
      await apolloClient.mutate({
        mutation: DELETE_ABSENCE,
        variables: { id },
        update: (cache) => {
          const existingData = cache.readQuery<{ absences: Absence[] }>({
            query: GET_ABSENCES,
          })
          if (existingData) {
            cache.writeQuery({
              query: GET_ABSENCES,
              data: {
                absences: existingData.absences.filter(
                  (abs: Absence) => abs.id !== id
                ),
              },
            })
          }

          const myData = cache.readQuery<{ absences: Absence[] }>({
            query: GET_ABSENCES,
            variables: { employeeId: user.value?.employeeId },
          })
          if (myData) {
            cache.writeQuery({
              query: GET_ABSENCES,
              variables: { employeeId: user.value?.employeeId },
              data: {
                absences: myData.absences.filter(
                  (abs: Absence) => abs.id !== id
                ),
              },
            })
          }

          cache.evict({ id: cache.identify({ __typename: "Absence", id }) })
          cache.gc()
        },
      })
      toast.add({ title: "Absence deleted", color: "green" })
    } catch (e) {
      handleError(e)
    }
  }

  return {
    absences,
    myAbsences,
    employees,
    recordAbsence,
    requestAbsence,
    updateStatus,
    deleteAbsence,
  }
}
