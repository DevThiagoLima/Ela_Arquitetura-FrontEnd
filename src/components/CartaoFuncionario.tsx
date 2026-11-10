import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import type { Funcionario } from '../types/funcionario';
import { formatarTelefone, isoParaDataBr } from '../utils/formatacao';
import { Scale, useResponsive } from '../utils/responsividade';

type Props = {
  funcionario: Funcionario;
  /** Tela de informações: mostra também o aniversário e textos maiores. */
  detalhado?: boolean;
  onPress?: () => void;
  /** Conteúdo abaixo dos campos (ex.: botões Editar/Excluir). */
  children?: ReactNode;
};

type IconeNome = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type CampoProps = {
  icone: IconeNome;
  texto: string;
  vazio?: boolean;
  detalhado: boolean;
};

function Campo({ icone, texto, vazio = false, detalhado }: CampoProps) {
  const { s } = useResponsive();
  const styles = useMemo(() => createStyles(s, detalhado), [s, detalhado]);

  return (
    <View style={styles.campo}>
      <MaterialCommunityIcons name={icone} size={s(detalhado ? 26 : 22)} color={colors.icon} />
      <Text style={[styles.texto, vazio && styles.textoVazio]} maxFontSizeMultiplier={1.2} numberOfLines={1}>
        {texto}
      </Text>
    </View>
  );
}

export function CartaoFuncionario({ funcionario, detalhado = false, onPress, children }: Props) {
  const { s } = useResponsive();
  const styles = useMemo(() => createStyles(s, detalhado), [s, detalhado]);
  const telefone = formatarTelefone(funcionario.telefone);
  const aniversario = isoParaDataBr(funcionario.dataNascimento);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? `Ver informações de ${funcionario.nome}` : undefined}
      style={({ pressed }) => [styles.cartao, pressed && styles.pressed]}
    >
      <Campo icone="card-account-details-outline" texto={funcionario.nome} detalhado={detalhado} />
      <Campo
        icone="phone-outline"
        texto={telefone ?? 'Sem telefone cadastrado'}
        vazio={!telefone}
        detalhado={detalhado}
      />
      <Campo icone="email-outline" texto={funcionario.email} detalhado={detalhado} />
      {detalhado ? (
        <Campo
          icone="cake-variant-outline"
          texto={aniversario ?? 'Sem aniversário cadastrado'}
          vazio={!aniversario}
          detalhado={detalhado}
        />
      ) : null}
      {children}
    </Pressable>
  );
}

const createStyles = (s: Scale, detalhado: boolean) =>
  StyleSheet.create({
    cartao: {
      backgroundColor: colors.inputBackground,
      borderWidth: s(1),
      borderColor: colors.inputBorder,
      borderRadius: s(14),
      paddingTop: s(detalhado ? 24 : 16),
      paddingBottom: s(detalhado ? 24 : 4),
      paddingHorizontal: s(detalhado ? 24 : 16),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: s(3) },
      shadowOpacity: 0.25,
      shadowRadius: s(4),
      elevation: 4,
    },
    pressed: {
      opacity: 0.7,
    },
    campo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: s(detalhado ? 22 : 12),
    },
    texto: {
      flex: 1,
      marginLeft: s(10),
      fontFamily: fonts.italic,
      fontSize: s(detalhado ? 15 : 14),
      color: colors.inputText,
    },
    textoVazio: {
      color: colors.inputPlaceholder,
    },
  });
