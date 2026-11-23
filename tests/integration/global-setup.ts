import { execSync } from "node:child_process";
import { TEST_DATABASE_URL } from "./database-url";

/**
 * Antes de los tests de integración aplica las migraciones al schema de test.
 * Vitest pasa `env` del proyecto a los workers, no al global setup, así que se arma acá.
 */
export default function setup() {
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
  });
}
