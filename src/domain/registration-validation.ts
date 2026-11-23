/** Datos de registro sin validar, tal como llegan desde el formulario o la API. */
export interface RegistrationInput {
  email: string;
  password: string;
}

export interface ValidRegistration {
  /** Email normalizado: sin espacios a los costados y en minúsculas. */
  email: string;
  password: string;
}

export type RegistrationValidationError =
  | "EMAIL_INVALID"
  | "PASSWORD_TOO_SHORT"
  | "PASSWORD_TOO_LONG";

export type RegistrationValidationResult =
  | { ok: true; value: ValidRegistration }
  | { ok: false; errors: RegistrationValidationError[] };

export const MIN_PASSWORD_LENGTH = 8;
/** bcrypt ignora todo lo que pasa de 72 bytes, así que se rechaza en vez de truncar en silencio. */
export const MAX_PASSWORD_BYTES = 72;

/** Algo@algo.ext, sin espacios. La verificación real de un email es mandarle un correo. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** RF-04: email con formato válido y contraseña de al menos 8 caracteres. */
export function validateRegistration(input: RegistrationInput): RegistrationValidationResult {
  const errors: RegistrationValidationError[] = [];
  const email = input.email.trim().toLowerCase();

  if (!EMAIL_PATTERN.test(email)) errors.push("EMAIL_INVALID");

  if (input.password.length < MIN_PASSWORD_LENGTH) errors.push("PASSWORD_TOO_SHORT");
  else if (utf8ByteLength(input.password) > MAX_PASSWORD_BYTES) errors.push("PASSWORD_TOO_LONG");

  if (errors.length > 0) return { ok: false, errors };

  return { ok: true, value: { email, password: input.password } };
}

function utf8ByteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}
