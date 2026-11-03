import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BotaoFlutuante } from '../components/BotaoFlutuante';
import { CabecalhoTela } from '../components/CabecalhoTela';
import { CampoTextoComIcone } from '../components/CampoTextoComIcone';
import { CardCliente } from '../components/CardCliente';
import { colors } from '../theme/cores';
import { Scale, useResponsive } from '../utils/responsividade';

type ClienteListagem = {
  id: string;
  nome: string;
  statusProjeto: string;
  funcionariaResponsavel: string;
};

const CLIENTES_MOCK: ClienteListagem[] = [
  { id: '1', nome: 'Maria Fernandes', statusProjeto: 'Em andamento', funcionariaResponsavel: 'Ana Souza' },
  { id: '2', nome: 'João Pedro Lima', statusProjeto: 'Estudos Preliminares', funcionariaResponsavel: 'Carla Dias' },
  { id: '3', nome: 'Empresa ABC Ltda', statusProjeto: 'Projeto Executivo', funcionariaResponsavel: 'Ana Souza' },
  { id: '4', nome: 'Renata Alves', statusProjeto: 'Concluído', funcionariaResponsavel: 'Bruna Melo' },
];

export default function TelaClientes() {
  const { s } = useResponsive();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(s, insets.top), [s, insets.top]);
  const [busca, setBusca] = useState('');

  return (
    <View style={styles.tela}>
      <View style={styles.topo}>
        <CabecalhoTela titulo="Clientes" />
      </View>

      <View style={styles.corpo}>
        <View style={styles.buscaContainer}>
          <CampoTextoComIcone
            icon="search-outline"
            placeholder="Pesquisar por um cliente ..."
            value={busca}
            onChangeText={setBusca}
            returnKeyType="search"
          />
        </View>

        <FlatList
          data={CLIENTES_MOCK}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CardCliente
              nome={item.nome}
              statusProjeto={item.statusProjeto}
              funcionariaResponsavel={item.funcionariaResponsavel}
            />
          )}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />

        <BotaoFlutuante onPress={() => {}} />
      </View>
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
      paddingHorizontal: s(20),
      paddingTop: s(16),
    },
    buscaContainer: {
      marginBottom: s(16),
    },
    lista: {
      paddingBottom: s(80),
    },
  });