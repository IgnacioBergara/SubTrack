/**
 * POST /api/auth/login (RF-05)
 * 200 { expiresAt } + cookie de sesión · 400 { errors: ["INVALID_BODY"] }
 * · 401 { errors: ["INVALID_CREDENTIALS"] }
 */
export async function POST(_request: Request): Promise<Response> {
  throw new Error("Not implemented");
}
