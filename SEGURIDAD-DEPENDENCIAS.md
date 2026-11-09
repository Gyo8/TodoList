# Revisión de dependencias — 9 de noviembre de 2026

## Resultado

Antes: seis avisos (dos bajos y cuatro moderados). Después: cuatro avisos bajos, cero moderados, altos o críticos. `npm audit --omit=dev` reporta cero avisos conocidos para las dependencias de ejecución. Esto no constituye una auditoría completa de seguridad de la aplicación.

## Cambio aplicado

Se fijó mediante `overrides` únicamente `workbox-build > glob` a 14.0.4. Esta versión resuelve minimatch 11.0.5. El archivo package-lock.json conserva las versiones y sus integridades.

La actualización cruza versiones principales de glob fuera del rango original de Workbox. Se verificó su llamada `globSync` utilizada por Workbox, la compilación completa y el manifiesto de precaché. El override queda limitado a esa dependencia y debe revisarse cuando Workbox publique soporte oficial para una versión corregida; no se asume compatibilidad para todos los posibles usos de Workbox.

Avisos resueltos:

- [Glob: cancelación de recorrido de archivos](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4), corregido desde 14.0.2.
- [Minimatch: amplificación de patrones](https://github.com/advisories/GHSA-g3hv-75wg-m249), corregido desde 11.0.1.

## Aviso pendiente

[Deepmerge: contaminación de prototipos](https://github.com/advisories/GHSA-gcqx-w48m-w2h4). La versión publicada consultada es 4.3.1 y el aviso no identifica una versión corregida. Los cuatro avisos bajos son el paquete y sus dependientes: @rollup/plugin-node-resolve, workbox-build y vite-plugin-pwa.

Esta cadena se utiliza al construir la app. No se procesan respaldos ni notas personales mediante estas herramientas: la importación sucede en el navegador. Mantener la construcción limitada a código y configuración de confianza hasta resolver el aviso. No se aplicó `npm audit fix --force`, que propone retroceder vite-plugin-pwa a una versión principal anterior.

## Verificación

- `npm test`: 31 pruebas aprobadas.
- `npm run build`: TypeScript, compilación y generación de service worker correctos.
- Precaché: 12 entradas, todos los archivos referenciados presentes, incluidos HTML, manifiesto, iconos, CSS y JavaScript de la app.
- Los nombres con hash de los recursos de la app y de Workbox coinciden con los de la compilación previa: el cambio afecta las herramientas de construcción, no incorpora una función visible nueva.
- `git diff --check`: sin errores de espacios; avisos de normalización de saltos de línea en Windows.

Pendiente: revisar nuevamente deepmerge cuando exista una corrección y validar en Android una futura actualización que sí cambie la app sin perder datos. La semana real de uso sigue pendiente.
