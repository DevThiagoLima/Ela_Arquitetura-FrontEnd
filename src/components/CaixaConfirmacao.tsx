import React, { useMemo } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import { Scale, useResponsive } from '../utils/responsividade';

type Props = {
  visivel: boolean;
  titulo: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  /** Cor do botão de confirmar (ex.: verde no "Entregar Projeto?" do Figma). */
  corConfirmar?: string;
  carregando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
};

/**
 * Pergunta de confirmação no estilo do Figma (Frames 32 e 33).
 * Usa Modal em vez de Alert.alert porque o Alert não funciona na versão web.
 */
export function CaixaConfirmacao({
  visivel,
  titulo,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  corConfirmar = colors.primary,
  carregando = false,
  onConfirmar,
  onCancelar,
}: Props) {
  const { s } = useResponsive();
  const styles = useMemo(() => createStyles(s), [s]);

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={styles.sobreposicao}>
        <View style={styles.caixa} accessibilityRole="alert">
          <Text style={styles.titulo} maxFontSizeMultiplier={1.2}>
            {titulo}
          </Text>

          <Pressable
            onPress={onConfirmar}
            disabled={carregando}
            accessibilityRole="button"
            style={({ pressed }) => [styles.botao, { backgroundColor: corConfirmar }, pressed && styles.pressed]}
          >
            {carregando ? (
              <ActivityIndicator color={colors.onPrimary} />
            ) : (
              <Text style={styles.textoBotao} maxFontSizeMultiplier={1.2}>
                {textoConfirmar}
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={onCancelar}
            disabled={carregando}
            accessibilityRole="button"
            style={({ pressed }) => [styles.botao, styles.botaoCancelar, pressed && styles.pressed]}
          >
            <Text style={styles.textoBotao} maxFontSizeMultiplier={1.2}>
              {textoCancelar}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (s: Scale) =>
  StyleSheet.create({
    sobreposicao: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(24),
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    caixa: {
      width: '100%',
      maxWidth: s(320),
      alignItems: 'center',
      paddingHorizontal: s(20),
      paddingVertical: s(24),
      backgroundColor: colors.card,
      borderRadius: s(18),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: s(4) },
      shadowOpacity: 0.35,
      shadowRadius: s(6),
      elevation: 8,
    },
    titulo: {
      marginBottom: s(20),
      textAlign: 'center',
      fontFamily: fonts.italic,
      fontSize: s(18),
      color: colors.onCard,
    },
    botao: {
      width: s(150),
      height: s(40),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: s(10),
      borderRadius: s(12),
    },
    botaoCancelar: {
      backgroundColor: colors.primary,
      opacity: 0.75,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    textoBotao: {
      fontFamily: fonts.italic,
      fontSize: s(15),
      color: colors.onPrimary,
    },
  });
