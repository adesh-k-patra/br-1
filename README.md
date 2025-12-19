# Team scheduling brick

This workspace includes a client (Angular) and a server (NestJS) boilerplates.

Client (Nuxt): ./client

- Run: `npm install && npm run dev` (inside ./client)
- Dev server expects a backend at /api; use a proxy (see client/proxy.conf.json) or start the server on port 3000.

Server (NestJS): ./server

- Run: `npm install && npm run start:dev` (inside ./server)

It's recommended to add a `.vscode/settings.json` to your project, and add the following:

```json
{
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "editor.quickSuggestions": {
    "strings": "on"
  },
  "tailwindCSS.classAttributes": ["class", "ui"],
  "tailwindCSS.experimental.classRegex": [
    ["ui:\\s*{([^)]*)\\s*}", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```
