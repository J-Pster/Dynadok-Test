FROM node:20-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache netcat-openbsd

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

RUN chmod +x ./scripts/wait-for-it.sh

EXPOSE 3000

ENTRYPOINT ["./scripts/wait-for-it.sh"]
CMD ["yarn", "start:prod"]