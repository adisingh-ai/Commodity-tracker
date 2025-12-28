import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This ensures process.env.API_KEY works in the client-side code
      // by injecting the value at build time or runtime (if locally serving).
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});