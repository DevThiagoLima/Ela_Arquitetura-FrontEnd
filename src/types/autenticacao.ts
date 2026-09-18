// Contrato assumido com a API em C# (alinhar com o backend).
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}