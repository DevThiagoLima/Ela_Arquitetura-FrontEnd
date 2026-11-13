import type { ChecklistItemAlterado, DadosProjetoRequest, EtapaDoChecklist, Projeto } from '../types/projeto';
import { api } from './cliente';

const PROJETOS_ENDPOINT = '/api/projetos';
const CHECKLIST_ENDPOINT = '/api/checklist';

/** Projetos do cliente, do mais novo para o mais antigo. Todo cliente nasce com um projeto no cadastro. */
export async function listarProjetosDoCliente(clienteId: string): Promise<Projeto[]> {
  const { data } = await api.get<Projeto[]>(PROJETOS_ENDPOINT, { params: { clienteId } });
  return data;
}

/** Novo projeto do cliente; a API já cria o checklist de todas as etapas. Nome repetido no cliente dá 400. */
export async function criarProjeto(clienteId: string, dados: DadosProjetoRequest): Promise<Projeto> {
  const { data } = await api.post<Projeto>(PROJETOS_ENDPOINT, { clienteId, ...dados });
  return data;
}

/** Nome, endereço da obra e responsável. Nome vazio ou repetido entre os projetos do cliente dá 400. */
export async function atualizarProjeto(projetoId: string, dados: DadosProjetoRequest): Promise<Projeto> {
  const { data } = await api.put<Projeto>(`${PROJETOS_ENDPOINT}/${projetoId}`, dados);
  return data;
}

/** Todas as etapas do projeto, cada uma já com os seus itens (o checklist completo é criado junto com o projeto). */
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

/** Link inválido (sem https://) dá 400. */
export async function definirLinkDrive(projetoId: string, linkDrive: string): Promise<Projeto> {
  const { data } = await api.put<Projeto>(`${PROJETOS_ENDPOINT}/${projetoId}/link-drive`, { linkDrive });
  return data;
}

export async function removerLinkDrive(projetoId: string): Promise<Projeto> {
  const { data } = await api.delete<Projeto>(`${PROJETOS_ENDPOINT}/${projetoId}/link-drive`);
  return data;
}

/**
 * Projeto vai para "Concluído". A API recusa (400) se o checklist ainda não chegou na etapa final
 * ou se falta o link do Drive. O cliente só vai para a aba Concluídos com todos os projetos concluídos.
 */
export async function concluirProjeto(projetoId: string): Promise<Projeto> {
  const { data } = await api.patch<Projeto>(`${PROJETOS_ENDPOINT}/${projetoId}/status`, { status: 'Concluido' });
  return data;
}

/** Volta para "Em andamento"; o cliente volta para a aba Clientes. */
export async function reabrirProjeto(projetoId: string): Promise<Projeto> {
  const { data } = await api.patch<Projeto>(`${PROJETOS_ENDPOINT}/${projetoId}/status`, { status: 'EmAndamento' });
  return data;
}

/** Guarda no histórico que o projeto foi entregue ao cliente pelo WhatsApp. */
export async function registrarEntrega(projetoId: string, linkDrive: string): Promise<void> {
  await api.post(`${PROJETOS_ENDPOINT}/${projetoId}/entrega`, { linkDrive, notificarWhatsApp: true });
}

/** Exclui o projeto com o checklist e as entregas. O único projeto do cliente não pode ser excluído (400). */
export async function excluirProjeto(projetoId: string): Promise<void> {
  await api.delete(`${PROJETOS_ENDPOINT}/${projetoId}`);
}

/** Item personalizado do cliente, em qualquer etapa do projeto. */
export async function adicionarItem(projetoId: string, etapaId: string, descricao: string): Promise<void> {
  await api.post(`${PROJETOS_ENDPOINT}/${projetoId}/checklist`, { descricao, subEtapaId: null, etapaId });
}

/** Remove item avulso; a resposta avisa se, sem ele, a etapa atual já pode avançar. */
export async function removerItem(itemId: string): Promise<ChecklistItemAlterado> {
  const { data } = await api.delete<ChecklistItemAlterado>(`${CHECKLIST_ENDPOINT}/${itemId}`);
  return data;
}
