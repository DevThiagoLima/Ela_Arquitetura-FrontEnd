import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getClientesErrorMessage, listarClientes } from '../api/servicoClientes';
import { BotaoFlutuante } from '../components/BotaoFlutuante';
import { CabecalhoTela } from '../components/CabecalhoTela';
import { CampoTextoComIcone } from '../components/CampoTextoComIcone';
import { CardCliente } from '../components/CardCliente';
import type { AbasParamList, RootStackParamList } from '../navigation/tipos';
import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import { Scale, useResponsive } from '../utils/responsividade';
import type { Cliente } from '../types/cliente';

// Aba dentro do stack: escuta o toque na aba e também abre telas do stack (CadastroCliente).
type Navegacao = CompositeNavigationProp<
  BottomTabNavigationProp<AbasParamList, 'Clientes'>,
  NativeStackNavigationProp<RootStackParamList>
>;

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

  // Carrega sempre que a tela fica visível (inclusive ao voltar do cadastro) e
  // refaz a busca enquanto o usuário digita, esperando ele parar por um instante
  // para não chamar a API a cada letra.
  useFocusEffect(
    useCallback(() => {
      const termo = busca.trim();
      const timer = setTimeout(() => carregarClientes(termo), termo ? 400 : 0);
      return () => clearTimeout(timer);
    }, [busca]),
  );

  // Tocar na aba Clientes volta para a lista completa. Se havia busca, limpar o
  // campo já recarrega; vindo de outra aba, o useFocusEffect acima já recarrega.
  useEffect(() => {
    return navigation.addListener('tabPress', () => {
      if (busca) {
        setBusca('');
      } else if (navigation.isFocused()) {
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
            <CardCliente
              nome={item.nome}
              telefone={item.telefone}
              email={item.email}
              quantidadeProjetos={item.quantidadeProjetos}
              onPress={() => navigation.navigate('Checklist', { clienteId: item.id })}
            />
          )}
          ListEmptyComponent={renderListaVazia}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
        />

        <BotaoFlutuante
          onPress={() => navigation.navigate('CadastroCliente')}
          icone="account-plus-outline"
          rotulo="Adicionar cliente"
        />
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
