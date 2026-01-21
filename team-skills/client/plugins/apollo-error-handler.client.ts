import { ApolloLink } from "@apollo/client"
import { onError } from "@apollo/client/link/error"

export default defineNuxtPlugin((nuxtApp) => {
  const toast = useToast()
  const { logout } = useAuth()

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path, extensions }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )

        if (extensions?.code === "UNAUTHENTICATED") {
          logout()
          toast.add({
            title: "Session Expired",
            description: "Please log in again.",
            color: "red",
          })
        } else {
          toast.add({
            title: "Action Failed",
            description: message,
            color: "red",
          })
        }
      })
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`)
      toast.add({
        title: "Network Error",
        description: "Please check your internet connection.",
        color: "red",
      })
    }
  })

  const apolloClient = nuxtApp.$apollo.defaultClient

  apolloClient.setLink(ApolloLink.from([errorLink, apolloClient.link]))
})
