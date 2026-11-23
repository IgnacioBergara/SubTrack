import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts"],
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.d.ts",
        "src/app/**",
        "src/**/testing/**", // dobles de test: no son código de producción
        "src/**/ports/**", // solo interfaces y errores, sin lógica
      ],
      // RNF-02: dominio >= 90 % líneas y ramas; proyecto global >= 80 %.
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
        "src/domain/**": {
          lines: 90,
          branches: 90,
        },
      },
    },
  },
});
