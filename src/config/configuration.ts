export default () => ({
  // Configurações do servidor
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Configurações do MongoDB
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/dynadok',
  },

  // Configurações do Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
  },

  // Configurações de cache
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '300', 10), // 5 minutos por padrão
    max: parseInt(process.env.CACHE_MAX_ITEMS || '1000', 10),
  },

  // Configurações de log
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enabled: process.env.NODE_ENV === 'development',
  },
});
