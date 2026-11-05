import axios from 'axios';

import type { EnderecoViaCep } from '../types/cep';

// API pública do ViaCEP; não passa pelo nosso backend.
const viaCep = axios.create({
  baseURL: 'https://viacep.com.br/ws',
  timeout: 10000,
});

/**
 * Busca o CEP (8 dígitos) e devolve o endereço em uma linha,
 * ex.: "Avenida João Maurício, Manaíra, João Pessoa - PB, 58038-000".
 * Devolve null quando o CEP não existe.
 */
export async function buscarEnderecoPorCep(cep: string): Promise<string | null> {
  const { data } = await viaCep.get<EnderecoViaCep>(`/${cep}/json/`);
  if (data.erro) {
    return null;
  }

  const partes = [data.logradouro, data.bairro, `${data.localidade} - ${data.uf}`, data.cep];
  return partes.filter(Boolean).join(', ');
}
