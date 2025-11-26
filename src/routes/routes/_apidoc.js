/**
 * @apiDefine admin Administrador
 * Solo usuarios con rol ADMIN pueden acceder
 */

/**
 * @apiDefine client Cliente
 * Solo usuarios con rol CLIENT pueden acceder
 */

/**
 * @apiDefine AuthHeader
 * @apiHeader {String} Authorization Bearer token - Token JWT de autenticacion
 * @apiHeaderExample {json} Header-Example:
 *     {
 *       "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     }
 */

// ========================================
// PRODUCTS
// ========================================

/**
 * @api {post} /api/products Crear producto
 * @apiName CreateProduct
 * @apiGroup Products
 * @apiVersion 1.0.0
 * @apiPermission admin
 *
 * @apiUse AuthHeader
 *
 * @apiBody {String} name Nombre del producto
 * @apiBody {Number} price Precio del producto
 * @apiBody {Number} stock Cantidad disponible
 * @apiBody {String} [description] Descripcion del producto
 * @apiBody {String} [lotNumber] Numero de lote (se genera automaticamente si no se envia)
 * @apiBody {String} [entryDate] Fecha de ingreso (se usa fecha actual si no se envia)
 *
 * @apiSuccess {Boolean} success Estado de la operacion
 * @apiSuccess {Object} data Datos del producto creado
 * @apiSuccess {String} data.id ID del producto
 * @apiSuccess {String} data.lotNumber Numero de lote
 * @apiSuccess {String} data.name Nombre
 * @apiSuccess {Number} data.price Precio
 * @apiSuccess {Number} data.stock Stock disponible
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "success": true,
 *       "data": {
 *         "id": "uuid",
 *         "lotNumber": "LOT-0001",
 *         "name": "Laptop HP",
 *         "price": 899.99,
 *         "stock": 10,
 *         "entryDate": "2024-01-15"
 *       }
 *     }
 */

/**
 * @api {get} /api/products Listar productos
 * @apiName GetProducts
 * @apiGroup Products
 * @apiVersion 1.0.0
 * @apiPermission client,admin
 *
 * @apiUse AuthHeader
 *
 * @apiQuery {Number} [page=1] Pagina actual
 * @apiQuery {Number} [limit=10] Productos por pagina
 * @apiQuery {String} [sortBy=createdAt] Campo para ordenar
 * @apiQuery {String=ASC,DESC} [sortOrder=DESC] Orden ascendente o descendente
 * @apiQuery {String} [search] Buscar por nombre o numero de lote
 *
 * @apiSuccess {Boolean} success Estado
 * @apiSuccess {Object[]} data Lista de productos activos
 * @apiSuccess {Object} meta Metadata de paginacion
 * @apiSuccess {Number} meta.pagination.page Pagina actual
 * @apiSuccess {Number} meta.pagination.limit Items por pagina
 * @apiSuccess {Number} meta.pagination.total Total de productos
 * @apiSuccess {Number} meta.pagination.totalPages Total de paginas
 */

/**
 * @api {get} /api/products/:id Obtener producto
 * @apiName GetProduct
 * @apiGroup Products
 * @apiVersion 1.0.0
 * @apiPermission client,admin
 *
 * @apiUse AuthHeader
 * @apiParam {String} id ID del producto
 *
 * @apiSuccess {Boolean} success Estado
 * @apiSuccess {Object} data Datos del producto
 */

/**
 * @api {put} /api/products/:id Actualizar producto
 * @apiName UpdateProduct
 * @apiGroup Products
 * @apiVersion 1.0.0
 * @apiPermission admin
 *
 * @apiUse AuthHeader
 * @apiParam {String} id ID del producto
 * @apiBody {String} [name] Nombre del producto
 * @apiBody {Number} [price] Precio
 * @apiBody {Number} [stock] Stock disponible
 * @apiBody {String} [description] Descripcion
 *
 * @apiSuccess {Boolean} success Estado
 * @apiSuccess {Object} data Producto actualizado
 */

/**
 * @api {delete} /api/products/:id Eliminar producto
 * @apiName DeleteProduct
 * @apiGroup Products
 * @apiVersion 1.0.0
 * @apiPermission admin
 *
 * @apiUse AuthHeader
 * @apiParam {String} id ID del producto
 *
 * @apiDescription Realiza un soft delete (desactiva el producto)
 *
 * @apiSuccess {Boolean} success Estado
 * @apiSuccess {String} message Producto desactivado exitosamente
 */

/**
 * @api {patch} /api/products/:id/stock Actualizar stock
 * @apiName UpdateStock
 * @apiGroup Products
 * @apiVersion 1.0.0
 * @apiPermission admin
 *
 * @apiUse AuthHeader
 * @apiParam {String} id ID del producto
 * @apiBody {Number} quantity Nueva cantidad de stock (debe ser mayor a 0)
 *
 * @apiSuccess {Boolean} success Estado
 * @apiSuccess {Object} data Producto con stock actualizado
 */

// ========================================
// ORDERS
// ========================================

