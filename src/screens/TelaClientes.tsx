import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getClientesErrorMessage, listarClientes } from '../api/servicoClientes';
import { BotaoFlutuante } from '../components/BotaoFlutuante';
import { CabecalhoTela } from '../components/CabecalhoTela';
import { CampoTextoComIcone } from '../components/CampoTextoComIcone';
import { CardCliente } from '../components/CardCliente';
import type { AbasParamList } from '../navigation/tipos';
import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import { Scale, useResponsive } from '../utils/responsividade';
import type { Cliente } from '../types/cliente';

type Navegacao = BottomTabNavigationProp<AbasParamList, 'Clientes'>;

export default function TelaClientes() {
  const { s } = useResponsive();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Navegacao>();
  const styles = useMemo(() => createStyles(s, insets.top), [s, insets.top]);
  const [busca, setBusca] = useState('');
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

  // Tocar na aba Clientes (mesmo já estando nela) volta para a lista completa.
  // Se havia busca, limpar o campo já dispara o recarregamento pelo useEffect acima.
  useEffect(() => {
    return navigation.addListener('tabPress', () => {
      if (busca) {
        setBusca('');
      } else {
        carregarClientes('');
      }
    });
  }, [navigation, busca]);

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
