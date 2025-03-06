FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

# Verificar se o arquivo principal foi gerado corretamente
RUN ls -la dist/ && \
  if [ ! -f dist/main.js ]; then \
  echo "Erro: dist/main.js não foi encontrado!" && \
  exit 1; \
  fi

EXPOSE 3000

CMD ["node", "dist/main.js"]