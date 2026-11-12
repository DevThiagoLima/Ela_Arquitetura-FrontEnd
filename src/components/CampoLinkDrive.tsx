import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { getCadastroErrorMessage } from '../api/servicoClientes';
import { colors } from '../theme/cores';
import { fonts } from '../theme/tipografia';
import { Scale, useResponsive } from '../utils/responsividade';
import { CaixaConfirmacao } from './CaixaConfirmacao';

type Props = {
  link: string | null;
  /** Projeto concluído fica só para consulta (ainda dá para copiar e abrir o link). */
  editavel: boolean;
  /** Devem lançar erro se a API recusar; a mensagem aparece abaixo do campo. */
  onSalvar: (link: string) => Promise<void>;
  onRemover: () => Promise<void>;
};

/**
 * Item "Link do Drive" do card (Figma): sem link, é um campo para colar o link;
 * com link, mostra o link com os botões de copiar, editar e excluir.
 */
export function CampoLinkDrive({ link, editavel, onSalvar, onRemover }: Props) {
  const { s } = useResponsive();
  const styles = useMemo(() => createStyles(s), [s]);

  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const timerCopiado = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trocou de projeto: sai da edição e descarta o que estava digitado.
  useEffect(() => {
    setEditando(false);
    setTexto('');
    setErro(null);
    setCopiado(false);
  }, [link]);

  useEffect(() => () => {
    if (timerCopiado.current) clearTimeout(timerCopiado.current);
  }, []);

  const mostrandoCampo = editavel && (!link || editando);

  const salvar = async () => {
    const novo = texto.trim();
    if (!novo || salvando) return;
    if (novo === link) {
      setEditando(false);
      return;
    }

    setErro(null);
    setSalvando(true);
    try {
      await onSalvar(novo);
      setEditando(false);
      setTexto('');
    } catch (e) {
      setErro(getCadastroErrorMessage(e));
    } finally {
      setSalvando(false);
    }
  };

  const remover = async () => {
    setErro(null);
    setSalvando(true);
    try {
      await onRemover();
    } catch (e) {
      setErro(getCadastroErrorMessage(e));
    } finally {
      setSalvando(false);
      setConfirmandoExclusao(false);
    }
  };

  const copiar = async () => {
    if (!link) return;
    await Clipboard.setStringAsync(link);
    setCopiado(true);
    if (timerCopiado.current) clearTimeout(timerCopiado.current);
    timerCopiado.current = setTimeout(() => setCopiado(false), 2000);
  };

  const abrir = () => {
    if (!link) return;
    Linking.openURL(link).catch(() => setErro('Não foi possível abrir o link.'));
  };

  const iniciarEdicao = () => {
    setTexto(link ?? '');
    setErro(null);
    setEditando(true);
  };

  const renderBotao = (
    icone: ComponentProps<typeof MaterialCommunityIcons>['name'],
    rotulo: string,
    onPress: () => void,
    cor: string = colors.icon,
  ) => (
    <Pressable
      onPress={onPress}
      disabled={salvando}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      hitSlop={8}
      style={({ pressed }) => [styles.botao, pressed && styles.pressed]}
    >
      <MaterialCommunityIcons name={icone} size={s(20)} color={cor} />
    </Pressable>
  );

  const renderCampo = () => (
    <View style={styles.pilula}>
      <MaterialCommunityIcons name="link-variant" size={s(24)} color={colors.icon} />
      <TextInput
        style={styles.campo}
        placeholder="Insira o Link do Drive ..."
        placeholderTextColor={colors.inputPlaceholder}
        value={texto}
        onChangeText={setTexto}
        onSubmitEditing={salvar}
        returnKeyType="done"
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={editando}
        editable={!salvando}
        accessibilityLabel="Link do Drive"
        maxFontSizeMultiplier={1.2}
      />
      {salvando ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <>
          {texto.trim() ? renderBotao('check', 'Salvar link do Drive', salvar, colors.primary) : null}
          {editando ? renderBotao('close', 'Cancelar edição do link', () => setEditando(false)) : null}
        </>
      )}
    </View>
  );

  const renderLink = () => (
    <View style={styles.pilula}>
      <MaterialCommunityIcons name="link-variant" size={s(24)} color={colors.icon} />
      <Pressable
        onPress={abrir}
        accessibilityRole="link"
        accessibilityLabel={`Abrir link do Drive: ${link}`}
        style={({ pressed }) => [styles.areaLink, pressed && styles.pressed]}
      >
        <Text style={styles.textoLink} numberOfLines={1} maxFontSizeMultiplier={1.2}>
          {link}
        </Text>
      </Pressable>
      {salvando ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <>
          {renderBotao(
            copiado ? 'check' : 'content-copy',
            'Copiar link do Drive',
            copiar,
            copiado ? colors.primary : colors.icon,
          )}
          {editavel ? renderBotao('pencil-outline', 'Editar link do Drive', iniciarEdicao) : null}
          {editavel
            ? renderBotao('trash-can-outline', 'Excluir link do Drive', () => setConfirmandoExclusao(true), colors.danger)
            : null}
        </>
      )}
    </View>
  );

  return (
    <View>
      {mostrandoCampo ? (
        renderCampo()
      ) : link ? (
        renderLink()
      ) : (
        <Text style={styles.semLink} maxFontSizeMultiplier={1.2}>
          Nenhum link do Drive.
        </Text>
      )}

      {copiado ? (
        <Text style={styles.aviso} accessibilityLiveRegion="polite" maxFontSizeMultiplier={1.2}>
          Link copiado!
        </Text>
      ) : null}
      {erro ? (
        <Text style={[styles.aviso, styles.erro]} accessibilityLiveRegion="polite" maxFontSizeMultiplier={1.2}>
          {erro}
        </Text>
      ) : null}

      <CaixaConfirmacao
        visivel={confirmandoExclusao}
        titulo="Excluir o link do Drive deste projeto?"
        textoConfirmar="Excluir"
        corConfirmar={colors.danger}
        carregando={salvando}
        onConfirmar={remover}
        onCancelar={() => setConfirmandoExclusao(false)}
      />
    </View>
  );
}

const createStyles = (s: Scale) =>
  StyleSheet.create({
    pilula: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: s(52),
      marginTop: s(4),
      paddingHorizontal: s(14),
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: s(18),
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: s(3) },
      shadowOpacity: 0.25,
      shadowRadius: s(3),
      elevation: 3,
    },
    campo: {
      flex: 1,
      marginLeft: s(10),
      paddingVertical: s(10),
      fontFamily: fonts.italic,
      fontSize: s(15),
      color: colors.onBackground,
    },
    areaLink: {
      flex: 1,
      marginLeft: s(10),
      paddingVertical: s(14),
    },
    textoLink: {
      fontFamily: fonts.italic,
      fontSize: s(14),
      color: colors.onBackground,
      textDecorationLine: 'underline',
    },
    botao: {
      marginLeft: s(10),
      padding: s(2),
    },
    pressed: {
      opacity: 0.6,
    },
    semLink: {
      marginLeft: s(8),
      fontFamily: fonts.italic,
      fontSize: s(13),
      color: colors.onBackground,
      opacity: 0.6,
    },
    aviso: {
      marginTop: s(6),
      textAlign: 'center',
      fontFamily: fonts.italic,
      fontSize: s(13),
      color: colors.onBackground,
    },
    erro: {
      color: colors.primary,
    },
  });
