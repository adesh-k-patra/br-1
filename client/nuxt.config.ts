export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@nuxtjs/apollo"],

  apollo: {
    clients: {
      default: {
        httpEndpoint: "http://localhost:3001/graphql",
        tokenStorage: "cookie",
        authHeader: "Authorization",
        authType: "Bearer",
        tokenName: "auth_token",
      },
    },
  },

  runtimeConfig: {
    public: {
      apiUrl: "http://localhost:3001/graphql",
    },
  },

  app: {
    head: {
      title: "Team Scheduling Brick",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Team Scheduling Brick - Manage team absences and capacity",
        },
      ],
    },
  },

  colorMode: {
    preference: "light",
  },

  compatibilityDate: "2024-11-01",
})
