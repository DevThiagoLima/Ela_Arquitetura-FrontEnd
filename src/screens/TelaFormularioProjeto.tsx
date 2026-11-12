import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { buscarEnderecoPorCep } from '../api/servicoCep';
import { getCadastroErrorMessage } from '../api/servicoClientes';
import { getFuncionariosErrorMessage, listarFuncionarios } from '../api/servicoFuncionarios';
import { atualizarProjeto, criarProjeto } from '../api/servicoProjetos';
import { BarraNavegacaoInferior } from '../components/BarraNavegacaoInferior';
import { BotaoLogin } from '../components/BotaoLogin';
import { CabecalhoTela } from '../components/CabecalhoTela';
import { CampoTextoComIcone } from '../components/CampoTextoComIcone';
import type { RootStackParamList } from '../navigation/tipos';
import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import type { Funcionario } from '../types/funcionario';
import { somenteDigitos } from '../utils/formatacao';
import { Scale, useResponsive } from '../utils/responsividade';

type Navegacao = NativeStackNavigationProp<RootStackParamList>;
type Rota = RouteProp<RootStackParamList, 'FormularioProjeto'>;

/**
 * Novo projeto do cliente (sem `projeto`) e edição (com ele): nome, endereço da obra e funcionária responsável.
 * Cada projeto tem os próprios dados; nada é copiado de outro projeto do cliente.
 */
