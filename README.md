# Ritmo 2.0 · Tu aplicación de tareas y hábitos

**Ritmo** es una aplicación personal de organización basada en el principio *"Un día a la vez"*. Combina prioridades diarias, gestión de tareas y seguimiento de hábitos con estadísticas justas, funcionando de manera **Offline-First** y con **sincronización automática en la nube** entre PC y móvil.

---

## 🚀 ¿Cómo usar Ritmo?

### 1. En PC como Aplicación de Escritorio (Sin navegador)
Para abrir Ritmo como programa de escritorio independiente en Windows:
```bash
npm start
```
*O si ya compilaste:* `npm run desktop`

Se abrirá una ventana de programa nativa con su propio icono, sin barras de navegación web ni puertos que recordar.

---

### 2. En Móvil (Android Nativo)
Ritmo está preparado con **Capacitor** para generar tu archivo `.apk` instalable:
1. Para actualizar los archivos de la app hacia el proyecto Android:
   ```bash
   npm run mobile:sync
   ```
2. Para abrir el proyecto en Android Studio y generar el instalador APK:
   ```bash
   npm run mobile:open
   ```
   *(En Android Studio: Menú `Build` > `Build Bundle(s) / APK(s)` > `Build APK(s)`).*

---

### 3. Sincronización en la Nube (Gratis y Automática)

Ritmo guarda **siempre primero en tu disco local** (IndexedDB):
* Si no tienes conexión a internet, la app abre al instante y puedes crear tareas y marcar hábitos sin ningún tipo de bloqueo.
* Para sincronizar tus datos entre tu PC y tu teléfono móvil:
  1. Ve a la pestaña **Ajustes** dentro de la app.
  2. En la sección **Sincronización en la Nube**, pega la configuración de tu proyecto gratuito de Firebase (o pulsa *Configurar Firebase*).
  3. Inicia sesión con tu correo o crea tu cuenta.
  4. ¡Listo! Los cambios que hagas en la PC se verán en tu celular en tiempo real, y viceversa.

---

## 🛠 Comandos disponibles

| Comando | Acción |
| :--- | :--- |
| `npm start` | Compila y abre la aplicación de escritorio en PC. |
| `npm run desktop` | Abre la ventana de escritorio directamente. |
| `npm run mobile:sync` | Sincroniza la versión más reciente con el proyecto nativo de Android. |
| `npm run mobile:open` | Abre el proyecto en Android Studio para compilar el APK. |
| `npm run dev` | Servidor web local de desarrollo. |
| `npm test` | Ejecuta las 31 pruebas automatizadas de lógica de hábitos, tareas y respaldos. |
| `npm run build` | Compila el bundle de producción en menos de 1 segundo. |
