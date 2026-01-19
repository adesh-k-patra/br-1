import { provideApolloClient } from "@vue/apollo-composable"
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

  const { result: absencesResult } = provideApolloClient(apolloClient)(() =>
    useQuery(GET_ABSENCES)
  )
  const { result: employeesResult } = provideApolloClient(apolloClient)(() =>
    useQuery(GET_EMPLOYEES)
  )
  const { result: myAbsencesResult } = provideApolloClient(apolloClient)(() =>
    useQuery(GET_ABSENCES, { employeeId: user.value?.employeeId })
  )

  const absences = computed(() => absencesResult.value?.absences || [])
  const employees = computed(() => employeesResult.value?.employees || [])
  const myAbsences = computed(() => myAbsencesResult.value?.absences || [])

  const recordAbsence = async (input: any) => {
    await apolloClient.mutate({
      mutation: RECORD_ABSENCE,
      variables: { input },
      update: (cache: any, { data: { recordAbsence: newAbsence } }: any) => {
        const existingData: any = cache.readQuery({ query: GET_ABSENCES })
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
  }

  const requestAbsence = async (input: any) => {
    await apolloClient.mutate({
      mutation: REQUEST_ABSENCE,
      variables: { input },
      update: (cache: any, { data: { requestAbsence: newAbsence } }: any) => {
        // Update both queries
        const existingData: any = cache.readQuery({ query: GET_ABSENCES })
        if (existingData) {
          cache.writeQuery({
            query: GET_ABSENCES,
            data: {
              absences: [...existingData.absences, newAbsence],
            },
          })
        }

        const myData: any = cache.readQuery({
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
  }

  const updateStatus = async (absenceId: string, status: string) => {
    await apolloClient.mutate({
      mutation: UPDATE_ABSENCE_STATUS,
      variables: { input: { absenceId, status } },
      update: (
        cache: any,
        { data: { updateAbsenceStatus: updatedAbsence } }: any
      ) => {
        cache.modify({
          id: cache.identify(updatedAbsence),
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
  }

  const deleteAbsence = async (id: string) => {
    await apolloClient.mutate({
      mutation: DELETE_ABSENCE,
      variables: { id },
      update: (cache: any) => {
        const existingData: any = cache.readQuery({ query: GET_ABSENCES })
        if (existingData) {
          cache.writeQuery({
            query: GET_ABSENCES,
            data: {
              absences: existingData.absences.filter(
                (abs: any) => abs.id !== id
              ),
            },
          })
        }

        const myData: any = cache.readQuery({
          query: GET_ABSENCES,
          variables: { employeeId: user.value?.employeeId },
        })
        if (myData) {
          cache.writeQuery({
            query: GET_ABSENCES,
            variables: { employeeId: user.value?.employeeId },
            data: {
              absences: myData.absences.filter((abs: any) => abs.id !== id),
            },
          })
        }

        cache.evict({ id: cache.identify({ __typename: "Absence", id }) })
        cache.gc()
      },
    })
    toast.add({ title: "Absence deleted", color: "green" })
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
