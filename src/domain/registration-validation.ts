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

/** RF-04: email con formato válido y contraseña de al menos 8 caracteres. */
export function validateRegistration(_input: RegistrationInput): RegistrationValidationResult {
  throw new Error("Not implemented");
}
