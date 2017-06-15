#!/bin/bash
echo "Waiting for database to be ready..."
until /usr/src/app/bin/db-connection-test; do
    sleep 2
    printf 'Trying again...'
done
echo "Runnning database migrations"
./node_modules/.bin/sequelize db:migrate --env production
if [ $? != 0 ]; then
  echo 'Migration failed!'
  exit 1
fi
echo "Database migration complete, starting API..."
npm start