import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { excluirCliente, getCadastroErrorMessage, getClientesErrorMessage, obterCliente } from '../api/servicoClientes';
import {
  adicionarItem,
  avancarEtapa,
  concluirItem,
  definirLinkDrive,
  excluirProjeto,
  listarChecklistCompleta,
  listarProjetosDoCliente,
  reabrirItem,
  removerItem,
  removerLinkDrive,
} from '../api/servicoProjetos';
import { BarraNavegacaoInferior } from '../components/BarraNavegacaoInferior';
import { CaixaConfirmacao } from '../components/CaixaConfirmacao';
import { CampoLinkDrive } from '../components/CampoLinkDrive';
import { CabecalhoTela } from '../components/CabecalhoTela';
import { SeletorProjeto } from '../components/SeletorProjeto';
import type { RootStackParamList } from '../navigation/tipos';
import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import type { Cliente } from '../types/cliente';
import type { ChecklistItem, EtapaDoChecklist, Projeto } from '../types/projeto';
import { descreverStatusProjeto, formatarTelefone } from '../utils/formatacao';
import { Scale, useResponsive } from '../utils/responsividade';

type Navegacao = NativeStackNavigationProp<RootStackParamList>;
type Rota = RouteProp<RootStackParamList, 'Checklist'>;
type NomeIcone = ComponentProps<typeof MaterialCommunityIcons>['name'];

/** Sem preferência, abre o projeto mais recente em andamento (a API lista do mais novo). */
function escolherProjeto(projetos: Projeto[], preferido: string | null | undefined): Projeto | null {
  return (
    projetos.find((p) => p.id === preferido) ??
    projetos.find((p) => p.status === 'EmAndamento') ??
    projetos[0] ??
    null
  );
}

