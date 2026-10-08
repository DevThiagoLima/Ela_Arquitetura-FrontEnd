# Éla Arquitetura — Gestão de Projetos (Front-end Mobile)

Aplicativo mobile para centralizar o acompanhamento de projetos de arquitetura do escritório **Éla Arquitetura**: cadastro de clientes e funcionários, etapas com checklist, responsáveis por projeto, status e entrega final ao cliente via WhatsApp.

> Projeto desenvolvido para a disciplina **Programação para Dispositivos Móveis** e **Projeto Extensionista IV – Empreendedorismo e Inovação** do curso de **Sistemas para Internet** — Centro Universitário UNIESP (2026.2).

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [O problema](#o-problema)
- [A solução](#a-solução)
- [Funcionalidades](#funcionalidades)
- [Telas e protótipo](#telas-e-protótipo)
- [Tecnologias](#tecnologias)
- [Como executar](#como-executar)
- [Cronograma](#cronograma)
- [Validação e medição de impacto](#validação-e-medição-de-impacto)

---

## Sobre o projeto

O escritório conduz cada projeto por seis etapas:

1. Cadastro do cliente
2. Estudos preliminares (briefing, levantamento em locação e estudo de layout)
3. Anteprojeto
4. Projeto executivo (executivo de obra, marcenaria, marmoraria, memoriais descritivos, imagens, maquete 3D e render)
5. Relatório de obra (esporádico)
6. Conclusão e entrega

Este repositório contém o **front-end mobile** da solução. A API própria (C#) e o banco de dados (PostgreSQL) fazem parte da mesma proposta.

## O problema

Hoje o acompanhamento é manual e fragmentado: o Trello e outros sistemas são usados separadamente, e o contato com o cliente e o envio dos arquivos finais acontecem fora deles (WhatsApp e drive). Isso gera:

- Informações espalhadas em várias ferramentas;
- Risco de pular etapas ou itens do checklist;
- Dificuldade para saber quem é responsável por cada projeto;
- Retrabalho para reunir dados e tempo excessivo em tarefas administrativas;
- Menor previsibilidade para o cliente sobre o andamento do projeto.

O diagnóstico foi validado por entrevista presencial no escritório com a proprietária e com todos os funcionários, que confirmaram que o gerenciamento é manual e fragmentado.

## A solução

Um sistema único, desenhado sobre o fluxo real do escritório, e **mobile-first**, já que o celular e o WhatsApp fazem parte da rotina da equipe.

**Diferenciais em relação ao Trello:**

- Etapas e subetapas (briefing, marcenaria, marmoraria, render etc.) já vêm prontas;
- Cadastro do cliente vinculado ao projeto;

## Funcionalidades

- [x] Login com e-mail e senha
- [x] Cadastro de clientes (nome, CPF, endereço, endereço da obra, telefone e e-mail)
- [x] Cadastro de funcionários
- [x] Listagem de clientes com busca, status do projeto e funcionária responsável
- [x] Checklist por etapa (Estudos Preliminares, Anteprojeto, Executivo, Acompanhamentos)
- [x] Atribuição de funcionário responsável
- [x] Status do projeto: **Em Andamento** / **Concluído**
- [x] Campo para link do drive com os arquivos finais
- [x] Listagem de projetos concluídos

> Ajuste os itens acima conforme o estado real da implementação.

## Telas e protótipo

- 🎨 **Design no Figma:** [Projeto Éla Arquitetura](https://www.figma.com/design/pnz4VKTnLPagbjwVVqaTRX/Projeto-Ela-Arquitetura?node-id=0-1&p=f&t=0HW48bqLieHQHh19-0)

Principais telas prototipadas:

| Tela | Descrição |
| --- | --- |
| Login | Acesso com e-mail e senha |
| Página inicial / Clientes | Lista de clientes com busca, status e responsável |
| Cadastro de clientes | Formulário de dados do cliente e da obra |
| Checklist | Dados do cliente, status e checklist das etapas, link do drive e botão "Concluir Projeto" |
| Projetos concluídos | Lista de projetos finalizados e confirmação de entrega |
| Funcionários | Listagem e cadastro de funcionários |


## Tecnologias

| Camada | Tecnologia |
| --- | --- |
| Mobile | React Native (Expo) + TypeScript |
| Prototipação | Figma |
| API | C# (repositório separado) |
| Banco de dados | PostgreSQL |

## Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (versão LTS)
- npm
- App **Expo Go** no celular, ou um emulador Android/iOS

### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/DevThiagoLima/Ela_Arquitetura-FrontEnd.git

# 2. Entre na pasta do projeto
cd Ela_Arquitetura-FrontEnd

# 3. Instale as dependências
npm install

# 4. Inicie o projeto
npx expo start
```

Em seguida, escaneie o QR Code com o Expo Go ou pressione `a` (Android) / `i` (iOS) para abrir no emulador.

> Para o funcionamento completo, é necessário que a API esteja em execução e configurada no app.

## Cronograma

| Etapa | Período |
| --- | --- |
| 1. Definição do problema e proposta | 26/08 a 03/09/2026 |
| 2. Desenvolvimento dos protótipos | 04/09 a 14/09/2026 |
| 3. Implementação inicial do sistema | 15/09 a 30/09/2026 |
| 4. Implementação das funcionalidades principais | 01/10 a 28/10/2026 |
| 5. Testes e ajustes | 29/10 a 19/11/2026 |
| 6. Entrega final e apresentação | 20/11 a 25/11/2026 |

## Validação e medição de impacto

**Validação com o público:** testes de uso com tarefas reais (cadastrar um cliente, avançar uma etapa, enviar um arquivo) com a proprietária, a gerente e, se possível, outros funcionários. O feedback é coletado por observação, conversa após o teste e formulário curto de satisfação.

**Indicadores:**

| Indicador | Como medir |
| --- | --- |
| Tempo para consultar o status de um projeto | Comparar o tempo no Trello/sistemas atuais com o do aplicativo |
| Tempo para cadastrar cliente e criar projeto | Cronometrar antes e depois |
| Atividades esquecidas ou etapas puladas | Contagem de ocorrências relatadas antes e depois |
| Satisfação das usuárias | Entrevista final |
| Facilidade de uso | Número de dúvidas ou erros durante os testes |

## Impacto social

Contribui para a profissionalização e a organização de um negócio local, liderado por uma mulher empreendedora, e mostra como tecnologia sob medida pode ser acessível a micro e pequenas empresas.

## Equipe

| Nome | GitHub |
| --- | --- |
| Thiago Lima | https://github.com/DevThiagoLima |
| Marcelo Jacinto | https://github.com/marcelojacint |

**Professor:** Álekiss Manço de Mélo  
**Instituição:** Centro Universitário UNIESP — Sistemas para Internet (5º período, noturno)
