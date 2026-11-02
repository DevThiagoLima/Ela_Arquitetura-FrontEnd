// Contrato de GET /api/clientes (ClienteOutput na API em C#).
export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  endereco: string | null;
  cpf: string | null;
  pontoReferencia: string | null;
  dataCadastro: string;
  ativo: boolean;
}
