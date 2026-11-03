import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCadastroErrorMessage, getClientesErrorMessage, obterCliente } from '../api/servicoClientes';
import {
  adicionarItem,
  avancarEtapa,
  buscarProjetoDoCliente,
  concluirItem,
  listarChecklistCompleta,
  reabrirItem,
} from '../api/servicoProjetos';
import { BarraNavegacaoInferior } from '../components/BarraNavegacaoInferior';
import { CabecalhoTela } from '../components/CabecalhoTela';
import type { RootStackParamList } from '../navigation/tipos';
import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import type { Cliente } from '../types/cliente';
import type { ChecklistItem, EtapaDoChecklist, Projeto, StatusProjeto } from '../types/projeto';
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
  const [salvandoItemId, setSalvandoItemId] = useState<string | null>(null);
  const [novoItem, setNovoItem] = useState('');
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  // Na primeira carga mostra o indicador; depois de marcar um item só atualiza os dados.
  const carregarChecklist = async (mostrarCarregando = true) => {
    setErro(null);
    if (mostrarCarregando) setCarregando(true);
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

  // Marca/desmarca; ao marcar o último item da etapa, já avança para a próxima.
  const alternarItem = async (item: ChecklistItem) => {
    if (!projeto || salvandoItemId) return;

    setErroAcao(null);
    setSalvandoItemId(item.id);
    try {
      if (item.concluido) {
        await reabrirItem(item.id);
      } else {
        const resposta = await concluirItem(item.id);
        if (resposta.etapaPodeAvancar) {
          await avancarEtapa(projeto.id);
        }
      }
      await carregarChecklist(false);
    } catch (e) {
      setErroAcao(getCadastroErrorMessage(e));
    } finally {
      setSalvandoItemId(null);
    }
  };

  const adicionarNovoItem = async () => {
    const descricao = novoItem.trim();
    if (!projeto || !descricao) return;

    setErroAcao(null);
    try {
      await adicionarItem(projeto.id, descricao);
      setNovoItem('');
      await carregarChecklist(false);
    } catch (e) {
      setErroAcao(getCadastroErrorMessage(e));
    }
  };

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

  const renderCaixa = (marcado: boolean) => (
    <MaterialCommunityIcons
      name={marcado ? 'checkbox-marked-outline' : 'checkbox-blank-outline'}
      size={s(22)}
      color={colors.primary}
    />
  );

  // Etapa já alcançada mostra os itens reais (só os da etapa atual são editáveis);
  // etapa futura mostra as sub-etapas previstas.
  const renderEtapa = (etapa: EtapaDoChecklist, indice: number) => {
    const futura = !etapa.atual && !etapa.concluida;
    const editavel = etapa.atual && projeto?.status === 'EmAndamento';

    return (
      <View key={etapa.etapaId} style={styles.etapa}>
        <Text style={[styles.tituloEtapa, etapa.atual && styles.tituloEtapaAtual]} maxFontSizeMultiplier={1.2}>
          {indice + 1}. {etapa.nome}
          {etapa.atual ? '  • etapa atual' : ''}
        </Text>

        {etapa.itens.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => alternarItem(item)}
            disabled={!editavel || salvandoItemId !== null}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: item.concluido, disabled: !editavel }}
            accessibilityLabel={item.descricao}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            {salvandoItemId === item.id ? (
              <ActivityIndicator size="small" color={colors.primary} style={styles.caixaCarregando} />
            ) : (
              renderCaixa(item.concluido)
            )}
            <Text style={styles.textoItem} maxFontSizeMultiplier={1.2}>
              {item.descricao}
            </Text>
          </Pressable>
        ))}

        {etapa.itens.length === 0 &&
          etapa.subEtapas.map((sub) => (
            <View key={sub.id} style={[styles.item, futura && styles.itemFuturo]}>
              {renderCaixa(false)}
              <Text style={styles.textoItem} maxFontSizeMultiplier={1.2}>
                {sub.nome}
              </Text>
            </View>
          ))}

        {editavel ? (
          <View style={styles.item}>
            {renderCaixa(false)}
            <TextInput
              style={styles.campoNovoItem}
              placeholder="Adicionar item ..."
              placeholderTextColor={colors.inputPlaceholder}
              value={novoItem}
              onChangeText={setNovoItem}
              onSubmitEditing={adicionarNovoItem}
              returnKeyType="done"
              maxFontSizeMultiplier={1.2}
            />
            {novoItem.trim() ? (
              <Pressable onPress={adicionarNovoItem} accessibilityRole="button" accessibilityLabel="Adicionar item">
                <MaterialCommunityIcons name="plus-circle-outline" size={s(22)} color={colors.primary} />
              </Pressable>
            ) : null}
          </View>
        ) : null}
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
    // "Cadastro do Cliente" (opcional, sem itens) não aparece no Figma; a numeração começa na etapa seguinte.
    const etapasVisiveis = etapas.filter(
      (e) => !(e.opcional && !e.final && e.subEtapas.length === 0 && e.itens.length === 0),
    );
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
          etapasVisiveis.map(renderEtapa)
        ) : (
          <Text style={styles.semProjeto} maxFontSizeMultiplier={1.2}>
            Este cliente ainda não tem projeto.
          </Text>
        )}

        {erroAcao ? (
          <Text style={[styles.semProjeto, styles.avisoErro]} accessibilityLiveRegion="polite">
            {erroAcao}
          </Text>
        ) : null}
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
    pressed: {
      opacity: 0.6,
    },
    caixaCarregando: {
      width: s(22),
    },
    campoNovoItem: {
      flex: 1,
      marginLeft: s(8),
      paddingVertical: s(2),
      fontFamily: fonts.italic,
      fontSize: s(13),
      color: colors.onBackground,
      borderBottomWidth: 1,
      borderBottomColor: colors.inputBorder,
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
