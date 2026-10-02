import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraNavegacaoInferior } from '../components/BarraNavegacaoInferior';
import type { Aba } from '../components/BarraNavegacaoInferior';
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
  const styles = useMemo(() => createStyles(s), [s]);
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<Aba>('Clientes');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <CabecalhoTela titulo="Clientes" />

      <View style={styles.conteudo}>
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

      <BarraNavegacaoInferior abaAtiva={abaAtiva} onTrocarAba={setAbaAtiva} />
    </SafeAreaView>
  );
}

const createStyles = (s: Scale) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    conteudo: {
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
