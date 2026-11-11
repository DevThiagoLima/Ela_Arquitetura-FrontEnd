export const somenteDigitos = (valor: string) => valor.replace(/\D/g, '');

/**
 * Máscara enquanto digita: "(83) 99999-9999" (celular) ou "(83) 3333-4444" (fixo).
 */
export function mascararTelefone(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/**
 * Telefone da API ("+5583999999999") para exibição ("(83) 99999-9999").
 * Números de fora do Brasil ficam como vieram.
 */
export function formatarTelefone(telefone: string | null): string | null {
  if (!telefone) return null;
  const d = somenteDigitos(telefone);
  if (d.startsWith('55') && (d.length === 12 || d.length === 13)) {
    return mascararTelefone(d.slice(2));
  }
  return telefone;
}

/** Máscara enquanto digita: "10/08/2003". */
export function mascararData(valor: string): string {
  const d = somenteDigitos(valor).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/**
 * "10/08/2003" → "2003-08-10". Devolve null se a data não existir (ex.: 31/02).
 */
export function dataBrParaIso(data: string): string | null {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data);
  if (!partes) return null;

  const [, dia, mes, ano] = partes;
  const convertida = new Date(Number(ano), Number(mes) - 1, Number(dia));
  const existe =
    convertida.getFullYear() === Number(ano) &&
    convertida.getMonth() === Number(mes) - 1 &&
    convertida.getDate() === Number(dia);

  return existe ? `${ano}-${mes}-${dia}` : null;
}

/** "2003-08-10" → "10/08/2003". */
export function isoParaDataBr(data: string | null): string | null {
  if (!data) return null;
  const [ano, mes, dia] = data.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}
