const ApiResponse = require('../../../src/utils/ApiResponse');

describe('ApiResponse', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('constructor', () => {
    it('should create response with all properties', () => {
      const response = new ApiResponse(true, 200, 'Success', { id: 1 });
      
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.message).toBe('Success');
      expect(response.data).toEqual({ id: 1 });
      expect(response.timestamp).toBeDefined();
    });
  });

  describe('send', () => {
    it('should send response with correct status and JSON', () => {
      const response = new ApiResponse(true, 200, 'Success', { id: 1 });
      response.send(mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { id: 1 },
          message: 'Success',
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('success', () => {
    it('should create 200 success response', () => {
      const response = ApiResponse.success({ id: 1 }, 'Success');
      response.send(mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { id: 1 },
          message: 'Success',
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('created', () => {
    it('should create 201 created response', () => {
      const response = ApiResponse.created({ id: 1 }, 'Created');
      response.send(mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { id: 1 },
          message: 'Created',
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('noContent', () => {
    it('should create 204 no content response', () => {
      const response = ApiResponse.noContent();
      response.send(mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(204);
    });
  });

  describe('paginated', () => {
    it('should create paginated response with metadata', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const pagination = {
        page: 1,
        limit: 10,
        total: 50,
      };
      
      const response = ApiResponse.paginated(data, pagination, 'Success');
      response.send(mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: data,
          message: 'Success',
          meta: {
            pagination: expect.objectContaining({
              page: 1,
              limit: 10,
              total: 50,
              totalPages: 5,
            }),
          },
          timestamp: expect.any(String),
        })
      );
    });
  });
});