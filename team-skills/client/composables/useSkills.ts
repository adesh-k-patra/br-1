import { provideApolloClient, useQuery } from "@vue/apollo-composable"
import { GET_SKILLS } from "~/graphql/queries"
import { CREATE_SKILL, UPDATE_SKILL, REMOVE_SKILL } from "~/graphql/mutations"
import type { Skill } from "~/types"

export const useSkills = () => {
  const toast = useToast()
  const nuxtApp = useNuxtApp()
  const { handleError } = useErrorHandler()
  const apolloClient = nuxtApp.$apollo.defaultClient

  const { result: skillsResult } = provideApolloClient(apolloClient)(() =>
    useQuery<{ skills: Skill[] }>(GET_SKILLS),
  )

  const skills = computed(() => skillsResult.value?.skills || [])

  const createSkill = async (input: Partial<Skill>) => {
    try {
      await apolloClient.mutate<{ createSkill: Skill }>({
        mutation: CREATE_SKILL,
        variables: { input },
        update: (cache, { data }) => {
          if (!data?.createSkill) return

          const newSkill = data.createSkill

          const existing = cache.readQuery<{ skills: Skill[] }>({
            query: GET_SKILLS,
          })

          if (existing) {
            cache.writeQuery({
              query: GET_SKILLS,
              data: {
                skills: [...existing.skills, newSkill],
              },
            })
          }
        },
      })

      toast.add({ title: "Skill created successfully", color: "green" })
    } catch (e) {
      handleError(e)
    }
  }

  const updateSkill = async (id: string, input: Partial<Skill>) => {
    try {
      await apolloClient.mutate<{ updateSkill: Skill }>({
        mutation: UPDATE_SKILL,
        variables: { input: { id, ...input } },
        update: (cache, { data }) => {
          if (!data?.updateSkill) return

          cache.modify({
            id: cache.identify(data.updateSkill as any),
            fields: {
              name: () => data.updateSkill.name,
              category: () => data.updateSkill.category,
              description: () => data.updateSkill.description,
            },
          })
        },
      })

      toast.add({ title: "Skill updated successfully", color: "green" })
    } catch (e) {
      handleError(e)
    }
  }

  const deleteSkill = async (id: string) => {
    try {
      await apolloClient.mutate({
        mutation: REMOVE_SKILL,
        variables: { id },
        update: (cache) => {
          const existing = cache.readQuery<{ skills: Skill[] }>({
            query: GET_SKILLS,
          })

          if (existing) {
            cache.writeQuery({
              query: GET_SKILLS,
              data: {
                skills: existing.skills.filter((skill) => skill.id !== id),
              },
            })
          }

          cache.evict({
            id: cache.identify({ __typename: "Skill", id }),
          })

          cache.gc()
        },
      })

      toast.add({ title: "Skill deleted", color: "green" })
    } catch (e) {
      handleError(e)
    }
  }

  return {
    skills,
    createSkill,
    updateSkill,
    deleteSkill,
  }
}
