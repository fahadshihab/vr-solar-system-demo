import {defineConfig} from'vite'
import mkcert from'vite-plugin-mkcert'
import vitePluginString from 'vite-plugin-string'

// https://vitejs.dev/config/
export default defineConfig({
  
  server: {
    https: true
  },
  plugins: [
    mkcert(),
    vitePluginString()
  ]
  
})