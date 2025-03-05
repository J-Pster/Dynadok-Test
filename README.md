# Dynadok Technical Test

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## 📋 Sobre o Projeto

Este é um projeto de teste técnico para a Dynadok, que consiste em uma API REST desenvolvida utilizando o framework NestJS. A aplicação é executada em um ambiente Docker containerizado, com uma configuração completa via Docker Compose e utiliza MongoDB como banco de dados.

## 🔧 Tecnologias Utilizadas

- **NestJS**: Framework Node.js progressivo para construção de aplicações escaláveis
- **MongoDB**: Banco de dados NoSQL orientado a documentos
- **Docker**: Plataforma de containerização para facilitar o desenvolvimento e implantação
- **Docker Compose**: Ferramenta para definir e executar aplicativos Docker multi-container

## ⚙️ Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina:

- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org/en/) (recomendado versão LTS)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Yarn](https://yarnpkg.com/) (opcional, mas recomendado)

## 🚀 Como executar o projeto

### Clonando o repositório

```bash
git clone <repository-url>
cd dynadok-test
```

### Instalando as dependências

```bash
yarn install
# ou
npm install
```

### Executando com Docker Compose

O projeto está configurado para ser facilmente executado através do Docker Compose, que gerenciará tanto o container da aplicação NestJS quanto o MongoDB.

#### Iniciar os containers

```bash
yarn docker:up
# ou
npm run docker:up
```

#### Iniciar os containers reconstruindo as imagens

```bash
yarn docker:up:rebuild
# ou
npm run docker:up:rebuild
```

#### Parar os containers

```bash
yarn docker:down
# ou
npm run docker:down
```

#### Parar os containers e remover volumes

```bash
yarn docker:down:volumes
# ou
npm run docker:down:volumes
```

### Acessando a API

Após iniciar os containers, a API estará disponível em:

```
http://localhost:3000
```

## 📁 Estrutura do Projeto

## 🧪 Testes

```bash
# testes unitários
yarn test

# testes e2e
yarn test:e2e

# cobertura de testes
yarn test:cov
```

## 📄 Licença

Este projeto está sob a licença UNLICENSED.

---

Desenvolvido para o teste técnico da Dynadok.
