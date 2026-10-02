import React, { useMemo } from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/cores';
import { Scale, useResponsive } from '../utils/responsividade';

export type Aba = 'Funcionarios' | 'Clientes' | 'Concluidos';

type Props = {
  abaAtiva: Aba;
  onTrocarAba: (aba: Aba) => void;
};

const ABAS: Aba[] = ['Funcionarios', 'Clientes', 'Concluidos'];

const ICONES: Record<Aba, ImageSourcePropType> = {
  Funcionarios: require('../../assets/icones/aba-funcionarios.png'),
  Clientes: require('../../assets/icones/aba-clientes.png'),
  Concluidos: require('../../assets/icones/aba-concluidos.png'),
};

const ROTULOS: Record<Aba, string> = {
  Funcionarios: 'Funcionários',
  Clientes: 'Clientes',
  Concluidos: 'Concluídos',
};

export function BarraNavegacaoInferior({ abaAtiva, onTrocarAba }: Props) {
  const { s } = useResponsive();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(s, insets.bottom), [s, insets.bottom]);

  return (
    <View style={styles.barra}>
      {ABAS.map((aba, indice) => (
        <React.Fragment key={aba}>
          <Pressable
            onPress={() => onTrocarAba(aba)}
            accessibilityRole="button"
            accessibilityLabel={ROTULOS[aba]}
            accessibilityState={{ selected: aba === abaAtiva }}
            style={({ pressed }) => [styles.botao, pressed && styles.pressed]}
          >
            <Image source={ICONES[aba]} style={styles.icone} resizeMode="contain" />
          </Pressable>
          {indice < ABAS.length - 1 ? <View style={styles.divisor} /> : null}
        </React.Fragment>
      ))}
    </View>
  );
}

const createStyles = (s: Scale, safeBottom: number) =>
  StyleSheet.create({
    barra: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingBottom: safeBottom,
    },
    botao: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: s(83),
    },
    pressed: {
      opacity: 0.7,
    },
    icone: {
      width: s(53),
      height: s(53),
    },
    divisor: {
      width: s(1.5),
      height: s(65),
      backgroundColor: colors.primary,
    },
  });
