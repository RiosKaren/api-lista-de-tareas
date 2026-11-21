# API REST · Lista de tareas

Trabajo práctico integrador del **Bootcamp – Módulo Node.js**.

API REST para gestionar tareas personales (título, prioridad, fecha límite, completada), con registro e inicio de sesión de usuarios. Cada usuario ve y modifica solo sus propias tareas, y solo un administrador puede eliminarlas.

**Tecnologías:** Node.js · Express · TypeScript · MongoDB Atlas + Mongoose · Bcrypt · JSON Web Token · dotenv

---

## Instalación y ejecución

### Requisitos previos

- Node.js 18 o superior
- Una base de datos en MongoDB Atlas (o MongoDB local)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/RiosKaren/api-lista-de-tareas.git
cd api-lista-de-tareas

# 2. Instalar las dependencias
npm install

# 3. Crear el archivo .env a partir del ejemplo y completar los valores
cp .env.example .env

# 4. Levantar el servidor en modo desarrollo
npm run dev
```

Para producción: `npm run build` compila a `dist/` y `npm start` ejecuta la versión compilada.

### Variables de entorno (`.env`)

| Variable      | Descripción                                          | Ejemplo                                                   |
|---------------|------------------------------------------------------|-----------------------------------------------------------|
| `PORT`        | Puerto del servidor (opcional, por defecto 3000)     | `3000`                                                    |
| `MONGO_URI`   | Cadena de conexión a MongoDB Atlas                   | `mongodb+srv://usuario:clave@cluster.mongodb.net/tareas`  |
| `JWT_SECRET`  | Clave secreta para firmar los tokens                 | una cadena larga y aleatoria                              |
| `ADMIN_EMAIL` | Email que recibe el rol **admin** al registrarse     | `admin@mail.com`                                          |

El archivo `.env` está en el `.gitignore` y no se sube al repositorio; `.env.example` contiene solo los nombres de las variables.

---

## Estructura del proyecto

Organizado **por componentes**, con **arquitectura en capas** (rutas → controlador → servicio → acceso a datos):

```
src/
├── app.ts                  # servidor Express, rutas, 404 y manejo de errores generales
├── db.ts                   # conexión a MongoDB con Mongoose
├── middlewares/
│   ├── auth.ts             # verificarToken (JWT) y esAdmin (roles)
│   └── logger.ts           # muestra método, URL, estado y tiempo de cada petición
├── utils/
│   └── httpError.ts        # error con código HTTP y respuesta común para los catch
└── components/
    ├── usuario/
    │   ├── model.ts        # esquema Usuario
    │   ├── dao.ts          # acceso a datos
    │   ├── service.ts      # registro (Bcrypt), inicio de sesión (JWT), validaciones
    │   ├── controller.ts   # req/res con try/catch
    │   └── routes.ts
    └── tarea/
        ├── model.ts        # esquema Tarea (con referencia al Usuario dueño)
        ├── dao.ts
        ├── service.ts      # validaciones de negocio, filtros y permisos
        ├── controller.ts
        └── routes.ts
```

---

## Modelos

### Usuario (colección `usuarios`)

| Campo    | Tipo   | Detalle                                         |
|----------|--------|-------------------------------------------------|
| `nombre` | String | obligatorio                                     |
| `email`  | String | obligatorio, único, se guarda en minúsculas     |
| `clave`  | String | hash de Bcrypt; nunca se devuelve en respuestas |
| `rol`    | String | `usuario` (por defecto) o `admin`               |

### Tarea (colección `tareas`)

| Campo         | Tipo     | Detalle                                         |
|---------------|----------|-------------------------------------------------|
| `titulo`      | String   | obligatorio, entre 3 y 100 caracteres           |
| `descripcion` | String   | opcional, hasta 500 caracteres                  |
| `prioridad`   | String   | `baja`, `media` (por defecto) o `alta`          |
| `fechaLimite` | Date     | obligatoria, no puede estar en el pasado        |
| `completada`  | Boolean  | `false` por defecto                             |
| `usuario`     | ObjectId | referencia al `Usuario` que creó la tarea       |

Los dos modelos guardan además la fecha de creación y de última modificación (`creadoEl`/`actualizadoEl` y `creadaEl`/`actualizadaEl`).

---

## Endpoints

Base URL: `http://localhost:3000/api`

Las rutas marcadas con 🔒 requieren el header `Authorization: Bearer <token>` (el token se obtiene al iniciar sesión).

### Usuarios

| Método | Ruta                       | Descripción                           | Body                          | OK  | Errores         |
|--------|----------------------------|---------------------------------------|-------------------------------|-----|-----------------|
| POST   | `/api/usuarios/registro`   | Registra un usuario                   | `{ nombre, email, clave }`    | 201 | 400 · 500       |
| POST   | `/api/usuarios/login`      | Inicia sesión y devuelve el token     | `{ email, clave }`            | 200 | 400 · 401 · 500 |
| GET    | `/api/usuarios/perfil` 🔒  | Devuelve el perfil del usuario        | —                             | 200 | 401 · 404 · 500 |

