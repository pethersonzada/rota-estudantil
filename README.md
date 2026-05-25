# Documentação Técnica da Solução Rota Estudantil

### Visão Geral
Sistema de gestão de rotas para transporte escolar. Responsável pela persistência de dados de usuários, controle de presença diária e lógica de validação para otimização de rotas.

### Endpoints Principais
 * **POST** /rota/confirmar: Registra ou atualiza a presença de um estudante. Suporta o status LIMPAR para remover registros.
 * **GET** /usuarios/passageiros: Lista todos os usuários com tipo PASSAGEIRO e seus respectivos status de presença para o dia atual.
 * **POST** /usuarios/cadastrar: Registro de novos usuários.
 * **POST** /usuarios/login: Autenticação básica via CPF e senha.
 
### Regras de Negócio
 * **Bloqueio de Rota**: O motorista só pode iniciar a rota se o total de passageiros for igual ao total de respostas (status não nulo).
 * **Transacionalidade**: Operações de presença são protegidas por @Transactional para garantir a integridade dos dados.

### Pré-requisitos
 * Node.js 18+, Expo 55 CLI.
 
### Instalação
* Configure o config.js com o IP do servidor (pegue o IP do servidor executando o comando "npx localtunnel --port 8080") e execute npx expo start.

## Visualizar o Backend da Aplicação

https://github.com/pethersonzada/van-app-backend/
