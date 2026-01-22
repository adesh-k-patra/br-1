import { provideApolloClient, useQuery } from "@vue/apollo-composable"
import { EXPORT_SKILLS_MATRIX_CSV, GET_SKILLS_MATRIX } from "~/graphql/queries"
import type { ComparisonOperator, SkillsMatrix } from "~/types"

interface LevelFilter {
  op: ComparisonOperator
  value: number
}

interface MatrixFilters {
  category?: string
  skillName?: string
  level?: LevelFilter
}

export const useSkillsMatrix = () => {
  const nuxtApp = useNuxtApp()
  const apolloClient = nuxtApp.$apollo.defaultClient

  const filters = ref<MatrixFilters>({
    category: undefined,
    skillName: undefined,
    level: undefined,
  })

  const activeFilters = computed(() => {
    const f = filters.value
    return {
      ...(f.category ? { category: f.category } : {}),
      ...(f.skillName ? { skillName: f.skillName } : {}),
      ...(f.level ? { level: f.level } : {}),
    }
  })

  const queryVariables = computed(() => {
    return Object.keys(activeFilters.value).length > 0
      ? { filters: activeFilters.value }
      : null
  })

  const {
    result: skillsMatrixResult,
    loading,
    error,
    refetch,
  } = provideApolloClient(apolloClient)(() =>
    useQuery<{ skillsMatrix: SkillsMatrix }>(
      GET_SKILLS_MATRIX,
      queryVariables,
      {
        fetchPolicy: "network-only",
        notifyOnNetworkStatusChange: true,
      },
    ),
  )

  const skillsMatrix = computed(() => skillsMatrixResult.value?.skillsMatrix)

  const resetFilters = () => {
    filters.value = {
      category: undefined,
      skillName: undefined,
      level: undefined,
    }
  }

  // Export CSV function
  const { load: loadCSV, loading: exportLoading } = provideApolloClient(
    apolloClient,
  )(() =>
    useLazyQuery<{ exportSkillsMatrixCSV: string }>(EXPORT_SKILLS_MATRIX_CSV),
  )

  const exportCSV = async () => {
    const result = await loadCSV(undefined, queryVariables.value)

    if (result) {
      const csvData = result.exportSkillsMatrixCSV

      // Create blob and download
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)

      link.setAttribute("href", url)
      link.setAttribute(
        "download",
        `skills-matrix-${new Date().toISOString().split("T")[0]}.csv`,
      )
      link.style.visibility = "hidden"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    }
  }

  return {
    skillsMatrix,
    loading,
    error,
    filters,
    resetFilters,
    exportCSV,
    exportLoading,
  }
}
