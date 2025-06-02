import { defineConfig, loadEnv } from 'vite'; 
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    //URL base para el despliegue.
    base: env.VITE_APP_BASE_URL || '/DIRI_sesion7/',

    plugins: [react()],

    build: {
      outDir: 'docs',
      emptyOutDir: true,
    },
  };
});