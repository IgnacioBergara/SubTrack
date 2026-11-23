/** Base de tests en un schema aparte del de desarrollo; en CI llega por variable de entorno. */
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://subtrack:subtrack@localhost:5432/subtrack?schema=test";
