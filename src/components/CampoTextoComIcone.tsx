import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import type { ComponentProps, ReactNode, Ref } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import { Scale, useResponsive } from '../utils/responsividade';

type Props = TextInputProps & {
  icon: ComponentProps<typeof Ionicons>['name'];
  /** Elemento exibido no canto direito do campo (ex.: botão de mostrar senha). */
  rightElement?: ReactNode;
  ref?: Ref<TextInput>;
};

export function CampoTextoComIcone({ icon, rightElement, style, ref, ...inputProps }: Props) {
  const { s } = useResponsive();
  const styles = useMemo(() => createStyles(s), [s]);

  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={s(30)} color={colors.icon} style={styles.icon} />
      <TextInput
        ref={ref}
        style={[styles.input, style]}
        placeholderTextColor={colors.inputPlaceholder}
        maxFontSizeMultiplier={1.2}
        {...inputProps}
      />
      {rightElement ? <View style={styles.rightElement}>{rightElement}</View> : null}
    </View>
  );
}

const createStyles = (s: Scale) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      height: s(50),
      paddingHorizontal: s(10),
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: s(16),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: s(3) },
      shadowOpacity: 0.35,
      shadowRadius: s(4),
      elevation: 4,
    },
    icon: {
      marginRight: s(8),
    },
    input: {
      flex: 1,
      paddingVertical: 0,
      fontFamily: fonts.italic,
      fontSize: s(16),
      color: colors.inputText,
    },
    rightElement: {
      marginLeft: s(8),
    },
  });