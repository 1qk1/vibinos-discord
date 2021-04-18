#! /bin/sh

set -ex

cd $HOME/vibinos/src/

npx sequelize-cli db:migrate

exec "$@"
