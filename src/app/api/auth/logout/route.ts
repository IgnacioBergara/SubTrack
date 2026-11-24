import { logout } from "@/infrastructure/container";
import { clearedSessionCookie, readSessionToken } from "../session-cookie";

/**
 * POST /api/auth/logout (RF-05)
 * 204 siempre, con la cookie de sesión borrada, haya o no una sesión abierta.
 */
export async function POST(request: Request): Promise<Response> {
  const token = readSessionToken(request);
  if (token) await logout(token);

  return new Response(null, { status: 204, headers: { "Set-Cookie": clearedSessionCookie() } });
}
