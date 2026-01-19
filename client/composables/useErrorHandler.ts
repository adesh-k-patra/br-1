export const useErrorHandler = () => {
  const toast = useToast()

  const handleError = (error: unknown) => {
    let message = "An unexpected error occurred"
    if (error && typeof error === "object" && "graphQLErrors" in error) {
      const gqlError = (error as { graphQLErrors: { message: string }[] })
        .graphQLErrors?.[0]?.message
      if (gqlError) message = gqlError
    } else if (error instanceof Error) {
      message = error.message
    }
    toast.add({ title: "Error", description: message, color: "red" })
    throw error
  }

  return { handleError }
}
