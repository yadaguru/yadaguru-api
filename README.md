#YadaGuru
##College Application Reminders

Visit our [CodeForPhily project info page](https://codeforphilly.org/projects/college_application_app_for_philly_schools).

This is the backend API for Yadaguru

##Local Development Setup Instructions (Beginner Friendly)
Please see [Yadaguru Dev Environment Setup](https://github.com/yadaguru/yadaguru-app/wiki/Yadaguru-Dev-Environment-Setup) 
for step by step instructions on getting the entire Yadaguru stack up-and-running on your machine.

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
index.js - The main entry point for the app. Instantiates app.js and starts the http server
package.json - A list of all dependencies
README.md - this file
```

Thank  you for your help! Happy Coding!!
