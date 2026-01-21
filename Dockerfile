FROM node:22

ENV HOME=/home/app

RUN apt-get update && apt-get install ffmpeg -y

WORKDIR $HOME/vibinos

COPY package.json package-lock.json $HOME/vibinos/

RUN npm install --silent --progress=false

COPY . $HOME/vibinos

CMD ["npm", "start"]
