import { authService } from '../../src/services/api/authService';

jest.mock('../../src/services/api/client', () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

describe('AuthService Tests', () => {
  it('should call login endpoint securely', async () => {
    const mockClient = require('../../src/services/api/client');
    mockClient.post.mockResolvedValueOnce({ data: { user: { id: '1' }, tokens: {} } });
    
    const response = await authService.login('test@test.com', 'SecurePass123!');
    expect(response.user.id).toBe('1');
    expect(mockClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@test.com',
      password: 'SecurePass123!'
    });
  });
});
