import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCadastroErrorMessage, getClientesErrorMessage, listarClientesConcluidos } from '../api/servicoClientes';
import { reabrirProjeto } from '../api/servicoProjetos';
import { CabecalhoTela } from '../components/CabecalhoTela';
import { CaixaConfirmacao } from '../components/CaixaConfirmacao';
import { CardClienteConcluido } from '../components/CardClienteConcluido';
import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import type { ClienteConcluido, ProjetoConcluido } from '../types/cliente';
import { Scale, useResponsive } from '../utils/responsividade';
import { entregarPeloWhatsApp } from '../utils/whatsapp';

type Entrega = { cliente: ClienteConcluido; projeto: ProjetoConcluido };

/** Clientes com todos os projetos concluídos: daqui o projeto é reaberto ou entregue pelo WhatsApp. */
export default function TelaConcluidos() {
  const { s } = useResponsive();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(s, insets.top), [s, insets.top]);

  const [clientes, setClientes] = useState<ClienteConcluido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [reabrindoId, setReabrindoId] = useState<string | null>(null);
  const [entrega, setEntrega] = useState<Entrega | null>(null);
  const primeiraCargaRef = useRef(true);

  const carregar = async (mostrarCarregando: boolean) => {
    setErro(null);
    if (mostrarCarregando) setCarregando(true);
    try {
      setClientes(await listarClientesConcluidos());
    } catch (e) {
      setErro(getClientesErrorMessage(e));
    } finally {
      setCarregando(false);
    }
  };

  // Recarrega sempre que a aba fica visível (um projeto pode ter sido concluído no checklist).
  useFocusEffect(
    useCallback(() => {
      setErroAcao(null);
      carregar(primeiraCargaRef.current);
      primeiraCargaRef.current = false;
    }, []),
  );

  // Reabrir um projeto devolve o cliente para a aba Clientes, então o card sai daqui.
  const reabrir = async (projeto: ProjetoConcluido) => {
    setErroAcao(null);
    setReabrindoId(projeto.id);
    try {
      await reabrirProjeto(projeto.id);
      setAbertoId(null);
      await carregar(false);
    } catch (e) {
      setErroAcao(getCadastroErrorMessage(e));
    } finally {
      setReabrindoId(null);
    }
  };

  const pedirEntrega = (cliente: ClienteConcluido, projeto: ProjetoConcluido) => {
    setErroAcao(null);
    if (!projeto.linkDrive) {
      setErroAcao(`O projeto "${projeto.titulo}" está sem link do Drive. Reabra o projeto para inserir o link.`);
      return;
    }
    setEntrega({ cliente, projeto });
  };

  // Abre o WhatsApp do cliente com a mensagem já escrita; quem envia é a usuária.
  const entregar = () => {
    const linkDrive = entrega?.projeto.linkDrive;
    if (!entrega || !linkDrive) return;
    entregarPeloWhatsApp(entrega.cliente, { id: entrega.projeto.id, linkDrive }).catch(() =>
      setErroAcao('Não foi possível abrir o WhatsApp.'),
    );
    setEntrega(null);
  };

  const renderListaVazia = () => {
    if (carregando) {
      return <ActivityIndicator size="large" color={colors.card} style={styles.aviso} />;
    }
    return (
      <Text style={[styles.aviso, erro ? styles.avisoErro : null]} maxFontSizeMultiplier={1.2}>
        {erro ?? 'Nenhum projeto concluído.'}
      </Text>
    );
  };

  return (
    <View style={styles.tela}>
      <View style={styles.topo}>
        <CabecalhoTela titulo="Concluídos" />
      </View>

      <FlatList
        data={carregando ? [] : clientes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CardClienteConcluido
            cliente={item}
            aberto={abertoId === item.id}
            onAlternar={() => {
              setErroAcao(null);
              setAbertoId((atual) => (atual === item.id ? null : item.id));
            }}
            onReabrir={reabrir}
            onEntregar={(projeto) => pedirEntrega(item, projeto)}
            reabrindoId={reabrindoId}
          />
        )}
        ListHeaderComponent={
          erroAcao ? (
            <Text style={[styles.erroAcao, styles.avisoErro]} accessibilityLiveRegion="polite" maxFontSizeMultiplier={1.2}>
              {erroAcao}
            </Text>
          ) : undefined
        }
        ListEmptyComponent={renderListaVazia}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
      />

      <CaixaConfirmacao
        visivel={entrega !== null}
        titulo="Entregar Projeto?"
        textoConfirmar="Entregar"
        textoCancelar="CANCELAR"
        corConfirmar={colors.success}
        onConfirmar={entregar}
        onCancelar={() => setEntrega(null)}
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
    lista: {
      paddingHorizontal: s(16),
      paddingTop: s(24),
      paddingBottom: s(24),
    },
    aviso: {
      marginTop: s(32),
      textAlign: 'center',
      fontFamily: fonts.italic,
      fontSize: s(15),
      color: colors.onBackground,
    },
    erroAcao: {
      marginBottom: s(14),
      textAlign: 'center',
      fontFamily: fonts.italic,
      fontSize: s(14),
    },
    avisoErro: {
      color: colors.primary,
    },
  });
