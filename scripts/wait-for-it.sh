#!/bin/sh

set -e

echo "🚀 Iniciando script de verificação de dependências..."

# Função para verificar conexão com MongoDB
wait_for_mongodb() {
  echo "⏳ Aguardando MongoDB ficar disponível..."
  until nc -z mongodb 27017; do
    echo "MongoDB ainda não está disponível. Aguardando..."
    sleep 2
  done
  echo "✅ MongoDB está disponível!"
}

# Função para verificar conexão com Redis
wait_for_redis() {
  echo "⏳ Aguardando Redis ficar disponível..."
  until nc -z redis 6379; do
    echo "Redis ainda não está disponível. Aguardando..."
    sleep 2
  done
  echo "✅ Redis está disponível!"
}

# Função para verificar conexão com Kafka
wait_for_kafka() {
  echo "⏳ Aguardando Kafka ficar disponível..."
  until nc -z kafka 9092; do
    echo "Kafka ainda não está disponível. Aguardando..."
    sleep 2
  done
  echo "✅ Kafka está disponível!"
}

# Verifica os serviços
wait_for_mongodb
wait_for_redis
wait_for_kafka

echo "🎉 Todos os serviços estão disponíveis! Iniciando a aplicação..."

# Executa o comando passado como argumento
exec "$@"
