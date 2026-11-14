import { createContext, useContext } from 'react';

type ValorSessao = {
  nome: string;
  /** Encerra a sessão no servidor e no aparelho, voltando para o login. */
  sair: () => Promise<void>;
};

const ContextoSessao = createContext<ValorSessao | null>(null);

export const ProvedorSessao = ContextoSessao.Provider;

/** Sessão da usuária logada; null fora da área logada (ex.: tela de login). */
export function useSessao(): ValorSessao | null {
  return useContext(ContextoSessao);
}
