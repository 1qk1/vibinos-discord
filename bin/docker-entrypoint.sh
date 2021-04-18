#! /bin/sh

set -ex

if [ "$LOCAL" == "1" ] && [ -f "/usr/local/bin/dockerize" ]; then
  dockerize -wait tcp://db:${POSTGRES_PORT} -timeout 20s
fi

cd $HOME/vibinos/src/

npx sequelize-cli db:migrate

exec "$@"
