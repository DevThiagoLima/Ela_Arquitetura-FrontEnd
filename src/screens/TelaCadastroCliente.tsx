import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { buscarEnderecoPorCep } from '../api/servicoCep';
import { atualizarCliente, cadastrarCliente, getCadastroErrorMessage } from '../api/servicoClientes';
import { BarraNavegacaoInferior } from '../components/BarraNavegacaoInferior';
import { BotaoLogin } from '../components/BotaoLogin';
import { CabecalhoTela } from '../components/CabecalhoTela';
import { CampoTextoComIcone } from '../components/CampoTextoComIcone';
import type { RootStackParamList } from '../navigation/tipos';
import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import { formatarTelefone } from '../utils/formatacao';
import { Scale, useResponsive } from '../utils/responsividade';

type Navegacao = NativeStackNavigationProp<RootStackParamList>;
type Rota = RouteProp<RootStackParamList, 'CadastroCliente'>;

const somenteDigitos = (valor: string) => valor.replace(/\D/g, '');
const textoOuNulo = (valor: string) => valor.trim() || null;

/**
 * Cadastro (sem parâmetro) e edição (com o cliente, campos já preenchidos).
 * O endereço da obra só aparece no cadastro: ele vai para o primeiro projeto e depois é editado no projeto.
 */
export default function TelaCadastroCliente() {
  const { s } = useResponsive();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navegacao>();
  const { params } = useRoute<Rota>();
  const styles = useMemo(() => createStyles(s, insets.top), [s, insets.top]);

  const existente = params?.cliente;
  const editando = !!existente;

  const [nome, setNome] = useState(existente?.nome ?? '');
  const [cpf, setCpf] = useState(existente?.cpf ?? '');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState(existente?.endereco ?? '');
  const [cepObra, setCepObra] = useState('');
  const [enderecoObra, setEnderecoObra] = useState('');
  const [telefone, setTelefone] = useState(formatarTelefone(existente?.telefone ?? null) ?? '');
  const [email, setEmail] = useState(existente?.email ?? '');
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Ao completar os 8 dígitos do CEP, preenche o endereço pelo ViaCEP.
  const preencherPorCep = async (
    valor: string,
    setCepCampo: (v: string) => void,
    setEnderecoCampo: (v: string) => void,
  ) => {
    const digitos = somenteDigitos(valor).slice(0, 8);
    setCepCampo(digitos);
    if (digitos.length !== 8) return;

    try {
      const enderecoEncontrado = await buscarEnderecoPorCep(digitos);
      if (enderecoEncontrado) {
        setEnderecoCampo(enderecoEncontrado);
        setErro(null);
      } else {
        setErro('CEP não encontrado.');
      }
    } catch {
      setErro('Não foi possível consultar o CEP. Preencha o endereço manualmente.');
    }
  };

  const handleCadastrar = async () => {
    if (salvando || sucesso) return;

    if (!nome.trim() || !telefone.trim()) {
      setErro('Preencha o nome e o telefone.');
      return;
    }

    setErro(null);
    setSalvando(true);
    try {
      const dados = {
        nome: nome.trim(),
        telefone: telefone.trim(),
        email: textoOuNulo(email),
        endereco: textoOuNulo(endereco),
        cpf: textoOuNulo(cpf),
      };
      if (existente) {
        // O app não edita o ponto de referência; manda o que já estava para não apagar.
        await atualizarCliente(existente.id, { ...dados, pontoReferencia: existente.pontoReferencia });
      } else {
        await cadastrarCliente({ ...dados, enderecoObra: textoOuNulo(enderecoObra) });
      }
      // Mostra a confirmação por 1 segundo e volta; a tela anterior recarrega sozinha ao ter foco.
      setSucesso(true);
      setTimeout(() => navigation.goBack(), 1000);
    } catch (e) {
      setErro(getCadastroErrorMessage(e));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <View style={styles.tela}>
      <View style={styles.topo}>
        <CabecalhoTela titulo={editando ? 'Edição - Cliente' : 'Cadastro - Cliente'} />
      </View>

      <KeyboardAvoidingView
        style={styles.corpo}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
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
              CPF
            </Text>
            <CampoTextoComIcone
              icon="card-outline"
              placeholder="Informe o CPF do cliente ..."
              value={cpf}
              onChangeText={setCpf}
              keyboardType="numeric"
              maxLength={14}
            />

            <Text style={styles.label} maxFontSizeMultiplier={1.2}>
              CEP
            </Text>
            <CampoTextoComIcone
              icon="map-outline"
              placeholder="Informe o CEP do cliente ..."
              value={cep}
              onChangeText={(v) => preencherPorCep(v, setCep, setEndereco)}
              keyboardType="numeric"
            />

            <Text style={styles.label} maxFontSizeMultiplier={1.2}>
              Endereço
            </Text>
            <CampoTextoComIcone
              icon="location-outline"
              placeholder="Informe o endereço do cliente ..."
              value={endereco}
              onChangeText={setEndereco}
            />

            {editando ? null : (
              <>
                <Text style={styles.label} maxFontSizeMultiplier={1.2}>
                  CEP da Obra
                </Text>
                <CampoTextoComIcone
                  icon="map-outline"
                  placeholder="Informe o CEP da obra ..."
                  value={cepObra}
                  onChangeText={(v) => preencherPorCep(v, setCepObra, setEnderecoObra)}
                  keyboardType="numeric"
                />

                <Text style={styles.label} maxFontSizeMultiplier={1.2}>
                  Endereço da Obra
                </Text>
                <CampoTextoComIcone
                  icon="construct-outline"
                  placeholder="Informe o endereço da obra ..."
                  value={enderecoObra}
                  onChangeText={setEnderecoObra}
                />
              </>
            )}

            <Text style={styles.label} maxFontSizeMultiplier={1.2}>
              Telefone
            </Text>
            <CampoTextoComIcone
              icon="call-outline"
              placeholder="Informe o telefone do cliente ..."
              value={telefone}
              onChangeText={setTelefone}
              keyboardType="phone-pad"
            />

            <Text style={styles.label} maxFontSizeMultiplier={1.2}>
              E-mail
            </Text>
            <CampoTextoComIcone
              icon="mail-outline"
              placeholder="Informe o e-mail do cliente ..."
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {erro ? (
              <Text style={styles.erro} accessibilityLiveRegion="polite">
                {erro}
              </Text>
            ) : null}

            <BotaoLogin
              title={editando ? 'Salvar Alterações' : 'Finalizar Cadastro'}
              onPress={handleCadastrar}
              loading={salvando}
              style={styles.botao}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BarraNavegacaoInferior
        abaAtiva="Clientes"
        onTrocarAba={(aba) => navigation.navigate('Abas', { screen: aba })}
      />

      {sucesso ? (
        <View style={styles.sobreposicao} accessibilityLiveRegion="polite">
          <View style={styles.avisoSucesso}>
            <Ionicons name="checkmark-circle-outline" size={s(48)} color={colors.onCard} />
            <Text style={styles.textoSucesso} maxFontSizeMultiplier={1.2}>
              {editando ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!'}
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
      paddingHorizontal: s(12),
      paddingVertical: s(16),
    },
    card: {
      paddingHorizontal: s(10),
      paddingTop: s(8),
      paddingBottom: s(20),
      backgroundColor: colors.card,
      borderRadius: s(18),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: s(4) },
      shadowOpacity: 0.35,
      shadowRadius: s(6),
      elevation: 8,
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
      marginTop: s(20),
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
