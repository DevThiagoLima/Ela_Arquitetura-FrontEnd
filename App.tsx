import { OpenSans_400Regular_Italic, useFonts } from '@expo-google-fonts/open-sans';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import TelaClientes from './src/screens/TelaClientes';

export default function App() {
  const [fontsLoaded] = useFonts({ OpenSans_400Regular_Italic });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <TelaClientes />
    </SafeAreaProvider>    
  );
}
