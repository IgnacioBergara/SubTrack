/** Usuario tal como se guarda. El hash nunca sale de la capa de aplicación. */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
}

/** Lo único que se puede devolver de un usuario hacia afuera (API, UI). */
export type PublicUser = Pick<User, "id" | "email">;
