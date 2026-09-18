import { OpenSans_400Regular_Italic, useFonts } from '@expo-google-fonts/open-sans';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { setAuthToken } from './src/api/cliente';
import LoginScreen from './src/screens/TelaLogin';
import type { LoginResponse } from './src/types/autenticacao';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({ OpenSans_400Regular_Italic });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const handleLoginSuccess = (data: LoginResponse) => {
    setAuthToken(data.token);
    // TODO: guardar o token (expo-secure-store) e navegar para a próxima tela.
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <LoginScreen onLoginSuccess={handleLoginSuccess} />
    </SafeAreaProvider>
  );
}