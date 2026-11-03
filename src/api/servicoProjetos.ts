import type { ChecklistItemAlterado, EtapaDoChecklist, Projeto } from '../types/projeto';
import { api } from './cliente';

const PROJETOS_ENDPOINT = '/api/projetos';
const CHECKLIST_ENDPOINT = '/api/checklist';

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

/** Marca o item; a resposta avisa se a etapa atual já pode avançar. */
export async function concluirItem(itemId: string): Promise<ChecklistItemAlterado> {
  const { data } = await api.patch<ChecklistItemAlterado>(`${CHECKLIST_ENDPOINT}/${itemId}/concluir`);
  return data;
}

export async function reabrirItem(itemId: string): Promise<ChecklistItemAlterado> {
  const { data } = await api.patch<ChecklistItemAlterado>(`${CHECKLIST_ENDPOINT}/${itemId}/reabrir`);
  return data;
}

export async function avancarEtapa(projetoId: string): Promise<Projeto> {
  const { data } = await api.patch<Projeto>(`${PROJETOS_ENDPOINT}/${projetoId}/avancar-etapa`);
  return data;
}

/** Item avulso: a API cria sempre na etapa atual do projeto. */
export async function adicionarItem(projetoId: string, descricao: string): Promise<void> {
  await api.post(`${PROJETOS_ENDPOINT}/${projetoId}/checklist`, { descricao, subEtapaId: null });
}
