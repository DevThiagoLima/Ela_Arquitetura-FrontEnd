import { isAxiosError } from 'axios';

import type { LoginRequest, LoginResponse } from '../types/autenticacao';
import { API_URL, api } from './cliente';

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/api/auth/login', payload);
  return data;
}

/** Revoga o refresh token no servidor. */
export async function logout(refreshToken: string): Promise<void> {
  await api.post('/api/auth/logout', { refreshToken });
}

export function getLoginErrorMessage(error: unknown): string {
  if (!API_URL) {
    return 'O app foi gerado sem o endereço do servidor (EXPO_PUBLIC_API_URL). Gere o app novamente.';
  }
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'E-mail ou senha incorretos.';
    }
    if (error.response?.status === 429) {
      return 'Muitas tentativas. Aguarde um minuto e tente novamente.';
    }
    if (error.response) {
      return 'Não foi possível entrar agora. Tente novamente em instantes.';
    }
    return 'Sem conexão com o servidor. Verifique sua internet.';
  }
  return 'Algo deu errado. Tente novamente.';
}
