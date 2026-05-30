# TutorMatch — Frontend Web

Aplicacion web para la plataforma de asesorias academicas TutorMatch. Construida con React y Vite, consume la API REST del backend y se comunica con Supabase para actualizaciones en tiempo real.

---

## Stack tecnologico

- **React 18** con **Vite** — interfaz de usuario y servidor de desarrollo
- **React Router v6** — navegacion entre paginas
- **Axios** — cliente HTTP para consumir la API
- **Zustand** — estado global de autenticacion
- **Socket.io Client** — WebSockets para chat y notificaciones
- **Supabase JS** — cliente para Realtime directo desde el navegador
- **date-fns** — formateo de fechas

---

## Requisitos previos

- Node.js 18 o superior
- El backend de TutorMatch corriendo en `http://localhost:3000`

---

## Instalacion

```bash
# Desde la carpeta raiz del proyecto
cd TUTOR-MATCH-FRONTEND

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.example .env
```

Edita `.env` con la URL de tu backend:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## Correr la aplicacion

```bash
# Desarrollo
npm run dev

# Compilar para produccion
npm run build

# Previsualizar el build de produccion
npm run preview
```

La aplicacion abre en `http://localhost:5173`.

---

## Estructura de carpetas

```
frontend-web/
├── public/
├── src/
│   ├── api/
│   │   ├── client.js          instancia de axios con interceptores
│   │   └── index.js           modulos de la API por recurso
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.jsx  redirige a login si no hay sesion
│   │   ├── layout/
│   │   │   └── Layout.jsx     sidebar de navegacion y contenedor principal
│   │   └── ui/
│   │       └── index.jsx      sistema de componentes reutilizables
│   ├── lib/
│   │   └── utils.js           funciones auxiliares de formato
│   ├── pages/
│   │   ├── AuthPages.jsx      login y registro
│   │   ├── DashboardPage.jsx  pagina de inicio
│   │   ├── SessionsPage.jsx   listado y busqueda de asesorias
│   │   ├── SessionDetailPage.jsx detalle, inscripcion y resenas
│   │   ├── CreateSessionPage.jsx formulario de nueva asesoria
│   │   ├── ProfilePage.jsx    perfil editable del usuario
│   │   └── OtherPages.jsx     tutores, mis asesorias, chat y admin
│   ├── store/
│   │   └── authStore.js       estado global de autenticacion con Zustand
│   ├── styles/
│   │   └── globals.css        variables de diseno y estilos base
│   ├── App.jsx                definicion de rutas
│   └── main.jsx               punto de entrada
├── .env.example
├── index.html
└── package.json
```

---

## Paginas de la aplicacion

| Ruta | Pagina | Acceso |
|------|--------|--------|
| `/login` | Inicio de sesion | Publico |
| `/register` | Registro de cuenta | Publico |
| `/dashboard` | Inicio con stats y asesorias recientes | Autenticado |
| `/sessions` | Listado con filtros y busqueda | Autenticado |
| `/sessions/:id` | Detalle de una asesoria | Autenticado |
| `/sessions/create` | Formulario de nueva asesoria | Rol tutor |
| `/tutors` | Lista de tutores disponibles | Autenticado |
| `/my-sessions` | Historial como tutor y asesorado | Autenticado |
| `/chat` | Mensajeria en tiempo real | Autenticado |
| `/profile` | Perfil editable del usuario | Autenticado |
| `/admin` | Panel de administracion | Rol admin |

---

## Sistema de autenticacion

El estado de sesion se maneja con Zustand en `src/store/authStore.js`. Al iniciar la aplicacion, el store verifica si hay un token guardado en `localStorage` y hace una peticion a `/auth/me` para validarlo y cargar los datos del usuario.

```javascript
// Leer el usuario actual en cualquier componente
const { user, hasRole } = useAuthStore();

// Verificar si tiene un rol especifico
if (hasRole('tutor')) {
  // mostrar boton de crear asesoria
}

// Hacer login
const login = useAuthStore(s => s.login);
await login({ email, password });

// Cerrar sesion
const logout = useAuthStore(s => s.logout);
logout();
```

### Renovacion automatica de tokens

El cliente HTTP en `src/api/client.js` tiene un interceptor de respuesta que detecta cuando el servidor responde con `401`. En ese caso intenta renovar el access token usando el refresh token guardado en `localStorage`. Si la renovacion es exitosa, reintenta la peticion original de forma transparente. Si falla, limpia el almacenamiento y redirige al login.

---

## Cliente HTTP

Todos los llamados a la API pasan por `src/api/index.js`, que exporta un objeto por recurso:

```javascript
import { sessionsAPI, usersAPI, authAPI } from '../api';

// Ejemplos de uso
const { data } = await sessionsAPI.getAll({ subject: 'Calculo', limit: 10 });
const { data } = await sessionsAPI.enroll(sessionId);
const { data } = await usersAPI.updateMe({ bio: 'Nueva descripcion' });
```

