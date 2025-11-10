import apiClient from './apiClient';

// Asumimos que la respuesta de login tiene esta forma
interface LoginResponse {
  access_token: string;
}

// TODO: Definir tipos para DTOs (ej. LoginDto, RegisterDto)

export const authService = {
  login: async (credentials: any): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: any) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
};