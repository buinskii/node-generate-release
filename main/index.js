// Generated by CoffeeScript 1.10.0

/*
  Generate Release
  Kevin Gravier
  MIT License
 */

(function() {
  var GitCommands, GitFlowSettings, Glob, IS_DEBUG, Minimist, Observatory, Options, PackageFile, Path, Promise, askConfirmUpdate, askReleaseType, incrementVersion, runArbitraryCommand, writeNewReadme;

  IS_DEBUG = process.env.IS_DEBUG != null;

  Promise = require('bluebird');

  Minimist = require('minimist');

  Glob = require('glob');

  Path = require('path');

  Observatory = require('observatory');

  Options = require('./lib/Options');

  GitCommands = require('./lib/GitCommands');

  PackageFile = require('./lib/PackageFile');

  GitFlowSettings = require('./lib/GitFlowSettings');

  askReleaseType = require('./lib/askReleaseType');

  incrementVersion = require('./lib/incrementVersion');

  askConfirmUpdate = require('./lib/askConfirmUpdate');

  writeNewReadme = require('./lib/writeNewReadme');

  runArbitraryCommand = require('./lib/runArbitraryCommand');

  module.exports = function(args) {
    var git_commands, git_flow_settings, observatory_tasks, options, package_file;
    options = void 0;
    package_file = void 0;
    git_flow_settings = void 0;
    git_commands = void 0;
    Observatory.settings({
      prefix: '[Generate Release] '
    });
    observatory_tasks = {
      git_pull: Observatory.add('GIT: Pull from Origin'),
      git_start: Observatory.add('GIT: Start Release'),
      write_files: Observatory.add('Files: Write New Version'),
      pre_commit_commands: Observatory.add('Commands: Pre Commit'),
      git_commit: Observatory.add('GIT: Commit Files'),
      post_commit_commands: Observatory.add('Commands: Post Commit'),
      git_finish: Observatory.add('GIT: Finish Release'),
      git_push: Observatory.add('GIT: Push to Origin')
    };
    return Promise["try"](function() {
      return args.slice(2);
    }).then(Minimist).then(function(mArgs) {
      return options = new Options(mArgs);
    }).then(function() {
      return options.parse();
    }).then(function() {
      return git_flow_settings = new GitFlowSettings(Path.resolve('./'));
    }).then(function() {
      return git_flow_settings.parseIni();
    }).then(function() {
      return GitCommands.checkForCleanWorkingDirectory();
    }).then(function() {
      if (!options.release_type) {
        return askReleaseType().then(function(release_type) {
          return options.release_type = release_type;
        });
      }
    }).then(function() {
      return package_file = new PackageFile(options.package_file_location);
    }).then(function() {
      return package_file.load();
    }).then(function() {
      if (!options.current_version) {
        return options.current_version = package_file.getVersion();
      }
    }).then(function() {
      return options.next_version = incrementVersion(options.current_version, options.release_type, git_flow_settings.version_tag_prefix);
    }).then(function() {
      return options.no_confirm || (askConfirmUpdate(options.current_version, options.next_version));
    }).then(function(do_update) {
      if (!do_update) {
        throw new Error('Update Canceled');
      }
    }).then(function() {
      return git_commands = new GitCommands({
        master_branch: git_flow_settings.master,
        develop_branch: git_flow_settings.develop,
        current_version: options.current_version,
        next_version: options.next_version
      });
    }).then(function() {
      if (!options.skip_git_pull) {
        observatory_tasks.git_pull.status('Pulling');
        git_commands.pull();
        return observatory_tasks.git_pull.done('Complete');
      } else {
        return observatory_tasks.git_pull.done('Skipped');
      }
    }).then(function() {
      observatory_tasks.git_start.status('Starting');
      git_commands.start();
      return observatory_tasks.git_start.done('Complete');
    }).then(function() {
      observatory_tasks.write_files.status('readme');
      return writeNewReadme(options.readme_file_location, options.current_version, options.next_version);
    }).then(function() {
      observatory_tasks.write_files.status('package');
      package_file.setVersion(options.next_version);
      package_file.save();
      return observatory_tasks.write_files.done('Complete');
    }).then(function() {
      return Promise["try"](function() {
        var command, i, j, len, len1, ref, ref1;
        observatory_tasks.pre_commit_commands.status('Running');
        ref = options.pre_commit_commands;
        for (i = 0, len = ref.length; i < len; i++) {
          command = ref[i];
          observatory_tasks.pre_commit_commands.status(command);
          ref1 = options.pre_commit_commands;
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            command = ref1[j];
            runArbitraryCommand(command);
          }
        }
        return observatory_tasks.pre_commit_commands.done('Complete');
      })["catch"](function(err) {
        git_commands.reset();
        throw err;
      });
    }).then(function() {
      var file, files, i, j, len, len1, ref, tmp_file, tmp_files;
      files = [options.readme_file_location, options.package_file_location];
      ref = options.additional_files_to_commit;
      for (i = 0, len = ref.length; i < len; i++) {
        file = ref[i];
        tmp_files = Glob.sync(file);
        for (j = 0, len1 = tmp_files.length; j < len1; j++) {
          tmp_file = tmp_files[j];
          files.push(Path.resolve(tmp_file));
        }
      }
      return files;
    }).then(function(files) {
      return Promise["try"](function() {
        observatory_tasks.git_commit.status('Committing');
        git_commands.commit(files);
        return observatory_tasks.git_commit.done('Complete');
      })["catch"](function(err) {
        git_commands.reset();
        throw err;
      });
    }).then(function() {
      var command, error, error1, i, len, ref;
      observatory_tasks.pre_commit_commands.status('Running');
      ref = options.post_commit_commands;
      for (i = 0, len = ref.length; i < len; i++) {
        command = ref[i];
        try {
          observatory_tasks.pre_commit_commands.status(command);
          runArbitraryCommand(command);
        } catch (error1) {
          error = error1;
          console.error(error.message);
        }
      }
      return observatory_tasks.pre_commit_commands.done('Complete');
    }).then(function() {
      return Promise["try"](function() {
        observatory_tasks.git_finish.status('Finishing');
        git_commands.finish();
        return observatory_tasks.git_finish.done('Complete');
      })["catch"](function(err) {
        git_commands.reset();
        throw err;
      });
    }).then(function() {
      if (!options.skip_git_push) {
        observatory_tasks.git_push.status('Pushing');
        git_commands.push();
        return observatory_tasks.git_push.done('Complete');
      } else {
        return observatory_tasks.git_push.done('Skipped');
      }
    })["catch"](function(err) {
      if (IS_DEBUG) {
        throw err;
      }
      console.log(err.message);
      return process.exit(1);
    });
  };

}).call(this);
