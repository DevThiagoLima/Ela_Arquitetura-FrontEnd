import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import { Scale, useResponsive } from '../utils/responsividade';

type Props = {
  nome: string;
  telefone: string;
  email: string | null;
  onPress?: () => void;
};

export function CardCliente({ nome, telefone, email, onPress }: Props) {
  const { s } = useResponsive();
  const styles = useMemo(() => createStyles(s), [s]);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir checklist de ${nome}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.linha}>
        <MaterialCommunityIcons name="account-outline" size={s(20)} color={colors.icon} />
        <Text style={styles.texto} maxFontSizeMultiplier={1.2} numberOfLines={1}>
          {nome}
        </Text>
      </View>
      <View style={styles.linha}>
        <MaterialCommunityIcons name="phone-outline" size={s(20)} color={colors.icon} />
        <Text style={styles.texto} maxFontSizeMultiplier={1.2} numberOfLines={1}>
          {telefone}
        </Text>
      </View>
      <View style={[styles.linha, styles.ultimaLinha]}>
        <MaterialCommunityIcons name="email-outline" size={s(20)} color={colors.icon} />
        <Text style={styles.texto} maxFontSizeMultiplier={1.2} numberOfLines={1}>
          {email ?? 'Sem e-mail cadastrado'}
        </Text>
      </View>
    </Pressable>
  );
}

const createStyles = (s: Scale) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.inputBackground,
      borderRadius: s(16),
      padding: s(14),
      marginBottom: s(14),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: s(3) },
      shadowOpacity: 0.35,
      shadowRadius: s(4),
      elevation: 4,
    },
    pressed: {
      opacity: 0.7,
    },
    linha: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: s(8),
    },
    ultimaLinha: {
      marginBottom: 0,
    },
    texto: {
      marginLeft: s(8),
      fontFamily: fonts.italic,
      fontSize: s(15),
      color: colors.onBackground,
      flexShrink: 1,
    },
  });
