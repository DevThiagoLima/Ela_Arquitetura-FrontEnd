// Contrato de /api/funcionarios (FuncionarioOutput na API em C#).
// Funcionário é só um cadastro para consulta; não faz login no app.
export interface Funcionario {
  id: string;
  nome: string;
  email: string;
  /** Formato da API: "+5583999999999". */
  telefone: string | null;
  /** Formato ISO: "2003-08-10". */
  dataNascimento: string | null;
  ativo: boolean;
}

// Corpo de POST /api/funcionarios e PUT /api/funcionarios/{id}.
export interface FuncionarioRequest {
  nome: string;
  email: string;
  telefone: string | null;
  dataNascimento: string | null;
}
