export interface Credentials {
  email: string;
  password: string;
}

/**
 * RNF-04: valida en el servidor la forma del body antes de que llegue al caso de uso.
 * Devuelve null si no es un objeto JSON con email y password de tipo string.
 */
export async function readCredentials(request: Request): Promise<Credentials | null> {
  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null || Array.isArray(body)) return null;

  const { email, password } = body as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string") return null;

  return { email, password };
}
