# 🛞 Llantería POS

Sistema de punto de venta (POS) para una llantería: controla el inventario de llantas, los clientes, el personal y las ventas, y descuenta el stock en tiempo real con transacciones de base de datos.

![Angular](https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT_%2B_Google-000000?logo=jsonwebtokens&logoColor=white)
![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest&logoColor=white)

## 🚀 Demo en vivo

**👉 [proyecto-pos-llanteria-five.vercel.app](https://proyecto-pos-llanteria-five.vercel.app)**

| Correo | Contraseña |
| --- | --- |
| `demo@gmail.com` | `demo123` |

> Las credenciales ya vienen cargadas en el formulario: solo presiona **Entrar**. También puedes iniciar sesión con Google.
>
> ⏳ El backend está en el plan gratuito de Render, así que la primera petición puede tardar unos 30–50 segundos mientras el servidor despierta.

## ✨ Funcionalidades

- **Inventario:** CRUD de llantas con código, descripción/medida, marca, stock y precio.
- **Clientes:** registro con DUI único y validación de datos.
- **Caja registradora:** se arma un carrito, se selecciona el cliente y se procesa la venta.
- **Ventas con transacciones:** el stock se descuenta de forma atómica (`$gte` + `$inc` dentro de una transacción de MongoDB). Si un producto no tiene stock suficiente, la venta completa se revierte.
- **Precios calculados en el servidor:** el total se calcula con el precio guardado en la base de datos, nunca con el que envía el navegador.
- **Anulación de facturas:** las ventas no se borran; se anulan y el stock regresa al inventario (una venta solo se puede anular una vez).
- **Usuarios y roles:** `ADMIN` gestiona al personal; `CAJERO` opera inventario, clientes y ventas.

## 🔐 Seguridad

- Autenticación con **JWT** (expira en 8 h) y contraseñas cifradas con **bcrypt**.
- **Login con Google:** el backend verifica el `idToken` con `google-auth-library` antes de emitir su propio JWT.
- Middleware `verificarToken` en todas las rutas privadas y `soloAdmin` para la gestión de usuarios.
- En el frontend, un **interceptor HTTP** adjunta el token y cierra la sesión si el backend responde 401; los **guards** validan la expiración del token y el rol.
- Las actualizaciones solo aceptan los campos permitidos, lo que evita que alguien se asigne otro rol.
- Las respuestas nunca incluyen hashes de contraseña, y el login no revela qué correos existen.
- Los secretos se configuran con variables de entorno y CORS es configurable por dominio.

## 🏗️ Arquitectura

```
┌────────────────────┐      HTTPS + JWT      ┌────────────────────┐        ┌──────────────┐
│  Angular 21 (SPA)  │ ───────────────────▶  │  Express 5 (API)   │ ─────▶ │ MongoDB Atlas│
│  Vercel            │ ◀───────────────────  │  Render            │        │  (Mongoose)  │
└────────────────────┘        JSON           └────────────────────┘        └──────────────┘
          │                                             │
          └──── Google Identity Services ──── idToken ──┘
```

```
llanteria-pos/
├── llanteria-backend/
│   ├── config/         # Conexión a MongoDB
│   ├── controllers/    # Lógica de negocio (productos, clientes, usuarios, ventas)
│   ├── middleware/     # verificarToken y soloAdmin
│   ├── models/         # Esquemas de Mongoose
│   ├── routes/         # Definición de endpoints
│   └── utils/          # Manejo de errores y filtrado de campos
└── llanteria-frontend/
    └── src/app/
        ├── inventario/ clientes/ usuarios/ ventas/ login/   # Componentes standalone
        ├── services/                                        # Servicios HTTP y sesión
        ├── auth-guard.ts                                    # authGuard y adminGuard
        └── auth.interceptor.ts                              # Adjunta el JWT a cada petición
```

## 📡 API

| Método | Endpoint | Acceso | Descripción |
| --- | --- | --- | --- |
| `POST` | `/api/usuarios/login` | Público | Login con correo y contraseña |
| `POST` | `/api/usuarios/auth/google` | Público | Login con Google (`idToken`) |
| `GET` `POST` | `/api/usuarios` | ADMIN | Listar y crear usuarios |
| `PUT` `DELETE` | `/api/usuarios/:id` | ADMIN | Editar y eliminar usuarios |
| `GET` `POST` | `/api/productos` | Autenticado | Listar y crear productos |
| `PUT` `DELETE` | `/api/productos/:id` | Autenticado | Editar y eliminar productos |
| `GET` `POST` | `/api/clientes` | Autenticado | Listar y crear clientes |
| `PUT` `DELETE` | `/api/clientes/:id` | Autenticado | Editar y eliminar clientes |
| `GET` `POST` | `/api/ventas` | Autenticado | Historial y registro de ventas |
| `DELETE` | `/api/ventas/:id` | Autenticado | Anular venta y devolver stock |

Las rutas privadas requieren el header `Authorization: Bearer <token>`.

## 🛠️ Instalación local

**Requisitos:** Node.js 20+ y una base de datos de MongoDB con soporte para transacciones (por ejemplo, MongoDB Atlas, incluso en el plan gratuito).

### Backend

```bash
cd llanteria-backend
npm install
cp .env.example .env   # y completa los valores
npm run dev
```

| Variable | Descripción |
| --- | --- |
| `PORT` | Puerto de la API (por defecto `3000`) |
| `MONGO_URI` | Cadena de conexión de MongoDB |
| `JWT_SECRET` | Cadena larga y aleatoria para firmar los tokens |
| `GOOGLE_CLIENT_ID` | Client ID de Google Cloud (OAuth) |
| `CORS_ORIGIN` | Dominios permitidos separados por coma (opcional) |

### Frontend

```bash
cd llanteria-frontend
npm install
npm start              # http://localhost:4200
```

La URL de la API y el Client ID de Google se configuran en `src/environments/`.

## 🧪 Tests

```bash
cd llanteria-frontend
npm test
```

Incluye pruebas de los guards (token vigente, expirado y rol), del interceptor (header `Authorization` y cierre de sesión ante un 401) y de los componentes.

## 👤 Autor

**Carlos Guardado** · [GitHub @Carlos29Guardado](https://github.com/Carlos29Guardado)
