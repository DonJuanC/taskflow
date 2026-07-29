# TaskFlow

SPA de gestión de tareas con autenticación de usuarios, persistencia en la nube y notificaciones por email. Proyecto Integrador del Módulo 4 (React + TypeScript) del bootcamp Full Stack de Henry, desarrollado bajo el contexto ficticio de MateCode, una startup que construye herramientas internas para pymes.

**Autor:** Juan Camilo Castellanos — [github.com/DonJuanC](https://github.com/DonJuanC)

**Demo en vivo:** https://taskflow-smoky-sigma.vercel.app

Flujo completo verificado en producción: registro, login (email/password y Google), CRUD de tareas, filtros, reordenamiento por drag & drop, y envío de resumen por email.

## Stack técnico

- **Frontend:** React 19 + TypeScript + Vite (bundler Rolldown) + React Router v7
- **Backend as a Service:** Firebase Authentication + Cloud Firestore
- **Notificaciones:** AWS SES, invocado desde una Vercel Function (nunca desde el cliente)
- **Testing:** Vitest + React Testing Library
- **Deploy:** Vercel
- **Drag & drop:** dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`)

## Funcionalidades extra implementadas

Además del alcance funcional mínimo (auth, CRUD, persistencia por usuario, email), se implementaron los tres extras sugeridos en la consigna, más dos adicionales:

- **Filtros de tareas:** ver todas, solo pendientes o solo completadas.
- **Drag & drop:** reordenar tareas arrastrándolas (con `dnd-kit`), disponible solo bajo el filtro "Todas" para que el orden persistido no entre en conflicto con una vista filtrada.
- **Fecha de vencimiento y prioridad:** cada tarea admite fecha/hora de vencimiento y prioridad (baja/media/alta), con badges visuales en el listado.
- **Hora** en la fecha de vencimiento (no solo día).
- **Frecuencia** (diaria/semanal/mensual) como etiqueta informativa — deliberadamente sin lógica de recurrencia automática, por estar fuera del alcance de este proyecto.

## Estructura del proyecto

```
src/
├─ components/       # UI: TaskForm, TaskItem, TaskList, Navbar, SendSummaryButton, ErrorBoundary
│  └─ ui/            # Componentes reutilizables: Button, Input, PriorityPicker, FrequencyPicker
├─ pages/             # Vistas: Login, Register, Tasks
├─ features/auth/     # AuthContext + traductor de errores de Firebase
├─ routes/            # ProtectedRoute
├─ hooks/             # useAuth, useTasks, useTheme
├─ services/          # firebase.ts (Auth), tasks.ts (Firestore)
├─ types/             # Task y tipos compartidos
├─ utils/             # date.ts, validateLogin.ts, validateRegister.ts
└─ setupTests.ts       # Polyfills de jsdom para testing

api/
└─ send-summary.ts     # Vercel Function: arma el email y lo envía vía AWS SES
```

La separación sigue el criterio de que cada capa tenga una única responsabilidad: `services/` habla con servicios externos, `hooks/` expone ese estado a los componentes, `components/` solo describe la UI, y `types/` centraliza el modelo de datos para que no se duplique entre formularios y listados.

## Decisiones arquitectónicas

**Auth y Firestore en módulos separados.** `services/firebase.ts` inicializa únicamente `app` y `auth`; `services/tasks.ts` crea su propia instancia de Firestore (`getFirestore(app)`). Al principio ambos vivían en el mismo archivo, pero eso obligaba a cargar el SDK completo de Firestore apenas arrancaba la app, incluso antes de que el usuario iniciara sesión. Separarlos, sumado a cargar la página de tareas con `React.lazy()`, redujo el bundle inicial y sacó el warning de Vite sobre chunks mayores a 500kB.

**Login con Google vía popup, no redirect.** `signInWithPopup` evita perder el estado de la SPA al salir del dominio. Requirió agregar el header `Cross-Origin-Opener-Policy` para que el popup no quedara colgado en algunos navegadores, y declarar el dominio de producción como autorizado en Firebase Console (Authentication → Settings → Authorized domains) — un paso que hay que repetir si cambia el dominio del deploy.

**Filtrado y orden de tareas en el cliente.** Con el volumen de tareas esperado para un usuario individual, traer todo el listado de Firestore vía `onSnapshot` y filtrar/ordenar en memoria es más simple que armar queries compuestas, y mantiene la actualización en tiempo real sin re-suscribirse cada vez que cambia el filtro.

**Fechas: parseo manual en vez de `new Date(string)`.** `new Date("2026-08-15")` lo interpreta JavaScript como medianoche UTC, no local — para un usuario en Colombia eso corre la fecha un día. `utils/date.ts` parsea año/mes/día manualmente para fijar la fecha en horario local. El mismo criterio se aplicó en el correo: el servidor de Vercel corre en UTC, así que el cliente formatea la fecha en su propio huso horario (`formatDateDisplay`) y le manda al backend un string ya formateado (`dueDateLabel`), no una fecha cruda para reformatear en el servidor.

**Email desde una función serverless, nunca desde el frontend.** Las credenciales de AWS solo existen como variables de entorno del lado del servidor. El botón "Enviar resumen por correo" hace un `POST` a `/api/send-summary`; esa función valida el payload, arma el email (texto plano + HTML) y llama a `SESClient.send()`. El frontend nunca ve ni transporta credenciales de AWS.

**`ErrorBoundary` como red de seguridad.** Un bug real en producción (un `createdAt` en `undefined` mientras Firestore resolvía un `serverTimestamp()` pendiente) tiraba abajo el árbol de React entero y dejaba pantalla blanca. Se corrigió la causa de raíz en `useTasks.ts`, se agregó una verificación defensiva en el ordenamiento de `TaskList.tsx`, y además se envolvió toda la app en un `ErrorBoundary` para que un error de render futuro no vuelva a producir una pantalla en blanco sin explicación.

**`tsconfig.node.json` cubriendo `api/`.** La carpeta `api/` no estaba incluida en ningún `tsconfig`, así que `tsc -b` (parte de `npm run build`) nunca tipaba la función serverless. Se agregó `"api"` al `include` para que un error de tipos ahí también rompa el build, igual que en el resto del proyecto.

**Componentes de UI reutilizables (`Button`, `Input`, `PriorityPicker`, `FrequencyPicker`).** Prioridad y frecuencia se repetían como opciones de `<select>` en el formulario de creación y en la edición inline de cada tarea. Extraerlos a componentes propios evitó la duplicación y permitió reemplazar el `<select>` nativo por un selector de pills, más claro en mobile.

## Instalación y desarrollo local

Requiere Node 18+ y una cuenta de Firebase con Authentication (Email/Password y Google) y Firestore habilitados.

```bash
git clone https://github.com/DonJuanC/taskflow.git
cd taskflow
npm install
cp .env.example .env
# completar .env con las credenciales (ver sección Variables de entorno)
npm run dev
```

Scripts disponibles:

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta el frontend con Vite (no sirve `/api/*`) |
| `npm run build` | Type-check (`tsc -b`) + build de producción |
| `npm run test` | Corre la suite de Vitest |
| `npm run lint` | ESLint |
| `npm run preview` | Sirve el build de producción localmente |

La función `/api/send-summary` solo se ejecuta en Vercel (dev o producción); `vite dev` no la sirve. Probarla localmente requeriría `vercel dev`, que en este proyecto presenta una incompatibilidad conocida con Vite 8/Rolldown — se optó por validarla directamente contra el deploy de producción.

## Variables de entorno

`.env` nunca se sube al repositorio (está en `.gitignore`); `.env.example` sí, sin valores reales. Las variables `VITE_*` son las únicas visibles desde el navegador — las de AWS solo existen del lado del servidor (Vercel Functions), por eso no llevan ese prefijo.

| Variable | Dónde se usa | Descripción |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | Frontend | Config del proyecto de Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Frontend | Dominio de autenticación de Firebase |
| `VITE_FIREBASE_PROJECT_ID` | Frontend | ID del proyecto de Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Frontend | Bucket de Firebase Storage |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Frontend | Sender ID de Firebase Cloud Messaging |
| `VITE_FIREBASE_APP_ID` | Frontend | ID de la app de Firebase |
| `AWS_ACCESS_KEY_ID` | Serverless (`api/`) | Credencial de un usuario IAM con permiso de `ses:SendEmail` |
| `AWS_SECRET_ACCESS_KEY` | Serverless (`api/`) | Secret correspondiente al access key |
| `AWS_REGION` | Serverless (`api/`) | Región de AWS donde está verificado el dominio/email en SES |
| `SES_SENDER_EMAIL` | Serverless (`api/`) | Remitente verificado en AWS SES |

En Vercel, estas variables se configuran en Project Settings → Environment Variables, con scope por entorno (Production/Preview/Development). Un detalle no evidente: guardarlas no alcanza para que un deploy ya existente las tome — hace falta un redeploy para que la función serverless las lea.

## Testing

Suite con Vitest + React Testing Library. Cubre:

- Componentes principales (`TaskForm`, `TaskItem`, `TaskList`, `SendSummaryButton`, `PriorityPicker`, `FrequencyPicker`): render, interacción de usuario, casos borde (formulario vacío, cancelar edición con Escape, guardar con Enter).
- Utilidades puras (`date.ts`, `validateLogin.ts`, `validateRegister.ts`, `authErrors.ts`).
- Mock de Firebase (`firebase/auth`, `firebase/firestore`) y del `fetch` a `/api/send-summary`, para que ningún test dependa de servicios externos reales.

`npm run test` corre toda la suite.

## Flujo de envío de emails

1. El usuario hace clic en "Enviar resumen por correo" (`SendSummaryButton.tsx`).
2. El cliente arma el payload con las tareas actuales, formateando cada `dueDate` a un string legible **en el huso horario del navegador** (`formatDateDisplay`).
3. `POST /api/send-summary` con `{ to, tasks }`.
4. La función serverless (`api/send-summary.ts`) valida `to` (formato de email) y `tasks` (array), arma el cuerpo del correo en texto plano y en HTML (con badges de prioridad/frecuencia/vencimiento, escapando los títulos de tarea con `escapeHtml` para evitar inyección), y llama a `SESClient.send()` con las credenciales de AWS leídas de variables de entorno del servidor.
5. La UI refleja `loading` → `success`/`error` con un toast que se autodescarta a los 4 segundos.

Las credenciales de AWS solo se instancian dentro de `api/send-summary.ts`; ningún archivo bajo `src/` las referencia.

## Seguridad

- `.env` está en `.gitignore`; `.env.example` documenta las claves sin valores reales.
- Las reglas de Firestore (configuradas en Firebase Console) restringen cada documento de tarea a su `userId`: un usuario autenticado no puede leer ni escribir tareas de otro.
- Las rutas de tareas están protegidas con `ProtectedRoute`, que redirige a `/login` si no hay sesión activa, evitando parpadeos mientras se resuelve el estado de auth.
- Las credenciales de AWS SES nunca llegan al bundle del cliente.

## Uso de IA en el desarrollo

Usé Claude como asistente de desarrollo **desde el setup inicial del proyecto hasta el barrido final de código y esta misma documentación**, no solo en el tramo final de rediseño y extras, con un patrón deliberado: pedirle que me explicara el problema antes de darme la solución, y usar sus respuestas como punto de partida para revisar el código, no como código final a pegar sin leer.

Registro detallado y cronológico por hito (patrones de uso, prompts, decisiones e iteraciones) disponible en Notion: [Uso de IA — Prompts detallados](https://app.notion.com/p/3ac745b6d1db81d696d2c972bfa25f79)

Algunos ejemplos concretos de cómo lo usé:

**Entender el mecanismo antes de aplicar un fix (desde el arranque del proyecto).** El login con Google vía popup se quedaba colgado en algunos navegadores por la política *Cross-Origin-Opener-Policy* del propio navegador — el fix (un header COOP en `vite.config.ts`) salió de entender qué bloqueaba el popup, no de probar configuraciones al azar. El mismo criterio se aplicó cuando las rutas de la SPA daban 404 al recargar en producción: Vercel necesita un rewrite explícito para servir siempre `index.html` en rutas del lado del cliente, algo que Vite en local resuelve solo y por eso el problema no se notaba hasta el deploy.

**Debug guiado por evidencia, no por suposición.** Cuando apareció una pantalla en blanco al crear una tarea, en vez de pedir "arreglalo" pedí que rastreáramos la causa desde el síntoma: resultó ser un `createdAt` en `undefined` durante la ventana en que Firestore todavía no resolvía el `serverTimestamp()`, lo que rompía el `.getTime()` del ordenamiento y, sin un `ErrorBoundary`, tumbaba toda la app. Entender el mecanismo (por qué Firestore devuelve `null`/`undefined` en escrituras optimistas) fue lo que permitió corregir la causa real en `useTasks.ts`, no solo silenciar el síntoma. El mismo enfoque se repitió con el error `InvalidClientTokenId` de AWS: en vez de asumir que era un bug de código, se aisló primero como problema de credenciales revisando los logs reales de Vercel, hasta confirmar que el par de claves estaba corrupto y había que regenerarlo en IAM.

**Comparar contra la documentación antes de aceptar una recomendación.** En un punto le pedí agregar "frecuencia" a las tareas y sugirió implementar recurrencia real (generación automática de tareas repetidas). Antes de avanzar, paramos a dimensionar el alcance real de esa feature frente a lo que pedía la consigna, y terminé optando explícitamente por la versión simple: frecuencia como una etiqueta informativa, sin lógica de recurrencia. Fue un caso claro de no aceptar la sugerencia "más completa" por default, sino evaluar si correspondía al scope del proyecto.

**Pedir el porqué, no solo el qué, en bugs de timezone.** El bug de fechas corriéndose un día (`new Date("yyyy-mm-dd")` interpretado como UTC) y su equivalente en el email (formatear en el servidor, que corre en UTC, en vez de en el navegador del usuario) los entendí pidiendo que me explicara la causa raíz antes de aceptar el fix, porque es un error fácil de reintroducir si no se entiende por qué pasa.

**Tests como validación, no como checkbox.** Para los componentes con `dnd-kit` hubo que investigar por qué jsdom no soporta `ResizeObserver` ni `hasPointerCapture` nativamente, y agregar los polyfills necesarios en `setupTests.ts` — entender el porqué del error evitó simplemente silenciarlo con un mock genérico.

Dónde fue más efectiva la IA: en debugging con evidencia concreta (logs, errores de build, mensajes de AWS/Firebase) y en explicar mecanismos antes de implementarlos — desde por qué el COOP bloqueaba el popup de Google al principio del proyecto, hasta por qué `serverTimestamp()` puede llegar `null` en la primera lectura, ya sobre el final. Donde menos: cuando le faltaba contexto del negocio (como el alcance de "frecuencia"), tendía a proponer la solución técnicamente más completa en vez de la más adecuada al proyecto — ahí el criterio de decidir el scope fue mío.
