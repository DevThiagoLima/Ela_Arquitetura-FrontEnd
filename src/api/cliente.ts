import axios, { InternalAxiosRequestConfig, isAxiosError } from 'axios';

import type { RefreshResponse, Sessao } from '../types/autenticacao';

const configuracaoBase = {
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
};

export const api = axios.create(configuracaoBase);

/** Cliente sem interceptor, só para renovar o token (evita a renovação chamar a si mesma). */
const apiSemRenovacao = axios.create(configuracaoBase);

type OuvintesSessao = {
  /** Tokens renovados: o app deve guardar a sessão nova. */
  onSessaoAtualizada?: (sessao: Sessao) => void;
  /** O servidor recusou a renovação: o app deve voltar para o login. */
  onSessaoExpirada?: () => void;
};

let sessaoAtual: Sessao | null = null;
let ouvintes: OuvintesSessao = {};
let renovacaoEmAndamento: Promise<string> | null = null;

/** Define (ou remove) a sessão usada em todas as próximas requisições. */
export function definirSessao(sessao: Sessao | null) {
  sessaoAtual = sessao;
  if (sessao) {
    api.defaults.headers.common.Authorization = `Bearer ${sessao.token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function obterSessao(): Sessao | null {
  return sessaoAtual;
}

export function registrarOuvintesSessao(novosOuvintes: OuvintesSessao) {
  ouvintes = novosOuvintes;
}

/**
 * Troca o refresh token por um par novo. Se várias requisições derem 401 ao mesmo tempo,
 * todas esperam a mesma renovação: o backend trata reuso de refresh token como roubo e
 * encerraria a sessão se o mesmo token fosse enviado duas vezes.
 */
function renovarToken(): Promise<string> {
  if (!renovacaoEmAndamento) {
    renovacaoEmAndamento = (async () => {
      const sessao = sessaoAtual;
      if (!sessao) throw new Error('Sem sessão para renovar.');

      const { data } = await apiSemRenovacao.post<RefreshResponse>('/api/auth/refresh', {
        refreshToken: sessao.refreshToken,
      });

      const novaSessao: Sessao = { ...sessao, token: data.token, refreshToken: data.refreshToken };
      definirSessao(novaSessao);
      ouvintes.onSessaoAtualizada?.(novaSessao);
      return novaSessao.token;
    })().finally(() => {
      renovacaoEmAndamento = null;
    });
  }
  return renovacaoEmAndamento;
}

type ConfiguracaoComRenovacao = InternalAxiosRequestConfig & { _jaRenovou?: boolean };

api.interceptors.response.use(undefined, async (error: unknown) => {
  if (!isAxiosError(error) || error.response?.status !== 401 || !error.config) throw error;

  const original = error.config as ConfiguracaoComRenovacao;
  const rotaDeAutenticacao = original.url?.startsWith('/api/auth/') ?? false;
  if (original._jaRenovou || rotaDeAutenticacao || !sessaoAtual) throw error;
  original._jaRenovou = true;

  // A requisição saiu com um token antigo, mas outra já renovou: basta repetir com o atual.
  const tokenUsado = original.headers.get('Authorization');
  let token = sessaoAtual.token;
  if (tokenUsado === `Bearer ${token}`) {
    try {
      token = await renovarToken();
    } catch (erroRenovacao) {
      // Só derruba a sessão se o servidor recusou o refresh; sem internet, a sessão continua guardada.
      if (isAxiosError(erroRenovacao) && erroRenovacao.response?.status === 401) {
        definirSessao(null);
        ouvintes.onSessaoExpirada?.();
      }
      throw error;
    }
  }

  original.headers.set('Authorization', `Bearer ${token}`);
  return api(original);
});
