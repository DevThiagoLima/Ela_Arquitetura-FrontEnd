import React, { useMemo, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getLoginErrorMessage, login } from '../api/servicoAutenticacao';
import { IconTextInput } from '../components/CampoTextoComIcone';
import { PrimaryButton } from '../components/BotaoLogin';
import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import type { LoginResponse } from '../types/autenticacao';
import { Scale, useResponsive } from '../utils/responsividade';

const logo = require('../../assets/logo.png');

type Props = {
  /** Chamado quando o login dá certo. Aqui entra a navegação. */
  onLoginSuccess?: (data: LoginResponse) => void;
};

export default function LoginScreen({ onLoginSuccess }: Props) {
  const { s } = useResponsive();
  const styles = useMemo(() => createStyles(s), [s]);

  const passwordRef = useRef<TextInput>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (loading) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Preencha o e-mail e a senha.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const data = await login({ email: trimmedEmail, password });
      onLoginSuccess?.(data);
    } catch (e) {
      setError(getLoginErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Image
              source={logo}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Logo"
            />

            <Text style={styles.label} maxFontSizeMultiplier={1.2}>
              Usuário
            </Text>
            <IconTextInput
              icon="person-outline"
              placeholder="Digite seu e-mail ..."
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="username"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <Text style={[styles.label, styles.labelSpaced]} maxFontSizeMultiplier={1.2}>
              Senha
            </Text>
            <IconTextInput
              ref={passwordRef}
              icon="lock-closed-outline"
              placeholder="Digite sua senha ..."
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />

            {error ? (
              <Text style={styles.error} accessibilityLiveRegion="polite">
                {error}
              </Text>
            ) : null}

            <PrimaryButton
              title="Entrar"
              onPress={handleLogin}
              loading={loading}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (s: Scale) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: s(17),
      paddingVertical: s(24),
    },
    card: {
      width: '100%',
      maxWidth: s(368),
      paddingHorizontal: s(10),
      paddingTop: s(20),
      paddingBottom: s(52),
      backgroundColor: colors.card,
      borderRadius: s(18),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: s(4) },
      shadowOpacity: 0.35,
      shadowRadius: s(6),
      elevation: 8,
    },
    logo: {
      alignSelf: 'center',
      width: s(94),
      height: s(57),
      marginBottom: s(16),
    },
    label: {
      marginLeft: s(19),
      marginBottom: s(10),
      fontFamily: fonts.italic,
      fontSize: s(22),
      lineHeight: s(30),
      color: colors.onCard,
    },
    labelSpaced: {
      marginTop: s(32),
    },
    error: {
      marginTop: s(14),
      paddingHorizontal: s(10),
      textAlign: 'center',
      fontFamily: fonts.italic,
      fontSize: s(14),
      color: colors.error,
    },
    button: {
      marginTop: s(32),
    },
  });