FROM node:14

ENV HOME=/home/app

RUN apt-get update && apt-get install htop

COPY package.json package-lock.json $HOME/vibinos/

WORKDIR $HOME/vibinos

RUN npm install --silent --progress=false

COPY . $HOME/vibinos

CMD ["npm", "start"]
