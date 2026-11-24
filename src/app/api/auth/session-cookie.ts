/**
 * Cookie de sesión (RF-05). Vive fuera de los route.ts porque Next solo permite
 * exportar los métodos HTTP desde ellos.
 */
export const SESSION_COOKIE = "subtrack_session";

/**
 * HttpOnly: el JavaScript de la página no puede leerla. Secure: solo viaja por HTTPS
 * (los navegadores tratan localhost como seguro). SameSite=Lax: no viaja en POST desde otros sitios.
 * Borrarla exige repetir los mismos atributos, por eso se comparten.
 */
const ATTRIBUTES = "Path=/; HttpOnly; Secure; SameSite=Lax";

/** Set-Cookie con el token; expira junto con la sesión. */
export function sessionCookie(token: string, expiresAt: Date): string {
  return `${SESSION_COOKIE}=${token}; Expires=${expiresAt.toUTCString()}; ${ATTRIBUTES}`;
}

/** Set-Cookie que le pide al navegador borrar la cookie de sesión. */
export function clearedSessionCookie(): string {
  return `${SESSION_COOKIE}=; Max-Age=0; ${ATTRIBUTES}`;
}

/** Token de la cookie de sesión de la request, o null si no viene. */
export function readSessionToken(request: Request): string | null {
  const header = request.headers.get("cookie") ?? "";
  for (const pair of header.split(";")) {
    const [name, ...value] = pair.trim().split("=");
    if (name === SESSION_COOKIE) return value.join("=") || null;
  }
  return null;
}
