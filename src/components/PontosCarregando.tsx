import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors } from '../theme/cores';
import { useResponsive } from '../utils/responsividade';

const QUANTIDADE_PONTOS = 3;
const DEFASAGEM_MS = 160; // atraso entre um ponto e o próximo
const DURACAO_MOVIMENTO_MS = 320; // subida (e descida) de cada ponto
const PAUSA_MS = 360; // descanso antes de recomeçar o ciclo

function Ponto({ indice }: { indice: number }) {
  const { s } = useResponsive();
  const deslocamento = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const amplitude = s(5);

    const animacao = Animated.sequence([
      Animated.delay(indice * DEFASAGEM_MS),
      Animated.loop(
        Animated.sequence([
          Animated.timing(deslocamento, {
            toValue: -amplitude,
            duration: DURACAO_MOVIMENTO_MS,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(deslocamento, {
            toValue: 0,
            duration: DURACAO_MOVIMENTO_MS,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(PAUSA_MS),
        ]),
      ),
    ]);

    animacao.start();
    return () => animacao.stop();
  }, [deslocamento, indice, s]);

  const tamanho = s(6);

  return (
    <Animated.View
      style={{
        width: tamanho,
        height: tamanho,
        borderRadius: tamanho / 2,
        marginHorizontal: s(2),
        backgroundColor: colors.onBackground,
        transform: [{ translateY: deslocamento }],
      }}
    />
  );
}

type Props = {
  style?: StyleProp<ViewStyle>;
};

export function PontosCarregando({ style }: Props) {
  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: QUANTIDADE_PONTOS }, (_, indice) => (
        <Ponto key={indice} indice={indice} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});