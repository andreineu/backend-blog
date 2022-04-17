FROM node:16-alpine

WORKDIR /opt/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)

COPY package*.json ./

RUN npm install 
# Bundle app source
COPY . .
COPY .env.production .env

RUN npm run build

ENV NODE_ENV production

ENV Port=8080

EXPOSE 8080

CMD [ "node", "dist/index.js" ]

USER node

