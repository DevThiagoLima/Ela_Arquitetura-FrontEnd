import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import { Scale, useResponsive } from '../utils/responsividade';

const logo = require('../../assets/logo.png');

type Props = {
  titulo: string;
};

export function CabecalhoTela({ titulo }: Props) {
  const { s } = useResponsive();
  const styles = useMemo(() => createStyles(s), [s]);

  return (
    <View style={styles.cabecalho}>
      <Image source={logo} style={styles.logo} resizeMode="contain" accessibilityLabel="Logo" />
      <Text style={styles.titulo} maxFontSizeMultiplier={1.2}>
        {titulo}
      </Text>
    </View>
  );
}

const createStyles = (s: Scale) =>
  StyleSheet.create({
    cabecalho: {
      flexDirection: 'row',
      alignItems: 'center',
      height: s(64),
      paddingHorizontal: s(20),
      backgroundColor: colors.card,
      borderBottomLeftRadius: s(24),
      borderBottomRightRadius: s(24),
    },
    logo: {
      width: s(36),
      height: s(36),
      marginRight: s(12),
    },
    titulo: {
      fontFamily: fonts.italic,
      fontSize: s(24),
      color: colors.onCard,
    },
  });
