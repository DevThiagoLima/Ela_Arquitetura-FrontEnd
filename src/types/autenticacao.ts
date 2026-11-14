// Contrato com a API em C# (AuthController).
export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  nome: string;
  cargo: string | null;
}

export interface RefreshResponse {
  token: string;
  refreshToken: string;
}

/** O que fica guardado no aparelho entre uma abertura do app e outra. */
export type Sessao = LoginResponse;
