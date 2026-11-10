import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getFuncionariosErrorMessage, listarFuncionarios } from '../api/servicoFuncionarios';
import { BotaoFlutuante } from '../components/BotaoFlutuante';
import { CabecalhoTela } from '../components/CabecalhoTela';
import { CartaoFuncionario } from '../components/CartaoFuncionario';
import type { AbasParamList, RootStackParamList } from '../navigation/tipos';
import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import type { Funcionario } from '../types/funcionario';
import { Scale, useResponsive } from '../utils/responsividade';

// Aba dentro do stack: abre as telas de cadastro e informações, que ficam no stack.
type Navegacao = CompositeNavigationProp<
  BottomTabNavigationProp<AbasParamList, 'Funcionarios'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function TelaFuncionarios() {
  const { s } = useResponsive();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navegacao>();
  const styles = useMemo(() => createStyles(s, insets.top), [s, insets.top]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Recarrega sempre que a tela fica visível: ao trocar de aba e ao voltar
  // do cadastro, da edição ou da exclusão.
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      (async () => {
        setErro(null);
        setCarregando(true);
        try {
          const dados = await listarFuncionarios();
          if (ativo) setFuncionarios(dados);
        } catch (e) {
          if (ativo) setErro(getFuncionariosErrorMessage(e));
        } finally {
          if (ativo) setCarregando(false);
        }
      })();

      return () => {
        ativo = false;
      };
    }, []),
  );

  const renderListaVazia = () => {
    if (carregando) {
      return <ActivityIndicator size="large" color={colors.card} style={styles.aviso} />;
    }
    return (
      <Text style={[styles.aviso, erro ? styles.avisoErro : null]} maxFontSizeMultiplier={1.2}>
        {erro ?? 'Nenhum funcionário cadastrado.'}
      </Text>
    );
  };

  return (
    <View style={styles.tela}>
      <View style={styles.topo}>
        <CabecalhoTela titulo="Funcionários" />
      </View>

      <View style={styles.corpo}>
        <FlatList
          data={carregando ? [] : funcionarios}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CartaoFuncionario
              funcionario={item}
              onPress={() => navigation.navigate('InformacoesFuncionario', { funcionarioId: item.id })}
            />
          )}
          ItemSeparatorComponent={() => <View style={styles.separador} />}
          ListEmptyComponent={renderListaVazia}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />
        <BotaoFlutuante
          onPress={() => navigation.navigate('FormularioFuncionario')}
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
    aviso: {
      marginTop: s(32),
      textAlign: 'center',
      fontFamily: fonts.italic,
      fontSize: s(15),
      color: colors.onBackground,
    },
    avisoErro: {
      color: colors.primary,
    },
  });
