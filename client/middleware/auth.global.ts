export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated.value && to.path !== "/login") {
    return navigateTo("/login")
  }

  if (isAuthenticated.value && to.path === "/login") {
    return navigateTo("/")
  }
})