El cliente adjunta automaticamente el header `Authorization: Bearer <token>` en cada peticion. No es necesario incluirlo manualmente en ningun componente.

---

## Sistema de componentes

Todos los componentes reutilizables estan en `src/components/ui/index.jsx`. Los principales son:

**Btn** — boton con variantes `primary`, `green`, `outline`, `ghost` y `danger`. Acepta prop `loading` que muestra un spinner y deshabilita el boton.

**Input** — campo de texto con soporte para `label`, `error`, `hint` y los atributos nativos de HTML. Cambia el borde a negro al recibir foco.

**Select** — selector con las mismas props que Input.

**Textarea** — area de texto con las mismas props que Input.

**Tag** — etiqueta con variantes de color: `default`, `green`, `red`, `amber`, `blue` e `ink`.

**StatusTag** — Tag preconfigurado para los estados de una asesoria: `available`, `full`, `in_progress`, `completed` y `cancelled`.

**Avatar** — imagen de perfil circular. Si no hay foto, muestra las iniciales del nombre con un color generado a partir del nombre.

**Card** — contenedor con borde, fondo blanco y sombra sutil. Acepta prop `hover` para animacion al pasar el mouse.

**Stars** — fila de cinco estrellas coloreadas segun el rating.

**Skel** — placeholder de carga con animacion shimmer.

**Empty** — estado vacio con icono, titulo, descripcion y accion opcional.

---

## Sistema de diseno

Las variables de diseno estan definidas en `src/styles/globals.css` como custom properties de CSS.

### Paleta de colores

| Variable | Valor | Uso |
|----------|-------|-----|
| `--bg` | `#f8f7f4` | Fondo general de la aplicacion |
| `--bg-2` | `#f0efe9` | Fondo de paginas con cards |
| `--surface` | `#ffffff` | Fondo de cards y paneles |
| `--ink` | `#0d0d0d` | Texto principal |
| `--ink-3` | `#7a7a7a` | Texto secundario |
| `--ink-4` | `#b0b0b0` | Texto de ayuda y placeholders |
| `--line` | `#d8d6ce` | Bordes y separadores |
| `--green` | `#00e676` | Acento principal, acciones primarias |
| `--red` | `#ff3b3b` | Errores y estados de cancelacion |
| `--amber` | `#ff9500` | Advertencias y estados de lleno |
| `--blue` | `#0057ff` | Estado en curso |

### Tipografia

La aplicacion usa dos fuentes de Google Fonts:

**Bebas Neue** — tipografia display de alto impacto para numeros grandes, el logotipo y titulos destacados. Se usa exclusivamente para generar jerarquia visual.

**Instrument Sans** — tipografia de interfaz para todo el texto funcional: etiquetas, botones, parrafos, inputs y navegacion.

---

## Consideraciones importantes al editar

**No definir componentes dentro de otros componentes.** Si un componente auxiliar (como `Section` en el formulario de crear asesoria) se define dentro del componente padre, React lo trata como un nuevo componente en cada render y desmonta los inputs hijos, causando que el usuario pierda el foco al escribir. Todos los componentes auxiliares deben definirse fuera del componente que los usa.

```javascript
// INCORRECTO — Section se define dentro de CreateSessionPage
const CreateSessionPage = () => {
  const Section = ({ children }) => <div>{children}</div>; // pierde foco al escribir
  return <Section><input /></Section>;
};

// CORRECTO — Section se define fuera
const Section = ({ children }) => <div>{children}</div>;

const CreateSessionPage = () => {
  return <Section><input /></Section>;
};
```

**No usar `require()` dentro de componentes.** El proyecto usa ES Modules. Todos los imports deben declararse al inicio del archivo con sintaxis `import`. El uso de `require()` dentro de funciones o componentes causa errores en tiempo de ejecucion en el navegador.

**El ID de conversacion es determinístico.** Al integrar nuevas funcionalidades de chat, el `conversation_id` siempre debe construirse ordenando los dos UUIDs alfabeticamente y concatenandolos con guion bajo, tanto en el frontend como en el backend, para garantizar consistencia.

---

## Flujo de una pagina tipica

Para agregar una nueva pagina al proyecto se siguen estos pasos:

1. Crear el archivo en `src/pages/NuevaPagina.jsx`
2. Importar `Layout` y los componentes de UI necesarios
3. Usar el hook `useAuthStore` si se necesita el usuario actual
4. Llamar a la API con los modulos de `src/api/index.js`
5. Registrar la ruta en `src/App.jsx` dentro de `<Routes>`
6. Si requiere autenticacion, envolverla en `<ProtectedRoute>`
7. Agregar el enlace en la navegacion dentro de `src/components/layout/Layout.jsx` si aplica
