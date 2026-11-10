import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { atualizarFuncionario, cadastrarFuncionario, getFuncionariosErrorMessage } from '../api/servicoFuncionarios';
import { BarraNavegacaoInferior } from '../components/BarraNavegacaoInferior';
import { BotaoLogin } from '../components/BotaoLogin';
import { CabecalhoTela } from '../components/CabecalhoTela';
import { CampoTextoComIcone } from '../components/CampoTextoComIcone';
import type { RootStackParamList } from '../navigation/tipos';
import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import type { FuncionarioRequest } from '../types/funcionario';
import {
  dataBrParaIso,
  formatarTelefone,
  isoParaDataBr,
  mascararData,
  mascararTelefone,
  somenteDigitos,
} from '../utils/formatacao';
import { Scale, useResponsive } from '../utils/responsividade';

const logo = require('../../assets/logo.png');

type Navegacao = NativeStackNavigationProp<RootStackParamList>;
type Rota = RouteProp<RootStackParamList, 'FormularioFuncionario'>;

/** Cadastro (sem parâmetro) e edição (com o funcionário, campos já preenchidos). */
export default function TelaFormularioFuncionario() {
  const { s } = useResponsive();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navegacao>();
  const { params } = useRoute<Rota>();
  const styles = useMemo(() => createStyles(s, insets.top), [s, insets.top]);

  const existente = params?.funcionario;
  const editando = !!existente;

  const [nome, setNome] = useState(existente?.nome ?? '');
  const [telefone, setTelefone] = useState(formatarTelefone(existente?.telefone ?? null) ?? '');
  const [email, setEmail] = useState(existente?.email ?? '');
  const [aniversario, setAniversario] = useState(isoParaDataBr(existente?.dataNascimento ?? null) ?? '');
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSalvar = async () => {
    if (salvando || sucesso) return;

    if (!nome.trim() || !email.trim()) {
      setErro('Preencha o nome e o e-mail.');
      return;
    }

    const digitosTelefone = somenteDigitos(telefone);
    if (digitosTelefone && digitosTelefone.length < 10) {
      setErro('Informe o telefone com DDD.');
      return;
    }

    const dataNascimento = aniversario ? dataBrParaIso(aniversario) : null;
    if (aniversario && !dataNascimento) {
      setErro('Informe o aniversário no formato DD/MM/AAAA.');
      return;
    }

    const payload: FuncionarioRequest = {
      nome: nome.trim(),
      telefone: digitosTelefone || null,
      email: email.trim(),
      dataNascimento,
    };

    setErro(null);
    setSalvando(true);
    try {
      if (existente) {
        await atualizarFuncionario(existente.id, payload);
      } else {
        await cadastrarFuncionario(payload);
      }
      // Mostra a confirmação por 1 segundo e volta: na edição, para as informações;
      // no cadastro, para a lista. As duas telas recarregam sozinhas ao ter foco.
      setSucesso(true);
      setTimeout(() => navigation.goBack(), 1000);
    } catch (e) {
      setErro(getFuncionariosErrorMessage(e));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <View style={styles.tela}>
      <View style={styles.topo}>
        <CabecalhoTela titulo={editando ? 'Edição - Funcionário' : 'Cadastro - Funcionário'} />
      </View>

      <KeyboardAvoidingView style={styles.corpo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Image source={logo} style={styles.logo} resizeMode="contain" accessibilityLabel="Logo" />

            <Text style={styles.label} maxFontSizeMultiplier={1.2}>
              Nome Completo
            </Text>
            <CampoTextoComIcone
              icon="person-outline"
              placeholder="Informe o nome completo ..."
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />

            <Text style={styles.label} maxFontSizeMultiplier={1.2}>
              Telefone
            </Text>
            <CampoTextoComIcone
              icon="call-outline"
              placeholder="Informe o telefone do funcionário ..."
              value={telefone}
              onChangeText={(v) => setTelefone(mascararTelefone(v))}
              keyboardType="phone-pad"
            />

            <Text style={styles.label} maxFontSizeMultiplier={1.2}>
              E-mail
            </Text>
            <CampoTextoComIcone
              icon="mail-outline"
              placeholder="Informe o e-mail do funcionário ..."
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label} maxFontSizeMultiplier={1.2}>
              Aniversário
            </Text>
            <CampoTextoComIcone
              icon="calendar-outline"
              placeholder="DD/MM/AAAA"
              value={aniversario}
              onChangeText={(v) => setAniversario(mascararData(v))}
              keyboardType="numeric"
            />

            {erro ? (
              <Text style={styles.erro} accessibilityLiveRegion="polite">
                {erro}
              </Text>
            ) : null}

            <BotaoLogin
              title={editando ? 'Finalizar Edição' : 'Finalizar Cadastro'}
              onPress={handleSalvar}
              loading={salvando}
              style={styles.botao}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BarraNavegacaoInferior
        abaAtiva="Funcionarios"
        onTrocarAba={(aba) => navigation.popTo('Abas', { screen: aba })}
      />

      {sucesso ? (
        <View style={styles.sobreposicao} accessibilityLiveRegion="polite">
          <View style={styles.avisoSucesso}>
            <Ionicons name="checkmark-circle-outline" size={s(48)} color={colors.onCard} />
            <Text style={styles.textoSucesso} maxFontSizeMultiplier={1.2}>
              {editando ? 'Funcionário atualizado!' : 'Funcionário cadastrado!'}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (s: Scale, safeTop: number) =>
  StyleSheet.create({
    tela: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topo: {
      paddingTop: safeTop,
      backgroundColor: colors.card,
    },
    corpo: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: s(16),
      paddingVertical: s(24),
    },
    card: {
      paddingHorizontal: s(10),
      paddingTop: s(12),
      paddingBottom: s(24),
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
      width: s(72),
      height: s(44),
    },
    label: {
      marginTop: s(12),
      marginLeft: s(10),
      marginBottom: s(6),
      fontFamily: fonts.italic,
      fontSize: s(15),
      color: colors.onCard,
    },
    erro: {
      marginTop: s(14),
      paddingHorizontal: s(10),
      textAlign: 'center',
      fontFamily: fonts.italic,
      fontSize: s(14),
      color: colors.error,
    },
    botao: {
      marginTop: s(24),
      width: s(190),
    },
    sobreposicao: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    avisoSucesso: {
      alignItems: 'center',
      paddingHorizontal: s(24),
      paddingVertical: s(20),
      backgroundColor: colors.card,
      borderRadius: s(18),
    },
    textoSucesso: {
      marginTop: s(8),
      fontFamily: fonts.italic,
      fontSize: s(18),
      color: colors.onCard,
    },
  });
