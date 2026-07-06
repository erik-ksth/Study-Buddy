import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// Dev-only stand-in for Vercel's /api routing (no Vercel CLI dependency needed
// locally). Production requests to /api/quotes are served by Vercel itself from
// api/quotes.js — this just lets `npm run dev` exercise the same handler.
function localApiDevMiddleware() {
  return {
    name: 'local-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/quotes', async (req, res) => {
        const { default: handler } = await import('./api/quotes.js')
        const jsonRes = {
          setHeader: (key, value) => res.setHeader(key, value),
          status(code) {
            res.statusCode = code
            return this
          },
          json(body) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(body))
          },
        }
        await handler({ method: req.method }, jsonRes)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr(), localApiDevMiddleware()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
})
