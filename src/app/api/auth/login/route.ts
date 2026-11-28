import { login } from "@/infrastructure/container";
import { readCredentials } from "../read-credentials";
import { sessionCookie } from "../session-cookie";

/**
 * POST /api/auth/login (RF-05)
 * 200 { expiresAt } + cookie de sesión · 400 { errors: ["INVALID_BODY"] }
 * · 401 { errors: ["INVALID_CREDENTIALS"] }
 */
export async function POST(request: Request): Promise<Response> {
  const body = await readCredentials(request);
  if (!body) return Response.json({ errors: ["INVALID_BODY"] }, { status: 400 });

  const result = await login(body);
  if (!result.ok) return Response.json({ errors: [result.error] }, { status: 401 });

  // El token viaja solo en la cookie HttpOnly, nunca en el body.
  return Response.json(
    { expiresAt: result.expiresAt.toISOString() },
    { status: 200, headers: { "Set-Cookie": sessionCookie(result.token, result.expiresAt) } },
  );
}
