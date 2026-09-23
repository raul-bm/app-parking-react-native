# App Parking — React Native + NestJS

> **En desarrollo activo** — Migración desde el proyecto app-parking (Node.js/Express + React Web) a arquitectura nativa y con mejores frameworks.

## Stack Tecnológico

### Backend (`/app-parking-react-native/backend`)

- **NestJS** — Framework modular con DI nativo
- **TypeScript** — Tipado estricto
- **Prisma 8 (ORM)** — Type-safe database access con `contract.ts`
- **PostgreSQL** — Base de datos relacional
- **JWT + Passport** — Autenticación stateless
- **Socket\.IO** — WebSockets para notificaciones en tiempo real (pendiente)
- **Docker** — Contenedorización (pendiente de configurar para el repositorio)

### Frontend (`/app-parking-react-native/frontend`)

- **React Native** (Expo) — App nativa multiplataforma
- **TypeScript** — Tipado estricto

---

## Checklist de Módulos Backend

### ✅ Completados

- [x] **PrismaModule** — `PrismaService` global con lifecycle hooks (`OnModuleInit`, `OnModuleDestroy`)
- [x] **AuthModule** — Register, Login, `/me`, JWT Strategy, `JwtAuthGuard`
- [x] **UsersModule** — `GET /users/search` (búsqueda por username/realName)
- [x] **PinsModule (CRUD core)** —
  - `POST /pins` — Crear pin (owner desde JWT)
  - `GET /pins` — Listar pins propios (historial)
  - `GET /pins/shared-with-me` — Pins compartidos (usuario + grupos)
  - `GET /pins/:id` — Detalle con verificación de acceso (owner / share directo / share grupo)
  - `PATCH /pins/:id` — Actualizar nota (solo owner)
  - `DELETE /pins/:id` — Eliminar (solo owner, 204)
  - `POST /pins/:id/share/user` — Compartir con usuario
  - `POST /pins/:id/share/group` — Compartir con grupo
  - `DELETE /pins/:id/share/user/:userId` — Quitar share usuario
  - `DELETE /pins/:id/share/group/:groupId` — Quitar share grupo
- [x] **GroupsModule** — CRUD grupos + gestión de miembros
  - `POST /groups` — Crear grupo (owner = userId)
  - `GET /groups` — Listar grupos propios
  - `GET /groups/:id` — Detalle (owner o miembro)
  - `PATCH /groups/:id` — Actualizar nombre (solo owner)
  - `DELETE /groups/:id` — Eliminar (solo owner)
  - `POST /groups/:id/members` — Añadir miembro (solo owner)
  - `DELETE /groups/:id/members/:userId` — Quitar miembro (solo owner)
  - `GET /groups/:id/members` — Listar miembros (owner/miembros)

### 🚧 En progreso / Pendientes

- [ ] **FriendshipsModule** — Solicitudes de amistad
  - [ ] `POST /friendships/request` — Enviar solicitud
  - [ ] `PATCH /friendships/:id/accept` — Aceptar
  - [ ] `PATCH /friendships/:id/reject` — Rechazar
  - [ ] `GET /friendships` — Listar (pendientes, aceptados, enviados)
  - [ ] `DELETE /friendships/:id` — Eliminar amistad
- [ ] **WebSockets (Socket\.IO Gateway)** — Notificaciones en tiempo real
  - [ ] Nuevo pin compartido
  - [ ] Solicitud de amistad
  - [ ] Invitación a grupo
- [ ] **Google OAuth** — Login con Google
- [ ] **Configuración global** — `ValidationPipe`, CORS, Swagger/OpenAPI
- [ ] **Docker Compose** — PostgreSQL + backend + frontend
- [ ] **Tests** — Unit + e2e (Jest)

### 📱 Frontend

- [x] Setup Expo + TypeScript + Navigation
- [x] Auth screens (Login, Register)
- [ ] OAuth
- [x] Mapa + Pins (crear, listar, detalle)
- [ ] Compartir pins (usuarios/grupos)
- [ ] Grupos (crear, miembros)
- [ ] Amistades
- [ ] Notificaciones push + WebSocket listener
