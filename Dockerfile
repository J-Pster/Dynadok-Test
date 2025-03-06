FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

RUN rm -rf dist && yarn build

RUN echo "Conteúdo da pasta dist:" && \
  ls -la dist/ && \
  if [ ! -f dist/main.js ]; then \
  echo "ERRO CRÍTICO: dist/main.js não foi encontrado!" && \
  echo "Conteúdo atual do diretório:" && \
  ls -la && \
  exit 1; \
  fi

EXPOSE 3000

CMD ["yarn", "start:prod"]