### Tareas

| Método | Ruta                     | Descripción                                        | OK  | Errores                |
|--------|--------------------------|----------------------------------------------------|-----|------------------------|
| GET    | `/api/tareas` 🔒         | Lista las tareas del usuario (admin: todas)        | 200 | 400 · 401 · 500        |
| GET    | `/api/tareas/:id` 🔒     | Trae una tarea                                     | 200 | 401 · 404 · 500        |
| POST   | `/api/tareas` 🔒         | Crea una tarea                                     | 201 | 400 · 401 · 500        |
| PUT    | `/api/tareas/:id` 🔒     | Actualiza una tarea (solo los campos enviados)     | 200 | 400 · 401 · 404 · 500  |
| DELETE | `/api/tareas/:id` 🔒👑   | Elimina una tarea (**solo admin**)                 | 200 | 401 · 403 · 404 · 500  |

#### Filtros (query params) en `GET /api/tareas`

| Parámetro    | Valores                     | Ejemplo                            |
|--------------|-----------------------------|------------------------------------|
| `prioridad`  | `baja`, `media`, `alta`     | `/api/tareas?prioridad=alta`       |
| `completada` | `true`, `false`             | `/api/tareas?completada=false`     |
| `buscar`     | texto (busca en el título)  | `/api/tareas?buscar=informe`       |

Se pueden combinar: `/api/tareas?prioridad=alta&completada=false`. Los resultados se ordenan por fecha límite.

#### Ejemplo de body para crear una tarea

```json
{
  "titulo": "Entregar TP integrador",
  "descripcion": "API REST con Node y Mongo",
  "prioridad": "alta",
  "fechaLimite": "2026-12-15"
}
```
---

## Validaciones de negocio (capa de servicio)

**Tareas** (`components/tarea/service.ts`):
1. El título es obligatorio y tiene entre 3 y 100 caracteres.
2. La prioridad solo puede ser `baja`, `media` o `alta`.
3. La fecha límite es obligatoria, debe ser una fecha válida y no puede estar en el pasado.
4. `completada` debe ser `true` o `false`.
5. En un `PUT` hay que enviar al menos un campo válido.

**Usuarios** (`components/usuario/service.ts`):
1. Nombre, email y clave son obligatorios.
2. El email debe tener un formato válido y no puede estar registrado.
3. La clave debe tener al menos 6 caracteres.

---

## Seguridad

- Las claves se guardan con **Bcrypt** (10 rondas de salt) y se comparan con `bcrypt.compare`.
- El **JWT** solo contiene el `id` y el `rol` del usuario (sin email ni clave) y vence en 1 hora.
- El middleware `verificarToken` protege todas las rutas de tareas; `esAdmin` protege el `DELETE`.
- El dueño de una tarea se toma del token, nunca del body.
- `MONGO_URI` y `JWT_SECRET` se leen de variables de entorno con `dotenv`.

---

## Extras implementados

- ✅ **Filtros con `req.query`:** `prioridad`, `completada` y `buscar`.
- ✅ **Roles:** solo un usuario `admin` puede eliminar tareas (403 para el resto). El rol admin se asigna al registrarse con el email de `ADMIN_EMAIL`.
- ✅ **Relación entre modelos:** cada tarea pertenece al usuario que la creó y cada uno ve solo las suyas (el admin ve todas). Las respuestas incluyen el nombre y el email del dueño con `populate`.
- ✅ **Middleware de logging:** muestra en consola método, URL, código de respuesta y tiempo de cada petición, por ejemplo:
  `[2026-11-21T10:00:00.000Z] POST /api/tareas → 201 (12 ms)`

---

## Pruebas con Thunder Client

En la carpeta [`thunder-tests/`](thunder-tests/) están:

- `thunder-collection_API_Lista_de_tareas.json`: la colección con 29 peticiones, organizada en tres carpetas: usuarios, tareas (casos OK) y tareas (casos de error 400, 401, 403 y 404).
- `thunder-environment_Local_API_Tareas.json`: el entorno con `baseUrl`, `token`, `tokenAdmin` e `idTarea`.

### Cómo usarla

1. Con `ADMIN_EMAIL=admin@mail.com` en el `.env`, levantar la API con `npm run dev`.
2. En Thunder Client: **Collections → menú ☰ → Import** y elegir el archivo de la colección. En **Env → menú ☰ → Import**, importar el entorno y marcarlo como activo.
3. Ejecutar la colección completa con **Run All** (o una por una, en orden). Los inicios de sesión guardan automáticamente el token en `{{token}}` y `{{tokenAdmin}}`, y la primera tarea creada guarda su id en `{{idTarea}}`.
4. Cada petición tiene un test que verifica el código de estado esperado.

> Para repetir la corrida desde cero, borrar las colecciones `usuarios` y `tareas` de la base (o usar otros emails), porque registrar un email existente devuelve 400.
