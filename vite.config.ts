import path from 'path';
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import eslint from "vite-plugin-eslint";
import react from "@vitejs/plugin-react";
import packageJson from './package.json';
import pkg from "./package.json" assert { type: "json" };

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'classic',
    }),
    dts({
      insertTypesEntry: true,
      exclude: 'src/**/*.stories.tsx',
    }),
    eslint({
      exclude: [
        /virtual:/, 
        /node_modules/
      ],
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
    }
  },
});
