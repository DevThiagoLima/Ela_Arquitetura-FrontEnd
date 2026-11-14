import { OpenSans_400Regular_Italic, useFonts } from '@expo-google-fonts/open-sans';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { definirSessao, obterSessao, registrarOuvintesSessao } from './src/api/cliente';
import { logout } from './src/api/servicoAutenticacao';
import { apagarSessao, carregarSessao, salvarSessao } from './src/auth/armazenamentoSessao';
import { ProvedorSessao } from './src/auth/ContextoSessao';
import { Navegacao } from './src/navigation';
import TelaLogin from './src/screens/TelaLogin';
import type { Sessao } from './src/types/autenticacao';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 300, fade: true });

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ OpenSans_400Regular_Italic });
  /** Nome da usuária logada; null mostra a tela de login. */
  const [nomeUsuario, setNomeUsuario] = useState<string | null>(null);
  const [sessaoRestaurada, setSessaoRestaurada] = useState(false);
  // Se a fonte falhar, o app abre com a fonte do sistema em vez de ficar preso na splash.
  const pronto = (fontsLoaded || fontError !== null) && sessaoRestaurada;

  useEffect(() => {
    registrarOuvintesSessao({
      onSessaoAtualizada: (sessao) => {
        salvarSessao(sessao).catch(() => {});
      },
      onSessaoExpirada: () => {
        apagarSessao().catch(() => {});
        setNomeUsuario(null);
      },
    });

    // Reabre o app já logado se houver sessão guardada. Se o token tiver vencido,
    // a primeira requisição recebe 401 e o cliente da API renova sozinho.
    carregarSessao()
      .then((sessao) => {
        if (sessao) {
          definirSessao(sessao);
          setNomeUsuario(sessao.nome);
        }
      })
      .finally(() => setSessaoRestaurada(true));
  }, []);

  // A splash nativa fica na tela enquanto a fonte e a sessão carregam; depois o app abre direto.
  useEffect(() => {
    if (pronto) SplashScreen.hideAsync();
  }, [pronto]);

  const handleLoginSuccess = useCallback((sessao: Sessao) => {
    definirSessao(sessao);
    salvarSessao(sessao).catch(() => {});
    setNomeUsuario(sessao.nome);
  }, []);

  const sair = useCallback(async () => {
    const sessao = obterSessao();
    definirSessao(null);
    setNomeUsuario(null);
    await apagarSessao().catch(() => {});
    // Melhor esforço: mesmo sem internet a usuária sai do app; o refresh token expira sozinho em 7 dias.
    if (sessao) logout(sessao.refreshToken).catch(() => {});
  }, []);

  const valorSessao = useMemo(
    () => (nomeUsuario ? { nome: nomeUsuario, sair } : null),
    [nomeUsuario, sair],
  );

  if (!pronto) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {valorSessao ? (
        <ProvedorSessao value={valorSessao}>
          <NavigationContainer>
            <Navegacao />
          </NavigationContainer>
        </ProvedorSessao>
      ) : (
        <TelaLogin onLoginSuccess={handleLoginSuccess} />
      )}
    </SafeAreaProvider>
  );
}
