FROM node:14

ENV HOME=/home/app

RUN apt-get update && apt-get install ffmpeg -y

COPY package.json package-lock.json $HOME/vibinos/

WORKDIR $HOME/vibinos

RUN npm install --silent --progress=false

COPY . $HOME/vibinos

# COPY bin/docker-entrypoint.sh /usr/local/bin

# RUN ["chmod", "+x", "/usr/local/bin/docker-entrypoint.sh"]


# ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["npm", "start"]
