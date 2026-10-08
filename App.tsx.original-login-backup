import { OpenSans_400Regular_Italic, useFonts } from '@expo-google-fonts/open-sans';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { setAuthToken } from './src/api/cliente';
import TelaCarregando from './src/screens/TelaCarregando';
import TelaLogin from './src/screens/TelaLogin';
import type { LoginResponse } from './src/types/autenticacao';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 300, fade: true });

/** Tempo mínimo em que a tela "Carregando ..." fica visível. Use 0 para desativar. */
const TEMPO_MINIMO_CARREGANDO_MS = 3000;

export default function App() {
  const [fontsLoaded] = useFonts({ OpenSans_400Regular_Italic });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!fontsLoaded) return;

    SplashScreen.hideAsync();

    // TODO: quando houver token salvo (expo-secure-store), troque este timer
    // pela verificação real e só então encerre o "carregando".
    const timer = setTimeout(() => setCarregando(false), TEMPO_MINIMO_CARREGANDO_MS);
    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const handleLoginSuccess = (data: LoginResponse) => {
    setAuthToken(data.token);
    // TODO: guardar o token (expo-secure-store) e navegar para a próxima tela.
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {carregando ? <TelaCarregando /> : <TelaLogin onLoginSuccess={handleLoginSuccess} />}
    </SafeAreaProvider>
  );
}