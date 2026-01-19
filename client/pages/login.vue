<script setup lang="ts">
const { login } = useAuth()

const form = ref({
  email: "",
  password: "",
})

const showPassword = ref(false)

const handleLogin = async () => {
  const mockToken = "mock-jwt-token"
  const mockUser = { email: form.value.email, role: "MANAGER" }

  login(mockToken, mockUser)
  await navigateTo("/")
}
</script>

<template>
  <div class="max-h-screen flex items-center justify-center bg-gray-50 px-4">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="text-center space-y-1">
          <h2 class="text-xl font-semibold text-gray-900">Sign in</h2>
          <p class="text-sm text-gray-500">Use your work account to continue</p>
        </div>
      </template>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <UFormGroup label="Email" required>
          <UInput
            v-model="form.email"
            type="email"
            placeholder="admin@example.com"
          />
        </UFormGroup>

        <UFormGroup label="Password" required>
          <UInput
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
          >
            <template #trailing>
              <UButton
                type="button"
                variant="ghost"
                size="xs"
                class="cursor-pointer pointer-events-auto"
                :icon="
                  showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'
                "
                @click="showPassword = !showPassword"
                placeholder="password"
              />
            </template>
          </UInput>
        </UFormGroup>

        <div class="pt-2">
          <UButton type="submit" block> Sign in </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>
