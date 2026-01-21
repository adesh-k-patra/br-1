import type { Config } from "tailwindcss"

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        brick: {
          orange: "#FF762F",
          green: "#50F987",
          cyan: "#64FFFF",
        },
      },
    },
  },
}
