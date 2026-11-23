import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import { TEST_DATABASE_URL } from "./tests/integration/database-url";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    passWithNoTests: true,
    projects: [
      {
        extends: true,
        test: {
          // Dominio y casos de uso: sin base de datos ni red (RNF-07).
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts"],
          exclude: ["src/**/*.int.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          // Adaptadores contra un Postgres real (RNF-03).
          name: "integration",
          environment: "node",
          include: ["src/**/*.int.test.ts"],
          globalSetup: ["./tests/integration/global-setup.ts"],
          env: { DATABASE_URL: TEST_DATABASE_URL },
          // Comparten la misma base: un solo proceso, un archivo a la vez, para que no se pisen.
          pool: "forks",
          poolOptions: { forks: { singleFork: true } },
        },
      },
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary", "lcov"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.d.ts",
        "src/app/**/*.tsx", // páginas y layouts: se prueban con E2E; los route handlers sí cuentan
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
