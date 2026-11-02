import { isAxiosError } from 'axios';

import type { Cliente } from '../types/cliente';
import { api } from './cliente';

const CLIENTES_ENDPOINT = '/api/clientes';

export async function listarClientes(): Promise<Cliente[]> {
  const { data } = await api.get<Cliente[]>(CLIENTES_ENDPOINT);
  return data;
}

export function getClientesErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) {
      return 'Sua sessão expirou. Entre novamente.';
    }
    if (error.response) {
      return 'Não foi possível carregar os clientes. Tente novamente em instantes.';
    }
    return 'Sem conexão com o servidor. Verifique sua internet.';
  }
  return 'Algo deu errado. Tente novamente.';
}
