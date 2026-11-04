import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import { Scale, useResponsive } from '../utils/responsividade';

export type Funcionario = {
  id: string;
  nome: string;
  telefone: string;
  email: string;
  aniversario: string;
};

type Props = {
  funcionario: Funcionario;
};

type IconeNome = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type CampoProps = {
  icone: IconeNome;
  texto: string;
  comEspaco?: boolean;
};

function Campo({ icone, texto, comEspaco = true }: CampoProps) {
  const { s } = useResponsive();
  const styles = useMemo(() => createStyles(s), [s]);

  return (
    <View style={[styles.campo, comEspaco && styles.campoComEspaco]}>
      <MaterialCommunityIcons name={icone} size={s(22)} color={colors.icon} />
      <Text style={styles.texto} maxFontSizeMultiplier={1.2}>
        {texto}
      </Text>
    </View>
  );
}

export function CartaoFuncionario({ funcionario }: Props) {
  const { s } = useResponsive();
  const styles = useMemo(() => createStyles(s), [s]);
  const { nome, telefone, email, aniversario } = funcionario;

  return (
    <View style={styles.cartao}>
      <Campo icone="card-account-details-outline" texto={nome} />
      <Campo icone="phone-outline" texto={telefone} />
      <Campo icone="email-outline" texto={email} />
      <Campo icone="cake-variant-outline" texto={aniversario} comEspaco={false} />
    </View>
  );
}

const createStyles = (s: Scale) =>
  StyleSheet.create({
    cartao: {
      backgroundColor: colors.inputBackground,
      borderWidth: s(1),
      borderColor: colors.inputBorder,
      borderRadius: s(14),
      paddingVertical: s(16),
      paddingHorizontal: s(16),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: s(3) },
      shadowOpacity: 0.25,
      shadowRadius: s(4),
      elevation: 4,
    },
    campo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    campoComEspaco: {
      marginBottom: s(12),
    },
    texto: {
      flex: 1,
      marginLeft: s(10),
      fontFamily: fonts.italic,
      fontSize: s(14),
      color: colors.inputText,
    },
  });