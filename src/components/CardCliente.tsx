import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import { Scale, useResponsive } from '../utils/responsividade';

type Props = {
  nome: string;
  statusProjeto: string;
  funcionariaResponsavel: string;
};

export function CardCliente({ nome, statusProjeto, funcionariaResponsavel }: Props) {
  const { s } = useResponsive();
  const styles = useMemo(() => createStyles(s), [s]);

  return (
    <View style={styles.card}>
      <View style={styles.linha}>
        <MaterialCommunityIcons name="account-outline" size={s(20)} color={colors.icon} />
        <Text style={styles.texto} maxFontSizeMultiplier={1.2} numberOfLines={1}>
          {nome}
        </Text>
      </View>
      <View style={styles.linha}>
        <MaterialCommunityIcons name="card-text-outline" size={s(20)} color={colors.icon} />
        <Text style={styles.texto} maxFontSizeMultiplier={1.2} numberOfLines={1}>
          {statusProjeto}
        </Text>
      </View>
      <View style={[styles.linha, styles.ultimaLinha]}>
        <MaterialCommunityIcons name="card-account-details-outline" size={s(20)} color={colors.icon} />
        <Text style={styles.texto} maxFontSizeMultiplier={1.2} numberOfLines={1}>
          {funcionariaResponsavel}
        </Text>
      </View>
    </View>
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
