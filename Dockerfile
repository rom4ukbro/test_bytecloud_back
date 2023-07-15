FROM node:18.15.0

WORKDIR /testbytecloud

COPY "package.json" . 

RUN npm i 

COPY . . 

RUN npm run build

CMD ["npm", "run", "start:prod"]