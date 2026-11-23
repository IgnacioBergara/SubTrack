import { registerUser } from "@/infrastructure/container";

/**
 * POST /api/auth/register (RF-04)
 * 201 { user } · 400 { errors } datos inválidos · 409 { errors: ["EMAIL_TAKEN"] }
 */
export async function POST(request: Request): Promise<Response> {
  const body = await readCredentials(request);
  if (!body) return Response.json({ errors: ["INVALID_BODY"] }, { status: 400 });

  const result = await registerUser(body);
  if (result.ok) return Response.json({ user: result.user }, { status: 201 });

  const status = result.errors.includes("EMAIL_TAKEN") ? 409 : 400;
  return Response.json({ errors: result.errors }, { status });
}

/** RNF-04: valida en el servidor la forma del body antes de que llegue al caso de uso. */
async function readCredentials(
  request: Request,
): Promise<{ email: string; password: string } | null> {
  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null || Array.isArray(body)) return null;

  const { email, password } = body as Record<string, unknown>;
  if (typeof email !== "string" || typeof password !== "string") return null;

  return { email, password };
}
