import { http, HttpResponse } from 'msw';
import { mockUsers } from './mock-users';

export const mockAuthHandlers = [
  // Mock sign-in endpoint
  http.post('/api/auth/signin', () => {
    return HttpResponse.json({ success: true, token: 'mock-token' });
  }),

  // Mock user profile endpoint
  http.get('/api/auth/user', () => {
    return HttpResponse.json(mockUsers.client);
  }),

  // Mock session validation endpoint
  http.get('/api/auth/session', () => {
    return HttpResponse.json({ isAuthenticated: true, user: mockUsers.client });
  }),
];