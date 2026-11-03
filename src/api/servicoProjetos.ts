import type { EtapaDoChecklist, Projeto } from '../types/projeto';
import { api } from './cliente';

const PROJETOS_ENDPOINT = '/api/projetos';

/** Projeto mais recente do cliente (a API já ordena do mais novo), ou null se ele ainda não tem. */
export async function buscarProjetoDoCliente(clienteId: string): Promise<Projeto | null> {
  const { data } = await api.get<Projeto[]>(PROJETOS_ENDPOINT, { params: { clienteId } });
  return data[0] ?? null;
}

/** Todas as etapas do projeto, com os itens já criados e as sub-etapas de cada uma. */
export async function listarChecklistCompleta(projetoId: string): Promise<EtapaDoChecklist[]> {
  const { data } = await api.get<EtapaDoChecklist[]>(`${PROJETOS_ENDPOINT}/${projetoId}/checklist/completa`);
  return data;
}
