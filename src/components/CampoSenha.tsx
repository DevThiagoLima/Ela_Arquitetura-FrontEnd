import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import type { Ref } from 'react';
import { Pressable, TextInput, TextInputProps } from 'react-native';

import { colors } from '../theme/cores';
import { useResponsive } from '../utils/responsividade';
import { CampoTextoComIcone } from './CampoTextoComIcone';

type Props = Omit<TextInputProps, 'secureTextEntry'> & {
  ref?: Ref<TextInput>;
};

export function CampoSenha({ ref, ...props }: Props) {
  const { s } = useResponsive();
  const [visivel, setVisivel] = useState(false);

  return (
    <CampoTextoComIcone
      ref={ref}
      icon="lock-closed-outline"
      secureTextEntry={!visivel}
      rightElement={
        <Pressable
          onPress={() => setVisivel((atual) => !atual)}
          hitSlop={s(10)}
          accessibilityRole="button"
          accessibilityLabel={visivel ? 'Ocultar senha' : 'Mostrar senha'}
        >
          <Ionicons
            name={visivel ? 'eye-off-outline' : 'eye-outline'}
            size={s(26)}
            color={colors.icon}
          />
        </Pressable>
      }
      {...props}
    />
  );
}