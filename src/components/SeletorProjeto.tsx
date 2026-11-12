import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import type { Projeto } from '../types/projeto';
import { descreverStatusProjeto } from '../utils/formatacao';
import { Scale, useResponsive } from '../utils/responsividade';

type Props = {
  visivel: boolean;
  nomeCliente: string;
  projetos: Projeto[];
  projetoSelecionadoId: string | null;
  onSelecionar: (projetoId: string) => void;
  /** Abre a edição do projeto (nome, endereço da obra e responsável). */
  onEditar: (projeto: Projeto) => void;
  /** Só aparece com mais de um projeto: todo cliente precisa ter pelo menos um. */
  onExcluir: (projeto: Projeto) => void;
  onNovo: () => void;
  onFechar: () => void;
};

/**
 * Caixa com os projetos do cliente: escolher qual aparece no card, editar, excluir ou criar um projeto.
 * Mesmo visual da CaixaConfirmacao (Modal, porque o Alert não funciona na versão web).
 */
export function SeletorProjeto({
  visivel,
  nomeCliente,
  projetos,
  projetoSelecionadoId,
  onSelecionar,
  onEditar,
  onExcluir,
  onNovo,
  onFechar,
}: Props) {
  const { s } = useResponsive();
  const styles = useMemo(() => createStyles(s), [s]);

  // Fecha a caixa antes de seguir, para ela não ficar aberta por cima da próxima tela.
  const fecharE = (acao: () => void) => () => {
    onFechar();
    acao();
  };

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <View style={styles.sobreposicao}>
        <View style={styles.caixa}>
          <Text style={styles.titulo} maxFontSizeMultiplier={1.2}>
            Projetos de {nomeCliente}
          </Text>

          <ScrollView style={styles.lista} contentContainerStyle={styles.listaConteudo}>
            {projetos.map((projeto) => {
              const selecionado = projeto.id === projetoSelecionadoId;
              return (
                <View key={projeto.id} style={styles.linhaProjeto}>
                  <Pressable
                    onPress={fecharE(() => onSelecionar(projeto.id))}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: selecionado }}
                    accessibilityLabel={`${projeto.titulo}, ${descreverStatusProjeto(projeto)}`}
                    style={({ pressed }) => [styles.projeto, pressed && styles.pressed]}
                  >
                    <MaterialCommunityIcons
                      name={selecionado ? 'radiobox-marked' : 'radiobox-blank'}
                      size={s(20)}
                      color={colors.onCard}
                    />
                    <View style={styles.textosProjeto}>
                      <Text style={styles.nomeProjeto} maxFontSizeMultiplier={1.2} numberOfLines={2}>
                        {projeto.titulo}
                      </Text>
                      <Text style={styles.statusProjeto} maxFontSizeMultiplier={1.2}>
                        {descreverStatusProjeto(projeto)}
                      </Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={fecharE(() => onEditar(projeto))}
                    accessibilityRole="button"
                    accessibilityLabel={`Editar ${projeto.titulo}`}
                    hitSlop={8}
                    style={({ pressed }) => [styles.botaoIcone, pressed && styles.pressed]}
                  >
                    <MaterialCommunityIcons name="pencil-outline" size={s(18)} color={colors.onCard} />
                  </Pressable>

                  {projetos.length > 1 ? (
                    <Pressable
                      onPress={fecharE(() => onExcluir(projeto))}
                      accessibilityRole="button"
                      accessibilityLabel={`Excluir ${projeto.titulo}`}
                      hitSlop={8}
                      style={({ pressed }) => [styles.botaoIcone, pressed && styles.pressed]}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={s(18)} color={colors.error} />
                    </Pressable>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>

          <Pressable
            onPress={fecharE(onNovo)}
            accessibilityRole="button"
            style={({ pressed }) => [styles.botao, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons name="plus" size={s(18)} color={colors.onPrimary} />
            <Text style={[styles.textoBotao, styles.textoBotaoComIcone]} maxFontSizeMultiplier={1.2}>
              Novo projeto
            </Text>
          </Pressable>

          <Pressable
            onPress={onFechar}
            accessibilityRole="button"
            style={({ pressed }) => [styles.botao, styles.botaoSecundario, pressed && styles.pressed]}
          >
            <Text style={styles.textoBotao} maxFontSizeMultiplier={1.2}>
              Fechar
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (s: Scale) =>
  StyleSheet.create({
    sobreposicao: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(24),
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },
    caixa: {
      width: '100%',
      maxWidth: s(340),
      maxHeight: '80%',
      alignItems: 'center',
      paddingHorizontal: s(20),
      paddingVertical: s(24),
      backgroundColor: colors.card,
      borderRadius: s(18),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: s(4) },
      shadowOpacity: 0.35,
      shadowRadius: s(6),
      elevation: 8,
    },
    titulo: {
      marginBottom: s(16),
      textAlign: 'center',
      fontFamily: fonts.italic,
      fontSize: s(18),
      color: colors.onCard,
    },
    lista: {
      alignSelf: 'stretch',
      flexGrow: 0,
    },
    listaConteudo: {
      paddingBottom: s(4),
    },
    linhaProjeto: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: s(12),
    },
    projeto: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    textosProjeto: {
      flex: 1,
      marginLeft: s(10),
    },
    nomeProjeto: {
      fontFamily: fonts.italic,
      fontSize: s(15),
      color: colors.onCard,
    },
    statusProjeto: {
      marginTop: s(2),
      fontFamily: fonts.italic,
      fontSize: s(12),
      color: colors.onCard,
      opacity: 0.75,
    },
    botaoIcone: {
      marginLeft: s(10),
      padding: s(4),
    },
    botao: {
      flexDirection: 'row',
      width: s(170),
      height: s(40),
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: s(10),
      borderRadius: s(12),
      backgroundColor: colors.primary,
    },
    botaoSecundario: {
      opacity: 0.75,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    textoBotao: {
      fontFamily: fonts.italic,
      fontSize: s(15),
      color: colors.onPrimary,
    },
    textoBotaoComIcone: {
      marginLeft: s(6),
    },
  });