export default function TelaChecklist() {
  const { s } = useResponsive();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navegacao>();
  // O projeto escolhido fica na rota: o seletor e o formulário de projeto trocam por ali.
  const { clienteId, projetoId: projetoIdDaRota } = useRoute<Rota>().params;
  const styles = useMemo(() => createStyles(s, insets.top), [s, insets.top]);

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [seletorVisivel, setSeletorVisivel] = useState(false);
  const [etapas, setEtapas] = useState<EtapaDoChecklist[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [salvandoItemId, setSalvandoItemId] = useState<string | null>(null);
  // Texto do campo "Adicionar item" de cada etapa, por etapaId.
  const [novosItens, setNovosItens] = useState<Record<string, string>>({});
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [itemParaApagar, setItemParaApagar] = useState<ChecklistItem | null>(null);
  const [apagando, setApagando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [excluindoCliente, setExcluindoCliente] = useState(false);
  const [projetoParaExcluir, setProjetoParaExcluir] = useState<Projeto | null>(null);
  const [excluindoProjeto, setExcluindoProjeto] = useState(false);
  // Projeto na tela, para recarregar sem trocar de projeto quando a rota não pede um.
  const projetoAtualRef = useRef<string | null>(null);
  const primeiraCargaRef = useRef(true);

  // Na primeira carga mostra o indicador; depois de marcar um item só atualiza os dados.
  // Mantém o projeto que está na tela, a menos que outro seja pedido (troca ou projeto recém-criado).
  const carregarChecklist = async (mostrarCarregando = true, projetoPreferido = projetoIdDaRota ?? projetoAtualRef.current) => {
    setErro(null);
    if (mostrarCarregando) setCarregando(true);
    try {
      const [dadosCliente, dadosProjetos] = await Promise.all([
        obterCliente(clienteId),
        listarProjetosDoCliente(clienteId),
      ]);
      const escolhido = escolherProjeto(dadosProjetos, projetoPreferido);
      const dadosEtapas = escolhido ? await listarChecklistCompleta(escolhido.id) : [];
      // Tudo de uma vez, para o título do projeto e o checklist trocarem juntos.
      setCliente(dadosCliente);
      setProjetos(dadosProjetos);
      setProjeto(escolhido);
      setEtapas(dadosEtapas);
      projetoAtualRef.current = escolhido?.id ?? null;
    } catch (e) {
      setErro(getClientesErrorMessage(e));
    } finally {
      setCarregando(false);
    }
  };

  // Recarrega ao voltar para a tela (depois de editar cliente ou projeto) e quando o projeto da rota muda.
  useFocusEffect(
    useCallback(() => {
      carregarChecklist(primeiraCargaRef.current);
      primeiraCargaRef.current = false;
    }, [clienteId, projetoIdDaRota]),
  );

  // Marca/desmarca; ao marcar o último item da etapa atual, já avança (a API pula as etapas
  // seguintes que já estiverem com todos os itens marcados).
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

  // Chamado pelo "Apagar" da caixa de confirmação.
  const apagarItem = async () => {
    if (!projeto || !itemParaApagar) return;

    setErroAcao(null);
    setApagando(true);
    try {
      const resposta = await removerItem(itemParaApagar.id);
      if (resposta.etapaPodeAvancar) {
        await avancarEtapa(projeto.id);
      }
      await carregarChecklist(false);
    } catch (e) {
      setErroAcao(getCadastroErrorMessage(e));
    } finally {
      setApagando(false);
      setItemParaApagar(null);
    }
  };

  // Ao trocar de projeto, o texto digitado em "Adicionar item" não pode ir para o projeto errado.
  const trocarProjeto = (projetoId: string) => {
    if (projetoId === projeto?.id) return;
    setNovosItens({});
    setErroAcao(null);
    navigation.setParams({ projetoId });
  };

  // Erros sobem para o CampoLinkDrive, que mostra a mensagem abaixo do campo.
  const salvarLinkDrive = async (link: string) => {
    if (!projeto) return;
    await definirLinkDrive(projeto.id, link);
    await carregarChecklist(false);
  };

  const apagarLinkDrive = async () => {
    if (!projeto) return;
    await removerLinkDrive(projeto.id);
    await carregarChecklist(false);
  };

  // Excluindo o projeto que está na tela, o card passa para o mais recente em andamento.
  const confirmarExclusaoProjeto = async () => {
    if (!projetoParaExcluir) return;

    setErroAcao(null);
    setExcluindoProjeto(true);
    try {
      await excluirProjeto(projetoParaExcluir.id);
      if (projetoParaExcluir.id === projeto?.id) {
        projetoAtualRef.current = null;
        setNovosItens({});
        if (projetoIdDaRota) {
          navigation.setParams({ projetoId: undefined }); // a mudança na rota já recarrega
        } else {
          await carregarChecklist(false, null);
        }
      } else {
        await carregarChecklist(false);
      }
    } catch (e) {
      setErroAcao(getCadastroErrorMessage(e));
    } finally {
      setExcluindoProjeto(false);
      setProjetoParaExcluir(null);
    }
  };

  // O cliente desativado some da lista; os projetos dele ficam guardados na API.
  const confirmarExclusaoCliente = async () => {
    setExcluindoCliente(true);
    try {
      await excluirCliente(clienteId);
      setConfirmandoExclusao(false);
      navigation.popTo('Abas', { screen: 'Clientes' });
    } catch (e) {
      setConfirmandoExclusao(false);
      setErroAcao(getCadastroErrorMessage(e));
    } finally {
      setExcluindoCliente(false);
    }
  };

  const adicionarNovoItem = async (etapaId: string) => {
    const descricao = (novosItens[etapaId] ?? '').trim();
    if (!projeto || !descricao) return;

    setErroAcao(null);
    try {
      await adicionarItem(projeto.id, etapaId, descricao);
      setNovosItens((atual) => ({ ...atual, [etapaId]: '' }));
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

  // Pílula do projeto: abre a lista para trocar, editar ou criar projeto.
  const renderSeletorProjeto = (atual: Projeto) => (
    <View style={styles.linhaInfo}>
      <MaterialCommunityIcons name="folder-outline" size={s(20)} color={colors.icon} />
      <Pressable
        onPress={() => setSeletorVisivel(true)}
        accessibilityRole="button"
        accessibilityLabel={`Projeto ${atual.titulo}. ${projetos.length} projeto(s) do cliente. Toque para trocar ou criar.`}
        style={({ pressed }) => [styles.pilula, styles.pilulaSeletor, pressed && styles.pressed]}
      >
        <Text style={[styles.textoPilula, styles.textoPilulaSeletor]} maxFontSizeMultiplier={1.2} numberOfLines={1}>
          {atual.titulo}
        </Text>
        {projetos.length > 1 ? (
          <Text style={styles.contadorProjetos} maxFontSizeMultiplier={1.2}>
            {projetos.length}
          </Text>
        ) : null}
        <MaterialCommunityIcons name="chevron-down" size={s(18)} color={colors.icon} />
      </Pressable>
    </View>
  );

  const renderCaixa = (marcado: boolean) => (
    <MaterialCommunityIcons
      name={marcado ? 'checkbox-marked-outline' : 'checkbox-blank-outline'}
      size={s(22)}
      color={colors.primary}
    />
  );

  // O projeto nasce com o checklist de todas as etapas, então qualquer etapa pode ser marcada
  // e receber itens personalizados. Projeto concluído fica só para consulta.
  const renderEtapa = (etapa: EtapaDoChecklist, indice: number) => {
    const editavel = projeto?.status === 'EmAndamento';
    const novoItem = novosItens[etapa.etapaId] ?? '';
    // A etapa final ("Conclusão e Entrega") aparece no card como o campo "Link do Drive" (Figma), não como checklist.
    const linkDrive = etapa.final;

    return (
      <View key={etapa.etapaId} style={styles.etapa}>
        <Text style={[styles.tituloEtapa, etapa.atual && styles.tituloEtapaAtual]} maxFontSizeMultiplier={1.2}>
          {indice + 1}. {linkDrive ? 'Link do Drive' : etapa.nome}
          {etapa.atual ? '  • etapa atual' : ''}
        </Text>

        {etapa.itens.map((item) => (
          <View key={item.id} style={styles.item}>
            <Pressable
              onPress={() => alternarItem(item)}
              disabled={!editavel || salvandoItemId !== null}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.concluido, disabled: !editavel }}
              accessibilityLabel={item.descricao}
              style={({ pressed }) => [styles.itemMarcavel, pressed && styles.pressed]}
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

            {/* Só itens adicionados à mão (sem sub-etapa) podem ser apagados. */}
            {editavel && !item.subEtapaId ? (
              <Pressable
                onPress={() => setItemParaApagar(item)}
                accessibilityRole="button"
                accessibilityLabel={`Apagar ${item.descricao}`}
                hitSlop={8}
                style={({ pressed }) => [styles.botaoApagar, pressed && styles.pressed]}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={s(18)} color={colors.icon} />
              </Pressable>
            ) : null}
          </View>
        ))}

        {linkDrive && projeto ? (
          <CampoLinkDrive
            link={projeto.linkDrive}
            editavel={editavel}
            onSalvar={salvarLinkDrive}
            onRemover={apagarLinkDrive}
          />
        ) : null}

        {editavel && !linkDrive ? (
          <View style={styles.item}>
            {renderCaixa(false)}
            <TextInput
              style={styles.campoNovoItem}
              placeholder="Adicionar item ..."
              placeholderTextColor={colors.inputPlaceholder}
              value={novoItem}
              onChangeText={(texto) => setNovosItens((atual) => ({ ...atual, [etapa.etapaId]: texto }))}
              onSubmitEditing={() => adicionarNovoItem(etapa.etapaId)}
              returnKeyType="done"
              maxFontSizeMultiplier={1.2}
            />
            {novoItem.trim() ? (
              <Pressable
                onPress={() => adicionarNovoItem(etapa.etapaId)}
                accessibilityRole="button"
                accessibilityLabel="Adicionar item"
              >
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
    const status = projeto ? descreverStatusProjeto(projeto) : 'Sem projeto';

    return (
      <View style={styles.card}>
        <View style={styles.linhaNome}>
          <View style={styles.nome}>{renderInfo('account-outline', cliente.nome, '')}</View>
          <Pressable
            onPress={() => navigation.navigate('CadastroCliente', { cliente })}
            accessibilityRole="button"
            accessibilityLabel={`Editar cliente ${cliente.nome}`}
            hitSlop={8}
            style={({ pressed }) => [styles.botaoCliente, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="pencil-outline" size={s(20)} color={colors.icon} />
          </Pressable>
          <Pressable
            onPress={() => setConfirmandoExclusao(true)}
            accessibilityRole="button"
            accessibilityLabel={`Excluir cliente ${cliente.nome}`}
            hitSlop={8}
            style={({ pressed }) => [styles.botaoCliente, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={s(20)} color={colors.danger} />
          </Pressable>
        </View>
        {renderInfo('map-marker-outline', cliente.endereco, 'Endereço não informado')}
        {renderInfo('home-city-outline', projeto?.enderecoObra ?? null, 'Endereço da obra não informado')}
        {renderInfo('phone-outline', formatarTelefone(cliente.telefone), '')}
        {renderInfo('email-outline', cliente.email, 'Sem e-mail cadastrado')}
        {renderInfo('card-account-details-outline', cliente.cpf, 'CPF não informado')}
        {projeto ? renderSeletorProjeto(projeto) : null}
        {renderPilula('account-hard-hat-outline', responsavel)}
        {renderPilula('clipboard-text-outline', status)}

        <Text style={styles.tituloChecklist} maxFontSizeMultiplier={1.2}>
          Checklist
        </Text>

        {projeto ? (
          etapasVisiveis.map(renderEtapa)
        ) : (
          <Text style={styles.semProjeto} maxFontSizeMultiplier={1.2}>
            Não foi possível carregar o projeto deste cliente.
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

      <CaixaConfirmacao
        visivel={itemParaApagar !== null}
        titulo={`Deseja apagar "${itemParaApagar?.descricao ?? ''}"?`}
        textoConfirmar="Apagar"
        carregando={apagando}
        onConfirmar={apagarItem}
        onCancelar={() => setItemParaApagar(null)}
      />

      <SeletorProjeto
        visivel={seletorVisivel}
        nomeCliente={cliente?.nome ?? ''}
        projetos={projetos}
        projetoSelecionadoId={projeto?.id ?? null}
        onSelecionar={trocarProjeto}
        onEditar={(p) => navigation.navigate('FormularioProjeto', { clienteId, nomeCliente: cliente?.nome ?? '', projeto: p })}
        onExcluir={setProjetoParaExcluir}
        onNovo={() => navigation.navigate('FormularioProjeto', { clienteId, nomeCliente: cliente?.nome ?? '' })}
        onFechar={() => setSeletorVisivel(false)}
      />

      <CaixaConfirmacao
        visivel={projetoParaExcluir !== null}
        titulo={`Excluir o projeto "${projetoParaExcluir?.titulo ?? ''}"? O checklist dele também será apagado.`}
        textoConfirmar="Excluir"
        corConfirmar={colors.danger}
        carregando={excluindoProjeto}
        onConfirmar={confirmarExclusaoProjeto}
        onCancelar={() => setProjetoParaExcluir(null)}
      />

      <CaixaConfirmacao
        visivel={confirmandoExclusao}
        titulo={`Excluir o cliente "${cliente?.nome ?? ''}"?`}
        textoConfirmar="Excluir"
        corConfirmar={colors.danger}
        carregando={excluindoCliente}
        onConfirmar={confirmarExclusaoCliente}
        onCancelar={() => setConfirmandoExclusao(false)}
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
    linhaNome: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    nome: {
      flex: 1,
    },
    botaoCliente: {
      marginLeft: s(10),
      padding: s(2),
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
    pilulaSeletor: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
      paddingRight: s(8),
    },
    textoPilulaSeletor: {
      flexShrink: 1,
      marginRight: s(6),
    },
    contadorProjetos: {
      minWidth: s(18),
      marginRight: s(4),
      paddingHorizontal: s(5),
      overflow: 'hidden',
      textAlign: 'center',
      fontFamily: fonts.italic,
      fontSize: s(11),
      color: colors.onPrimary,
      backgroundColor: colors.primary,
      borderRadius: s(9),
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
    itemMarcavel: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    botaoApagar: {
      marginLeft: s(8),
      padding: s(2),
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
