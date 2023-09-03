import path from 'path';
import dts from "vite-plugin-dts";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import packageJson from './package.json';
import pkg from "./package.json" assert { type: "json" };

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, "src/index.tsx"),
      name: packageJson.name,
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: Object.keys(pkg.peerDependencies || {}),
      output: {
        globals: {
          react: 'React',
        },
      },
    }
  },
});
