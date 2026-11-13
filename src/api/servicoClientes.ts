import { isAxiosError } from 'axios';

import type { AtualizarClienteRequest, CadastroClienteRequest, Cliente, ClienteConcluido } from '../types/cliente';
import { api } from './cliente';

const CLIENTES_ENDPOINT = '/api/clientes';

/** Clientes com todos os projetos concluídos (aba Concluídos), com os projetos de cada um. */
export async function listarClientesConcluidos(): Promise<ClienteConcluido[]> {
  const { data } = await api.get<ClienteConcluido[]>(`${CLIENTES_ENDPOINT}/concluidos`);
  return data;
}

/**
 * Clientes com algum projeto em andamento. Sem termo, traz todos; com termo, a API filtra
 * por nome, e-mail ou telefone. Quem tem todos os projetos concluídos fica em listarClientesConcluidos.
 */
export async function listarClientes(busca?: string): Promise<Cliente[]> {
  const { data } = await api.get<Cliente[]>(CLIENTES_ENDPOINT, {
    params: busca ? { busca } : undefined,
  });
  return data;
}

export async function obterCliente(id: string): Promise<Cliente> {
  const { data } = await api.get<Cliente>(`${CLIENTES_ENDPOINT}/${id}`);
  return data;
}

export async function cadastrarCliente(payload: CadastroClienteRequest): Promise<Cliente> {
  const { data } = await api.post<Cliente>(CLIENTES_ENDPOINT, payload);
  return data;
}

export async function atualizarCliente(id: string, payload: AtualizarClienteRequest): Promise<Cliente> {
  const { data } = await api.put<Cliente>(`${CLIENTES_ENDPOINT}/${id}`, payload);
  return data;
}

/** A API desativa o cliente: ele some da lista, mas os projetos ficam guardados. */
export async function excluirCliente(id: string): Promise<void> {
  await api.delete(`${CLIENTES_ENDPOINT}/${id}`);
}

/** A API responde 400 com { erros: [...] } quando algum campo é inválido. */
export function getCadastroErrorMessage(error: unknown): string {
  if (isAxiosError<{ erros?: string[] }>(error) && error.response?.status === 400) {
    const erros = error.response.data?.erros;
    if (erros?.length) {
      return erros.join('\n');
    }
  }
  return getClientesErrorMessage(error);
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
