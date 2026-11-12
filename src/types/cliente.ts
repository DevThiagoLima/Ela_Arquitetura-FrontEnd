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
  quantidadeProjetos: number;
}

// Corpo de PUT /api/clientes/{id} (AtualizarClienteRequest na API em C#).
export interface AtualizarClienteRequest {
  nome: string;
  telefone: string;
  email: string | null;
  endereco: string | null;
  cpf: string | null;
  pontoReferencia: string | null;
}

// Corpo de POST /api/clientes. O endereço da obra vai para o primeiro projeto, que nasce junto com o cliente.
export interface CadastroClienteRequest extends Omit<AtualizarClienteRequest, 'pontoReferencia'> {
  enderecoObra: string | null;
}
