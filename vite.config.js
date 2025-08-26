import { defineConfig } from 'vite'

export default defineConfig({
  root: './src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'src/index.html',
        profile: 'src/profile.html'
      }
    }
  },
  server: {
    port: 3000,
    open: true
  },
  publicDir: '../public'
})