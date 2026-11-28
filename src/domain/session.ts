/**
 * Sesión iniciada. Se guarda solo el hash del token: si alguien lee la base,
 * no puede usar los tokens para hacerse pasar por los usuarios.
 */
export interface Session {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}
