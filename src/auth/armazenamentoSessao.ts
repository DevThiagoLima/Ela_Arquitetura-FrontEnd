import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { Sessao } from '../types/autenticacao';

const CHAVE = 'ela-arquitetura.sessao';

// O SecureStore (Keychain no iOS, Keystore no Android) não existe na versão web, que só é
// usada em desenvolvimento (expo start --web). Lá a sessão fica no localStorage.
const naWeb = Platform.OS === 'web';

export async function carregarSessao(): Promise<Sessao | null> {
  try {
    const bruto = naWeb ? globalThis.localStorage?.getItem(CHAVE) : await SecureStore.getItemAsync(CHAVE);
    if (!bruto) return null;

    const sessao = JSON.parse(bruto) as Partial<Sessao>;
    return sessao.token && sessao.refreshToken ? (sessao as Sessao) : null;
  } catch {
    // Dado corrompido ou armazenamento indisponível: começa deslogado.
    return null;
  }
}

export async function salvarSessao(sessao: Sessao): Promise<void> {
  const bruto = JSON.stringify(sessao);
  if (naWeb) {
    globalThis.localStorage?.setItem(CHAVE, bruto);
  } else {
    await SecureStore.setItemAsync(CHAVE, bruto);
  }
}

export async function apagarSessao(): Promise<void> {
  if (naWeb) {
    globalThis.localStorage?.removeItem(CHAVE);
  } else {
    await SecureStore.deleteItemAsync(CHAVE);
  }
}
