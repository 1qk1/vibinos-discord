FROM node:16

ENV HOME=/home/app

RUN apt-get update && apt-get install ffmpeg -y

COPY package.json package-lock.json $HOME/vibinos/

WORKDIR $HOME/vibinos

RUN npm install --silent --progress=false

COPY . $HOME/vibinos

CMD ["npm", "start"]
