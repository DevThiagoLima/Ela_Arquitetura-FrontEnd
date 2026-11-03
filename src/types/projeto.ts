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
  status: StatusProjeto;
  etapaAtualId: string;
  dataInicio: string;
  dataConclusao: string | null;
  percentualConcluido: number;
  funcionarios: FuncionarioDoProjeto[];
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
