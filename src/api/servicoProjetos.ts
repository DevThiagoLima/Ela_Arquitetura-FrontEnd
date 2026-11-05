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

/** Item avulso em uma etapa já alcançada pelo projeto (a atual ou uma anterior). */
export async function adicionarItem(projetoId: string, etapaId: string, descricao: string): Promise<void> {
  await api.post(`${PROJETOS_ENDPOINT}/${projetoId}/checklist`, { descricao, subEtapaId: null, etapaId });
}

/** Remove item avulso; a resposta avisa se, sem ele, a etapa atual já pode avançar. */
export async function removerItem(itemId: string): Promise<ChecklistItemAlterado> {
  const { data } = await api.delete<ChecklistItemAlterado>(`${CHECKLIST_ENDPOINT}/${itemId}`);
  return data;
}