/**
 * @api {post} /api/orders Crear orden de compra
 * @apiName CreateOrder
 * @apiGroup Orders
 * @apiVersion 1.0.0
 * @apiPermission client
 *
 * @apiUse AuthHeader
 *
 * @apiBody {Object[]} items Lista de productos a comprar
 * @apiBody {String} items.productId ID del producto
 * @apiBody {Number} items.quantity Cantidad (minimo 1)
 *
 * @apiSuccess {Boolean} success Estado
 * @apiSuccess {Object} data Orden creada con factura completa
 * @apiSuccess {String} data.id ID de la orden
 * @apiSuccess {Number} data.total Total de la compra
 * @apiSuccess {String} data.status Estado de la orden (PENDING)
 * @apiSuccess {Object[]} data.items Items de la orden
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "success": true,
 *       "data": {
 *         "id": "order-uuid",
 *         "userId": "user-uuid",
 *         "userName": "John Doe",
 *         "total": 1899.98,
 *         "status": "PENDING",
 *         "createdAt": "2024-01-15T10:30:00Z",
 *         "items": [
 *           {
 *             "productId": "prod-uuid",
 *             "productName": "Laptop HP",
 *             "lotNumber": "LOT-0001",
 *             "quantity": 2,
 *             "unitPrice": 899.99,
 *             "subtotal": 1799.98
 *           }
 *         ]
 *       }
 *     }
 *
 * @apiError InsufficientStock Stock insuficiente para el producto
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "success": false,
 *       "error": {
 *         "message": "Stock insuficiente para Laptop HP. Disponible: 5"
 *       }
 *     }
 */

/**
 * @api {get} /api/orders Listar ordenes
 * @apiName GetOrders
 * @apiGroup Orders
 * @apiVersion 1.0.0
 * @apiPermission admin,client
 *
 * @apiUse AuthHeader
 *
 * @apiQuery {Number} [page=1] Pagina actual
 * @apiQuery {Number} [limit=10] Ordenes por pagina
 * @apiQuery {String} [startDate] Fecha de inicio (YYYY-MM-DD)
 * @apiQuery {String} [endDate] Fecha de fin (YYYY-MM-DD)
 * @apiQuery {String} [userId] Filtrar por usuario (solo ADMIN)
 *
 * @apiDescription
 * - ADMIN: Puede ver todas las ordenes de todos los usuarios
 * - CLIENT: Solo ve sus propias ordenes
 *
 * @apiSuccess {Boolean} success Estado
 * @apiSuccess {Object[]} data Lista de ordenes
 * @apiSuccess {Object} meta Metadata de paginacion
 */

/**
 * @api {get} /api/orders/:id Obtener factura de orden
 * @apiName GetOrder
 * @apiGroup Orders
 * @apiVersion 1.0.0
 * @apiPermission admin,client
 *
 * @apiUse AuthHeader
 * @apiParam {String} id ID de la orden
 *
 * @apiDescription
 * - ADMIN: Puede ver cualquier orden
 * - CLIENT: Solo puede ver sus propias ordenes
 *
 * @apiSuccess {Boolean} success Estado
 * @apiSuccess {Object} data Factura completa con detalles
 */

/**
 * @api {get} /api/orders/user/history Historial de compras del usuario
 * @apiName GetOrderHistory
 * @apiGroup Orders
 * @apiVersion 1.0.0
 * @apiPermission client
 *
 * @apiUse AuthHeader
 *
 * @apiQuery {Number} [page=1] Pagina actual
 * @apiQuery {Number} [limit=10] Ordenes por pagina
 * @apiQuery {String} [startDate] Fecha de inicio
 * @apiQuery {String} [endDate] Fecha de fin
 *
 * @apiSuccess {Boolean} success Estado
 * @apiSuccess {Object[]} data Historial de ordenes del usuario autenticado
 * @apiSuccess {Object} meta Paginacion
 */

/**
 * @api {put} /api/orders/:id Actualizar orden
 * @apiName UpdateOrder
 * @apiGroup Orders
 * @apiVersion 1.0.0
 * @apiPermission client
 *
 * @apiUse AuthHeader
 * @apiParam {String} id ID de la orden
 *
 * @apiBody {Object[]} items Nueva lista de productos
 * @apiBody {String} items.productId ID del producto
 * @apiBody {Number} items.quantity Cantidad
 *
 * @apiDescription
 * Solo se pueden actualizar ordenes con estado PENDING.
 * Devuelve el stock de los items anteriores y descuenta el nuevo stock.
 *
 * @apiSuccess {Boolean} success Estado
 * @apiSuccess {Object} data Orden actualizada
 */

/**
 * @api {patch} /api/orders/:id/cancel Cancelar orden
 * @apiName CancelOrder
 * @apiGroup Orders
 * @apiVersion 1.0.0
 * @apiPermission client
 *
 * @apiUse AuthHeader
 * @apiParam {String} id ID de la orden
 *
 * @apiDescription
 * Cancela la orden (cambia estado a CANCELLED) y devuelve el stock a los productos.
 * Solo se pueden cancelar ordenes con estado PENDING.
 *
 * @apiSuccess {Boolean} success Estado
 * @apiSuccess {Object} data Orden cancelada
 * @apiSuccess {String} data.status Estado (CANCELLED)
 */

/**
 * @api {patch} /api/orders/:id/complete Completar orden
 * @apiName CompleteOrder
 * @apiGroup Orders
 * @apiVersion 1.0.0
 * @apiPermission admin
 *
 * @apiUse AuthHeader
 * @apiParam {String} id ID de la orden
 *
 * @apiDescription
 * Marca la orden como completada (estado COMPLETED).
 * Solo usuarios ADMIN pueden completar ordenes.
 * Solo se pueden completar ordenes con estado PENDING.
 *
 * @apiSuccess {Boolean} success Estado
 * @apiSuccess {Object} data Orden completada
 * @apiSuccess {String} data.status Estado (COMPLETED)
 */
