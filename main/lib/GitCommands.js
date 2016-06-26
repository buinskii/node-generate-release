// Generated by CoffeeScript 1.10.0

/*
  Generate Release
  Kevin Gravier
  MIT License
 */

(function() {
  var Exec, GIT_CLEAN_REGEX, GitCommands, SpawnSync, env,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  SpawnSync = require('child_process').spawnSync;

  Exec = require('child_process').execSync;

  env = process.env;

  env.GIT_MERGE_AUTOEDIT = 'no';

  GIT_CLEAN_REGEX = /^nothing to commit, working directory clean$/m;

  GitCommands = (function() {
    GitCommands.checkForCleanWorkingDirectory = function() {
      var status_result;
      status_result = Exec('git status', {
        env: env
      });
      if (!GIT_CLEAN_REGEX.test(status_result.toString())) {
        throw new Error('Working directory is not clean, not ready for release');
      }
    };

    GitCommands.prototype.master_branch = 'master';

    GitCommands.prototype.develop_branch = 'develop';

    GitCommands.prototype.current_version = void 0;

    GitCommands.prototype.next_version = void 0;

    GitCommands.prototype.release_message = void 0;

    function GitCommands(opts) {
      this.finish = bind(this.finish, this);
      this.commit = bind(this.commit, this);
      this.start = bind(this.start, this);
      this.reset = bind(this.reset, this);
      this.push = bind(this.push, this);
      this.pull = bind(this.pull, this);
      if (opts.master_branch != null) {
        this.master_branch = opts.master_branch;
      }
      if (opts.develop_branch != null) {
        this.develop_branch = opts.develop_branch;
      }
      if (opts.current_version != null) {
        this.current_version = opts.current_version;
      }
      if (opts.next_version != null) {
        this.next_version = opts.next_version;
      }
      if (opts.release_message != null) {
        this.release_message = opts.release_message;
      }
      if (!this.current_version) {
        throw new Error('Current Version is not set');
      }
      if (!this.next_version) {
        throw new Error('New Version is not set');
      }
    }

    GitCommands.prototype.exec = function(args) {
      var result;
      result = SpawnSync('git', args, {
        env: env,
        stdio: 'pipe'
      });
      if (result.status !== 0) {
        throw new Error((args.join(' ')) + " returned " + result.status + ". \n\n Output: \n\n " + result.stderr);
      }
    };

    GitCommands.prototype.pull = function() {
      this.exec(['fetch']);
      this.exec(['checkout', this.develop_branch]);
      this.exec(['pull', 'origin', this.develop_branch, '--rebase']);
      this.exec(['checkout', this.master_branch]);
      return this.exec(['reset', '--hard', "origin/" + master_branch]);
    };

    GitCommands.prototype.push = function() {
      this.exec(['push', 'origin', this.develop_branch]);
      this.exec(['push', 'origin', this.master_branch]);
      return this.exec(['push', 'origin', '--tags']);
    };

    GitCommands.prototype.reset = function() {
      this.exec(['checkout', this.develop_branch]);
      this.exec(['reset', '--hard', 'HEAD']);
      return this.exec(['branch', '-D', "release/" + this.next_version]);
    };

    GitCommands.prototype.start = function() {
      this.exec(['checkout', this.develop_branch]);
      return this.exec(['flow', 'release', 'start', this.next_version]);
    };

    GitCommands.prototype.commit = function(files) {
      var file, i, len;
      for (i = 0, len = files.length; i < len; i++) {
        file = files[i];
        this.exec(['add', file]);
      }
      return this.exec(['commit', '-m', this.release_message]);
    };

    GitCommands.prototype.finish = function() {
      return this.exec(['flow', 'release', 'finish', '-m', this.release_message, this.next_version]);
    };

    return GitCommands;

  })();

  module.exports = GitCommands;

}).call(this);
