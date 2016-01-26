// Generated by CoffeeScript 1.10.0

/*
  Generate Release
  Kevin Gravier
  MIT License
 */

(function() {
  var Inquirer, Promise;

  Inquirer = require('inquirer');

  Promise = require('bluebird');

  module.exports = function() {
    var args;
    args = {
      type: 'list',
      name: 'release',
      message: 'Release Type?',
      "default": 'patch',
      choices: ['patch', 'minor', 'major']
    };
    return new Promise(function(resolve) {
      return Inquirer.prompt([args], function(answers) {
        return resolve(answers.release);
      });
    });
  };

}).call(this);
