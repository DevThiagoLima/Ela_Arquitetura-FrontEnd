// Contrato de GET /api/clientes (ClienteOutput na API em C#).
export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  endereco: string | null;
  cpf: string | null;
  pontoReferencia: string | null;
  enderecoObra: string | null;
  dataCadastro: string;
  ativo: boolean;
}

// Corpo de POST /api/clientes (CriarClienteRequest na API em C#).
export interface CadastroClienteRequest {
  nome: string;
  telefone: string;
  email: string | null;
  endereco: string | null;
  cpf: string | null;
  enderecoObra: string | null;
}
