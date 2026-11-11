import { RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getFuncionariosErrorMessage, obterFuncionario } from '../api/servicoFuncionarios';
import { BarraNavegacaoInferior } from '../components/BarraNavegacaoInferior';
import { BotaoAcao } from '../components/BotaoAcao';
import { CabecalhoTela } from '../components/CabecalhoTela';
import { CartaoFuncionario } from '../components/CartaoFuncionario';
import type { RootStackParamList } from '../navigation/tipos';
import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import type { Funcionario } from '../types/funcionario';
import { Scale, useResponsive } from '../utils/responsividade';

type Navegacao = NativeStackNavigationProp<RootStackParamList>;
type Rota = RouteProp<RootStackParamList, 'InformacoesFuncionario'>;

export default function TelaInformacoesFuncionario() {
  const { s } = useResponsive();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navegacao>();
  const { funcionarioId } = useRoute<Rota>().params;
  const styles = useMemo(() => createStyles(s, insets.top), [s, insets.top]);
  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Busca de novo a cada foco, para refletir o que foi salvo na edição.
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      (async () => {
        setErro(null);
        try {
          const dados = await obterFuncionario(funcionarioId);
          if (ativo) setFuncionario(dados);
        } catch (e) {
          if (ativo) setErro(getFuncionariosErrorMessage(e));
        }
      })();

      return () => {
        ativo = false;
      };
    }, [funcionarioId]),
  );

  const renderConteudo = () => {
    if (erro) {
      return (
        <Text style={[styles.aviso, styles.avisoErro]} maxFontSizeMultiplier={1.2}>
          {erro}
        </Text>
      );
    }
    if (!funcionario) {
      return <ActivityIndicator size="large" color={colors.card} />;
    }
    return (
      <CartaoFuncionario funcionario={funcionario} detalhado>
        <View style={styles.botoes}>
          <BotaoAcao
            titulo="Editar"
            onPress={() => navigation.navigate('FormularioFuncionario', { funcionario })}
            style={styles.botao}
          />
          <BotaoAcao
            titulo="Excluir"
            cor={colors.danger}
            onPress={() => navigation.navigate('ExclusaoFuncionario', { funcionarioId })}
            style={styles.botao}
          />
        </View>
      </CartaoFuncionario>
    );
  };

  return (
    <View style={styles.tela}>
      <View style={styles.topo}>
        <CabecalhoTela titulo="Informações" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderConteudo()}
      </ScrollView>

      <BarraNavegacaoInferior
        abaAtiva="Funcionarios"
        onTrocarAba={(aba) => navigation.popTo('Abas', { screen: aba })}
      />
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
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: s(14),
      paddingVertical: s(24),
    },
    botoes: {
      flexDirection: 'row',
      gap: s(16),
      marginTop: s(6),
    },
    botao: {
      flex: 1,
    },
    aviso: {
      textAlign: 'center',
      fontFamily: fonts.italic,
      fontSize: s(15),
      color: colors.onBackground,
    },
    avisoErro: {
      color: colors.primary,
    },
  });
