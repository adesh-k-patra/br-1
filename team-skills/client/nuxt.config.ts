export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ["@nuxt/ui", "@nuxtjs/apollo"],
  devServer: {
    port: 3002,
  },

  apollo: {
    clients: {
      default: {
        httpEndpoint: "http://localhost:3001/graphql",
        tokenStorage: "cookie",
        authHeader: "Authorization",
        authType: "Bearer",
        tokenName: "auth_token",
        inMemoryCacheOptions: {
          typePolicies: {
            Query: {
              fields: {
                skills: {
                  merge: false,
                },
                employeeSkills: {
                  keyArgs: ["employeeId"],
                  merge: false,
                },
              },
            },
            Skill: {
              keyFields: ["id"],
            },
            EmployeeSkill: {
              keyFields: ["id"],
            },
          },
        },
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
      title: "Team Skills Brick",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Team Skills Brick - Manage team skills",
        },
      ],
    },
  },

  colorMode: {
    preference: "light",
  },

  compatibilityDate: "2024-11-01",
})
