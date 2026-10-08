// Contrato assumido com a API em C# (alinhar com o backend).
export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  nome: string;
  cargo: string;
}