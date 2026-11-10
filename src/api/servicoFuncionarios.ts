import { isAxiosError } from 'axios';

import type { Funcionario, FuncionarioRequest } from '../types/funcionario';
import { api } from './cliente';

const FUNCIONARIOS_ENDPOINT = '/api/funcionarios';

/** Funcionários ativos, em ordem alfabética. */
export async function listarFuncionarios(): Promise<Funcionario[]> {
  const { data } = await api.get<Funcionario[]>(FUNCIONARIOS_ENDPOINT);
  return data;
}

export async function obterFuncionario(id: string): Promise<Funcionario> {
  const { data } = await api.get<Funcionario>(`${FUNCIONARIOS_ENDPOINT}/${id}`);
  return data;
}

export async function cadastrarFuncionario(payload: FuncionarioRequest): Promise<Funcionario> {
  const { data } = await api.post<Funcionario>(FUNCIONARIOS_ENDPOINT, payload);
  return data;
}

export async function atualizarFuncionario(id: string, payload: FuncionarioRequest): Promise<Funcionario> {
  const { data } = await api.put<Funcionario>(`${FUNCIONARIOS_ENDPOINT}/${id}`, payload);
  return data;
}

/** A API desativa o registro: ele some da lista, mas o histórico dos projetos é mantido. */
export async function excluirFuncionario(id: string): Promise<void> {
  await api.delete(`${FUNCIONARIOS_ENDPOINT}/${id}`);
}

/** A API responde 400 com { erros: [...] } quando algum campo é inválido. */
export function getFuncionariosErrorMessage(error: unknown): string {
  if (isAxiosError<{ erros?: string[] }>(error)) {
    const status = error.response?.status;
    const erros = error.response?.data?.erros;

    if (status === 400 && erros?.length) {
      return erros.join('\n');
    }
    if (status === 401) {
      return 'Sua sessão expirou. Entre novamente.';
    }
    if (status === 404) {
      return 'Funcionário não encontrado. Ele pode ter sido excluído.';
    }
    if (error.response) {
      return 'Não foi possível concluir agora. Tente novamente em instantes.';
    }
    return 'Sem conexão com o servidor. Verifique sua internet.';
  }
  return 'Algo deu errado. Tente novamente.';
}
