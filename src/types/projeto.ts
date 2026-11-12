// Contratos de /api/projetos (ProjetoOutput e EtapaDoChecklistOutput na API em C#).
export type StatusProjeto = 'EmAndamento' | 'Concluido';

export interface FuncionarioDoProjeto {
  funcionarioId: string;
  nome: string;
  papelNoProjeto: string | null;
}

export interface Projeto {
  id: string;
  clienteId: string;
  titulo: string;
  /** O endereço da obra é de cada projeto (o mesmo cliente pode ter obras em lugares diferentes). */
  enderecoObra: string | null;
  /** Pasta do Drive do projeto (item "Link do Drive" do card). */
  linkDrive: string | null;
  status: StatusProjeto;
  etapaAtualId: string;
  dataInicio: string;
  dataConclusao: string | null;
  percentualConcluido: number;
  funcionarios: FuncionarioDoProjeto[];
}

// Corpo de POST /api/projetos (com clienteId) e de PUT /api/projetos/{id}.
export interface DadosProjetoRequest {
  titulo: string;
  enderecoObra: string | null;
  /** null deixa o projeto sem responsável. */
  funcionarioResponsavelId: string | null;
}

export interface ChecklistItem {
  id: string;
  etapaId: string;
  subEtapaId: string | null;
  descricao: string;
  concluido: boolean;
  concluidoPor: string | null;
  dataConclusao: string | null;
}

// Resposta de PATCH /api/checklist/{id}/concluir e /reabrir.
export interface ChecklistItemAlterado {
  id: string;
  concluido: boolean;
  etapaPodeAvancar: boolean;
}

export interface SubEtapa {
  id: string;
  nome: string;
  ordem: number;
}

export interface EtapaDoChecklist {
  etapaId: string;
  nome: string;
  ordem: number;
  opcional: boolean;
  final: boolean;
  atual: boolean;
  concluida: boolean;
  subEtapas: SubEtapa[];
  itens: ChecklistItem[];
}
