# 📦 Inventory Management API

API REST para gestión de inventario con autenticación JWT, control de roles y sistema de órdenes de compra.

## 📋 Descripción

Sistema completo de inventario desarrollado con Node.js, Express y Sequelize que permite:
- Gestión de usuarios con roles (ADMIN/CLIENT)
- CRUD completo de productos con soft delete
- Sistema de órdenes de compra con validación de stock
- Generación automática de facturas
- Historial de compras por usuario
- Autenticación JWT con middlewares de autorización

---

## ✨ Características

### 🔐 Autenticación y Autorización
- Registro e inicio de sesión con JWT
- Roles: **ADMIN** y **CLIENT**
- Middleware de autenticación y autorización
- Tokens con expiración configurable

### 📦 Gestión de Productos (ADMIN)
- Crear, leer, actualizar y eliminar productos
- Generación automática de número de lote
- Soft delete (desactivación de productos)
- Paginación y búsqueda
- Validación de stock en tiempo real

### 🛒 Sistema de Órdenes (CLIENT)
- Crear órdenes con múltiples productos
- Validación automática de stock disponible
- Actualizar órdenes pendientes
- Cancelar órdenes (devuelve stock)
- Ver historial de compras
- Generación de facturas detalladas

### 👨‍💼 Funciones de Administrador
- Ver todas las órdenes de todos los usuarios
- Completar órdenes (cambiar estado a COMPLETED)
- Filtrar órdenes por fecha, usuario, etc.
- Control total sobre productos e inventario

### 🛡️ Seguridad y Validaciones
- Validación de datos con Joi
- Hash de contraseñas con bcrypt
- Rate limiting para prevenir ataques
- Helmet para headers de seguridad
- CORS configurado
- Manejo centralizado de errores
- Logs con Winston

---

## 🚀 Tecnologías

- **Node.js** v18+
- **Express** v5.1.0 - Framework web
- **Sequelize** v6.37 - ORM para PostgreSQL
- **PostgreSQL** - Base de datos (Neon DB)
- **JWT** - Autenticación
- **Joi** - Validación de datos
- **Winston** - Logging
- **Jest** - Testing (155 tests, 88% cobertura)
- **apidoc** - Documentación de API

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14.0 (o cuenta en Neon DB)
- **Git**

---

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd api
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Server
PORT=3000
NODE_ENV=development

# Database (Neon DB PostgreSQL)
DB_HOST=your-neon-host.neon.tech
DB_PORT=5432
DB_NAME=your-database-name
DB_USER=your-username
DB_PASSWORD=your-password
DB_SSL=true

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=*

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Ejecutar migraciones

```bash
npm run migrate
```

Esto creará las tablas en la base de datos:
- `users` - Usuarios del sistema
- `products` - Productos del inventario
- `orders` - Órdenes de compra
- `order_items` - Ítems de cada orden

### 5. (Opcional) Ejecutar seeders

```bash
npm run seed
```

Crea datos de prueba (usuarios, productos, órdenes).

---

## ▶️ Ejecución

### Modo desarrollo (con nodemon)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

---

## 🧪 Testing

### Ejecutar todos los tests

```bash
npm test
```

### Tests con cobertura

```bash
npm test -- --coverage
```

### Tests en modo watch

```bash
npm run test:watch
```

### Tests unitarios solamente

```bash
npm run test:unit
```

### Cobertura actual

- **155 tests** implementados
- **88% de cobertura** de código
- Tests unitarios para servicios, controladores, middlewares y validadores
- Tests de integración para la aplicación

---

## 📚 Documentación de API

### Ver documentación interactiva

La documentación está disponible de **2 formas**:

#### Opción 1: Servidor en ejecución (Recomendado)

1. Inicia el servidor:
   ```bash
   npm run dev
   ```

2. Abre en tu navegador:
   ```
   http://localhost:3000/docs
   ```

   En producción (Render):
   ```
   https://tu-app.onrender.com/docs
   ```

#### Opción 2: Archivo local

1. Generar documentación (ya está generada):
   ```bash
   npm run apidoc
   ```

2. Abrir el archivo `docs/index.html` directamente en tu navegador

La documentación incluye:
- Todos los endpoints disponibles
- Parámetros requeridos y opcionales
- Ejemplos de request/response
- Códigos de error
- Autenticación requerida

### Endpoints principales

#### 🔐 Autenticación

