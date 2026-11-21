# Changelog

Todos los cambios relevantes de SubTrack se documentan en este archivo.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [versionado semántico](https://semver.org/lang/es/).

## [0.1.0] - 2026-11-21

Primera release: el núcleo del dominio como funciones puras, sin framework ni base de datos.

### Added

- Cálculo de la próxima renovación para ciclos semanal, mensual, trimestral y anual, con ajuste a fin de mes y años bisiestos (RF-01, RN-02, RN-03).
- Costo mensual equivalente de cualquier ciclo, en centavos y redondeado al centavo (RF-02, RN-04).
- Validación de suscripciones: nombre obligatorio, importe entero mayor que 0 y ciclo conocido, con todos los errores juntos (RF-03, RN-01, RN-05).
- Proyecto base: Next.js con TypeScript estricto, ESLint, Prettier, Vitest con umbrales de cobertura y CI en GitHub Actions.
- ADRs iniciales en `docs/adr/`.

[0.1.0]: https://github.com/IgnacioBergara/SubTrack/releases/tag/v0.1.0
