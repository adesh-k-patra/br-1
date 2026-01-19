import {
  startOfMonth,
  endOfMonth,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
} from "date-fns"
import { GET_TEAM_SCHEDULE } from "~/graphql/queries"
import { SET_AVAILABILITY } from "~/graphql/mutations"

export const useSchedule = async () => {
  const toast = useToast()
  const nuxtApp = useNuxtApp()
  const apolloClient = nuxtApp.$apollo.defaultClient

  const currentDate = ref(new Date())
  const viewMode = ref<"week" | "month">("week")

  const dateRange = computed(() => {
    if (viewMode.value === "week") {
      const start = new Date(currentDate.value)
      const end = new Date(currentDate.value)
      end.setDate(start.getDate() + 6)
      return { start: start.toISOString(), end: end.toISOString() }
    }
    return {
      start: startOfMonth(currentDate.value).toISOString(),
      end: endOfMonth(currentDate.value).toISOString(),
    }
  })

  const variables = computed(() => ({
    startDate: dateRange.value.start,
    endDate: dateRange.value.end,
  }))

  const { data: scheduleData, refresh } = await useAsyncQuery(
    GET_TEAM_SCHEDULE,
    variables
  )

  const teamSchedule = computed(
    () => (scheduleData.value as any)?.teamSchedule ?? []
  )

  const navigate = (direction: "prev" | "next") => {
    if (viewMode.value === "week") {
      currentDate.value =
        direction === "next"
          ? addWeeks(currentDate.value, 1)
          : subWeeks(currentDate.value, 1)
    } else {
      currentDate.value =
        direction === "next"
          ? addMonths(currentDate.value, 1)
          : subMonths(currentDate.value, 1)
    }
  }

  const setAvailability = async (input: any) => {
    await apolloClient.mutate({
      mutation: SET_AVAILABILITY,
      variables: { input },
      refetchQueries: [
        { query: GET_TEAM_SCHEDULE, variables: variables.value },
      ],
      awaitRefetchQueries: true,
    })
    toast.add({ title: "Availability set", color: "green" })
    await refresh()
  }

  return {
    currentDate,
    viewMode,
    teamSchedule,
    navigate,
    setAvailability,
    refresh,
  }
}
