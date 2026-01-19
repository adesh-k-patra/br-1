<script setup lang="ts">
const { user, isAuthenticated, logout } = useAuth()
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center gap-4">
            <NuxtLink to="/" class="flex items-center gap-2">
              <span class="font-bold text-xl text-gray-900"
                >Team Scheduling</span
              >
            </NuxtLink>
          </div>

          <nav class="flex items-center gap-6">
            <template v-if="user?.role === 'manager'">
              <NuxtLink
                to="/employees"
                class="text-gray-600 hover:text-gray-900 font-medium"
                active-class="text-brick-orange"
              >
                Employees
              </NuxtLink>
              <NuxtLink
                to="/schedule"
                class="text-gray-600 hover:text-gray-900 font-medium"
                active-class="text-brick-orange"
              >
                Schedule
              </NuxtLink>
              <NuxtLink
                to="/absences"
                class="text-gray-600 hover:text-gray-900 font-medium"
                active-class="text-brick-orange"
              >
                Absences
              </NuxtLink>
            </template>
            <template v-else-if="user?.role === 'employee'">
              <NuxtLink
                to="/my-absences"
                class="text-gray-600 hover:text-gray-900 font-medium"
                active-class="text-brick-orange"
              >
                My Absences
              </NuxtLink>
            </template>

            <UButton v-if="isAuthenticated" color="red" @click="logout">
              Logout
            </UButton>
          </nav>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <slot />
      </div>
    </main>

    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center text-sm text-gray-500">
          <div class="flex items-center gap-2">
            <span>Brickcode</span>
          </div>
          <span>Team Scheduling Brick</span>
        </div>
      </div>
    </footer>
  </div>
</template>
