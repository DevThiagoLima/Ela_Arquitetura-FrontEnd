import type { NavigatorScreenParams } from '@react-navigation/native';

import type { Cliente } from '../types/cliente';
import type { Funcionario } from '../types/funcionario';
import type { Projeto } from '../types/projeto';

export type AbasParamList = {
  Funcionarios: undefined;
  Clientes: undefined;
  Concluidos: undefined;
};

export type RootStackParamList = {
  Abas: NavigatorScreenParams<AbasParamList>;
  /** Sem parâmetro é cadastro; com o funcionário, edição (campos já preenchidos). */
  FormularioFuncionario: { funcionario: Funcionario } | undefined;
  InformacoesFuncionario: { funcionarioId: string };
  ExclusaoFuncionario: { funcionarioId: string };
  /** Sem parâmetro é cadastro; com o cliente, edição (campos já preenchidos). */
  CadastroCliente: { cliente: Cliente } | undefined;
  /** Sem projetoId abre o projeto mais recente em andamento do cliente. */
  Checklist: { clienteId: string; projetoId?: string };
  /** Sem projeto é um novo projeto do cliente; com ele, edição. */
  FormularioProjeto: { clienteId: string; nomeCliente: string; projeto?: Projeto };
};