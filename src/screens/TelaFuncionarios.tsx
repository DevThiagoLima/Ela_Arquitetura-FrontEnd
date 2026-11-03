import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotaoFlutuante } from '../components/BotaoFlutuante';
import { CabecalhoTela } from '../components/CabecalhoTela';
import { CartaoFuncionario, Funcionario } from '../components/CartaoFuncionario';
import type { RootStackParamList } from '../navigation/tipos';
import { colors } from '../theme/cores';
import { Scale, useResponsive } from '../utils/responsividade';

const FUNCIONARIOS_MOCK: Funcionario[] = [
  { id: '1', nome: 'Nome Completo', telefone: 'Telefone', email: 'E-mail', aniversario: 'Aniversário' },
  { id: '2', nome: 'Nome Completo', telefone: 'Telefone', email: 'E-mail', aniversario: 'Aniversário' },
  { id: '3', nome: 'Nome Completo', telefone: 'Telefone', email: 'E-mail', aniversario: 'Aniversário' },
  { id: '4', nome: 'Nome Completo', telefone: 'Telefone', email: 'E-mail', aniversario: 'Aniversário' },
];

type Navegacao = NativeStackNavigationProp<RootStackParamList>;

export function TelaFuncionarios() {
  const { s } = useResponsive();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navegacao>();
  const styles = useMemo(() => createStyles(s, insets.top), [s, insets.top]);

  return (
    <View style={styles.tela}>
      <View style={styles.topo}>
        <CabecalhoTela titulo="Funcionários" />
      </View>

      <View style={styles.corpo}>
        <FlatList
          data={FUNCIONARIOS_MOCK}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CartaoFuncionario funcionario={item} />}
          ItemSeparatorComponent={() => <View style={styles.separador} />}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />
        <BotaoFlutuante
          onPress={() => navigation.navigate('CadastroFuncionario')}
          icone="badge-account-outline"
          rotulo="Adicionar funcionário"
        />
      </View>
    </View>
  );
}

const createStyles = (s: Scale, safeTop: number) =>
  StyleSheet.create({
    tela: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topo: {
      paddingTop: safeTop,
      backgroundColor: colors.card,
    },
    corpo: {
      flex: 1,
    },
    lista: {
      paddingHorizontal: s(12),
      paddingTop: s(16),
      paddingBottom: s(63 + 8 + 16),
    },
    separador: {
      height: s(16),
    },
  });