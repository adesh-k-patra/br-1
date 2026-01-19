export const useAuth = () => {
  const token = useCookie("auth_token", {
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
    sameSite: "lax",
  })
  const user = useState("auth_user", () => null)

  const login = (newToken: string, userData: any) => {
    token.value = newToken
    user.value = userData
  }

  const logout = () => {
    token.value = null
    user.value = null
    return navigateTo("/login")
  }

  const isAuthenticated = computed(() => !!token.value)

  return {
    token,
    user,
    login,
    logout,
    isAuthenticated,
  }
}
