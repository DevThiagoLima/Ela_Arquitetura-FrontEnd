import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors } from '../theme/cores';
import { Scale, useResponsive } from '../utils/responsividade';

type Props = {
  onPress: () => void;
};

export function BotaoFlutuante({ onPress }: Props) {
  const { s } = useResponsive();
  const styles = useMemo(() => createStyles(s), [s]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Adicionar"
      style={({ pressed }) => [styles.botao, pressed && styles.pressed]}
    >
      <MaterialCommunityIcons name="file-document-plus-outline" size={s(28)} color={colors.onCard} />
    </Pressable>
  );
}

const createStyles = (s: Scale) =>
  StyleSheet.create({
    botao: {
      position: 'absolute',
      right: s(10),
      bottom: s(8),
      width: s(63),
      height: s(63),
      borderRadius: s(13),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: s(3) },
      shadowOpacity: 0.4,
      shadowRadius: s(4),
      elevation: 5,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.96 }],
    },
  });
