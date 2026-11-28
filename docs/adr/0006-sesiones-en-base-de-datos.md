# ADR 0006: Sesiones en la base de datos con cookie HttpOnly

- **Estado:** aceptada
- **Fecha:** 2026-11-28

## Contexto

RF-05 pide iniciar y cerrar sesión. Hay dos enfoques habituales:

- **JWT firmado:** no necesita consultar la base en cada request, pero un token emitido sigue sirviendo hasta que vence. Para que el logout lo invalide de verdad hace falta una lista de tokens revocados, que vuelve a necesitar la base.
- **Sesión en la base:** cada request autenticada hace una consulta por índice, y cerrar sesión es borrar una fila.

SubTrack ya consulta Postgres en cada request para leer las suscripciones, así que una consulta más por índice no cambia el costo.

## Decisión

- Las sesiones se guardan en la tabla `sessions`, con `user_id`, `token_hash` y `expires_at`. Si se borra un usuario, sus sesiones se borran con él.
- **El token** tiene 32 bytes aleatorios de `node:crypto`, codificados en base64url. En la base se guarda solo su hash **SHA-256**, con índice único. Alcanza un hash rápido porque el token ya trae 256 bits de entropía. bcrypt queda para contraseñas, que tienen poca entropía.
- **La cookie** se llama `subtrack_session` y es `HttpOnly`, `Secure` y `SameSite=Lax`, con `Path=/` y `Expires` igual al vencimiento de la sesión.
  - `HttpOnly` impide que un script inyectado la lea.
  - `Lax` hace que el navegador no la mande en un POST desde otro sitio, lo que corta el CSRF básico. A diferencia de `Strict`, no desloguea al usuario cuando entra desde un link externo.
- **Duración:** 30 días desde el login, medidos con el `Clock` inyectado (RNF-08). Una sesión vence en el instante exacto de `expires_at`. Una sesión vencida se borra cuando alguien la consulta.
- **Credenciales inválidas:**
  - Un email inexistente y una contraseña incorrecta reciben el mismo `401 INVALID_CREDENTIALS`.
  - Con un email inexistente igual se ejecuta un `bcrypt.compare` contra un hash descartable del mismo costo, así el tiempo de respuesta no revela qué emails están registrados.

## Consecuencias

- El logout invalida la sesión en el momento, y cada dispositivo tiene su propia sesión.
- Si alguien filtrara la tabla `sessions`, no podría usarla para entrar como otro usuario.
- Cada request autenticada hace una consulta por `token_hash`.
- Las sesiones vencidas que nadie vuelve a consultar quedan en la tabla. Si llegan a pesar, se agrega una tarea periódica de limpieza.
- El registro responde `409 EMAIL_TAKEN`, y eso sí revela si un email existe. Se acepta, porque el registro tiene que poder avisar que el email está ocupado.
