# Dockerfile to run it in Linux
FROM node:20-bullseye

COPY package.json .
RUN npm install

COPY index.mjs .

CMD ["node", "index.mjs"]
