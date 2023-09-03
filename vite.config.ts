import path from 'path';
import dts from "vite-plugin-dts";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import packageJson from './package.json';
import pkg from "./package.json" assert { type: "json" };

export default defineConfig({
  plugins: [
    react(),
    // generation of `index.d.ts`
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
      formats: ["es", "umd"],
      fileName: (format) => `${packageJson.name}.${format}.js`,
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: Object.keys(pkg.peerDependencies || {}),
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: 'React',
          'styled-components': "styled",
          'prop-types': "PropTypes"
        },
      },
    }
  },
});
