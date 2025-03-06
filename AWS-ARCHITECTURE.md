# Arquitetura AWS para Dynadok API

![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![MongoDB Atlas](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Serverless](https://img.shields.io/badge/Serverless-FD5750?style=for-the-badge&logo=serverless&logoColor=white)

## 📋 Visão Geral

Este documento apresenta uma proposta de arquitetura AWS para hospedar a API NestJS da Dynadok, substituindo a infraestrutura local baseada em Docker por serviços gerenciados na nuvem. A arquitetura foi projetada considerando escalabilidade, alta disponibilidade, segurança e otimização de custos.

## 🏗️ Arquitetura Base AWS

### Diagrama de Arquitetura

```mermaid
flowchart TD
    Internet((Internet)) --> ALB["Application Load Balancer"]

    subgraph "VPC"
        ALB --> ECS["ECS Fargate Cluster (API NestJS)"]

        subgraph "Serviços Gerenciados"
            DocumentDB[(Amazon DocumentDB)]
            ElastiCache[(Amazon ElastiCache\nfor Redis)]
            MSK[Amazon MSK\nKafka Service]
        end

        ECS --> DocumentDB
        ECS --> ElastiCache
        ECS --> MSK

        MSK --> Lambda["Lambda Consumer\n(Cliente Criado)"]
        Lambda --> SES["Amazon SES\n(Email Service)"]
    end

    CloudWatch["CloudWatch\nMonitoramento"] --> ECS
    CloudWatch --> Lambda
    CloudWatch --> MSK

    subgraph "Segurança e Gerenciamento"
        SecretsManager[(AWS Secrets Manager)]
        WAF["AWS WAF"]
    end

    WAF --> ALB
    ECS -.-> SecretsManager
    Lambda -.-> SecretsManager

    classDef primary fill:#FF9900,stroke:#232F3E,color:#232F3E,stroke-width:2px;
    classDef secondary fill:#527FFF,stroke:#232F3E,color:white;
    classDef database fill:#3B48CC,stroke:#232F3E,color:white;
    classDef security fill:#FF4F8B,stroke:#232F3E,color:white;
    classDef monitoring fill:#00A4A6,stroke:#232F3E,color:white;

    class ALB,ECS primary;
    class MSK,Lambda,SES secondary;
    class DocumentDB,ElastiCache database;
    class SecretsManager,WAF security;
    class CloudWatch monitoring;
```

### Componentes Principais

#### Computação e Orquestração

- **Amazon ECS com Fargate**: Serviço de orquestração de contêineres sem servidor para executar a API NestJS, eliminando a necessidade de gerenciar servidores.
- **Application Load Balancer (ALB)**: Distribui o tráfego para os contêineres da API, proporcionando alta disponibilidade e escalabilidade.

#### Armazenamento de Dados

- **Amazon DocumentDB**: Serviço de banco de dados compatível com MongoDB, totalmente gerenciado, substituindo o MongoDB autogerenciado.
- **Amazon ElastiCache for Redis**: Serviço Redis gerenciado para caching, substituindo o Redis autogerenciado.

#### Mensageria

- **Amazon MSK (Managed Streaming for Kafka)**: Implementação gerenciada do Apache Kafka, proporcionando processamento de eventos em tempo real.
- **AWS Lambda**: Funções serverless para processar eventos do Kafka, como o consumidor `cliente-criado`.

#### Comunicação

- **Amazon SES (Simple Email Service)**: Serviço de email para enviar mensagens de boas-vindas e outras notificações.

#### Monitoramento e Observabilidade

- **Amazon CloudWatch**: Monitoramento e observabilidade para toda a infraestrutura e aplicações.
- **AWS X-Ray**: Rastreamento e análise de requisições para identificação de problemas e otimização de performance.

#### Segurança

- **AWS WAF (Web Application Firewall)**: Proteção contra vulnerabilidades comuns da web.
- **AWS Secrets Manager**: Gerenciamento seguro de credenciais e configurações sensíveis.
- **Security Groups e Network ACLs**: Controle de acesso à rede em múltiplas camadas.

## 🔄 Transformação de Arquitetura

### Antes vs. Depois

```mermaid
graph TD
    subgraph "Infraestrutura Local (Docker)"
        Docker["Docker/Docker Compose"] --> NestApp["NestJS App Container"]
        Docker --> MongoDB["MongoDB Container"]
        Docker --> Redis["Redis Container"]
        Docker --> Kafka["Kafka Container"]
        Docker --> KafkaUI["Kafka UI Container"]
    end

    subgraph "Infraestrutura AWS Gerenciada"
        ECS["Amazon ECS\n(Fargate)"] --> NestAppAWS["NestJS App Container"]
        DocumentDB["Amazon DocumentDB"] --> NestAppAWS
        ElastiCache["Amazon ElastiCache"] --> NestAppAWS
        MSK["Amazon MSK"] --> NestAppAWS
        MSK --> LambdaConsumer["AWS Lambda Consumer"]
    end

    Docker -.->|Migração| ECS
    MongoDB -.->|Migração| DocumentDB
    Redis -.->|Migração| ElastiCache
    Kafka -.->|Migração| MSK

    classDef aws fill:#FF9900,stroke:#232F3E,color:#232F3E,stroke-width:2px;
    classDef local fill:#1D63ED,stroke:#232F3E,color:white;

    class ECS,DocumentDB,ElastiCache,MSK,LambdaConsumer aws;
    class Docker,NestApp,MongoDB,Redis,Kafka,KafkaUI local;
```

## 🔄 Alternativas AWS para Serviços Atuais

### Opção 1: Usando SNS/SQS ao invés de Kafka

```mermaid
flowchart LR
    API["ECS Fargate\n(NestJS API)"] --> SNS["Amazon SNS\n(cliente-criado topic)"]
    SNS --> SQS["Amazon SQS\n(email-queue)"]
    SQS --> Lambda["AWS Lambda\nConsumer"]
    Lambda --> SES["Amazon SES\n(Email Service)"]

    classDef primary fill:#FF9900,stroke:#232F3E,color:#232F3E,stroke-width:2px;
    class API,SNS,SQS,Lambda,SES primary;
```

#### Vantagens desta Abordagem

- **Custos Reduzidos**: SNS/SQS geralmente são mais econômicos que MSK para casos de uso simples
- **Gerenciamento Simplificado**: Totalmente serverless, sem necessidade de clusters ou brokers
- **Integração Nativa**: Integração direta com outros serviços AWS como Lambda e SES
- **Sem Manutenção**: Nenhuma configuração de cluster, partições ou replicação necessária

#### Implementação

Substitua o serviço Kafka por:

1. **Amazon SNS (Simple Notification Service)**:
   - Crie tópicos SNS para cada tópico Kafka (ex: `cliente-criado`)
   - Ajuste o produtor no código NestJS para publicar no SNS ao invés do Kafka
   - Exemplo de código (adaptação necessária):

```typescript
// Antes (Kafka producer)
await this.kafkaService.emit('cliente-criado', {
  id: cliente.id,
  nome: cliente.nome,
  email: cliente.email,
});

// Depois (SNS producer)
await this.snsService.publish({
  TopicArn: 'arn:aws:sns:us-east-1:123456789012:cliente-criado',
  Message: JSON.stringify({
    id: cliente.id,
    nome: cliente.nome,
    email: cliente.email,
  }),
});
```

2. **Amazon SQS (Simple Queue Service)**:

   - Crie filas SQS para processamento das mensagens
   - Configure assinaturas entre tópicos SNS e filas SQS
   - Implemente filtragem de mensagens se necessário

3. **AWS Lambda**:
   - Configure Lambda para ser acionado por eventos SQS
   - Implemente a lógica do consumidor atual no handler do Lambda

### Opção 2: Arquitetura Híbrida (Microserviços + Componentes Serverless)

```mermaid
flowchart TD
    Internet((Internet)) --> CloudFront["Amazon CloudFront"]

    CloudFront --> ALB["Application Load Balancer"]
    CloudFront --> APIGateway["API Gateway"]

    subgraph "Core Services (ECS Fargate)"
        ALB --> NestAPI["NestJS API\n(Core Business Logic)"]
    end

    subgraph "Serverless Components"
        APIGateway --> LambdaAPI1["Lambda Function\n(Leitura Simples)"]
        APIGateway --> LambdaAPI2["Lambda Function\n(Relatórios)"]
        APIGateway --> DynamoDBDirect["DynamoDB\n(Direct Integration)"]

        SNS["Amazon SNS"] --> SQS["Amazon SQS"]
        SQS --> LambdaConsumers["Lambda Consumers"]
    end

    NestAPI --> DocumentDB[(Amazon DocumentDB)]
    NestAPI --> ElastiCache[(Amazon ElastiCache)]
    NestAPI --> SNS

    LambdaAPI1 --> DynamoDB[(Amazon DynamoDB)]
    LambdaAPI2 --> DocumentDB
    LambdaConsumers --> SES["Amazon SES"]

    classDef primary fill:#FF9900,stroke:#232F3E,color:#232F3E,stroke-width:2px;
    classDef serverless fill:#C925D1,stroke:#232F3E,color:white,stroke-width:2px;
    classDef database fill:#3B48CC,stroke:#232F3E,color:white;

    class NestAPI primary;
    class APIGateway,LambdaAPI1,LambdaAPI2,SNS,SQS,LambdaConsumers serverless;
    class DocumentDB,ElastiCache,DynamoDB database;
```

#### Vantagens desta Abordagem Híbrida

- **Melhor Distribuição de Responsabilidades**: Os serviços principais continuam no NestJS em ECS, mantendo a estrutura e complexidade da API bem organizadas
- **Otimização de Custos**: Funções Lambda específicas para operações simples e relatórios que são executados com menos frequência
- **Combinando Paradigmas**: Aproveita o melhor dos dois mundos - a robustez de um serviço sempre ativo para as operações principais e a escalabilidade sob demanda de componentes serverless

#### Componentes Específicos

1. **API Core (NestJS em ECS Fargate)**

   - Mantém toda a lógica de negócio complexa
   - Gerencia transações e operações que exigem consistência forte
   - Gerencia autenticação e autorização centralizadas

2. **API Gateway + Funções Lambda**

   - Rotas de leitura simples (GET) que podem ser servidas por Lambda
   - Relatórios e operações assíncronas
   - Operações eventuais que não precisam estar sempre disponíveis

3. **Integrações Diretas com DynamoDB**

   - Para operações CRUD simples, o API Gateway pode se integrar diretamente com DynamoDB
   - Reduz latência e elimina camada de código intermediária para operações simples

4. **Sistema de Mensageria com SNS/SQS**
   - Substitui o Kafka por um sistema de publicação/assinatura totalmente gerenciado
   - Consumidores implementados como funções Lambda para processamento assíncrono
   - Ideal para processamentos em background como envio de emails ou notificações

#### Implementação de Exemplo: Acesso Híbrido a Dados

```mermaid
flowchart TD
    subgraph "Dados Frequentemente Acessados"
        API[API Gateway] --> Lambda["Lambda Function"]
        Lambda --> DynamoDB[("DynamoDB\n(Dados de acesso rápido)")]
    end

    subgraph "Dados Complexos/Relacionais"
        APICore["NestJS API (ECS)"] --> DocumentDB[("DocumentDB\n(Dados complexos)")]
    end

    Lambda -.->|Fallback para dados\nnão encontrados| APICore

    classDef serverless fill:#C925D1,stroke:#232F3E,color:white;
    classDef core fill:#FF9900,stroke:#232F3E,color:#232F3E;
    classDef db fill:#3B48CC,stroke:#232F3E,color:white;

    class API,Lambda serverless;
    class APICore core;
    class DynamoDB,DocumentDB db;
```

## 📊 Escalabilidade e Alta Disponibilidade

### Arquitetura Multi-AZ e Multi-Região

```mermaid
flowchart TD
    subgraph "Região Primária (us-east-1)"
        Route53_Primary["Route 53"] --> CloudFront["CloudFront CDN"]
        CloudFront --> ALB_Primary["ALB"]

        subgraph "us-east-1a"
            ALB_Primary --> ECS_1A["ECS\n(Fargate)"]
            ECS_1A --> DocumentDB_1A[(DocumentDB)]
            ECS_1A --> ElastiCache_1A[(ElastiCache)]
        end

        subgraph "us-east-1b"
            ALB_Primary --> ECS_1B["ECS\n(Fargate)"]
            ECS_1B --> DocumentDB_1B[(DocumentDB)]
            ECS_1B --> ElastiCache_1B[(ElastiCache)]
        end

        MSK_Primary["MSK\n(Multi-AZ)"] --> Lambda_Primary["Lambda"]
    end

    subgraph "Região Secundária (us-west-2)"
        Route53_Secondary["Route 53"] --> ALB_Secondary["ALB"]

        subgraph "us-west-2a"
            ALB_Secondary --> ECS_2A["ECS\n(Fargate)"]
            ECS_2A --> DocumentDB_2A[(DocumentDB)]
            ECS_2A --> ElastiCache_2A[(ElastiCache)]
        end

        subgraph "us-west-2b"
            ALB_Secondary --> ECS_2B["ECS\n(Fargate)"]
            ECS_2B --> DocumentDB_2B[(DocumentDB)]
            ECS_2B --> ElastiCache_2B[(ElastiCache)]
        end

        MSK_Secondary["MSK\n(Multi-AZ)"] --> Lambda_Secondary["Lambda"]
    end

    Route53["Global Route 53"] --> Route53_Primary
    Route53 --> Route53_Secondary

    DocumentDB_Primary[(DocumentDB\nCluster)] <--> DocumentDB_Secondary[(DocumentDB\nCluster)]

    classDef primary fill:#FF9900,stroke:#232F3E,color:#232F3E,stroke-width:2px;
    classDef region1 fill:#527FFF,stroke:#232F3E,color:white;
    classDef region2 fill:#7AA116,stroke:#232F3E,color:white;
    classDef global fill:#D13212,stroke:#232F3E,color:white;

    class ALB_Primary,ECS_1A,ECS_1B,MSK_Primary,Lambda_Primary,DocumentDB_1A,DocumentDB_1B,ElastiCache_1A,ElastiCache_1B region1;
    class ALB_Secondary,ECS_2A,ECS_2B,MSK_Secondary,Lambda_Secondary,DocumentDB_2A,DocumentDB_2B,ElastiCache_2A,ElastiCache_2B region2;
    class Route53,CloudFront global;
    class Route53_Primary,Route53_Secondary,DocumentDB_Primary,DocumentDB_Secondary primary;
```

## 💰 Estimativa de Custos e Otimização

### Serviços Principais e Estratégias de Custo

| Serviço     | Estratégia de Otimização                               | Economia Estimada |
| ----------- | ------------------------------------------------------ | ----------------- |
| ECS Fargate | Utilizar Fargate Spot para workloads não críticas      | 70%               |
| DocumentDB  | Instâncias reservadas para ambiente de produção        | 30-60%            |
| ElastiCache | Dimensionamento baseado em métricas, caching eficiente | 25-40%            |
| MSK         | Utilizar SNS/SQS para casos simples                    | 40-60%            |
| Lambda      | Otimizar memória alocada, minimizar dependências       | 30-50%            |

### Monitoramento de Custos

- **AWS Cost Explorer**: Análise detalhada de custos por serviço, tag e período
- **AWS Budgets**: Alertas de orçamento para prevenir gastos excessivos
- **Savings Plans**: Compromissos de uso para reduzir custos de computação

## 🔐 Segurança e Conformidade

### Camadas de Segurança

```mermaid
flowchart TD
    Internet((Internet)) --> Shield["AWS Shield\n(DDoS Protection)"]
    Shield --> WAF["AWS WAF"]
    WAF --> CloudFront["CloudFront"]
    CloudFront --> ALB["Application Load Balancer"]

    ALB --> ECS["ECS Fargate\n(NestJS)"]

    subgraph "Segurança de Aplicação"
        ECS --> Cognito["Amazon Cognito\n(Autenticação)"]
        ECS --> Secrets["AWS Secrets Manager\n(Credenciais)"]
        ECS --> KMS["AWS KMS\n(Criptografia)"]
    end

    subgraph "Segurança de Dados"
        DocumentDB[(DocumentDB)] --> KMS
        ElastiCache[(ElastiCache)] --> KMS
    end

    subgraph "Monitoramento de Segurança"
        CloudTrail["CloudTrail\n(Auditoria)"]
        GuardDuty["GuardDuty\n(Detecção de Ameaças)"]
        SecurityHub["Security Hub\n(Compliance)"]
    end

    classDef security fill:#FF4F8B,stroke:#232F3E,color:white;
    classDef service fill:#FF9900,stroke:#232F3E,color:#232F3E;
    classDef monitoring fill:#00A4A6,stroke:#232F3E,color:white;

    class Shield,WAF,Cognito,Secrets,KMS security;
    class CloudFront,ALB,ECS,DocumentDB,ElastiCache service;
    class CloudTrail,GuardDuty,SecurityHub monitoring;
```

## 🚀 Implementação e Migração

### Estratégia de Migração Recomendada

1. **Avaliação Inicial**

   - Analisar dependências e acoplamentos
   - Definir métricas de sucesso e SLAs
   - Identificar riscos e planos de mitigação

2. **Migração de Banco de Dados**

   - Configurar DocumentDB compatível com MongoDB
   - Implementar estratégia de migração de dados
   - Validar integridade e desempenho

3. **Migração da Aplicação**

   - Containerizar a aplicação NestJS para ECS
   - Configurar balanceadores de carga e healthchecks
   - Implementar circuit breakers e resiliência

4. **Migração do Sistema de Mensageria**

   - Implementar infraestrutura de mensageria AWS (MSK ou SNS/SQS)
   - Adaptar produtores e consumidores
   - Validar entrega e processamento de eventos

5. **Adoção Gradual de Serviços Serverless**
   - Identificar casos de uso ideais para componentes serverless
   - Implementar componentes lambda para funcionalidades específicas
   - Integrar API Gateway com serviços existentes

## 📊 Monitoramento e Observabilidade

### Dashboard de Monitoramento

```mermaid
graph TD
    subgraph "CloudWatch Dashboard"
        API["API Metrics"]
        DB["Database Metrics"]
        Cache["Cache Metrics"]
        Events["Event Processing"]
        Costs["Cost Metrics"]
    end

    subgraph "CloudWatch Logs"
        APILogs["API Logs"]
        LambdaLogs["Lambda Logs"]
        MSKLogs["MSK Logs"]
    end

    subgraph "X-Ray Tracing"
        RequestTracing["Request Paths"]
        Dependencies["Dependency Map"]
        Latency["Latency Analysis"]
    end

    subgraph "Alarmes e Notificações"
        Alarms["CloudWatch Alarms"]
        SNS["SNS Topics"]
        OpsCenter["Systems Manager\nOpsCenter"]
    end

    classDef metrics fill:#00A4A6,stroke:#232F3E,color:white;
    classDef logs fill:#C925D1,stroke:#232F3E,color:white;
    classDef trace fill:#FF9900,stroke:#232F3E,color:#232F3E;
    classDef alerts fill:#D13212,stroke:#232F3E,color:white;

    class API,DB,Cache,Events,Costs metrics;
    class APILogs,LambdaLogs,MSKLogs logs;
    class RequestTracing,Dependencies,Latency trace;
    class Alarms,SNS,OpsCenter alerts;
```

## 🏆 Considerações Finais

### Benefícios da Migração para AWS

1. **Escalabilidade**: Infraestrutura elástica que se adapta à demanda
2. **Disponibilidade**: Arquitetura multi-AZ e multi-região para alta disponibilidade
3. **Segurança**: Múltiplas camadas de proteção e conformidade integradas
4. **Manutenção Reduzida**: Serviços gerenciados que reduzem overhead operacional
5. **Custo Otimizado**: Pague apenas pelo que usar com opções de economia

### Próximos Passos Recomendados

1. **Prova de Conceito**: Implementar um componente isolado para validar a arquitetura
2. **Análise de TCO (Total Cost of Ownership)**: Comparar custos atuais vs. AWS
3. **Plano de Migração Detalhado**: Definir timelines e responsabilidades
4. **Treinamento da Equipe**: Capacitar a equipe nas novas tecnologias AWS
5. **Implementação Gradual**: Migrar serviços em fases com validação contínua
