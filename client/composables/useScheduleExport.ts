import { provideApolloClient } from "@vue/apollo-composable"
import { EXPORT_TEAM_SCHEDULE_CSV } from "~/graphql/queries"

export const useScheduleExport = () => {
  const toast = useToast()
  const nuxtApp = useNuxtApp()
  const { handleError } = useErrorHandler()
  const apolloClient = nuxtApp.$apollo.defaultClient

  const { load: loadCSV, loading: exportLoading } = provideApolloClient(
    apolloClient,
  )(() =>
    useLazyQuery<{ exportTeamScheduleCSV: string }>(EXPORT_TEAM_SCHEDULE_CSV),
  )

  const exportScheduleCSV = async (startDate: string, endDate: string) => {
    const result = await loadCSV(undefined, {
      startDate,
      endDate,
    })

    if (result) {
      const csvData = result.exportTeamScheduleCSV

      // Create blob and download
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)

      link.setAttribute("href", url)
      link.setAttribute(
        "download",
        `team-schedule-${new Date().toISOString().split("T")[0]}.csv`,
      )
      link.style.visibility = "hidden"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    }
  }

  return {
    exportScheduleCSV,
    exportLoading,
  }
}
