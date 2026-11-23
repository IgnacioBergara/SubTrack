/**
 * POST /api/auth/register (RF-04)
 * 201 { user } · 400 { errors } datos inválidos · 409 { errors: ["EMAIL_TAKEN"] }
 */
export async function POST(_request: Request): Promise<Response> {
  throw new Error("Not implemented");
}
