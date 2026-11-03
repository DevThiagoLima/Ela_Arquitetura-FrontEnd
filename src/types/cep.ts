// Resposta de https://viacep.com.br/ws/{cep}/json/ (só os campos usados).
export interface EnderecoViaCep {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean | string;
}
