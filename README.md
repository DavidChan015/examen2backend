# GeoTracker Backend

API REST de GeoTracker con PostgreSQL, autenticación JWT y ubicaciones asociadas
al usuario autenticado.

## Puertos

- API: `8001` (`PORT` puede cambiarse en `.env`).
- PostgreSQL: `5433` en el equipo y `5432` dentro de Docker.
- Adminer: `8081` en el equipo.

Desde el emulador Android Studio, configura la API base como
`http://10.0.2.2:8001/api/`. Desde un teléfono físico conectado a la misma red,
usa `http://<IP_DE_TU_PC>:8001/api/`.

## Configuración y ejecución

1. Copia `.env.example` a `.env` y configura la base de datos y un `JWT_SECRET`
   privado de al menos 32 caracteres.
2. Inicia PostgreSQL y Adminer con `docker compose up -d`.
3. Instala dependencias con `npm install`.
4. Inicia el servidor en desarrollo con `npm run dev`, o compílalo con
   `npm run build` y ejecútalo con `npm start`.

Al iniciar, el backend adapta las columnas antiguas de `users` (`nombre`,
`usuario`, `password_hash` y `createdAt`) al esquema actual sin borrar las
cuentas existentes.

Adminer queda disponible en `http://localhost:8081`. Si ejecutas la API desde
el equipo, usa `DB_HOST=localhost` y `DB_PORT=5433`. CORS permite por defecto
cualquier origen para facilitar las peticiones desde la app móvil; puedes
restringirlo con `CORS_ORIGIN`.

## Endpoints

### Registrar usuario

`POST /api/register`

```json
{
  "name": "Usuario GeoTracker",
  "username": "usuario@ejemplo.com",
  "email": "usuario@ejemplo.com",
  "password": "miPassword123"
}
```

La respuesta incluye `token` y el usuario público. Para mantener compatibilidad
con los registros existentes, también se aceptan los campos `nombre` y `usuario`.

### Iniciar sesión

`POST /api/auth/login` (también disponible en `POST /api/login`)

```json
{
  "username": "usuario@ejemplo.com",
  "password": "miPassword123"
}
```

Se puede enviar el correo en `username` o `email`. La respuesta exitosa contiene
`token`, `message` y `user` (`id`, `email`, `username`).

### Guardar ubicación

`POST /api/locations`

Enviar el token como `Authorization: Bearer TOKEN_JWT`:

```json
{
  "name": "Universidad Da Vinci",
  "description": "Edificio Central de Laboratorios",
  "latitude": 14.634915,
  "longitude": -90.506882
}
```

Responde `201 Created` con la ubicación guardada y `created_at`.

### Listar ubicaciones

`GET /api/locations`

Requiere `Authorization: Bearer TOKEN_JWT` y solo devuelve las ubicaciones del
usuario identificado por ese token.
