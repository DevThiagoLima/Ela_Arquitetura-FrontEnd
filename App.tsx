import { OpenSans_400Regular_Italic, useFonts } from '@expo-google-fonts/open-sans';
import { NavigationContainer } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { setAuthToken } from './src/api/cliente';
import { Navegacao } from './src/navigation';
import TelaCarregando from './src/screens/TelaCarregando';
import TelaLogin from './src/screens/TelaLogin';
import type { LoginResponse } from './src/types/autenticacao';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 300, fade: true });

const TEMPO_MINIMO_CARREGANDO_MS = 3000;

export default function App() {
  const [fontsLoaded] = useFonts({ OpenSans_400Regular_Italic });
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState<LoginResponse | null>(null);

  useEffect(() => {
    if (!fontsLoaded) return;

    SplashScreen.hideAsync();

    const timer = setTimeout(() => setCarregando(false), TEMPO_MINIMO_CARREGANDO_MS);
    return () => clearTimeout(timer);
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const handleLoginSuccess = (data: LoginResponse) => {
    setAuthToken(data.token);
    setUsuario(data);
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {carregando ? (
        <TelaCarregando />
      ) : usuario ? (
        <NavigationContainer>
          <Navegacao />
        </NavigationContainer>
      ) : (
        <TelaLogin onLoginSuccess={handleLoginSuccess} />
      )}
    </SafeAreaProvider>
  );
}