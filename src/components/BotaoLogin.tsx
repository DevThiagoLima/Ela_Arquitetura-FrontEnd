import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import { Scale, useResponsive } from '../utils/responsividade';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
}: Props) {
  const { s } = useResponsive();
  const styles = useMemo(() => createStyles(s), [s]);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} />
      ) : (
        <Text style={styles.title} maxFontSizeMultiplier={1.2}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const createStyles = (s: Scale) =>
  StyleSheet.create({
    button: {
      alignSelf: 'center',
      width: s(154),
      height: s(50),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: s(16),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: s(3) },
      shadowOpacity: 0.4,
      shadowRadius: s(4),
      elevation: 5,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    disabled: {
      opacity: 0.7,
    },
    title: {
      fontFamily: fonts.italic,
      fontSize: s(16),
      color: colors.onPrimary,
    },
  });