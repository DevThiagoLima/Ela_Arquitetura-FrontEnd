import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import { Scale, useResponsive } from '../utils/responsividade';

type Props = {
  titulo: string;
  onPress: () => void;
  /** Cor de fundo; padrão é a cor primária (ex.: colors.danger para "Excluir"). */
  cor?: string;
  carregando?: boolean;
  desabilitado?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Botão de ação dos cards (Editar/Excluir/Cancelar), no estilo do Figma. */
export function BotaoAcao({
  titulo,
  onPress,
  cor = colors.primary,
  carregando = false,
  desabilitado = false,
  style,
}: Props) {
  const { s } = useResponsive();
  const styles = useMemo(() => createStyles(s), [s]);
  const inativo = desabilitado || carregando;

  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityState={{ disabled: inativo, busy: carregando }}
      style={({ pressed }) => [
        styles.botao,
        { backgroundColor: cor },
        pressed && styles.pressed,
        inativo && styles.inativo,
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={colors.onPrimary} />
      ) : (
        <Text style={styles.texto} maxFontSizeMultiplier={1.2}>
          {titulo}
        </Text>
      )}
    </Pressable>
  );
}

const createStyles = (s: Scale) =>
  StyleSheet.create({
    botao: {
      height: s(46),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: s(14),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: s(3) },
      shadowOpacity: 0.35,
      shadowRadius: s(4),
      elevation: 5,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    inativo: {
      opacity: 0.7,
    },
    texto: {
      fontFamily: fonts.italic,
      fontSize: s(16),
      color: colors.onPrimary,
    },
  });
