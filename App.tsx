import { OpenSans_400Regular_Italic, useFonts } from '@expo-google-fonts/open-sans';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { setAuthToken } from './src/api/cliente';
import { Navegacao } from './src/navigation';
import TelaLogin from './src/screens/TelaLogin';
import type { LoginResponse } from './src/types/autenticacao';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 300, fade: true });

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ OpenSans_400Regular_Italic });
  const [usuario, setUsuario] = useState<LoginResponse | null>(null);
  // Se a fonte falhar, o app abre com a fonte do sistema em vez de ficar preso na splash.
  const pronto = fontsLoaded || fontError !== null;

  // A splash nativa fica na tela só enquanto a fonte carrega; depois o app abre direto.
  useEffect(() => {
    if (pronto) SplashScreen.hideAsync();
  }, [pronto]);

  if (!pronto) return null;

  const handleLoginSuccess = (data: LoginResponse) => {
    setAuthToken(data.token);
    setUsuario(data);
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {usuario ? (
        <NavigationContainer>
          <Navegacao />
        </NavigationContainer>
      ) : (
        <TelaLogin onLoginSuccess={handleLoginSuccess} />
      )}
    </SafeAreaProvider>
  );
}