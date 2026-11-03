import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Aba, BarraNavegacaoInferior } from '../components/BarraNavegacaoInferior';
import TelaClientes from '../screens/TelaClientes';
// import TelaConcluidos from '../screens/TelaConcluidos';
import { TelaFuncionarios } from '../screens/TelaFuncionarios';
import type { AbasParamList, RootStackParamList } from './tipos';

const Tab = createBottomTabNavigator<AbasParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Abas() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => (
        <BarraNavegacaoInferior
          abaAtiva={state.routeNames[state.index] as Aba}
          onTrocarAba={(aba) => navigation.navigate(aba)}
        />
      )}
    >
      <Tab.Screen name="Funcionarios" component={TelaFuncionarios} />
      <Tab.Screen name="Clientes" component={TelaClientes} />
      {/* <Tab.Screen name="Concluidos" component={TelaConcluidos} /> */}
    </Tab.Navigator>
  );
}

export function Navegacao() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Abas" component={Abas} />
      {/* <Stack.Screen name="CadastroFuncionario" component={TelaCadastroFuncionario} /> */}
      {/* <Stack.Screen name="CadastroCliente" component={TelaCadastroCliente} /> */}
    </Stack.Navigator>
  );
}