```
POST   /api/auth/register  - Registrar nuevo usuario
POST   /api/auth/login     - Iniciar sesión
GET    /api/auth/me        - Obtener perfil actual
```

#### 📦 Productos (ADMIN)

```
POST   /api/products           - Crear producto
GET    /api/products           - Listar productos (paginado)
GET    /api/products/:id       - Obtener producto por ID
PUT    /api/products/:id       - Actualizar producto
DELETE /api/products/:id       - Eliminar producto (soft delete)
PATCH  /api/products/:id/stock - Actualizar stock
```

#### 🛒 Órdenes

```
POST   /api/orders                - Crear orden (CLIENT)
GET    /api/orders                - Listar órdenes (ADMIN: todas, CLIENT: propias)
GET    /api/orders/:id            - Obtener factura de orden
GET    /api/orders/user/history   - Historial de compras (CLIENT)
PUT    /api/orders/:id            - Actualizar orden (CLIENT, solo PENDING)
PATCH  /api/orders/:id/cancel     - Cancelar orden (CLIENT, solo PENDING)
PATCH  /api/orders/:id/complete   - Completar orden (ADMIN)
```

#### 🏥 Health Check

```
GET    /health  - Estado del servidor
GET    /api     - Información de la API
```

---

## 🗂️ Estructura del Proyecto

```
api/
├── src/
│   ├── config/          # Configuraciones (DB, logger)
│   ├── controllers/     # Controladores de rutas
│   ├── middlewares/     # Middlewares (auth, validation, errors)
│   ├── models/          # Modelos de Sequelize
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio
│   ├── utils/           # Utilidades (AppError, ApiResponse)
│   ├── validators/      # Validaciones con Joi
│   ├── app.js           # Configuración de Express
│   └── server.js        # Punto de entrada
├── tests/
│   ├── unit/            # Tests unitarios
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── services/
│   │   └── validators/
│   └── integration/     # Tests de integración
├── migrations/          # Migraciones de BD
├── seeders/            # Datos de prueba
├── docs/               # Documentación generada (apidoc)
├── .env                # Variables de entorno
├── .sequelizerc        # Configuración de Sequelize CLI
├── jest.config.js      # Configuración de Jest
└── package.json        # Dependencias y scripts
```

---

## 📜 Scripts Disponibles

```bash
npm start              # Iniciar en producción
npm run dev            # Iniciar en desarrollo con nodemon
npm test               # Ejecutar tests con cobertura
npm run test:watch     # Tests en modo watch
npm run test:unit      # Solo tests unitarios
npm run migrate        # Ejecutar migraciones
npm run migrate:undo   # Revertir última migración
npm run seed           # Ejecutar seeders
npm run db:reset       # Reiniciar base de datos completa
npm run apidoc         # Generar documentación de API
```

---

## 🔑 Usuarios de Prueba (después de seeders)

### Administrador
```
Email: admin@inventory.com
Password: admin123
Role: ADMIN
```

### Cliente
```
Email: client@inventory.com
Password: client123
Role: CLIENT
```

---

## 🌟 Características Destacadas

### ✅ Implementado

- ✅ Autenticación JWT con roles
- ✅ CRUD completo de productos
- ✅ Sistema de órdenes con validación de stock
- ✅ Generación automática de números de lote
- ✅ Soft delete de productos
- ✅ Transacciones de base de datos
- ✅ Paginación en listados
- ✅ Validación de datos con Joi
- ✅ Manejo centralizado de errores
- ✅ Logging con Winston
- ✅ Rate limiting
- ✅ CORS y Helmet para seguridad
- ✅ Tests unitarios e integración (88% cobertura)
- ✅ Documentación con apidoc
- ✅ Código documentado con JSDoc

---

## 🔒 Seguridad

- Contraseñas hasheadas con **bcrypt**
- Tokens JWT con expiración
- Validación estricta de datos de entrada
- Rate limiting para prevenir ataques
- Headers de seguridad con Helmet
- SQL injection protegido por Sequelize ORM
- Variables sensibles en `.env`

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

ISC

---

## 👤 Autor

Desarrollado como prueba técnica de backend con Node.js, Sequelize y PostgreSQL.

---

## 📞 Soporte

Para reportar bugs o solicitar features, por favor abre un issue en el repositorio.

---

**⭐ Si te gustó este proyecto, dale una estrella en GitHub!**
