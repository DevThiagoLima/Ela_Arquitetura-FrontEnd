import type { NavigatorScreenParams } from '@react-navigation/native';

import type { Funcionario } from '../types/funcionario';

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
  CadastroCliente: undefined;
  Checklist: { clienteId: string };
};