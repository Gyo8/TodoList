# Probar Ritmo en Android por USB

Conexión, tareas sin conexión, apertura desde icono y descarga de respaldo confirmadas por el usuario en su Android. Tipo de instalación y restauración del archivo del teléfono pendientes.

Esta ruta sirve para una prueba personal sin alojamiento, dominio ni publicación. Usa Chrome en PC y Android y un cable que transmita datos. No requiere instalar Android Studio para intentar el procedimiento de Chrome.

## 1. Preparar la app en la PC

Desde la carpeta del proyecto:

```sh
npm run build
npm run preview:android
```

Mantén esa terminal abierta. El servidor escucha únicamente en esta PC, en 127.0.0.1:4180. Si el puerto está ocupado, el comando falla en lugar de cambiarlo; conviene conservar la misma dirección para no separar los datos del teléfono.

## 2. Conectar el teléfono

La depuración USB permite a esta PC comunicarse con el teléfono para desarrollo. Actívala solo si aceptas ese acceso y autoriza únicamente tu propia PC; el permiso se concede en la pantalla del teléfono.

1. En Android, habilita Opciones de desarrollador y Depuración USB. La ubicación depende del fabricante.
2. Conecta el cable y desbloquea el teléfono.
3. En Chrome de la PC, abre `chrome://inspect/#devices` y habilita «Discover USB devices».
4. Acepta en el teléfono la solicitud de depuración de esta PC, si decides concederla. Espera a que Chrome muestre el modelo.
5. En «Port forwarding», agrega puerto **4180** y destino **127.0.0.1:4180**. Activa «Enable port forwarding» y confirma.
6. En Chrome del teléfono abre **http://localhost:4180/**.

Si no aparece el teléfono, comprueba cable de datos y desbloqueo antes de instalar herramientas. Algunos fabricantes requieren un controlador USB específico.

El reenvío USB es un mecanismo documentado por [Chrome](https://developer.chrome.com/docs/devtools/remote-debugging/local-server). La configuración del dispositivo está en su [guía de depuración Android](https://developer.chrome.com/docs/devtools/remote-debugging).

## 3. Verificar antes de usar datos importantes

- Espera «Lista para usar sin conexión».
- Crea una tarea de prueba y un hábito; recarga y comprueba que permanecen.
- Revisa si el menú de Chrome ofrece instalar la app o añadirla a la pantalla de inicio. Anota la opción ofrecida: un acceso directo no demuestra por sí solo instalación como PWA.
- Desconecta el cable y activa modo avión. Cierra y abre la misma dirección o el acceso instalado, crea otra tarea y vuelve a abrir.
- Exporta un respaldo desde Ajustes y localiza el JSON en Descargas.
- Desactiva modo avión y reconecta para comprobar futuras actualizaciones.

`localhost` permite probar service workers como contexto local seguro, según [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers). Esto no significa que cualquier dirección HTTP de la red doméstica permita instalar o usar la PWA sin conexión.

## 4. Al terminar

Detén la terminal con Ctrl+C, desactiva el reenvío y la depuración USB cuando ya no los necesites. Guarda el respaldo antes de borrar datos del navegador.

Sin cable, la app depende de haber quedado correctamente en caché: hay que verificarlo en el teléfono. Para descargar versiones nuevas necesitarás volver a conectar y levantar el servidor. Esta ruta es para pruebas; un alojamiento HTTPS posterior permitiría acceso habitual sin la PC.

Los datos de PC y Android son independientes. El respaldo permite trasladarlos manualmente, pero restaurarlo reemplaza la información del destino. No hay sincronización.

## Resultado por registrar

Modelo / Android / versión de Chrome:

- [x] Abre por USB (confirmación del usuario).
- [x] Conserva tareas al abrir desde el icono (confirmación del usuario).
- [ ] Instalación o acceso directo: indicar cuál.
- [x] Abre sin cable y en modo avión (confirmación del usuario).
- [x] Guarda una tarea sin conexión y la conserva al recargar (confirmación del usuario).
- [x] Descarga el JSON y lo localiza en Descargas (confirmación del usuario).
- [x] Validar y restaurar el JSON trasladado a PC en la instancia aislada 4181; dos tareas, un hábito y su registro permanecieron tras recargar.
- [ ] Una actualización conserva la información.
