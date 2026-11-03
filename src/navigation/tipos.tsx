import type { NavigatorScreenParams } from '@react-navigation/native';

export type AbasParamList = {
  Funcionarios: undefined;
  Clientes: undefined;
  Concluidos: undefined;
};

export type RootStackParamList = {
  Abas: NavigatorScreenParams<AbasParamList>;
  CadastroFuncionario: undefined;
  CadastroCliente: undefined;
};