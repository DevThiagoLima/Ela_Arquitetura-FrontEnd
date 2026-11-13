import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Aba, BarraNavegacaoInferior } from '../components/BarraNavegacaoInferior';
import TelaCadastroCliente from '../screens/TelaCadastroCliente';
import TelaChecklist from '../screens/TelaChecklist';
import TelaClientes from '../screens/TelaClientes';
import TelaConcluidos from '../screens/TelaConcluidos';
import TelaExclusaoFuncionario from '../screens/TelaExclusaoFuncionario';
import TelaFormularioFuncionario from '../screens/TelaFormularioFuncionario';
import TelaFormularioProjeto from '../screens/TelaFormularioProjeto';
import { TelaFuncionarios } from '../screens/TelaFuncionarios';
import TelaInformacoesFuncionario from '../screens/TelaInformacoesFuncionario';
import type { AbasParamList, RootStackParamList } from './tipos';

const Tab = createBottomTabNavigator<AbasParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function Abas() {
  return (
    <Tab.Navigator
      initialRouteName="Clientes"
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => (
        <BarraNavegacaoInferior
          abaAtiva={state.routeNames[state.index] as Aba}
          onTrocarAba={(aba) => {
            const rota = state.routes.find((r) => r.name === aba);
            if (!rota) return;

            // Avisa a tela do toque, como a barra padrão faz (a TelaClientes usa para recarregar).
            navigation.emit({ type: 'tabPress', target: rota.key, canPreventDefault: true });
            navigation.navigate(aba);
          }}
        />
      )}
    >
      <Tab.Screen name="Funcionarios" component={TelaFuncionarios} />
      <Tab.Screen name="Clientes" component={TelaClientes} />
      <Tab.Screen name="Concluidos" component={TelaConcluidos} />
    </Tab.Navigator>
  );
}

export function Navegacao() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Abas" component={Abas} />
      <Stack.Screen name="FormularioFuncionario" component={TelaFormularioFuncionario} />
      <Stack.Screen name="InformacoesFuncionario" component={TelaInformacoesFuncionario} />
      <Stack.Screen name="ExclusaoFuncionario" component={TelaExclusaoFuncionario} />
      <Stack.Screen name="CadastroCliente" component={TelaCadastroCliente} />
      <Stack.Screen name="Checklist" component={TelaChecklist} />
      <Stack.Screen name="FormularioProjeto" component={TelaFormularioProjeto} />
    </Stack.Navigator>
  );
}