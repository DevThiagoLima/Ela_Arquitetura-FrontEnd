import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useSessao } from '../auth/ContextoSessao';
import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import { Scale, useResponsive } from '../utils/responsividade';
import { CaixaConfirmacao } from './CaixaConfirmacao';

const logo = require('../../assets/logo.png');

type Props = {
  titulo: string;
};

export function CabecalhoTela({ titulo }: Props) {
  const { s } = useResponsive();
  const styles = useMemo(() => createStyles(s), [s]);
  const sessao = useSessao();
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  return (
    <View style={styles.cabecalho}>
      <Image source={logo} style={styles.logo} resizeMode="contain" accessibilityLabel="Logo" />
      <Text style={styles.titulo} maxFontSizeMultiplier={1.2} numberOfLines={1}>
        {titulo}
      </Text>

      {sessao ? (
        <>
          <Pressable
            onPress={() => setConfirmandoSaida(true)}
            accessibilityRole="button"
            accessibilityLabel="Sair"
            hitSlop={s(10)}
            style={({ pressed }) => [styles.botaoSair, pressed && styles.pressionado]}
          >
            <Ionicons name="log-out-outline" size={s(28)} color={colors.onCard} />
          </Pressable>

          <CaixaConfirmacao
            visivel={confirmandoSaida}
            titulo="Deseja sair?"
            textoConfirmar="Sair"
            onConfirmar={() => {
              setConfirmandoSaida(false);
              sessao.sair();
            }}
            onCancelar={() => setConfirmandoSaida(false)}
          />
        </>
      ) : null}
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
      flex: 1,
      fontFamily: fonts.italic,
      fontSize: s(24),
      color: colors.onCard,
    },
    botaoSair: {
      marginLeft: s(12),
    },
    pressionado: {
      opacity: 0.6,
    },
  });
