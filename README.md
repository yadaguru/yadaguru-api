[![Stories in Ready](https://badge.waffle.io/yadaguru/yadaguru-api.png?label=ready&title=Ready)](https://waffle.io/yadaguru/yadaguru-api)
#YadaGuru
##College Application Reminders

Visit our [CodeForPhily project info page](https://codeforphilly.org/projects/college_application_app_for_philly_schools).

This is the backend API for Yadaguru

##Local Development Setup Instructions (Beginner Friendly)
###Clone this repo

In the terminal, enter:

```
git clone https://github.com/yadaguru/yadaguru-api.git
```

This will download the YadaGuru API code to your machine. [Click here for a git tutorial](https://try.github.io/levels/1/challenges/1)

###Install Development Tools
On OSX ensure you have the package manager Homebrew installed. You will need Homebrew to install the tools below.
[Instructions for installing Homebrew on OSX](http://brew.sh/)

Install Nodejs & NPM. NodeJS is the engine that will run the Javascript code. NPM is a package manager that will allow us to install
other dependencies.

OSX:

```
brew install node
```

Ubuntu/Debian:

```
sudo apt-get install nodejs
sudo apt-get install npm
```

[Download and install Vagrant](https://www.vagrantup.com/downloads.html), which create a virtual machine for the database.

Install Mocha, the test runner

```
npm install -g mocha
```

Install Sequelize-CLI, which will allow you to interact with the database

```
npm install -g sequelize-cli
```

###Setup the environment

If you are not already in the project folder, `cd` into it now.

Run `npm install` this will install all of the dependencies needed to run the app

Run `vagrant up`, this will bring up the PostgreSQL database server (this will take a while the first time)

Run `sequelize db:migrate` to setup the database tables.

Run `sequelize db:seed:all` to add initial data to the database.

##Starting the server

Run `npm start` to start the server. You can confirm that it is working with this command:

```
curl http://localhost:3005/
```

If all is well, you should get a response of `foobar`.

##Testing the code

Various tools are used for testing. Mocha is the test runner, and Chai (using the BDD-should style) is the testing framework.
Sinon is used to stubs and spies. Chai-as-promised is used to test asynchronous code.

*It is important to set the correct NODE_ENV value before running tests. This will ensure that the testing database is used*

Run all tests with `npm test`.

Run individual tests by changing into the test directory and running `NODE_ENV=test mocha name_of_test_file.js`.

##Project structure
Below is a list of the main project files and folders and their role in the app

```
/config - Configuration files
/controllers - A controller file for each resource, responsible for communicating with the router and the database
/lib - Various module libraries to be imported into other modules.
/migrations - Migration files that build/seed the database when you run 'sequelize db:migrate'
/models - Files defining the data model for each resource. These map to specific tables in the database
/routes - Define routes for each resource
/test
  /e2e - End-to-end tests
  /unit - Unit tests
app.js - Instantiates the database, all routes, and the http server
bootstrap.sh - Script used for provisioning the database
index.js - The main entry point for the app. Instantiates app.js and starts the http server
package.json - A list of all dependencies
README.md - this file
Vagrantfile - Instructions for creating the Vagrant box
```

Thank  you for your help! Happy Coding!!
