import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { excluirFuncionario, getFuncionariosErrorMessage } from '../api/servicoFuncionarios';
import { BarraNavegacaoInferior } from '../components/BarraNavegacaoInferior';
import { BotaoAcao } from '../components/BotaoAcao';
import { CabecalhoTela } from '../components/CabecalhoTela';
import type { RootStackParamList } from '../navigation/tipos';
import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import { Scale, useResponsive } from '../utils/responsividade';

type Navegacao = NativeStackNavigationProp<RootStackParamList>;
type Rota = RouteProp<RootStackParamList, 'ExclusaoFuncionario'>;

export default function TelaExclusaoFuncionario() {
  const { s } = useResponsive();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navegacao>();
  const { funcionarioId } = useRoute<Rota>().params;
  const styles = useMemo(() => createStyles(s, insets.top), [s, insets.top]);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleExcluir = async () => {
    setErro(null);
    setExcluindo(true);
    try {
      await excluirFuncionario(funcionarioId);
      // Volta direto para a lista (que recarrega ao ter foco), pulando as informações.
      navigation.popTo('Abas', { screen: 'Funcionarios' });
    } catch (e) {
      setErro(getFuncionariosErrorMessage(e));
      setExcluindo(false);
    }
  };

  return (
    <View style={styles.tela}>
      <View style={styles.topo}>
        <CabecalhoTela titulo="Exclusão" />
      </View>

      <View style={styles.corpo}>
        <View style={styles.card} accessibilityRole="alert">
          <Text style={styles.titulo} maxFontSizeMultiplier={1.2}>
            Excluir Funcionário?
          </Text>

          <BotaoAcao
            titulo="Excluir"
            cor={colors.danger}
            onPress={handleExcluir}
            carregando={excluindo}
            style={styles.botao}
          />
          <BotaoAcao
            titulo="CANCELAR"
            onPress={() => navigation.goBack()}
            desabilitado={excluindo}
            style={styles.botao}
          />

          {erro ? (
            <Text style={styles.erro} accessibilityLiveRegion="polite">
              {erro}
            </Text>
          ) : null}
        </View>
      </View>

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
    corpo: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: s(16),
    },
    card: {
      alignItems: 'center',
      paddingHorizontal: s(20),
      paddingTop: s(48),
      paddingBottom: s(32),
      backgroundColor: colors.card,
      borderRadius: s(18),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: s(4) },
      shadowOpacity: 0.35,
      shadowRadius: s(6),
      elevation: 8,
    },
    titulo: {
      marginBottom: s(40),
      textAlign: 'center',
      fontFamily: fonts.italic,
      fontSize: s(22),
      color: colors.onCard,
    },
    botao: {
      width: s(158),
      marginBottom: s(18),
    },
    erro: {
      marginTop: s(4),
      textAlign: 'center',
      fontFamily: fonts.italic,
      fontSize: s(14),
      color: colors.error,
    },
  });
