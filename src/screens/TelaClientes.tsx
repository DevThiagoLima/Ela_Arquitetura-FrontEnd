import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getClientesErrorMessage, listarClientes } from '../api/servicoClientes';
import { BarraNavegacaoInferior } from '../components/BarraNavegacaoInferior';
import type { Aba } from '../components/BarraNavegacaoInferior';
import { BotaoFlutuante } from '../components/BotaoFlutuante';
import { CabecalhoTela } from '../components/CabecalhoTela';
import { CampoTextoComIcone } from '../components/CampoTextoComIcone';
import { CardCliente } from '../components/CardCliente';
import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import { Scale, useResponsive } from '../utils/responsividade';
import type { LoginResponse } from '../types/autenticacao';
import type { Cliente } from '../types/cliente';

type Props = {
  usuario?: LoginResponse;
};

export default function TelaClientes({ usuario }: Props) {
  const { s } = useResponsive();
  const styles = useMemo(() => createStyles(s), [s]);
  const [busca, setBusca] = useState('');
  const [abaAtiva, setAbaAtiva] = useState<Aba>('Clientes');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarClientes = async (termo: string) => {
    setErro(null);
    setCarregando(true);
    try {
      const data = await listarClientes(termo);
      setClientes(data);
    } catch (e) {
      setErro(getClientesErrorMessage(e));
    } finally {
      setCarregando(false);
    }
  };

  // Carrega ao abrir a tela e refaz a busca enquanto o usuário digita,
  // esperando ele parar por um instante para não chamar a API a cada letra.
  useEffect(() => {
    const termo = busca.trim();
    const timer = setTimeout(() => carregarClientes(termo), termo ? 400 : 0);
    return () => clearTimeout(timer);
  }, [busca]);

  // Tocar na aba Clientes (mesmo já estando nela) recarrega a lista.
  const handleTrocarAba = (aba: Aba) => {
    setAbaAtiva(aba);
    if (aba === 'Clientes') {
      carregarClientes(busca.trim());
    }
  };

  const renderListaVazia = () => {
    if (carregando) {
      return <ActivityIndicator size="large" color={colors.card} style={styles.aviso} />;
    }
    return (
      <Text style={[styles.aviso, erro ? styles.avisoErro : null]} maxFontSizeMultiplier={1.2}>
        {erro ?? (busca.trim() ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.')}
      </Text>
    );
  };

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
          data={carregando ? [] : clientes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CardCliente nome={item.nome} telefone={item.telefone} email={item.email} />
          )}
          ListEmptyComponent={renderListaVazia}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />

        <BotaoFlutuante onPress={() => {}} />
      </View>

      <BarraNavegacaoInferior abaAtiva={abaAtiva} onTrocarAba={handleTrocarAba} />
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
