import { isAxiosError } from 'axios';

import type { LoginRequest, LoginResponse } from '../types/autenticacao';
import { api } from './cliente';

// TODO: confirmar a rota com o backend.
const LOGIN_ENDPOINT = '/api/auth/login';

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>(LOGIN_ENDPOINT, payload);
  return data;
}

export function getLoginErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'E-mail ou senha incorretos.';
    }
    if (error.response) {
      return 'Não foi possível entrar agora. Tente novamente em instantes.';
    }
    return 'Sem conexão com o servidor. Verifique sua internet.';
  }
  return 'Algo deu errado. Tente novamente.';
}