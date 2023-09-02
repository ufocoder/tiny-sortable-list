import path from 'path';
import { fileURLToPath } from "node:url";
import dts from "vite-plugin-dts";
import react from "@vitejs/plugin-react";
import eslintPlugin from 'vite-plugin-eslint';
import { defineConfig } from "vite";
import packageJson from './package.json';

// get all of our externals since to exclude from our bundle, they will be installed by the user
const external = [
  ...Object.keys({
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  }),
  'prop-types',
];

export default defineConfig({
  plugins: [
    react(),
    eslintPlugin(),
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
      external: [
        ...external,
      ],
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
