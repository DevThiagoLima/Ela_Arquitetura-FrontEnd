import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import type { ComponentProps } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getClientesErrorMessage, obterCliente } from '../api/servicoClientes';
import { buscarProjetoDoCliente, listarChecklistCompleta } from '../api/servicoProjetos';
import { BarraNavegacaoInferior } from '../components/BarraNavegacaoInferior';
import { CabecalhoTela } from '../components/CabecalhoTela';
import type { RootStackParamList } from '../navigation/tipos';
import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import type { Cliente } from '../types/cliente';
import type { EtapaDoChecklist, Projeto, StatusProjeto } from '../types/projeto';
import { Scale, useResponsive } from '../utils/responsividade';

type Navegacao = NativeStackNavigationProp<RootStackParamList>;
type Rota = RouteProp<RootStackParamList, 'Checklist'>;
type NomeIcone = ComponentProps<typeof MaterialCommunityIcons>['name'];

const ROTULO_STATUS: Record<StatusProjeto, string> = {
  EmAndamento: 'Em andamento',
  Concluido: 'Concluído',
};

export default function TelaChecklist() {
  const { s } = useResponsive();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navegacao>();
  const { clienteId } = useRoute<Rota>().params;
  const styles = useMemo(() => createStyles(s, insets.top), [s, insets.top]);

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [etapas, setEtapas] = useState<EtapaDoChecklist[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarChecklist = async () => {
    setErro(null);
    setCarregando(true);
    try {
      const [dadosCliente, dadosProjeto] = await Promise.all([
        obterCliente(clienteId),
        buscarProjetoDoCliente(clienteId),
      ]);
      setCliente(dadosCliente);
      setProjeto(dadosProjeto);
      setEtapas(dadosProjeto ? await listarChecklistCompleta(dadosProjeto.id) : []);
    } catch (e) {
      setErro(getClientesErrorMessage(e));
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarChecklist();
  }, [clienteId]);

  const renderInfo = (icone: NomeIcone, texto: string | null, vazio: string) => (
    <View style={styles.linhaInfo}>
      <MaterialCommunityIcons name={icone} size={s(20)} color={colors.icon} />
      <Text style={[styles.textoInfo, !texto && styles.textoVazio]} maxFontSizeMultiplier={1.2}>
        {texto ?? vazio}
      </Text>
    </View>
  );

  const renderPilula = (icone: NomeIcone, texto: string) => (
    <View style={styles.linhaInfo}>
      <MaterialCommunityIcons name={icone} size={s(20)} color={colors.icon} />
      <View style={styles.pilula}>
        <Text style={styles.textoPilula} maxFontSizeMultiplier={1.2} numberOfLines={1}>
          {texto}
        </Text>
      </View>
    </View>
  );

  // Etapa já alcançada mostra os itens reais; etapa futura mostra as sub-etapas previstas.
  const renderEtapa = (etapa: EtapaDoChecklist, indice: number) => {
    const itens = etapa.itens.length
      ? etapa.itens.map((item) => ({ id: item.id, descricao: item.descricao, concluido: item.concluido }))
      : etapa.subEtapas.map((sub) => ({ id: sub.id, descricao: sub.nome, concluido: false }));
    const futura = !etapa.atual && !etapa.concluida;

    return (
      <View key={etapa.etapaId} style={styles.etapa}>
        <Text style={[styles.tituloEtapa, etapa.atual && styles.tituloEtapaAtual]} maxFontSizeMultiplier={1.2}>
          {indice + 1}. {etapa.nome}
          {etapa.atual ? '  • etapa atual' : ''}
        </Text>

        {itens.map((item) => (
          <View key={item.id} style={[styles.item, futura && styles.itemFuturo]}>
            <MaterialCommunityIcons
              name={item.concluido ? 'checkbox-marked-outline' : 'checkbox-blank-outline'}
              size={s(22)}
              color={colors.primary}
            />
            <Text style={styles.textoItem} maxFontSizeMultiplier={1.2}>
              {item.descricao}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderConteudo = () => {
    if (carregando) {
      return <ActivityIndicator size="large" color={colors.card} style={styles.aviso} />;
    }
    if (erro || !cliente) {
      return (
        <Text style={[styles.aviso, styles.avisoErro]} maxFontSizeMultiplier={1.2}>
          {erro ?? 'Cliente não encontrado.'}
        </Text>
      );
    }

    const responsavel = projeto?.funcionarios[0]?.nome ?? 'Sem responsável';
    const status = projeto
      ? `${ROTULO_STATUS[projeto.status]} · ${projeto.percentualConcluido}%`
      : 'Sem projeto';

    return (
      <View style={styles.card}>
        {renderInfo('account-outline', cliente.nome, '')}
        {renderInfo('map-marker-outline', cliente.endereco, 'Endereço não informado')}
        {renderInfo('home-city-outline', cliente.enderecoObra, 'Endereço da obra não informado')}
        {renderInfo('phone-outline', cliente.telefone, '')}
        {renderInfo('email-outline', cliente.email, 'Sem e-mail cadastrado')}
        {renderInfo('card-account-details-outline', cliente.cpf, 'CPF não informado')}
        {renderPilula('account-hard-hat-outline', responsavel)}
        {renderPilula('clipboard-text-outline', status)}

        <Text style={styles.tituloChecklist} maxFontSizeMultiplier={1.2}>
          Checklist
        </Text>

        {projeto ? (
          etapas.map(renderEtapa)
        ) : (
          <Text style={styles.semProjeto} maxFontSizeMultiplier={1.2}>
            Este cliente ainda não tem projeto.
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.tela}>
      <View style={styles.topo}>
        <CabecalhoTela titulo="Checklist" />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {renderConteudo()}
      </ScrollView>

      <BarraNavegacaoInferior
        abaAtiva="Clientes"
        onTrocarAba={(aba) => navigation.navigate('Abas', { screen: aba })}
      />
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
    scrollContent: {
      paddingHorizontal: s(12),
      paddingVertical: s(16),
    },
    card: {
      padding: s(16),
      backgroundColor: colors.inputBackground,
      borderRadius: s(16),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: s(3) },
      shadowOpacity: 0.35,
      shadowRadius: s(4),
      elevation: 4,
    },
    linhaInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: s(8),
    },
    textoInfo: {
      marginLeft: s(8),
      flexShrink: 1,
      fontFamily: fonts.italic,
      fontSize: s(14),
      color: colors.onBackground,
    },
    textoVazio: {
      opacity: 0.6,
    },
    pilula: {
      marginLeft: s(8),
      paddingHorizontal: s(16),
      paddingVertical: s(4),
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: s(16),
      backgroundColor: colors.onPrimary,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: s(2) },
      shadowOpacity: 0.2,
      shadowRadius: s(2),
      elevation: 2,
    },
    textoPilula: {
      fontFamily: fonts.italic,
      fontSize: s(13),
      color: colors.onBackground,
    },
    tituloChecklist: {
      marginTop: s(12),
      marginBottom: s(8),
      textAlign: 'center',
      fontFamily: fonts.italic,
      fontWeight: 'bold',
      fontSize: s(16),
      color: colors.onBackground,
    },
    etapa: {
      marginTop: s(10),
    },
    tituloEtapa: {
      marginBottom: s(6),
      fontFamily: fonts.italic,
      fontSize: s(14),
      color: colors.onBackground,
    },
    tituloEtapaAtual: {
      color: colors.primary,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: s(8),
      marginBottom: s(6),
    },
    itemFuturo: {
      opacity: 0.5,
    },
    textoItem: {
      marginLeft: s(8),
      flexShrink: 1,
      fontFamily: fonts.italic,
      fontSize: s(13),
      color: colors.onBackground,
    },
    semProjeto: {
      textAlign: 'center',
      fontFamily: fonts.italic,
      fontSize: s(14),
      color: colors.onBackground,
      opacity: 0.7,
    },
    aviso: {
      marginTop: s(32),
      textAlign: 'center',
      fontFamily: fonts.italic,
      fontSize: s(15),
      color: colors.onBackground,
    },
    avisoErro: {
      color: colors.primary,
    },
  });
