/**
 * API Response Class
 */
class ApiResponse {
  constructor(success, statusCode, message, data = null, meta = null) {
    this.success = success;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = meta;
    this.timestamp = new Date().toISOString();
  }

  static success(data = null, message = 'Operación exitosa', meta = null) {
    return new ApiResponse(true, 200, message, data, meta);
  }

  static created(data = null, message = 'Recurso creado exitosamente', meta = null) {
    return new ApiResponse(true, 201, message, data, meta);
  }

  static noContent(message = 'Operación exitosa') {
    return new ApiResponse(true, 204, message, null, null);
  }

  static paginated(data, pagination, message = 'Operación exitosa') {
    const meta = {
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
    };
    return new ApiResponse(true, 200, message, data, meta);
  }

  send(res) {
    const response = {
      success: this.success,
      message: this.message,
      timestamp: this.timestamp,
    };

    if (this.data !== null) {
      response.data = this.data;
    }

    if (this.meta !== null) {
      response.meta = this.meta;
    }

    return res.status(this.statusCode).json(response);
  }

  toJSON() {
    const response = {
      success: this.success,
      message: this.message,
      timestamp: this.timestamp,
    };

    if (this.data !== null) {
      response.data = this.data;
    }

    if (this.meta !== null) {
      response.meta = this.meta;
    }

    return response;
  }
}

module.exports = ApiResponse;