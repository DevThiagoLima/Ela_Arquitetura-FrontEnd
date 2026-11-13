import React, { useEffect, useMemo, useState } from 'react';
import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import type { ClienteConcluido, ProjetoConcluido } from '../types/cliente';
import { Scale, useResponsive } from '../utils/responsividade';
import { BotaoAcao } from './BotaoAcao';

// Os mesmos desenhos das abas (Figma), pintados de escuro sobre o card claro.
const ICONE_CLIENTE = require('../../assets/icones/aba-clientes.png');
const ICONE_STATUS = require('../../assets/icones/aba-concluidos.png');
const ICONE_FUNCIONARIA = require('../../assets/icones/aba-funcionarios.png');

type Props = {
  cliente: ClienteConcluido;
  /** Card aberto mostra os botões "Reabrir Projeto" e "Entregar Projeto". */
  aberto: boolean;
  onAlternar: () => void;
  onReabrir: (projeto: ProjetoConcluido) => void;
  onEntregar: (projeto: ProjetoConcluido) => void;
  /** Projeto sendo reaberto agora (mostra o carregando no botão). */
  reabrindoId: string | null;
};

function descreverStatus(projetos: ProjetoConcluido[]): string {
  return projetos.length > 1 ? `Concluído · ${projetos.length} projetos` : 'Concluído';
}

function descreverResponsaveis(projetos: ProjetoConcluido[]): string {
  const nomes = [...new Set(projetos.map((p) => p.responsavel).filter((n): n is string => !!n))];
  return nomes.length ? nomes.join(', ') : 'Sem responsável';
}

/**
 * Card da aba Concluídos (Figma). Cliente com mais de um projeto escolhe o projeto antes de
 * reabrir ou entregar: reabrir um só já devolve o cliente para a aba Clientes.
 */
export function CardClienteConcluido({ cliente, aberto, onAlternar, onReabrir, onEntregar, reabrindoId }: Props) {
  const { s } = useResponsive();
  const styles = useMemo(() => createStyles(s), [s]);
  const [projetoId, setProjetoId] = useState(cliente.projetos[0]?.id ?? null);

  // A lista recarregou e o projeto escolhido sumiu: volta para o primeiro.
  useEffect(() => {
    if (!cliente.projetos.some((p) => p.id === projetoId)) {
      setProjetoId(cliente.projetos[0]?.id ?? null);
    }
  }, [cliente.projetos, projetoId]);

  const projeto = cliente.projetos.find((p) => p.id === projetoId) ?? null;
  const variosProjetos = cliente.projetos.length > 1;

  const renderLinha = (icone: ImageSourcePropType, texto: string, ultima = false) => (
    <View style={[styles.linha, ultima && styles.ultimaLinha]}>
      <Image source={icone} style={styles.icone} resizeMode="contain" />
      <Text style={styles.texto} maxFontSizeMultiplier={1.2} numberOfLines={ultima ? 2 : 1}>
        {texto}
      </Text>
    </View>
  );

  return (
    <View style={styles.card}>
      <Pressable
        onPress={onAlternar}
        accessibilityRole="button"
        accessibilityState={{ expanded: aberto }}
        accessibilityLabel={`${cliente.nome}, ${descreverStatus(cliente.projetos)}. Toque para ${aberto ? 'fechar' : 'reabrir ou entregar'}.`}
        style={({ pressed }) => pressed && styles.pressed}
      >
        {renderLinha(ICONE_CLIENTE, cliente.nome)}
        {renderLinha(ICONE_STATUS, descreverStatus(cliente.projetos))}
        {renderLinha(ICONE_FUNCIONARIA, descreverResponsaveis(cliente.projetos), true)}
      </Pressable>

      {aberto ? (
        <View style={styles.acoes}>
          {variosProjetos ? (
            <View style={styles.projetos} accessibilityRole="radiogroup">
              {cliente.projetos.map((p) => {
                const selecionado = p.id === projetoId;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setProjetoId(p.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: selecionado }}
                    style={({ pressed }) => [styles.chip, selecionado && styles.chipSelecionado, pressed && styles.pressed]}
                  >
                    <Text
                      style={[styles.textoChip, selecionado && styles.textoChipSelecionado]}
                      maxFontSizeMultiplier={1.2}
                      numberOfLines={1}
                    >
                      {p.titulo}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}

          <BotaoAcao
            titulo="Reabrir Projeto"
            onPress={() => projeto && onReabrir(projeto)}
            carregando={projeto !== null && reabrindoId === projeto.id}
            desabilitado={!projeto || reabrindoId !== null}
            style={styles.botao}
          />
          <BotaoAcao
            titulo="Entregar Projeto"
            cor={colors.success}
            onPress={() => projeto && onEntregar(projeto)}
            desabilitado={!projeto || reabrindoId !== null}
            style={styles.botao}
          />
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (s: Scale) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: s(16),
      padding: s(14),
      marginBottom: s(18),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: s(3) },
      shadowOpacity: 0.35,
      shadowRadius: s(4),
      elevation: 4,
    },
    pressed: {
      opacity: 0.7,
    },
    linha: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: s(10),
    },
    ultimaLinha: {
      marginBottom: 0,
    },
    icone: {
      width: s(24),
      height: s(24),
      tintColor: colors.icon,
    },
    texto: {
      flex: 1,
      marginLeft: s(10),
      fontFamily: fonts.italic,
      fontSize: s(15),
      color: colors.onBackground,
    },
    acoes: {
      alignItems: 'center',
      marginTop: s(14),
    },
    projetos: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: s(4),
    },
    chip: {
      maxWidth: '100%',
      margin: s(4),
      paddingHorizontal: s(14),
      paddingVertical: s(5),
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: s(16),
      backgroundColor: colors.onPrimary,
    },
    chipSelecionado: {
      backgroundColor: colors.primary,
    },
    textoChip: {
      fontFamily: fonts.italic,
      fontSize: s(13),
      color: colors.onBackground,
    },
    textoChipSelecionado: {
      color: colors.onPrimary,
    },
    botao: {
      width: s(190),
      marginTop: s(10),
    },
  });
