import { Linking } from 'react-native';

import { registrarEntrega } from '../api/servicoProjetos';
import { somenteDigitos } from './formatacao';

/** Texto da entrega do projeto. Vai só preenchido no WhatsApp: quem envia é a usuária. */
export function mensagemEntrega(nomeCliente: string, linkDrive: string): string {
  return [
    `Olá, ${nomeCliente}!`,
    '',
    'Nós, da Ela Arquitetura, estamos muito felizes em informar que o seu projeto foi concluído. Você pode acessar os arquivos pelo link abaixo:',
    '',
    linkDrive,
    '',
    'Ficamos à disposição para qualquer dúvida.',
    '',
    'A Ela Arquitetura agradece a preferência e deseja um ótimo dia!',
  ].join('\n');
}

/**
 * Conversa com o cliente já com a mensagem escrita. O telefone vem da API como "+5583999999999";
 * o wa.me quer só os dígitos, com o código do país.
 */
export function linkWhatsApp(telefone: string, mensagem: string): string {
  return `https://wa.me/${somenteDigitos(telefone)}?text=${encodeURIComponent(mensagem)}`;
}

/**
 * Abre o WhatsApp do cliente com a mensagem de entrega já escrita e guarda a entrega no histórico.
 * Chame direto no toque, sem esperar nada antes: na versão web o navegador bloqueia a janela nova
 * se ela não abrir no próprio clique. A promessa só falha se o WhatsApp não abrir.
 */
export function entregarPeloWhatsApp(
  cliente: { nome: string; telefone: string },
  projeto: { id: string; linkDrive: string },
): Promise<void> {
  const url = linkWhatsApp(cliente.telefone, mensagemEntrega(cliente.nome, projeto.linkDrive));
  const abrir = Linking.openURL(url);
  // Só histórico: se falhar, a entrega pelo WhatsApp já aconteceu e não deve travar a usuária.
  registrarEntrega(projeto.id, projeto.linkDrive).catch(() => undefined);
  return abrir;
}
