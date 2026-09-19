import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { PontosCarregando } from '../components/PontosCarregando';
import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import { Scale, useResponsive } from '../utils/responsividade';

const logo = require('../../assets/logo.png');

/**
 * IMPORTANTE: mantenha igual ao "imageWidth" do plugin expo-splash-screen no app.json.
 * Assim o logo fica exatamente no mesmo lugar e no mesmo tamanho da splash nativa,
 * e a troca entre as duas telas não dá "pulo".
 */
const LARGURA_LOGO = 200;

const { width: larguraOriginal, height: alturaOriginal } = Image.resolveAssetSource(logo);
const ALTURA_LOGO = LARGURA_LOGO / (larguraOriginal / alturaOriginal);

export default function TelaCarregando() {
  const { s } = useResponsive();
  const styles = useMemo(() => createStyles(s), [s]);

  return (
    <View
      style={styles.tela}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel="Carregando"
    >
      <Image source={logo} style={styles.logo} resizeMode="contain" />

      <View style={styles.rodape}>
        <View style={styles.linha}>
          <Text style={styles.texto} maxFontSizeMultiplier={1.2}>
            Carregando
          </Text>
          <PontosCarregando style={styles.pontos} />
        </View>
      </View>
    </View>
  );
}

const createStyles = (s: Scale) =>
  StyleSheet.create({
    tela: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    logo: {
      width: LARGURA_LOGO,
      height: ALTURA_LOGO,
    },
    // Posicionado de forma absoluta para o logo ficar exatamente no centro da tela
    // (igual à splash nativa) e o texto aparecer logo abaixo dele.
    rodape: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: '50%',
      marginTop: ALTURA_LOGO / 1 + s(28),
      alignItems: 'center',
    },
    linha: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    texto: {
      fontFamily: fonts.italic,
      fontSize: s(18),
      lineHeight: s(24),
      color: colors.onBackground,
    },
    pontos: {
      marginLeft: s(6),
      marginBottom: s(8),
    },
  });