# Dynadok Technical Test

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Kafka](https://img.shields.io/badge/Apache_Kafka-231F20?style=for-the-badge&logo=apache-kafka&logoColor=white)

## 📘 Documentação da API

[![Postman Documentation](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)](https://www.postman.com/universal-crescent-694463/workspace/dynadock-test-joo-pster)

👆 **Clique no badge acima para acessar a documentação da API no Postman**

## 📋 Sobre o Projeto

Este é um projeto de teste técnico para a Dynadok, que consiste em uma API REST desenvolvida utilizando o framework NestJS. A aplicação é executada em um ambiente Docker containerizado, com uma configuração completa via Docker Compose e utiliza MongoDB como banco de dados, Redis para cacheamento e Kafka para mensageria assíncrona.

## 🔧 Tecnologias Utilizadas

- **NestJS**: Framework Node.js progressivo para construção de aplicações escaláveis
- **MongoDB**: Banco de dados NoSQL orientado a documentos
- **Redis**: Banco de dados em memória utilizado para cacheamento
- **Apache Kafka**: Plataforma distribuída de streaming para processamento de eventos em tempo real
- **Docker**: Plataforma de containerização para facilitar o desenvolvimento e implantação
- **Docker Compose**: Ferramenta para definir e executar aplicativos Docker multi-container
- **Kafka UI**: Interface web para visualização e gerenciamento do Apache Kafka

## 📁 Estrutura do Projeto e Arquitetura

O projeto segue os princípios da Clean Architecture, com separação clara de responsabilidades em camadas.

### Fluxo de Execução

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant UseCase
    participant Repository
    participant Entity
    participant Database
    participant Kafka
    participant Consumer

    Client->>Controller: HTTP Request
    Controller->>UseCase: Execute with DTO
    UseCase->>Repository: Request Data
    Repository->>Database: Query
    Database-->>Repository: Response
    Repository-->>UseCase: Domain Entity
    UseCase->>Entity: Apply Business Rules
    Entity-->>UseCase: Updated Entity
    UseCase->>Kafka: Publish Event
    UseCase-->>Controller: Response Data
    Controller-->>Client: HTTP Response
    Kafka-->>Consumer: Process Event Asynchronously
    Consumer->>Consumer: Send Welcome Email
```

### Estrutura de Pastas

```mermaid
graph TD
    Root["dynadok-test/"] --> SRC["src/"]
    Root --> Config["package.json, docker-compose.yml, etc"]

    SRC --> Core["core/"]
    SRC --> Infra["infrastructure/"]
    SRC --> Modules["modules/"]
    SRC --> AppModule["app.module.ts"]
    SRC --> Main["main.ts"]

    Core --> Domain["domain/"]
    Core --> Application["application/"]

    Domain --> Entities["entities/"]
    Domain --> Repos["repositories/"]

    Entities --> BaseEntity["base-entity.ts"]
    Entities --> ClienteEntity["cliente.entity.ts"]

    Repos --> BaseRepoInterface["base-repository.interface.ts"]
    Repos --> ClienteRepoInterface["cliente-repository.interface.ts"]

    Application --> DTOs["dtos/"]
    Application --> UseCases["use-cases/"]

    DTOs --> ClienteDTO["cliente.dto.ts"]

    UseCases --> ClienteUseCases["cliente/"]

    ClienteUseCases --> CreateCliente["create-cliente.use-case.ts"]
    ClienteUseCases --> UpdateCliente["update-cliente.use-case.ts"]
    ClienteUseCases --> GetClienteById["get-cliente-by-id.use-case.ts"]
    ClienteUseCases --> GetAllClientes["get-all-clientes.use-case.ts"]

    Infra --> Database["database/"]
    Infra --> HTTP["http/"]

    Database --> Mongoose["mongoose/"]

    Mongoose --> Schemas["schemas/"]
    Mongoose --> MongoRepos["repositories/"]

    Schemas --> ClienteSchema["cliente.schema.ts"]

    MongoRepos --> BaseMongoRepo["base-mongoose.repository.ts"]
    MongoRepos --> ClienteMongoRepo["cliente-mongoose.repository.ts"]

    HTTP --> Controllers["controllers/"]

    Controllers --> ClienteController["cliente.controller.ts"]

    Modules --> ClienteModule["cliente.module.ts"]

    %% Estilos para melhor visualização
    classDef domain fill:#f9f,stroke:#333,stroke-width:1px
    classDef application fill:#bbf,stroke:#333,stroke-width:1px
    classDef infrastructure fill:#bfb,stroke:#333,stroke-width:1px
    classDef config fill:#fbb,stroke:#333,stroke-width:1px

    class Entities,Repos,Domain domain
    class Application,DTOs,UseCases application
    class Infra,Database,HTTP,Controllers,Mongoose,Schemas,MongoRepos infrastructure
    class Config,AppModule,Main config
```

### Diagrama da Arquitetura Clean

```mermaid
flowchart TB
    subgraph "Clean Architecture"
        direction TB

        subgraph "External Layer"
            Controller["Controllers (Infrastructure/HTTP)"]
            DB["MongoDB (Database)"]
            Repositories["Repository Implementations (Infrastructure)"]
        end

        subgraph "Interface Adapters"
            RepositoryInterfaces["Repository Interfaces (Domain)"]
        end

        subgraph "Application Layer"
            UseCases["Use Cases (Application)"]
            DTOs["DTOs (Application)"]
        end

        subgraph "Domain Layer"
            Entities["Entities (Core Business Rules)"]
        end

        %% Conexões
        Controller <--> UseCases
        UseCases <--> RepositoryInterfaces
        UseCases <--> Entities
        UseCases <--> DTOs
        Repositories <--> DB
        Repositories --> RepositoryInterfaces
        RepositoryInterfaces <--> Entities

        %% Estilo
        classDef domain fill:#f9f,stroke:#333,stroke-width:2px
        classDef application fill:#bbf,stroke:#333,stroke-width:2px
        classDef infrastructure fill:#bfb,stroke:#333,stroke-width:2px

        class Entities,RepositoryInterfaces domain
        class UseCases,DTOs application
        class Controller,DB,Repositories infrastructure
    end
```

## 📋 Endpoints da API

### Clientes

| Método | Endpoint        | Descrição                       |
| ------ | --------------- | ------------------------------- |
| `GET`  | `/clientes`     | Lista todos os clientes         |
| `GET`  | `/clientes/:id` | Busca um cliente pelo ID        |
| `POST` | `/clientes`     | Cadastra um novo cliente        |
| `PUT`  | `/clientes/:id` | Atualiza os dados de um cliente |

### Exemplo de Payload para Criação de Cliente

```json
{
  "nome": "João Silva",
  "email": "joao.silva@exemplo.com",
  "telefone": "11999998888",
  "cpf": "12345678900",
  "endereco": "Rua Exemplo, 123 - São Paulo/SP"
}
```

## ⚙️ Sistema de Mensageria com Kafka

O projeto implementa um sistema de mensageria usando Apache Kafka para processamento assíncrono de eventos.
Atualmente, temos implementado:

### Produção de Mensagens

- Quando um cliente é cadastrado, um evento é publicado no tópico `cliente-criado` com os dados básicos do cliente.

### Consumo de Mensagens

- Um consumidor inscrito no tópico `cliente-criado` processa as mensagens e simula o envio de um email de boas-vindas.

### Exemplo de Email Simulado

Quando um cliente é cadastrado, o sistema gera logs que mostram o fluxo completo:

```
[Nest] DEBUG [KafkaService] Mensagem enviada para o tópico cliente-criado
[Nest] LOG [CreateClienteUseCase] Evento de cliente criado enviado para: joaopsterdev@gmail.com
[Nest] DEBUG [ClienteConsumerService] Processando mensagem do tópico cliente-criado, partição 0
[Nest] LOG [ClienteConsumerService] -------------- EMAIL SIMULADO --------------
[Nest] LOG [ClienteConsumerService] Para: joaopsterdev@gmail.com
[Nest] LOG [ClienteConsumerService] Assunto: Bem-vindo(a) à Dynadok, João Pster 2!
[Nest] LOG [ClienteConsumerService] Conteúdo:
[Nest] LOG [ClienteConsumerService] Olá,
[Nest] LOG [ClienteConsumerService] É com grande satisfação que damos as boas-vindas a você, João Pster 2!
[Nest] LOG [ClienteConsumerService] Obrigado por se cadastrar em nossa plataforma.
[Nest] LOG [ClienteConsumerService] Estamos muito felizes em tê-lo(a) conosco.
[Nest] LOG [ClienteConsumerService]
[Nest] LOG [ClienteConsumerService] Atenciosamente,
[Nest] LOG [ClienteConsumerService] Equipe Dynadok
[Nest] LOG [ClienteConsumerService] -------------------------------------------
```

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

### Ferramentas de Gerenciamento

- **MongoDB**: Acesse via MongoDB Compass (Ou outra ferramenta de conexão com bancos de dados do seu desejo) em `mongodb://root:example@localhost:27017/`
- **Kafka UI**: Interface web para gerenciamento do Kafka disponível em `http://localhost:8080`

Através do Kafka UI, você pode:

- Visualizar tópicos e partições
- Monitorar grupos de consumidores
- Explorar mensagens
- Criar novos tópicos
- Verificar o status dos brokers

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