export default function TelaFormularioProjeto() {
  const { s } = useResponsive();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navegacao>();
  const { clienteId, nomeCliente, projeto: existente } = useRoute<Rota>().params;
  const styles = useMemo(() => createStyles(s, insets.top), [s, insets.top]);
  const editando = !!existente;

  const [titulo, setTitulo] = useState(existente?.titulo ?? '');
  const [cepObra, setCepObra] = useState('');
  const [enderecoObra, setEnderecoObra] = useState(existente?.enderecoObra ?? '');
  const [responsavelId, setResponsavelId] = useState<string | null>(existente?.funcionarios[0]?.funcionarioId ?? null);
  const [funcionarios, setFuncionarios] = useState<Funcionario[] | null>(null);
  const [erroFuncionarios, setErroFuncionarios] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    listarFuncionarios()
      .then((dados) => ativo && setFuncionarios(dados))
      .catch((e) => ativo && setErroFuncionarios(getFuncionariosErrorMessage(e)));
    return () => {
      ativo = false;
    };
  }, []);

  // Ao completar os 8 dígitos do CEP, preenche o endereço pelo ViaCEP.
  const preencherPorCep = async (valor: string) => {
    const digitos = somenteDigitos(valor).slice(0, 8);
    setCepObra(digitos);
    if (digitos.length !== 8) return;

    try {
      const encontrado = await buscarEnderecoPorCep(digitos);
      if (encontrado) {
        setEnderecoObra(encontrado);
        setErro(null);
      } else {
        setErro('CEP não encontrado.');
      }
    } catch {
      setErro('Não foi possível consultar o CEP. Preencha o endereço manualmente.');
    }
  };

  const handleSalvar = async () => {
    if (salvando || sucesso) return;

    if (!titulo.trim()) {
      setErro('Informe o nome do projeto.');
      return;
    }

    const dados = {
      titulo: titulo.trim(),
      enderecoObra: enderecoObra.trim() || null,
      funcionarioResponsavelId: responsavelId,
    };

    setErro(null);
    setSalvando(true);
    try {
      const salvo = existente ? await atualizarProjeto(existente.id, dados) : await criarProjeto(clienteId, dados);
      // Mostra a confirmação por 1 segundo e volta para o checklist já com este projeto selecionado.
      setSucesso(true);
      setTimeout(() => navigation.popTo('Checklist', { clienteId, projetoId: salvo.id }), 1000);
    } catch (e) {
      setErro(getCadastroErrorMessage(e));
    } finally {
      setSalvando(false);
    }
  };

  const renderOpcaoResponsavel = (id: string | null, nome: string) => {
    const selecionado = responsavelId === id;
    return (
      <Pressable
        key={id ?? 'nenhum'}
        onPress={() => setResponsavelId(id)}
        accessibilityRole="radio"
        accessibilityState={{ selected: selecionado }}
        accessibilityLabel={nome}
        style={({ pressed }) => [styles.opcao, pressed && styles.pressed]}
      >
        <MaterialCommunityIcons
          name={selecionado ? 'radiobox-marked' : 'radiobox-blank'}
          size={s(22)}
          color={colors.onCard}
        />
        <Text style={styles.textoOpcao} maxFontSizeMultiplier={1.2} numberOfLines={1}>
          {nome}
        </Text>
      </Pressable>
    );
  };

  const renderResponsaveis = () => {
    if (erroFuncionarios) {
      return (
        <Text style={styles.erro} maxFontSizeMultiplier={1.2}>
          {erroFuncionarios}
        </Text>
      );
    }
    if (!funcionarios) {
      return <ActivityIndicator color={colors.onCard} style={styles.carregandoFuncionarios} />;
    }
    return (
      <View style={styles.opcoes}>
        {renderOpcaoResponsavel(null, 'Sem responsável')}
        {funcionarios.map((f) => renderOpcaoResponsavel(f.id, f.nome))}
      </View>
    );
  };

  return (
    <View style={styles.tela}>
      <View style={styles.topo}>
        <CabecalhoTela titulo={editando ? 'Edição - Projeto' : 'Novo Projeto'} />
      </View>

      <KeyboardAvoidingView style={styles.corpo} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.cliente} maxFontSizeMultiplier={1.2} numberOfLines={2}>
              Cliente: {nomeCliente}
            </Text>

            <Text style={styles.label} maxFontSizeMultiplier={1.2}>
              Nome do Projeto
            </Text>
            <CampoTextoComIcone
              icon="folder-outline"
              placeholder="Ex.: Casa de Praia ..."
              value={titulo}
              onChangeText={setTitulo}
              maxLength={200}
            />

            <Text style={styles.label} maxFontSizeMultiplier={1.2}>
              CEP da Obra
            </Text>
            <CampoTextoComIcone
              icon="map-outline"
              placeholder="Informe o CEP da obra ..."
              value={cepObra}
              onChangeText={preencherPorCep}
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
              maxLength={300}
            />

            <Text style={styles.label} maxFontSizeMultiplier={1.2}>
              Funcionária Responsável
            </Text>
            {renderResponsaveis()}

            {erro ? (
              <Text style={styles.erro} accessibilityLiveRegion="polite">
                {erro}
              </Text>
            ) : null}

            <BotaoLogin
              title={editando ? 'Salvar Alterações' : 'Criar Projeto'}
              onPress={handleSalvar}
              loading={salvando}
              style={styles.botao}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <BarraNavegacaoInferior
        abaAtiva="Clientes"
        onTrocarAba={(aba) => navigation.popTo('Abas', { screen: aba })}
      />

      {sucesso ? (
        <View style={styles.sobreposicao} accessibilityLiveRegion="polite">
          <View style={styles.avisoSucesso}>
            <Ionicons name="checkmark-circle-outline" size={s(48)} color={colors.onCard} />
            <Text style={styles.textoSucesso} maxFontSizeMultiplier={1.2}>
              {editando ? 'Projeto atualizado com sucesso!' : 'Projeto criado com sucesso!'}
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
      paddingTop: s(14),
      paddingBottom: s(20),
      backgroundColor: colors.card,
      borderRadius: s(18),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: s(4) },
      shadowOpacity: 0.35,
      shadowRadius: s(6),
      elevation: 8,
    },
    cliente: {
      marginHorizontal: s(10),
      textAlign: 'center',
      fontFamily: fonts.italic,
      fontSize: s(16),
      color: colors.onCard,
      opacity: 0.85,
    },
    label: {
      marginTop: s(12),
      marginLeft: s(10),
      marginBottom: s(6),
      fontFamily: fonts.italic,
      fontSize: s(15),
      color: colors.onCard,
    },
    opcoes: {
      marginHorizontal: s(10),
    },
    opcao: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: s(6),
    },
    textoOpcao: {
      flexShrink: 1,
      marginLeft: s(10),
      fontFamily: fonts.italic,
      fontSize: s(15),
      color: colors.onCard,
    },
    carregandoFuncionarios: {
      marginVertical: s(8),
    },
    pressed: {
      opacity: 0.6,
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
