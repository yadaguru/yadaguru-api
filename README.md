#YadaGuru
##College Application Reminders

Visit our [CodeForPhily project info page](https://codeforphilly.org/projects/college_application_app_for_philly_schools).

This is the backend API for Yadaguru

##Local Development Installation
 * Be sure you have installed `node`, `npm`, and `vagrant`
 * Be sure you have gulp and mocha installed globally `npm install -g gulp mocha`
 * `cd` into the project root folder (if you are not already there)
 * Run `npm install` to install the front-end dependencies
 * Run `vagrant up` to bring up the postgres server. On first up, this will provision the server and database.
 * Run `gulp install-sql` to provision the database. This command should also be run whenever changes in the `/sql/` folder are made, or if you just need a clean slate in the DB.

##Serving Locally
Run `gulp serve` to serve the api at http://localhost:8080. While the task is running server will restart on every file change.

##Testing
Tests are run with mocha. It is recommended that on windows you use `set NODE_ENV=TEST&& mocha` or on linux/mac `export NODE_ENV=TEST&& mocha` to run the tests. You can also use a local version of mocha with `node node_modules/mocha/bin/mocha` if you would prefer to omit mocha from a global install. Setting the NODE_ENV prevents potential corruption of the local database.

Client tests are run with karma, mocha, chai-sinon, phantomjs, and coverage. To run the tests use `npm run test-client`. This test will watch for changes by default.

##Contributing

 * Please fork the repo, checkout the `development` and create a feature branch from there.
 * Please make all PR against the `development` branch. 
